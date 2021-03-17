import React from 'react';
import * as C from 'jtf-lib';
import * as R from './atfRender';
import {stream, ATFActions2Map} from './streamATF';
import JSZip from 'jszip';
import LoaderAppBar from './appBar';
import ScrollableTabsButtonAuto from './fileTabs';
import {ReactVirtualizedTable as RVT} from './virtualizedTable';
import Dropzone from 'react-dropzone-uploader';
import { ILayoutProps as dropzoneLayout } from 'react-dropzone-uploader';

import 'react-dropzone-uploader/dist/styles.css';
import './App.Loader.css';

import { ATFTextEditor } from './textEditor';
import {Grid, Drawer, IconButton, Zoom, Paper, Tooltip} from '@material-ui/core';

import CloseIcon from '@material-ui/icons/Close';
import AccountTreeIcon from '@material-ui/icons/AccountTree';
import ChromeReaderModeOutlinedIcon from '@material-ui/icons/ChromeReaderModeOutlined';

import { Editor } from '../editor/Editor';
import { connect } from 'react-redux';

import {
  load,
  loadAsync,
  activate,
  modify,
  add,
  remove,
  undo,
  redo,
} from '../editor/editorSlice';

import {
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
} from './loaderSlice';

import localforage from 'localforage';

// global loading variables
let dataPromiseAtIndex = {};
let dataActiveKeys = [];
let dataLoaderTimeouts = {};

const resetLoading = ( ) =>
    // reset global loading variables.
    dataPromiseAtIndex = {};
    dataLoaderTimeouts = {};

const asyncLoad = ( keys ) => {
    //
    keys = keys.filter( k => dataPromiseAtIndex[k] );
    if (keys.length===0){ return; }
    let k = keys.shift();
    let pr = dataPromiseAtIndex[k];
    Promise.resolve(pr.promiseFunct()).then( 
        result => {
            pr.thenFunct( result );
            asyncLoad( keys );
    });
};

class _ATFUploader extends React.Component {
    // React component for uploading and checking ATF files.
    constructor(props) {
        super(props);
        this.tableRef = React.createRef()
        this.state = {
            ATF_file_maps: [],
            edit: null,
            dropzoneDrawerOpen: false,
            mode: 'ATF',
            zoom: '200%',
        };
        localforage.getItem('ATF_file_maps').then( ATF_file_maps => {
            if (ATF_file_maps){
                this.setState({
                    ATF_file_maps: ATF_file_maps.map( m => ATFActions2Map(m) )
                })
            };
        })
    };
    
    componentDidUpdate( prevProps ){
        //
        if (this.props.loader.loadJTF===true){
            this.updateJTFStore();
        };
    };
    
    ATFMappingTracker = ( ChunkObj, linestream ) => {
        // 
        // ToDo: replace this with progress bar functionality
        // IMPORTANT: avarage CDLI AFT text size is 647.4 bytes
    };
    
    updateJTFStore( ){
        // Use to update redux store & local state
        // upon change of active JTF to pass to editor.
        let { fileDataMap, activeFileTab, activeTextRow } = this.props.loader;
        let key = `${activeFileTab}_${activeTextRow}`;
        if ( fileDataMap[key] ){
            let JTF = fileDataMap[key].JTF;
            this.props.load( JTF );
            this.props.loadJTFCompleted();
        };
    };
    
    onFileStreamEnd = ( index, ATFMap ) => {
        // Fires every time a file mapping is complete
        let { ATF_file_maps } = this.state;
        if (index!==null){
            ATF_file_maps[index] = ATFMap;
        } else {
            ATF_file_maps.push(ATFMap);
        };
        this.setState({ATF_file_maps: ATF_file_maps})
        localforage.setItem(
            'ATF_file_maps', 
            [...ATF_file_maps].map( m => {
                return { 
                    file: m.file, 
                    fileTextsMap: m.fileTextsMap, 
                    textsCount: m.textsCount
                };
            })
        );
        this.closeDropzoneDrawer();
    };
    
    onAddButtonClick = () => {
        // Fires when Add AppBar button is clicked.
        this.setState({
            dropzoneDrawerOpen: true
        });
    };
    
    closeDropzoneDrawer = () => {
        // Call to close DropzoneDrawer.
        if (this.state.dropzoneDrawerOpen){
            this.setState({
                dropzoneDrawerOpen: false
            });
        };
    };
    
    onFileTabSwitch = ( tabIndex ) => {
        // Fires when a fileTab is switched.
        let { activeFileTab } = this.props.loader;
        if (tabIndex!==activeFileTab){
            resetLoading();
            dataActiveKeys = dataActiveKeys.map( k => `${tabIndex}_${k.split('_')[1]}` );
            this.props.switchFileTab( { tab: tabIndex } );
        };
    };
    
