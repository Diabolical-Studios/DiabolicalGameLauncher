import React, {useEffect, useState} from "react";
import ToastItem from "./ToastItem";

const Toaster = () => {
    const [toasters, setToasters] = useState([]);

    useEffect(() => {
        if (window.electronAPI) {
            window.electronAPI.onNotification((data) => {
                setToasters((prev) => {
                    if (prev.some((t) => t.gameId === data.gameId && t.title === data.title)) {
                        return prev;
                    }
                    const newToast = {
                        id: Date.now(),
                        title: data.title,
                        body: data.body,
                        gameId: data.gameId,
                        duration: data.duration || 5000 // fallback to 5000ms if not provided
                    };
                    return [...prev, newToast];
                });
            });
        }
    }, []);

    const handleDownload = (gameId) => {
        if (window.electronAPI) {
            window.electronAPI.downloadGame(gameId);
        }
    };

    const dismissToaster = (id) => {
        setToasters((prev) => prev.filter((t) => t.id !== id));
    };

    return (<div
        id="toaster-container"
        className="fixed flex flex-col gap-3 items-end"
        style={{bottom: "24px", right: "24px", zIndex: "9999"}}
    >
        {toasters.map((toast) => (<ToastItem
            key={toast.id}
            toast={toast}
            timeout={300}
            autoDismiss={toast.duration}
            onDownload={handleDownload}
            onDismiss={dismissToaster}
        />))}
    </div>);
};

export default Toaster;
