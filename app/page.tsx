'use client';

import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';
import { useRef, useState, useEffect } from 'react';
import * as THREE from 'three';
import Onboarding from '@/components/Onboarding';
import BottomNav from '@/components/BottomNav';

// --- 引入圖示 ---
import { Utensils, Box as BoxIcon, Camera, Loader2, Sparkles, ShoppingBag, Lock } from 'lucide-react';

// --- 型別與設定定義 ---
type FurnitureType = 'bear' | 'lamp' | 'cat' | 'tv' | 'plant';

// 定義商店商品資訊 (價格與圖示)
const FURNITURE_CATALOG: Record<FurnitureType, { price: number, icon: string, name: string }> = {
  bear: { price: 500, icon: '🧸', name: '泰迪熊' },
  lamp: { price: 800, icon: '🛋️', name: '落地燈' },
  cat:  { price: 1500, icon: '🐱', name: '橘貓' },
  tv:   { price: 3000, icon: '📺', name: '電視' },
  plant:{ price: 200, icon: '🪴', name: '盆栽' },
};

interface PlacedFurniture {
  id: string;
  type: FurnitureType;
  x: number; // 0-100 (%)
  y: number; // 0-100 (%)
}

// --- 角色選擇清單 ---
const CHARACTERS = [
  { id: 'duck', name: '鴨子', file: '/duck.glb', img: '🦆', scale: 1},
  { id: 'robot', name: '科技機器人', file: '/robot.glb', img: '🤖', scale: 2 },
];

// --- 1. 草地組件 (負責地板的視覺) ---
function Grass() {

  // load texture of grass
  const texture = useLoader(THREE.TextureLoader, '/grass.jpg');
  
  // 設定圖片重複模式，這樣才不會只是一張大圖被拉伸，而是像磁磚一樣拼貼
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(50, 50); // 重複 50x50 次，覆蓋整個大地

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
      <planeGeometry args={[1000, 1000]} /> {/* 超大平原 */}
      <meshStandardMaterial map={texture} color="#90EE90" /> {/* 疊加一點綠色讓它更鮮豔 */}
    </mesh>
  );
}

// --- 2. 玩家組件 (負責移動邏輯) ---
// props 接收外部傳來的「總步數」
function Player({ stepCount, modelUrl, scale = 1 }: { stepCount: number, modelUrl: string, scale?: number }) {
  const { scene } = useGLTF(modelUrl); // duck model
  
  const playerRef = useRef<THREE.Group>(null);
  
  // 記錄「目標位置」：角色最終應該要走到的地方
  const [targetPos, setTargetPos] = useState(new THREE.Vector3(0, 0, 0));
  
  // 記錄目前的旋轉角度 (雖然我們暫時沒做旋轉動畫，但邏輯上要有)
  const rotationRef = useRef(0);

  // 當「外部的步數」改變時，我們計算新的目標位置
  useEffect(() => {
    if (!playerRef.current) return;
    
    // 假設一步的距離是 0.5 單位
    const stepDistance = 0.5;
    
    // 簡單算法：目前我們固定讓它往「隨機一點的方向」或「固定前方」走，
    // 為了 Demo 效果，我們讓它固定往 Z 軸負向(螢幕內) 走一點點，帶一點隨機偏移
    // 在正式版這裡會結合 GPS 座標
    
    const randomAngle = (Math.random() - 0.5) * 1; // 隨機左右偏一點
    
    const newX = targetPos.x + Math.sin(rotationRef.current + randomAngle) * stepDistance;
    const newZ = targetPos.z - Math.cos(rotationRef.current + randomAngle) * stepDistance; // 往螢幕裡面走

    setTargetPos(new THREE.Vector3(newX, 0, newZ));
    
    // 讓模型轉向新的目標方向 (LookAt)
    playerRef.current.lookAt(newX, 0, newZ);

  }, [stepCount]); // 只要 stepCount 一變，這裡就會執行

  // 每一幀處理動畫：讓角色「滑」到目標位置
  useFrame((state, delta) => {
    if (!playerRef.current) return;

    // Lerp (Linear Interpolation) 平滑移動
    // 意思：目前位置 = 目前位置 + (目標位置 - 目前位置) * 速度係數
    playerRef.current.position.lerp(targetPos, delta * 5);
  });

  // 當模型換了 (modelUrl 改變)，我们要複製一個新的場景，不然 React 會有緩存問題
  const clonedScene = scene.clone();

  return <primitive object={clonedScene} ref={playerRef} scale={scale} />;
}

