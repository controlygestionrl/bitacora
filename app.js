/* Informe Diario de Operaciones · Río Loa · versión gratuita (GitHub Pages + Google Apps Script) */
(function () {
'use strict';

// =================================================================== utilidades
const API = window.APP_API || '';
const LOGO = 'rioloa-logo.png';
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const uid = () => (crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2));
const LS = {
  get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} },
  del(k) { try { localStorage.removeItem(k); } catch (e) {} }
};
const SS = {
  get(k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } },
  set(k, v) { try { sessionStorage.setItem(k, v); } catch (e) {} },
  del(k) { try { sessionStorage.removeItem(k); } catch (e) {} }
};
function hoy(d = new Date()) { return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; }
function fcl(iso) { const [y, m, d] = String(iso || '').split('-'); return !y || !m || !d ? (iso || '') : `${d}-${m}-${y}`; }
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const normEmail = e => String(e || '').trim().toLowerCase();
const okEmail = e => EMAIL.test(String(e || '').trim());
const plural = (n, a, b) => `${n} ${n === 1 ? a : b}`;
const fmtCl = (n, d = 0) => Number(n || 0).toLocaleString('es-CL', { maximumFractionDigits: d });
function F(n, d = 2) { if (n === null || n === undefined || Number.isNaN(n)) return '-'; return String(Number(Number(n).toFixed(d))); }
const blank = v => v == null || String(v).trim() === '';
function norm(s) { return String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim(); }

// =================================================================== íconos (trazos lucide)
const IC = {
  truck: '<path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/>',
  machine: '<rect x="2" y="6" width="20" height="8" rx="1"/><path d="M17 14v7"/><path d="M7 14v7"/><path d="M17 3v3"/><path d="M7 3v3"/><path d="M10 14 2.3 6.3"/><path d="m14 6 7.7 7.7"/><path d="m8 6 8 8"/>',
  pin: '<path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/>',
  waves: '<path d="M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/><path d="M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/><path d="M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  checkCircle: '<path d="M21.801 10A10 10 0 1 1 17 3.335"/><path d="m9 11 3 3L22 4"/>',
  alert: '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
  alertCircle: '<circle cx="12" cy="12" r="10"/><path d="M12 8v4"/><path d="M12 16h.01"/>',
  info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>',
  x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
  plus: '<path d="M5 12h14"/><path d="M12 5v14"/>',
  trash: '<path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>',
  pencil: '<path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/><path d="m15 5 4 4"/>',
  eye: '<path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/>',
  download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5"/><path d="M12 15V3"/>',
  send: '<path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z"/><path d="m21.854 2.147-10.94 10.939"/>',
  file: '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/>',
  image: '<path d="M16 5h6"/><path d="M19 2v6"/><path d="M21 11.5V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7.5"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/><circle cx="9" cy="9" r="2"/>',
  replace: '<path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/>',
  chevDown: '<path d="m6 9 6 6 6-6"/>',
  chevUp: '<path d="m18 15-6-6-6 6"/>',
  sort: '<path d="m7 15 5 5 5-5"/><path d="m7 9 5-5 5 5"/>',
  menu: '<path d="M4 12h16"/><path d="M4 6h16"/><path d="M4 18h16"/>',
  sliders: '<path d="M21 4h-7"/><path d="M10 4H3"/><path d="M21 12h-9"/><path d="M8 12H3"/><path d="M21 20h-5"/><path d="M12 20H3"/><path d="M14 2v4"/><path d="M8 10v4"/><path d="M16 18v4"/>',
  user: '<circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 0 0-16 0"/>',
  lock: '<rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
  login: '<path d="m10 17 5-5-5-5"/><path d="M15 12H3"/><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>',
  back: '<path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>',
  message: '<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>',
  history: '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l4 2"/>',
  reset: '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>',
  arrowRight: '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
  cloudOff: '<path d="m2 2 20 20"/><path d="M5.782 5.782A7 7 0 0 0 9 19h8.5a4.5 4.5 0 0 0 1.307-.193"/><path d="M21.532 16.5A4.5 4.5 0 0 0 17.5 10h-1.79A7.008 7.008 0 0 0 10 5.07"/>'
};
function ic(name, size = 16, extra = '') { return `<svg class="ic ${extra}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${IC[name] || ''}</svg>`; }

// =================================================================== configuración por defecto
const DEFAULT_CONFIG = {
  generalAreas: [{ id: 'ga-pozas', name: 'Pozas' }],
  activityAreas: ['Poza 7', 'Poza 8', 'Poza 9D', 'Poza 13', 'Poza 14', 'Poza 24', 'B4', 'Botadero 0502', 'Cancha Halita', 'Patio RIP', 'Otro'].map(n => ({ id: 'aa-' + norm(n).replace(/[^a-z0-9]+/g, '-'), name: n })),
  equipment: [
    ...['TVFZ-13', 'TYGB-99', 'TYGC-17', 'TYGB-69', 'TYGC-27', 'VCCW73', 'VCCW69', 'VCCW68', 'VCCW65', 'TVKT41'].map(c => ({ id: c.toLowerCase(), code: c, type: 'truck', capacityM3: 18 })),
    ...['EXC VRDH 65', 'EXC VRDK-44', 'EXC VFB2-12', 'CF TTFK-98'].map(c => ({ id: norm(c).replace(/[^a-z0-9]+/g, '-'), code: c, type: 'machinery', capacityM3: null }))
  ]
};
const DEFAULT_SITE = { administrativo: 'Octavio Waiz', cliente: 'NOVANDINO', area: 'Área de Pozas', subtitulo: 'Área de Pozas · SQM', pie: 'RT RIOLOA - NOVANDINO  |  www.rio-loa.cl  |  Antofagasta: Av. Industrial 7363' };
const ACTIVITY_TYPES = ['Cosecha perimetral', 'Retiro de Material', 'Movimiento de material', 'Reparación y mantenimiento de Botadero', 'Confección de bafle', 'Carguío', 'Perfilado de accesos', 'Excavación', 'Otro'];
const DEPTHS = [.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8];
const HARDNESS = [{ value: 25, label: '25% - Baja', cls: 'h25' }, { value: 50, label: '50% - Media', cls: 'h50' }, { value: 75, label: '75% - Alta', cls: 'h75' }, { value: 100, label: '100% - Muy alta', cls: 'h100' }];
const depthLabel = d => `${String(d).replace('.', ',')} m`;
const STATUS = { IN_REVIEW: 'En revisión', APPROVED: 'Aprobado', REJECTED: 'Rechazado', SEND_FAILED: 'Error de envío' };
const STATUS_CHIP = { IN_REVIEW: 'pending', APPROVED: 'ready', REJECTED: 'error', SEND_FAILED: 'warning', QUEUED: 'warning' };
const NAV = [{ to: 'dashboard', label: 'Dashboard' }, { to: 'history', label: 'Historial' }, { to: 'report', label: 'Generar informe' }];

// =================================================================== modelo del informe
function newWatermaster() { return { id: uid(), kind: 'watermaster', area: '', type: 'Draga Watermaster', description: '', equipmentAssignments: [], supportEquipment: '', collapsed: false, watermaster: { sector: '', operator: '', hourmeterStart: '', hourmeterEnd: '', pumpHourmeterStart: '', pumpHourmeterEnd: '', depth: null, hardness: null, manufacturerPerformance: '' } }; }
function newGeneric() { return { id: uid(), kind: 'generic', area: '', type: '', description: '', equipmentAssignments: [], supportEquipment: '', collapsed: false }; }
function newReport() { return { date: hoy(), supervisor: '', area: '', apr: '', roster: [], activities: [newWatermaster()] }; }

// --- cálculos (idénticos a la referencia)
function diff(a, b) { if (a === '' || b === '' || a == null || b == null) return null; const n = Number(a), r = Number(b); return Number.isNaN(n) || Number.isNaN(r) ? null : r - n; }
const MSG12 = 'La diferencia entre horómetros supera las 12 horas. Corrobora la información ingresada.';
const MSGNEG = 'El horómetro final debe ser igual o mayor al inicial.';
const MSGROSTERERR = 'Los datos de Dotación activa de este equipo contienen errores.';
const MSGNOROSTER = 'Este equipo no tiene datos en Dotación activa.';
const MSGKM = 'El kilometraje final debe ser igual o mayor al inicial.';
function hourErr(s, e) { if (!String(s).trim() || !String(e).trim()) return null; const n = diff(s, e); return n === null ? null : n < 0 ? MSGNEG : n > 12 ? MSG12 : null; }
function kmErr(s, e) { if (!String(s ?? '').trim() || !String(e ?? '').trim()) return null; const n = diff(s, e); return n === null ? null : n < 0 ? MSGKM : null; }
const rosterOf = (r, id) => r.roster.find(x => x.equipmentId === id);
function rosterReady(e) { return !(!e.operator.trim() || !String(e.hourmeterStart).trim() || !String(e.hourmeterEnd).trim() || hourErr(e.hourmeterStart, e.hourmeterEnd) || e.equipmentType === 'truck' && (!String(e.kmStart ?? '').trim() || !String(e.kmEnd ?? '').trim() || kmErr(e.kmStart, e.kmEnd))); }
function rosterTouched(e) { return !!(e.operator.trim() || String(e.hourmeterStart).trim() || String(e.hourmeterEnd).trim() || String(e.kmStart ?? '').trim() || String(e.kmEnd ?? '').trim()); }
function rosterTip(e) { const t = [e.equipmentCode, `Operador: ${e.operator.trim() || '—'}`, `Horómetro: ${String(e.hourmeterStart).trim() || '—'} → ${String(e.hourmeterEnd).trim() || '—'}`]; if (e.equipmentType === 'truck') t.push(`KM: ${String(e.kmStart ?? '').trim() || '—'} → ${String(e.kmEnd ?? '').trim() || '—'}`); return t.join('\n'); }
function opData(asg, r) { const n = rosterOf(r, asg.equipmentId); return n ? { operator: n.operator, hourmeterStart: n.hourmeterStart, hourmeterEnd: n.hourmeterEnd, kmStart: n.kmStart, kmEnd: n.kmEnd } : { operator: '', hourmeterStart: '', hourmeterEnd: '', kmStart: '', kmEnd: '' }; }
function wmEmpty(a) { if (a.kind !== 'watermaster') return false; const t = a.watermaster; const n = !!(t && (t.sector.trim() || t.operator.trim() || String(t.hourmeterStart).trim() || String(t.hourmeterEnd).trim() || String(t.pumpHourmeterStart).trim() || String(t.pumpHourmeterEnd).trim() || t.depth !== null || t.hardness !== null || String(t.manufacturerPerformance).trim())); return !a.area.trim() && !(a.customArea || '').trim() && !a.description.trim() && !(a.supportEquipment || '').trim() && a.equipmentAssignments.length === 0 && !a.beforePhoto && !a.afterPhoto && !n; }
const wmHours = w => w ? diff(w.hourmeterStart, w.hourmeterEnd) : null;
const wmPump = w => w ? diff(w.pumpHourmeterStart, w.pumpHourmeterEnd) : null;
function wmM3(w) { if (!w) return null; const h = wmHours(w); if (w.manufacturerPerformance === '' || h === null) return null; const n = Number(w.manufacturerPerformance); return Number.isNaN(n) || h <= 0 ? null : n * h; }
function wmRate(w) { const m = wmM3(w), h = wmHours(w); return m === null || h === null || h <= 0 ? null : m / h; }
function capacityOf(id, cfg) { const n = cfg.equipment.find(t => t.id === id); return n?.type === 'truck' && n.capacityM3 != null && n.capacityM3 > 0 ? n.capacityM3 : 18; }
function tripsM3(asg, cfg) { if (asg.equipmentType !== 'truck') return null; if (asg.trips === '' || asg.trips == null) return null; const n = Number(asg.trips); return Number.isNaN(n) || n < 0 ? null : n * capacityOf(asg.equipmentId, cfg); }
function actTruckM3(a, cfg) { return a.equipmentAssignments.filter(e => e.equipmentType === 'truck').reduce((s, e) => s + (tripsM3(e, cfg) ?? 0), 0); }
function actMachM3(a, cfg) { const n = actTruckM3(a, cfg), r = a.equipmentAssignments.filter(e => e.equipmentType === 'machinery').length; return n <= 0 || r <= 0 ? null : n / r; }
const codesOf = a => a.equipmentAssignments.map(e => e.equipmentCode);
const areaOf = a => a.area === 'Otro' && (a.customArea || '').trim() ? a.customArea.trim() : a.area;
const typeOf = a => a.kind === 'watermaster' ? 'Draga Watermaster' : a.type === 'Otro' && (a.customType || '').trim() ? a.customType.trim() : a.type;
function truckRows(r, cfg) { const out = []; for (const a of r.activities) { const z = areaOf(a); for (const s of a.equipmentAssignments) { if (s.equipmentType !== 'truck') continue; const o = opData(s, r); out.push({ activityId: a.id, assignment: s, operator: o.operator, hourmeterStart: o.hourmeterStart, hourmeterEnd: o.hourmeterEnd, kmStart: o.kmStart ?? '', kmEnd: o.kmEnd ?? '', zone: z, totalM3: tripsM3(s, cfg) }); } } return out; }
function truckTotals(r, cfg) { const m = new Map(); for (const a of r.activities) for (const s of a.equipmentAssignments) { if (s.equipmentType !== 'truck') continue; const v = tripsM3(s, cfg) ?? 0; const i = m.get(s.equipmentId) ?? { equipmentId: s.equipmentId, code: s.equipmentCode, totalM3: 0 }; i.totalM3 += v; m.set(s.equipmentId, i); } return [...m.values()].filter(e => e.totalM3 > 0); }
const hasPrefix = (o, p) => Object.keys(o).some(k => k.startsWith(p));
const filled = v => v != null && String(v).trim() !== '';
function actReady(a) { if (!areaOf(a) || !typeOf(a) || a.equipmentAssignments.length === 0 || !a.equipmentAssignments.filter(e => e.equipmentType === 'truck').every(e => filled(e.trips) && Number(e.trips) > 0)) return false; if (a.kind === 'watermaster') { const t = a.watermaster; return t ? filled(t.sector) && filled(t.operator) && t.depth !== null && t.hardness !== null && wmM3(t) !== null : false; } return true; }
function progressOf(r, cfg, errs) {
  const gen = [r.date, r.supervisor, r.area, r.apr], gf = gen.filter(v => String(v).trim()).length, gt = gen.length;
  const o = r.roster.length, s = r.roster.filter(rosterReady).length, c = r.roster.filter(e => e.equipmentType === 'truck').length;
  const l = r.activities.filter(a => actReady(a) && !hasPrefix(errs, `activity.${a.id}.`)).length;
  const u = r.activities.reduce((t, a) => t + actTruckM3(a, cfg), 0);
  const d = r.activities.reduce((t, a) => t + (a.kind === 'watermaster' ? wmM3(a.watermaster) ?? 0 : 0), 0);
  const h = Math.round((gf / gt + (o ? s / o : 0) + (r.activities.length ? l / r.activities.length : 0)) / 3 * 100);
  const g = Object.keys(errs).length; const st = (ok, p) => hasPrefix(errs, p) ? 'warning' : ok ? 'done' : 'idle';
  return { generalFilled: gf, generalTotal: gt, rosterTotal: o, rosterReady: s, rosterTrucks: c, rosterMachinery: o - c, activityCount: r.activities.length, activitiesReady: l, truckM3: u, watermasterM3: d, errorCount: g, progress: h,
    status: { general: st(gf === gt, 'general.'), roster: st(o > 0 && s === o, 'roster.'), activities: st(l === r.activities.length, 'activity.'), generate: g > 0 ? 'warning' : h === 100 ? 'done' : 'idle' } };
}
// --- validación (U6) y errores inmediatos (J6)
function validate(r) {
  const errs = {}; let first = null; const put = (k, m) => { if (!errs[k]) { errs[k] = m; first = first || k; } };
  if (blank(r.date)) put('general.date', 'La fecha es obligatoria.');
  if (blank(r.supervisor)) put('general.supervisor', 'El supervisor es obligatorio.');
  if (blank(r.area)) put('general.area', 'Debes seleccionar un área.');
  if (blank(r.apr)) put('general.apr', 'El APR / Responsable es obligatorio.');
  for (const e of r.roster) { const p = `roster.${e.equipmentId}`; const h = hourErr(e.hourmeterStart, e.hourmeterEnd); if (h) put(`${p}.hourmeterEnd`, h); if (e.equipmentType === 'truck') { const k = kmErr(e.kmStart, e.kmEnd); if (k) put(`${p}.kmEnd`, k); } }
  r.activities.forEach(a => {
    const p = `activity.${a.id}`;
    if (a.kind === 'watermaster' && a.watermaster) {
      const w = a.watermaster, q = `${p}.wm`;
      const pair = (s, e, k1, k2, m) => { const os = !blank(s), oe = !blank(e); if (os && !oe) put(`${q}.${k2}`, m); else if (!os && oe) put(`${q}.${k1}`, m); else if (os && oe) { const c = hourErr(s, e); if (c === MSGNEG) put(`${q}.${k2}`, c); } };
      pair(w.hourmeterStart, w.hourmeterEnd, 'hourmeterStart', 'hourmeterEnd', 'Debes completar ambos horómetros de la Draga.');
      pair(w.pumpHourmeterStart, w.pumpHourmeterEnd, 'pumpHourmeterStart', 'pumpHourmeterEnd', 'Debes completar ambos horómetros de la Bomba.');
    }
    a.equipmentAssignments.forEach(s => { const k = `${p}.equipment.${s.id}.roster`; const n = rosterOf(r, s.equipmentId); if (!n) { put(k, MSGNOROSTER); return; } if (!rosterReady(n)) put(k, hasPrefix(errs, `roster.${s.equipmentId}.`) ? MSGROSTERERR : MSGNOROSTER); });
  });
  return { valid: Object.keys(errs).length === 0, errs, first };
}
const LIVE_MSGS = new Set([MSG12, MSGNEG, MSGROSTERERR, MSGNOROSTER, MSGKM]);
function liveErrors(r) { const o = {}; for (const [k, v] of Object.entries(validate(r).errs)) if (LIVE_MSGS.has(v)) o[k] = v; return o; }
function currentErrors() { const live = liveErrors(S.report); if (!S.submitted) return live; const all = validate(S.report).errs; const o = {}; for (const k of Object.keys(S.errs)) if (all[k]) o[k] = all[k]; return { ...o, ...live }; }

