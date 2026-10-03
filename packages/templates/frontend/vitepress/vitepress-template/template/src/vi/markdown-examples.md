---
title: Tiêu đề Trang Tùy chỉnh - markdown-examples
description: Đây là mô tả SEO cho trang này
layout: doc
aside: true
outline: [2, 3]
editLink: true
---

# Ví dụ Mở rộng Markdown

Trang này trình bày một số tiện ích mở rộng markdown tích hợp được cung cấp bởi VitePress.

## Làm nổi bật Cú pháp

VitePress cung cấp Làm nổi bật Cú pháp được hỗ trợ bởi [Shiki](https://github.com/shikijs/shiki), với các tính năng bổ sung như làm nổi bật dòng:

**Đầu vào**

````md
```js{4}
export default {
  data () {
    return {
      msg: 'Highlighted!'
    }
  }
}
```
````

**Đầu ra**

```js{4}
export default {
  data () {
    return {
      msg: 'Highlighted!'
    }
  }
}
```

## Khối Tùy chỉnh

**Đầu vào**

```md
::: info
Đây là hộp thông tin.
:::

::: tip
Đây là một mẹo.
:::

::: warning
Đây là một cảnh báo.
:::

::: danger
Đây là một cảnh báo nguy hiểm.
:::

::: details
Đây là một khối chi tiết.
:::
```

**Đầu ra**

::: info
Đây là hộp thông tin.
:::

::: tip
Đây là một mẹo.
:::

::: warning
Đây là một cảnh báo.
:::

::: danger
Đây là một cảnh báo nguy hiểm.
:::

::: details
Đây là một khối chi tiết.
:::

## Thêm nữa

Xem tài liệu để biết [danh sách đầy đủ các tiện ích mở rộng markdown](https://vitepress.dev/guide/markdown).
