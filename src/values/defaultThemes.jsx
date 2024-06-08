import { createMuiTheme, responsiveFontSizes } from '@material-ui/core/styles';
import * as colors from '../values/colors';

export const defaultTheme = responsiveFontSizes(createMuiTheme({
    palette: {
        primary: {
            main: colors.primaryColor
        },

        secondary: {
            main: colors.secondaryColor
        },

        text: {
            secondary: colors.blue_gray_700,
        }
    },
    typography: {
        fontFamily: "Muli, sans-serif"
    }
}));