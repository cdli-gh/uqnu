import React from 'react';

import PropTypes from 'prop-types';
import clsx from 'clsx';
import { withStyles } from '@material-ui/core/styles';
import { TableCell, Paper, Zoom } from '@material-ui/core';
import { AutoSizer, Column, Table } from 'react-virtualized';

import DoneIcon from '@material-ui/icons/Done';
import WarningIcon from '@material-ui/icons/Warning';
import ErrorOutlineIcon from '@material-ui/icons/ErrorOutline';

import { connect } from 'react-redux';

//import tableIcons from './fileTableIcons';

const styles = theme => ({
    flexContainer: {
        display: 'flex',
        alignItems: 'left',
        boxSizing: 'border-box',
    },
    table: {
        // temporary right-to-left patch, waiting for
        // https://github.com/bvaughn/react-virtualized/issues/454
        '& .ReactVirtualized__Table__headerRow': {
            flip: false,
            paddingRight: theme.direction === 'rtl' ? '0px !important' : undefined,
        },
    },
    tableRow: {
        cursor: 'pointer',
    },
    tableRowHover: {
        '&:hover': {
            backgroundColor: theme.palette.grey[200],
        }, 
    },
    tableCell: {
        flex: 1,
    },
    noClick: {
        cursor: 'initial',
    },
});

const splitAt = index => x => [x.slice(0, index), x[index], x.slice(index+1)]

/*
TODOs:
    - errors and warnings proper display (aggregation of similar?)
    - ! splitAt error (text no. ~666 in big file )
    - implement text editor for ATF chunks?
*/

const makeHighlight = (highlight) => {
    //
    return (
        <span style={{color: 'red', fontWeight: 600}}>
            {highlight}
        </span>
    );
};

const listErrors = (errors) => {
    // make jsx errors list.
    return errors.map(function(e, i){
        //console.log(e)
        let [begin, highlight, end] = splitAt(e.column-1)(e.string)
        highlight = makeHighlight(highlight);
        return (
            <div key={i}>
                {e.agent+" / "+e.type+" at "+e.line+":"+e.column}
                <br/>
                <span style={{fontFamily: 'monospace'}}>
                    {begin}
                    {highlight}
                    {end}
                </span>
            </div>
        );
    });
};

const listWarnings = (warnings) => {
    // make jsx warnings list.
    return warnings.map(function(w, i){
        let clss = ''
        if (w.object){
            clss = (w.object._class) ? w.object._class+': ' :
                (w.object.type) ? w.object.type+': ' : 
                '';
            };
        return (
            <div key={i}>
                {w.agent+": "+w.type+' ('+clss+w.action+')'}
            </div>
        );
    });
};

class _ATFCellRenderer extends React.PureComponent {
    
    constructor(props) {
        super(props);
    };
    
    makeCellData( ){
        //
        let { dataKey } = this.props;
        let { row } = this.props.rowData;
        if (dataKey==='index'){ return row+1 }
        let { activeFileTab, fileDataMap } = this.props.loader;
        let key = `${activeFileTab}_${row}`;
        if ( !fileDataMap[key] ){ 
            return '...';
        };
        let cellData = fileDataMap[key][dataKey];
        if (dataKey === "valid"){
            cellData = 
                (cellData===true) ? <DoneIcon color={'primary'}/> : 
                (cellData===undefined) ? <WarningIcon color={'disabled'}/> : 
                <ErrorOutlineIcon color={'error'}/>;
        };
        return cellData;
    };
    
    render(){
        //
        const { 
            columns, rowData, dataKey, classes, onRowClick, columnIndex, activeTextRow, rowHeight
        } = this.props;
        let cellData = this.makeCellData( );
        const isSelected = (activeTextRow===rowData.row);
        let selectedStyle = (isSelected) ? {backgroundColor: '#ccccf2'} : {};
        return (
            <TableCell
                component="div"
                className={clsx(classes.tableCell, classes.flexContainer, {
                    [classes.noClick]: onRowClick == null,
                })}
                variant="body"
                style={{ height: rowHeight, ...selectedStyle}}
                align={
                    (columnIndex != null && columns[columnIndex].numeric) || false 
                        ? 'right' : 'left'
                    }
            >
                {cellData}
            </TableCell>
        );
    };
};

