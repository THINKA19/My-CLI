// 仅配置外部链接与无正文分组；文档菜单请写在 frontmatter。
export default {
  nav: [
    {
      id: 'integrations.external',
      parent: 'integrations',
      order: 90,
      link: 'https://vitepress.dev/guide/i18n',
      text: {
        zh: '官方文档',
        en: 'Official docs',
        vi: 'Tài liệu chính thức',
      },
    },
    {
      id: 'reference.email',
      parent: 'reference',
      order: 91,
      link: 'mailto:docs@example.com',
      text: {
        zh: '联系邮箱',
        en: 'Contact email',
        vi: 'Email liên hệ',
      },
    },
  ],
}
