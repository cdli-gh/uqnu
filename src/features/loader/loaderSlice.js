import { createSlice } from '@reduxjs/toolkit';

function logReducerData( message, state, action ){
  //
  console.log(message, JSON.parse(JSON.stringify(state)), action, action.payload)
  console.log(state.JTF)
};

export const loaderSlice = createSlice({
  name: 'loader',
  initialState: {
    fileDataMap: {},
    activeFileTab: 0,
    activeTextRow: 0,
    edit: null,
    dropzoneDrawerOpen: false,
    loadJTF: false,
  },
  reducers: {
    // Redux Toolkit allows us to write "mutating" logic in reducers. It
    // doesn't actually mutate the state because it uses the Immer library,
    // which detects changes to a "draft state" and produces a brand new
    // immutable state based off those changes.
    // 
    updateDataMap: (state, action) => {
    // onFileStreamEnd
    // DO NOT STORE FILES IN redux
    // https://stackoverflow.com/questions/61705940/best-way-to-store-file-objects-in-react-redux-store-files-upload-from-dropzone
        let { key, data } = action.payload;
        if ( data ){
            state.fileDataMap[key] = data;
        } else if (state.fileDataMap[key]) {
            delete state.fileDataMap[key];
        };
    },
    
    loadJTFStart: (state, action) => {
    // Mark JTF loading to editor as completed.
        state.loadJTF = true;
    },
    loadJTFCompleted: (state, action) => {
    // Mark JTF loading to editor as completed.
        state.loadJTF = false;
    },
    openDropzoneDrawer: (state, action) => {
     // onAddButtonClick
    },
    closeDropzoneDrawer: (state, action) => {
    // closeDropzoneDrawer
    },
    handleDropzoneChangeStatus: (state, action) => {
    // handleDropzoneChangeStatus
    },
    switchFileTab: (state, action) => {
    // onFileTabSwitch
        let { tab } = action.payload;
        if (tab!==state.activeFileTab){
            state.activeFileTab = tab;
            state.activeTextRow = 0;
            state.loadJTF = true;
        };
    },
    selectTextRow: (state, action) => {
    // onTextRowSelect
        let { row } = action.payload;
        if (row!==state.activeTextRow){
            state.activeTextRow = row;
            state.loadJTF = true;
        };
    },
    editText: (state, action) => {
    // onTextEdit
    },
    saveEdit2File: (state, action) => {
    // saveEdit2File
    },
    download: (state, action) => {
    // download
    },
    downloadFile: (state, action) => {
    // downloadFile
    },
    downloadAllFiles: (state, action) => {
    // downloadAllFiles
    },
    downloadCurrent: (state, action) => {
    // downloadCurrent
    },
  },
});

export const { 
  updateDataMap,
  loadJTFStart,
  loadJTFCompleted,
  openDropzoneDrawer,
  closeDropzoneDrawer,
  handleDropzoneChangeStatus,
  switchFileTab,
  selectTextRow,
  editText,
  saveEdit2File,
  download,
  downloadFile,
  downloadAllFiles,
  downloadCurrent,
  } = loaderSlice.actions;

export default loaderSlice.reducer;