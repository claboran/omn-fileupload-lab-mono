import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import {CommonModule} from '@angular/common';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {ToastrModule} from 'ngx-toastr';
import { ModalModule, ProgressbarModule } from 'ngx-bootstrap';
import { FileUploadLibModule } from '@omn-file-upload/file-upload-lib';
import { FileUploadModalComponent } from './file-upload-modal/file-upload-modal.component';
import { FileUploadInfoItemComponent } from './file-upload-modal/file-upload-info-item/file-upload-info-item.component';

@NgModule({
  declarations: [
    AppComponent,
    FileUploadModalComponent,
    FileUploadInfoItemComponent,
  ],
  imports: [
    CommonModule,
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    FileUploadLibModule,
    ToastrModule.forRoot(),
    ProgressbarModule.forRoot(),
    ModalModule.forRoot(),
  ],
  providers: [],
  bootstrap: [AppComponent],
  entryComponents: [FileUploadModalComponent]
})
export class AppModule { }
