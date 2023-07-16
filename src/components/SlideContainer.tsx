import {
	Box,
	Slide
} from "@mui/material";
import {
	FC,
	ForwardRefExoticComponent,
	forwardRef,
	useRef,
} from "react";
import { useDebounce } from "use-debounce";
//  {...(!debouncedShow? {width: 0, height: 0}: {})}
const SlideContainer: FC<{
	show?: boolean;
	children: any;
  direction?: 'left' | 'right';
}> = ({ show, children, direction='left' }) => {
	return show ? (
		<Box maxWidth={600} height={600}>
			<Slide
				direction={direction}
				in={show}
				timeout={500}
			>
				<Box>{children}</Box>
			</Slide>
			
		</Box>
	): null;
};

export default SlideContainer;
