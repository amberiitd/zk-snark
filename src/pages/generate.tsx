import { useTheme } from "@emotion/react";
import Box from "@mui/material/Box";
import { FC, createContext, useContext, useMemo, useState } from "react";
import { tokens } from "../contexts/theme";
import {
	Button,
	Grow,
	Skeleton,
	Stack,
	Tab,
	Tabs,
	Typography,
} from "@mui/material";
import jwt_decode from "jwt-decode";
import ReactJson from "react-json-view";
import { AuthContext } from "../contexts/auth";
import { Storage } from "aws-amplify";
import { isEmpty, noop } from "lodash";
import { ZK_GATE_CONTRACT } from "../constants/network";
import moment from "moment";
import { PageContext } from "../contexts/page";
import {
	addDoc,
	createClient,
	createFromPrivateKey,
	getCollection,
	syncAccountNonce,
} from "db3.js";
import GradientText from "../components/GradientText";
import SlideContainer from "../components/SlideContainer";
import SlideStepper from "../components/SlideStepper";
import { clientApps } from "../constants/general";
import ClientAppCard from "../components/ClientAppCard";
import { Connector } from "../components/AppNavBar2";
import InfoIcon from "@mui/icons-material/Info";
import { toast } from "react-toastify";

export type TabInfo = {
	current: number;
	previous: number;
};

export const GeneratePageContext = createContext<{
	proof: any;
	setProof: React.Dispatch<any>;
	googleUser: any;
	setGoogleUser: React.Dispatch<any>;
	selectedApp: string;
	setSelectedApp: React.Dispatch<React.SetStateAction<string>>;
	activeStep: TabInfo;
	setActiveStep: React.Dispatch<React.SetStateAction<TabInfo>>;
	handleFormViewChange: (e: any, step: number) => void;
	generate: (address: string, payload: any) => Promise<void>;
	mintNft: () => Promise<void>;
}>({
	proof: undefined,
	setProof: noop,
	googleUser: undefined,
	setGoogleUser: noop,
	selectedApp: "learn",
	setSelectedApp: noop,
	activeStep: { current: 0, previous: -1 },
	setActiveStep: noop,
	handleFormViewChange: noop,
	generate: async () => {},
	mintNft: async () => {},
});

const vKey = require("../verification_key.json");

const encodeToBigInt = (str: string) => {
	return BigInt(
		Array.from(str).reduce((p, c) => p + String(c.charCodeAt(0)), "")
	);
};

// create client
const private_key =
	"0xdc6f560254643be3b4e90a6ba85138017aadd78639fbbb43c57669067c3bbe76";
const account = createFromPrivateKey(private_key);
const client = createClient(
	"https://rollup.cloud.db3.network",
	"https://index.cloud.db3.network",
	account
);

// use your database addr
const dbAddr = "0x1ef32cc9655bf805dc2a27471a2b1d59c544808a";
// use your collection name
const colName = "nft-metadata";

