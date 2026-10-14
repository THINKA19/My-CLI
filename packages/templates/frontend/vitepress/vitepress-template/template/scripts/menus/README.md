# 文档菜单生成

有正文的菜单在 Markdown frontmatter 中配置；可选的 `src/menu.config.ts` 仅用于外链和无正文导航分组。
基础模板每种语言只包含首页、Markdown 示例和 API 示例；需要额外导航时自行创建该配置文件。
脚本扫描 `src/` 各语言目录，生成一份公共结构和各语言文字，输出至 `.vitepress/config/generated/`。
生成文件不入库，不要手动修改。

## 依赖与命令

在模板项目根目录运行 `pnpm install`。开发依赖 `yaml` 解析 YAML frontmatter，
`tsx` 执行 TypeScript 脚本；无需在 scripts 下单独安装依赖或创建 package.json。

```sh
pnpm menus:generate  # 校验成功后生成导航、侧边栏和翻译
pnpm menus:check     # 校验输入和内存菜单，不写文件；适合 CI
pnpm dev             # 先生成，再启动 VitePress
pnpm build           # 先生成，再构建
pnpm test:menus      # 生成器测试
node --test tests/i18n/config.test.mjs  # 生成菜单后检查多语言配置
```

### generate 与 check 怎么使用

两个命令都在模板项目根目录（有 package.json 的目录）执行。

- `pnpm menus:generate`：扫描文档，校验菜单配置和多语言对应关系；全部通过后更新导航、侧边栏及菜单文案。校验失败不会更新生成文件。
- `pnpm menus:check`：执行相同的扫描和校验，只报告结果，不写文件、不更新菜单，也不比较已有生成文件是否过期。

**无需先 check 再 generate。** generate 自带校验；只有想先确认配置有效、暂时不生成，或在 CI 中单独校验时，才需要 check。

| 场景 | 建议操作 |
| --- | --- |
| 新增、删除、移动文档 | 运行 `pnpm menus:generate` |
| 修改页面 title、菜单文字、排序、显示开关或分组 | 运行 `pnpm menus:generate` |
| 只修改正文，未改变菜单使用的标题 | 保存即可，开发服务通常自动刷新正文 |
| 修改 `src/menu.config.ts` 中的外链或分组 | 运行 `pnpm menus:generate` |
| 提交前想检查菜单，或在 CI 中校验 | 运行 `pnpm menus:check` |
| 修改普通组件、样式等无关代码 | 不需要运行菜单检查 |
| 修改生成脚本或 i18n 解析代码 | 运行 `pnpm test:menus`、`node --test tests/i18n/config.test.mjs`；check 不能替代测试 |

检查范围包括缺少翻译、重复 ID/路径/菜单链接、未知字段、错误类型、无效父分组等。
它不是全项目代码检查，也不检查正文中的全部链接。报错时先修正文档或菜单配置，再重新执行。

日常操作示例：

```sh
# 新增各语言文档，或修改菜单元数据后
pnpm menus:generate

# 如果尚未启动开发服务，也可以直接执行；它会先自动生成
pnpm dev

# 只想检查，暂时不更新生成文件
pnpm menus:check
```

菜单通过显式命令生成；开发服务已启动时，生成文件的变化会触发配置重新加载。check 不会更新页面菜单。
新克隆无需已有生成文件，`pnpm dev` 和 `pnpm build` 都会先生成。直接运行 VitePress 命令前应先生成。

## 文档配置

普通文章只需 `title`，默认进入侧边栏，不进入顶部导航。也支持从正文第一个 H1 取标题。

```yaml
---
title: 站点配置
description: 如何配置站点
menu:
  id: configuration.site
  sidebar:
    text: 站点配置
    order: 20
  nav:
    enabled: true
    text: 配置站点
    order: 30
    parent: configuration
    activeMatch: "^/configuration/"
---
```

栏目 `configuration/index.md` 使用 `menu.id: configuration`，设置 `nav.enabled: true`
和 `nav.mode: dropdown`，形成父导航。侧边栏默认按目录分组；栏目首页可配置
`sidebar.collapsed`、`sidebar.linkToIndex`。没有栏目首页时，侧边栏用目录名作标题。

| 字段 | 默认值与用途 |
| --- | --- |
| `menu.id` | 不带 `.md` 的相对路径；用于匹配语言和导航父分组 |
| `sidebar.enabled` | 普通文章为 true；分组设为 false 时隐藏整个分组 |
| `sidebar.text` / `nav.text` | 页面 title；允许分别覆盖文字 |
| `sidebar.order` / `nav.order` | 显式排序优先，数值小的在前；相同顺序按路径稳定排序 |
| `nav.enabled` | false；只有显式启用的节点进入导航 |
| `nav.parent` | 最近的已启用下拉栏目；没有时成为顶层导航 |
| `nav.mode` | link；dropdown 表示分组，不能同时生成链接 |
| `nav.activeMatch` | 不设置；以 `^/` 开头、不含语言前缀，组装时添加语言前缀 |
| `sidebar.collapsed` | 不设置；true 折叠、false 展开 |
| `sidebar.linkToIndex` | true；分组标题链接栏目首页 |
| `translate` | true；false 表示仅默认语言菜单显示该页面 |

未知 menu 字段、错误类型、重复 ID/路径/菜单链接、无效父分组、循环和过深菜单会报错。
排序数字相同合法。链接根据真实文件路径生成，不支持通过元数据伪造文档地址。

## 多语言

默认语言是 registry 中 configKey 为 root 的语言。默认按相对路径对应：
`zh/configuration/site.md`、`en/configuration/site.md`、`vi/configuration/site.md`。
显式 ID 可以匹配页面，但当前仍要求对应页面路径一致，以保持一份公共结构。
默认语言决定层级、排序、开关；其他语言提供 title 和菜单 text。

缺翻译默认报错，不回退到不存在的译文地址。默认语言页面设置 `translate: false`
时只在默认语言菜单中显示；外语即使有对应文件也不会显示该入口。
其他语言独有的页面目前报错。隐藏菜单不会禁止访问页面。

## 无正文节点

```ts
export default {
  nav: [{
    id: 'resources',
    text: { zh: '资源', en: 'Resources', vi: 'Tài nguyên' },
    items: [{
      id: 'source',
      text: { zh: '源码', en: 'Source', vi: 'Mã nguồn' },
      link: 'https://github.com/example/project',
    }],
  }],
}
```

支持 `order` 和 `parent`；纯分组可用空 items 数组接收文档的 nav.parent 子项，
但最终分组不能为空。链接只接受 http、https、mailto、tel，所有语言文字必须齐全。

## 输出与失败处理

每个栏目文件提供 `{ nav, sidebar, texts: { zh: { nav, sidebar }, ... } }`，
结构中的 key 对应语言文字。生成入口汇总这些栏目，nav/sidebar 保持原有稳定入口。
全部输入及菜单校验成功后才写入；未改变的文件不重写，删除文档后清理对应旧生成文件。
check 与 generate 使用相同扫描和校验，不比较是否过期。生成物不入库，CI 先校验，
构建时自动生成。分组拆文件不等于浏览器菜单按需加载。
