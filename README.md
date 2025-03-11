# 100天纪念日网站

这是一个精美的100天纪念日网站，用于记录和展示你们在一起的美好时光。网站包含一个纵向时间轴，你可以向时间轴上添加图片和文字，记录每一个特别的瞬间。

## 功能特点

- 精美的UI设计，响应式布局
- 实时显示在一起的天数、小时、分钟和秒数
- 纵向时间轴，可以添加带有日期、标题、内容和图片的事件
- 支持多图片上传和展示，包括灯箱效果
- 图片展示采用自适应布局，根据数量自动调整排列方式
- 支持图片上传和图片链接两种方式添加图片
- 支持编辑和删除已添加的时间轴事件
- 删除事件时自动删除关联的图片文件
- 左上角信封功能，可以查看和编辑支持Markdown格式的信件
- 自适应的Markdown文字与图片大小，随页面大小变化
- 支持背景图片轮播，可以添加多张背景图片
- 所有操作（添加、编辑、删除、信件编辑）均受密码保护（默认密码：241214）
- 支持服务器端数据持久化存储
- 所有数据（时间轴、图片、信件、背景图片）均保存在项目文件夹中
- 支持深色/浅色模式
- 流畅的动画效果
- 可滚动的编辑界面，支持添加大量图片

## 技术栈

- Next.js 15
- React 19
- TypeScript
- Tailwind CSS
- Framer Motion (动画)
- React Icons
- Next.js API Routes (服务器端存储)
- React Markdown (信件渲染)
- Remark GFM (GitHub风格Markdown支持)

## 开始使用

### 安装依赖

```bash
npm install
# 或
yarn install
# 或
pnpm install
```

### 开发模式

```bash
npm run dev
# 或
yarn dev
# 或
pnpm dev
```

在浏览器中打开 [http://localhost:3000](http://localhost:3000) 查看网站。

### 构建生产版本

```bash
npm run build
# 或
yarn build
# 或
pnpm build
```

### 运行生产版本

```bash
npm run start
# 或
yarn start
# 或
pnpm start
```

## 数据存储

网站的所有数据都保存在项目文件夹中，无需外部数据库或存储服务：

1. 时间轴数据：保存在`data/timeline.json`文件中
2. 图片文件：上传后保存在`public/uploads`目录中
3. 信件内容：保存在`data/letter.md`文件中（支持Markdown格式）
4. 背景图片配置：保存在`data/backgrounds.json`文件中
5. 背景图片文件：保存在`public/backgrounds`目录中

这种设计确保了数据的完整性和便携性，您可以轻松备份或迁移所有数据。

### 部署注意事项

1. 确保服务器上的`data`目录、`public/uploads`目录和`public/backgrounds`目录有写入权限
2. 对于无状态部署环境（如Vercel），请考虑使用数据库存储和云存储服务

## 使用数据库存储（可选）

对于需要更可靠存储的生产环境，可以将文件存储替换为数据库存储：

1. 安装所需数据库客户端（如MongoDB、PostgreSQL等）
2. 修改`src/app/api/timeline/route.ts`文件，替换文件存储为数据库操作
3. 修改`src/app/api/letter/route.ts`文件，替换文件存储为数据库操作
4. 修改`src/app/api/backgrounds/route.ts`文件，替换文件存储为数据库操作
5. 修改`src/app/api/upload/route.ts`和`src/app/api/upload/delete/route.ts`文件，替换本地文件上传为云存储服务（如AWS S3、Azure Blob Storage等）
6. 其他代码无需修改，因为API接口保持不变

## 自定义

你可以通过修改以下文件来自定义网站：

- `src/app/globals.css` - 修改颜色变量和全局样式
- `src/components/ui/Header.tsx` - 修改头部内容和起始日期
- `src/components/timeline/Timeline.tsx` - 修改时间轴组件和密码（CORRECT_PASSWORD变量）
- `src/app/api/timeline/route.ts` - 修改数据存储方式
- `src/app/api/letter/route.ts` - 修改默认信件内容
- `src/components/ui/Envelope.tsx` - 修改信封组件样式和密码（CORRECT_PASSWORD变量）
- `src/components/ui/BackgroundSlider.tsx` - 修改背景图片轮播效果
- `src/app/api/backgrounds/route.ts` - 修改默认背景图片

## 使用说明

### 时间轴功能

1. 点击"添加回忆"按钮，输入密码（默认：241214）
2. 填写日期、标题、内容
3. 添加图片（可以上传图片或输入图片URL）
4. 点击保存按钮添加到时间轴
5. 要编辑已有事件，点击事件右上角的编辑图标，输入密码后进行编辑
6. 要删除已有事件，点击事件右上角的删除图标，输入密码后确认删除（关联的图片文件会自动删除）
7. 点击图片可以打开灯箱查看大图，支持左右切换和关闭操作
8. 图片展示采用自适应布局，根据图片数量自动调整排列方式
9. 编辑界面支持滚动，可以添加大量图片并轻松找到底部的保存按钮

### 信封功能

1. 点击左上角的信封图标打开信件
2. 信件内容支持完整的Markdown格式，包括标题、列表、链接、代码块等
3. 点击信件右上角的编辑图标，输入密码（默认：241214）后可以编辑信件内容
4. 编辑完成后点击保存图标保存内容
5. 点击信件外部区域或右上角关闭按钮可以关闭信件
6. 信件内容的文字和图片大小会自适应页面大小

### 背景图片功能

1. 背景图片会自动轮播，默认每10秒切换一次
2. 背景图片配置保存在`data/backgrounds.json`文件中
3. 背景图片文件保存在`public/backgrounds`目录中
4. 可以通过修改配置文件添加或删除背景图片

## 许可

MIT