const GeneratePage: FC = () => {
	const theme: any = useTheme();
	const colors = useMemo(() => tokens(theme.palette.mode), [theme]);
	const [activeStep, setActiveStep] = useState<TabInfo>({
		current: 0,
		previous: -1,
	});
	const { account } = useContext(AuthContext);
	const [googleUser, setGoogleUser] = useState<any>();
	const [timeTaken, setTimeTaken] = useState<any>();
	const [proof, setProof] = useState<any>();
	const [nullifier, setNullifier] = useState<any>();
	const [result, setResult] = useState<any>();
	const [verification, setVerification] = useState("false");
	const [selectedApp, setSelectedApp] = useState("learn");
	const [resultModal, setResultModal] = useState({
		show: false,
		code: 0,
	});

	const handleFormViewChange = (e: any, step: number) =>
		setActiveStep(({ current, previous }) => ({
			current: step,
			previous: current,
		}));

	const pushToDb3 = async (metadata: any) => {
		// add a document
		await syncAccountNonce(client);
		const collection = await getCollection(dbAddr, colName, client);

		const { id } = await addDoc(collection, metadata);
	};

	const mintNft = async () => {
		// call client.store, passing in the image & metadata
		// nftstorage.store({
		//     address: account?.code
		// })
		if (isEmpty(proof)) return;
		const metadata = {
			address: account?.code,
			proof: {
				a: proof.pi_a
					.slice(0, 2)
					.map(
						(v: string) =>
							"0x" + BigInt(v).toString(16).padStart(64, "0")
					),
				b: (proof.pi_b.slice(0, 2) as Array<Array<string>>).map((arr) =>
					arr
						.reverse()
						.map(
							(v: string) =>
								"0x" + BigInt(v).toString(16).padStart(64, "0")
						)
				),
				c: proof.pi_c
					.slice(0, 2)
					.map(
						(v: string) =>
							"0x" + BigInt(v).toString(16).padStart(64, "0")
					),
				pub_signal: nullifier.map(
					(v: string) =>
						"0x" + BigInt(v).toString(16).padStart(64, "0")
				),
			},
			timestamp: moment().unix(),
		};

		Storage.put(`zk-snark/${account?.code}/metadata.json`, metadata)
			.then(async () => {
				console.log("metadata write sucess");
				const exists = await ZK_GATE_CONTRACT.methods
					.getUserStatus()
					.call({ from: account?.code });
				if (exists) {
					console.log("user exists:", exists);
					setResultModal({ show: true, code: 2 });
					return;
				}
				console.log("exists", exists);

				await (ZK_GATE_CONTRACT as any).methods
					.mint(
						`https://general-blockchain.s3.ap-south-1.amazonaws.com/public/zk-snark/${account?.code}/metadata.json`
					)
					.send({
						from: account?.code,
					})
					.then(() => {
						console.log("successful login");
						setResultModal({ show: true, code: 1 });
					});

				await pushToDb3(metadata).then(() => {
					console.log("Successfully pushed to db3");
				});
			})
			.catch((error) => {
				setResultModal({ show: true, code: 0 });
				console.error(error);
        toast.error("Error in NFT minting!")
			});
	};

	const generate = async (address: string, payload: any) => {
		// setUserDataQuery({ loading: true });
		const { proof, publicSignals } = await (
			window as any
		).snarkjs.groth16.fullProve(
			{
				sec_key: process.env.REACT_APP_PROOF_SECRET_KEY,
				pub_key: process.env.REACT_APP_PROOF_PUBLIC_KEY,
				name: encodeToBigInt(payload.name),
				location: encodeToBigInt(payload.iss),
				contact_number: encodeToBigInt(payload.email),
				photo: encodeToBigInt(payload.picture),
				account_address: BigInt(address),
			},
			`${process.env.PUBLIC_URL}/assets/circuit.wasm`,
			`${process.env.PUBLIC_URL}/assets/circuit_final.zkey`
		);

		setProof(proof);
		setNullifier(publicSignals);
		handleFormViewChange(undefined, activeStep.current + 1);
		// const res = await (window as any).snarkjs.groth16.verify(
		// 	vKey,
		// 	publicSignals,
		// 	proof
		// );

		// if (res === true) {
		// 	setVerification("true");
		// } else {
		// 	console.log("Invalid proof");
		// }
	};

	return (
		<GeneratePageContext.Provider
			value={{
				proof,
				setProof,
				googleUser,
				setGoogleUser,
				activeStep,
				setActiveStep,
				selectedApp,
				setSelectedApp,
				handleFormViewChange,
				generate,
				mintNft,
			}}
		>
			<Box
				display={"flex"}
				justifyContent={"center"}
				// alignItems={"center"}
				padding={"5% 0 10% 0"}
			>
				{isEmpty(account?.code) ? (
					<NotConnected />
				) : (
					<Box>
						<ClientAppSelection />
						<AuthorizerSelection />
						<Approval />
						<SlideStepper
							steps={3}
							activeStep={activeStep.current}
							onChange={handleFormViewChange}
						/>
					</Box>
				)}

				{/* <Box
			>
				{googleUser && (
					<>
						<Box
							display={"flex"}
							alignItems={"center"}
							marginTop={3}
						>
							<ReportIcon sx={{ marginRight: 1 }} />
							<Typography variant="h6">
								{`"${selectedApp}" wants to access name, email and locale from following Google user informations. Please click "Generate" only if you consent.`}
							</Typography>
							
						</Box>
					</>
				)}

				
			</Box> */}
				{/* <Modal
				open={resultModal.show}
				aria-labelledby="parent-modal-title"
				aria-describedby="parent-modal-description"
			>
				<Box
					sx={{
						...style,
						padding: "10px 0 20px 0",
            backgroundColor: colors.primary[200]
					}}
				>
					<Box
						display="flex"
						alignItems="start"
						padding={"15px 0 15px 0"}
						sx={{
							px: 4,
						}}
					>
						<Box>
							<Typography
								variant="h3"
								paddingLeft={1}
							>
								{resultModal.code === 1
									? "NFT generated successfully"
									: resultModal.code == 2
									? "You already have an NFT."
									: "Error occured"}
							</Typography>
							<Divider sx={{ margin: "20px 0 20px 0" }} />
							<Typography
								variant="h6"
								paddingLeft={1}
							>
								{resultModal.code === 1 ? (
									<Typography>
										You can now login in{" "}
										<Link
											href="https://patex-learn.web.app/"
											target="_blank"
										>
											{selectedApp}
										</Link>
									</Typography>
								) : (
									""
								)}
							</Typography>
						</Box>
						<IconButton
							onClick={() => {
								setResultModal({
									...resultModal,
									show: false,
								});
								setProof(undefined);
								setGoogleUser(undefined);
							}}
							sx={{ marginLeft: "auto" }}
						>
							<CloseIcon />
						</IconButton>
					</Box>
				</Box>
			</Modal> */}
			</Box>
		</GeneratePageContext.Provider>
	);
};

