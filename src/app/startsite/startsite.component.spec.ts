import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { StartsiteComponent } from './startsite.component';
import { AuthService } from '../services/auth.service';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

describe('StartsiteComponent', () => {
  let component: StartsiteComponent;
  let fixture: ComponentFixture<StartsiteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, StartsiteComponent], // HttpClientTestingModule hinzufügen
      providers: [
        AuthService, // AuthService bereitstellen
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { queryParamMap: { get: () => null } }, params: of({}) } // Mock für ActivatedRoute
        }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StartsiteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
