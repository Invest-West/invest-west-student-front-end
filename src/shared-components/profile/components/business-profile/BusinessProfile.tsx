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
    hasErrorFindingAddressForRegisteredOffice,
    hasErrorFindingAddressForTradingAddress,
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
import {findAddress} from "./BusinessProfileActions";
import {getFormattedAddress} from "../../../../models/address";

interface BusinessProfileProps {
    AuthenticationState: AuthenticationState;
    ManageSystemAttributesState: ManageSystemAttributesState;
    ProfileLocalState: ProfileState;
    handleInputFieldChanged: (inputCategory: InputCategories, event: React.ChangeEvent<HTMLInputElement>) => any;
    findAddress: (mode: "registeredOffice" | "tradingAddress") => any;
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
        findAddress: (mode: "registeredOffice" | "tradingAddress") => dispatch(findAddress(mode)),
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
            {/** Company name */}
            <FormControl fullWidth required >
                <FormLabel><b>Company name</b></FormLabel>
                <TextField
                    name="companyName"
                    placeholder="Enter company name"
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

            {/** Registration number */}
            <FormControl fullWidth required >
                <FormLabel> <b>Registration number</b> </FormLabel>
                <TextField
                    name="registrationNo"
                    placeholder="Enter company registration number"
                    // value={
                    //     hasBusinessProfile(copiedUser)
                    //         ? copiedUser.BusinessProfile?.registrationNo
                    //         : ProfileLocalState.BusinessProfileState.newBusinessProfile.registrationNo
                    // }
                    margin="dense"
                    variant="outlined"
                    onChange={this.onInputFieldChanged(InputCategories.BusinessProfile)}
                    // error={copiedUser.firstName.trim().length === 0}
                />
            </FormControl>

            {/** Registered office */}
            {
                this.renderAddressInput("registeredOffice")
            }

            {/** Trading address */}
            {
                this.renderAddressInput("tradingAddress")
            }

            {/** Directors */}
            <FormControl required >
                <Box>
                    <Button
                        variant="outlined"
                        size="small"
                        className={css(sharedStyles.no_text_transform)}
                        // onClick={this.props.toggleAddNewDirector}
                    >
                        <AddIcon fontSize="small" />
                        <Box marginRight="5px" />Add director
                    </Button>
                </Box>

                <Box display="flex" flexDirection="column" >
                    <TextField
                        placeholder="Enter director's name"
                        name="newDirectorText"
                        // value={newDirectorText}
                        fullWidth
                        variant="outlined"
                        // onChange={this.handleEditUser(editUserActions.ADDING_NEW_DIRECTOR)}
                        margin="dense"
                    />

                    <Box display="flex" flexDirection="row" marginTop="8px" justifyContent="flex-end" >
                        <Button
                            variant="outlined"
                            size="small"
                            className={css(sharedStyles.no_text_transform)}
                            // onClick={this.props.toggleAddNewDirector}
                        >Cancel
                        </Button>

                        <Box width="10px" />

