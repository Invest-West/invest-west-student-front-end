import React, {Component} from 'react';
import {Button, TextField, Typography} from '@material-ui/core';
import FlexView from 'react-flexview';
import {Col, Row} from 'react-bootstrap';
import {css} from 'aphrodite';
import sharedStyles from '../../shared-js-css-styles/SharedStyles';

import {connect} from 'react-redux';
import * as forumsActions from '../../redux-store/actions/forumsActions';

const mapStateToProps = state => {
    return {
        createForumName: state.manageForums.createForumName,
        createForumDesc: state.manageForums.createForumDesc,
        createForumAuthor: state.manageForums.createForumAuthor,
        createForumError: state.manageForums.createForumError,
        forumEdited: state.manageForums.forumEdited
    }
};

const mapDispatchToProps = dispatch => {
    return {
        toggleCreateNewForum: (open, forumEdited) => dispatch(forumsActions.toggleCreateNewForum(open, forumEdited)),
        createNewForum: () => dispatch(forumsActions.createNewForum()),
        handleForumsInputChanged: (event) => dispatch(forumsActions.handleForumsInputChanged(event))
    }
};

class CreateForum extends Component {
    render() {
        const {
            createForumName,
            createForumDesc,
            createForumError,
            forumEdited,

            toggleCreateNewForum,
            createNewForum,
            handleForumsInputChanged
        } = this.props;

        return (
            <FlexView column >
                <Typography paragraph variant="h6" color="primary" >
                    {
                        forumEdited
                            ?
                            "Edit forum"
                            :
                            "Create forum"
                    }
                </Typography>
                {
                    forumEdited
                        ?
                        null
                        :
                        <Typography paragraph variant="body1" color="textSecondary" align="left">Forums are made up of individual discussion threads that can be organised around a particular subject. Create forums to organise discussions.</Typography>
                }
                <FlexView column marginTop={10} >
                    <Typography variant="subtitle1">Forum information</Typography>
                    <TextField
                        name="createForumName"
                        label="Name"
                        required
                        variant="outlined"
                        margin="normal"
                        value={createForumName}
                        error={createForumError && createForumName.trim().length === 0}
                        onChange={handleForumsInputChanged}
                    />
                    <TextField
                        name="createForumDesc"
                        label="Description"
                        placeholder="(optional)"
                        variant="outlined"
                        margin="normal"
                        multiline
                        rows={4}
                        rowsMax={4}
                        value={createForumDesc}
                        onChange={handleForumsInputChanged}
                    />
                    <Row noGutters >
                        <Col xs={12} sm={12} md={6} lg={8} style={{ marginTop: 30 }} >
                            <FlexView>
                                {
                                    !createForumError
                                        ?
                                        null
                                        :
                                        <Typography variant="body1" align="left" color="error">Please enter forum name.</Typography>
                                }
                            </FlexView>
                        </Col>
                        <Col xs={12} sm={12} md={6} lg={4} style={{ marginTop: 30 }}>
                            <FlexView hAlignContent="right" >
                                <FlexView marginRight={5} >
                                    <Button
                                        variant="outlined"
                                        onClick={() => toggleCreateNewForum(false, null)}
                                        className={css(sharedStyles.no_text_transform)}
                                    >Cancel</Button>
                                </FlexView>
                                <FlexView marginLeft={5} >
                                    <Button variant="contained" color="primary" onClick={createNewForum} className={css(sharedStyles.no_text_transform)}>Submit</Button>
                                </FlexView>
                            </FlexView>
                        </Col>
                    </Row>
                </FlexView>
            </FlexView>
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(CreateForum);