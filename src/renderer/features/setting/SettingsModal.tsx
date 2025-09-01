import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CloseButton, SaveButton } from 'renderer/components/UIButton'
import { useApiKeysStore } from 'renderer/hooks/ApiKeysStore'
import { type Provider, providers } from 'shared/ApiKeysType'
import { electronApiService } from '../services/appService'

export default function SettingsModal() {
  const nav = useNavigate()

  const dialogRef = useRef<HTMLDialogElement>(null)
  const { keys, setApiKeysFlags } = useApiKeysStore()
  const [apiKeys, setApiKeys] = useState<Record<Provider, string>>(
    Object.fromEntries(providers.map(p => [p, ''])) as Record<Provider, string>
  )
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadKeys = async () => {
      setIsLoading(true)
      try {
        const result = await electronApiService.loadApiKeys()
        if (result.status === 'success') {
          setApiKeysFlags(result.data)
        } else {
          console.error('Error loading API keys:', result.message)
        }
      } catch (error) {
        console.error('Failed to load API keys:', error)
      } finally {
        setIsLoading(false)
      }
    }
    loadKeys()
  }, [setApiKeysFlags])

  const stop = (e: React.SyntheticEvent) => e.stopPropagation()

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: false positive
    <div
      className="fixed inset-0 w-full h-full bg-sidebar/30 backdrop-blur-xs flex items-center justify-center z-modal"
      onClick={() => nav(-1)}
      onKeyDown={stop}
      onKeyUp={stop}
    >
      <dialog
        open
        ref={dialogRef}
        className="static bg-background p-5 rounded-lg shadow-lg dialog-animate focus:outline-none"
        onClick={stop}
        onKeyDown={stop}
        onKeyUp={stop}
      >
        {/* APIキー設定フォーム */}
        <div className="space-y-4">
          <h2 className="py-2">ApiKey設定</h2>
          {isLoading ? (
            <p>Loading API Keys...</p>
          ) : (
            providers.map(p => (
              <div key={p} className="flex items-center">
                <label htmlFor={p} className="w-24 capitalize">
                  {p}
                </label>
                <input
                  id={p}
                  type="password"
                  className="flex-1 px-2 py-1 border rounded mr-2"
                  placeholder={`Enter ${p} API Key`}
                  value={apiKeys[p]}
                  onChange={e =>
                    setApiKeys(prev => ({ ...prev, [p]: e.target.value }))
                  }
                />
                <SaveButton
                  onClick={async () => {
                    const result = await electronApiService.saveApiKey(
                      p,
                      apiKeys[p]
                    )
                    if (result.status === 'success') {
                      setApiKeysFlags(result.data)
                      setApiKeys(prev => ({ ...prev, [p]: '' }))
                    } else {
                      console.error('Error saving API key:', result.message)
                    }
                  }}
                >
                  Save
                </SaveButton>
                {keys[p] ? (
                  <span className="ml-2 text-green-500">✅ 登録済み</span>
                ) : (
                  <span className="ml-2 text-gray-500">未登録</span>
                )}
              </div>
            ))
          )}

          <div className="flex justify-end mt-5">
            <CloseButton onClick={() => nav(-1)}>Close</CloseButton>
          </div>
        </div>
      </dialog>
    </div>
  )
}
