import { AppStateProvider, useAppState } from './app/AppStateContext';
import { GalleryScreen } from './screens/GalleryScreen';
import { HomeScreen } from './screens/HomeScreen';
import { RegisterScreen } from './screens/RegisterScreen';
import { ResultScreen } from './screens/ResultScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { TraceScreen } from './screens/TraceScreen';

function ScreenSwitcher() {
  const { screen } = useAppState();

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
    <AppStateProvider>
      <ScreenSwitcher />
    </AppStateProvider>
  );
}
