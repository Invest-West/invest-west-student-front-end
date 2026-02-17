import React, { Component } from 'react';
import { connect } from 'react-redux';
import { AppState } from '../../../redux-store/reducers';
import { ThunkDispatch } from 'redux-thunk';
import { AnyAction } from 'redux';
import { resources } from '../Resources';
import { Navigate, useParams } from 'react-router-dom';
import Routes from '../../../router/routes';

const mapStateToProps = (state: AppState) => {
  return {
    MediaQueryState: state.MediaQueryState,
    ManageGroupUrlState: state.ManageGroupUrlState,
    AuthenticationState: state.AuthenticationState,
  };
};

const mapDispatchToProps = (dispatch: ThunkDispatch<any, any, AnyAction>) => {
  return {};
};

class ResourceDetailClass extends Component<any, any> {
  render() {
    const resourceName = this.props.params.resourceName;
    const resourceIndex = resources.findIndex((resource) => resource.name === resourceName);
    if (resourceIndex !== -1) {
      const resource = resources[resourceIndex];
      return resource.page;
    }

    return <Navigate to={Routes.error404} replace />;
  }
}

const ConnectedResourceDetail = connect(mapStateToProps, mapDispatchToProps)(ResourceDetailClass);

function ResourceDetail() {
  const params = useParams();
  return <ConnectedResourceDetail params={params} />;
}

export default ResourceDetail;
