---
title: "Daily Signal - 2026-03-19"
description: "NvidiaからManus AIまで盛り上がるOpenClaw周辺動向と、LLMによるOCRの進化についてお届けします。"
pubDate: "2026-03-19"
tags: ["daily", "openclaw", "agents", "ocr"]
category: "daily"
draft: false
---
## 今日のハイライト

1. [NvidiaやManus AIが参入する「OpenClaw」の勢い](https://goteleport.com/docs/agentic-identity-framework/)
2. [中国企業Z.aiがローカルで動く高性能OCRモデル「GLM-OCR」をオープンソース化](https://huggingface.co/zai-org/GLM-OCR)
3. [OpenAI Codexで「サブエージェント（Subagents）」機能がリリース](https://x.com/OpenAIDevs/status/2033636701848174967)

## ピックアップ

### 【全員がOpenClawを作っている】

AIエージェントの世界では今、「OpenClaw」構想が凄まじい勢いで広がっています。GoogleのVertex AI Memory Bankに対応したOpenClaw用プラグインがオープンソース化されたり、自律的なコーディング・デスクトップ操作エージェントであるManus AIが注目を集めたりと、エージェントの実装レベルが一気に底上げされています。エージェント間プロトコルの統一も進んでおり、今はまさにAIエージェントの「産業革命」前夜です。

### 【ローカルで動くSOTAのOCRモデル「GLM-OCR」】

中国企業Z.aiが、OmniDocBenchでトップスコアを叩き出した0.9B（9億パラメータ）のOCRモデル「GLM-OCR」をMITライセンスで公開しました。数式や表、レイアウトが崩れた実世界のドキュメントでも高精度に読み取れる性能を持ちながら、`ollama run glm-ocr` で手元のPC上で完結できる点が驚異的です。クラウドAPIに頼らずに機密文書のエージェント処理を組む際の最強の武器になりそうです。

## Quick Bites

- [**OpenAI CodexのSubagents**](https://x.com/OpenAIDevs/status/2033636701848174967): コーディングPRのレビューを「セキュリティ特化エージェント」「コード品質エージェント」といったサブエージェントに分散処理させ、集約したサマリーを返す機能がついに実装。
- [**Firecrawl CLIによるスクレイピング強化**](https://x.com/firecrawl/status/2031765008770813977): ターミナルから直接クラウドブラウザを立ち上げてスクレイピングするCLIが登場。Claude Codeなど様々なエージェントと連携可能です。

## Tools & Repos

- [**openclaw-vertexai-memorybank**](https://github.com/Shubhamsaboo/openclaw-vertexai-memorybank): 異なるエージェント間で永続的な記憶や設定を共有可能にするOpenClawプラグイン。
- [**OpenSandbox by Alibaba**](https://github.com/alibaba/OpenSandbox): コーディングエージェントやGUIエージェントを動かすための汎用的なサンドボックス環境（Docker/Kubernetes対応）。
- [**GET SHIT DONE**](https://github.com/gsd-build/get-shit-done): Claude CodeやCopilotでの「コンテキスト腐敗（トークンが長すぎてバカになる問題）」を解決するための開発システム。

## Hot Takes

> "The bottleneck has so quickly moved from code generation to code review that it is actually a bit jarring. None of the current systems / norms are setup for this world yet."（ボトルネックが「コード生成」から「コードレビュー」へとあまりに速く移行してしまい、正直少し戸惑っている。現在のどのシステムや規範も、まだこの世界に向けて準備できていない）— Logan Kilpatrick