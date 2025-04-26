import { Scene } from 'phaser';
import { Player } from '../models/Player';

export class HealthUI {
    private scene: Scene;
    private player: Player;
    private healthText: Phaser.GameObjects.Text;
    private healthBar: Phaser.GameObjects.Graphics;
    private heartIcon: Phaser.GameObjects.Image;

    constructor(scene: Scene, player: Player) {
        this.scene = scene;
        this.player = player;
        
        // Создаем иконку сердца
        this.heartIcon = this.scene.add.image(20, 20, 'heart')
            .setScale(0.5)
            .setOrigin(0, 0);
            
        // Создаем текстовое отображение здоровья
        this.healthText = this.scene.add.text(50, 15, 'Здоровье: 100/100', {
            font: '16px Arial',
            color: '#ffffff'
        });
        
        // Создаем полоску здоровья
        this.healthBar = this.scene.add.graphics();
        this.updateHealthBar();
    }

    public update(): void {
        const currentHealth = this.player.getHealth();
        const maxHealth = this.player.getMaxHealth();
        
        // Обновляем текст
        this.healthText.setText(`Здоровье: ${currentHealth}/${maxHealth}`);
        
        // Обновляем полоску здоровья
        this.updateHealthBar();
    }

    private updateHealthBar(): void {
        const currentHealth = this.player.getHealth();
        const maxHealth = this.player.getMaxHealth();
        const healthPercentage = currentHealth / maxHealth;
        
        // Очищаем предыдущую отрисовку
        this.healthBar.clear();
        
        // Рисуем фон полоски здоровья
        this.healthBar.fillStyle(0x000000, 0.5);
        this.healthBar.fillRect(50, 40, 200, 20);
        
        // Определяем цвет полоски здоровья в зависимости от процента
        let color = 0x00ff00; // Зеленый
        if (healthPercentage < 0.5) color = 0xffff00; // Желтый
        if (healthPercentage < 0.25) color = 0xff0000; // Красный
        
        // Рисуем полоску здоровья
        this.healthBar.fillStyle(color);
        this.healthBar.fillRect(50, 40, 200 * healthPercentage, 20);
    }
} 