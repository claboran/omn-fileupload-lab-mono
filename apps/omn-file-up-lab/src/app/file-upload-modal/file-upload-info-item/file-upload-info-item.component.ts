import { Component, Input, OnInit } from '@angular/core';
import { FileItem } from '@omn-file-upload/file-upload-lib';

@Component({
  selector: 'omn-file-upload-file-upload-info-item',
  templateUrl: './file-upload-info-item.component.html',
  styleUrls: ['./file-upload-info-item.component.scss']
})
export class FileUploadInfoItemComponent implements OnInit {

  private _item: FileItem;
  constructor() { }

  ngOnInit() {
  }

  @Input()
  set item(value: FileItem) {
    this._item = value;
  }

  get item(): FileItem {
    return this._item;
  }
}
