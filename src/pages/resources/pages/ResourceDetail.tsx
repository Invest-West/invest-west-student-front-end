import React, {Component} from "react";
import {connect} from "react-redux";
import {AppState} from "../../../redux-store/reducers";
import {ThunkDispatch} from "redux-thunk";
import {AnyAction} from "redux";
import {resources} from "../Resources";
import {Redirect} from "react-router-dom";
import Routes from "../../../router/routes";

const mapStateToProps = (state: AppState) => {
    return {
        MediaQueryState: state.MediaQueryState,
        ManageGroupUrlState: state.ManageGroupUrlState,
        AuthenticationState: state.AuthenticationState
    }
}

const mapDispatchToProps = (dispatch: ThunkDispatch<any, any, AnyAction>) => {
    return {}
}

class ResourceDetail extends Component<any, any> {
    render() {
        const resourceName = this.props.match.params.resourceName;
        const resourceIndex = resources.findIndex(resource => resource.name === resourceName);
        if (resourceIndex !== -1) {
            const resource = resources[resourceIndex];
            return resource.page;
        }

        return <Redirect to={Routes.error404}/>;
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(ResourceDetail);