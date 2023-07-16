import { Card, Stack, Typography, useTheme } from "@mui/material";
import { FC, useMemo } from "react";
import { tokens } from "../contexts/theme";
import { noop } from "lodash";
import TaskAltIcon from "@mui/icons-material/TaskAlt";
import InfoIcon from "@mui/icons-material/Info";

const ClientAppCard: FC<{
	label: string;
	icon?: string;
	description?: string;
	onClick?: (e: any) => void;
	selected?: boolean;
	disabled?: boolean;
}> = ({ label, description, selected, onClick = noop, disabled, icon }) => {
	const theme: any = useTheme();
	const colors = useMemo(() => tokens(theme.palette.mode), [theme]);

	return (
		<Card
			sx={{
				position: "relative",
				height: "12rem",
				width: "14rem",
				padding: 2,
				border: 2,
				borderRadius: 2,
				borderColor: colors.primary[400],
				backgroundColor: "transparent",
				...(disabled
					? {}
					: {
							"&:hover": {
								boxShadow: 10,
								borderColor: colors.primary[600],
							},
					  }),
				cursor: disabled ? "default" : "pointer",
				...(selected
					? {
							// backgroundColor: colors.bg[100],
							background: `linear-gradient(${colors.primary[100]}, ${colors.bg[100]})`,
					  }
					: {}),
			}}
			onClick={(e) => {
				if (!disabled) onClick(e);
			}}
		>
			<Typography variant="h1" textAlign={"center"}>
				{icon && (
					<img
						src={`${process.env.PUBLIC_URL}/assets/${icon}`}
						height={30}
					/>
				)}
				{label}
			</Typography>
			<Typography variant="body1" textAlign={"center"}>
				{description}
			</Typography>
			{disabled && (
				<Stack direction={"row"} justifyContent={'center'} marginTop={2}>
					<InfoIcon
						sx={{ color: colors.red[100], fontSize: 13, mr: "2px" }}
					/>
					<Typography
						variant="body2"
						fontSize={10}
						color={colors.red[100]}
					>
						Coming soon
					</Typography>
				</Stack>
			)}
			{selected && (
				<TaskAltIcon
					sx={{ position: "absolute", right: 5, bottom: 5 }}
				/>
			)}
		</Card>
	);
};

export default ClientAppCard;
