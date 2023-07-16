import { useTheme } from "@emotion/react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Modal from "@mui/material/Modal";
import Typography from "@mui/material/Typography";
import { FC, useContext, useEffect, useMemo, useState } from "react";
import { allowedNetworkIds, networks } from "../../constants/network";
import { NetworkContext } from "../../contexts/network";
import { tokens } from "../../contexts/theme";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ReportProblemIcon from "@mui/icons-material/ReportProblem";
import ModalHeader, { style } from "../ModalHeader";
import { toast } from "react-toastify";
import Grow from "@mui/material/Grow";
import Fade from '@mui/material/Fade';


const NetworkOption: FC<{ show: boolean }> = (props) => {
	const theme: any = useTheme();
	const colors = useMemo(() => tokens(theme.palette.mode), [theme]);
	const {
		connection,
		wallet,
	} = useContext(NetworkContext);
	const [error, setError] = useState<any>();

	useEffect(() => {
		if (error) {
			toast.error(
				error.message || "Error occured. visit console for mor info."
			);
		}
	}, [error]);

	return (
		<Modal open={props.show} closeAfterTransition>
      <Fade in={props.show} timeout={1000}>
			<Box
				sx={{
					...style,
					backgroundColor: colors.primary[100],
					border: `1px solid ${colors.primary[400]}`,
				}}
			>
				<ModalHeader
					title="Unsupported network!"
					subtitle="Please select among allowed networks."
					onCancel={() => {
						// setNetworkOption(false);
					}}
				/>
				<Box sx={{ px: 4, py: 3 }}>
					<div hidden={!window.ethereum}>
						{allowedNetworkIds[wallet?.provider || "default"].map(
							(id, index) => (
								<Button
									key={`network-option-${id}`}
									variant="outlined"
									fullWidth
									sx={{
										"&:hover": {},
										display: "flex",
										justifyContent: "start",
										margin: "5px 0 0 0",
										padding: "10px 20px 10px 20px",
										borderRadius: "10px",
										alignItems: "center",
									}}
									onClick={() => {
										window.ethereum
											.request({
												method: "wallet_switchEthereumChain",
												params: [
													{
														chainId: `0x${parseInt(
															id
														).toString(16)}`,
													},
												],
											})
											.then((res: any) => {
												// setSelectedNetworkId(id);
											})
											.catch((err: any) => {
												console.log(err);
												if (err.code === 4902) {
													window.ethereum
														.request({
															method: "wallet_addEthereumChain",
															params: [
																{
																	chainId: `0x${parseInt(
																		id
																	).toString(
																		16
																	)}`,
																	chainName:
																		networks[
																			id
																		].label,
																	rpcUrls:
																		networks[
																			id
																		]
																			.rpcUrls,
																},
															],
														})
														.then((res: any) => {
															// setSelectedNetworkId(id);
														})
														.catch((err: any) => {
															console.log(err);
															setError(err);
														});
												} else {
													setError(err);
												}
											});
									}}
									disabled={connection.connectedNetworkId === id}
								>
									<img
										src={`${process.env.PUBLIC_URL}/assets/${networks[id]?.image}`}
										height="40px"
										width="40px"
										style={{
											border: "1px solid white",
											backgroundColor: "white",
											borderRadius: "2px",
										}}
									/>

									<Typography marginLeft={2}>
										{networks[id]?.label}
									</Typography>
									{connection.connectedNetworkId === id && (
										<CheckCircleOutlineIcon
											sx={{ marginLeft: "auto" }}
										/>
									)}
								</Button>
							)
						)}
					</div>
					{!window.ethereum && (
						<div>
							<i className="bi bi-exclamation-triangle me-2"></i>
							Please install ethereum agent Metamask
						</div>
					)}
				</Box>
				{error && (
					<Box
						display={"flex"}
						sx={{ color: colors.primary[500] }}
						padding={2}
					>
						<ReportProblemIcon />
						<Typography>
							{error.message ||
								"Error occured. visit console for mor info."}
						</Typography>
					</Box>
				)}
			</Box>
      </Fade>
		</Modal>
	);
};

export default NetworkOption;
