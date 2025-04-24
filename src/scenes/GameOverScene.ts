import { Scene } from 'phaser';

export class GameOverScene extends Scene {
    constructor() {
        super({ key: 'GameOverScene' });
    }

    create(): void {
        // Добавляем текст окончания игры
        const gameOverText = this.add.text(
            this.cameras.main.centerX,
            this.cameras.main.centerY - 50,
            'Игра окончена',
            {
                fontSize: '64px',
                color: '#ff0000',
                fontFamily: 'Arial'
            }
        );
        gameOverText.setOrigin(0.5);

        // Добавляем кнопку перезапуска
        const restartButton = this.add.text(
            this.cameras.main.centerX,
            this.cameras.main.centerY + 50,
            'Начать заново',
            {
                fontSize: '32px',
                color: '#ffffff',
                backgroundColor: '#000000',
                padding: { x: 20, y: 10 }
            }
        );
        restartButton.setOrigin(0.5);
        restartButton.setInteractive();

        // Эффект при наведении
        restartButton.on('pointerover', () => {
            restartButton.setStyle({ backgroundColor: '#333333' });
        });

        restartButton.on('pointerout', () => {
            restartButton.setStyle({ backgroundColor: '#000000' });
        });

        // Обработчик нажатия
        restartButton.on('pointerdown', () => {
            this.scene.start('GameScene');
        });
    }
} 