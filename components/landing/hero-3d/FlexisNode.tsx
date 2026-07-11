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
        <MeshTransmissionMaterial
          background={new THREE.Color(isDark ? "#000000" : "#EDF4FE")}
          backside
          samples={4}
          transmission={1}
          thickness={0.8}
          roughness={0.25}
          chromaticAberration={0.05}
          anisotropy={0.3}
          distortion={0.3}
          distortionScale={0.2}
          temporalDistortion={0.1}
          ior={1.45}
          color="#a5b4fc"
          resolution={512}
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

      {/* Main Letter label on the node face */}
      <Text
        position={[position[0], position[1], position[2] + 0.35]}
        fontSize={0.24}
        fontWeight={800}
        color={isDark ? "#FFFFFF" : "#000D5A"}
        anchorX="center"
        anchorY="middle"
      >
        {id}
      </Text>

      {/* Hover tooltip */}
      {hovered && (
        <Html
          position={[position[0], position[1] + 0.5, position[2]]}
          center
          style={{ transition: "all 0.2s", opacity: hovered ? 1 : 0 }}
        >
          <div className="bg-heading dark:bg-card dark:text-card-foreground text-white text-[10px] font-semibold uppercase tracking-wider py-1.5 px-3 rounded-lg whitespace-nowrap shadow-xl border dark:border-border/50">
            {label}
            <div className="w-2 h-2 bg-heading dark:bg-card rotate-45 absolute -bottom-1 left-1/2 -translate-x-1/2 dark:border-r dark:border-b dark:border-border/50" />
          </div>
        </Html>
      )}
    </group>
  );
}
