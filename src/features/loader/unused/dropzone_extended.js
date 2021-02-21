import React from 'react';
import 'react-dropzone-uploader/dist/styles.css'
import Dropzone from 'react-dropzone-uploader'
import PropTypes from 'prop-types'
import * as R from './atfRender';
import * as C from 'JTF';
import { ILayoutProps } from 'react-dropzone-uploader'

/* import 'react-tabulator/lib/styles.css'; // required styles
import 'react-tabulator/lib/css/tabulator.min.css'; // theme
import { ReactTabulator } from 'react-tabulator'; // for React 15.x, use import { React15Tabulator }
import { reactFormatter } from 'react-tabulator'; */
/* 
export const filesPreviewComponent = props => 
  null */

class Errors extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			cellData: props.cell._cell.row.data,
		};
        //console.log('errors object:', props)
	};
	componentDidUpdate(prevProps, prevState, snapshot){
        if (this.state.cellData.validationError !== 
          prevProps.cellData.validationError) {
            //console.log(this.state.cellData.validationError)
        };
    };
    componentWillUnmount(){
        //console.log(this.state.cellData.validationError);
    };
	render (){
		let validationError = this.state.cellData.validationError;
        if (validationError){
            if (validationError.isResolved){
                return ( validationError );
            };
            return (<span>non-resolved promise</span>);
        };
		return null;
	};
};

/* const columns = [
  { title: 'File', field: 'name', width: 150 },
  { title: 'Size (Kb)', field: 'size', align: 'left' },
  //{ title: 'Percent', field: 'percent', align: 'left', formatter: 'progress'},
  { title: 'Last modified', field: 'lastModifiedDate', width: 150 },
  { title: 'Status', field: 'status', width: 150 },
  { title: 'Errors', field: 'validationError', width: 150, formatter: reactFormatter(<Errors />)},
]; */

export const Layout = (props: ILayoutProps) => {
  //console.log('configuring layout')
  const {
    input,
    previews,
    submitButton,
    dropzoneProps,
    files,
    extra: { maxFiles },
  } = props;
  //let previews_meta = previews.map(f => f.props.meta);
  //console.log(previews_meta);
/*   let previews_tabulator = (previews_meta.length!==0) ? 
    <ReactTabulator data={previews_meta} columns={columns}/> : ''; */
  return (
    <div {...dropzoneProps}>
      {files.length < maxFiles && input}
      {files.length > 0 && submitButton}
    </div>
  )
};

