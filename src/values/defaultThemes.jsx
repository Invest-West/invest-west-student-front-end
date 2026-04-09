import { createTheme, responsiveFontSizes, adaptV4Theme } from '@mui/material/styles';
import * as colors from '../values/colors';

export const defaultTheme = responsiveFontSizes(
  createTheme(
    adaptV4Theme({
      palette: {
        primary: {
          main: colors.primaryColor,
        },

        secondary: {
          main: colors.secondaryColor,
        },

        text: {
          secondary: colors.blue_gray_700,
        },
      },
      typography: {
        fontFamily: 'Muli, sans-serif',
      },
    })
  )
);
