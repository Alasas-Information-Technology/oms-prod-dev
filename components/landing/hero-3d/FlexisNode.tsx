"use client";

import { useRef, useState, useCallback } from "react";
import { useFrame } from "@react-three/fiber";
import { Text, Html, MeshTransmissionMaterial } from "@react-three/drei";
import * as THREE from "three";

interface FlexisNodeProps {
  id: string;
  label: string;
  position: [number, number, number];
  delay: number;
  isDark?: boolean;
}

export function FlexisNode({ id, label, position, delay, isDark }: FlexisNodeProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  // Current animated values
  const currentScale = useRef(1);
  const currentEmissive = useRef(0.15);

  const onPointerOver = useCallback(() => setHovered(true), []);
  const onPointerOut = useCallback(() => setHovered(false), []);

  useFrame((state) => {
    if (!meshRef.current) return;

    // Floating offset per-node
    const t = state.clock.elapsedTime;
    const floatY = Math.sin(t * 0.8 + delay * 2) * 0.06;
    const floatX = Math.cos(t * 0.5 + delay * 3) * 0.03;
    meshRef.current.position.set(
      position[0] + floatX,
      position[1] + floatY,
      position[2]
    );

    // Smooth lerp for hover scale
    const targetScale = hovered ? 1.25 : 1;
    currentScale.current = THREE.MathUtils.lerp(currentScale.current, targetScale, 0.08);
    meshRef.current.scale.setScalar(currentScale.current);

    // Smooth lerp for emissive
    const targetEmissive = hovered ? 0.6 : 0.15;
    currentEmissive.current = THREE.MathUtils.lerp(currentEmissive.current, targetEmissive, 0.08);
    const mat = meshRef.current.material as THREE.MeshStandardMaterial;
    if (mat && mat.emissiveIntensity !== undefined) {
      mat.emissiveIntensity = currentEmissive.current;
    }
  });

  return (
    <group>
      <mesh
        ref={meshRef}
        position={position}
        onPointerOver={onPointerOver}
        onPointerOut={onPointerOut}
      >
        <sphereGeometry args={[0.32, 32, 32]} />
        <meshPhysicalMaterial
          transmission={1}
          transparent={true}
          roughness={0.25}
          thickness={0.8}
          ior={1.45}
          color="#a5b4fc"
        />
        {/* Inner solid core for the node */}
        <mesh>
          <sphereGeometry args={[0.12, 32, 32]} />
          <meshStandardMaterial
            color={isDark ? "#000000" : "#ffffff"}
            emissive={isDark ? "#4f46e5" : "#ffffff"}
            emissiveIntensity={isDark ? 1.5 : 2}
            metalness={0.8}
            roughness={0.2}
          />
        </mesh>
      </mesh>

      {/* HTML Floating Card replacing the 3D text for readability */}
      <Html
        position={[
          position[0] + (position[0] > 0 ? 0.45 : -0.45), 
          position[1] + 0.35, 
          position[2]
        ]}
        center
        zIndexRange={[100, 0]}
      >
        <div 
          className={`flex items-center gap-2 bg-card/95 backdrop-blur-md text-foreground text-[11px] sm:text-xs font-semibold py-1.5 px-3 sm:py-2 sm:px-4 rounded-full shadow-lg border border-border/50 whitespace-nowrap transition-all duration-300 ${hovered ? 'scale-105 shadow-primary/20 border-primary/30' : ''}`}
        >
          <div className="w-1.5 h-1.5 rounded-full bg-primary" />
          {id}
        </div>
      </Html>
    </group>
  );
}
