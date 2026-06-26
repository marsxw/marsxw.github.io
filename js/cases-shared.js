(function (global) {
  "use strict";

  var CASES_URL = "data/cases.json";

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function caseDetailUrl(id) {
    return "case.html?id=" + encodeURIComponent(id);
  }

  function loadCases() {
    return fetch(CASES_URL, { cache: "no-cache" }).then(function (res) {
      if (!res.ok) throw new Error("无法加载案例数据");
      return res.json();
    });
  }

  function findCase(data, id) {
    if (!data || !data.cases) return null;
    return data.cases.find(function (c) {
      return c.id === id;
    }) || null;
  }

  function renderIntroHtml(intro) {
    if (!intro) return "";
    return intro
      .split(/\n\s*\n/)
      .map(function (block) {
        return block.trim();
      })
      .filter(Boolean)
      .map(function (p) {
        return "<p>" + escapeHtml(p).replace(/\n/g, "<br>") + "</p>";
      })
      .join("");
  }

  function videoMime(type) {
    var map = {
      mp4: "video/mp4",
      webm: "video/webm",
      mov: "video/quicktime",
      m4v: "video/mp4",
      ogv: "video/ogg",
    };
    return map[type] || "video/mp4";
  }

  function renderVideos(videos) {
    if (!videos || !videos.length) return "";
    var html =
      '<section class="block"><h2>演示视频</h2><div class="demo-videos">';
    videos.forEach(function (v) {
      html +=
        '<figure class="figure-video"><video controls playsinline preload="metadata">' +
        '<source src="' +
        escapeHtml(v.path) +
        '" type="' +
        videoMime(v.type) +
        '">' +
        "您的浏览器不支持 HTML5 视频播放。" +
        "</video></figure>";
    });
    html += "</div></section>";
    return html;
  }

  function renderGallery(images) {
    if (!images || !images.length) return "";
    var html = '<section class="block"><h2>项目图片</h2><div class="case-gallery">';
    images.forEach(function (img) {
      html +=
        '<figure class="figure figure-gallery"><img src="' +
        escapeHtml(img.path) +
        '" alt="' +
        escapeHtml(img.name) +
        '" loading="lazy" decoding="async"></figure>';
    });
    html += "</div></section>";
    return html;
  }

  global.CasesShared = {
    CASES_URL: CASES_URL,
    escapeHtml: escapeHtml,
    caseDetailUrl: caseDetailUrl,
    loadCases: loadCases,
    findCase: findCase,
    renderIntroHtml: renderIntroHtml,
    renderVideos: renderVideos,
    renderGallery: renderGallery,
    videoMime: videoMime,
  };
})(typeof window !== "undefined" ? window : globalThis);
