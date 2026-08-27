# AGENTS.md — 项目 AI 协作指令

本文件面向在本仓库工作的 AI 编码代理（Qwen Code / Claude Code 等），定义项目技术栈、目录结构、编码规范与工作流程。修改代码前请先完整阅读本文件。

## 项目概述

AI 项目学习助手 — 基于 vue-pure-admin 模板搭建的中后台管理系统，前后端分离：

- **前端**：PureAdmin（vue-pure-admin 精简版模板）+ Vue 3（Composition API）+ TypeScript + Vite 7 + Element Plus + Pinia + Vue Router 4
- **后端**：C# .NET（ASP.NET Core）服务，前后端通过 RESTful JSON API 通信

## 常用命令

包管理器统一使用 **pnpm**，禁止混用 npm / yarn。

```bash
pnpm install            # 安装依赖
pnpm dev                # 本地开发（默认端口 8848，见 vite.config.ts）
pnpm dev:debug          # 带 debug 模式开发
pnpm build              # 生产构建
pnpm typecheck          # vue-tsc 类型检查（提交前必须通过）
pnpm lint               # ESLint 检查
pnpm lint:stylelint     # Stylelint 检查
pnpm format             # Prettier 格式化
```

改完代码后，至少运行 `pnpm typecheck`；涉及样式改动时补跑 `pnpm lint:stylelint`。

## 目录结构（遵循 PureAdmin 约定）

```
├── src/
│   ├── api/              # API 模块，按后端业务域分文件（如 system/user.ts）
│   ├── assets/           # 静态资源
│   ├── components/       # 全局复用组件
│   ├── config/           # 全局配置（服务地址等）
│   ├── directives/       # 自定义指令（v-xxx）
│   ├── layout/           # 布局组件（PureAdmin 框架页）
│   ├── router/           # 路由：modules/ 按业务域拆分，utils/ 鉴权与动态路由
│   ├── store/            # Pinia 模块（auth.ts / user.ts / permission.ts 等）
│   ├── style/            # 全局样式与主题
│   ├── utils/            # 工具函数（http 请求封装、auth 等）
│   ├── views/            # 页面，按业务域建目录（views/system/user/index.vue）
│   ├── App.vue
│   └── main.ts
├── types/                # 全局类型声明（*.d.ts）
├── .env.development      # 开发环境变量（VITE_ 前缀）
├── .env.production       # 生产环境变量
└── vite.config.ts        # Vite 配置（含代理 proxy）
```

规则：

- 新页面放 `src/views/<业务域>/<功能>/index.vue`，多文件时同目录放置。
- 新路由在 `src/router/modules/` 新建或追加模块文件，使用 `asyncRoutes` 懒加载导出。
- 可复用组件进 `src/components/`，页面私有组件留在页面目录内。
- 类型声明优先内联或放同目录 `types.ts`；全局共享类型放 `types/`。

## 前端编码规范

### Vue 3 组件

- 一律使用 `<script setup lang="ts">` + Composition API，禁止 Options API。
- 组件名用多词 PascalCase；模板中组件标签与 PureAdmin 现有代码保持一致。
- 响应式：基础类型用 `ref`；避免滥用 `watch`，能用 computed 派生的不用 watch。
- `defineProps` 使用类型标注（`defineProps<{ ... }>()`），禁用运行时对象式声明。
- 组件内逻辑复杂时用组合式函数抽离到 `src/hooks/` 或页面目录 `utils/`（hooks 命名 `useXxx`）。

### TypeScript

- 严格模式，禁止 `any`；确需逃逸用 `unknown` + 收窄。
- API 响应、路由 meta、Pinia state 必须有明确 interface/type。
- 类型放使用处最近的文件；跨模块共享的进 `types/` 或各 api 模块内定义。

### Element Plus

- 组件按需自动导入（unplugin-vue-components 已配置），不要整包导入；消息提示用 `ElMessage` / `ElMessageBox` / `ElNotification`，PureAdmin 有封装时优先用封装。
- 表格优先使用 PureAdmin 封装的 `PureTableBar` + `@pureadmin/table`。

### 样式

