import { Player } from '../models/Player';
import { Enemy } from '../models/Enemy';
import { RangedEnemy } from '../models/RangedEnemy';
import { Projectile } from '../models/Projectile';
import { Scene } from 'phaser';

export class CollisionService {
    private player: Player;
    private enemies: (Enemy | RangedEnemy)[];
    private projectiles: Projectile[];
    private scene: Scene;

    constructor(player: Player, enemies: (Enemy | RangedEnemy)[], projectiles: Projectile[]) {
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
               
                this.player.takeDamage(enemy.getDamage());
            }
        });
    }

    private checkProjectileEnemyCollisions(): void {
        this.projectiles.forEach(projectile => {
            if (projectile.isDestroyed()) {
               
                return;
            }

            const projectileSprite = projectile.getSprite();
            
            this.enemies.forEach(enemy => {
                if (enemy.isEnemyDead()) return;
                
                const enemySprite = enemy.getSprite();
                
                if (this.scene.physics.overlap(projectileSprite, enemySprite)) {
                   enemy.takeDamage(projectile.getDamage());
                    projectile.destroy();
                }
            });
        });
    }
    
}