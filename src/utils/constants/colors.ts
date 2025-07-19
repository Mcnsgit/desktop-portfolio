// src/utils/constants/colors.ts
const colors = {
    primary: '#050816',
    secondary: '#151030',
    textPrimary: '#ffffff',
    textSecondary: '#aaa6c3',
    accent: '#0078d7',
    background: '#ffffff',
    foreground: '#171717', 
} as const;

export type ColorName = keyof typeof colors;
export type ThemeColor = typeof colors[ColorName];

const win98Colors = {
    win98Bg: '#c0c0c0',
    win98BorderLight: '#dfdfdf',
    win98BorderDark: '#808080',
    win98BorderActiveLight: '#efefef',
    win98BorderActiveDark: '#505050',
    win98ContentBg: '#c0c0c0',
    win98TitleActiveBg: '#000080',
    win98TitleInactiveBg: '#808080',
    win98TitleTextColor: '#ffffff',
    win98ButtonFace: '#c0c0c0',
    win98ButtonHighlight: '#ffffff',
    win98TextDark: '#000000',
    win98TextLight: '#ffffff',
    win98ShadowColor: 'rgba(0, 0, 0, 0.3)',

} as const;

export type Win98ColorName = keyof typeof win98Colors;
export type Win98Color = typeof win98Colors[Win98ColorName];


const colorConstants = {
    colors,
    win98Colors,
};

export default colorConstants;