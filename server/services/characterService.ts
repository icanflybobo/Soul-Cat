import { v4 as uuidv4 } from 'uuid';
import {
  Character,
  CharacterCreationInput,
  CharacterOverview,
  TalentSystem,
  MemorySystem,
  MindState,
  ExpressionConfig,
  Preference,
  PreferenceMemory,
  EmotionalEventMemory,
  AcquiredPersonality,
  CharacterEditInput,
  MemoryEditInput,
} from '../types/character';
import { storageService } from './storageService';

/**
 * 角色服务 - 处理角色的创建、初始化、更新和查询
 */
export class CharacterService {
  /**
   * 从用户输入创建角色（初始化流程）
   */
  async createCharacterFromInput(input: CharacterCreationInput): Promise<Character> {
    const id = uuidv4();
    const now = new Date();

    // 1. 构建天赋系统
    const talentSystem = this.buildTalentSystem(input);

    // 2. 从深刻记忆构建记忆系统
    const memorySystem = this.buildMemorySystem(input, id);

    // 3. 初始化心智层
    const mindState = this.initializeMindState(input);

    // 4. 初始化表达层（基于天赋性格）
    const expressionConfig = this.initializeExpressionConfig(input);

    const character: Character = {
      id,
      name: input.name,
      description: input.description || '',
      talentSystem,
      memorySystem,
      mindState,
      expressionConfig,
      createdAt: now,
      updatedAt: now,
    };

    // 持久化存储
    storageService.saveCharacter(character);
    return character;
  }

  /**
   * 构建天赋系统
   */
  private buildTalentSystem(input: CharacterCreationInput): TalentSystem {
    const preferences: Preference[] = input.preferences.map((pref) => ({
      id: uuidv4(),
      name: pref.name,
      description: pref.description,
      intensity: pref.intensity,
      category: pref.category,
    }));

    const innatePersonality = {
      traits: input.innatePersonality.traits,
      emotionalIntensity: input.innatePersonality.emotionalIntensity,
      socialTendency: input.innatePersonality.socialTendency,
    };

    // 后天性格初始值（基于天赋性格计算）
    const acquiredPersonality = this.calculateInitialAcquiredPersonality(
      input.innatePersonality.traits
    );

    return {
      preferences,
      innatePersonality,
      acquiredPersonality,
    };
  }

  /**
   * 计算初始后天性格
   */
  private calculateInitialAcquiredPersonality(traits: string[]): AcquiredPersonality {
    const traitSet = new Set(traits.map(t => t.toLowerCase()));

    return {
      confidence: traitSet.has('自信') || traitSet.has('开朗') ? 0.7 : 0.4,
      outgoing: traitSet.has('外向') || traitSet.has('开朗') ? 0.7 : 0.3,
      cautious: traitSet.has('谨慎') || traitSet.has('内向') ? 0.7 : 0.4,
      humor: traitSet.has('幽默') || traitSet.has('风趣') ? 0.6 : 0.3,
    };
  }

  /**
   * 从深刻记忆构建记忆系统
   */
  private buildMemorySystem(input: CharacterCreationInput, characterId: string): MemorySystem {
    const preferenceMemories: PreferenceMemory[] = [];
    const emotionalEventMemories: EmotionalEventMemory[] = [];

    for (const memory of input.deepMemories) {
      // 检查是否与喜好相关
      for (const pref of input.preferences) {
        if (memory.includes(pref.name) || memory.includes(pref.description)) {
          preferenceMemories.push({
            id: uuidv4(),
            relatedPreferenceId: pref.name,
            event: memory,
            emotionalIntensity: 7 + Math.random() * 3,
            timestamp: new Date(),
            triggerWords: [pref.name, ...pref.description.split(' ')],
          });
        }
      }

      // 检查是否为情感事件
      const emotionalWords = ['害怕', '恐惧', '开心', '难过', '愤怒', '感动', '惊喜', '失望'];
      const hasEmotionalWord = emotionalWords.some(word => memory.includes(word));
      
      if (hasEmotionalWord || memory.length > 50) {
        const emotionalLabel = this.extractEmotionalLabel(memory);
        
        emotionalEventMemories.push({
          id: uuidv4(),
          affectedTrait: this.inferAffectedTrait(memory, input.innatePersonality.traits),
          event: memory,
          emotionalLabel,
          intensity: 6 + Math.random() * 4,
          timestamp: new Date(),
          impact: this.generateImpactDescription(memory, emotionalLabel),
        });
      }
    }

    return {
      preferenceMemories,
      emotionalEventMemories,
      shortTermMemory: {
        mentionedNames: [],
        sessionId: characterId,
        lastUpdated: new Date(),
      },
      longTermReinforcedMemories: [],
    };
  }

