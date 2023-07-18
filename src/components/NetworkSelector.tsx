import { Box, Menu, MenuItem, Typography } from "@mui/material";
import Button from "@mui/material/Button";
import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { NetworkContext } from "../contexts/network";
import { allowedNetworkIds, networks } from "../constants/network";
import { useTheme } from "@emotion/react";
import { tokens } from "../contexts/theme";
import { toast } from "react-toastify";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import Spinner from "./Spinner1";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import TaskAltIcon from "@mui/icons-material/TaskAlt";
import { PageContext } from "../contexts/page";

const NetworkSelector = () => {
  const {openNetworkMenu: open, setOpenNetworkMenu: setOpen} = useContext(PageContext)
	const anchor = useRef<HTMLButtonElement>(null);
	const theme: any = useTheme();
	const colors = useMemo(() => tokens(theme.palette.mode), [theme]);
	const { wallet, connection, setConnection } = useContext(NetworkContext);
	const [error, setError] = useState<any>();

	useEffect(() => {
		if (error) {
			toast.error(
				error.message || "Error occured. visit console for mor info."
			);
		}
	}, [error]);

	const handleNetworkSwitch = async (id: string) => {
		setConnection((connection) => ({
			...connection,
			state: "connecting",
			connectingNetworkId: id,
		}));
		window.ethereum
			.request({
				method: "wallet_switchEthereumChain",
				params: [
					{
						chainId: `0x${parseInt(id).toString(16)}`,
					},
				],
			})
			.catch(async (err: any) => {
				console.log(err);
				if (err.code === 4902) {
					await window.ethereum.request({
						method: "wallet_addEthereumChain",
						params: [
							{
								chainId: `0x${parseInt(id).toString(16)}`,
								chainName: networks[id].label,
								rpcUrls: networks[id].rpcUrls,
								...(networks[id].nativeCurrency
									? {
											nativeCurrency:
												networks[id].nativeCurrency,
									  }
									: {}),
							},
						],
					});
				}
				throw err;
			})
			.then(() => setOpen(false))
			.catch((err: any) => {
				setConnection((connection) => ({
					...connection,
					state: connection.connectedNetworkId
						? "connected"
						: "disconnected",
				}));
				console.log(err);
				setError(err);
			});
	};

	return (
		<>
			<Button
				ref={anchor}
				id="network-select"
				aria-controls={open ? "network-menu" : undefined}
				aria-haspopup="true"
				aria-expanded={open ? "true" : undefined}
				onClick={() => setOpen((open) => !open)}
				size="small"
				sx={{
					borderColor: open ? colors.primary[800] : "transparent",
					backgroundColor: open ? colors.primary[300] : "unset",
					maxWidth: "125px",
					px: 1,
				}}
				variant={"outlined"}
				disabled={!wallet?.provider}
			>
				{connection.connectedNetworkId && wallet?.provider ? (
					<>
						<img
							src={`${process.env.PUBLIC_URL}/assets/${
								networks[connection.connectedNetworkId]?.image
							}`}
							height="20px"
							width="20px"
						/>
						<Typography className="text-cut" ml={1}>
							{networks[connection.connectedNetworkId].label}
						</Typography>
					</>
				) : connection.state === "connecting" ? (
					<Spinner style={{ marginLeft: "auto" }} />
				) : (
					<WarningAmberRoundedIcon />
				)}
				{open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
			</Button>
			<Menu
				id="network-menu"
				anchorEl={anchor.current}
				open={open && allowedNetworkIds[wallet?.provider || "default"].length > 0}
				onClose={() => {
					if (connection.state !== "connecting") setOpen(false);
				}}
				MenuListProps={{
					"aria-labelledby": "network-select",
				}}
				anchorOrigin={{
					vertical: "bottom",
					horizontal: "right",
				}}
				transformOrigin={{
					vertical: -5,
					horizontal: "right",
				}}
			>
				{allowedNetworkIds[wallet?.provider || "default"].map(
					(id, i) => (
						<MenuItem
							key={`network-menu-${i}`}
							onClick={() => handleNetworkSwitch(id)}
							disabled={
								connection.connectedNetworkId === id ||
								connection.state === "connecting"
							}
						>
							<img
								src={`${process.env.PUBLIC_URL}/assets/${networks[id]?.image}`}
								height="40px"
								width="40px"
							/>
							<Box>
								<Typography marginLeft={2} fontSize={15}>
									{networks[id]?.label}
								</Typography>
								{connection.state === "connecting" &&
									connection.connectingNetworkId === id && (
										<Typography
											marginLeft={2}
											fontSize={10}
										>
											Approve in wallet
										</Typography>
									)}
							</Box>

							{connection.state === "connected" &&
								connection.connectedNetworkId === id && (
									<TaskAltIcon
										sx={{ marginLeft: "auto" }}
									/>
								)}
							{connection.state === "connecting" &&
								connection.connectingNetworkId === id && (
									<Spinner style={{ marginLeft: "auto" }} />
								)}
						</MenuItem>
					)
				)}
				{/* {error && <WarningAmberRoundedIcon />} */}
			</Menu>
		</>
	);
};

export default NetworkSelector;
