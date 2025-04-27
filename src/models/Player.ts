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
    private isInvincible: boolean = false;
    private invincibilityDuration: number = 1000; // 1 секунда неуязвимости
    private lastDamageTime: number = 0;

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

        // Поворот к курсору мыши
        const pointer = this.scene.input.activePointer;
        const angle = Phaser.Math.Angle.Between(
            this.sprite.x,
            this.sprite.y,
            pointer.worldX,
            pointer.worldY
        );
        
        // Конвертируем угол в градусы и устанавливаем поворот
        this.sprite.setRotation(angle + Math.PI / 2);
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
        this.scene.scene.stop('GameScene');
        this.scene.scene.start('GameOverScene');
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

    public takeDamage(amount: number): void {
        const now = this.scene.time.now;
        if (this.isInvincible || now - this.lastDamageTime < this.invincibilityDuration) {
            return;
        }

        this.health = Math.max(0, this.health - amount);
        this.lastDamageTime = now;
        this.isInvincible = true;

        // Включаем визуальный эффект неуязвимости (мигание)
        this.sprite.setTint(0xff0000);
        
        // Отключаем неуязвимость через заданное время
        this.scene.time.delayedCall(this.invincibilityDuration, () => {
            this.isInvincible = false;
            this.sprite.clearTint();
        });

        if (this.health <= 0) {
            this.die();
        }
    }
} 