const mapStateToProps = (state) => {
    //console.log( 'redux state:', state )
    return state;
};

const ATFCellRenderer = connect(mapStateToProps)(_ATFCellRenderer)

class MuiVirtualizedTable extends React.PureComponent {
    
    static defaultProps = {
        headerHeight: 48,
        rowHeight: 55,
    };

    getRowClassName = ({ index }) => {
        //
        const { classes, onRowClick } = this.props;
        return clsx(classes.tableRow, classes.flexContainer, {
            [classes.tableRowHover]: index !== -1 && onRowClick != null,
        });
    };

    cellRenderer = ({ rowData, dataKey, columnIndex }) => {
        //
        let cellData = '...'; //placeholder to have before promise (rowData) renders
        return (
            <ATFCellRenderer
                cellData={cellData}
                rowData={rowData}
                dataKey={dataKey}
                columnIndex={columnIndex}
                {...this.props}
            />
        )
    };

    headerRenderer = ({ label, columnIndex }) => {
        //
        const { headerHeight, columns, classes } = this.props;
        return (
            <TableCell
                component="div"
                className={clsx(classes.tableCell, classes.flexContainer, classes.noClick)}
                variant="head"
                style={{ height: headerHeight }}
                align={columns[columnIndex].numeric || false ? 'right' : 'left'}
            >
                <span>{label}</span>
            </TableCell>
        );
    };
    
    selectRow = ( response ) => {
        this.props.selectRowCallback(response);
    };

    render() {
        const { classes, columns, rowHeight, headerHeight, ...tableProps } = this.props;
        return (
            <AutoSizer>
                {({ height, width }) => (
                    <Table
                        height={height}
                        width={width}
                        rowHeight={rowHeight}
                        gridStyle={{
                            direction: 'inherit',
                        }}
                        headerHeight={headerHeight}
                        className={classes.table}
                        {...tableProps}
                        rowClassName={this.getRowClassName}
                        onRowClick={this.selectRow}
                    >
                        {columns.map(({ dataKey, ...other }, index) => {
                            return (
                                <Column
                                    key={dataKey}
                                    headerRenderer={headerProps =>
                                        this.headerRenderer({
                                            ...headerProps,
                                            columnIndex: index,
                                        })
                                    }
                                    className={classes.flexContainer}
                                    cellRenderer={this.cellRenderer}
                                    dataKey={dataKey}
                                    {...other}
                                />
                            );
                        })}
                    </Table>
                )}
            </AutoSizer>
        );
    }
}

MuiVirtualizedTable.propTypes = {
    classes: PropTypes.object.isRequired,
    columns: PropTypes.arrayOf(
        PropTypes.shape({
            dataKey: PropTypes.string.isRequired,
            label: PropTypes.string.isRequired,
            numeric: PropTypes.bool,
            width: PropTypes.number.isRequired,
        }),
    ).isRequired,
    headerHeight: PropTypes.number,
    onRowClick: PropTypes.func,
    rowHeight: PropTypes.number,
};

const VirtualizedTable = withStyles(styles)(MuiVirtualizedTable);

const columns = [
    {
        width: 70,
        label: '',
        dataKey: 'index',
        numeric: true,
    },
    {
        width: 100,
        label: 'CDLI',
        dataKey: 'PNumber',
    },
    {
        width: 70,
        label: 'Valid',
        dataKey: 'valid',
    },
];


export class ReactVirtualizedTable extends React.Component {
    //
    constructor(props) {
        super(props);
    };
    
    render(){
        let {rowCount, rowGetter, selectRowCallback, activeTextRow, onRowsRendered
            } = this.props;
        return (
        <Zoom in={true} style={{transitionDelay: '500ms'}}>
        <Paper style={{ height: `calc(100vh - 140px)`, width: '240px' }}>
            <VirtualizedTable
                rowCount={rowCount}
                rowGetter={rowGetter}
                onRowsRendered={onRowsRendered}
                columns={columns}
                selectRowCallback={selectRowCallback}
                activeTextRow={activeTextRow}
                overscanRowCount={3}
            />
        </Paper>
        </Zoom>
        );
    };
};
