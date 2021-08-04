import React from 'react';

import { useSelector, useDispatch, connect, mapDispatchToProp } from 'react-redux';
import {
  selectActions,
  setCursor,
  activate,
  modify,
  add,
  remove,
  undo,
  redo,
} from './editorSlice';

// Editor panel buttons:
import { Select, FormControl, InputLabel, Popper, Paper, SvgIcon, Divider } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';

import ToggleButton from '@material-ui/lab/ToggleButton';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';

import GrainOutlinedIcon from '@material-ui/icons/GrainOutlined';
import PlaylistAddIcon from '@material-ui/icons/PlaylistAdd';
import PostAddIcon from '@material-ui/icons/PostAdd';

import { Icon, InlineIcon } from '@iconify/react';
import tableColumnPlusAfter from '@iconify-icons/mdi/table-column-plus-after';
import stamperIcon from '@iconify-icons/mdi/stamper';
import focusFieldHorizontal from '@iconify-icons/mdi/focus-field-horizontal';
import shapeSquareRoundedPlus from '@iconify-icons/mdi/shape-square-rounded-plus';
import alphaLBoxOutline from '@iconify-icons/mdi/alpha-l-box-outline';
import abjadHebrew from '@iconify-icons/mdi/abjad-hebrew';
import commentTextOutline from '@iconify-icons/mdi/comment-text-outline';
import trayPlus from '@iconify-icons/mdi/tray-plus';
import codeBrackets from '@iconify-icons/mdi/code-brackets';
import circleOutline from '@iconify-icons/mdi/sticker-circle-outline';
import circleOffOutline from '@iconify-icons/mdi/circle-off-outline';
import eraserIcon from '@iconify-icons/mdi/eraser';
import bookshelfIcon from '@iconify-icons/mdi/bookshelf';
import plusBoxOutline from '@iconify-icons/mdi/plus-box-outline';

import cardBulletedOutline from '@iconify-icons/mdi/card-bulleted-outline';
import formTextbox from '@iconify-icons/mdi/form-textbox';

import ClickAwayListener from '@material-ui/core/ClickAwayListener';

const typeData = {
    syl: 'syllabogram',
    log: 'logogram',
    det: 'determinative',
    num: 'numeral',
    pnc: 'punctation',
    ucl: 'unclear',
};

const langData = {
    
};

const periodData = {
    
};

const genreData = {
    
};

const current = {
    type: 'syl',
};


const StyledToggleButtonGroup = withStyles((theme) => ({
  grouped: {
    //margin: theme.spacing(0.5),
    border: 'none',
    '&:not(:first-child)': {
      borderRadius: theme.shape.borderRadius,
    },
    '&:first-child': {
      borderRadius: theme.shape.borderRadius,
    },
  },
}))(ToggleButtonGroup);

