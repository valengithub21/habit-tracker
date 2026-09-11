import { AppleColor } from '../types';

export interface AppleColorDef {
  name: string;
  light: string;
  dark: string;
  bgLight: string;
  bgDark: string;
  borderLight: string;
  borderDark: string;
  textLight: string;
  textDark: string;
}

export const APPLE_COLORS: Record<AppleColor, AppleColorDef> = {
  blue: {
    name: 'Azul',
    light: '#007AFF',
    dark: '#0A84FF',
    bgLight: 'rgba(0, 122, 255, 0.12)',
    bgDark: 'rgba(10, 132, 255, 0.20)',
    borderLight: 'rgba(0, 122, 255, 0.3)',
    borderDark: 'rgba(10, 132, 255, 0.4)',
    textLight: '#0062CC',
    textDark: '#64D2FF',
  },
  green: {
    name: 'Verde',
    light: '#34C759',
    dark: '#30D158',
    bgLight: 'rgba(52, 199, 89, 0.12)',
    bgDark: 'rgba(48, 209, 88, 0.20)',
    borderLight: 'rgba(52, 199, 89, 0.3)',
    borderDark: 'rgba(48, 209, 88, 0.4)',
    textLight: '#248A3D',
    textDark: '#30D158',
  },
  orange: {
    name: 'Naranja',
    light: '#FF9500',
    dark: '#FF9F0A',
    bgLight: 'rgba(255, 149, 0, 0.12)',
    bgDark: 'rgba(255, 159, 10, 0.20)',
    borderLight: 'rgba(255, 149, 0, 0.3)',
    borderDark: 'rgba(255, 159, 10, 0.4)',
    textLight: '#C97700',
    textDark: '#FFB340',
  },
  pink: {
    name: 'Rosa',
    light: '#FF2D55',
    dark: '#FF375F',
    bgLight: 'rgba(255, 45, 85, 0.12)',
    bgDark: 'rgba(255, 55, 95, 0.20)',
    borderLight: 'rgba(255, 45, 85, 0.3)',
    borderDark: 'rgba(255, 55, 95, 0.4)',
    textLight: '#D61B42',
    textDark: '#FF6482',
  },
  purple: {
    name: 'Púrpura',
    light: '#AF52DE',
    dark: '#BF5AF2',
    bgLight: 'rgba(175, 82, 222, 0.12)',
    bgDark: 'rgba(191, 90, 242, 0.20)',
    borderLight: 'rgba(175, 82, 222, 0.3)',
    borderDark: 'rgba(191, 90, 242, 0.4)',
    textLight: '#893AB3',
    textDark: '#DA8FFF',
  },
  indigo: {
    name: 'Índigo',
    light: '#5856D6',
    dark: '#5E5CE6',
    bgLight: 'rgba(88, 86, 214, 0.12)',
    bgDark: 'rgba(94, 92, 230, 0.20)',
    borderLight: 'rgba(88, 86, 214, 0.3)',
    borderDark: 'rgba(94, 92, 230, 0.4)',
    textLight: '#4745AF',
    textDark: '#7D7AFF',
  },
  teal: {
    name: 'Turquesa',
    light: '#30B0C7',
    dark: '#40C8E0',
    bgLight: 'rgba(48, 176, 199, 0.12)',
    bgDark: 'rgba(64, 200, 224, 0.20)',
    borderLight: 'rgba(48, 176, 199, 0.3)',
    borderDark: 'rgba(64, 200, 224, 0.4)',
    textLight: '#1C7E91',
    textDark: '#70DBEC',
  },
  yellow: {
    name: 'Amarillo',
    light: '#FFCC00',
    dark: '#FFD60A',
    bgLight: 'rgba(255, 204, 0, 0.15)',
    bgDark: 'rgba(255, 214, 10, 0.22)',
    borderLight: 'rgba(255, 204, 0, 0.35)',
    borderDark: 'rgba(255, 214, 10, 0.45)',
    textLight: '#A38200',
    textDark: '#FFE666',
  },
  red: {
    name: 'Rojo',
    light: '#FF3B30',
    dark: '#FF453A',
    bgLight: 'rgba(255, 59, 48, 0.12)',
    bgDark: 'rgba(255, 69, 58, 0.20)',
    borderLight: 'rgba(255, 59, 48, 0.3)',
    borderDark: 'rgba(255, 69, 58, 0.4)',
    textLight: '#D7261C',
    textDark: '#FF6961',
  },
};
