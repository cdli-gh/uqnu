//=== Imports ================================================================
//
import React from 'react';
//import logo from './logo.svg';
//import '../../App.css';

/* material-ui */
//import Icon from '@material-ui/core/Icon';
//import AddCircle from '@material-ui/icons/AddCircle';

import * as C from 'jtf-lib';

/*---/ Classes /------------------------------------------------------------*/

//import ObjUqNU from './../Editor/textComponents/Object';
//import Surface from './../Editor/textComponents/Surface';

export const renderATF = function( atf, reference ){
	//
	var surfaces = [];
	var response = null; //C.ATF2JTF( atf, reference );
	console.log('! response !')
	if ( response.JTF ) {
		return (
		//<div id='notebook'><ObjUqNU {...response.JTF.objects[0]}/></div>
		<span>[text placeholder]</span>
		);
	};
	return <div id='parsingError'>Parsing failed</div>
};
