export class Health {
    private maxHealth: number = 100;
    private currentHealth: number = 100;

    constructor() {
        this.currentHealth = this.maxHealth;
    }

    public getCurrentHealth(): number {
        return this.currentHealth;
    }

    public getMaxHealth(): number {
        return this.maxHealth;
    }

    public takeDamage(amount: number): void {
        this.currentHealth = Math.max(0, this.currentHealth - amount);
    }

    public heal(amount: number): void {
        this.currentHealth = Math.min(this.maxHealth, this.currentHealth + amount);
    }

    public isDead(): boolean {
        return this.currentHealth <= 0;
    }
} 