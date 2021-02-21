import React from 'react';
import 'react-dropzone-uploader/dist/styles.css';
import Dropzone from 'react-dropzone-uploader';
import {Layout, filesPreviewComponent} from './dropzone_extended';
import * as R from './atfRender';
import * as C from 'JTF';
import 'react-tabulator/lib/css/materialize/tabulator_materialize.min.css';
import { ReactTabulator } from 'react-tabulator';
import {errorFormatter, warningFormatter, bytesFormatter} from './formatters';
import * as util from 'util';
import {stream} from './streamATF';
var toStream = require('blob-to-stream');
global.moment = require("moment"); //lastModifiedDate formatter rendering

const columns = [
	{ title: 'File', field: 'name', width: 150 },
	{ title: 'Size', field: 'size', width: 120, formatter: bytesFormatter },
	{ title: 'Last modified', field: 'lastModifiedDate', width: 200, formatter: 'datetime'},
	{ title: 'Status', field: 'status', width: 100 },
	{ title: 'Errors', field: 'errors', formatter: errorFormatter, headerSort:false },
	{ title: 'Warnings', field: 'warnings', formatter: warningFormatter, headerSort:false},
];

var file2notebook = ( file, callback ) => {
	// get string content of the file, then convert it to JTF,
	// and it as UqNU notebook.
	// passed on to callback function.
	var string = file2string(file);
	let notebook = R.renderATF( string, 'file:'+file.name );
	callback(notebook);
};

var file2checker = ( file, callback, ambigLog=true ) => {
	// get ATF detailed parser response, incl. warnings and errors.
	// passed on to callback function.
	var string = file2string(file);
	var response = C.ATF2JTF( string, 'file:'+file.name );
	response.file = file;
	callback(response);
};

const streamATFFile = function( file, callback ){
	//
	stream(toStream(file), callback);
};

const file2string = function( file ){
	//
	//streamATFFile(file, resp => {console.log(resp)})
	return file.text().then(function(string){
		string = string.replace(/[ ]*(\r\n|\n|\r)/gm,'\n');
		return string;
	});
};

export class ATFUploader extends React.Component {
	// React component for uploading and checking ATF files.
	constructor(props) {
		super(props);
		this.tableRef = React.createRef()
		this.state = {
			previews_meta: [],
			columns: [],
		};
	};
	
	// called every time a file's `status` changes
	handleChangeStatus = ({ meta, file }, status) => {
		//
		var data = this.state.previews_meta;
		this.updateMeta({ meta, file }, status);
 		this.ref.table.updateData(data);
		if (status==='done'){
			this.validate({ meta, file });
		} else if (status==='valid' && this.props.output==='notebook'){
			file2notebook(file, this.props.callback);
		};
	};
	
	updateMeta = ({ meta, file }, status) => {
		// 
		meta.status = status;
		if (!meta.errors){
			meta.errors = null;
		};
		let previews_meta_new = this.state.previews_meta;
		if (status==='preparing'){
			previews_meta_new.push(meta);
		} else {
			previews_meta_new.forEach(function( m, i ){
				if (m.id===meta.id){
					previews_meta_new[i] = meta;
				};
			});
		};
		this.setState({previews_meta: previews_meta_new});
	};
	
	validate = ({ meta, file }) => {
		//
		return file2string(file).then( string => {
			var response = C.ATF2JTF( string, 'file:'+file.name );
			meta.warnings = response.warnings;
			if (!response.success){
				meta.errors = response.errors;
				this.handleChangeStatus({meta, file}, 'error');
			} else {
				this.handleChangeStatus({meta, file}, 'valid');
			};
		});
	};
	
	render (){
		// 
		var data = this.state.previews_meta;
		return (
			<div>
			<Dropzone
				onChangeStatus = {this.handleChangeStatus}
				accept = ".jtf, .atf, .txt, .json"
				//validate={this.validate}
				PreviewComponent = {null}
				LayoutComponent = {Layout}
				callback = {this.props.parentCallback}
				output = {this.props.output}
				maxFiles = {50}
			/>
			<ReactTabulator
				data = {this.state.previews_meta}
				columns = {columns}
				ref = {ref => (this.ref = ref)}
				layout = {'fitDataStretch'}
			/>
			</div>
		);
	};
};