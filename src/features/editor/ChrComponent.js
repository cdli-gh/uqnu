import React, { Component } from 'react';

export class Chr extends Component {
  
  constructor(props) {
    super(props);
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
      ? this.renderChr(unit, parentObj, i, true )
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
  
  renderChr( obj=null, parentObj=null, i=null, isUnit=false, GDL=false ){
    //
    if ( !obj ){ obj = this.props.obj };
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
          ? this.renderChr( c, obj, i, false, true )
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
      <span className={rootClasses}>
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
  
  render(){
    //
    return this.renderChr(  );
  };
};
