import fs from 'fs';
import path from 'path';
import { Character, ChatSession, UserProfile } from '../types/character';

const DATA_DIR = path.join(process.cwd(), 'data');
const CHARACTERS_FILE = path.join(DATA_DIR, 'characters.json');
const CHAT_SESSIONS_FILE = path.join(DATA_DIR, 'chat_sessions.json');
const USER_PROFILES_FILE = path.join(DATA_DIR, 'user_profiles.json');

/**
 * 存储服务 - 负责数据的持久化存储
 * 使用 JSON 文件存储，后续可替换为数据库
 */
export class StorageService {
  private characters: Map<string, Character> = new Map();
  private chatSessions: Map<string, ChatSession> = new Map();
  private userProfiles: Map<string, UserProfile> = new Map();
  private initialized: boolean = false;

  constructor() {
    this.ensureDataDir();
    this.loadAll();
  }

  private ensureDataDir() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  }

  private loadAll() {
    this.loadCharacters();
    this.loadChatSessions();
    this.loadUserProfiles();
    this.initialized = true;
    console.log('✅ 数据加载完成');
  }

  // ==================== 角色存储 ====================

  private loadCharacters() {
    try {
      if (fs.existsSync(CHARACTERS_FILE)) {
        const data = fs.readFileSync(CHARACTERS_FILE, 'utf-8');
        const characters: Character[] = JSON.parse(data);
        for (const char of characters) {
          // 恢复 Date 对象
          char.createdAt = new Date(char.createdAt);
          char.updatedAt = new Date(char.updatedAt);
          char.memorySystem.preferenceMemories.forEach(m => m.timestamp = new Date(m.timestamp));
          char.memorySystem.emotionalEventMemories.forEach(m => m.timestamp = new Date(m.timestamp));
          char.memorySystem.shortTermMemory.lastUpdated = new Date(char.memorySystem.shortTermMemory.lastUpdated);
          this.characters.set(char.id, char);
        }
        console.log(`📚 已加载 ${characters.length} 个角色`);
      }
    } catch (error) {
      console.error('加载角色数据失败:', error);
    }
  }

  saveCharacters() {
    try {
      const characters = Array.from(this.characters.values());
      fs.writeFileSync(CHARACTERS_FILE, JSON.stringify(characters, null, 2), 'utf-8');
      console.log(`💾 已保存 ${characters.length} 个角色`);
    } catch (error) {
      console.error('保存角色数据失败:', error);
    }
  }

  // ==================== 聊天会话存储 ====================

  private loadChatSessions() {
    try {
      if (fs.existsSync(CHAT_SESSIONS_FILE)) {
        const data = fs.readFileSync(CHAT_SESSIONS_FILE, 'utf-8');
        const sessions: ChatSession[] = JSON.parse(data);
        for (const session of sessions) {
          session.createdAt = new Date(session.createdAt);
          session.updatedAt = new Date(session.updatedAt);
          session.messages.forEach(m => m.timestamp = new Date(m.timestamp));
          this.chatSessions.set(session.id, session);
        }
        console.log(`💬 已加载 ${sessions.length} 个聊天会话`);
      }
    } catch (error) {
      console.error('加载聊天会话失败:', error);
    }
  }

  saveChatSessions() {
    try {
      const sessions = Array.from(this.chatSessions.values());
      fs.writeFileSync(CHAT_SESSIONS_FILE, JSON.stringify(sessions, null, 2), 'utf-8');
      console.log(`💾 已保存 ${sessions.length} 个聊天会话`);
    } catch (error) {
      console.error('保存聊天会话失败:', error);
    }
  }

  // ==================== 用户画像存储 ====================

  private loadUserProfiles() {
    try {
      if (fs.existsSync(USER_PROFILES_FILE)) {
        const data = fs.readFileSync(USER_PROFILES_FILE, 'utf-8');
        const profiles: UserProfile[] = JSON.parse(data);
        for (const profile of profiles) {
          profile.createdAt = new Date(profile.createdAt);
          profile.updatedAt = new Date(profile.updatedAt);
          this.userProfiles.set(profile.id, profile);
        }
        console.log(`👤 已加载 ${profiles.length} 个用户画像`);
      }
    } catch (error) {
      console.error('加载用户画像失败:', error);
    }
  }

  saveUserProfiles() {
    try {
      const profiles = Array.from(this.userProfiles.values());
      fs.writeFileSync(USER_PROFILES_FILE, JSON.stringify(profiles, null, 2), 'utf-8');
      console.log(`💾 已保存 ${profiles.length} 个用户画像`);
    } catch (error) {
      console.error('保存用户画像失败:', error);
    }
  }

  // ==================== 角色 CRUD ====================

  getCharacter(id: string): Character | undefined {
    return this.characters.get(id);
  }

  getAllCharacters(): Character[] {
    return Array.from(this.characters.values());
  }

  saveCharacter(character: Character) {
    this.characters.set(character.id, character);
    this.saveCharacters();
  }

  deleteCharacter(id: string): boolean {
    const result = this.characters.delete(id);
    if (result) this.saveCharacters();
    return result;
  }

  // ==================== 聊天会话 CRUD ====================

  getChatSession(id: string): ChatSession | undefined {
    return this.chatSessions.get(id);
  }

  getChatSessionsByCharacter(characterId: string): ChatSession[] {
    return Array.from(this.chatSessions.values())
      .filter(s => s.characterId === characterId);
  }

  saveChatSession(session: ChatSession) {
    this.chatSessions.set(session.id, session);
    this.saveChatSessions();
  }

  deleteChatSession(id: string): boolean {
    const result = this.chatSessions.delete(id);
    if (result) this.saveChatSessions();
    return result;
  }

  // ==================== 用户画像 CRUD ====================

  getUserProfile(id: string): UserProfile | undefined {
    return this.userProfiles.get(id);
  }

  getUserProfileByCharacter(characterId: string): UserProfile | undefined {
    return Array.from(this.userProfiles.values())
      .find(p => p.characterId === characterId);
  }

  saveUserProfile(profile: UserProfile) {
    this.userProfiles.set(profile.id, profile);
    this.saveUserProfiles();
  }

  deleteUserProfile(id: string): boolean {
    const result = this.userProfiles.delete(id);
    if (result) this.saveUserProfiles();
    return result;
  }
}

// 导出单例
export const storageService = new StorageService();
