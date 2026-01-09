# ルービックキューブ Web アプリ

React Three FiberとThree.jsを使った、スマホで遊べるルービックキューブWebアプリです。

## 特徴

- **2×2と3×3の両サイズ対応**: ボタンでサイズを切り替え可能
- **スワイプ操作**: 画面をスワイプしてキューブを直感的に回転
- **3D表示**: React Three Fiberによる美しい3Dレンダリング
- **スマホ対応**: レスポンシブデザインでスマホでも快適にプレイ

## 機能

- リセット: キューブを初期状態に戻す
- シャッフル: キューブをランダムに混ぜる
- サイズ切替: 2×2と3×3を切り替え
- OrbitControls: マウスやタッチでカメラを回転・ズーム

## 使い方

1. 画面を上下左右にスワイプしてキューブを回転
2. ボタンでサイズを切り替えたり、リセット・シャッフル
3. ピンチやマウスホイールでズーム

## 開発

### セットアップ

```bash
npm install
```

### 開発サーバー起動

```bash
npm run dev
```

### ビルド

```bash
NODE_OPTIONS="--max-old-space-size=4096" npm run build
```

※ Three.jsは大きなライブラリのため、メモリを増やしてビルドする必要があります。

## デプロイ (Vercel)

### Web UIでデプロイ

1. [Vercel](https://vercel.com)にアクセス
2. GitHubアカウントでログイン
3. 「New Project」をクリック
4. `m0a/rubiks-cube` リポジトリを選択
5. 「Deploy」をクリック

Vercelが自動的に `vercel.json` の設定を読み込んでビルドします。

## 技術スタック

- React 19
- TypeScript
- Vite
- Three.js
- React Three Fiber
- @react-three/drei

## ライセンス

MIT
