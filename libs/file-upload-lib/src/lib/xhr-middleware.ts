import { FileItem, IFileUploaderMiddleware } from '@omn-file-upload/file-upload-lib';

export const xhrTransportFn = (item: FileItem, fileUploader: IFileUploaderMiddleware): any => {
  const xhr = item._xhr = new XMLHttpRequest();
  let sendable: any;

  fileUploader._onBeforeUploadItem(item);

  if (typeof item._file.size !== 'number') {
    throw new TypeError('The file specified is no longer valid');
  }

  // Multipart Form is not always required
  if (!fileUploader.getOptions().disableMultipart) {
    sendable = new FormData();
    fileUploader._onBuildItemForm(item, sendable);

    sendable.append(item.alias, item._file, item.file.name);
  } else {
    sendable = fileUploader.getOptions().formatDataFunction(item);
  }

  xhr.upload.onprogress = (event: any) => {
    const progress = Math.round(event.lengthComputable ? event.loaded * 100 / event.total : 0);
    fileUploader._onProgressItem(item, progress);
  };

  xhr.onload = () => {
    const headers = fileUploader._parseHeaders(xhr.getAllResponseHeaders());
    const response = fileUploader._transformResponse(xhr.response, headers);

    if (fileUploader._isSuccessCode(xhr.status)) {
      fileUploader._onSuccessItem(item, response, xhr.status, headers);
    } else {
      fileUploader._onErrorItem(item, response, xhr.status, headers);
    }
    fileUploader._onCompleteItem(item, response, xhr.status, headers);
  };

  xhr.onerror = () => {
    const headers = fileUploader._parseHeaders(xhr.getAllResponseHeaders());
    const response = fileUploader._transformResponse(xhr.response, headers);
    fileUploader._onErrorItem(item, response, xhr.status, headers);
    fileUploader._onCompleteItem(item, response, xhr.status, headers);
  };

  xhr.onabort = () => {
    const headers = fileUploader._parseHeaders(xhr.getAllResponseHeaders());
    const response = fileUploader._transformResponse(xhr.response, headers);
    fileUploader._onCancelItem(item, response, xhr.status, headers);
    fileUploader._onCompleteItem(item, response, xhr.status, headers);
  };

  xhr.open(item.method, item.url, true);

  xhr.withCredentials = item.withCredentials;

  if (fileUploader.getOptions().headers) {
    for (const header of fileUploader.getOptions().headers) {
      xhr.setRequestHeader(header.name, header.value);
    }
  }
  if (item.headers.length) {
    for (const header of item.headers) {
      xhr.setRequestHeader(header.name, header.value);
    }
  }

  if (fileUploader.getAuthToken()) {
    xhr.setRequestHeader(fileUploader.getAuthTokenHeader(), fileUploader.getAuthToken());
  }

  xhr.onreadystatechange = function () {
    if (xhr.readyState === XMLHttpRequest.DONE) {
      fileUploader.getResponse().emit(xhr.responseText)
    }
  };

  if (fileUploader.getOptions().formatDataFunctionIsAsync) {
    sendable.then(
      (result: any) => xhr.send(JSON.stringify(result))
    );
  } else {
    xhr.send(sendable);
  }
  fileUploader._render();
};
