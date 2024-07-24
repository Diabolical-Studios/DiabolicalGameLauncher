document.addEventListener("DOMContentLoaded", () => {
  window.api
    .loadGames()
    .then((games) => {
      createGameCards(games);
      enableHorizontalDragging("game-cards-container");
    })
    .catch((err) => {
      console.error("Error loading games:", err);
    });

  window.bridge.updateMessage(updateMessage);

  const versionElement = document.getElementById("launcher-version-number");
  if (versionElement) {
    versionElement.textContent = `v${window.versions.appVersion}`; // Update version number dynamically
  }

  const contentArea = document.getElementById("contentArea");

  document.getElementById("homeButton").addEventListener("click", function () {
    const contentArea = document.getElementById("contentArea");
    // Initial placeholder loading cards
    contentArea.innerHTML = `
        <div id="game-cards-container">
            <div class="game-banner">
                <div class="card loading">
                    <div class="image"></div>
                    <div class="content">
                        <h1></h1>
                        <h2></h2>
                    </div>
                </div>
            </div>
            <div class="game-banner">
                <div class="card loading">
                    <div class="image"></div>
                    <div class="content">
                        <h1></h1>
                        <h2></h2>
                    </div>
                </div>
            </div>
            <div class="game-banner">
                <div class="card loading">
                    <div class="image"></div>
                    <div class="content">
                        <h1></h1>
                        <h2></h2>
                    </div>
                </div>
            </div>
        </div>
    `;
    // Load games when the home button is clicked
    window.api
      .loadGames()
      .then((games) => {
        createGameCards(games); // Assuming createGameCards clears the old cards and creates new ones
        enableHorizontalDragging("game-cards-container");
      })
      .catch((err) => {
        console.error("Error reloading games:", err);
      });
  });

  document
    .getElementById("settingsButton")
    .addEventListener("click", function () {
      window.electronAPI
        .loadHtml("src/html/settings.html")
        .then((html) => {
          contentArea.innerHTML = html;
          setupEventListeners(); // Set up event listeners after the HTML is inserted
        })
        .catch((error) => console.error(error));
    });

  document.querySelectorAll(".game-button").forEach((button) => {
    button.addEventListener("click", function () {
      const gameId = this.getAttribute("data-gameid");
      window.electronAPI.downloadGame(gameId);
    });
  });

  window.api.onDbStatusChange((status) => {
    const statusDiv = document.getElementById("launcher-version-status");
    statusDiv.style.backgroundColor = status; // Set the color based on the status
  });

  window.electronAPI.onDownloadComplete((event, gameId, installPath) => {
    const downloadButton = document.querySelector(`[data-gameid="${gameId}"]`);
    if (downloadButton) {
      downloadButton.innerHTML = `<img src="Resources/MenuIcons/play.png" alt="Play">`;
      downloadButton.onclick = () => window.electronAPI.openGame(installPath);
      // Optionally update or show a path display element
      const pathDisplay = document.getElementById(`path-container-${gameId}`);
      if (pathDisplay) {
        pathDisplay.textContent = `Installed at: ${installPath}`;
        pathDisplay.style.display = "block";
      }
    }
  });

  window.electronAPI.onDownloadProgress((event, { gameId, percentage }) => {
    const downloadButton = document.querySelector(`[data-gameid="${gameId}"]`);
    if (downloadButton) {
      // Format the percentage to a more readable form, e.g., "Downloading 50%"
      downloadButton.innerHTML = `${Math.round(percentage * 100)}%`;
    }
  });

  window.electronAPI.onDownloadError((event, gameId, error) => {
    console.error(`Download failed for ${gameId}:`, error);
  });

  window.electronAPI
    .getInstalledGames()
    .then((installedGames) => {
      console.log("Installed games:", installedGames);
      updateGameButtons(installedGames);
    })
    .catch((error) => {
      console.error("Error getting installed games:", error);
    });

  const closeButton = document.getElementById("close-btn");
  closeButton.addEventListener("click", closeWindow);

  const checkUpdateButton = document.getElementById("check-for-update");
  checkUpdateButton.addEventListener("click", () => {
    ipcRenderer.send("check-for-updates");
  });
});

function updateMessage(event, message) {
  console.log("message logged in view");
  let elemE = document.getElementById("message");
  if (elemE) {
    elemE.textContent = message;
  }
}

function closeWindow() {
  window.electronAPI.closeWindow();
}