export default GeneratePage;

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

const AuthorizerSelection = () => {
	const theme: any = useTheme();
	const colors = useMemo(() => tokens(theme.palette.mode), [theme]);
	const { account } = useContext(AuthContext);
	const { activeStep, selectedApp, setGoogleUser, generate } =
		useContext(GeneratePageContext);
	const { setLoading } = useContext(PageContext);
	const handleCredentialResponse = async (response: any) => {
		// console.log("credential_response", response);
		await fetch(
			"https://oauth2.googleapis.com/token?" +
				new URLSearchParams({
					code: response.code,
					client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID || "",
					client_secret:
						process.env.REACT_APP_GOOGLE_CLIENT_SECRET || "",
					grant_type: "authorization_code",
					redirect_uri: window.location.origin,
				}),
			{ method: "POST" }
		)
			.then((response) => response.json())
			.then(async (data) => {
				console.log(data);
				const userJson = jwt_decode(data.id_token);
				setGoogleUser(userJson);
				if (account?.code) {
					await generate(account.code, userJson);
				}
			})
			.catch((error) => {
				setLoading(false);
			});
		setLoading(false);
	};
	const client = google.accounts.oauth2.initCodeClient({
		client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID,
		scope: "email profile ",
		callback: handleCredentialResponse,
	});
	// useEffect(() => {
	// 	document
	// 		.getElementById("google-login")
	// 		?.addEventListener("click", () => {
	// 			client.requestCode();
	// 		});
	// }, []);
	return (
		<SlideContainer
			show={activeStep.current == 1}
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
				Choose and click an authorizer to login to{" "}
				{clientApps.find((app) => app.id === selectedApp)?.label}.
			</GradientText>
			<Stack spacing={3} paddingLeft={8} paddingRight={8} marginTop={5}>
				<Button
					id="google-login"
					variant={"outlined"}
					size="small"
					onClick={async () => {
						setLoading(true);
						try {
							const res = await client.requestCode();
							console.log("requestcode response", res);
						} catch (error) {
							setLoading(false);
						}
					}}
				>
					<img
						src={`${process.env.PUBLIC_URL}/assets/google-icon.png`}
					/>
					<Typography marginLeft={1}>Google</Typography>
				</Button>
				<Button variant={"outlined"} size="small" disabled>
					<img
						src={`${process.env.PUBLIC_URL}/assets/facebook-icon.png`}
					/>
					<Stack marginLeft={1}>
						<Typography>Facebook</Typography>
						<Stack direction={"row"}>
							<InfoIcon
								sx={{
									color: colors.red[100],
									fontSize: 13,
									mr: "2px",
								}}
							/>
							<Typography
								variant="body2"
								fontSize={10}
								color={colors.red[100]}
							>
								Coming soon
							</Typography>
						</Stack>
					</Stack>
				</Button>
			</Stack>
		</SlideContainer>
	);
};

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
	const { activeStep, googleUser, proof, mintNft } =
		useContext(GeneratePageContext);
	const [value, setValue] = useState(0);

	const handleChange = (event: React.SyntheticEvent, newValue: number) => {
		setValue(newValue);
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
			<Box marginLeft={4} marginRight={4} height={400}>
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
								height: 320,
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
								height: 320,
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
			<Stack marginLeft={4} marginRight={4}>
				{googleUser && proof ? (
					<Button
						variant={"outlined"}
						sx={{ ml: "auto" }}
						onClick={() => {
							mintNft();
						}}
						disabled
					>
						<Typography marginLeft={1}>Generate</Typography>
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

const NotConnected = () => {
	return (
		<Box display={"flex"} justifyContent={"center"} marginTop={15}>
			<Grow in={true} timeout={1000}>
				<Box>
					<Box display={"flex"} justifyContent={"center"}>
						<img
							src={`${process.env.PUBLIC_URL}/assets/connect-wallet.png`}
							width={400}
						/>
					</Box>
					<Stack
						direction={"row"}
						justifyContent={"center"}
						marginTop={5}
					>
						<Connector label="Connect wallet" />
					</Stack>
				</Box>
			</Grow>
		</Box>
	);
};
