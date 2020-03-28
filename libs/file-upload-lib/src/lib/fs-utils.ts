import {
  FileError,
  FileSystemDirectoryEntry,
  FileSystemDirectoryReader,
  FileSystemEntry,
  FileSystemFileEntry
} from './dom.types';

export interface FileWrapper {
  hasError: boolean;
  file?: File;
  error?: DOMError;
}

/**
 * Check if we could get a DataTransferItemList
 * Safari does not have DataTransferItemList!
 * @param dataTransfer
 */
export const supportDataTransferItem = (dataTransfer: DataTransfer): boolean => !!dataTransfer.items;


const readFileAsync = (fsFileEntry: FileSystemFileEntry): Promise<File | FileError> => {
  return new Promise<File>((resolve, reject) => {
    fsFileEntry.file(file => {
        resolve(file);
      }, error => {
        reject(error);
      });
  });
};

const readDirectoryAsync = (fsDirectoryReader: FileSystemDirectoryReader): Promise<FileSystemFileEntry[]> => {
  return new Promise<FileSystemFileEntry[]>(resolve => {
    fsDirectoryReader.readEntries((result: FileSystemFileEntry[]) => {
      resolve(result);
    });
  });
};

export const dataTransferItemArray2FileSystemEntry = (list: DataTransferItem[]) =>
  list.map(item => item.webkitGetAsEntry() as FileSystemEntry);

export const dataTransferItemList2Array = (dtiList: DataTransferItemList): DataTransferItem[] => {
  const dtList: DataTransferItem[] = [];
  for (let i = 0; i < dtiList.length; i++) {
    dtList.push(dtiList[i]);
  }
  return dtList;
};

export const getFileFromFileSystemFileEntry = (item: FileSystemFileEntry): Promise<File> => {
  return new Promise<File>(resolve => {
    readFileAsync(item).then((f: File) => {
      resolve(f);
    });
  });
};

export const getFilesFromFileSystemDirectoryEntry = (item: FileSystemDirectoryEntry): Promise<File[]> => {
  let numberOfExpectedEntries = 0;
  let numberOfReceivedEntries = 0;
  const entries: File[] = [];
  return new Promise<File[]>(resolve => {
    readDirectoryAsync(item.createReader()).then((result: FileSystemFileEntry[]) => {
      numberOfExpectedEntries = result.length;
      result.forEach((e: FileSystemFileEntry) => {
        readFileAsync(e).then((f: File) => {
          entries.push(f);
          numberOfReceivedEntries++;
          if (numberOfReceivedEntries === numberOfExpectedEntries) {
            resolve(entries);
          }
        });
      });
    });
  });
};
