import { Scene } from 'phaser';
import { UpgradeService } from '../services/UpgradeService';

export class UpgradeScene extends Scene {
    private upgradeService!: UpgradeService;

    constructor() {
        super({ key: 'UpgradeScene' });
    }

    create(): void {
        this.upgradeService = new UpgradeService(this);

        // Создание UI улучшений
        this.createUpgradeUI();
    }

    private createUpgradeUI(): void {
        const upgradeMenu = document.getElementById('upgrade-menu');
        if (!upgradeMenu) return;

        // Показываем меню улучшений
        upgradeMenu.style.display = 'block';

        // Настройка кнопок улучшений
        const damageButton = document.getElementById('upgrade-damage');
        const healthButton = document.getElementById('upgrade-health');
        const dashButton = document.getElementById('upgrade-dash');

        if (damageButton) {
            damageButton.onclick = () => {
                this.upgradeService.upgradeDamage();
                this.resumeGame();
            };
        }

        if (healthButton) {
            healthButton.onclick = () => {
                this.upgradeService.upgradeHealth();
                this.resumeGame();
            };
        }

        if (dashButton) {
            dashButton.onclick = () => {
                this.upgradeService.upgradeDash();
                this.resumeGame();
            };
        }
    }

    private resumeGame(): void {
        const upgradeMenu = document.getElementById('upgrade-menu');
        if (upgradeMenu) {
            upgradeMenu.style.display = 'none';
        }
        this.scene.resume('GameScene');
        this.scene.stop();
    }
} 