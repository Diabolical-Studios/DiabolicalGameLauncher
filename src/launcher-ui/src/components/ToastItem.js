import React, {useEffect, useState} from "react";
import {Slide} from "@mui/material";
import {colors} from "../theme/colors";

const ToastItem = ({toast, timeout = 300, autoDismiss = 3000, onDownload, onDismiss}) => {
    const [show, setShow] = useState(false);

    useEffect(() => {
        // Trigger slide in after mount
        const timer = setTimeout(() => {
            setShow(true);
        }, 50);

        // Auto-dismiss after a specified duration by sliding out
        const autoTimer = setTimeout(() => {
            setShow(false);
        }, autoDismiss);

        return () => {
            clearTimeout(timer);
            clearTimeout(autoTimer);
        };
    }, [autoDismiss]);

    // When the slide exit animation completes, notify the parent to remove this toast
    const handleExited = () => {
        onDismiss(toast.id);
    };

    // For the UPDATE button: trigger download and then slide out
    const handleDownload = () => {
        if (onDownload) {
            onDownload(toast.gameId);
        }
        setShow(false);
    };

    // For the CLOSE button: simply slide out
    const handleClose = () => {
        setShow(false);
    };

    return (
        <Slide direction="left" in={show} timeout={timeout} onExited={handleExited}>
            <div
                className="relative rounded-sm shadow-lg transition-all duration-500 dialog"
                style={{
                    width: "fit-content",
                    height: "70px", // Fixed height for the toaster
                    outline: "solid 1px var(--border)",
                    justifyContent: "space-between",
                    padding: 0,
                    backgroundColor: "var(--background)",
                    backgroundImage:
                        "radial-gradient(rgba(87,87,87,0.3) 1px, transparent 1px), radial-gradient(rgba(87,87,87,0.3) 1px, transparent 1px)",
                    backgroundPosition: "0 0, 0 0",
                    backgroundSize: "20px 20px",
                    color: "var(--text)",
                }}
            >
                <div className="flex items-center justify-between h-full gap-3">
                    <div className="p-3">
                        <strong>{toast.title}</strong>
                        <p className="m-0" style={{color: colors.border}}>
                            {toast.body}
                        </p>
                    </div>
                    {toast.gameId ? (
                        <button
                            className="relative h-full p-3 rounded-r-sm border-none transition-all duration-200 cursor-pointer whitespace-nowrap overflow-hidden bg-[var(--background)] text-[var(--text)] toaster-button hover:backdrop-invert hover:bg-[var(--text)] hover:text-[var(--background)]"
                            onClick={handleDownload}
                        >
                            UPDATE
                        </button>
                    ) : (
                        <button
                            className="relative h-full p-3 rounded-r-sm border-none transition-all duration-200 cursor-pointer whitespace-nowrap overflow-hidden bg-[var(--background)] text-[var(--text)] toaster-button hover:backdrop-invert hover:bg-[var(--text)] hover:text-[var(--background)]"
                            onClick={handleClose}
                        >
                            CLOSE
                        </button>
                    )}
                </div>
            </div>
        </Slide>
    );
};

export default ToastItem;
