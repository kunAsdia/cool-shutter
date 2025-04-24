import { Entity } from './Entity';
import { Scene } from 'phaser';
import { Projectile } from './Projectile';

export class Player extends Entity {
    private dashCooldown: number = 3000; // 3 секунды перезарядки
    private dashDuration: number = 200; // 0.2 секунды длительность рывка
    private dashSpeed: number = 800; // Скорость рывка
    private lastDashTime: number = 0;
    private isDashing: boolean = false;
    private projectiles: Projectile[] = [];
    protected maxHealth: number = 100;

    constructor(scene: Scene, x: number, y: number) {
        super(scene, x, y, 'player');
        this.speed = 200;
        this.health = 100;
        this.damage = 10;

        // Настройка физики игрока
        this.sprite.setCollideWorldBounds(true);
        this.sprite.setBounce(0.2);
        this.sprite.setDrag(100);
    }

    public dash(targetX: number, targetY: number, cursors: {
        W: Phaser.Input.Keyboard.Key;
        A: Phaser.Input.Keyboard.Key;
        S: Phaser.Input.Keyboard.Key;
        D: Phaser.Input.Keyboard.Key;
    }): void {
        const now = this.scene.time.now;
        if (now - this.lastDashTime < this.dashCooldown || this.isDashing) return;

        this.isDashing = true;
        this.lastDashTime = now;

        let angle: number;
        
        // Проверяем, нажаты ли клавиши движения
        const isMoving = cursors.W.isDown || cursors.A.isDown || cursors.S.isDown || cursors.D.isDown;
        
        if (isMoving) {
            // Вычисляем угол на основе нажатых клавиш
            const velocity = new Phaser.Math.Vector2();
            
            if (cursors.A.isDown) velocity.x = -1;
            else if (cursors.D.isDown) velocity.x = 1;
            
            if (cursors.W.isDown) velocity.y = -1;
            else if (cursors.S.isDown) velocity.y = 1;
            
            velocity.normalize();
            angle = Phaser.Math.Angle.Between(0, 0, velocity.x, velocity.y);
        } else {
            // Если не двигаемся, используем направление к курсору
            angle = Phaser.Math.Angle.Between(this.sprite.x, this.sprite.y, targetX, targetY);
        }

        const velocity = this.scene.physics.velocityFromRotation(angle, this.dashSpeed);
        this.sprite.setVelocity(velocity.x, velocity.y);

        // Возвращаем нормальную скорость после рывка
        this.scene.time.delayedCall(this.dashDuration, () => {
            this.isDashing = false;
            this.sprite.setVelocity(0, 0);
        });
    }

    public move(cursors: {
        W: Phaser.Input.Keyboard.Key;
        A: Phaser.Input.Keyboard.Key;
        S: Phaser.Input.Keyboard.Key;
        D: Phaser.Input.Keyboard.Key;
    }): void {
        if (this.isDashing) return;

        const velocity = new Phaser.Math.Vector2();

        if (cursors.A.isDown) {
            velocity.x = -1;
        } else if (cursors.D.isDown) {
            velocity.x = 1;
        }

        if (cursors.W.isDown) {
            velocity.y = -1;
        } else if (cursors.S.isDown) {
            velocity.y = 1;
        }

        velocity.normalize();
        velocity.scale(this.speed);

        this.sprite.setVelocity(velocity.x, velocity.y);
    }

    public shoot(targetX: number, targetY: number): void {
        const projectile = new Projectile(
            this.scene,
            this.sprite.x,
            this.sprite.y,
            targetX,
            targetY,
            this.damage
        );
        this.projectiles.push(projectile);
    }

    protected die(): void {
        // Логика смерти игрока
        this.scene.scene.start('GameOver');
    }

    public update(): void {
        super.update();
        // Обновление снарядов
        this.projectiles = this.projectiles.filter(projectile => {
            projectile.update();
            return !projectile.isDestroyed();
        });
    }

    public getProjectiles(): Projectile[] {
        return this.projectiles;
    }

    public getDamage(): number {
        return this.damage;
    }

    public setDamage(value: number): void {
        this.damage = value;
    }

    public getMaxHealth(): number {
        return this.maxHealth;
    }

    public setMaxHealth(value: number): void {
        this.maxHealth = value;
    }

    public getDashDuration(): number {
        return this.dashDuration;
    }

    public setDashDuration(value: number): void {
        this.dashDuration = value;
    }
} 