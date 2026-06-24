import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import characterRoutes from './routes/characterRoutes';
import chatRoutes from './routes/chatRoutes';
import userProfileRoutes from './routes/userProfileRoutes';

// 加载环境变量
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 路由
app.use('/api/characters', characterRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/characters/:characterId/user-profile', userProfileRoutes);

// 健康检查
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 错误处理
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('服务器错误:', err);
  res.status(500).json({ error: '服务器内部错误' });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`🚀 Soul Chat 服务器运行在 http://localhost:${PORT}`);
  console.log(`📚 API 文档:`);
  console.log(`   POST /api/characters     - 创建角色`);
  console.log(`   GET  /api/characters     - 获取角色列表`);
  console.log(`   GET  /api/characters/:id - 获取角色详情`);
  console.log(`   GET  /api/characters/:id/overview - 获取角色总览`);
  console.log(`   PUT  /api/characters/:id - 更新角色信息`);
  console.log(`   PUT  /api/characters/:id/memories - 更新角色记忆`);
  console.log(`   POST /api/chat/:characterId - 发送消息`);
  console.log(`   GET  /api/chat/:characterId/history - 获取聊天历史`);
  console.log(`   GET  /api/characters/:id/user-profile - 获取用户画像`);
  console.log(`   PUT  /api/characters/:id/user-profile - 更新用户画像`);
  console.log(`   POST /api/characters/:id/user-profile/preferences - 添加用户偏好`);
  console.log(`   POST /api/characters/:id/user-profile/traits - 添加用户特质`);
  console.log(`   POST /api/characters/:id/user-profile/memories - 添加用户记忆`);
});
