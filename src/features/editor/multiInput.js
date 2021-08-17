import React, { Component, ReactDOM } from 'react';
import AutosizeInput from 'react-input-autosize';

export default class MultiInput extends Component {
  //
  constructor(props) {
    super(props);
    let caret = {};
    this.state = {
        activeInput: (props.activeInput) ? props.activeInput : 0,
        caret: {},
    };
  };
  
  componentDidMount () {
    //
    console.log('mount')
    this.focusActiveInput();
  };
  
  componentDidUpdate () {
    //
    let {activeInput} = this.state;
    console.log('focus input', activeInput)
    if (activeInput===-1){
      this.props.left();
    } else if (activeInput===this.props.fields.length){
      this.props.right();
    } else {
      this.focusActiveInput();
    };
  };
  
  focusActiveInput () {
    //
    let {activeInput, caret} = this.state;
    let c = (caret[activeInput]) ? caret[activeInput] : 0;
    let { input } = this[activeInput].current;
    setTimeout(() => {
      input.focus();
      input.setSelectionRange(c, c);
    }, 0)
  };
  
  onKeyDown( e, i ){
    //
    let { key, ctrlKey } = e;
    let { selectionStart } = e.target;
    let { length } = e.target.value;
    if (ctrlKey && key==="ArrowRight"){
        this.props.right();
    } else if (ctrlKey && key==="ArrowLeft") {
        this.props.left();
    } else if (length===selectionStart && key==="ArrowRight"){
        this.setState({ activeInput: i+1 });
    } else if (selectionStart===0 && key==="ArrowLeft"){
        this.setState({ activeInput: i-1 });
    } else if (selectionStart===0 && key==="ArrowUp"){
        this.props.up();
    } else if (selectionStart===0 && key==="ArrowDown"){
        this.props.down();
    };
  };
  
  onChange( e, name ){
    //
    let {activeInput, caret} = this.state;
    let { value, selectionStart } = e.target;
    this.setState(
     {caret: {[activeInput]: selectionStart}}, 
     () => this.props.onChange({[name]: value})
    );
  };
  
  makeMargins( i ){
      //
      let data = this.props.fields[i];
      let first = (i===0);
      let last = (i===this.props.fields.length-1);
      if ( last ){
          return {}
      } else if (!last){
          return {marginRight: '-2px'}
      };
  };
  
  makeAffixComponents( data ){
      //
      let { prefix, postfix } = data;
      let style = {userSelect: 'none', color: 'blue'};
      let prefixComp = (prefix) 
        ? <span key='prefix' style={style}>{prefix}</span> 
        : '';
      let postfixComp = (postfix) 
        ? <span key='postfix' style={style}>{postfix}</span> 
        : '';
      return [prefixComp, postfixComp];
  };
  
  makeInput( data, i ){
    //
    let { activeInput } = this.state;
    let {value, name, prefix, postfix} = data;
    let style = (data.style) ? data.style : {};
    let backgroundStyle = {backgroundColor: 'lightgoldenrodyellow'};
    let inputStyle = (data.inputStyle) ? data.inputStyle : {};
    let margins = this.makeMargins(i);
    let [prefixComp, postfixComp] = this.makeAffixComponents(data);
    
    let inputComp = (
      <AutosizeInput
       ref={this[i]}
       name={`chr-${name}-input`}
       value={value}
       spellCheck="false"
       onChange={ e => this.onChange(e, name)}
       onFocus={ e => {
         e.target.setAttribute('autocomplete', 'off');
       }}
       onKeyDown={e => this.onKeyDown(e, i)}
       inputStyle={{border: '0', caretColor: 'black', ...inputStyle, ...backgroundStyle}}
    />);
    
    return (
    <span style={{...style, ...margins, ...backgroundStyle}}>{[
      prefixComp,
      inputComp,
      postfixComp,
    ]}</span>);
  };
  
  chainInput(){
    //
    let inputArr = this.props.fields.map( (d, i) => this.makeInput(d, i)); 
    let formStyle={
      display: 'inline-block',
      backgroundColor: 'lightgoldenrodyellow',
      borderBottom: '1px solid #9e9e9e'};
    return (
      <form
       onDoubleClick={() => {
           this.props.close(); 
       }}
       style={formStyle}
       onChange={e => {
        //console.log('chr form changed', e.target, e.target.selectionStart, e.target.selectionEnd) 
        }}
      >
      {inputArr}
      {this.props.tail}
      </form>
    );
  };
  
  render (){
    //
    this.props.fields.forEach( (f, i) => {
        this[i] = React.createRef();
    });
    return this.chainInput();
  };
};