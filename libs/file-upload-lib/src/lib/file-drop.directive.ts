import { Directive, EventEmitter, ElementRef, HostListener, Input, Output } from '@angular/core';

import { FileUploader, FileUploaderOptions } from './file-uploader.class';
import { FileSystemEntry} from './dom.types';
import { containsDirectory, getDirectoryEntries } from './fs-utils';


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

  private canGetAsEntry(item: any): item is DataTransferItem {
    return !!item.webkitGetAsEntry;
  }

  private checkType(files: FileList | DataTransferItemList): void {
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      let entry: FileSystemEntry | null = null;
      if (this.canGetAsEntry(file)) {
        entry = file.webkitGetAsEntry();
      }
      if (!entry) {
        if (file) {
          console.log(`It is not an webkit entry: ${(file as File).name}`);
        }
      } else { // it seems that we have webkit
        if (entry.isFile) {
          console.log(`Webkit entry file: ${entry.name}`);
        } else if (entry.isDirectory) {
          console.log(`Webkit entry directory: ${entry.name}`);
        }
      }
    }


  }

  @HostListener('drop', ['$event'])
  public onDrop(event: any): void {
    const transfer = this._getTransfer(event);
    if (!transfer) {
      return;
    }
    const options = this.getOptions();
    const filters = this.getFilters();
    let checkTransfer: FileList | DataTransferItemList;
    if (event.dataTransfer.items) { // We have DataTransferItemList
      checkTransfer = event.dataTransfer.items as DataTransferItemList;
      if (containsDirectory(checkTransfer)) {
        getDirectoryEntries(checkTransfer[0]).then(value => {
          console.log(`We have a length of ${value.length}`);
          this._uploader.addToQueue(value, options, filters);
          this._fileOver.emit(false);
          this._fileDrop.emit(value);
          this._preventAndStop(event);
        });
      }
      return;
    } else {
      checkTransfer = event.dataTransfer.files;
    }
    this.checkType(checkTransfer);
    this._uploader.addToQueue(transfer.files, options, filters);
    this._fileOver.emit(false);
    this._fileDrop.emit(transfer.files);
    this._preventAndStop(event);
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
