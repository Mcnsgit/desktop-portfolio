export default function useInitialWindowSize({ margin }: { margin?: number }) {
    let m = margin || 0;
    const wW = window.innerWidth;
    const wH = window.innerHeight;

    let initialW = wW - m;
    let initialH = wH - m;

    return { initialW, initialH };
}
