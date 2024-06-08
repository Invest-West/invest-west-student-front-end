import React, {Component} from 'react';

import {css, StyleSheet} from 'aphrodite';
import FlexView from 'react-flexview';
import {Button, Paper, TextField, Typography} from '@material-ui/core';
import ReactQuill from 'react-quill';
import {Col, Row} from 'react-bootstrap';
import sharedStyles from '../../shared-js-css-styles/SharedStyles';

import {connect} from 'react-redux';
import * as forumsActions from '../../redux-store/actions/forumsActions';

const mapStateToProps = state => {
    return {
        threadReplySubject: state.manageForums.threadReplySubject,
        threadReplyMessage: state.manageForums.threadReplyMessage,
        createThreadReplyError: state.manageForums.createThreadReplyError
    }
};

const mapDispatchToProps = dispatch => {
    return {
        toggleThreadReply: (open, threadReplyEdited) => dispatch(forumsActions.toggleThreadReply(open, threadReplyEdited)),
        submitThreadReply: () => dispatch(forumsActions.submitThreadReply()),
        handleQuillChanged: (field, editor) => dispatch(forumsActions.handleQuillChanged(field, editor)),
        handleForumsInputChanged: (event) => dispatch(forumsActions.handleForumsInputChanged(event))
    }
};

class CreateReply extends Component {

    /**
     * Handle react quill changed
     *
     * @param field
     * @returns {Function}
     */
    handleQuillChanged = field => (content, delta, source, editor) => {
        this.props.handleQuillChanged(field, editor);
    };

    render() {
        const {
            threadReplySubject,
            threadReplyMessage,
            createThreadReplyError,

            handleForumsInputChanged,
            submitThreadReply,
            toggleThreadReply
        } = this.props;

        return (
            <Paper style={{ marginTop: 20 }} className={css(styles.thread_reply_style)} >
                <FlexView column >
                    <TextField
                        name="threadReplySubject"
                        label="Subject"
                        required
                        variant="outlined"
                        margin="normal"
                        value={threadReplySubject}
                        error={createThreadReplyError && threadReplySubject.trim().length === 0}
                        onChange={handleForumsInputChanged}
                    />

                    <FlexView column marginTop={30} >
                        <Typography paragraph variant="body1" >Message *</Typography>
                        <ReactQuill
                            placeholder="Write your reply here. Add images for visual effects."
                            value={threadReplyMessage}
                            theme="snow"
                            onChange={this.handleQuillChanged(forumsActions.THREAD_REPLY_CONTENT_QUILL)}
                            modules={modules}
                        />
                    </FlexView>

                    <Row noGutters >
                        <Col xs={12} sm={12} md={6} lg={8} style={{ marginTop: 30 }}>
                            <FlexView>
                                {
                                    !createThreadReplyError
                                        ?
                                        null
                                        :
                                        <Typography variant="body1" align="left" color="error" > Please fill in the required fields. </Typography>
                                }
                            </FlexView>
                        </Col>
                        <Col xs={12} sm={12} md={6} lg={4} style={{ marginTop: 30 }} >
                            <FlexView hAlignContent="right" >
                                <FlexView marginRight={5} >
                                    <Button
                                        variant="outlined"
                                        onClick={() => toggleThreadReply(false, null)}
                                        className={css(sharedStyles.no_text_transform)}
                                    >Cancel</Button>
                                </FlexView>
                                <FlexView marginLeft={5}>
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        onClick={submitThreadReply}
                                        className={css(sharedStyles.no_text_transform)}
                                    >Submit</Button>
                                </FlexView>
                            </FlexView>
                        </Col>
                    </Row>
                </FlexView>
            </Paper>
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(CreateReply);

const modules = {
    toolbar: [
        [{'header': [1, 2, 3, 4, 5, 6, false]}],
        ['bold', 'italic', 'underline', 'strike'],
        ['blockquote', 'code-block'],
        [{'list': 'ordered'}, {'list': 'bullet'}, {'indent': '-1'}, {'indent': '+1'}, {'align': []}],
        [{'script': 'sub'}, {'script': 'super'}],
        [{'color': []}, {'background': []}],
        ['link', 'image'],
        ['clean']
    ]
};

const styles = StyleSheet.create({
    thread_reply_style: {
        padding: 20,
        marginTop: 10,
        marginBottom: 10
    }
});
