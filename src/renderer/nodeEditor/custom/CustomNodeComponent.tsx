import type { JSX } from 'react'
import { Presets, type ClassicScheme, type RenderEmit } from 'rete-react-plugin'
import { css, type RuleSet } from 'styled-components'

/**
 *  UI トーン
 *  - 基本: 白 + 極薄シャドウ → 業務ツール感
 *  - hover: ごく薄い浮き上がり
 *  - selected: アンバー系枠 + 外側グロー + 2% 拡大
 */
const addStyleCss = css<{ selected?: boolean }>`
  background: #ffffff; /* base */
  border: 2px solid #d1d5db; /* gray‑300 */
  border-radius: 0.5rem; /* 8px */
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
  transition:
    background 0.25s ease,
    box-shadow 0.25s ease,
    transform 0.12s ease;

  &:hover {
    background: #f9fafb; /* gray‑50 */
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.06);
  }

  /*―― 選択状態 ――*/
  ${(p): false | RuleSet<object> | undefined =>
    p.selected &&
    css`
      border-color: #eab308; /* amber‑500 */
      box-shadow: 0 0 0 4px rgba(234, 179, 8, 0.4);
      transform: scale(1.02);
    `}

  /*―― タイトルバー ――*/
  .title {
    background: #f3f4f6; /* gray‑100 */
    color: #374151; /* gray‑700 */
    font-size: 1rem;
    font-weight: 600;
    padding: 0.5rem 0.75rem;
    border-bottom: 1px solid #d1d5db;
    border-radius: 0.5rem 0.5rem 0 0;

    ${(p): false | RuleSet<object> | undefined =>
    p.selected &&
    css`
        border-color: #eab308;
      `}
  }

  .input {
    display: flex;
    align-items: center;
  }
  .output {
    display: flex;
    justify-content: flex-end;
    align-items: center;
  }

  /*―― ポート名 ――*/
  .input-title {
    margin: 0px 0px 3px 3px;
    color: #374151;
    display: flex;
    align-items: center;
  }
  .output-title {
    margin: 0px 3px 2px 0px;
    color: #374151;
    font-size: 0.875rem;
    font-weight: 500;
  }

  /*―― ソケット位置補正 ――*/
  .input-socket {
    margin: 2px 0px 0px -2px;
  }
  .output-socket {
    margin: 2px -2px 0px 0px;
  }
`

type Props<S extends ClassicScheme> = {
  data: S['Node']
  styles?: () => any
  emit: RenderEmit<S>
}

export function CustomNodeComponent<S extends ClassicScheme>(props: Props<S>): JSX.Element {
  return <Presets.classic.Node styles={() => addStyleCss} {...props} />
}
