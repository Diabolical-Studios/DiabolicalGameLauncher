import React from "react";

const SettingsPage = () => {
    return (
        <div>
            <div className="settingsGrid">
                <div className="resolutionSetting">
                    <label htmlFor="resolution">Change Window Size:</label>
                    <select id="resolution" className="settingsSelect">
                        <option value="1280x720">1280x720</option>
                        <option value="800x600">800x600</option>
                    </select>
                    <button className="settingsButton shimmer-button" id="applyButton">
                        Apply
                    </button>
                </div>
                <a className="checkUpdateText" id="check-for-update" href="">
                    Check For Update
                </a>
            </div>
        </div>
    );
};

export default SettingsPage;