async function createGameCards(games) {
  const container = document.getElementById("game-cards-container"); // Now targeting the correct container

  const installedGames = await window.electronAPI.getInstalledGames(); // Get installed games once and use throughout

  // Clear the container of loading placeholders before appending actual game cards
  container.innerHTML = "";

  games.forEach((game) => {
    const card = document.createElement("div");
    card.className = "game-banner";
    card.style.backgroundImage = `url('${game.background_image_url}')`;
    let buttonIconUrl = "Resources/MenuIcons/download.png"; // Default to download icon
    let buttonAction = `startDownload('${game.game_id}')`;

    // Check if the game is installed
    if (installedGames.includes(game.game_id)) {
      buttonIconUrl = "Resources/MenuIcons/play.png"; // Change to play icon
      buttonAction = `openGame('${game.game_id}')`; // Change to open game function
    }

    card.innerHTML = `
            <div class="game-details">
                <h3>${game.game_name}</h3>
                <p>${game.description}</p>
            </div>
            <button class="game-button shimmer-button" data-gameid="${game.game_id}" onclick="${buttonAction}">
                <img src="${buttonIconUrl}" alt="Download">
                <svg width="79" height="46" viewBox="0 0 79 46" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <g filter="url(#filter0_f_618_1123)">
                        <path d="M42.9 2H76.5L34.5 44H2L42.9 2Z" fill="url(#paint0_linear_618_1123)"/>
                    </g>
                    <defs>
                        <filter id="filter0_f_618_1123" x="0" y="0" width="78.5" height="46" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
                            <feFlood flood-opacity="0" result="BackgroundImageFix"/>
                            <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
                            <feGaussianBlur stdDeviation="1" result="effect1_foregroundBlur_618_1123"/>
                        </filter>
                        <linearGradient id="paint0_linear_618_1123" x1="76.5" y1="2.00002" x2="34.5" y2="44" gradientUnits="userSpaceOnUse">
                            <stop stop-color="white" stop-opacity="0.8"/>
                            <stop offset="1" stop-color="white" stop-opacity="0.1"/>
                        </linearGradient>
                    </defs>
                </svg>
            </button>
        `;
    container.appendChild(card);
  });
}

function startDownload(gameId) {
  window.electronAPI.downloadGame(gameId);
}

function openGame(gameId) {
  window.electronAPI.openGame(gameId);
}

function setupEventListeners() {
  const applyButton = document.getElementById("applyButton");
  console.log("apply button found!");
  if (applyButton) {
    applyButton.addEventListener("click", function () {
      const resolution = document.getElementById("resolution").value;
      const [width, height] = resolution.split("x").map(Number);
      console.log(`Requesting window size change to: ${width}x${height}`);
      window.electronAPI.setWindowSize(width, height);
    });
  } else {
    console.log("Apply button not found after HTML insertion.");
  }
}

function enableHorizontalDragging(containerId) {
  const slider = document.getElementById(containerId);
  let isDown = false;
  let startX;
  let scrollLeft;
  let velocity = 0;
  let animationFrameId = null;

  slider.addEventListener("mousedown", (e) => {
    isDown = true;
    startX = e.pageX - slider.offsetLeft;
    scrollLeft = slider.scrollLeft;
    slider.classList.add("grabbing");
    slider.classList.remove("grabbable");
    cancelAnimationFrame(animationFrameId); // Stop any ongoing animation when dragging starts
  });

  slider.addEventListener("mouseleave", () => {
    isDown = false;
    slider.classList.remove("grabbing");
    slider.classList.add("grabbable");
  });

  slider.addEventListener("mouseup", () => {
    isDown = false;
    slider.classList.remove("grabbing");
    slider.classList.add("grabbable");
    startMomentumScroll();
  });

  slider.addEventListener("mousemove", (e) => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - slider.offsetLeft;
    const walk = x - startX;
    slider.scrollLeft = scrollLeft - walk;
  });

  slider.addEventListener("wheel", (e) => {
    e.preventDefault();
    velocity += e.deltaY * 0.1; // Adjust the multiplier for sensitivity
    startMomentumScroll();
  });

  function startMomentumScroll() {
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
    }
    animationFrameId = requestAnimationFrame(momentumScroll);
  }

  function momentumScroll() {
    if (Math.abs(velocity) > 0.5) {
      slider.scrollLeft += velocity;
      velocity *= 0.95; // Deceleration factor, can be adjusted for "friction"
      animationFrameId = requestAnimationFrame(momentumScroll);
    } else {
      cancelAnimationFrame(animationFrameId); // Stop the animation frame when movement is negligible
    }
  }
}
