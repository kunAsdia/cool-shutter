import { Scene } from 'phaser';
import { Enemy } from '../models/Enemy';

export class EnemyHealthBar {
    private scene: Scene;
    private enemy: Enemy;
    private barWidth: number = 50;
    private barHeight: number = 5;
    private bar: Phaser.GameObjects.Graphics;
    private background: Phaser.GameObjects.Graphics;

    constructor(scene: Scene, enemy: Enemy) {
        this.scene = scene;
        this.enemy = enemy;
        
        // Создаем фон полоски здоровья
        this.background = scene.add.graphics();
        this.background.setDepth(1); // Устанавливаем глубину отрисовки
        
        // Создаем саму полоску здоровья
        this.bar = scene.add.graphics();
        this.bar.setDepth(1); // Устанавливаем глубину отрисовки
    }

    public update(): void {
        const sprite = this.enemy.getSprite();
        const health = this.enemy.getHealth();
        const maxHealth = 100; // Максимальное здоровье врага
        
        // Очищаем предыдущие полоски
        this.bar.clear();
        this.background.clear();
        
        // Рисуем фон
        this.background.fillStyle(0x000000, 0.5);
        this.background.fillRect(
            sprite.x - this.barWidth/2,
            sprite.y - 30,
            this.barWidth,
            this.barHeight
        );
        
        // Устанавливаем цвет в зависимости от количества здоровья
        const healthPercentage = health / maxHealth;
        let color = 0x00ff00; // Зеленый
        if (healthPercentage < 0.3) {
            color = 0xff0000; // Красный
        } else if (healthPercentage < 0.6) {
            color = 0xffff00; // Желтый
        }
        
        // Рисуем новую полоску здоровья
        this.bar.fillStyle(color, 1);
        this.bar.fillRect(
            sprite.x - this.barWidth/2,
            sprite.y - 30,
            this.barWidth * (health / maxHealth),
            this.barHeight
        );
    }

    public destroy(): void {
        this.bar.destroy();
        this.background.destroy();
    }
} 