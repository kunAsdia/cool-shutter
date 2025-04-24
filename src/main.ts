import { GameScene } from './scenes/GameScene';
import { UpgradeScene } from './scenes/UpgradeScene';
import { GameOverScene } from './scenes/GameOverScene';

const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
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

const game = new Phaser.Game(config);

// Обработчик кнопки старта
document.getElementById('start-button')?.addEventListener('click', () => {
    const menu = document.getElementById('menu');
    const gameContainer = document.getElementById('game-container');
    
    if (menu) menu.style.display = 'none';
    if (gameContainer) gameContainer.style.visibility = 'visible';
    
    game.scene.start('GameScene');
}); 