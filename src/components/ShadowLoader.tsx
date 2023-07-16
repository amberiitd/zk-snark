import { useTheme } from "@emotion/react";
import { Box, Modal } from "@mui/material";
import { useContext } from "react";
import { PageContext } from "../contexts/page";

const style = {
	position: "absolute",
	top: "50%",
	left: "50%",
	transform: "translate(-25%, -50%)",
	width: "27rem",
	borderRadius: 3,
	boxShadow: 24,
};

const ShadowLoader = () => {
	const theme: any = useTheme();
  const {loading} = useContext(PageContext);
	return (
		<Modal
			open={loading}
			aria-labelledby="parent-modal-title"
			aria-describedby="parent-modal-description"
		>
			<Box sx={{ ...style }}>
				<img src={`${process.env.PUBLIC_URL}/assets/Spinner-${theme.palette.mode}.svg`} />
			</Box>
		</Modal>
	);
};

export default ShadowLoader;
