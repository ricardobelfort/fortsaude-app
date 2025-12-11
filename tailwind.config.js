/** @type {import('tailwindcss').Config} */
import daisyui from 'daisyui';

export default {
  content: ['./src/**/*.{html,ts}'],
  theme: {
    extend: {},
  },
  plugins: [daisyui],
  daisyui: {
    themes: [
      {
        light: {
          'primary': '#4f46e5',
          'primary-content': '#ffffff',
          'secondary': '#06b6d4',
          'secondary-content': '#ffffff',
          'accent': '#ec4899',
          'accent-content': '#ffffff',
          'neutral': '#1f2937',
          'neutral-content': '#f9fafb',
          'base-100': '#ffffff',
          'base-200': '#f3f4f6',
          'base-300': '#e5e7eb',
          'base-content': '#1f2937',
          'info': '#3b82f6',
          'info-content': '#ffffff',
          'success': '#10b981',
          'success-content': '#ffffff',
          'warning': '#f59e0b',
          'warning-content': '#ffffff',
          'error': '#ef4444',
          'error-content': '#ffffff',
        },
      },
      'dark',
    ],
  },
};
