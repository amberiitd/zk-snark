import { Box, Grow } from "@mui/material";
import GradientText from "../components/GradientText";

const SharePage = () => {
	return (
		<Box
			display={"flex"}
			justifyContent={"center"}
			// alignItems={"center"}
			padding={"10% 0 10% 0"}
		>
			<Box maxWidth={"600px"}>
				<Grow in={true} timeout={1000}>
					<Box display={"flex"} justifyContent={"center"}>
						<img
							src={`${process.env.PUBLIC_URL}/assets/calender.svg`}
							height={300}
						/>
					</Box>
				</Grow>

				<GradientText
					grow
					style={{
						fontWeight: 700,
						textAlign: "center",
						fontSize: "400%",
					}}
				>
					Coming Soon
				</GradientText>
			</Box>
		</Box>
	);
};

export default SharePage;
