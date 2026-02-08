import { useState } from 'react';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from "jwt-decode";

// initial onboarding component
interface OnboardingProps {
  onComplete: (data: { name: string; year: string; gender: string; height: string; weight: string }) => void;
}

const CHARACTERS = [
  { id: 'duck', name: '鴨子', file: '/duck.glb', img: '🦆', scale: 1},
  { id: 'robot', name: '科技機器人', file: '/robot.glb', img: '🤖', scale: 2 },
];

// Onboarding component to collect user data
export default function Onboarding({ onComplete }: OnboardingProps) {
  const [formData, setFormData] = useState({ name: '', year: '', gender: '', height: '', weight: '', character: 'duck'});

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault(); // Prevent default form submission behavior
    if (formData.name && formData.height && formData.weight) {
      onComplete(formData); // store data and proceed
    }
  };

  const handleGoogleSuccess = (credentialResponse: any) => {
    // 1. 解碼 Google 資料
    const decoded: any = jwtDecode(credentialResponse.credential);
    console.log('Google Profile:', decoded);

    // 2. 只更新「名字」，保留其他欄位讓使用者自己填
    // 我們使用 Functional Update (prev => ...) 以確保不會蓋掉使用者剛剛選的角色
    setFormData(prev => ({
      ...prev,
      name: decoded.name || prev.name, // 如果 Google 有名字就用，沒有就維持原樣
    }));

    // 3. 提示使用者 (可選，看你想不想加)
    alert(`歡迎 ${decoded.name}！請繼續填寫您的身高與體重資料。`);
    
  };

  const handleGoogleFailure = () => {
    console.error('Google Login Failed');
  };

  return (
    // 1. 清透的藍色
    <div className="absolute inset-0 z-50 bg-gradient-to-b from-sky-200 via-green-100 via-green-120 flex flex-col items-center justify-center p-6 animate-in fade-in duration-700 font-sans">
      
      {/* 2. 卡片變更圓 (rounded-3xl)，加上半透明毛玻璃效果 (backdrop-blur) */}
      <div className="w-full max-w-md bg-white/80 backdrop-blur-md rounded-[2rem] shadow-2xl shadow-green-900/10 p-8 border-2 border-white ring-4 ring-green-50/50">
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-green-800 mb-2 tracking-tight">
            <span className="inline-block animate-bounce">🌱</span> Walk & Live
          </h1>
          <p className="font-medium" style={{ color: '#1e6057' }}>建立您的虛擬分身</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            
            <label className="block text-sm font-medium text-slate-700 mb-1">暱稱</label>
            <input 
              type="text" 
              required
              className="w-full px-6 py-3 rounded-full border-2 border-slate-100 bg-slate-50 text-slate-800 placeholder-slate-400 focus:bg-white focus:border-green-400 focus:ring-4 focus:ring-green-100 outline-none transition-all duration-300 font-bold shadow-sm text-center"
              placeholder="例如：王小明"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">年齡</label>
              <input 
                type="number" 
                required
                className="w-full px-6 py-3 rounded-full border-2 border-slate-100 bg-slate-50 text-slate-800 placeholder-slate-400 focus:bg-white focus:border-green-400 focus:ring-4 focus:ring-green-100 outline-none transition-all duration-300 font-bold shadow-sm text-center"
                placeholder="30"
                value={formData.year}
                onChange={e => setFormData({...formData, year: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">性別</label>
              <div className="relative">
                <select
                  required
                  className="w-full px-6 py-3 rounded-full border-2 border-slate-100 bg-slate-50 text-slate-800 placeholder-slate-400 focus:bg-white focus:border-green-400 focus:ring-4 focus:ring-green-100 outline-none transition-all duration-300 font-bold shadow-sm text-center"
                  value={formData.gender}
                  onChange={e => setFormData({ ...formData, gender: e.target.value })}
                >
                  <option value="" disabled>請選擇性別</option>
                  <option value="male">男</option>
                  <option value="female">女</option>
                  <option value="other">不透露</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                  ▼
                </div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">身高 (cm)</label>
              <input 
                type="number" 
                required
                className="w-full px-6 py-3 rounded-full border-2 border-slate-100 bg-slate-50 text-slate-800 placeholder-slate-400 focus:bg-white focus:border-green-400 focus:ring-4 focus:ring-green-100 outline-none transition-all duration-300 font-bold shadow-sm text-center"
                placeholder="170"
                value={formData.height}
                onChange={e => setFormData({...formData, height: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">體重 (kg)</label>
              <input 
                type="number" 
                required
                className="w-full px-6 py-3 rounded-full border-2 border-slate-100 bg-slate-50 text-slate-800 placeholder-slate-400 focus:bg-white focus:border-green-400 focus:ring-4 focus:ring-green-100 outline-none transition-all duration-300 font-bold shadow-sm text-center"
                placeholder="60"
                value={formData.weight}
                onChange={e => setFormData({...formData, weight: e.target.value})}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">選擇你的虛擬分身</label>
            <div className="grid grid-cols-3 gap-3">
              {CHARACTERS.map((char) => {
                const isSelected = formData.character === char.id;
                return (
                <button
                  key={char.id}
                  type="button"
                  onClick={() => setFormData({ ...formData, character: char.id })}
                  // 下面這裡改最多：加入 group 屬性和動態陰影
                  className={`relative group p-4 rounded-2xl border-2 transition-all duration-300 flex flex-col items-center gap-2 overflow-hidden
                    ${isSelected 
                      ? 'border-lime-400 bg-gradient-to-br from-lime-100 to-yellow-50 shadow-[0_0_20px_rgba(163,230,53,0.6)] scale-[1.02]' 
                      : 'border-green-100 bg-white/50 hover:border-green-300 hover:bg-green-50'
                    }`}
                >
                  {/* 圖示變大，選中時會跳動 (animate-bounce) */}
                  <div className={`text-4xl drop-shadow-md transition-transform duration-300 ${isSelected ? 'animate-bounce' : 'group-hover:scale-110'}`}>
                    {char.img}
                  </div>
                  <span className={`text-sm font-bold transition-colors ${isSelected ? 'text-green-800' : 'text-green-600'}`}>
                    {char.name}
                  </span>
                </button>
              )})}
            </div>
          </div>
          
          <div className="text-center mt-6">
            <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ''}>
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleFailure}
              />
            </GoogleOAuthProvider>
          </div>
          <button 
            type="submit"
            className="w-full mt-6 bg-gradient-to-r from-lime-700 to-green-600 text-white font-extrabold text-lg py-4 rounded-full shadow-lg shadow-lime-600/30 hover:shadow-xl hover:shadow-lime-600/50 hover:scale-[1.02] active:scale-95 transition-all duration-300 border-t-2 border-lime-300"
          >
            開始旅程
          </button>
        </form>
      </div>
    </div>
  );
}