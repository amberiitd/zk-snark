import {
	createContext,
	FC,
	useCallback,
	useContext,
	useEffect,
	useState,
} from "react";
import Web3 from "web3";
import { allowedNetworkIds, networks } from "../constants/network";
import { noop } from "lodash";

export const ABI = require("../abi.json");
export const web3 = new Web3(window.ethereum);
export type WalletProvider = "metamask" | "fuel" | undefined;
export type Wallet = { provider: WalletProvider; api: any };
export type NetworkConnection = {
	state: "connecting" | "connected" | "disconnected" | "error";
	connectingNetworkId?: string;
  connectedNetworkId?: string;
};
export const NetworkContext = createContext<{
	connection: NetworkConnection;
	setConnection: React.Dispatch<React.SetStateAction<NetworkConnection>>;
	contract: any;
	setContract: React.Dispatch<React.SetStateAction<any>>;
	networkOption?: boolean;
	setNetworkOption: React.Dispatch<React.SetStateAction<boolean>>;
	wallet?: Wallet;
	setWallet: React.Dispatch<React.SetStateAction<Wallet | undefined>>;
	fuel?: any;
}>({
	connection: { state: "disconnected" },
	setConnection: noop,
	contract: undefined,
	setContract: noop,
	setNetworkOption: noop,
	setWallet: noop,
});

const NetworkProvider: FC<{ children: any }> = ({ children }) => {
	const [wallet, setWallet] = useState<Wallet | undefined>({
		api: undefined,
		provider: localStorage.getItem(
			"l-earn-wallet-provider"
		) as WalletProvider,
	});
	const [contract, setContract] = useState<any>();
	const [networkOption, setNetworkOption] = useState(false);
	const [fuel, setFuel] = useState<any>();
	const [connection, setConnection] = useState<NetworkConnection>({
		state: "disconnected",
	});

	useEffect(() => {
		// method: net_version, would give decimal string for chaninId
		if (wallet?.provider === "fuel") {
			setConnection({ state: "connected", connectedNetworkId: "fuel0" });
			return;
		}

		const handleEthereumNetworkChange = (chainId: string) => {
			console.log("swithced to: ", chainId);
			const decimalString = parseInt(chainId, 16).toString();
			if (
				!chainId ||
				!allowedNetworkIds["metamask"].includes(decimalString)
			) {
				setConnection({ state: "disconnected" });
			} else {
				setConnection({ state: "connected", connectedNetworkId: decimalString });
				// setContract(
				// 	new web3.eth.Contract(
				// 		ABI,
				// 		networks[decimalString].contractAddress
				// 	)
				// );
			}
		};

		if (wallet?.provider === "metamask") {
			if (!window.ethereum) {
				setConnection({ state: "disconnected" });
				return;
			} else {
				setConnection({ state: "connecting" });
				window.ethereum
					.request({ method: "eth_chainId" })
					.then(handleEthereumNetworkChange)
					.catch((err: any) => {
						setConnection({ state: "disconnected" });
					});
				window.ethereum.on("chainChanged", handleEthereumNetworkChange);

				return () => {
					window.ethereum.removeListener(
						"chainChanged",
						handleEthereumNetworkChange
					);
				};
			}
		}
	}, [wallet]);

	return (
		<NetworkContext.Provider
			value={{
				connection,
				setConnection,
				contract,
				setContract,
				networkOption,
				setNetworkOption,
				wallet,
				setWallet,
				fuel,
			}}
		>
			{children}
		</NetworkContext.Provider>
	);
};

export default NetworkProvider;
