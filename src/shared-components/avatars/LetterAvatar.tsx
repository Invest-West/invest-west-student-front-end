import React, {Component} from 'react';
import {Avatar, Typography} from '@material-ui/core';

import * as appColors from '../../values/colors';

interface LetterAvatarProps {
    firstName: string;
    lastName: string;
    width: number;
    height: number;
    textVariant: "body1" | "body2" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6"
}

export default class LetterAvatar extends Component<LetterAvatarProps, any> {
    render() {
        const {
            firstName,
            lastName,
            width,
            height,
            textVariant
        } = this.props;

        return (
            <Avatar
                style={{ color: appColors.white, backgroundColor: this.getBackgroundColor(), width: width, height: height }}
            >
                <Typography
                    variant={textVariant}
                >
                    {`${firstName[0].toUpperCase()}${lastName[0].toUpperCase()}`}
                </Typography>
            </Avatar>
        );
    }

    getBackgroundColor = () => {
        const {firstName} = this.props;

        switch (firstName[0].toLowerCase()) {
            case "a":
                return appColors.background_a;
            case "b":
                return appColors.background_b;
            case "c":
                return appColors.background_c;
            case "d":
                return appColors.background_d;
            case "e":
                return appColors.background_e;
            case "f":
                return appColors.background_f;
            case "g":
                return appColors.background_g;
            case "h":
                return appColors.background_h;
            case "i":
                return appColors.background_i;
            case "j":
                return appColors.background_j;
            case "k":
                return appColors.background_k;
            case "l":
                return appColors.background_l;
            case "m":
                return appColors.background_m;
            case "n":
                return appColors.background_n;
            case "o":
                return appColors.background_o;
            case "p":
                return appColors.background_p;
            case "q":
                return appColors.background_q;
            case "r":
                return appColors.background_r;
            case "s":
                return appColors.background_s;
            case "t":
                return appColors.background_t;
            case "u":
                return appColors.background_u;
            case "v":
                return appColors.background_v;
            case "w":
                return appColors.background_w;
            case "x":
                return appColors.background_x;
            case "y":
                return appColors.background_y;
            case "z":
                return appColors.background_z;
            default:
                return;
        }
    }
}