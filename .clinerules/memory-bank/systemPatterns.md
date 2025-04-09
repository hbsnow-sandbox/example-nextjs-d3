# システムパターン

## アーキテクチャ概要

1. アプリケーション構造

   - Next.js App Routerを採用
   - クライアントサイドコンポーネントとして実装
   - コンポーネントベースのモジュラー設計

2. ディレクトリ構造
   ```
   src/
   ├── app/
   │   ├── layout.tsx     # アプリケーションレイアウト
   │   └── page.tsx       # メインページ（グラフ表示）
   └── components/
       └── graph/         # グラフコンポーネント群
           └── line/      # 折れ線グラフコンポーネント
               └── index.tsx
   ```

## 設計パターン

1. コンポーネント設計

   - Propsによる設定の注入
   - 型安全性の確保（TypeScript）
   - メモ化による最適化（useMemo）

2. グラフ描画パターン

   - SVG要素を使用した直接描画
   - D3.jsはデータ変換とスケール計算のみに使用
   - マージン設定による描画領域の制御

3. データフロー
   ```mermaid
   flowchart TD
     A[親コンポーネント] -->|データ・設定| B[グラフコンポーネント]
     B -->|スケール計算| C[D3.js]
     C -->|変換済みデータ| D[SVG要素]
   ```

## 実装パターン

1. データ変換

   - D3.jsのスケール関数を使用
   - useMemoによる計算結果のキャッシュ
   - 軸やデータポイントの座標計算

2. レンダリング最適化

   - 計算集約的な処理のメモ化
   - SVG要素の効率的な更新
   - 必要最小限のステート管理

3. 型定義
   ```typescript
   interface GraphProps {
     width: number;
     height: number;
     margin?: {
       top: number;
       right: number;
       bottom: number;
       left: number;
     };
     data: {
       name: string | number;
       value: number;
     }[];
   }
   ```
