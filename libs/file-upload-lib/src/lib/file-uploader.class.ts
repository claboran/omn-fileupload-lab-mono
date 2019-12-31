import { EventEmitter } from '@angular/core';
import { FileLikeObject } from './file-like-object.class';
import { FileItem } from './file-item.class';
import { FileType } from './file-type.class';

function isFile(value: any): boolean {
  return (File && value instanceof File);
}

export interface Headers {
  name: string;
  value: string;
}

export interface ParsedResponseHeaders { [ headerFieldName: string ]: string }

export interface FilterFunction {
  name: string,
  fn: (item?: FileLikeObject, options?: FileUploaderOptions) => boolean
}

export interface FileUploaderOptions {
  allowedMimeType?: string[];
  allowedFileType?: string[];
  autoUpload?: boolean;
  isHTML5?: boolean;
  filters?: FilterFunction[];
  headers?: Headers[];
  method?: string;
  authToken?: string;
  maxFileSize?: number;
  queueLimit?: number;
  removeAfterUpload?: boolean;
  url?: string;
  disableMultipart?: boolean;
  itemAlias?: string;
  authTokenHeader?: string;
  additionalParameter?: { [ key: string ]: any };
  parametersBeforeFiles?: boolean;
  formatDataFunction?: Function;
  formatDataFunctionIsAsync?: boolean;
}
export interface IFileUploaderMiddleware {
  _onBeforeUploadItem(item: FileItem): void;
  _onBuildItemForm(item: FileItem, form: any);
  _onProgressItem(item: FileItem, progress: any): void;
  _parseHeaders(headers: string): ParsedResponseHeaders;
  _transformResponse(response: string, headers: ParsedResponseHeaders): string;
  _isSuccessCode(status: number): boolean;
  getOptions(): FileUploaderOptions;
  _onSuccessItem(item: FileItem, response: string, status: number, headers: ParsedResponseHeaders): void;
  _onErrorItem(item: FileItem, response: string, status: number, headers: ParsedResponseHeaders): void;
  _onCompleteItem(item: FileItem, response: string, status: number, headers: ParsedResponseHeaders): void;
  _onCancelItem(item: FileItem, response: string, status: number, headers: ParsedResponseHeaders): void;
  getAuthToken(): string;
  getAuthTokenHeader(): string;
  getResponse(): EventEmitter<any>;
  _render(): any;
}

export class FileUploader implements IFileUploaderMiddleware {

  private _authToken: string;
  public isUploading = false;
  public queue: FileItem[] = [];
  public progress = 0;
  public _nextIndex = 0;
  public autoUpload: any;
  private _authTokenHeader: string;
  private readonly _response: EventEmitter<any>;

  private _options: FileUploaderOptions = {
    autoUpload: false,
    isHTML5: true,
    filters: [],
    removeAfterUpload: false,
    disableMultipart: false,
    formatDataFunction: (item: FileItem) => item._file,
    formatDataFunctionIsAsync: false
  };

  protected _failFilterIndex: number;

  public constructor(options: FileUploaderOptions,
                     private fileUploaderMiddlewareFn: (item: FileItem, fileUploader: FileUploader) => any) {
    this.setOptions(options);
    this._response = new EventEmitter<any>();
  }

  public setOptions(options: FileUploaderOptions): void {
    this._options = Object.assign(this._options, options);

    this._authToken = this._options.authToken;
    this._authTokenHeader = this._options.authTokenHeader || 'Authorization';
    this.autoUpload = this._options.autoUpload;
    this._options.filters.unshift({ name: 'queueLimit', fn: this._queueLimitFilter });

    if (this._options.maxFileSize) {
      this._options.filters.unshift({ name: 'fileSize', fn: this._fileSizeFilter });
    }

    if (this._options.allowedFileType) {
      this._options.filters.unshift({ name: 'fileType', fn: this._fileTypeFilter });
    }

    if (this._options.allowedMimeType) {
      this._options.filters.unshift({ name: 'mimeType', fn: this._mimeTypeFilter });
    }

    for (let i = 0; i < this.queue.length; i++) {
      this.queue[ i ].url = this._options.url;
    }
  }

