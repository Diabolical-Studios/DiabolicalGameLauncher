document.addEventListener("DOMContentLoaded", () => {
  window.api
    .loadGames()
    .then((games) => {
      createGameCards(games);
      enableHorizontalDragging("game-cards-container");
      attachContextMenu(); // Attach context menu listeners after the cards are created
    })
    .catch((err) => {
      console.error("Error loading games:", err);
    });

  window.bridge.updateMessage(updateMessage);

  const versionElement = document.getElementById("launcher-version-number");
  if (versionElement) {
    versionElement.textContent = `v${window.versions.appVersion}`;
  }

  const contentArea = document.getElementById("contentArea");

  document.getElementById("homeButton").addEventListener("click", function () {
    const contentArea = document.getElementById("contentArea");
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
    window.api
      .loadGames()
      .then((games) => {
        createGameCards(games);
        enableHorizontalDragging("game-cards-container");
        attachContextMenu(); // Attach context menu listeners after the cards are created
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
          setupEventListeners();
          updateResolutionDropdown();
        })
        .catch((error) => console.error(error));
    });

  document
    .getElementById("changelogButton")
    .addEventListener("click", function () {
      window.electronAPI
        .loadHtml("src/html/changelog.html")
        .then((html) => {
          contentArea.innerHTML = html;
          setupEventListeners();
          updateResolutionDropdown();
        })
        .catch((error) => console.error(error));
    });

  window.api.onDbStatusChange((status) => {
    const statusDiv = document.getElementById("launcher-version-status");
    statusDiv.style.backgroundColor = status;
  });

  window.electronAPI.onDownloadComplete((event, gameId, installPath) => {
    const downloadButton = document.querySelector(`[data-gameid="${gameId}"]`);
    if (downloadButton) {
      downloadButton.innerHTML = `<img src="Resources/MenuIcons/play.png" alt="Play">`;
      downloadButton.onclick = () => window.electronAPI.openGame(gameId);
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

  const reloadButton = document.getElementById("reload-btn");
  closeButton.addEventListener("click", reloadWindow);

  const checkUpdateButton = document.getElementById("check-for-update");
  checkUpdateButton.addEventListener("click", () => {
    ipcRenderer.send("check-for-updates");
  });

  // Correctly listening for the 'game-uninstalled' event
  window.electronAPI.onGameUninstalled((gameId) => {
    console.log(`Received 'game-uninstalled' event for game ID: ${gameId}`);
    // Add logic to update the UI, e.g., update the button to a download button
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

function reloadWindow() {
  window.electronAPI.reloadWindow();
}

async function createGameCards(games) {
  const container = document.getElementById("game-cards-container");

  const installedGames = await window.electronAPI.getInstalledGames();

  container.innerHTML = "";

  games.forEach((game) => {
    const card = document.createElement("div");
    card.className = "game-banner";
    card.style.backgroundImage = `url('${game.background_image_url}')`;

    let buttonIconUrl = "Resources/MenuIcons/download.png";
    let buttonAction = `startDownload('${game.game_id}')`;

    if (installedGames.includes(game.game_id)) {
      buttonIconUrl = "Resources/MenuIcons/play.png";
      buttonAction = `openGame('${game.game_id}')`;
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
  attachContextMenu(); // Attach context menu listeners to the newly created cards
}

function startDownload(gameId) {
  window.electronAPI.downloadGame(gameId);
}

function openGame(gameId) {
  window.electronAPI.openGame(gameId);
}

function setupEventListeners() {
  const applyButton = document.getElementById("applyButton");
  if (applyButton) {
    applyButton.addEventListener("click", function () {
      const resolution = document.getElementById("resolution").value;
      const [width, height] = resolution.split("x").map(Number);
      window.electronAPI.setWindowSize(width, height);
      updateCSSClasses(width, height);
    });
  }
}

async function updateResolutionDropdown() {
  const { width, height } = await window.electronAPI.getWindowSize();
  const resolutionDropdown = document.getElementById("resolution");
  const currentResolution = `${width}x${height}`;
  resolutionDropdown.value = currentResolution;

  if (
    ![...resolutionDropdown.options].some(
      (option) => option.value === currentResolution
    )
  ) {
    const option = document.createElement("option");
    option.value = currentResolution;
    option.textContent = currentResolution;
    resolutionDropdown.appendChild(option);
    resolutionDropdown.value = currentResolution;
  }
}

// Function to update CSS classes based on window size
function updateCSSClasses(width, height) {
  const body = document.body;
  body.classList.remove(
    "small-resolution",
    "medium-resolution",
    "large-resolution"
  );

  if (width <= 800) {
    body.classList.add("small-resolution");
  } else if (width <= 1200) {
    body.classList.add("medium-resolution");
  } else {
    body.classList.add("large-resolution");
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
    cancelAnimationFrame(animationFrameId);
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
    velocity += e.deltaY * 0.1;
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
      velocity *= 0.95;
      animationFrameId = requestAnimationFrame(momentumScroll);
    } else {
      cancelAnimationFrame(animationFrameId);
    }
  }
}

function attachContextMenu() {
  document.querySelectorAll(".game-banner").forEach((card) => {
    card.addEventListener("contextmenu", (e) => {
      e.preventDefault();

      // Find the button within the card to get the game ID
      const button = card.querySelector(".game-button");
      const gameId = button.getAttribute("data-gameid");

      if (!gameId) {
        console.error("No gameId found on this card.");
        return;
      }

      const position = { x: e.pageX, y: e.pageY };

      // Debugging: Check if the event is firing correctly
      console.log(`Right-click detected on game with ID: ${gameId}`);
      console.log(`Position: ${position.x}, ${position.y}`);

      window.electronAPI.showContextMenu(gameId, position);
    });
  });
}