// --- 2D 小屋組件 (含拖曳邏輯) ---
// updatePosition: 當家具移動時，呼叫此函式更新父層狀態
function House2D({ items, updatePosition }: { items: PlacedFurniture[], updatePosition: (id: string, x: number, y: number) => void }) {
  const bgImage = "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&q=80&w=800";

  // 記錄正在被拖曳的家具 ID
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // 當滑鼠/手指按下時
  const handlePointerDown = (e: React.PointerEvent, id: string) => {
    e.preventDefault();
    setDraggingId(id);
    // 鎖定指標，這樣即使滑鼠移出 div 也能繼續接收事件
    (e.target as Element).setPointerCapture(e.pointerId);
  };

  // 當滑鼠/手指移動時
  const handlePointerMove = (e: React.PointerEvent) => {
    if (!draggingId || !containerRef.current) return;
    e.preventDefault();

    // 1. 取得容器的大小與位置
    const rect = containerRef.current.getBoundingClientRect();
    
    // 2. 計算滑鼠相對於容器的座標
    const clientX = e.clientX;
    const clientY = e.clientY;

    // 3. 轉換成百分比 (為了 RWD)
    // 減去 rect.left 是為了取得容器內的相對 X
    let xPercent = ((clientX - rect.left) / rect.width) * 100;
    let yPercent = ((clientY - rect.top) / rect.height) * 100;

    // 4. 限制邊界 (不要讓家具跑出畫面)
    xPercent = Math.max(5, Math.min(95, xPercent));
    yPercent = Math.max(5, Math.min(95, yPercent));

    // 5. 更新位置
    updatePosition(draggingId, xPercent, yPercent);
  };

  // 當放開時
  const handlePointerUp = (e: React.PointerEvent) => {
    setDraggingId(null);
    (e.target as Element).releasePointerCapture(e.pointerId);
  };

  return (
    <div 
      ref={containerRef}
      className="w-full h-full relative overflow-hidden touch-none" // touch-none 防止手機滑動頁面
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      {/* 背景圖 */}
      <div 
        className="absolute inset-0 bg-cover bg-center transition-all duration-700 pointer-events-none"
        style={{ backgroundImage: `url(${bgImage})` }}
      />
      <div className="absolute inset-0 bg-black/10 pointer-events-none" />

      {/* 渲染家具 */}
      {items.map((item) => (
        <div
          key={item.id}
          // 在這裡綁定 PointerDown 事件
          onPointerDown={(e) => handlePointerDown(e, item.id)}
          className={`absolute text-6xl drop-shadow-2xl filter cursor-grab active:cursor-grabbing transition-transform select-none ${draggingId === item.id ? 'scale-125 z-50' : 'hover:scale-110'}`}
          style={{ 
            left: `${item.x}%`, 
            top: `${item.y}%`,
            transform: 'translate(-50%, -50%)', // 中心對齊
            touchAction: 'none'
          }}
        >
          {FURNITURE_CATALOG[item.type]?.icon || '📦'}
        </div>
      ))}
      
      {/* 提示文字 */}
      {items.length > 0 && (
         <div className="absolute top-20 w-full text-center pointer-events-none opacity-50">
           <span className="bg-black/20 text-white px-2 py-1 rounded text-xs">長按拖曳移動家具</span>
         </div>
      )}
    </div>
  );
}

