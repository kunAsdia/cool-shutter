import { Scene } from 'phaser';

export class GameOverScene extends Scene {
    constructor() {
        super({ key: 'GameOverScene' });
    }

    create(): void {
        // Показываем сообщение о конце игры
        const gameOverText = document.getElementById('game-over-message');
        if (gameOverText) {
            gameOverText.style.display = 'block';
        }

        // Добавляем кнопку перезапуска
        const restartButton = document.createElement('button');
        restartButton.id = 'restart-button';
        restartButton.textContent = 'Начать заново';
        restartButton.onclick = () => {
            this.scene.start('GameScene');
            if (gameOverText) {
                gameOverText.style.display = 'none';
            }
            restartButton.remove();
        };
        document.getElementById('game-container')?.appendChild(restartButton);
    }
} 