import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { HomePage } from './home.page';

describe('HomePage', () => {
  let component: HomePage;
  let fixture: ComponentFixture<HomePage>;

  beforeEach(async () => {
    // Mock localStorage
    let store: { [key: string]: string } = {};
    spyOn(localStorage, 'getItem').and.callFake((key: string) => store[key] || null);
    spyOn(localStorage, 'setItem').and.callFake((key: string, value: string) => {
      store[key] = value;
    });
    spyOn(localStorage, 'removeItem').and.callFake((key: string) => {
      delete store[key];
    });

    await TestBed.configureTestingModule({
      imports: [IonicModule.forRoot(), HomePage]
    }).compileComponents();

    fixture = TestBed.createComponent(HomePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component successfully', () => {
    expect(component).toBeTruthy();
  });

  it('should default to kalkulator segment, kemenkes standard, and laki-laki gender', () => {
    expect(component.activeSegment).toBe('kalkulator');
    expect(component.standard).toBe('kemenkes');
    expect(component.jenisKelamin).toBe('laki-laki');
  });

  it('should adjust tinggi, berat, and usia correctly via adjustValue', () => {
    component.tinggi = 170;
    component.adjustValue('tinggi', 1);
    expect(component.tinggi).toBe(171);

    component.adjustValue('tinggi', -5);
    expect(component.tinggi).toBe(166);

    component.berat = 60;
    component.adjustValue('berat', 0.5);
    expect(component.berat).toBe(60.5);

    component.usia = 20;
    component.adjustValue('usia', 1);
    expect(component.usia).toBe(21);
  });

  it('should calculate BMI accurately and set category for Kemenkes standard', () => {
    component.standard = 'kemenkes';
    component.tinggi = 170;
    component.berat = 65;
    component.usia = 22;
    component.jenisKelamin = 'laki-laki';

    component.hitungBMI();

    expect(component.hasilBMI).toBe(22.5);
    expect(component.showResult).toBeTrue();
    expect(component.getKategoriBMI()).toBe('Normal (Ideal)');
    expect(component.getBMIClass()).toBe('text-normal');
  });

  it('should calculate Overweight for Kemenkes vs WHO thresholds', () => {
    // 170 cm, 70 kg -> BMI = 70 / 2.89 = 24.2
    component.tinggi = 170;
    component.berat = 70;
    component.hitungBMI();

    component.standard = 'kemenkes';
    expect(component.getKategoriBMI()).toBe('Kelebihan Berat Badan (Overweight)');

    component.standard = 'who';
    expect(component.getKategoriBMI()).toBe('Normal (Healthy Weight)');
  });

  it('should calculate BMR and Water intake accurately', () => {
    component.tinggi = 170;
    component.berat = 70;
    component.usia = 25;
    component.jenisKelamin = 'laki-laki';

    // Mifflin-St Jeor (Male): (10*70) + (6.25*170) - (5*25) + 5 = 700 + 1062.5 - 125 + 5 = 1642.5 -> 1643
    expect(component.getBMR()).toBe(1643);

    // Water: 70 * 35 = 2450 ml = 2.5 L (~10 glasses)
    const water = component.getKebutuhanAir();
    expect(water.liter).toBe('2.5');
    expect(water.gelas).toBe(10);
  });

  it('should save result to history and delete record', () => {
    component.tinggi = 170;
    component.berat = 65;
    component.hitungBMI();
    component.saveCurrentResult();

    expect(component.historyList.length).toBe(1);
    expect(component.savedInCurrentSession).toBeTrue();

    const recordId = component.historyList[0].id;
    component.deleteHistoryItem(recordId);
    expect(component.historyList.length).toBe(0);
  });

  it('should reset form state on resetForm()', () => {
    component.showResult = true;
    component.savedInCurrentSession = true;
    component.resetForm();

    expect(component.showResult).toBeFalse();
    expect(component.savedInCurrentSession).toBeFalse();
  });
});
