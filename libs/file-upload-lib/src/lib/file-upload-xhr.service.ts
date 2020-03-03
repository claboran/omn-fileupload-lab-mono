import { Injectable } from '@angular/core';
import { FileUploader } from './file-uploader.class';
import { environment } from '../../../../apps/omn-file-up-lab/src/environments/environment';
import { xhrTransportFn } from './xhr-middleware';

@Injectable({
  providedIn: 'root'
})
export class FileUploadXhrService {

  private readonly _uploader: FileUploader;

  constructor() {
    this._uploader = new FileUploader({
      url: environment.uploadApi,
      autoUpload: true,
      itemAlias: 'file',
      removeAfterUpload: true
    }, xhrTransportFn);
  }

  get uploader(): FileUploader {
    return this._uploader;
  }
}
