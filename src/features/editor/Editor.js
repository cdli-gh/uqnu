import React, { useState, Component } from 'react';
import { useSelector, useDispatch, connect, mapDispatchToProp } from 'react-redux';
import {
  selectActions,
  activate,
  modify,
  add,
  remove,
  undo,
  redo,
} from './editorSlice';

import { Chr, ChrEditPanel } from './ChrComponent';

import styles from './Editor.module.css';

import Collapse from '@material-ui/core/Collapse';
import IconButton from '@material-ui/core/IconButton';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import ArrowDropUpIcon from '@material-ui/icons/ArrowDropUp';

export function Editor( ) {
  //
  const actions = useSelector(selectActions);
  const dispatch = useDispatch();
  const [incrementAmount, setIncrementAmount] = useState('2');
  
  return (
    <JTFEditor/>
  );

/*   return (
  <div>
    <JTFEditor/>
    <span>[ { actions } ]</span>
    <br/>
    <button
      aria-label="Add value"
      onClick={() => dispatch(add('some data'))}
    >
      Add
    </button>
    <button
      aria-label="Remove value"
      onClick={() => dispatch(remove(null))}
    >
      Remove
    </button>
    <button
      aria-label="Modify value"
      onClick={() => dispatch(modify( 'some changed data' ))}
    >
      Modify
    </button>
    <br/>
    <button
      aria-label="Undo"
      onClick={() => dispatch(undo( 'some changed data' ))}
    >
      Undo
    </button>
    <button
      aria-label="Redo"
      onClick={() => dispatch(redo( 'some changed data' ))}
    >
      Redo
    </button>
  </div>
  ); */
};

function romanize( num ) {
  //
  var lookup = {M:1000,CM:900,D:500,CD:400,C:100,XC:90,L:50,XL:40,X:10,IX:9,V:5,IV:4,I:1},roman = '',i;
  for ( i in lookup ) {
    while ( num >= lookup[i] ) {
      roman += i;
      num -= lookup[i];
    }
  }
  return roman;
}

class _JTFEditor extends Component {
  // Component's function
  constructor(props) {
    super(props);
    this.state = {
      layout: 'vertical',
      collapsed: {},
    };
  };
  
  
  collapsableChildren( obj, id, classes ){
    //
    return (
    <Collapse
     in={!this.state.collapsed[id]}
     timeout="auto" 
     unmountOnExit
     className={classes}
    >
    { this.renderChildren(obj) }
    </Collapse>
    );
  };
  
  collapseIcon( id ){
    //
    let {collapsed} = this.state;
    let toggle = (e) => {
      if (!collapsed[id]){ 
        collapsed[id] = true;
      } else {  
        delete collapsed[id];
      }
      this.setState( {collapsed: collapsed} )
    };
    
    let Icon = (!collapsed[id]) ? ArrowDropDownIcon : ArrowDropUpIcon ;
    let stateClass = (!collapsed[id]) ? 'expanded' : 'collapsed' ;
    let iconClasses = this.makeClasses(['collapsableTreeIcon', stateClass]);
    
    return (
     <Icon 
      className={iconClasses}
      onClick={ toggle }
     />
     );
  };
  
  makeClasses( classesArray ){
    // ClassName string from array of strings.
    // Adds layout state param from.
    let { layout } = this.state;
    return [ ...classesArray, layout ]
      .map(CN => styles[CN])
      .join(' ')
  };
  
  renderObject( obj ){
    //  
    let rootClasses = this.makeClasses(['object', 'root']);
    let labelClasses = this.makeClasses(['object', 'label']);
    let contentClasses = this.makeClasses(['object', 'content']);
    return( 
    <div className={rootClasses}>
      { this.collapseIcon( obj.id ) }
      <span className={labelClasses}>
      { (obj.name) ? `${obj.type} ${obj.name}` : obj.type }
      </span>
      { this.collapsableChildren( obj, obj.id, contentClasses ) }
    </div>
    )
  };
  
  renderChildren( obj ){
    //
    if ( !obj.children ){
      return null;
    }
    return obj.children.map( (child, i ) => {
      if (!child._class){
          console.log( 'rendering error: no _class', child )
          return null
      }
      let classCap = child._class.charAt(0).toUpperCase() + child._class.slice(1)
      let renderMethod = this[`render${classCap}`];
      if ( renderMethod ){
        renderMethod = renderMethod.bind( this );
        return renderMethod( child, obj, i );
      } else {
        console.log( 'missing render method for JTF class:', classCap, child );
      }
    });
  };
  
  interBreakClasses( obj, parentObj, i){
    // returns a list of classes to apply to whitespaces 
    // that gap between broken / damaged sequences.
    let classes = [];
    if ( 
         parentObj 
      && parentObj.children 
      && parentObj.children[i+1]
      && parentObj.children[i+1].children
      && parentObj.children[i+1].children[0]
      && parentObj.children[i+1].children[0].damage
      && obj
      && obj.children
      && obj.children[0]
      && ( obj.children[0].damage || obj.children[0].broken )
    ){
        let first = (obj.children[0].damage===true) ? 'brk' : 'dmg';
        let second = (parentObj.children[i+1].children[0].damage===true) 
          ? 'brk' 
          : 'dmg'
        classes = (first!==second) ? [ first, second ] : [ first ];
    };
    return classes;
  };
  
  /* Structure elements */
  
