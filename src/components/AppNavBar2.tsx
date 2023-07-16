import { Button, IconButton, Stack, Typography, colors } from "@mui/material";
import Box from "@mui/material/Box";
import { FC, useContext, useMemo } from "react";
import { ColorModeContext, tokens } from "../contexts/theme";
import { useTheme } from "@emotion/react";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import { PageContext } from "../contexts/page";
import { MetaMaskAvatar } from "react-metamask-avatar";
import { AuthContext } from "../contexts/auth";
import NetworkSelector from "./NetworkSelector";
import { Link, useParams } from "react-router-dom";

const AppNavBar = () => {
	return (
		<Box display={"flex"} p={2} alignItems={"center"}>
			<AppIcon />
			<NavLinks />
			<Stack marginLeft={"auto"} spacing={2} direction={"row"}>
				<ThemeToggler />
				<NetworkSelector />
				<Connector />
			</Stack>
		</Box>
	);
};

export default AppNavBar;

const NavLinks = () => {
	const theme: any = useTheme();
	const { path1 } = useParams();
	const colors = useMemo(() => tokens(theme.palette.mode), [theme]);

	const style = {
		textDecoration: "none",
		fontWeight: 600,
		color: theme.palette.primary.main,
	};
	return (
		<Stack direction={"row"} spacing={2} marginLeft={3}>
			<Link
				to="/generate"
				style={{
					...style,
					color: path1 === "generate" ? colors.green[100] : "unset",
				}}
			>
				Generate
			</Link>
			<Link
				to="/share"
				style={{
					...style,
					color: path1 === "share" ? colors.green[100] : "unset",
				}}
			>
				Share
			</Link>
		</Stack>
	);
};

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

export const Connector: FC<{ label?: string }> = ({ label = "Connect" }) => {
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
				label
			)}
		</Button>
	);
};
