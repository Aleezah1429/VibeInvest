import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';

import Splash from './src/screens/Splash';
import Search from './src/screens/Search';
import Loading from './src/screens/Loading';
import Report from './src/screens/Report';

type Screen = 'splash' | 'search' | 'loading' | 'report';

export default function App() {
  const [screen, setScreen] = useState<Screen>('splash');
  const [startupName, setStartupName] = useState<string>('Bykea');

  return (
    <>
      <StatusBar style="light" />
      {screen === 'splash' && (
        <Splash
          onAnalyze={() => setScreen('search')}
          onBrowse={() => setScreen('search')}
        />
      )}
      {screen === 'search' && (
        <Search
          startupName={startupName}
          setStartupName={setStartupName}
          onBack={() => setScreen('splash')}
          onAnalyze={() => {
            // Empty input falls back to Bykea, matching the HTML's startAnalysis()
            if (!startupName.trim()) setStartupName('Bykea');
            setScreen('loading');
          }}
          onSelectRecent={(name) => {
            setStartupName(name);
            setScreen('report');
          }}
        />
      )}
      {screen === 'loading' && (
        <Loading
          startupName={startupName}
          onComplete={() => setScreen('report')}
        />
      )}
      {screen === 'report' && (
        <Report
          startupName={startupName}
          onBack={() => setScreen('search')}
          onNewAnalysis={() => setScreen('search')}
        />
      )}
    </>
  );
}