  public addToQueue(files: File[], options?: FileUploaderOptions, filters?: FilterFunction[] | string): void {
    const list: File[] = [];
    for (const file of files) {
      list.push(file);
    }
    const arrayOfFilters = this._getFilters(filters);
    const count = this.queue.length;
    const addedFileItems: FileItem[] = [];
    list.map((some: File) => {
      if (!options) {
        options = this._options;
      }

      const temp = new FileLikeObject(some);
      if (this._isValidFile(temp, arrayOfFilters, options)) {
        const fileItem = new FileItem(this, some, options);
        addedFileItems.push(fileItem);
        this.queue.push(fileItem);
        this._onAfterAddingFile(fileItem);
      } else {
        const filter = arrayOfFilters[ this._failFilterIndex ];
        this._onWhenAddingFileFailed(temp, filter, options);
      }
    });
    if (this.queue.length !== count) {
      this._onAfterAddingAll(addedFileItems);
      this.progress = this._getTotalProgress();
    }
    this._render();
    if (this._options.autoUpload) {
      this.uploadAll();
    }
  }

  public removeFromQueue(value: FileItem): void {
    const index = this.getIndexOfItem(value);
    const item = this.queue[ index ];
    if (item.isUploading) {
      item.cancel();
    }
    this.queue.splice(index, 1);
    this.progress = this._getTotalProgress();
  }

  public clearQueue(): void {
    while (this.queue.length) {
      this.queue[ 0 ].remove();
    }
    this.progress = 0;
  }

  public uploadItem(value: FileItem): void {
    const index = this.getIndexOfItem(value);
    const item = this.queue[ index ];
    const transport = this._options.isHTML5 ? '_xhrTransport' : '_iframeTransport';
    item._prepareToUploading();
    if (this.isUploading) {
      return;
    }
    this.isUploading = true;
    // (this as any)[ transport ](item);
    this.fileUploaderMiddlewareFn(item, this);
  }

  public cancelItem(value: FileItem): void {
    const index = this.getIndexOfItem(value);
    const item = this.queue[ index ];
    const prop = this._options.isHTML5 ? item._xhr : item._form;
    if (item && item.isUploading) {
      prop.abort();
    }
  }

  public uploadAll(): void {
    const items = this.getNotUploadedItems().filter((item: FileItem) => !item.isUploading);
    if (!items.length) {
      return;
    }
    items.map((item: FileItem) => item._prepareToUploading());
    items[ 0 ].upload();
  }

  public cancelAll(): void {
    const items = this.getNotUploadedItems();
    items.map((item: FileItem) => item.cancel());
  }

  public isFile(value: any): boolean {
    return isFile(value);
  }

  public isFileLikeObject(value: any): boolean {
    return value instanceof FileLikeObject;
  }

  public getIndexOfItem(value: any): number {
    return typeof value === 'number' ? value : this.queue.indexOf(value);
  }

  public getNotUploadedItems(): any[] {
    return this.queue.filter((item: FileItem) => !item.isUploaded);
  }

  public getReadyItems(): any[] {
    return this.queue
      .filter((item: FileItem) => (item.isReady && !item.isUploading))
      .sort((item1: any, item2: any) => item1.index - item2.index);
  }

  public destroy(): void {
    return void 0;
  }

  public onAfterAddingAll(fileItems: any): any {
    return { fileItems };
  }

  public onBuildItemForm(fileItem: FileItem, form: any): any {
    return { fileItem, form };
  }

  public onAfterAddingFile(fileItem: FileItem): any {
    return { fileItem };
  }

  public onWhenAddingFileFailed(item: FileLikeObject, filter: any, options: any): any {
    return { item, filter, options };
  }

  public onBeforeUploadItem(fileItem: FileItem): any {
    return { fileItem };
  }

  public onProgressItem(fileItem: FileItem, progress: any): any {
    return { fileItem, progress };
  }

  public onProgressAll(progress: any): any {
    return { progress };
  }

  public onSuccessItem(item: FileItem, response: string, status: number, headers: ParsedResponseHeaders): any {
    return { item, response, status, headers };
  }

  public onErrorItem(item: FileItem, response: string, status: number, headers: ParsedResponseHeaders): any {
    return { item, response, status, headers };
  }

  public onCancelItem(item: FileItem, response: string, status: number, headers: ParsedResponseHeaders): any {
    return { item, response, status, headers };
  }

  public onCompleteItem(item: FileItem, response: string, status: number, headers: ParsedResponseHeaders): any {
    return { item, response, status, headers };
  }

  public onCompleteAll(): any {
    return void 0;
  }

  public _mimeTypeFilter(item: FileLikeObject): boolean {
    return !(this._options.allowedMimeType && this._options.allowedMimeType.indexOf(item.type) === -1);
  }

