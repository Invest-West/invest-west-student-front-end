import React, {Component} from 'react';
import FlexView from 'react-flexview';
import {Typography} from '@material-ui/core';
import {HashLoader} from 'react-spinners';

import * as colors from '../../values/colors';
import * as DB_CONST from '../../firebase/databaseConsts';

import {connect} from 'react-redux';
import * as manageMarketingPreferences from '../../redux-store/actions/manageMarketingPreferencesActions';

const mapStateToProps = state => {
    return {
        groupUserName: state.manageGroupFromParams.groupUserName,
        groupPropertiesLoaded: state.manageGroupFromParams.groupPropertiesLoaded,
        groupProperties: state.manageGroupFromParams.groupProperties,
        shouldLoadOtherData: state.manageGroupFromParams.shouldLoadOtherData,

        marketingPreferences: state.manageMarketingPreferences.marketingPreferences,
        loadingMarketingPreferences: state.manageMarketingPreferences.loadingMarketingPreferences,
        marketingPreferencesLoaded: state.manageMarketingPreferences.marketingPreferencesLoaded
    }
};

const mapDispatchToProps = dispatch => {
    return {
        loadMarketingPreferences: () => dispatch(manageMarketingPreferences.loadMarketingPreferences())
    }
};

class MarketingPreferences extends Component {

    componentDidMount() {
        this.loadData();
    }

    /**
     * Load data
     */
    loadData = () => {
        const {
            shouldLoadOtherData,

            loadingMarketingPreferences,
            marketingPreferencesLoaded,

            loadMarketingPreferences
        } = this.props;

        if (shouldLoadOtherData) {
            if (!loadingMarketingPreferences && !marketingPreferencesLoaded) {
                loadMarketingPreferences();
            }
        }
    }

    render() {
        const {
            groupProperties,
            marketingPreferences,
            marketingPreferencesLoaded
        } = this.props;

        let acceptedMarketingPreferences = [];
        let rejectedMarketingPreferences = [];

        let investorsAccepted = [];
        let issuersAccepted = [];
        let investorsRejected = [];
        let issuersRejected = [];

        if (marketingPreferencesLoaded) {
            marketingPreferences.forEach(marketingPreference => {
                if (marketingPreference.accepted) {
                    acceptedMarketingPreferences.push(marketingPreference);
                    if (marketingPreference.user.type === DB_CONST.TYPE_INVESTOR) {
                        investorsAccepted.push(marketingPreference);
                    } else {
                        issuersAccepted.push(marketingPreference);
                    }
                } else {
                    rejectedMarketingPreferences.push(marketingPreference);
                    if (marketingPreference.user.type === DB_CONST.TYPE_INVESTOR) {
                        investorsRejected.push(marketingPreference);
                    } else {
                        issuersRejected.push(marketingPreference);
                    }
                }
            });
        }

        return (
            !marketingPreferencesLoaded
                ?
                <FlexView width="100%" hAlignContent="center" marginBottom={20} >
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
                <FlexView column width="100%" >
                    <Typography variant="body1" align="left" paragraph >
                        <b>Total:</b>&nbsp;&nbsp;&nbsp;
                        {marketingPreferences.length} results
                    </Typography>

                    <Typography variant="body1" align="left" component="span" >
                        <b>Total accepted:</b>&nbsp;&nbsp;&nbsp;
                        {acceptedMarketingPreferences.length} with
                        <ul>
                            <li>{investorsAccepted.length} investors</li>
                            <li>{issuersAccepted.length} issuers</li>
                        </ul>
                    </Typography>

                    <Typography variant="body1" align="left" paragraph component="span" >
                        <b>Total rejected:</b>&nbsp;&nbsp;&nbsp;
                        {rejectedMarketingPreferences.length} with
                        <ul>
                            <li>{investorsRejected.length} investors</li>
                            <li>{issuersRejected.length} issuers</li>
                        </ul>
                    </Typography>
                </FlexView>
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(MarketingPreferences);