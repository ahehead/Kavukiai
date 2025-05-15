import { useRef, useState } from 'react';
import { useApiKeysStore } from '../hooks/ApiKeysStore';
import { providers, type Provider } from 'shared/ApiKeysType';
import { electronApiService } from '../features/services/appService';

type Props = { onClose: () => void };

export default function SettingsModal({ onClose }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const { keys, setApiKeysFlags } = useApiKeysStore();
  const [apiKeys, setApiKeys] = useState<Record<Provider, string>>(Object.fromEntries(providers.map(p => [p, ''])) as Record<Provider, string>);

  const stop = (e: React.SyntheticEvent) => e.stopPropagation();

  return (
    <div
      className="fixed inset-0 w-full h-full bg-accent/20 backdrop-blur-xs flex items-center justify-center z-modal"
      onClick={onClose}
      onKeyDown={stop}
      onKeyUp={stop}
    >
      <dialog
        open
        ref={dialogRef}
        className="static bg-background p-6 rounded-lg shadow-lg dialog-animate focus:outline-none"
        onClick={stop}
        onKeyDown={stop}
        onKeyUp={stop}
      >
        {/* APIキー設定フォーム */}
        <div className="space-y-4">
          <h2 className='py-2'>ApiKey設定</h2>
          {providers.map((p) => (
            <div key={p} className="flex items-center">
              <label htmlFor={p} className="w-24 capitalize">{p}</label>
              <input
                id={p}
                type="password"
                className="flex-1 px-2 py-1 border rounded"
                placeholder={`Enter ${p} API Key`}
                value={apiKeys[p]}
                onChange={(e) =>
                  setApiKeys((prev) => ({ ...prev, [p]: e.target.value }))
                }
              />
              <button
                className="ml-2 px-3 py-1 bg-blue-500 text-white rounded"
                onClick={async () => {
                  const result = await electronApiService.saveApiKey(p, apiKeys[p]);
                  if (result.status === 'success') {
                    setApiKeysFlags(result.data);
                  } else {
                    console.error('Error saving API key:', result.message);
                  }
                }}
              >
                Save
              </button>
              {keys[p] && <span className="ml-2 text-green-500">Saved</span>}
            </div>
          ))}

          <div className="flex justify-end mt-4">
            <button
              className="px-4 py-2 bg-gray-300 rounded"
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </div>
      </dialog>
    </div>
  );
}
