import { Directive, EventEmitter, ElementRef, Input, HostListener, Output } from '@angular/core';

import { FileUploader } from './file-uploader.class';

@Directive({ selector: '[ng2FileSelect]' })
export class FileSelectDirective {

  private _uploader: FileUploader;
  private _onFileSelected: EventEmitter<File[]> = new EventEmitter<File[]>();

  protected element: ElementRef;

  public constructor(element: ElementRef) {
    this.element = element;
  }

  public getOptions(): any {
    return this._uploader.getOptions();
  }

  public getFilters(): any {
    return {};
  }

  public isEmptyAfterSelection(): boolean {
    return !!this.element.nativeElement.attributes.multiple;
  }

  @Input()
  set uploader(value: FileUploader) {
    this._uploader = value;
  }

  @Output()
  get onFileSelected(): EventEmitter<File[]> {
    return this._onFileSelected;
  }

  private performUpload(files: File[]): void {
    const options = this.getOptions();
    const filters = this.getFilters();
    this._uploader.addToQueue(files, options, filters);
    this._onFileSelected.emit(files);
    if (this.isEmptyAfterSelection()) {
      this.element.nativeElement.value = '';
    }
  }

  @HostListener('change')
  public onChange(): any {
    const files = this.element.nativeElement.files;
    this.performUpload(files);
  }
}