  public _fileSizeFilter(item: FileLikeObject): boolean {
    return !(this._options.maxFileSize && item.size > this._options.maxFileSize);
  }

  public _fileTypeFilter(item: FileLikeObject): boolean {
    return !(this._options.allowedFileType &&
      this._options.allowedFileType.indexOf(FileType.getMimeClass(item)) === -1);
  }

  public _onErrorItem(item: FileItem, response: string, status: number, headers: ParsedResponseHeaders): void {
    item._onError(response, status, headers);
    this.onErrorItem(item, response, status, headers);
  }

  public _onCompleteItem(item: FileItem, response: string, status: number, headers: ParsedResponseHeaders): void {
    item._onComplete(response, status, headers);
    this.onCompleteItem(item, response, status, headers);
    const nextItem = this.getReadyItems()[ 0 ];
    this.isUploading = false;
    if (nextItem) {
      nextItem.upload();
      return;
    }
    this.onCompleteAll();
    this.progress = this._getTotalProgress();
    this._render();
  }

  protected _headersGetter(parsedHeaders: ParsedResponseHeaders): any {
    return (name: any): any => {
      if (name) {
        return parsedHeaders[ name.toLowerCase() ] || void 0;
      }
      return parsedHeaders;
    };
  }

  // protected _xhrTransport(item: FileItem): any {
  //   const that = this;
  //   const xhr = item._xhr = new XMLHttpRequest();
  //   let sendable: any;
  //   this._onBeforeUploadItem(item);
  //
  //   if (typeof item._file.size !== 'number') {
  //     throw new TypeError('The file specified is no longer valid');
  //   }
  //   if (!this._options.disableMultipart) {
  //     sendable = new FormData();
  //     this._onBuildItemForm(item, sendable);
  //
  //     const appendFile = () => sendable.append(item.alias, item._file, item.file.name);
  //     if (!this._options.parametersBeforeFiles) {
  //       appendFile();
  //     }
  //
  //     // For AWS, Additional Parameters must come BEFORE Files
  //     if (this._options.additionalParameter !== undefined) {
  //       Object.keys(this._options.additionalParameter).forEach((key: string) => {
  //         let paramVal = this._options.additionalParameter[ key ];
  //         // Allow an additional parameter to include the filename
  //         if (typeof paramVal === 'string' && paramVal.indexOf('{{file_name}}') >= 0) {
  //           paramVal = paramVal.replace('{{file_name}}', item.file.name);
  //         }
  //         sendable.append(key, paramVal);
  //       });
  //     }
  //
  //     if (this._options.parametersBeforeFiles) {
  //       appendFile();
  //     }
  //   } else {
  //     sendable = this._options.formatDataFunction(item);
  //   }
  //
  //   xhr.upload.onprogress = (event: any) => {
  //     const progress = Math.round(event.lengthComputable ? event.loaded * 100 / event.total : 0);
  //     this._onProgressItem(item, progress);
  //   };
  //   xhr.onload = () => {
  //     const headers = this._parseHeaders(xhr.getAllResponseHeaders());
  //     const response = this._transformResponse(xhr.response, headers);
  //     const gist = this._isSuccessCode(xhr.status) ? 'Success' : 'Error';
  //     const method = '_on' + gist + 'Item';
  //     (this as any)[ method ](item, response, xhr.status, headers);
  //     this._onCompleteItem(item, response, xhr.status, headers);
  //   };
  //   xhr.onerror = () => {
  //     const headers = this._parseHeaders(xhr.getAllResponseHeaders());
  //     const response = this._transformResponse(xhr.response, headers);
  //     this._onErrorItem(item, response, xhr.status, headers);
  //     this._onCompleteItem(item, response, xhr.status, headers);
  //   };
  //   xhr.onabort = () => {
  //     const headers = this._parseHeaders(xhr.getAllResponseHeaders());
  //     const response = this._transformResponse(xhr.response, headers);
  //     this._onCancelItem(item, response, xhr.status, headers);
  //     this._onCompleteItem(item, response, xhr.status, headers);
  //   };
  //   xhr.open(item.method, item.url, true);
  //   xhr.withCredentials = item.withCredentials;
  //   if (this._options.headers) {
  //     for (const header of this._options.headers) {
  //       xhr.setRequestHeader(header.name, header.value);
  //     }
  //   }
  //   if (item.headers.length) {
  //     for (const header of item.headers) {
  //       xhr.setRequestHeader(header.name, header.value);
  //     }
  //   }
  //   if (this._authToken) {
  //     xhr.setRequestHeader(this._authTokenHeader, this._authToken);
  //   }
  //   xhr.onreadystatechange = function () {
  //     if (xhr.readyState === XMLHttpRequest.DONE) {
  //       that._response.emit(xhr.responseText)
  //     }
  //   };
  //
  //   if (this._options.formatDataFunctionIsAsync) {
  //     sendable.then(
  //       (result: any) => xhr.send(JSON.stringify(result))
  //     );
  //   } else {
  //     xhr.send(sendable);
  //   }
  //   this._render();
  // }

