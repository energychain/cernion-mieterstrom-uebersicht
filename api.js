/**
 * Mieterstrom-Teilnehmer-Übersicht — API Client + Demo-Daten
 */

// --- §42c Mieterstrom Community Demo Data ---
var DEMO_MELos = [
  {
    meloId: "melo-ms-erzeugung",
    name: "PV-Anlage Dach MFH (§42c)",
    type: "physical",
    metadata: {
      capacityKw: 30,
      installationType: "roof-mounted",
      location: "Heidelberg-Schlierbach",
      postleitzahl: "69118",
      gemeinschaftId: "MSG-2024-001",
      regelung: "§42c EnWG",
      commissioningDate: "2023-08-15"
    }
  },
  {
    meloId: "melo-ms-ueberschuss",
    name: "Überschusseinspeisung Netz",
    type: "physical",
    metadata: {
      type: "feedin-overflow",
      gemeinschaftId: "MSG-2024-001",
      vNB: "STROMDAO Netze GmbH"
    }
  }
];

// 8 Mieter mit realistischen Verbräuchen
var DEMO_Mieter = [
  { id: "M001", name: "Wohnung 1 (EG)", anteilPct: 12.5, jahresverbrauchKwh: 4200, zaehlerstand: 12450, status: "aktiv", zahlung: 85.50 },
  { id: "M002", name: "Wohnung 2 (EG)", anteilPct: 12.5, jahresverbrauchKwh: 3800, zaehlerstand: 8930, status: "aktiv", zahlung: 78.20 },
  { id: "M003", name: "Wohnung 3 (1.OG)", anteilPct: 12.5, jahresverbrauchKwh: 4500, zaehlerstand: 15200, status: "aktiv", zahlung: 91.00 },
  { id: "M004", name: "Wohnung 4 (1.OG)", anteilPct: 12.5, jahresverbrauchKwh: 4100, zaehlerstand: 10800, status: "aktiv", zahlung: 82.40 },
  { id: "M005", name: "Wohnung 5 (2.OG)", anteilPct: 12.5, jahresverbrauchKwh: 3600, zaehlerstand: 7650, status: "aktiv", zahlung: 74.80 },
  { id: "M006", name: "Wohnung 6 (2.OG)", anteilPct: 12.5, jahresverbrauchKwh: 3900, zaehlerstand: 9210, status: "aktiv", zahlung: 79.90 },
  { id: "M007", name: "Wohnung 7 (DG)", anteilPct: 12.5, jahresverbrauchKwh: 3300, zaehlerstand: 6340, status: "aktiv", zahlung: 68.50 },
  { id: "M008", name: "Wohnung 8 (DG)", anteilPct: 12.5, jahresverbrauchKwh: 3500, zaehlerstand: 7120, status: "aktiv", zahlung: 72.30 }
];

// PV Generation data for 30kWp
function generateMieterstromPV(date) {
  var data = [];
  for (var i = 0; i < 96; i++) {
    var hour = i / 4.0;
    var h = String(Math.floor(hour)).padStart(2, '0');
    var m = String((i % 4) * 15).padStart(2, '0');
    var ts = date + "T" + h + ":" + m + ":00Z";
    var power = 0;
    if (hour >= 6 && hour <= 20) {
      var dayPos = (hour - 6) / 14.0;
      var envelope = Math.sin(dayPos * Math.PI);
      var pf = 0.72;
      power = 30 * pf * envelope;
      var noise = ((ts.split('').reduce(function(a,b){return ((a<<5)-a)+b.charCodeAt(0);},0) % 100) - 50) / 5000;
      power *= (1 + noise);
    }
    data.push({ ts: ts, value: Math.max(0, Math.round(power * 100) / 100) });
  }
  return data;
}

// Total consumption of all 8 apartments
function generateMieterstromConsumption(date) {
  var data = [];
  var baseLoad = 8; // 8 apartments, ~1kW base each
  for (var i = 0; i < 96; i++) {
    var hour = i / 4.0;
    var h = String(Math.floor(hour)).padStart(2, '0');
    var m = String((i % 4) * 15).padStart(2, '0');
    var ts = date + "T" + h + ":" + m + ":00Z";
    var load = baseLoad;
    if (hour >= 7 && hour < 9) load *= 1.8;
    else if (hour >= 18 && hour < 22) load *= 2.2;
    else if (hour >= 1 && hour < 5) load *= 0.4;
    var noise = 0.9 + Math.random() * 0.2;
    data.push({ ts: ts, value: Math.round(load * noise * 100) / 100 });
  }
  return data;
}

var DEMO_DATE = "2026-05-12";
var DEMO_PV = generateMieterstromPV(DEMO_DATE);
var DEMO_CONS = generateMieterstromConsumption(DEMO_DATE);

// Calculate self-consumption
var DEMO_SELFCONSUMPTION = [];
for (var i = 0; i < 96; i++) {
  var pv = DEMO_PV[i].value;
  var cons = DEMO_CONS[i].value;
  var self = Math.min(pv, cons);
  var feedin = Math.max(0, pv - cons);
  DEMO_SELFCONSUMPTION.push({
    ts: DEMO_PV[i].ts,
    pv: pv,
    consumption: cons,
    selfConsumption: self,
    feedin: feedin,
    selfConsumptionRate: pv > 0 ? (self / pv * 100) : 0
  });
}

var DEMO_TIMESERIES = {
  "melo-ms-erzeugung": DEMO_PV,
  "melo-ms-ueberschuss": DEMO_SELFCONSUMPTION.map(function(v) { return { ts: v.ts, value: v.feedin }; })
};

// --- API Client ---
var CERNION_CONFIG_KEY = 'cernion.api.config';

class CernionAPI {
  constructor() {
    this.config = this.loadConfig();
  }
  loadConfig() {
    try {
      var raw = localStorage.getItem(CERNION_CONFIG_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return { baseUrl: 'http://10.0.0.8:3900/api', tenantId: 'agentic-hackathon', token: '' };
  }
  saveConfig(cfg) {
    for (var k in cfg) this.config[k] = cfg[k];
    localStorage.setItem(CERNION_CONFIG_KEY, JSON.stringify(this.config));
  }
  get headers() {
    var h = { 'Content-Type': 'application/json', 'x-tenant-id': this.config.tenantId };
    if (this.config.token) h['Authorization'] = 'Bearer ' + this.config.token;
    return h;
  }
  async get(endpoint) {
    try {
      var res = await fetch(this.config.baseUrl + endpoint, { headers: this.headers });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return res.json();
    } catch (e) { e.isCORS = e.message.indexOf('Failed') >= 0; throw e; }
  }
  async post(endpoint, body) {
    try {
      var res = await fetch(this.config.baseUrl + endpoint, { method: 'POST', headers: this.headers, body: JSON.stringify(body) });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return res.json();
    } catch (e) { e.isCORS = e.message.indexOf('Failed') >= 0; throw e; }
  }
  async listMelos() {
    try { return await this.get('/edm/melos'); }
    catch (e) { return { rows: DEMO_MELos }; }
  }
  async getTimeseries(meloId, obis, from, to) {
    try { return await this.get('/edm/timeseries/' + meloId + '?obis=' + obis + '&from=' + from + '&to=' + to); }
    catch (e) {
      var vals = (DEMO_TIMESERIES[meloId] || []).map(function(v) { return v.value; });
      return { success: true, meloId: meloId, values: DEMO_TIMESERIES[meloId] || [],
        summary: { total_kwh: vals.reduce(function(s,v){return s+v/4;},0).toFixed(2) } };
    }
  }
}

var api = new CernionAPI();
