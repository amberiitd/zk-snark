import { useTheme } from "@emotion/react";
import { Grow, Typography } from "@mui/material";
import { FC, useMemo } from "react";
import { tokens } from "../contexts/theme";

const GradientText: FC<{
	children?: any;
	variant?: string;
	style?: any;
	start?: number;
	end?: number;
  reverse?: boolean;
}> = ({ children, variant = "h4", style = {}, start = 10, end = 100, reverse }) => {
	const theme: any = useTheme();
	const colors = useMemo(() => tokens(theme.palette.mode), [theme]);

	return (
		<Grow in={true} timeout={1000}>
			<Typography
				textAlign={"center"}
				// variant={variant as any}
				sx={{
					...style,
					background: `-webkit-linear-gradient(${reverse? 200: 20}deg, ${colors.primary[900]} ${start}%, ${colors.bg[100]} ${end}%)`,
					WebkitBackgroundClip: "text",
					WebkitTextFillColor: "transparent",
				}}
			>
				{children}
			</Typography>
		</Grow>
	);
};

export default GradientText;
