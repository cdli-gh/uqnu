import React, { Component, ReactDOM } from 'react';
import AutosizeInput from 'react-input-autosize';

import { 
  FormControl, 
  FormLabel, 
  FormControlLabel, 
  Radio, 
  RadioGroup} from '@material-ui/core'

export class ChrEditPanel extends Component {
  
  constructor(props) {
    super(props);
    this.state = {};
  };
  
  render(){
    //
    return (
      <div key="" style={{
          width: '100px', 
          position: 'absolute', 
          right: '50px', 
          border: 'black 1px solid', 
          padding: '2px'}}
      >
        <FormControl component="fieldset">
          <FormLabel component="legend">labelPlacement</FormLabel>
          <RadioGroup row aria-label="position" name="position" defaultValue="top">
            <FormControlLabel
              value="Cuneiform"
              control={<Radio color="primary" />}
              label="Cuneiform"
              labelPlacement="start"
              style={{fontSize: '10px',}}
            />
            <FormControlLabel
              value="Proto-Elamite"
              control={<Radio color="primary" />}
              label="Proto-Elamite"
              labelPlacement="start"
              style={{fontSize: '10px',}}
            />
          </RadioGroup>
        </FormControl>
        {/*
          * type: normal, proto-cuneiform, proto-elamite, syl. reference 
          * normal-type: syl, log, det, num, punct, unclear | unclear reading
          * damage: complete, partial, none
          * 
          * 
        */}
      </div>
    );
  }
};


export class Chr extends Component {
  
  constructor(props) {
    super(props);
    this.state = {
      obj: props.obj,
      mode: 'view',
      modified: false,
    };
    this.chrValueInput = React.createRef()
  };
  
  makeClassNames( obj=null ){
    //
    if ( !obj ){ obj = this.props.obj }
    let { type, damage } = obj;
    let classNames = ['chr'];
    if (type){ classNames.push( type.split('.')[0] )}
    if (damage===true){ 
      classNames.push( 'brk' );
    } else if (damage==='#') { 
      classNames.push( 'dmg' );
    };
    if (type && type.includes('sListRef')){
      if ( type.includes('.')){ 
        classNames.push(type.split('.')[1]);
      } else {  
        classNames.push('namedSList');
      }
    };
    return classNames;
  };
  
  makeValue( obj, classNames ){
    //
    let { value, type } = obj;
    value = (type==='num' && value.includes('/')) ? this.val2Fraction( value ) : value;
    return (
      <span
        className={this.props.makeClasses(['value', ...classNames])}
        >
        {value}
      </span>
    );
  };
  
  makeIndex( obj, classNames ){
    //
    let { index } = obj;
    return (index && index!==1) 
      ? <span className={this.props.makeClasses(['index', ...classNames])}>
        {( index==='ₓ' ) ? 'x' : index }
        </span> 
      : ''; 
  };

  makeSeparator( obj, parentObj, i, isUnit, GDL){
    //
    if (isUnit || GDL){ return ''}
    if (!this.separatorStatus( obj, parentObj, i )){
      return '';
    };
    let sepChar = '·';
    if (obj.type==='syl' || parentObj.children[i+1].type==='syl' ){
      sepChar = '-';
    } else if (obj.type==='log' && parentObj.children[i+1].type==='log'){
      sepChar = '.';
    };
    return (
      <span
      className={this.props.makeClasses(['chr', obj.type, 'sep'])}
      >
      { sepChar }
      </span>)
  };
  
  makeUnit( obj, parentObj, i ){
    //
    let { unit } = obj;
    return (unit)
      ? this.renderChrView(unit, parentObj, i, true )
      : '' ;
  };
  
  makeModifiers( obj, classNames ){
    //
    let { modifiers } = obj;
    return (modifiers) 
    ? modifiers.map(m => {
      let category = (!['rotate', 'allogr'].includes(m.type)) ? 'named' : m.type;
      return (
        <span
         className={this.props.makeClasses(['modifier', category, ...classNames])}
        >
         {(category==='named') ? m.type : m.value}
        </span>
      );
    })
    : '';
  };
  
  makeQuestion( obj, classNames ){
    //
    let { question } = obj;
    return (question) 
      ? <span
         className={this.props.makeClasses(['flag', ...classNames])}
        >?</span> 
      : '' ;
  };
  
  makeExclamation( obj, classNames ){
    //
    let { exclamation } = obj;
    return (exclamation) 
      ? <span 
         className={this.props.makeClasses(['flag', ...classNames])}
        >!</span> 
      : '' ;
  };
  
