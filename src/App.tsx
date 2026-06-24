import React, { useState } from 'react';
import CharacterCreation from './components/CharacterCreation';
import CharacterOverview from './components/CharacterOverview';
import ChatInterface from './components/ChatInterface';
import CharacterList from './components/CharacterList';

type View = 'list' | 'create' | 'overview' | 'chat';

function App() {
  const [currentView, setCurrentView] = useState<View>('list');
  const [selectedCharacterId, setSelectedCharacterId] = useState<string | null>(null);

  const handleCharacterCreated = (characterId: string) => {
    setSelectedCharacterId(characterId);
    setCurrentView('overview');
  };

  const handleCharacterSelect = (characterId: string) => {
    setSelectedCharacterId(characterId);
    setCurrentView('chat');
  };

  const handleViewOverview = (characterId: string) => {
    setSelectedCharacterId(characterId);
    setCurrentView('overview');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* 顶部导航 */}
      <nav className="bg-white/10 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 
                className="text-2xl font-bold text-white cursor-pointer"
                onClick={() => setCurrentView('list')}
              >
                Soul Chat
              </h1>
              <span className="ml-2 text-sm text-purple-300">灵魂聊天</span>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => setCurrentView('list')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentView === 'list'
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                角色列表
              </button>
              <button
                onClick={() => setCurrentView('create')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentView === 'create'
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                创建角色
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* 主内容区 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentView === 'list' && (
          <CharacterList
            onSelect={handleCharacterSelect}
            onViewOverview={handleViewOverview}
            onCreateNew={() => setCurrentView('create')}
          />
        )}

        {currentView === 'create' && (
          <CharacterCreation onCharacterCreated={handleCharacterCreated} />
        )}

        {currentView === 'overview' && selectedCharacterId && (
          <CharacterOverview
            characterId={selectedCharacterId}
            onStartChat={() => setCurrentView('chat')}
            onBack={() => setCurrentView('list')}
          />
        )}

        {currentView === 'chat' && selectedCharacterId && (
          <ChatInterface
            characterId={selectedCharacterId}
            onBack={() => setCurrentView('list')}
          />
        )}
      </main>
    </div>
  );
}

export default App;
