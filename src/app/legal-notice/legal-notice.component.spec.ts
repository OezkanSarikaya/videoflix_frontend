import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LegalNoticeComponent } from './legal-notice.component';
import { HttpClientTestingModule } from '@angular/common/http/testing'; // HttpClientTestingModule importieren
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs'; // Falls du Observable erwartest
import { CommonModule } from '@angular/common';
import { FooterComponent } from '../shared/footer/footer.component';
import { HeaderComponent } from '../shared/header/header.component';

describe('LegalNoticeComponent', () => {
  let component: LegalNoticeComponent;
  let fixture: ComponentFixture<LegalNoticeComponent>;

  // Mock für ActivatedRoute erstellen
  const activatedRouteMock = {
    snapshot: { queryParamMap: { get: (key: string) => 'mockValue' } }
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,  // Füge HttpClientTestingModule hinzu
        CommonModule,             // Andere Abhängigkeiten
        FooterComponent, 
        HeaderComponent,
      ],
      providers: [
        { provide: ActivatedRoute, useValue: activatedRouteMock }  // Mock für ActivatedRoute bereitstellen
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LegalNoticeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // Hier kannst du zusätzliche Tests für andere Methoden und das Verhalten hinzufügen
});
