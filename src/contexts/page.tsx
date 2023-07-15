import { useMediaQuery } from "@mui/material";
import { noop } from "lodash";
import { createContext, FC, useEffect, useMemo, useState } from "react";
import { useDebounce } from "use-debounce";

export const PageContext = createContext<{
  connectDrawer: boolean;
  setConnectDrawer: React.Dispatch<React.SetStateAction<boolean>>;
  screenSize: "sm" | "lg";
	navigationOff: boolean;
	setNavigationOff: React.Dispatch<React.SetStateAction<boolean>>;
}>({
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

	return (
		<PageContext.Provider
			value={{
        connectDrawer,
        setConnectDrawer,
        screenSize,
				navigationOff,
				setNavigationOff,
			}}
		>
			{children}
		</PageContext.Provider>
	);
};

export default PageContextProvider;
