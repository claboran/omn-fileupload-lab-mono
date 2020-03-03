import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable} from 'rxjs';
import { FileUploadXhrService } from './file-upload-xhr.service';
import { tap } from 'rxjs/operators';
import { FileUploader } from '@omn-file-upload/file-upload-lib';

@Injectable({
  providedIn: 'root'
})
export class DropFileService {
  private _filesTransferred: string[] = [];
  private readonly _filesTransferred$ = new BehaviorSubject<string[]>(this._filesTransferred);

  constructor(private fileUploadService: FileUploadXhrService) {
    this.fileUploadService.onSuccessItem$.pipe(
      tap(i => this._filesTransferred.push(i)),
      tap(() => this._filesTransferred$.next([...this._filesTransferred]))
    ).subscribe();
  }

  get filesTransferred$(): BehaviorSubject<string[]> {
    return this._filesTransferred$;
  }

  get fileUploader(): FileUploader {
    return this.fileUploadService.uploader;
  }
}
