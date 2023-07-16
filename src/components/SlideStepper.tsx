import KeyboardArrowLeft from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRight from "@mui/icons-material/KeyboardArrowRight";
import { Box, IconButton, MobileStepper } from "@mui/material";
import { noop } from "lodash";
import { FC, useState } from "react";

const SlideStepper: FC<{
  disabled?: boolean;
	steps?: number;
	activeStep: number;
	onChange?: (e: any, step: number) => void;
  style?: any;
}> = ({ steps = 3, activeStep = 0, onChange = noop, style={}, disabled }) => {
	return (
		<Box display={"flex"} justifyContent={"center"} sx={{...style}}>
			<MobileStepper
				variant="dots"
				steps={steps}
				position="static"
				activeStep={activeStep}
				sx={{ maxWidth: 400, flexGrow: 1, backgroundColor: 'transparent' }}
				nextButton={
					<IconButton
						size="small"
						onClick={(e) => onChange(e, activeStep + 1)}
						disabled={true}
					>
						{/* Next */}
						<KeyboardArrowRight />
					</IconButton>
				}
				backButton={
					<IconButton
						size="small"
						onClick={(e) => onChange(e, activeStep - 1)}
						disabled={disabled || activeStep === 0}
					>
						<KeyboardArrowLeft />
						{/* Back */}
					</IconButton>
				}
			/>
		</Box>
	);
};

export default SlideStepper;
