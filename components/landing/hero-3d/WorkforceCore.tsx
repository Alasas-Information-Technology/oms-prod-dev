"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Text, MeshTransmissionMaterial, Sphere } from "@react-three/drei";
import * as THREE from "three";

export function WorkforceCore({ isDark }: { isDark?: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const innerCoreRef = useRef<THREE.Mesh>(null);
  const ring1Ref = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);

  // Slow continuous rotation + floating bob
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    
    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(t * 0.8) * 0.1;
    }
    
    if (innerCoreRef.current) {
      innerCoreRef.current.rotation.y = t * 0.2;
      innerCoreRef.current.rotation.x = t * 0.1;
      const scale = 1 + Math.sin(t * 2) * 0.05;
      innerCoreRef.current.scale.set(scale, scale, scale);
    }

    if (ring1Ref.current && ring2Ref.current) {
      ring1Ref.current.rotation.x = t * 0.3;
      ring1Ref.current.rotation.y = t * 0.4;
      
      ring2Ref.current.rotation.x = -t * 0.2;
      ring2Ref.current.rotation.z = t * 0.5;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Outer highly refractive liquid frosted glass shell */}
      <Sphere args={[1.2, 64, 64]}>
        <MeshTransmissionMaterial
          background={new THREE.Color(isDark ? "#000000" : "#EDF4FE")}
          backside
          samples={8}
          transmission={1}
          thickness={2.5}
          roughness={0.25}
          chromaticAberration={0.08}
          anisotropy={0.3}
          distortion={0.5}
          distortionScale={0.3}
          temporalDistortion={0.15}
          ior={1.45}
          color="#e0e7ff"
          resolution={1024}
        />
      </Sphere>

      {/* Inner energy core (Faceted Icosahedron) */}
      <mesh ref={innerCoreRef}>
        <icosahedronGeometry args={[0.45, 0]} />
        <meshStandardMaterial
          color={isDark ? "#000000" : "#ffffff"}
          emissive={isDark ? "#4f46e5" : "#7474C1"}
          emissiveIntensity={isDark ? 1.5 : 2}
          metalness={0.9}
          roughness={0.1}
          wireframe={false}
        />
      </mesh>

      {/* Inner wireframe overlay for tech detail */}
      <mesh>
        <icosahedronGeometry args={[0.6, 1]} />
        <meshBasicMaterial
          color="#A6DCE6"
          wireframe
          transparent
          opacity={0.3}
        />
      </mesh>

      {/* Orbiting Ring 1 (Thin Liquid Glass) */}
      <mesh ref={ring1Ref}>
        <torusGeometry args={[1.6, 0.015, 32, 100]} />
        <MeshTransmissionMaterial
          samples={4}
          transmission={1}
          thickness={0.1}
          roughness={0.1}
          chromaticAberration={0.08}
          ior={1.5}
          color="#a5b4fc"
          resolution={512}
        />
      </mesh>

      {/* Orbiting Ring 2 (Thin Liquid Glass) */}
      <mesh ref={ring2Ref}>
        <torusGeometry args={[1.9, 0.01, 32, 100]} />
        <MeshTransmissionMaterial
          samples={4}
          transmission={1}
          thickness={0.1}
          roughness={0.15}
          chromaticAberration={0.05}
          ior={1.4}
          color="#7474C1"
          resolution={512}
        />
      </mesh>

      {/* OMS Label floating slightly in front */}
      <Text
        position={[0, 0, 1.5]}
        fontSize={0.35}
        fontWeight={800}
        color={isDark ? "#FFFFFF" : "#000D5A"}
        anchorX="center"
        anchorY="middle"
        characters="OMS"
      >
        OMS
        <meshBasicMaterial color="#ffffff" />
      </Text>
    </group>
  );
}
