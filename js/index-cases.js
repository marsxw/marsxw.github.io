(function () {
  "use strict";

  var S = window.CasesShared;
  var grid = document.getElementById("cases-grid");
  var filtersEl = document.getElementById("cases-filters");
  if (!grid || !filtersEl) return;

  var allData = null;
  var activeFilter = "all";

  function renderFilters(categories) {
    var html =
      '<button type="button" class="active" data-filter="all">全部</button>';
    categories.forEach(function (cat) {
      html +=
        '<button type="button" data-filter="' +
        S.escapeHtml(cat) +
        '">' +
        S.escapeHtml(cat) +
        "</button>";
    });
    filtersEl.innerHTML = html;

    filtersEl.querySelectorAll("button").forEach(function (btn) {
      btn.addEventListener("click", function () {
        activeFilter = btn.getAttribute("data-filter");
        filtersEl.querySelectorAll("button").forEach(function (b) {
          b.classList.remove("active");
        });
        btn.classList.add("active");
        renderGrid();
      });
    });
  }

  function renderGrid() {
    if (!allData) return;
    var cases = allData.cases.filter(function (c) {
      return activeFilter === "all" || c.category === activeFilter;
    });

    if (!cases.length) {
      grid.innerHTML =
        '<p class="cases-empty">暂无案例，请在 <code>assets/&lt;项目名&gt;/</code> 下添加封面与简介。</p>';
      return;
    }

    grid.innerHTML = cases
      .map(function (c) {
        var thumb = c.cover
          ? '<img src="' +
            S.escapeHtml(c.cover) +
            '" alt="' +
            S.escapeHtml(c.title) +
            ' 封面" loading="lazy" decoding="async">'
          : '<span class="case-thumb-placeholder">暂无封面</span>';
        var tag = c.category
          ? '<span class="tag">' + S.escapeHtml(c.category) + "</span>"
          : "";
        var summary = c.summary
          ? S.escapeHtml(c.summary)
          : "点击查看项目详情";

        return (
          '<article class="case-card" data-category="' +
          S.escapeHtml(c.category) +
          '">' +
          '<a class="case-card-link" href="' +
          S.caseDetailUrl(c.id) +
          '">' +
          '<div class="case-thumb">' +
          thumb +
          "</div>" +
          '<div class="case-body">' +
          '<div class="case-meta">' +
          tag +
          "</div>" +
          "<h3>" +
          S.escapeHtml(c.title) +
          "</h3>" +
          '<p class="desc">' +
          summary +
          "</p>" +
          '<div class="case-links"><span class="go-detail">查看详情 →</span></div>' +
          "</div></a></article>"
        );
      })
      .join("");
  }

  S.loadCases()
    .then(function (data) {
      allData = data;
      renderFilters(data.categories || []);
      renderGrid();
    })
    .catch(function () {
      grid.innerHTML =
        '<p class="cases-empty">案例列表加载失败，请确认已运行 <code>node scripts/build-cases.mjs</code> 并存在 <code>data/cases.json</code>。</p>';
    });
})();
