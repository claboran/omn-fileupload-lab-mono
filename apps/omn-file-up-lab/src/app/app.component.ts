import {Component, OnInit} from '@angular/core';
import {ToastrService} from 'ngx-toastr';
import {WindowRefService} from './window-ref.service';
import {environment} from '../environments/environment';
import { FileUploader, xhrTransportFn } from '@omn-file-upload/file-upload-lib';
import { BsModalService } from 'ngx-bootstrap';
import { FileUploadModalState } from './file-upload-modal/modal-state';
import { FileUploadModalComponent } from './file-upload-modal/file-upload-modal.component';

const URL = 'https://glacial-thicket-92226.herokuapp.com/api/files';

@Component({
  selector: 'aup-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'omn-file-upload-lab';
  private _uploader: FileUploader = new FileUploader({
    url: environment.uploadApi,
    autoUpload: true,
    itemAlias: 'file',
    removeAfterUpload: true
  }, xhrTransportFn);

  private _filesTransferred: string[] = [];
  private _hasBaseDropZoneOver = false;

  constructor(private toastr: ToastrService,
              private windowRefService: WindowRefService,
              private modalService: BsModalService) {}

  ngOnInit(): void {

    this.windowRefService.nativeWindow.addEventListener('dragover', e => e && e.preventDefault(), false);
    this.windowRefService.nativeWindow.addEventListener('drop', e => e && e.preventDefault(), false);

    this._uploader.onAfterAddingFile = (file) => {
      file.withCredentials = false;
    };

    this._uploader.onSuccessItem = (item: any, status: any) => {
      this.toastr.success(`Successfully uploaded file: ${item.file.name}`);
      this._filesTransferred.push(item.file.name);
    };

    this._uploader.onErrorItem = (item: any, status: any) => {
      this.toastr.error(`Error for uploaded file: ${item.file.name}`);
    };

    this._uploader.onCancelItem = (item: any, status: any) => {
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


  get uploader(): FileUploader {
    return this._uploader;
  }

  public openInfoModal(): void {
    const initialState = {
      fileUploader: this._uploader
    } as FileUploadModalState;
    this.modalService.show(FileUploadModalComponent, {initialState});
  }
}