  private extractEmotionalLabel(memory: string): string {
    const emotionalMap: Record<string, string[]> = {
      '正面': ['开心', '快乐', '感动', '惊喜', '幸福', '满足'],
      '负面': ['害怕', '恐惧', '难过', '愤怒', '失望', '痛苦'],
      '中性': ['平静', '普通', '一般'],
    };

    for (const [label, words] of Object.entries(emotionalMap)) {
      if (words.some(word => memory.includes(word))) {
        return label;
      }
    }
    return '中性';
  }

  private inferAffectedTrait(memory: string, innateTraits: string[]): string {
    if (memory.includes('害怕') || memory.includes('恐惧')) return 'confidence';
    if (memory.includes('开心') || memory.includes('快乐')) return 'outgoing';
    if (memory.includes('愤怒') || memory.includes('失望')) return 'cautious';
    if (memory.includes('幽默') || memory.includes('风趣')) return 'humor';
    if (innateTraits.some(t => t.includes('内向'))) return 'outgoing';
    if (innateTraits.some(t => t.includes('敏感'))) return 'confidence';
    return 'confidence';
  }

  private generateImpactDescription(memory: string, emotionalLabel: string): string {
    if (emotionalLabel === '正面') return '这段经历让角色更加积极向上';
    if (emotionalLabel === '负面') return '这段经历让角色变得更加谨慎';
    return '这段经历对角色产生了潜移默化的影响';
  }

  private initializeMindState(input: CharacterCreationInput): MindState {
    return {
      currentIntention: '与用户建立良好的关系',
      values: ['真诚', '友善', '尊重'],
      emotionalState: '平静',
      goalStack: ['了解用户需求', '提供情感支持', '保持角色一致性'],
      decisionWeights: {
        userPreference: 0.8,
        characterConsistency: 0.9,
        emotionalAppropriateness: 0.7,
      },
    };
  }

  private initializeExpressionConfig(input: CharacterCreationInput): ExpressionConfig {
    const traits = input.innatePersonality.traits;
    const traitSet = new Set(traits.map(t => t.toLowerCase()));

    const isOutgoing = traitSet.has('外向') || traitSet.has('开朗');
    const isShy = traitSet.has('内向') || traitSet.has('害羞');
    const isGentle = traitSet.has('温柔') || traitSet.has('体贴');

    return {
      language: {
        defaultTone: isGentle ? '温柔亲切' : isOutgoing ? '活泼热情' : '平和自然',
        sentencePreference: isShy ? '短句为主，偶尔停顿' : '长短句结合',
        symbolUsage: isOutgoing ? '适度使用emoji和感叹号' : '适度使用emoji',
        catchphrases: this.generateCatchphrases(traits),
      },
      actions: {
        defaultPosture: isShy ? '双手交叠，微微低头' : '自然站立，面带微笑',
        happyActions: ['微笑', '眼睛弯成月牙', '轻轻拍手'],
        shyActions: ['手指绕圈', '眼神躲闪', '低头'],
        sadActions: ['低头', '手指绞衣角', '眼眶微红'],
        angryActions: ['皱眉', '双手抱胸', '转身'],
      },
      filterRules: [
        '禁止出现机械感过重的表述',
        '保持角色一致性',
        '根据用户情绪调整语气',
        '动作与语言情绪一致',
      ],
    };
  }

