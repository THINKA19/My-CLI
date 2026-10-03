---
title: Mermaid 图表示例
description: 展示如何在 VitePress 中使用 Mermaid 绘制各种图表
layout: doc
aside: true
outline: [2, 3]
editLink: true
---

# Mermaid 图表示例

本页面展示如何在 VitePress 中使用 Mermaid 绘制各种类型的图表。

## 什么是 Mermaid？

Mermaid 是一个基于 JavaScript 的图表绘制工具，它使用类似 Markdown 的语法来创建和修改图表。通过简单的文本描述，你可以快速创建流程图、时序图、甘特图等多种类型的图表。

## 使用方法

在 Markdown 文档中使用 ` ```mermaid ` 代码块即可创建 Mermaid 图表：

## 流程图 (Flowchart)

流程图用于展示流程或系统中的步骤和决策点。

**示例：**

```mermaid
graph TD
    A[开始] --> B{是否登录?}
    B -->|是| C[显示主页]
    B -->|否| D[跳转登录页]
    C --> E[加载用户数据]
    D --> F[输入账号密码]
    F --> G{验证成功?}
    G -->|是| C
    G -->|否| H[显示错误信息]
    H --> F
    E --> I[结束]
```

## 时序图 (Sequence Diagram)

时序图用于展示对象之间的交互顺序。

**示例：用户登录流程**

```mermaid
sequenceDiagram
    participant 用户
    participant 前端
    participant 后端
    participant 数据库

    用户->>前端: 输入账号密码
    前端->>前端: 表单验证
    前端->>后端: 发送登录请求
    后端->>数据库: 查询用户信息
    数据库-->>后端: 返回用户数据
    后端->>后端: 验证密码
    alt 验证成功
        后端-->>前端: 返回 Token
        前端-->>用户: 跳转到主页
    else 验证失败
        后端-->>前端: 返回错误信息
        前端-->>用户: 显示错误提示
    end
```

## 类图 (Class Diagram)

类图用于展示系统中类的结构和类之间的关系。

**示例：**

```mermaid
classDiagram
    class 用户 {
        +String 用户名
        +String 邮箱
        +String 密码
        +登录()
        +注销()
        +修改密码()
    }
    
    class 管理员 {
        +String 权限级别
        +删除用户()
        +修改权限()
    }
    
    class 文章 {
        +String 标题
        +String 内容
        +Date 创建时间
        +发布()
        +编辑()
        +删除()
    }
    
    用户 <|-- 管理员
    用户 "1" --> "*" 文章 : 创作
```

## 状态图 (State Diagram)

状态图用于展示对象在其生命周期中的不同状态。

**示例：订单状态流转**

```mermaid
stateDiagram-v2
    [*] --> 待支付
    待支付 --> 已支付: 支付成功
    待支付 --> 已取消: 取消订单
    已支付 --> 待发货: 商家确认
    待发货 --> 已发货: 发货
    已发货 --> 已签收: 用户签收
    已签收 --> 已完成: 确认收货
    已支付 --> 退款中: 申请退款
    退款中 --> 已退款: 退款成功
    退款中 --> 已支付: 拒绝退款
    已取消 --> [*]
    已完成 --> [*]
    已退款 --> [*]
```

## 甘特图 (Gantt Chart)

甘特图用于项目管理，展示项目进度和任务时间安排。

**示例：项目开发计划**

```mermaid
gantt
    title 项目开发时间表
    dateFormat  YYYY-MM-DD
    section 需求分析
    需求收集           :a1, 2024-01-01, 7d
    需求评审           :after a1, 3d
    section 设计阶段
    UI设计            :2024-01-11, 10d
    数据库设计         :2024-01-11, 7d
    section 开发阶段
    前端开发           :2024-01-21, 20d
    后端开发           :2024-01-21, 20d
    section 测试阶段
    单元测试           :2024-02-10, 7d
    集成测试           :2024-02-17, 5d
    section 上线
    部署上线           :2024-02-22, 3d
```

## 饼图 (Pie Chart)

饼图用于展示数据的占比关系。

**示例：技术栈占比**

```mermaid
pie title 项目技术栈占比
    "Vue.js" : 35
    "TypeScript" : 25
    "Node.js" : 20
    "CSS/SCSS" : 12
    "其他" : 8
```

## Git 图 (Git Graph)

Git 图用于展示 Git 分支和提交历史。

**示例：**

```mermaid
gitGraph
    commit id: "初始化项目"
    commit id: "添加基础配置"
    branch develop
    checkout develop
    commit id: "开发新功能"
    commit id: "功能测试"
    checkout main
    merge develop
    commit id: "发布 v1.0"
    branch hotfix
    checkout hotfix
    commit id: "修复紧急bug"
    checkout main
    merge hotfix
    commit id: "发布 v1.0.1"
```

## 实体关系图 (ER Diagram)

实体关系图用于展示数据库中实体之间的关系。

**示例：**

```mermaid
erDiagram
    用户 ||--o{ 订单 : 创建
    用户 {
        int id PK
        string 用户名
        string 邮箱
        datetime 注册时间
    }
    订单 ||--|{ 订单项 : 包含
    订单 {
        int id PK
        int 用户id FK
        decimal 总金额
        datetime 创建时间
    }
    商品 ||--o{ 订单项 : 被购买
    商品 {
        int id PK
        string 名称
        decimal 价格
        int 库存
    }
    订单项 {
        int id PK
        int 订单id FK
        int 商品id FK
        int 数量
        decimal 小计
    }
```

## 思维导图 (Mindmap)

思维导图用于展示想法和概念之间的层次关系。

**示例：前端学习路线**

```mermaid
mindmap
  root((前端开发))
    基础知识
      HTML
      CSS
      JavaScript
    框架库
      Vue.js
        Vue Router
        Vuex/Pinia
      React
        React Router
        Redux
      Angular
    工程化
      包管理器
        npm
        yarn
        pnpm
      构建工具
        Webpack
        Vite
        Rollup
      代码规范
        ESLint
        Prettier
    性能优化
      代码分割
      懒加载
      缓存策略
```

## 更多资源

- [Mermaid 官方文档](https://mermaid.js.org/)
- [Mermaid 在线编辑器](https://mermaid.live/)
- [图表语法参考](https://mermaid.js.org/intro/syntax-reference.html)