// =================================================================== estado y almacenamiento local
const K = { code: 'rlAccessCode', profile: 'rlGuestProfile', draft: 'rlReportDraft', config: 'rlConfig', site: 'rlSite', reports: 'rlReportsCache', failed: 'rlFailedDelivery' };
const S = {
  code: LS.get(K.code, ''), codeOk: !!LS.get(K.code, ''), site: LS.get(K.site, DEFAULT_SITE), config: LS.get(K.config, DEFAULT_CONFIG),
  profile: LS.get(K.profile, null), editingProfile: false, route: 'dashboard', token: '', report: null, staleDraftDate: null,
  submitted: false, errs: {}, adminOpen: false, adminPw: SS.get('rlAdminPw') || '', adminTab: 'general', adminEdit: {}, adminAdd: null, adminMsg: null, adminErr: null, adminBusy: false,
  reports: LS.get(K.reports, null), reportsErr: null, reportsLoading: false, outbox: [], drawer: false, userMenu: false, modal: null, busy: false,
  hist: { filters: { createdBy: '', supervisor: '', dateFrom: '', dateTo: '', status: '' }, sort: { key: 'reportDate', direction: 'desc' }, shown: 25, msg: null },
  summaryCollapsed: false, review: { state: 'loading', data: null, email: '', error: null, emailErr: null, decide: null, comment: '', busy: false, open: true }
};
(function loadDraft() {
  const d = LS.get(K.draft, null);
  if (d && d.form && Array.isArray(d.form.activities) && Array.isArray(d.form.roster)) { S.report = d.form; if (S.report.date && S.report.date < hoy()) S.staleDraftDate = S.report.date; }
  else S.report = newReport();
})();
let draftTimer;
function saveDraft() { clearTimeout(draftTimer); draftTimer = setTimeout(() => { if (S.report.revisedFrom) return; if (hasContent(S.report)) { LS.set(K.draft, { form: stripForDraft(S.report) }); savePhotos(); } else { LS.del(K.draft); } }, 400); }
function stripForDraft(r) { return JSON.parse(JSON.stringify(r, (k, v) => k === 'beforePhoto' || k === 'afterPhoto' ? (v ? { contentType: v.contentType, stored: true } : v) : v)); }
function hasContent(r) { const act = a => { const w = a.watermaster; return !!(a.area || a.description.trim() || (a.supportEquipment || '').trim() || a.equipmentAssignments.length || a.kind === 'generic' && a.type || w?.sector.trim() || w?.operator.trim() || w?.hourmeterStart || w?.hourmeterEnd || w?.pumpHourmeterStart || w?.pumpHourmeterEnd || w?.manufacturerPerformance); }; return !!(r.supervisor.trim() || r.area || r.apr.trim() || r.roster.length || r.activities.length > 1 || r.activities.some(act)); }

// --- IndexedDB: fotos del borrador y bandeja de salida (sin señal)
const DB = (function () {
  let p = null;
  function open() { if (p) return p; p = new Promise(res => { try { const q = indexedDB.open('informe-rioloa', 1); q.onupgradeneeded = () => { q.result.createObjectStore('kv'); q.result.createObjectStore('outbox', { keyPath: 'id' }); }; q.onsuccess = () => res(q.result); q.onerror = () => res(null); } catch (e) { res(null); } }); return p; }
  async function tx(store, mode, fn) { const d = await open(); if (!d) return undefined; return new Promise(res => { try { const t = d.transaction(store, mode); const q = fn(t.objectStore(store)); t.oncomplete = () => res(q && q.result); t.onerror = () => res(undefined); } catch (e) { res(undefined); } }); }
  return { get: k => tx('kv', 'readonly', s => s.get(k)), put: (k, v) => tx('kv', 'readwrite', s => s.put(v, k)), del: k => tx('kv', 'readwrite', s => s.delete(k)),
    outAll: () => tx('outbox', 'readonly', s => s.getAll()), outPut: v => tx('outbox', 'readwrite', s => s.put(v)), outDel: id => tx('outbox', 'readwrite', s => s.delete(id)) };
})();
function savePhotos() { const m = {}; S.report.activities.forEach(a => { if (a.beforePhoto?.dataUrl) m[a.id + ':before'] = a.beforePhoto; if (a.afterPhoto?.dataUrl) m[a.id + ':after'] = a.afterPhoto; }); DB.put('draftPhotos', m); }
async function restorePhotos() { const m = await DB.get('draftPhotos'); if (!m) return; let n = 0; S.report.activities.forEach(a => { ['before', 'after'].forEach(w => { const k = w + 'Photo'; if (a[k]?.stored && m[a.id + ':' + w]) { a[k] = m[a.id + ':' + w]; n++; } else if (a[k]?.stored) delete a[k]; }); }); if (n) render(); }

// =================================================================== API
async function api(body, opts = {}) {
  if (!API) throw new Error('Falta configurar la dirección del sistema.');
  const r = await fetch(API, { method: 'POST', body: JSON.stringify(body), redirect: 'follow', signal: opts.signal });
  if (!r.ok) throw new Error('http ' + r.status);
  const j = await r.json();
  if (j && j.code === 'access') { lockAccess(); throw new Error(j.message); }
  return j;
}
const apiK = (a, extra = {}) => api({ a, k: S.code, ...extra });

