import React, { Component } from 'react';
import {
    Avatar,
    Typography
} from '@material-ui/core';

import * as colors from '../../values/colors';

export default class LetterAvatar extends Component {
    render() {
        const {
            firstName,
            lastName,
            width,
            height,
            textVariant
        } = this.props;

        // Handle undefined or empty names
        if (!firstName || !lastName || firstName.length === 0 || lastName.length === 0) {
            return (
                <Avatar
                    style={{
                        color: colors.white,
                        backgroundColor: colors.gray_400,
                        width: width,
                        height: height
                    }}
                >
                    <Typography variant={textVariant}>
                        ?
                    </Typography>
                </Avatar>
            );
        }

        return (
            <Avatar
                style={{
                    color: colors.white,
                    backgroundColor: this.getBackgroundColor(),
                    width: width,
                    height: height
                }}
            >
                <Typography variant={textVariant}>
                    {`${firstName[0].toUpperCase()}${lastName[0].toUpperCase()}`}
                </Typography>
            </Avatar>
        );
    }

    getBackgroundColor = () => {
        const { firstName } = this.props;

        // Handle undefined or empty firstName
        if (!firstName || firstName.length === 0) {
            return colors.gray_400;
        }

        switch (firstName[0].toLowerCase()) {
            case "a":
                return colors.background_a;
            case "b":
                return colors.background_b;
            case "c":
                return colors.background_c;
            case "d":
                return colors.background_d;
            case "e":
                return colors.background_e;
            case "f":
                return colors.background_f;
            case "g":
                return colors.background_g;
            case "h":
                return colors.background_h;
            case "i":
                return colors.background_i;
            case "j":
                return colors.background_j;
            case "k":
                return colors.background_k;
            case "l":
                return colors.background_l;
            case "m":
                return colors.background_m;
            case "n":
                return colors.background_n;
            case "o":
                return colors.background_o;
            case "p":
                return colors.background_p;
            case "q":
                return colors.background_q;
            case "r":
                return colors.background_r;
            case "s":
                return colors.background_s;
            case "t":
                return colors.background_t;
            case "u":
                return colors.background_u;
            case "v":
                return colors.background_v;
            case "w":
                return colors.background_w;
            case "x":
                return colors.background_x;
            case "y":
                return colors.background_y;
            case "z":
                return colors.background_z;
            default:
                return colors.gray_400;
        }
    }
}