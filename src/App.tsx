import { ThemeProvider, useTheme } from "@emotion/react";
import { CssBaseline } from "@mui/material";
import { ProSidebarProvider } from "react-pro-sidebar";
import {
	BrowserRouter,
	Navigate,
	Route,
	Routes,
	useNavigate,
	useParams,
} from "react-router-dom";
import "./App.css";
import AuthProvider, { AuthContext } from "./contexts/auth";
import { ColorModeContext, tokens, useMode } from "./contexts/theme";
import HomePage from "./pages/home";
import NetworkProvider, { NetworkContext } from "./contexts/network";
import { useContext, useEffect, useMemo, useState } from "react";
import PageContextProvider, { PageContext } from "./contexts/page";
import { ToastContainer } from "react-toastify";
import { Amplify } from "aws-amplify";
import AppNavBar from "./components/AppNavBar2";
import RightConnectDrawer from "./components/RightConnectDrawer";
import GeneratePage from "./pages/generate";

const vKey = require("./verification_key.json");

Amplify.configure({
	Auth: {
		userPoolId: "ap-south-1_J3VvKKDEN",
		identityPoolId: "ap-south-1:a349a6c9-154f-43f5-8f88-66a1e1fdccf5",
		region: "ap-south-1",
	},
	Storage: {
		AWSS3: {
			bucket: "general-blockchain", //REQUIRED -  Amazon S3 bucket name
			region: "ap-south-1", //OPTIONAL -  Amazon service region,
		},
	},
});

function App() {
	const { theme, toggleColorMode } = useMode();
	return (
		<ColorModeContext.Provider value={{ toggleColorMode }}>
			<ThemeProvider theme={theme}>
				<CssBaseline />
				<ProSidebarProvider>
					<NetworkProvider>
						<AuthProvider>
							<PageContextProvider>
								<BrowserRouter>
									<Routes>
										<Route
											path="/:path1/*"
											element={<Main />}
										/>
										<Route
											path="*"
											element={<Navigate to="/app" />}
										/>
									</Routes>
								</BrowserRouter>
								<ToastContainer
									position='bottom-left'
									autoClose={5000}
									hideProgressBar={false}
									closeOnClick
									pauseOnFocusLoss
									pauseOnHover
									theme={theme.palette.mode}
								/>
							</PageContextProvider>
						</AuthProvider>
					</NetworkProvider>
				</ProSidebarProvider>
			</ThemeProvider>
		</ColorModeContext.Provider>
	);
}

const Main = () => {
	const theme: any = useTheme();
	const colors = useMemo(() => tokens(theme.palette.mode), [theme]);
	const { account } = useContext(AuthContext);
	const { setContract, setWallet } = useContext(NetworkContext);
	const navigate = useNavigate();
	const { path1 } = useParams();
	const {} = useContext(PageContext);
	const notfound = useMemo(
		() => !["app", "generate", "share"].includes(path1 || ""),
		[path1]
	);
	useEffect(() => {
		if (!account?.code) {
			setContract(undefined);
			setWallet(undefined);
			navigate("/login");
			return;
		}
	}, [account]);

	return (
		<main
			className="app"
			style={{
				background: `linear-gradient(${colors.bg[100]}, ${colors.primary[100]})`,
				position: "relative",
        overflowX: 'hidden'
			}}
		>
			<AppNavBar />
			{path1 === "app" && <HomePage />}
			{path1 === "generate" && <GeneratePage />}
			{notfound && <Navigate to={"/app"} />}
			<RightConnectDrawer />
		</main>
	);
};

export default App;
