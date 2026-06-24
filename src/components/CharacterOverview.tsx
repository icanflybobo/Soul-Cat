import React, { useEffect, useState } from 'react';
import { ArrowLeft, MessageCircle, Edit3, Heart, Brain, Sparkles, Zap, Save, X, Plus, Trash2 } from 'lucide-react';

interface Props {
  characterId: string;
  onStartChat: () => void;
  onBack: () => void;
}

interface CharacterOverviewData {
  id: string;
  name: string;
  description: string;
  talentSummary: {
    preferences: string[];
    innateTraits: string[];
    acquiredTraits: Record<string, number>;
  };
  memorySummary: {
    preferenceMemoryCount: number;
    emotionalEventCount: number;
    longTermHabitCount: number;
  };
  canEdit: boolean;
}

interface CharacterDetail {
  id: string;
  name: string;
  description: string;
  talentSystem: {
    preferences: Array<{
      id: string;
      name: string;
      description: string;
      intensity: number;
      category: string;
    }>;
    innatePersonality: {
      traits: string[];
      emotionalIntensity: number;
      socialTendency: string;
    };
    acquiredPersonality: {
      confidence: number;
      outgoing: number;
      cautious: number;
      humor: number;
    };
  };
  memorySystem: {
    preferenceMemories: Array<{
      id: string;
      event: string;
      emotionalIntensity: number;
    }>;
    emotionalEventMemories: Array<{
      id: string;
      event: string;
      emotionalLabel: string;
      intensity: number;
    }>;
  };
}

