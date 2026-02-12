---
title: "Astroブログのパフォーマンス予算"
description: "Lighthouse 95+ を維持するために、画像・JS・フォントの予算を先に決める。"
pubDate: "2026-01-12"
updatedDate: "2026-01-30"
tags: ["performance", "seo", "lighthouse"]
draft: false
---

## 予算を数値で決める

- LCP: 2.5s 以下
- CLS: 0.1 以下
- 初回JS: 90KB以下を目安

## 施策

1. 画像は `<Image />` を使用し、寸法を必ず指定する。
2. インタラクティブ要素を最小化し、`client:*` 指令を多用しない。
3. 検索は Pagefind で静的インデックス化する。

## 補足

[Astro Performanceガイド](https://docs.astro.build/en/guides/performance/)
