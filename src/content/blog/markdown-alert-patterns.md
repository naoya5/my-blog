---
title: "Markdownアラートの使い分け"
description: "NOTE/TIP/WARNINGの使い分けルールを決めて、読み手の判断コストを下げる。"
pubDate: "2026-01-19"
tags: ["markdown", "remark", "writing"]
draft: false
---

## ルールを決める理由

アラートは多用すると逆効果です。用途を固定すると、情報の優先度が伝わりやすくなります。

> [!NOTE]
> 仕様や前提条件など、文脈を補足する内容に使う。

> [!TIP]
> 実装の近道や運用上の小さな改善に使う。

> [!WARNING]
> 破壊的変更や復旧コストが高い操作に使う。

## CSS調整

`remark-github-blockquote-alert` のデフォルトCSSを import し、ダークモードだけ追加調整するのがシンプルです。
