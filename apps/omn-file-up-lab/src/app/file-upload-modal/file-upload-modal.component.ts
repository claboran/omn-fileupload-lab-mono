import { Component, OnInit } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap';
import { FileUploader } from '@omn-file-upload/file-upload-lib';

@Component({
  selector: 'omn-file-upload-file-upload-modal',
  templateUrl: './file-upload-modal.component.html',
  styleUrls: ['./file-upload-modal.component.scss']
})
export class FileUploadModalComponent implements OnInit {

  private _fileUploader: FileUploader;

  constructor(private bsModalRef: BsModalRef) { }

  ngOnInit() {
  }

  get fileUploader(): FileUploader {
    return this._fileUploader;
  }

  set fileUploader(value: FileUploader) {
    this._fileUploader = value;
  }

  public onClose(): void {
    this.bsModalRef.hide()
  }
}
