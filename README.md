# marsxw.github.io

仟鑫科技 GitHub Pages 案例展示站。

## 添加 / 修改案例（只需改 `assets/`）

在 `assets/` 下创建**文件夹名 = 项目名**（改名后重新构建即可更新展示）：

```text
assets/
  260520桌面贴片机/
    cover.jpg          ← 封面（或 cover.png / cover.webp）
    简介.txt           ← 项目简介（首页摘要 + 详情页正文）
    分类.txt           ← 可选，单行，如：电路 / 工控 / 机械臂 / 移动平台
    视频1.mp4          ← 任意 mp4/webm/mov 视频
    现场图1.jpg        ← 其余图片会在详情页「项目图片」展示
```

### 简介.txt 格式

```text
分类:电路
桌面级贴片设备相关交付说明……
第二段可空行分隔。
```

也可不用首行「分类:」，单独写 `分类.txt`。

## 更新网站数据

GitHub Pages 为静态站点，需先生成清单 `data/cases.json`：

```bash
node scripts/build-cases.mjs
git add data/cases.json assets/
git commit -m "update cases"
git push
```

推送后 GitHub Actions 也会在 `assets/` 变更时**自动重新生成** `data/cases.json`。

## 本地预览

```bash
node scripts/build-cases.mjs
python3 -m http.server 8080
# 打开 http://127.0.0.1:8080/
```

## 页面说明

- 首页 `index.html`：从 `data/cases.json` 动态渲染案例列表
- 详情 `case.html?id=<文件夹名>`：同一数据源，无需再维护 `cases/*.html`
