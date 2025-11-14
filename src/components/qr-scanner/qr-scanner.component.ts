import { Component, signal, inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Html5Qrcode } from 'html5-qrcode';
import { TranslationService } from '../../services/translation.service';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { MeasurementType } from '../../models';

interface ScannedQRData {
  location: string;
  type: MeasurementType;
  id: string;
}

@Component({
  selector: 'app-qr-scanner',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './qr-scanner.component.html',
  styles: [`
    :host {
      display: block;
      padding: 2rem;
      max-width: 800px;
      margin: 0 auto;
    }

    .scanner-header {
      margin-bottom: 2rem;
    }

    .scanner-header h1 {
      font-size: 2rem;
      font-weight: bold;
      color: #1e293b;
      margin-bottom: 0.5rem;
    }

    .scanner-header p {
      color: #64748b;
      margin-bottom: 1rem;
    }

    .scanner-container {
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
      padding: 2rem;
    }

    #qr-reader {
      border-radius: 8px;
      overflow: hidden;
      margin-bottom: 1.5rem;
    }

    .instructions {
      background: #f1f5f9;
      padding: 1.5rem;
      border-radius: 8px;
      margin-bottom: 1.5rem;
    }

    .instructions h3 {
      font-size: 1.1rem;
      font-weight: 600;
      color: #1e293b;
      margin-bottom: 0.75rem;
    }

    .instructions ul {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .instructions li {
      padding: 0.5rem 0;
      color: #475569;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .instructions li::before {
      content: '✓';
      color: #10b981;
      font-weight: bold;
      flex-shrink: 0;
    }

    .scanned-data {
      background: #f0fdf4;
      border: 2px solid #10b981;
      padding: 1.5rem;
      border-radius: 8px;
      margin-bottom: 1.5rem;
    }

    .scanned-data h3 {
      font-size: 1.1rem;
      font-weight: 600;
      color: #166534;
      margin-bottom: 1rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .scanned-data-item {
      display: flex;
      justify-content: space-between;
      padding: 0.5rem 0;
      border-bottom: 1px solid #bbf7d0;
    }

    .scanned-data-item:last-child {
      border-bottom: none;
    }

    .scanned-data-label {
      font-weight: 500;
      color: #166534;
    }

    .scanned-data-value {
      color: #15803d;
      font-weight: 600;
    }

    .action-buttons {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .btn {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 8px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
      flex: 1;
      min-width: 150px;
    }

    .btn-primary {
      background: #10b981;
      color: white;
    }

    .btn-primary:hover {
      background: #059669;
    }

    .btn-secondary {
      background: #64748b;
      color: white;
    }

    .btn-secondary:hover {
      background: #475569;
    }

    .btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .error-message {
      background: #fee2e2;
      border: 2px solid #ef4444;
      color: #991b1b;
      padding: 1rem;
      border-radius: 8px;
      margin-bottom: 1.5rem;
    }

    .camera-permissions {
      background: #fef3c7;
      border: 2px solid #f59e0b;
      padding: 1.5rem;
      border-radius: 8px;
      margin-bottom: 1.5rem;
    }

    .camera-permissions h3 {
      font-size: 1.1rem;
      font-weight: 600;
      color: #92400e;
      margin-bottom: 0.75rem;
    }

    .camera-permissions p {
      color: #78350f;
      margin-bottom: 1rem;
    }

    .camera-permissions ul {
      list-style: decimal;
      padding-left: 1.5rem;
      color: #78350f;
    }

    .camera-permissions li {
      margin-bottom: 0.5rem;
    }

    @media (max-width: 640px) {
      :host {
        padding: 1rem;
      }

      .scanner-header h1 {
        font-size: 1.5rem;
      }

      .scanner-container {
        padding: 1rem;
      }

      .action-buttons {
        flex-direction: column;
      }

      .btn {
        width: 100%;
      }
    }
  `]
})
export class QRScannerComponent implements OnInit, OnDestroy {
  private translationService = inject(TranslationService);
  
  scannerActive = signal(false);
  scannedData = signal<ScannedQRData | null>(null);
  errorMessage = signal<string | null>(null);
  showPermissionHelp = signal(false);

