import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, Platform, ToastController, AlertController } from '@ionic/angular';
import { App } from '@capacitor/app';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { addIcons } from 'ionicons';
import {
  calculatorOutline,
  timeOutline,
  informationCircleOutline,
  trashOutline,
  bookmarkOutline,
  bookmark,
  refreshOutline,
  arrowBackOutline,
  scaleOutline,
  bodyOutline,
  calendarOutline,
  restaurantOutline,
  fitnessOutline,
  waterOutline,
  addOutline,
  removeOutline,
  checkmarkCircle,
  alertCircleOutline,
  maleOutline,
  femaleOutline,
  swapHorizontalOutline,
  shieldCheckmarkOutline,
  heartOutline,
  flameOutline
} from 'ionicons/icons';

export interface BmiHistoryRecord {
  id: string;
  tanggal: string;
  gender: 'laki-laki' | 'perempuan';
  tinggi: number;
  berat: number;
  usia: number;
  bmi: number;
  kategori: string;
  kategoriClass: string;
  standard: 'kemenkes' | 'who';
}

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule]
})
export class HomePage implements OnInit {
  // Navigation segment: 'kalkulator' | 'riwayat' | 'edukasi'
  activeSegment: 'kalkulator' | 'riwayat' | 'edukasi' = 'kalkulator';

  // Standard calculation: 'kemenkes' (Asia-Pasifik) or 'who' (Global)
  standard: 'kemenkes' | 'who' = 'kemenkes';

  // Form Inputs
  jenisKelamin: 'laki-laki' | 'perempuan' = 'laki-laki';
  tinggi: number = 170;
  berat: number = 65;
  usia: number = 22;

  // Calculation Results
  hasilBMI: number = 0;
  showResult: boolean = false;
  isNative: boolean = false;
  savedInCurrentSession: boolean = false;

  // History storage
  historyList: BmiHistoryRecord[] = [];

  constructor(
    private platform: Platform,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController
  ) {
    this.registerIcons();
    this.initializeApp();
  }

  ngOnInit() {
    this.loadHistory();
  }

  private registerIcons() {
    addIcons({
      calculatorOutline,
      timeOutline,
      informationCircleOutline,
      trashOutline,
      bookmarkOutline,
      bookmark,
      refreshOutline,
      arrowBackOutline,
      scaleOutline,
      bodyOutline,
      calendarOutline,
      restaurantOutline,
      fitnessOutline,
      waterOutline,
      addOutline,
      removeOutline,
      checkmarkCircle,
      alertCircleOutline,
      maleOutline,
      femaleOutline,
      swapHorizontalOutline,
      shieldCheckmarkOutline,
      heartOutline,
      flameOutline
    });
  }

