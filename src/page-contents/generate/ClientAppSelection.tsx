import { Stack } from "@mui/material";
import { useContext } from "react";
import ClientAppCard from "../../components/ClientAppCard";
import GradientText from "../../components/GradientText";
import SlideContainer from "../../components/SlideContainer";
import { clientApps } from "../../constants/general";
import { GeneratePageContext } from "../../pages/generate";

const ClientAppSelection = () => {
	const {
		activeStep,
		setActiveStep,
		handleFormViewChange,
		selectedApp,
		setSelectedApp,
	} = useContext(GeneratePageContext);
	return (
		<SlideContainer
			show={activeStep.current == 0}
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
				Select one of your favorite apps.
			</GradientText>
			<Stack
				direction={"row"}
				justifyContent={"center"}
				spacing={2}
				marginTop={5}
			>
				{clientApps.map((app, index) => (
					<ClientAppCard
						key={`clinet-app-${index}`}
						{...app}
						selected={selectedApp === app.id}
						onClick={() => {
							setSelectedApp(app.id);
							handleFormViewChange(null, activeStep.current + 1);
						}}
					/>
				))}
			</Stack>
		</SlideContainer>
	);
};

export default ClientAppSelection;