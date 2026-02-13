import { useState, useRef, useCallback } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import {
  Wifi,
  WifiOff,
  Download,
  Printer,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  CheckCircle2,
  ShieldCheck,
  Smartphone,
} from 'lucide-react';

/* ─── Types ─── */
type SecurityType = 'WPA' | 'WEP' | 'nopass';

interface WifiFormData {
  ssid: string;
  password: string;
  security: SecurityType;
  hidden: boolean;
}

/* ─────────────────────────────────────────────
 * Gera a string padrão que dispositivos leem
 * ao escanear o QR Code Wi-Fi.
 *
 * Formato: WIFI:S:<SSID>;T:<WPA|WEP|nopass>;P:<PASSWORD>;H:<true|false>;;
 *
 * - Caracteres especiais no SSID e senha são escapados.
 * - Se a segurança for "nopass", o campo P é omitido.
 * - H recebe true/false conforme rede oculta.
 * ───────────────────────────────────────────── */
function buildWifiString({ ssid, password, security, hidden }: WifiFormData): string {
  const esc = (s: string) => s.replace(/([\\;,:"'])/g, '\\$1');

  let str = `WIFI:S:${esc(ssid)};T:${security};`;
  if (security !== 'nopass') {
    str += `P:${esc(password)};`;
  }
  str += `H:${hidden};;`;
  return str;
}

/* ─── Component ─── */
export default function WifiQrGenerator() {
  const [form, setForm] = useState<WifiFormData>({
    ssid: '',
    password: '',
    security: 'WPA',
    hidden: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const qrRef = useRef<HTMLDivElement>(null);

  const wifiString = buildWifiString(form);
  const isOpen = form.security === 'nopass';
  const hasSSID = form.ssid.trim().length > 0;

  /* Atualiza campos do formulário */
  const updateField = useCallback(
    <K extends keyof WifiFormData>(key: K, value: WifiFormData[K]) => {
      setForm((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  /* ── Baixar PNG ── */
  const handleDownload = useCallback(() => {
    const canvas = qrRef.current?.querySelector('canvas');
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = `wifi-${form.ssid || 'qrcode'}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();

    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 2500);
  }, [form.ssid]);

  /* ── Imprimir via @media print ── */
  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 bg-zinc-950">
      {/* ── Background glow ── */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden print:hidden">
        <div className="absolute -top-60 -left-60 w-[600px] h-[600px] rounded-full bg-amber-500/[0.04] blur-[150px]" />
        <div className="absolute -bottom-60 -right-60 w-[600px] h-[600px] rounded-full bg-amber-600/[0.03] blur-[150px]" />
      </div>

      <div className="relative w-full max-w-4xl">
        {/* ── Card Principal ── */}
        <div className="relative rounded-3xl border border-amber-700/20 bg-zinc-900 shadow-[0_8px_60px_-12px_rgba(217,169,79,0.12)] overflow-hidden">
          {/* Shimmer top */}
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-amber-400/25 to-transparent" />

          <div className="grid grid-cols-1 md:grid-cols-2">
            {/* ════════════ COLUNA ESQUERDA — Painel de Controle ════════════ */}
            <div className="p-6 sm:p-8 md:border-r border-amber-700/10 print:hidden">
              {/* Header */}
              <div className="flex items-center gap-3 mb-7">
                <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/20">
                  <Wifi className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-white tracking-tight">
                    Wifly
                  </h1>
                  <p className="text-xs text-zinc-500">Gerador de QR Code Wi-Fi</p>
                </div>
              </div>

              {/* Form */}
              <div className="space-y-5">
                {/* SSID */}
                <div className="space-y-1.5">
                  <label htmlFor="ssid" className="block text-sm font-medium text-zinc-400">
                    Nome da Rede (SSID)
                  </label>
                  <div className="relative">
                    <input
                      id="ssid"
                      type="text"
                      placeholder="Ex: MinhaRede_5G"
                      value={form.ssid}
                      onChange={(e) => updateField('ssid', e.target.value)}
                      className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 pl-11 text-sm text-white placeholder-zinc-600 outline-none transition-all focus:border-amber-500/40 focus:ring-2 focus:ring-amber-500/10"
                    />
                    <Wifi className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                  </div>
                </div>

                {/* Security */}
                <div className="space-y-1.5">
                  <label htmlFor="security" className="block text-sm font-medium text-zinc-400">
                    Segurança
                  </label>
                  <div className="relative">
                    <select
                      id="security"
                      value={form.security}
                      onChange={(e) => updateField('security', e.target.value as SecurityType)}
                      className="w-full appearance-none rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 pl-11 pr-10 text-sm text-white outline-none transition-all focus:border-amber-500/40 focus:ring-2 focus:ring-amber-500/10 cursor-pointer"
                    >
                      <option value="WPA" className="bg-zinc-900 text-white">WPA / WPA2</option>
                      <option value="WEP" className="bg-zinc-900 text-white">WEP</option>
                      <option value="nopass" className="bg-zinc-900 text-white">Aberta (sem senha)</option>
                    </select>
                    <ShieldCheck className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                    <svg className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>

                {/* Password */}
                <div className={`space-y-1.5 transition-all duration-300 ${isOpen ? 'opacity-0 max-h-0 overflow-hidden !mt-0' : 'opacity-100 max-h-24'}`}>
                  <label htmlFor="password" className="block text-sm font-medium text-zinc-400">
                    Senha
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={form.password}
                      onChange={(e) => updateField('password', e.target.value)}
                      className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 pl-11 pr-11 text-sm text-white placeholder-zinc-600 outline-none transition-all focus:border-amber-500/40 focus:ring-2 focus:ring-amber-500/10"
                    />
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                    <button
                      type="button"
                      aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-zinc-500 hover:text-zinc-300 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Hidden network toggle */}
                <div className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3">
                  <div className="flex items-center gap-3">
                    {form.hidden ? (
                      <WifiOff className="w-4 h-4 text-zinc-500" />
                    ) : (
                      <Wifi className="w-4 h-4 text-zinc-500" />
                    )}
                    <span className="text-sm text-zinc-400">Rede oculta</span>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={form.hidden}
                    onClick={() => updateField('hidden', !form.hidden)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
                      form.hidden ? 'bg-amber-500' : 'bg-zinc-700'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition-transform duration-200 ${
                        form.hidden ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* ════════════ COLUNA DIREITA — Zona de Resultado Estável ════════════ */}
            <div className="flex flex-col min-h-[460px] p-6 sm:p-8">
              {/* QR Code — Topo */}
              <div className="flex-1 flex items-center justify-center" id="printable-zone">
                <div className="flex flex-col items-center">
                  <div
                    ref={qrRef}
                    className="relative rounded-2xl bg-white p-5 shadow-lg shadow-black/20 ring-1 ring-amber-400/10"
                  >
                    <QRCodeCanvas
                      value={hasSSID ? wifiString : 'WIFI:S:;T:nopass;;'}
                      size={220}
                      level="M"
                      marginSize={1}
                      bgColor="#ffffff"
                      fgColor="#18181b"
                    />
                    {/* Overlay quando vazio */}
                    {!hasSSID && (
                      <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-white/85 backdrop-blur-sm">
                        <p className="text-xs text-zinc-400 font-medium text-center px-4 leading-relaxed">
                          Digite o nome da rede<br />para gerar o QR Code
                        </p>
                      </div>
                    )}
                  </div>

                  {/* ── Badge de informações (espaço fixo reservado) ── */}
                  <div className="h-14 flex items-center justify-center mt-4">
                    {hasSSID ? (
                      <div className="flex items-center gap-2 rounded-full bg-white/[0.04] border border-white/[0.06] px-4 py-1.5 animate-fade-in">
                        {isOpen ? (
                          <Unlock className="w-3.5 h-3.5 text-amber-400" />
                        ) : (
                          <Lock className="w-3.5 h-3.5 text-amber-400" />
                        )}
                        <span className="text-xs text-zinc-400">
                          {form.ssid}
                          <span className="text-zinc-600 mx-1.5">•</span>
                          {isOpen ? 'Aberta' : form.security}
                          {form.hidden && (
                            <>
                              <span className="text-zinc-600 mx-1.5">•</span>
                              Oculta
                            </>
                          )}
                        </span>
                      </div>
                    ) : null}
                  </div>

                  {/* Print-only: info for printed page */}
                  <div className="hidden print:block text-center mt-2">
                    <h2 className="text-lg font-semibold text-zinc-900">{form.ssid}</h2>
                    {!isOpen && form.password && (
                      <p className="text-sm text-zinc-600 mt-1">Senha: {form.password}</p>
                    )}
                    <p className="text-xs text-zinc-400 mt-2">
                      Escaneie o QR Code para conectar-se automaticamente.
                    </p>
                  </div>
                </div>
              </div>

              {/* ── Botões de ação — Base ancorada ── */}
              <div className="flex gap-3 pt-4 print:hidden">
                <button
                  onClick={handleDownload}
                  disabled={!hasSSID}
                  className={`group flex-1 flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer ${
                    downloadSuccess
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25'
                      : 'bg-amber-600 text-white hover:bg-amber-500 active:scale-[0.98]'
                  }`}
                >
                  {downloadSuccess ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      Salvo!
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 transition-transform group-hover:-translate-y-0.5" />
                      Baixar PNG
                    </>
                  )}
                </button>

                <button
                  onClick={handlePrint}
                  disabled={!hasSSID}
                  className="group flex-1 flex items-center justify-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-sm font-medium text-zinc-300 transition-all duration-200 hover:bg-white/[0.07] hover:border-white/[0.12] active:scale-[0.98] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                >
                  <Printer className="w-4 h-4 transition-transform group-hover:-translate-y-0.5" />
                  Imprimir
                </button>
              </div>
            </div>
          </div>

          {/* ── Footer ── */}
          <div className="border-t border-amber-700/10 px-6 sm:px-8 py-3 flex items-center justify-center gap-2 print:hidden">
            <Smartphone className="w-3.5 h-3.5 text-zinc-600" />
            <p className="text-[11px] text-zinc-600">
              Gera código compatível com iOS e Android
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
