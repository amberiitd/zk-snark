import { useTheme } from "@emotion/react";
import { Box, Typography, Stack, Button, Grow } from "@mui/material";
import { useMemo, useContext } from "react";
import SlideContainer from "../../components/SlideContainer";
import { tokens } from "../../contexts/theme";
import { GeneratePageContext } from "../../pages/generate";
import { colors as colors2 } from "@mui/material";
import GradientText from "../../components/GradientText";
import { clientApps } from "../../constants/general";
import LaunchRoundedIcon from "@mui/icons-material/LaunchRounded";
import { Link } from "react-router-dom";

const FinalStep = () => {
	const theme: any = useTheme();
	const colors = useMemo(() => tokens(theme.palette.mode), [theme]);
	const { activeStep, result } = useContext(GeneratePageContext);

	return (
		<SlideContainer
			show={activeStep.current == 3}
			direction={
				activeStep.current > activeStep.previous ? "left" : "right"
			}
		>
			{result == 0 ? (
				<ErrorCard />
			) : result == 1 ? (
				<SuccessCard />
			) : (
				<NftExists />
			)}
		</SlideContainer>
	);
};

export default FinalStep;

const ErrorCard = () => {
	const theme: any = useTheme();
	const colors = useMemo(() => tokens(theme.palette.mode), [theme]);
	const { handleFormViewChange } = useContext(GeneratePageContext);
	return (
		<>
			<Box display={"flex"} justifyContent={"center"}>
				<img
					src={`${process.env.PUBLIC_URL}/assets/error.png`}
					height={200}
					width={200}
					style={{ marginTop: 100 }}
				/>
			</Box>

			<Typography
				textAlign={"center"}
				sx={{
					marginTop: 10,
					fontWeight: 700,
					textAlign: "center",
					fontSize: "400%",
					background: `-webkit-linear-gradient(20deg, ${colors2.red["A700"]} 10%, ${colors.bg[100]} 100%)`,
					WebkitBackgroundClip: "text",
					WebkitTextFillColor: "transparent",
				}}
			>
				Something went wrong!
			</Typography>
			<Stack direction={"row"} justifyContent={"center"} marginTop={3}>
				<Button
					variant="outlined"
					onClick={() => handleFormViewChange(null, 0)}
				>
					Try again
				</Button>
			</Stack>
		</>
	);
};

const SuccessCard = () => {
	const theme: any = useTheme();
	const colors = useMemo(() => tokens(theme.palette.mode), [theme]);
	const { selectedApp } = useContext(GeneratePageContext);
	return (
		<>
			<GradientText
				variant="h1"
				style={{
					fontWeight: 700,
					textAlign: "center",
					fontSize: "400%",
				}}
			>
				Congratulations! You successfully minted NFT
			</GradientText>
			<Box display={"flex"} justifyContent={"center"}>
				<img
					src={`${process.env.PUBLIC_URL}/assets/check.png`}
					height={200}
					width={200}
					style={{ marginTop: 50 }}
				/>
			</Box>
			<Stack direction={"row"} justifyContent={"center"} marginTop={3}>
				<Typography fontWeight={600}>
					Proceed to login to{" "}
					{clientApps.find((ap) => ap.id === selectedApp)?.label}
				</Typography>
				<Link
					to="https://patex-learn.web.app/"
					style={{ marginLeft: 3 }}
				>
					<LaunchRoundedIcon />
				</Link>
			</Stack>
		</>
	);
};

const NftExists = () => {
	const { selectedApp } = useContext(GeneratePageContext);
	return (
		<>
			<GradientText
				variant="h1"
				style={{
					fontWeight: 700,
					textAlign: "center",
					fontSize: "400%",
				}}
			>
				You Already have an NFT for{" "}
				{clientApps.find((ap) => ap.id === selectedApp)?.label}
			</GradientText>
			<Box display={"flex"} justifyContent={"center"}>
				<img
					src={`${process.env.PUBLIC_URL}/assets/nft.svg`}
					height={200}
					width={200}
					style={{ marginTop: 50, marginLeft: -30 }}
				/>
			</Box>
			<Stack direction={"row"} justifyContent={"center"} marginTop={3}>
				<Typography fontWeight={600}>
					Proceed to login to{" "}
					{clientApps.find((ap) => ap.id === selectedApp)?.label}
				</Typography>
				<Link
					to="https://patex-learn.web.app/"
					style={{ marginLeft: 3 }}
				>
					<LaunchRoundedIcon />
				</Link>
			</Stack>
		</>
	);
};
