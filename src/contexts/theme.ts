import createTheme from "@mui/material/styles/createTheme";
import { createContext, useState, useMemo } from "react";

// color design tokens export
type ThemeMode = "dark" | "light";
export const tokens = (mode: ThemeMode) => ({
	...(mode === "dark"
		? {
        bg: {
          [100]: '#28282B'
        },
				primary: {
					100: "#080808",
          150: "#181818",
					200: "#202020",
					300: "#282828",
					400: "#383838",
					500: "#484848",
					600: "#D3D3D3",
					700: "#F5F5F5",
					800: "#F8F8F8",
					900: "#FFFFFF",
				},
        red: {
          100: "#FF0800"
        },
        green: {
          100: "#1CAC78"
        }
		  }
		: {
        bg: {
          [100]: '#BED3E5'
        },
				primary: {
					100: "#FFFFFF",
					150: "#F8F8F8",
					200: "#F5F5F5",
					300: "#D3D3D3", 
					400: "#484848",
					500: "#383838",
					600: "#282828",
					700: "#202020",
					800: "#181818",
          900: "#080808",
				},
        red: {
          100: "#FF0800"
        },
        green: {
          100: "#1CAC78"
        }
		  }),
});

// mui theme settings
export const themeSettings = (mode: ThemeMode) => {
	const colors = tokens(mode);
	return {
		palette: {
			mode: mode,
			primary: {
        main: colors.primary[900],
      },
      secondary: {
        main: colors.primary[600],
      },
      // neutral: {
      //   dark: colors.primary[300],
      //   main: colors.primary[300],
      //   light: colors.primary[900],
      // },
      background: {
        default: colors.primary[100],
      },
		},
		typography: {
			fontFamily: ["Source Sans Pro", "sans-serif"].join(","),
			fontSize: 12,
			h1: {
				fontFamily: ["Source Sans Pro", "sans-serif"].join(","),
				fontSize: 40,
			},
			h2: {
				fontFamily: ["Source Sans Pro", "sans-serif"].join(","),
				fontSize: 32,
			},
			h3: {
				fontFamily: ["Source Sans Pro", "sans-serif"].join(","),
				fontSize: 24,
			},
			h4: {
				fontFamily: ["Source Sans Pro", "sans-serif"].join(","),
				fontSize: 20,
			},
			h5: {
				fontFamily: ["Source Sans Pro", "sans-serif"].join(","),
				fontSize: 16,
			},
			h6: {
				fontFamily: ["Source Sans Pro", "sans-serif"].join(","),
				fontSize: 14,
			},
		},
	};
};

// context for color mode
export const ColorModeContext = createContext<{
	toggleColorMode: () => void;
}>({
	toggleColorMode: () => {},
});

export const useMode = () => {
	const [mode, setMode] = useState<ThemeMode>("dark");
	const toggleColorMode = () =>
		setMode((prev) => (prev === "light" ? "dark" : "light"));

	const theme = useMemo(() => createTheme(themeSettings(mode)), [mode]);
	return {theme, toggleColorMode};
};