// =================================================================== router
function parseHash() { const h = location.hash.replace(/^#\/?/, ''); const m = h.match(/^review\/([A-Za-z0-9]+)/); if (m) return { route: 'review', token: m[1] }; const r = ['dashboard', 'history', 'report'].includes(h) ? h : 'dashboard'; return { route: r, token: '' }; }
function go(r) { if (location.hash !== '#/' + r) location.hash = '#/' + r; else { S.route = r; render(); } }
window.addEventListener('hashchange', () => { const p = parseHash(); const changed = p.route !== S.route; S.route = p.route; S.token = p.token; S.adminOpen = false; S.drawer = false; S.userMenu = false; if (S.route === 'history' || S.route === 'dashboard') loadReports(); if (S.route === 'review') startReview(); render(); if (changed) window.scrollTo({ top: 0, behavior: 'instant' }); });

// =================================================================== componentes comunes
const fieldErr = m => m ? `<p class="field-error" role="alert">${ic('alertCircle', 14)}<span>${esc(m)}</span></p>` : '';
const inv = b => b ? 'field-invalid' : '';
function chip(status, label) { return `<span class="status-chip is-${status}">${status === 'ready' ? `<span class="status-icon">${ic('check', 10)}</span>` : '<span class="status-dot"></span>'}${esc(label)}</span>`; }
const statusChip = s => chip(STATUS_CHIP[s] || 'pending', s === 'QUEUED' ? 'Pendiente de envío' : STATUS[s] || s);
function sectionHeader(title, id, desc, actions, icon, tone = 'teal') { return `<div class="section-header"><div class="section-heading">${icon ? `<span class="section-icon tone-${tone}">${ic(icon, 20)}</span>` : ''}<div class="section-heading-text"><h2 class="section-title" ${id ? `id="${id}"` : ''}>${esc(title)}</h2>${desc ? `<p class="section-description">${esc(desc)}</p>` : ''}</div></div>${actions ? `<div class="section-actions">${actions}</div>` : ''}</div>`; }
function collapseBtn(collapsed, act, data, subject) { const l = collapsed ? 'Expandir' : 'Minimizar'; return `<button type="button" class="btn btn-ghost btn-sm collapse-toggle" aria-expanded="${!collapsed}" aria-label="${l} ${esc(subject)}" data-act="${act}" ${data}>${ic('chevDown', 16, 'collapse-chevron')}<span class="collapse-toggle-label">${l}</span></button>`; }
function computed(label, value, opts = {}) { const v = opts.variant === 'inherited'; return `<div class="form-field computed-field"><span class="field-label"><span class="field-label-text">${esc(label)}</span>${v ? '' : '<span class="field-tag">Calculado</span>'}</span><div class="computed-input${v ? ' inherited' : ''}${opts.highlight ? ' highlight' : ''}" role="textbox" aria-readonly="true" aria-label="${esc(label)}" ${opts.live ? `data-live="${opts.live}"` : ''}>${esc(value)}</div></div>`; }
function selectHtml(id, value, options, attrs, invalid, placeholder = 'Seleccionar...') { return `<select id="${id}" class="${inv(invalid)}${value ? '' : ' is-placeholder'}" ${attrs}><option value="">${esc(placeholder)}</option>${options.map(o => `<option value="${esc(o.value)}" ${String(o.value) === String(value) ? 'selected' : ''}>${esc(o.label)}</option>`).join('')}</select>`; }
const readyBadge = tip => `<span class="roster-ready-badge" title="${esc(tip)}" role="img" aria-label="Datos completos en Dotación activa">${ic('info', 18)}<span class="roster-ready-check">${ic('check', 9)}</span></span>`;
function logoImg(cls, w, h) { return `<img src="${LOGO}" alt="RIOLOA" class="${cls}" width="${w}" height="${h}">`; }

// =================================================================== shell
function render() {
  const app = $('#app');
  const focus = captureFocus();
  if (S.route === 'review') { app.innerHTML = shell(reviewPage(), false); restoreFocus(focus); return; }
  if (!S.codeOk) { app.innerHTML = loginPage(); restoreFocus(focus); return; }
  let main = '';
  if (S.adminOpen) main = adminPage();
  else if (S.route === 'history') main = historyPage();
  else if (S.route === 'report') main = reportPage();
  else main = dashboardPage();
  app.innerHTML = shell(main, true) + modalHtml() + profileModal();
  restoreFocus(focus);
  if (S.route === 'report' && !S.adminOpen) { liveUpdate(); spy(); }
}
function captureFocus() { const a = document.activeElement; if (!a || !a.id || a === document.body) return null; return { id: a.id, s: a.selectionStart, e: a.selectionEnd }; }
function restoreFocus(f) { if (!f) return; const el = document.getElementById(f.id); if (!el) return; try { el.focus({ preventScroll: true }); if (f.s != null && el.setSelectionRange && /text|search|email|password|tel|url/.test(el.type || 'text')) el.setSelectionRange(f.s, f.e); } catch (e) {} }

function shell(main, nav) {
  const hasSidebar = nav && S.route === 'report' && !S.adminOpen;
  return `<div class="app-shell${hasSidebar ? ' has-sidebar' : ''}">
  ${nav ? `${S.drawer ? '<div class="sidebar-scrim" data-act="drawerClose"></div>' : ''}<aside id="app-sidebar" class="sidebar${S.drawer ? ' is-open' : ''}"><div class="sidebar-brand"><div class="logo-plate">${logoImg('', 80, 24)}</div><button type="button" class="sidebar-close" aria-label="Cerrar menú" data-act="drawerClose">${ic('x', 18)}</button></div><div class="sidebar-body"><nav class="step-nav drawer-nav" aria-label="Navegación principal"><ol class="step-list is-plain">${NAV.map(n => `<li class="step-item is-idle${!S.adminOpen && S.route === n.to ? ' is-active' : ''}"><a href="#/${n.to}" class="step-link" data-act="navClick"><span class="step-marker"></span><span class="step-text"><span class="step-label">${n.label}</span></span></a></li>`).join('')}</ol></nav><div class="sidebar-slot" id="sidebar-slot">${hasSidebar ? sidebarProgress() : ''}</div></div></aside>` : ''}
  <div class="topbar-sticky"><header class="topbar"><div class="topbar-inner"><div class="topbar-start">${nav ? `<button type="button" class="btn btn-ghost btn-icon-only topbar-menu" aria-label="Abrir menú" data-act="drawerOpen">${ic('menu', 18)}</button><a href="#/dashboard" class="topbar-home" data-act="navClick">${logoImg('topbar-logo', 75, 24)}</a>` : logoImg('topbar-logo', 75, 24)}</div>
  ${nav ? `<nav class="topnav" aria-label="Navegación principal">${NAV.map(n => `<a href="#/${n.to}" class="topnav-link" data-act="navClick" ${!S.adminOpen && S.route === n.to ? 'aria-current="page"' : ''}>${n.label}</a>`).join('')}</nav>` : '<span></span>'}
  <div class="topbar-end">${netPill()}${nav ? userMenu() : ''}</div></div></header>${hasSidebar ? `<div class="topbar-progress" aria-hidden="true"><span id="topbar-progress-bar" style="width:0%"></span></div>` : ''}</div>
  <div class="workspace">${main}</div></div>`;
}
function netPill() { const n = S.outbox.length; if (!navigator.onLine) return `<span class="net-pill">${n ? `Sin señal · ${n} por enviar` : 'Sin señal'}</span>`; return n ? `<span class="net-pill">${n} por enviar</span>` : ''; }
function userMenu() {
  const p = S.profile; if (!p) return `<button type="button" class="btn btn-ghost btn-icon-only" aria-label="Administrar parámetros" data-act="openAdmin">${ic('sliders', 18)}</button>`;
  const name = p.displayName || p.email;
  return `<div class="user-menu"><button type="button" class="btn btn-ghost btn-sm user-menu-trigger" aria-label="Cuenta de ${esc(name)}" aria-expanded="${S.userMenu}" data-act="userMenu">${ic('user', 15)}<span class="user-menu-name">${esc(name)}</span>${ic('chevDown', 14, 'user-menu-chevron')}</button>
  ${S.userMenu ? `<div class="user-menu-panel" role="menu"><button class="user-menu-item" role="menuitem" data-act="openAdmin">${ic('sliders', 14)}Administrar parámetros</button><div class="user-menu-separator"></div><button class="user-menu-item" role="menuitem" data-act="editProfile">${ic('pencil', 14)}Cambiar perfil</button><button class="user-menu-item" role="menuitem" data-act="lockAccess">${ic('lock', 14)}Bloquear acceso</button><button class="user-menu-item is-danger" role="menuitem" data-act="clearProfile">${ic('trash', 14)}Borrar perfil</button></div>` : ''}</div>`;
}
const pageHead = (t, actions = '') => `<div class="page-head"><h1 class="page-title">${esc(t)}</h1>${actions}</div>`;

// =================================================================== acceso y perfil
function loginPage() {
  return `<main class="login-page"><form class="panel login-card" id="access-form" aria-labelledby="mvp-access-title" novalidate>${logoImg('login-logo', 120, 38)}<div class="login-heading"><h1 class="modal-title" id="mvp-access-title">Acceso al sistema</h1><p class="modal-text">Ingresa el código de acceso para continuar.</p></div>
  <div class="form-field login-field"><label class="field-label" for="mvp-access-code">Código de acceso</label><input id="mvp-access-code" type="password" autocomplete="off" class="${inv(!!S.loginErr)}">${fieldErr(S.loginErr)}</div>
  <button type="submit" class="btn btn-primary btn-lg login-button" ${S.loginBusy ? 'disabled' : ''}>${ic('login', 16)}${S.loginBusy ? 'Validando...' : 'Ingresar'}</button></form></main>`;
}
async function submitAccess(code) {
  if (!code.trim()) return; S.loginBusy = true; S.loginErr = null; render();
  try { const j = await api({ a: 'acceso', code: code.trim() }); if (j.ok) { S.code = code.trim(); S.codeOk = true; LS.set(K.code, S.code); if (j.site) { S.site = j.site; LS.set(K.site, j.site); } S.loginBusy = false; render(); loadConfig(); loadReports(); return; } S.loginErr = 'Código incorrecto.'; }
  catch (e) { S.loginErr = navigator.onLine ? 'No fue posible validar el código.' : 'Se necesita señal para validar el código la primera vez.'; }
  S.loginBusy = false; render();
}
function lockAccess() { S.code = ''; S.codeOk = false; LS.del(K.code); S.userMenu = false; render(); }
function profileModal() {
  if (S.route === 'review') return '';
  if (!(S.editingProfile || !S.profile)) return '';
  const p = S.profile || {}; const e = S.profileErrs || {};
  return `<div class="modal-overlay" role="presentation" ${S.editingProfile ? 'data-act="profileCancel" data-self="1"' : ''}><form class="modal-card modal-card-sm" id="profile-form" role="dialog" aria-modal="true" aria-labelledby="guest-profile-title" novalidate><div class="modal-header"><div><h2 id="guest-profile-title" class="modal-title">Identifícate para continuar</h2><p class="modal-text">Esta información se utilizará únicamente para identificar quién genera los informes durante la etapa de pruebas.</p></div></div>
  <div class="modal-body"><div class="form-field"><label class="field-label" for="guest-name"><span>Nombre<span class="required">*</span></span></label><input id="guest-name" type="text" autocomplete="name" maxlength="200" class="${inv(!!e.displayName)}" value="${esc(p.displayName || '')}">${fieldErr(e.displayName)}</div>
  <div class="form-field"><label class="field-label" for="guest-email"><span>Correo<span class="required">*</span></span></label><input id="guest-email" type="email" autocomplete="email" class="${inv(!!e.email)}" value="${esc(p.email || '')}">${fieldErr(e.email)}</div></div>
  <div class="modal-actions">${S.editingProfile ? '<button type="button" class="btn btn-ghost" data-act="profileCancel">Cancelar</button>' : ''}<button type="submit" class="btn btn-primary">Guardar perfil</button></div></form></div>`;
}

// =================================================================== DASHBOARD
function dashboardPage() {
  const reps = S.reports; const draft = hasContent(S.report);
  const pending = reps ? reps.filter(r => r.status === 'SEND_FAILED' || r.status === 'REJECTED' && r.canEdit).length : 0;
  const create = `<section class="panel create-panel" aria-labelledby="create-title"><h2 class="panel-title" id="create-title">Crear informe</h2><ul class="create-list"><li class="create-row"><div class="create-copy"><h3>Informe Diario de Operaciones</h3>${draft ? `<p>${S.report.revisedFrom ? 'Corrección' : 'Borrador'} sin enviar del ${fcl(S.report.date)} · ${plural(S.report.roster.length, 'equipo', 'equipos')} · ${plural(S.report.activities.length, 'actividad', 'actividades')}</p>` : '<p>Turno, dotación, actividades y m³ del Área de Pozas.</p>'}</div>
  <div class="create-actions">${draft ? `<a href="#/report" class="btn btn-primary">${ic('arrowRight', 16)}Continuar</a><button type="button" class="btn btn-secondary" data-act="startOver">${ic('reset', 15)}Empezar de cero</button>` : `<a href="#/report" class="btn btn-primary">${ic('plus', 16)}Nuevo informe</a>${reps && reps.some(r => r.canEdit) ? `<button type="button" class="btn btn-secondary" data-act="fromLast" title="Copia supervisor y dotación, y abre cada horómetro donde cerró el último informe" ${S.busy ? 'disabled' : ''}>${ic('history', 15)}${S.busy ? 'Cargando…' : 'Partir del último'}</button>` : ''}`}</div></li></ul>${S.dashErr ? `<div class="global-alert" role="alert">${ic('alertCircle', 16)}${esc(S.dashErr)}</div>` : ''}</section>`;
  const queued = S.outbox.map(o => ({ id: o.id, reportDate: o.payload.reportDate, supervisor: o.payload.summary.supervisorName, status: 'QUEUED', queued: true }));
  const recentList = [...queued, ...(reps || [])].slice(0, 5);
  const recent = `<section class="panel recent-panel" aria-labelledby="recent-title"><div class="panel-head"><h2 class="panel-title" id="recent-title">Últimos informes</h2><a href="#/history" class="panel-link">Ver historial</a></div>
  ${pending > 0 ? `<a href="#/history" class="recent-pending">${ic('alert', 14)}${pending} por corregir o reenviar</a>` : ''}
  ${S.reportsErr && !reps ? '<p class="empty-state">No fue posible cargar los últimos informes.</p>' : ''}${!reps && !S.reportsErr && !queued.length ? '<span class="skeleton" style="height:140px"></span>' : ''}
  ${reps && !recentList.length ? '<p class="empty-state">Aún no hay informes.</p>' : ''}
  ${recentList.length ? `<ul class="recent-list">${recentList.map(r => `<li><button type="button" class="recent-row" ${r.queued ? 'disabled' : `data-act="pdfOpen" data-id="${r.id}"`}><span class="recent-date num">${fcl(r.reportDate)}</span><span class="recent-who">${esc(r.supervisor)}</span>${statusChip(r.status)}</button></li>`).join('')}</ul>` : ''}</section>`;
  let charts = '';
  if (reps) {
    const sm = summaryOf(reps);
    charts = `<section class="report-section" aria-labelledby="dashboard-charts-title">${sectionHeader('Evolución de la operación', 'dashboard-charts-title', 'M³, actividades y equipos cuentan solo informes aprobados.')}
    ${sm.statuses.total === 0 ? '<div class="panel"><p class="empty-state">Los gráficos aparecerán con el primer informe aprobado.</p></div>' : `<div class="chart-grid">${chartM3(sm)}${chartStatus(sm)}${sm.totals.reports > 0 ? chartApproved(sm) + chartEquipment(sm) : ''}</div>`}</section>`;
  } else if (!S.reportsErr) charts = '<section class="report-section"><span class="skeleton" style="width:280px;height:28px"></span><div class="chart-grid"><span class="skeleton" style="height:260px;grid-column:span 2"></span><span class="skeleton" style="height:260px"></span></div></section>';
  return `<main class="app-main">${pageHead('Dashboard')}<div class="dashboard-top">${create}${recent}</div>${charts}</main>`;
}
function summaryOf(reps) {
  const st = { approved: 0, inReview: 0, rejected: 0, sendFailed: 0, total: reps.length };
  reps.forEach(r => { if (r.status === 'APPROVED') st.approved++; else if (r.status === 'IN_REVIEW') st.inReview++; else if (r.status === 'REJECTED') st.rejected++; else if (r.status === 'SEND_FAILED') st.sendFailed++; });
  const ap = reps.filter(r => r.status === 'APPROVED'); const by = new Map(); const eq = new Map(); let wmS = 0, wmN = 0;
  ap.forEach(r => { const d = by.get(r.reportDate) || { date: r.reportDate, truckM3: 0, reports: 0, activities: 0 }; d.truckM3 += r.truckM3; d.reports++; d.activities += r.activitiesCount; by.set(r.reportDate, d);
    (r.equipment || []).forEach(e => { const x = eq.get(e.code) || { code: e.code, participations: 0 }; x.participations += e.activities || 0; eq.set(e.code, x); });
    if (r.watermasterHourlyPerformance) { wmS += r.watermasterHourlyPerformance; wmN++; } });
  const byDate = [...by.values()].sort((a, b) => a.date.localeCompare(b.date));
  const decided = st.approved + st.rejected;
  return { statuses: st, byDate, totals: { truckM3: ap.reduce((s, r) => s + r.truckM3, 0), reports: ap.length, activities: ap.reduce((s, r) => s + r.activitiesCount, 0) }, approvalRate: decided ? st.approved / decided : null,
    equipmentUsage: [...eq.values()].filter(e => e.participations > 0).sort((a, b) => b.participations - a.participations), watermasterHourlyAverage: wmN ? wmS / wmN : null };
}
function chartPanel(title, figure, unit, note, hero, body) { return `<figure class="panel chart-panel${hero ? ' is-hero' : ''}"><figcaption class="chart-head"><span class="chart-title">${esc(title)}</span>${figure != null ? `<span class="chart-figure num">${figure}${unit ? `<small>${unit}</small>` : ''}</span>` : ''}${note ? `<span class="chart-note">${esc(note)}</span>` : ''}</figcaption>${body}</figure>`; }
function niceMax(v) { if (v <= 0) return 4; const p = Math.pow(10, Math.floor(Math.log10(v))); const n = v / p; const m = n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10; return m * p; }
function vbars(data, key, unit, height, label, integer) {
  if (!data.length) return '<p class="empty-state">Los gráficos aparecerán con el primer informe aprobado.</p>';
  const W = 600, H = height, L = 40, B = 26, T = 8, R = 8; const max = niceMax(Math.max(...data.map(d => d[key])) || 0); const ticks = 4; const bw = Math.min(36, (W - L - R) / data.length * 0.7); const step = (W - L - R) / data.length;
  let g = ''; for (let i = 0; i <= ticks; i++) { const v = max / ticks * i; const y = H - B - (H - B - T) * i / ticks; g += `<line x1="${L}" x2="${W - R}" y1="${y}" y2="${y}" stroke="var(--border-subtle)"/><text x="${L - 6}" y="${y + 4}" text-anchor="end">${integer ? Math.round(v) : fmtCl(v)}</text>`; }
  const every = Math.max(1, Math.ceil(data.length / 8));
  const bars = data.map((d, i) => { const h = (H - B - T) * (d[key] / max); const x = L + step * i + (step - bw) / 2; const y = H - B - h; return `<rect class="bar" x="${x}" y="${y}" width="${bw}" height="${Math.max(h, 0)}" rx="4" fill="var(--rio-teal)"><title>${esc(fcl(d.date))}: ${fmtCl(d[key], 1)} ${unit}</title></rect>${i % every === 0 ? `<text x="${x + bw / 2}" y="${H - 8}" text-anchor="middle">${esc(fcl(d.date).slice(0, 5))}</text>` : ''}`; }).join('');
  return `<svg class="chart-svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(label)}">${g}<line x1="${L}" x2="${W - R}" y1="${H - B}" y2="${H - B}" stroke="var(--border-subtle)"/>${bars}</svg>`;
}
function chartM3(s) { const n = s.watermasterHourlyAverage; return chartPanel('M³ transportados', fmtCl(s.totals.truckM3, 1), 'm³', n === null ? 'Camiones tolva' : `Camiones tolva · Watermaster ${fmtCl(n, 1)} m³/h en promedio`, true, vbars(s.byDate, 'truckM3', 'm³', 220, 'Metros cúbicos transportados por fecha')); }
function chartApproved(s) { return chartPanel('Informes aprobados', fmtCl(s.totals.reports), '', plural(s.totals.activities, 'actividad registrada', 'actividades registradas'), false, vbars(s.byDate, 'reports', 'informes', 200, 'Cantidad de informes aprobados por fecha', true)); }
function chartStatus(s) { const t = s.statuses; const rows = [{ l: 'Aprobados', v: t.approved, c: 'var(--rio-teal)' }, { l: 'En revisión', v: t.inReview, c: 'var(--sand)' }, { l: 'Rechazados', v: t.rejected, c: 'var(--coral)' }, ...(t.sendFailed > 0 ? [{ l: 'Error de envío', v: t.sendFailed, c: 'var(--rio-cyan)' }] : [])];
  return chartPanel('Estado de los informes', fmtCl(t.total), '', s.approvalRate === null ? 'Todos los informes' : `Todos los informes · ${fmtCl(s.approvalRate * 100, 1)} % de aprobación`, false, `<ul class="status-list">${rows.map(r => `<li><span>${r.l}</span><span class="status-track"><span style="width:${t.total ? r.v / t.total * 100 : 0}%;background:${r.c}"></span></span><strong class="num">${fmtCl(r.v)}</strong></li>`).join('')}</ul>`); }
function chartEquipment(s) { const d = s.equipmentUsage; if (!d.length) return chartPanel('Uso de equipos', null, '', 'Participaciones en actividades', true, '<p class="empty-state">Sin equipos asignados a actividades.</p>');
  const W = 600, rowH = 34, H = Math.max(160, d.length * rowH), L = 90, R = 30; const max = niceMax(Math.max(...d.map(x => x.participations)));
  let g = ''; for (let i = 0; i <= 4; i++) { const x = L + (W - L - R) * i / 4; g += `<line x1="${x}" x2="${x}" y1="0" y2="${H - 20}" stroke="var(--border-subtle)"/><text x="${x}" y="${H - 4}" text-anchor="middle">${Math.round(max / 4 * i)}</text>`; }
  const bars = d.map((e, i) => { const y = i * ((H - 20) / d.length) + ((H - 20) / d.length - 18) / 2; const w = (W - L - R) * e.participations / max; return `<text x="${L - 8}" y="${y + 13}" text-anchor="end">${esc(e.code)}</text><rect class="bar" x="${L}" y="${y}" width="${Math.max(w, 1)}" height="18" rx="4" fill="var(--rio-teal)"><title>${esc(e.code)}: ${e.participations} participaciones</title></rect>`; }).join('');
  return chartPanel('Uso de equipos', null, '', 'Participaciones en actividades', true, `<svg class="chart-svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="Participaciones de cada equipo en actividades">${g}${bars}</svg>`); }

// =================================================================== HISTORIAL
const COLS = [{ key: 'reportDate', label: 'Fecha', first: 'desc' }, { key: 'createdBy', label: 'Creado por', first: 'asc' }, { key: 'supervisor', label: 'Supervisor', first: 'asc' }, { key: 'activitiesCount', label: 'Actividades', first: 'desc' }, { key: 'truckM3', label: 'M³', first: 'desc' }, { key: 'status', label: 'Estado', first: 'asc' }];
function filtered() { const f = S.hist.filters, a = norm(f.createdBy), b = norm(f.supervisor); const list = (S.reports || []).filter(r => norm(r.createdBy).includes(a) && norm(r.supervisor).includes(b) && (!f.dateFrom || r.reportDate >= f.dateFrom) && (!f.dateTo || r.reportDate <= f.dateTo) && (!f.status || r.status === f.status));
  const { key, direction } = S.hist.sort; const m = direction === 'asc' ? 1 : -1;
  return list.sort((x, y) => m * (key === 'activitiesCount' || key === 'truckM3' ? x[key] - y[key] : key === 'status' ? STATUS[x.status].localeCompare(STATUS[y.status], 'es') : String(x[key]).localeCompare(String(y[key]), 'es', { sensitivity: 'base' }))); }
function historyPage() {
  const reps = S.reports; const f = S.hist.filters; const any = Object.values(f).some(Boolean);
  let body = '';
  if (S.reportsErr && !reps) body = `<div class="global-alert" role="alert">${ic('alertCircle', 16)}No fue posible cargar el historial.</div>`;
  else if (!reps) body = '<div class="panel"><span class="skeleton" style="height:240px"></span></div>';
  else if (!reps.length) body = '<div class="panel"><p class="empty-state">No hay informes registrados.</p></div>';
  else {
    const list = filtered(); const shown = list.slice(0, S.hist.shown);
    const sortOpts = COLS.flatMap(c => [{ value: `${c.key}:desc`, label: `${c.label}, descendente` }, { value: `${c.key}:asc`, label: `${c.label}, ascendente` }]);
    body = `<section class="panel history-filters" aria-label="Filtros del historial"><div class="history-filter-fields">
    <div class="form-field"><label class="field-label" for="filter-created-by">Creado por</label><input id="filter-created-by" data-filter="createdBy" type="text" autocomplete="off" placeholder="Buscar nombre" value="${esc(f.createdBy)}"></div>
    <div class="form-field"><label class="field-label" for="filter-supervisor">Supervisor</label><input id="filter-supervisor" data-filter="supervisor" type="text" autocomplete="off" placeholder="Buscar nombre" value="${esc(f.supervisor)}"></div>
    <div class="form-field"><label class="field-label" for="filter-date-from">Fecha desde</label><input id="filter-date-from" data-filter="dateFrom" type="date" value="${esc(f.dateFrom)}"></div>
    <div class="form-field"><label class="field-label" for="filter-date-to">Fecha hasta</label><input id="filter-date-to" data-filter="dateTo" type="date" value="${esc(f.dateTo)}"></div>
    <div class="form-field"><label class="field-label" for="filter-status">Estado</label>${selectHtml('filter-status', f.status, Object.entries(STATUS).map(([v, l]) => ({ value: v, label: l })), 'data-filter="status"', false, 'Todos')}</div>
    <div class="form-field history-sort"><label class="field-label" for="history-sort">Ordenar por</label>${selectHtml('history-sort', `${S.hist.sort.key}:${S.hist.sort.direction}`, sortOpts, 'data-act-change="histSort"', false, 'Fecha, descendente')}</div></div>
    <div class="history-filter-footer"><p class="history-filter-count num" role="status">${list.length} de ${reps.length} informes</p>${any ? `<button type="button" class="btn btn-ghost btn-sm" data-act="clearFilters">${ic('x', 14)}Limpiar filtros</button>` : ''}</div></section>
    ${!list.length ? '<div class="panel"><p class="empty-state">Ningún informe coincide con los filtros.</p></div>' : `<div class="panel panel-flush history-panel"><div class="table-wrap history-table"><table class="data-table"><thead><tr>${COLS.map(c => { const a = S.hist.sort.key === c.key, asc = a && S.hist.sort.direction === 'asc'; return `<th scope="col" class="${c.key === 'activitiesCount' || c.key === 'truckM3' ? 'col-num' : ''}" ${a ? `aria-sort="${asc ? 'ascending' : 'descending'}"` : ''}><button type="button" class="sort-button${a ? ' is-active' : ''}" data-act="sortCol" data-key="${c.key}">${c.label}${ic(a ? (asc ? 'chevUp' : 'chevDown') : 'sort', 13)}</button></th>`; }).join('')}<th scope="col">Comentarios</th><th scope="col" class="col-actions">Acciones</th></tr></thead>
    <tbody>${shown.map(r => `<tr><td>${histDate(r)}</td><td>${esc(r.createdBy)}</td><td>${esc(r.supervisor)}</td><td class="col-num num">${r.activitiesCount}</td><td class="col-num num">${F(r.truckM3)}</td><td>${statusChip(r.status)}</td><td>${commentBtn(r)}</td><td class="col-actions">${histActions(r)}</td></tr>`).join('')}</tbody></table></div>
    <ul class="history-cards">${shown.map(r => `<li class="equipment-card history-card"><div class="history-card-header"><span class="history-card-date">${histDate(r)}</span>${statusChip(r.status)}</div><dl class="detail-list"><div><dt>Creado por</dt><dd>${esc(r.createdBy)}</dd></div><div><dt>Supervisor</dt><dd>${esc(r.supervisor)}</dd></div><div><dt>Actividades</dt><dd class="num">${r.activitiesCount}</dd></div><div><dt>M³</dt><dd class="num">${F(r.truckM3)}</dd></div><div><dt>Comentarios</dt><dd>${commentBtn(r)}</dd></div></dl>${histActions(r)}</li>`).join('')}</ul>
    ${list.length > S.hist.shown ? `<div class="panel-footer"><button type="button" class="btn btn-secondary btn-sm" data-act="moreHist">${ic('plus', 15)}Cargar más</button></div>` : ''}</div>`}`;
  }
  return `<main class="app-main">${pageHead('Historial de informes')}<section class="report-section">${S.hist.msg ? `<div class="global-alert global-alert-success" role="status">${ic('checkCircle', 16)}${esc(S.hist.msg)}</div>` : ''}${S.hist.err ? `<div class="global-alert" role="alert">${ic('alertCircle', 16)}${esc(S.hist.err)}</div>` : ''}${body}</section></main>`;
}
const histDate = r => `<span class="history-date"><span class="num">${fcl(r.reportDate)}</span>${r.revisedFromReportId ? '<span class="tag">Corrección</span>' : ''}</span>`;
const commentBtn = r => r.rejectionComment ? `<button type="button" class="btn btn-ghost btn-sm" data-act="showComment" data-id="${r.id}">${ic('message', 14)}Ver comentario</button>` : '<span class="is-empty">—</span>';
function histActions(r) { return `<div class="table-actions"><button type="button" class="btn btn-ghost btn-sm" data-act="pdfOpen" data-id="${r.id}">${ic('eye', 14)}Vista previa</button><button type="button" class="btn btn-ghost btn-sm" data-act="pdfDownload" data-id="${r.id}">${ic('download', 14)}Descargar</button>${r.status === 'SEND_FAILED' ? `<button type="button" class="btn btn-secondary btn-sm" data-act="resendOpen" data-id="${r.id}">${ic('send', 14)}Reenviar</button>` : ''}${r.status === 'REJECTED' ? `<button type="button" class="btn btn-secondary btn-sm" data-act="editRejected" data-id="${r.id}" ${r.canEdit ? '' : 'disabled title="Este informe se generó antes de que se guardaran sus datos."'}>${ic('pencil', 14)}Volver a editar</button>` : ''}</div>`; }

// =================================================================== GENERAR INFORME
function reportPage() {
  const r = S.report; const errs = currentErrors(); const anyErr = Object.keys(errs).length > 0;
  const alerts = [];
  if (r.revisedFrom) alerts.push(`<div class="global-alert global-alert-warning" role="status">${ic('alert', 16)}<div><p>Estás corrigiendo el informe rechazado del ${fcl(r.revisedFrom.reportDate)}. Al enviarlo se creará un informe nuevo y el rechazado no cambiará.</p>${r.revisedFrom.comment ? `<p class="comment-text">Comentario del supervisor: ${esc(r.revisedFrom.comment)}</p>` : ''}</div></div>`);
  if (r.carriedFrom) alerts.push(`<div class="global-alert global-alert-info" role="status">${ic('info', 16)}Partes del informe del ${fcl(r.carriedFrom)}. Confirma operadores y horómetros iniciales.</div>`);
  if (S.staleDraftDate && r.date === S.staleDraftDate && !r.revisedFrom) alerts.push(`<div class="global-alert global-alert-warning" role="status">${ic('alert', 16)}Este borrador tiene fecha ${fcl(S.staleDraftDate)}. Si es el turno de hoy, cambia la fecha antes de enviar.</div>`);
  alerts.push(`<div class="global-alert global-alert-warning" role="status" data-live="pendingAlert" ${anyErr ? '' : 'hidden'}>${ic('alert', 16)}Hay campos pendientes de completar.</div>`);
  return `<main class="app-main">${pageHead('Informe Diario de Operaciones')}<div class="alert-stack" ${alerts.length === 1 && !anyErr ? 'data-only-pending="1"' : ''}>${alerts.join('')}</div>
  ${generalSection(errs)}${rosterSection(errs)}
  <section class="report-section" id="sec-activities" aria-labelledby="sec-activities-title">${sectionHeader('Detalle de actividades', 'sec-activities-title')}<div class="activities-list">${r.activities.map((a, i) => activityCard(a, i, errs)).join('')}<button type="button" class="btn btn-dashed" data-act="addActivity">${ic('plus', 16)}Agregar Actividad</button></div></section>
  ${summarySection()}
  <section class="report-section generate-section" id="sec-generate" aria-labelledby="sec-generate-title"><div class="generate-panel"><div class="generate-copy"><h2 class="generate-title" id="sec-generate-title">Generar y enviar informe</h2><p>Antes de enviar se revisa todo el informe. Si falta algo, te llevamos al campo.</p><p class="generate-warning" data-live="genWarning" ${anyErr ? '' : 'hidden'}>${ic('alert', 15)}Hay campos pendientes de completar.</p></div>
  <div class="generate-actions"><button type="button" class="btn btn-on-dark-ghost btn-preview" data-act="previewPdf" ${S.pdfBusy ? 'disabled' : ''}>${ic('eye', 16)}Vista previa</button><button type="button" class="btn btn-on-dark btn-preview" data-act="downloadPdf" ${S.pdfBusy ? 'disabled' : ''}>${ic('download', 16)}${S.pdfBusy ? 'Generando...' : 'Descargar PDF'}</button><button type="button" class="btn btn-light btn-lg btn-generate" data-act="generate" ${S.pdfBusy ? 'disabled' : ''}>${ic('send', 16)}Generar informe</button></div></div></section></main>`;
}
function fieldBox(path, label, control, err, required, extraCls = '') { return `<div class="form-field ${extraCls}" data-field="${path}"><label class="field-label" for="${control.id}">${required ? `<span>${label}<span class="required">*</span></span>` : label}</label>${control.html}<span class="err-slot">${fieldErr(err)}</span></div>`; }
function textInput(id, value, attrs, invalid, type = 'text') { return { id, html: `<input id="${id}" type="${type}" ${type === 'number' ? 'step="any" inputmode="decimal"' : ''} class="${inv(invalid)}" value="${esc(value ?? '')}" ${attrs}>` }; }
function generalSection(errs) {
  const r = S.report;
  return `<section class="report-section" id="sec-general" aria-labelledby="sec-general-title">${sectionHeader('Antecedentes generales', 'sec-general-title')}<div class="panel"><div class="form-grid cols-4">
  ${fieldBox('general.date', 'Fecha', textInput('report-date', r.date, 'data-g="date"', !!errs['general.date'], 'date'), errs['general.date'], true)}
  ${fieldBox('general.supervisor', 'Supervisor', textInput('report-supervisor', r.supervisor, 'data-g="supervisor" autocomplete="name"', !!errs['general.supervisor']), errs['general.supervisor'], true)}
  ${fieldBox('general.area', 'Área', { id: 'report-area', html: selectHtml('report-area', r.area, S.config.generalAreas.map(a => ({ value: a.name, label: a.name })), 'data-g="area"', !!errs['general.area']) }, errs['general.area'], true)}
  ${fieldBox('general.apr', 'APR / Responsable', textInput('report-apr', r.apr, 'data-g="apr"', !!errs['general.apr']), errs['general.apr'], true)}
  </div></div></section>`;
}
const trucksCfg = () => S.config.equipment.filter(e => e.type === 'truck');
const machCfg = () => S.config.equipment.filter(e => e.type === 'machinery');
function checklistItem(e, checked, act, data, tip) { return `<li><label class="equipment-option${checked ? ' is-selected' : ''}"><input type="checkbox" ${checked ? 'checked' : ''} data-act-change="${act}" ${data}><span class="equipment-option-code">${esc(e.code)}</span>${tip ? readyBadge(tip) : ''}</label></li>`; }
function rosterSection(errs) {
  const r = S.report; const sel = new Set(r.roster.map(e => e.equipmentId)); const t = trucksCfg(), m = machCfg();
  const list = (items, type) => items.map(e => { const n = rosterOf(r, e.id); return checklistItem(e, sel.has(e.id), 'rosterToggle', `data-eq="${esc(e.id)}" data-code="${esc(e.code)}" data-type="${type}"`, n && rosterReady(n) ? rosterTip(n) : ''); }).join('');
  return `<section class="report-section" id="sec-roster" aria-labelledby="sec-roster-title">${sectionHeader('Dotación activa', 'sec-roster-title', 'Completa aquí cada equipo una sola vez. Las actividades reutilizan estos datos.')}<div class="panel"><div class="equipment-picker">
  <div><div class="equipment-group-header"><p class="equipment-category">${ic('truck', 15)}Camiones Tolva</p><span class="equipment-group-count">${t.filter(e => sel.has(e.id)).length} de ${t.length} seleccionados</span></div><ul class="equipment-checklist">${list(t, 'truck')}</ul></div>
  <div><div class="equipment-group-header"><p class="equipment-category">${ic('machine', 15)}Maquinaria</p><span class="equipment-group-count">${m.filter(e => sel.has(e.id)).length} de ${m.length} seleccionados</span></div><ul class="equipment-checklist">${list(m, 'machinery')}</ul></div></div>
  ${r.roster.length === 0 ? '<p class="empty-state">Aún no hay equipos en la dotación. Marca los camiones y la maquinaria que operan en el turno para completar sus datos.</p>' : `<div class="equipment-assignments"><div class="equipment-assignments-header"><h3 class="equipment-assignments-title">Fichas de equipo</h3><span class="equipment-group-count" data-live="rosterCount"></span></div>${r.roster.map(e => rosterCard(e, errs)).join('')}</div>`}</div></section>`;
}
function rosterChipHtml(e, errs) { const p = `roster.${e.equipmentId}`; const bad = Object.keys(errs).some(k => k.startsWith(p + '.')); return bad ? chip('error', 'Revisar datos') : rosterReady(e) ? chip('ready', 'Completo') : chip('pending', 'Pendiente'); }
function rosterCard(e, errs) {
  const p = `roster.${e.equipmentId}`, id = f => `roster-${e.equipmentId}-${f}`; const da = `data-r="${esc(e.equipmentId)}"`;
  const fld = (f, label) => fieldBox(`${p}.${f}`, label, textInput(id(f), e[f], `${da} data-f="${f}"`, !!errs[`${p}.${f}`], 'number'), errs[`${p}.${f}`]);
  return `<div class="equipment-card${e.collapsed ? ' is-collapsed' : ''}" id="roster-${esc(e.equipmentId)}"><div class="equipment-card-header"><div class="equipment-card-heading"><span class="equipment-card-code">${esc(e.equipmentCode)}</span><span class="equipment-card-type">${e.equipmentType === 'truck' ? 'Camión tolva' : 'Maquinaria'}</span><span data-live="rchip:${esc(e.equipmentId)}">${rosterChipHtml(e, errs)}</span>${e.collapsed ? `<span class="equipment-card-summary">Operador: <strong>${esc(e.operator || '—')}</strong></span>` : ''}</div>${collapseBtn(e.collapsed, 'rosterCollapse', da, e.equipmentCode)}</div>
  ${e.collapsed ? '' : `<div class="equipment-card-body"><div class="form-grid cols-3">${fieldBox(`${p}.operator`, 'Operador', textInput(id('operator'), e.operator, `${da} data-f="operator"`, !!errs[`${p}.operator`]), errs[`${p}.operator`])}
  <div class="form-row-triple">${fld('hourmeterStart', 'Horómetro Inicial')}${fld('hourmeterEnd', 'Horómetro Final')}${computed('Horas de operación', `${F(diff(e.hourmeterStart, e.hourmeterEnd))} h`, { live: `rh:${e.equipmentId}` })}</div>
  ${e.equipmentType === 'truck' ? `<div class="form-row-triple">${fld('kmStart', 'KM Inicial')}${fld('kmEnd', 'KM Final')}${computed('KM recorridos', `${F(diff(e.kmStart ?? '', e.kmEnd ?? ''))} km`, { live: `rk:${e.equipmentId}` })}</div>` : ''}</div></div>`}</div>`;
}
function activityMeta(a) { const c = areaOf(a), l = typeOf(a), u = a.equipmentAssignments.length; return `${c ? `<span class="activity-meta-value">${esc(c)}</span>` : '<span class="activity-meta-empty">Sin poza / área</span>'}<span class="activity-meta-sep">·</span>${l ? `<span class="activity-meta-value">${esc(l)}</span>` : '<span class="activity-meta-empty">Sin tipo</span>'}<span class="activity-meta-sep">·</span><span class="num">${plural(u, 'equipo seleccionado', 'equipos seleccionados')}</span>`; }
function activityCard(a, i, errs) {
  const o = `activity.${a.id}`, n = i + 1, da = `data-a="${a.id}"`, id = f => `activity-${a.id}-${f}`;
  const hasErr = Object.keys(errs).some(k => k.startsWith(o + '.'));
  const head = `<header class="activity-header"><div class="activity-heading"><div><h3 class="activity-title">Actividad ${n}${a.kind === 'watermaster' ? '<span class="tag">Watermaster</span>' : ''}<span class="tag tag-danger" data-live="actErr:${a.id}" ${hasErr ? '' : 'hidden'}>Con errores</span></h3><p class="activity-meta" data-live="ameta:${a.id}">${activityMeta(a)}</p></div></div>
  <div class="activity-actions">${collapseBtn(a.collapsed, 'actCollapse', da, 'actividad ' + n)}${i > 0 ? `<button type="button" class="btn btn-danger-ghost btn-sm" data-act="removeActivity" ${da} aria-label="Eliminar actividad ${n}">${ic('trash', 15)}<span class="collapse-toggle-label">Eliminar</span></button>` : ''}</div></header>`;
  if (a.collapsed) return `<article class="activity-card collapsed" id="activity-${a.id}">${head}</article>`;
  const areaOpts = S.config.activityAreas.map(x => ({ value: x.name, label: x.name }));
  return `<article class="activity-card" id="activity-${a.id}">${head}<div class="activity-body">
  <div class="subsection"><div class="subsection-header"><h4 class="subsection-title">Datos de la actividad</h4></div><div class="form-grid">
  ${fieldBox(`${o}.area`, 'Poza / Área', { id: id('area'), html: selectHtml(id('area'), a.area, areaOpts, `${da} data-af="area"`, !!errs[`${o}.area`]) }, errs[`${o}.area`])}
  ${a.area === 'Otro' ? fieldBox(`${o}.customArea`, 'Indicar poza / área', textInput(id('customArea'), a.customArea, `${da} data-af="customArea"`, !!errs[`${o}.customArea`]), errs[`${o}.customArea`]) : ''}
  ${fieldBox(`${o}.type`, 'Tipo de actividad', a.kind === 'watermaster' ? { id: id('type'), html: `<input id="${id('type')}" type="text" value="Draga Watermaster" readonly class="readonly-input">` } : { id: id('type'), html: selectHtml(id('type'), a.type, ACTIVITY_TYPES.map(t => ({ value: t, label: t })), `${da} data-af="type"`, !!errs[`${o}.type`]) }, errs[`${o}.type`])}
  ${a.kind === 'generic' && a.type === 'Otro' ? fieldBox(`${o}.customType`, 'Tipo personalizado', textInput(id('customType'), a.customType, `${da} data-af="customType"`, !!errs[`${o}.customType`]), errs[`${o}.customType`]) : ''}
  ${fieldBox(`${o}.description`, 'Descripción detallada', { id: id('description'), html: `<textarea id="${id('description')}" rows="4" ${da} data-af="description">${esc(a.description)}</textarea>` }, errs[`${o}.description`], false, 'full-width')}
  </div></div>${a.kind === 'watermaster' ? watermasterBlock(a, errs) : ''}${equipmentSection(a, errs)}
  <div class="subsection"><div class="subsection-header"><h4 class="subsection-title">Registro fotográfico</h4></div><div class="photos-row">${photoField(a, 'before', 'Foto antes (opcional)')}${photoField(a, 'after', 'Foto después (opcional)')}</div></div>
  ${a.equipmentAssignments.length ? `<p class="activity-footer-note"><strong>Equipos:</strong> ${esc(codesOf(a).join(', '))}</p>` : ''}</div></article>`;
}
function watermasterBlock(a, errs) {
  const w = a.watermaster, q = `activity.${a.id}.wm`, da = `data-a="${a.id}"`, id = f => `${q}-${f}`.replace(/\./g, '-');
  const fld = (f, label, type = 'number') => fieldBox(`${q}.${f}`, label, textInput(id(f), w[f], `${da} data-w="${f}"`, !!errs[`${q}.${f}`], type), errs[`${q}.${f}`]);
  return `<div class="subsection watermaster-block"><div class="subsection-header"><h4 class="subsection-title">Draga Watermaster</h4></div><div class="form-grid cols-3">
  ${fld('sector', 'Poza / Sector Draga', 'text')}${fld('operator', 'Operador', 'text')}
  ${fieldBox(`${q}.depth`, 'Profundidad de Triturado (m)', { id: id('depth'), html: selectHtml(id('depth'), w.depth === null ? '' : String(w.depth), DEPTHS.map(d => ({ value: String(d), label: depthLabel(d) })), `${da} data-w="depth"`, !!errs[`${q}.depth`]) }, errs[`${q}.depth`])}
  <div class="form-row-triple">${fld('hourmeterStart', 'Horómetro Inicial Draga')}${fld('hourmeterEnd', 'Horómetro Final Draga')}${computed('Horas efectivas', `${F(wmHours(w))} h`, { live: `wh:${a.id}` })}</div>
  <div class="form-row-triple">${fld('pumpHourmeterStart', 'Horómetro Inicial Bomba')}${fld('pumpHourmeterEnd', 'Horómetro Final Bomba')}${computed('Horas bomba', `${F(wmPump(w))} h`, { live: `wp:${a.id}` })}</div>
  <div class="form-field full-width" data-field="${q}.hardness"><span class="field-label" id="${id('hardness')}">Dureza del Material</span><div class="hardness-grid${errs[`${q}.hardness`] ? ' field-invalid-group' : ''}" role="group" aria-labelledby="${id('hardness')}">${HARDNESS.map(h => `<button type="button" class="hardness-btn ${h.cls}${w.hardness === h.value ? ' selected' : ''}" aria-pressed="${w.hardness === h.value}" data-act="hardness" ${da} data-v="${h.value}">${h.label}${w.hardness === h.value ? ic('check', 16, 'hardness-check') : ''}</button>`).join('')}</div><span class="err-slot">${fieldErr(errs[`${q}.hardness`])}</span></div>
  <div class="form-row-triple">${fld('manufacturerPerformance', 'Rendimiento según fabricante (m³/h)')}${computed('Total M³ / Volumen removido', `${F(wmM3(w))} m³`, { highlight: true, live: `wm3:${a.id}` })}${computed('Rendimiento horario real', `${F(wmRate(w))} m³/h`, { live: `wr:${a.id}` })}</div></div></div>`;
}
function sortSelected(list, sel) { return [...list].sort((a, b) => (+!sel.has(a.id)) - (+!sel.has(b.id))); }
function equipmentSection(a, errs) {
  const r = S.report, o = `activity.${a.id}`, sel = new Set(r.roster.map(e => e.equipmentId)); const has = id => a.equipmentAssignments.some(e => e.equipmentId === id);
  const item = (e, type) => { const n = rosterOf(r, e.id); return checklistItem(e, has(e.id), 'asgToggle', `data-a="${a.id}" data-eq="${esc(e.id)}" data-code="${esc(e.code)}" data-type="${type}"`, n && rosterReady(n) ? rosterTip(n) : ''); };
  const t = a.equipmentAssignments.filter(e => e.equipmentType === 'truck'), m = a.equipmentAssignments.filter(e => e.equipmentType === 'machinery');
  return `<div class="subsection equipment-section"><div class="subsection-header"><h4 class="subsection-title">Equipos asignados a esta actividad</h4><span class="equipment-legend">${readyBadge('').replace('title=""', '')}Con datos en Dotación activa</span></div>
  <div class="equipment-picker${errs[`${o}.equipment`] ? ' field-invalid-group' : ''}" data-field="${o}.equipment"><div><div class="equipment-group-header"><p class="equipment-category">${ic('truck', 15)}Camiones Tolva</p><span class="equipment-group-count">${t.length} seleccionados</span></div><ul class="equipment-checklist">${sortSelected(trucksCfg(), sel).map(e => item(e, 'truck')).join('')}</ul></div>
  <div><div class="equipment-group-header"><p class="equipment-category">${ic('machine', 15)}Maquinaria</p><span class="equipment-group-count">${m.length} seleccionados</span></div><ul class="equipment-checklist">${sortSelected(machCfg(), sel).map(e => item(e, 'machinery')).join('')}</ul></div></div>
  ${a.equipmentAssignments.length ? `<div class="equipment-assignments">${t.map(s => truckCard(a, s, errs)).join('')}${m.map(s => machCard(a, s, errs)).join('')}${t.length ? `<p class="activity-m3-total"><span>Total M³ actividad (camiones)</span><strong data-live="am3:${a.id}">${F(actTruckM3(a, S.config))} m³</strong></p>` : ''}</div>` : ''}
  <div class="form-field support-equipment"><label class="field-label" for="activity-${a.id}-support"><span>Equipos de apoyo <span class="field-hint">(opcional)</span></span></label><input id="activity-${a.id}-support" type="text" placeholder="Ej: TYGB-99, VCCW73" value="${esc(a.supportEquipment)}" data-a="${a.id}" data-af="supportEquipment"></div></div>`;
}
function asgHeadChip(a, s, errs) { const n = rosterOf(S.report, s.equipmentId); const ok = !!(n && rosterReady(n)); const e = errs[`activity.${a.id}.equipment.${s.id}.roster`]; return ok ? chip('ready', 'Datos desde Dotación activa') : e ? chip('error', 'Sin datos válidos') : ''; }
function inheritedGrid(a, s) {
  const u = opData(s, S.report), z = areaOf(a);
  let h = `${computed('Operador', u.operator || '—', { variant: 'inherited' })}${computed('Zona de trabajo', z || '—', { variant: 'inherited' })}<div class="form-row-triple">${computed('Horómetro Inicial', u.hourmeterStart || '—', { variant: 'inherited' })}${computed('Horómetro Final', u.hourmeterEnd || '—', { variant: 'inherited' })}${computed('Horas de operación', `${F(diff(u.hourmeterStart, u.hourmeterEnd))} h`)}</div>`;
  if (s.equipmentType === 'truck') h += `<div class="form-row-triple">${computed('KM Inicial', u.kmStart || '—', { variant: 'inherited' })}${computed('KM Final', u.kmEnd || '—', { variant: 'inherited' })}${computed('KM recorridos', `${F(diff(u.kmStart ?? '', u.kmEnd ?? ''))} km`)}</div>`;
  else { const m = actMachM3(a, S.config); h += `<div class="trips-row">${computed('M³ asociado a la actividad', m == null ? '-' : `${F(m)} m³`, { highlight: true })}</div>`; }
  return h;
}
function asgSummary(a, s) { const u = opData(s, S.report); if (s.equipmentType === 'truck') return `Operador: <strong>${esc(u.operator || '—')}</strong> · Total: <strong>${F(tripsM3(s, S.config))} m³</strong>`; const m = actMachM3(a, S.config); return `Operador: <strong>${esc(u.operator || '—')}</strong> · M³ actividad: <strong>${m == null ? '-' : F(m)}</strong>`; }
function asgCardShell(a, s, errs, type, body) {
  const key = `${a.id}:${s.id}`, e = errs[`activity.${a.id}.equipment.${s.id}.roster`];
  return `<div class="equipment-card${s.collapsed ? ' is-collapsed' : ''}"><div class="equipment-card-header"><div class="equipment-card-heading"><span class="equipment-card-code">${esc(s.equipmentCode)}</span><span class="equipment-card-type">${type}</span><span data-live="achip:${key}">${asgHeadChip(a, s, errs)}</span>${s.collapsed ? `<span class="equipment-card-summary" data-live="asum:${key}">${asgSummary(a, s)}</span>` : ''}</div>${collapseBtn(s.collapsed, 'asgCollapse', `data-a="${a.id}" data-s="${s.id}"`, s.equipmentCode)}</div>
  ${s.collapsed ? `<span data-live="aerr:${key}">${fieldErr(e)}</span>` : `<div class="equipment-card-body"><span data-live="aerr:${key}">${fieldErr(e)}</span><div class="form-grid cols-3" data-field="activity.${a.id}.equipment.${s.id}.roster">${body}</div></div>`}</div>`;
}
function truckCard(a, s, errs) {
  const key = `${a.id}:${s.id}`, p = `activity.${a.id}.equipment.${s.id}`;
  const body = `<div style="display:contents" data-live="ainh:${key}">${inheritedGrid(a, s)}</div><div class="trips-row">${fieldBox(`${p}.trips`, 'N° de Vueltas', textInput(`${p}-trips`.replace(/\./g, '-'), s.trips, `data-a="${a.id}" data-s="${s.id}" data-trips="1"`, !!errs[`${p}.trips`], 'number'), errs[`${p}.trips`])}${computed('Capacidad por vuelta', `${capacityOf(s.equipmentId, S.config)} m³`, { variant: 'inherited' })}${computed('Total M³', `${F(tripsM3(s, S.config))} m³`, { highlight: true, live: `tm3:${key}` })}</div>`;
  return asgCardShell(a, s, errs, 'Camión tolva', body);
}
function machCard(a, s, errs) { return asgCardShell(a, s, errs, 'Maquinaria', `<div style="display:contents" data-live="ainh:${a.id}:${s.id}">${inheritedGrid(a, s)}</div>`); }
function photoField(a, which, label) {
  const p = which === 'before' ? a.beforePhoto : a.afterPhoto; const id = `photo-${a.id}-${which}`;
  return `<div class="photo-field" data-field="activity.${a.id}.photo.${which}"><span class="field-label">${label}</span>${p?.dataUrl ? `<div class="photo-preview-wrap"><img src="${p.dataUrl}" alt="${label}" class="photo-preview"><div class="photo-actions"><label class="btn btn-ghost btn-sm" for="${id}">${ic('replace', 14)}Reemplazar</label><button type="button" class="btn btn-danger-ghost btn-sm" data-act="removePhoto" data-a="${a.id}" data-which="${which}">${ic('trash', 14)}Eliminar</button></div></div>` : `<label class="photo-drop" for="${id}"><span class="photo-drop-icon">${ic('image', 18)}</span><span class="photo-drop-text"><span class="photo-drop-title">Seleccionar imagen</span><span class="photo-drop-hint">JPEG, PNG o WebP</span></span></label>`}<input id="${id}" type="file" accept="image/jpeg,image/png,image/webp" class="hidden-input" data-photo="${which}" data-a="${a.id}"></div>`;
}
function summaryRows() { return S.report.activities.map((a, i) => { const n = areaOf(a), r = typeOf(a), c = codesOf(a); return `<tr><td class="col-index">${i + 1}</td><td class="${n ? '' : 'is-empty'}">${esc(n || '—')}</td><td class="${r ? '' : 'is-empty'}">${esc(r || '—')}</td><td class="col-description${a.description ? '' : ' is-empty'}">${esc(a.description || '—')}</td><td class="${c.length ? '' : 'is-empty'}">${c.length ? `<span class="equipment-codes">${c.map(x => `<span class="code-token">${esc(x)}</span>`).join('')}</span>` : '—'}</td></tr>`; }).join(''); }
function summarySection() { return `<section class="report-section summary-card" id="sec-summary" aria-labelledby="sec-summary-title">${sectionHeader('Resumen de Actividades', 'sec-summary-title', '', collapseBtn(S.summaryCollapsed, 'summaryCollapse', '', 'resumen'))}${S.summaryCollapsed ? '' : `<div class="panel panel-flush"><div class="table-wrap"><table class="data-table"><thead><tr><th class="col-index">#</th><th>Poza/Área</th><th>Tipo Actividad</th><th>Descripción</th><th>Equipos</th></tr></thead><tbody data-live="summary">${summaryRows()}</tbody></table></div></div>`}</section>`; }

function ringHtml(v, size = 56) { const n = (size - 5) / 2, c = 2 * Math.PI * n, i = Math.max(0, Math.min(100, v)); return `<div class="progress-ring" style="width:${size}px;height:${size}px" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${i}" aria-label="Avance del informe"><svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}"><circle class="progress-ring-track" cx="${size / 2}" cy="${size / 2}" r="${n}" stroke-width="5"/><circle class="progress-ring-value" cx="${size / 2}" cy="${size / 2}" r="${n}" stroke-width="5" stroke-dasharray="${c}" stroke-dashoffset="${c * (1 - i / 100)}" transform="rotate(-90 ${size / 2} ${size / 2})"/></svg><span class="progress-ring-label">${i}%</span></div>`; }
function sidebarProgress() {
  const r = S.report, errs = currentErrors(), M = progressOf(r, S.config, errs);
  const items = [{ id: 'sec-general', label: 'Antecedentes', meta: `${M.generalFilled} de ${M.generalTotal} campos`, status: M.status.general },
    { id: 'sec-roster', label: 'Dotación', meta: M.rosterTotal ? `${M.rosterReady} de ${M.rosterTotal} fichas completas` : 'Sin equipos seleccionados', status: M.status.roster },
    { id: 'sec-activities', label: 'Actividades', meta: `${plural(M.activityCount, 'registrada', 'registradas')} · ${plural(M.activitiesReady, 'lista', 'listas')}`, status: M.status.activities, children: r.activities.length > 1 ? r.activities.map((a, i) => ({ id: `activity-${a.id}`, label: areaOf(a) ? `Actividad ${i + 1} · ${areaOf(a)}` : `Actividad ${i + 1}` })) : null },
    { id: 'sec-summary', label: 'Resumen', meta: 'Revisión previa al envío' },
    { id: 'sec-generate', label: 'Generar y enviar', meta: M.errorCount ? `${M.errorCount} campos pendientes` : 'PDF y correo', status: M.status.generate }];
  return `<div class="sidebar-card progress-card">${ringHtml(M.progress)}<div><p class="progress-title">Avance del informe</p><p class="progress-sub">${M.errorCount ? `${M.errorCount} campos por revisar` : M.progress === 100 ? 'Listo para generar' : 'Completa las secciones'}</p></div></div>
  <nav class="step-nav" aria-label="Secciones del informe"><p class="sidebar-label">Secciones del informe</p><ol class="step-list">${items.map((e, t) => { const st = e.status || 'idle'; return `<li class="step-item is-${st}" data-step="${e.id}"><a href="#${e.id}" class="step-link" data-act="jump" data-target="${e.id}"><span class="step-marker">${st === 'done' ? ic('check', 13) : st === 'warning' ? ic('alert', 12) : t + 1}</span><span class="step-text"><span class="step-label">${esc(e.label)}</span>${e.meta ? `<span class="step-meta">${esc(e.meta)}</span>` : ''}</span></a>${e.children ? `<ul class="step-sublist">${e.children.map(c => `<li><a href="#${c.id}" class="step-sublink" data-act="jump" data-target="${c.id}" data-substep="${c.id}">${esc(c.label)}</a></li>`).join('')}</ul>` : ''}</li>`; }).join('')}</ol></nav>`;
}
// --- actualización en vivo (sin perder el foco al escribir)
function liveUpdate() {
  const r = S.report, cfg = S.config, errs = currentErrors();
  const L = {
    rh: id => { const e = rosterOf(r, id); return e ? esc(`${F(diff(e.hourmeterStart, e.hourmeterEnd))} h`) : null; },
    rk: id => { const e = rosterOf(r, id); return e ? esc(`${F(diff(e.kmStart ?? '', e.kmEnd ?? ''))} km`) : null; },
    rchip: id => { const e = rosterOf(r, id); return e ? rosterChipHtml(e, errs) : null; },
    rosterCount: () => `${r.roster.filter(rosterReady).length} de ${r.roster.length} completas`,
    wh: id => { const a = r.activities.find(x => x.id === id); return a ? esc(`${F(wmHours(a.watermaster))} h`) : null; },
    wp: id => { const a = r.activities.find(x => x.id === id); return a ? esc(`${F(wmPump(a.watermaster))} h`) : null; },
    wm3: id => { const a = r.activities.find(x => x.id === id); return a ? esc(`${F(wmM3(a.watermaster))} m³`) : null; },
    wr: id => { const a = r.activities.find(x => x.id === id); return a ? esc(`${F(wmRate(a.watermaster))} m³/h`) : null; },
    am3: id => { const a = r.activities.find(x => x.id === id); return a ? esc(`${F(actTruckM3(a, cfg))} m³`) : null; },
    ameta: id => { const a = r.activities.find(x => x.id === id); return a ? activityMeta(a) : null; },
    summary: () => summaryRows()
  };
  const pair = k => { const [ai, si] = k.split(':'); const a = r.activities.find(x => x.id === ai); const s = a?.equipmentAssignments.find(x => x.id === si); return [a, s]; };
  L.achip = k => { const [a, s] = pair(k); return a && s ? asgHeadChip(a, s, errs) : null; };
  L.asum = k => { const [a, s] = pair(k); return a && s ? asgSummary(a, s) : null; };
  L.aerr = k => { const [a, s] = pair(k); return a && s ? fieldErr(errs[`activity.${a.id}.equipment.${s.id}.roster`]) : null; };
  L.ainh = k => { const [a, s] = pair(k); return a && s ? inheritedGrid(a, s) : null; };
  L.tm3 = k => { const [a, s] = pair(k); return a && s ? esc(`${F(tripsM3(s, cfg))} m³`) : null; };
  $$('[data-live]').forEach(el => {
    const [k, ...rest] = el.dataset.live.split(':'); const arg = rest.join(':');
    if (k === 'pendingAlert' || k === 'genWarning') { el.hidden = !Object.keys(errs).length; return; }
    if (k === 'actErr') { el.hidden = !Object.keys(errs).some(x => x.startsWith(`activity.${arg}.`)); return; }
    const f = L[k]; if (!f) return; const h = f(arg); if (h != null && el.innerHTML !== h) el.innerHTML = h;
  });
  // errores por campo
  $$('#app [data-field]').forEach(w => { const p = w.dataset.field; const m = errs[p]; const slot = w.querySelector(':scope > .err-slot'); if (slot) { const h = fieldErr(m); if (slot.innerHTML !== h) slot.innerHTML = h; } const c = w.querySelector(':scope > input, :scope > select, :scope > textarea'); if (c) c.classList.toggle('field-invalid', !!m); });
  const slotEl = $('#sidebar-slot'); if (slotEl) { const h = sidebarProgress(); slotEl.innerHTML = h; markSpy(); }
  const bar = $('#topbar-progress-bar'); if (bar) bar.style.width = progressOf(r, cfg, errs).progress + '%';
}
let spyActive = { main: '', sub: '' };
function markSpy() { $$('[data-step]').forEach(li => li.classList.toggle('is-active', li.dataset.step === spyActive.main)); $$('[data-substep]').forEach(a => a.classList.toggle('is-active', a.dataset.substep === spyActive.sub)); }
function spy() {
  const pick = ids => { let best = ids[0], top = -Infinity; for (const id of ids) { const el = document.getElementById(id); if (!el) continue; const t = el.getBoundingClientRect().top; if (t - 140 <= 0 && t > top + 1) { best = id; top = t; } } const end = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4; return end ? ids[ids.length - 1] : best; };
  const main = ['sec-general', 'sec-roster', 'sec-activities', 'sec-summary', 'sec-generate'];
  spyActive = { main: pick(main), sub: S.report.activities.length > 1 ? pick(S.report.activities.map(a => `activity-${a.id}`)) : '' };
  markSpy();
}
window.addEventListener('scroll', () => { if (S.route === 'report') spy(); }, { passive: true });

// =================================================================== ADMINISTRACIÓN
function adminPage() {
  const c = S.config; const t = c.equipment.filter(e => e.type === 'truck'), m = c.equipment.filter(e => e.type === 'machinery');
  const tabs = [{ id: 'general', label: 'Pozas generales', icon: 'pin', tone: 'cyan', count: c.generalAreas.length }, { id: 'activity', label: 'Pozas de actividades', icon: 'waves', tone: 'aqua', count: c.activityAreas.length }, { id: 'trucks', label: 'Camiones Tolva', icon: 'truck', tone: 'sand', count: t.length }, { id: 'machinery', label: 'Maquinaria', icon: 'machine', tone: 'coral', count: m.length }];
  const tab = S.adminTab; let panel = '';
  if (tab === 'general') panel = areaTable('generalAreas', 'Pozas / áreas de antecedentes generales', 'pin', 'cyan');
  if (tab === 'activity') panel = areaTable('activityAreas', 'Pozas / áreas de actividades', 'waves', 'aqua');
  if (tab === 'trucks') panel = equipTable('truck', 'Camiones Tolva', 'truck', 'sand', 'Agregar camión', 'Capacidad M³ por vuelta');
  if (tab === 'machinery') panel = equipTable('machinery', 'Maquinaria', 'machine', 'coral', 'Agregar maquinaria', 'Capacidad M³');
  return `<main class="app-main admin-main">${pageHead('Administración de parámetros', `<button type="button" class="btn btn-secondary btn-sm" data-act="closeAdmin">${ic('back', 16)}${S.route === 'report' ? 'Volver al informe' : 'Volver'}</button>`)}
  ${S.adminErr || S.adminMsg ? `<div class="alert-stack">${S.adminErr ? `<div class="global-alert" role="alert">${ic('alertCircle', 16)}${esc(S.adminErr)}</div>` : ''}${S.adminMsg ? `<div class="global-alert global-alert-success" role="status">${ic('checkCircle', 16)}${esc(S.adminMsg)}</div>` : ''}</div>` : ''}
  <div class="admin-tabs" role="tablist" aria-label="Parámetros">${tabs.map(x => `<button type="button" role="tab" aria-selected="${tab === x.id}" class="admin-tab tone-${x.tone}${tab === x.id ? ' is-active' : ''}" data-act="adminTab" data-tab="${x.id}"><span class="admin-tab-icon">${ic(x.icon, 16)}</span><span class="admin-tab-label">${x.label}</span><span class="admin-tab-count">${x.count}</span></button>`).join('')}</div>
  <div class="admin-tabpanel" role="tabpanel">${panel}</div></main>`;
}
function rowActions(editing, data) { return `<span class="table-actions">${editing ? `<button type="button" class="btn btn-primary btn-sm" data-act="adminSave" ${data} ${S.adminBusy ? 'disabled' : ''}>Guardar</button><button type="button" class="btn btn-ghost btn-sm" data-act="adminCancel" ${data}>Cancelar</button>` : `<button type="button" class="btn btn-ghost btn-sm" data-act="adminEdit" ${data}>${ic('pencil', 14)}Editar</button><button type="button" class="btn btn-danger-ghost btn-sm" data-act="adminDelete" ${data} ${S.adminBusy ? 'disabled' : ''}>${ic('trash', 14)}Eliminar</button>`}</span>`; }
function areaTable(list, title, icon, tone) {
  const items = S.config[list]; const add = S.adminAdd && S.adminAdd.list === list ? S.adminAdd : null;
  return `<section class="report-section">${sectionHeader(title, '', '', '', icon, tone)}<div class="panel panel-flush"><div class="table-wrap"><table class="data-table"><thead><tr><th>Nombre</th><th class="col-actions">Acciones</th></tr></thead><tbody>
  ${items.map(x => { const ed = S.adminEdit[x.id]; const d = `data-list="${list}" data-id="${esc(x.id)}"`; return `<tr class="${ed ? 'row-editing' : ''}"><td>${ed ? `<input type="text" id="adm-${esc(x.id)}" aria-label="Nombre" value="${esc(ed.name)}" data-adm="name" ${d}>` : esc(x.name)}</td><td class="col-actions">${rowActions(!!ed, d)}</td></tr>`; }).join('')}
  ${add ? `<tr class="row-editing"><td><input type="text" id="adm-new" aria-label="Nombre" placeholder="Nombre" value="${esc(add.name)}" data-adm="name" data-list="${list}" data-id="new"></td><td class="col-actions">${rowActions(true, `data-list="${list}" data-id="new"`)}</td></tr>` : ''}</tbody></table></div>
  ${add ? '' : `<div class="panel-footer"><button type="button" class="btn btn-secondary btn-sm" data-act="adminAdd" data-list="${list}">${ic('plus', 15)}Agregar</button></div>`}</div></section>`;
}
function equipTable(type, title, icon, tone, addLabel, capLabel) {
  const items = S.config.equipment.filter(e => e.type === type); const add = S.adminAdd && S.adminAdd.list === type ? S.adminAdd : null;
  return `<section class="report-section">${sectionHeader(title, '', '', '', icon, tone)}<div class="panel panel-flush"><div class="table-wrap"><table class="data-table"><thead><tr><th>Código</th><th>${capLabel}</th><th class="col-actions">Acciones</th></tr></thead><tbody>
  ${items.map(x => { const ed = S.adminEdit[x.id]; const d = `data-list="${type}" data-id="${esc(x.id)}"`; return `<tr class="${ed ? 'row-editing' : ''}"><td>${ed ? `<input type="text" id="adm-${esc(x.id)}" aria-label="Código" value="${esc(ed.code)}" data-adm="code" ${d}>` : `<span class="num">${esc(x.code)}</span>`}</td><td class="col-num">${ed ? `<input type="number" step="any" id="admc-${esc(x.id)}" aria-label="${capLabel}" value="${esc(ed.capacityM3)}" data-adm="capacityM3" ${d}>` : x.capacityM3 ?? '—'}</td><td class="col-actions">${rowActions(!!ed, d)}</td></tr>`; }).join('')}
  ${add ? `<tr class="row-editing"><td><input type="text" id="adm-new" aria-label="Código" placeholder="Código" value="${esc(add.code)}" data-adm="code" data-list="${type}" data-id="new"></td><td><input type="number" step="any" id="admc-new" aria-label="${capLabel}" placeholder="${capLabel}" value="${esc(add.capacityM3)}" data-adm="capacityM3" data-list="${type}" data-id="new"></td><td class="col-actions">${rowActions(true, `data-list="${type}" data-id="new"`)}</td></tr>` : ''}</tbody></table></div>
  ${add ? '' : `<div class="panel-footer"><button type="button" class="btn btn-secondary btn-sm" data-act="adminAdd" data-list="${type}">${ic('plus', 15)}${addLabel}</button></div>`}</div></section>`;
}
async function saveConfig(next) {
  S.adminBusy = true; S.adminErr = null; S.adminMsg = null; render();
  try { const j = await apiK('saveConfig', { password: S.adminPw, config: next }); if (!j.ok) { S.adminErr = j.message || 'No fue posible guardar la configuración.'; return false; } S.config = j.config; LS.set(K.config, j.config); S.adminMsg = 'Configuración guardada.'; return true; }
  catch (e) { S.adminErr = 'No fue posible guardar la configuración.'; return false; } finally { S.adminBusy = false; render(); }
}

// =================================================================== REVISIÓN (enlace del correo)
function startReview() { S.review = { state: 'loading', data: null, email: SS.get('rlReviewEmail') || '', error: null, emailErr: null, decide: null, comment: '', busy: false, open: true, pdfErr: null }; loadReview(S.review.email); }
async function loadReview(email) {
  const R = S.review;
  try { const j = await api({ a: 'review', token: S.token, email }); if (j.emailRequired) { R.state = 'email'; } else if (j.code === 'WRONG_EMAIL') { R.state = 'email'; R.emailErr = j.message; } else if (!j.ok) { R.state = 'error'; R.error = j.message || 'No fue posible cargar la revisión.'; } else { R.state = 'ready'; R.email = email; SS.set('rlReviewEmail', email); R.data = j.review; R.emailErr = null; } }
  catch (e) { R.state = 'error'; R.error = 'No fue posible cargar la revisión.'; }
  render();
}
function reviewDetails(v) { return `<dl class="detail-list"><div><dt>Fecha</dt><dd class="num">${fcl(v.reportDate)}</dd></div><div><dt>Creado por</dt><dd>${esc(v.createdBy)}</dd></div><div><dt>Supervisor</dt><dd>${esc(v.supervisor)}</dd></div><div><dt>Estado</dt><dd>${statusChip(v.status)}</dd></div></dl>`; }
const reviewPreview = v => `<div class="review-preview"><p class="modal-file">${ic('file', 16)}<span>${esc(v.filename)}</span></p><button type="button" class="btn btn-secondary btn-sm" data-act="reviewPdf">${ic('eye', 14)}Vista previa</button></div>`;
function reviewPage() {
  const R = S.review, v = R.data; let body = '';
  if (R.state === 'loading') body = '<div class="panel review-panel"><span class="skeleton" style="width:60%"></span><span class="skeleton" style="width:45%"></span><span class="skeleton" style="height:40px"></span></div>';
  if (R.state === 'error') body = `<div class="global-alert" role="alert">${ic('alertCircle', 16)}${esc(R.error)}</div>`;
  if (R.state === 'email') body = `<form class="panel review-panel" id="review-email-form" novalidate><div class="global-alert global-alert-warning" role="status">Para verificar tu identidad ingresa el correo en donde recibiste el informe</div><div class="form-field"><label class="field-label" for="review-email"><span>Correo del supervisor<span class="required">*</span></span></label><input id="review-email" type="email" autocomplete="email" class="${inv(!!R.emailErr)}" value="${esc(R.email)}">${fieldErr(R.emailErr)}</div><div class="review-panel-actions"><button type="submit" class="btn btn-primary">Continuar</button></div></form>`;
  if (R.state === 'ready' && v) body = `${v.decidedMessage ? `<div class="global-alert global-alert-success" role="status">${ic('checkCircle', 16)}${esc(v.decidedMessage)}</div>` : ''}<div class="panel review-panel">${reviewDetails(v)}${reviewPreview(v)}${v.status === 'IN_REVIEW' ? '<div class="review-panel-actions"><button type="button" class="btn btn-primary" data-act="reviewOpen">Revisar informe</button></div>' : ''}</div>${R.pdfErr ? `<div class="global-alert" role="alert">${ic('alertCircle', 16)}${esc(R.pdfErr)}</div>` : ''}`;
  let modal = '';
  if (R.state === 'ready' && v && v.status === 'IN_REVIEW' && R.open) {
    const Q = { APPROVED: '¿Confirmas la aprobación de este informe?', REJECTED: '¿Confirmas el rechazo de este informe?' };
    modal = `<div class="modal-overlay" role="presentation" data-act="reviewClose" data-self="1"><div class="modal-card" role="dialog" aria-modal="true" aria-labelledby="review-title"><div class="modal-header"><div><h2 id="review-title" class="modal-title">Revisión del informe</h2><p class="modal-text">${R.decide ? Q[R.decide] : '¿Desea aprobar o rechazar este informe?'}</p></div><button type="button" class="btn btn-ghost btn-sm btn-icon-only" aria-label="Cerrar" data-act="reviewClose" ${R.busy ? 'disabled' : ''}>${ic('x', 18)}</button></div>
    <div class="modal-body">${reviewDetails(v)}${reviewPreview(v)}${R.decide === 'REJECTED' ? `<div class="form-field"><label class="field-label" for="rejection-comment">Comentarios (opcional)</label><textarea id="rejection-comment" class="rejection-comment" rows="6" maxlength="5000" ${R.busy ? 'disabled' : ''}>${esc(R.comment)}</textarea></div>` : ''}${R.decErr ? `<div class="global-alert" role="alert">${esc(R.decErr)}</div>` : ''}</div>
    ${R.decide ? `<div class="modal-actions"><button type="button" class="btn btn-ghost" data-act="reviewBack" ${R.busy ? 'disabled' : ''}>Cancelar</button><button type="button" class="btn ${R.decide === 'APPROVED' ? 'btn-primary' : 'btn-danger'}" data-act="reviewConfirm" ${R.busy ? 'disabled' : ''}>${R.busy ? 'Guardando...' : R.decide === 'APPROVED' ? 'Confirmar aprobación' : 'Confirmar rechazo'}</button></div>` : `<div class="modal-actions"><button type="button" class="btn btn-danger" data-act="reviewDecide" data-v="REJECTED">${ic('x', 15)}Rechazar</button><button type="button" class="btn btn-primary" data-act="reviewDecide" data-v="APPROVED">${ic('check', 15)}Aprobar</button></div>`}</div></div>`;
  }
  return `<main class="app-main">${pageHead('Revisión del informe')}<section class="report-section">${body}</section></main>${modal}`;
}

// =================================================================== MODALES
function modalHtml() {
  const M = S.modal; if (!M) return '';
  const closeX = (dis) => `<button type="button" class="btn btn-ghost btn-sm btn-icon-only" aria-label="Cerrar" data-act="modalClose" ${dis ? 'disabled' : ''}>${ic('x', 18)}</button>`;
  if (M.type === 'admin') return `<div class="modal-overlay" role="presentation" data-act="modalClose" data-self="1"><form class="modal-card modal-card-sm" id="admin-form" role="dialog" aria-modal="true" aria-labelledby="admin-password-title"><div class="modal-header"><div><h2 id="admin-password-title" class="modal-title">Administrar parámetros</h2><p class="modal-text">Ingresa la contraseña de administración.</p></div>${closeX(M.busy)}</div><div class="modal-body"><div class="form-field"><label class="field-label" for="admin-password">Contraseña</label><input id="admin-password" type="password" autocomplete="current-password" class="${inv(!!M.err)}" autofocus>${fieldErr(M.err)}</div></div><div class="modal-actions"><button type="button" class="btn btn-ghost" data-act="modalClose" ${M.busy ? 'disabled' : ''}>Cancelar</button><button type="submit" class="btn btn-primary" ${M.busy ? 'disabled' : ''}>${M.busy ? 'Validando...' : 'Entrar'}</button></div></form></div>`;
  if (M.type === 'send') {
    const e = M.errs || {};
    return `<div class="modal-overlay" role="presentation" ${M.busy ? '' : 'data-act="modalClose" data-self="1"'}><div class="modal-card" role="dialog" aria-modal="true" aria-labelledby="send-report-title"><div class="modal-header"><div><h2 id="send-report-title" class="modal-title">Enviar Informe Diario de Operaciones</h2><p class="modal-text">El supervisor recibirá el informe y un enlace para aprobarlo o rechazarlo.</p></div>${closeX(M.busy)}</div>
    <div class="modal-body"><p class="modal-file">${ic('file', 16)}<span>INFORME_DIARIO_${esc(S.report.date)}.pdf</span></p>
    <div class="form-field" data-field="send.primaryEmail"><label class="field-label" for="primary-recipient"><span>Correo del supervisor<span class="required">*</span></span></label><input id="primary-recipient" type="email" class="${inv(!!e.primary)}" value="${esc(M.primary)}" placeholder="supervisor@empresa.cl" data-send="primary" ${M.failedId ? 'disabled' : ''}>${fieldErr(e.primary)}</div>
    <div class="modal-group">${M.cc.length ? '<p class="modal-group-title">Destinatarios en copia (CC)</p>' : ''}${M.cc.map((c, i) => `<div class="additional-recipient-row"><div class="form-field"><label class="sr-only" for="additional-${i}">Destinatario en copia ${i + 1}</label><input id="additional-${i}" type="email" class="${inv(!!e['cc' + i])}" value="${esc(c)}" placeholder="gerencia@empresa.cl" data-send="cc" data-i="${i}" ${M.failedId ? 'disabled' : ''}>${fieldErr(e['cc' + i])}</div><button type="button" class="btn btn-danger-ghost btn-icon-only" aria-label="Eliminar destinatario en copia ${i + 1}" data-act="ccRemove" data-i="${i}" ${M.failedId ? 'disabled' : ''}>${ic('trash', 16)}</button></div>`).join('')}<button type="button" class="btn btn-secondary btn-sm btn-add-recipient" data-act="ccAdd" ${M.failedId ? 'disabled' : ''}>${ic('plus', 15)}Agregar destinatario en copia</button></div>
    ${M.failedId && !M.error ? '<div class="global-alert global-alert-info" role="status">Este informe ya está guardado con su PDF y sus fotos. Solo falta enviar el correo.</div>' : ''}${M.error ? `<div class="global-alert" role="alert">${esc(M.error)}</div>` : ''}</div>
    <div class="modal-actions"><button type="button" class="btn btn-ghost" data-act="modalClose" ${M.busy ? 'disabled' : ''}>Cancelar</button><button type="button" class="btn btn-primary" data-act="sendNow" ${M.busy ? 'disabled' : ''}>${ic('send', 15)}${M.busy ? (M.step || 'Enviando...') : M.failedId ? 'Reintentar envío' : 'Enviar informe'}</button></div></div></div>`;
  }
  if (M.type === 'sent') return `<div class="modal-overlay" role="presentation" data-act="modalClose" data-self="1"><div class="modal-card modal-card-sm" role="dialog" aria-modal="true" aria-labelledby="report-sent-title"><div class="modal-header"><div><h2 id="report-sent-title" class="modal-title">${M.queued ? 'Informe guardado en este teléfono' : '¡Informe enviado correctamente!'}</h2><p class="modal-text">${M.queued ? 'No hay señal. Se enviará automáticamente apenas vuelva la conexión.' : 'El supervisor recibió el informe y el enlace para revisarlo.'}</p></div></div><div class="modal-body"><div class="global-alert ${M.queued ? 'global-alert-warning' : 'global-alert-success'}" role="status">${ic(M.queued ? 'cloudOff' : 'checkCircle', 16)}${M.queued ? 'Mantén la página abierta o vuelve a abrirla con señal. El formulario quedó listo para un informe nuevo.' : 'Puedes consultarlo en el historial. El formulario quedó listo para un informe nuevo.'}</div>${!M.queued && M.ccDelivered === false ? `<div class="global-alert global-alert-warning" role="status">${ic('alert', 16)}No se pudo entregar la copia a los demás destinatarios.</div>` : ''}</div><div class="modal-actions"><button type="button" class="btn btn-primary" data-act="modalClose">Aceptar</button></div></div></div>`;
  if (M.type === 'resend') return `<div class="modal-overlay" role="presentation" ${M.busy ? '' : 'data-act="modalClose" data-self="1"'}><div class="modal-card modal-card-sm" role="dialog" aria-modal="true" aria-labelledby="resend-report-title"><div class="modal-header"><div><h2 id="resend-report-title" class="modal-title">Reenviar informe</h2><p class="modal-text">Se enviará el mismo informe del ${fcl(M.report.reportDate)}, sin crear uno nuevo.</p></div>${closeX(M.busy)}</div><div class="modal-body"><div class="form-field"><label class="field-label" for="resend-email"><span>Correo del supervisor<span class="required">*</span></span></label><input id="resend-email" type="email" class="${inv(!!M.err)}" value="${esc(M.email)}" placeholder="supervisor@empresa.cl">${fieldErr(M.err)}</div>${M.error ? `<div class="global-alert" role="alert">${esc(M.error)}</div>` : ''}</div><div class="modal-actions"><button type="button" class="btn btn-ghost" data-act="modalClose" ${M.busy ? 'disabled' : ''}>Cancelar</button><button type="button" class="btn btn-primary" data-act="resendNow" ${M.busy ? 'disabled' : ''}>${ic('send', 15)}${M.busy ? 'Enviando...' : 'Reenviar'}</button></div></div></div>`;
  if (M.type === 'comment') return `<div class="modal-overlay" role="presentation" data-act="modalClose" data-self="1"><div class="modal-card" role="dialog" aria-modal="true" aria-labelledby="report-comment-title"><div class="modal-header"><div><h2 id="report-comment-title" class="modal-title">Comentario del supervisor</h2><p class="modal-text">Informe rechazado del ${fcl(M.report.reportDate)}</p></div>${closeX()}</div><div class="modal-body"><p class="comment-text">${esc(M.report.rejectionComment)}</p></div><div class="modal-actions"><button type="button" class="btn btn-primary" data-act="modalClose">Cerrar</button></div></div></div>`;
  if (M.type === 'edit') return `<div class="modal-overlay" role="presentation" ${M.busy ? '' : 'data-act="modalClose" data-self="1"'}><div class="modal-card modal-card-sm" role="dialog" aria-modal="true" aria-labelledby="edit-rejected-title"><div class="modal-header"><div><h2 id="edit-rejected-title" class="modal-title">Volver a editar</h2><p class="modal-text">Se usará el informe rechazado del ${fcl(M.report.reportDate)} como base para crear uno corregido.</p></div></div><div class="modal-body"><p class="modal-text">El informe rechazado no cambiará. Lo que tengas en el formulario de generación será reemplazado.</p>${M.error ? `<div class="global-alert" role="alert">${esc(M.error)}</div>` : ''}</div><div class="modal-actions"><button type="button" class="btn btn-ghost" data-act="modalClose" ${M.busy ? 'disabled' : ''}>Cancelar</button><button type="button" class="btn btn-primary" data-act="editConfirm" ${M.busy ? 'disabled' : ''}>${ic('pencil', 15)}${M.busy ? 'Cargando...' : 'Continuar'}</button></div></div></div>`;
  if (M.type === 'loading') return `<div class="modal-overlay" role="presentation"><div class="modal-card modal-card-sm" role="dialog" aria-modal="true"><div class="modal-body"><p class="modal-text">${esc(M.text)}</p><span class="skeleton" style="height:8px"></span></div></div></div>`;
  return '';
}

// =================================================================== datos remotos
async function loadConfig() { try { const j = await apiK('config'); if (j.ok) { S.config = j.config; LS.set(K.config, j.config); if (j.site) { S.site = j.site; LS.set(K.site, j.site); } if (!isTyping()) render(); } } catch (e) {} }
async function loadReports() {
  if (!S.codeOk || S.reportsLoading) return; S.reportsLoading = true;
  try { const j = await apiK('list'); if (!j.ok) throw new Error(j.message); S.reports = j.reports; S.reportsErr = null; LS.set(K.reports, j.reports); }
  catch (e) { S.reportsErr = e.message || 'error'; } finally { S.reportsLoading = false; if (!isTyping() && (S.route === 'dashboard' || S.route === 'history')) render(); }
}
function isTyping() { const a = document.activeElement; return a && /INPUT|TEXTAREA/.test(a.tagName) && a.type !== 'checkbox'; }
const b64ToBlob = (b64, type) => { const bin = atob(b64); const u = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i); return new Blob([u], { type }); };
function openBlob(blob, name, win) { const url = URL.createObjectURL(blob); if (win) { win.location.href = url; } else { const a = document.createElement('a'); a.href = url; a.target = '_blank'; a.rel = 'noopener'; document.body.appendChild(a); a.click(); a.remove(); } setTimeout(() => URL.revokeObjectURL(url), 60000); }
function downloadBlob(blob, name) { const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 4000); }
async function fetchPdf(id, mode) {
  const win = mode === 'open' ? window.open('', '_blank') : null;
  try { const j = await apiK('pdf', { reportId: id }); if (!j.ok) throw new Error(j.message); const b = b64ToBlob(j.data, 'application/pdf'); if (mode === 'open') openBlob(b, j.filename, win); else downloadBlob(b, j.filename); }
  catch (e) { if (win) win.close(); alert('No fue posible obtener el PDF. Revisa la señal e intenta nuevamente.'); }
}

// --- transformar un informe anterior
function fromSnapshot(snap) { const r = typeof snap === 'string' ? JSON.parse(snap) : snap; r.roster = r.roster || []; r.activities = (r.activities || []).map(a => ({ ...a, equipmentAssignments: a.equipmentAssignments || [] })); return r; }
function carryFrom(prev, date) {
  const ids = new Set(S.config.equipment.map(e => e.id)); const base = newReport(); const wm = prev.activities.find(a => a.kind === 'watermaster')?.watermaster; const [first, ...rest] = base.activities;
  return { ...base, supervisor: prev.supervisor, area: prev.area, apr: prev.apr,
    roster: prev.roster.filter(e => ids.has(e.equipmentId)).map(e => ({ ...e, hourmeterStart: e.hourmeterEnd, hourmeterEnd: '', ...(e.equipmentType === 'truck' ? { kmStart: e.kmEnd ?? '', kmEnd: '' } : {}), collapsed: false })),
    activities: [{ ...first, watermaster: wm ? { ...first.watermaster, sector: wm.sector, operator: wm.operator, hourmeterStart: wm.hourmeterEnd, pumpHourmeterStart: wm.pumpHourmeterEnd, manufacturerPerformance: wm.manufacturerPerformance } : first.watermaster }, ...rest], carriedFrom: date };
}

// =================================================================== imágenes
function compressImage(file) { return new Promise((res, rej) => { const fr = new FileReader(); fr.onload = () => { const img = new Image(); img.onload = () => { const max = 1600; let w = img.width, h = img.height; const s = Math.min(1, max / Math.max(w, h)); w = Math.round(w * s); h = Math.round(h * s); const c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, w, h); x.drawImage(img, 0, 0, w, h); let q = .82, out = c.toDataURL('image/jpeg', q); while (out.length > 700000 && q > .4) { q -= .08; out = c.toDataURL('image/jpeg', q); } res({ dataUrl: out, contentType: 'image/jpeg', w, h }); }; img.onerror = rej; img.src = fr.result; }; fr.onerror = rej; fr.readAsDataURL(file); }); }

