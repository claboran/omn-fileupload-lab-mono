import { Injectable } from '@angular/core';
import { FileUploader } from '@omn-file-upload/file-upload-lib';
import { environment } from '../environments/environment';
import { xhrTransportFn } from '@omn-file-upload/file-upload-lib';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FileUploadXhrService {

  private readonly _uploader: FileUploader;
  private readonly _onSuccessItem$ = new Subject<string>();
  private readonly _onErrorItem$ = new Subject<string>();
  private readonly _onCancelItem$ = new Subject<string>();

  constructor() {
    this._uploader = new FileUploader({
      url: environment.uploadApi,
      autoUpload: true,
      itemAlias: 'file',
      removeAfterUpload: true
    }, xhrTransportFn);

    this._uploader.onAfterAddingFile = (file) => {
      file.withCredentials = false;
    };

    this._uploader.onSuccessItem = (item: any, status: any) => {
      this._onSuccessItem$.next(item.file.name);
    };

    this._uploader.onErrorItem = (item: any, status: any) => {
      this._onErrorItem$.next(item.file.name);
    };

    this._uploader.onCancelItem = (item: any, status: any) => {
      this._onCancelItem$.next(item.file.name);
    };

  }

  get uploader(): FileUploader {
    return this._uploader;
  }

  get onSuccessItem$(): Observable<string> {
    return this._onSuccessItem$.asObservable();
  }

  get onErrorItem$(): Observable<string> {
    return this._onErrorItem$.asObservable();
  }

  get onCancelItem$(): Observable<string> {
    return this._onCancelItem$.asObservable();
  }
}
