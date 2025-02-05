import React from "react";

const AppCloseRefreshButtons = () => {
    const handleClose = () => {
        window.electronAPI.closeWindow(); // Call Electron API to close the window
    };

    const handleReload = () => {
        window.location.reload(); // Reloads the window
    };

    return (
        <div
            style={{
                display: "flex",
                flexDirection: "row-reverse",
                alignItems: "flex-start",
                justifyContent: "space-between",
                position: "relative",
                left: 0,
                top: 0,
                width: "-webkit-fill-available",
                height: "100%",
                color: "#fff",
                zIndex: 999,
                WebkitAppRegion: "drag", // Makes title bar draggable in Electron
            }}
        >
            {/* Window Controls */}
            <div style={{ display: "flex", WebkitAppRegion: "no-drag" }}>
                {/* Reload Button */}
                <button
                    onClick={handleReload}
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: "22px",
                        height: "22px",
                        marginLeft: "4px",
                        border: "none",
                        borderRadius: "4px",
                        backgroundColor: "#272727",
                        color: "#fff",
                        cursor: "pointer",
                        padding: 0,
                    }}
                >
                    <svg
                        width="18"
                        height="18"
                        viewBox="-6 -6 28 28"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            d="M8.16792 1.3057V0.487293C8.16792 0.104208 7.73756 -0.12216 7.39686 0.0693822L4.52778 1.75844C4.20501 1.94998 4.20501 2.40272 4.52778 2.59426L7.39686 4.28332C7.73756 4.47486 8.16792 4.24849 8.16792 3.86541V2.92511C11.037 3.09924 13.3143 5.39774 13.3143 8.23605C13.3143 9.48979 12.866 10.6913 12.0412 11.649C11.9336 11.7709 11.9515 11.945 12.0591 12.0495L12.866 12.7808C12.9916 12.8853 13.1888 12.8853 13.2964 12.7634C14.4082 11.5097 14.9999 9.9077 14.9999 8.23605C15.0178 4.50968 11.9874 1.47983 8.16792 1.3057Z"
                            fill="white"
                        />
                        <path
                            d="M7.5904 12.8479C7.25027 12.6567 6.82062 12.8827 6.82062 13.2653V14.2043C3.95632 14.0304 1.68278 11.735 1.68278 8.90054C1.68278 7.64851 2.13033 6.44864 2.95381 5.49222C3.06122 5.37049 3.04332 5.1966 2.93591 5.09226L2.13033 4.36191C2.00501 4.25757 1.80809 4.25757 1.70068 4.3793C0.590763 5.63134 0 7.23116 0 8.90054C0 12.6393 3.04332 15.665 6.83852 15.8389V16.6562C6.83852 17.0388 7.26817 17.2648 7.60831 17.0736L10.4726 15.3868C10.7948 15.1955 10.7948 14.7434 10.4726 14.5521L7.5904 12.8479Z"
                            fill="white"
                        />
                    </svg>
                </button>

                {/* Close Button */}
                <button
                    onClick={handleClose}
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: "22px",
                        height: "22px",
                        marginLeft: "4px",
                        border: "none",
                        borderRadius: "4px",
                        backgroundColor: "#272727",
                        color: "#fff",
                        cursor: "pointer",
                        padding: 0,
                    }}
                >
                    <svg
                        width="16"
                        height="16"
                        viewBox="-7 -7 30 30"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M0.928925 0.928941C1.31945 0.538416 1.95261 0.538416 2.34314 0.928941L8 6.5858L13.6569 0.928941C14.0474 0.538416 14.6806 0.538416 15.0711 0.928941C15.4616 1.31947 15.4616 1.95263 15.0711 2.34315L9.41421 8.00001L15.0711 13.6569C15.4616 14.0474 15.4616 14.6806 15.0711 15.0711C14.6805 15.4616 14.0474 15.4616 13.6568 15.0711L8 9.41423L2.34315 15.0711C1.95263 15.4616 1.31946 15.4616 0.928938 15.0711C0.538414 14.6806 0.538414 14.0474 0.928938 13.6569L6.58579 8.00001L0.928925 2.34315C0.538401 1.95263 0.538401 1.31946 0.928925 0.928941Z"
                            fill="white"
                        />
                    </svg>
                </button>
            </div>
        </div>
    );
};

export default AppCloseRefreshButtons;
