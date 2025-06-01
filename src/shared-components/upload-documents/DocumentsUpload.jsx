import React, { Component } from 'react';
import FlexView from 'react-flexview';
import { StyleSheet, css } from 'aphrodite';
import {
    IconButton,
    List,
    ListItem,
    Typography
} from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import DescriptionIcon from '@material-ui/icons/Description';
import {
    OverlayTrigger,
    Tooltip
} from 'react-bootstrap';

import * as colors from '../../values/colors';

export default class LegalDocuments extends Component {

    onDeleteDocument = index => {
        this.props.onDeleteDocument(index);
    };

    render() {

        /**
         * documents is an array with documents inside
         * 
         * the document inside the array will have the following structure:
         * 
         * {
         *      file: File (obtained when uploading)
         *      preview: preview obtained using FileReader
         * }
         */
        const {
            documents
        } = this.props;

        if (!documents || (documents && documents.length === 0)) {
            return null;
        }

        return (
            <FlexView column marginTop={20}>
                <List>
                    {
                        documents.map((document, index) => (
                            <FlexView key={index} vAlignContent="center">
                                <ListItem button style={{ padding: 7 }} >
                                    <DescriptionIcon style={{ color: '#4caf50', fontSize: 40, marginRight: 8 }} />
                                    <FlexView column hAlignContent="left" >
                                        <Typography variant="body2" className={css(styles.black_text)} align="left" >{document.file.name}</Typography>
                                        <Typography variant="body2" color="textSecondary" align="left">{document.file.sizeReadable}</Typography>
                                    </FlexView>
                                </ListItem>

                                <OverlayTrigger
                                    trigger={['hover', 'focus']}
                                    flip
                                    placement="bottom"
                                    overlay={
                                        <Tooltip id={`tooltip-bottom`} > Remove </Tooltip>
                                    }>
                                    <IconButton style={{ width: 44, height: 44 }} onClick={() => this.onDeleteDocument(index)}>
                                        <CloseIcon fontSize="small"/>
                                    </IconButton>
                                </OverlayTrigger>
                            </FlexView>
                        ))
                    }
                </List>
            </FlexView>
        );
    }
}

const styles = StyleSheet.create({

    no_margin: {
        margin: 0
    },

    preview_icon: {
        width: 48, 
        height: 48
    },

    file_name: {
        fontSize: 14,
        marginBottom: 2
    },

    file_size: {
        fontSize: 13,
        color: colors.blue_gray_700
    }
});