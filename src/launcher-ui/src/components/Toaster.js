import React, { useEffect, useState } from "react";

const Toaster = () => {
    const [toasters, setToasters] = useState([]);

    useEffect(() => {
        if (window.electronAPI) {
            window.electronAPI.onNotification((data) => {
                setToasters((prevToasters) => {
                    // Check if a toaster with the same gameId already exists
                    if (prevToasters.some(toaster => toaster.gameId === data.gameId)) {
                        return prevToasters; // Prevent duplicates
                    }

                    const newToaster = {
                        id: Date.now(),
                        title: data.title,
                        body: data.body,
                        gameId: data.gameId,
                    };

                    return [...prevToasters, newToaster];
                });

                // Automatically remove toaster after 60 seconds
                setTimeout(() => {
                    setToasters((prevToasters) =>
                        prevToasters.filter((toaster) => toaster.gameId !== data.gameId)
                    );
                }, 60000);
            });
        }
    }, []);

    const handleDownload = (gameId) => {
        if (window.electronAPI) {
            window.electronAPI.downloadGame(gameId);
            setToasters((prevToasters) =>
                prevToasters.filter((toaster) => toaster.gameId !== gameId)
            );
        }
    };

    return (
        <div id="toaster-container">
            {toasters.map((toaster, index) => (
                <div
                    key={toaster.id}
                    className="toaster-notification show"
                    style={{ bottom: `${12 + index * 75}px` }} // Stacks toasters
                >
                    <div className="toaster-content">
                        <div style={{ margin: "12px 0 12px 16px" }}>
                            <strong>{toaster.title}</strong>
                            <p>{toaster.body}</p>
                        </div>
                        <button
                            className="toaster-button"
                            onClick={() => handleDownload(toaster.gameId)}
                        >
                            UPDATE
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default Toaster;
