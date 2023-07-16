import { useTheme } from "@emotion/react";
import Box from "@mui/material/Box";
import { FC, createContext, useContext, useMemo, useState } from "react";
import {
	Button,
	Grow,
	Skeleton,
	Stack,
	Tab,
	Tabs,
	Typography,
} from "@mui/material";
import jwt_decode from "jwt-decode";
import GradientText from "../../components/GradientText";
import SlideContainer from "../../components/SlideContainer";
import { clientApps } from "../../constants/general";
import { PageContext } from "../../contexts/page";
import { tokens } from "../../contexts/theme";
import { GeneratePageContext } from "../../pages/generate";
import { AuthContext } from "../../contexts/auth";
import InfoIcon from "@mui/icons-material/Info";


const AuthorizerSelection = () => {
	const theme: any = useTheme();
	const colors = useMemo(() => tokens(theme.palette.mode), [theme]);
	const { account } = useContext(AuthContext);
	const { activeStep, selectedApp, setGoogleUser, generate } =
		useContext(GeneratePageContext);
	const { setLoading } = useContext(PageContext);
	const handleCredentialResponse = async (response: any) => {
		// console.log("credential_response", response);
		await fetch(
			"https://oauth2.googleapis.com/token?" +
				new URLSearchParams({
					code: response.code,
					client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID || "",
					client_secret:
						process.env.REACT_APP_GOOGLE_CLIENT_SECRET || "",
					grant_type: "authorization_code",
					redirect_uri: window.location.origin,
				}),
			{ method: "POST" }
		)
			.then((response) => response.json())
			.then(async (data) => {
				console.log(data);
				const userJson = jwt_decode(data.id_token);
				setGoogleUser(userJson);
				if (account?.code) {
					await generate(account.code, userJson);
				}
			})
			.catch((error) => {
				setLoading(false);
			});
		setLoading(false);
	};
	const client = google.accounts.oauth2.initCodeClient({
		client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID,
		scope: "email profile ",
		callback: handleCredentialResponse,
	});
	// useEffect(() => {
	// 	document
	// 		.getElementById("google-login")
	// 		?.addEventListener("click", () => {
	// 			client.requestCode();
	// 		});
	// }, []);
	return (
		<SlideContainer
			show={activeStep.current == 1}
			direction={
				activeStep.current > activeStep.previous ? "left" : "right"
			}
		>
			<GradientText
				variant="h1"
				style={{
					fontWeight: 700,
					textAlign: "center",
					fontSize: "400%",
				}}
			>
				Choose and click an authorizer to login to{" "}
				{clientApps.find((app) => app.id === selectedApp)?.label}.
			</GradientText>
			<Stack spacing={3} paddingLeft={8} paddingRight={8} marginTop={5}>
				<Button
					id="google-login"
					variant={"outlined"}
					size="small"
					onClick={async () => {
						setLoading(true);
						try {
							const res = await client.requestCode();
							console.log("requestcode response", res);
						} catch (error) {
							setLoading(false);
						}
					}}
				>
					<img
						src={`${process.env.PUBLIC_URL}/assets/google-icon.png`}
					/>
					<Typography marginLeft={1}>Google</Typography>
				</Button>
				<Button variant={"outlined"} size="small" disabled>
					<img
						src={`${process.env.PUBLIC_URL}/assets/facebook-icon.png`}
					/>
					<Stack marginLeft={1}>
						<Typography>Facebook</Typography>
						<Stack direction={"row"}>
							<InfoIcon
								sx={{
									color: colors.red[100],
									fontSize: 13,
									mr: "2px",
								}}
							/>
							<Typography
								variant="body2"
								fontSize={10}
								color={colors.red[100]}
							>
								Coming soon
							</Typography>
						</Stack>
					</Stack>
				</Button>
			</Stack>
		</SlideContainer>
	);
};

export default AuthorizerSelection;