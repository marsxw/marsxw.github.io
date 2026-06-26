#!/usr/bin/env node
/**
 * 扫描 assets/<项目名>/ 生成 data/cases.json
 *
 * 约定（每个项目文件夹）：
 * - 封面：cover.jpg / cover.png / cover.webp / cover.jpeg
 * - 简介：简介.txt（首行可为「分类:工控」，其余为正文）
 * - 分类（可选）：分类.txt（单行，如「机械臂」）
 * - 其余 .jpg/.png/.webp/.gif → 附图；.mp4/.webm/.mov → 视频
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const ASSETS_DIR = path.join(ROOT, "assets");
const OUT_FILE = path.join(ROOT, "data", "cases.json");

const COVER_NAMES = ["cover.jpg", "cover.jpeg", "cover.png", "cover.webp"];
const INTRO_NAMES = ["简介.txt", "intro.txt", "README.txt"];
const CATEGORY_NAMES = ["分类.txt", "category.txt"];

const IMAGE_EXT = new Set([".jpg", ".jpeg", ".png", ".gif", ".webp"]);
const VIDEO_EXT = new Set([".mp4", ".webm", ".mov", ".m4v", ".ogv"]);
const SKIP_FILES = new Set([
  ...INTRO_NAMES.map((n) => n.toLowerCase()),
  ...CATEGORY_NAMES.map((n) => n.toLowerCase()),
  ...COVER_NAMES.map((n) => n.toLowerCase()),
]);

/** 尚无 简介/分类 文件时的默认分类（可按需删改，优先用 分类.txt） */
const LEGACY_CATEGORY = {
  "251202机械手控制": "机械臂",
  "250206底盘控制算法仿真": "移动平台",
  "251003双足机器人仿真": "机械臂",
  "260203工业移动底盘": "移动平台",
  "260309数字讲解人": "工控",
  "260310真空控压算法": "工控",
  "260415蘑菇采摘机器人": "机械臂",
  "260510_阻值分析仪": "电路",
  "260515家庭服务复合机器人": "机械臂",
  "260520桌面贴片机": "电路",
};

function readTextFile(dir, names) {
  for (const name of names) {
    const p = path.join(dir, name);
    if (fs.existsSync(p)) {
      return fs.readFileSync(p, "utf8").trim();
    }
  }
  return "";
}

function findCover(files) {
  const lowerMap = new Map(files.map((f) => [f.toLowerCase(), f]));
  for (const name of COVER_NAMES) {
    const hit = lowerMap.get(name);
    if (hit) return hit;
  }
  return null;
}

function parseIntro(raw) {
  let category = "";
  let body = raw;
  if (!raw) return { category, body, summary: "" };

  const lines = raw.split(/\r?\n/);
  if (/^分类[:：]\s*.+/.test(lines[0])) {
    category = lines[0].replace(/^分类[:：]\s*/, "").trim();
    body = lines.slice(1).join("\n").trim();
  }

  const summaryLine = body
    .split(/\r?\n/)
    .map((l) => l.trim())
    .find(Boolean);
  const summary = summaryLine
    ? summaryLine.length > 96
      ? summaryLine.slice(0, 96) + "…"
      : summaryLine
    : "";

  return { category, body, summary };
}

function sortFiles(a, b) {
  return a.localeCompare(b, "zh-CN", { numeric: true, sensitivity: "base" });
}

function buildCase(id, dirPath) {
  const files = fs.readdirSync(dirPath).filter((f) => {
    const stat = fs.statSync(path.join(dirPath, f));
    return stat.isFile();
  });

  const coverFile = findCover(files);
  const introRaw = readTextFile(dirPath, INTRO_NAMES);
  const categoryFile = readTextFile(dirPath, CATEGORY_NAMES);
  const parsed = parseIntro(introRaw);

  let category = categoryFile || parsed.category || LEGACY_CATEGORY[id] || "";
  category = category.trim();

  const coverLower = coverFile ? coverFile.toLowerCase() : null;
  const images = [];
  const videos = [];

  for (const file of files.sort(sortFiles)) {
    const lower = file.toLowerCase();
    if (SKIP_FILES.has(lower) || lower === coverLower) continue;
    const ext = path.extname(lower);
    const rel = `assets/${id}/${file}`;
    if (VIDEO_EXT.has(ext)) {
      videos.push({ name: file, path: rel, type: ext.slice(1) });
    } else if (IMAGE_EXT.has(ext)) {
      images.push({ name: file, path: rel });
    }
  }

  return {
    id,
    title: id,
    category,
    summary: parsed.summary,
    intro: parsed.body,
    cover: coverFile ? `assets/${id}/${coverFile}` : null,
    images,
    videos,
  };
}

function main() {
  if (!fs.existsSync(ASSETS_DIR)) {
    console.error("assets/ 目录不存在");
    process.exit(1);
  }

  const dirs = fs
    .readdirSync(ASSETS_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .sort((a, b) => b.localeCompare(a, "zh-CN", { numeric: true }));

  const cases = dirs.map((id) => buildCase(id, path.join(ASSETS_DIR, id)));

  const categories = [...new Set(cases.map((c) => c.category).filter(Boolean))].sort(
    (a, b) => a.localeCompare(b, "zh-CN")
  );

  const payload = {
    generatedAt: new Date().toISOString(),
    categories,
    cases,
  };

  fs.mkdirSync(path.dirname(OUT_FILE), { recursive: true });
  fs.writeFileSync(OUT_FILE, JSON.stringify(payload, null, 2) + "\n", "utf8");
  console.log(`已生成 ${OUT_FILE}，共 ${cases.length} 个案例`);
}

main();
