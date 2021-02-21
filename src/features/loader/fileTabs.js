import React from 'react';
import PropTypes from 'prop-types';
import {Tab, Tabs, Typography, Box, AppBar, Zoom} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

function TabPanel(props) {
	const { children, value, index, ...other } = props;

	return (
		<Typography
			component="div"
			role="tabpanel"
			hidden={value !== index}
			id={`scrollable-auto-tabpanel-${index}`}
			aria-labelledby={`scrollable-auto-tab-${index}`}
			{...other}
		>
			{value === index && <Box p={3}>{children}</Box>}
		</Typography>
	);
}

TabPanel.propTypes = {
	children: PropTypes.node,
	index: PropTypes.any.isRequired,
	value: PropTypes.any.isRequired,
};

function a11yProps(index) {
	return {
		id: `scrollable-auto-tab-${index}`,
		'aria-controls': `scrollable-auto-tabpanel-${index}`,
	};
}

export default class ScrollableTabsButtonAuto extends React.Component {
	// React component for uploading and checking ATF files.
	constructor(props) {
		super(props);
		this.tableRef = React.createRef()
		this.state = {
			value: 0,
		};
	};
	
	makeTabs = (tabsArr) => {
		return tabsArr.map( (tab, i) => {
			return this.makeTab(tab.label, i)
		});
	};
	
	makeTab = (label, index) => {
		return (
			<Tab
				key={index}
				label={label}
				{...a11yProps(index)}
			/>)
	};
	
	handleChange = (event, newValue) => {
		this.setState({value: newValue});
		this.props.handleChangeCallback(newValue);
	};
	
	render(){
		let { tabs } = this.props;
		return (
		<AppBar position="static" color="default">
			<Tabs
				key={0}
				value={this.state.value}
				indicatorColor="primary"
				textColor="primary"
				variant="scrollable"
				scrollButtons="auto"
				aria-label="sources"
				onChange={this.handleChange}
			>
				{this.makeTabs(tabs)}
			</Tabs>
		</AppBar>
		)
	};
};