  initializeApp() {
    this.platform.ready().then(() => {
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
          if (this.activeSegment !== 'kalkulator') {
            this.activeSegment = 'kalkulator';
          } else if (this.showResult) {
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

  // --- Haptics Feedback ---
  async triggerHaptic(style: ImpactStyle = ImpactStyle.Light) {
    try {
      await Haptics.impact({ style });
    } catch {
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate(20);
      }
    }
  }

  // --- Gender & Standard Selection ---
  selectGender(gender: 'laki-laki' | 'perempuan') {
    this.jenisKelamin = gender;
    this.triggerHaptic(ImpactStyle.Light);
  }

  setStandard(std: 'kemenkes' | 'who') {
    this.standard = std;
    this.triggerHaptic(ImpactStyle.Light);
    if (this.showResult) {
      this.recalculate();
    }
  }

  // --- Stepper Controls (+ / -) ---
  adjustValue(field: 'tinggi' | 'berat' | 'usia', delta: number) {
    this.triggerHaptic(ImpactStyle.Light);
    if (field === 'tinggi') {
      const current = this.tinggi !== null && !isNaN(this.tinggi) ? this.tinggi : 170;
      this.tinggi = Math.max(50, Math.min(250, current + delta));
    } else if (field === 'berat') {
      const current = this.berat !== null && !isNaN(this.berat) ? this.berat : 60;
      const val = Math.max(15, Math.min(300, current + delta));
      this.berat = Math.round(val * 10) / 10;
    } else if (field === 'usia') {
      const current = this.usia !== null && !isNaN(this.usia) ? this.usia : 20;
      this.usia = Math.max(5, Math.min(120, current + delta));
    }
  }

  // --- Input Validation & Calculation ---
  isValidInput(): boolean {
    return (
      (this.jenisKelamin === 'laki-laki' || this.jenisKelamin === 'perempuan') &&
      this.tinggi !== null &&
      !isNaN(this.tinggi) &&
      this.tinggi >= 50 &&
      this.tinggi <= 260 &&
      this.berat !== null &&
      !isNaN(this.berat) &&
      this.berat >= 15 &&
      this.berat <= 350 &&
      this.usia !== null &&
      !isNaN(this.usia) &&
      this.usia >= 5 &&
      this.usia <= 120
    );
  }

  hitungBMI(): void {
    if (!this.isValidInput()) {
      this.presentToast('Mohon masukkan data tinggi, berat, dan usia dengan benar.', 'warning');
      return;
    }

    this.triggerHaptic(ImpactStyle.Medium);
    const tinggiMeter = this.tinggi / 100;
    const bmi = this.berat / (tinggiMeter * tinggiMeter);

    if (!isFinite(bmi) || isNaN(bmi)) {
      this.presentToast('Perhitungan BMI tidak valid', 'danger');
      return;
    }

    this.hasilBMI = parseFloat(bmi.toFixed(1));
    this.savedInCurrentSession = false;
    this.showResult = true;
  }

  recalculate(): void {
    if (this.isValidInput()) {
      const tinggiMeter = this.tinggi / 100;
      const bmi = this.berat / (tinggiMeter * tinggiMeter);
      this.hasilBMI = parseFloat(bmi.toFixed(1));
    }
  }

  // --- BMI Categories & Styles ---
  getKategoriBMI(): string {
    const bmi = this.hasilBMI;
    if (this.standard === 'kemenkes') {
      // Standar Kemenkes RI / Asia Pasifik
      if (bmi < 18.5) return 'Kurus (Kekurangan Berat)';
      if (bmi <= 22.9) return 'Normal (Ideal)';
      if (bmi <= 24.9) return 'Kelebihan Berat Badan (Overweight)';
      if (bmi <= 29.9) return 'Obesitas Tingkat 1';
      return 'Obesitas Tingkat 2';
    } else {
      // Standar WHO Global
      if (bmi < 18.5) return 'Kurus (Underweight)';
      if (bmi <= 24.9) return 'Normal (Healthy Weight)';
      if (bmi <= 29.9) return 'Pra-Obesitas (Overweight)';
      if (bmi <= 34.9) return 'Obesitas Kelas 1';
      if (bmi <= 39.9) return 'Obesitas Kelas 2';
      return 'Obesitas Ekstrem Kelas 3';
    }
  }

  getBMIClass(): string {
    const bmi = this.hasilBMI;
    if (this.standard === 'kemenkes') {
      if (bmi < 18.5) return 'text-kurang';
      if (bmi <= 22.9) return 'text-normal';
      if (bmi <= 24.9) return 'text-kegemukan';
      return 'text-obesitas';
    } else {
      if (bmi < 18.5) return 'text-kurang';
      if (bmi <= 24.9) return 'text-normal';
      if (bmi <= 29.9) return 'text-kegemukan';
      return 'text-obesitas';
    }
  }

  getBMIBadgeClass(): string {
    const bmi = this.hasilBMI;
    if (this.standard === 'kemenkes') {
      if (bmi < 18.5) return 'badge-kurang';
      if (bmi <= 22.9) return 'badge-normal';
      if (bmi <= 24.9) return 'badge-kegemukan';
      return 'badge-obesitas';
    } else {
      if (bmi < 18.5) return 'badge-kurang';
      if (bmi <= 24.9) return 'badge-normal';
      if (bmi <= 29.9) return 'badge-kegemukan';
      return 'badge-obesitas';
    }
  }

  // --- Gauge Bar Calculation with Edge Clamping ---
  calculateGaugePosition(): number {
    if (!this.hasilBMI || this.hasilBMI < 10) return 4;
    const minBMI = 12;
    const maxBMI = 42;
    const boundedBMI = Math.max(minBMI, Math.min(maxBMI, this.hasilBMI));
    const percentage = ((boundedBMI - minBMI) / (maxBMI - minBMI)) * 100;
    // Clamp between 4% and 96% so the pin bubble never overflows the container
    return Math.max(4, Math.min(96, Math.round(percentage)));
  }

  // --- Ideal Weight Calculations ---
  getRentangIdeal(): { min: number; max: number } {
    const t = this.tinggi && !isNaN(this.tinggi) ? this.tinggi : 170;
    const tinggiMeter = t / 100;
    const h2 = tinggiMeter * tinggiMeter;
    const min = parseFloat((18.5 * h2).toFixed(1));
    const max = parseFloat(((this.standard === 'kemenkes' ? 22.9 : 24.9) * h2).toFixed(1));
    return { min, max };
  }

  getStatusTargetIdeal(): { message: string; diff: number; status: 'normal' | 'over' | 'under' } {
    const { min, max } = this.getRentangIdeal();
    const b = this.berat && !isNaN(this.berat) ? this.berat : 65;
    if (b < min) {
      const diff = parseFloat((min - b).toFixed(1));
      return {
        message: `Perlu menaikkan sekitar ${diff} kg`,
        diff,
        status: 'under'
      };
    } else if (b > max) {
      const diff = parseFloat((b - max).toFixed(1));
      return {
        message: `Perlu menurunkan sekitar ${diff} kg`,
        diff,
        status: 'over'
      };
    } else {
      return {
        message: 'Berat badanmu sudah ideal!',
        diff: 0,
        status: 'normal'
      };
    }
  }

  // --- BMR (Basal Metabolic Rate via Mifflin-St Jeor) ---
  getBMR(): number {
    const b = this.berat && !isNaN(this.berat) ? this.berat : 65;
    const t = this.tinggi && !isNaN(this.tinggi) ? this.tinggi : 170;
    const u = this.usia && !isNaN(this.usia) ? this.usia : 22;
    let bmr = (10 * b) + (6.25 * t) - (5 * u);
    bmr += (this.jenisKelamin === 'laki-laki' ? 5 : -161);
    return Math.round(bmr);
  }

  // --- Kebutuhan Air Harian ---
  getKebutuhanAir(): { liter: string; gelas: number } {
    const b = this.berat && !isNaN(this.berat) ? this.berat : 60;
    const totalMl = b * 35;
    const liter = (totalMl / 1000).toFixed(1);
    const gelas = Math.round(totalMl / 250);
    return { liter, gelas };
  }

  // --- Comprehensive Structured Health Advice ---
  getDetailedAdvice() {
    const bmi = this.hasilBMI;
    const isKemenkes = this.standard === 'kemenkes';
    const isNormal = isKemenkes ? (bmi >= 18.5 && bmi <= 22.9) : (bmi >= 18.5 && bmi <= 24.9);
    const isUnder = bmi < 18.5;
    const isOver = isKemenkes ? (bmi > 22.9 && bmi <= 24.9) : (bmi > 24.9 && bmi <= 29.9);

    if (isUnder) {
      return {
        diet: 'Tingkatkan asupan kalori padat nutrisi (alpukat, kacang-kacangan, telur, daging tanpa lemak). Makan dalam porsi kecil namun sering (5-6x sehari).',
        fitness: 'Fokus pada latihan beban (strength training) untuk membangun massa otot, kurangi kardio berintensitas tinggi berlebihan.',
        lifestyle: 'Cukupi waktu istirahat tidur 7-8 jam per hari untuk mendukung pemulihan dan regenerasi sel tubuh.'
      };
    } else if (isNormal) {
      return {
        diet: 'Pertahankan pola makan gizi seimbang (Isi Piringku: 50% sayur & buah, 50% karbohidrat kompleks & protein). Batasi konsumsi gula, garam, dan minyak berlebih.',
        fitness: 'Lakukan olahraga rutin minimal 150 menit per minggu (kombinasi jalan cepat, jogging, bersepeda, atau berenang).',
        lifestyle: 'Jaga hidrasi tubuh, kelola stres harian dengan baik, dan lakukan pemeriksaan kesehatan berkala.'
      };
    } else if (isOver) {
      return {
        diet: 'Ciptakan defisit kalori moderat (sekitar 300-500 kkal). Perbanyak serat dari sayuran hijau dan hindari minuman manis berpemanis buatan.',
        fitness: 'Kombinasikan latihan kardio moderat 30 menit sehari (seperti jalan cepat) dengan latihan penguatan otot 2-3 kali seminggu.',
        lifestyle: 'Gunakan tangga dibanding lift, tingkatkan langkah harian (minimal 7.000 langkah sehari), dan hindari begadang.'
      };
    } else {
      return {
        diet: 'Konsultasikan dengan dokter spesialis gizi untuk rencana diet medis terstruktur. Kurangi konsumsi makanan cepat saji dan ultra-processed food.',
        fitness: 'Mulai aktivitas fisik dengan intensitas rendah yang ramah sendi seperti jalan santai, berenang, atau sepeda statis.',
        lifestyle: 'Pantau tekanan darah dan kadar gula darah secara berkala, serta perhatikan kualitas tidur.'
      };
    }
  }

  // --- LocalStorage History Management ---
  loadHistory() {
    try {
      const data = localStorage.getItem('bmi_calculator_history');
      if (data) {
        this.historyList = JSON.parse(data);
      }
    } catch (e) {
      console.warn('Gagal memuat riwayat:', e);
      this.historyList = [];
    }
  }

  saveCurrentResult() {
    if (this.savedInCurrentSession) {
      this.presentToast('Hasil ini sudah tersimpan di riwayat.', 'medium');
      return;
    }

    const now = new Date();
    const dateFormatted = now.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const newRecord: BmiHistoryRecord = {
      id: Date.now().toString(),
      tanggal: dateFormatted,
      gender: this.jenisKelamin,
      tinggi: this.tinggi,
      berat: this.berat,
      usia: this.usia,
      bmi: this.hasilBMI,
      kategori: this.getKategoriBMI(),
      kategoriClass: this.getBMIClass(),
      standard: this.standard
    };

    this.historyList.unshift(newRecord);
    // Keep max 30 records
    if (this.historyList.length > 30) {
      this.historyList = this.historyList.slice(0, 30);
    }

    try {
      localStorage.setItem('bmi_calculator_history', JSON.stringify(this.historyList));
      this.savedInCurrentSession = true;
      this.triggerHaptic(ImpactStyle.Medium);
      this.presentToast('✅ Hasil berhasil disimpan ke riwayat!', 'success');
    } catch (e) {
      this.presentToast('Gagal menyimpan ke penyimpanan lokal', 'danger');
    }
  }

  async deleteHistoryItem(id: string) {
    this.historyList = this.historyList.filter(item => item.id !== id);
    try {
      localStorage.setItem('bmi_calculator_history', JSON.stringify(this.historyList));
      this.triggerHaptic(ImpactStyle.Light);
      this.presentToast('Catatan riwayat telah dihapus', 'medium');
    } catch (e) {
      console.error(e);
    }
  }

  async confirmClearHistory() {
    const alert = await this.alertCtrl.create({
      header: 'Hapus Semua Riwayat?',
      message: 'Apakah kamu yakin ingin menghapus seluruh catatan riwayat penimbangan? Tindakan ini tidak dapat dibatalkan.',
      cssClass: 'aesthetic-confirm-alert',
      buttons: [
        {
          text: 'Batal',
          role: 'cancel',
          cssClass: 'alert-btn-cancel'
        },
        {
          text: 'Hapus Semua',
          role: 'destructive',
          cssClass: 'alert-btn-delete',
          handler: () => {
            this.historyList = [];
            localStorage.removeItem('bmi_calculator_history');
            this.triggerHaptic(ImpactStyle.Heavy);
            this.presentToast('Seluruh riwayat berhasil dibersihkan', 'medium');
          }
        }
      ]
    });
    await alert.present();
  }

  resetForm(): void {
    this.triggerHaptic(ImpactStyle.Light);
    this.showResult = false;
    this.savedInCurrentSession = false;
  }

  async presentToast(message: string, color: 'success' | 'warning' | 'danger' | 'medium' = 'success') {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2500,
      position: 'top',
      color,
      buttons: [{ text: 'OK', role: 'cancel' }]
    });
    await toast.present();
  }
}
