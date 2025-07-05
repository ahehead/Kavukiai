import { useState, useRef } from "react";
import type React from "react";
import type { Item } from "rete-context-menu-plugin/_types/types";

/**
 * viewSubmenu: 現在表示中のサブメニューのキー、もしくは false（非表示）を保持
 */
type ViewSubmenu = { key: string } | false;

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
  const [viewSubmenu, setViewSubmenu] = useState<ViewSubmenu>(false);
  const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null);

  // 現在マウスオーバー中の item.key を追跡
  const currentPointerKey = useRef<string | null>(null);

  // 開くタイマー、閉じるタイマー用の ref
  const subMenuOpenTimerRef = useRef<number | null>(null);
  const submenuCloseTimerRef = useRef<number | null>(null);

  /**
   * メニュー項目にマウスが乗ったときに呼び出す
   * 既存の開くタイマーはクリアし、新たに遅延を設定してサブメニューを表示
   */
  function handleEnterMenuItem(
    e: React.PointerEvent<HTMLDivElement>,
    item: Item
  ) {
    if (subMenuOpenTimerRef.current) {
      clearTimeout(subMenuOpenTimerRef.current);
    }
    currentPointerKey.current = item.key;
    setAnchorRect(e.currentTarget.getBoundingClientRect());

    subMenuOpenTimerRef.current = window.setTimeout(() => {
      // 項目から離れていなければ表示フラグをセット
      if (currentPointerKey.current === item.key) {
        setViewSubmenu({ key: item.key });
      }
    }, submenuOpenDelay);
  }

  /**
   * サブメニュー領域にマウスが入ったとき
   * サブメニューを継続して開いたままにするために key を更新
   */
  function handleEnterSubmenu(item: Item) {
    currentPointerKey.current = item.key;
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

    // ポインタキーをリセット
    currentPointerKey.current = null;

    // 遅延後にサブメニューを閉じる
    submenuCloseTimerRef.current = window.setTimeout(() => {
      if (!currentPointerKey.current) {
        setViewSubmenu(false);
      }
    }, closeSubmenuTime);
  }

  return {
    viewSubmenu, // 現在開いているサブメニューの情報
    anchorRect, // サブメニューを開く基準の位置
    handleEnterMenuItem, // メニュー項目に入ったときの処理
    handleEnterSubmenu, // サブメニュー領域に入ったときの処理
    handleLeaveMenuItem, // メニュー領域から離れたときの処理
  };
}
