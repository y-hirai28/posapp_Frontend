import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      // モバイル最適化用のスペーシング
      spacing: {
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-left': 'env(safe-area-inset-left)',
        'safe-right': 'env(safe-area-inset-right)',
      },
      // タップターゲットの最小サイズ
      minHeight: {
        'tap': '44px',
      },
      minWidth: {
        'tap': '44px',
      },
    },
    // モバイルファーストのブレークポイント
    screens: {
      'xs': '375px',   // 小型スマートフォン
      'sm': '640px',   // 大型スマートフォン
      'md': '768px',   // タブレット
      'lg': '1024px',  // デスクトップ
      'xl': '1280px',  // 大型デスクトップ
      '2xl': '1536px',
    },
  },
  plugins: [],
}
export default config