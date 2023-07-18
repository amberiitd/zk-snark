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

import { AuthContext } from "../contexts/auth";
import { Storage } from "aws-amplify";
import { isEmpty, noop } from "lodash";
import {
	addDoc,
	createClient,
	createFromPrivateKey,
	getCollection,
	syncAccountNonce,
} from "db3.js";
import SlideStepper from "../components/SlideStepper";
import { Connector } from "../components/AppNavBar2";
import { wait } from "../util/general";
import Approval from "../page-contents/generate/Approval";
import AuthorizerSelection from "../page-contents/generate/AuthorizerSelection";
import ClientAppSelection from "../page-contents/generate/ClientAppSelection";
import FinalStep from "../page-contents/generate/FinalStep";
import { ZK_GATE_CONTRACT } from "../constants/network";
import moment from "moment";
import { NetworkContext } from "../contexts/network";
import { toast } from "react-toastify";
import { PageContext } from "../contexts/page";

export type TabInfo = {
	current: number;
	previous: number;
};

export const GeneratePageContext = createContext<{
	result: number;
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
	result: 0,
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
	const { contract, connection } = useContext(NetworkContext);
	const [googleUser, setGoogleUser] = useState<any>();
	const [proof, setProof] = useState<any>();
	const [nullifier, setNullifier] = useState<any>();
	const [selectedApp, setSelectedApp] = useState("learn");
	const [result, setResult] = useState(0);

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
		if (!contract) {
			toast.error("Contract is not defined!");
			return;
		}
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
					setResult(2);
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
						setResult(1);
					});

				await pushToDb3(metadata).then(() => {
					console.log("Successfully pushed to db3");
				});
			})
			.catch((error) => {
				setResult(0);
				console.error(error);
				toast.error("Error in NFT minting!");
			});

		// await wait(5000);
		// setResult(2)
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
				result,
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
				) : connection.state !== 'connected' ? (
					<InvalidNetwork />
				) : (
					<Box>
						<ClientAppSelection />
						<AuthorizerSelection />
						<Approval />
						<FinalStep />
						<SlideStepper
							disabled={activeStep.current === 3}
							steps={4}
							activeStep={activeStep.current}
							onChange={handleFormViewChange}
						/>
					</Box>
				)}
			</Box>
		</GeneratePageContext.Provider>
	);
};

export default GeneratePage;

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

const InvalidNetwork = () => {
  const { setOpenNetworkMenu } = useContext(PageContext);
	return (
		<Box display={"flex"} justifyContent={"center"} marginTop={15}>
			<Grow in={true} timeout={1000}>
				<Box>
					<Box display={"flex"} justifyContent={"center"}>
						<img
							src={`${process.env.PUBLIC_URL}/assets/invalid-network.png`}
							width={400}
						/>
					</Box>
					<Stack
						direction={"row"}
						justifyContent={"center"}
						marginTop={5}
					>
						<Button variant="outlined" size="small" onClick={() => setOpenNetworkMenu(true)}>Change Network</Button>
					</Stack>
				</Box>
			</Grow>
		</Box>
	);
};