// =================================================================== PDF (mismo formato que la referencia)
const libs = {};
function loadScript(src) { if (libs[src]) return libs[src]; libs[src] = new Promise((res, rej) => { const s = document.createElement('script'); s.src = src; s.onload = res; s.onerror = () => { delete libs[src]; rej(new Error('carga')); }; document.head.appendChild(s); }); return libs[src]; }
let logoData = null;
async function logoDataUrl() { if (logoData) return logoData; try { const b = await fetch(LOGO).then(r => r.blob()); logoData = await new Promise(r => { const f = new FileReader(); f.onload = () => r(f.result); f.readAsDataURL(b); }); } catch (e) { logoData = null; } return logoData; }
async function buildPdf(r) {
  await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');
  const { jsPDF } = window.jspdf; const doc = new jsPDF({ unit: 'pt', format: 'a4' }); const cfg = S.config, site = S.site;
  const W = doc.internal.pageSize.getWidth(), H = doc.internal.pageSize.getHeight(); const PX = 28, PT = 32, PB = 58, CW = W - PX * 2;
  const C = { teal: [23, 109, 120], tealDark: [21, 95, 104], text: [17, 17, 17], muted: [102, 102, 102], border: [34, 34, 34], white: [255, 255, 255], box: [243, 247, 248], boxLine: [213, 227, 230] };
  const logo = await logoDataUrl(); let y = PT;
  const font = (size, bold, color = C.text, style) => { doc.setFont('helvetica', style || (bold ? 'bold' : 'normal')); doc.setFontSize(size); doc.setTextColor(...color); };
  const footer = () => { font(5.5, false, C.muted); doc.text(site.pie || DEFAULT_SITE.pie, W / 2, H - 14 - 2, { align: 'center' }); };
  const newPage = () => { doc.addPage(); y = PT; };
  const ensure = h => { if (y + h > H - PB) { footer(); newPage(); } };
  const sectionHeader = t => { y += 14; doc.setFillColor(...C.teal); doc.roundedRect(PX, y, 4, 14, 2, 2, 'F'); font(12, true, C.tealDark); doc.setCharSpace(.6); doc.text(t.toUpperCase(), PX + 12, y + 11); doc.setCharSpace(0); y += 14 + 8; };
  const plainTitle = t => { font(12, true, C.tealDark); doc.setCharSpace(.6); doc.text(t.toUpperCase(), PX, y + 11); doc.setCharSpace(0); y += 16; };
  // ---- portada
  const LH = 28, LW = logo ? Math.min(110, LH * 3.125) : 0;
  if (logo) doc.addImage(logo, 'PNG', PX, y, LW, LH);
  font(11, true, C.tealDark); doc.text(site.cliente || 'NOVANDINO', W - PX, y + LH / 2 + 4, { align: 'right' }); y += LH + 10;
  y += 8; font(20, true, C.tealDark); doc.setCharSpace(.4); doc.text('INFORME DIARIO DE OPERACIONES', W / 2, y + 16, { align: 'center' }); doc.setCharSpace(0); y += 20 + 6;
  font(12, true, C.tealDark); doc.text(site.area || 'Área de Pozas', W / 2, y + 10, { align: 'center' }); y += 14; doc.text(`Fecha: ${r.date}`, W / 2, y + 10, { align: 'center' }); y += 14;
  sectionHeader('Antecedentes generales');
  const info = [['Supervisor', r.supervisor], ['Administrativo', site.administrativo || 'Octavio Waiz'], ['APR', r.apr]];
  const infoRows = (rows, x0, w0) => rows.map(([l, v]) => { font(10, false); const lines = doc.splitTextToSize(String(v || '—'), w0 - 20 - 110); return { l, lines, h: Math.max(12, lines.length * 12) + 4 }; });
  const ir = infoRows(info, PX, CW); const ih = ir.reduce((s, x) => s + x.h, 0) + 16 - 4;
  doc.setFillColor(...C.box); doc.setDrawColor(...C.boxLine); doc.setLineWidth(1); doc.roundedRect(PX, y, CW, ih, 4, 4, 'FD');
  let yy = y + 8; ir.forEach(x => { font(9, true, C.tealDark); doc.text(x.l, PX + 10, yy + 9); font(10, false); doc.text(x.lines, PX + 120, yy + 9, { lineHeightFactor: 1.2 }); yy += x.h; }); y += ih;
  sectionHeader('Detalle de actividades');
  const acts = r.activities.filter(a => !wmEmpty(a));
  if (!acts.length) { font(9, false, C.muted, 'italic'); doc.text('No hay actividades con información para este informe.', PX, y + 9); y += 14; }
  acts.forEach((a, i) => {
    const rows = [['Poza / Área', areaOf(a) || '—'], ['Tipo', typeOf(a) || '—'], ['Equipos', codesOf(a).length ? codesOf(a).join(', ') : '—']]; if ((a.supportEquipment || '').trim()) rows.push(['Apoyo', a.supportEquipment]);
    const rr = infoRows(rows, PX, CW); font(10, false); const desc = a.description.trim() ? doc.splitTextToSize(`"${a.description.trim()}"`, CW - 20) : [];
    const h = 8 + 17 + rr.reduce((s, x) => s + x.h, 0) - 4 + (desc.length ? 10 + desc.length * 14 : 0) + 8;
    ensure(Math.min(h, 90) > H - PB - y ? h : Math.min(h + 8, H)); if (y + h > H - PB) { footer(); newPage(); }
    doc.setFillColor(...C.box); doc.rect(PX, y, CW, h, 'F'); doc.setFillColor(...C.teal); doc.rect(PX, y, 3, h, 'F');
    let k = y + 8; font(11, true, C.tealDark); doc.text(`Actividad ${i + 1}`, PX + 10, k + 10); k += 17;
    rr.forEach(x => { font(9, true, C.tealDark); doc.text(x.l, PX + 10, k + 9); font(10, false); doc.text(x.lines, PX + 120, k + 9, { lineHeightFactor: 1.2 }); k += x.h; });
    if (desc.length) { k += 6; font(10, false); doc.text(desc, PX + 10, k + 10, { lineHeightFactor: 1.4 }); }
    y += h + 8;
  });
  footer();
  // ---- tabla genérica con bordes
  const table = (cols, rows, opts = {}) => {
    const widths = cols.map(c => CW * parseFloat(c.width) / 100); const hdrSize = 9, cell = opts.cellSize || 9;
    const drawRow = (vals, header) => {
      font(header ? hdrSize : cell, true, header ? C.white : C.text); const lines = vals.map((v, i) => doc.splitTextToSize(String(v == null || v === '' ? ' ' : v), widths[i] - 6));
      const h = Math.max(...lines.map(l => l.length)) * (header ? 11 : 11) + (header ? 12 : 10);
      if (y + h > H - PB) { footer(); newPage(); }
      if (header) { doc.setFillColor(...C.teal); doc.rect(PX, y, CW, h, 'F'); }
      doc.setDrawColor(...C.border); doc.setLineWidth(1); let x = PX;
      lines.forEach((l, i) => { font(header ? hdrSize : cell, true, header ? C.white : C.text); const th = l.length * 11; doc.text(l, x + widths[i] / 2, y + (h - th) / 2 + 8.5, { align: 'center', lineHeightFactor: 1.22 }); x += widths[i]; if (i < lines.length - 1) doc.line(x, y, x, y + h); });
      doc.rect(PX, y, CW, h); y += h;
    };
    drawRow(cols.map(c => c.label), true); rows.forEach(rw => drawRow(rw, false)); y += 6;
  };
  // ---- Reporte Watermaster
  r.activities.filter(a => a.kind === 'watermaster' && a.watermaster && filled(a.watermaster.hourmeterStart) && filled(a.watermaster.hourmeterEnd)).forEach(a => {
    const e = a.watermaster; newPage(); plainTitle('REPORTE WATERMASTER');
    table([{ label: 'Indicador Operativo', width: '28%' }, { label: 'Detalle de Medición', width: '32%' }, { label: 'Valor Registrado', width: '22%' }, { label: 'Unidad / Equipo', width: '18%' }], [
      ['Watermaster Classic V (C4123)', `Ubicación: ${e.sector} / Operador: ${e.operator}`, '', ''],
      ['Horómetro Inicial', 'Registro de inicio de turno', e.hourmeterStart || '-', 'h'], ['Horómetro Final', 'Registro de término de turno', e.hourmeterEnd || '-', 'h'],
      ['Horas Efectivas', 'Horóm. final - Horóm. inicial', F(wmHours(e)), 'h'], ['Horómetro Inicial Bomba', 'Registro de inicio bomba', e.pumpHourmeterStart || '-', 'h'],
      ['Horómetro Final Bomba', 'Registro de término bomba', e.pumpHourmeterEnd || '-', 'h'], ['Horas Bomba', 'Horóm. bomba final - inicial', F(wmPump(e)), 'h'],
      ['Profundidad Operativa', 'Penetración del brazo triturador', e.depth === null ? '-' : depthLabel(e.depth), 'm'], ['Dureza del Material', 'Clasificación ingresada en formulario', e.hardness === null ? '-' : String(e.hardness), '%'],
      ['Rendimiento según fabricante', 'Capacidad teórica por profundidad', e.manufacturerPerformance || '-', 'm³/h'], ['Volumen Removido', 'Rendimiento × horas efectivas', F(wmM3(e)), 'm³'], ['Rendimiento Horario Real', 'Volumen / Horas efectivas', F(wmRate(e)), 'm³/h']]);
    footer();
  });
  // ---- Camiones tolva
  const tr = truckRows(r, cfg);
  if (tr.length) { newPage(); plainTitle('CAMIONES TOLVA');
    table([{ label: 'Camión Tolva', width: '14%' }, { label: 'Operador', width: '18%' }, { label: 'Hr. Inicial', width: '10%' }, { label: 'Hr. Final', width: '10%' }, { label: 'Km. Inicial', width: '10%' }, { label: 'Km. Final', width: '10%' }, { label: 'N° Vueltas', width: '12%' }, { label: 'Zona de trabajo', width: '16%' }],
      tr.map(e => [e.assignment.equipmentCode, e.operator, e.hourmeterStart, e.hourmeterEnd, e.kmStart, e.kmEnd, e.assignment.trips ?? '', e.zone])); footer(); }
  // ---- Maquinaria + gráfico
  const mr = []; r.activities.forEach(a => { const z = areaOf(a), m = actMachM3(a, cfg), mm = m == null ? '-' : F(m); a.equipmentAssignments.filter(s => s.equipmentType === 'machinery').forEach(s => { const o = opData(s, r); mr.push([s.equipmentCode, o.operator, o.hourmeterStart, o.hourmeterEnd, z, mm]); }); });
  const anyTruck = r.activities.some(a => a.equipmentAssignments.some(s => s.equipmentType === 'truck'));
  if (mr.length || anyTruck) { newPage();
    if (mr.length) { plainTitle('MAQUINARIA'); table([{ label: 'Maquinaria', width: '22%' }, { label: 'Operador', width: '20%' }, { label: 'Horómetro Inicial', width: '15%' }, { label: 'Horómetro Final', width: '15%' }, { label: 'Zona de trabajo', width: '18%' }, { label: 'M3', width: '10%' }], mr); }
    const tt = truckTotals(r, cfg);
    if (anyTruck && tt.length) { y += 36; if (y + 280 > H - PB) { footer(); newPage(); }
      const ox = PX, oy = y, sc = CW / 540; const X = v => ox + v * sc, Y = v => oy + v * sc;
      const max = (e => { if (e <= 0) return 50; const t = e * 1.08, n = t <= 100 ? 25 : t <= 250 ? 50 : 100; return Math.ceil(t / n) * n; })(Math.max(...tt.map(e => e.totalM3)));
      font(11, true, [34, 34, 34]); doc.text('Total m³ por camión', X(42), Y(16));
      for (let t = 0; t < 6; t++) { const v = max / 5 * (5 - t), yy2 = 28 + 204 / 5 * t; doc.setDrawColor(217, 217, 217); doc.setLineWidth(.8); doc.line(X(42), Y(yy2), X(524), Y(yy2)); font(8, false, [127, 127, 127]); doc.text(String(Math.round(v)), X(36), Y(yy2 + 3), { align: 'right' }); }
      doc.setDrawColor(127, 127, 127); doc.setLineWidth(1); doc.line(X(42), Y(28), X(42), Y(232)); doc.line(X(42), Y(232), X(524), Y(232));
      const gap = Math.max(14, 36 - tt.length), bw = Math.max(28, Math.min(52, (482 - gap * (tt.length + 1)) / tt.length)), slot = 482 / tt.length;
      tt.forEach((e, t) => { const hh = e.totalM3 / max * 204, x = 42 + t * slot + (slot - bw) / 2; doc.setFillColor(46, 117, 182); doc.rect(X(x), Y(232 - hh), bw * sc, Math.max(hh, 1) * sc, 'F'); font(8, true, [34, 34, 34]); doc.text(e.code, X(x + bw / 2), Y(246), { align: 'center' }); });
      font(9, false, [127, 127, 127]); doc.text('Camión', X(283), Y(272), { align: 'center' }); y += 280 * sc; }
    footer(); }
  // ---- Registro fotográfico
  const ph = r.activities.filter(a => a.beforePhoto?.dataUrl || a.afterPhoto?.dataUrl);
  if (ph.length) { newPage(); plainTitle('REGISTRO FOTOGRÁFICO');
    ph.forEach(a => { const need = 16 + 22 + 170 + 8; if (y + need > H - PB) { footer(); newPage(); }
      font(10, true, C.text, 'bolditalic'); doc.text(`Actividad: ${areaOf(a)}`, PX, y + 12); y += 18;
      const half = CW / 2; doc.setFillColor(...C.teal); doc.rect(PX, y, CW, 20, 'F'); font(9, true, C.white, 'bolditalic'); doc.text('Antes', PX + half / 2, y + 13.5, { align: 'center' }); doc.text('Después', PX + half + half / 2, y + 13.5, { align: 'center' });
      doc.setDrawColor(...C.border); doc.setLineWidth(1); doc.rect(PX, y, CW, 190); doc.line(PX + half, y, PX + half, y + 190); doc.line(PX, y + 20, PX + CW, y + 20);
      [a.beforePhoto, a.afterPhoto].forEach((p, i) => { const x0 = PX + i * half + 4, y0 = y + 24, bw2 = half - 8, bh = 160; if (p?.dataUrl) { const iw = p.w || 4, ih2 = p.h || 3; const s = Math.min(bw2 / iw, bh / ih2); const dw = iw * s, dh = ih2 * s; try { doc.addImage(p.dataUrl, 'JPEG', x0 + (bw2 - dw) / 2, y0 + (bh + 2 - dh) / 2, dw, dh); } catch (e) {} } else { font(8, false, C.muted); doc.text('Sin fotografía', x0 + bw2 / 2, y0 + bh / 2, { align: 'center' }); } });
      y += 190 + 8; });
    footer(); }
  return doc.output('blob');
}
const pdfName = d => `INFORME_DIARIO_${d}.pdf`;
async function ensureImageSizes(r) { for (const a of r.activities) for (const k of ['beforePhoto', 'afterPhoto']) { const p = a[k]; if (p?.dataUrl && !p.w) { await new Promise(res => { const i = new Image(); i.onload = () => { p.w = i.width; p.h = i.height; res(); }; i.onerror = res; i.src = p.dataUrl; }); } } }

