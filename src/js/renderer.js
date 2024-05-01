document.addEventListener('DOMContentLoaded', () => {
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

    setupScrollHandler();
    setupKeyboardHandler();
});

function closeWindow() {
    window.electronAPI.closeWindow();
}


function createGameCards(games) {
    const container = document.getElementById('game-cards-container');
    container.innerHTML = '';  // Clear existing content

    games.forEach(game => {
        const card = document.createElement('div');
        card.className = 'game-banner';
        card.style.backgroundImage = `url('${game.background_image_url}')`;
        card.innerHTML = `
            <div class="game-details">
                <h3>${game.game_name}</h3>
                <p>${game.description}</p>
            </div>
            <button class="game-button" onclick="handleButtonClick('${game.game_name}')" class="shimmer-button">
    <img src="Resources/MenuIcons/download.png" alt="">
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
                <stop stop-color="white" stop-opacity="0.8"/> <!-- Increased opacity for a lighter appearance -->
                <stop offset="1" stop-color="white" stop-opacity="0.1"/> <!-- Increased opacity for a lighter appearance -->
            </linearGradient>
        </defs>
    </svg>
</button>

        `;
        container.appendChild(card);
    });
}



let currentIndex = 0; // Keeps track of the current card index

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
    }, 100, true);

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