    onTextRowSelect = ( response ) => {
        // Fires when a text row in virtualizedTable is selected.
        let { activeTextRow } = this.props.loader;
        let row = response.index;
        if (activeTextRow!==row){
            this.props.selectTextRow({ row: row });
        };
    };
    
    onTextEdit = ( newValue, oldValue ) => {
        // Fires when a text is edited
        this.setState({
            edit: newValue,
        });
        let { activeFileTab, activeTextRow } = this.props.loader;
        let key = `${activeFileTab}_${activeTextRow}`;
        let data = JSON.parse(JSON.stringify(this.getCurrentData()));
        let JTF = C.ATF2JTF( newValue );
        JTF.reference = data.JTF.reference;
        data.errors = JTF.errors;
        data.warnings = JTF.warnings;
        data.JTF = JTF;
        this.props.updateDataMap({ data: data, key: key });
        this.props.loadJTFStart();
    };
    
    saveEdit2File = () => {
        // Update file blob with changes from text editor
        // and newly map it.
        let { ATF_file_maps, edit } = this.state;
        let { activeFileTab, activeTextRow } = this.props.loader;
        let ATFMap = ATF_file_maps[activeFileTab];
        Promise.resolve(ATFMap.actions.rewriteAtIndex(
            activeTextRow,
            this.props.editor.JTF.atf,
            this.ATFMappingTracker,
            this.onFileStreamEnd.bind(this, activeFileTab),
        ));
    };
    
    download = ( blob, name ) => {
        // Downloader function.
        let fileURL = window.URL.createObjectURL(blob);
        let tempLink = document.createElement('a');
        tempLink.href = fileURL;
        tempLink.setAttribute('download', name);
        tempLink.click();
    };
    
    downloadFile = () => {
        // Download active file.
        let { ATF_file_maps } = this.state;
        let { activeFileTab } = this.props.loader;
        let ATFMap = ATF_file_maps[activeFileTab];
        this.download(ATFMap.file, ATFMap.file.name);
    };
    
    downloadAllFiles = () => {
        // Download all loaded files.
        let {ATF_file_maps} = this.state;
        let {download} = this;
        let zip = new JSZip();
        ATF_file_maps.forEach( ATFMap => {
            zip.file(`ATFcollection/${ATFMap.file.name}`, ATFMap.file);
        });
        zip.generateAsync({type:"blob"})
        .then(function (blob) {
            download(blob, "ATFcollection.zip");
        });
    };

    downloadCurrent = () => {
        // Downdload active text.
        // Note that editor changes have to be saved in order to apply.
        let { JTF } = this.props.editor;
        let name = `${JTF.meta.p_number}.atf`;
        let file = new File([JTF.atf], name, {type: 'text/plain',});
        this.download(file, name);
    };
    
    handleDropzoneChangeStatus = ({ meta, file }, status) => {
        // called every time a file's `status` changes.
        if (status==='done'){
            // stream file to map it
            // this.onFileStreamEnd fires when done
            Promise.resolve(file).then((file) => {
                stream(
                    file,
                    this.ATFMappingTracker,
                    this.onFileStreamEnd.bind(this,null),
                );
            });
        };
    };
    
    onRowsRendered( rowsData ){
        //
        let { activeFileTab, fileDataMap } = this.props.loader;
        let i = rowsData.overscanStartIndex;
        let keys = [];
        while (i < rowsData.overscanStopIndex+1){
            keys.push( `${activeFileTab}_${i}` )
            i++
        };
        Object.keys(dataPromiseAtIndex).forEach( k => {
            if ( !keys.includes(k) ){
                delete dataPromiseAtIndex[k]
            }
        });
        keys.forEach( k => {
            if (!fileDataMap[k] && !dataPromiseAtIndex[k]){
                //console.log( 'key test', k.split('_')[1], k )
                let index = parseInt(k.split('_')[1])
                dataPromiseAtIndex[k] = this.loadDataAtIndex( index, k );
                //console.log( 'key test data', k, dataPromiseAtIndex[k] )
            };
        })
        dataActiveKeys = keys;
        asyncLoad( keys );
    };
    
    rowGetterFunction = ( index ) => {
        // turn ATF table index into row data;
        index = index.index;
        let { activeFileTab, fileDataMap } = this.props.loader;
        let k = `${activeFileTab}_${index}`;
        //console.log(dataActiveKeys, k, dataActiveKeys.includes(k))
        if (dataActiveKeys.includes(k) && !fileDataMap[k] && !dataPromiseAtIndex[k]){
            dataPromiseAtIndex[k] = this.loadDataAtIndex( index, k );
            asyncLoad( [k] );
        };
        return {
            row: index,
        };
    };
    
