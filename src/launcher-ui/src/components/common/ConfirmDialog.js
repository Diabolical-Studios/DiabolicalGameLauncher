import React from "react";
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Typography
} from "@mui/material";
import {colors} from "../../theme/colors";
import {styled} from "@mui/material/styles";

const StyledDialog = styled(Dialog)(({theme}) => ({
    "& .MuiDialog-paper": {
        backgroundColor: colors.background,
        border: "1px solid" + colors.border,
        borderRadius: "4px",
        minWidth: "400px",
        maxWidth: "500px",
        margin: "16px",
    },
}));

const ConfirmDialog = ({
    open,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = "Confirm",
    cancelText = "Cancel",
    confirmColor = "error",
    isConfirming = false,
    confirmButtonProps = {},
    cancelButtonProps = {},
}) => {
    return (
        <StyledDialog
            open={open}
            onClose={onClose}
            aria-labelledby="confirm-dialog-title"
        >
            <DialogTitle 
                id="confirm-dialog-title"
                sx={{
                    color: colors.text,
                    borderBottom: "1px solid" + colors.border,
                    padding: "16px 24px",
                    height: "fit-content",
                }}
                className="dialog"
            >
                {title}
            </DialogTitle>
            <DialogContent sx={{ padding: "24px !important", backgroundColor: colors.background }} >
                <Typography sx={{ color: colors.text }}>
                    {message}
                </Typography>
            </DialogContent>
            <DialogActions sx={{ 
                padding: "16px 24px",
                borderTop: "1px solid" + colors.border,
                gap: "12px"
            }}                 className="dialog"
>
                <Button
                    onClick={onClose}
                    disabled={isConfirming}
                    sx={{
                        color: colors.text,
                        backgroundColor: colors.background,
                        outline: "1px solid" + colors.border,
                        borderRadius: "2px",
                        padding: "8px 16px",
                        "&:hover": {
                            backgroundColor: colors.button,
                        },
                        ...cancelButtonProps.sx
                    }}
                    {...cancelButtonProps}
                >
                    {cancelText}
                </Button>
                <Button
                    onClick={onConfirm}
                    disabled={isConfirming}
                    sx={{
                        backgroundColor: colors[confirmColor],
                        color: colors.text,
                        borderRadius: "2px",
                        padding: "8px 16px",
                        "&:hover": {
                            backgroundColor: colors[`${confirmColor}Dark`],
                        },
                        "&.Mui-disabled": {
                            backgroundColor: colors[`${confirmColor}Dark`],
                            opacity: 0.5,
                        },
                        ...confirmButtonProps.sx
                    }}
                    {...confirmButtonProps}
                >
                    {isConfirming ? "Confirming..." : confirmText}
                </Button>
            </DialogActions>
        </StyledDialog>
    );
};

export default ConfirmDialog; 