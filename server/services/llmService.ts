import OpenAI from 'openai';
import {
  Character,
  ChatMessage,
  LLMResponse,
  SubconsciousActivation,
  MindDecision,
  ExpressionGeneration,
  UserProfile,
} from '../types/character';
import { userProfileService } from './userProfileService';

/**
 * LLM 服务 - 处理与语言模型的交互
 * 核心：单次调用完成潜意识激活 + 心智决策 + 表达生成
 */
export class LLMService {
  private client: OpenAI;

  constructor() {
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || 'your-api-key',
      baseURL: process.env.OPENAI_BASE_URL,
    });
  }

  /**
   * 生成角色回复（单次调用）
   */
  async generateResponse(
    character: Character,
    userInput: string,
    chatHistory: ChatMessage[],
    userProfile?: UserProfile
  ): Promise<LLMResponse> {
    // 1. 组装 Prompt
    const prompt = this.assemblePrompt(character, userInput, chatHistory, userProfile);

    // 2. 单次 LLM 调用
    const completion = await this.client.chat.completions.create({
      model: process.env.LLM_MODEL || 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: prompt.systemPrompt,
        },
        {
          role: 'user',
          content: prompt.userPrompt,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.8,
      max_tokens: 1000,
    });

    // 3. 解析响应
    const content = completion.choices[0]?.message?.content || '{}';
    return this.parseResponse(content);
  }

  /**
   * 组装 Prompt
   */
  private assemblePrompt(
    character: Character,
    userInput: string,
    chatHistory: ChatMessage[],
    userProfile?: UserProfile
  ): { systemPrompt: string; userPrompt: string } {
    // 提取相关记忆（Top-K）
    const relevantMemories = this.selectRelevantMemories(character, userInput);

    // 构建用户画像文本
    const userProfileText = userProfile 
      ? userProfileService.getUserProfileForPrompt(character.id)
      : '';

    // 构建系统 Prompt（角色内核 + 三层架构 + 用户画像）
    const systemPrompt = `
【角色内核】
你是${character.name}，${character.description}。

【天赋性格】
核心特质：${character.talentSystem.innatePersonality.traits.join('、')}
情感反应强度：${(character.talentSystem.innatePersonality.emotionalIntensity * 100).toFixed(0)}%
社交倾向：${character.talentSystem.innatePersonality.socialTendency}

【喜好】
${character.talentSystem.preferences.map(p => `- ${p.name}（强度：${(p.intensity * 100).toFixed(0)}%）：${p.description}`).join('\n')}

【后天性格状态】
- 自信程度：${(character.talentSystem.acquiredPersonality.confidence * 100).toFixed(0)}%
- 开朗程度：${(character.talentSystem.acquiredPersonality.outgoing * 100).toFixed(0)}%
- 谨慎程度：${(character.talentSystem.acquiredPersonality.cautious * 100).toFixed(0)}%
- 幽默程度：${(character.talentSystem.acquiredPersonality.humor * 100).toFixed(0)}%

【相关记忆】
${relevantMemories.join('\n')}

${userProfileText ? `【用户画像】\n${userProfileText}\n` : ''}

【表达风格】
语气：${character.expressionConfig.language.defaultTone}
句式：${character.expressionConfig.language.sentencePreference}
口头禅：${character.expressionConfig.language.catchphrases.join('、')}

【动作习惯】
开心时：${character.expressionConfig.actions.happyActions.join('、')}
害羞时：${character.expressionConfig.actions.shyActions.join('、')}
难过时：${character.expressionConfig.actions.sadActions.join('、')}

【规则】
1. 你必须完全代入角色，用第一人称思考
2. 你的回复要体现"潜意识→心智→表达"的完整过程
3. 语言风格必须符合角色设定
4. 适当加入动作和表情描述
5. 保持自然，不要机械
${userProfile ? '6. 记住用户的信息，在回复中体现对用户的了解和关心' : ''}
`;

    // 构建用户 Prompt（当前对话上下文）
    const historyText = chatHistory
      .slice(-5)
      .map(msg => `${msg.role === 'user' ? '用户' : character.name}：${msg.content}`)
      .join('\n');

    const userPrompt = `
${historyText ? '【对话历史】\n' + historyText + '\n\n' : ''}
【用户输入】
${userInput}

请基于你的内心活动和性格状态，生成回复。输出JSON格式：
{
  "subconsciousActivation": {
    "triggeredTalents": ["触发的天赋/本能"],
    "activatedMemories": ["激活的记忆"],
    "currentAcquiredPersonality": "当前后天性格状态描述"
  },
  "mindDecision": {
    "valueJudgment": "价值判断",
    "formedIntention": "形成的意图",
    "expressionStrategy": "表达策略"
  },
  "expressionGeneration": {
    "language": "回复语言（包含动作和表情描述）",
    "actions": ["动作1", "动作2"],
    "expressions": ["表情1", "表情2"]
  }
}
`;

    return { systemPrompt, userPrompt };
  }

  /**
   * 选择相关记忆（Top-K）
   */
  private selectRelevantMemories(character: Character, userInput: string): string[] {
    const memories: string[] = [];

    // 1. 短时记忆
    if (character.memorySystem.shortTermMemory.currentTopic) {
      memories.push(`[当前话题] ${character.memorySystem.shortTermMemory.currentTopic}`);
    }

    // 2. 喜好关联记忆（Top 2）
    const prefMemories = character.memorySystem.preferenceMemories
      .filter(pm => pm.triggerWords.some(word => userInput.includes(word)))
      .slice(0, 2);
    
    for (const pm of prefMemories) {
      memories.push(`[喜好记忆] ${pm.event}（情感强度：${pm.emotionalIntensity.toFixed(1)}）`);
    }

    // 3. 情感事件记忆（Top 2）
    const emotionalMemories = character.memorySystem.emotionalEventMemories
      .slice(0, 2);
    
    for (const em of emotionalMemories) {
      memories.push(`[情感记忆] ${em.event}（${em.emotionalLabel}，强度：${em.intensity.toFixed(1)}）`);
    }

    // 4. 长久反复记忆
    const activeHabits = character.memorySystem.longTermReinforcedMemories
      .filter(hm => hm.automationLevel > 0.8)
      .slice(0, 2);
    
    for (const hm of activeHabits) {
      memories.push(`[习惯] ${hm.pattern}（自动化程度：${(hm.automationLevel * 100).toFixed(0)}%）`);
    }

    return memories;
  }

  /**
   * 解析 LLM 响应
   */
  private parseResponse(content: string): LLMResponse {
    try {
      const parsed = JSON.parse(content);

      return {
        subconsciousActivation: {
          triggeredTalents: parsed.subconsciousActivation?.triggeredTalents || [],
          activatedMemories: parsed.subconsciousActivation?.activatedMemories || [],
          currentAcquiredPersonality: parsed.subconsciousActivation?.currentAcquiredPersonality || '',
        },
        mindDecision: {
          valueJudgment: parsed.mindDecision?.valueJudgment || '',
          formedIntention: parsed.mindDecision?.formedIntention || '',
          expressionStrategy: parsed.mindDecision?.expressionStrategy || '',
        },
        expressionGeneration: {
          language: parsed.expressionGeneration?.language || '...',
          actions: parsed.expressionGeneration?.actions || [],
          expressions: parsed.expressionGeneration?.expressions || [],
        },
      };
    } catch (error) {
      console.error('解析 LLM 响应失败:', error);
      return {
        subconsciousActivation: {
          triggeredTalents: [],
          activatedMemories: [],
          currentAcquiredPersonality: '',
        },
        mindDecision: {
          valueJudgment: '',
          formedIntention: '',
          expressionStrategy: '',
        },
        expressionGeneration: {
          language: content,
          actions: [],
          expressions: [],
        },
      };
    }
  }

  /**
   * 异步更新记忆（后台任务）
   */
  async updateMemoriesAsync(
    character: Character,
    userInput: string,
    response: LLMResponse
  ): Promise<void> {
    // 1. 更新短时记忆
    character.memorySystem.shortTermMemory.lastUpdated = new Date();
    
    // 2. 判断是否为情感事件
    const emotionalWords = ['害怕', '恐惧', '开心', '难过', '愤怒', '感动', '惊喜', '失望', '喜欢', '讨厌'];
    const isEmotional = emotionalWords.some(word => 
      userInput.includes(word) || response.expressionGeneration.language.includes(word)
    );
    
    if (isEmotional) {
      console.log('检测到情感事件，已记录');
    }

    // 3. 更新长久反复记忆
    console.log('检查长久反复记忆模式');

    // 4. 微调后天性格
    console.log('微调后天性格');
  }
}

// 导出单例
export const llmService = new LLMService();
