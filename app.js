/**
 * Mieterstrom-Teilnehmer-Übersicht — App Logic
 * Kundenservice-Tool für §42c Energiegemeinschaften
 */

var chartInstances = {};
var isDemoMode = false;

// ===== Startup =====
document.addEventListener('DOMContentLoaded', function() {
  initSettings();
  setupTabs();
  testConnection().then(function(connected) {
    if (!connected) {
      isDemoMode = true;
      var badge = document.getElementById('demo-badge');
      if (badge) badge.style.display = 'block';
    }
    loadDashboard();
  });
});

function testConnection() {
  return new Promise(function(resolve) {
    api.get('api/openapi.json').then(function() { resolve(true); }).catch(function() { resolve(false); });
  });
}

function switchTab(tabId) {
  document.querySelectorAll('nav[aria-label="breadcrumb"] button').forEach(function(btn) {
    btn.classList.remove('active');
    if (btn.dataset.tab === tabId) btn.classList.add('active');
  });
  document.querySelectorAll('.tab-panel').forEach(function(p) { p.classList.remove('active'); });
  var panel = document.getElementById(tabId);
  if (panel) panel.classList.add('active');
  if (tabId === 'dashboard') loadDashboard();
  if (tabId === 'teilnehmer') loadTeilnehmer();
  if (tabId === 'abrechnung') loadAbrechnung();
  if (tabId === 'einstellungen') loadSettings();
}

function setupTabs() {
  document.querySelectorAll('nav[aria-label="breadcrumb"] button').forEach(function(btn) {
    btn.addEventListener('click', function() { switchTab(btn.dataset.tab); });
  });
}

// ===== Dashboard =====
function loadDashboard() {
  showLoading(true);
  api.listMelos().then(function(melos) {
    renderDashboard(melos.rows || []);
    renderMieterstromChart();
    showLoading(false);
  }).catch(function(e) {
    renderDashboard(DEMO_MELos);
    renderMieterstromChart();
    showLoading(false);
  });
}

function renderDashboard(melos) {
  var container = document.getElementById('dashboard-cards');
  if (!container) return;
  container.innerHTML = '';

  var pvMelo = melos.find(function(m) { return m.meloId === 'melo-ms-erzeugung'; });
  var totalMieter = DEMO_Mieter.length;
  var totalVerbrauch = DEMO_Mieter.reduce(function(s, m) { return s + m.jahresverbrauchKwh; }, 0);
  var avgEigenverbrauch = DEMO_SELFCONSUMPTION.reduce(function(s, v) { return s + v.selfConsumptionRate; }, 0) / DEMO_SELFCONSUMPTION.length;
  var totalUeberschuss = DEMO_SELFCONSUMPTION.reduce(function(s, v) { return s + v.feedin; }, 0) / 4;

  var kpiHtml = '<div class="grid kpi-grid">' +
    '<article class="kpi-card"><h3>Mieter</h3>' +
    '<p class="kpi-value">' + totalMieter + '</p><small>Aktive Teilnehmer</small></article>' +
    '<article class="kpi-card"><h3>PV-Leistung</h3>' +
    '<p class="kpi-value">' + (pvMelo ? pvMelo.metadata.capacityKw : 30) + ' <span>kWp</span></p>' +
    '<small>Dach-Anlage</small></article>' +
    '<article class="kpi-card"><h3>Ø Eigenverbrauch</h3>' +
    '<p class="kpi-value">' + avgEigenverbrauch.toFixed(1) + ' <span>%</span></p>' +
    '<small>Tagesdurchschnitt</small></article>' +
    '<article class="kpi-card"><h3>Tagesüberschuss</h3>' +
    '<p class="kpi-value">' + (totalUeberschuss / 1000).toFixed(2) + ' <span>MWh</span></p>' +
    '<small>Eingespeist</small></article>' +
    '</div>';

  container.innerHTML = kpiHtml;
}

function renderMieterstromChart() {
  var canvas = document.getElementById('mieterstrom-chart');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');

  var labels = DEMO_SELFCONSUMPTION.map(function(v) { return v.ts.slice(11, 16); });
  var pvData = DEMO_SELFCONSUMPTION.map(function(v) { return v.pv; });
  var consData = DEMO_SELFCONSUMPTION.map(function(v) { return v.consumption; });
  var selfData = DEMO_SELFCONSUMPTION.map(function(v) { return v.selfConsumption; });
  var feedinData = DEMO_SELFCONSUMPTION.map(function(v) { return v.feedin; });

  if (chartInstances['mieterstrom']) chartInstances['mieterstrom'].destroy();

  chartInstances['mieterstrom'] = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Eigenverbrauch',
          data: selfData,
          backgroundColor: '#2a8a2a',
          stack: 'Stack0'
        },
        {
          label: 'Überschuss (Einspeisung)',
          data: feedinData,
          backgroundColor: '#5a8abf',
          stack: 'Stack0'
        },
        {
          label: 'Netzbezug',
          data: consData.map(function(c, i) { return Math.max(0, c - pvData[i]); }),
          backgroundColor: '#d05050',
          stack: 'Stack1'
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        tooltip: {
          callbacks: {
            label: function(ctx) {
              return ctx.dataset.label + ': ' + ctx.parsed.y.toFixed(2) + ' kW';
            }
          }
        }
      },
      scales: {
        x: { stacked: true, grid: { display: false }, ticks: { maxTicksLimit: 8 } },
        y: { stacked: true, title: { display: true, text: 'kW' }, beginAtZero: true }
      }
    }
  });
}

