import React, {Component, memo} from "react";
import {connect} from "react-redux";
import {AppState} from "../../redux-store/reducers";
import {getGroupRouteTheme, ManageGroupUrlState} from "../../redux-store/reducers/manageGroupUrlReducer";
import {AuthenticationState} from "../../redux-store/reducers/authenticationReducer";
import {
    getPitchCover,
    isImagePitchCover,
    isProjectCreatedByGroupAdmin,
    isProjectLive,
    isProjectPrivate,
    isProjectPublic,
    isProjectRestricted,
    PitchCover,
    ProjectInstance
} from "../../models/project";
import CustomLink from "../../shared-js-css-styles/CustomLink";
import '../../shared-js-css-styles/sharedStyles.scss';
import Routes from "../../router/routes";
import {Box, colors, Divider, Typography} from "@material-ui/core";
import {Col, Container, Image, OverlayTrigger, Row, Tooltip} from "react-bootstrap";
import {getGroupLogo} from "../../models/group_properties";
import ReactPlayer from "react-player";
import * as appColors from "../../values/colors";
import User from "../../models/user";
import * as utils from "../../utils/utils";
import PublicIcon from "@material-ui/icons/Public";
import RestrictedIcon from "@material-ui/icons/VpnLock";
import PrivateIcon from "@material-ui/icons/LockOutlined";

const CoverMaxHeight = 180;

interface OfferItemProps {
    ManageGroupUrlState: ManageGroupUrlState;
    AuthenticationState: AuthenticationState;
    offerInstance: ProjectInstance;
}

const mapStateToProps = (state: AppState) => {
    return {
        ManageGroupUrlState: state.ManageGroupUrlState,
        AuthenticationState: state.AuthenticationState
    }
}

