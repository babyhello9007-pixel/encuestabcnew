import { useEffect, useState, useRef, useCallback } from 'react';

interface CooldownModalProps {
  isOpen: boolean;
  remainingMinutes: number;
  onClose?: () => void;
}

export default function CooldownModal({ isOpen, remainingMinutes, onClose }: CooldownModalProps) {
  const [totalSecondsLeft, setTotalSecondsLeft] = useState(remainingMinutes * 60);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const initialTotal = useRef(remainingMinutes * 60);

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!isOpen) {
      clearTimer();
      return;
    }

    const total = remainingMinutes * 60;
    initialTotal.current = total;
    setTotalSecondsLeft(total);

    intervalRef.current = setInterval(() => {
      setTotalSecondsLeft((prev) => {
        if (prev <= 1) {
          clearTimer();
          onClose?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearTimer();
  }, [isOpen, remainingMinutes, clearTimer, onClose]);

  if (!isOpen) return null;

  const minutes = Math.floor(totalSecondsLeft / 60);
  const seconds = totalSecondsLeft % 60;
  const progress = 1 - totalSecondsLeft / initialTotal.current;

  // SVG clock calculations
  const clockSize = 180;
  const cx = clockSize / 2;
  const cy = clockSize / 2;
  const radius = 75;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress);

  const minuteAngle = ((minutes % 60) / 60) * 360 - 90;
  const secondAngle = (seconds / 60) * 360 - 90;

  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const minuteX = cx + 48 * Math.cos(toRad(minuteAngle));
  const minuteY = cy + 48 * Math.sin(toRad(minuteAngle));
  const secondX = cx + 60 * Math.cos(toRad(secondAngle));
  const secondY = cy + 60 * Math.sin(toRad(secondAngle));

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0,0,0,0.75)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        animation: 'fadeIn 0.25s ease',
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;600;700&family=JetBrains+Mono:wght@400;700&display=swap');

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(24px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes pulse-ring {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 0.15; transform: scale(1.06); }
        }
        @keyframes tick {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.04); }
        }

        .cooldown-card {
          font-family: 'Sora', sans-serif;
          background: linear-gradient(160deg, #0f1117 0%, #161b27 50%, #0f1117 100%);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 24px;
          padding: 40px 36px;
          width: 100%;
          max-width: 400px;
          box-shadow:
            0 0 0 1px rgba(255,255,255,0.04),
            0 32px 80px rgba(0,0,0,0.6),
            0 0 60px rgba(99,102,241,0.08);
          animation: slideUp 0.3s cubic-bezier(0.34,1.56,0.64,1) both;
          position: relative;
          overflow: hidden;
        }
        .cooldown-card::before {
          content: '';
          position: absolute;
          top: -60px; left: 50%; transform: translateX(-50%);
          width: 200px; height: 200px;
          background: radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%);
          pointer-events: none;
        }

        .mono {
          font-family: 'JetBrains Mono', monospace;
        }

        .clock-pulse {
          animation: pulse-ring 2s ease-in-out infinite;
        }
        .digits {
          animation: tick 1s ease-in-out infinite;
        }
      `}</style>

      <div className="cooldown-card">
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            background: 'rgba(99,102,241,0.12)',
            border: '1px solid rgba(99,102,241,0.25)',
            borderRadius: 999,
            padding: '6px 14px',
            marginBottom: 16,
          }}>
            <span style={{ fontSize: 13, color: '#a5b4fc', fontWeight: 600, letterSpacing: '0.04em' }}>
              ⏱ COOLDOWN DE DESCANSO EL SISTEMA ACTIVO
            </span>
          </div>
          <h2 style={{
            margin: 0,
            fontSize: 22,
            fontWeight: 700,
            color: '#f1f5f9',
            letterSpacing: '-0.01em',
          }}>
            Debido a la alta demananda, el sistema de prevención de caída se ha activado. Vuelve en un momento
          </h2>
          <p style={{ margin: '6px 0 0', fontSize: 13.5, color: '#64748b', lineHeight: 1.5 }}>
            Debes esperar antes de participar de nuevo. 
          </p>
        </div>

        {/* Clock SVG */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24, position: 'relative' }}>
          {/* Pulse ring */}
          <div className="clock-pulse" style={{
            position: 'absolute',
            top: '50%', left: '50%',
            transform: 'translate(-50%,-50%)',
            width: 180, height: 180,
            borderRadius: '50%',
            border: '2px solid rgba(99,102,241,0.3)',
            pointerEvents: 'none',
          }} />

          <svg width={clockSize} height={clockSize} viewBox={`0 0 ${clockSize} ${clockSize}`}>
            {/* Background circle */}
            <circle cx={cx} cy={cy} r={radius} fill="rgba(15,17,23,0.8)" stroke="rgba(255,255,255,0.06)" strokeWidth="1.5" />

            {/* Progress arc */}
            <circle
              cx={cx} cy={cy} r={radius}
              fill="none"
              stroke="url(#arcGrad)"
              strokeWidth="5"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              transform={`rotate(-90 ${cx} ${cy})`}
              style={{ transition: 'stroke-dashoffset 0.9s linear' }}
            />

            {/* Tick marks */}
            {Array.from({ length: 60 }).map((_, i) => {
              const angle = (i / 60) * 360 - 90;
              const isMajor = i % 5 === 0;
              const r1 = isMajor ? 68 : 71;
              const r2 = 74;
              const x1 = cx + r1 * Math.cos(toRad(angle));
              const y1 = cy + r1 * Math.sin(toRad(angle));
              const x2 = cx + r2 * Math.cos(toRad(angle));
              const y2 = cy + r2 * Math.sin(toRad(angle));
              return (
                <line
                  key={i}
                  x1={x1} y1={y1} x2={x2} y2={y2}
                  stroke={isMajor ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.12)'}
                  strokeWidth={isMajor ? 1.5 : 1}
                />
              );
            })}

            {/* Minute hand */}
            <line
              x1={cx} y1={cy}
              x2={minuteX} y2={minuteY}
              stroke="#c7d2fe"
              strokeWidth="3"
              strokeLinecap="round"
              style={{ transition: 'all 0.5s ease' }}
            />

            {/* Second hand */}
            <line
              x1={cx} y1={cy}
              x2={secondX} y2={secondY}
              stroke="#6366f1"
              strokeWidth="1.5"
              strokeLinecap="round"
              style={{ transition: 'all 0.9s linear' }}
            />

            {/* Center dot */}
            <circle cx={cx} cy={cy} r={4} fill="#6366f1" />
            <circle cx={cx} cy={cy} r={2} fill="#e0e7ff" />

            <defs>
              <linearGradient id="arcGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#6366f1" />
                <stop offset="100%" stopColor="#a78bfa" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Digital countdown */}
        <div className="digits" style={{ textAlign: 'center', marginBottom: 24 }}>
          <span className="mono" style={{
            fontSize: 52,
            fontWeight: 700,
            color: '#f1f5f9',
            letterSpacing: '-0.02em',
            lineHeight: 1,
          }}>
            {String(minutes).padStart(2, '0')}
            <span style={{ color: '#6366f1', margin: '0 2px', opacity: totalSecondsLeft % 2 === 0 ? 1 : 0.4, transition: 'opacity 0.4s' }}>:</span>
            {String(seconds).padStart(2, '0')}
          </span>
          <p style={{ margin: '8px 0 0', fontSize: 12, color: '#475569', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            minutos &nbsp;·&nbsp; segundos
          </p>
        </div>

        {/* Progress bar */}
        <div style={{
          background: 'rgba(255,255,255,0.05)',
          borderRadius: 999,
          height: 5,
          overflow: 'hidden',
          marginBottom: 20,
        }}>
          <div style={{
            height: '100%',
            width: `${progress * 100}%`,
            background: 'linear-gradient(90deg, #6366f1, #a78bfa)',
            borderRadius: 999,
            transition: 'width 0.9s linear',
            boxShadow: '0 0 8px rgba(99,102,241,0.6)',
          }} />
        </div>

        {/* Footer message */}
        <p style={{
          textAlign: 'center',
          fontSize: 13,
          color: '#475569',
          margin: 0,
          lineHeight: 1.6,
        }}>
          {minutes > 0
            ? `Podrás votar en ${minutes} min${minutes !== 1 ? 's' : ''} y ${seconds} seg`
            : `Podrás votar en ${seconds} segundo${seconds !== 1 ? 's' : ''}`
          }
        </p>
      </div>
    </div>
  );
}
