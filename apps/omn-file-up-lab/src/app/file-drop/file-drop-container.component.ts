import { Component, OnInit } from '@angular/core';
import { DropFileService } from '../drop-file.service';
import { Observable } from 'rxjs';
import { FileUploader } from '@omn-file-upload/file-upload-lib';

@Component({
  selector: 'omn-file-upload-file-drop-container',
  templateUrl: './file-drop-container.component.html',
  styleUrls: ['./file-drop-container.component.scss']
})
export class FileDropContainerComponent implements OnInit {

  private readonly _filesTransferred$ = new Observable<string[]>();

  constructor(private dropFileService: DropFileService) {
    this._filesTransferred$ = this.dropFileService.filesTransferred$;
  }

  ngOnInit() {
  }

  get filesTransferred$(): Observable<string[]> {
    return this._filesTransferred$;
  }

  get fileUploader(): FileUploader {
    return this.dropFileService.fileUploader;
  }
}
