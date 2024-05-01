document.addEventListener('DOMContentLoaded', () => {

    setupScrollHandler();
    setupKeyboardHandler();
    
    window.api.loadGames().then(games => {
        createGameCards(games);
    }).catch(err => {
        console.error("Error loading games:", err);
    });

    const contentArea = document.getElementById('contentArea');

    document.getElementById('homeButton').addEventListener('click', function () {
        location.reload();
    });

    document.getElementById('settingsButton').addEventListener('click', function () {
        window.electronAPI.loadHtml('src/html/settings.html').then(html => {
            contentArea.innerHTML = html;
        }).catch(error => console.error(error));
    });

    document.querySelectorAll('.game-button').forEach(button => {
        button.addEventListener('click', function () {
            const gameId = this.getAttribute('data-gameid');
            window.electronAPI.downloadGame(gameId);
        });
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
                pathDisplay.style.display = 'block';
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

    window.electronAPI.getInstalledGames().then(installedGames => {
        console.log('Installed games:', installedGames);
        updateGameButtons(installedGames);
    }).catch(error => {
        console.error("Error getting installed games:", error);
    });
});

let currentIndex = 0; // Keeps track of the current card index


function closeWindow() {
    window.electronAPI.closeWindow();
}

async function createGameCards(games) {
    const container = document.getElementById('game-cards-container');
    container.innerHTML = '';

    const installedGames = await window.electronAPI.getInstalledGames(); // Get installed games once and use throughout

    games.forEach(game => {
        const card = document.createElement('div');
        card.className = 'game-banner';
        card.style.backgroundImage = `url('${game.background_image_url}')`;
        let buttonIconUrl = "Resources/MenuIcons/download.png";  // Default to download icon
        let buttonAction = `startDownload('${game.game_id}')`;

        // Check if the game is installed
        if (installedGames.includes(game.game_id)) {
            buttonIconUrl = "Resources/MenuIcons/play.png";  // Change to play icon
            buttonAction = `openGame('${game.game_id}')`;  // Change to open game function
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


window.electronAPI.onDownloadError((event, gameId, error) => {
    console.error(`Download failed for ${gameId}:`, error);
    // Optionally reset the button or show an error message
});


function setupScrollHandler() {
    const container = document.getElementById('game-cards-container');
    if (!container) {
        console.error('Game cards container not found!');
        return;
    }

    const debouncedScroll = debounce(function (event) {
        const direction = event.deltaY > 0 ? 1 : -1;
        changeCardIndex(direction);
        scrollToCurrentIndex(container);
    }, 300, true);

    container.addEventListener('wheel', (event) => {
        event.preventDefault(); // Prevent the default scroll behavior
        debouncedScroll(event);
    });
}

function changeCardIndex(change) {
    const container = document.getElementById('game-cards-container');
    currentIndex += change;
    // Clamp the index to valid range
    currentIndex = Math.max(0, Math.min(currentIndex, container.children.length - 1));
}

function scrollToCurrentIndex(container) {
    const cardWidth = 390; // Adjust based on your actual card width + margin
    container.scrollTo({
        left: currentIndex * cardWidth,
        behavior: 'smooth'  // Smooth scrolling
    });
}

function setupKeyboardHandler() {
    document.addEventListener('keydown', (event) => {
        if (event.key === 'ArrowRight') {
            changeCardIndex(1);
            scrollToCurrentIndex(document.getElementById('game-cards-container'));
        } else if (event.key === 'ArrowLeft') {
            changeCardIndex(-1);
            scrollToCurrentIndex(document.getElementById('game-cards-container'));
        }
    });
}

function debounce(func, wait, immediate) {
    let timeout;
    return function () {
        const context = this, args = arguments;
        const later = function () {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
    };
}

function loadHtmlFile(fileName) {
    const path = require('path');
    const fs = require('fs');
    const filePath = path.join(__dirname, fileName);

    fs.readFile(filePath, 'utf8', (err, html) => {
        if (err) {
            console.error('Error reading file:', err);
            return;
        }
        document.getElementById('contentArea').innerHTML = html;
    });
}