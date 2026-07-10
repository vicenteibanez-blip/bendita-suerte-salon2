(function () {
  "use strict";
  var list = document.querySelector("[data-credits]");
  if (!list) return;

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  fetch("assets/credits.json")
    .then(function (r) { return r.json(); })
    .then(function (credits) {
      var html = Object.keys(credits).map(function (id) {
        var c = credits[id];
        var creatorHtml = c.creator_url
          ? '<a href="' + esc(c.creator_url) + '" target="_blank" rel="noopener" style="color:var(--accent-ink)">' + esc(c.creator) + "</a>"
          : esc(c.creator);
        return (
          "<li><strong>" + esc(c.title) + "</strong> — " + creatorHtml + " (" + esc(c.source) + ") · " +
          '<a href="' + esc(c.license_url) + '" target="_blank" rel="noopener" style="color:var(--accent-ink)">' +
          esc((c.license || "").toUpperCase()) + " " + esc(c.license_version || "") + "</a> · " +
          '<a href="' + esc(c.foreign_landing_url) + '" target="_blank" rel="noopener" style="color:var(--accent-ink)">Ver original ↗</a></li>'
        );
      }).join("");
      list.innerHTML = html || "<li>Sin créditos registrados.</li>";
    })
    .catch(function () {
      list.innerHTML = "<li>No se pudieron cargar los créditos.</li>";
    });
})();