// =================================================================== envío y bandeja sin señal
function summaryPayload(r, cfg) {
  const eq = new Map(); for (const a of r.activities) for (const s of a.equipmentAssignments) { const n = eq.get(s.equipmentId) ?? { code: s.equipmentCode, type: s.equipmentType, activities: 0 }; n.activities += 1; eq.set(s.equipmentId, n); }
  const wm = r.activities.map(a => a.kind === 'watermaster' ? wmRate(a.watermaster) : null).find(x => x !== null);
  return { area: r.area, supervisorName: r.supervisor.trim(), activities: r.activities.map(a => ({ area: areaOf(a), type: typeOf(a) })), equipment: [...eq.values()], watermasterHourlyPerformance: wm ?? null };
}
function snapshot(r) { return JSON.stringify(r, (k, v) => ['beforePhoto', 'afterPhoto', 'revisedFrom', 'carriedFrom'].includes(k) ? undefined : v); }
async function blobToB64(b) { return new Promise((res, rej) => { const f = new FileReader(); f.onload = () => res(String(f.result).split(',')[1]); f.onerror = rej; f.readAsDataURL(b); }); }
async function buildSubmission(r, supervisorEmail, ccEmails, submissionId) {
  const cfg = S.config, M = progressOf(r, cfg, {}); await ensureImageSizes(r); const pdf = await buildPdf(r);
  const photos = []; r.activities.forEach(a => [['before', a.beforePhoto], ['after', a.afterPhoto]].forEach(([w, p]) => { if (p?.dataUrl) photos.push({ activityId: a.id, which: w, contentType: p.contentType || 'image/jpeg', data: p.dataUrl.split(',')[1] }); }));
  const payload = { reportDate: r.date, supervisorEmail, ccEmails, guestProfile: S.profile, submissionId, apr: r.apr, formSnapshot: snapshot(r), revisedFromReportId: r.revisedFrom?.reportId ?? null,
    metrics: { activitiesCount: M.activityCount, activeEquipmentCount: M.rosterTotal, trucksCount: M.rosterTrucks, machineryCount: M.rosterMachinery, truckM3: M.truckM3, watermasterM3: M.watermasterM3 }, summary: summaryPayload(r, cfg) };
  return { id: submissionId, payload, pdf: await blobToB64(pdf), photos, queuedAt: new Date().toISOString() };
}
async function refreshOutbox() { S.outbox = (await DB.outAll()) || []; }
let syncing = false;
async function syncOutbox() {
  if (syncing || !navigator.onLine || !S.codeOk) return; await refreshOutbox(); if (!S.outbox.length) return; syncing = true;
  for (const item of [...S.outbox]) { try { const j = await apiK('submit', { payload: item.payload, pdf: item.pdf, photos: item.photos }); if (j.ok || j.reportId) await DB.outDel(item.id); else break; } catch (e) { break; } }
  syncing = false; await refreshOutbox(); loadReports(); if (!isTyping()) render();
}
window.addEventListener('online', () => { syncOutbox(); render(); }); window.addEventListener('offline', () => render());
setInterval(() => { if (S.outbox.length) syncOutbox(); }, 30000);