- 使用 SCSS（`.scss`）；类名 BEM 或 PureAdmin 现有风格，禁止内联 `style=""` 写复杂样式。
- 主题色、间距等变量来自 `src/style/`，不要硬编码颜色值。

## 状态管理（Pinia）

- 每个业务域一个 store 文件，`defineStore` 使用 setup 风格（`defineStore('user', () => { ... })`）。
- 组件内只读 state 通过 storeToRefs 解构；修改走 actions。
- 登录态、token、用户信息在 `store/auth.ts` / `store/user.ts`，路由权限在 `store/permission.ts`，新增时遵循同模式。
- 持久化统一使用项目已有的持久化方案，不要散落各处直接操作 localStorage；确需存储 key 时集中到 `src/utils/auth.ts`。

## 路由（Vue Router 4）

- 路由统一懒加载 `() => import("...")`。
- `meta` 类型见 `types/router.d.ts`，新增字段需同步扩展类型声明。常用 meta：`title`（必填，用于菜单/面包屑）、`icon`、`rank`、`roles`、`requiresAuth`、`keepAlive`。
- 需要权限的路由由 `store/permission.ts` 依据后端返回的菜单/角色动态生成；静态路由仅放登录页、404、403 等公共页。
- 路由跳转优先 `router.push`，命名路由优先于路径字符串。

## API 层与后端契约（C# .NET）

### 请求封装

- HTTP 客户端统一走 `src/utils/http/` 封装（axios 实例），禁止在组件内直接 `import axios` 或裸 `fetch`。
- 每个业务域一个 api 文件：`src/api/<domain>/<module>.ts`，函数命名 `getXxx / addXxx / updateXxx / deleteXxx`，入参出参全部带类型。
- 环境地址通过 `.env` 的 `VITE_` 变量 + `src/config/` 读取；本地开发跨域走 `vite.config.ts` 的 `server.proxy`，不要改后端 CORS 来迁就前端。

### 与 .NET 后端的契约约定

- 后端为 ASP.NET Core，JSON 序列化默认 **camelCase**（`System.Text.Json` web defaults），前端字段一律 camelCase，无需手动转换。
- 统一响应结构以后端实际返回为准（常见为 `{ code, message, data }` 包装），在 `src/utils/http/` 响应拦截器中统一处理错误码、token 失效（401 → 清理登录态 → 跳登录页）。
- 认证使用 JWT Bearer：登录接口返回 accessToken（+ refreshToken，若后端实现），由 http 拦截器统一附加 `Authorization: Bearer <token>`。
- 分页参数与响应以后端分页封装为准（如 `{ pageIndex, pageSize }` / `{ items, total }`），在对应 api 模块的类型中定义，不要散落。
- 后端接口变更时，同步更新前端类型定义；后端暂未就绪的接口，api 函数照常定义并标注 `// TODO: 待后端接口就绪`，便于全局搜索。

## Git 规范

- 提交信息使用 Conventional Commits：`feat:` / `fix:` / `refactor:` / `docs:` / `style:` / `test:` / `chore:`，subject 用中文或英文均可但需简洁达意（例：`feat: 新增用户管理页面`）。
- 只提交与当前任务相关的文件，禁止 `git add -A` 混入无关改动。
- 不要自动 push、不要自动创建/修改 CI 配置，除非用户明确要求。

## Agent 行为准则

1. **先读后写**：改任何文件前先读它；新功能先看 `src/views/`、`src/api/`、`src/router/modules/` 中同类实现，模仿现有模式而不是发明新模式。
2. **不过度设计**：只做被要求的事；不擅自升级依赖、不引入新库、不加未被要求的功能或错误处理。需要新依赖时先询问用户。
3. **验证闭环**：改动后运行 `pnpm typecheck`（必要时 `pnpm lint`），能构建通过再报告完成；测试失败要如实说明。
4. **契约透明**：涉及后端配合的改动（新接口、字段变更），在回复中列出对后端 .NET 服务的契约要求（方法、路径、入参、出参），而不是默默假设。
5. **保持 PureAdmin 生态**：优先使用模板内置能力（权限指令、面包屑、标签页缓存、暗黑模式等），避免重复造轮子。
