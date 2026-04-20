import { useState, useEffect, useRef } from 'react';

const features = [
  {
    icon: '⬡',
    title: 'Visual Node Editor',
    desc: 'Drag, drop, and connect nodes on an infinite canvas. Build complex pipelines without writing a single line of plumbing code.',
  },
  {
    icon: '⚡',
    title: 'Live Execution',
    desc: 'Pipelines execute automatically as you build. See outputs update in real-time with every connection or edit.',
  },
  {
    icon: '🔀',
    title: 'Conditional Branching',
    desc: 'Route data through true/false paths using Condition nodes. Build decision trees and smart filtering logic effortlessly.',
  },
  {
    icon: '🔧',
    title: 'Transform & Merge',
    desc: 'Uppercase, reverse, trim, or merge multiple streams. A full toolkit of data transformation primitives at your fingertips.',
  },
  {
    icon: '🤖',
    title: 'LLM Integration',
    desc: 'Connect Prompt nodes to LLM nodes to inject AI reasoning anywhere in your pipeline with zero friction.',
  },
  {
    icon: '⏱',
    title: 'Delay & Control',
    desc: 'Throttle data flow with configurable Delay nodes. Build pipelines that respect timing and processing order.',
  },
];

const menuItems = [
  { label: 'Features', href: '#features' },
  { label: 'Help', href: '#help' },
  { label: 'Terms & Conditions', href: '#terms' },
];

function Particle({ style }) {
  return <div className="particle" style={style} />;
}

