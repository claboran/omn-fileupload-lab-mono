import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import {CommonModule} from '@angular/common';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {ToastrModule} from 'ngx-toastr';
import { ModalModule, ProgressbarModule, TooltipModule } from 'ngx-bootstrap';
import { FileUploadLibModule } from '@omn-file-upload/file-upload-lib';
import { FileUploadModalComponent } from './file-upload-modal/file-upload-modal.component';
import { FileUploadInfoItemComponent } from './file-upload-modal/file-upload-info-item/file-upload-info-item.component';
import { FileDropComponent } from './file-drop/file-drop.component';
import { FileDropContainerComponent } from './file-drop/file-drop-container.component';
import { NavigateAwayComponent } from './navigate-away/navigate-away.component';

@NgModule({
  declarations: [
    AppComponent,
    FileUploadModalComponent,
    FileUploadInfoItemComponent,
    FileDropComponent,
    FileDropContainerComponent,
    NavigateAwayComponent,
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
    TooltipModule.forRoot()
  ],
  providers: [],
  bootstrap: [AppComponent],
  entryComponents: [FileUploadModalComponent]
})
export class AppModule { }
