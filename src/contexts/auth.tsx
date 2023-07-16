import { createContext, FC, useContext, useEffect, useState } from "react";
import { isEmpty, noop } from "lodash";
import { NetworkContext, WalletProvider } from "./network";
import { allowedWallets, networks } from "../constants/network";
import { toast } from "react-toastify";
import { Contract } from "fuels";
import { appName } from "../constants/general";
import {zk_gat_fuel_abi} from '../abis/fuel-zk-gate-abi'

export type Account = { code: string; source: "storage" | "eth" };
export const AuthContext = createContext<{
	account?: Account;
	setAccount: React.Dispatch<React.SetStateAction<Account | undefined>>;
	ethLogin: (provider?: "metamask" | "fuel") => Promise<void>;
}>({
	setAccount: noop,
	ethLogin: async () => {},
});

const AuthProvider: FC<{ children: any }> = ({ children }) => {
	const { setWallet, wallet, fuel, setContract, connection } = useContext(NetworkContext);
	const storageAccount = localStorage.getItem(`${appName}-account`);
	const [account, setAccount] = useState<Account | undefined>(
		storageAccount ? { code: storageAccount, source: "storage" } : undefined
	);

	const ethLogin = async (provider: WalletProvider = "metamask") => {
    if (!allowedWallets.includes(provider)){
      toast.error("Invalid wallet!")
      return;
    }
		try {
			await (provider === "metamask"
				? window.ethereum.request({
						method: "eth_requestAccounts",
				  })
				: provider === "fuel"
				? window.fuel
						.connect()
						.then(() =>
							window.fuel
								.currentAccount()
								.then((acc: string) => [acc])
						)
				: new Promise<string[]>((resolve, reject) => {})
			).then(async (accounts: string[]) => {
				console.log(accounts);
				if (accounts.length === 0) {
					console.log("no accounts found");
					return null;
				}
				setAccount({ code: accounts[0], source: "eth" });
				setWallet({
					provider,
					api: provider === "metamask" ? window.ethereum : undefined,
				});
				toast.success("Login successfull.");
			});
		} catch (err: any) {
			console.error(err);
			toast.error("LoginError: Etherium is not connected");
			setAccount(undefined);
		}
	};

	useEffect(() => {
		if (account && account.code && account.source !== "storage") {
			localStorage.setItem(`${appName}-account`, account.code);
		} else if (isEmpty(account?.code)) {
			localStorage.removeItem(`${appName}-account`);
		}

		if (account?.source !== "storage" && wallet?.provider) {
			localStorage.setItem(`${appName}-wallet-provider`, wallet.provider);
		} else if (!wallet?.provider) {
			localStorage.removeItem(`${appName}-wallet-provider`);
		}

		if (account?.code && account.source === "storage") {
			try {
				if (
					!wallet?.provider ||
					!allowedWallets.includes(wallet.provider) ||
					(wallet?.provider === fuel && !fuel) ||
					(wallet?.provider === "metamask" && !window.ethereum)
				) {
					throw Error("Wallet api unavailable!");
				}
				(wallet?.provider === "metamask"
					? window.ethereum.request({
							method: "eth_requestAccounts",
					  })
					: wallet?.provider === "fuel"
					? fuel
							.connect()
							.then(() =>
								window.fuel
									.currentAccount()
									.then((acc: string) => [acc])
							)
					: new Promise<string[]>((resolve, reject) => {})
				)
					.then(async (accounts: string[]) => {
						console.log(accounts);
						if (
							!isEmpty(accounts) &&
							accounts[0] === account.code
						) {
							setAccount({ code: accounts[0], source: "eth" });
						} else {
              throw Error("account changed or do not exist")
						}
					})
					.catch((err: any) => {
						console.error(err.message);
						setAccount(undefined);
					});
			} catch (err) {
				console.error(err);
        toast.error("Error in wallet connection!")
			}
		}
	}, [account, wallet, fuel]);

	useEffect(() => {
		const handleAccountChange = (accounts: Array<string>) => {
			if (isEmpty(accounts) || accounts[0] !== account?.code) {
				if (account?.code) toast.info("User logged out!");
				setAccount(undefined);
			}
		};

		window.ethereum.on("accountsChanged", handleAccountChange);
		return () => {
			window.ethereum.removeListener(
				"accountsChanged",
				handleAccountChange
			);
		};
	}, []);

  useEffect(() => {
		if (
			account?.code &&
			wallet?.provider === "fuel" &&
			fuel &&
			connection.state === 'connected' &&
      connection.connectedNetworkId === 'fuel0'
		) {
			fuel.getWallet(account.code).then((fuelWallet: any) => {
				console.log("fuel wallet", fuelWallet);
				const id = networks['fuel0'].contractAddress || "";
				const contract = new Contract(id, zk_gat_fuel_abi, fuelWallet);
				console.log("fuel contract", contract);
				setContract(contract);
			});
		}
	}, [account, wallet, fuel, connection]);

	return (
		<AuthContext.Provider
			value={{
				account,
				setAccount,
				ethLogin,
			}}
		>
			{children}
		</AuthContext.Provider>
	);
};

export default AuthProvider;