    loadDataAtIndex( index, key ){
        //
        let { ATF_file_maps } = this.state;
        let { activeFileTab, activeTextRow } = this.props.loader;
        let { ATFAtIndex } = ATF_file_maps[activeFileTab].actions;
        let filename = ATF_file_maps[activeFileTab].file.name;
        
        const resolveP = ( rawATFobj ) => {
            delete dataPromiseAtIndex[key];
            let { errors, warnings, success } = rawATFobj.JTFResponse;
            let valid = (!success || errors.length>0) 
                ? false 
                : (warnings.length>0) ? undefined : true;
            let data = {
                index: index+1,
                file: filename,
                PNumber: rawATFobj.PNumber,
                valid: valid,
                errors: errors,
                warnings: warnings,
                JTF: rawATFobj.JTFResponse,
            };
            this.props.updateDataMap({ data: data, key: key });
            if (activeTextRow===index){
                this.updateJTFStore( );
            };
        };
        
        return {
            promiseFunct: ATFAtIndex.bind( this, index ),
            thenFunct: resolveP.bind( this ),
        };
    };
    
    countAllRowsCollection(){
        //
        // Count ATF texts in all uploaded files.
        // If desired, the loader can handle all files 
        // in a single table. For that, use:
        // ´rowCount = {this.countAllRowsCollection()}´
        //
        let { ATF_file_maps } = this.state;
        if (ATF_file_maps.length===0){
            return 0;
        };
        let counter = 0;
        ATF_file_maps.forEach(function(ATFMap){
            counter+=ATFMap.textsCount;
        });
        return counter;
    };
    
    countRowsActiveFileTab = () => {
        // count rows at active filetab, if found
        let { ATF_file_maps } = this.state;
        let { activeFileTab, activeTextRow } = this.props.loader;
        if (ATF_file_maps.length===0){
            return 0;
        }
        return ATF_file_maps[activeFileTab].textsCount
    };
    
    getCurrentData = ( ) => {
        // get data from loader store for current tab and row.
        let { fileDataMap, activeFileTab, activeTextRow } = this.props.loader;
        let key = `${activeFileTab}_${activeTextRow}`;
        return (fileDataMap[key]) ? fileDataMap[key] : null;
    };
    
    ATFMaps2Tabs = ( ) => {
        // convert ATFMaps to tabs array
        let { ATF_file_maps } = this.state;
        return ATF_file_maps.map( ATFMap => {
            return {
                label: ATFMap.file.name,
                content: (<div>content</div>)
            }
        })
    };
    
    renderDropzone = () => {
        // Define Dropzone Component.
        return (
            <Dropzone
                onChangeStatus = {this.handleDropzoneChangeStatus}
                accept = ".atf, .txt"
                PreviewComponent = {null}
                LayoutComponent = {dropzoneLayout}
                callback = {this.props.parentCallback}
                output = {this.props.output}
                maxFiles = {50}
            />
        );
    };
    
    renderDropzoneDrawer = () => {
        // 
        let {dropzoneDrawerOpen} = this.state;
        let closeButton = (
            <IconButton
                aria-label="close"
                onClick={this.closeDropzoneDrawer}
                color="inherit"
                edge='end'
                style={{
                    float: 'right'
                }}
            >
                <CloseIcon />
            </IconButton>
        );
        return (
            <Drawer anchor='top' open={dropzoneDrawerOpen}>
                <Grid item xs={11}>
                    {closeButton}
                </Grid>
                <Grid item xs={12}>
                    {this.renderDropzone()}
                </Grid>
            </Drawer>
        );
    };
    
    renderFileTabs = () => {
        // Define FileTabs component.
        let tabs = this.ATFMaps2Tabs();
        return (
            <ScrollableTabsButtonAuto
                tabGetter={this.ATFMaps2Tabs.bind(this)}
                handleChangeCallback={this.onFileTabSwitch}
                tabs={tabs}
            />
        );
    };
    
    renderVirtualTable = (allCollection=false) => {
        // Define React Virtual Table Component.
        // Use `allCollection=true` to put all files'
        // data in single tablet.
        let { activeTextRow } = this.props.loader;
        let rowCount = (allCollection)
            ? this.countAllRowsCollection()
            : this.countRowsActiveFileTab()
        return (
            <RVT
                rowGetter={this.rowGetterFunction.bind(this)}
                rowCount={rowCount}
                selectRowCallback={this.onTextRowSelect.bind(this)}
                activeTextRow={activeTextRow}
                onRowsRendered={this.onRowsRendered.bind(this)}
            />
        );
    };
    
