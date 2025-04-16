# 技術コンテキスト: Next.js + D3.js SVGグラフ表示

## 使用技術スタック

### コア技術

| 技術         | バージョン | 用途                                   |
| ------------ | ---------- | -------------------------------------- |
| Next.js      | 15.2.4     | Webアプリケーションフレームワーク      |
| React        | 19.1.0     | UIライブラリ                           |
| TypeScript   | 5.8.2      | 型付き言語サポート                     |
| D3.js        | 7.9.0      | データビジュアライゼーションライブラリ |
| Tailwind CSS | 4.1.0      | ユーティリティファーストCSS            |
| Zod          | 3.24.2     | スキーマバリデーション                 |

### 開発ツール

| ツール    | バージョン    | 用途                     |
| --------- | ------------- | ------------------------ |
| ESLint    | 9.23.0        | コード品質チェック       |
| Prettier  | 3.5.3         | コードフォーマッティング |
| Turbopack | (Next.js内蔵) | 高速開発環境             |

## 開発環境セットアップ

このプロジェクトはpnpmを使用しています。以下のコマンドで開発環境を起動できます：

```bash
# 依存関係のインストール
pnpm install

# 開発サーバーの起動（Turbopack使用）
pnpm dev

# ビルド
pnpm build

# 本番サーバーの起動
pnpm start

# リンター実行
pnpm lint
```

## 技術的制約と背景

### 1. D3.jsとReactの統合パターン

D3.jsとReactの統合には複数のアプローチが存在します：

- **D3.jsにDOM操作を任せる方法**：

  - ReactのrefをD3.jsに渡し、D3に完全にDOMコントロールを委任
  - Reactの仮想DOMと競合する可能性あり
  - このプロジェクトでは**採用していない**

- **Reactと計算のみのD3.js**（現在の採用アプローチ）：
  - D3.jsから計算機能のみを使用（スケール、レイアウト等）
  - SVGの実際のレンダリングはReactコンポーネントで行う
  - Reactのライフサイクルとの親和性が高い
  - このプロジェクトで**採用しているアプローチ**

### 2. クライアントコンポーネントの使用

Next.js App Routerではサーバーコンポーネントがデフォルトですが、グラフコンポーネントは以下の理由からクライアントコンポーネントとして実装しています：

- インタラクティブな要素（ホバー、ツールチップ）の実装
- D3.jsの計算をブラウザで実行する必要性
- クライアントサイドでのイベントハンドリング

各グラフコンポーネントは`"use client"`ディレクティブを使用してクライアントコンポーネントとしてマークされています。

### 3. TypeScriptの活用

TypeScriptは以下の目的で活用されています：

- **型安全なプロップスAPI**：

  - 各グラフコンポーネントのプロップスに適切な型定義
  - オプショナルプロップスとデフォルト値の明示的な型付け
  - ユーザー入力データの構造を強制

- **D3.jsとの統合**：

  - D3.js関数の戻り値に適切な型アノテーション
  - 計算結果の型安全な取り扱い

- **共通型の活用**：
  - 複数のコンポーネント間で共有される型定義

### 4. SVGベースのアプローチ

グラフの実装には以下の理由からCanvasではなくSVGを採用しています：

- **アクセシビリティ**：SVGはDOMの一部としてアクセシブル
- **スタイリングの容易さ**：CSS/TailwindCSSを用いた簡単なスタイリング
- **インタラクティブ性**：各要素への個別イベントハンドリング
- **解像度非依存**：任意の表示サイズでの鮮明な表示

## 依存関係の考慮点

- **D3.js**：最小限の依存を目指し、一部のD3モジュールのみを使用するアプローチも検討可能
- **Tailwind CSS**：汎用的なユーティリティを利用し、カスタムCSSを最小限に
- **React 19**：最新のReact機能（useMemo、useState最適化など）を活用

## ツール使用パターン

### useMemoの活用

D3.jsの計算処理は`useMemo`フックでラップし、必要な場合のみ再計算するパターンを採用：

```typescript
// 例：X軸スケールの計算
const xScale = useMemo(() => {
  return d3
    .scaleLinear()
    .domain([0, xData.length - 1])
    .range([plotPosition.origin.x, plotPosition.x.x])
    .nice();
}, [plotPosition.origin.x, plotPosition.x.x, xData.length]);
```

### TypeScriptの型安全性確保

```typescript
// 例：satisfies演算子による型検証
const plotPosition = useMemo(() => {
  return {
    origin: { x: margin.left, y: height - margin.bottom },
    // 他のプロパティ
  } as const satisfies Record<string, { x: number; y: number }>;
}, [width, height, margin]);
```

### SVG要素の宣言的生成

データ配列からSVG要素を生成する際のパターン：

```typescript
{datasets.map((dataset, datasetIndex) => (
  <g key={datasetIndex}>
    {dataset.lineSegments.map((segment, i) => (
      <line
        key={`line-${i}`}
        x1={segment.x1}
        y1={segment.y1}
        x2={segment.x2}
        y2={segment.y2}
        stroke={dataset.color}
        strokeWidth="1"
      />
    ))}
    {/* 他のSVG要素 */}
  </g>
))}
```