  private scanner: Html5Qrcode | null = null;
  private readonly scannerId = 'qr-reader';

  ngOnInit() {
    this.startScanner();
  }

  ngOnDestroy() {
    this.stopScanner();
  }

  async startScanner() {
    try {
      this.errorMessage.set(null);
      this.showPermissionHelp.set(false);

      // Initialize Html5Qrcode
      this.scanner = new Html5Qrcode(this.scannerId);

      // Get cameras
      const devices = await Html5Qrcode.getCameras();
      
      if (!devices || devices.length === 0) {
        throw new Error('No cameras found');
      }

      // Use back camera on mobile (environment facing)
      const cameraId = devices.find(d => d.label.toLowerCase().includes('back') || d.label.toLowerCase().includes('environment'))?.id 
        || devices[devices.length - 1].id;

      // Start scanning with the selected camera
      await this.scanner.start(
        cameraId,
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
          disableFlip: false,
          videoConstraints: {
            facingMode: { ideal: "environment" }
          }
        },
        (decodedText) => this.onScanSuccess(decodedText),
        (errorMessage) => this.onScanError(errorMessage)
      );

      this.scannerActive.set(true);
    } catch (error: any) {
      console.error('Scanner initialization error:', error);
      
      if (error?.name === 'NotAllowedError' || error?.message?.includes('Permission')) {
        this.showPermissionHelp.set(true);
        this.errorMessage.set(
          this.translationService.translate('qrScanner.permissionRequired')
        );
      } else {
        this.errorMessage.set(
          this.translationService.translate('qrScanner.cameraError')
        );
      }
    }
  }

  async stopScanner() {
    if (this.scanner) {
      try {
        if (this.scanner.isScanning) {
          await this.scanner.stop();
        }
        this.scanner.clear();
        this.scanner = null;
      } catch (error) {
        console.error('Error stopping scanner:', error);
      }
      this.scannerActive.set(false);
    }
  }

  private onScanSuccess(decodedText: string) {
    try {
      // Parse the QR code data (JSON format from QR Manager)
      const data: ScannedQRData = JSON.parse(decodedText);

      // Validate the data structure
      if (!data.location || !data.type || !data.id) {
        throw new Error('Invalid QR code format');
      }

      // Set scanned data
      this.scannedData.set(data);
      this.errorMessage.set(null);

      // Stop scanner after successful scan
      this.stopScanner();

      // Optional: Play success sound or vibration
      if ('vibrate' in navigator) {
        navigator.vibrate(200);
      }
    } catch (error) {
      console.error('QR parse error:', error);
      this.errorMessage.set(
        this.translationService.translate('qrScanner.invalidQR')
      );
    }
  }

  private onScanError(errorMessage: string | Error) {
    // Convert to string if it's an Error object
    const errMsg = typeof errorMessage === 'string' 
      ? errorMessage 
      : errorMessage?.message || String(errorMessage);
    
    // Ignore common scanning errors (happens frequently during scanning)
    // Only log critical errors
    if (errMsg.includes('NotFoundException') || 
        errMsg.includes('NotFoundError') ||
        errMsg.includes('No MultiFormat Readers')) {
      // This is normal - just means QR code not detected in current frame
      return;
    }
    
    if (errMsg.includes('NotAllowedError') || 
        errMsg.includes('PermissionDenied')) {
      this.showPermissionHelp.set(true);
    }
    
    // Log other errors for debugging
    console.warn('QR Scanner error:', errMsg);
  }

  addMeasurement() {
    const data = this.scannedData();
    if (!data) return;

    // Store scanned data in localStorage for the dashboard to pick up
    localStorage.setItem('scannedQRData', JSON.stringify(data));
    
    // Navigate to dashboard (parent will handle it)
    window.location.hash = '#dashboard';
    window.location.reload();
  }

  scanAgain() {
    this.scannedData.set(null);
    this.errorMessage.set(null);
    this.startScanner();
  }

  getMeasurementTypeName(type: MeasurementType): string {
    return this.translationService.translate(`measurementNames.${type}`);
  }
}