  private generateCatchphrases(traits: string[]): string[] {
    const phrases: string[] = [];
    const traitSet = new Set(traits.map(t => t.toLowerCase()));

    if (traitSet.has('温柔') || traitSet.has('体贴')) {
      phrases.push('呢~', '呀');
    }
    if (traitSet.has('活泼') || traitSet.has('开朗')) {
      phrases.push('嘿嘿', '哈哈');
    }
    if (traitSet.has('内向') || traitSet.has('害羞')) {
      phrases.push('那个...', '嗯...');
    }

    return phrases.length > 0 ? phrases : ['嗯', '呢'];
  }

  // ==================== 角色编辑功能 ====================

  /**
   * 编辑角色基本信息和天赋系统
   */
  editCharacter(characterId: string, input: CharacterEditInput): Character | null {
    const character = storageService.getCharacter(characterId);
    if (!character) return null;

    // 更新基本信息
    if (input.name !== undefined) character.name = input.name;
    if (input.description !== undefined) character.description = input.description;

    // 更新天赋系统
    if (input.talentSystem) {
      if (input.talentSystem.preferences) {
        character.talentSystem.preferences = input.talentSystem.preferences;
      }
      if (input.talentSystem.innatePersonality) {
        character.talentSystem.innatePersonality = input.talentSystem.innatePersonality;
      }
      if (input.talentSystem.acquiredPersonality) {
        character.talentSystem.acquiredPersonality = input.talentSystem.acquiredPersonality;
      }
    }

    // 更新表达层
    if (input.expressionConfig) {
      character.expressionConfig = input.expressionConfig;
    }

    character.updatedAt = new Date();
    storageService.saveCharacter(character);
    return character;
  }

  /**
   * 编辑角色记忆
   */
  editCharacterMemories(characterId: string, input: MemoryEditInput): Character | null {
    const character = storageService.getCharacter(characterId);
    if (!character) return null;

    if (input.preferenceMemories) {
      character.memorySystem.preferenceMemories = input.preferenceMemories;
    }
    if (input.emotionalEventMemories) {
      character.memorySystem.emotionalEventMemories = input.emotionalEventMemories;
    }
    if (input.longTermReinforcedMemories) {
      character.memorySystem.longTermReinforcedMemories = input.longTermReinforcedMemories;
    }

    character.updatedAt = new Date();
    storageService.saveCharacter(character);
    return character;
  }

  // ==================== 查询功能 ====================

  getCharacterOverview(characterId: string): CharacterOverview | null {
    const character = storageService.getCharacter(characterId);
    if (!character) return null;

    return {
      id: character.id,
      name: character.name,
      description: character.description,
      talentSummary: {
        preferences: character.talentSystem.preferences.map(p => p.name),
        innateTraits: character.talentSystem.innatePersonality.traits,
        acquiredTraits: {
          自信: character.talentSystem.acquiredPersonality.confidence,
          开朗: character.talentSystem.acquiredPersonality.outgoing,
          谨慎: character.talentSystem.acquiredPersonality.cautious,
          幽默: character.talentSystem.acquiredPersonality.humor,
        },
      },
      memorySummary: {
        preferenceMemoryCount: character.memorySystem.preferenceMemories.length,
        emotionalEventCount: character.memorySystem.emotionalEventMemories.length,
        longTermHabitCount: character.memorySystem.longTermReinforcedMemories.length,
      },
      canEdit: true,
    };
  }

  getCharacter(characterId: string): Character | null {
    return storageService.getCharacter(characterId) || null;
  }

  getAllCharacters(): Character[] {
    return storageService.getAllCharacters();
  }

  deleteCharacter(characterId: string): boolean {
    return storageService.deleteCharacter(characterId);
  }
}

// 导出单例
export const characterService = new CharacterService();
