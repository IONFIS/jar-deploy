"use client";
import React, { forwardRef } from "react";
import { useGLTF } from "@react-three/drei";

export const Model = forwardRef((props, ref) => {
  
  Model.displayName ="Models"

  const { nodes, materials } = useGLTF('/peanutbutterjar2.gltf');
  return (
    <group {...props} dispose={null} ref={ref}>
    <group
  position={[0, 0, 0]}
        rotation={[Math.PI / 2, 0.2, 0]}
        scale={[0.020, 0.020, 0.020]}
      >
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Mesh001.geometry}
          material={materials['PEENUTBUTTER.001']}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Mesh001_1.geometry}
          material={materials['Material.002']}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Mesh001_2.geometry}
          material={materials.lable}
        />
      </group>
    </group>
  );
});

  

useGLTF.preload('/peanutbutterjar2.gltf'); 