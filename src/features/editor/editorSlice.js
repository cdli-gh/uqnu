import { createSlice } from '@reduxjs/toolkit';

function logReducerData( message, state, action ){
  //
  console.log(message, JSON.parse(JSON.stringify(state)), action, action.payload)
  console.log(state.JTF)
};

export const editorSlice = createSlice({
  name: 'editor',
  initialState: {
    JTF: null,
    actions: [],
    actionsRedo: [],
    uselessAttr: 'initial useless',
  },
  reducers: {
    // Redux Toolkit allows us to write "mutating" logic in reducers. It
    // doesn't actually mutate the state because it uses the Immer library,
    // which detects changes to a "draft state" and produces a brand new
    // immutable state based off those changes
    load: (state, action) => {
    //
      state.actions.push( 'load' )
      console.log( ' ...loading... ', action.payload )
      state.JTF = action.payload;
      state.actionsRedo = [];
    },
    activate: (state, action) => {
    //
      state.actions.push( 'activate' )
    },
    modify: (state, action) => {
      //state.value += 1;
      logReducerData('modify clicked', state, action);
      state.actions.push( 'modify' );
      state.actionsRedo = [];
    },
    add: (state, action) => {
      //state.value -= 1;
      logReducerData('add clicked', state, action);
      state.actions.push( 'add' );
      state.actionsRedo = [];
    },
    remove: (state, action) => {
      //state.value += action.payload;
      logReducerData('remove clicked', state, action);
      state.actions.push( 'remove' );
	  state.actionsRedo = [];
    },
    undo: (state, action) => {
      //state.value += action.payload;
      logReducerData('undo clicked', state, action);
      if ( state.actions.length > 0 ){
        state.actionsRedo.push(state.actions.pop());
	  };
    },
    redo: (state, action) => {
      //state.value += action.payload;
      logReducerData('redo clicked', state, action);
	  if ( state.actionsRedo.length > 0 ){
        state.actions.push(state.actionsRedo.pop());
	  };
    },
  },
});

export const selectActions = state => { console.log(state); return state.editor.actions.join(', ') }//state.element.value;

export const loadAsync = ObjPromise => dispatch => {
  //
  Promise.resolve(ObjPromise).then( result => {
      console.log('ive waited long for this', result)
      if (result.JTFResponse.success){ 
        dispatch(load( result.JTFResponse.JTF ));
      };
  });
};

export const { 
  load,
  activate,
  modify,
  add,
  remove,
  undo,
  redo,
  } = editorSlice.actions;

export default editorSlice.reducer;