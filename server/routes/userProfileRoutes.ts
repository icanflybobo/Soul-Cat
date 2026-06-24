import { Router } from 'express';
import { userProfileService } from '../services/userProfileService';
import { UserProfileInput } from '../types/character';

const router = Router({ mergeParams: true });

/**
 * GET /api/characters/:characterId/user-profile
 * 获取用户画像
 */
router.get('/', (req, res) => {
  try {
    const { characterId } = req.params;
    const profile = userProfileService.getOrCreateUserProfile(characterId);
    
    res.json({
      success: true,
      data: profile,
    });
  } catch (error) {
    console.error('获取用户画像失败:', error);
    res.status(500).json({ error: '获取用户画像失败' });
  }
});

/**
 * PUT /api/characters/:characterId/user-profile
 * 更新用户画像
 */
router.put('/', (req, res) => {
  try {
    const { characterId } = req.params;
    const input: UserProfileInput = req.body;
    
    const profile = userProfileService.updateUserProfile(characterId, input);
    
    if (!profile) {
      return res.status(404).json({ error: '用户画像不存在' });
    }

    res.json({
      success: true,
      data: profile,
      message: '用户画像已更新',
    });
  } catch (error) {
    console.error('更新用户画像失败:', error);
    res.status(500).json({ error: '更新用户画像失败' });
  }
});

/**
 * POST /api/characters/:characterId/user-profile/preferences
 * 添加用户偏好
 */
router.post('/preferences', (req, res) => {
  try {
    const { characterId } = req.params;
    const { name, description, category } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: '偏好名称不能为空' });
    }

    const profile = userProfileService.addUserPreference(characterId, {
      name,
      description: description || '',
      category: category || 'other',
    });

    res.json({
      success: true,
      data: profile,
      message: '用户偏好已添加',
    });
  } catch (error) {
    console.error('添加用户偏好失败:', error);
    res.status(500).json({ error: '添加用户偏好失败' });
  }
});

/**
 * POST /api/characters/:characterId/user-profile/traits
 * 添加用户特质
 */
router.post('/traits', (req, res) => {
  try {
    const { characterId } = req.params;
    const { name, description, intensity } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: '特质名称不能为空' });
    }

    const profile = userProfileService.addUserTrait(characterId, {
      name,
      description: description || '',
      intensity: intensity || 0.5,
    });

    res.json({
      success: true,
      data: profile,
      message: '用户特质已添加',
    });
  } catch (error) {
    console.error('添加用户特质失败:', error);
    res.status(500).json({ error: '添加用户特质失败' });
  }
});

/**
 * POST /api/characters/:characterId/user-profile/memories
 * 添加关于用户的记忆
 */
router.post('/memories', (req, res) => {
  try {
    const { characterId } = req.params;
    const { event, emotionalLabel, intensity, isImportant } = req.body;
    
    if (!event) {
      return res.status(400).json({ error: '记忆内容不能为空' });
    }

    const profile = userProfileService.addUserMemory(characterId, {
      event,
      emotionalLabel: emotionalLabel || '中性',
      intensity: intensity || 5,
      timestamp: new Date(),
      isImportant: isImportant || false,
    });

    res.json({
      success: true,
      data: profile,
      message: '用户记忆已添加',
    });
  } catch (error) {
    console.error('添加用户记忆失败:', error);
    res.status(500).json({ error: '添加用户记忆失败' });
  }
});

/**
 * PUT /api/characters/:characterId/user-profile/relationship
 * 更新关系状态
 */
router.put('/relationship', (req, res) => {
  try {
    const { characterId } = req.params;
    const updates = req.body;
    
    const profile = userProfileService.updateRelationship(characterId, updates);

    res.json({
      success: true,
      data: profile,
      message: '关系状态已更新',
    });
  } catch (error) {
    console.error('更新关系状态失败:', error);
    res.status(500).json({ error: '更新关系状态失败' });
  }
});

export default router;
