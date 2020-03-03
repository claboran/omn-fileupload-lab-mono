import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FileDropContainerComponent } from './file-drop-container.component';

describe('FileDropContainerComponent', () => {
  let component: FileDropContainerComponent;
  let fixture: ComponentFixture<FileDropContainerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FileDropContainerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FileDropContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
