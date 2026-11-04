import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, Download, User, Heart, Utensils, Truck, Recycle, Sparkles, CheckCircle2 } from 'lucide-react';
import { easeOutExpo } from '@/lib/animations';
import Reveal from './Reveal';

type Role = 'donor' | 'volunteer';

const ROLE_THEMES: Record<Role, { label: string; accent: string; accentRgb: string }> = {
  donor: { label: 'Food Donor', accent: '#FF9254', accentRgb: '255,146,84' },
  volunteer: { label: 'Community Volunteer', accent: '#176B45', accentRgb: '23,107,69' },
};

const MILESTONES: Record<Role, { icon: typeof Heart; label: string; value: string }[]> = {
  donor: [
    { icon: Utensils, label: 'Meals Donated', value: '1,240' },
    { icon: Truck, label: 'Pickups Completed', value: '38' },
    { icon: Recycle, label: 'Food Saved', value: '312 kg' },
  ],
  volunteer: [
    { icon: Truck, label: 'Delivered', value: '860 meals' },
    { icon: Heart, label: 'Families Helped', value: '142' },
    { icon: Recycle, label: 'Hours Given', value: '76 hrs' },
  ],
};

export default function CertificateGenerator() {
  const [name, setName] = useState('');
  const [role, setRole] = useState<Role>('donor');
  const [error, setError] = useState('');
  const [generated, setGenerated] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const drawCertificate = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = 1200;
    const H = 850;
    canvas.width = W;
    canvas.height = H;

    const theme = ROLE_THEMES[role];

    // ===== Background with subtle texture =====
    const bgGrad = ctx.createRadialGradient(W / 2, H / 2, 100, W / 2, H / 2, W * 0.7);
    bgGrad.addColorStop(0, '#FFFDF7');
    bgGrad.addColorStop(0.6, '#FFF9EF');
    bgGrad.addColorStop(1, '#F5EFE2');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, W, H);

    // Subtle dot pattern overlay
    ctx.fillStyle = 'rgba(23,107,69,0.025)';
    for (let x = 60; x < W - 60; x += 24) {
      for (let y = 60; y < H - 60; y += 24) {
        ctx.beginPath();
        ctx.arc(x, y, 1, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // ===== Ornate triple border =====
    // Outer thick border
    ctx.strokeStyle = theme.accent;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.roundRect(25, 25, W - 50, H - 50, 28);
    ctx.stroke();

    // Gold-ish accent between borders
    ctx.strokeStyle = `rgba(${theme.accentRgb}, 0.5)`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(35, 35, W - 70, H - 70, 22);
    ctx.stroke();

    // Inner border
    ctx.strokeStyle = `rgba(${theme.accentRgb}, 0.35)`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(55, 55, W - 110, H - 110, 16);
    ctx.stroke();

    // Innermost thin border
    ctx.strokeStyle = `rgba(${theme.accentRgb}, 0.15)`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(62, 62, W - 124, H - 124, 12);
    ctx.stroke();

    // ===== Decorative corner ornaments =====
    const drawCornerOrnament = (x: number, y: number, flipX: number, flipY: number) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(flipX, flipY);
      ctx.strokeStyle = theme.accent;
      ctx.lineWidth = 2.5;
      // L-shaped bracket
      ctx.beginPath();
      ctx.moveTo(0, 55);
      ctx.quadraticCurveTo(0, 0, 55, 0);
      ctx.stroke();
      // Inner arc
      ctx.beginPath();
      ctx.arc(28, 28, 18, Math.PI, Math.PI * 1.5);
      ctx.stroke();
      // Dot
      ctx.beginPath();
      ctx.arc(28, 28, 4, 0, Math.PI * 2);
      ctx.fillStyle = theme.accent;
      ctx.fill();
      // Small decorative lines
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(10, 45);
      ctx.lineTo(18, 45);
      ctx.moveTo(45, 10);
      ctx.lineTo(45, 18);
      ctx.stroke();
      ctx.restore();
    };
    drawCornerOrnament(72, 72, 1, 1);
    drawCornerOrnament(W - 72, 72, -1, 1);
    drawCornerOrnament(72, H - 72, 1, -1);
    drawCornerOrnament(W - 72, H - 72, -1, -1);

    // ===== Top center ornament — laurel wreath around seal =====
    const sealY = 125;
    const sealR = 48;

    // Laurel leaves — left side
    const drawLaurel = (dir: number) => {
      ctx.save();
      ctx.translate(W / 2 + dir * 65, sealY);
      ctx.strokeStyle = `rgba(${theme.accentRgb}, 0.6)`;
      ctx.lineWidth = 2;
      // Stem
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(dir * 15, 25, dir * 5, 50);
      ctx.stroke();
      // Leaves
      ctx.fillStyle = `rgba(${theme.accentRgb}, 0.4)`;
      for (let i = 0; i < 4; i++) {
        const ly = 8 + i * 12;
        const lx = dir * (12 - i * 2);
        ctx.save();
        ctx.translate(lx, ly);
        ctx.rotate(dir * (0.3 - i * 0.15));
        ctx.beginPath();
        ctx.ellipse(0, 0, 10, 4, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
      ctx.restore();
    };
    drawLaurel(-1);
    drawLaurel(1);

    // ===== Circular seal with gradient and embossed look =====
    const sealGrad = ctx.createRadialGradient(W / 2 - 10, sealY - 10, 5, W / 2, sealY, sealR);
    sealGrad.addColorStop(0, theme.accent);
    sealGrad.addColorStop(1, `rgba(${theme.accentRgb}, 0.85)`);
    ctx.fillStyle = sealGrad;
    ctx.beginPath();
    ctx.arc(W / 2, sealY, sealR, 0, Math.PI * 2);
    ctx.fill();

    // Seal outer ring
    ctx.strokeStyle = '#FFF9EF';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(W / 2, sealY, sealR - 6, 0, Math.PI * 2);
    ctx.stroke();

    // Seal inner ring
    ctx.strokeStyle = `rgba(255,249,239,0.4)`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(W / 2, sealY, sealR - 12, 0, Math.PI * 2);
    ctx.stroke();

    // Seal text — "FB" monogram
    ctx.fillStyle = '#FFF9EF';
    ctx.font = 'bold 38px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('FB', W / 2, sealY + 2);

    // ===== Brand name and tagline =====
    ctx.fillStyle = '#192820';
    ctx.font = 'bold 24px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('FoodBridge', W / 2, sealY + 72);
    ctx.fillStyle = 'rgba(25,40,32,0.45)';
    ctx.font = '400 13px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('TURNING SURPLUS INTO SMILES', W / 2, sealY + 92);

    // ===== Ornamental divider with center diamond =====
    const drawOrnamentLine = (y: number, width: number) => {
      const cx = W / 2;
      // Left line
      ctx.strokeStyle = `rgba(${theme.accentRgb}, 0.35)`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(cx - width / 2, y);
      ctx.lineTo(cx - 25, y);
      ctx.stroke();
      // Right line
      ctx.beginPath();
      ctx.moveTo(cx + 25, y);
      ctx.lineTo(cx + width / 2, y);
      ctx.stroke();
      // Center diamond
      ctx.fillStyle = theme.accent;
      ctx.beginPath();
      ctx.moveTo(cx, y - 5);
      ctx.lineTo(cx + 6, y);
      ctx.lineTo(cx, y + 5);
      ctx.lineTo(cx - 6, y);
      ctx.closePath();
      ctx.fill();
      // Small dots on each side
      ctx.fillStyle = `rgba(${theme.accentRgb}, 0.4)`;
      ctx.beginPath();
      ctx.arc(cx - 18, y, 2, 0, Math.PI * 2);
      ctx.arc(cx + 18, y, 2, 0, Math.PI * 2);
      ctx.fill();
    };

    // ===== Certificate title =====
    const titleY = sealY + 135;
    ctx.fillStyle = '#192820';
    ctx.font = 'bold 46px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('Certificate of Impact', W / 2, titleY);

    // Role subtitle in accent color
    ctx.fillStyle = theme.accent;
    ctx.font = 'bold 16px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(theme.label.toUpperCase(), W / 2, titleY + 30);

    // Ornamental divider under title
    drawOrnamentLine(titleY + 50, 200);

    // ===== "This is proudly presented to" =====
    ctx.fillStyle = 'rgba(25,40,32,0.5)';
    ctx.font = 'italic 400 18px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('This certificate is proudly presented to', W / 2, titleY + 85);

    // ===== Name — the hero element =====
    const displayName = name.trim() || 'Your Name';
    ctx.fillStyle = '#192820';
    ctx.font = 'bold 52px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(displayName, W / 2, titleY + 140);

    // Elegant name underline with flourishes
    const nameWidth = ctx.measureText(displayName).width;
    const ulY = titleY + 170;
    const ulLeft = W / 2 - nameWidth / 2 - 30;
    const ulRight = W / 2 + nameWidth / 2 + 30;

    // Main underline
    ctx.strokeStyle = theme.accent;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(ulLeft, ulY);
    ctx.lineTo(ulRight, ulY);
    ctx.stroke();

    // Decorative end flourishes on underline
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(ulLeft, ulY);
    ctx.quadraticCurveTo(ulLeft - 12, ulY - 6, ulLeft - 15, ulY);
    ctx.moveTo(ulRight, ulY);
    ctx.quadraticCurveTo(ulRight + 12, ulY - 6, ulRight + 15, ulY);
    ctx.stroke();

    // Small dots at underline ends
    ctx.fillStyle = theme.accent;
    ctx.beginPath();
    ctx.arc(ulLeft - 18, ulY, 3, 0, Math.PI * 2);
    ctx.arc(ulRight + 18, ulY, 3, 0, Math.PI * 2);
    ctx.fill();

    // ===== Description text =====
    ctx.fillStyle = 'rgba(25,40,32,0.55)';
    ctx.font = '400 16px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('in recognition of their outstanding contribution to reducing food waste', W / 2, ulY + 38);
    ctx.fillText('and helping communities in need through the FoodBridge platform.', W / 2, ulY + 60);

    // ===== Milestone stats with elegant cards =====
    const milestones = MILESTONES[role];
    const statY = ulY + 115;
    const cardW = 200;
    const cardH = 90;
    const gap = 20;
    const totalW = cardW * 3 + gap * 2;
    const startX = W / 2 - totalW / 2;

    milestones.forEach((m, i) => {
      const cx = startX + i * (cardW + gap);
      // Card background
      ctx.fillStyle = `rgba(${theme.accentRgb}, 0.06)`;
      ctx.beginPath();
      ctx.roundRect(cx, statY, cardW, cardH, 12);
      ctx.fill();
      // Card top accent line
      ctx.strokeStyle = theme.accent;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(cx + 20, statY);
      ctx.lineTo(cx + cardW - 20, statY);
      ctx.stroke();
      // Stat value
      ctx.fillStyle = '#192820';
      ctx.font = 'bold 26px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(m.value, cx + cardW / 2, statY + 42);
      // Stat label
      ctx.fillStyle = 'rgba(25,40,32,0.45)';
      ctx.font = '600 11px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(m.label.toUpperCase(), cx + cardW / 2, statY + 65);
    });

    // ===== Date with ornament =====
    const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    ctx.fillStyle = 'rgba(25,40,32,0.45)';
    ctx.font = '400 15px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    drawOrnamentLine(statY + cardH + 30, 160);
    ctx.fillText(`Issued on ${dateStr}`, W / 2, statY + cardH + 55);

    // ===== Signature area =====
    const sigY = H - 120;

    // Left signature
    ctx.strokeStyle = 'rgba(25,40,32,0.25)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(W / 2 - 210, sigY);
    ctx.lineTo(W / 2 - 50, sigY);
    ctx.stroke();

    // Signature in script-like style
    ctx.fillStyle = '#192820';
    ctx.font = 'italic bold 22px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('FoodBridge', W / 2 - 200, sigY - 8);
    ctx.fillStyle = 'rgba(25,40,32,0.45)';
    ctx.font = '400 11px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('AUTHORIZED SIGNATURE', W / 2 - 200, sigY + 18);

    // Right — certificate ID with decorative box
    const certId = `FB-${Date.now().toString(36).toUpperCase().slice(-8)}`;
    ctx.strokeStyle = `rgba(${theme.accentRgb}, 0.3)`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(W / 2 + 50, sigY - 25, 160, 38, 8);
    ctx.stroke();

    ctx.fillStyle = '#192820';
    ctx.font = 'bold 14px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Certificate ID', W / 2 + 130, sigY - 10);
    ctx.fillStyle = `rgba(${theme.accentRgb}, 1)`;
    ctx.font = 'bold 13px monospace';
    ctx.fillText(certId, W / 2 + 130, sigY + 7);

    // ===== Verification QR-style square =====
    const qrX = W - 110;
    const qrY = H - 110;
    const qrSize = 30;
    ctx.fillStyle = '#192820';
    ctx.fillRect(qrX, qrY, qrSize, qrSize);
    ctx.fillStyle = '#FFF9EF';
    // Simple QR-like pattern
    for (let r = 0; r < 5; r++) {
      for (let c = 0; c < 5; c++) {
        if ((r + c) % 2 === 0 || (r === 0 && c < 2) || (r === 4 && c > 2)) {
          ctx.fillRect(qrX + 3 + c * 5, qrY + 3 + r * 5, 4, 4);
        }
      }
    }
    ctx.fillStyle = 'rgba(25,40,32,0.35)';
    ctx.font = '400 9px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('VERIFY', qrX + qrSize / 2, qrY + qrSize + 14);

    // ===== Demo watermark =====
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(25,40,32,0.12)';
    ctx.font = '500 11px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('Illustrative prototype certificate — sample milestone data', W / 2, H - 40);
  }, [name, role]);

  const generate = () => {
    if (!name.trim()) {
      setError('Please enter your name to generate your certificate.');
      return;
    }
    if (name.trim().length < 2) {
      setError('Please enter a valid name (at least 2 characters).');
      return;
    }
    setError('');
    setGenerated(true);
    requestAnimationFrame(drawCertificate);
  };

  const download = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `FoodBridge-Certificate-${name.trim().replace(/\s+/g, '-')}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const milestones = MILESTONES[role];
  const theme = ROLE_THEMES[role];

  return (
    <Reveal delay={0.1} className="mt-6 overflow-hidden rounded-4xl bg-white shadow-premium lg:col-span-3">
      <div className="grid lg:grid-cols-2">
        {/* Left — controls */}
        <div className="p-8 sm:p-10">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange/15">
              <Award className="h-6 w-6 text-orange-dark" />
            </div>
            <div>
              <span className="text-sm font-bold uppercase tracking-wider text-forest">Impact Certificate</span>
              <h3 className="text-2xl font-extrabold text-dark">Claim Your Milestone Summary</h3>
            </div>
          </div>

          <p className="mt-5 text-dark/60">
            Enter your name and role to generate a personalized impact certificate celebrating your contribution to fighting food waste. Download it as a shareable image.
          </p>

          {/* Role selector */}
          <div className="mt-7">
            <label className="text-sm font-semibold text-dark/80">I am a...</label>
            <div className="mt-2 grid grid-cols-2 gap-3">
              {(Object.keys(ROLE_THEMES) as Role[]).map((r) => {
                const t = ROLE_THEMES[r];
                const active = role === r;
                return (
                  <button
                    key={r}
                    onClick={() => { setRole(r); setGenerated(false); }}
                    className={`flex items-center gap-3 rounded-2xl border-2 p-4 text-left transition ${
                      active ? 'border-transparent bg-forest/5' : 'border-dark/10 hover:border-dark/20'
                    }`}
                    style={active ? { boxShadow: `inset 0 0 0 2px ${t.accent}` } : {}}
                  >
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-xl"
                      style={{ backgroundColor: t.accent }}
                    >
                      {r === 'donor' ? <Utensils className="h-5 w-5 text-white" /> : <Heart className="h-5 w-5 text-white" />}
                    </div>
                    <div>
                      <div className="text-sm font-extrabold text-dark">{t.label}</div>
                    </div>
                    {active && <CheckCircle2 className="ml-auto h-5 w-5" style={{ color: t.accent }} />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Name input */}
          <div className="mt-6">
            <label className="text-sm font-semibold text-dark/80">Your Name</label>
            <div className="mt-2 flex items-center gap-3 rounded-2xl border-2 border-dark/15 bg-cream/40 px-4 py-3.5 focus-within:border-forest">
              <User className="h-5 w-5 text-dark/40" />
              <input
                type="text"
                value={name}
                onChange={(e) => { setName(e.target.value); setError(''); setGenerated(false); }}
                onKeyDown={(e) => e.key === 'Enter' && generate()}
                placeholder="e.g. Sarah Mitchell"
                maxLength={40}
                className="flex-1 bg-transparent text-base text-dark placeholder:text-dark/30 focus:outline-none"
              />
            </div>
            {error && <p className="mt-2 text-sm text-orange-dark">{error}</p>}
          </div>

          {/* Milestone preview */}
          <div className="mt-6 rounded-2xl bg-cream/50 p-4">
            <p className="mb-3 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-dark/50">
              <Sparkles className="h-3.5 w-3.5" /> Your milestones
            </p>
            <div className="grid grid-cols-3 gap-3">
              {milestones.map((m, i) => {
                const Icon = m.icon;
                return (
                  <div key={i} className="text-center">
                    <div
                      className="mx-auto flex h-9 w-9 items-center justify-center rounded-lg"
                      style={{ backgroundColor: `rgba(${theme.accentRgb}, 0.12)` }}
                    >
                      <Icon className="h-4.5 w-4.5" style={{ color: theme.accent }} />
                    </div>
                    <div className="mt-2 text-lg font-extrabold text-dark">{m.value}</div>
                    <div className="text-[10px] font-semibold uppercase tracking-wide text-dark/40">{m.label}</div>
                  </div>
                );
              })}
            </div>
            <p className="mt-3 text-center text-[11px] text-dark/35">Sample milestone data for prototype demonstration</p>
          </div>

          {/* Buttons */}
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={generate}
              className="flex flex-1 items-center justify-center gap-2 rounded-full bg-forest py-4 font-bold text-cream shadow-lg shadow-forest/25"
            >
              <Award className="h-5 w-5" />
              {generated ? 'Regenerate Certificate' : 'Generate Certificate'}
            </motion.button>
            <motion.button
              whileHover={{ scale: generated ? 1.03 : 1 }}
              whileTap={{ scale: generated ? 0.97 : 1 }}
              onClick={download}
              disabled={!generated}
              className={`flex flex-1 items-center justify-center gap-2 rounded-full py-4 font-bold transition ${
                generated
                  ? 'bg-gradient-to-r from-orange to-orange-dark text-white shadow-lg shadow-orange/30'
                  : 'cursor-not-allowed bg-dark/5 text-dark/30'
              }`}
            >
              <Download className="h-5 w-5" />
              Download PNG
            </motion.button>
          </div>
        </div>

        {/* Right — certificate preview */}
        <div className="relative flex items-center justify-center border-t border-dark/5 bg-gradient-to-br from-cream-dark/40 to-fresh-light/30 p-6 lg:border-l lg:border-t-0 sm:p-8">
          <AnimatePresence mode="wait">
            {!generated ? (
              <motion.div
                key="placeholder"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center text-center"
              >
                <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-white shadow-premium">
                  <Award className="h-12 w-12 text-forest/30" />
                </div>
                <p className="mt-6 max-w-xs text-dark/50">
                  Your personalized certificate preview will appear here once you generate it.
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="certificate"
                initial={{ opacity: 0, scale: 0.92, rotateY: 10 }}
                animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                transition={{ duration: 0.7, ease: easeOutExpo }}
                className="w-full"
              >
                <canvas
                  ref={canvasRef}
                  className="w-full rounded-2xl shadow-float"
                  style={{ aspectRatio: '1200 / 850' }}
                />
                <p className="mt-3 text-center text-xs text-dark/40">
                  Preview of your certificate — click Download PNG to save it
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </Reveal>
  );
}
