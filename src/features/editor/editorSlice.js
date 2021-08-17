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
    cursor: null, // jtf element
    selected: [], //array of selected jtf elements
    zoom: 100,
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
    setCursor: (state, action) => {
    //
      if (state.cursor && state.cursor.id){
          // update jtf after edit
          let idsArray = state.cursor.id.split('__')[1].split('_');
          let obj_id = idsArray.shift();
          let obj = state.JTF.objects[obj_id]
          let el = obj;
          idsArray.forEach( (id, i) => {
              let parentEl = el;
              el = parentEl.children[id];
              if ( idsArray.length===i+1 ){
                  parentEl.children[id] = state.cursor;
                  state.JTF.objects[obj_id] = obj;
              };
          });
      };
      state.cursor = action.payload.cursor;
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
    changeZoom: (state, action) => {
      //
      state.zoom = action.payload.zoom;
    },
  },
});

export const selectActions = state => { 
  console.log(state); return state.editor.actions.join(', ');
}; //state.element.value;

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
  setCursor,
  atCursor,
  activate,
  modify,
  add,
  remove,
  undo,
  redo,
  changeZoom,
  } = editorSlice.actions;

export default editorSlice.reducer;