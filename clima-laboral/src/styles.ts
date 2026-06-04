export const css = `
  :root {
    --navy: #071b33;
    --sky: #38bdf8;
    --gold: #d4af37;
    --white: #f8fafc;
    --muted: #94a3b8;
    --border: rgba(255,255,255,0.1);
  }

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    background: linear-gradient(135deg, #041426, #071b33 42%, #0b2f56);
    min-height: 100vh;
    color: var(--white);
    font-family: Inter, ui-sans-serif, system-ui, sans-serif;
  }

  button { font: inherit; cursor: pointer; }
  input, select { font: inherit; }

  .shell { min-height: 100vh; display: flex; flex-direction: column; }

  /* ── TOP BAR ──────────────────────────────────────────── */
  .topbar {
    background: rgba(4, 20, 38, 0.92);
    border-bottom: 1px solid rgba(212, 175, 55, 0.25);
    backdrop-filter: blur(14px);
    position: sticky;
    top: 0;
    z-index: 100;
  }
  .topbar-inner {
    width: min(1080px, calc(100% - 32px));
    margin: 0 auto;
    padding: 12px 0;
    display: flex;
    align-items: center;
    gap: 16px;
  }
  .topbar-brand { display: flex; align-items: center; gap: 12px; flex: 1; }
  .topbar-logo {
    width: 48px; height: 48px; object-fit: contain;
    background: white; border-radius: 10px; padding: 5px;
    border: 1px solid rgba(212,175,55,0.5); flex-shrink: 0;
  }
  .topbar-brand-text { display: flex; flex-direction: column; }
  .topbar-brand-name { font-size: 1rem; font-weight: 900; letter-spacing: 0.12em; color: var(--gold); line-height: 1; }
  .topbar-brand-sub { font-size: 0.65rem; color: var(--muted); line-height: 1.3; margin-top: 3px; max-width: 220px; }
  .topbar-divider { width: 1px; height: 36px; background: rgba(255,255,255,0.12); flex-shrink: 0; }
  .topbar-author { display: flex; align-items: center; gap: 12px; flex-shrink: 0; }
  .topbar-author-text { display: flex; flex-direction: column; text-align: right; }
  .topbar-author-name { font-size: 0.9rem; font-weight: 700; color: var(--white); line-height: 1; }
  .topbar-author-sub { font-size: 0.63rem; color: var(--muted); line-height: 1.3; margin-top: 3px; }
  .topbar-author-logo {
    width: 48px; height: 48px; object-fit: contain;
    background: white; border-radius: 10px; padding: 4px;
    border: 1px solid rgba(56,189,248,0.35); flex-shrink: 0;
  }
  .admin-link {
    background: transparent; border: 1px solid var(--border); color: var(--muted);
    font-size: 0.72rem; font-weight: 700; padding: 7px 12px; border-radius: 10px;
    transition: border-color 0.18s, color 0.18s;
  }
  .admin-link:hover { border-color: rgba(212,175,55,0.5); color: var(--gold); }

  /* ── CONTAINER ────────────────────────────────────────── */
  .container {
    width: min(1080px, calc(100% - 32px));
    margin: 0 auto;
    padding: 32px 0 60px;
    flex: 1;
  }
  .container-wide { width: min(1280px, calc(100% - 32px)); }

  /* ── HOME ─────────────────────────────────────────────── */
  .hero {
    text-align: center; padding: 44px 32px 38px;
    background: rgba(7,27,51,0.7); border: 1px solid var(--border);
    border-radius: 28px; backdrop-filter: blur(12px); margin-bottom: 20px;
  }
  .hero-badge {
    display: inline-block; padding: 6px 18px; border-radius: 999px;
    border: 1px solid rgba(56,189,248,0.35); background: rgba(56,189,248,0.1);
    color: var(--sky); font-size: 0.75rem; font-weight: 900;
    letter-spacing: 0.18em; text-transform: uppercase; margin-bottom: 20px;
  }
  .hero h1 { font-size: clamp(2rem, 5vw, 3.2rem); font-weight: 900; line-height: 1.1; margin-bottom: 16px; }
  .hero-sub { color: var(--muted); font-size: 1.05rem; line-height: 1.65; max-width: 580px; margin: 0 auto 28px; }
  .hero-sub strong { color: var(--gold); }
  .dimensions-preview { display: flex; flex-wrap: wrap; gap: 10px; justify-content: center; margin-bottom: 28px; }
  .dim-chip { padding: 6px 16px; border-radius: 999px; border: 1px solid; font-size: 0.82rem; font-weight: 700; background: transparent; }

  .org-input-wrap { max-width: 460px; margin: 0 auto 24px; text-align: left; }
  .org-label {
    display: block; margin-bottom: 8px; font-size: 0.82rem; font-weight: 700;
    color: var(--muted); letter-spacing: 0.06em; text-transform: uppercase;
  }
  .org-input, .org-select {
    width: 100%; padding: 12px 16px; border-radius: 14px; border: 1px solid var(--border);
    background: rgba(255,255,255,0.06); color: var(--white); font-size: 1rem;
    outline: none; transition: border-color 0.2s;
  }
  .org-input::placeholder { color: rgba(255,255,255,0.3); }
  .org-input:focus, .org-select:focus { border-color: rgba(56,189,248,0.5); }
  .org-select option { background: #0b2f56; color: var(--white); }

  .info-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; margin-bottom: 20px; }
  .info-card {
    padding: 20px; border: 1px solid var(--border); border-top-width: 3px;
    border-radius: 20px; background: rgba(7,27,51,0.65); backdrop-filter: blur(8px);
  }
  .info-label { font-size: 0.78rem; font-weight: 900; letter-spacing: 0.12em; text-transform: uppercase; margin-bottom: 8px; }
  .info-desc { color: var(--muted); font-size: 0.88rem; line-height: 1.6; }

  .how-card { padding: 28px; border: 1px solid var(--border); border-radius: 24px; background: rgba(7,27,51,0.65); backdrop-filter: blur(8px); }
  .how-card h2 { font-size: 1.25rem; margin-bottom: 20px; color: var(--gold); }
  .steps { display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px; }
  .step { display: flex; gap: 14px; align-items: flex-start; }
  .step-num {
    flex: 0 0 auto; width: 34px; height: 34px; border-radius: 999px;
    background: rgba(212,175,55,0.15); border: 1px solid rgba(212,175,55,0.35);
    color: var(--gold); font-weight: 900; display: flex; align-items: center; justify-content: center; font-size: 0.9rem;
  }
  .step p { color: var(--muted); font-size: 0.88rem; line-height: 1.6; margin-top: 6px; }

  /* ── SURVEY ───────────────────────────────────────────── */
  .survey-wrap { max-width: 780px; margin: 0 auto; }
  .survey-header {
    display: flex; justify-content: space-between; align-items: flex-start; gap: 20px;
    padding: 26px 28px 18px; background: rgba(7,27,51,0.75); border: 1px solid var(--border);
    border-radius: 24px 24px 0 0; backdrop-filter: blur(10px);
  }
  .eyebrow { font-size: 0.72rem; font-weight: 900; letter-spacing: 0.2em; text-transform: uppercase; margin-bottom: 6px; }
  .survey-title { font-size: clamp(1.4rem, 3vw, 1.9rem); font-weight: 900; margin-bottom: 6px; }
  .survey-desc { color: var(--muted); font-size: 0.88rem; line-height: 1.6; max-width: 480px; }
  .dim-progress { display: flex; gap: 7px; flex-shrink: 0; padding-top: 4px; flex-wrap: wrap; max-width: 120px; justify-content: flex-end; }
  .dim-dot { width: 12px; height: 12px; border-radius: 999px; transition: background 0.3s, opacity 0.3s; }
  .progress-track { height: 6px; background: rgba(255,255,255,0.06); }
  .progress-fill { height: 100%; transition: width 0.4s ease; }
  .questions-list { display: flex; flex-direction: column; }
  .question-block { padding: 22px 28px; border: 1px solid var(--border); border-top: none; background: rgba(7,27,51,0.65); backdrop-filter: blur(8px); }
  .q-number { font-size: 0.72rem; font-weight: 900; letter-spacing: 0.14em; text-transform: uppercase; margin-bottom: 8px; }
  .q-text { font-size: 1.02rem; line-height: 1.5; margin-bottom: 16px; font-weight: 600; }
  .likert-scale { display: flex; align-items: center; gap: 12px; }
  .likert-end-label { color: var(--muted); font-size: 0.78rem; white-space: nowrap; flex-shrink: 0; }
  .likert-options { display: flex; gap: 8px; flex: 1; justify-content: center; }
  .likert-btn {
    width: 46px; height: 46px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.15);
    background: rgba(255,255,255,0.05); color: var(--white); font-size: 1rem; font-weight: 700;
    transition: border-color 0.18s, background 0.18s, transform 0.12s;
  }
  .likert-btn:hover { border-color: rgba(255,255,255,0.35); background: rgba(255,255,255,0.1); transform: translateY(-1px); }
  .likert-btn.active { font-weight: 900; }
  .selected-label { margin-top: 10px; font-size: 0.8rem; font-weight: 700; letter-spacing: 0.04em; }
  .survey-nav {
    display: flex; justify-content: space-between; gap: 12px; padding: 20px 28px;
    border: 1px solid var(--border); border-top: none; border-radius: 0 0 24px 24px;
    background: rgba(7,27,51,0.75); backdrop-filter: blur(10px);
  }
  .warning-msg { text-align: center; margin-top: 12px; color: rgba(248,113,113,0.85); font-size: 0.84rem; }

  /* ── THANK YOU ────────────────────────────────────────── */
  .thanks-wrap {
    max-width: 620px; margin: 40px auto 0; text-align: center; padding: 48px 36px;
    background: rgba(7,27,51,0.72); border: 1px solid var(--border); border-radius: 28px; backdrop-filter: blur(10px);
  }
  .thanks-check {
    width: 84px; height: 84px; margin: 0 auto 22px; border-radius: 999px;
    background: rgba(34,197,94,0.15); border: 2px solid rgba(34,197,94,0.4);
    display: flex; align-items: center; justify-content: center; color: #22c55e; font-size: 2.6rem;
  }
  .thanks-wrap h1 { font-size: clamp(1.6rem, 4vw, 2.3rem); margin-bottom: 14px; }
  .thanks-wrap p { color: var(--muted); line-height: 1.65; margin-bottom: 10px; }

  /* ── SCORE BARS / RESULTS ─────────────────────────────── */
  .score-bar-track { height: 10px; border-radius: 999px; background: rgba(255,255,255,0.08); overflow: hidden; }
  .score-bar-fill { height: 100%; border-radius: 999px; transition: width 0.8s ease; }

  .results-wrap { display: flex; flex-direction: column; gap: 20px; }
  .results-header {
    text-align: center; padding: 30px 20px 24px; background: rgba(7,27,51,0.72);
    border: 1px solid var(--border); border-radius: 24px; backdrop-filter: blur(10px);
  }
  .gold { color: var(--gold) !important; }
  .results-title { font-size: clamp(1.7rem, 4vw, 2.4rem); font-weight: 900; margin-top: 8px; }
  .results-meta { color: var(--muted); font-size: 0.9rem; margin-top: 10px; }

  .global-card {
    padding: 30px; background: rgba(7,27,51,0.72); border: 1px solid var(--border);
    border-radius: 24px; backdrop-filter: blur(10px); text-align: center;
  }
  .global-label { font-size: 0.75rem; font-weight: 900; letter-spacing: 0.18em; text-transform: uppercase; color: var(--muted); margin-bottom: 12px; }
  .global-score { font-size: clamp(3.6rem, 11vw, 6.5rem); font-weight: 900; line-height: 1; margin-bottom: 12px; }
  .level-badge {
    display: inline-block; padding: 8px 24px; border-radius: 999px; font-weight: 900;
    letter-spacing: 0.12em; text-transform: uppercase; font-size: 0.85rem; margin-bottom: 22px;
  }
  .global-bar-track { max-width: 480px; margin: 0 auto 14px; height: 12px; border-radius: 999px; background: rgba(255,255,255,0.07); overflow: hidden; }
  .global-bar-fill { height: 100%; border-radius: 999px; transition: width 1s ease; }
  .global-legend { display: flex; justify-content: center; gap: 22px; font-size: 0.74rem; font-weight: 700; flex-wrap: wrap; }

  .chart-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
  .radar-card, .breakdown-card {
    padding: 26px; background: rgba(7,27,51,0.72); border: 1px solid var(--border);
    border-radius: 24px; backdrop-filter: blur(10px);
  }
  .radar-card h2, .breakdown-card h2 { font-size: 1.1rem; margin-bottom: 18px; color: var(--muted); font-weight: 700; }
  .radar-wrap { display: flex; justify-content: center; }
  .breakdown-list { display: flex; flex-direction: column; gap: 16px; }
  .breakdown-item { display: flex; flex-direction: column; gap: 8px; }
  .breakdown-header { display: flex; justify-content: space-between; align-items: center; gap: 8px; }
  .breakdown-name { font-weight: 700; font-size: 0.9rem; }
  .breakdown-pct { font-size: 0.82rem; font-weight: 700; white-space: nowrap; }

  /* ── ACTION MATRIX ────────────────────────────────────── */
  .matrix-section {
    padding: 26px; background: rgba(7,27,51,0.72); border: 1px solid var(--border);
    border-radius: 24px; backdrop-filter: blur(10px);
  }
  .matrix-head { display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; margin-bottom: 8px; flex-wrap: wrap; }
  .matrix-section h2 { font-size: 1.2rem; color: var(--gold); }
  .matrix-sub { color: var(--muted); font-size: 0.86rem; margin-bottom: 18px; line-height: 1.55; max-width: 720px; }
  .matrix-scroll { overflow-x: auto; border-radius: 14px; border: 1px solid var(--border); }
  table.matrix { width: 100%; border-collapse: collapse; font-size: 0.84rem; min-width: 860px; }
  table.matrix th {
    background: rgba(212,175,55,0.12); color: var(--gold); text-align: left; padding: 12px 12px;
    font-size: 0.72rem; font-weight: 900; letter-spacing: 0.08em; text-transform: uppercase;
    border-bottom: 1px solid var(--border); white-space: nowrap;
  }
  table.matrix td { padding: 10px 12px; border-bottom: 1px solid rgba(255,255,255,0.06); vertical-align: top; color: var(--white); }
  table.matrix tr:last-child td { border-bottom: none; }
  table.matrix td.dim-cell { font-weight: 700; white-space: nowrap; }
  .matrix-input, .matrix-textarea, .matrix-select {
    width: 100%; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1);
    border-radius: 8px; color: var(--white); padding: 7px 9px; font-size: 0.82rem; outline: none; resize: vertical;
  }
  .matrix-input:focus, .matrix-textarea:focus, .matrix-select:focus { border-color: rgba(56,189,248,0.5); }
  .matrix-textarea { min-height: 52px; line-height: 1.45; font-family: inherit; }
  .matrix-select option { background: #0b2f56; }
  .pri-badge { display: inline-block; padding: 3px 10px; border-radius: 999px; font-size: 0.72rem; font-weight: 800; }
  .pri-alta { background: rgba(248,113,113,0.16); color: #fca5a5; border: 1px solid rgba(248,113,113,0.35); }
  .pri-media { background: rgba(212,175,55,0.16); color: #fcd34d; border: 1px solid rgba(212,175,55,0.35); }
  .pri-baja { background: rgba(34,197,94,0.16); color: #86efac; border: 1px solid rgba(34,197,94,0.35); }

  /* ── ADMIN ────────────────────────────────────────────── */
  .admin-login {
    max-width: 440px; margin: 60px auto 0; padding: 40px 32px; text-align: center;
    background: rgba(7,27,51,0.72); border: 1px solid var(--border); border-radius: 24px; backdrop-filter: blur(10px);
  }
  .admin-login h1 { font-size: 1.6rem; margin-bottom: 10px; }
  .admin-login p { color: var(--muted); margin-bottom: 22px; font-size: 0.9rem; }
  .admin-error { color: #fca5a5; font-size: 0.84rem; margin-top: 12px; }

  .admin-statbar { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 20px; }
  .stat-card {
    padding: 18px 20px; background: rgba(7,27,51,0.72); border: 1px solid var(--border);
    border-radius: 18px; backdrop-filter: blur(8px); text-align: center;
  }
  .stat-num { font-size: 2rem; font-weight: 900; line-height: 1; }
  .stat-label { font-size: 0.72rem; color: var(--muted); margin-top: 7px; text-transform: uppercase; letter-spacing: 0.08em; }

  .dept-table { width: 100%; border-collapse: collapse; font-size: 0.86rem; }
  .dept-table th { text-align: left; color: var(--muted); font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.08em; padding: 8px 10px; border-bottom: 1px solid var(--border); }
  .dept-table td { padding: 10px; border-bottom: 1px solid rgba(255,255,255,0.05); }
  .dept-table tr:last-child td { border-bottom: none; }

  .dept-row-clickable { cursor: pointer; transition: background 0.15s; }
  .dept-row-clickable:hover { background: rgba(56,189,248,0.06); }
  .dept-expand-icon { display: inline-block; width: 16px; color: var(--muted); font-size: 0.65rem; user-select: none; }

  .dept-drill-tr td { border-bottom: 1px solid rgba(255,255,255,0.06) !important; }
  .dept-drill-panel { padding: 14px 16px 16px; background: rgba(56,189,248,0.04); border-top: 1px solid rgba(56,189,248,0.12); }
  .dept-drill-header { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
  .dept-drill-grid { display: flex; flex-direction: column; gap: 8px; }
  .dept-drill-row { display: grid; grid-template-columns: 90px 1fr 46px 48px; align-items: center; gap: 10px; }
  .dept-drill-dim-name { font-size: 0.78rem; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .dept-drill-bar-track { position: relative; height: 8px; background: rgba(255,255,255,0.08); border-radius: 4px; overflow: visible; }
  .dept-drill-avg-line { position: absolute; top: -3px; bottom: -3px; width: 2px; background: rgba(255,255,255,0.35); border-radius: 1px; pointer-events: none; }
  .dept-drill-pct { font-size: 0.82rem; font-weight: 700; text-align: right; }
  .dept-drill-delta { font-size: 0.76rem; font-weight: 700; text-align: right; }
  .delta-up { color: #22c55e; }
  .delta-down { color: #f87171; }
  .delta-same { color: var(--muted); }
  .dept-drill-legend { display: flex; align-items: center; gap: 8px; font-size: 0.72rem; color: var(--muted); margin-top: 12px; }
  .dept-drill-legend-bar { display: inline-block; width: 20px; height: 5px; border-radius: 3px; background: var(--sky); }
  .dept-drill-legend-line { display: inline-block; width: 18px; height: 2px; background: rgba(255,255,255,0.35); margin-bottom: 1px; }

  /* ── Portfolio badge (admin company list) ─────────────────── */
  .portfolio-badge { display: flex; align-items: center; justify-content: center; min-width: 54px; height: 54px; border-radius: 12px; font-size: 1.05rem; font-weight: 900; border: 1px solid var(--border); flex-shrink: 0; }
  .portfolio-loading { color: var(--muted); background: rgba(255,255,255,0.03); }
  .portfolio-empty { color: var(--muted); background: rgba(255,255,255,0.03); }

  /* ── Department filter bar ───────────────────────────────── */
  .dept-filter-bar { margin-bottom: 16px; }
  .dept-filter-label { display: block; font-size: 0.72rem; color: var(--muted); text-transform: uppercase; letter-spacing: 0.08em; font-weight: 700; margin-bottom: 8px; }
  .dept-filter-pills { display: flex; flex-wrap: wrap; gap: 7px; }
  .dept-filter-pill { padding: 5px 14px; border-radius: 999px; font-size: 0.78rem; font-weight: 600; background: rgba(255,255,255,0.04); border: 1px solid var(--border); color: var(--muted); cursor: pointer; transition: all 0.15s; }
  .dept-filter-pill:hover { border-color: rgba(56,189,248,0.4); color: var(--white); }
  .dept-filter-pill.active { background: rgba(56,189,248,0.15); border-color: rgba(56,189,248,0.5); color: var(--sky); }
  .dept-filter-banner { display: flex; align-items: center; gap: 16px; padding: 10px 16px; background: rgba(56,189,248,0.07); border: 1px solid rgba(56,189,248,0.2); border-radius: 8px; font-size: 0.84rem; margin-bottom: 16px; flex-wrap: wrap; }
  .dept-filter-clear { background: none; border: none; color: var(--sky); font-size: 0.8rem; cursor: pointer; padding: 0; margin-left: auto; }
  .dept-filter-clear:hover { text-decoration: underline; }

  /* ── Survey comment field ─────────────────────────────────── */
  .survey-comment-block { margin: 8px 0 20px; padding: 16px 18px; background: rgba(255,255,255,0.03); border: 1px solid var(--border); border-radius: 12px; }
  .survey-comment-label { display: block; font-size: 0.88rem; font-weight: 700; margin-bottom: 10px; }
  .survey-comment-input { width: 100%; background: rgba(4,20,38,0.6); border: 1px solid var(--border); border-radius: 8px; color: var(--white); padding: 10px 12px; font-size: 0.9rem; resize: vertical; font-family: inherit; }
  .survey-comment-input:focus { outline: none; border-color: rgba(56,189,248,0.5); }
  .survey-comment-hint { font-size: 0.72rem; color: var(--muted); margin-top: 6px; }

  /* ── Comments list (dashboard) ────────────────────────────── */
  .comments-list { display: flex; flex-direction: column; gap: 10px; margin-top: 14px; max-height: 480px; overflow-y: auto; }
  .comment-item { background: rgba(56,189,248,0.04); border-left: 3px solid rgba(56,189,248,0.4); border-radius: 0 8px 8px 0; padding: 12px 16px; }
  .comment-text { font-size: 0.88rem; line-height: 1.6; color: rgba(248,250,252,0.9); font-style: italic; }
  .comment-meta { font-size: 0.75rem; color: var(--muted); margin-top: 6px; font-weight: 600; }

  /* ── Executive summary ────────────────────────────────────── */
  .exec-kpi-row { display: flex; gap: 12px; flex-wrap: wrap; margin: 14px 0 16px; }
  .exec-kpi { flex: 1; min-width: 110px; background: rgba(255,255,255,0.03); border: 1px solid var(--border); border-radius: 10px; padding: 12px 14px; text-align: center; }
  .exec-kpi-num { font-size: 1.5rem; font-weight: 900; line-height: 1; }
  .exec-kpi-label { font-size: 0.7rem; color: var(--muted); margin-top: 5px; line-height: 1.3; }
  .exec-summary-box { background: rgba(56,189,248,0.04); border: 1px solid rgba(56,189,248,0.14); border-radius: 10px; padding: 18px 20px; font-size: 0.87rem; line-height: 1.75; color: rgba(248,250,252,0.88); margin-bottom: 14px; }
  .exec-summary-box p:last-child { margin-bottom: 0; }

  /* ── Heatmap dept × dimension ─────────────────────────────── */
  .heatmap-table { width: 100%; border-collapse: collapse; font-size: 0.83rem; }
  .heatmap-table th { padding: 7px 8px; border-bottom: 1px solid var(--border); font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.07em; }
  .heatmap-dept-col { text-align: left; color: var(--muted); min-width: 130px; }
  .heatmap-table td { border-bottom: 1px solid rgba(255,255,255,0.03); }
  .heatmap-dept-name { padding: 9px 10px; font-weight: 700; text-align: left; white-space: nowrap; }
  .heatmap-count { margin-left: 5px; font-weight: 400; color: var(--muted); font-size: 0.73rem; }
  .heatmap-cell { text-align: center; padding: 8px 6px; font-size: 0.82rem; font-weight: 700; min-width: 56px; }
  .heatmap-global { border-left: 1px solid rgba(255,255,255,0.08); }
  .heatmap-avg-row td { border-top: 1px solid rgba(255,255,255,0.12); border-bottom: none !important; }
  .heatmap-legend { display: flex; gap: 12px; margin-top: 14px; flex-wrap: wrap; }
  .heatmap-legend-item { font-size: 0.72rem; font-weight: 700; padding: 3px 10px; border-radius: 4px; }
  .heat-low  { background: rgba(248,113,113,0.18); color: #fca5a5; border: 1px solid rgba(248,113,113,0.3); }
  .heat-mid  { background: rgba(212,175,55,0.18);  color: #fde68a; border: 1px solid rgba(212,175,55,0.3);  }
  .heat-high { background: rgba(34,197,94,0.18);   color: #86efac; border: 1px solid rgba(34,197,94,0.3);   }

  .dept-tag { display: inline-flex; align-items: center; gap: 5px; padding: 3px 10px 3px 12px; border-radius: 999px; background: rgba(56,189,248,0.12); border: 1px solid rgba(56,189,248,0.3); font-size: 0.78rem; color: var(--sky); }
  .dept-tag button { background: none; border: none; color: var(--muted); font-size: 1rem; line-height: 1; padding: 0; cursor: pointer; transition: color 0.15s; }
  .dept-tag button:hover { color: #f87171; }

  .mode-pill { display: inline-block; padding: 4px 12px; border-radius: 999px; font-size: 0.7rem; font-weight: 800; }
  .mode-local { background: rgba(251,146,60,0.15); color: #fdba74; border: 1px solid rgba(251,146,60,0.35); }
  .mode-supabase { background: rgba(34,197,94,0.15); color: #86efac; border: 1px solid rgba(34,197,94,0.35); }
  .empty-state { text-align: center; padding: 60px 24px; color: var(--muted); }
  .empty-state .big { font-size: 3rem; margin-bottom: 16px; }

  /* ── RECS ─────────────────────────────────────────────── */
  .recs-section { padding: 26px; background: rgba(7,27,51,0.72); border: 1px solid var(--border); border-radius: 24px; backdrop-filter: blur(10px); }
  .recs-section > h2 { font-size: 1.2rem; margin-bottom: 20px; color: var(--gold); }
  .recs-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  .rec-card { padding: 20px; border: 1px solid rgba(255,255,255,0.08); border-left-width: 4px; border-radius: 16px; }
  .rec-header { display: flex; justify-content: space-between; align-items: center; gap: 10px; margin-bottom: 12px; flex-wrap: wrap; }
  .rec-dim { font-size: 0.8rem; font-weight: 900; letter-spacing: 0.08em; text-transform: uppercase; }
  .rec-badge { font-size: 0.75rem; font-weight: 700; padding: 3px 10px; border-radius: 999px; white-space: nowrap; }
  .rec-text { color: var(--muted); font-size: 0.86rem; line-height: 1.6; }

  /* ── BUTTONS ──────────────────────────────────────────── */
  .results-actions { display: flex; gap: 14px; justify-content: center; flex-wrap: wrap; }
  .btn-primary {
    padding: 14px 28px; border-radius: 16px; border: 0;
    background: linear-gradient(135deg, #f3d36b, var(--gold)); color: #061525;
    font-weight: 900; font-size: 0.95rem; transition: transform 0.18s, filter 0.18s;
  }
  .btn-primary:hover:not(:disabled) { transform: translateY(-1px); filter: brightness(1.06); }
  .btn-primary:disabled { opacity: 0.4; cursor: not-allowed; }
  .btn-secondary {
    padding: 13px 22px; border-radius: 16px; border: 1px solid rgba(56,189,248,0.32);
    background: rgba(56,189,248,0.08); color: #d9f5ff; font-weight: 700; font-size: 0.95rem;
    transition: transform 0.18s, filter 0.18s;
  }
  .btn-secondary:hover:not(:disabled) { transform: translateY(-1px); filter: brightness(1.06); }
  .btn-secondary:disabled { opacity: 0.35; cursor: not-allowed; }
  .btn-export {
    display: flex; align-items: center; gap: 8px; padding: 13px 22px; border-radius: 16px;
    border: 1px solid rgba(212,175,55,0.45); background: rgba(212,175,55,0.1); color: var(--gold);
    font-weight: 700; font-size: 0.95rem; transition: transform 0.18s, filter 0.18s, background 0.18s;
  }
  .btn-export:hover { background: rgba(212,175,55,0.18); transform: translateY(-1px); }
  .btn-danger {
    padding: 11px 18px; border-radius: 14px; border: 1px solid rgba(248,113,113,0.4);
    background: rgba(248,113,113,0.1); color: #fca5a5; font-weight: 700; font-size: 0.86rem;
  }
  .btn-danger:hover { background: rgba(248,113,113,0.18); }

  /* ── RESULTS FOOTER ───────────────────────────────────── */
  .results-footer { padding: 26px; background: rgba(4, 14, 28, 0.7); border: 1px solid rgba(212,175,55,0.2); border-radius: 24px; text-align: center; }
  .footer-label { font-size: 0.7rem; font-weight: 900; letter-spacing: 0.18em; text-transform: uppercase; color: var(--muted); margin-bottom: 20px; }
  .footer-logos { display: flex; align-items: center; justify-content: center; gap: 32px; flex-wrap: wrap; }
  .footer-logo-block { display: flex; align-items: center; gap: 14px; }
  .footer-logo { width: 58px; height: 58px; object-fit: contain; background: white; border-radius: 14px; padding: 6px; border: 1px solid rgba(212,175,55,0.4); flex-shrink: 0; }
  .iv-logo { border-color: rgba(56,189,248,0.4); }
  .footer-logo-name { display: block; font-size: 1rem; font-weight: 900; color: var(--white); text-align: left; }
  .footer-logo-sub { display: block; font-size: 0.7rem; color: var(--muted); line-height: 1.4; max-width: 200px; text-align: left; margin-top: 2px; }
  .footer-sep { width: 1px; height: 48px; background: rgba(255,255,255,0.12); flex-shrink: 0; }

  /* ── Dimension distribution bars ─────────────────────────── */
  .dim-dist-wrap { display: flex; align-items: center; gap: 10px; margin-top: 5px; }
  .dist-bar-track { flex: 1; height: 7px; border-radius: 4px; overflow: hidden; display: flex; background: rgba(255,255,255,0.07); cursor: default; }
  .dist-bar-track > div { height: 100%; transition: width 0.4s; }
  .dist-align-badge { flex-shrink: 0; font-size: 0.67rem; font-weight: 700; padding: 2px 8px; border-radius: 999px; border: 1px solid; white-space: nowrap; letter-spacing: 0.04em; }

  .print-only { display: none; }
  .pdf-cover { display: none; }

  /* ══════════════════════════════════════════════════════════
     IMPRESIÓN / PDF — Diseño formal A4
     ══════════════════════════════════════════════════════════ */
  @media print {
    /* ── Página base ─────────────────────────────────────── */
    @page {
      size: A4;
      margin: 16mm 20mm 18mm;
    }
    @page :first { margin-top: 0; margin-bottom: 0; } /* portada ocupa la página entera */

    * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; box-sizing: border-box !important; }

    /* Variables de color para impresión */
    :root {
      --pr-ink: #0f172a;
      --pr-muted: #475569;
      --pr-faint: #94a3b8;
      --pr-border: #cbd5e1;
      --pr-bg: #f8fafc;
      --pr-navy: #1e3a5f;
      --pr-gold: #92722a;
      --pr-red: #b91c1c;
      --pr-green: #15803d;
      --pr-amber: #b45309;
    }

    body { background: #fff !important; color: var(--pr-ink) !important; font-family: "Inter", sans-serif !important; font-size: 10pt !important; line-height: 1.5 !important; }
    .shell { background: #fff !important; }
    .container { width: 100% !important; padding: 0 !important; margin: 0 !important; max-width: none !important; }

    /* ── Ocultar elementos de interfaz web ─────────────── */
    .topbar,
    .no-print,
    .section-nav,
    .alert-chips-row,
    .results-actions,
    .filter-bar,
    .date-filter-wrap,
    .dept-filter-pills,
    .q-analysis-toggle,
    .demo-banner,
    .btn-export,
    .btn-secondary,
    .btn-primary,
    .btn-whatsapp,
    .dept-row-clickable .dept-expand-icon,
    .forecast-chip,
    .corr-table-wrap,
    .word-cloud-wrap,
    .sent-summary,
    .enps-block,
    .part-ring-wrap,
    .next-meas-card,
    .trend-chart-wrap,
    .dim-trend-wrap { display: none !important; }

    .print-only { display: block !important; }

    /* ── Portada — página completa ──────────────────────── */
    .pdf-cover {
      display: flex !important; flex-direction: column; justify-content: space-between;
      width: 210mm; min-height: 297mm; padding: 22mm 24mm 18mm;
      break-after: page; page-break-after: always;
      background: white !important; color: var(--pr-ink) !important;
    }
    /* Logos en portada */
    .pdf-cover-logos { display: flex !important; align-items: center; justify-content: space-between; margin-bottom: 0; }
    .pdf-cover-logo-left, .pdf-cover-logo-right { display: flex !important; align-items: center; gap: 10px; }
    .pdf-cover-logo-img { height: 44px; width: auto; object-fit: contain; }
    .pdf-cover-logo-text { display: flex !important; flex-direction: column; gap: 1px; }
    .pdf-cover-logo-name { font-size: 9pt; font-weight: 900; color: var(--pr-navy) !important; }
    .pdf-cover-logo-sub { font-size: 6pt; color: var(--pr-faint) !important; max-width: 180px; line-height: 1.3; }
    .pdf-cover-logos-sep { height: 1px; background: var(--pr-border) !important; margin: 10px 0 20px; }

    .pdf-cover-eyebrow { font-size: 7pt; letter-spacing: 0.28em; text-transform: uppercase; color: var(--pr-faint) !important; margin-bottom: 14px; }
    .pdf-cover-company { font-size: 26pt; font-weight: 900; color: var(--pr-navy) !important; margin-bottom: 6px; line-height: 1.1; }
    .pdf-cover-period { font-size: 13pt; color: var(--pr-muted) !important; margin-bottom: 4px; font-weight: 600; }
    .pdf-cover-date { font-size: 8pt; color: var(--pr-faint) !important; }
    .pdf-cover-score-wrap { display: flex; align-items: center; gap: 32px; margin: 36px 0; }
    .pdf-cover-score-circle {
      width: 110px; height: 110px; border-radius: 50%; border: 4px solid;
      display: flex; flex-direction: column; align-items: center; justify-content: center; flex-shrink: 0; background: white !important;
    }
    .pdf-cover-score-num { font-size: 22pt; font-weight: 900; line-height: 1; }
    .pdf-cover-score-sub { font-size: 5.5pt; letter-spacing: 0.16em; text-transform: uppercase; color: var(--pr-faint) !important; margin-top: 3px; }
    .pdf-cover-level { display: inline-block; padding: 4px 14px; border-radius: 4px; border: 1.5px solid; font-weight: 800; font-size: 8.5pt; letter-spacing: 0.06em; text-transform: uppercase; background: white !important; }
    .pdf-cover-participants { font-size: 9pt; color: var(--pr-muted) !important; }
    .pdf-cover-sector { font-size: 8pt; color: var(--pr-faint) !important; }
    .pdf-cover-dims { display: flex; flex-direction: column; gap: 9px; }
    .pdf-cover-dims-title { font-size: 6.5pt; font-weight: 900; letter-spacing: 0.14em; text-transform: uppercase; color: var(--pr-faint) !important; margin-bottom: 6px; }
    .pdf-cover-dim-row { display: flex; align-items: center; gap: 12px; }
    .pdf-cover-dim-name { flex: 0 0 160px; font-size: 8.5pt; font-weight: 600; color: var(--pr-ink) !important; }
    .pdf-cover-dim-bar-track { flex: 1; height: 8px; background: #e2e8f0 !important; border-radius: 3px; overflow: visible; position: relative; }
    .pdf-cover-dim-bar-fill { height: 100%; border-radius: 3px; }
    .pdf-cover-dim-bm-line { position: absolute; top: -3px; bottom: -3px; width: 0; border-left: 1.5px dotted var(--pr-faint); }
    .pdf-cover-dim-pct { flex: 0 0 34px; text-align: right; font-size: 8.5pt; font-weight: 700; color: var(--pr-ink) !important; }
    .pdf-cover-bm-note { font-size: 6.5pt; color: var(--pr-faint) !important; margin-top: 6px; font-style: italic; }
    .pdf-cover-footer { }
    .pdf-cover-footer-sep { height: 1px; background: var(--pr-border) !important; margin-bottom: 10px; }
    .pdf-cover-footer p { font-size: 7.5pt; color: var(--pr-muted) !important; text-align: center; }
    .pdf-cover-confidential { font-size: 6pt !important; letter-spacing: 0.14em; text-transform: uppercase; color: var(--pr-faint) !important; margin-top: 3px; }

    /* ── Tipografía base ──────────────────────────────────── */
    h1, .results-title { font-size: 16pt !important; color: var(--pr-navy) !important; margin: 0 0 4px !important; }
    h2 { font-size: 11pt !important; color: var(--pr-navy) !important; margin: 0 0 8px !important; font-weight: 800 !important; }
    h3 { font-size: 9.5pt !important; color: var(--pr-navy) !important; margin: 0 0 6px !important; font-weight: 700 !important; }
    p { margin: 0 0 4px !important; color: var(--pr-muted) !important; }
    .eyebrow, .gold { color: var(--pr-gold) !important; font-size: 7.5pt !important; letter-spacing: 0.14em !important; }
    .results-meta { font-size: 8.5pt !important; color: var(--pr-muted) !important; }

    /* ── Cabecera del informe ─────────────────────────────── */
    .results-header {
      background: white !important; border: none !important; border-bottom: 2px solid var(--pr-navy) !important;
      padding: 12px 0 10px !important; margin-bottom: 14px !important;
      box-shadow: none !important; backdrop-filter: none !important;
    }

    /* ── Contenedores (cards) ─────────────────────────────── */
    .global-card, .radar-card, .breakdown-card, .recs-section, .matrix-section,
    .stat-card, .results-footer, .composite-card {
      background: white !important; border: 1px solid var(--pr-border) !important;
      border-radius: 6px !important; backdrop-filter: none !important; box-shadow: none !important;
      padding: 14px 16px !important; margin-bottom: 12px !important;
    }
    /* Importante: NO poner break-inside:avoid en cards grandes — dejar que fluyan */
    .breakdown-card, .recs-section, .matrix-section, .global-card { break-inside: auto !important; }

    /* ── Barra de estadísticas ───────────────────────────── */
    .statsbar { display: flex !important; gap: 8px !important; margin-bottom: 12px !important; flex-wrap: wrap !important; }
    .stat-card { flex: 1 1 130px !important; padding: 10px 12px !important; }
    .stat-num { font-size: 16pt !important; font-weight: 900 !important; color: var(--pr-navy) !important; }
    .stat-label { font-size: 6.5pt !important; color: var(--pr-faint) !important; text-transform: uppercase !important; letter-spacing: 0.1em !important; }

    /* ── Indicadores globales ────────────────────────────── */
    .global-label { font-size: 7.5pt !important; color: var(--pr-faint) !important; text-transform: uppercase !important; letter-spacing: 0.12em !important; }
    .global-score { font-size: 40pt !important; line-height: 1 !important; color: var(--pr-navy) !important; }
    .global-bar-track { background: #e2e8f0 !important; }
    .level-badge { border-width: 1.5px !important; font-size: 8pt !important; }

    /* ── Indicadores compuestos (tabla compacta en print) ─ */
    .composite-wrap { margin-bottom: 10px !important; }
    .composite-row { display: grid !important; grid-template-columns: repeat(4, 1fr) !important; gap: 8px !important; }
    .composite-card {
      background: var(--pr-bg) !important; border: 1px solid var(--pr-border) !important;
      padding: 8px 10px !important; border-radius: 5px !important; break-inside: avoid !important;
    }
    .composite-score { font-size: 14pt !important; }
    .composite-label { font-size: 7.5pt !important; }
    .composite-desc { font-size: 6pt !important; }
    .composite-level { font-size: 6pt !important; }
    .composite-icon { font-size: 14pt !important; }

    /* ── Gráfico radar + barras dimensiones ─────────────── */
    .chart-grid {
      display: grid !important; grid-template-columns: 220px 1fr !important;
      gap: 14px !important; align-items: start !important; break-inside: avoid !important;
    }
    .radar-card { padding: 10px !important; }
    .radar-wrap svg { width: 220px !important; height: 220px !important; }

    /* ── Barras de dimensiones ───────────────────────────── */
    .score-bar-track { background: #e2e8f0 !important; height: 7px !important; }
    .breakdown-name { font-size: 8.5pt !important; }
    .breakdown-pct { font-size: 8pt !important; }
    .breakdown-header { margin-bottom: 4px !important; }
    .breakdown-item { padding: 8px 0 !important; border-bottom: 1px solid var(--pr-border) !important; break-inside: avoid !important; }
    .breakdown-item:last-child { border-bottom: none !important; }
    .target-gap { font-size: 7pt !important; }
    .benchmark-summary { font-size: 8pt !important; color: var(--pr-muted) !important; }

    /* ── Distribución Likert ─────────────────────────────── */
    .dim-dist-wrap { margin-top: 5px !important; }
    .dist-bar-track { height: 5px !important; }
    .dist-align-badge { font-size: 6.5pt !important; padding: 1px 5px !important; }

    /* ── Mapa de riesgo (scatter) ────────────────────────── */
    .matrix-section { break-before: page !important; page-break-before: always !important; }
    svg text { fill: var(--pr-muted) !important; }

    /* ── Tabla de departamentos ──────────────────────────── */
    .dept-table { width: 100% !important; border-collapse: collapse !important; font-size: 8.5pt !important; }
    .dept-table th { background: var(--pr-bg) !important; color: var(--pr-ink) !important; border: 1px solid var(--pr-border) !important; padding: 6px 8px !important; font-size: 7.5pt !important; text-transform: uppercase !important; letter-spacing: 0.06em !important; }
    .dept-table td { border: 1px solid var(--pr-border) !important; padding: 6px 8px !important; color: var(--pr-ink) !important; }
    .dept-table tr { break-inside: avoid !important; }

    /* ── Heatmap departamentos ───────────────────────────── */
    .heatmap-table th, .heatmap-table td { font-size: 7pt !important; border: 1px solid var(--pr-border) !important; padding: 4px 6px !important; color: var(--pr-ink) !important; }

    /* ── Ranking de prioridades ──────────────────────────── */
    .priority-list { break-inside: auto !important; }
    .priority-row { background: var(--pr-bg) !important; border: 1px solid var(--pr-border) !important; padding: 7px 10px !important; break-inside: avoid !important; border-radius: 4px !important; }
    .priority-dim { font-size: 8.5pt !important; color: var(--pr-ink) !important; }
    .priority-meta { font-size: 7.5pt !important; color: var(--pr-muted) !important; }
    .priority-rank { border-radius: 4px !important; font-size: 9pt !important; }

    /* ── Recomendaciones ─────────────────────────────────── */
    .recs-grid { grid-template-columns: 1fr 1fr !important; gap: 10px !important; }
    .rec-card { background: var(--pr-bg) !important; border: 1px solid var(--pr-border) !important; break-inside: avoid !important; padding: 10px 12px !important; border-radius: 4px !important; }
    .rec-header { margin-bottom: 5px !important; }
    .rec-dim { font-size: 8pt !important; font-weight: 800 !important; }
    .rec-badge { font-size: 7pt !important; }
    .rec-text { font-size: 8pt !important; color: var(--pr-ink) !important; line-height: 1.45 !important; }

    /* ── Preguntas críticas / fortalezas ─────────────────── */
    .top-q-grid { grid-template-columns: 1fr 1fr !important; gap: 12px !important; break-inside: avoid !important; }
    .top-q-card { background: var(--pr-bg) !important; border: 1px solid var(--pr-border) !important; break-inside: avoid !important; padding: 8px 10px !important; border-radius: 4px !important; }
    .top-q-text { font-size: 8pt !important; color: var(--pr-ink) !important; }
    .top-q-score, .top-q-num { font-size: 8pt !important; }

    /* ── Análisis por pregunta ───────────────────────────── */
    .q-analysis-body { break-inside: auto !important; margin-top: 10px !important; }
    .q-dim-section { break-inside: auto !important; margin-bottom: 10px !important; }
    .q-row { break-inside: avoid !important; padding: 4px 0 !important; border-bottom: 1px solid #f1f5f9 !important; }
    .q-row-num { font-size: 7pt !important; }
    .q-row-text { font-size: 7.5pt !important; color: var(--pr-ink) !important; }
    .q-row-bars { flex: 0 0 110px !important; }
    .q-row-score { font-size: 7.5pt !important; }
    .q-dist-bar { height: 4px !important; }

    /* ── Plan de acción (nueva página) ──────────────────── */
    .matrix-section { break-before: page !important; }
    table.matrix { width: 100% !important; border-collapse: collapse !important; font-size: 7.5pt !important; table-layout: fixed !important; }
    table.matrix th { background: #eff6ff !important; color: var(--pr-navy) !important; border: 1px solid var(--pr-border) !important; padding: 5px 6px !important; font-size: 7pt !important; text-transform: uppercase !important; letter-spacing: 0.05em !important; }
    table.matrix td { border: 1px solid var(--pr-border) !important; padding: 5px 6px !important; color: var(--pr-ink) !important; vertical-align: top !important; word-break: break-word !important; }
    table.matrix tr { break-inside: avoid !important; }
    .matrix-input, .matrix-textarea, .matrix-select {
      color: var(--pr-ink) !important; background: transparent !important;
      border: none !important; padding: 0 !important; font-size: 7.5pt !important;
      resize: none !important; white-space: pre-wrap !important; word-break: break-word !important;
    }
    .matrix-section h2 { color: var(--pr-navy) !important; }
    .plan-progress-inline, .plan-save-area { display: none !important; }
    .status-badge { font-size: 6.5pt !important; padding: 1px 6px !important; }
    .status-completada { background: #f0fdf4 !important; color: var(--pr-green) !important; border-color: #bbf7d0 !important; }
    .status-en-progreso { background: #fffbeb !important; color: var(--pr-amber) !important; border-color: #fde68a !important; }
    .status-pendiente { background: var(--pr-bg) !important; color: var(--pr-faint) !important; border-color: var(--pr-border) !important; }

    /* ── Resumen ejecutivo ───────────────────────────────── */
    .exec-summary-box { background: var(--pr-bg) !important; border: 1px solid var(--pr-border) !important; color: var(--pr-ink) !important; break-inside: avoid !important; }
    .exec-kpi { background: white !important; border: 1px solid var(--pr-border) !important; break-inside: avoid !important; }
    .exec-narrative { font-size: 8.5pt !important; color: var(--pr-ink) !important; line-height: 1.55 !important; }

    /* ── Comentarios ─────────────────────────────────────── */
    .comments-list { max-height: none !important; overflow: visible !important; break-inside: auto !important; }
    .comment-item { background: var(--pr-bg) !important; border-left-color: var(--pr-border) !important; break-inside: avoid !important; padding: 8px 12px !important; margin-bottom: 6px !important; }
    .comment-text { font-size: 8.5pt !important; color: var(--pr-ink) !important; font-style: italic !important; }
    .comment-meta { font-size: 7.5pt !important; color: var(--pr-faint) !important; }

    /* ── Colores de nivel ────────────────────────────────── */
    .cdelta-up, .delta-up { color: var(--pr-green) !important; }
    .cdelta-down, .delta-down { color: var(--pr-red) !important; }
    .cdelta-same, .delta-same { color: var(--pr-faint) !important; }

    /* ── Pie de página del informe ───────────────────────── */
    .results-footer { background: white !important; border-top: 1px solid var(--pr-border) !important; border-left: none !important; border-right: none !important; border-bottom: none !important; border-radius: 0 !important; margin-top: 14px !important; }
    .footer-logo-name { color: var(--pr-ink) !important; }
    .footer-logo-sub { color: var(--pr-faint) !important; }
    .topbar-logo, .footer-logo { background: white !important; }

    /* ── Márgenes entre secciones ────────────────────────── */
    .breakdown-card + .breakdown-card,
    .breakdown-card + .recs-section,
    .chart-grid + .breakdown-card { margin-top: 10px !important; }

  }

  /* ── LANDING (multi-empresa) ─────────────────────────── */
  .landing-wrap { padding: 8px 0 40px; }
  .landing-cards {
    display: grid; grid-template-columns: 1fr 1fr; gap: 20px;
    max-width: 660px; margin: 0 auto;
  }
  .landing-card {
    background: rgba(7,27,51,0.72); border: 1px solid var(--border);
    border-radius: 22px; padding: 32px 24px; text-align: center; cursor: pointer;
    transition: border-color 0.2s, transform 0.15s; backdrop-filter: blur(10px);
  }
  .landing-card:hover { border-color: rgba(56,189,248,0.4); transform: translateY(-2px); }
  .landing-card-icon { font-size: 2.6rem; margin-bottom: 12px; }
  .landing-card h2 { font-size: 1.2rem; font-weight: 900; color: var(--white); margin-bottom: 10px; }
  .landing-card p { font-size: 0.86rem; color: var(--muted); line-height: 1.65; margin-bottom: 20px; }

  /* ── COMPANY DASHBOARD ────────────────────────────────── */
  .company-dash { max-width: 820px; margin: 0 auto; padding: 24px 0 60px; }
  .company-dash-header {
    display: flex; align-items: flex-start; justify-content: space-between;
    gap: 16px; margin-bottom: 28px; flex-wrap: wrap;
  }
  .company-name { font-size: 1.6rem; font-weight: 900; color: var(--white); margin-top: 4px; }

  .active-period-card {
    background: rgba(56,189,248,0.06); border: 1px solid rgba(56,189,248,0.22);
    border-radius: 20px; padding: 28px; margin-bottom: 22px;
  }
  .active-period-card h3 { font-size: 0.82rem; font-weight: 900; letter-spacing: 0.12em; text-transform: uppercase; color: var(--sky); margin-bottom: 12px; }
  .period-label-big { font-size: 2.2rem; font-weight: 900; color: var(--white); line-height: 1; margin-bottom: 4px; }
  .period-meta { font-size: 0.82rem; color: var(--muted); margin-bottom: 20px; }
  .period-stats-row { display: flex; gap: 28px; margin-bottom: 20px; flex-wrap: wrap; }
  .period-stat { text-align: center; }
  .period-stat-num { font-size: 2rem; font-weight: 900; color: var(--sky); line-height: 1; }
  .period-stat-label { font-size: 0.72rem; color: var(--muted); margin-top: 4px; text-transform: uppercase; letter-spacing: 0.06em; }

  .survey-link-box {
    background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.12);
    border-radius: 12px; padding: 14px 16px; margin-bottom: 18px;
  }
  .survey-link-label { font-size: 0.75rem; color: var(--muted); margin-bottom: 8px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; }
  .survey-link-row { display: flex; gap: 10px; align-items: center; }
  .survey-link-url {
    flex: 1; font-size: 0.78rem; color: var(--sky); word-break: break-all;
    font-family: ui-monospace, monospace; line-height: 1.5;
  }
  .active-period-actions { display: flex; gap: 10px; flex-wrap: wrap; }

  .no-active-period {
    background: rgba(255,255,255,0.03); border: 1px dashed rgba(255,255,255,0.15);
    border-radius: 20px; padding: 36px 24px; text-align: center; margin-bottom: 22px;
  }
  .no-active-period > p { color: var(--muted); margin-bottom: 20px; font-size: 0.95rem; }
  .create-period-form { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1); border-radius: 14px; padding: 20px; margin-top: 16px; text-align: left; }
  .create-period-form label { display: block; font-size: 0.8rem; color: var(--muted); margin-bottom: 8px; }
  .create-period-form-row { display: flex; gap: 10px; align-items: center; }

  .period-history { margin-top: 28px; }
  .period-history h3 { font-size: 1rem; font-weight: 700; color: var(--white); margin-bottom: 14px; }
  .period-history-empty { color: var(--muted); font-size: 0.9rem; text-align: center; padding: 28px 0; }

  .comparison-table { width: 100%; border-collapse: collapse; font-size: 0.86rem; min-width: 480px; }
  .comparison-table th {
    background: rgba(212,175,55,0.1); color: var(--gold); text-align: left;
    padding: 10px 12px; font-size: 0.72rem; font-weight: 900; letter-spacing: 0.08em;
    text-transform: uppercase; border-bottom: 1px solid var(--border);
  }
  .comparison-table td { padding: 11px 12px; border-bottom: 1px solid rgba(255,255,255,0.05); color: var(--white); }
  .comparison-table tr:last-child td { border-bottom: none; }
  .comparison-table tr:hover td { background: rgba(255,255,255,0.02); }

  .estado-badge { display: inline-block; padding: 3px 10px; border-radius: 20px; font-size: 0.72rem; font-weight: 800; }
  .estado-activo { background: rgba(34,197,94,0.15); color: #22c55e; border: 1px solid rgba(34,197,94,0.3); }
  .estado-cerrado { background: rgba(148,163,184,0.12); color: #94a3b8; border: 1px solid rgba(148,163,184,0.2); }

  /* ── ADMIN COMPANY MANAGEMENT ─────────────────────────── */
  .empresa-list { display: flex; flex-direction: column; gap: 12px; margin-bottom: 24px; }
  .empresa-card {
    background: rgba(7,27,51,0.72); border: 1px solid var(--border); border-radius: 14px;
    padding: 16px 20px; display: flex; align-items: center; justify-content: space-between;
    gap: 12px; transition: border-color 0.18s;
  }
  .empresa-card:hover { border-color: rgba(56,189,248,0.3); }
  .empresa-name { font-weight: 700; font-size: 1rem; color: var(--white); }
  .empresa-usuario { font-size: 0.8rem; color: var(--muted); margin-top: 3px; }
  .create-empresa-form {
    background: rgba(7,27,51,0.72); border: 1px solid rgba(212,175,55,0.2);
    border-radius: 18px; padding: 24px; margin-bottom: 22px;
  }
  .create-empresa-form h3 { font-size: 1rem; font-weight: 700; color: var(--white); margin-bottom: 16px; }
  .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px; }
  .form-field { display: flex; flex-direction: column; gap: 5px; }
  .form-field label { font-size: 0.78rem; color: var(--muted); font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; }

  /* ── QUESTION ANALYSIS ───────────────────────────────── */
  .q-analysis-body { margin-top: 20px; display: flex; flex-direction: column; gap: 22px; }
  .q-dim-section { }
  .q-row { display: flex; align-items: center; gap: 10px; padding: 7px 0; border-bottom: 1px solid rgba(255,255,255,0.04); }
  .q-row:last-child { border-bottom: none; }
  .q-row-num { flex: 0 0 28px; font-size: 0.72rem; font-weight: 900; text-align: right; }
  .q-row-text { flex: 1; font-size: 0.82rem; color: var(--muted); line-height: 1.4; }
  .q-row-bars { flex: 0 0 130px; display: flex; flex-direction: column; gap: 4px; }
  .q-dist-bar { display: flex; height: 6px; border-radius: 3px; overflow: hidden; gap: 1px; }
  .q-dist-seg { height: 100%; border-radius: 2px; transition: width 0.3s; }
  .q-row-score { flex: 0 0 44px; text-align: right; font-size: 0.82rem; font-weight: 800; white-space: nowrap; }

  /* ── WORD CLOUD ──────────────────────────────────────── */
  .word-cloud-wrap { margin: 14px 0 4px; padding: 14px 16px; background: rgba(56,189,248,0.04); border-radius: 10px; border: 1px solid rgba(56,189,248,0.1); }
  .word-cloud-title { font-size: 0.72rem; font-weight: 800; color: var(--muted); text-transform: uppercase; letter-spacing: 0.07em; margin: 0 0 10px; }
  .word-cloud-pills { display: flex; flex-wrap: wrap; gap: 8px 12px; align-items: baseline; }
  .word-cloud-pill { color: var(--sky); cursor: default; transition: opacity 0.2s; line-height: 1.3; }

  /* ── SENTIMENT ───────────────────────────────────────── */
  .sent-summary { display: flex; gap: 8px; flex-wrap: wrap; margin: 10px 0 2px; }
  .sent-chip { padding: 3px 10px; border-radius: 999px; font-size: 0.72rem; font-weight: 800; }
  .sent-positive { background: rgba(34,197,94,0.12); color: #22c55e; border: 1px solid rgba(34,197,94,0.28); }
  .sent-neutral  { background: rgba(148,163,184,0.1); color: #94a3b8; border: 1px solid rgba(148,163,184,0.22); }
  .sent-negative { background: rgba(248,113,113,0.12); color: #f87171; border: 1px solid rgba(248,113,113,0.28); }

  /* ── PRIORITY RANKING ────────────────────────────────── */
  .priority-list { display: flex; flex-direction: column; gap: 8px; }
  .priority-row { display: flex; align-items: center; gap: 12px; padding: 10px 12px; background: rgba(255,255,255,0.025); border: 1px solid rgba(255,255,255,0.06); border-radius: 10px; }
  .priority-rank { flex: 0 0 30px; width: 30px; height: 30px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 0.95rem; }
  .priority-body { flex: 1; min-width: 0; }
  .priority-head { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
  .priority-dim { font-weight: 800; font-size: 0.9rem; }
  .priority-tier { font-size: 0.66rem; font-weight: 800; padding: 1px 8px; border-radius: 999px; border: 1px solid; text-transform: uppercase; letter-spacing: 0.05em; }
  .priority-meta { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; margin-top: 3px; font-size: 0.74rem; color: var(--muted); }
  .priority-tag { color: rgba(252,165,165,0.85); font-weight: 600; }
  .priority-window { font-style: italic; }

  /* ── CORRELATION MATRIX ──────────────────────────────── */
  .corr-table-wrap { overflow-x: auto; margin: 4px 0 14px; }
  .corr-table { border-collapse: collapse; font-size: 0.78rem; min-width: 360px; }
  .corr-table th { padding: 5px 8px; font-size: 0.7rem; font-weight: 800; text-align: center; white-space: nowrap; }
  .corr-row-label { font-size: 0.7rem; font-weight: 800; white-space: nowrap; padding: 5px 8px 5px 0; text-align: right; }
  .corr-cell { padding: 5px 8px; text-align: center; border-radius: 4px; font-weight: 800; font-size: 0.78rem; white-space: nowrap; }
  .corr-cell-empty { }
  .corr-legend { display: flex; flex-wrap: wrap; gap: 10px 18px; margin-top: 6px; }
  .corr-legend-item { display: flex; align-items: center; }

  /* ── PLAN DE MEJORA ──────────────────────────────────── */
  .plan-progress-inline { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 6px; }
  .plan-save-area { display: flex; align-items: center; gap: 12px; flex-shrink: 0; }
  .plan-saved-label { font-size: 0.78rem; color: #22c55e; font-weight: 700; white-space: nowrap; }

  .status-badge { display: inline-block; padding: 2px 9px; border-radius: 999px; font-size: 0.72rem; font-weight: 800; white-space: nowrap; }
  .status-pendiente { background: rgba(148,163,184,0.12); color: #94a3b8; border: 1px solid rgba(148,163,184,0.25); }
  .status-en-progreso { background: rgba(212,175,55,0.14); color: #fcd34d; border: 1px solid rgba(212,175,55,0.3); }
  .status-completada { background: rgba(34,197,94,0.14); color: #22c55e; border: 1px solid rgba(34,197,94,0.3); }

  .compliance-action-text { font-size: 0.78rem; color: var(--muted); margin: 4px 0 2px; line-height: 1.5; font-style: italic; }

  /* ── HISTORICAL COMPARISON ───────────────────────────── */
  .comparison-trigger { margin-top: 24px; text-align: center; }
  .historical-wrap { display: flex; flex-direction: column; gap: 20px; margin-top: 16px; text-align: left; }
  .historical-title-row { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; }
  .historical-title { font-size: 1.05rem; font-weight: 800; color: var(--gold); }

  .dim-evo-table { display: flex; flex-direction: column; }
  .dim-evo-row { display: flex; align-items: center; gap: 10px; padding: 9px 0; border-bottom: 1px solid rgba(255,255,255,0.06); }
  .dim-evo-header-row { padding-bottom: 6px; border-bottom: 1px solid rgba(255,255,255,0.12); }
  .dim-evo-name { flex: 0 0 100px; font-size: 0.82rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .dim-evo-cell { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 4px; align-items: center; }
  .dim-evo-bar-track { width: 85%; height: 4px; background: rgba(255,255,255,0.07); border-radius: 2px; overflow: hidden; }
  .dim-evo-delta { flex: 0 0 52px; text-align: right; }

  .compliance-pair { border: 1px solid rgba(255,255,255,0.08); border-radius: 14px; padding: 16px 18px; margin-bottom: 14px; }
  .compliance-pair:last-child { margin-bottom: 0; }
  .compliance-pair-header { display: flex; align-items: center; gap: 10px; margin-bottom: 14px; }
  .compliance-period { font-weight: 800; font-size: 0.9rem; color: var(--white); }
  .compliance-arrow { color: var(--muted); }
  .compliance-items { display: flex; flex-direction: column; gap: 14px; }
  .compliance-item-header { display: flex; justify-content: space-between; align-items: center; gap: 8px; margin-bottom: 6px; flex-wrap: wrap; }
  .compliance-scores { display: flex; align-items: center; gap: 7px; }
  .compliance-delta { padding: 2px 8px; border-radius: 999px; font-size: 0.74rem; font-weight: 800; white-space: nowrap; }
  .cdelta-up { background: rgba(34,197,94,0.15); color: #22c55e; border: 1px solid rgba(34,197,94,0.3); }
  .cdelta-down { background: rgba(248,113,113,0.15); color: #fca5a5; border: 1px solid rgba(248,113,113,0.3); }
  .cdelta-same { background: rgba(148,163,184,0.1); color: #94a3b8; border: 1px solid rgba(148,163,184,0.2); }
  .compliance-verdict { font-size: 0.73rem; color: var(--muted); line-height: 1.4; margin-top: 2px; }

  /* ── eNPS block ──────────────────────────────────────────── */
  .enps-block { max-width: 460px; margin: 18px auto 0; }
  .enps-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; }
  .enps-label { font-size: 0.7rem; font-weight: 900; letter-spacing: 0.12em; text-transform: uppercase; color: var(--muted); }
  .enps-score { font-size: 1.4rem; font-weight: 900; line-height: 1; }
  .enps-bar { display: flex; height: 8px; border-radius: 4px; overflow: hidden; background: rgba(255,255,255,0.06); }
  .enps-bar > div { height: 100%; transition: width 0.6s ease; }
  .enps-legend { display: flex; justify-content: space-between; font-size: 0.67rem; font-weight: 700; margin-top: 5px; }

  /* ── Demo mode banner ────────────────────────────────────── */
  .demo-banner {
    display: flex; align-items: center; gap: 10px; padding: 10px 16px; margin-bottom: 18px;
    background: rgba(251,146,60,0.08); border: 1px solid rgba(251,146,60,0.3); border-radius: 10px;
    font-size: 0.8rem; color: rgba(248,250,252,0.7); line-height: 1.45; flex-wrap: wrap;
  }
  .demo-banner-icon { font-size: 1rem; flex-shrink: 0; }
  .demo-banner strong { color: #fdba74; }

  /* ── Section jump navigation ────────────────────────────── */
  .section-nav {
    display: flex; gap: 6px; flex-wrap: wrap; padding: 10px 4px;
    position: sticky; top: 72px; z-index: 50;
    background: rgba(4,20,38,0.88); backdrop-filter: blur(14px);
    border-bottom: 1px solid rgba(255,255,255,0.06);
    margin: 0 -4px 4px;
  }
  .section-nav-pill {
    padding: 5px 14px; border-radius: 999px; font-size: 0.74rem; font-weight: 700;
    background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1);
    color: var(--muted); cursor: pointer; transition: all 0.15s; white-space: nowrap;
  }
  .section-nav-pill:hover { background: rgba(56,189,248,0.12); border-color: rgba(56,189,248,0.4); color: var(--sky); }

  /* ── Date range filter ───────────────────────────────────── */
  .date-filter-bar { margin-bottom: 12px; }
  .date-filter-row { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
  .date-filter-input { width: auto !important; padding: 6px 10px !important; font-size: 0.82rem !important; border-radius: 10px !important; color-scheme: dark; }

  /* ── Top questions panel ─────────────────────────────────── */
  .top-q-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
  .top-q-section-label { font-size: 0.75rem; font-weight: 900; letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 10px; }
  .top-q-list { display: flex; flex-direction: column; gap: 8px; }
  .top-q-card {
    padding: 12px 14px; border: 1px solid rgba(255,255,255,0.07); border-left-width: 3px;
    border-radius: 10px; background: rgba(255,255,255,0.02);
  }
  .top-q-header { display: flex; align-items: center; gap: 7px; margin-bottom: 7px; }
  .top-q-badge { font-size: 0.68rem; font-weight: 700; padding: 2px 7px; border-radius: 999px; white-space: nowrap; }
  .top-q-num { font-size: 0.72rem; font-weight: 700; }
  .top-q-score { font-size: 0.9rem; font-weight: 900; }
  .top-q-text { font-size: 0.8rem; color: var(--muted); line-height: 1.45; }

  @media (max-width: 640px) { .top-q-grid { grid-template-columns: 1fr; } }

  /* ── Dimension targets & benchmark ───────────────────────── */
  .target-line {
    position: absolute; top: -2px; bottom: -2px; width: 2px;
    border-left: 2px dashed rgba(212,175,55,0.9);
    pointer-events: none; z-index: 2;
  }
  .benchmark-line {
    position: absolute; top: -2px; bottom: -2px; width: 2px;
    border-left: 2px dotted rgba(148,163,184,0.65);
    pointer-events: none; z-index: 1;
  }
  .benchmark-summary {
    font-size: 0.74rem; color: var(--muted); margin-bottom: 14px; line-height: 1.5;
  }
  .target-gap {
    font-size: 0.72rem; font-weight: 700; padding: 2px 8px;
    border-radius: 999px; border: 1px solid; white-space: nowrap;
  }
  .metas-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 10px; margin-bottom: 4px; }
  .meta-row { display: flex; align-items: center; gap: 8px; }
  .meta-dim-name { flex: 1; font-size: 0.82rem; font-weight: 700; }

  /* ── Sector selector chips ───────────────────────────────── */
  .sector-select-row { display: flex; flex-wrap: wrap; gap: 7px; }
  .sector-chip {
    padding: 5px 13px; border-radius: 999px; font-size: 0.78rem; font-weight: 600;
    background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.12);
    color: var(--muted); cursor: pointer; transition: all 0.15s;
  }
  .sector-chip:hover { background: rgba(56,189,248,0.1); border-color: rgba(56,189,248,0.35); color: var(--sky); }
  .sector-chip-active { background: rgba(56,189,248,0.15) !important; border-color: rgba(56,189,248,0.55) !important; color: var(--sky) !important; font-weight: 800; }

  /* ── WhatsApp share button ───────────────────────────────── */
  .btn-whatsapp {
    padding: 6px 13px; border-radius: 12px; border: 1px solid rgba(37,211,102,0.45);
    background: rgba(37,211,102,0.1); color: #4ade80; font-weight: 700; font-size: 0.8rem;
    transition: background 0.15s, transform 0.12s;
  }
  .btn-whatsapp:hover { background: rgba(37,211,102,0.18); transform: translateY(-1px); }

  /* ── Próxima medición card ───────────────────────────────── */
  .next-meas-card {
    display: flex; align-items: center; gap: 16px; padding: 16px 20px;
    border: 1px solid; border-radius: 14px; margin-top: 18px; flex-wrap: wrap;
  }
  .next-meas-icon { font-size: 1.6rem; flex-shrink: 0; }
  .next-meas-body { flex: 1; min-width: 0; }
  .next-meas-label { font-size: 0.62rem; font-weight: 900; letter-spacing: 0.14em; text-transform: uppercase; margin-bottom: 3px; }
  .next-meas-date { font-size: 1.05rem; font-weight: 800; color: var(--white); line-height: 1.2; margin-bottom: 3px; }
  .next-meas-sub { font-size: 0.78rem; color: var(--muted); line-height: 1.4; }

  /* ── Participation ring (active period card) ─────────────── */
  .part-ring-wrap { display: flex; align-items: center; gap: 16px; margin-bottom: 18px; }
  .part-ring-meta { display: flex; flex-direction: column; gap: 4px; }

  /* ── Contextual alert chips (period dashboard) ──────────── */
  .alert-chips-row { display: flex; flex-direction: column; gap: 7px; margin-bottom: 16px; }
  .alert-chip {
    display: flex; align-items: flex-start; gap: 8px; padding: 10px 15px;
    border-radius: 10px; font-size: 0.82rem; font-weight: 600; line-height: 1.5;
    border: 1px solid;
  }
  .alert-chip-danger  { background: rgba(248,113,113,0.10); border-color: rgba(248,113,113,0.32); color: #fca5a5; }
  .alert-chip-warning { background: rgba(251,146,60,0.10);  border-color: rgba(251,146,60,0.32);  color: #fdba74; }
  .alert-chip-success { background: rgba(34,197,94,0.10);   border-color: rgba(34,197,94,0.32);   color: #86efac; }
  .alert-chip-info    { background: rgba(56,189,248,0.10);  border-color: rgba(56,189,248,0.32);  color: #7dd3fc; }

  /* ── Score trend chart (company dashboard) ──────────────── */
  .trend-chart-wrap {
    background: rgba(7,27,51,0.72); border: 1px solid var(--border);
    border-radius: 20px; padding: 22px 20px; margin-top: 24px; backdrop-filter: blur(10px);
  }
  .trend-chart-header {
    display: flex; align-items: flex-start; justify-content: space-between;
    gap: 16px; margin-bottom: 14px; flex-wrap: wrap;
  }
  .trend-chart-title { font-size: 0.95rem; font-weight: 700; color: var(--white); }
  .trend-chart-delta { display: flex; flex-direction: column; align-items: flex-end; gap: 2px; }

  /* ── FORECAST CHIP ───────────────────────────────────── */
  .forecast-chip { display: flex; align-items: flex-start; gap: 8px; margin-top: 14px; padding: 10px 14px; background: rgba(56,189,248,0.06); border: 1px solid rgba(56,189,248,0.14); border-radius: 10px; }
  .forecast-icon { font-size: 1rem; flex-shrink: 0; line-height: 1.4; }
  .forecast-text { font-size: 0.78rem; color: var(--muted); line-height: 1.5; }

  /* ── DIM TREND TABLE ─────────────────────────────────── */
  .dim-trend-wrap { margin-top: 20px; }
  .dim-trend-title { font-size: 0.8rem; font-weight: 900; color: var(--muted); text-transform: uppercase; letter-spacing: 0.08em; margin: 0 0 10px; }
  .dim-trend-table { border-collapse: collapse; font-size: 0.78rem; width: 100%; }
  .dim-trend-th { padding: 5px 10px; text-align: center; font-size: 0.7rem; font-weight: 800; color: var(--muted); white-space: nowrap; }
  .dim-trend-th-dim { padding: 5px 0 5px 2px; text-align: left; font-size: 0.7rem; font-weight: 800; color: var(--muted); }
  .dim-trend-td { padding: 5px 10px; text-align: center; font-weight: 800; border-radius: 5px; white-space: nowrap; }
  .dim-trend-td-dim { padding: 5px 12px 5px 2px; font-size: 0.72rem; font-weight: 800; white-space: nowrap; }

  /* ── Health index badge (company header) ────────────────── */
  .health-index-row {
    display: flex; align-items: center; gap: 8px; margin-top: 6px; flex-wrap: wrap;
  }
  .health-index-label {
    font-size: 0.7rem; color: var(--muted); font-weight: 700; text-transform: uppercase; letter-spacing: 0.07em;
  }
  .health-index-pill {
    display: inline-flex; align-items: center; gap: 5px; padding: 3px 10px; border-radius: 999px;
    border: 1px solid; font-weight: 800; line-height: 1;
  }
  .health-index-pct { font-size: 0.85rem; }
  .health-index-verdict { font-size: 0.72rem; opacity: 0.85; }
  .health-index-period { font-size: 0.7rem; color: var(--muted); }

  /* ── Welcome onboarding panel ────────────────────────────── */
  .welcome-guide {
    background: rgba(7,27,51,0.72); border: 1px solid rgba(212,175,55,0.2);
    border-radius: 24px; padding: 32px 28px; margin-bottom: 24px; backdrop-filter: blur(10px);
  }
  .welcome-guide-top {
    display: flex; align-items: flex-start; gap: 18px; margin-bottom: 28px; flex-wrap: wrap;
  }
  .welcome-guide-icon {
    font-size: 2.6rem; flex-shrink: 0; width: 60px; height: 60px;
    display: flex; align-items: center; justify-content: center;
    background: rgba(212,175,55,0.1); border: 1px solid rgba(212,175,55,0.25); border-radius: 16px;
  }
  .welcome-guide-title {
    font-size: 1.35rem; font-weight: 900; color: var(--white); margin-bottom: 6px;
  }
  .welcome-guide-sub {
    color: var(--muted); font-size: 0.88rem; line-height: 1.65; max-width: 520px;
  }
  .welcome-steps-grid {
    display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 4px;
  }
  .welcome-step {
    display: flex; gap: 14px; align-items: flex-start;
    background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08);
    border-radius: 16px; padding: 18px 16px;
  }
  .welcome-step-num {
    flex: 0 0 auto; width: 32px; height: 32px; border-radius: 999px;
    background: rgba(212,175,55,0.15); border: 1px solid rgba(212,175,55,0.4);
    color: var(--gold); font-weight: 900; font-size: 0.9rem;
    display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  }
  .welcome-step-body h4 { font-size: 0.9rem; font-weight: 800; color: var(--white); margin-bottom: 6px; }
  .welcome-step-body p { font-size: 0.82rem; color: var(--muted); line-height: 1.6; }
  .welcome-step-body em { color: var(--sky); font-style: normal; font-weight: 700; }

  @media (max-width: 680px) {
    .welcome-steps-grid { grid-template-columns: 1fr; }
    .welcome-guide-top { flex-direction: row; }
  }

  /* ── Composite indicators (Engagement, Clima Relacional, etc.) ── */
  .composite-wrap { margin-bottom: 4px; }
  .composite-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
  .composite-card {
    background: rgba(7,27,51,0.72); border: 1px solid var(--border);
    border-radius: 18px; padding: 18px 14px; text-align: center;
    backdrop-filter: blur(10px); display: flex; flex-direction: column;
    align-items: center; gap: 5px; cursor: default;
    transition: border-color 0.18s;
  }
  .composite-card:hover { border-color: rgba(255,255,255,0.18); }
  .composite-icon { font-size: 1.5rem; line-height: 1; margin-bottom: 2px; }
  .composite-score { font-size: 1.75rem; font-weight: 900; line-height: 1; }
  .composite-label { font-size: 0.82rem; font-weight: 800; color: var(--white); }
  .composite-level {
    display: inline-block; padding: 2px 9px; border-radius: 999px;
    font-size: 0.68rem; font-weight: 800; border: 1px solid; white-space: nowrap;
  }
  .composite-desc { font-size: 0.65rem; color: var(--muted); line-height: 1.4; margin-top: 2px; }

  @media (max-width: 720px) { .composite-row { grid-template-columns: repeat(2, 1fr); } }
  @media (max-width: 400px) { .composite-row { grid-template-columns: 1fr; } }

  /* Also print these */

  /* ── RESPONSIVE ───────────────────────────────────────── */
  @media (max-width: 860px) {
    .info-grid, .admin-statbar { grid-template-columns: repeat(2, 1fr); }
  }
  @media (max-width: 720px) {
    .landing-cards, .form-grid { grid-template-columns: 1fr; }
    .topbar-brand-sub, .topbar-divider, .topbar-author-sub { display: none; }
    .info-grid, .steps, .chart-grid, .recs-grid, .admin-statbar { grid-template-columns: 1fr; }
    .survey-header { flex-direction: column; }
    .dim-progress { max-width: none; justify-content: flex-start; }
    .likert-scale { flex-direction: column; align-items: flex-start; }
    .likert-options { justify-content: flex-start; }
    .likert-end-label { display: none; }
    .breakdown-header { flex-direction: column; align-items: flex-start; }
    .results-actions { flex-direction: column; }
    .btn-primary, .btn-secondary, .btn-export { width: 100%; text-align: center; justify-content: center; }
    .footer-logos { flex-direction: column; gap: 20px; }
    .footer-sep { width: 80%; height: 1px; }
  }
`;
