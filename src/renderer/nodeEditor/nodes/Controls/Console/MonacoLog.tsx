// MonacoLog.tsx (renderer only)
import { useEffect, useRef } from 'react'

// ★ このファイルは renderer バンドルにだけ含める（main から import しない）

export function MonacoLog({ value }: { value: string }) {
  const boxRef = useRef<HTMLDivElement>(null)
  const editorRef = useRef<import('monaco-editor').editor.IStandaloneCodeEditor | null>(null)
  const monacoRef = useRef<typeof import('monaco-editor/esm/vs/editor/editor.api') | null>(null)

  // --- 初期化（renderer でのみ実行） ---
  useEffect(() => {
    if (typeof window === 'undefined') return // main/SSR ガード
    let disposed = false

    // ① Worker の配線（Vite）
    const wireWorkers = async () => {
      try {
        const [editorW, jsonW, cssW, htmlW, tsW] = await Promise.all([
          import('monaco-editor/esm/vs/editor/editor.worker?worker'),
          import('monaco-editor/esm/vs/language/json/json.worker?worker'),
          import('monaco-editor/esm/vs/language/css/css.worker?worker'),
          import('monaco-editor/esm/vs/language/html/html.worker?worker'),
          import('monaco-editor/esm/vs/language/typescript/ts.worker?worker')
        ])
        self.MonacoEnvironment = {
          getWorker(_moduleId: string, label: string) {
            if (label === 'json') return new jsonW.default()
            if (label === 'css' || label === 'scss' || label === 'less') return new cssW.default()
            if (label === 'html' || label === 'handlebars' || label === 'razor') return new htmlW.default()
            if (label === 'typescript' || label === 'javascript') return new tsW.default()
            return new editorW.default()
          }
        }
      } catch {
        // Webpack で monaco-editor-webpack-plugin を使う場合はここは不要
      }
    }

    const mount = async () => {
      await wireWorkers()
      const monaco = await import('monaco-editor/esm/vs/editor/editor.api')
      monacoRef.current = monaco
      if (!boxRef.current || disposed) return


      monaco.editor.defineTheme('logViewerLight', {
        base: 'vs',
        inherit: true,
        rules: [],
        colors: {
          'editor.background': '#f3f4f6',
          'editorGutter.background': '#f3f4f6',
          // ← 選択を濃く（青系・40% 不透明）
          'editor.selectionBackground': '#2563eb66',            // blue-600 @ 40%
          'editor.inactiveSelectionBackground': '#93c5fd66',    // 非フォーカス時（blue-300 @ 40%）
          // 余裕があればハイライト類も少し濃く
          'editor.selectionHighlightBackground': '#2563eb33',   // “同一語句選択” などのハイライト
          // 任意：文字色も指定（Monaco では無視されるバージョンもあり）
          'editor.selectionForeground': '#111827',
        },
      })

      const editor = monaco.editor.create(boxRef.current, {
        language: 'plaintext',
        readOnly: true,
        theme: 'logViewerLight',
        minimap: { enabled: false },
        lineNumbers: 'off',
        // 横スクロールバーを出したいので wordWrap は off
        wordWrap: 'off',
        // 縦横スクロールバーの明示設定（必要時表示）。常時表示なら 'visible'
        scrollbar: {
          vertical: 'auto',
          horizontal: 'auto',
          useShadows: false
        },
        renderWhitespace: 'none',
        renderLineHighlight: 'none',
        renderLineHighlightOnlyWhenFocus: false,
        occurrencesHighlight: "off",
        selectionHighlight: false,
        guides: { indentation: false, bracketPairs: false },
        glyphMargin: false,
        folding: false,
        links: false,
        hover: { enabled: false },
        contextmenu: false,
        quickSuggestions: { other: false, comments: false, strings: false },
        parameterHints: { enabled: false },
        suggestOnTriggerCharacters: false,
        lightbulb: { enabled: undefined },
        overviewRulerLanes: 0,
        overviewRulerBorder: false,
        stickyScroll: { enabled: false },
        scrollBeyondLastLine: false,
        padding: { top: 0, bottom: 0 },
        find: { addExtraSpaceOnTop: false, autoFindInSelection: 'never', seedSearchStringFromSelection: 'never' },
      })
      editorRef.current = editor

      const model = monaco.editor.createModel(value ?? '', 'plaintext')
      editor.setModel(model)
      editor.revealLine(model.getLineCount())
    }

    mount()

    return () => {
      disposed = true
      const editor = editorRef.current
      if (editor) {
        const model = editor.getModel()
        editor.dispose()
        model?.dispose()
      }
      editorRef.current = null
      monacoRef.current = null
    }
  }, [])

  // --- 値の更新（全文置換） ---
  useEffect(() => {
    const editor = editorRef.current
    const monaco = monacoRef.current
    if (!editor || !monaco) return
    const model = editor.getModel()
    if (!model) return

    // 追記だけなら applyEdits の方がさらに効率的
    model.setValue(value ?? '')
    editor.revealLine(model.getLineCount())
  }, [value])

  return (
    <div
      ref={boxRef}
      className="w-full h-full min-h-0 rounded-md bg-gray-100 mt-1 overflow-auto"
      onPointerDown={(e) => e.stopPropagation()}
      onPointerMove={(e) => e.stopPropagation()}
      onWheel={(e) => e.stopPropagation()} // キャンバスへの伝播だけ止める（preventDefaultはしない）
    />
  )
}
