import { Component, Input, OnInit } from '@angular/core';
import { FileUploader } from '@omn-file-upload/file-upload-lib';
import { WindowRefService } from '../window-ref.service';

@Component({
  selector: 'omn-file-upload-file-drop',
  templateUrl: './file-drop.component.html',
  styleUrls: ['./file-drop.component.scss']
})
export class FileDropComponent implements OnInit {

  private _filesTransferred: string[] = [];
  private _hasBaseDropZoneOver = false;
  private _fileUploader: FileUploader;


  constructor(private windowRefService: WindowRefService) { }

  ngOnInit() {
    this.windowRefService.nativeWindow.addEventListener('dragover', e => e && e.preventDefault(), false);
    this.windowRefService.nativeWindow.addEventListener('drop', e => e && e.preventDefault(), false);
  }

  get filesTransferred(): string[] {
    return this._filesTransferred;
  }

  @Input()
  set filesTransferred(value: string[]) {
    this._filesTransferred = value;
  }

  get fileUploader(): FileUploader {
    return this._fileUploader;
  }

  @Input()
  set fileUploader(value: FileUploader) {
    this._fileUploader = value;
  }

  get hasBaseDropZoneOver(): boolean {
    return this._hasBaseDropZoneOver;
  }

  public fileOverBase(e: any): void {
    this._hasBaseDropZoneOver = e;
  }

}
