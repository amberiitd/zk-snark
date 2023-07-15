import { useTheme } from "@emotion/react";
import { FC } from "react";

const Spinner: FC<{style?: any; height?: number | string; width?: number | string;}> = ({style={}, height=24, width=24}) => {
  const theme: any = useTheme();
	return (
		<img
			src={`${process.env.PUBLIC_URL}/assets/Spinner-${theme.palette.mode}.svg`}
			height={height}
			width={width}
			style={{ ...style }}
		/>
	);
};

export default Spinner;
