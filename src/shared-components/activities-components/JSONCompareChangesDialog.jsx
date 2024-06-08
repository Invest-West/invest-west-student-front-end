import React, {Component} from 'react';
import {
    Dialog,
    DialogContent,
    DialogTitle,
    IconButton,
    Typography
} from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import ReactJson from 'react-json-view';
import FlexView from 'react-flexview';
import {
    Container,
    Row,
    Col
} from 'react-bootstrap';

import {connect} from 'react-redux';
import * as manageJSONCompareChangesActions from '../../redux-store/actions/manageJSONCompareChangesDialogActions';

const mapStateToProps = state => {
    return {
        dialogOpen: state.manageJSONCompareChangesDialog.dialogOpen,
        jsonBefore: state.manageJSONCompareChangesDialog.jsonBefore,
        jsonAfter: state.manageJSONCompareChangesDialog.jsonAfter
    }
};

const mapDispatchToProps = dispatch => {
    return {
        resetData: () => dispatch(manageJSONCompareChangesActions.resetData())
    }
};

class JSONCompareChangesDialog extends Component {
    render() {
        const {
            forwardedRef,

            dialogOpen,
            jsonBefore,
            jsonAfter,

            resetData,

            other
        } = this.props;

        return (
            <Dialog
                ref={forwardedRef}
                open={dialogOpen}
                fullWidth
                maxWidth="lg"
                onClose={resetData}
                {...other}
            >
                <DialogTitle>
                    <FlexView vAlignContent="center" >
                        <FlexView grow={4} >
                            <Typography variant="h5" color="primary" align="left">Data changes</Typography>
                        </FlexView>
                        <FlexView grow={1} hAlignContent="right" >
                            <IconButton onClick={resetData} >
                                <CloseIcon/>
                            </IconButton>
                        </FlexView>
                    </FlexView>
                </DialogTitle>
                <DialogContent style={{ marginBottom: 25 }} >
                    <FlexView>
                        <Container fluid style={{ padding: 0 }} >
                            {
                                JSON.stringify(jsonBefore) === JSON.stringify(jsonAfter)
                                    ?
                                    // no data changes
                                    <Row>
                                        <Col xs={12} sm={12} md={{span: 10, offset: 1}} lg={{span: 8, offset: 2}} >
                                            <FlexView column width="100%" >
                                                <Typography variant="h6" align="left" paragraph><b>No data changes after this activity</b></Typography>

                                                <ReactJson
                                                    src={jsonBefore}
                                                    theme="monokai"
                                                    collapseStringsAfterLength={50}
                                                    // enable clipboard not working
                                                    // solution found here: https://github.com/mac-s-g/react-json-view/issues/131
                                                    enableClipboard={
                                                        (copy) => {
                                                            navigator.clipboard.writeText(JSON.stringify(copy.src, null, '\t'))
                                                        }
                                                    }
                                                />
                                            </FlexView>
                                        </Col>
                                    </Row>
                                    :
                                    // there are data changes
                                    <Row>
                                        {/** JSON before */}
                                        <Col xs={12} sm={12} md={6} lg={6} >
                                            <FlexView column width="100%" >
                                                <Typography variant="h6" align="left" paragraph><b>Before</b></Typography>

                                                <ReactJson
                                                    src={jsonBefore}
                                                    theme="monokai"
                                                    collapseStringsAfterLength={50}
                                                    // enable clipboard not working
                                                    // solution found here: https://github.com/mac-s-g/react-json-view/issues/131
                                                    enableClipboard={
                                                        (copy) => {
                                                            navigator.clipboard.writeText(JSON.stringify(copy.src, null, '\t'))
                                                        }
                                                    }
                                                />
                                            </FlexView>
                                        </Col>

                                        {/** JSON after */}
                                        <Col xs={12} sm={12} md={6} lg={6} >
                                            <FlexView column width="100%" >
                                                <Typography variant="h6" align="left" paragraph><b>After</b></Typography>

                                                <ReactJson
                                                    src={jsonAfter}
                                                    theme="monokai"
                                                    collapseStringsAfterLength={50}
                                                    enableClipboard={
                                                        (copy) => {
                                                            navigator.clipboard.writeText(JSON.stringify(copy.src, null, '\t'))
                                                        }
                                                    }
                                                />
                                            </FlexView>
                                        </Col>
                                    </Row>
                            }
                        </Container>
                    </FlexView>
                </DialogContent>
            </Dialog>
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(JSONCompareChangesDialog);