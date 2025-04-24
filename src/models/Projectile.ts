import { Scene } from 'phaser';
import { Player } from './Player';

export class Projectile {
    private scene: Scene;
    private sprite: Phaser.Physics.Arcade.Sprite;
    private speed: number;
    private damage: number;
    private destroyed: boolean;
    private player: Player;
    private maxDistance: number = 500; // Максимальное расстояние от игрока

    constructor(
        scene: Scene,
        x: number,
        y: number,
        targetX: number,
        targetY: number,
        damage: number,
        player: Player
    ) {
        this.scene = scene;
        this.sprite = scene.physics.add.sprite(x, y, 'projectile');
        this.speed = 300;
        this.damage = damage;
        this.destroyed = false;
        this.player = player;

        // Направление движения снаряда
        const angle = Phaser.Math.Angle.Between(x, y, targetX, targetY);
        const velocity = this.scene.physics.velocityFromRotation(angle, this.speed);
        this.sprite.setVelocity(velocity.x, velocity.y);

        // Уничтожение снаряда при выходе за пределы экрана
        this.sprite.setCollideWorldBounds(true);
        this.sprite.setBounce(0);
        
        // Правильная настройка границ мира
        if (this.sprite.body) {
            this.sprite.body.world.on('worldbounds', (body: Phaser.Physics.Arcade.Body) => {
                if (body.gameObject === this.sprite) {
                    this.destroy();
                }
            });
        }
    }

    public getSprite(): Phaser.Physics.Arcade.Sprite {
        return this.sprite;
    }

    public getDamage(): number {
        return this.damage;
    }

    public destroy(): void {
        if (!this.destroyed) {
            this.sprite.destroy();
            this.destroyed = true;
        }
    }

    public isDestroyed(): boolean {
        return this.destroyed;
    }

    public update(): void {
        // Проверяем расстояние от игрока
        const distance = Phaser.Math.Distance.Between(
            this.sprite.x,
            this.sprite.y,
            this.player.getSprite().x,
            this.player.getSprite().y
        );

        if (distance > this.maxDistance) {
            this.destroy();
        }
    }
} 