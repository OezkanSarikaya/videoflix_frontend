import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';  // Hinzufügen des RouterTestingModule
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { ActivateComponent } from './activate.component'; // Standalone-Komponente
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { AuthService } from '../services/auth.service';

describe('ActivateComponent', () => {
  let component: ActivateComponent;
  let fixture: ComponentFixture<ActivateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        RouterTestingModule.withRoutes([]),  // RouterTestingModule einfügen
        HttpClientTestingModule,  // HttpClientTestingModule für HTTP-Anfragen
        ActivateComponent,  // Standalone-Komponente hier einfügen
      ],
      providers: [AuthService]  // AuthService als Provider hinzufügen, falls nötig
    }).compileComponents();

    fixture = TestBed.createComponent(ActivateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
