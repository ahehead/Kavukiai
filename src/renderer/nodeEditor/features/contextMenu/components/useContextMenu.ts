import { useState, useRef } from "react";
import type { Item } from "rete-context-menu-plugin/_types/types";

/**
 * viewSubmenu: 現在表示中のサブメニューのキー、階層に対応する配列
 */
type ViewSubmenu = string[];

/**
 * カスタムフック: コンテキストメニューのサブメニュー開閉ロジックを管理
 *
 * @param submenuOpenDelay   メニュー項目にホバーしてからサブメニューを開くまでの遅延（ms）
 * @param closeSubmenuTime   メニューからポインタが離れたあとサブメニューを閉じるまでの遅延（ms）
 * @returns 開閉制御用のステート＆ハンドラ群
 */
export function useContextMenu(
  submenuOpenDelay = 300,
  closeSubmenuTime = 1000
) {
  // どのサブメニューを開いているか保持
  const [viewSubmenu, setViewSubmenu] = useState<ViewSubmenu>([]);

  // 開くタイマー、閉じるタイマー用の ref
  const subMenuOpenTimerRef = useRef<number | null>(null);
  const submenuCloseTimerRef = useRef<number | null>(null);

  /**
   * メニュー項目にマウスが乗ったときに呼び出す
   */
  function handleEnterMenuItem(level: number, item: Item) {
    if (subMenuOpenTimerRef.current) clearTimeout(subMenuOpenTimerRef.current);
    if (submenuCloseTimerRef.current)
      clearTimeout(submenuCloseTimerRef.current);

    subMenuOpenTimerRef.current = window.setTimeout(() => {
      setViewSubmenu((prev) => {
        // prev の 0..level-1 はそのまま、level 以降を切り捨て
        const next = prev.slice(0, level);
        next[level] = item.key;
        return next;
      });
    }, submenuOpenDelay);
  }

  /**
   * サブメニュー領域にマウスが入ったとき
   */
  function handleEnterSubmenu() {
    if (submenuCloseTimerRef.current)
      clearTimeout(submenuCloseTimerRef.current);
  }

  /**
   * メニュー項目からマウスが離れたときに呼び出す
   * 既存の開くタイマーをクリアし、閉じるタイマーを設定して遅延でサブメニューを閉じる
   */
  function handleLeaveMenuItem() {
    // 開くタイマーをクリア
    if (subMenuOpenTimerRef.current) {
      clearTimeout(subMenuOpenTimerRef.current);
      subMenuOpenTimerRef.current = null;
    }
    // 既存の閉じるタイマーをクリア
    if (submenuCloseTimerRef.current) {
      clearTimeout(submenuCloseTimerRef.current);
    }

    submenuCloseTimerRef.current = window.setTimeout(() => {
      setViewSubmenu([]); // すべて閉じる
    }, closeSubmenuTime);
  }

  return {
    viewSubmenu, // 現在開いているサブメニューの情報
    handleEnterMenuItem, // メニュー項目に入ったときの処理
    handleEnterSubmenu, // サブメニュー領域に入ったときの処理
    handleLeaveMenuItem, // メニュー領域から離れたときの処理
  };
}
