import { createTheme } from '@mui/material/styles';
export const THEME_PRIMARY = '#f5f4ef';
export const THEME_GOLD = '#9F8A46';
const theme = createTheme({
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    backgroundColor: THEME_PRIMARY,
                    color: '#fff',
                    '&:hover': {
                        backgroundColor: THEME_PRIMARY,
                    },
                },
            },
        },
        MuiTextField:{
            styleOverrides:{
                root:{
                    '& label.Mui-focused': { color: THEME_PRIMARY, }, 
                    '& .MuiOutlinedInput-root': {
                        '&.Mui-focused fieldset': { borderColor: THEME_PRIMARY, }, 
                    },
                }
            }
        }
    },
});

export default theme;