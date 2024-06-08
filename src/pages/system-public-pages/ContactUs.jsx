import React, {Component} from 'react';
import {Col, Container, Row} from 'react-bootstrap';
import {
    Button,
    FormControl,
    FormHelperText,
    FormLabel,
    MenuItem,
    OutlinedInput,
    Select,
    TextField,
    Typography
} from '@material-ui/core';
import FlexView from 'react-flexview';
import {css} from 'aphrodite';
import HashLoader from 'react-spinners/HashLoader';

import PageNotFoundWhole from '../../shared-components/page-not-found/PageNotFoundWhole';

import {connect} from 'react-redux';
import * as manageGroupFromParamsActions from '../../redux-store/actions/manageGroupFromParamsActions';
import * as feedbackSnackbarActions from '../../redux-store/actions/feedbackSnackbarActions';
import sharedStyles from '../../shared-js-css-styles/SharedStyles';

import * as colors from '../../values/colors';
import * as emailUtils from '../../utils/emailUtils';
import * as ROUTES from '../../router/routes';
import * as realtimeDBUtils from '../../firebase/realtimeDBUtils';
import * as DB_CONST from '../../firebase/databaseConsts';
import Footer from "../../shared-components/footer/Footer";

const subjects = [
    "I am an investor",
    "I am looking to raise funds",
    "I am a potential partner or supplier",
    "Other query"
];

const mapStateToProps = state => {
    return {
        groupUserName: state.manageGroupFromParams.groupUserName,
        groupProperties: state.manageGroupFromParams.groupProperties,
        groupPropertiesLoaded: state.manageGroupFromParams.groupPropertiesLoaded,
        shouldLoadOtherData: state.manageGroupFromParams.shouldLoadOtherData,

        user: state.auth.user,
        userLoaded: state.auth.userLoaded,
        authenticating: state.auth.authenticating,

        clubAttributes: state.manageClubAttributes.clubAttributes,
        clubAttributesLoaded: state.manageClubAttributes.clubAttributesLoaded
    }
};

const mapDispatchToProps = dispatch => {
    return {
        setGroupUserNameFromParams: (groupUserName) => dispatch(manageGroupFromParamsActions.setGroupUserNameFromParams(groupUserName)),
        setExpectedAndCurrentPathsForChecking: (expectedPath, currentPath) => dispatch(manageGroupFromParamsActions.setExpectedAndCurrentPathsForChecking(expectedPath, currentPath)),
        loadAngelNetwork: () => dispatch(manageGroupFromParamsActions.loadAngelNetwork()),

        setFeedbackSnackbarContent: (message, color, position) => dispatch(feedbackSnackbarActions.setFeedbackSnackbarContent(message, color, position))
    }
};

const initState = {
    email: '',
    subject: '-',
    name: '',
    phone: '',
    description: '',

    submitClick: false,
    sending: false,
    error: false,

    hasSetData: false
};

class ContactUs extends Component {

    constructor(props) {
        super(props);

        this.state = {
            ...initState
        };
    }

    componentDidMount() {
        const {
            groupPropertiesLoaded,
            shouldLoadOtherData,
            user,
            userLoaded,

            setGroupUserNameFromParams,
            setExpectedAndCurrentPathsForChecking,

            loadAngelNetwork
        } = this.props;

        const match = this.props.match;

        setGroupUserNameFromParams(match.params.hasOwnProperty('groupUserName') ? match.params.groupUserName : null);
        setExpectedAndCurrentPathsForChecking(match.params.hasOwnProperty('groupUserName') ? ROUTES.CONTACT_US : ROUTES.CONTACT_US_INVEST_WEST_SUPER, match.path);

        loadAngelNetwork();

        if (groupPropertiesLoaded && shouldLoadOtherData) {
            if (userLoaded) {
                if (user) {
                    if (!this.state.hasSetData) {
                        this.setState({
                            email: user.email,
                            name: user.firstName + " " + user.lastName,
                            hasSetData: true
                        });
                    }
                }
            }
        }
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        const {
            groupPropertiesLoaded,
            shouldLoadOtherData,
            user,
            userLoaded,

            loadAngelNetwork
        } = this.props;

        loadAngelNetwork();

        if (groupPropertiesLoaded && shouldLoadOtherData) {
            if (userLoaded) {
                if (user) {
                    if (!this.state.hasSetData) {
                        this.setState({
                            email: user.email,
                            name: user.firstName + " " + user.lastName,
                            hasSetData: true
                        });
                    }
                }
            }
        }
    }

    /**
     * Submit button is clicked
     */
    onSubmitClick = event => {
        event.preventDefault();

        const {
            clubAttributes,
            groupProperties,

            user,

            setFeedbackSnackbarContent
        } = this.props;

        const {
            email,
            subject,
            name,
            phone,
            description
        } = this.state;

        if (email.trim().length === 0
            || subject === "-"
            || name.trim().length === 0
            || description.trim().length === 0
        ) {
            this.setState({
                submitClick: true
            });
            return;
        }

        this.setState({
            sending: true
        });

        let groupID = groupProperties ? groupProperties.anid : "InvestWestSupport";

        emailUtils
            .sendEmail({
                serverURL: clubAttributes.serverURL,
                emailType: emailUtils.EMAIL_ENQUIRY,
                data: {
                    sender: email.toLowerCase(),
                    receiver: groupID,
                    subject,
                    description,
                    senderName: name,
                    senderPhone: phone
                }
            })
            .then(() => {
                this.setState({
                    ...initState
                });

                setFeedbackSnackbarContent(
                    "Your email has been successfully sent.",
                    "primary",
                    "bottom"
                );

                realtimeDBUtils
                    .logContactUsEnquiry({
                        userID: user ? user.id : null,
                        anid: !groupProperties ? "Invest West super admin" : groupProperties.anid,
                        email: email.toLowerCase(),
                        name,
                        phone,
                        subject,
                        description
                    })
                    .then(enquiryID => {
                        // track activity for authenticated user
                        if (user) {
                            realtimeDBUtils
                                .trackActivity({
                                    userID: user.id,
                                    activityType: DB_CONST.ACTIVITY_TYPE_POST,
                                    interactedObjectLocation: DB_CONST.CONTACT_US_ENQUIRIES_CHILD,
                                    interactedObjectID: enquiryID,
                                    activitySummary: realtimeDBUtils.ACTIVITY_SUMMARY_TEMPLATE_MADE_AN_ENQUIRY.replace("%group%", groupProperties.displayName)
                                });
                        }
                    })
                    .catch(error => {
                        // handle error
                    });
            })
            .catch(error => {
                this.setState({
                    error: true,
                    sending: false
                });
            });
    };

