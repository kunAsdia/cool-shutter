import { Player } from '../models/Player';
import { Enemy } from '../models/Enemy';
import { Projectile } from '../models/Projectile';

export class CollisionService {
    private player: Player;
    private enemies: Enemy[];
    private projectiles: Projectile[];

    constructor(player: Player, enemies: Enemy[], projectiles: Projectile[]) {
        this.player = player;
        this.enemies = enemies;
        this.projectiles = projectiles;
    }

    public update(): void {
        this.checkPlayerEnemyCollisions();
        this.checkProjectileEnemyCollisions();
    }

    private checkPlayerEnemyCollisions(): void {
        const playerSprite = this.player.getSprite();
        
        this.enemies.forEach(enemy => {
            const enemySprite = enemy.getSprite();
            if (this.checkCollision(playerSprite, enemySprite)) {
                this.player.takeDamage(enemy.getDamage());
            }
        });
    }

    private checkProjectileEnemyCollisions(): void {
        this.projectiles.forEach(projectile => {
            if (projectile.isDestroyed()) return;

            const projectileSprite = projectile.getSprite();
            
            this.enemies.forEach(enemy => {
                const enemySprite = enemy.getSprite();
                if (this.checkCollision(projectileSprite, enemySprite)) {
                    enemy.takeDamage(projectile.getDamage());
                    projectile.destroy();
                }
            });
        });
    }

    private checkCollision(
        sprite1: Phaser.Physics.Arcade.Sprite,
        sprite2: Phaser.Physics.Arcade.Sprite
    ): boolean {
        return Phaser.Geom.Intersects.RectangleToRectangle(
            sprite1.getBounds(),
            sprite2.getBounds()
        );
    }
} 