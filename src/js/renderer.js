document.addEventListener('DOMContentLoaded', () => {
    window.api.loadGames().then(games => {
        createGameCards(games);
    }).catch(err => {
        console.error("Error loading games:", err);
    });
});

function createGameCards(games) {
    const container = document.getElementById('game-cards-container');
    container.innerHTML = '';  // Clear existing content

    games.forEach(game => {
        const card = document.createElement('div');
        card.className = 'game-banner';
        card.style.backgroundImage = `url('${game.background_image_url}')`;
        card.innerHTML = `<div class="game-details">
                            <h3>${game.game_name}</h3>
                            <p>${game.description}</p>
                          </div>`;
        container.appendChild(card);
    });
}
