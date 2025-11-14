import { Component, ChangeDetectionStrategy, signal, inject, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { TranslationService } from '../../services/translation.service';
import { DataService } from '../../services/data.service';
import { AuthService } from '../../services/auth.service';
import { AuditLog, AuditAction, AuditEntityType } from '../../models';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-audit-trail',
  templateUrl: './audit-trail.component.html',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, TranslatePipe],
})
export class AuditTrailComponent implements OnInit {
  private dataService = inject(DataService);
  private authService = inject(AuthService);
  translationService = inject(TranslationService);

  // State
  loading = signal(false);
  exporting = signal(false);
  auditLogs = signal<AuditLog[]>([]);
  
  // Filters
  filterStartDate = signal('');
  filterEndDate = signal('');
  filterUserId = signal('');
  filterAction = signal<AuditAction | ''>('');
  filterEntityType = signal<AuditEntityType | ''>('');
  searchTerm = signal('');
  
  // Pagination
  currentPage = signal(1);
  pageSize = 10;

  // Computed
  isAdmin = computed(() => this.authService.currentUser()?.role === 'admin');
  
  filteredLogs = computed(() => {
    let logs = this.auditLogs();
    const search = this.searchTerm().toLowerCase();
    
    if (search) {
      logs = logs.filter(log => 
        log.userName.toLowerCase().includes(search) ||
        log.userEmail.toLowerCase().includes(search) ||
        log.action.toLowerCase().includes(search) ||
        log.entityType.toLowerCase().includes(search) ||
        (log.entityId && log.entityId.toLowerCase().includes(search))
      );
    }
    
    return logs;
  });

  paginatedLogs = computed(() => {
    const logs = this.filteredLogs();
    const start = (this.currentPage() - 1) * this.pageSize;
    const end = start + this.pageSize;
    return logs.slice(start, end);
  });

  totalPages = computed(() => 
    Math.ceil(this.filteredLogs().length / this.pageSize)
  );

  uniqueUsers = computed(() => {
    const users = new Set(this.auditLogs().map(log => log.userId));
    return Array.from(users);
  });

  actionTypes: AuditAction[] = ['create', 'update', 'delete', 'login', 'logout', 'export', 'import'];
  entityTypes: AuditEntityType[] = ['measurement', 'limit', 'specification', 'user', 'system'];

  async ngOnInit() {
    await this.loadAuditLogs();
  }

  async loadAuditLogs(): Promise<void> {
    if (!this.isAdmin()) return;

    this.loading.set(true);
    try {
      const filters: any = {};
      
      if (this.filterStartDate()) filters.startDate = this.filterStartDate();
      if (this.filterEndDate()) filters.endDate = this.filterEndDate();
      if (this.filterUserId()) filters.userId = this.filterUserId();
      if (this.filterAction()) filters.action = this.filterAction();
      if (this.filterEntityType()) filters.entityType = this.filterEntityType();

      const logs = await this.dataService.getAuditLogs(filters);
      this.auditLogs.set(logs);
      this.currentPage.set(1);
    } catch (error) {
      console.error('Failed to load audit logs:', error);
    } finally {
      this.loading.set(false);
    }
  }

  applyFilters(): void {
    this.loadAuditLogs();
  }

  clearFilters(): void {
    this.filterStartDate.set('');
    this.filterEndDate.set('');
    this.filterUserId.set('');
    this.filterAction.set('');
    this.filterEntityType.set('');
    this.searchTerm.set('');
    this.loadAuditLogs();
  }

  nextPage(): void {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.update(p => p + 1);
    }
  }

  previousPage(): void {
    if (this.currentPage() > 1) {
      this.currentPage.update(p => p - 1);
    }
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
  }

  getActionBadgeClass(action: AuditAction): string {
    const classes: Record<AuditAction, string> = {
      create: 'bg-green-100 text-green-800',
      update: 'bg-blue-100 text-blue-800',
      delete: 'bg-red-100 text-red-800',
      login: 'bg-purple-100 text-purple-800',
      logout: 'bg-gray-100 text-gray-800',
      export: 'bg-yellow-100 text-yellow-800',
      import: 'bg-indigo-100 text-indigo-800',
    };
    return classes[action] || 'bg-gray-100 text-gray-800';
  }

  getEntityBadgeClass(entityType: AuditEntityType): string {
    const classes: Record<AuditEntityType, string> = {
      measurement: 'bg-indigo-100 text-indigo-800',
      limit: 'bg-orange-100 text-orange-800',
      specification: 'bg-teal-100 text-teal-800',
      user: 'bg-pink-100 text-pink-800',
      system: 'bg-gray-100 text-gray-800',
    };
    return classes[entityType] || 'bg-gray-100 text-gray-800';
  }

  async exportToExcel(): Promise<void> {
    if (!this.isAdmin()) return;

    this.exporting.set(true);

    try {
      const logs = this.filteredLogs();
      
      // Prepare data for Excel
      const excelData = logs.map(log => ({
        Timestamp: new Date(log.timestamp).toLocaleString(),
        User: log.userName,
        Email: log.userEmail,
        Action: log.action,
        'Entity Type': log.entityType,
        'Entity ID': log.entityId || '',
        Changes: log.changes ? log.changes.map(c => 
          `${c.field}: ${c.oldValue} → ${c.newValue}`
        ).join('; ') : '',
        Metadata: log.metadata ? JSON.stringify(log.metadata) : '',
      }));

      // Create workbook
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(excelData);
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Audit Trail');

      // Generate filename with timestamp
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').substring(0, 19);
      const filename = `audit-trail-${timestamp}.xlsx`;

      // Download
      XLSX.writeFile(workbook, filename);

      setTimeout(() => {
        this.exporting.set(false);
      }, 1000);

    } catch (error) {
      console.error('Export error:', error);
      alert('Export failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
      this.exporting.set(false);
    }
  }

  async exportToCSV(): Promise<void> {
    if (!this.isAdmin()) return;

    this.exporting.set(true);

    try {
      const logs = this.filteredLogs();
      
      // Create CSV header
      const headers = [
        'Timestamp', 'User', 'Email', 'Action', 'Entity Type', 'Entity ID', 'Changes', 'Metadata'
      ];
      
      const rows = logs.map(log => [
        new Date(log.timestamp).toLocaleString(),
        log.userName,
        log.userEmail,
        log.action,
        log.entityType,
        log.entityId || '',
        log.changes ? log.changes.map(c => 
          `${c.field}: ${c.oldValue} → ${c.newValue}`
        ).join('; ') : '',
        log.metadata ? JSON.stringify(log.metadata) : '',
      ]);

      const csv = [headers.join(','), ...rows.map(r => r.map(v => `"${v}"`).join(','))].join('\n');

      // Download
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').substring(0, 19);
      a.href = url;
      a.download = `audit-trail-${timestamp}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);

      setTimeout(() => {
        this.exporting.set(false);
      }, 1000);

    } catch (error) {
      console.error('Export error:', error);
      alert('Export failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
      this.exporting.set(false);
    }
  }
}
