"use client";

import { useRef, useEffect, useState, Suspense } from "react";
import { useTheme } from "next-themes";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, PresentationControls, Float } from "@react-three/drei";
import * as THREE from "three";
import { WorkforceCore } from "./WorkforceCore";
import { FlexisNode } from "./FlexisNode";
import { ConnectionLines } from "./ConnectionLines";
import { ParticleField } from "./ParticleField";

const MODULE_DATA = [
  { id: "Vendors", label: "Vendor Registry & Evaluation" },
  { id: "Security", label: "Government-Grade Access" },
  { id: "Workflows", label: "Configurable Approvals" },
  { id: "Analytics", label: "Real-time Data Insights" },
  { id: "Contracts", label: "Digital Lifecycle" },
];

const NODE_POSITIONS = getNodePositions(2.8, MODULE_DATA.length);

// Calculate radial positions around center
function getNodePositions(radius: number, count: number): [number, number, number][] {
  return Array.from({ length: count }).map((_, i) => {
    const angle = (i / count) * Math.PI * 2 - Math.PI / 2;
    return [
      Math.cos(angle) * radius,
      Math.sin(angle) * radius * 0.8, // Reduced squashing
      Math.sin(angle * 3) * 0.5,      // Wavy Z-axis
    ] as [number, number, number];
  });
}

// Scene entrance animation
function SceneGroup({ children }: { children: React.ReactNode }) {
  const groupRef = useRef<THREE.Group>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Small delay so the entrance feels intentional
    const timer = setTimeout(() => setVisible(true), 200);
    return () => clearTimeout(timer);
  }, []);

  useFrame(() => {
    if (!groupRef.current) return;
    const targetScale = visible ? 1 : 0.85;
    groupRef.current.scale.lerp(
      new THREE.Vector3(targetScale, targetScale, targetScale),
      0.04
    );
  });

  return (
    <group ref={groupRef} scale={0.85}>
      {children}
    </group>
  );
}

function SceneContent({ isDark }: { isDark: boolean }) {
  return (
    <>
      {/* Elevated Lighting Setup - adapts to dark mode */}
      <ambientLight intensity={isDark ? 0.3 : 0.15} />
      <directionalLight position={[10, 10, 5]} intensity={isDark ? 1 : 2} color="#ffffff" castShadow />
      <directionalLight position={[-10, -10, -5]} intensity={isDark ? 0.8 : 1.5} color={isDark ? "#818cf8" : "#4f46e5"} />
      <pointLight position={[0, -2, 5]} intensity={isDark ? 0.5 : 1} color="#e0e7ff" distance={15} />
      <pointLight position={[0, 0, 0]} intensity={isDark ? 2 : 1.5} color={isDark ? "#a5b4fc" : "#7474C1"} distance={5} />

      {/* Premium Studio Environment for rich reflections */}
      <Environment preset="studio" environmentIntensity={isDark ? 0.8 : 1.5} />

      {/* Premium Interactive Presentation Controls */}
      <PresentationControls
        global
        snap={true}
        rotation={[0, 0.3, 0]}
        polar={[-Math.PI / 4, Math.PI / 4]}
        azimuth={[-Math.PI / 4, Math.PI / 4]}
      >
        <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
          {/* Scene content with entrance animation */}
          <SceneGroup>
            {/* Central OMS Core */}
            <WorkforceCore isDark={isDark} />

            {/* Module Nodes */}
            {MODULE_DATA.map((node, i) => (
              <FlexisNode
                key={node.id}
                id={node.id}
                label={node.label}
                position={NODE_POSITIONS[i]}
                delay={i}
                isDark={isDark}
              />
            ))}

            {/* Connection Lines */}
            <ConnectionLines nodePositions={NODE_POSITIONS} />

            {/* Ambient Particles */}
            <ParticleField />
          </SceneGroup>
        </Float>
      </PresentationControls>
    </>
  );
}

export default function Hero3DScene() {
  const [reducedMotion, setReducedMotion] = useState(false);
  const { resolvedTheme } = useTheme();
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setIsDark(resolvedTheme === "dark");
  }, [resolvedTheme]);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return (
    <div className="w-full h-full cursor-grab active:cursor-grabbing" style={{ minHeight: 600 }}>
      <Canvas
        camera={{ position: [0, 0, 11.5], fov: 45 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
        frameloop={reducedMotion ? "demand" : "always"}
      >
        <Suspense fallback={null}>
          <SceneContent isDark={isDark} />
        </Suspense>
      </Canvas>
    </div>
  );
}
