import * as React from 'react';
import { render } from 'react-dom';

const createCellEl = () => {
	const el = document.createElement('div');
	el.style.height = '100%';
	return el;
};

const splitAt = index => x => [x.slice(0, index), x[index], x.slice(index+1)]

const listErrors = (errors) => {
	// make jsx errors list.
	return errors.map(function(e, i){
		//console.log(e)
		let [begin, highlight, end] = splitAt(e.column-1)(e.string)
		return (
			<div key={i}>
				{e.agent+" parser"}
				<br/>
				{e.type+" error at "+e.line+":"+e.column}
				<br/>
				<span style={{fontFamily: 'monospace'}}>
					{begin}
					<span style={{color: 'red', fontWeight: 600}}>
						{highlight}
					</span>
					{end}
				</span>
			</div>
		);
	});
};

const listWarnings = (warnings) => {
	// make jsx warnings list.
	return warnings.map(function(w, i){
		return (
			<li key={i}>
				{w.agent} warning:
				<br/>
				<b>{w.type}</b>
				<br/>
				<i>{w.action}</i>
			</li>
		);
	});
};

export const errorFormatter = function(
		cell: any, formatterParams: any, onRendered: (fn: any) => void) {
	const style = formatterParams.style || ''; // comma separated plain text
	const arr = cell.getValue() || [];
	let data = cell._cell.row.data;
	let errors = data.errors;
	const el = createCellEl();
	el.className = 'error-formatter-content';
	//el.title = arr && arr.length > 0 && typeof arr[0] === 'string' ? arr.join(', ') : '';
	let content = (<div/>);
	if (errors) {
		//console.log('rendering some errors:', errors)
		let errorsList = listErrors(errors);
		//console.log('errorsList:', errorsList)
		content = (<div>{errorsList}</div> );
	};
	render(content, el);
	return el;
};


function formatBytes(bytes, decimals=3) {
	//
	if (bytes === 0) return '0 Bytes';
	const k = 1024;
	const dm = decimals < 0 ? 0 : decimals;
	const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
	const i = Math.floor(Math.log(bytes) / Math.log(k));
	return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

export const bytesFormatter = function(cell, formatterParams, onRendered){
	//cell - the cell component
	//formatterParams - parameters set for the column
	//onRendered - function to call when the formatter has been rendered
	return formatBytes(cell.getValue());
};

export const warningFormatter = function(
		cell: any, formatterParams: any, onRendered: (fn: any) => void) {
	const style = formatterParams.style || ''; // comma separated plain text
	const arr = cell.getValue() || [];
	let data = cell._cell.row.data;
	let warnings = data.warnings;
	const el = createCellEl();
	el.className = 'warning-formatter-content';
	//el.title = arr && arr.length > 0 && typeof arr[0] === 'string' ? arr.join(', ') : '';
	let content = (<ul/>);
	if (warnings) {
		//console.log('rendering some warnings:', warnings)
		let warningsList = listWarnings(warnings);
		//console.log('warningsList:', warningsList)
		content = (<ul>{warningsList}</ul> );
	};
	render(content, el);
	return el;
};
