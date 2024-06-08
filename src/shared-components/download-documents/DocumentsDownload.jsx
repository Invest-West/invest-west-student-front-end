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
import {
    OverlayTrigger,
    Tooltip
} from 'react-bootstrap';

import * as colors from '../../values/colors';
import sharedStyles from '../../shared-js-css-styles/SharedStyles';

export default class DocumentsDownload extends Component {

    onDocumentClick = downloadURL => {
        this.props.onDocumentClick(downloadURL);
    };

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
         *      downloadURL: download URL from firebase storage
         *      fileName: ...
         *      readableSize: ...
         * }
         */
        const {
            documents,
            deleteEnable
        } = this.props;

        if (!documents || documents.length === 0) {
            return null;
        }

        return (
            <FlexView column marginTop={20} >
                <List>
                    {
                        documents.map((document, index) => (
                            document.hasOwnProperty('removed')
                                ?
                                null
                                :
                                <FlexView key={index} vAlignContent="center" >
                                    {
                                        <a
                                            href={document.downloadURL}
                                            rel="noopener noreferrer"
                                            target="_blank"
                                            className={css(sharedStyles.nav_link_hover_without_changing_text_color)}
                                            style={{
                                                width: "100%"
                                            }}
                                        >
                                            <ListItem button style={{ padding: 7 }} >
                                                <img
                                                    alt="Document"
                                                    className={css(styles.preview_icon)}
                                                    src={require("../../img/document_icon.png").default}
                                                />
                                                <FlexView column hAlignContent="left" >
                                                    <Typography variant="body2" className={css(styles.black_text)} align="left">{document.fileName}</Typography>
                                                    <Typography variant="body2" color="textSecondary" align="left" >{document.readableSize}</Typography>
                                                </FlexView>
                                            </ListItem>
                                        </a>
                                    }
                                    {
                                        deleteEnable
                                            ?
                                            <OverlayTrigger
                                                trigger={['hover', 'focus']}
                                                flip
                                                placement="top"
                                                overlay={
                                                    <Tooltip id={`tooltip-top`}>Delete this document</Tooltip>
                                                }>
                                                <IconButton
                                                    style={{ width: 44, height: 44 }}
                                                    onClick={() => this.onDeleteDocument(index)}
                                                >
                                                    <CloseIcon fontSize="small" />
                                                </IconButton>
                                            </OverlayTrigger>
                                            :
                                            null
                                    }
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
    },

    black_text: {
        color: colors.black
    }
});