import { configureStore } from '@reduxjs/toolkit';
//import counterReducer from '../features/counter/counterSlice';
import editorReducer from '../features/editor/editorSlice';
import loaderReducer from '../features/loader/loaderSlice';

export default configureStore({
  reducer: {
    //counter: counterReducer,
    editor: editorReducer,
    loader: loaderReducer,
  },
});
