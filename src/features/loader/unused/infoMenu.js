import React from 'react';
import Paper from '@material-ui/core/Paper';

export default class InfoMenu extends React.Component {
	// React component for uploading and checking ATF files.
	constructor(props) {
		super(props);
		this.state = {
			file: null,
			size: null,
			lastModified: null,
			texts: null,
			index: props.index,
		};
		if (props.content){
			Promise.resolve(props.content.rawATFobj).then(rawATFObj => {
				this.updateFromObj(rawATFObj);
			});
		};
	};
	
	componentDidUpdate( oldProps ) {
		let {content} = this.props;
		if (content){
			Promise.resolve(content.rawATFobj).then(rawATFObj => {
				this.updateFromObj(rawATFObj);
			});
		};
	};
	
	updateFromObj = (rawATFObj)=> {
		let {index, edit} = this.props;
		let PNumber = rawATFObj.PNumber;
		let {file, texts} = rawATFObj.map;
		let {name, size, lastModifiedDate} = file;
		let newState = {
			PNumber: PNumber,
			name: name,
			size: size,
			lastModifiedDate: lastModifiedDate,
			texts: texts,
			index: index,
			edit: edit,
		};
		if (name!==this.state.name || index!==this.state.index){
			this.setState(newState);
		};
	}
	
	render(){
		let {PNumber, name, size, lastModifiedDate, texts, index, edit
			} = this.state;
		let file = (
			<p>{name} {size} <br/>{PNumber} {index+1}/{texts} {JSON.stringify(edit)}</p>
		);
		return file;
	};
};