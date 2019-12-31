import { Directive, EventEmitter, ElementRef, HostListener, Input, Output } from '@angular/core';

import { FileUploader, FileUploaderOptions } from './file-uploader.class';

@Directive({ selector: '[ng2FileDrop]' })
export class FileDropDirective {
  private _uploader: FileUploader;
  private _fileOver: EventEmitter<any> = new EventEmitter();
  private _fileDrop: EventEmitter<File[]> = new EventEmitter<File[]>();

  protected element: ElementRef;

  public constructor(element: ElementRef) {
    this.element = element;
  }

  public getOptions(): FileUploaderOptions {
    return this._uploader.getOptions();
  }

  public getFilters(): any {
    return {};
  }

  @HostListener('drop', [ '$event' ])
  public onDrop(event: any): void {
    const transfer = this._getTransfer(event);
    if (!transfer) {
      return;
    }

    const options = this.getOptions();
    const filters = this.getFilters();
    this._preventAndStop(event);
    this._uploader.addToQueue(transfer.files, options, filters);
    this._fileOver.emit(false);
    this._fileDrop.emit(transfer.files);
  }

  @HostListener('dragover', [ '$event' ])
  public onDragOver(event: any): void {
    const transfer = this._getTransfer(event);
    if (!this._haveFiles(transfer.types)) {
      return;
    }

    transfer.dropEffect = 'copy';
    this._preventAndStop(event);
    this._fileOver.emit(true);
  }

  @HostListener('dragleave', [ '$event' ])
  public onDragLeave(event: any): any {
    if ((this as any).element) {
      if (event.currentTarget === (this as any).element[ 0 ]) {
        return;
      }
    }

    this._preventAndStop(event);
    this._fileOver.emit(false);
  }

  protected _getTransfer(event: any): any {
    return event.dataTransfer ? event.dataTransfer : event.originalEvent.dataTransfer; // jQuery fix;
  }

  protected _preventAndStop(event: any): any {
    event.preventDefault();
    event.stopPropagation();
  }

  protected _haveFiles(types: any): any {
    if (!types) {
      return false;
    }

    if (types.indexOf) {
      return types.indexOf('Files') !== -1;
    } else if (types.contains) {
      return types.contains('Files');
    } else {
      return false;
    }
  }

  get uploader(): FileUploader {
    return this._uploader;
  }

  @Input()
  set uploader(value: FileUploader) {
    this._uploader = value;
  }

  @Output()
  get fileOver(): EventEmitter<any> {
    return this._fileOver;
  }

  @Output()
  get fileDrop(): EventEmitter<File[]> {
    return this._fileDrop;
  }
}
