import React, { useState } from 'react';
import { Plus, Trash2, Heart, Brain, Sparkles } from 'lucide-react';

interface Props {
  onCharacterCreated: (characterId: string) => void;
}

interface PreferenceInput {
  name: string;
  description: string;
  intensity: number;
  category: 'food' | 'activity' | 'item' | 'place' | 'personality' | 'other';
}

export default function CharacterCreation({ onCharacterCreated }: Props) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [deepMemories, setDeepMemories] = useState<string[]>(['']);
  const [preferences, setPreferences] = useState<PreferenceInput[]>([
    { name: '', description: '', intensity: 0.7, category: 'other' }
  ]);
  const [innateTraits, setInnateTraits] = useState('');
  const [emotionalIntensity, setEmotionalIntensity] = useState(0.5);
  const [socialTendency, setSocialTendency] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const addMemory = () => setDeepMemories([...deepMemories, '']);
  const removeMemory = (index: number) => {
    setDeepMemories(deepMemories.filter((_, i) => i !== index));
  };
  const updateMemory = (index: number, value: string) => {
    const newMemories = [...deepMemories];
    newMemories[index] = value;
    setDeepMemories(newMemories);
  };

  const addPreference = () => {
    setPreferences([...preferences, { name: '', description: '', intensity: 0.7, category: 'other' }]);
  };
  const removePreference = (index: number) => {
    setPreferences(preferences.filter((_, i) => i !== index));
  };
  const updatePreference = (index: number, field: keyof PreferenceInput, value: any) => {
    const newPrefs = [...preferences];
    newPrefs[index] = { ...newPrefs[index], [field]: value };
    setPreferences(newPrefs);
  };

  const handleCreate = async () => {
    setIsCreating(true);
    try {
      const response = await fetch('/api/characters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          description,
          deepMemories: deepMemories.filter(m => m.trim()),
          preferences: preferences.filter(p => p.name.trim()),
          innatePersonality: {
            traits: innateTraits.split(',').map(t => t.trim()).filter(Boolean),
            emotionalIntensity,
            socialTendency,
          },
        }),
      });

      const data = await response.json();
      if (data.success) {
        onCharacterCreated(data.data.id);
      } else {
        alert('创建失败：' + data.error);
      }
    } catch (error) {
      alert('创建失败：' + error);
    } finally {
      setIsCreating(false);
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1: return name.trim();
      case 2: return deepMemories.some(m => m.trim());
      case 3: return preferences.some(p => p.name.trim());
      case 4: return innateTraits.trim() && socialTendency.trim();
      default: return false;
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 border border-white/20">
        <h2 className="text-3xl font-bold text-white mb-2">创建角色</h2>
        <p className="text-gray-300 mb-8">通过提供深刻记忆、喜好和天赋性格，初始化一个独特的灵魂</p>

        {/* 步骤指示器 */}
        <div className="flex items-center mb-8">
          {[1, 2, 3, 4].map((s) => (
            <React.Fragment key={s}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-colors ${
                s <= step ? 'bg-purple-600 text-white' : 'bg-white/20 text-gray-400'
              }`}>
                {s}
              </div>
              {s < 4 && (
                <div className={`flex-1 h-1 mx-2 transition-colors ${
                  s < step ? 'bg-purple-600' : 'bg-white/20'
                }`} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* 步骤 1: 基本信息 */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Sparkles className="inline w-4 h-4 mr-1" />
                角色名称
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="给你的角色起个名字..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                角色简介（可选）
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 h-24 resize-none"
                placeholder="简单描述一下这个角色..."
              />
            </div>
          </div>
        )}

        {/* 步骤 2: 深刻记忆 */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Brain className="inline w-4 h-4 mr-1" />
                深刻记忆
              </label>
              <p className="text-sm text-gray-400 mb-4">
                提供角色的深刻经历，这些记忆会塑造角色的性格和反应模式
              </p>
              {deepMemories.map((memory, index) => (
                <div key={index} className="flex gap-2 mb-3">
                  <textarea
                    value={memory}
                    onChange={(e) => updateMemory(index, e.target.value)}
                    className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 h-24 resize-none"
                    placeholder="例如：小时候第一次吃到抹茶蛋糕，那种苦涩又甜蜜的味道让我永远记住了..."
                  />
                  {deepMemories.length > 1 && (
                    <button
                      onClick={() => removeMemory(index)}
                      className="px-3 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={addMemory}
                className="flex items-center px-4 py-2 bg-purple-600/20 text-purple-300 rounded-lg hover:bg-purple-600/30 transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                添加记忆
              </button>
            </div>
          </div>
        )}

        {/* 步骤 3: 喜好 */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Heart className="inline w-4 h-4 mr-1" />
                喜好
              </label>
              <p className="text-sm text-gray-400 mb-4">
                定义角色的喜好，这些会影响角色的行为和反应
              </p>
              {preferences.map((pref, index) => (
                <div key={index} className="bg-white/5 rounded-lg p-4 mb-4 border border-white/10">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">喜好名称</label>
                      <input
                        type="text"
                        value={pref.name}
                        onChange={(e) => updatePreference(index, 'name', e.target.value)}
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="例如：抹茶蛋糕"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">类别</label>
                      <select
                        value={pref.category}
                        onChange={(e) => updatePreference(index, 'category', e.target.value)}
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      >
                        <option value="food">食物</option>
                        <option value="activity">活动</option>
                        <option value="item">物品</option>
                        <option value="place">地点</option>
                        <option value="personality">性格</option>
                        <option value="other">其他</option>
                      </select>
                    </div>
                  </div>
                  <div className="mb-4">
                    <label className="block text-xs text-gray-400 mb-1">描述</label>
                    <input
                      type="text"
                      value={pref.description}
                      onChange={(e) => updatePreference(index, 'description', e.target.value)}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="描述这个喜好..."
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex-1 mr-4">
                      <label className="block text-xs text-gray-400 mb-1">
                        强度: {(pref.intensity * 100).toFixed(0)}%
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={pref.intensity}
                        onChange={(e) => updatePreference(index, 'intensity', parseFloat(e.target.value))}
                        className="w-full"
                      />
                    </div>
                    {preferences.length > 1 && (
                      <button
                        onClick={() => removePreference(index)}
                        className="px-3 py-2 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
              <button
                onClick={addPreference}
                className="flex items-center px-4 py-2 bg-purple-600/20 text-purple-300 rounded-lg hover:bg-purple-600/30 transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                添加喜好
              </button>
            </div>
          </div>
        )}

        {/* 步骤 4: 天赋性格 */}
        {step === 4 && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Brain className="inline w-4 h-4 mr-1" />
                天赋性格
              </label>
              <p className="text-sm text-gray-400 mb-4">
                定义角色的先天性格特质，这些是天生的、难以改变的
              </p>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">性格特质（用逗号分隔）</label>
                  <input
                    type="text"
                    value={innateTraits}
                    onChange={(e) => setInnateTraits(e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="例如：内向, 敏感, 温柔"
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-400 mb-1">
                    情感反应强度: {(emotionalIntensity * 100).toFixed(0)}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={emotionalIntensity}
                    onChange={(e) => setEmotionalIntensity(parseFloat(e.target.value))}
                    className="w-full"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    越高表示角色对情感刺激的反应越强烈
                  </p>
                </div>

                <div>
                  <label className="block text-xs text-gray-400 mb-1">社交倾向</label>
                  <input
                    type="text"
                    value={socialTendency}
                    onChange={(e) => setSocialTendency(e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="例如：被动但渴望连接"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 导航按钮 */}
        <div className="flex justify-between mt-8">
          {step > 1 && (
            <button
              onClick={() => setStep(step - 1)}
              className="px-6 py-3 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
            >
              上一步
            </button>
          )}
          
          {step < 4 ? (
            <button
              onClick={() => setStep(step + 1)}
              disabled={!canProceed()}
              className={`px-6 py-3 rounded-lg transition-colors ml-auto ${
                canProceed()
                  ? 'bg-purple-600 text-white hover:bg-purple-700'
                  : 'bg-gray-600 text-gray-400 cursor-not-allowed'
              }`}
            >
              下一步
            </button>
          ) : (
            <button
              onClick={handleCreate}
              disabled={!canProceed() || isCreating}
              className={`px-6 py-3 rounded-lg transition-colors ml-auto ${
                canProceed() && !isCreating
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700'
                  : 'bg-gray-600 text-gray-400 cursor-not-allowed'
              }`}
            >
              {isCreating ? '创建中...' : '创建角色'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
