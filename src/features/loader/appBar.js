import React from "react";
import {Grid, AppBar, Toolbar, Menu, MenuItem, Button, ClickAwayListener, Fade} from '@material-ui/core';
import {Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle} from '@material-ui/core';
import GetAppIcon from '@material-ui/icons/GetApp';
import AddIcon from '@material-ui/icons/Add';
import InfoIcon from '@material-ui/icons/Info';

let gridStyle = {
	margin: 0,
	flexGrow: 0,
	maxWidth: `100%`,
	flexBasis: `100%`,
};

export default class LoaderAppBar extends React.Component {
	// React component for uploading and checking ATF files.
	constructor(props) {
		super(props);
		this.state = {
			downdloadMenuAnchor: null,
			downdloadMenuOpen: false,
			infoDialogOpen: false,
		};
	};
	
	openDowndloadMenu = (event) => {
		//
		this.setState({
			downdloadMenuOpen: true,
			downdloadMenuAnchor: event.currentTarget
		});
	};
	
	closeDowndloadMenu = () => {
		//
		if (this.state.downdloadMenuOpen){
			this.setState({
				downdloadMenuOpen: false,
				downdloadMenuAnchor: null
			});
		};
	};
	
	openInfoDialog = () => {
		//
		this.setState({
			infoDialogOpen: true,
		})
	};
	
	closeInfoDialog = () => {
		//
		this.setState({
			infoDialogOpen: false,
		})
	};
	
	renderMenuItem = (funct, label, key) => {
		//
		return (
			<MenuItem onClick={funct} key={key}>
				{label}
			</MenuItem>
		);
	};
	
	renderButton = (fucnt, label, key, icon=null, controls=null) => {
		//
		let buttonProps = {
			key: key,
			variant: 'text',
			color: "inherit",
			size: "small",
			onClick: fucnt,
		};
		if (icon){
			buttonProps.startIcon=icon;
		};
		if (controls){
			buttonProps['aria-controls']=controls;
			buttonProps['aria-haspopup']="true";
		};
		return (<Button {...buttonProps}>{label}</Button>);
	};
	
	renderDownloadMenuItems = () => {
		//
		let {downloadFile, downloadAllFiles, downloadCurrent} = this.props;
		let menu = [this.renderMenuItem(downloadFile, 'This File', 0)];
		if (downloadAllFiles){
			menu.push(this.renderMenuItem(downloadAllFiles, 'All Files', 1));
		};
		if (downloadCurrent){
			menu.push(this.renderMenuItem(downloadCurrent, 'This Text', 2));
		};
		return menu;
	};
	
	renderDownloadBlock = () => {
		//
		let {downdloadMenuAnchor, downdloadMenuOpen} = this.state;
		let dButton= (
			<ClickAwayListener
				key={0}
				onClickAway={this.closeDowndloadMenu}
			>
			{this.renderButton(
				this.openDowndloadMenu,
				'download',
				0,
				<GetAppIcon/>,
				'download-menu'
				)
			}
			</ClickAwayListener>
		);
		let dMenu = (
			<Menu
				id="download-menu"
				key={1}
				anchorEl={downdloadMenuAnchor}
				keepMounted
				open={downdloadMenuOpen}
				TransitionComponent={Fade}
				getContentAnchorEl={null}
				anchorOrigin={{
					vertical: 'bottom',
					horizontal: 'right',
				}}
				transformOrigin={{
					vertical: 'top',
					horizontal: 'right',
				}}
			>
				{this.renderDownloadMenuItems()}
			</Menu>
		);
		return [dButton, dMenu]
	};
	
/* 	renderInfoDialog = () => {
		//
		return (
			<Dialog
				open={this.state.infoDialogOpen}
				onClose={this.closeInfoDialog}
				aria-labelledby="info-dialog-title"
				aria-describedby="alert-dialog-description"
				key={5}
			>
				<DialogTitle id="info-dialog-title">
					{"About"}
				</DialogTitle>
				<DialogContent>
					<DialogContentText id="alert-dialog-description">
						ATF Checker Application.<br/>
						Version Alpha.2.0<br/><br/>
						Use to validate and correct cuneiform transliterations in the&nbsp;
						<a href='http://oracc.ub.uni-muenchen.de/doc/help/editinginatf/'>ATF format</a>. 
						Accepts .atf and .txt files.<br/><br/>
						Ilya Khait (ekh.itd@gmail.com)
					</DialogContentText>
				</DialogContent>
				<DialogActions>
					<Button onClick={this.closeInfoDialog} color="primary" autoFocus>
						OK
					</Button>
				</DialogActions>
			</Dialog>
		);
	};
	
	renderInfoBlock = () => {
		let infoButton = this.renderButton(
			this.openInfoDialog, '', 2, <InfoIcon/>
		);
		let infoDialog = this.renderInfoDialog();
		return [infoButton, infoDialog]
	}; */
	
	render(){
		let {onAddButtonClick} = this.props;
		let downloadButton = this.renderDownloadBlock();
		let loadMoreButton = this.renderButton(
			onAddButtonClick, 'add', 3, <AddIcon/>
		);
		//let infoButton = this.renderInfoBlock();
		return (
			<AppBar>
				<Toolbar>
				<Grid container 
					spacing={2} 
					style={gridStyle}
					justify="space-between"
				>	
					<Grid item xs={1}>
						{loadMoreButton}
					</Grid>
					<Grid item xs={1}>
						{downloadButton}
					</Grid>
					<Grid item xs={1}>
						{/*infoButton*/}
					</Grid>
				</Grid>
				</Toolbar>
			</AppBar>
		)
	};
};