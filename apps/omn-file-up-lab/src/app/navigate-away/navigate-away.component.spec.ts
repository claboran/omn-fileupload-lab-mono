import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NavigateAwayComponent } from './navigate-away.component';

describe('NavigateAwayComponent', () => {
  let component: NavigateAwayComponent;
  let fixture: ComponentFixture<NavigateAwayComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NavigateAwayComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NavigateAwayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
