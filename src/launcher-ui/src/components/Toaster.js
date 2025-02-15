import React, { useEffect, useState } from "react";
import ToastItem from "./ToastItem";

const Toaster = () => {
    const [toasters, setToasters] = useState([]);

    useEffect(() => {
        if (window.electronAPI) {
            window.electronAPI.onNotification((data) => {
                setToasters((prev) => {
                    // Avoid duplicate notifications based on gameId and title
                    if (prev.some((t) => t.gameId === data.gameId && t.title === data.title)) {
                        return prev;
                    }
                    const newToast = {
                        id: Date.now(),
                        title: data.title,
                        body: data.body,
                        gameId: data.gameId, // if not provided, will be undefined
                    };
                    return [...prev, newToast];
                });

                // Instead of immediately removing the toast, let ToastItem auto-dismiss via its own timer.
            });
        }
    }, []);

    const handleDownload = (gameId) => {
        if (window.electronAPI) {
            window.electronAPI.downloadGame(gameId);
            // Remove toast via dismissal after slide out (handled in ToastItem)
        }
    };

    const dismissToaster = (id) => {
        setToasters((prev) => prev.filter((t) => t.id !== id));
    };

    return (
        <div
            id="toaster-container"
            className="fixed z-[1000] flex flex-col gap-3 items-end"
            style={{ bottom: "24px", right: "24px" }}
        >
            {toasters.map((toast) => (
                <ToastItem
                    key={toast.id}
                    toast={toast}
                    timeout={300}
                    autoDismiss={5000}
                    onDownload={handleDownload}
                    onDismiss={dismissToaster}
                />
            ))}
        </div>
    );
};

export default Toaster;
