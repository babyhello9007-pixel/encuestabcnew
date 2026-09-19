from pathlib import Path

root = Path('/home/ubuntu/encuesta-bc')
files = [
    root / 'client/src/pages/NanoEncuestaBC.tsx',
    root / 'client/src/pages/Results.tsx',
    root / 'client/src/components/results/CrisisCeutaSection.tsx',
    root / 'client/src/components/TransferenciaVotoModal.tsx',
    root / 'client/src/index.css',
]
replacements = {
    '#e8465a': '#4b0082',
    'rgba(232,70,90,': 'rgba(75,0,130,',
    'rgba(232, 70, 90,': 'rgba(75, 0, 130,',
    '#f43f5e': '#4b0082',
    'rgba(244, 63, 94,': 'rgba(75, 0, 130,',
}
for path in files:
    text = path.read_text()
    original = text
    for old, new in replacements.items():
        text = text.replace(old, new)
    if path.name == 'NanoEncuestaBC.tsx':
        old = '        .nc-btn-next:hover { background: var(--nc-accent2); transform: translateY(-1px); box-shadow: 0 6px 20px rgba(75,0,130,0.35); }'
        new = '''        .nc-btn-next:hover { background: var(--nc-accent2); transform: translateY(-2px); box-shadow: 0 8px 22px rgba(75,0,130,0.38); }
        .nc-btn-next:active, .nc-btn-primary:active, .nc-btn-outline:active, .nc-btn-prev:active { transform: translateY(0) scale(0.97); }
        .nc-btn-next:focus-visible, .nc-btn-primary:focus-visible, .nc-btn-outline:focus-visible, .nc-btn-prev:focus-visible { outline: 2px solid #c4b5fd; outline-offset: 3px; }
'''
        if old not in text:
            raise SystemExit(f'Nano button anchor not found in {path}')
        text = text.replace(old, new, 1)
        old = '        .nc-loading-spinner {\n          width: 20px; height: 20px; border-radius: 50%;\n          border: 2px solid var(--nc-border2);\n          border-top-color: var(--nc-accent);'
        new = '        .nc-loading-spinner {\n          width: 20px; height: 20px; border-radius: 50%;\n          border: 2px solid var(--nc-border2);\n          border-top-color: #4b0082;\n          box-shadow: 0 0 0 3px rgba(75,0,130,0.08);'
        if old not in text:
            raise SystemExit(f'Nano spinner anchor not found in {path}')
        text = text.replace(old, new, 1)
    if path.name == 'Results.tsx':
        old = '.r-hbtn { display: inline-flex; align-items: center; gap: 5px; padding: 6px 12px; border-radius: 8px; font-size: 13px; font-weight: 600; font-family: inherit; cursor: pointer; transition: all 0.18s; white-space: nowrap; }'
        new = '''.r-hbtn { display: inline-flex; align-items: center; gap: 5px; padding: 6px 12px; border-radius: 8px; font-size: 13px; font-weight: 600; font-family: inherit; cursor: pointer; transition: transform 160ms cubic-bezier(.23,1,.32,1), background-color 180ms ease, border-color 180ms ease, box-shadow 180ms ease, color 180ms ease; white-space: nowrap; }
  .r-hbtn:not(:disabled):hover { transform: translateY(-2px); box-shadow: 0 8px 18px rgba(75,0,130,.22); }
  .r-hbtn:not(:disabled):active { transform: translateY(0) scale(.97); box-shadow: 0 3px 8px rgba(75,0,130,.18); }
  .r-hbtn:focus-visible { outline: 2px solid #c4b5fd; outline-offset: 3px; }
  .r-hbtn:disabled { cursor: not-allowed; opacity: .58; }'''
        if old not in text:
            raise SystemExit(f'Results button anchor not found in {path}')
        text = text.replace(old, new, 1)
        old = '.r-export-progress { display: inline-flex; align-items: center; gap: 6px; padding: 5px 8px; border-radius: 8px; color: #bfdbfe; background: rgba(59,130,246,.13); border: 1px solid rgba(96,165,250,.25); font-size: 10px; font-weight: 800; white-space: nowrap; }\n  .r-export-spinner { width: 10px; height: 10px; border: 2px solid rgba(191,219,254,.28); border-top-color: #bfdbfe; border-radius: 50%; animation: rSpin .7s linear infinite; }'
        new = '.r-export-progress { display: inline-flex; align-items: center; gap: 6px; padding: 5px 8px; border-radius: 8px; color: #ddd6fe; background: rgba(75,0,130,.18); border: 1px solid rgba(167,139,250,.36); font-size: 10px; font-weight: 800; white-space: nowrap; }\n  .r-export-spinner { width: 10px; height: 10px; border: 2px solid rgba(196,181,253,.3); border-top-color: #a78bfa; border-radius: 50%; animation: rSpin .7s linear infinite; box-shadow: 0 0 0 2px rgba(75,0,130,.12); }'
        if old not in text:
            raise SystemExit(f'Results progress anchor not found in {path}')
        text = text.replace(old, new, 1)
    if path.name == 'index.css':
        marker = 'button[class*="bg-[#4b0082]"]:hover,\n'
        if '.btn-primary:not(:disabled):active' not in text:
            addition = '''\n/* Corporate purple micro-interactions: hover lift, press feedback and accessible focus. */\n.btn-primary:not(:disabled), .btn-secondary:not(:disabled),\nbutton[class*="bg-[#4b0082]"]:not(:disabled),\nbutton[class*="bg-red-500"]:not(:disabled), button[class*="bg-red-600"]:not(:disabled), button[class*="bg-red-700"]:not(:disabled) {\n  transition: transform 160ms cubic-bezier(.23,1,.32,1), background-color 180ms ease, box-shadow 180ms ease, color 180ms ease;\n}\n.btn-primary:not(:disabled):hover, .btn-secondary:not(:disabled):hover,\nbutton[class*="bg-[#4b0082]"]:not(:disabled):hover {\n  transform: translateY(-2px);\n  box-shadow: 0 8px 20px rgba(75, 0, 130, .28);\n}\n.btn-primary:not(:disabled):active, .btn-secondary:not(:disabled):active,\nbutton[class*="bg-[#4b0082]"]:not(:disabled):active { transform: translateY(0) scale(.97); }\n.btn-primary:focus-visible, .btn-secondary:focus-visible,\nbutton[class*="bg-[#4b0082]"]:focus-visible { outline: 2px solid #c4b5fd; outline-offset: 3px; }\n@media (prefers-reduced-motion: reduce) {\n  .btn-primary, .btn-secondary, button[class*="bg-[#4b0082]"], .r-hbtn { transition: none !important; }\n  .btn-primary:hover, .btn-secondary:hover, button[class*="bg-[#4b0082]"]:hover, .r-hbtn:hover { transform: none !important; }\n}\n'''
            text += addition
    if text != original:
        path.write_text(text)
        print(f'updated {path}')
    else:
        print(f'unchanged {path}')
