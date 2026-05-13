# 🏘️ Mieterstrom-Teilnehmer-Übersicht

> **Agentic-Hackathon Lauf #3** — Ein lauffähiges UI-Tool für Kundenservice, das den Mehrwert von [Cernion a²mdm](https://github.com/energychain/cernion-energy-tools) demonstriert.

[![Live Demo](https://img.shields.io/badge/🚀_Live_Demo-GitHub_Pages-e8b339)](https://energychain.github.io/cernion-mieterstrom-uebersicht)
[![Cernion](https://img.shields.io/badge/Powered_by-Cernion_a²mdm-16213e)](https://github.com/energychain/cernion-energy-tools)
[![License](https://img.shields.io/badge/License-AGPL--3.0-blue)](LICENSE)

---

## 🎯 Der Use Case

**Medien-Anker:** §42c EnWG und Mieterstrom als Wachstumsmarkt — Stadtwerke müssen Teilnehmer transparent abrechnen und den Eigenverbrauchsanteil kommunizieren.

> **„Als Kundenservice-Mitarbeiter eines Stadtwerks möchte ich für jede §42c-Mieterstromgemeinschaft auf einen Blick sehen: Wer sind die Teilnehmer? Wie hoch ist ihr Verbrauch? Wie viel PV-Strom wurde selbst verbraucht vs. eingespeist? Und was kostet das im Jahr?“**

---

## 🖥️ Was das Tool zeigt

| Feature | Beschreibung |
|---------|-------------|
| **Dashboard** | KPI-Übersicht: Mieteranzahl, PV-Leistung, Ø Eigenverbrauchsrate, Tagesüberschuss |
| **Erzeugungs-Chart** | Gestapeltes Balkendiagramm: Eigenverbrauch (grün), Überschusseinspeisung (blau), Netzbezug (rot) — pro 15-Min |
| **Teilnehmerverzeichnis** | 8 Mieter mit Anteil, Jahresverbrauch, Zählerstand, Status, Monatsrate |
| **Abrechnungs-Prognose** | Automatische Jahresabrechnung pro Mieter: Grundpreis + Arbeitspreis (Mieterstromtarif 28 ct/kWh) |
| **§42c Hinweis** | Regulatorischer Kontext: Eigenverbrauchsanteil + Ausbaufähigkeit |
| **API-Konfiguration** | Umschaltbar zwischen Dev- und Produktiv-API, Tenant-isoliert |

---

## 🏗️ Technischer Stack

| Ebene | Technologie | Begründung |
|-------|------------|------------|
| **Frontend** | HTML5 + CSS3 + ES6 (Vanilla) | Zero-Build, sofort deploybar |
| **Styling** | [Pico.css](https://picocss.com) | Professioneller Dark-Mode |
| **Charts** | [Chart.js](https://chartjs.org) | Gestapelte Balken für Stacking-Effekt |
| **Backend** | Cernion a²mdm Dev-API | Alle Daten aus Master-Data-Management |
| **Hosting** | GitHub Pages | Kostenlos, jeder Fork = eigene Demo-URL |

---

## 🚀 Schnellstart

### 1. Live-Demo testen
👉 **[energychain.github.io/cernion-mieterstrom-uebersicht](https://energychain.github.io/cernion-mieterstrom-uebersicht)**

### 2. Lokal ausführen
```bash
git clone https://github.com/energychain/cernion-mieterstrom-uebersicht.git
cd cernion-mieterstrom-uebersicht
# Einfach index.html im Browser öffnen
```

### 3. API-Konfiguration
- Standard: `http://10.0.0.8:3900/api` (Dev-API)
- Tenant: `agentic-hackathon`
- Für Produktion: URL und Token in den Einstellungen anpassen

---

## 💡 Der Cernion-Mehrwert

| Ohne Cernion | Mit Cernion a²mdm |
|-------------|-------------------|
| Manuelle Excel-Listen für Teilnehmer, Zählerstände, Abrechnung | **Eine API** — alle MeLos, Verbräuche und §42c-Metadaten zentralisiert |
| Eigenverbrauchsquote muss manuell aus Erzeugung/Verbrauch berechnet werden | **Automatische Berechnung** aus synchronisierten Zeitreihen |
| Keine Echtzeit-Sicht auf Tagesüberschuss | **Live-Chart** aus 15-Min-Zeitreihen |
| Separate Abrechnungssysteme für Strom/EEG/Mieterstrom | **Einheitliche Datenbasis** — Tenant-isoliert, auditierbar |
| Keine regulatorische Dokumentation | **Deterministische Pipeline** — BNetzA-tauglich |

---

## 📊 Demo-Daten (Tenant: `agentic-hackathon`)

### Mieterstrom-Gemeinschaft
| Attribut | Wert |
|----------|------|
| **Gemeinschafts-ID** | MSG-2024-001 |
| **Regelung** | §42c EnWG |
| **Standort** | Heidelberg-Schlierbach, 69118 |
| **PV-Anlage** | 30 kWp Dach (Inbetriebnahme 15.08.2023) |
| **Mieter** | 8 aktive Teilnehmer |

### Teilnehmer
| ID | Wohnung | Anteil | Jahresverbrauch | Zählerstand | Status | Monatsrate |
|----|---------|--------|----------------|-------------|--------|------------|
| M001 | Wohnung 1 (EG) | 12.5% | 4.200 kWh | 12.450 kWh | aktiv | 85,50 € |
| M002 | Wohnung 2 (EG) | 12.5% | 3.800 kWh | 8.930 kWh | aktiv | 78,20 € |
| M003 | Wohnung 3 (1.OG) | 12.5% | 4.500 kWh | 15.200 kWh | aktiv | 91,00 € |
| M004 | Wohnung 4 (1.OG) | 12.5% | 4.100 kWh | 10.800 kWh | aktiv | 82,40 € |
| M005 | Wohnung 5 (2.OG) | 12.5% | 3.600 kWh | 7.650 kWh | aktiv | 74,80 € |
| M006 | Wohnung 6 (2.OG) | 12.5% | 3.900 kWh | 9.210 kWh | aktiv | 79,90 € |
| M007 | Wohnung 7 (DG) | 12.5% | 3.300 kWh | 6.340 kWh | aktiv | 68,50 € |
| M008 | Wohnung 8 (DG) | 12.5% | 3.500 kWh | 7.120 kWh | aktiv | 72,30 € |

### Tagesbilanz (Beispiel)
| Posten | Wert |
|--------|------|
| PV-Erzeugung | ~162 kWh |
| Gesamtverbrauch | ~153 kWh |
| Eigenverbrauchsanteil | ~67% |
| Überschusseinspeisung | ~53 kWh |

---

## 🧩 Architektur

```
┌─────────────────────────────────────────┐
│  GitHub Pages (Static HTML/JS/CSS)      │
│  ┌─────────┐ ┌──────────┐ ┌──────────┐  │
│  │  HTML   │ │  Chart   │ │  API.js  │  │
│  │  Shell  │ │   .js    │ │  Client  │  │
│  └────┬────┘ └────┬─────┘ └────┬─────┘  │
│       └────────────┴────────────┘        │
│                   │ Fetch API            │
└───────────────────┼─────────────────────┘
                    │
        ┌───────────┴────────────┐
        │  Cernion a²mdm Dev-API  │
        │  127.0.0.1:3900 /        │
        │  10.0.0.8:3900           │
        ├──────────────────────────┤
        │  EDM Service             │
        │  Energy Sharing Service  │
        │  (Tenant-isoliert)       │
        └──────────────────────────┘
```

---

## 📄 Lizenz

AGPL-3.0 — wie das komplette [cernion-energy-tools](https://github.com/energychain/cernion-energy-tools)-Ökosystem.

---

## 🙋‍♂️ Autor

Erstellt im Rahmen des **Cernion Agentic Hackathon 2026** von Thorsten Zörner & Hermes Agent.
Betrieben von [STROMDAO GmbH](https://stromdao.com).
