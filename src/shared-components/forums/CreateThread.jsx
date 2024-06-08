import React, {Component} from 'react';
import {Col, Row} from 'react-bootstrap';
import FlexView from 'react-flexview';
import {Button, TextField, Typography} from '@material-ui/core';
import ReactQuill from 'react-quill';
import {css} from 'aphrodite';
import sharedStyles from '../../shared-js-css-styles/SharedStyles';

import {connect} from 'react-redux';
import * as forumsActions from '../../redux-store/actions/forumsActions';

const mapStateToProps = state => {
    return {
        createThreadName: state.manageForums.createThreadName,
        createThreadBriefDesc: state.manageForums.createThreadBriefDesc,
        createThreadMessage: state.manageForums.createThreadMessage,
        createThreadError: state.manageForums.createThreadError,
        threadEdited: state.manageForums.threadEdited
    }
};

const mapDispatchToProps = dispatch => {
    return {
        toggleCreateNewThread: (open, threadEdited) => dispatch(forumsActions.toggleCreateNewThread(open, threadEdited)),
        createNewThread: () => dispatch(forumsActions.createNewThread()),
        handleForumsInputChanged: (event) => dispatch(forumsActions.handleForumsInputChanged(event)),
        handleQuillChanged: (field, editor) => dispatch(forumsActions.handleQuillChanged(field, editor))
    }
};

class CreateThread extends Component {

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
            createThreadName,
            createThreadBriefDesc,
            createThreadMessage,
            createThreadError,
            threadEdited,

            toggleCreateNewThread,
            createNewThread,
            handleForumsInputChanged
        } = this.props;

        return (
            <Row noGutters >
                <Col xs={12} sm={12} md={12} lg={12} >
                    <FlexView column >
                        <Typography paragraph variant="h6" color="primary" >
                            {
                                threadEdited
                                    ?
                                    "Edit thread"
                                    :
                                    "Create thread"
                            }
                        </Typography>
                        {
                            threadEdited
                                ?
                                null
                                :
                                <Typography paragraph variant="body1" color="textSecondary" align="left">A thread is a series of posts related to the same subject. Threads provide an organisational structure within a forum for users to share posts on similar topics. Creating a thread posts the first message.</Typography>
                        }
                        <FlexView column marginTop={10} >
                            <Typography variant="body1">Thread information</Typography>

                            <TextField
                                name="createThreadName"
                                label="Name"
                                required
                                variant="outlined"
                                margin="normal"
                                value={createThreadName}
                                error={createThreadError && createThreadName.trim().length === 0}
                                onChange={handleForumsInputChanged}
                            />

                            <TextField
                                name="createThreadBriefDesc"
                                label="Brief description"
                                required
                                variant="outlined"
                                margin="normal"
                                value={createThreadBriefDesc}
                                error={createThreadError && createThreadBriefDesc.trim().length === 0}
                                onChange={handleForumsInputChanged}
                            />

                            <FlexView column marginTop={40} >
                                <Typography paragraph variant="body1">Thread message</Typography>
                                <ReactQuill
                                    placeholder="Write your thread message here. Add images for visual effects."
                                    theme="snow"
                                    value={createThreadMessage}
                                    onChange={this.handleQuillChanged(forumsActions.THREAD_CONTENT_QUILL)}
                                    modules={modules}
                                />
                            </FlexView>
                        </FlexView>
                    </FlexView>
                </Col>
                <Col xs={12} sm={12} md={12} lg={12} >
                    <Row noGutters >
                        <Col xs={12} sm={12} md={6} lg={8} style={{ marginTop: 30 }}>
                            <FlexView>
                                {
                                    !createThreadError
                                        ?
                                        null
                                        :
                                        <Typography variant="body1" align="left" color="error">Please fill in the required fields.</Typography>
                                }
                            </FlexView>
                        </Col>
                        <Col xs={12} sm={12} md={6} lg={4} style={{ marginTop: 30 }}>
                            <FlexView hAlignContent="right">
                                <FlexView marginRight={5}>
                                    <Button
                                        variant="outlined"
                                        onClick={() => toggleCreateNewThread(false, null)}
                                        className={css(sharedStyles.no_text_transform)}
                                    >Cancel</Button>
                                </FlexView>
                                <FlexView marginLeft={5} >
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        onClick={createNewThread}
                                        className={css(sharedStyles.no_text_transform)}
                                    >Submit</Button>
                                </FlexView>
                            </FlexView>
                        </Col>
                    </Row>
                </Col>
            </Row>
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(CreateThread);

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