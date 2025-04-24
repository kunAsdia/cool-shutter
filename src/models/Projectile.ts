import { Scene } from 'phaser';

export class Projectile {
    private scene: Scene;
    private sprite: Phaser.Physics.Arcade.Sprite;
    private speed: number;
    private damage: number;
    private destroyed: boolean;

    constructor(
        scene: Scene,
        x: number,
        y: number,
        targetX: number,
        targetY: number,
        damage: number
    ) {
        this.scene = scene;
        this.sprite = scene.physics.add.sprite(x, y, 'projectile');
        this.speed = 300;
        this.damage = damage;
        this.destroyed = false;

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
        // Дополнительная логика обновления снаряда, если необходимо
    }
} 