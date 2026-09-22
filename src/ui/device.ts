export const GAME_WIDTH = 1280;
export const GAME_HEIGHT = 720;

export function isMobileDevice(): boolean {
    return window.matchMedia('(pointer: coarse)').matches
        || /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
}

export function setupOrientationGuard(): () => void {
    const guard = document.querySelector<HTMLElement>('#orientation-guard');
    if (!guard) return () => undefined;
    const update = () => {
        const show = isMobileDevice() && window.innerHeight > window.innerWidth;
        guard.classList.toggle('is-visible', show);
        guard.setAttribute('aria-hidden', String(!show));
    };
    update();
    window.addEventListener('resize', update);
    window.addEventListener('orientationchange', update);
    return () => {
        window.removeEventListener('resize', update);
        window.removeEventListener('orientationchange', update);
    };
}
