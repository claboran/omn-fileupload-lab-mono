import {Component, OnInit} from '@angular/core';
import {ToastrService} from 'ngx-toastr';
import {WindowRefService} from './window-ref.service';
import {environment} from '../environments/environment';
import { FileUploader } from '@omn-file-upload/file-upload-lib';

const URL = 'https://glacial-thicket-92226.herokuapp.com/api/files';

@Component({
  selector: 'aup-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'omn-file-upload-lab';
  public uploader: FileUploader = new FileUploader({
    url: environment.uploadApi,
    itemAlias: 'file',
    removeAfterUpload: true
  });

  private _filesTransferred: string[] = [];
  private _hasBaseDropZoneOver = false;

  constructor(private toastr: ToastrService, private windowRefService: WindowRefService) {}

  ngOnInit(): void {

    this.windowRefService.nativeWindow.addEventListener('dragover', e => e && e.preventDefault(), false);
    this.windowRefService.nativeWindow.addEventListener('drop', e => e && e.preventDefault(), false);

    this.uploader.onAfterAddingFile = (file) => {
      file.withCredentials = false;
    };

    this.uploader.onSuccessItem = (item: any, status: any) => {
      this.toastr.success(`Successfully uploaded file: ${item.file.name}`);
      this._filesTransferred.push(item.file.name);
    };

    this.uploader.onErrorItem = (item: any, status: any) => {
      this.toastr.error(`Error for uploaded file: ${item.file.name}`);
    };

    this.uploader.onCancelItem = (item: any, status: any) => {
      this.toastr.warning(`${item.file.name} canceled!`);
    };

  }

  get filesTransferred(): string[] {
    return this._filesTransferred;
  }


  get hasBaseDropZoneOver(): boolean {
    return this._hasBaseDropZoneOver;
  }

  public fileOverBase(e: any): void {
    this._hasBaseDropZoneOver = e;
  }
}
