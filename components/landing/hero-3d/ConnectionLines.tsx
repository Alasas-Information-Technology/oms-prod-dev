"use client";

import { useMemo } from "react";
import { Line } from "@react-three/drei";
import * as THREE from "three";

interface ConnectionLinesProps {
  nodePositions: [number, number, number][];
}

export function ConnectionLines({ nodePositions }: ConnectionLinesProps) {
  const curves = useMemo(() => {
    return nodePositions.map((pos) => {
      const start = new THREE.Vector3(0, 0, 0);
      const end = new THREE.Vector3(...pos);
      const mid = new THREE.Vector3()
        .addVectors(start, end)
        .multiplyScalar(0.5)
        .add(new THREE.Vector3(0, 0.3, 0));

      const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
      return curve.getPoints(32).map((p) => [p.x, p.y, p.z] as [number, number, number]);
    });
  }, [nodePositions]);

  return (
    <group>
      {curves.map((points, i) => (
        <Line
          key={i}
          points={points}
          color="#7474C1"
          lineWidth={1}
          transparent
          opacity={0.2}
        />
      ))}
    </group>
  );
}
