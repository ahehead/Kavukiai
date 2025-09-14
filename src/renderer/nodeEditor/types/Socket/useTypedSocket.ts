import { useSyncExternalStore } from "react";
import type { TypedSocket } from "./TypedSocket";

/**
 * 指定した TypedSocket の接続状態 (isConnected) を購読して boolean を返すフック。
 * ソケットが未定義の場合は常に false。
 */
export function useSocketConnection(socket: TypedSocket | undefined): boolean {
  return useSyncExternalStore<boolean>(
    (cb) => (socket ? socket.subscribe(cb) : () => void 0),
    () => socket?.isConnected ?? false
  );
}

/**
 * ソケット全体の変更（notify が呼ばれるたび）で再レンダーさせたい場合用。
 * 返り値として同じ socket インスタンスを返すので、プロパティへ直接アクセス可能。
 */
export function useTypedSocket<T extends TypedSocket>(socket: T): T {
  // 値取得関数は socket インスタンス自体を返す。参照は変わらないので
  // React 側はレンダー毎に最新プロパティへアクセスできる。
  useSyncExternalStore(
    (cb) => socket.subscribe(cb),
    () => socket
  );
  return socket;
}

/**
 * ツールチップ文字列を購読する簡易フック。
 * schema が更新され setTooltip が再実行された場合に再レンダー。
 */
export function useSocketTooltip(
  socket: TypedSocket | undefined
): string | undefined {
  return useSyncExternalStore<string | undefined>(
    (cb) => (socket ? socket.subscribe(cb) : () => void 0),
    () => socket?.tooltip
  );
}

/**
 * ソケット名を購読するフック。
 */
export function useSocketName(
  socket: TypedSocket | undefined
): string | undefined {
  return useSyncExternalStore<string | undefined>(
    (cb) => (socket ? socket.subscribe(cb) : () => void 0),
    () => socket?.getName()
  );
}

/**
 * Socket の schema が変わった時に再レンダーしたい場合。
 */
export function useSocketSchema(socket: TypedSocket | undefined) {
  return useSyncExternalStore(
    (cb) => (socket ? socket.subscribe(cb) : () => void 0),
    () => socket?.getSchema()
  );
}
