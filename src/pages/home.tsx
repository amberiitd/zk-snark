import { useTheme } from "@emotion/react";
import { Box, Button, Stack } from "@mui/material";
import { useMemo } from "react";
import { tokens } from "../contexts/theme";
import { Link, useNavigate } from "react-router-dom";
import GradientText from "../components/GradientText";

const Home = () => {
	const theme: any = useTheme();
	const colors2 = useMemo(() => tokens(theme.palette.mode), [theme]);
	const navigate = useNavigate();
	return (
		<Box
			display={"flex"}
			justifyContent={"center"}
			// alignItems={"center"}
			padding={"10% 0 10% 0"}
		>
			<Box maxWidth={"600px"}>
				<GradientText
					grow
					style={{
						fontWeight: 700,
						textAlign: "center",
						fontSize: "400%",
					}}
				>
					Zero Knowledge Solution to Authorization
				</GradientText>
				<GradientText
					grow
					reverse
					start={30}
					variant="h1"
					style={{
						fontWeight: 200,
						textAlign: "center",
						fontSize: "150%",
						mt: 1,
					}}
				>
					Login to any application withought credentials, or share
					your subscriptions of your favorite apps with your friends
					for limited time. Say NO to being hacked.
				</GradientText>
				<Stack
					mt={5}
					spacing={2}
					direction={"row"}
					justifyContent={"center"}
				>
					<Link to={"/generate"}>
						<Button variant="contained" sx={{ minWidth: "7rem" }}>
							Generate
						</Button>
					</Link>
					<Link to={"/share"}>
						<Button variant="outlined" sx={{ minWidth: "7rem" }}>
							Share
						</Button>
					</Link>
				</Stack>
			</Box>
		</Box>
	);
};

export default Home;