export default function HomePage({ onEnter }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState(null);
  const [visible, setVisible] = useState(false);
  const particlesRef = useRef([]);

  useEffect(() => {
    setTimeout(() => setVisible(true), 100);
    particlesRef.current = Array.from({ length: 24 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      size: `${2 + Math.random() * 3}px`,
      delay: `${Math.random() * 6}s`,
      duration: `${6 + Math.random() * 8}s`,
      opacity: 0.15 + Math.random() * 0.25,
    }));
  }, []);

  const handleNavClick = (href) => {
    const id = href.replace('#', '');
    setActiveSection(id === activeSection ? null : id);
    setMenuOpen(false);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Mono:wght@300;400;500&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --bg: #0f172a;
          --surface: #1e293b;
          --surface2: #263348;
          --accent: #38bdf8;
          --accent2: #818cf8;
          --accent3: #34d399;
          --text: #f1f5f9;
          --muted: #94a3b8;
          --border: rgba(148,163,184,0.12);
          --glow: rgba(56,189,248,0.18);
        }

        body { background: var(--bg); color: var(--text); font-family: 'DM Mono', monospace; }

        .homepage {
          min-height: 100vh;
          background: var(--bg);
          position: relative;
          overflow-x: hidden;
        }

        /* ── GRID LINES ── */
        .grid-lines {
          position: fixed; inset: 0; pointer-events: none; z-index: 0;
          background-image:
            linear-gradient(rgba(56,189,248,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(56,189,248,0.04) 1px, transparent 1px);
          background-size: 40px 40px;
        }

        /* ── PARTICLES ── */
        .particle {
          position: absolute; border-radius: 50%;
          background: var(--accent);
          animation: float var(--dur, 8s) var(--delay, 0s) infinite ease-in-out alternate;
          pointer-events: none;
        }
        @keyframes float {
          0% { transform: translateY(0) scale(1); opacity: var(--op, 0.2); }
          100% { transform: translateY(-40px) scale(1.4); opacity: calc(var(--op, 0.2) * 0.4); }
        }

        /* ── NAV ── */
        .nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 100;
          display: flex; align-items: center; justify-content: space-between;
          padding: 18px 40px;
          background: rgba(15,23,42,0.85);
          backdrop-filter: blur(16px);
          border-bottom: 1px solid var(--border);
          transform: translateY(var(--nav-y, -100%));
          transition: transform 0.7s cubic-bezier(0.22,1,0.36,1);
        }
        .nav.visible { --nav-y: 0; }

        .nav-logo {
          font-family: 'Syne', sans-serif;
          font-weight: 800; font-size: 18px;
          letter-spacing: -0.5px;
          color: var(--text);
          display: flex; align-items: center; gap: 10px;
        }
        .nav-logo-dot {
          width: 8px; height: 8px; border-radius: 50%;
          background: var(--accent);
          box-shadow: 0 0 10px var(--accent);
          animation: pulse 2s infinite;
        }
        @keyframes pulse {
          0%,100% { box-shadow: 0 0 8px var(--accent); }
          50% { box-shadow: 0 0 20px var(--accent), 0 0 40px var(--glow); }
        }

        .hamburger {
          background: none; border: 1px solid var(--border);
          border-radius: 8px; padding: 8px 10px;
          cursor: pointer; display: flex; flex-direction: column;
          gap: 5px; transition: border-color 0.2s;
        }
        .hamburger:hover { border-color: var(--accent); }
        .hamburger span {
          display: block; width: 22px; height: 2px;
          background: var(--muted); border-radius: 2px;
          transition: all 0.3s ease;
        }
        .hamburger.open span:nth-child(1) { transform: translateY(7px) rotate(45deg); background: var(--accent); }
        .hamburger.open span:nth-child(2) { opacity: 0; }
        .hamburger.open span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); background: var(--accent); }

        /* ── DROPDOWN ── */
        .dropdown {
          position: absolute; top: calc(100% + 8px); right: 40px;
          background: var(--surface); border: 1px solid var(--border);
          border-radius: 12px; overflow: hidden;
          min-width: 220px;
          transform: translateY(-8px) scale(0.96);
          opacity: 0; pointer-events: none;
          transition: all 0.25s cubic-bezier(0.22,1,0.36,1);
          box-shadow: 0 24px 48px rgba(0,0,0,0.4);
        }
        .dropdown.open { transform: translateY(0) scale(1); opacity: 1; pointer-events: all; }
        .dropdown a {
          display: block; padding: 14px 20px;
          color: var(--muted); text-decoration: none;
          font-size: 13px; letter-spacing: 0.5px;
          border-bottom: 1px solid var(--border);
          transition: all 0.15s;
          font-family: 'DM Mono', monospace;
        }
        .dropdown a:last-child { border-bottom: none; }
        .dropdown a:hover { color: var(--accent); background: rgba(56,189,248,0.06); padding-left: 26px; }

        /* ── HERO ── */
        .hero {
          min-height: 100vh;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          text-align: center;
          padding: 120px 40px 60px;
          position: relative; z-index: 1;
        }

        .hero-badge {
          display: inline-flex; align-items: center; gap: 8px;
          background: rgba(56,189,248,0.08);
          border: 1px solid rgba(56,189,248,0.25);
          border-radius: 100px; padding: 6px 16px;
          font-size: 11px; letter-spacing: 2px; text-transform: uppercase;
          color: var(--accent); margin-bottom: 32px;
          opacity: 0; transform: translateY(20px);
          animation: fadeUp 0.7s 0.3s forwards;
        }
        .hero-badge-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--accent3); animation: pulse 1.5s infinite; }

        .hero-title {
          font-family: 'Syne', sans-serif;
          font-size: clamp(48px, 8vw, 96px);
          font-weight: 800; line-height: 0.95;
          letter-spacing: -3px;
          color: var(--text);
          margin-bottom: 28px;
          opacity: 0; transform: translateY(30px);
          animation: fadeUp 0.8s 0.5s forwards;
        }
        .hero-title .line2 {
          background: linear-gradient(135deg, var(--accent) 0%, var(--accent2) 100%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .hero-sub {
          max-width: 560px; font-size: 15px; line-height: 1.8;
          color: var(--muted); margin-bottom: 48px;
          opacity: 0; transform: translateY(20px);
          animation: fadeUp 0.8s 0.7s forwards;
        }

        .hero-cta {
          opacity: 0; transform: translateY(20px);
          animation: fadeUp 0.8s 0.9s forwards;
        }

        .enter-btn {
          position: relative; overflow: hidden;
          background: linear-gradient(135deg, var(--accent), var(--accent2));
          border: none; border-radius: 12px;
          padding: 16px 48px;
          font-family: 'Syne', sans-serif; font-weight: 700;
          font-size: 15px; letter-spacing: 1px; text-transform: uppercase;
          color: #0f172a; cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s;
          box-shadow: 0 8px 32px rgba(56,189,248,0.3);
        }
        .enter-btn:hover {
          transform: translateY(-3px);
          box-shadow: 0 16px 48px rgba(56,189,248,0.45);
        }
        .enter-btn:active { transform: translateY(0); }
        .enter-btn::after {
          content: ''; position: absolute; inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.15), transparent);
          opacity: 0; transition: opacity 0.2s;
        }
        .enter-btn:hover::after { opacity: 1; }

        /* ── NODE PREVIEW ── */
        .node-preview {
          margin-top: 72px; width: 100%; max-width: 700px;
          opacity: 0; transform: translateY(40px);
          animation: fadeUp 1s 1.1s forwards;
        }
        .preview-label {
          font-size: 10px; letter-spacing: 3px; text-transform: uppercase;
          color: var(--muted); margin-bottom: 16px; opacity: 0.6;
        }
        .preview-canvas {
          background: var(--surface);
          border: 1px solid var(--border); border-radius: 16px;
          padding: 28px 32px;
          display: flex; align-items: center; gap: 0;
          overflow-x: auto;
          box-shadow: 0 32px 64px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05);
        }
        .preview-node {
          flex-shrink: 0;
          background: var(--surface2);
          border: 1px solid var(--border); border-radius: 10px;
          padding: 12px 20px; font-size: 12px;
          display: flex; flex-direction: column; gap: 4px;
          position: relative; min-width: 100px;
          transition: border-color 0.2s;
        }
        .preview-node:hover { border-color: var(--accent); }
        .preview-node-type { font-size: 9px; letter-spacing: 2px; text-transform: uppercase; color: var(--muted); }
        .preview-node-label { color: var(--text); font-weight: 500; }
        .preview-connector {
          flex-shrink: 0; width: 40px; height: 2px;
          background: linear-gradient(90deg, var(--accent2), var(--accent));
          position: relative;
        }
        .preview-connector::after {
          content: ''; position: absolute;
          right: -4px; top: 50%; transform: translateY(-50%);
          width: 8px; height: 8px; border-radius: 50%;
          background: var(--accent);
          box-shadow: 0 0 8px var(--accent);
        }
        .node-dot {
          width: 8px; height: 8px; border-radius: 50%;
          position: absolute; right: -4px; top: 50%; transform: translateY(-50%);
          background: var(--accent2);
          box-shadow: 0 0 8px var(--accent2);
        }

        /* ── FEATURES ── */
        .section {
          padding: 100px 40px;
          max-width: 1200px; margin: 0 auto;
          position: relative; z-index: 1;
        }
        .section-header {
          text-align: center; margin-bottom: 64px;
        }
        .section-tag {
          font-size: 10px; letter-spacing: 3px; text-transform: uppercase;
          color: var(--accent); margin-bottom: 16px; display: block;
        }
        .section-title {
          font-family: 'Syne', sans-serif;
          font-size: clamp(28px, 4vw, 48px); font-weight: 800;
          letter-spacing: -1.5px; color: var(--text);
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 20px;
        }
        .feature-card {
          background: var(--surface); border: 1px solid var(--border);
          border-radius: 16px; padding: 32px;
          transition: all 0.3s ease;
          position: relative; overflow: hidden;
          opacity: 0; transform: translateY(24px);
          animation: fadeUp 0.6s forwards;
        }
        .feature-card::before {
          content: ''; position: absolute;
          top: 0; left: 0; right: 0; height: 2px;
          background: linear-gradient(90deg, var(--accent), var(--accent2));
          opacity: 0; transition: opacity 0.3s;
        }
        .feature-card:hover { border-color: rgba(56,189,248,0.3); transform: translateY(-4px); box-shadow: 0 24px 48px rgba(0,0,0,0.3); }
        .feature-card:hover::before { opacity: 1; }
        .feature-card:nth-child(1) { animation-delay: 0.1s; }
        .feature-card:nth-child(2) { animation-delay: 0.2s; }
        .feature-card:nth-child(3) { animation-delay: 0.3s; }
        .feature-card:nth-child(4) { animation-delay: 0.4s; }
        .feature-card:nth-child(5) { animation-delay: 0.5s; }
        .feature-card:nth-child(6) { animation-delay: 0.6s; }
        .feature-icon {
          font-size: 28px; margin-bottom: 20px;
          display: block;
        }
        .feature-title {
          font-family: 'Syne', sans-serif;
          font-size: 17px; font-weight: 700;
          color: var(--text); margin-bottom: 12px;
          letter-spacing: -0.3px;
        }
        .feature-desc { font-size: 13px; line-height: 1.8; color: var(--muted); }

        /* ── HELP & TERMS ── */
        .info-section {
          background: var(--surface); border-top: 1px solid var(--border);
          border-bottom: 1px solid var(--border);
          position: relative; z-index: 1;
        }
        .info-inner {
          max-width: 1200px; margin: 0 auto;
          padding: 80px 40px;
          display: grid; grid-template-columns: 1fr 1fr; gap: 80px;
        }
        @media (max-width: 768px) {
          .info-inner { grid-template-columns: 1fr; gap: 48px; }
          .nav { padding: 16px 20px; }
          .dropdown { right: 20px; }
          .hero { padding: 100px 24px 48px; }
          .section { padding: 60px 24px; }
          .preview-canvas { gap: 8px; padding: 20px; }
        }
        .info-block h3 {
          font-family: 'Syne', sans-serif;
          font-size: 22px; font-weight: 700;
          color: var(--text); margin-bottom: 24px;
          letter-spacing: -0.5px;
          display: flex; align-items: center; gap: 10px;
        }
        .info-block h3::before {
          content: ''; width: 4px; height: 20px;
          background: linear-gradient(180deg, var(--accent), var(--accent2));
          border-radius: 2px; flex-shrink: 0;
        }
        .info-block p, .info-block li {
          font-size: 13px; line-height: 2; color: var(--muted);
        }
        .info-block ul { list-style: none; }
        .info-block li { padding: 6px 0; border-bottom: 1px solid var(--border); }
        .info-block li:last-child { border-bottom: none; }
        .info-block li::before { content: '→ '; color: var(--accent); }

        /* ── FOOTER ── */
        .footer {
          text-align: center; padding: 40px;
          font-size: 12px; color: var(--muted);
          letter-spacing: 0.5px;
          border-top: 1px solid var(--border);
          position: relative; z-index: 1;
        }
        .footer span { color: var(--accent); }

        @keyframes fadeUp {
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div className="homepage">
        <div className="grid-lines" />

        {/* Particles */}
        <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
          {particlesRef.current.map((p) => (
            <Particle
              key={p.id}
              style={{
                left: p.left,
                top: p.top,
                width: p.size,
                height: p.size,
                '--op': p.opacity,
                '--delay': p.delay,
                '--dur': p.duration,
              }}
            />
          ))}
        </div>

        {/* NAV */}
        <nav className={`nav ${visible ? 'visible' : ''}`}>
          <div className="nav-logo">
            <div className="nav-logo-dot" />
            FlowCraft
          </div>
          <div style={{ position: 'relative' }}>
            <button
              className={`hamburger ${menuOpen ? 'open' : ''}`}
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="Menu"
            >
              <span /><span /><span />
            </button>
            <div className={`dropdown ${menuOpen ? 'open' : ''}`}>
              {menuItems.map((item) => (
                <a key={item.label} href={item.href} onClick={() => handleNavClick(item.href)}>
                  {item.label}
                </a>
              ))}
            </div>
          </div>
        </nav>

        {/* HERO */}
        <section className="hero">
          <div className="hero-badge">
            <span className="hero-badge-dot" />
            Visual Pipeline Builder
          </div>
          <h1 className="hero-title">
            Build Pipelines<br />
            <span className="line2">Visually.</span>
          </h1>
          <p className="hero-sub">
            Drag nodes, draw edges, and watch your data flow in real-time.
            No boilerplate. No wiring. Just logic.
          </p>
          <div className="hero-cta">
            <button className="enter-btn" onClick={onEnter}>
              Launch Builder →
            </button>
          </div>

          {/* Mini canvas preview */}
          <div className="node-preview">
            <div className="preview-label">Example pipeline</div>
            <div className="preview-canvas">
              {[
                { type: 'Input', label: 'User Input' },
                { type: 'Prompt', label: 'Summarise:' },
                { type: 'LLM', label: 'GPT Node' },
                { type: 'Output', label: 'Response' },
              ].map((n, i, arr) => (
                <div key={n.label} style={{ display: 'flex', alignItems: 'center' }}>
                  <div className="preview-node">
                    <span className="preview-node-type">{n.type}</span>
                    <span className="preview-node-label">{n.label}</span>
                    {i < arr.length - 1 && <div className="node-dot" />}
                  </div>
                  {i < arr.length - 1 && <div className="preview-connector" />}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section id="features" className="section">
          <div className="section-header">
            <span className="section-tag">What's inside</span>
            <h2 className="section-title">Everything you need to build.</h2>
          </div>
          <div className="features-grid">
            {features.map((f) => (
              <div className="feature-card" key={f.title}>
                <span className="feature-icon">{f.icon}</span>
                <div className="feature-title">{f.title}</div>
                <div className="feature-desc">{f.desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* HELP + TERMS */}
        <div className="info-section">
          <div className="info-inner">
            <div id="help" className="info-block">
              <h3>Help & Getting Started</h3>
              <ul>
                <li>Drag a node from the toolbar onto the canvas</li>
                <li>Connect nodes by dragging from an output handle to an input handle</li>
                <li>Type in Input nodes — outputs update live</li>
                <li>Use Condition nodes to branch your pipeline</li>
                <li>LLM nodes accept a Prompt node on the prompt handle</li>
                <li>Use the ✕ button in Controls to clear the canvas</li>
                <li>Pipelines auto-execute 80 ms after any change</li>
              </ul>
            </div>
            <div id="terms" className="info-block">
              <h3>Terms & Conditions</h3>
              <p style={{ marginBottom: '16px' }}>
                By using FlowCraft you agree to the following:
              </p>
              <ul>
                <li>This tool is provided for personal & evaluation use</li>
                <li>Do not submit sensitive or personal data through pipelines</li>
                <li>LLM node outputs depend on your backend configuration</li>
                <li>We make no guarantees on execution accuracy or uptime</li>
                <li>Pipeline data is not persisted between sessions</li>
                <li>Usage is subject to fair-use policy</li>
              </ul>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <footer className="footer">
          Built with <span>ReactFlow</span> + <span>FastAPI</span> · FlowCraft © {new Date().getFullYear()}
        </footer>
      </div>
    </>
  );
}