class OfferItem extends Component<OfferItemProps, any> {
    render() {
        const {
            ManageGroupUrlState,
            AuthenticationState,
            offerInstance
        } = this.props;

        // Removed early return check for currentUser

        const pitchCover: PitchCover | null = getPitchCover(offerInstance.projectDetail);
        const projectUrl = Routes.constructProjectDetailRoute(ManageGroupUrlState.groupNameFromUrl ?? null, ManageGroupUrlState.courseNameFromUrl ?? null, offerInstance.projectDetail.id);
        
        console.log('OfferItem - Project URL:', projectUrl, 'for project:', offerInstance.projectDetail.projectName);

        return <CustomLink
            url={projectUrl}
            color="none"
            activeColor="none"
            activeUnderline={false}
            component="nav-link"
            childComponent={
                <Box border={`1px solid ${colors.grey["300"]}`} >
                    <Container fluid style={{ padding: 0 }} >
                        <Row noGutters >
                            <Col xs={12} sm={12} md={12} lg={12} >
                                <Box
                                    className="offer-image"
                                    height={`${CoverMaxHeight}px`}
                                    width="100%"
                                >
                                    {
                                        // Removed shouldHideProjectInformationFromUser check
                                        !pitchCover
                                            ? null
                                            : isImagePitchCover(pitchCover)
                                                ? <Image src={pitchCover.url} width="100%" height={CoverMaxHeight} style={{ objectFit: "contain" }} />
                                                : <ReactPlayer url={pitchCover.url} light={false} width="100%" height={CoverMaxHeight} playing={false} controls={false} />
                                    }

                                    {/** Course logo to be displayed at the top-right corner */}
                                    {/* <Image
                                        src={getGroupLogo(offerInstance.group) ?? ""}
                                        roundedCircle
                                        height={46}
                                        width={46}
                                        style={{
                                            position: "absolute",
                                            right: 0,
                                            top: 0,
                                            zIndex: 1,
                                            padding: "5px",
                                            marginTop: "5px",
                                            marginRight: "5px",
                                            backgroundColor: colors.grey["300"],
                                            objectFit: "contain"
                                        }}
                                    /> */}
                                </Box>

                                <Divider/>

                                <Box padding="14px" className="project-title" >
                                    {/** Project basic information */}
                                    <Box>
                                        {/** Project title */}
                                        <Box marginY="6px" >
                                            <Typography noWrap variant="h6" align="left" >
                                                {
                                                    // Removed shouldHideProjectInformationFromUser check
                                                    offerInstance.projectDetail.projectName
                                                }
                                            </Typography>
                                        </Box>


                                        {/** Sector / Description */}
                                        <Box color={colors.grey["700"]}>
                                            <title className="projectInfo">
                                                {
                                                    // Removed shouldHideProjectInformationFromUser check
                                                    offerInstance.projectDetail.description
                                                }
                                            </title>
                                        </Box>

                                        {/** By issuer */}
                                        <Box color="black" marginTop="8px" className="issuer-offer" >
                                            <Typography variant="body2" noWrap >
                                                {
                                                    // Removed shouldHideProjectInformationFromUser check
                                                    isProjectCreatedByGroupAdmin(offerInstance.projectDetail)
                                                        ? `by ${offerInstance.group.displayName}`
                                                        : `by ${(offerInstance.issuer as User).firstName} ${(offerInstance.issuer as User).lastName}`
                                                }
                                            </Typography>
                                        </Box>
                                    </Box>


                                    {/** Project phase information */}
                                    <Box className="phase-offer">
                                        <Typography variant="body2" color="primary" align="left" >
                                            {
                                                offerInstance.projectDetail.Pitch.fundRequired
                                                    ? `Â£${Number(offerInstance.projectDetail.Pitch.fundRequired.toFixed(2)).toLocaleString()} goal`
                                                    : ""
                                            }
                                        </Typography>

                                        <Box marginTop="5px" >
                                            <Typography variant="body2" align="left" color="textSecondary" >
                                                {
                                                    !isProjectLive(offerInstance.projectDetail)
                                                        ? "Offer expired"
                                                        : `${utils.dateDiff(offerInstance.projectDetail.Pitch.expiredDate)} days to go`
                                                }
                                            </Typography>
                                        </Box>
                                    </Box>


                                    {/** Project visibility information */}
                                    <Box className="badges" color={getGroupRouteTheme(ManageGroupUrlState).palette.primary.main} >
                                        <Box className="public-offer">
                                            <OverlayTrigger
                                                trigger={["hover", "focus"]}
                                                placement="bottom"
                                                flip
                                                overlay={
                                                    <Tooltip id="tooltip-bottom" >
                                                        {
                                                            isProjectPublic(offerInstance.projectDetail)
                                                                ? "This is a public project."
                                                                : isProjectRestricted(offerInstance.projectDetail)
                                                                ? "This is a restricted project."
                                                                : isProjectPrivate(offerInstance.projectDetail)
                                                                    ? "This is a private project."
                                                                    : null
                                                        }
                                                    </Tooltip>
                                                }
                                            >
                                                {
                                                    isProjectPublic(offerInstance.projectDetail)
                                                        ? <PublicIcon/>
                                                        : isProjectRestricted(offerInstance.projectDetail)
                                                        ? <RestrictedIcon/>
                                                        : isProjectPrivate(offerInstance.projectDetail)
                                                            ? <PrivateIcon/>
                                                            : <Box/>
                                                }
                                            </OverlayTrigger>
                                        </Box>
                                    </Box>
                                </Box>
                            </Col>
                        </Row>
                    </Container>
                </Box>
            }
        />;
    }
}

const MemoizedOfferItem = memo(OfferItem, (prevProps, nextProps) => {
    return prevProps.offerInstance.projectDetail.id === nextProps.offerInstance.projectDetail.id && 
           prevProps.offerInstance.projectDetail.edited === nextProps.offerInstance.projectDetail.edited &&
           prevProps.ManageGroupUrlState.group?.anid === nextProps.ManageGroupUrlState.group?.anid &&
           prevProps.AuthenticationState.currentUser?.id === nextProps.AuthenticationState.currentUser?.id;
});

export default connect(mapStateToProps)(MemoizedOfferItem);
