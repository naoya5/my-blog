## Learnings
- Content Collections の image() ヘルパーを使用する際は、スキーマ定義の引数から { image } を分割代入で受け取る必要がある。
- z.coerce.date() を使用することで、Markdown の文字列日付を自動的に JavaScript の Date オブジェクトに変換でき、型安全な日付操作が可能になる。
- 本番環境と開発環境でドラフト記事の表示を切り替えるには import.meta.env.PROD を活用するのが一般的。