class _Panel extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            type_ref: null,
        };
    };
    
    makeToggleButtonGroup = ( content, orientation='horizontal', style={} ) => {
        //
        return (
          <StyledToggleButtonGroup
            value={ 'syl' }
            exclusive={true}
            size="small"
            aria-label="type"
            orientation={ orientation }
            style={style}
          >
          { content }
          </StyledToggleButtonGroup>
        );
    };
    
    makeToggleButtonWithTooltip = ( content, tip, id=null, handleClick=null ) => {
        //
        let { cursor } = this.props;
        let popper_anchor = this.state[`${id}_ref`];
        if (!handleClick){
          handleClick = (event) => {
            let new_anchor = (popper_anchor) ? null : event.currentTarget;
            this.setState({ [`${id}_ref`]: new_anchor })
          };
        };
        
        let style = { minWidth: '50px' };
        if (['?', '!'].includes(content)){ 
          style = {...style, fontSize: '14px', fontWeight: '800'}
        };
        return this.props.renderTooltip(
          tip,
          <ToggleButton
           value="justify"
           aria-label="justified"
           onClick={handleClick.bind(this)}
           { ...(id) ? {'aria-describedby': id} : '' }
           style={style}
           selected={(cursor && id && cursor[id]) ? true : false }
          >
          { content }
          </ToggleButton>
        );
    };
    
    makePopper = ( content, popper_id ) => {
      //
      let popper_anchor = this.state[`${popper_id}_ref`];
      let hidePopper = () => {
        if (popper_anchor){
          this.setState({[`${popper_id}_ref`]: false});
        }
      };
      return (
        <Popper
         id={popper_id}
         open={(popper_anchor) ? true : false }
         anchorEl={popper_anchor}
         placement='bottom-start'
         style={{zIndex: '1'}}
         >
          <ClickAwayListener onClickAway={hidePopper.bind(this)}>
            <Paper
              elevation={1}
            >
              { content }
            </Paper>
          </ClickAwayListener>
        </Popper>
      );
    };
    
    makeAddButtons = () => {
      //
      let addSignButton = this.makeToggleButtonWithTooltip(
        <SvgIcon><Icon icon={plusBoxOutline}/></SvgIcon>, 
        'add sign');
      let addSequenceButton = this.makeToggleButtonWithTooltip(
        <SvgIcon><Icon icon={formTextbox}/></SvgIcon>, 
        'add sequence');
      let addLineButton = this.makeToggleButtonWithTooltip(<PlaylistAddIcon/>,
        'add line');
      let addSurfaceButton = this.makeToggleButtonWithTooltip(<PostAddIcon/>,
        'add surface');
      let addColumnButton = this.makeToggleButtonWithTooltip(
        <SvgIcon><Icon icon={tableColumnPlusAfter}/></SvgIcon>, 
        'add column');
      let addSealImpressionButton = this.makeToggleButtonWithTooltip(
        <SvgIcon><Icon icon={stamperIcon}/></SvgIcon>, 
        'add seal impression');
      let addModifierButton = this.makeToggleButtonWithTooltip(
        <SvgIcon><Icon icon={focusFieldHorizontal}/></SvgIcon>, 
        'add modifier');
      let addObjectButton = this.makeToggleButtonWithTooltip(
        <SvgIcon><Icon icon={shapeSquareRoundedPlus} /></SvgIcon>, 
        'add object');
      let addCommentaryButton = this.makeToggleButtonWithTooltip(
        <SvgIcon><Icon icon={commentTextOutline}/></SvgIcon>, 
        'add commentary');
      let addFieldButton = this.makeToggleButtonWithTooltip(
        <SvgIcon><Icon icon={trayPlus}/></SvgIcon>, 
        'add field');
      return [
        addSignButton,
        addSequenceButton,
        addFieldButton,
        addLineButton,
        addColumnButton,
        addSurfaceButton,
        addObjectButton,
        addSealImpressionButton,
        addModifierButton,
        addCommentaryButton,
      ];
    };
    
    updateCursor = ( updateDict ) => {
      //
      let { cursor, setCursor } = this.props;
      setCursor({cursor: {...cursor, ...updateDict}})
    };
    
    makeTypeBotton = ( ) => {
      //
      let { cursor } = this.props;
      let cursorType = (cursor && cursor.type) ? cursor.type : 'ucl';
      let updateType = event => {
          let value = event.target.innerText.toLowerCase();
          this.setState({type_ref: false});
          this.updateCursor({type: value})
      };
      let typeArray = Object.keys(typeData).map(
        key => { if (key!==cursorType){
            return this.makeToggleButtonWithTooltip(
              key,
              typeData[key],
              `type_${typeData[key]}`,
              updateType,
            );
        }}
      );
      let typeGroup = this.makeToggleButtonGroup(
        typeArray,
        'vertical',
        );
      let typeButton = this.makeToggleButtonWithTooltip(
        cursorType,
        `value type (${typeData[cursorType]})`, 
        'type',
      );
      let typeButtonPopper = this.makePopper( typeGroup, 'type' );
      return [typeButton, typeButtonPopper];
    };
    
    makeChrButtons = () => {
      //
      let { cursor } = this.props;
      let GDLButton = this.makeToggleButtonWithTooltip('GDL', 'Grapheme Description Language');
      let referenceButton = this.makeToggleButtonWithTooltip('Ref', 'sign list reference');

      let modifierButton = this.makeToggleButtonWithTooltip('mod', 'modifier');
      let variantButton = this.makeToggleButtonWithTooltip('var', 'variant');
      let damageButton = this.makeToggleButtonWithTooltip(<GrainOutlinedIcon/>, 'damage', 'damage');
      let exclamationButton = this.makeToggleButtonWithTooltip(
        '!',
        'sic',
        'exclamation',
        event => { (cursor && cursor.exclamation) 
          ? this.updateCursor({exclamation: false})
          : this.updateCursor({exclamation: true})
        }
      );
      let questionButton = this.makeToggleButtonWithTooltip(
        '?',
        'uncertain',
        'question',
        event => { (cursor && cursor.question) 
          ? this.updateCursor({question: false})
          : this.updateCursor({question: true})
        }
        );
      let omittedButton = this.makeToggleButtonWithTooltip(
        <SvgIcon><Icon icon={circleOutline}/></SvgIcon>, 
        'omitted');
      let superfluousButton = this.makeToggleButtonWithTooltip(
        <SvgIcon><Icon icon={circleOffOutline}/></SvgIcon>, 
        'superfluous');
      let breakButton = this.makeToggleButtonWithTooltip(
        <SvgIcon><Icon icon={codeBrackets}/></SvgIcon>, 
        'break');
      return [
        ...this.makeTypeBotton(),
        GDLButton,
        referenceButton,
        modifierButton,
        variantButton,
        questionButton,
        exclamationButton,
        damageButton,
        breakButton,
        omittedButton,
        superfluousButton,
      ];
    };
    
    renderEditorPanelContent = () => {
        //
/*         let languageButton = this.makeToggleButtonWithTooltip(
          <SvgIcon><Icon icon={alphaLBoxOutline}/></SvgIcon>, 
          'language(s)');
        let scriptButton = this.makeToggleButtonWithTooltip(
          <SvgIcon><Icon icon={abjadHebrew}/></SvgIcon>, 
          'script(s)');
        let genreButton = this.makeToggleButtonWithTooltip(
          <SvgIcon><Icon icon={bookshelfIcon}/></SvgIcon>, 
          'genre(s)'); */
        let descriptionButton = this.makeToggleButtonWithTooltip(
          <SvgIcon><Icon icon={cardBulletedOutline }/></SvgIcon>, 
          'description');

        let removeButton = this.makeToggleButtonWithTooltip(
          <SvgIcon><Icon icon={eraserIcon}/></SvgIcon>, 
          'remove');
        
        let DIV = <Divider flexItem orientation="vertical"/>;
        
        let buttonArray = [
/*            languageButton,
              scriptButton,
              genreButton, */
              descriptionButton,
              DIV,
              ...this.makeChrButtons(),
              DIV,
              ...this.makeAddButtons(),
              DIV,
              removeButton,
        ];
        
        let formControlStyle = {
            paddingTop: '6px',
            position: 'fixed',
            display: 'flex',
            marginLeft: '50px',
        };
        
        let formControl = (
            <>
            { this.makeToggleButtonGroup(
              buttonArray, 
              'horizontal',
              formControlStyle
            )}
            { /*this.makeToggleButtonGroup([
              
            ])*/ }
            </>
        );
        let { mode } = this.state;
        return (mode==='ATF') ? [formControl] : [formControl];
    };
    
    render(){
        // 
        return this.renderEditorPanelContent()
    }

};

const mapStateToProps = (state) => {
  //console.log( 'redux state:', state )
  return {
      cursor: state.editor.cursor,
  };
};

const mapDispatchToProps = {
  selectActions,
  setCursor,
  activate,
  modify,
  add,
  remove,
  undo,
  redo,
};

export const Panel = connect(mapStateToProps, mapDispatchToProps)(_Panel)