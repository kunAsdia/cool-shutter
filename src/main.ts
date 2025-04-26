import { GameScene } from './scenes/GameScene';
import { UpgradeScene } from './scenes/UpgradeScene';
import { GameOverScene } from './scenes/GameOverScene';

let game: Phaser.Game | null = null;

const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: 1280,
    height: 720,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0, x: 0 },
            debug: false
        }
    },
    scene: [GameScene, UpgradeScene, GameOverScene],
    parent: 'game-container'
};

// Обработчик кнопки старта
document.getElementById('start-button')?.addEventListener('click', () => {
    const menu = document.getElementById('menu');
    const gameContainer = document.getElementById('game-container');
    
    if (menu) menu.style.display = 'none';
    if (gameContainer) gameContainer.style.visibility = 'visible';
    
    // Создаем игру только при нажатии кнопки
    if (!game) {
        game = new Phaser.Game(config);
    }
    
    game.scene.start('GameScene');
}); 