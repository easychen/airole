# AIRole.net - AI 角色卡生成器

一个开源的 AI 驱动角色卡生成器，帮助您为角色扮演游戏、故事创作和 AI 聊天机器人创建详细的角色卡片。基于 Next.js 和现代网络技术构建。

[![部署到 Vercel](https://vercel.com/button)](https://vercel.com/new/git/external?repository-url=https://github.com/easychen/airole)

## ✨ 功能特点

- **🖼️ AI 图像分析** - 上传角色图片，让 AI 生成角色描述
- **🤖 AI 驱动生成** - 使用兼容 OpenAI API 的 AI 模型生成角色属性
- **💬 AI 助手聊天** - 获取角色属性的建议和改进意见
- **📱 响应式设计** - 在桌面和移动设备上无缝工作
- **🎨 现代界面** - 简洁直观的界面，支持深色/浅色主题
- **📝 角色书支持** - 高级角色记忆系统
- **🔄 版本历史** - 跟踪和管理角色开发过程
- **📤 多种导出格式** - 导出为 JSON 或 PNG 角色卡
- **☁️ 云端存储** - 可选的 Google Drive 集成，用于角色备份
- **🌐 多语言支持** - 支持中文和英文界面
- **🎯 Tavern 卡兼容** - 角色卡的标准格式

## 🚀 快速开始

### 部署到 Vercel

最简单的开始方式是直接部署到 Vercel：

[![部署到 Vercel](https://vercel.com/button)](https://vercel.com/new/git/external?repository-url=https://github.com/easychen/airole)

部署后，您可以在 Vercel 仪表板中配置环境变量以启用其他功能。

### 手动部署

1. **克隆仓库**
   ```bash
   git clone https://github.com/easychen/airole.git
   cd airole
   ```

2. **安装依赖**
   ```bash
   npm install
   # 或
   yarn install
   # 或
   pnpm install
   ```

3. **设置环境变量**（可选）
   ```bash
   cp .env.example .env.local
   ```
   详情请参阅[配置](#配置)部分。

4. **运行开发服务器**
   ```bash
   npm run dev
   # 或
   yarn dev
   # 或
   pnpm dev
   ```

5. **打开浏览器**
   访问 [http://localhost:3000](http://localhost:3000)

## ⚙️ 配置

所有功能都可以在不配置的情况下工作，但您可以通过设置环境变量来增强功能：

### 基本配置

在项目根目录创建 `.env.local` 文件：

```env
# NextAuth.js（Google 功能必需）
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-here

# Google OAuth（可选 - 启用 Google Drive 集成）
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### Google OAuth 设置（可选）

要启用 Google Drive 集成：

1. 前往 [Google Cloud Console](https://console.cloud.google.com/)
2. 创建新项目或选择现有项目
3. 启用 Google Drive API
4. 创建 OAuth 2.0 凭据
5. 将您的域名添加到授权来源
6. 添加回调 URL：`https://yourdomain.com/api/auth/callback/google`

### AI 模型配置

应用程序支持兼容 OpenAI API 的 AI 模型。用户可以通过设置界面配置他们喜欢的模型和 API 密钥：

- **支持的模型**：任何遵循 OpenAI API 规范的模型
- **热门提供商**：OpenAI、Google AI Studio、Anthropic、SiliconFlow、DeepSeek 等
- **自定义端点**：为不同提供商配置自定义 API 基础 URL

## 🏗️ 项目结构

```
├── app/                  # Next.js 应用目录
│   ├── api/             # API 路由
│   ├── globals.css      # 全局样式
│   └── page.tsx         # 主应用页面
├── components/          # React 组件
│   ├── ui/             # UI 组件
│   └── ...             # 功能组件
├── lib/                # 工具函数
├── public/             # 静态资源
├── styles/             # 附加样式
└── types/              # TypeScript 定义
```

## 🔧 开发

### 先决条件

- Node.js 18+
- npm/yarn/pnpm

### 本地开发

1. 克隆并安装依赖（参见快速开始）
2. 配置环境变量（可选）
3. 运行 `npm run dev`
4. 打开 [http://localhost:3000](http://localhost:3000)

### 生产构建

```bash
npm run build
npm run start
```

## 📱 使用方法

1. **上传角色图片**（可选）
   - 上传您的角色图片
   - AI 将分析并生成初始角色属性

2. **填写角色详情**
   - 编辑生成的或创建新的角色信息
   - 使用标签界面进行有序编辑

3. **获取 AI 助手建议**
   - 切换到聊天标签获取角色改进建议
   - 使用调整预设快速完善角色
   - AI 助手帮助您优化角色属性

4. **导出角色**
   - 导出为 JSON 用于数据交换
   - 导出为 PNG 用于角色卡分享

5. **云端备份**（如已配置）
   - 将角色保存到 Google Drive
   - 从任何设备访问您的角色

## 🎨 自定义

### 主题

应用程序支持多种主题：
- 浅色模式
- 深色模式
- 系统偏好

### 语言

目前支持的语言：
- 英语
- 中文（简体）

### 模型

可配置的兼容 OpenAI API 的模型用于不同目的：
- 图像分析模型
- 角色生成模型
- AI 助手模型

## 🔒 隐私与安全

- **本地优先**：默认情况下所有数据都在本地存储
- **可选云端**：Google Drive 集成完全可选
- **无跟踪**：我们不跟踪用户行为或收集分析数据
- **开源**：完全透明 - 您可以自己检查代码

## 🤝 贡献

我们欢迎贡献！请参阅我们的[贡献指南](CONTRIBUTING.md)了解详情。

### 开发设置

1. Fork 仓库
2. 创建功能分支
3. 进行更改
4. 彻底测试
5. 提交拉取请求

### 报告问题

发现错误或有功能请求？请[提交问题](https://github.com/easychen/airole/issues)。

## 📄 许可证

此项目根据 MIT 许可证授权 - 详情请参阅 [LICENSE](LICENSE) 文件。

## 🙏 致谢

- 使用 [Next.js](https://nextjs.org/) 构建
- UI 组件来自 [shadcn/ui](https://ui.shadcn.com/)
- 图标来自 [Lucide](https://lucide.dev/)
- 通过 [NextAuth.js](https://next-auth.js.org/) 进行身份验证

## 📞 支持

- **文档**：查看[用户指南](USER_GUIDE.md)
- **问题**：[GitHub 问题](https://github.com/easychen/airole/issues)
- **讨论**：[GitHub 讨论](https://github.com/easychen/airole/discussions)

---

<div align="center">
  <p>由 AIRole.net 团队用 ❤️ 制作</p>
  <p>
    <a href="https://github.com/easychen/airole">⭐ 在 GitHub 上给我们星标</a> •
    <a href="https://vercel.com/new/git/external?repository-url=https://github.com/easychen/airole">🚀 部署到 Vercel</a>
  </p>
</div> 