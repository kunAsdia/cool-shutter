import { Entity } from './Entity';
import { Scene } from 'phaser';
import { Player } from './Player';
import { EnemyHealthBar } from '../components/EnemyHealthBar';
import { Projectile } from './Projectile';

export class RangedEnemy extends Entity {
    protected speed: number;
    protected health: number;
    protected damage: number;
    private player: Player;
    private isDead: boolean = false;
    private healthBar: EnemyHealthBar;
    private lastShotTime: number = 0;
    private shotCooldown: number = 2000; // 2 секунды между выстрелами
    private attackRange: number = 300; // Дистанция атаки
    private dropChance: number = 0.3; // 30% шанс выпадения аптечки

    constructor(scene: Scene, x: number, y: number, player: Player) {
        super(scene, x, y, 'rangedEnemy');
        this.speed = 80; // Медленнее обычного врага
        this.health = 80; // Меньше здоровья
        this.damage = 15; // Больше урона
        this.player = player;
        
        // Настройка физики
        scene.physics.world.enable(this.sprite);
        if (this.sprite.body) {
            this.sprite.setCollideWorldBounds(true);
        }

        // Создаем полоску здоровья
        this.healthBar = new EnemyHealthBar(scene, this);
        
        // Устанавливаем размер спрайта
        this.sprite.setDisplaySize(40, 40);
    }

    update(): void {
        if (this.isDead) return;

        const distanceToPlayer = Phaser.Math.Distance.Between(
            this.sprite.x,
            this.sprite.y,
            this.player.getSprite().x,
            this.player.getSprite().y
        );

        if (distanceToPlayer > this.attackRange) {
            // Движение к игроку
            const angle = Phaser.Math.Angle.Between(
                this.sprite.x,
                this.sprite.y,
                this.player.getSprite().x,
                this.player.getSprite().y
            );
            
            const velocity = this.scene.physics.velocityFromRotation(angle, this.speed);
            this.sprite.setVelocity(velocity.x, velocity.y);
        } else {
            // Остановка и стрельба
            this.sprite.setVelocity(0, 0);
            this.shoot();
        }

        // Обновляем полоску здоровья
        this.healthBar.update();
    }

    private shoot(): void {
        const now = this.scene.time.now;
        if (now - this.lastShotTime < this.shotCooldown) return;

        this.lastShotTime = now;

        // Создаем снаряд
        const angle = Phaser.Math.Angle.Between(
            this.sprite.x,
            this.sprite.y,
            this.player.getSprite().x,
            this.player.getSprite().y
        );

        new Projectile(
            this.scene,
            this.sprite.x,
            this.sprite.y,
            this.player.getSprite().x,
            this.player.getSprite().y,
            this.damage,
            'enemyProjectile' // Другой цвет снаряда
        );
    }

    takeDamage(amount: number): void {
        if (this.isDead) return;

        this.health -= amount;
        if (this.health <= 0) {
            this.die();
            // Начисляем 200 очков за убийство стреляющего врага
            const gameScene = this.scene as any;
            if (gameScene.addScore) {
                gameScene.addScore(200);
            }
        }
    }

    protected die(): void {
        if (this.isDead) return;

        this.isDead = true;
        
        // Отключаем физику
        if (this.sprite.body) {
            this.sprite.body.enable = false;
        }
        
        // Уничтожаем полоску здоровья
        this.healthBar.destroy();
        
        // Уничтожаем спрайт
        this.sprite.destroy();
    }

    public isEnemyDead(): boolean {
        return this.isDead;
    }

    getDamage(): number {
        return this.isDead ? 0 : this.damage;
    }
} 