    renderTooltip( title, children ){
        // Tooltip wrapper.
        return <Tooltip title={title}>{children}</Tooltip>
    };
    
    renderEditorPanel = () => {
        // 
        let { mode } = this.state;
        let switchMode = () => {
            this.setState({mode: (mode==='ATF') ? 'JTF' : 'ATF'})
        };
        let switchButton = (mode==='JTF') 
            ? <AccountTreeIcon
                id='switchMode'
                onClick={switchMode}
                />
            : <ChromeReaderModeOutlinedIcon
                id='switchMode'
                onClick={switchMode}
                />;
        let tooltipTitle = (mode==='ATF') ? 'formatted' : 'ATF' ;
        switchButton = this.renderTooltip(`switch to ${tooltipTitle} view`, switchButton)
        let buttons = [switchButton]
        return (
            <Paper
                elevation={0}
                id='editorPanel'
            >
            {buttons}
            </Paper> 
        );
    };
    
    renderEditor = () => {
        // 
        let { mode, zoom } = this.state;
        let editorComponent = (mode==='ATF') 
            ? this.renderATFTextEditor()
            : (mode==='JTF') 
            ? this.renderUqNUEditor()
            : '';
        return (
        <Zoom in={true} style={{transitionDelay: '500ms'}}>
            <Paper 
                id='editorContainer'
                className={mode}
            >
            <div id='zoom' style={{ 
                transformOrigin: '0 0',
                transform: 'scale(500%)',//DOES NOT WORK!
                }}
            >
                {editorComponent}
            </div>
            </Paper>
        </Zoom>
      );
    };
    
    renderUqNUEditor = () => {
        // JTF structure view.
        return (
            <Editor
            />
        );
    };
    
    renderATFTextEditor = ( ) => {
        // ATFTextEditor ACE Component view.
        let { edit } = this.state;
        let { activeTextRow } = this.props.loader;
        let data = this.getCurrentData();
        //let content = (edit) ? edit : (data && data.JTF) ? data.JTF.atf : '';
        //{/*content={content}*/}
        return (
        <ATFTextEditor
          index={activeTextRow}
          data={data}
          onChange={this.onTextEdit.bind(this)}
          edit={edit}
          save2file={this.saveEdit2File.bind(this)}
        />)
    };
    
    renderAppBar = () => {
        //
        let {ATF_file_maps} = this.state;
        return (
            <LoaderAppBar
                downloadFile={this.downloadFile.bind(this)}
                downloadAllFiles={
                    (ATF_file_maps.length>1) 
                    ? this.downloadAllFiles.bind(this) : null
                }
                downloadCurrent={this.downloadCurrent.bind(this)}
                onAddButtonClick={this.onAddButtonClick.bind(this)}
            />
        );
    };
    
    renderAnalytics = () => {
        //
        return (<>
            <script src="/__/firebase/7.14.1/firebase-app.js"></script>
            <script src="/__/firebase/7.14.1/firebase-analytics.js"></script>
            <script src="/__/firebase/init.js"></script>
        </>)
    };
    
    renderAll = ( gridStyle ) => {
        // Render loaded texts.
        let view = (
            <Grid container 
                spacing={1} 
                style={gridStyle}
                alignItems='stretch'
                justify='flex-start'
            >    
                <Grid item xs={12} style={{paddingBottom: `50px`}}>
                    {this.renderAppBar()}
                </Grid>
                <Grid container item xs={12}>
                    {this.renderDropzoneDrawer()}
                </Grid>
                <Grid item xs={12}>
                    {this.renderFileTabs()}
                </Grid>
                <Grid item xs={4} 
                    style={{
                        maxWidth: `250px`,
                        height: `100%`,
                        }}
                >
                    {this.renderVirtualTable()}
                </Grid>
                <Grid item xs={8} 
                    style={{
                        flexBasis: `calc(100% - 250px)`,
                        maxWidth: `100%`,
                        height: `100%`,
                        }}
                >   
                    {this.renderEditorPanel( )}
                    {this.renderEditor( )}
                </Grid>
            </Grid>
        );
        return view;
    };
    
    render(){
        //
        let gridStyle = {
            margin: 0,
            flexGrow: 0,
            maxWidth: `100%`,
            flexBasis: `100%`,
        };
        return (
            <>
                {this.renderAll(gridStyle)}
                {this.renderAnalytics()}
            </>
        );
    };
};

const mapStateToProps = (state) => {
    //console.log( 'redux state:', state )
    return state;
};

const mapDispatchToProps = {
    load,
    loadAsync,
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
};

export const ATFUploader = connect(mapStateToProps, mapDispatchToProps)(_ATFUploader)