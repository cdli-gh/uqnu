import React from "react";
import { render } from "react-dom";
import AceEditor from "react-ace";
 
import "ace-builds/src-noconflict/mode-java";
import "ace-builds/src-noconflict/theme-github";

import { IconButton, Tooltip, Fab, Paper } from '@material-ui/core';
import StarIcon from '@material-ui/icons/Star';
import StarBorderIcon from '@material-ui/icons/StarBorder';
import DoneIcon from '@material-ui/icons/Done';
import WarningIcon from '@material-ui/icons/Warning';
import ErrorOutlineIcon from '@material-ui/icons/ErrorOutline';
import SaveIcon from '@material-ui/icons/Save';

// ToDo:
// rewrite this with regard to Redux.
// Esp. editing / saving functionality.
import { useSelector, useDispatch, connect, mapDispatchToProp } from 'react-redux';

class _ATFTextEditor extends React.Component {
    // React component for uploading and checking ATF files.
    constructor(props) {
        super(props);
        //ToDo: 
        // * move state to redux store level.
        this.state = {
            editor: null,
            undoManager: null,
            modified: false, 
            parentCalls: [],
            value: (props.JTF && props.JTF.atf) ? props.JTF.atf : '',
            annotations: [],
        };
    };
    
    componentDidUpdate( oldProps, oldState ) {
        //
        let { props } = this;
        let value = (props.JTF && props.JTF.atf) 
            ? props.JTF.atf : '';
        let oldValue = (oldProps.JTF && oldProps.JTF.atf) 
            ? oldProps.JTF.atf : '';
        if ( value!==oldValue ){
            this.setState({ value: value, modified: false })
        };
    };
    
/*     componentDidUpdate( oldProps, oldProps ) {
        // 
        const newProps = this.props;
        if (!newProps.content){
            return;
        };
        if (this.state.modified 
            && newProps.index===oldProps.index){
            this.updateFromEdit(newProps.edit);
        } else {
            Promise.resolve(newProps.content.rawATFobj)
            .then( rawATFObj => {
                this.updateFromObj(rawATFObj)
            })
        };
    }; */
    
    onEditorLoad = ( editor ) => {
        // Add editor and undoManager to state on load.
        //console.log('loading editor');
        let session = editor.getSession();
        let undoManager = session.getUndoManager();
        this.setState({
            editor: editor,
            undoManager: undoManager,
        });
    };
    
    onChange = ( newValue ) => {
        // Callback on change of content in editor
        let { value, parentCalls } = this.state;
        let { onChange } = this.props;
        if (parentCalls.length>0){
            parentCalls.forEach(c => {
                clearTimeout(c)
            });
        };
        
        if ( onChange ){
            let callParent = setTimeout(onChange.bind(this, newValue, value), 3000);
            this.setState({
                modified: true,
                value: newValue,
                parentCalls: [callParent]
            });
        };
    };
    
    updateFromEdit = ( JTFResponse ) => {
        // Update this.state.value & .annotations from JTFResponse.
        if (!JTFResponse){
            return;
        };
        //let value = JTFResponse.data;
        let {annotations} = this.state; 
        let newAnnotations = this.makeAnnotations(JTFResponse);
        if (JSON.stringify(annotations)!==JSON.stringify(newAnnotations)){
            this.setState({annotations: newAnnotations})
        };
        //this.updateIfNew(value, annotations);
    };
    
    /*
    updateFromObj = ( rawATFObj )=> {
        // Update this.state.value & .annotations from rawATFObj.
        if (!rawATFObj){
            return;
        };
        this.updateIfNew(rawATFObj);
    };
    
    updateIfNew = (rawATFObj) => {
        //
        //console.log('updating new');
        let value = rawATFObj.string;
        //console.log(value, this.state.value, this.state.value!==value)
        if (this.state.value!==value) {
            let PNumber = rawATFObj.PNumber;
            let {file, texts} = rawATFObj.map;
            let {name, size, lastModifiedDate} = file;
            let annotations = this.makeAnnotations(rawATFObj.JTFResponse);
            this.setState({
                PNumber: PNumber,
                name: name,
                size: size,
                lastModifiedDate: lastModifiedDate,
                texts: texts,
                value: value,
                annotations: annotations,
                modified: false,
            });
            this.resetUndoManager();
        };
    };
    */
    
    resetUndoManager = () => {
        // Reset undoManager after loading new content.
        let {undoManager, editor} = this.state;
        if (undoManager){
            undoManager.reset();
            let session = editor.getSession();
            session.setUndoManager(undoManager)
        };
    };
    
    listExpectedClasses = (nearlyHints) => {
        // 
        let expectedTokens = [];
        if (nearlyHints){
            expectedTokens = [...new Set(
                Object.entries(nearlyHints)
                .map(([key, obj]) => obj.token)
            )].sort();
        };
        return expectedTokens;
    };
    
    makeAnnotations = (JTFResponse) => {
        // 
        let { errors } = JTFResponse;
        return errors.map( error => {
            let {agent, type, string, tokenValue, tokenClass, nearlyHints
                } = error;
            let errorText = agent+' '+type+' error.'
            if (tokenValue && tokenClass){
                errorText+='\nToken: "'+tokenValue+'".\nClass: '+tokenClass+'.'
            };
            let expectedClasses = this.listExpectedClasses(nearlyHints);
            if (expectedClasses.length>0){
                errorText+='\nExpected classes: '+expectedClasses.join(', ')+'.'
            }
            return { 
                row: error.line-1,
                column: error.column,
                type: 'error',
                text: errorText,
            }
        });
    };
    
    renderEditor = () => {
        //
        let { data } = this.props;
        let { value } = this.state;
        let annotations = (data && data.JTF ) ? this.makeAnnotations(data.JTF) : [] ;
        return (
            <AceEditor
                mode="java"
                theme="github"
                onChange={this.onChange}
                onLoad={this.onEditorLoad}
                name="UNIQUE_ID_OF_DIV"
                editorProps={{ $blockScrolling: true }}
                setOptions={{ useWorker: false }}
                value={value}
                annotations={annotations}
                showPrintMargin={false}
                style={{width: '100%', height: `calc(100vh - 190px)`}}
            />
        );
    };
    
    renderFAB = () => {
        // floating action button.
        let {modified, annotations} = this.state;
        let {edit, save2file} = this.props;
        let disabled = (annotations.length!==0 || !modified || !edit);
        return (
            <Fab 
                color="primary"
                disabled={disabled}
                size='small'
                style={{
                    float: 'right',
                    marginTop: '-70px',
                    marginRight: '50px',
                    }}
            >
                <SaveIcon onClick={save2file}/>
            </Fab>
        );
    };

    render(){
        // 
        //console.log('rendering editor');
        return(
            <Paper
            elevation={1}
            >
                {/*{this.renderPanel()}*/}
                {this.renderEditor()}
                {this.renderFAB()}
            </Paper>
        );
    };
};

const mapStateToProps = (state) => {
  //console.log( 'redux state:', state )
  return {JTF: state.editor.JTF};
};
const mapDispatchToProps = {};
export const ATFTextEditor = connect(mapStateToProps, mapDispatchToProps)(_ATFTextEditor)