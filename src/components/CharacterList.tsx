import React, { useEffect, useState } from 'react';
import { Plus, MessageCircle, Eye, User } from 'lucide-react';

interface Character {
  id: string;
  name: string;
  description: string;
  createdAt: string;
}

interface Props {
  onSelect: (characterId: string) => void;
  onViewOverview: (characterId: string) => void;
  onCreateNew: () => void;
}

export default function CharacterList({ onSelect, onViewOverview, onCreateNew }: Props) {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCharacters();
  }, []);

  const fetchCharacters = async () => {
    try {
      const response = await fetch('/api/characters');
      const data = await response.json();
      if (data.success) {
        setCharacters(data.data);
      }
    } catch (error) {
      console.error('获取角色列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-white">我的角色</h2>
          <p className="text-gray-400 mt-1">选择或创建一个角色开始聊天</p>
        </div>
        <button
          onClick={onCreateNew}
          className="flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-colors shadow-lg"
        >
          <Plus className="w-5 h-5 mr-2" />
          创建角色
        </button>
      </div>

      {characters.length === 0 ? (
        <div className="text-center py-16">
          <User className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-300 mb-2">还没有角色</h3>
          <p className="text-gray-500 mb-6">创建你的第一个角色，开始独特的聊天体验</p>
          <button
            onClick={onCreateNew}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            立即创建
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {characters.map((character) => (
            <div
              key={character.id}
              className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 hover:border-purple-500/50 transition-all group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => onViewOverview(character.id)}
                    className="p-2 bg-white/10 text-gray-300 rounded-lg hover:bg-white/20 transition-colors"
                    title="查看详情"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onSelect(character.id)}
                    className="p-2 bg-purple-600/20 text-purple-300 rounded-lg hover:bg-purple-600/30 transition-colors"
                    title="开始聊天"
                  >
                    <MessageCircle className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <h3 className="text-xl font-semibold text-white mb-2">{character.name}</h3>
              <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                {character.description || '暂无描述'}
              </p>

              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>创建于 {new Date(character.createdAt).toLocaleDateString('zh-CN')}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
