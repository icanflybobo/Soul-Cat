import { v4 as uuidv4 } from 'uuid';
import {
  UserProfile,
  UserProfileInput,
  UserPreference,
  UserTrait,
  UserMemory,
  UserRelationship,
} from '../types/character';
import { storageService } from './storageService';

/**
 * 用户画像服务 - 管理角色对用户的认知
 * 解决"角色会忘了用户信息"的问题
 */
export class UserProfileService {
  /**
   * 获取或创建用户画像
   */
  getOrCreateUserProfile(characterId: string): UserProfile {
    let profile = storageService.getUserProfileByCharacter(characterId);
    
    if (!profile) {
      profile = this.createDefaultUserProfile(characterId);
      storageService.saveUserProfile(profile);
    }
    
    return profile;
  }

  /**
   * 创建默认用户画像
   */
  private createDefaultUserProfile(characterId: string): UserProfile {
    const now = new Date();
    
    return {
      id: uuidv4(),
      characterId,
      name: '用户',
      description: '',
      preferences: [],
      traits: [],
      memories: [],
      relationship: {
        closeness: 0.1,
        trustLevel: 0.1,
        interactionCount: 0,
        firstMet: now,
        lastInteraction: now,
      },
      createdAt: now,
      updatedAt: now,
    };
  }

  /**
   * 更新用户画像
   */
  updateUserProfile(characterId: string, input: UserProfileInput): UserProfile | null {
    let profile = this.getOrCreateUserProfile(characterId);
    
    if (input.name !== undefined) profile.name = input.name;
    if (input.description !== undefined) profile.description = input.description;
    if (input.preferences !== undefined) profile.preferences = input.preferences;
    if (input.traits !== undefined) profile.traits = input.traits;
    if (input.memories !== undefined) profile.memories = input.memories;
    
    profile.updatedAt = new Date();
    storageService.saveUserProfile(profile);
    return profile;
  }

  /**
   * 添加用户偏好
   */
  addUserPreference(characterId: string, preference: Omit<UserPreference, 'id'>): UserProfile {
    const profile = this.getOrCreateUserProfile(characterId);
    
    const newPreference: UserPreference = {
      id: uuidv4(),
      ...preference,
    };
    
    profile.preferences.push(newPreference);
    profile.updatedAt = new Date();
    storageService.saveUserProfile(profile);
    return profile;
  }

  /**
   * 添加用户特质
   */
  addUserTrait(characterId: string, trait: Omit<UserTrait, 'id'>): UserProfile {
    const profile = this.getOrCreateUserProfile(characterId);
    
    const newTrait: UserTrait = {
      id: uuidv4(),
      ...trait,
    };
    
    profile.traits.push(newTrait);
    profile.updatedAt = new Date();
    storageService.saveUserProfile(profile);
    return profile;
  }

  /**
   * 添加关于用户的记忆
   */
  addUserMemory(characterId: string, memory: Omit<UserMemory, 'id'>): UserProfile {
    const profile = this.getOrCreateUserProfile(characterId);
    
    const newMemory: UserMemory = {
      id: uuidv4(),
      ...memory,
    };
    
    profile.memories.push(newMemory);
    profile.updatedAt = new Date();
    storageService.saveUserProfile(profile);
    return profile;
  }

  /**
   * 更新关系状态
   */
  updateRelationship(characterId: string, updates: Partial<UserRelationship>): UserProfile {
    const profile = this.getOrCreateUserProfile(characterId);
    
    profile.relationship = {
      ...profile.relationship,
      ...updates,
      lastInteraction: new Date(),
    };
    
    profile.updatedAt = new Date();
    storageService.saveUserProfile(profile);
    return profile;
  }

  /**
   * 记录一次互动
   */
  recordInteraction(characterId: string): UserProfile {
    const profile = this.getOrCreateUserProfile(characterId);
    
    profile.relationship.interactionCount += 1;
    profile.relationship.lastInteraction = new Date();
    
    // 根据互动次数逐渐增加亲密度
    const newCloseness = Math.min(
      1.0,
      profile.relationship.closeness + 0.02
    );
    profile.relationship.closeness = newCloseness;
    
    // 根据互动次数逐渐增加信任度
    const newTrust = Math.min(
      1.0,
      profile.relationship.trustLevel + 0.01
    );
    profile.relationship.trustLevel = newTrust;
    
    profile.updatedAt = new Date();
    storageService.saveUserProfile(profile);
    return profile;
  }

  /**
   * 删除用户画像
   */
  deleteUserProfile(profileId: string): boolean {
    return storageService.deleteUserProfile(profileId);
  }

  /**
   * 获取用户画像（用于LLM Prompt）
   */
  getUserProfileForPrompt(characterId: string): string {
    const profile = this.getOrCreateUserProfile(characterId);
    
    const parts: string[] = [];
    
    // 基本信息
    parts.push(`【用户称呼】${profile.name}`);
    if (profile.description) {
      parts.push(`【用户描述】${profile.description}`);
    }
    
    // 关系状态
    parts.push(`【关系状态】`);
    parts.push(`- 亲密度：${(profile.relationship.closeness * 100).toFixed(0)}%`);
    parts.push(`- 信任度：${(profile.relationship.trustLevel * 100).toFixed(0)}%`);
    parts.push(`- 互动次数：${profile.relationship.interactionCount}`);
    
    // 用户偏好
    if (profile.preferences.length > 0) {
      parts.push(`【用户偏好】`);
      profile.preferences.forEach(pref => {
        parts.push(`- ${pref.name}：${pref.description}`);
      });
    }
    
    // 用户特质
    if (profile.traits.length > 0) {
      parts.push(`【用户特质】`);
      profile.traits.forEach(trait => {
        parts.push(`- ${trait.name}（强度：${(trait.intensity * 100).toFixed(0)}%）：${trait.description}`);
      });
    }
    
    // 重要记忆
    const importantMemories = profile.memories.filter(m => m.isImportant);
    if (importantMemories.length > 0) {
      parts.push(`【关于用户的重要记忆】`);
      importantMemories.forEach(mem => {
        parts.push(`- ${mem.event}（${mem.emotionalLabel}）`);
      });
    }
    
    return parts.join('\n');
  }
}

// 导出单例
export const userProfileService = new UserProfileService();
