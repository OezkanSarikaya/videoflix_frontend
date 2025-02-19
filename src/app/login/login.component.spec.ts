import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginComponent } from './login.component';
import { HttpClientTestingModule } from '@angular/common/http/testing'; // Importiere HttpClientTestingModule
import { AuthService } from '../services/auth.service'; // AuthService ist die Abhängigkeit von LoginComponent
import { RouterTestingModule } from '@angular/router/testing'; // RouterModule für Routing
import { ReactiveFormsModule } from '@angular/forms'; // Falls du Reactive Forms verwendest

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule, // Stellt den HttpClient im Test bereit
        RouterTestingModule, // Stellt Routing bereit
        ReactiveFormsModule, // Falls du Reactive Forms verwendest
        LoginComponent, // Direktes Importieren der Standalone-Komponente
      ],
      providers: [
        AuthService, // AuthService muss als Provider mitgegeben werden
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges(); // Änderungen erkennen und die Komponente initialisieren
  });

  it('should create', () => {
    expect(component).toBeTruthy(); // Test, ob die Komponente erstellt wurde
  });
});
