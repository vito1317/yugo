
import React, { useEffect, useRef, useState } from 'react';
import { UserProfile, UserRole, UserStatus } from '../types';
import { Loader2, ExternalLink, Copy, Check, Info, ShieldCheck, AlertTriangle, Settings2, Globe } from 'lucide-react';

interface LoginViewProps {
  onLogin: (user: UserProfile) => void;
}

// 用戶提供的新 OAuth 2.0 用戶端 ID
const GOOGLE_CLIENT_ID = "864217313350-k843mks8qe2bmi6di7ebev9tsnt5tjj7.apps.googleusercontent.com"; 

const LoginView: React.FC<LoginViewProps> = ({ onLogin }) => {
  const [error, setError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [showTroubleshooter, setShowTroubleshooter] = useState(false);
  const [copiedOrigin, setCopiedOrigin] = useState(false);
  const [copiedId, setCopiedId] = useState(false);
  const buttonRef = useRef<HTMLDivElement>(null);

  const currentOrigin = window.location.origin;

  const copyToClipboard = (text: string, setter: (v: boolean) => void) => {
    navigator.clipboard.writeText(text);
    setter(true);
    setTimeout(() => setter(false), 2000);
  };

  const parseJwt = (token: string) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload);
    } catch (e) {
      return null;
    }
  };

  const handleCallbackResponse = (response: any) => {
    const payload = parseJwt(response.credential);
    if (payload) {
      const profile: UserProfile = {
        id: payload.sub,
        name: payload.name,
        email: payload.email,
        picture: payload.picture,
        role: UserRole.USER,
        status: UserStatus.ACTIVE,
        points: 100,
        joinedAt: Date.now()
      };
      onLogin(profile);
    } else {
      setError("無法解析身分資訊，請再試一次。");
    }
  };

  useEffect(() => {
    let renderTimeout: number;
    const tryRenderButton = () => {
      const google = (window as any).google;
      if (google?.accounts?.id && buttonRef.current) {
        try {
          google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID.trim(),
            callback: handleCallbackResponse,
            auto_select: false,
            // 監聽詳細錯誤
            error_callback: (err: any) => {
                console.error("GSI Error:", err);
                if (err.type === 'origin_mismatch') {
                  setError("網址來源不符 (origin_mismatch)");
                  setShowTroubleshooter(true); // 自動展開診斷工具
                } else {
                  setError(`登入錯誤: ${err.type}`);
                }
            }
          });
          google.accounts.id.renderButton(buttonRef.current, {
            type: "standard", 
            theme: "outline", 
            size: "large", 
            text: "signin_with", 
            shape: "pill", 
            width: 300,
          });
          setIsInitializing(false);
        } catch (err) {
          console.error("Google Auth Init Error:", err);
          setError("Google 登入元件初始化失敗");
          setIsInitializing(false);
        }
      } else {
        renderTimeout = window.setTimeout(tryRenderButton, 300);
      }
    };
    tryRenderButton();
    return () => clearTimeout(renderTimeout);
  }, []);

  return (
    <div className="h-screen flex flex-col items-center justify-center p-6 bg-[#FBFCFA] overflow-y-auto">
      <div className="w-full max-w-sm flex flex-col items-center gap-8 py-10">
        
        {/* Logo */}
        <div className="flex flex-col items-center gap-6">
          <div className="w-20 h-20 bg-emerald-600 rounded-[1.8rem] flex items-center justify-center text-white shadow-xl rotate-2">
            <span className="text-4xl font-black">果</span>
          </div>
          <div className="text-center">
            <h1 className="text-3xl font-black text-slate-900 tracking-tighter mb-1">有果 YUGO</h1>
            <p className="text-emerald-600 text-[10px] font-black tracking-[0.4em] uppercase opacity-80">做的事終將結果</p>
          </div>
        </div>

        {/* Auth Section */}
        <div className="w-full flex flex-col items-center gap-6">
          {isInitializing && (
            <div className="flex flex-col items-center gap-3 text-slate-400 py-4">
              <Loader2 className="animate-spin text-emerald-500" size={24} />
              <span className="text-[10px] font-black uppercase tracking-widest">載入安全登入元件...</span>
            </div>
          )}

          <div 
            ref={buttonRef} 
            className={`transition-all duration-700 min-h-[44px] flex justify-center ${isInitializing ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`} 
          />

          {/* Error Message */}
          {error && (
            <div className="flex flex-col gap-3 w-full max-w-[300px]">
              <div className="text-rose-600 text-[11px] font-bold bg-rose-50 px-4 py-4 rounded-2xl border border-rose-100 flex flex-col gap-2">
                <div className="flex items-start gap-2">
                  <AlertTriangle size={16} className="shrink-0 text-rose-500" />
                  <span>{error}</span>
                </div>
                <p className="text-[10px] text-rose-400 font-medium leading-relaxed pl-6">
                  這是常見的配置問題，請參考下方的「診斷工具」修復 Google 控制台設定。
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Troubleshooting Guide */}
        <div className="w-full mt-4">
          <button 
            onClick={() => setShowTroubleshooter(!showTroubleshooter)}
            className={`w-full flex items-center justify-center gap-2 transition-colors text-[10px] font-black uppercase tracking-widest py-3 rounded-xl border ${
              error ? 'bg-amber-50 text-amber-700 border-amber-200 animate-pulse' : 'text-slate-400 border-transparent hover:text-emerald-600'
            }`}
          >
            <Settings2 size={14} /> {showTroubleshooter ? '隱藏診斷工具' : '修復 Google 登入 (400 錯誤)'}
          </button>

          {showTroubleshooter && (
            <div className="mt-4 bg-white border-2 border-emerald-100 rounded-3xl p-6 shadow-xl w-full animate-in fade-in zoom-in-95">
              <div className="flex items-center gap-2 text-emerald-800 font-black text-xs mb-6">
                <ShieldCheck size={18} />
                <span>Google Cloud 控制台修復清單</span>
              </div>
              
              <div className="space-y-6">
                {/* 1. Client ID */}
                <div className="space-y-2">
                  <p className="text-[10px] font-black text-slate-400 uppercase flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-slate-100 flex items-center justify-center text-[8px] text-slate-500">1</span>
                    確認 OAuth 用戶端 ID
                  </p>
                  <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl p-3 gap-2 overflow-hidden">
                    <code className="text-[10px] text-slate-500 font-mono truncate flex-1">{GOOGLE_CLIENT_ID}</code>
                    <button onClick={() => copyToClipboard(GOOGLE_CLIENT_ID, setCopiedId)} className="shrink-0 p-2 hover:bg-white rounded-lg transition-all shadow-sm">
                      {copiedId ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} className="text-slate-400" />}
                    </button>
                  </div>
                </div>

                {/* 2. JavaScript Origins - THE FIX */}
                <div className="space-y-2">
                  <p className="text-[10px] font-black text-amber-600 uppercase flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-amber-100 flex items-center justify-center text-[8px] text-amber-600">2</span>
                    必填：已授權的 JavaScript 來源
                  </p>
                  <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-xl p-3 gap-2 overflow-hidden shadow-sm">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <Globe size={12} className="text-emerald-500 shrink-0" />
                      <code className="text-[10px] text-emerald-700 font-bold truncate">{currentOrigin}</code>
                    </div>
                    <button onClick={() => copyToClipboard(currentOrigin, setCopiedOrigin)} className="shrink-0 p-2 bg-emerald-600 text-white rounded-lg transition-all hover:bg-emerald-700 active:scale-95">
                      {copiedOrigin ? <Check size={14} /> : <Copy size={14} />}
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-500 font-medium leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100 mt-2">
                    請複製上方 <span className="text-emerald-600 font-bold">綠色區塊</span> 的網址，前往 Google 控制台貼到「已授權的 JavaScript 來源」。
                  </p>
                </div>

                <div className="h-px bg-slate-100 my-4" />

                <a 
                  href="https://console.cloud.google.com/apis/credentials" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-4 bg-emerald-600 text-white rounded-2xl text-xs font-black hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100 active:scale-95"
                >
                  前往 Google 控制台設定 <ExternalLink size={14} />
                </a>
                
                <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-2xl border border-blue-100">
                  <Info size={16} className="text-blue-500 shrink-0 mt-0.5" />
                  <p className="text-[10px] text-blue-800 font-bold leading-relaxed">
                    完成設定後，請務必點擊「儲存」，並等待約 5-10 分鐘讓 Google 全球伺服器同步。
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center opacity-30 mt-auto">
          <p className="text-[9px] text-slate-400 font-black uppercase tracking-[0.2em] leading-relaxed">
            人生清單遊戲化 · 社區支持型農業<br/>誠實努力 · 終會有果
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginView;
