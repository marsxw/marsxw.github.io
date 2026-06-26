(function () {
  "use strict";

  var S = window.CasesShared;
  var main = document.getElementById("case-main");
  if (!main) return;

  var params = new URLSearchParams(window.location.search);
  var id = params.get("id");

  if (!id) {
    main.innerHTML =
      '<p class="cases-empty">未指定案例。请从<a href="index.html#cases">首页</a>选择项目。</p>';
    return;
  }

  S.loadCases()
    .then(function (data) {
      var c = S.findCase(data, id);
      if (!c) {
        main.innerHTML =
          '<a class="back" href="index.html#cases">← 返回案例列表</a>' +
          '<p class="cases-empty">未找到案例「' +
          S.escapeHtml(id) +
          "」。请重新运行构建脚本后刷新。</p>";
        document.title = "案例未找到 — 茂名仟鑫科技";
        return;
      }

      document.title = c.title + " — 茂名仟鑫科技";
      var meta = document.querySelector('meta[name="description"]');
      if (meta) meta.setAttribute("content", c.summary || c.title);

      var tag = c.category
        ? '<span class="tag">' + S.escapeHtml(c.category) + "</span>"
        : "";
      var introUnderTitle = "";
      if (c.intro) {
        introUnderTitle =
          '<div class="intro-body intro-under-title">' +
          S.renderIntroHtml(c.intro) +
          "</div>";
      } else if (c.summary) {
        introUnderTitle =
          '<p class="lead">' + S.escapeHtml(c.summary) + "</p>";
      }

      var coverHtml = c.cover
        ? '<figure class="figure"><img src="' +
          S.escapeHtml(c.cover) +
          '" alt="' +
          S.escapeHtml(c.title) +
          ' 封面" decoding="async"></figure>'
        : "";

      main.innerHTML =
        '<a class="back" href="index.html#cases">← 返回案例列表</a>' +
        '<header class="detail-header">' +
        tag +
        "<h1>" +
        S.escapeHtml(c.title) +
        "</h1>" +
        introUnderTitle +
        "</header>" +
        coverHtml +
        S.renderVideos(c.videos) +
        S.renderGallery(c.images);
    })
    .catch(function () {
      main.innerHTML =
        '<p class="cases-empty">无法加载案例数据。</p>';
    });
})();
