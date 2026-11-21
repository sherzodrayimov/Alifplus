(function () {
  'use strict';
  var KEY = 'alif_design_variant';
  var THEMES = [
    { id: 'default', name: '1. Standart Alif+', colors: ['#10b981', '#0f172a'] },
    { id: 'emerald', name: '2. Zumrad & Qog‘oz', colors: ['#059669', '#faf8f5'] },
    { id: 'cobalt',  name: '3. Moviy Ufq',      colors: ['#2563eb', '#06b6d4'] },
    { id: 'obsidian',name: '4. Obsidian & Oltin',colors: ['#d97706', '#18181b'] }
  ];

  function applyDesign(id) {
    if (!id || id === 'default') {
      document.documentElement.removeAttribute('data-design');
    } else {
      document.documentElement.setAttribute('data-design', id);
    }
    try { localStorage.setItem(KEY, id || 'default'); } catch (e) {}
    document.querySelectorAll('.alif-studio-opt').forEach(function (btn) {
      btn.classList.toggle('is-selected', btn.getAttribute('data-id') === (id || 'default'));
    });
  }

  var saved = 'default';
  try { saved = localStorage.getItem(KEY) || 'default'; } catch (e) {}
  applyDesign(saved);

  var dock = document.createElement('div');
  dock.className = 'alif-studio-dock';
  dock.innerHTML =
    '<div class="alif-studio-menu" id="alifStudioMenu">' +
      THEMES.map(function (t) {
        return '<button type="button" class="alif-studio-opt" data-id="' + t.id + '">' +
          '<span>' + t.name + '</span>' +
          '<span class="alif-studio-dots">' +
            '<i style="background:' + t.colors[0] + '"></i>' +
            '<i style="background:' + t.colors[1] + '"></i>' +
          '</span>' +
        '</button>';
      }).join('') +
    '</div>' +
    '<button type="button" class="alif-studio-toggle" id="alifStudioBtn">' +
      '<span>🎨 Dizayn varianti</span>' +
    '</button>';
  document.body.appendChild(dock);

  var menu = document.getElementById('alifStudioMenu');
  document.getElementById('alifStudioBtn').addEventListener('click', function () {
    menu.classList.toggle('is-open');
  });
  dock.querySelectorAll('.alif-studio-opt').forEach(function (btn) {
    btn.addEventListener('click', function () {
      applyDesign(btn.getAttribute('data-id'));
      menu.classList.remove('is-open');
    });
  });
  applyDesign(saved);
})();