  renderSurface( obj, parentObj, i ){
    //
    let { id } = obj; //ToDo: add functionality for cases when ID changes
    let last = (parentObj.children.length===i+1);
    let rootClassNames = ['surface', 'root'];
    if ( obj.children.map( o => o._class).includes('line') ){
      rootClassNames.push( 'inlineContainer' )
    };
    let rootClasses = this.makeClasses(rootClassNames);
    let labelClasses = this.makeClasses(['surface', 'label']);
    let contentClasses = this.makeClasses(['surface', 'content']);
    let TCClasses = this.makeClasses(['surface', 'treeConnection']);
    let TCOClasses = this.makeClasses(['surface', 'treeConnectionOverlay']);
    
    return( 
    <div className={rootClasses}>
      <div className={TCClasses}/>
      { ( last ) ? <div className={TCOClasses}/> : '' }
      { this.collapseIcon( id ) }
      <span className={labelClasses}> 
      { (obj.name) ? `${obj.type} ${obj.name}` : obj.type }
      </span>
      { this.collapsableChildren( obj, id, contentClasses ) }
    </div>
    )
  };
  
  renderColumn( obj, parentObj, i ){
    //  
    let name = obj.name.replace("'", '');
    let last = (parentObj.children.length===i+1);
    let breaks = (obj.name.match(/'/g)||[]).length;
    let { id } = obj; //ToDo: add functionality for cases when ID changes
    let rootClasses = this.makeClasses(['column', 'root']);
    let labelClasses = this.makeClasses(['column', 'label']);
    let contentClasses = this.makeClasses(['column', 'content']);
    let TCClasses = this.makeClasses(['column', 'treeConnection']);
    let TCOClasses = this.makeClasses(['column', 'treeConnectionOverlay']);

    return( 
      <div
       className={ rootClasses }
      >
       <div className={TCClasses}/>
       { ( last ) ? <div className={TCOClasses}/> : '' }
       { this.collapseIcon( id ) }
       <span className={labelClasses}
       >
         Column {romanize(name)}{"'".repeat(breaks)}
       </span>
       {this.collapsableChildren( obj, id, contentClasses )}
      </div>
    );
  };
  
  /* Line-level elements */
  
  renderComment( obj, parentObj, i ){
    //
    let rootClasses = this.makeClasses(['comment', 'root']);
    return (
      <div className={rootClasses}>
      { obj.value }
      </div>
    )
  }
  
  renderState( obj, parentObj, i ){
    //
    let rootClasses = this.makeClasses(['state', 'root']);
    let { type, value, extent, scope, state, lacuna } = obj;
    let content = (type==='loose') 
      ? <>{value}</>
      : <>{extent} {state} {scope}</>
    return (
      <div className={rootClasses}>
      { content }
      </div>
    )
  }
  
  renderLine( obj, parentObj, i ){
    //
    let rootClassNames = ['line', 'root'];
    let containsFields = obj.children.map( c => c._class ).includes('field');
    if (containsFields){ rootClassNames.push( 'withFields' ) };
    let rootClasses = this.makeClasses(rootClassNames);
    let labelClasses = this.makeClasses(['line', 'label']);
    let contentClasses = this.makeClasses(['line', 'content']);
    return( 
    <div className={rootClasses}>
    <span className={labelClasses}>
      {obj.name}.
    </span>
    <span className={contentClasses}>
      {this.renderChildren(obj)}
    </span>
    { (obj.QLink) ? this.renderQLink(obj.QLink, obj, 0) : '' }
    </div>
    )
  };

  renderQLink( obj, parentObj, i ){
    //
    let rootClasses = this.makeClasses(['QLink', 'root']);
    return (
      <div className={rootClasses}>
      <a 
       target='_blank'
       href={`https://cdli.ucla.edu/${obj.QNumber}`}>
       { obj.QNumber }
      </a>:
      { obj.QLine }
      </div>
    )
  }
  
  /* Inline elements */
  
  renderField( obj, parentObj, i ){
    // 
    let rootClasses = this.makeClasses(['field', 'root']);
    let labelClasses = this.makeClasses(['field', 'label']);
    let borderClasses = this.makeClasses(['field', 'frame']);
    let contentClasses = this.makeClasses(['field', 'content']);
    return (
      <span className={rootClasses}>
        <span className={borderClasses}/>
        <span className={labelClasses}>
          {i+1}
        </span>
        <span className={contentClasses}>
         { this.renderChildren(obj) }
        </span>
      </span>
    );
  };
  
  renderSequence( obj, parentObj, i ){
    // 
    let rootClasses = this.makeClasses(['sequence', 'root']);
    let interBreakClasses = this.interBreakClasses( obj, parentObj, i );
    return( 
      <div 
       className={rootClasses}
      > 
      { this.renderChildren(obj) }
      <span className={this.makeClasses(['whitespace', ...interBreakClasses])}
      > </span>
      </div> 
    )
  };
  
  renderChr( obj, parentObj, i ){
    //
    return <Chr
        obj={obj}
        parentObj={parentObj}
        i={i}
        makeClasses={this.makeClasses.bind(this)}
    />
  };
  
  render( ){
    //
    let { JTF } = this.props;
    if (!JTF || !JTF.success){
      return <div>no JTF found :(</div>
    }
    return( 
      <div key='JTFEditor' className={this.makeClasses(['JTFEditor'])}>
        {/*<ChrEditPanel/>*/}
        <div key="JTFEditorBoard">
          { JTF.objects.map( o => this.renderObject( o ))}
        </div>
      </div>
    );
  };
};

const mapStateToProps = (state) => {
  //console.log( 'redux state:', state )
  return {JTF: state.editor.JTF};
};

const mapDispatchToProps = {};

const JTFEditor = connect(mapStateToProps, mapDispatchToProps)(_JTFEditor)