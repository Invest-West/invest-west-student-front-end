import React, {Component} from 'react';

import {Button, IconButton, Paper, Typography} from '@material-ui/core';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/CreateOutlined';
import {css, StyleSheet} from 'aphrodite';
import FlexView from 'react-flexview';
import * as DB_CONST from '../../firebase/databaseConsts';
import {Image} from 'react-bootstrap';
import * as utils from '../../utils/utils';
import * as colors from '../../values/colors';
import HashLoader from 'react-spinners/HashLoader';
import sharedStyles from '../../shared-js-css-styles/SharedStyles';

import LetterAvatar from '../profile/LetterAvatar';
import CreateReply from './CreateReply';

import {connect} from 'react-redux';
import * as forumsActions from '../../redux-store/actions/forumsActions';

const AVATAR_MAX_HEIGHT = 75;

const mapStateToProps = state => {
    return {
        groupProperties: state.manageGroupFromParams.groupProperties,

        currentUser: state.auth.user,

        threadInReplyMode: state.manageForums.threadInReplyMode,
        threadReplyEdited: state.manageForums.threadReplyEdited,
        forumThreadSelected: state.manageForums.forumThreadSelected,
        forumThreadReplies: state.manageForums.forumThreadReplies,
        forumThreadRepliesLoaded: state.manageForums.forumThreadRepliesLoaded
    }
};

const mapDispatchToProps = dispatch => {
    return {
        toggleThreadReply: (open, threadReplyEdited) => dispatch(forumsActions.toggleThreadReply(open, threadReplyEdited)),
        deleteThreadReply: (threadReplyID) => dispatch(forumsActions.deleteThreadReply(threadReplyID)),
        goBackToThreadsList: () => dispatch(forumsActions.goBackToThreadsList())
    }
};

class IndividualThread extends Component {