// --- Home page ---
export default function Home() {
  const [isRegistered, setIsRegistered] = useState(false);

  const [characterConfig, setCharacterConfig] = useState({ file: '/duck.glb', scale: 0.5 });
  // Record current page
  const [currentTab, setCurrentTab] = useState<'map' | 'house' | 'diet'>('map'); 
  
  // Step count (wallet)
  const [steps, setSteps] = useState(3867);
  
  // already placed furniture(initially has a plant for drinking water)
  const [placedFurniture, setPlacedFurniture] = useState<PlacedFurniture[]>([
    { id: '1', type: 'plant', x: 50, y: 70 }, 
  ]);

  // AI analysis state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiResult, setAiResult] = useState<any>(null);
  
  const handleRegistration = (data: any) => {
    // 找出使用者選的那隻角色的完整資料
    const selectedChar = CHARACTERS.find(c => c.id === data.character);
    
    if (selectedChar) {
      // 把檔案路徑跟縮放比例都存起來
      setCharacterConfig({ 
        file: selectedChar.file, 
        scale: selectedChar.scale 
      });
    }
    setIsRegistered(true);
  };

  // [功能] 購買並放置家具
  const handlePurchase = (type: FurnitureType) => {
    const itemInfo = FURNITURE_CATALOG[type];
    
    // 1. check if enough steps to exchange
    if (steps < itemInfo.price) {
      alert(`步數不足！還差 ${itemInfo.price - steps} 步`);
      return;
    }

    // 2. 扣款 deduction
    setSteps(prev => prev - itemInfo.price);

    // 3. 放到房間中央 (稍微隨機一點位置避免重疊)
    const newItem: PlacedFurniture = {
      id: Math.random().toString(),
      type,
      x: 45 + Math.random() * 10, 
      y: 50 + Math.random() * 10, 
    };
    setPlacedFurniture(prev => [...prev, newItem]);
  };

  // [功能] 更新家具位置 (被 House2D 呼叫)
  const updateFurniturePosition = (id: string, x: number, y: number) => {
    setPlacedFurniture(prev => prev.map(item => 
      item.id === id ? { ...item, x, y } : item
    ));
  };

  // AI 圖片分析 (保持不變)
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsAnalyzing(true);
    setAiResult(null);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      try {
        const res = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: base64String }),
        });
        const data = await res.json();
        setAiResult(data);
        if (data.rewardCoins) setSteps(prev => prev + data.rewardCoins);
      } catch (error) {
        alert('AI 腦袋打結了');
      } finally {
        setIsAnalyzing(false);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <main className="min-h-screen bg-slate-100 flex justify-center items-center overflow-hidden font-sans">
      <div className="w-full h-[100dvh] md:h-[800px] md:w-[400px] bg-white relative md:rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        
        {!isRegistered && <Onboarding onComplete={handleRegistration} />}

        {/* === 背景層 === */}
        <div className="absolute inset-0 z-0 bg-sky-200">
          {currentTab === 'map' && (
             <Canvas shadows camera={{ position: [0, 5, 10], fov: 60 }}>
                <ambientLight intensity={0.7} />
                <directionalLight position={[10, 20, 10]} intensity={1.5} castShadow />
                <Grass />
                <Player 
                  stepCount={steps} 
                  modelUrl={characterConfig.file} 
                  scale={characterConfig.scale} 
                />
                <OrbitControls maxPolarAngle={Math.PI / 2.1} />
             </Canvas>
          )}

          {currentTab === 'house' && (
            // 傳遞更新位置的函式給 House2D
            <House2D items={placedFurniture} updatePosition={updateFurniturePosition} />
          )}
        </div>

        {/* === UI 層 === */}
        
        {/* A. 地圖 UI */}
        {currentTab === 'map' && (
          <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-10 flex flex-col p-6">
            <div className="bg-white/90 backdrop-blur-sm p-4 rounded-3xl shadow-sm flex justify-between items-center pointer-events-auto">
               <span className="font-bold text-slate-700">今日步數</span>
               <span className="text-2xl font-black text-indigo-600">{steps.toLocaleString()}</span>
            </div>
            <div className="mt-4 bg-emerald-400 p-4 rounded-3xl shadow-lg pointer-events-auto text-center text-white">
              <h3 className="font-bold mb-2">🌲 森林模式</h3>
              <button onClick={() => setSteps(s => s + 500)} className="bg-slate-800/20 w-full py-2 rounded-xl backdrop-blur-sm hover:bg-slate-800/40">
                 偷懶走 500 步 (Demo用)
              </button>
            </div>
          </div>
        )}

        {/* B. 小屋 UI (步數商店) */}
        {currentTab === 'house' && (
          <div className="absolute bottom-20 left-0 w-full px-4 z-10 pointer-events-auto">
             <div className="bg-white/90 backdrop-blur-md p-4 rounded-3xl shadow-xl">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-bold text-slate-700 flex items-center gap-2">
                    <ShoppingBag size={20} /> 家具商店
                  </h3>
                  <div className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold">
                     錢包: {steps} 步
                  </div>
                </div>

                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                  {(Object.keys(FURNITURE_CATALOG) as FurnitureType[]).map((type) => {
                    const item = FURNITURE_CATALOG[type];
                    const canAfford = steps >= item.price;

                    return (
                      <button 
                        key={type} 
                        onClick={() => handlePurchase(type)}
                        disabled={!canAfford}
                        className={`flex-shrink-0 w-20 h-24 rounded-xl flex flex-col items-center justify-center border-2 transition-all relative
                          ${canAfford 
                            ? 'bg-white border-slate-200 hover:border-green-400 hover:scale-105 active:scale-95' 
                            : 'bg-slate-100 border-transparent opacity-60 cursor-not-allowed grayscale'
                          }
                        `}
                      >
                        <div className="text-3xl mb-1">{item.icon}</div>
                        <div className="text-xs font-bold text-slate-700">{item.name}</div>
                        <div className={`text-[10px] mt-1 font-bold ${canAfford ? 'text-green-600' : 'text-red-400'}`}>
                          {item.price} 步
                        </div>
                      </button>
                    )
                  })}
                </div>
             </div>
          </div>
        )}

        {/* C. 飲食顧問 UI (保持不變) */}
        {currentTab === 'diet' && (
          <div className="absolute inset-0 z-20 bg-slate-50 flex flex-col overflow-y-auto">
            <div className="p-6">
               <h2 className="text-2xl font-bold text-slate-800 mb-1">AI 飲食顧問</h2>
               <p className="text-slate-500 mb-6">拍下你的食物，換取獎勵！</p>
               <label className="block w-full aspect-video bg-white border-2 border-dashed border-slate-300 rounded-3xl flex flex-col items-center justify-center cursor-pointer hover:border-green-400 hover:bg-green-50 transition gap-3 relative overflow-hidden group">
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                  {isAnalyzing ? (
                    <div className="flex flex-col items-center animate-pulse text-green-600">
                      <Loader2 className="animate-spin mb-2" size={32} />
                      <span>Gemini 正在思考...</span>
                    </div>
                  ) : (
                    <>
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-green-600 group-hover:scale-110 transition">
                        <Camera size={32} />
                      </div>
                      <span className="text-slate-400 font-medium">點擊拍照或上傳</span>
                    </>
                  )}
               </label>
               {aiResult && (
                 <div className="mt-6 bg-white rounded-3xl p-6 shadow-xl border border-slate-100 animate-in slide-in-from-bottom-5">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-slate-800">{aiResult.foodName}</h3>
                        <div className="flex items-center gap-1 text-green-600 text-sm font-bold">
                          <Sparkles size={14} />
                          健康評分: {aiResult.healthScore}/10
                        </div>
                      </div>
                      <div className="bg-orange-100 text-orange-600 px-3 py-1 rounded-full font-bold text-sm">
                        {aiResult.calories} kcal
                      </div>
                    </div>
                    <p className="text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl mb-4 text-sm">
                      {aiResult.comment}
                    </p>
                    <button onClick={() => setAiResult(null)} className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl shadow hover:bg-slate-800 active:scale-95 transition">
                      收下獎勵 ({aiResult.rewardCoins} 步)
                    </button>
                 </div>
               )}
            </div>
          </div>
        )}

        {isRegistered && <BottomNav currentTab={currentTab} setTab={setCurrentTab} />}
      </div>
    </main>
  );
}