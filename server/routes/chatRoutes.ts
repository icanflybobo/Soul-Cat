import { Router } from 'express';
import { characterService } from '../services/characterService';
import { llmService } from '../services/llmService';
import { userProfileService } from '../services/userProfileService';
import { storageService } from '../services/storageService';
import { ChatMessage, ChatSession } from '../types/character';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// 内存中的聊天会话存储（生产环境应使用数据库）
const chatSessions: Map<string, ChatSession> = new Map();

/**
 * POST /api/chat/:characterId
 * 发送消息并获取角色回复
 */
router.post('/:characterId', async (req, res) => {
  try {
    const { characterId } = req.params;
    const { message, sessionId } = req.body;

    if (!message) {
      return res.status(400).json({ error: '消息内容不能为空' });
    }

    // 获取角色
    const character = characterService.getCharacter(characterId);
    if (!character) {
      return res.status(404).json({ error: '角色不存在' });
    }

    // 获取用户画像
    const userProfile = userProfileService.getOrCreateUserProfile(characterId);

    // 获取或创建聊天会话
    let session: ChatSession;
    if (sessionId && chatSessions.has(sessionId)) {
      session = chatSessions.get(sessionId)!;
    } else {
      session = {
        id: uuidv4(),
        characterId,
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      chatSessions.set(session.id, session);
    }

    // 添加用户消息
    const userMessage: ChatMessage = {
      id: uuidv4(),
      role: 'user',
      content: message,
      timestamp: new Date(),
    };
    session.messages.push(userMessage);

    // 调用 LLM 生成回复（单次调用，传入用户画像）
    const llmResponse = await llmService.generateResponse(
      character,
      message,
      session.messages,
      userProfile
    );

    // 添加角色回复
    const characterMessage: ChatMessage = {
      id: uuidv4(),
      role: 'character',
      content: llmResponse.expressionGeneration.language,
      actions: llmResponse.expressionGeneration.actions,
      expressions: llmResponse.expressionGeneration.expressions,
      timestamp: new Date(),
      metadata: {
        subconsciousActivation: llmResponse.subconsciousActivation,
        mindDecision: llmResponse.mindDecision,
        expressionGeneration: llmResponse.expressionGeneration,
      },
    };
    session.messages.push(characterMessage);
    session.updatedAt = new Date();

    // 保存聊天会话
    storageService.saveChatSession(session);

    // 记录互动（更新关系状态）
    userProfileService.recordInteraction(characterId);

    // 异步更新记忆（不阻塞响应）
    llmService.updateMemoriesAsync(character, message, llmResponse).catch(err => {
      console.error('异步更新记忆失败:', err);
    });

    res.json({
      success: true,
      data: {
        sessionId: session.id,
        message: characterMessage,
        debug: {
          subconsciousActivation: llmResponse.subconsciousActivation,
          mindDecision: llmResponse.mindDecision,
        },
      },
    });
  } catch (error) {
    console.error('聊天处理失败:', error);
    res.status(500).json({ error: '聊天处理失败' });
  }
});

/**
 * GET /api/chat/:characterId/history
 * 获取聊天历史
 */
router.get('/:characterId/history', (req, res) => {
  try {
    const { characterId } = req.params;
    const { sessionId } = req.query;

    if (sessionId && chatSessions.has(sessionId as string)) {
      const session = chatSessions.get(sessionId as string)!;
      res.json({
        success: true,
        data: {
          sessionId: session.id,
          messages: session.messages,
        },
      });
    } else {
      // 尝试从存储加载
      const sessions = storageService.getChatSessionsByCharacter(characterId);
      if (sessions.length > 0) {
        const session = sessions[0];
        chatSessions.set(session.id, session);
        res.json({
          success: true,
          data: {
            sessionId: session.id,
            messages: session.messages,
          },
        });
      } else {
        res.json({
          success: true,
          data: {
            sessionId: null,
            messages: [],
          },
        });
      }
    }
  } catch (error) {
    console.error('获取聊天历史失败:', error);
    res.status(500).json({ error: '获取聊天历史失败' });
  }
});

/**
 * DELETE /api/chat/:sessionId
 * 删除聊天会话
 */
router.delete('/session/:sessionId', (req, res) => {
  try {
    const { sessionId } = req.params;
    const success = chatSessions.delete(sessionId);
    storageService.deleteChatSession(sessionId);
    
    if (!success) {
      return res.status(404).json({ error: '会话不存在' });
    }

    res.json({
      success: true,
      message: '会话已删除',
    });
  } catch (error) {
    console.error('删除会话失败:', error);
    res.status(500).json({ error: '删除会话失败' });
  }
});

export default router;
