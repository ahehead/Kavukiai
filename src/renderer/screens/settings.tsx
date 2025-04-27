import { useState } from 'react'

export function SettingsScreen() {
  const [username, setUsername] = useState('')
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [notifications, setNotifications] = useState(true)

  const handleSave = () => {
    // TODO: 保存処理を実装
    console.log({ username, theme, notifications })
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-semibold mb-4">Settings</h1>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">
            Username
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring"
              placeholder="Your name"
            />
          </label>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">
            Theme
            <select
              value={theme}
              onChange={e => setTheme(e.target.value as any)}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring"
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </label>
        </div>

        <div className="mb-6 flex items-center">
          <input
            id="notifications"
            type="checkbox"
            checked={notifications}
            onChange={e => setNotifications(e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="notifications" className="ml-2 text-sm">
            Enable notifications
          </label>
        </div>

        <div className="flex justify-between">
          <button
            onClick={() => console.log('Cancel')}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  )
}
