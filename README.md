# 肉包 AI 应用聊天平台

<div align="center">

![React](https://img.shields.io/badge/React-18.2.0-blue?logo=react)
![Next.js](https://img.shields.io/badge/Next.js-14.2.15-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript)
![Ant Design](https://img.shields.io/badge/Ant%20Design-5.27.4-blue?logo=ant-design)
![License](https://img.shields.io/badge/License-MIT-green)

一个基于 Next.js 的现代化 AI 对话平台，支持多种 AI 模型集成、角色扮演、语音交互等功能

视频演示地址 https://www.bilibili.com/video/BV1o7nXzVEVm/?spm_id_from=333.1387.homepage.video_card.click&vd_source=9889d0ef5432d6b568bb0079110870e7
</div>

## ✨ 特性

- 🤖 **多 AI 模型支持** - 集成 OpenAI、Claude、讯飞星火等主流 AI 模型
- 🎭 **AI 角色扮演** - 支持自定义 AI 角色和智能体对话
- 🗣️ **语音交互** - 实时语音识别和文本转语音功能
- 💬 **流式对话** - 基于 SSE 的实时流式对话体验
- 👥 **用户管理** - 完整的用户认证和会话管理系统
- 📱 **响应式设计** - 完美适配桌面端和移动端
- 🎨 **现代化 UI** - 基于Semi UI 的精美界面
- 🔧 **可视化配置** - 直观的 AI 模型和参数配置管理

## 🚀 快速开始

### 环境要求

- Node.js >= 18.0.0
- npm >= 8.0.0

### 安装步骤

1. **克隆项目**
   ```bash
   git clone <repository-url>
   cd react-demo
   ```

2. **安装依赖**
   ```bash
   npm install
   ```

3. **环境配置**

   创建 `.env` 文件：
   ```env

   # API配置
   NEXT_PUBLIC_API_BASE_URL="http://localhost:8002"
   ```


4**启动项目**
   ```bash
   npm run dev
   ```

访问 [http://localhost:3000](http://localhost:3001) 查看应用

## 📁 项目结构

```
src/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # 根布局
│   ├── page.tsx           # 主页
│   └── api/               # API路由
├── components/            # React组件
│   ├── SimpleChat/        # 简单聊天组件
│   ├── ChatRoom/          # 聊天室组件
│   ├── AgentChatRoom/     # 智能体聊天组件
│   ├── CharacterList/     # 角色列表组件
│   └── ...
├── hooks/                 # 自定义Hooks
│   ├── useUIManager.ts    # UI状态管理
│   ├── useInputManager.ts # 输入管理
│   ├── useChatManager.ts  # 聊天管理
│   └── ...
├── services/              # 服务层
│   ├── aiChatService.ts   # AI对话服务
│   ├── userManagement.ts  # 用户管理服务
│   ├── ttsService.ts      # 语音合成服务
│   └── ...
└── utils/                 # 工具函数
    ├── request.ts         # HTTP请求封装
    └── audioConverter.ts  # 音频转换工具
```

## 🛠️ 技术栈

### 前端框架
- **Next.js 14.2.15** - React 全栈框架
- **React 18.2.0** - 用户界面库
- **TypeScript 5.x** - 类型安全的 JavaScript

### UI 组件库
- **Ant Design 5.27.4** - 企业级 UI 设计语言
- **Semi UI 2.86.0** - 现代化组件库
- **CSS Modules** - 模块化样式

### 状态管理
- **React Hooks** - 内置状态管理
- **Context API** - 全局状态共享

### 网络通信
- **Axios 1.12.2** - HTTP 客户端
- **Server-Sent Events** - 实时流式通信
- **WebSocket** - 双向实时通信


## 🎯 核心功能

### 1. AI 对话系统
- 支持多种 AI 模型（豆包、讯飞星火等）
- 实时流式对话响应
- 会话历史管理
- 消息状态跟踪

### 2. 角色扮演功能
- 自定义 AI 角色创建
- 角色属性配置
- 角色对话模式切换
- 角色管理界面

### 3. 语音交互
- 实时语音识别（讯飞语音）
- 文本转语音合成
- 音频文件处理
- 语音控制界面

### 4. 用户系统
- 用户注册/登录
- JWT 身份认证
- 用户信息管理
- 权限控制

## 📚 开发指南

### 开发命令

```bash
# 开发模式
npm run dev

# 生产构建
npm run build

# 生产启动
npm run start

# 代码检查
npm run lint

# 类型检查
npx tsc --noEmit
```


### 代码规范

- 使用 TypeScript 进行类型检查
- 遵循 ESLint 代码规范
- 组件使用 PascalCase 命名
- 文件使用 camelCase 命名
- 使用 Prettier 格式化代码

## 🔧 配置说明


### API 接口

项目提供完整的 RESTful API，详细文档请查看 `ApiDOC/` 目录：

- [用户管理接口](ApiDoc/用户管理接口文档.md)
- [AI对话接口](ApiDoc/普通AI会话接口文档.md)
- [角色管理接口](ApiDoc/ai角色管理接口.md)
- [语音功能接口](ApiDoc/讯飞功能接口文档.md)

## 🚀 部署

### 开发环境
```bash
npm run dev
```

### 生产环境
```bash
npm run build
npm run start
```

### Docker 部署
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3001
CMD ["npm", "start"]
```

## 🤝 贡献指南

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request


## 🙏 致谢

- [Next.js](https://nextjs.org/) - React 全栈框架
- [Ant Design](https://ant.design/) - 企业级 UI 组件库
- [Prisma](https://www.prisma.io/) - 现代化数据库工具
- [OpenAI](https://openai.com/) - AI 模型服务

<div align="center">

**[⬆ 回到顶部](#react-ai-聊天平台)**

Made with Lucy by [锁金村最速软件开发传说]

</div>
