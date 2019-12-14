import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FileUploadInfoItemComponent } from './file-upload-info-item.component';

describe('FileUploadInfoItemComponent', () => {
  let component: FileUploadInfoItemComponent;
  let fixture: ComponentFixture<FileUploadInfoItemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FileUploadInfoItemComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FileUploadInfoItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
