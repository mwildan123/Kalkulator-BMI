import { Platform } from '@ionic/angular';
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { App } from '@capacitor/app';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule]
})


export class HomePage {
  jenisKelamin: string = '';
  tinggi: number | null = null;
  berat: number | null = null;
  hasilBMI: number = 0;
  showResult: boolean = false;
  isNative: boolean = false;

  constructor(private platform: Platform) {
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      // Cek apakah running di native platform (hybrid = Android/iOS)
      try {
        this.isNative = this.platform.is('hybrid');
      } catch (e) {
        this.isNative = false;
      }
      
      if (this.isNative) {
        this.setupBackButton();
      }
    }).catch((err) => {
      console.warn('Platform ready error:', err);
    });
  }

  setupBackButton() {
    if (this.isNative) {
      try {
        App.addListener('backButton', () => {
          if (this.showResult) {
            this.showResult = false;
          } else {
            App.exitApp();
          }
        });
      } catch (err) {
        console.warn('Failed to setup back button:', err);
      }
    }
  }

  isValidInput(): boolean {
    return this.jenisKelamin !== '' && 
           this.tinggi !== null && this.tinggi > 0 && 
           this.berat !== null && this.berat > 0;
  }

  hitungBMI(): void {
    if (this.isValidInput()) {
      try {
        const tinggiMeter = (this.tinggi as number) / 100;
        
        // Pencegahan division by zero
        if (tinggiMeter <= 0) {
          console.warn('Tinggi tidak valid');
          return;
        }
        
        const bmi = (this.berat as number) / (tinggiMeter * tinggiMeter);
        
        // Validasi hasil BMI
        if (!isFinite(bmi) || isNaN(bmi)) {
          console.warn('Perhitungan BMI tidak valid');
          return;
        }
        
        this.hasilBMI = parseFloat(bmi.toFixed(1));
        this.showResult = true;
      } catch (err) {
        console.error('Error calculating BMI:', err);
      }
    }
  }

  getKategoriBMI(): string {
    if (this.hasilBMI < 18.5) return 'Kurang berat badan';
    if (this.hasilBMI <= 24.9) return 'Berat badan normal';
    if (this.hasilBMI <= 29.9) return 'Kegemukan';
    if (this.hasilBMI <= 34.9) return 'Kelas Obesitas 1';
    if (this.hasilBMI <= 39.9) return 'Kelas Obesitas 2';
    return 'Obesitas Ekstrem Kelas 3';
  }

  getBMIClass(): string {
    if (this.hasilBMI < 18.5) return 'text-kurang';
    if (this.hasilBMI <= 24.9) return 'text-normal';
    if (this.hasilBMI <= 29.9) return 'text-kegemukan';
    return 'text-obesitas';
  }

  calculateGaugePosition(): number {
    // Handle initial state where BMI is 0 or invalid
    if (!this.hasilBMI || this.hasilBMI < 10) {
      return 0;
    }
    const minBMI = 10;
    const maxBMI = 45;
    const boundedBMI = Math.max(minBMI, Math.min(maxBMI, this.hasilBMI));
    const percentage = ((boundedBMI - minBMI) / (maxBMI - minBMI)) * 100;
    return Math.round(percentage);
  }

  getSaran(): string {
    const bmi = this.hasilBMI;
    if (bmi < 18.5) return 'Tingkatkan asupan nutrisi dan konsultasikan dengan ahli gizi.';
    if (bmi <= 24.9) return 'Pertahankan pola makan sehat dan olahraga teratur.';
    if (bmi <= 29.9) return 'Utamakan hidup sehat dan perhatikan konsumsi harian.';
    return 'Konsultasikan dengan tenaga medis untuk program pengelolaan berat badan.';
  }

  resetForm(): void {
    this.showResult = false;
  }
}