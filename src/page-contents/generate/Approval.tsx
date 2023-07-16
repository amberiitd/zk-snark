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
import ReactJson from "react-json-view";
import WarningRoundedIcon from "@mui/icons-material/WarningRounded";
import { colors as colors2 } from "@mui/material";
import ReportRoundedIcon from "@mui/icons-material/ReportRounded";
import GradientText from "../../components/GradientText";
import SlideContainer from "../../components/SlideContainer";
import { clientApps } from "../../constants/general";
import { PageContext } from "../../contexts/page";
import { tokens } from "../../contexts/theme";
import { GeneratePageContext } from "../../pages/generate";


interface TabPanelProps {
	children?: React.ReactNode;
	index: number;
	value: number;
}

function CustomTabPanel(props: TabPanelProps) {
	const { children, value, index, ...other } = props;

	return (
		<div
			role="tabpanel"
			hidden={value !== index}
			id={`nft-tabpanel-${index}`}
			aria-labelledby={`nft-tab-${index}`}
			{...other}
		>
			{value === index && <Box sx={{ py: 2 }}>{children}</Box>}
		</div>
	);
}

function a11yProps(index: number) {
	return {
		id: `nft-tab-${index}`,
		"aria-controls": `nft-tabpanel-${index}`,
	};
}

const Approval = () => {
	const theme: any = useTheme();
	const colors = useMemo(() => tokens(theme.palette.mode), [theme]);
	const { activeStep, googleUser, proof, mintNft, selectedApp, handleFormViewChange } =
		useContext(GeneratePageContext);
	const { setLoading } = useContext(PageContext);
	const [value, setValue] = useState(0);

	const handleChange = (event: React.SyntheticEvent, newValue: number) => {
		setValue(newValue);
	};

	const handleMint = async () => {
		setLoading(true);
		try {
			await mintNft();
      handleFormViewChange(null, activeStep.current+1)
		} catch (error) {
			console.error(error);
		} finally {
			setLoading(false);
		}
	};
	return (
		<SlideContainer
			show={activeStep.current == 2}
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
				Need your approval to mint NFT.
			</GradientText>
			<Box marginLeft={4} marginRight={4} height={380}>
				<Box sx={{ borderBottom: 1, borderColor: "divider" }}>
					<Tabs
						variant="fullWidth"
						value={value}
						onChange={handleChange}
						aria-label="nft-tabs"
					>
						<Tab label="User Data" {...a11yProps(0)} />
						<Tab label="Proof" {...a11yProps(1)} />
					</Tabs>
				</Box>
				<CustomTabPanel value={value} index={0}>
					{googleUser ? (
						<ReactJson
							src={googleUser}
							style={{
								overflow: "scroll",
								height: 300,
								borderRadius: 5,
								padding: 5,
								border: `1px solid ${colors.primary[300]}`,
							}}
							theme={
								theme.palette.mode === "dark"
									? "bright"
									: undefined
							}
						/>
					) : (
						<Skeleton
							variant="rectangular"
							sx={{
								marginLeft: "auto",
								borderRadius: 1,
								height: 200,
							}}
						/>
					)}
				</CustomTabPanel>
				<CustomTabPanel value={value} index={1}>
					{proof ? (
						<ReactJson
							src={proof}
							style={{
								overflow: "scroll",
								height: 300,
								borderRadius: 5,
								padding: 5,
								border: `1px solid ${colors.primary[300]}`,
							}}
							theme={
								theme.palette.mode === "dark"
									? "bright"
									: undefined
							}
						/>
					) : (
						<Skeleton
							variant="rectangular"
							sx={{
								marginLeft: "auto",
								borderRadius: 1,
								height: 200,
							}}
						/>
					)}
				</CustomTabPanel>
			</Box>
			<Stack marginLeft={4} marginRight={4} direction={"row"}>
				<Stack direction={"row"} paddingRight={2}>
					<WarningRoundedIcon
						sx={{ marginRight: 1, color: colors2.yellow[700] }}
					/>

					<Typography lineHeight={1}>
						<span style={{ fontWeight: 600 }}>
							{
								clientApps.find((ap) => ap.id === selectedApp)
									?.label
							}{" "}
						</span>
						{`wants to access name, email and locale. Please click "Approve" only if you consent.`}
					</Typography>
				</Stack>

				{googleUser && proof ? (
					<Button
						variant={"outlined"}
						sx={{ ml: "auto" }}
						onClick={handleMint}
					>
						<Typography marginLeft={1}>Approve</Typography>
					</Button>
				) : (
					<Skeleton
						variant="rectangular"
						sx={{
							marginLeft: "auto",
							borderRadius: 1,
							height: 35,
							width: 100,
						}}
					/>
				)}
			</Stack>
		</SlideContainer>
	);
};

export default Approval;