    /**
     * Render replies within this thread
     *
     * @returns {*}
     */
    renderReplies = () => {
        const {
            currentUser,

            forumThreadReplies,
            threadInReplyMode,
            threadReplyEdited,

            toggleThreadReply,
            deleteThreadReply
        } = this.props;

        if (forumThreadReplies.length === 0) {
            return;
        }

        forumThreadReplies.sort((reply1, reply2) => {
            return (reply2.replyDate - reply1.replyDate);
        });

        return forumThreadReplies.map(reply => (
            <Paper key={reply.id} className={css(styles.thread_reply_style)} >
                {
                    reply.hasOwnProperty('deleted')
                    && reply.deleted === true
                        ?
                        <FlexView>
                            <Typography variant="body1" align="left"><i>This reply has been removed.</i></Typography>
                        </FlexView>
                        :
                        <FlexView column width="100%" >
                            <FlexView vAlignContent="center" marginBottom={10} width="100%" >
                                {/** Author's avatar */}
                                <FlexView hAlignContent="left" >
                                    {
                                        reply.author.type === DB_CONST.TYPE_ADMIN
                                            ?
                                            reply.author.superAdmin
                                                ?
                                                // super admins
                                                <FlexView
                                                    width={AVATAR_MAX_HEIGHT}
                                                    height={AVATAR_MAX_HEIGHT}
                                                >
                                                    <Image roundedCircle thumbnail src={require('../../img/admin_logo.png').default} style={{ width: "100%", maxHeight: AVATAR_MAX_HEIGHT, objectFit: "contain" }} />
                                                </FlexView>
                                                :
                                                // group admins
                                                <FlexView width={AVATAR_MAX_HEIGHT} height={AVATAR_MAX_HEIGHT} >
                                                    <Image
                                                        roundedCircle
                                                        thumbnail
                                                        src={ utils.getLogoFromGroup(utils.GET_PLAIN_LOGO, reply.author.groupDetails) }
                                                        style={{ width: "100%", maxHeight: AVATAR_MAX_HEIGHT, objectFit: "contain" }}
                                                    />
                                                </FlexView>
                                            :
                                            (
                                                !reply.author.profilePicture
                                                || (reply.author.profilePicture && reply.author.profilePicture.findIndex(pictureItem => !pictureItem.hasOwnProperty('removed')) === -1)
                                                    ?
                                                    // normal users with no profile picture
                                                    <LetterAvatar
                                                        firstName={reply.author.firstName}
                                                        lastName={reply.author.lastName}
                                                        width={AVATAR_MAX_HEIGHT}
                                                        height={AVATAR_MAX_HEIGHT}
                                                        textVariant="h5"
                                                    />
                                                    :
                                                    // normal users with profile picture
                                                    <FlexView
                                                        width={AVATAR_MAX_HEIGHT}
                                                        height={AVATAR_MAX_HEIGHT}
                                                    >
                                                        <Image
                                                            roundedCircle
                                                            thumbnail
                                                            src={
                                                                reply.author.profilePicture[reply.author.profilePicture.findIndex(pictureItem => !pictureItem.hasOwnProperty('removed'))].url
                                                            }
                                                            style={{ width: "100%", maxHeight: AVATAR_MAX_HEIGHT, objectFit: "contain" }}
                                                        />
                                                    </FlexView>
                                            )
                                    }
                                </FlexView>

                                {/** Author name and dates */}
                                <FlexView column marginLeft={15} hAlignContent="left" >
                                    <Typography variant="body1" align="left" >
                                        <b>
                                            {
                                                reply.author.type !== DB_CONST.TYPE_ADMIN
                                                    ?
                                                    // normal users
                                                    `${reply.author.firstName} ${reply.author.lastName}`
                                                    :
                                                    reply.author.superAdmin
                                                        ?
                                                        // super admins
                                                        "Invest West Super Admin"
                                                        :
                                                        // group admins
                                                        `${reply.author.groupDetails.displayName} Admin`
                                            }
                                        </b>
                                    </Typography>

                                    <Typography variant="subtitle2" align="left" >
                                        {
                                            !reply.hasOwnProperty('lastEdited')
                                                ?
                                                `Replied on: ${utils.dateTimeInReadableFormat(reply.replyDate)}`
                                                :
                                                `Last edited: ${utils.dateTimeInReadableFormat(reply.lastEdited)}`
                                        }
                                    </Typography>
                                </FlexView>

                                {/** Delete/Edit reply */}
                                {
                                    (currentUser.type === DB_CONST.TYPE_ADMIN
                                        && currentUser.superAdmin
                                    ) || currentUser.id === reply.author.id
                                        ?
                                        <FlexView hAlignContent="left" vAlignContent="center" marginLeft={60} >
                                            <Button
                                                variant="outlined"
                                                className={css(sharedStyles.no_text_transform)}
                                                size="small"
                                                color="secondary"
                                                onClick={() => deleteThreadReply(reply.id)}
                                                style={{ marginRight: 10 }}
                                            >Delete<DeleteIcon fontSize="small" style={{ marginLeft: 6 }} />
                                            </Button>
                                            <Button
                                                variant="outlined"
                                                className={css(sharedStyles.no_text_transform)}
                                                size="small"
                                                color="primary"
                                                onClick={() => toggleThreadReply(true, JSON.parse(JSON.stringify(reply)))}
                                            >Edit<EditIcon fontSize="small" style={{ marginLeft: 6 }} />
                                            </Button>
                                        </FlexView>
                                        :
                                        null
                                }
                            </FlexView>

                            {
                                !reply.message
                                    ?
                                    null
                                    :
                                    <FlexView column marginTop={15} dangerouslySetInnerHTML={{__html: utils.convertQuillDeltaToHTML(reply.message.ops)}} />
                            }

                            {
                                threadInReplyMode
                                && threadReplyEdited
                                && threadReplyEdited.id === reply.id
                                    ?
                                    <CreateReply/>
                                    :
                                    null
                            }
                        </FlexView>
                }
            </Paper>
        ));
    };

