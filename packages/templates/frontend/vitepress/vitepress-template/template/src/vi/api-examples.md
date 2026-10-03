---
title: Tiêu đề Trang Tùy chỉnh - api-examples
description: Đây là mô tả SEO cho trang này
layout: doc
aside: true
outline: [2, 3]
editLink: true
---

# Ví dụ Runtime API

Trang này trình bày cách sử dụng một số API runtime được cung cấp bởi VitePress.

API chính `useData()` có thể được sử dụng để truy cập dữ liệu trang web, chủ đề và trang cho trang hiện tại. Nó hoạt động trong cả file `.md` và `.vue`:

```md
<script setup>
import { useData } from 'vitepress'

const { theme, page, frontmatter } = useData()
</script>

## Kết quả

### Dữ liệu Chủ đề
<pre>{{ theme }}</pre>

### Dữ liệu Trang
<pre>{{ page }}</pre>

### Frontmatter Trang
<pre>{{ frontmatter }}</pre>
```

<script setup>
import { useData } from 'vitepress'

const { site, theme, page, frontmatter } = useData()
</script>

## Kết quả

### Dữ liệu Chủ đề
<pre>{{ theme }}</pre>

### Dữ liệu Trang
<pre>{{ page }}</pre>

### Frontmatter Trang
<pre>{{ frontmatter }}</pre>

## Thêm nữa

Xem tài liệu để biết [danh sách đầy đủ các runtime API](https://vitepress.dev/reference/runtime-api#usedata).