// ===== Teilnehmer =====
function loadTeilnehmer() {
  var tbody = document.querySelector('#teilnehmer-table tbody');
  if (!tbody) return;
  tbody.innerHTML = '';

  DEMO_Mieter.forEach(function(m) {
    var row = document.createElement('tr');
    row.innerHTML = '<td><strong>' + m.name + '</strong></td>' +
      '<td>' + m.anteilPct + '%</td>' +
      '<td>' + m.jahresverbrauchKwh.toLocaleString('de-DE') + ' kWh</td>' +
      '<td>' + m.zaehlerstand.toLocaleString('de-DE') + ' kWh</td>' +
      '<td><span class="badge badge-' + m.status + '">' + m.status + '</span></td>' +
      '<td>' + m.zahlung.toFixed(2) + ' €</td>';
    tbody.appendChild(row);
  });
}

// ===== Abrechnung =====
function loadAbrechnung() {
  var container = document.getElementById('abrechnung-content');
  if (!container) return;

  var totalPvKwh = DEMO_PV.reduce(function(s, v) { return s + v.value / 4; }, 0);
  var totalConsKwh = DEMO_CONS.reduce(function(s, v) { return s + v.value / 4; }, 0);
  var eigenverbrauchKwh = Math.min(totalPvKwh, totalConsKwh);
  var ueberschussKwh = Math.max(0, totalPvKwh - totalConsKwh);
  var eigenverbrauchRate = totalPvKwh > 0 ? (eigenverbrauchKwh / totalPvKwh * 100) : 0;

  // Preise
  var strompreisCt = 32; // ct/kWh
  var eegVerguetungCt = 8.2; // ct/kWh Überschuss
  var ersparnis = eigenverbrauchKwh * strompreisCt / 100;
  var eegEinnahmen = ueberschussKwh * eegVerguetungCt / 100;

  var html = '<div class="grid kpi-grid">' +
    '<article class="kpi-card"><h3>Tageserzeugung</h3>' +
    '<p class="kpi-value">' + totalPvKwh.toFixed(1) + ' <span>kWh</span></p></article>' +
    '<article class="kpi-card"><h3>Tagesverbrauch</h3>' +
    '<p class="kpi-value">' + totalConsKwh.toFixed(1) + ' <span>kWh</span></p></article>' +
    '<article class="kpi-card"><h3>Eigenverbrauchsanteil</h3>' +
    '<p class="kpi-value">' + eigenverbrauchRate.toFixed(1) + ' <span>%</span></p></article>' +
    '<article class="kpi-card"><h3>Tagesersparnis</h3>' +
    '<p class="kpi-value">' + ersparnis.toFixed(2) + ' <span>€</span></p></article>' +
    '</div>' +
    '<h3>Prognostizierte Jahresabrechnung (8 Mieter)</h3>' +
    '<table><thead><tr><th>Mieter</th><th>Anteil</th><th>Verbrauch</th>' +
    '<th>Grundpreis</th><th>Arbeitspreis</th><th>Gesamt/Jahr</th></tr></thead><tbody>';

  DEMO_Mieter.forEach(function(m) {
    var grundpreis = 120; // €/Jahr
    var arbeitspreis = (m.jahresverbrauchKwh * 0.28); // 28 ct/kWh Mieterstromtarif
    var gesamt = grundpreis + arbeitspreis;
    html += '<tr><td><strong>' + m.name + '</strong></td>' +
      '<td>' + m.anteilPct + '%</td>' +
      '<td>' + m.jahresverbrauchKwh.toLocaleString('de-DE') + ' kWh</td>' +
      '<td>' + grundpreis.toFixed(2) + ' €</td>' +
      '<td>' + arbeitspreis.toFixed(2) + ' €</td>' +
      '<td><strong>' + gesamt.toFixed(2) + ' €</strong></td></tr>';
  });

  var jahresTotal = DEMO_Mieter.reduce(function(s, m) {
    return s + 120 + (m.jahresverbrauchKwh * 0.28);
  }, 0);

  html += '</tbody><tfoot><tr><td colspan="5"><strong>Jahresgesamterlös</strong></td>' +
    '<td><strong>' + jahresTotal.toFixed(2) + ' €</strong></td></tr></tfoot></table>' +
    '<div class="info-box" style="margin-top:1.5rem;">' +
    '<h4>ℹ️ §42c EnWG Hinweis</h4>' +
    '<p>Diese Mieterstromgemeinschaft arbeitet nach §42c EnWG. ' +
    'Der Eigenverbrauchsanteil von ' + eigenverbrauchRate.toFixed(1) + '% ist ' +
    (eigenverbrauchRate > 30 ? 'optimal' : 'ausbaufähig') +
    '. Die prognostizierten Zahlen basieren auf dem aktuellen Tagesprofil ' +
    'und sind saisonal zu adjustieren.</p></div>';

  container.innerHTML = html;
}

// ===== Settings =====
function initSettings() {
  var form = document.getElementById('settings-form');
  if (!form || form._initialized) return;
  form._initialized = true;
  form.onsubmit = function(e) {
    e.preventDefault();
    api.saveConfig({
      baseUrl: document.getElementById('cfg-url').value,
      tenantId: document.getElementById('cfg-tenant').value,
      token: document.getElementById('cfg-token').value
    });
    alert('Einstellungen gespeichert');
  };
}

function loadSettings() {
  document.getElementById('cfg-url').value = api.config.baseUrl;
  document.getElementById('cfg-tenant').value = api.config.tenantId;
  document.getElementById('cfg-token').value = api.config.token;
}

function showLoading(show) {
  var el = document.getElementById('loading');
  if (el) el.style.display = show ? 'block' : 'none';
}
function showError(msg) {
  var el = document.getElementById('error');
  if (!el) return;
  el.textContent = msg;
  el.style.display = 'block';
  setTimeout(function() { el.style.display = 'none'; }, 5000);
}
