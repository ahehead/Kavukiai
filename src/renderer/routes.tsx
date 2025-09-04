import { Router } from 'lib/electron-router-dom'
import { Route } from 'react-router-dom'
import SettingsModal from './features/setting_view/SettingsModal'
import { MainScreen } from './screens/main'

export function AppRoutes() {
  return (
    <Router
      main={
        <Route path='/' element={<MainScreen />}>
          <Route index element={null} />
          <Route path="settings" element={<SettingsModal />} />
        </Route>
      }
    />
  )
}
