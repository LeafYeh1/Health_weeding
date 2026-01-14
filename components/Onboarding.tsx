import { useState } from 'react'; // useState for managing form data

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

  return (
    <div className="absolute inset-0 z-50 bg-white flex flex-col items-center justify-center p-6 animate-in fade-in duration-500">
      <div className="w-full max-w-sm">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">歡迎來到 Walk & Live</h1>
        <p className="text-slate-500 mb-8">讓我們建立您的虛擬分身</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">暱稱</label>
            <input 
              type="text" 
              required
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-green-400 focus:border-transparent outline-none transition"
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
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-green-400 outline-none"
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
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-green-400 outline-none appearance-none bg-white"
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
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-green-400 outline-none"
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
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-green-400 outline-none"
                placeholder="60"
                value={formData.weight}
                onChange={e => setFormData({...formData, weight: e.target.value})}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">選擇你的虛擬分身</label>
            <div className="grid grid-cols-3 gap-3">
              {CHARACTERS.map((char) => (
                <button
                  key={char.id}
                  type="button" // 重要！一定要加這行，不然按下去會變成「送出表單」
                  onClick={() => setFormData({ ...formData, character: char.id })}
                  className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-2
                    ${formData.character === char.id 
                      ? 'border-green-400 bg-green-50 ring-2 ring-green-200' 
                      : 'border-slate-200 hover:border-slate-300'
                    }`}
                >
                  <div className="text-3xl">{char.img}</div>
                  <span className="text-xs font-bold text-slate-600">{char.name}</span>
                </button>
              ))}
            </div>
          </div>
          <button 
            type="submit"
            className="w-full mt-6 bg-slate-900 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-slate-800 active:scale-95 transition-all"
          >
            開始旅程
          </button>
        </form>
      </div>
    </div>
  );
}