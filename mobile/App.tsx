import 'react-native-gesture-handler';
import { ExpoRoot } from 'expo-router';

export function App() {
  const ctx = require.context('./app');
  return <ExpoRoot context={ctx} />;
}

App.displayName = 'App';

export default App;
