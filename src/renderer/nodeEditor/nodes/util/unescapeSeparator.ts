/**
 * 文字列に書かれたエスケープ表現を実体に変換するユーティリティ
 *
 * - \r\n → CRLF
 * - \n   → LF
 * - \r   → CR
 * - \t   → タブ
 * - \s   → 半角スペース（任意仕様）
 * - \\   → \   （最後にまとめて 1 個へ圧縮）
 *
 * 追加で展開したいシーケンスがあれば `.replace()` を増やしてください。
 */
export function unescapeSeparator(raw: string): string {
  return (
    raw
      // ①「長いもの」を先に処理
      .replace(/\\r\\n/g, "\r\n") // CRLF
      // ② 1 文字エスケープ
      .replace(/\\n/g, "\n")
      .replace(/\\r/g, "\r")
      .replace(/\\t/g, "\t")
      .replace(/\\s/g, " ")
      // ③ バックスラッシュ重複を 1 個に圧縮
      .replace(/\\\\/g, "\\")
  );
}
