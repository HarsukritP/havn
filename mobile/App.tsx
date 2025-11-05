import 'react-native-gesture-handler';
import { ExpoRoot } from 'expo-router';

// Must use this syntax for expo-router
// @ts-ignore - require.context is a Metro bundler feature
const ctx = require.context('./app');

export function App() {
  return <ExpoRoot context={ctx} />;
}

App.displayName = 'App';

export default App;
