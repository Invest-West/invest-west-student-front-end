/* eslint-disable jsx-a11y/img-redundant-alt */
import React, {Component} from "react";
import {connect} from "react-redux";
import {AppState} from "../../redux-store/reducers";
import {ThunkDispatch} from "redux-thunk";
import {AnyAction} from "redux";
import {PitchDocument} from "../../models/project";
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    List,
    ListItem,
    Typography
} from "@material-ui/core";
import DescriptionIcon from '@material-ui/icons/Description';
import {DocumentsDownloadState} from "./DocumentsDownloadReducer";
import {onAcceptRiskWarningClick, onCancelRiskWarningClick, onDocumentClick} from "./DocumentsDownloadActions";
import {css} from "aphrodite";
import sharedStyles from "../../shared-js-css-styles/SharedStyles";
import {ManageSystemAttributesState} from "../../redux-store/reducers/manageSystemAttributesReducer";
import {getGroupRouteTheme, ManageGroupUrlState} from "../../redux-store/reducers/manageGroupUrlReducer";
import CustomLink from "../../shared-js-css-styles/CustomLink";
import Routes from "../../router/routes";

interface DocumentsDownloadProps {
    ManageSystemAttributesState: ManageSystemAttributesState;
    ManageGroupUrlState: ManageGroupUrlState;
    documents: PitchDocument[];
    shouldShowRiskWarningOnDownload?: boolean;
    DocumentsDownloadLocalState: DocumentsDownloadState;
    onDocumentClick: (document: PitchDocument, shouldShowRiskWarning: boolean) => any;
    onAcceptRiskWarningClick: () => any;
    onCancelRiskWarningClick: () => any;
}

const mapStateToProps = (state: AppState) => {
    return {
        ManageSystemAttributesState: state.ManageSystemAttributesState,
        ManageGroupUrlState: state.ManageGroupUrlState,
        DocumentsDownloadLocalState: state.DocumentsDownloadLocalState
    }
}

const mapDispatchToProps = (dispatch: ThunkDispatch<any, any, AnyAction>) => {
    return {
        onDocumentClick: (document: PitchDocument, shouldShowRiskWarning: boolean) => dispatch(onDocumentClick(document, shouldShowRiskWarning)),
        onAcceptRiskWarningClick: () => dispatch(onAcceptRiskWarningClick()),
        onCancelRiskWarningClick: () => dispatch(onCancelRiskWarningClick())
    }
}

class DocumentsDownload extends Component<DocumentsDownloadProps, any> {
    render() {
        const {
            ManageSystemAttributesState,
            ManageGroupUrlState,
            documents,
            shouldShowRiskWarningOnDownload,
            DocumentsDownloadLocalState,
            onDocumentClick,
            onAcceptRiskWarningClick,
            onCancelRiskWarningClick
        } = this.props;

        if (!documents || documents.length === 0) {
            return null;
        }

        if (!ManageSystemAttributesState.systemAttributes) {
            return null;
        }

        let riskWarningFooter = ManageSystemAttributesState.systemAttributes.riskWarningFooter;
        riskWarningFooter = riskWarningFooter
            .split("%groupName%")
            .join(ManageGroupUrlState.group
                ? ManageGroupUrlState.group.displayName
                : "Default student"
            );

        let riskWarningTextSplits = riskWarningFooter.split("%URL%");

        return <Box
            marginTop="20px"
        >
            <List>
                {
                    documents.map((document, index) => (
                        document.removed !== undefined && document.removed
                            ? null
                            : <ListItem
                                key={index}
                                button
                                onClick={() => onDocumentClick(document, shouldShowRiskWarningOnDownload ?? false)}
                            >
                                <DescriptionIcon style={{ color: '#4caf50', fontSize: 48 }} />
                                <Box display="flex" flexDirection="row" >
                                    <Typography variant="body2" align="left">{document.fileName}</Typography>
                                    <Typography variant="body2" color="textSecondary" align="left">{document.readableSize}</Typography>
                                </Box>
                            </ListItem>
                    ))
                }
            </List>

            <Dialog
                open={DocumentsDownloadLocalState.openRiskWarningDialog}
                onClose={() => onCancelRiskWarningClick()}
            >
                <DialogTitle>Accept Risk Warning</DialogTitle>
                <DialogContent>
                    <Box marginTop="18px" whiteSpace="pre-line" >
                        <Typography variant="body1" align="justify" >
                            {riskWarningTextSplits[0]}
                            <CustomLink
                                url={Routes.nonGroupRiskWarning}
                                target="_blank"
                                color={getGroupRouteTheme(ManageGroupUrlState).palette.error.main}
                                activeColor="none"
                                activeUnderline={true}
                                component="nav-link"
                                childComponent={
                                    riskWarningTextSplits[1]
                                }
                            />
                            {riskWarningTextSplits[2]}
                        </Typography>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Box display="flex" flexDirection="row" marginRight="4px" marginBottom="4px" >
                        <Button
                            className={css(sharedStyles.no_text_transform)}
                            onClick={() => onCancelRiskWarningClick()}
                        >Cancel</Button>
                        <Box width="14px" />
                        <Button
                            color="primary"
                            variant="contained"
                            className={css(sharedStyles.no_text_transform)}
                            onClick={() => onAcceptRiskWarningClick()}
                        >Accept</Button>
                    </Box>
                </DialogActions>
            </Dialog>
        </Box>;
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(DocumentsDownload);