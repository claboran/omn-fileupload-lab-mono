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


/**
 * Read a File based on HTML5 FileSystemEntry
 * does not work for Safari and IE
 * @param fsFileEntry
 */
const readFileAsync = (fsFileEntry: FileSystemFileEntry): Promise<File | FileError> => {
  return new Promise<File>((resolve, reject) => {
    fsFileEntry.file(file => {
        resolve(file);
      }, error => {
        reject(error);
      });
  });
};

/**
 * Read all entries - files and directories
 * does not work for Safari and IE
 * @param fsDirectoryReader
 */
const readDirectoryAsync = (fsDirectoryReader: FileSystemDirectoryReader): Promise<FileSystemEntry[]> => {
  return new Promise<FileSystemEntry[]>(resolve => {
    fsDirectoryReader.readEntries((result: FileSystemEntry[]) => {
      resolve(result);
    });
  });
};

/**
 * Converts a list of DataTransferItems into a list FileSystemEntries
 * does not work for Safari and IE
 * @param list
 */
export const dataTransferItemArray2FileSystemEntry = (list: DataTransferItem[]) =>
  list.map(item => item.webkitGetAsEntry() as FileSystemEntry);

/**
 * Converts a DataTransferItemList into a more useful format
 * @param dtiList
 */
export const dataTransferItemList2Array = (dtiList: DataTransferItemList): DataTransferItem[] => {
  const dtList: DataTransferItem[] = [];
  for (let i = 0; i < dtiList.length; i++) {
    dtList.push(dtiList[i]);
  }
  return dtList;
};
/**
 * Read a file from FileSystemEntry
 * does not work for Safari and IE
 * @param item
 */
export const getFileFromFileSystemFileEntry = (item: FileSystemFileEntry): Promise<File> => {
  return new Promise<File>(resolve => {
    readFileAsync(item).then((f: File) => {
      resolve(f);
    });
  });
};


/**
 * Check if we have reached the breakout criteria and we gathered recursively
 * all files and directories of the tree
 *
 * @param numberOfExpectedFileEntries
 * @param numberOfReceivedFileEntries
 * @param numberOfExpectedDirectories
 * @param numberOfReceivedDirectories
 */
const checkIfResolve = (
  numberOfExpectedFileEntries: number,
  numberOfReceivedFileEntries: number,
  numberOfExpectedDirectories: number,
  numberOfReceivedDirectories: number,
) =>
  numberOfReceivedFileEntries === numberOfExpectedFileEntries
  && numberOfReceivedDirectories === numberOfExpectedDirectories;


/**
 * This is the main parsing function for a toplevel directory -
 * traversing of directory trees.
 * does not work for Safari and IE
 * @param item
 */
export const getFilesFromFileSystemDirectoryEntry = (item: FileSystemDirectoryEntry): Promise<File[]> => {
  let numberOfExpectedFileEntries = 0;
  let numberOfReceivedFileEntries = 0;
  let numberOfExpectedDirectories = 0;
  let numberOfReceivedDirectories = 0;
  let entries: File[] = [];

  return new Promise<File[]>(resolve => {
    readDirectoryAsync(item.createReader()).then((result: FileSystemEntry[]) => {
      numberOfExpectedFileEntries = result.filter(f => f.isFile).length; // count files
      numberOfExpectedDirectories = result.filter(f => f.isDirectory).length; // count directories
      result.forEach((e: FileSystemEntry) => {
        if(e.isFile) {
          readFileAsync(e as FileSystemFileEntry).then((f: File) => {
            entries.push(f);
            numberOfReceivedFileEntries++;
            if (checkIfResolve(
              numberOfExpectedFileEntries,
              numberOfReceivedFileEntries,
              numberOfExpectedDirectories,
              numberOfReceivedDirectories
            )) {
              resolve(entries);
            }
          });
        } else {
          //is Directory - what else
          getFilesFromFileSystemDirectoryEntry(e as FileSystemDirectoryEntry).then((files: File[]) => {
            entries = [...entries, ...files];
            numberOfReceivedDirectories++;
            if (checkIfResolve(
              numberOfExpectedFileEntries,
              numberOfReceivedFileEntries,
              numberOfExpectedDirectories,
              numberOfReceivedDirectories
            )) {
              resolve(entries);
            }
          });
        }
      });
    });
  });
};
