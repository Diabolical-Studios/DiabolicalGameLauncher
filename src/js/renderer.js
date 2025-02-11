document.addEventListener("DOMContentLoaded", () => {
    window.api
        .loadGames()
        .then((games) => {
            createGameCards(games);
            enableHorizontalDragging("game-cards-container");
            attachContextMenu();
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
                attachContextMenu();
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
    document
        .getElementById("libraryButton")
        .addEventListener("click", function () {
            window.electronAPI
                .loadHtml("src/html/library.html")
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

    container.innerHTML = "";

    games.forEach((game) => {
        const card = document.createElement("div");
        card.className = "game-banner";
        card.style.backgroundImage = `url('${game.background_image_url}')`;

        card.innerHTML = `
      <div class="game-details">
          <h3>${game.game_name}</h3>
          <p>${game.description}</p>
      </div>
      <button class="game-button shimmer-button">
          <img src="Resources/MenuIcons/download.png" alt="Download">
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
    const {width, height} = await window.electronAPI.getWindowSize();
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

            const button = card.querySelector(".game-button");
            const gameId = button.getAttribute("data-gameid");

            if (!gameId) {
                console.error("No gameId found on this card.");
                return;
            }

            const position = {x: e.pageX, y: e.pageY};

            console.log(`Right-click detected on game with ID: ${gameId}`);
            console.log(`Position: ${position.x}, ${position.y}`);

            window.electronAPI.showContextMenu(gameId, position);
        });
    });
}