  protected _getTotalProgress(value: number = 0): number {
    if (this._options.removeAfterUpload) {
      return value;
    }
    const notUploaded = this.getNotUploadedItems().length;
    const uploaded = notUploaded ? this.queue.length - notUploaded : this.queue.length;
    const ratio = 100 / this.queue.length;
    const current = value * ratio / 100;
    return Math.round(uploaded * ratio + current);
  }

  protected _getFilters(filters: FilterFunction[] | string): FilterFunction[] {
    if (!filters) {
      return this._options.filters;
    }
    if (Array.isArray(filters)) {
      return filters;
    }
    if (typeof filters === 'string') {
      const names = filters.match(/[^\s,]+/g);
      return this._options.filters
        .filter((filter: any) => names.indexOf(filter.name) !== -1);
    }
    return this._options.filters;
  }

  public _render(): any {
    return void 0;
  }

  protected _queueLimitFilter(): boolean {
    return this._options.queueLimit === undefined || this.queue.length < this._options.queueLimit;
  }

  protected _isValidFile(file: FileLikeObject, filters: FilterFunction[], options: FileUploaderOptions): boolean {
    this._failFilterIndex = -1;
    return !filters.length ? true : filters.every((filter: FilterFunction) => {
      this._failFilterIndex++;
      return filter.fn.call(this, file, options);
    });
  }

  public _isSuccessCode(status: number): boolean {
    return (status >= 200 && status < 300) || status === 304;
  }

  public _transformResponse(response: string, headers: ParsedResponseHeaders): string {
    return response;
  }

  public _parseHeaders(headers: string): ParsedResponseHeaders {
    const parsed: any = {};
    let key: any;
    let val: any;
    let i: any;
    if (!headers) {
      return parsed;
    }
    headers.split('\n').map((line: any) => {
      i = line.indexOf(':');
      key = line.slice(0, i).trim().toLowerCase();
      val = line.slice(i + 1).trim();
      if (key) {
        parsed[ key ] = parsed[ key ] ? parsed[ key ] + ', ' + val : val;
      }
    });
    return parsed;
  }

  protected _onWhenAddingFileFailed(item: FileLikeObject, filter: any, options: any): void {
    this.onWhenAddingFileFailed(item, filter, options);
  }

  protected _onAfterAddingFile(item: FileItem): void {
    this.onAfterAddingFile(item);
  }

  protected _onAfterAddingAll(items: any): void {
    this.onAfterAddingAll(items);
  }

  public _onBeforeUploadItem(item: FileItem): void {
    item._onBeforeUpload();
    this.onBeforeUploadItem(item);
  }

  public _onBuildItemForm(item: FileItem, form: any): void {
    item._onBuildForm(form);
    this.onBuildItemForm(item, form);
  }

  public _onProgressItem(item: FileItem, progress: any): void {
    const total = this._getTotalProgress(progress);
    this.progress = total;
    item._onProgress(progress);
    this.onProgressItem(item, progress);
    this.onProgressAll(total);
    this._render();
  }

  public _onSuccessItem(item: FileItem, response: string, status: number, headers: ParsedResponseHeaders): void {
    item._onSuccess(response, status, headers);
    this.onSuccessItem(item, response, status, headers);
  }

  public _onCancelItem(item: FileItem, response: string, status: number, headers: ParsedResponseHeaders): void {
    item._onCancel(response, status, headers);
    this.onCancelItem(item, response, status, headers);
  }

  getOptions(): FileUploaderOptions {
    return this._options;
  }

  getAuthToken(): string {
    return this._authToken;
  }

  getAuthTokenHeader(): string {
    return this._authTokenHeader;
  }

  getResponse(): EventEmitter<any> {
    return this._response;
  }
}
