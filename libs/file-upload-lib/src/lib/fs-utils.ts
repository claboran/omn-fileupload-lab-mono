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

export const containsDirectory = (dtiList: DataTransferItemList): boolean => {
  let hasDirectory = false;
  for (let i = 0; i < dtiList.length; i++) {
    if ((dtiList[i].webkitGetAsEntry() as FileSystemEntry).isDirectory) {
      hasDirectory = true;
    }
  }
  return hasDirectory;
};

export const getDirectoryEntries = (item: DataTransferItem): Promise<File[]> => {
  let numberOfExpectedEntries = 0;
  let numberOfReceivedEntries = 0;
  const fsEntry = item.webkitGetAsEntry() as FileSystemEntry;
  const dirReader = (fsEntry as FileSystemDirectoryEntry).createReader();
  const entries: File[] = [];

  return new Promise<File[]>(resolve => {
    readDirectoryAsync(dirReader).then((result: FileSystemFileEntry[]) => {
      numberOfExpectedEntries = result.length;
      result.forEach((e: FileSystemFileEntry) => {
        console.log(`FileSystemFileEntry: ${e.name}`);
        readFileAsync(e).then((f: File) => {
          console.log(`File: ${f.name}`);
          entries.push(f);
          numberOfReceivedEntries++;
          if (numberOfReceivedEntries === numberOfExpectedEntries) {
            resolve(entries);
          }
        });
      });
    })});
};
