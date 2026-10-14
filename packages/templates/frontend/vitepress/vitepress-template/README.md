# 脚手架使用说明

> @dengzhibo/create-vitepress-template
>
> 基于 VitePress 的开箱即用个人知识库/文档脚手架。

## 发布四部曲

* 步骤1：登录

```bash
pnpm login --registry=https://registry.npmjs.org/
```

*  步骤2：验证登录是否成功

```bash
pnpm whoami --registry=https://registry.npmjs.org/
```

* 步骤3：设置token

```bash
 pnpm config set //registry.npmjs.org/:_authToken=你的新Token --global
```

* 步骤4：发布

```bash
pnpm publish --access public
```

 

## 快速开始

* 使用 npx 直接运行（不推荐）

```bash
npx @dengzhibo/create-vitepress-template my-doc
```

* 或全局安装使用

```Bash
# 步骤一
pnpm add -g @dengzhibo/create-vitepress-template
# 步骤二
create-vitepress-template my-doc
```

* 使用 `pnpm create`（推荐）：

```bash
# 创建项目目录并生成模板
pnpm dlx @dengzhibo/create-vitepress-template@latest my-docs

# 推荐
pnpm create @dengzhibo/vitepress-template@latest my-docs
```

