import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PrivacyPolicyComponent } from './privacy-policy.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';  // HttpClientTestingModule importieren
import { ActivatedRoute } from '@angular/router';  // ActivatedRoute importieren
import { of } from 'rxjs';  // Verwenden von `of()` für Mock-Observables
import { AuthService } from '../services/auth.service';
import { CommonModule } from '@angular/common';
import { FooterComponent } from '../shared/footer/footer.component';
import { HeaderComponent } from '../shared/header/header.component';

describe('PrivacyPolicyComponent', () => {
  let component: PrivacyPolicyComponent;
  let fixture: ComponentFixture<PrivacyPolicyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,  // Füge HttpClientTestingModule hinzu
        CommonModule,             // Andere Abhängigkeiten
        FooterComponent, 
        HeaderComponent,
      ],
      providers: [
        AuthService,  // Füge AuthService hinzu, falls es nicht bereits bereitgestellt wird
        {
          provide: ActivatedRoute,
          useValue: {  // Mock von ActivatedRoute
            snapshot: {
              queryParamMap: {
                get: (key: string) => null,  // Mock der Methode `get`, die `null` zurückgibt
              },
            },
          },
        },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PrivacyPolicyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // Weitere Tests können hier hinzugefügt werden
});
