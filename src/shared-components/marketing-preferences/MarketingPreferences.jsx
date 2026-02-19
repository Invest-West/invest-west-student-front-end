import React, { useEffect } from 'react';
import FlexView from 'react-flexview';
import { Typography } from '@mui/material';
import { HashLoader } from 'react-spinners';

import * as colors from '../../values/colors';
import * as DB_CONST from '../../firebase/databaseConsts';

import { useAppSelector, useAppDispatch } from '../../redux-store/hooks';
import * as manageMarketingPreferences from '../../redux-store/actions/manageMarketingPreferencesActions';

const MarketingPreferences = () => {
  const dispatch = useAppDispatch();
  const shouldLoadOtherData = useAppSelector(
    (state) => state.manageGroupFromParams.shouldLoadOtherData
  );
  const groupProperties = useAppSelector((state) => state.manageGroupFromParams.groupProperties);
  const marketingPreferences = useAppSelector(
    (state) => state.manageMarketingPreferences.marketingPreferences
  );
  const loadingMarketingPreferences = useAppSelector(
    (state) => state.manageMarketingPreferences.loadingMarketingPreferences
  );
  const marketingPreferencesLoaded = useAppSelector(
    (state) => state.manageMarketingPreferences.marketingPreferencesLoaded
  );

  useEffect(() => {
    if (shouldLoadOtherData && !loadingMarketingPreferences && !marketingPreferencesLoaded) {
      dispatch(manageMarketingPreferences.loadMarketingPreferences());
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const acceptedMarketingPreferences = [];
  const rejectedMarketingPreferences = [];

  const investorsAccepted = [];
  const issuersAccepted = [];
  const investorsRejected = [];
  const issuersRejected = [];

  if (marketingPreferencesLoaded) {
    marketingPreferences.forEach((marketingPreference) => {
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

  return !marketingPreferencesLoaded ? (
    <FlexView width="100%" hAlignContent="center" marginBottom={20}>
      <HashLoader
        color={!groupProperties ? colors.primaryColor : groupProperties.settings.primaryColor}
      />
    </FlexView>
  ) : (
    <FlexView column width="100%">
      <Typography variant="body1" align="left" paragraph>
        <b>Total:</b>&nbsp;&nbsp;&nbsp;
        {marketingPreferences.length} results
      </Typography>

      <Typography variant="body1" align="left" component="span">
        <b>Total accepted:</b>&nbsp;&nbsp;&nbsp;
        {acceptedMarketingPreferences.length} with
        <ul>
          <li>{investorsAccepted.length} investors</li>
          <li>{issuersAccepted.length} issuers</li>
        </ul>
      </Typography>

      <Typography variant="body1" align="left" paragraph component="span">
        <b>Total rejected:</b>&nbsp;&nbsp;&nbsp;
        {rejectedMarketingPreferences.length} with
        <ul>
          <li>{investorsRejected.length} investors</li>
          <li>{issuersRejected.length} issuers</li>
        </ul>
      </Typography>
    </FlexView>
  );
};

export default MarketingPreferences;
