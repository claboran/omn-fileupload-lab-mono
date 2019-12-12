import { async, TestBed } from '@angular/core/testing';
import { FileUploadLibModule } from './file-upload-lib.module';

describe('FileUploadLibModule', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [FileUploadLibModule]
    }).compileComponents();
  }));

  it('should create', () => {
    expect(FileUploadLibModule).toBeDefined();
  });
});
