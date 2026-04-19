import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

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

  constructor() {}

  isValidInput(): boolean {
    return this.jenisKelamin !== '' && 
           this.tinggi !== null && this.tinggi > 0 && 
           this.berat !== null && this.berat > 0;
  }

  hitungBMI(): void {
    if (this.isValidInput()) {
      const tinggiMeter = (this.tinggi as number) / 100;
      const bmi = (this.berat as number) / (tinggiMeter * tinggiMeter);
      this.hasilBMI = parseFloat(bmi.toFixed(1));
      this.showResult = true;
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