    render() {

        const {
            groupProperties,

            forumThreadSelected,
            forumThreadRepliesLoaded,
            threadInReplyMode,
            threadReplyEdited,

            goBackToThreadsList,
            toggleThreadReply
        } = this.props;

        if (!forumThreadRepliesLoaded) {
            return (
                <FlexView hAlignContent="center" >
                    <HashLoader
                        color={
                            !groupProperties
                                ?
                                colors.primaryColor
                                :
                                groupProperties.settings.primaryColor
                        }
                    />
                </FlexView>
            )
        }

        return (
            <FlexView column >
                <FlexView vAlignContent="center" marginBottom={24} >
                    <IconButton color="primary" aria-label="Back" onClick={goBackToThreadsList} >
                        <ArrowBackIcon/>
                    </IconButton>
                    <FlexView marginLeft={8} >
                        <Typography color="primary" variant="h6">{`Thread: ${forumThreadSelected.name}`}</Typography>
                    </FlexView>
                </FlexView>

                <Paper className={css(styles.thread_reply_style)} >
                    <FlexView column >
                        <FlexView vAlignContent="center" marginBottom={10} >
                            {
                                forumThreadSelected.author.type === DB_CONST.TYPE_ADMIN
                                    ?
                                    forumThreadSelected.author.superAdmin
                                        ?
                                        // super admins
                                        <FlexView width={AVATAR_MAX_HEIGHT} height={AVATAR_MAX_HEIGHT} >
                                            <Image
                                                roundedCircle
                                                thumbnail
                                                src={require('../../img/admin_logo.png').default}
                                                style={{ width: "100%", maxHeight: AVATAR_MAX_HEIGHT, objectFit: "contain" }}
                                            />
                                        </FlexView>
                                        :
                                        // group admins
                                        <FlexView
                                            width={AVATAR_MAX_HEIGHT}
                                            height={AVATAR_MAX_HEIGHT}
                                        >
                                            <Image
                                                roundedCircle
                                                thumbnail
                                                src={
                                                    utils.getLogoFromGroup(utils.GET_PLAIN_LOGO, forumThreadSelected.author.groupDetails)
                                                }
                                                style={{ width: "100%", maxHeight: AVATAR_MAX_HEIGHT, objectFit: "contain" }}
                                            />
                                        </FlexView>
                                    :
                                    (
                                        !forumThreadSelected.author.profilePicture
                                        || (forumThreadSelected.author.profilePicture && forumThreadSelected.author.profilePicture.findIndex(pictureItem => !pictureItem.hasOwnProperty('removed')) === -1)
                                            ?
                                            // normal users with no profile picture
                                            <LetterAvatar
                                                firstName={forumThreadSelected.author.firstName}
                                                lastName={forumThreadSelected.author.lastName}
                                                width={AVATAR_MAX_HEIGHT}
                                                height={AVATAR_MAX_HEIGHT}
                                                textVariant="h5"
                                            />
                                            :
                                            // normal users with profile picture
                                            <FlexView width={AVATAR_MAX_HEIGHT} height={AVATAR_MAX_HEIGHT} >
                                                <Image
                                                    roundedCircle
                                                    thumbnail
                                                    src={
                                                        forumThreadSelected.author.profilePicture[forumThreadSelected.author.profilePicture.findIndex(pictureItem => !pictureItem.hasOwnProperty('removed'))].url
                                                    }
                                                    style={{ width: "100%", maxHeight: AVATAR_MAX_HEIGHT, objectFit: "contain" }}
                                                />
                                            </FlexView>
                                    )
                            }
                            <FlexView column marginLeft={15} marginBottom={10} >
                                <Typography variant="body1" >
                                    <b>
                                        {
                                            forumThreadSelected.author.type !== DB_CONST.TYPE_ADMIN
                                                ?
                                                // normal users
                                                `${forumThreadSelected.author.firstName} ${forumThreadSelected.author.lastName}`
                                                :
                                                forumThreadSelected.author.superAdmin
                                                    ?
                                                    // super admins
                                                    "Invest West Super Admin"
                                                    :
                                                    // group admins
                                                    `${forumThreadSelected.author.groupDetails.displayName} Admin`
                                        }
                                    </b>
                                </Typography>

                                <Typography variant="subtitle2" align="left" >
                                    {
                                        !forumThreadSelected.hasOwnProperty('lastEdited')
                                            ?
                                            `Created on: ${utils.dateTimeInReadableFormat(forumThreadSelected.dateCreated)}`
                                            :
                                            `Last edited: ${utils.dateTimeInReadableFormat(forumThreadSelected.lastEdited)}`
                                    }
                                </Typography>
                            </FlexView>
                        </FlexView>
                        <Typography variant="body1" align="left"><b><u>Description:</u></b></Typography>
                        <Typography variant="body1" align="left" style={{ whiteSpace: "pre-line", marginTop: 6, marginBottom: 15 }}>{forumThreadSelected.description}</Typography>
                        {
                            !forumThreadSelected.message
                                ?
                                null
                                :
                                <FlexView
                                    column
                                    dangerouslySetInnerHTML={{__html: utils.convertQuillDeltaToHTML(forumThreadSelected.message.ops)}}
                                    marginTop={25}
                                />
                        }
                        {
                            threadInReplyMode
                                ?
                                null
                                :
                                <FlexView marginTop={25} marginBottom={8} >
                                    <Button
                                        className={css(sharedStyles.no_text_transform)}
                                        variant="outlined"
                                        color="primary"
                                        onClick={() => toggleThreadReply(true, null)}
                                    >Reply</Button>
                                </FlexView>
                        }
                    </FlexView>
                </Paper>
                {
                    !threadInReplyMode
                        ?
                        null
                        :
                        threadReplyEdited
                            ?
                            null
                            :
                            <CreateReply/>
                }
                <FlexView column marginTop={20} >
                    {
                        this.renderReplies()
                    }
                </FlexView>
            </FlexView>
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(IndividualThread);

const styles = StyleSheet.create({
    thread_reply_style: {
        padding: 20,
        marginTop: 10,
        marginBottom: 10
    }
});