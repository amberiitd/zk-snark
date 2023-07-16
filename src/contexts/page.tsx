import { useMediaQuery } from "@mui/material";
import { noop } from "lodash";
import { createContext, FC, useEffect, useMemo, useState } from "react";
import { useDebounce } from "use-debounce";
import ShadowLoader from "../components/ShadowLoader";

export const PageContext = createContext<{
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  connectDrawer: boolean;
  setConnectDrawer: React.Dispatch<React.SetStateAction<boolean>>;
  screenSize: "sm" | "lg";
	navigationOff: boolean;
	setNavigationOff: React.Dispatch<React.SetStateAction<boolean>>;
}>({
  loading: false,
  setLoading: noop,
  connectDrawer: false,
  setConnectDrawer: noop,
  screenSize: 'lg',
	navigationOff: false,
	setNavigationOff: noop,
});
const PageContextProvider: FC<{ children: any }> = ({ children }) => {
  const largeScreen = useMediaQuery('(min-width: 600px)')
	const [navigationOff, setNavigationOff] = useState<boolean>(false);
  const screenSize = useMemo(() => largeScreen? 'lg': 'sm', [largeScreen])
  const [connectDrawer, setConnectDrawer] = useState(false);
  const [loading, setLoading] = useState(false);

	return (
		<PageContext.Provider
			value={{
        loading,
        setLoading,
        connectDrawer,
        setConnectDrawer,
        screenSize,
				navigationOff,
				setNavigationOff,
			}}
		>
			{children}
      <ShadowLoader />
		</PageContext.Provider>
	);
};

export default PageContextProvider;
