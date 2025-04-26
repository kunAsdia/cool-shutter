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
        this.speed = 500;
        this.damage = damage;
        this.destroyed = false;

        // Направление движения снаряда
        const angle = Phaser.Math.Angle.Between(x, y, targetX, targetY);
        const velocity = this.scene.physics.velocityFromRotation(angle, this.speed);
        this.sprite.setVelocity(velocity.x, velocity.y);

        // Делаем снаряд вытянутым
        this.sprite.setDisplaySize(40, 8); // Увеличиваем размер: ширина 40, высота 8
        this.sprite.setRotation(angle); // Поворачиваем в направлении движения

        // Добавляем свечение
        this.sprite.setTint(0x00ff00); // Зеленый цвет для лазера
        this.sprite.setBlendMode(Phaser.BlendModes.ADD); // Режим наложения для эффекта свечения

        // Настройка физики снаряда
        this.sprite.setCollideWorldBounds(false); // Отключаем коллизию с границами мира
        this.sprite.setBounce(0);

        // Удаляем обработчик worldbounds, так как он больше не нужен
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
        // Проверяем выход за границы сцены
        const sceneWidth = this.scene.game.canvas.width;
        const sceneHeight = this.scene.game.canvas.height;
        const margin = 50; // Запас для уничтожения снаряда за пределами сцены

        if (this.sprite.x < -margin || 
            this.sprite.x > sceneWidth + margin || 
            this.sprite.y < -margin || 
            this.sprite.y > sceneHeight + margin) {
            this.destroy();
            return;
        }

    }
} 