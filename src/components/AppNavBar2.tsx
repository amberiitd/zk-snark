import { Button, IconButton, Stack, Typography } from "@mui/material";
import Box from "@mui/material/Box";
import { useContext } from "react";
import { ColorModeContext } from "../contexts/theme";
import { useTheme } from "@emotion/react";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import { PageContext } from "../contexts/page";
import { MetaMaskAvatar } from "react-metamask-avatar";
import { AuthContext } from "../contexts/auth";
import NetworkSelector from "./NetworkSelector";
import { Link } from "react-router-dom";

const AppNavBar = () => {
	return (
		<Box display={"flex"} p={2} alignItems={"center"}>
      <AppIcon />
			<Stack marginLeft={"auto"} spacing={2} direction={"row"}>
				<ThemeToggler />
				<NetworkSelector />
				<Connector />
			</Stack>
		</Box>
	);
};

export default AppNavBar;

const AppIcon = () => {
	return (
		<Link to="/home">
			<img
				src={`${process.env.PUBLIC_URL}/assets/logo2.png`}
				height="30px"
				width="30px"
			/>
		</Link>
	);
};

const ThemeToggler = () => {
	const colorMode = useContext(ColorModeContext);
	const theme: any = useTheme();
	return (
		<IconButton onClick={colorMode.toggleColorMode} size="small">
			{theme.palette.mode === "dark" ? (
				<DarkModeOutlinedIcon />
			) : (
				<LightModeOutlinedIcon />
			)}
		</IconButton>
	);
};

const Connector = () => {
	const { screenSize, connectDrawer, setConnectDrawer } =
		useContext(PageContext);
	const { account } = useContext(AuthContext);

	return (
		<Button
			variant="outlined"
			onClick={() => setConnectDrawer(true)}
			disabled={connectDrawer}
		>
			{account?.code ? (
				<>
					<MetaMaskAvatar address={account.code} size={20} />
					<Typography ml={1} fontWeight={600}>
						{account.code.slice(0, 6) +
							"..." +
							account.code.slice(account.code.length - 4)}
					</Typography>
				</>
			) : (
				"Connect"
			)}
		</Button>
	);
};
