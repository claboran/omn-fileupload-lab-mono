module.exports = {
  name: 'omn-file-up-lab',
  preset: '../../jest.config.js',
  coverageDirectory: '../../coverage/apps/omn-file-up-lab',
  snapshotSerializers: [
    'jest-preset-angular/AngularSnapshotSerializer.js',
    'jest-preset-angular/HTMLCommentSerializer.js'
  ]
};
