import { Component, OnDestroy, OnInit } from '@angular/core';
import {ToastrService} from 'ngx-toastr';
import {WindowRefService} from './window-ref.service';
import { FileUploader} from '@omn-file-upload/file-upload-lib';
import { BsModalService } from 'ngx-bootstrap';
import { FileUploadModalState } from './file-upload-modal/modal-state';
import { FileUploadModalComponent } from './file-upload-modal/file-upload-modal.component';
import { tap } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { FileUploadXhrService } from './file-upload-xhr.service';
import { Router } from '@angular/router';


@Component({
  selector: 'aup-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'omn-file-upload-lab';

  private _onSuccessSubscription: Subscription;
  private _onErrorSubscription: Subscription;
  private _onCancelSubscription: Subscription;

  constructor(private toastr: ToastrService,
              private windowRefService: WindowRefService,
              private modalService: BsModalService,
              private fileUploader: FileUploadXhrService,
              private router: Router) {}

  ngOnInit(): void {

    this._onSuccessSubscription = this.fileUploader.onSuccessItem$.pipe(
      tap(i => this.toastr.success(`Successfully uploaded file: ${i}`))
    ).subscribe();

    this._onErrorSubscription = this.fileUploader.onErrorItem$.pipe(
      tap(i => this.toastr.error(`Error for uploaded file: ${i}`))
    ).subscribe();

    this._onCancelSubscription = this.fileUploader.onCancelItem$.pipe(
      tap(i => this.toastr.warning(`${i} canceled!`))
    ).subscribe();

  }

  get uploader(): FileUploader {
    return this.fileUploader.uploader;
  }

  public openInfoModal(): void {
    const initialState = {
      fileUploader: this.fileUploader.uploader
    } as FileUploadModalState;
    this.modalService.show(FileUploadModalComponent, {initialState});
  }

  ngOnDestroy(): void {
    this._onSuccessSubscription.unsubscribe();
    this._onCancelSubscription.unsubscribe();
    this._onErrorSubscription.unsubscribe();
  }

  get currentRoute(): string {
    return this.router.url;
  }
}
