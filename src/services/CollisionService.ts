import { Player } from '../models/Player';
import { Enemy } from '../models/Enemy';
import { Projectile } from '../models/Projectile';
import { Scene } from 'phaser';

export class CollisionService {
    private player: Player;
    private enemies: Enemy[];
    private projectiles: Projectile[];
    private scene: Scene;

    constructor(player: Player, enemies: Enemy[], projectiles: Projectile[]) {
        this.player = player;
        this.enemies = enemies;
        this.projectiles = projectiles;
        this.scene = player.getSprite().scene;
    }

    public update(): void {
        // Обновляем список снарядов
        this.projectiles = this.player.getProjectiles();
        
        this.checkPlayerEnemyCollisions();
        this.checkProjectileEnemyCollisions();
    }

    private checkPlayerEnemyCollisions(): void {
        const playerSprite = this.player.getSprite();
        
        this.enemies.forEach(enemy => {
            if (enemy.isEnemyDead()) return;
            
            const enemySprite = enemy.getSprite();
            if (this.scene.physics.overlap(playerSprite, enemySprite)) {
                console.log('Столкновение игрока с врагом');
                this.player.takeDamage(enemy.getDamage());
            }
        });
    }

    private checkProjectileEnemyCollisions(): void {
        this.projectiles.forEach(projectile => {
            if (projectile.isDestroyed()) {
                console.log('Пропускаем уничтоженный снаряд');
                return;
            }

            const projectileSprite = projectile.getSprite();
            console.log(`Проверка снаряда на позиции (${projectileSprite.x}, ${projectileSprite.y})`);
            
            this.enemies.forEach(enemy => {
                if (enemy.isEnemyDead()) return;
                
                const enemySprite = enemy.getSprite();
                console.log(`Проверка столкновения с врагом на позиции (${enemySprite.x}, ${enemySprite.y})`);
                
                if (this.scene.physics.overlap(projectileSprite, enemySprite)) {
                    console.log('Столкновение снаряда с врагом');
                    console.log(`Нанесение урона ${projectile.getDamage()} врагу`);
                    enemy.takeDamage(projectile.getDamage());
                    projectile.destroy();
                }
            });
        });
    }
} 