import Phaser from 'phaser';

export type Direction = 'left' | 'right' | 'up' | 'down';

export class MobileControls {
    readonly directions = { left: false, right: false, up: false, down: false };
    private readonly zones: Phaser.Geom.Circle[] = [];
    private readonly objects: Phaser.GameObjects.GameObject[] = [];
    private readonly actions: Array<Direction | 'jump'> = [];
    private readonly pointerActions = new Map<number, Direction | 'jump'>();
    private readonly activeDirections: Record<Direction, Set<number>> = {
        left: new Set(), right: new Set(), up: new Set(), down: new Set()
    };
    private readonly scene: Phaser.Scene;
    private readonly onJump?: () => void;
    private readonly handlePointerDown: (pointer: Phaser.Input.Pointer) => void;
    private readonly handlePointerUp: (pointer: Phaser.Input.Pointer) => void;

    constructor(scene: Phaser.Scene, mode: 'stage1' | 'stage2', onJump?: () => void) {
        this.scene = scene;
        this.onJump = onJump;
        this.handlePointerDown = pointer => this.press(pointer);
        this.handlePointerUp = pointer => this.release(pointer);
        const size = 72, gap = 78, baseX = 120, baseY = scene.scale.height - 104;
        if (mode === 'stage1') {
            this.addButton(scene, baseX - gap / 2, baseY, '◀', 'left', size);
            this.addButton(scene, baseX + gap / 2, baseY, '▶', 'right', size);
            this.addJumpButton(scene, scene.scale.width - 100, baseY, size + 8);
        } else {
            this.addButton(scene, baseX, baseY - gap / 2, '▲', 'up', size);
            this.addButton(scene, baseX, baseY + gap / 2, '▼', 'down', size);
            this.addButton(scene, baseX - gap, baseY + gap / 2, '◀', 'left', size);
            this.addButton(scene, baseX + gap, baseY + gap / 2, '▶', 'right', size);
        }
        // GameObject固有のイベントではなくInput全体で指を追跡し、マルチタッチでも確実に状態を更新する。
        scene.input.on('pointerdown', this.handlePointerDown);
        scene.input.on('pointerup', this.handlePointerUp);
        scene.input.on('pointerupoutside', this.handlePointerUp);
    }

    contains(x: number, y: number): boolean { return this.zones.some(zone => zone.contains(x, y)); }
    destroy(): void {
        this.scene.input.off('pointerdown', this.handlePointerDown);
        this.scene.input.off('pointerup', this.handlePointerUp);
        this.scene.input.off('pointerupoutside', this.handlePointerUp);
        this.objects.forEach(object => object.destroy());
        for (const key of Object.keys(this.directions) as Direction[]) this.directions[key] = false;
        this.pointerActions.clear();
    }
    private addButton(scene: Phaser.Scene, x: number, y: number, label: string, direction: Direction, size: number): void {
        const circle = scene.add.circle(x, y, size / 2, 0x000000, 0.45).setStrokeStyle(3, 0xffffff, 0.8)
            .setDepth(1000).setInteractive({ useHandCursor: false });
        const text = scene.add.text(x, y, label, { fontFamily: 'sans-serif', fontSize: 30, color: '#ffffff' }).setOrigin(0.5).setDepth(1001);
        this.zones.push(new Phaser.Geom.Circle(x, y, size / 2 + 12));
        this.actions.push(direction);
        this.objects.push(circle, text);
    }
    private addJumpButton(scene: Phaser.Scene, x: number, y: number, size: number): void {
        const circle = scene.add.circle(x, y, size / 2, 0x007f8b, 0.7).setStrokeStyle(3, 0xffffff, 0.9)
            .setDepth(1000).setInteractive({ useHandCursor: false });
        const text = scene.add.text(x, y, 'JUMP', { fontFamily: 'mihiPixelmoji', fontSize: 17, color: '#ffffff' }).setOrigin(0.5).setDepth(1001);
        this.zones.push(new Phaser.Geom.Circle(x, y, size / 2 + 12));
        this.actions.push('jump');
        this.objects.push(circle, text);
    }

    private press(pointer: Phaser.Input.Pointer): void {
        const index = this.zones.findIndex(zone => zone.contains(pointer.x, pointer.y));
        if (index < 0) return;
        const action = this.actions[index];
        this.pointerActions.set(pointer.id, action);
        (this.objects[index * 2] as Phaser.GameObjects.Shape).setAlpha(0.65);
        if (action === 'jump') {
            this.onJump?.();
        } else {
            this.activeDirections[action].add(pointer.id);
            this.directions[action] = true;
        }
    }

    private release(pointer: Phaser.Input.Pointer): void {
        const action = this.pointerActions.get(pointer.id);
        if (!action) return;
        const index = this.actions.indexOf(action);
        if (index >= 0) (this.objects[index * 2] as Phaser.GameObjects.Shape).setAlpha(1);
        if (action !== 'jump') {
            this.activeDirections[action].delete(pointer.id);
            this.directions[action] = this.activeDirections[action].size > 0;
        }
        this.pointerActions.delete(pointer.id);
    }
}