    /**
     * Handle text changed
     *
     * @param event
     */
    onTextChanged = event => {
        this.setState({
            [event.target.name]: event.target.value
        });
    };

    render() {
        const {
            shouldLoadOtherData,
            groupProperties,
            groupPropertiesLoaded,

            authenticating,
            userLoaded,
            clubAttributesLoaded
        } = this.props;

        const {
            email,
            subject,
            name,
            phone,
            description,
            submitClick,
            sending
        } = this.state;

        if (!groupPropertiesLoaded) {
            return (
                <FlexView
                    marginTop={30}
                    hAlignContent="center"
                >
                    <HashLoader
                        color={colors.primaryColor}
                    />
                </FlexView>
            );
        }

        if (!shouldLoadOtherData) {
            return <PageNotFoundWhole/>;
        }

        if (authenticating || !userLoaded || !clubAttributesLoaded) {
            return (
                <FlexView
                    width="100%"
                    marginTop={20}
                    hAlignContent="center"
                >
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
            <Container fluid style={{padding: 0}}>
                <Row noGutters style={{padding: 14}}>
                    <Col xs={12} sm={12} md={{span: 11, offset: 1}} lg={{span: 5, offset: 2}}>
                        <form onSubmit={this.onSubmitClick}>
                            <FlexView column marginTop={40}>
                                <Typography variant="h4">
                                    <b>Contact Us</b>
                                </Typography>

                                <FlexView width="100%" marginTop={40}>
                                    <FormControl fullWidth required error={submitClick && email.trim().length === 0}>
                                        <FormLabel> Your email address</FormLabel>
                                        <TextField value={email} name="email" variant="outlined" margin="dense" onChange={this.onTextChanged} error={submitClick && email.trim().length === 0}/>
                                    </FormControl>
                                </FlexView>

                                <FlexView width="100%" marginTop={25}>
                                    <FormControl fullWidth required error={submitClick && subject === "-"}>
                                        <FormLabel>
                                            Subject
                                        </FormLabel>
                                        <Select name="subject" value={subject} variant="outlined" margin="dense" onChange={this.onTextChanged} input={<OutlinedInput/>} error={submitClick && subject === "-"} >
                                            <MenuItem value={"-"} key={-1}>
                                                -
                                            </MenuItem>
                                            {
                                                subjects.map((subject, index) => (
                                                    <MenuItem
                                                        value={subject}
                                                        key={index}
                                                    >
                                                        {subject}
                                                    </MenuItem>
                                                ))
                                            }
                                        </Select>
                                    </FormControl>
                                </FlexView>

                                <FlexView width="100%" marginTop={25}>
                                    <FormControl fullWidth>
                                        <FormLabel>
                                            Name
                                        </FormLabel>
                                        <TextField value={name} name="name" variant="outlined" margin="dense" onChange={this.onTextChanged} error={submitClick && name.trim().length === 0}/>
                                    </FormControl>
                                </FlexView>

                                <FlexView width="100%" marginTop={25}>
                                    <FormControl fullWidth>
                                        <FormLabel>
                                            Phone number
                                        </FormLabel>
                                        <TextField value={phone} name="phone" variant="outlined" margin="dense" onChange={this.onTextChanged}/>
                                    </FormControl>
                                </FlexView>
                            </FlexView>

                            <FlexView width="100%" marginTop={25}>
                                <FormControl fullWidth required error={submitClick && description.trim().length === 0}>
                                    <FormLabel>
                                        Description
                                    </FormLabel>
                                    <TextField value={description} name="description" variant="outlined" margin="dense" multiline rows={5} rowsMax={5} onChange={this.onTextChanged} error={submitClick && description.trim().length === 0}/>
                                    <FormHelperText>
                                        Please enter the details of your request. A member of our support team will respond as soon as possible.
                                    </FormHelperText>
                                </FormControl>
                            </FlexView>

                            {
                                sending
                                    ?
                                    <FlexView marginTop={30} width="100%" hAlignContent="center">
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
                                    :
                                    null
                            }

                            <Row
                            >
                                <Col xs={12} sm={12} md={4} lg={4} style={{width: "100%", marginTop: 50}}>
                                    <FormControl fullWidth>
                                        <Button type="submit" variant="contained" className={css(sharedStyles.no_text_transform)} color="primary" fullWidth>
                                            Submit
                                        </Button>
                                    </FormControl>
                                </Col>
                            </Row>
                        </form>
                    </Col>
                </Row>

                <Row noGutters>
                    <Col xs={12} sm={12} md={12} lg={12}>
                        <Footer/>
                    </Col>
                </Row>
            </Container>
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(ContactUs);