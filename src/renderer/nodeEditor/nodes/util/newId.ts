export function newMsgId(): string {
  try {
    /* @ts-ignore */ return globalThis.crypto?.randomUUID?.();
  } catch {}
  const now = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 10);
  return `m_${now}_${rand}`;
}
