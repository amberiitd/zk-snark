import { useTheme } from "@emotion/react";
import Box from "@mui/material/Box";
import { FC, useMemo, useState } from "react";
import Header from "../components/Header";
import { tokens } from "../contexts/theme";
import { Button, Typography } from "@mui/material";
import GoogleIcon from "@mui/icons-material/Google";

const HomePage: FC = () => {
	const theme: any = useTheme();
	const colors = useMemo(() => tokens(theme.palette.mode), [theme]);

	return (
		<Box m="20px">
			<Box
				display="flex"
				justifyContent="space-between"
				alignItems="center"
			>
				<Header
					title="Home"
					subtitle="Welcome to your dashboard, where you can generate NFTs for you favorite applications."
				/>
			</Box>
			<Box>
				<Button
					variant={"outlined"}
					sx={{
						marginRight: "10px",
            // border: '1px solid',
						// borderColor: colors.blueAccent[400],
            "&:hover": {
              borderColor: colors.primary[100],
              backgroundColor: colors.blueAccent[700]
            },
            borderColor: colors.primary[100],
						color: colors.primary[100],
					}}
				>
					<GoogleIcon />
          <Typography marginLeft={1}>Generate with Google</Typography>
					
				</Button>
			</Box>
		</Box>
	);
};

export default HomePage;
