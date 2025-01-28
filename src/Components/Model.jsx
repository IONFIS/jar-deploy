"use client";
import React, { forwardRef } from "react";
import { useGLTF } from "@react-three/drei";

export const Model = forwardRef((props, ref) => {
  Model.displayName = "Models";

  // const { nodes, materials } = useGLTF("/peanutbutterjar2.gltf");
  const { nodes, materials } = useGLTF("./updated.glb");
  return (
    <group {...props} dispose={null} ref={ref}>
      <group
        position={[0, 0, 0]}
        rotation={[Math.PI / 2, 0.2, 0]}
        scale={[0.02, 0.02, 0.02]}
      >
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Mesh001.geometry}
          material={materials["PEENUTBUTTER.001"]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Mesh001_1.geometry}
          material={materials["Material.002"]}
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

useGLTF.preload("/updated.glb");

// "use client";
// import React, { forwardRef } from "react";
// import { useGLTF } from "@react-three/drei";

// export const Model = forwardRef((props, ref) => {
//   Model.displayName = "Model";

//   const { nodes, materials } = useGLTF("./3dpea.com_updated/updated1.gltf");
//   // const { nodes, materials } = useGLTF("./updated.glb");

//   return (
//     <group {...props} dispose={null} ref={ref}>
//       <group
//         position={[0, 0, 0]}
//         rotation={[Math.PI / 2, 0.2, 0]}
//         scale={0.02} // Simplified uniform scaling
//       >
//         {[
//           {
//             geometry: nodes.Mesh001.geometry,
//             material: materials["PEENUTBUTTER.001"],
//           },
//           {
//             geometry: nodes.Mesh001_1.geometry,
//             material: materials["Material.002"],
//           },
//           { geometry: nodes.Mesh001_2.geometry, material: materials.lable },
//         ].map((meshProps, index) => (
//           <mesh
//             key={index}
//             castShadow
//             receiveShadow
//             geometry={meshProps.geometry}
//             material={meshProps.material}
//           />
//         ))}
//       </group>
//     </group>
//   );
// });

// useGLTF.preload("/updated1.gltf");