                        <Button
                            variant="contained"
                            size="small"
                            color="primary"
                            className={css(sharedStyles.no_text_transform)}
                            // onClick={() => this.props.addNewDirectorTemporarily(false)}
                            // disabled={newDirectorText.trim().length === 0}
                        >Add
                        </Button>
                    </Box>
                </Box>
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
    renderAddressInput = (mode: "registeredOffice" | "tradingAddress") => {
        const {
            ProfileLocalState,
            findAddress,
            // changeAddressFindingState
        } = this.props;

        const copiedUser: User | undefined = ProfileLocalState.copiedUser;

        if (!copiedUser) {
            return null;
        }

        return <FormControl
            required
        >
            <FormLabel>
                <b>
                    {
                        mode === "registeredOffice"
                            ? "Registered office"
                            : "Trading address"
                    }
                </b>
            </FormLabel>
            <FormGroup>
                {
                    mode !== "tradingAddress"
                        ? null
                        : <FormControlLabel
                            label="Same as registered office address"
                            labelPlacement="end"
                            control={
                                <Checkbox
                                    name="tradingAddressSameAsRegisteredOffice"
                                    checked={ProfileLocalState.BusinessProfileState.tradingAddressSameAsRegisteredOffice}
                                    color="primary"
                                    onChange={this.onInputFieldChanged(InputCategories.BusinessProfileCheckBox)}
                                />
                            }
                        />
                }

                {/** Trading address - showed when Trading address is different from Registered office */}
                {
                    mode === "tradingAddress"
                    && ProfileLocalState.BusinessProfileState.tradingAddressSameAsRegisteredOffice
                        ? null
                        : <Box display="flex" flexDirection="column" >
                            <FormHelperText> Enter a UK postcode </FormHelperText>

                            {/** Enter postcode to find address automatically */}
                            {
                                (mode === "registeredOffice")
                                // && ProfileLocalState.BusinessProfileState.addressFindingStateForRegisteredOffice !== AddressFindingStates.DisplayFoundAddresses)
                                || (mode === "tradingAddress")
                                    // && ProfileLocalState.BusinessProfileState.addressFindingStateForRegisteredOffice !== AddressFindingStates.DisplayFoundAddresses)
                                    ? <Box
                                        display="flex"
                                        flexDirection="column"
                                    >
                                        <TextField
                                            name="postcode"
                                            placeholder="Postcode"
                                            // value={
                                            //     hasBusinessProfile(copiedUser)
                                            //         ? mode === "registeredOffice"
                                            //         ? copiedUser.BusinessProfile?.registeredOffice.postcode
                                            //         : copiedUser.BusinessProfile?.tradingAddress.postcode
                                            //         : mode === "registeredOffice"
                                            //         ? ProfileLocalState.BusinessProfileState.newBusinessProfile.registeredOffice.postcode
                                            //         : ProfileLocalState.BusinessProfileState.newBusinessProfile.tradingAddress.postcode
                                            // }
                                            margin="dense"
                                            variant="outlined"
                                            onChange={this.onInputFieldChanged(mode === "registeredOffice" ? InputCategories.RegisteredOffice : InputCategories.TradingAddress)}
                                            // error={copiedUser.firstName.trim().length === 0}
                                        />

                                        {/** Error text - displayed when postcode cannot be found */}
                                        {
                                            (mode === "registeredOffice" && hasErrorFindingAddressForRegisteredOffice(ProfileLocalState.BusinessProfileState))
                                            || (mode === "tradingAddress" && hasErrorFindingAddressForTradingAddress(ProfileLocalState.BusinessProfileState))
                                                ? <Typography variant="body2" color="error" align="left">
                                                    Sorry, we can't find your address, please check the details entered and search
                                                    again.
                                                  </Typography>
                                                : null
                                        }

                                        <Box>
                                            <Button className={css(sharedStyles.no_text_transform)} variant="contained" color="primary" onClick={() => findAddress(mode)} >
                                                {
                                                    (mode === "registeredOffice")
                                                    // && ProfileLocalState.BusinessProfileState.addressFindingStateForRegisteredOffice === AddressFindingStates.FindingAddresses)
                                                    || (mode === "tradingAddress")
                                                        // && ProfileLocalState.BusinessProfileState.addressFindingStateForTradingAddress === AddressFindingStates.FindingAddresses)
                                                        ? "Finding address ..."
                                                        : "Find address"
                                                }
                                                <Box width="6px" />
                                                <KeyboardArrowRight/>
                                            </Button>
                                        </Box>
                                    </Box>
                                    : null
                            }

                            {/** Select address from found addresses */}
                            {
                                (mode === "registeredOffice") // && ProfileLocalState.BusinessProfileState.addressFindingStateForRegisteredOffice === AddressFindingStates.DisplayFoundAddresses)
                                || (mode === "tradingAddress") // && ProfileLocalState.BusinessProfileState.addressFindingStateForTradingAddress === AddressFindingStates.DisplayFoundAddresses)
                                    ? <Box display="flex" flexDirection="column" >
                                        <Box display="flex" flexDirection="row" >
                                            <Typography variant="body1" align="left" > Select an address </Typography>
                                            <Button
                                                className={css(sharedStyles.no_text_transform)}
                                                variant="outlined"
                                                // onClick={() => changeAddressFindingState(mode, AddressFindingStates.EnterPostcode)}
                                            >
                                                Change
                                            </Button>
                                        </Box>
                                        <Select
                                            name={mode}
                                            value={
                                                hasBusinessProfile(copiedUser)
                                                    ? mode === "registeredOffice"
                                                    ? getFormattedAddress(copiedUser.BusinessProfile?.registeredOffice)
                                                    : getFormattedAddress(copiedUser.BusinessProfile?.tradingAddress)
                                                    : mode === "registeredOffice"
                                                    ? getFormattedAddress(ProfileLocalState.BusinessProfileState.editedBusinessProfile.registeredOffice)
                                                    : getFormattedAddress(ProfileLocalState.BusinessProfileState.editedBusinessProfile.tradingAddress)
                                            }
                                            input={<OutlinedInput/>}
                                            margin="dense"
                                            // @ts-ignore
                                            onChange={this.onInputFieldChanged(mode === "registeredOffice"
                                                ? InputCategories.RegisteredOffice : InputCategories.TradingAddress)}
                                        >
                                            <MenuItem key={-1} value={"none"}>Addresses found</MenuItem>
                                            {
                                                mode === "registeredOffice" && ProfileLocalState.BusinessProfileState.foundAddressesForRegisteredOffice
                                                    ? ProfileLocalState.BusinessProfileState.foundAddressesForRegisteredOffice.map(address => (
                                                        <MenuItem key={getFormattedAddress(address)} value={getFormattedAddress(address)}>{getFormattedAddress(address)}</MenuItem>
                                                    ))
                                                    : null
                                            }
                                            {
                                                mode === "tradingAddress" && ProfileLocalState.BusinessProfileState.foundAddressesForTradingAddress
                                                    ? ProfileLocalState.BusinessProfileState.foundAddressesForTradingAddress.map(address => (
                                                        <MenuItem key={getFormattedAddress(address)} value={getFormattedAddress(address)} >{getFormattedAddress(address)}</MenuItem>
                                                    ))
                                                    : null
                                            }
                                        </Select>
                                    </Box>
                                    : null
                            }
                        </Box>
                }
            </FormGroup>
        </FormControl>;
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(BusinessProfile);