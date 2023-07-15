import {
	createContext,
	FC,
	useContext,
	useEffect,
	useMemo,
	useState,
} from "react";
import {
	Sidebar,
	Menu,
	MenuItem,
	SubMenu,
	useProSidebar,
	sidebarClasses,
} from "react-pro-sidebar";
import ReceiptOutlinedIcon from "@mui/icons-material/ReceiptOutlined";
import GridViewOutlinedIcon from "@mui/icons-material/GridViewOutlined";
import MenuBookOutlinedIcon from "@mui/icons-material/MenuBookOutlined";
import MenuOutlinedIcon from "@mui/icons-material/MenuOutlined";
import TimelineOutlinedIcon from "@mui/icons-material/TimelineOutlined";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Box, Button, IconButton, Typography } from "@mui/material";
import { useTheme } from "@emotion/react";
import { tokens } from "../../contexts/theme";
import { NetworkContext } from "../../contexts/network";
import { networks } from "../../constants/network";
import ToggleOnIcon from "@mui/icons-material/ToggleOn";
import { PageContext } from "../../contexts/page";

const AppSideBarContext = createContext<{
	selected: string;
	setSelected: React.Dispatch<React.SetStateAction<string>>;
}>({ selected: "", setSelected: () => {} });

const Item: FC<{
	title: string;
	to: string;
	icon: any;
}> = ({ title, to, icon }) => {
	const navigate = useNavigate();
	const { selected, setSelected } = useContext(AppSideBarContext);
	const { navigationOff } = useContext(PageContext);
	const theme: any = useTheme();
	const colors = tokens(theme.palette.mode);
	return (
		<MenuItem
			disabled={!!navigationOff}
			active={to.startsWith(`/${selected}`)}
			style={{}}
			onClick={() => navigate(to)}
			icon={icon}
			// href={to}
		>
			<Typography>{title}</Typography>
			{/* <Link to={to} /> */}
		</MenuItem>
	);
};

const AppSideBar: FC = () => {
	const theme: any = useTheme();
	const colors = useMemo(() => tokens(theme.palette.mode), [theme]);
	const { collapseSidebar, toggleSidebar, collapsed, toggled, broken, rtl } =
		useProSidebar();
	const { path1 } = useParams();

	const [selected, setSelected] = useState(path1 || "");
	const { connection, setNetworkOption } = useContext(NetworkContext);

	useEffect(() => {
		setSelected(path1 || "");
	}, [path1]);

	return (
		<AppSideBarContext.Provider value={{ selected, setSelected }}>
			<Sidebar
				rootStyles={{
					[`.${sidebarClasses.container}`]: {
						backgroundColor: colors.primary[150],
					},
					borderColor: colors.primary[200],
					height: "100vh",
					position: "sticky",
					top: 0,
					left: 0,
					zIndex: 12,
				}}
			>
				<Menu
					menuItemStyles={{
						root: {
							"& .ps-active": {
								color: "#6870fa !important",
							},
							paddingTop: 5,
						},
						button: {
							// [`&.${menuClasses.disabled}`]: {
							// 	color: themes[theme].menu.disabled.color,
							// },
							"&:hover": {
								backgroundColor: `${colors.primary[300]} !important`,
							},
							"&": {
								margin: "0 10px 0 10px",
								padding: "0 10px 0 10px",
								borderRadius: "3px"
							},
						},
					}}
				>
					<MenuItem
					// icon={collapsed ? <MenuOutlinedIcon /> : undefined}
            rootStyles={{
              "&:hover": {
								backgroundColor: `transparent !important`,
							},
            }}
					>
						<Box
							display="flex"
							justifyContent="space-between"
							alignItems="center"
              sx={{cursor: 'default'}}
						>
							{!collapsed && (
								<Box
									display="flex"
									alignItems="center"
									sx={{
										px: 1,
										borderRadius: 2,
									}}
                  ml="15px"
								>
									<img
										src={`${process.env.PUBLIC_URL}/assets/logo2.png`}
										height="20px"
										width="20px"
									/>
									<Typography variant="h3" paddingLeft={1}>
										zk-GATE
									</Typography>
								</Box>
							)}
							<IconButton
								onClick={() => collapseSidebar(!collapsed)}
								style={{}}
							>
								<MenuOutlinedIcon />
							</IconButton>
						</Box>
					</MenuItem>
					<Box>
						<Item
							title="Home"
							to="/app"
							icon={<TimelineOutlinedIcon />}
						/>

						<Box
							marginTop={"auto"}
							padding={2}
							display="flex"
							flexWrap={"wrap"}
							alignItems="center"
						>
							{/* {!collapsed && (
								<Typography>Connected to network:</Typography>
							)} */}
							<Typography
								fontWeight={645}
								marginRight={1}
								// className='text-cut'
							>
								{connection.connectedNetworkId
									? networks[connection.connectedNetworkId].label
									: "-"}
							</Typography>
							<IconButton
								title="Change network"
								sx={{
									marginLeft: "auto",
									marginRight: "5px",
								}}
								onClick={() => setNetworkOption(true)}
							>
								<ToggleOnIcon />
							</IconButton>
						</Box>
					</Box>
				</Menu>
			</Sidebar>
			{/* </Box> */}
		</AppSideBarContext.Provider>
	);
};

export default AppSideBar;
