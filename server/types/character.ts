// 角色扮演架构核心类型定义

// ==================== 天赋系统 ====================

export interface Preference {
  id: string;
  name: string;
  description: string;
  intensity: number; // 0-1，喜好强度
  category: 'food' | 'activity' | 'item' | 'place' | 'personality' | 'other';
}

export interface InnatePersonality {
  traits: string[]; // 如 ["内向", "敏感", "乐观"]
  emotionalIntensity: number; // 0-1，情感反应强度
  socialTendency: string; // 社交倾向描述
}

export interface AcquiredPersonality {
  confidence: number; // 0-1
  outgoing: number; // 0-1
  cautious: number; // 0-1
  humor: number; // 0-1
  // 可扩展更多维度
}

export interface TalentSystem {
  preferences: Preference[];
  innatePersonality: InnatePersonality;
  acquiredPersonality: AcquiredPersonality;
}

// ==================== 记忆系统 ====================

export interface PreferenceMemory {
  id: string;
  relatedPreferenceId: string;
  event: string;
  location?: string;
  emotionalIntensity: number; // 0-10
  timestamp: Date;
  triggerWords: string[];
}

export interface EmotionalEventMemory {
  id: string;
  affectedTrait: string; // 影响的后天性格维度
  event: string;
  emotionalLabel: string;
  intensity: number; // 0-10
  timestamp: Date;
  impact: string; // 影响描述
}

export interface ShortTermMemory {
  currentTopic?: string;
  mentionedNames: string[];
  userEmotion?: string;
  sessionId: string;
  lastUpdated: Date;
}

export interface LongTermReinforcedMemory {
  id: string;
  type: 'language_habit' | 'reaction_pattern' | 'behavioral_routine';
  pattern: string;
  repetitionCount: number;
  automationLevel: number; // 0-1，自动化程度
}

export interface MemorySystem {
  preferenceMemories: PreferenceMemory[];
  emotionalEventMemories: EmotionalEventMemory[];
  shortTermMemory: ShortTermMemory;
  longTermReinforcedMemories: LongTermReinforcedMemory[];
}

// ==================== 心智层 ====================

export interface MindState {
  currentIntention: string;
  values: string[];
  emotionalState: string;
  goalStack: string[];
  decisionWeights: Record<string, number>;
}

// ==================== 表达层 ====================

export interface LanguageStyle {
  defaultTone: string;
  sentencePreference: string;
  symbolUsage: string;
  catchphrases: string[];
}

export interface ActionExpression {
  defaultPosture: string;
  happyActions: string[];
  shyActions: string[];
  sadActions: string[];
  angryActions: string[];
}

export interface ExpressionConfig {
  language: LanguageStyle;
  actions: ActionExpression;
  filterRules: string[];
}

// ==================== 用户画像 ====================

export interface UserPreference {
  id: string;
  name: string;
  description: string;
  category: string;
}

export interface UserTrait {
  id: string;
  name: string;
  description: string;
  intensity: number; // 0-1
}

export interface UserMemory {
  id: string;
  event: string;
  emotionalLabel: string;
  intensity: number;
  timestamp: Date;
  isImportant: boolean;
}

export interface UserRelationship {
  closeness: number; // 0-1，亲密度
  trustLevel: number; // 0-1，信任度
  interactionCount: number;
  firstMet: Date;
  lastInteraction: Date;
}

export interface UserProfile {
  id: string;
  characterId: string;
  name: string; // 用户对角色的称呼
  description: string; // 用户自定义描述
  preferences: UserPreference[];
  traits: UserTrait[];
  memories: UserMemory[];
  relationship: UserRelationship;
  createdAt: Date;
  updatedAt: Date;
}

// ==================== 完整角色 ====================

export interface Character {
  id: string;
  name: string;
  description: string;
  avatar?: string;
  talentSystem: TalentSystem;
  memorySystem: MemorySystem;
  mindState: MindState;
  expressionConfig: ExpressionConfig;
  createdAt: Date;
  updatedAt: Date;
}

// ==================== 聊天相关 ====================

export interface ChatMessage {
  id: string;
  role: 'user' | 'character';
  content: string;
  actions?: string[];
  expressions?: string[];
  timestamp: Date;
  metadata?: {
    subconsciousActivation?: SubconsciousActivation;
    mindDecision?: MindDecision;
    expressionGeneration?: ExpressionGeneration;
  };
}

export interface SubconsciousActivation {
  triggeredTalents: string[];
  activatedMemories: string[];
  currentAcquiredPersonality: string;
}

export interface MindDecision {
  valueJudgment: string;
  formedIntention: string;
  expressionStrategy: string;
}

export interface ExpressionGeneration {
  language: string;
  actions: string[];
  expressions: string[];
}

export interface ChatSession {
  id: string;
  characterId: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

// ==================== LLM 请求/响应 ====================

export interface LLMRequest {
  character: Character;
  userInput: string;
  chatHistory: ChatMessage[];
  userProfile?: UserProfile;
}

export interface LLMResponse {
  subconsciousActivation: SubconsciousActivation;
  mindDecision: MindDecision;
  expressionGeneration: ExpressionGeneration;
}

// ==================== 角色创建向导 ====================

export interface CharacterCreationInput {
  name: string;
  description?: string;
  deepMemories: string[]; // 深刻记忆（用户提供的经历）
  preferences: {
    name: string;
    description: string;
    intensity: number;
    category: Preference['category'];
  }[];
  innatePersonality: {
    traits: string[];
    emotionalIntensity: number;
    socialTendency: string;
  };
}

export interface CharacterOverview {
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

// ==================== 角色编辑输入 ====================

export interface CharacterEditInput {
  name?: string;
  description?: string;
  talentSystem?: {
    preferences?: Preference[];
    innatePersonality?: InnatePersonality;
    acquiredPersonality?: AcquiredPersonality;
  };
  expressionConfig?: ExpressionConfig;
}

// ==================== 记忆编辑输入 ====================

export interface MemoryEditInput {
  preferenceMemories?: PreferenceMemory[];
  emotionalEventMemories?: EmotionalEventMemory[];
  longTermReinforcedMemories?: LongTermReinforcedMemory[];
}

// ==================== 用户画像编辑输入 ====================

export interface UserProfileInput {
  name?: string;
  description?: string;
  preferences?: UserPreference[];
  traits?: UserTrait[];
  memories?: UserMemory[];
}
