import { Scene } from 'phaser';
import { Player } from './Player';

export class HealthPack {
    private scene: Scene;
    private sprite: Phaser.Physics.Arcade.Sprite;
    private healAmount: number = 25;
    private player: Player;

    constructor(scene: Scene, x: number, y: number, player: Player) {
        this.scene = scene;
        this.player = player;
        
        // Создаем спрайт аптечки
        this.sprite = scene.physics.add.sprite(x, y, 'healthPack');
        this.sprite.setScale(0.5);
        
        // Настраиваем физику
        this.sprite.setCollideWorldBounds(true);
        this.sprite.setBounce(0.2);
        
        // Добавляем коллизию с игроком
        scene.physics.add.overlap(this.sprite, player.getSprite(), this.healPlayer, undefined, this);
    }

    private healPlayer(): void {
        this.player.heal(this.healAmount);
        this.destroy();
    }

    public destroy(): void {
        this.sprite.destroy();
    }
} 