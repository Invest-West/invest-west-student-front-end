import React, {Component} from 'react';
import {OverlayTrigger, Tooltip} from 'react-bootstrap';
import InfoIcon from '@material-ui/icons/Info';
import * as colors from '../../values/colors';

export default class InfoOverlay extends Component {
    render() {
        const {
            message,
            placement
        } = this.props;

        return (
            <OverlayTrigger
                trigger={['hover', 'focus']}
                placement={placement}
                flip
                overlay={ <Tooltip id={`tooltip-${placement}`}>{message}</Tooltip> }
            >
                <InfoIcon fontSize="small" style={{ color: colors.gray_600 }}/>
            </OverlayTrigger>
        );
    }
}