import { AppStateProvider, useAppState } from './app/AppStateContext';
import { ProProvider } from './app/ProContext';
import { GalleryScreen } from './screens/GalleryScreen';
import { HomeScreen } from './screens/HomeScreen';
import { RegisterScreen } from './screens/RegisterScreen';
import { ResultScreen } from './screens/ResultScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { TraceScreen } from './screens/TraceScreen';

function ScreenSwitcher() {
  const { screen, booted } = useAppState();

  // 起動直後のチュートリアル要否チェック中は何も描画しない
  // (Capacitorのスプラッシュ画面が隠してくれる)
  if (!booted) return null;

  switch (screen) {
    case 'home':
      return <HomeScreen />;
    case 'trace':
      return <TraceScreen />;
    case 'result':
      return <ResultScreen />;
    case 'gallery':
      return <GalleryScreen />;
    case 'register':
      return <RegisterScreen />;
    case 'settings':
      return <SettingsScreen />;
  }
}

export function App() {
  return (
    <ProProvider>
      <AppStateProvider>
        <ScreenSwitcher />
      </AppStateProvider>
    </ProProvider>
  );
}
