import React, {useEffect, useState} from "react";
import './../settings.css';

const SettingsPage = () => {

    const [resolution, setResolution] = useState("");
    useEffect(() => {
        if (window.api) {
            window.electronAPI.getWindowSize().then((size) => {
                setResolution(`${size.width}x${size.height}`);
            });
        } else console.log("window.api is not available (running in the browser)");
    }, []);

    const handleResolutionChange = (event) => {
        setResolution(event.target.value);
    };

    const applyResolutionChange = () => {
        const [width, height] = resolution.split("x").map(Number);
        if (window.api) {
            window.electronAPI.setWindowSize(width, height);
        } else console.log("window.api is not available (running in the browser)");

    };

    return (<div>
        <div className="settingsGrid">
            <div className="resolutionSetting">
                <label htmlFor="resolution">Change Window Size:</label>
                <select id="resolution" className="settingsSelect" value={resolution}
                        onChange={handleResolutionChange}>
                    <option value="1280x720">1280x720</option>
                    <option value="800x600">800x600</option>
                </select>
                <button className="settingsButton shimmer-button" onClick={applyResolutionChange}>
                    Apply
                </button>
            </div>
        </div>
    </div>);
};

export default SettingsPage;
