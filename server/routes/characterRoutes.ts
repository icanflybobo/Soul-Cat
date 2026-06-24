import { Router } from 'express';
import { characterService } from '../services/characterService';
import { CharacterCreationInput, CharacterEditInput, MemoryEditInput } from '../types/character';

const router = Router();

/**
 * POST /api/characters
 * 创建角色（从用户输入初始化）
 */
router.post('/', async (req, res) => {
  try {
    const input: CharacterCreationInput = req.body;

    // 验证必填字段
    if (!input.name || !input.deepMemories || !input.preferences || !input.innatePersonality) {
      return res.status(400).json({
        error: '缺少必填字段',
        required: ['name', 'deepMemories', 'preferences', 'innatePersonality'],
      });
    }

    const character = await characterService.createCharacterFromInput(input);
    
    res.status(201).json({
      success: true,
      data: {
        id: character.id,
        name: character.name,
        description: character.description,
      },
    });
  } catch (error) {
    console.error('创建角色失败:', error);
    res.status(500).json({ error: '创建角色失败' });
  }
});

/**
 * GET /api/characters
 * 获取所有角色列表
 */
router.get('/', (req, res) => {
  try {
    const characters = characterService.getAllCharacters();
    res.json({
      success: true,
      data: characters.map(c => ({
        id: c.id,
        name: c.name,
        description: c.description,
        createdAt: c.createdAt,
      })),
    });
  } catch (error) {
    console.error('获取角色列表失败:', error);
    res.status(500).json({ error: '获取角色列表失败' });
  }
});

/**
 * GET /api/characters/:id
 * 获取角色详情
 */
router.get('/:id', (req, res) => {
  try {
    const character = characterService.getCharacter(req.params.id);
    
    if (!character) {
      return res.status(404).json({ error: '角色不存在' });
    }

    res.json({
      success: true,
      data: character,
    });
  } catch (error) {
    console.error('获取角色详情失败:', error);
    res.status(500).json({ error: '获取角色详情失败' });
  }
});

/**
 * GET /api/characters/:id/overview
 * 获取角色总览（用于展示和编辑）
 */
router.get('/:id/overview', (req, res) => {
  try {
    const overview = characterService.getCharacterOverview(req.params.id);
    
    if (!overview) {
      return res.status(404).json({ error: '角色不存在' });
    }

    res.json({
      success: true,
      data: overview,
    });
  } catch (error) {
    console.error('获取角色总览失败:', error);
    res.status(500).json({ error: '获取角色总览失败' });
  }
});

/**
 * PUT /api/characters/:id
 * 更新角色基本信息和天赋系统
 */
router.put('/:id', (req, res) => {
  try {
    const input: CharacterEditInput = req.body;
    const character = characterService.editCharacter(req.params.id, input);
    
    if (!character) {
      return res.status(404).json({ error: '角色不存在' });
    }

    res.json({
      success: true,
      data: character,
      message: '角色信息已更新',
    });
  } catch (error) {
    console.error('更新角色失败:', error);
    res.status(500).json({ error: '更新角色失败' });
  }
});

/**
 * PUT /api/characters/:id/memories
 * 更新角色记忆
 */
router.put('/:id/memories', (req, res) => {
  try {
    const input: MemoryEditInput = req.body;
    const character = characterService.editCharacterMemories(req.params.id, input);
    
    if (!character) {
      return res.status(404).json({ error: '角色不存在' });
    }

    res.json({
      success: true,
      data: character,
      message: '角色记忆已更新',
    });
  } catch (error) {
    console.error('更新角色记忆失败:', error);
    res.status(500).json({ error: '更新角色记忆失败' });
  }
});

/**
 * DELETE /api/characters/:id
 * 删除角色
 */
router.delete('/:id', (req, res) => {
  try {
    const success = characterService.deleteCharacter(req.params.id);
    
    if (!success) {
      return res.status(404).json({ error: '角色不存在' });
    }

    res.json({
      success: true,
      message: '角色已删除',
    });
  } catch (error) {
    console.error('删除角色失败:', error);
    res.status(500).json({ error: '删除角色失败' });
  }
});

export default router;