export default function CharacterOverview({ characterId, onStartChat, onBack }: Props) {
  const [overview, setOverview] = useState<CharacterOverviewData | null>(null);
  const [detail, setDetail] = useState<CharacterDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<CharacterDetail | null>(null);
  const [activeTab, setActiveTab] = useState<'info' | 'memories' | 'user-profile'>('info');

  useEffect(() => {
    fetchOverview();
    fetchDetail();
  }, [characterId]);

  const fetchOverview = async () => {
    try {
      const response = await fetch(`/api/characters/${characterId}/overview`);
      const data = await response.json();
      if (data.success) {
        setOverview(data.data);
      }
    } catch (error) {
      console.error('获取角色总览失败:', error);
    }
  };

  const fetchDetail = async () => {
    try {
      const response = await fetch(`/api/characters/${characterId}`);
      const data = await response.json();
      if (data.success) {
        setDetail(data.data);
        setEditData(data.data);
      }
    } catch (error) {
      console.error('获取角色详情失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!editData) return;

    try {
      const response = await fetch(`/api/characters/${characterId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editData.name,
          description: editData.description,
          talentSystem: editData.talentSystem,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setDetail(editData);
        setIsEditing(false);
        fetchOverview();
        alert('角色信息已保存');
      }
    } catch (error) {
      console.error('保存失败:', error);
      alert('保存失败');
    }
  };

  const handleSaveMemories = async () => {
    if (!editData) return;

    try {
      const response = await fetch(`/api/characters/${characterId}/memories`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          preferenceMemories: editData.memorySystem.preferenceMemories,
          emotionalEventMemories: editData.memorySystem.emotionalEventMemories,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setDetail(editData);
        setIsEditing(false);
        fetchOverview();
        alert('角色记忆已保存');
      }
    } catch (error) {
      console.error('保存记忆失败:', error);
      alert('保存记忆失败');
    }
  };

  const updatePreference = (index: number, field: string, value: any) => {
    if (!editData) return;
    const newPrefs = [...editData.talentSystem.preferences];
    newPrefs[index] = { ...newPrefs[index], [field]: value };
    setEditData({
      ...editData,
      talentSystem: {
        ...editData.talentSystem,
        preferences: newPrefs,
      },
    });
  };

  const addPreference = () => {
    if (!editData) return;
    setEditData({
      ...editData,
      talentSystem: {
        ...editData.talentSystem,
        preferences: [
          ...editData.talentSystem.preferences,
          { id: Date.now().toString(), name: '', description: '', intensity: 0.5, category: 'other' },
        ],
      },
    });
  };

  const removePreference = (index: number) => {
    if (!editData) return;
    setEditData({
      ...editData,
      talentSystem: {
        ...editData.talentSystem,
        preferences: editData.talentSystem.preferences.filter((_, i) => i !== index),
      },
    });
  };

  const updateAcquiredPersonality = (trait: string, value: number) => {
    if (!editData) return;
    setEditData({
      ...editData,
      talentSystem: {
        ...editData.talentSystem,
        acquiredPersonality: {
          ...editData.talentSystem.acquiredPersonality,
          [trait]: value,
        },
      },
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!overview || !detail) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-400">角色不存在</p>
        <button
          onClick={onBack}
          className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          返回列表
        </button>
      </div>
    );
  }

  const displayData = isEditing && editData ? editData : detail;

  return (
    <div className="max-w-4xl mx-auto">
      {/* 顶部导航 */}
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={onBack}
          className="flex items-center text-gray-300 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          返回列表
        </button>
        <div className="flex space-x-3">
          {isEditing ? (
            <>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setEditData(detail);
                }}
                className="flex items-center px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
              >
                <X className="w-4 h-4 mr-2" />
                取消
              </button>
              <button
                onClick={activeTab === 'memories' ? handleSaveMemories : handleSave}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Save className="w-4 h-4 mr-2" />
                保存
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
              >
                <Edit3 className="w-4 h-4 mr-2" />
                编辑角色
              </button>
              <button
                onClick={onStartChat}
                className="flex items-center px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-colors"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                开始聊天
              </button>
            </>
          )}
        </div>
      </div>

      {/* 角色头部 */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 border border-white/20 mb-6">
        <div className="flex items-center mb-6">
          <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mr-6">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <div className="flex-1">
            {isEditing ? (
              <div className="space-y-3">
                <input
                  type="text"
                  value={editData?.name || ''}
                  onChange={(e) => setEditData(prev => prev ? { ...prev, name: e.target.value } : null)}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-2xl font-bold focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <textarea
                  value={editData?.description || ''}
                  onChange={(e) => setEditData(prev => prev ? { ...prev, description: e.target.value } : null)}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white resize-none h-20 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="角色描述..."
                />
              </div>
            ) : (
              <>
                <h1 className="text-3xl font-bold text-white mb-2">{overview.name}</h1>
                <p className="text-gray-400">{overview.description || '暂无描述'}</p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 标签页 */}
      <div className="flex space-x-1 mb-6 bg-white/5 rounded-lg p-1">
        <button
          onClick={() => { setActiveTab('info'); setIsEditing(false); }}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'info' ? 'bg-purple-600 text-white' : 'text-gray-300 hover:bg-white/10'
          }`}
        >
          基本信息
        </button>
        <button
          onClick={() => { setActiveTab('memories'); setIsEditing(false); }}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'memories' ? 'bg-purple-600 text-white' : 'text-gray-300 hover:bg-white/10'
          }`}
        >
          记忆管理
        </button>
        <button
          onClick={() => { setActiveTab('user-profile'); setIsEditing(false); }}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'user-profile' ? 'bg-purple-600 text-white' : 'text-gray-300 hover:bg-white/10'
          }`}
        >
          用户画像
        </button>
      </div>

      {/* 基本信息标签 */}
      {activeTab === 'info' && (
        <div className="space-y-6">
          {/* 喜好 */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <Heart className="w-5 h-5 text-pink-400 mr-2" />
                <h2 className="text-xl font-semibold text-white">喜好</h2>
              </div>
              {isEditing && (
                <button
                  onClick={addPreference}
                  className="flex items-center px-3 py-1 bg-purple-600/20 text-purple-300 rounded-lg hover:bg-purple-600/30 transition-colors text-sm"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  添加
                </button>
              )}
            </div>
            <div className="space-y-3">
              {displayData.talentSystem.preferences.map((pref, index) => (
                <div key={pref.id} className="bg-white/5 rounded-lg p-4">
                  {isEditing ? (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-4">
                        <input
                          type="text"
                          value={pref.name}
                          onChange={(e) => updatePreference(index, 'name', e.target.value)}
                          className="px-3 py-2 bg-white/10 border border-white/20 rounded text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                          placeholder="喜好名称"
                        />
                        <select
                          value={pref.category}
                          onChange={(e) => updatePreference(index, 'category', e.target.value)}
                          className="px-3 py-2 bg-white/10 border border-white/20 rounded text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                          <option value="food">食物</option>
                          <option value="activity">活动</option>
                          <option value="item">物品</option>
                          <option value="place">地点</option>
                          <option value="personality">性格</option>
                          <option value="other">其他</option>
                        </select>
                      </div>
                      <input
                        type="text"
                        value={pref.description}
                        onChange={(e) => updatePreference(index, 'description', e.target.value)}
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="描述"
                      />
                      <div className="flex items-center justify-between">
                        <div className="flex-1 mr-4">
                          <span className="text-sm text-gray-400">强度: {(pref.intensity * 100).toFixed(0)}%</span>
                          <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.1"
                            value={pref.intensity}
                            onChange={(e) => updatePreference(index, 'intensity', parseFloat(e.target.value))}
                            className="w-full mt-1"
                          />
                        </div>
                        <button
                          onClick={() => removePreference(index)}
                          className="p-2 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-white font-medium">{pref.name}</span>
                        <span className="text-gray-400 text-sm ml-2">({pref.category})</span>
                        <p className="text-gray-400 text-sm mt-1">{pref.description}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-purple-300 text-sm">{(pref.intensity * 100).toFixed(0)}%</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 天赋性格 */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <div className="flex items-center mb-4">
              <Brain className="w-5 h-5 text-blue-400 mr-2" />
              <h2 className="text-xl font-semibold text-white">天赋性格</h2>
            </div>
            <div className="flex flex-wrap gap-2 mb-4">
              {displayData.talentSystem.innatePersonality.traits.map((trait, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm"
                >
                  {trait}
                </span>
              ))}
            </div>
            <p className="text-gray-400 text-sm">
              情感反应强度: {(displayData.talentSystem.innatePersonality.emotionalIntensity * 100).toFixed(0)}%
            </p>
            <p className="text-gray-400 text-sm">
              社交倾向: {displayData.talentSystem.innatePersonality.socialTendency}
            </p>
          </div>

          {/* 后天性格 */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <div className="flex items-center mb-4">
              <Zap className="w-5 h-5 text-yellow-400 mr-2" />
              <h2 className="text-xl font-semibold text-white">后天性格</h2>
              <span className="ml-2 text-sm text-gray-400">（可随经历变化）</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(displayData.talentSystem.acquiredPersonality).map(([trait, value]) => (
                <div key={trait} className="bg-white/5 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-300">
                      {trait === 'confidence' ? '自信' :
                       trait === 'outgoing' ? '开朗' :
                       trait === 'cautious' ? '谨慎' :
                       trait === 'humor' ? '幽默' : trait}
                    </span>
                    <span className="text-sm text-purple-300">{(value * 100).toFixed(0)}%</span>
                  </div>
                  {isEditing ? (
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={value}
                      onChange={(e) => updateAcquiredPersonality(trait, parseFloat(e.target.value))}
                      className="w-full"
                    />
                  ) : (
                    <div className="w-full bg-white/10 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all"
                        style={{ width: `${value * 100}%` }}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 记忆管理标签 */}
      {activeTab === 'memories' && (
        <div className="space-y-6">
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white">喜好关联记忆</h2>
              <span className="text-sm text-gray-400">{displayData.memorySystem.preferenceMemories.length} 条</span>
            </div>
            <div className="space-y-3">
              {displayData.memorySystem.preferenceMemories.map((memory) => (
                <div key={memory.id} className="bg-white/5 rounded-lg p-4">
                  <p className="text-white">{memory.event}</p>
                  <p className="text-gray-400 text-sm mt-1">
                    情感强度: {memory.emotionalIntensity.toFixed(1)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white">情感事件记忆</h2>
              <span className="text-sm text-gray-400">{displayData.memorySystem.emotionalEventMemories.length} 条</span>
            </div>
            <div className="space-y-3">
              {displayData.memorySystem.emotionalEventMemories.map((memory) => (
                <div key={memory.id} className="bg-white/5 rounded-lg p-4">
                  <p className="text-white">{memory.event}</p>
                  <div className="flex items-center mt-2 space-x-4">
                    <span className={`text-sm ${
                      memory.emotionalLabel === '正面' ? 'text-green-400' :
                      memory.emotionalLabel === '负面' ? 'text-red-400' :
                      'text-gray-400'
                    }`}>
                      {memory.emotionalLabel}
                    </span>
                    <span className="text-gray-400 text-sm">
                      强度: {memory.intensity.toFixed(1)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 用户画像标签 */}
      {activeTab === 'user-profile' && (
        <UserProfileManager characterId={characterId} />
      )}
    </div>
  );
}

// 用户画像管理组件
function UserProfileManager({ characterId }: { characterId: string }) {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<any>(null);

  useEffect(() => {
    fetchProfile();
  }, [characterId]);

  const fetchProfile = async () => {
    try {
      const response = await fetch(`/api/characters/${characterId}/user-profile`);
      const data = await response.json();
      if (data.success) {
        setProfile(data.data);
        setEditData(data.data);
      }
    } catch (error) {
      console.error('获取用户画像失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const response = await fetch(`/api/characters/${characterId}/user-profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editData.name,
          description: editData.description,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setProfile(editData);
        setIsEditing(false);
        alert('用户画像已保存');
      }
    } catch (error) {
      console.error('保存失败:', error);
      alert('保存失败');
    }
  };

  const addPreference = async () => {
    const name = prompt('请输入偏好名称:');
    if (!name) return;
    const description = prompt('请输入描述:') || '';

    try {
      const response = await fetch(`/api/characters/${characterId}/user-profile/preferences`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description }),
      });

      const data = await response.json();
      if (data.success) {
        setProfile(data.data);
        setEditData(data.data);
      }
    } catch (error) {
      console.error('添加偏好失败:', error);
    }
  };

  const addTrait = async () => {
    const name = prompt('请输入特质名称:');
    if (!name) return;
    const description = prompt('请输入描述:') || '';

    try {
      const response = await fetch(`/api/characters/${characterId}/user-profile/traits`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description }),
      });

      const data = await response.json();
      if (data.success) {
        setProfile(data.data);
        setEditData(data.data);
      }
    } catch (error) {
      console.error('添加特质失败:', error);
    }
  };

  const addMemory = async () => {
    const event = prompt('请输入记忆内容:');
    if (!event) return;

    try {
      const response = await fetch(`/api/characters/${characterId}/user-profile/memories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event, isImportant: true }),
      });

      const data = await response.json();
      if (data.success) {
        setProfile(data.data);
        setEditData(data.data);
      }
    } catch (error) {
      console.error('添加记忆失败:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!profile) {
    return <p className="text-gray-400">暂无用户画像</p>;
  }

  return (
    <div className="space-y-6">
      {/* 基本信息 */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white">用户画像</h2>
          {isEditing ? (
            <div className="flex space-x-2">
              <button
                onClick={() => { setIsEditing(false); setEditData(profile); }}
                className="px-3 py-1 bg-white/10 text-white rounded hover:bg-white/20 transition-colors text-sm"
              >
                取消
              </button>
              <button
                onClick={handleSave}
                className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-sm"
              >
                保存
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="px-3 py-1 bg-white/10 text-white rounded hover:bg-white/20 transition-colors text-sm"
            >
              编辑
            </button>
          )}
        </div>

        {isEditing ? (
          <div className="space-y-3">
            <div>
              <label className="block text-sm text-gray-400 mb-1">称呼</label>
              <input
                type="text"
                value={editData.name}
                onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">描述</label>
              <textarea
                value={editData.description}
                onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white resize-none h-20 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>
        ) : (
          <div>
            <p className="text-white text-lg mb-2">{profile.name}</p>
            <p className="text-gray-400">{profile.description || '暂无描述'}</p>
          </div>
        )}

        {/* 关系状态 */}
        <div className="mt-4 pt-4 border-t border-white/10">
          <h3 className="text-sm font-medium text-gray-300 mb-3">关系状态</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white/5 rounded-lg p-3 text-center">
              <div className="text-lg font-bold text-pink-400">
                {(profile.relationship.closeness * 100).toFixed(0)}%
              </div>
              <div className="text-xs text-gray-400">亲密度</div>
            </div>
            <div className="bg-white/5 rounded-lg p-3 text-center">
              <div className="text-lg font-bold text-blue-400">
                {(profile.relationship.trustLevel * 100).toFixed(0)}%
              </div>
              <div className="text-xs text-gray-400">信任度</div>
            </div>
            <div className="bg-white/5 rounded-lg p-3 text-center">
              <div className="text-lg font-bold text-green-400">
                {profile.relationship.interactionCount}
              </div>
              <div className="text-xs text-gray-400">互动次数</div>
            </div>
          </div>
        </div>
      </div>

      {/* 用户偏好 */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white">用户偏好</h2>
          <button
            onClick={addPreference}
            className="flex items-center px-3 py-1 bg-purple-600/20 text-purple-300 rounded-lg hover:bg-purple-600/30 transition-colors text-sm"
          >
            <Plus className="w-4 h-4 mr-1" />
            添加
          </button>
        </div>
        {profile.preferences.length > 0 ? (
          <div className="space-y-2">
            {profile.preferences.map((pref: any) => (
              <div key={pref.id} className="bg-white/5 rounded-lg p-3">
                <span className="text-white">{pref.name}</span>
                <span className="text-gray-400 text-sm ml-2">{pref.description}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">暂无偏好</p>
        )}
      </div>

      {/* 用户特质 */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white">用户特质</h2>
          <button
            onClick={addTrait}
            className="flex items-center px-3 py-1 bg-purple-600/20 text-purple-300 rounded-lg hover:bg-purple-600/30 transition-colors text-sm"
          >
            <Plus className="w-4 h-4 mr-1" />
            添加
          </button>
        </div>
        {profile.traits.length > 0 ? (
          <div className="space-y-2">
            {profile.traits.map((trait: any) => (
              <div key={trait.id} className="bg-white/5 rounded-lg p-3">
                <span className="text-white">{trait.name}</span>
                <span className="text-gray-400 text-sm ml-2">{trait.description}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">暂无特质</p>
        )}
      </div>

      {/* 重要记忆 */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white">重要记忆</h2>
          <button
            onClick={addMemory}
            className="flex items-center px-3 py-1 bg-purple-600/20 text-purple-300 rounded-lg hover:bg-purple-600/30 transition-colors text-sm"
          >
            <Plus className="w-4 h-4 mr-1" />
            添加
          </button>
        </div>
        {profile.memories.filter((m: any) => m.isImportant).length > 0 ? (
          <div className="space-y-2">
            {profile.memories.filter((m: any) => m.isImportant).map((memory: any) => (
              <div key={memory.id} className="bg-white/5 rounded-lg p-3">
                <p className="text-white">{memory.event}</p>
                <span className={`text-sm ${
                  memory.emotionalLabel === '正面' ? 'text-green-400' :
                  memory.emotionalLabel === '负面' ? 'text-red-400' :
                  'text-gray-400'
                }`}>
                  {memory.emotionalLabel}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">暂无重要记忆</p>
        )}
      </div>
    </div>
  );
}
