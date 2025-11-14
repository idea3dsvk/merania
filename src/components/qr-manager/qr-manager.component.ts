import { Component, ChangeDetectionStrategy, signal, inject, computed, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { TranslationService } from '../../services/translation.service';
import { AuthService } from '../../services/auth.service';
import { DataService } from '../../services/data.service';
import { MeasurementType, MEASUREMENT_TYPES } from '../../models';
import * as QRCode from 'qrcode';

interface QRLocation {
  id: string;
  name: string;
  measurementType: MeasurementType;
  qrCodeDataUrl?: string;
  created: string;
}

@Component({
  selector: 'app-qr-manager',
  templateUrl: './qr-manager.component.html',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, TranslatePipe],
})
export class QRManagerComponent implements OnInit {
  private authService = inject(AuthService);
  private dataService = inject(DataService);
  translationService = inject(TranslationService);

  // State
  locations = signal<QRLocation[]>([]);
  showAddDialog = signal(false);
  newLocationName = signal('');
  newLocationType = signal<MeasurementType>('temperature_humidity');
  generating = signal(false);
  scanMode = signal(false);
  scannedData = signal<string>('');

  // Computed
  isAdmin = computed(() => this.authService.currentUser()?.role === 'admin');
  measurementTypes = MEASUREMENT_TYPES;

  private readonly STORAGE_KEY = 'qr-locations';

  constructor() {
    // Set up reactive effect to sync with dataService
    effect(() => {
      this.locations.set(this.dataService.qrLocations());
    });
  }

  ngOnInit() {
    // Effect is already set up in constructor
  }

  openAddDialog(): void {
    this.newLocationName.set('');
    this.newLocationType.set('temperature_humidity');
    this.showAddDialog.set(true);
  }

  closeAddDialog(): void {
    this.showAddDialog.set(false);
  }

  async createQRLocation(): Promise<void> {
    const name = this.newLocationName().trim();
    if (!name) {
      alert('Location name is required');
      return;
    }

    this.generating.set(true);

    try {
      const qrLocation: QRLocation = {
        id: crypto.randomUUID(),
        name,
        measurementType: this.newLocationType(),
        created: new Date().toISOString(),
      };

      // Generate QR code data - use simple format for better scanning
      const qrData = JSON.stringify({
        location: name,
        type: this.newLocationType(),
        id: qrLocation.id,
      });

      // Generate QR code image with higher error correction
      const qrCodeDataUrl = await QRCode.toDataURL(qrData, {
        width: 400,
        margin: 2,
        errorCorrectionLevel: 'H', // High error correction
        type: 'image/png',
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      });

      qrLocation.qrCodeDataUrl = qrCodeDataUrl;

      // Save to Firebase through DataService
      await this.dataService.addQRLocation(qrLocation);

      this.closeAddDialog();
    } catch (error) {
      console.error('Failed to generate QR code:', error);
      alert('Failed to generate QR code: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      this.generating.set(false);
    }
  }

  async regenerateQR(location: QRLocation): Promise<void> {
    try {
      const qrData = JSON.stringify({
        location: location.name,
        type: location.measurementType,
        id: location.id,
      });

      const qrCodeDataUrl = await QRCode.toDataURL(qrData, {
        width: 400,
        margin: 2,
        errorCorrectionLevel: 'H',
        type: 'image/png',
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      });

      this.locations.update(locs => {
        const updated = locs.map(loc =>
          loc.id === location.id ? { ...loc, qrCodeDataUrl } : loc
        );
        // Update Firebase
        this.dataService.updateQRLocation(location.id, { ...location, qrCodeDataUrl });
        return updated;
        return updated;
      });
    } catch (error) {
      console.error('Failed to regenerate QR code:', error);
    }
  }

  downloadQR(location: QRLocation): void {
    if (!location.qrCodeDataUrl) return;

    const link = document.createElement('a');
    link.download = `QR-${location.name.replace(/[^a-zA-Z0-9]/g, '-')}.png`;
    link.href = location.qrCodeDataUrl;
    link.click();
  }

  printQR(location: QRLocation): void {
    if (!location.qrCodeDataUrl) return;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>QR Code - ${location.name}</title>
            <style>
              body {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                min-height: 100vh;
                margin: 0;
                font-family: Arial, sans-serif;
              }
              .qr-container {
                text-align: center;
                padding: 20px;
              }
              h1 { font-size: 24px; margin-bottom: 10px; }
              h2 { font-size: 18px; color: #666; margin-bottom: 20px; }
              img { max-width: 400px; }
              @media print {
                body { margin: 0; }
              }
            </style>
          </head>
          <body>
            <div class="qr-container">
              <h1>${location.name}</h1>
              <h2>${this.translationService.translate('measurementNames.' + location.measurementType)}</h2>
              <img src="${location.qrCodeDataUrl}" alt="QR Code" />
              <p>Scan to add measurement</p>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 250);
    }
  }

  deleteLocation(location: QRLocation): void {
    if (confirm(`Are you sure you want to delete QR code for "${location.name}"?`)) {
      this.dataService.deleteQRLocation(location.id);
      this.locations.update(locs => {
        return locs.filter(loc => loc.id !== location.id);
      });
    }
  }

  toggleScanMode(): void {
    this.scanMode.update(mode => !mode);
    if (this.scanMode()) {
      this.startScanning();
    }
  }

  private startScanning(): void {
    // This would integrate with a QR scanner library or camera API
    // For now, we'll provide a manual input option
    const scannedText = prompt('Paste scanned QR code data (or scan with camera):');
    if (scannedText) {
      this.handleScannedData(scannedText);
    }
    this.scanMode.set(false);
  }

  private handleScannedData(data: string): void {
    try {
      const parsed = JSON.parse(data);
      if (parsed.location && parsed.type) {
        // Navigate to measurement form with pre-filled data
        this.scannedData.set(data);
        alert(`Scanned location: ${parsed.location}\nType: ${parsed.type}\n\nRedirecting to measurement form...`);
        // Here you would emit an event or navigate to the measurement form
        // with pre-filled location and type
      } else {
        alert('Invalid QR code format');
      }
    } catch (error) {
      alert('Failed to parse QR code data');
    }
  }

  getMeasurementTypeName(type: MeasurementType): string {
    return this.translationService.translate('measurementNames.' + type);
  }
}
