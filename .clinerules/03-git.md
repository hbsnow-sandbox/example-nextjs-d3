# Git

## コミットメッセージ

コミットメッセージを生成する際は、Conventional Commit Messagesの仕様を使用してください。

コミットメッセージは以下の構造に従ってください：

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

コミットには、ライブラリの利用者に意図を伝えるために、以下の構造的要素が含まれます：

- fix: バグを修正するコミット（セマンティックバージョニングのPATCHに相当）
- feat: 新機能を導入するコミット（セマンティックバージョニングのMINORに相当）
- BREAKING CHANGE: footerにBREAKING CHANGE:を含むか、type/scopeの後に!を追加するコミットは、APIの破壊的変更を導入します（セマンティックバージョニングのMAJORに相当）。BREAKING CHANGEはどのタイプのコミットにも含めることができます。
- fix:とfeat:以外のタイプも許可されています。例えば@commitlint/config-conventional（Angularの規約に基づく）では、build:、chore:、ci:、docs:、perf:、refactor:、style:、test:などを推奨しています。

## GitHubへのプルリクエスト

プルリクエストを作成する際は、`.github/PULL_REQUEST_TEMPLATE.md`に提供されているテンプレートに従ってください。これにより一貫性が確保され、レビュアーがあなたの変更を効率的にレビューするために必要なすべての情報が提供されます。

PRのタイトルは、変更の目的を明確に説明し、レビュアーがすぐに理解できるようにする必要があります。

プルリクエストにスクリーンショットは必要ありません。テンプレートにあるこのセクションは無視してください。