async function doSend() {
  const M = S.modal; const errs = {}; const p = normEmail(M.primary);
  if (!p) errs.primary = 'Ingresa un correo electrónico.'; else if (!okEmail(p)) errs.primary = 'Ingresa un correo electrónico válido.';
  const seen = new Set(p ? [p] : []); M.cc.forEach((c, i) => { const v = normEmail(c); if (!v) return; if (!okEmail(v)) { errs['cc' + i] = 'Ingresa un correo electrónico válido.'; return; } if (seen.has(v)) { errs['cc' + i] = 'Este destinatario ya fue agregado.'; return; } seen.add(v); });
  M.errs = errs; M.error = null; if (Object.keys(errs).length) { render(); return; }
  const cc = [...new Set(M.cc.map(normEmail).filter(Boolean))]; M.busy = true; M.step = 'Generando PDF...'; render();
  try {
    if (M.failedId) { const j = await apiK('resend', { reportId: M.failedId, supervisorEmail: p }); if (!j.ok) throw Object.assign(new Error(j.message), { reportId: M.failedId }); return sentOk(j.ccDelivered !== false, false); }
    const sub = await buildSubmission(S.report, p, cc, M.submissionId);
    if (!navigator.onLine) { await DB.outPut(sub); await refreshOutbox(); return sentOk(true, true); }
    M.step = 'Enviando...'; render();
    let j; try { j = await apiK('submit', { payload: sub.payload, pdf: sub.pdf, photos: sub.photos }); } catch (netErr) { if (/access/.test(netErr.message)) throw netErr; await DB.outPut(sub); await refreshOutbox(); return sentOk(true, true); }
    if (!j.ok) { if (j.reportId) { M.failedId = j.reportId; LS.set(K.failed, { reportId: j.reportId }); M.busy = false; M.error = 'El informe quedó guardado, pero no se pudo enviar el correo. Reintenta el envío.'; loadReports(); render(); return; } throw new Error(j.message); }
    sentOk(j.ccDelivered !== false, false);
  } catch (e) { M.busy = false; M.error = 'No fue posible enviar el informe. Inténtalo nuevamente.'; render(); }
}
function sentOk(ccDelivered, queued) { LS.del(K.failed); resetReport(); S.modal = { type: 'sent', ccDelivered, queued }; loadReports(); render(); window.scrollTo({ top: 0, behavior: 'instant' }); }
function resetReport() { S.report = newReport(); S.submitted = false; S.errs = {}; S.staleDraftDate = null; LS.del(K.draft); DB.del('draftPhotos'); }