  renderChrView( obj=null, parentObj=null, i=null, isUnit=false, GDL=false ){
    //
    if ( !obj ){ 
      if ( this.state.modified ){
          obj = this.state.obj 
      } else {
          obj = this.props.obj 
      }
    };
    if ( !parentObj ){ parentObj = this.props.parentObj };
    if ( !i ){ i = this.props.i };
    
    let { type } = obj;
    let wrp = null;
    let classNames = this.makeClassNames( obj );
    if ( isUnit ){
      classNames = [...this.makeClassNames( obj ), 'num', 'unit'];
      wrp = <span className={this.props.makeClasses(['unitWrapper'])}/>
    };
    let val = [];
    if (type && type.includes('GDL')){
      //console.log( 'rendering GDL chr', obj.type, obj );
      val = obj.children.map( 
        c => (c._class==='chr') 
          ? this.renderChrView( c, obj, i, false, true )
          : this.renderOperator( c )
      );
      if ( GDL ){
          val = ['(', ...val, ')'];
      };
      if (!wrp){
          wrp = <span className={this.props.makeClasses(['GDLObjWrapper'])}/>
      };
    } else {   
      val = this.makeValue( obj, classNames );
    };
    let ind = this.makeIndex( obj, classNames );
    let unt = this.makeUnit( obj, parentObj, i );
    let mod = this.makeModifiers( obj, classNames );
    let qst = this.makeQuestion( obj, classNames );
    let xcl = this.makeExclamation( obj, classNames );
    let sep = this.makeSeparator( obj, parentObj, i, isUnit, GDL );
    
    //console.log(obj.value, classNames, obj)
    let rootClasses = this.props.makeClasses(['root', ...classNames]);
    let coreClasses = this.props.makeClasses(['core', ...classNames]);
    let baseClasses = this.props.makeClasses(['base', ...classNames]);
    let extClasses = this.props.makeClasses(['ext', ...classNames]);
    let tailClasses = this.props.makeClasses(['tail', ...classNames]);
    
    let core = <span className={coreClasses}>{val}{ind}</span>
    let extensions = ( unt || mod ) 
      ? <span className={extClasses}>{unt}{mod}</span> : '';
    let tail = ( qst || xcl ) 
      ? <span className={tailClasses}>{qst}{xcl}</span> : '';
    
    let chr = ( 
      <span
       className={rootClasses}
       onClick={() => {this.props.setCursor({ cursor: obj })}}
      >
        <span className={baseClasses}>
          { wrp }
          { core }
          { extensions }
        </span>
        { tail }
      </span> 
    ); 
    return [chr, sep]
  };
  
  renderOperator( op ){
      //
      let { value } = op;
      value = ( value==='.' ) ? '·' : value; //: ('&') ? '﹠' : value;
      return (
      <span className={this.props.makeClasses(['operator'])}>
        { value }
      </span> )
  };
  
  val2Fraction( value ){
    //
    let [topStr, bottomStr] = value.split('/');
    return (
    <span className={this.props.makeClasses(['chr', 'fraction'])}>
      <sup>{topStr}</sup>
      &frasl;
      <sub>{bottomStr}</sub>
    </span>)
  };
  
  separatorStatus( obj, parentObj, i ){
    //
    if (!parentObj.children || !parentObj.children[i+1]){ return false };
    if ( obj.position==='pre'){ return false };
    let nextSibling = parentObj.children[i+1];
    if ( 
     nextSibling.type==='det' 
     && nextSibling.position==='post' 
     ){ return false };
    return true;
  };
  
  renderChrEdit(){
    //
    let obj = JSON.parse(JSON.stringify(this.state.obj));
    let { value, index } = obj;
    let style = {border: '0'} //minWidth: '10px', 
    //onDoubleClick={() => {this.setState({mode: 'view'})}}
    //
    return (
      <form
       onDoubleClick={() => {
           this.props.setCursor({ cursor: null }); 
       }}
       style={{paddingRight: '5px', display: 'inline-block'}}
       onChange={e => { console.log('chr form changed', e) }}
       //e.target.getAttribute("size")
      >
        <AutosizeInput
         name="chr-value-input"
         value={value}
         ref={this.chrValueInput}
         spellcheck="false"
         onChange={e => { 
            obj.value = e.target.value;
            this.setState({obj: obj, modified: true})
         }}
         inputStyle={{...style, borderBottom: '1px blue solid'}}
        />
        <AutosizeInput
         name="chr-index-input"
         value={index}
         spellcheck="false"
         onChange={e => { 
            obj.index = e.target.value;
            this.setState({obj: obj, modified: true})
         }}
         inputStyle={{...style, borderBottom: '1px green solid', marginLeft: '-3px'}}
        />
      </form>
    );
  };
  
  render(){
    //
    //let { mode } = this.state;
    let { atCursor } = this.props;
    //console.log( mode )
    return (!atCursor) 
      ? this.renderChrView()
      : this.renderChrEdit() 
  };
};
