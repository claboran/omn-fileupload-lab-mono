module.exports = {
  name: 'file-upload-lib',
  preset: '../../jest.config.js',
  coverageDirectory: '../../coverage/libs/file-upload-lib',
  snapshotSerializers: [
    'jest-preset-angular/AngularSnapshotSerializer.js',
    'jest-preset-angular/HTMLCommentSerializer.js'
  ]
};
