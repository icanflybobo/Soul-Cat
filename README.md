# Soul Chat - 灵魂聊天

基于"心智/潜意识/表达"三层架构的角色扮演聊天应用。

## 核心特性

- **三层架构**：心智层（主观决策）、潜意识层（记忆与本能）、表达层（行为与语言输出）
- **天赋系统**：喜好（固定）、天赋性格（固定）、后天性格（可随经历变化）
- **记忆系统**：喜好关联记忆、情感事件记忆、短时记忆、长久反复记忆
- **单次LLM调用**：所有三层逻辑在单次推理中完成，优化性能
- **异步记忆更新**：记忆沉淀和性格演化在后台处理，不阻塞回复

## 技术栈

- **前端**：React + TypeScript + Tailwind CSS + Vite
- **后端**：Node.js + Express + TypeScript
- **LLM**：OpenAI API（支持自定义 baseURL）

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

```bash
cp .env.example .env
# 编辑 .env 文件，填入你的 OpenAI API Key
```

### 3. 启动开发服务器

```bash
# 同时启动前端和后端
npm run dev

# 或分别启动
npm run dev:server  # 后端 http://localhost:3001
npm run dev:client  # 前端 http://localhost:3000
```

### 4. 使用应用

1. 访问 http://localhost:3000
2. 点击"创建角色"，填写角色信息：
   - **基本信息**：角色名称和简介
   - **深刻记忆**：角色的重要经历（如"小时候第一次吃到抹茶蛋糕..."）
   - **喜好**：角色的偏好（食物、活动、物品等）
   - **天赋性格**：先天性格特质（内向、敏感、温柔等）
3. 创建完成后查看角色总览，可以编辑或开始聊天
4. 在聊天界面，可以开启"显示内心活动"查看角色的三层推理过程

## API 文档

### 角色管理

- `POST /api/characters` - 创建角色
- `GET /api/characters` - 获取角色列表
- `GET /api/characters/:id` - 获取角色详情
- `GET /api/characters/:id/overview` - 获取角色总览
- `PUT /api/characters/:id` - 更新角色
- `DELETE /api/characters/:id` - 删除角色

### 聊天

- `POST /api/chat/:characterId` - 发送消息
- `GET /api/chat/:characterId/history` - 获取聊天历史

## 项目结构

```
soul-chat/
├── server/                 # 后端代码
│   ├── index.ts           # 服务器入口
│   ├── types/             # TypeScript 类型定义
│   │   └── character.ts   # 角色相关类型
│   ├── services/          # 业务逻辑
│   │   ├── characterService.ts  # 角色服务
│   │   └── llmService.ts        # LLM 服务
│   └── routes/            # API 路由
│       ├── characterRoutes.ts
│       └── chatRoutes.ts
├── src/                   # 前端代码
│   ├── main.tsx          # 应用入口
│   ├── App.tsx           # 根组件
│   └── components/       # React 组件
│       ├── CharacterCreation.tsx   # 角色创建向导
│       ├── CharacterList.tsx       # 角色列表
│       ├── CharacterOverview.tsx   # 角色总览
│       └── ChatInterface.tsx       # 聊天界面
├── .env.example          # 环境变量示例
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## 架构说明

### 三层核心模块

1. **心智层（心）**：主观决策引擎
   - 意图生成、价值判断、目标管理
   - 受潜意识层影响

2. **潜意识层**：记忆与本能反应引擎
   - **天赋系统**：喜好（固定）、天赋性格（固定）、后天性格（可变）
   - **记忆系统**：喜好关联记忆、情感事件记忆、短时记忆、长久反复记忆

3. **表达层**：行为与语言输出
   - 语言和动作统一驱动
   - 由心智或潜意识驱动

### 性能优化

- **单次LLM调用**：三层逻辑在单次推理中完成
- **Prefix Caching**：静态角色设定预计算缓存
- **异步记忆更新**：记忆沉淀不阻塞主流程

## 许可证

MIT
