import React, {Component} from "react";
import {connect} from "react-redux";
import {ThunkDispatch} from "redux-thunk";
import {AnyAction} from "redux";
import {AppState} from "../../../../redux-store/reducers";

const mapStateToProps = (state: AppState) => {
    return {

    }
}

const mapDispatchToProps = (dispatch: ThunkDispatch<any, any, AnyAction>) => {
    return {

    }
}

class AddressFinder extends Component<any, any> {
    render() {
        return undefined;
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(AddressFinder);