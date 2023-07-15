import { useTheme } from "@emotion/react";
import Box from "@mui/material/Box";
import {
	FC,
	useContext,
	useEffect,
	useLayoutEffect,
	useMemo,
	useState,
} from "react";
import { tokens } from "../contexts/theme";
import {
	Button,
	Divider,
	FormControl,
	IconButton,
	InputLabel,
	Link,
	MenuItem,
	Modal,
	Select,
	Typography,
} from "@mui/material";
import GoogleIcon from "@mui/icons-material/Google";
import jwt_decode from "jwt-decode";
import ReactJson from "react-json-view";
import { builder } from "../util/witness_calculator";
import { AuthContext } from "../contexts/auth";
import { Storage } from "aws-amplify";
import { isEmpty } from "lodash";
import { ZK_GATE_CONTRACT } from "../constants/network";
import moment from "moment";
import CloseIcon from "@mui/icons-material/Close";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ReportIcon from "@mui/icons-material/Report";
import { PageContext } from "../contexts/page";
import {
	addDoc,
	createClient,
	createFromPrivateKey,
	getCollection,
	syncAccountNonce,
} from "db3.js";
import GradientText from "../components/GradientText";

const style = {
	position: "absolute",
	top: "50%",
	left: "50%",
	transform: "translate(-50%, -50%)",
	width: "27rem",
	borderRadius: 3,
	boxShadow: 24,
};

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

	const pushToDb3 = async (metadata: any) => {
		// add a document
		await syncAccountNonce(client);
		const collection = await getCollection(dbAddr, colName, client);

		const { id } = await addDoc(collection, metadata);
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
		const res = await (window as any).snarkjs.groth16.verify(
			vKey,
			publicSignals,
			proof
		);

		if (res === true) {
			setVerification("true");
		} else {
			console.log("Invalid proof");
		}
	};

	useEffect(() => {
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
					// setUserDataQuery({ loading: false });
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
						// setUserDataQuery({ loading: false });
					});

				await pushToDb3(metadata).then(() => {
					console.log("Successfully pushed to db3");
				});
			})
			.catch((error) => {
				// setUserDataQuery({ loading: false });
				setResultModal({ show: true, code: 0 });
				console.log(error);
			});
		// console.log('metadata:', metadata)
		// console.log('proof:', proof)
	}, [proof]);

	useLayoutEffect(() => {
		const handleCredentialResponse = (response: any) => {
			// console.log("credential_response", response);
			fetch(
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
				.then((data) => {
					console.log(data);
					const userJson = jwt_decode(data.id_token);
					setGoogleUser(userJson);
				});
		};
		console.log(process.env.REACT_APP_GOOGLE_CLIENT_ID);
		/* global google */
		const client = google.accounts.oauth2.initCodeClient({
			client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID,
			scope: "email profile ",
			callback: handleCredentialResponse,
		});
		document
			.getElementById("google-login")
			?.addEventListener("click", () => {
				client.requestCode();
			});
	}, []);

	return (
		<Box
			display={"flex"}
			justifyContent={"center"}
			// alignItems={"center"}
			padding={"5% 0 10% 0"}
		>
			<Box maxWidth={"600px"}>
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
			</Box>

			{/* <Box
			>
				<Box display={"flex"}>
					<FormControl
						variant="filled"
						sx={{
							mr: 1,
							minWidth: 150,
							"& .Mui-focused.MuiInputLabel-root": {
							},
							"& .Mui-focused .MuiSelect-nativeInput": {
								borderColor: "red",
							},
						}}
					>
						<InputLabel id="app-select">Apps</InputLabel>
						<Select
							labelId="app-select"
							sx={
								{
									// marginRight: "30px",
									// width: "150px",
								}
							}
							defaultValue={selectedApp}
							onChange={(e) => setSelectedApp(e.target.value)}
						>
							<MenuItem value={"learn"}>
								<Box display={"flex"}>
									<img
										src={`${process.env.PUBLIC_URL}/assets/logo2.png`}
										height={20}
										width={20}
									/>
									<Typography marginLeft={1}>
										LEarn
									</Typography>
								</Box>
							</MenuItem>
							<MenuItem value={"netflix"}>
								<img
									src={`${process.env.PUBLIC_URL}/assets/netflix-logo.png`}
									height={20}
									width={80}
									alt="Netflix"
								/>
							</MenuItem>
						</Select>
					</FormControl>
					<Button
						id="google-login"
						variant={"outlined"}
						sx={{
							marginRight: "10px",
							"&:hover": {
							},
						}}
						disabled={selectedApp !== "learn"}
					>
						<GoogleIcon />
						<Typography marginLeft={1}>
							Generate with Google
						</Typography>
					</Button>
				</Box>
				{selectedApp !== "learn" && (
					<Typography color={"red"}>
						{selectedApp} coming soon!
					</Typography>
				)}
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
							<Button
								variant={"outlined"}
								sx={{
									marginLeft: "10px",
									"&:hover": {
									}
								}}
								onClick={() => {
									if (account?.code) {
										generate(account.code, googleUser);
									}
								}}
							>
								<Typography marginLeft={1}>Generate</Typography>
							</Button>
						</Box>

						<ReactJson
							src={googleUser}
							style={{
								backgroundColor: "whitesmoke",
								marginTop: 10,
							}}
						/>
					</>
				)}

				{proof && (
					<>
						<Typography variant="h6" marginTop={3}>
							{" "}
							Proof
						</Typography>
						<ReactJson
							src={proof}
							style={{
								backgroundColor: "whitesmoke",
								marginTop: 10,
							}}
						/>
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
	);
};

export default GeneratePage;
