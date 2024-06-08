import React, {Component} from "react";
import {connect} from "react-redux";
import {AppState} from "../../redux-store/reducers";
import {ThunkDispatch} from "redux-thunk";
import {AnyAction} from "redux";
import {Slide, SlideProps, Snackbar} from "@material-ui/core";
import {FeedbackSnackbarState} from "./FeedbackSnackbarReducer";
import {closeFeedbackSnackbar} from "./FeedbackSnackbarActions";
import {Alert} from "@material-ui/lab";

interface FeedbackSnackbarProps {
    FeedbackSnackbarLocalState: FeedbackSnackbarState;
    close: () => any;
}

const mapStateToProps = (state: AppState) => {
    return {
        FeedbackSnackbarLocalState: state.FeedbackSnackbarLocalState
    }
}

const mapDispatchToProps = (dispatch: ThunkDispatch<any, any, AnyAction>) => {
    return {
        close: () => dispatch(closeFeedbackSnackbar())
    }
}

class FeedbackSnackbarNew extends Component<FeedbackSnackbarProps, any> {
    render() {
        const {
            FeedbackSnackbarLocalState,
            close
        } = this.props;

        return <Snackbar
            open={FeedbackSnackbarLocalState.open}
            anchorOrigin={{
                vertical: "bottom",
                horizontal: "center",
            }}
            autoHideDuration={2500}
            onClose={close}
            TransitionComponent={SlideTransitionUp}
            transitionDuration={{
                enter: 130,
                exit: 130
            }}
        >
            <Alert variant="filled" severity={FeedbackSnackbarLocalState.type} onClose={close}>{FeedbackSnackbarLocalState.message}</Alert>
        </Snackbar>;
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(FeedbackSnackbarNew);

/**
 * Slide transition - direction up
 *
 * @param props
 * @returns {*}
 * @constructor
 */
export const SlideTransitionUp = React.forwardRef((props: SlideProps, ref) => <Slide {...props} ref={ref}
                                                                                     direction="up"/>);