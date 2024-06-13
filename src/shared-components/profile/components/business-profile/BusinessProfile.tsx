import React, {Component} from "react";
import {connect} from "react-redux";
import {AppState} from "../../../../redux-store/reducers";
import {ThunkDispatch} from "redux-thunk";
import {AnyAction} from "redux";
import {
    Box,
    Button,
    Checkbox,
    FormControl,
    FormControlLabel,
    FormGroup,
    FormHelperText,
    FormLabel,
    MenuItem,
    OutlinedInput,
    Select,
    TextField,
    Typography
} from "@material-ui/core";
import {AuthenticationState} from "../../../../redux-store/reducers/authenticationReducer";
import {
    ProfileState
} from "../../ProfileReducer";
import User, {hasBusinessProfile} from "../../../../models/user";
import Admin, {isAdmin} from "../../../../models/admin";
import {css} from "aphrodite";
import sharedStyles from "../../../../shared-js-css-styles/SharedStyles";
import AddIcon from "@material-ui/icons/Add";
import {ManageSystemAttributesState} from "../../../../redux-store/reducers/manageSystemAttributesReducer";
import {handleInputFieldChanged, InputCategories} from "../../ProfileActions";
import {KeyboardArrowRight} from "@material-ui/icons";
import {getFormattedAddress} from "../../../../models/address";

interface BusinessProfileProps {
    AuthenticationState: AuthenticationState;
    ManageSystemAttributesState: ManageSystemAttributesState;
    ProfileLocalState: ProfileState;
    handleInputFieldChanged: (inputCategory: InputCategories, event: React.ChangeEvent<HTMLInputElement>) => any;
    // changeAddressFindingState: (mode: "registeredOffice" | "tradingAddress", addressFindingState: AddressFindingStates) => any;
}

const mapStateToProps = (state: AppState) => {
    return {
        AuthenticationState: state.AuthenticationState,
        ManageSystemAttributesState: state.ManageSystemAttributesState,
        ProfileLocalState: state.ProfileLocalState
    }
}

const mapDispatchToProps = (dispatch: ThunkDispatch<any, any, AnyAction>) => {
    return {
        handleInputFieldChanged: (inputCategory: InputCategories, event: React.ChangeEvent<HTMLInputElement>) => dispatch(handleInputFieldChanged(inputCategory, event)),
        // changeAddressFindingState: (mode: "registeredOffice" | "tradingAddress", addressFindingState: AddressFindingStates) => dispatch(changeAddressFindingState(mode, addressFindingState))
    }
}

class BusinessProfile extends Component<BusinessProfileProps, any> {

    onInputFieldChanged = (inputCategory: InputCategories) => (event: React.ChangeEvent<HTMLInputElement>) => {
        this.props.handleInputFieldChanged(inputCategory, event);
    }

    render() {
        const {
            AuthenticationState,
            ProfileLocalState
        } = this.props;

        const currentUser: User | Admin | null = AuthenticationState.currentUser;
        if (!currentUser) {
            return null;
        }

        const currentAdmin: Admin | null = isAdmin(currentUser);

        const copiedUser: User | undefined = ProfileLocalState.copiedUser;

        if (!copiedUser) {
            return null;
        }

        return <Box
            display="flex"
            flexDirection="column"
        >
            {/** Section title */}
            <Box>
                <Typography variant="h6" color="primary" > Business profile </Typography>
            </Box>
            <Box height="25px" />
            {/** Edit Business profile */}
            {
                this.renderEditBusinessProfile()
            }
        </Box>;
    }

    /**
     * Render Business profile in Edit mode
     */
    renderEditBusinessProfile = () => {
        const {
            ManageSystemAttributesState,
            ProfileLocalState
        } = this.props;

        const copiedUser: User | undefined = ProfileLocalState.copiedUser;

        if (!copiedUser) {
            return null;
        }

        return <Box
            display="flex"
            flexDirection="column"
        >
            {/** Student project name */}
            <FormControl fullWidth required >
                <FormLabel><b>Student project name</b></FormLabel>
                <TextField
                    name="companyName"
                    placeholder="Enter Student project name"
                    // value={
                    //     hasBusinessProfile(copiedUser)
                    //         ? copiedUser.BusinessProfile?.companyName
                    //         : ProfileLocalState.BusinessProfileState.newBusinessProfile.companyName
                    // }
                    margin="dense"
                    variant="outlined"
                    onChange={this.onInputFieldChanged(InputCategories.BusinessProfile)}
                    // error={copiedUser.firstName.trim().length === 0}
                />
            </FormControl>

            {/** Sector */}
            <FormControl required >
                <FormLabel> <b>Business sector</b> </FormLabel>
                <Select
                    name="sector"
                    // value={
                    //     hasBusinessProfile(copiedUser)
                    //         ? copiedUser.BusinessProfile?.sector
                    //         : ProfileLocalState.BusinessProfileState.newBusinessProfile.sector
                    // }
                    input={<OutlinedInput/>}
                    margin="dense"
                    // @ts-ignore
                    onChange={this.onInputFieldChanged(InputCategories.BusinessProfile)}
                >
                    <MenuItem key={-1} value={"none"}>Choose business sector</MenuItem>
                    {
                        !ManageSystemAttributesState.systemAttributes
                            ? null
                            : ManageSystemAttributesState.systemAttributes.Sectors.map((sector, index) => (
                                <MenuItem key={index} value={sector}>{sector}</MenuItem>
                            ))
                    }
                </Select>
            </FormControl>

            {/** Company website */}
            <FormControl required >
                <FormLabel><b>Company website</b></FormLabel>
                <TextField
                    placeholder="Enter company website"
                    name="companyWebsite"
                    // value={
                    //     hasBusinessProfile(copiedUser)
                    //         ? copiedUser.BusinessProfile?.companyWebsite
                    //         : ProfileLocalState.BusinessProfileState.newBusinessProfile.companyWebsite
                    // }
                    fullWidth
                    variant="outlined"
                    required
                    margin="dense"
                    onChange={this.onInputFieldChanged(InputCategories.BusinessProfile)}
                />
            </FormControl>

            <Box display="flex" flexDirection="row" justifyContent="flex-end">
                <Button
                    variant="outlined"
                    size="small"
                    className={css(sharedStyles.no_text_transform)}
                    // onClick={this.props.toggleAddNewDirector}
                >Cancel
                </Button>

                <Box width="10px"/>

                <Button
                    variant="contained"
                    size="small"
                    color="primary"
                    className={css(sharedStyles.no_text_transform)}
                    // onClick={() => this.props.addNewDirectorTemporarily(false)}
                    // disabled={newDirectorText.trim().length === 0}
                >
                    Save
                </Button>
            </Box>
        </Box>;
    }

    /**
     * Render address component
     *
     * @param mode
     */
}

export default connect(mapStateToProps, mapDispatchToProps)(BusinessProfile);