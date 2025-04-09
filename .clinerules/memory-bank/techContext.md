# 技術コンテキスト

## 開発環境

1. Node.js環境

   - Node.js 22.x
   - パッケージマネージャー: pnpm
   - Volta（Node.jsバージョン管理）: 22.13.0

2. フレームワーク

   - Next.js 15.2.4
   - App Router採用
   - Turbopackによる高速開発サーバー

3. 型システム
   - TypeScript 5.8.2
   - 厳格な型チェック
   - ESLintとPrettierによるコード品質管理

## 主要な依存関係

1. コア依存関係

   ```json
   {
     "d3": "7.9.0",
     "next": "15.2.4",
     "react": "19.1.0",
     "react-dom": "19.1.0",
     "zod": "3.24.2"
   }
   ```

2. 開発依存関係
   ```json
   {
     "@types/d3": "7.4.3",
     "@types/react": "19.0.12",
     "eslint": "9.23.0",
     "prettier": "3.5.3",
     "tailwindcss": "4.1.0",
     "typescript": "5.8.2"
   }
   ```

## 開発コマンド

1. 開発サーバー起動

   ```bash
   pnpm dev     # Turbopackを使用した開発サーバー
   ```

2. ビルドとデプロイ

   ```bash
   pnpm build   # プロダクションビルド
   pnpm start   # ビルド済みアプリケーションの起動
   ```

3. コード品質管理
   ```bash
   pnpm lint    # ESLintによるコード検証
   ```

## 技術的制約

1. ブラウザ互換性

   - モダンブラウザのサポート
   - SVG描画機能の必要性

2. パフォーマンス要件

   - クライアントサイドレンダリング
   - メモ化による最適化
   - 効率的なSVG更新

3. 開発規約
   - ESLintとPrettierの設定に従う
   - TypeScriptの厳格モード
   - コンポーネントの再利用性重視
