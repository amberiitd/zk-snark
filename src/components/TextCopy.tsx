import { Box, Button, IconButton, Typography } from "@mui/material";
import { FC, useEffect, useMemo, useState } from "react";
import ContentPasteOutlinedIcon from "@mui/icons-material/ContentPasteOutlined";
import AssignmentTurnedInOutlinedIcon from "@mui/icons-material/AssignmentTurnedInOutlined";
import { useTheme } from "@emotion/react";
import { tokens } from "../contexts/theme";
import { toast } from "react-toastify";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import TaskAltIcon from "@mui/icons-material/TaskAlt";

interface TextCopyProps {
	text: string;
	title?: string;
	label?: string;
	hidden?: boolean;
}

const TextCopy: FC<TextCopyProps> = (props) => {
	const theme: any = useTheme();
	const colors = useMemo(() => tokens(theme.palette.mode), [theme]);
	const [copied, setCopied] = useState(false);
	const [timer, setTimer] = useState<NodeJS.Timeout | undefined>(undefined);
	const [title, setTitle] = useState(props.title || "Copy text");
	useEffect(() => {
		if (timer) clearTimeout(timer);
		if (copied) {
			toast.info("Copied to clipboard.");
			setTimer(
				setTimeout(() => {
					setCopied(false);
				}, 5000)
			);
		} else {
			setTimer(undefined);
		}
	}, [copied]);
	const placeholder = (
		<Box
			display={"inline-flex"}
			sx={{ height: "15px", width: "15px" }}
		></Box>
	);
	return !props.hidden ? (
		<Typography
			variant="h4"
			ml={2}
			fontWeight={700}
			p={1}
			sx={{
				"&:hover": {
					backgroundColor: colors.primary[300],
				},

				borderRadius: 5,
				cursor: "pointer",
			}}
			title={title}
			onClick={() => {
				navigator.clipboard.writeText(props.text);
				setCopied(true);
				setTitle("Copied");
			}}
		>
			{/* {toUpper(
							account.code.slice(0, 6) +
								"..." +
								account.code.slice(account.code.length - 4)
						)} */}
			{props.label || props.text}
			{copied ? (
				<TaskAltIcon sx={{ paddingTop: "2px", marginLeft: 1 }} />
			) : (
				<ContentCopyIcon sx={{ paddingTop: "2px", marginLeft: 1 }} />
			)}
		</Typography>
	) : (
		placeholder
	);
};

export default TextCopy;