// =================================================================== eventos
function findAct(t) { return t.closest('[data-act]'); }
document.addEventListener('click', async ev => {
  const el = findAct(ev.target); if (!el) { if (S.userMenu && !ev.target.closest('.user-menu')) { S.userMenu = false; render(); } return; }
  if (el.dataset.self && ev.target !== el) return;
  const act = el.dataset.act, d = el.dataset, r = S.report;
  const A = id => r.activities.find(a => a.id === id);
  switch (act) {
    case 'navClick': S.drawer = false; S.userMenu = false; if (S.adminOpen) { S.adminOpen = false; render(); } return;
    case 'drawerOpen': S.drawer = true; render(); return;
    case 'drawerClose': S.drawer = false; render(); return;
    case 'userMenu': S.userMenu = !S.userMenu; render(); return;
    case 'editProfile': S.userMenu = false; S.editingProfile = true; S.profileErrs = {}; render(); return;
    case 'profileCancel': S.editingProfile = false; render(); return;
    case 'clearProfile': S.userMenu = false; LS.del(K.draft); resetReport(); S.profile = null; LS.del(K.profile); render(); return;
    case 'lockAccess': lockAccess(); return;
    case 'openAdmin': S.userMenu = false; S.drawer = false; if (S.adminPw) { S.adminOpen = true; S.adminMsg = S.adminErr = null; render(); window.scrollTo(0, 0); } else { S.modal = { type: 'admin' }; render(); } return;
    case 'closeAdmin': S.adminOpen = false; S.adminEdit = {}; S.adminAdd = null; render(); return;
    case 'adminTab': S.adminTab = d.tab; S.adminAdd = null; render(); return;
    case 'adminAdd': S.adminAdd = { list: d.list, name: '', code: '', capacityM3: d.list === 'truck' ? '18' : '' }; render(); setTimeout(() => $('#adm-new')?.focus(), 0); return;
    case 'adminEdit': { const it = d.list === 'truck' || d.list === 'machinery' ? S.config.equipment.find(x => x.id === d.id) : S.config[d.list].find(x => x.id === d.id); S.adminEdit[d.id] = { ...it, capacityM3: it.capacityM3 == null ? '' : String(it.capacityM3) }; render(); return; }
    case 'adminCancel': if (d.id === 'new') S.adminAdd = null; else delete S.adminEdit[d.id]; render(); return;
    case 'adminSave': return adminSave(d.list, d.id);
    case 'adminDelete': return adminDelete(d.list, d.id);
    case 'modalClose': if (S.modal?.busy) return; S.modal = null; render(); return;
    case 'startOver': if (confirm('¿Descartar el borrador y empezar un informe nuevo?')) { resetReport(); go('report'); } return;
    case 'fromLast': S.busy = true; S.dashErr = null; render(); try { const j = await apiK('latestForm'); if (!j.ok) throw new Error(j.message); S.report = carryFrom(fromSnapshot(j.formSnapshot), j.reportDate); S.report.date = hoy(); S.busy = false; saveDraft(); go('report'); } catch (e) { S.busy = false; S.dashErr = e.message || 'No fue posible cargar el último informe.'; render(); } return;
    case 'pdfOpen': return fetchPdf(d.id, 'open');
    case 'pdfDownload': return fetchPdf(d.id, 'download');
    case 'resendOpen': { const rep = S.reports.find(x => x.id === d.id); S.modal = { type: 'resend', report: rep, email: rep.supervisorEmail || '' }; render(); return; }
    case 'resendNow': { const M = S.modal; const v = normEmail($('#resend-email').value); M.email = v; if (!v) { M.err = 'Ingresa un correo electrónico.'; render(); return; } if (!okEmail(v)) { M.err = 'Ingresa un correo electrónico válido.'; render(); return; } M.err = null; M.busy = true; render(); try { const j = await apiK('resend', { reportId: M.report.id, supervisorEmail: v }); if (!j.ok) throw new Error(j.message); S.modal = null; S.hist.msg = 'El informe fue reenviado al supervisor.'; loadReports(); } catch (e) { M.busy = false; M.error = e.message || 'No fue posible enviar el informe.'; } render(); return; }
    case 'showComment': S.modal = { type: 'comment', report: S.reports.find(x => x.id === d.id) }; render(); return;
    case 'editRejected': S.modal = { type: 'edit', report: S.reports.find(x => x.id === d.id) }; render(); return;
    case 'editConfirm': { const M = S.modal; M.busy = true; M.error = null; render(); try { const j = await apiK('editData', { reportId: M.report.id }); if (!j.ok) throw new Error(j.message); const rep = fromSnapshot(j.formSnapshot); (j.photos || []).forEach(p => { const a = rep.activities.find(x => x.id === p.activityId); if (a) a[p.which === 'before' ? 'beforePhoto' : 'afterPhoto'] = { dataUrl: `data:${p.contentType};base64,${p.data}`, contentType: p.contentType }; }); rep.revisedFrom = { reportId: M.report.id, reportDate: j.reportDate, comment: j.comment }; S.report = rep; S.submitted = false; S.errs = {}; S.modal = null; go('report'); } catch (e) { M.busy = false; M.error = e.message || 'No fue posible cargar el informe.'; render(); } return; }
    case 'sortCol': { const c = COLS.find(x => x.key === d.key); const s = S.hist.sort; S.hist.sort = s.key === d.key ? { key: d.key, direction: s.direction === 'asc' ? 'desc' : 'asc' } : { key: d.key, direction: c.first }; S.hist.shown = 25; render(); return; }
    case 'clearFilters': S.hist.filters = { createdBy: '', supervisor: '', dateFrom: '', dateTo: '', status: '' }; S.hist.shown = 25; render(); return;
    case 'moreHist': S.hist.shown += 25; render(); return;
    // --- informe
    case 'jump': ev.preventDefault(); S.drawer = false; document.getElementById(d.target)?.scrollIntoView({ behavior: 'smooth', block: 'start' }); if (S.drawer === false) render(); return;
    case 'addActivity': r.activities.push(newGeneric()); saveDraft(); render(); setTimeout(() => { const c = $$('.activity-card'); c[c.length - 1]?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 80); return;
    case 'removeActivity': if (confirm('¿Seguro que deseas eliminar esta actividad? Se perderán todos sus datos.')) { r.activities = r.activities.filter(a => a.id !== d.a); saveDraft(); render(); } return;
    case 'actCollapse': { const a = A(d.a); a.collapsed = !a.collapsed; saveDraft(); render(); return; }
    case 'rosterCollapse': { const e = rosterOf(r, d.r); e.collapsed = !e.collapsed; saveDraft(); render(); return; }
    case 'asgCollapse': { const s = A(d.a).equipmentAssignments.find(x => x.id === d.s); s.collapsed = !s.collapsed; saveDraft(); render(); return; }
    case 'summaryCollapse': S.summaryCollapsed = !S.summaryCollapsed; render(); return;
    case 'hardness': A(d.a).watermaster.hardness = Number(d.v); saveDraft(); render(); return;
    case 'removePhoto': { const a = A(d.a); delete a[d.which === 'before' ? 'beforePhoto' : 'afterPhoto']; saveDraft(); render(); return; }
    case 'previewPdf': case 'downloadPdf': {
      if (!runValidation()) return; const win = act === 'previewPdf' ? window.open('', '_blank') : null; S.pdfBusy = true; render();
      try { await ensureImageSizes(r); const b = await buildPdf(r); if (act === 'previewPdf') openBlob(b, pdfName(r.date), win); else downloadBlob(b, pdfName(r.date)); }
      catch (e) { if (win) win.close(); alert(act === 'previewPdf' ? 'No se pudo generar la vista previa.' : 'No se pudo generar el PDF. Revise los datos e intente nuevamente.'); }
      S.pdfBusy = false; render(); return; }
    case 'generate': if (!runValidation()) return; { const f = LS.get(K.failed, null); S.modal = { type: 'send', primary: '', cc: [], errs: {}, submissionId: uid(), failedId: f?.reportId || null }; render(); setTimeout(() => $('#primary-recipient')?.focus(), 0); } return;
    case 'ccAdd': S.modal.cc.push(''); render(); return;
    case 'ccRemove': S.modal.cc.splice(Number(d.i), 1); render(); return;
    case 'sendNow': return doSend();
    // --- revisión
    case 'reviewOpen': S.review.open = true; render(); return;
    case 'reviewClose': if (S.review.busy) return; if (S.review.decide) S.review.decide = null; else S.review.open = false; render(); return;
    case 'reviewBack': S.review.decide = null; render(); return;
    case 'reviewDecide': S.review.decide = d.v; S.review.decErr = null; render(); return;
    case 'reviewConfirm': { const R = S.review; R.busy = true; R.decErr = null; R.comment = $('#rejection-comment')?.value ?? R.comment; render(); try { const j = await api({ a: 'reviewDecision', token: S.token, email: R.email, decision: R.decide, comment: R.comment }); if (j.ok || j.conflict) { R.busy = false; R.decide = null; await loadReview(R.email); return; } R.decErr = j.message || 'No fue posible registrar la decisión.'; } catch (e) { R.decErr = 'No fue posible registrar la decisión.'; } R.busy = false; render(); return; }
    case 'reviewPdf': { const R = S.review; const win = window.open('', '_blank'); R.pdfErr = null; try { const j = await api({ a: 'reviewPdf', token: S.token, email: R.email }); if (!j.ok) throw new Error(); openBlob(b64ToBlob(j.data, 'application/pdf'), j.filename, win); } catch (e) { if (win) win.close(); R.pdfErr = 'No fue posible abrir el PDF.'; render(); } return; }
  }
});
function runValidation() {
  S.submitted = true; const v = validate(S.report); S.errs = v.errs;
  if (!v.valid) { const keys = Object.keys(v.errs); let changed = false;
    S.report.roster.forEach(e => { if (e.collapsed && keys.some(k => k.startsWith(`roster.${e.equipmentId}.`))) { e.collapsed = false; changed = true; } });
    S.report.activities.forEach(a => { if (keys.some(k => k.startsWith(`activity.${a.id}.`))) { if (a.collapsed) { a.collapsed = false; changed = true; } a.equipmentAssignments.forEach(s => { if (s.collapsed && keys.some(k => k.startsWith(`activity.${a.id}.equipment.${s.id}.`))) { s.collapsed = false; changed = true; } }); } });
    render(); requestAnimationFrame(() => setTimeout(() => scrollToField(v.first), 120)); }
  else render();
  return v.valid;
}
function scrollToField(p) { if (!p) return; const t = document.querySelector(`[data-field="${CSS.escape(p)}"]`); if (t) { t.scrollIntoView({ behavior: 'smooth', block: 'center' }); const i = t.querySelector('input:not([type=hidden]), select, textarea, button.hardness-btn'); i && i.focus({ preventScroll: true }); return; } if (p.startsWith('activity.')) document.getElementById(`activity-${p.split('.')[1]}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' }); else if (p.startsWith('roster.')) document.getElementById(`roster-${p.split('.')[1]}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
async function adminSave(list, id) {
  const isEq = list === 'truck' || list === 'machinery'; const src = id === 'new' ? S.adminAdd : S.adminEdit[id]; const c = JSON.parse(JSON.stringify(S.config));
  if (isEq) { const code = (src.code || '').trim(); if (!code) { S.adminErr = 'El código es obligatorio.'; render(); return; } const cap = String(src.capacityM3 ?? '').trim() === '' ? null : Number(src.capacityM3); const item = { id: id === 'new' ? uid() : id, code, type: list, capacityM3: cap }; c.equipment = id === 'new' ? [...c.equipment, item] : c.equipment.map(x => x.id === id ? item : x); }
  else { const name = (src.name || '').trim(); if (!name) { S.adminErr = 'El nombre es obligatorio.'; render(); return; } c[list] = id === 'new' ? [...c[list], { id: uid(), name }] : c[list].map(x => x.id === id ? { ...x, name } : x); }
  if (await saveConfig(c)) { if (id === 'new') S.adminAdd = null; else delete S.adminEdit[id]; render(); }
}
async function adminDelete(list, id) {
  const isEq = list === 'truck' || list === 'machinery'; const c = JSON.parse(JSON.stringify(S.config));
  if (isEq) { const e = c.equipment.find(x => x.id === id); const used = S.report.roster.some(x => x.equipmentId === id) || S.report.activities.some(a => a.equipmentAssignments.some(s => s.equipmentId === id)); if (!confirm(used ? 'Este equipo está actualmente utilizado en el informe. Si lo eliminas de la configuración seguirá disponible en este informe hasta recargar, pero no aparecerá en nuevos informes. ¿Deseas continuar?' : `¿Eliminar el equipo ${e.code}?`)) return; c.equipment = c.equipment.filter(x => x.id !== id); }
  else { const it = c[list].find(x => x.id === id); if (!confirm(`¿Eliminar "${it.name}"?`)) return; c[list] = c[list].filter(x => x.id !== id); }
  await saveConfig(c);
}

document.addEventListener('input', ev => {
  const t = ev.target, d = t.dataset, r = S.report;
  if (t.id === 'mvp-access-code' || t.closest('#profile-form') || t.closest('#admin-form')) return;
  if (d.filter && t.tagName === 'INPUT') { S.hist.filters[d.filter] = t.value; S.hist.shown = 25; clearTimeout(window.__ft); window.__ft = setTimeout(() => { if (d.filter === 'createdBy' || d.filter === 'supervisor') { const pos = t.selectionStart; render(); const n = document.getElementById(t.id); if (n) { n.focus(); n.setSelectionRange(pos, pos); } } else render(); }, 250); return; }
  if (d.adm) { const src = d.id === 'new' ? S.adminAdd : S.adminEdit[d.id]; if (src) src[d.adm] = t.value; return; }
  if (d.send) { if (d.send === 'primary') S.modal.primary = t.value; else S.modal.cc[Number(d.i)] = t.value; return; }
  if (t.id === 'rejection-comment') { S.review.comment = t.value; return; }
  if (S.route !== 'report') return;
  let touched = false;
  if (d.g && t.tagName === 'INPUT') { r[d.g] = t.value; touched = true; }
  else if (d.r && d.f) { const e = rosterOf(r, d.r); if (e) { e[d.f] = t.value; touched = true; } }
  else if (d.a && d.w && t.tagName === 'INPUT') { const a = r.activities.find(x => x.id === d.a); a.watermaster[d.w] = t.value; touched = true; }
  else if (d.a && d.trips) { const s = r.activities.find(x => x.id === d.a).equipmentAssignments.find(x => x.id === d.s); s.trips = t.value; touched = true; }
  else if (d.a && d.af && t.tagName !== 'SELECT') { const a = r.activities.find(x => x.id === d.a); a[d.af] = t.value; touched = true; }
  if (touched) { saveDraft(); liveUpdate(); }
});
document.addEventListener('change', async ev => {
  const t = ev.target, d = t.dataset, r = S.report;
  if (t.tagName === 'SELECT') t.classList.toggle('is-placeholder', !t.value);
  if (d.filter && t.tagName === 'SELECT') { S.hist.filters[d.filter] = t.value; S.hist.shown = 25; render(); return; }
  if (d.actChange === 'histSort') { if (!t.value) S.hist.sort = { key: 'reportDate', direction: 'desc' }; else { const [k, dir] = t.value.split(':'); S.hist.sort = { key: k, direction: dir }; } render(); return; }
  if (S.route !== 'report') return;
  if (d.g && t.tagName === 'SELECT') { r[d.g] = t.value; saveDraft(); render(); return; }
  if (d.g === 'date') { r.date = t.value; saveDraft(); render(); return; }
  if (d.a && d.af && t.tagName === 'SELECT') { const a = r.activities.find(x => x.id === d.a); a[d.af] = t.value; saveDraft(); render(); return; }
  if (d.a && d.w === 'depth') { const a = r.activities.find(x => x.id === d.a); a.watermaster.depth = t.value === '' ? null : Number(t.value); saveDraft(); render(); return; }
  if (d.actChange === 'rosterToggle') {
    if (t.checked) { if (!rosterOf(r, d.eq)) r.roster.push({ equipmentId: d.eq, equipmentCode: d.code, equipmentType: d.type, operator: '', hourmeterStart: '', hourmeterEnd: '', ...(d.type === 'truck' ? { kmStart: '', kmEnd: '' } : {}), collapsed: false }); }
    else { const e = rosterOf(r, d.eq); if (e && rosterTouched(e) && !confirm(`¿Quitar ${d.code} de Dotación activa? Se perderá la reutilización automática en las actividades.`)) { t.checked = true; return; } r.roster = r.roster.filter(x => x.equipmentId !== d.eq); }
    saveDraft(); render(); return;
  }
  if (d.actChange === 'asgToggle') { const a = r.activities.find(x => x.id === d.a); if (t.checked) { if (!a.equipmentAssignments.some(e => e.equipmentId === d.eq)) a.equipmentAssignments.push({ id: uid(), equipmentId: d.eq, equipmentCode: d.code, equipmentType: d.type, collapsed: false, ...(d.type === 'truck' ? { trips: '' } : {}) }); } else a.equipmentAssignments = a.equipmentAssignments.filter(e => e.equipmentId !== d.eq); saveDraft(); render(); return; }
  if (d.photo) { const f = t.files && t.files[0]; t.value = ''; if (!f) return; if (!['image/jpeg', 'image/png', 'image/webp'].includes(f.type)) { alert('Formato no válido. Use JPEG, PNG o WebP.'); return; } try { const p = await compressImage(f); r.activities.find(x => x.id === d.a)[d.photo === 'before' ? 'beforePhoto' : 'afterPhoto'] = p; saveDraft(); render(); } catch (e) { alert('No se pudo leer la imagen.'); } return; }
});
document.addEventListener('submit', async ev => {
  ev.preventDefault(); const f = ev.target;
  if (f.id === 'access-form') return submitAccess($('#mvp-access-code').value);
  if (f.id === 'profile-form') { const n = $('#guest-name').value.trim(), e = $('#guest-email').value; const errs = {}; if (!n) errs.displayName = 'Ingresa tu nombre.'; if (!e.trim()) errs.email = 'Ingresa un correo electrónico.'; else if (!okEmail(e)) errs.email = 'Ingresa un correo electrónico válido.'; S.profileErrs = errs; if (Object.keys(errs).length) { render(); return; } S.profile = { displayName: n, email: normEmail(e) }; LS.set(K.profile, S.profile); S.editingProfile = false; render(); return; }
  if (f.id === 'admin-form') { const M = S.modal; const pw = $('#admin-password').value; if (!pw.trim()) return; M.busy = true; M.err = null; render(); try { const j = await apiK('adminLogin', { password: pw }); if (!j.ok) { M.err = j.message || 'Contraseña incorrecta.'; M.busy = false; render(); return; } S.adminPw = pw; SS.set('rlAdminPw', pw); S.modal = null; S.adminOpen = true; S.adminMsg = S.adminErr = null; render(); window.scrollTo(0, 0); } catch (e) { M.err = 'No fue posible validar la contraseña.'; M.busy = false; render(); } return; }
  if (f.id === 'review-email-form') { const v = $('#review-email').value; if (!okEmail(v)) { S.review.emailErr = 'Ingresa un correo electrónico válido.'; render(); return; } S.review.emailErr = null; S.review.email = normEmail(v); loadReview(S.review.email); }
});
document.addEventListener('keydown', ev => { if (ev.key === 'Escape') { if (S.drawer) { S.drawer = false; render(); } else if (S.userMenu) { S.userMenu = false; render(); } else if (S.modal && !S.modal.busy) { S.modal = null; render(); } } });
window.addEventListener('beforeunload', ev => { if (S.modal?.busy) { ev.preventDefault(); ev.returnValue = ''; } });

// =================================================================== arranque
const p0 = parseHash(); S.route = p0.route; S.token = p0.token;
if (!location.hash) history.replaceState(null, '', '#/dashboard');
render();
if (S.route === 'review') startReview();
restorePhotos();
refreshOutbox().then(() => { render(); syncOutbox(); });
if (S.codeOk) { loadConfig(); loadReports(); }
if ('serviceWorker' in navigator && location.protocol === 'https:') navigator.serviceWorker.register('sw.js').catch(() => {});
window.__app = { S, validate, progressOf, buildPdf, render };
})();
