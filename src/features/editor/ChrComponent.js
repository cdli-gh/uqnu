import React, { Component, ReactDOM } from 'react';
import AutosizeInput from 'react-input-autosize'; //remove?
import MultiInput from './multiInput';

export class Chr extends Component {
  
  constructor(props) {
    super(props);
    this.state = {
      mode: 'view',
      caret: {},
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
    obj = (obj) ? obj : this.props.obj;
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
  
  renderChrEdit(parentObj=null, i=null, isUnit=false, GDL=false){
    //
    console.log('rendering edit');
    if ( !parentObj ){ parentObj = this.props.parentObj };
    if ( !i ){ i = this.props.i };
    
    let nextSibling = parentObj.children[i+1];
    let prevSibling = parentObj.children[i-1];
    //let upSibling
    //let downSibling
    
    let obj = JSON.parse(JSON.stringify(this.props.obj));
    let classNames = this.makeClassNames( obj );
    let { value, index, type, question, exclamation } = obj;
    let sep = this.makeSeparator( obj, parentObj, i, isUnit, GDL );
    let fields = this.makeMultiInputFields(obj);
    let qst = this.makeQuestion( obj, classNames );
    let xcl = this.makeExclamation( obj, classNames );
    let chrEdit = 
      <MultiInput
       fields={fields}
       caret={this.state.caret}
       onChange={mutation => this.mutateObj(obj, mutation)}
       close={() => this.props.setCursor({ cursor: null })}
       right={() => this.props.setCursor({cursor: nextSibling})}
       left={() => this.props.setCursor({cursor: prevSibling})}
       up={()=> {}}
       down={()=> {}}
       tail={[qst, xcl]}
     />;
    return [chrEdit, sep];
  };
  
  mutateObj (obj, mutation) {
    //
    if (mutation.value){
      let matches = [...mutation.value.matchAll(/([^\d]+)([\d]+)/g)][0];
      mutation = (matches && matches.length===3) 
       ? {value: matches[1], index: matches[2]}
       : mutation;
    };
    this.props.setCursor({cursor: {...obj, ...mutation}});
  };
  
  makeMultiInputFields(obj){
    //
    let { value, index, type } = obj;
    let style = {}; //minWidth: '10px',
    let valueStyle = (type==='log') 
      ? {textTransform: 'uppercase', fontSize: '75%', color: 'navy', fontWeight: 400}
      : ( type==='syl' ) 
      ? {fontStyle: 'italic', color: '#0e63c1'}
      : ( type==='det' ) 
      ? {verticalAlign: 'text-top', color: '#8b007a', verticalAlign: '30%', fontSize: '70%'}
      : ( type==='pnc' ) 
      ? {}
      : {}
    let damageStyle = (obj.damage)
      ? {
          backgroundImage: 'url(data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBzdGFuZGFsb25lPSJubyI/PjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiPjxkZWZzPjxwYXR0ZXJuIGlkPSJwYXR0ZXJuX28yNVRycSIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgd2lkdGg9IjMuNSIgaGVpZ2h0PSIzLjUiIHBhdHRlcm5UcmFuc2Zvcm09InJvdGF0ZSgyNSkiPjxsaW5lIHgxPSIwIiB5PSIwIiB4Mj0iMCIgeTI9IjMuNSIgc3Ryb2tlPSIjMDAwMDAwIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPiA8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI3BhdHRlcm5fbzI1VHJxKSIgb3BhY2l0eT0iMC4zMSIvPjwvc3ZnPg==)'
        } : {};
    style = {...style, ...damageStyle};
    return (type!=='num') ? [
      {
        name: 'value',
        value: value,
        style: {...style, borderBottom: '1px blue solid'},
        inputStyle: valueStyle,
      },
      ...(index && index!==1) ? [{
        name: 'index',
        value: index,
        style: {...style, borderBottom: '1px #3f51b5 solid', marginLeft: '-1px'},
        inputStyle: {color: 'cornflowerblue', fontSize: '70%'},
      }] : [],
    ] : [
      {
        name: 'value',
        value: value,
        style: {...style, borderBottom: '1px #0f9191 solid'},
        inputStyle: {color: '#0f9191'},
      },
      {
        name: 'unit.value',
        value: obj.unit.value,
        style: {...style, borderBottom: '1px blue solid'},
        inputStyle: {textTransform: 'uppercase', fontSize: '65%'},
        prefix: '(',
        postfix: (obj.unit.index && obj.unit.index!==1) ? '' : ')',
      },
      ...(obj.unit.index && obj.unit.index!==1) ? [{
        name: 'unit.index',
        value: obj.unit.index,
        style: {...style, borderBottom: '1px #3f51b5 solid', marginLeft: '-1px'},
        inputStyle: {color: 'cornflowerblue', fontSize: '70%'},
        postfix: ')',
      }] : [],
    ]
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
