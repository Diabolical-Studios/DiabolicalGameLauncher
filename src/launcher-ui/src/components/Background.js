
import React, { useEffect } from "react";

const Background = () => {
    useEffect(() => {
        document.body.style.margin = "0";
        document.body.style.width = "100vw";
        document.body.style.height = "100vh";
        document.body.style.backgroundColor = "#000";
        document.body.style.overflow = "hidden";
        document.body.style.color = "white";
        document.body.style.fontFamily = "'Consolas', sans-serif";
        document.body.style.userSelect = "none";

        document.body.style.backgroundImage =
            "radial-gradient(rgba(87, 87, 87, 0.3) 1px, transparent 1px), " +
            "radial-gradient(rgba(87, 87, 87, 0.3) 1px, transparent 1px)";
        document.body.style.backgroundPosition = "0 0, 0 0";
        document.body.style.backgroundSize = "20px 20px";
        document.body.style.animation = "moveBackground 3s linear infinite";

        const styleSheet = document.createElement("style");
        styleSheet.type = "text/css";
        styleSheet.innerHTML = `
      @keyframes moveBackground {
        0% {
          background-position: 0 0, 0 0;
        }
        100% {
          background-position: 20px 20px, 20px 20px;
        }
      }
    `;
        document.head.appendChild(styleSheet);
    }, []);

    return null; // This component just applies styles
};

export default Background;
