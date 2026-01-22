// components/GrassField.tsx
'use client';

import { useLoader, useFrame } from '@react-three/fiber';
import { TextureLoader, RepeatWrapping, NearestFilter, MeshToonMaterial, Vector3 } from 'three';
import { useRef, useState } from 'react';

interface GrassFieldProps {
  playerPos: Vector3; // 從 page.tsx 傳入玩家位置
}

interface GrassTile {
  x: number;
  z: number;
  dug: boolean;
}

export default function GrassField({ playerPos }: GrassFieldProps) {
  const grassTexture = useLoader(TextureLoader, '/grass_cartoon.png');

  grassTexture.wrapS = grassTexture.wrapT = RepeatWrapping;
  grassTexture.repeat.set(1, 1);
  grassTexture.magFilter = NearestFilter;

  // Tiles 設定
  const tileSize = 1; // 每格大小
  const gridCount = 50; // 幾格 × 幾格
  const [tiles] = useState<GrassTile[]>(() => {
    const temp: GrassTile[] = [];
    for (let i = -gridCount / 2; i < gridCount / 2; i++) {
      for (let j = -gridCount / 2; j < gridCount / 2; j++) {
        temp.push({ x: i * tileSize, z: j * tileSize, dug: false });
      }
    }
    return temp;
  });

  // 參考 mesh material
  const meshRefs = useRef<MeshToonMaterial[]>([]);

  // 玩家走過變色
  useFrame(() => {
    tiles.forEach((tile, idx) => {
      const distance = Math.hypot(playerPos.x - tile.x, playerPos.z - tile.z);
      if (distance < tileSize / 1.5) tile.dug = true;

      // 更新材質顏色
      if (meshRefs.current[idx]) {
        meshRefs.current[idx].color.set(tile.dug ? 0x996633 : 0x90ee90);
      }
    });
  });

  return (
    <>
      {tiles.map((tile, idx) => (
        <mesh
          key={idx}
          position={[tile.x, 0, tile.z]}
          rotation={[-Math.PI / 2, 0, 0]}
          receiveShadow
        >
          <planeGeometry args={[tileSize, tileSize]} />
          <meshToonMaterial
            ref={(el) => (meshRefs.current[idx] = el!)}
            map={grassTexture}
            color={0x90ee90}
          />
        </mesh>
      ))}
    </>
  );
}
