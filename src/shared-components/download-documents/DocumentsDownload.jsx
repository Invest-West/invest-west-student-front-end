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
import PictureAsPdfIcon from '@material-ui/icons/PictureAsPdf';
import ImageIcon from '@material-ui/icons/Image';
import VideoLibraryIcon from '@material-ui/icons/VideoLibrary';
import TableChartIcon from '@material-ui/icons/TableChart';
import {
    OverlayTrigger,
    Tooltip
} from 'react-bootstrap';

import * as colors from '../../values/colors';
import sharedStyles from '../../shared-js-css-styles/SharedStyles';

export default class DocumentsDownload extends Component {

    getFileTypeInfo = (fileName) => {
        const extension = fileName.toLowerCase().split('.').pop();
        
        switch (extension) {
            case 'pdf':
                return { icon: PictureAsPdfIcon, color: '#f44336', label: 'PDF Document' };
            case 'doc':
            case 'docx':
                return { icon: DescriptionIcon, color: '#2196f3', label: 'Word Document' };
            case 'xls':
            case 'xlsx':
                return { icon: TableChartIcon, color: '#4caf50', label: 'Excel Spreadsheet' };
            case 'ppt':
            case 'pptx':
                return { icon: DescriptionIcon, color: '#ff9800', label: 'PowerPoint Presentation' };
            case 'jpg':
            case 'jpeg':
            case 'png':
            case 'gif':
            case 'bmp':
                return { icon: ImageIcon, color: '#9c27b0', label: 'Image File' };
            case 'mp4':
            case 'avi':
            case 'mov':
            case 'wmv':
                return { icon: VideoLibraryIcon, color: '#607d8b', label: 'Video File' };
            case 'txt':
                return { icon: DescriptionIcon, color: '#795548', label: 'Text File' };
            default:
                return { icon: DescriptionIcon, color: '#4caf50', label: 'Document' };
        }
    };

    onDocumentClick = (document) => {
        // Check if it's a PDF file
        const isPdf = document.fileName.toLowerCase().endsWith('.pdf');
        
        if (isPdf) {
            // For PDFs, call the original handler which opens in new tab
            this.props.onDocumentClick(document.downloadURL);
        } else {
            // For non-PDF files, show file info or handle differently
            // For now, we'll open in new tab but not force download
            window.open(document.downloadURL, '_blank');
        }
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
                                        <div
                                            className={css(sharedStyles.nav_link_hover_without_changing_text_color)}
                                            style={{
                                                width: "100%"
                                            }}
                                        >
                                            <ListItem 
                                                button 
                                                style={{ padding: 7 }} 
                                                onClick={() => this.onDocumentClick(document)}
                                            >
                                                {(() => {
                                                    const fileInfo = this.getFileTypeInfo(document.fileName);
                                                    const IconComponent = fileInfo.icon;
                                                    return <IconComponent style={{ color: fileInfo.color, fontSize: 40, marginRight: 8 }} />;
                                                })()}
                                                <FlexView column hAlignContent="left" >
                                                    <Typography variant="body2" className={css(styles.black_text)} align="left">{document.fileName}</Typography>
                                                    <Typography variant="body2" color="textSecondary" align="left" >{document.readableSize}</Typography>
                                                    {document.description && (
                                                        <Typography variant="body2" color="textSecondary" align="left" style={{fontStyle: 'italic', marginTop: 4}}>
                                                            {document.description}
                                                        </Typography>
                                                    )}
                                                </FlexView>
                                            </ListItem>
                                        </div>
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