import { Map, Home, Utensils } from 'lucide-react';

type Tab = 'map' | 'house' | 'diet';

interface BottomNavProps {
  currentTab: Tab;
  setTab: (tab: Tab) => void;
}

export default function BottomNav({ currentTab, setTab }: BottomNavProps) {
  const navItems = [
    { id: 'map', label: '地圖', icon: Map },
    { id: 'house', label: '我的小家', icon: Home },
    { id: 'diet', label: '飲食顧問', icon: Utensils },
  ] as const;

  return (
    <div className="absolute bottom-0 left-0 w-full bg-white border-t border-slate-100 pb-safe pt-2 px-6 shadow-[0_-5px_20px_rgba(0,0,0,0.05)] z-40 rounded-t-2xl">
      <div className="flex justify-between items-center max-w-sm mx-auto">
        {navItems.map((item) => {
          const isActive = currentTab === item.id;
          const Icon = item.icon;
          
          return (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              className={`flex flex-col items-center gap-1 p-3 transition-all duration-300 ${
                isActive ? 'text-green-600 -translate-y-2' : 'text-slate-400'
              }`}
            >
              <div className={`p-2 rounded-full transition-all ${isActive ? 'bg-green-100' : 'bg-transparent'}`}>
                <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}