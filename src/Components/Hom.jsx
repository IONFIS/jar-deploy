"use client";

import React, { useRef, useEffect, Suspense, useCallback, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { ScrollControls, Environment, useScroll, Html } from "@react-three/drei"; // Correct Html import
import { Model } from "./Model"; 
import gsap from "gsap";
import { useDispatch, useSelector } from "react-redux";
import { setAnimationComplete, setPosition, setCurrentSection, selectAnimationState } from '@/app/redux/slice';
import * as THREE from 'three';



const isMobile = typeof window !== "undefined" && window.innerWidth <= 768;

export default function App() {
  const dispatch = useDispatch();
  const { animationComplete, position, currentSection } = useSelector(selectAnimationState);

  useEffect(() => {
    document.body.style.overflow = animationComplete ? "auto" : "hidden";
  }, [animationComplete]);

  return (
    <div style={{ height: "100vh", width: "100vw", position: "relative", overflow: "hidden" }}>
      <Suspense fallback={<LoadingAnimation />}>
        <div
          style={{
            position: "sticky",
            top: 0,
            height: "100vh",
            width: "100vw",
            overflow: "hidden",
          }}
        >
          <Canvas
            style={{
              position: "absolute",
              top: 0,
              left: "50%",
              transform: "translateX(-50%)",
              height: "100vh",
              width: "100vw",
              zIndex: -10,
              overflow: "hidden",
            }}
            shadows
            dpr={isMobile ? [1, 1.5] : [1, 2]}
            gl={{ antialias: !isMobile }} 
            camera={{
              fov: isMobile ? 30 : 40,
              position: [10, 3, 6],
              near: 0.1,
              far: 100,
            }}
          >
            <ambientLight intensity={0.5} />
            <directionalLight position={[5, 10, 5]} intensity={1.5} castShadow />
            <Environment files="/hdr/lobby.hdr" />
            <ScrollControls pages={6} damping={0.5}>
              <AnimatedModel
                dispatch={dispatch}
                onComplete={() => dispatch(setAnimationComplete(true))}
                setPosition={(pos) => dispatch(setPosition(pos))}
                currentSection={currentSection}
                setCurrentSection={(sec) => dispatch(setCurrentSection(sec))}
              />
            </ScrollControls>
          </Canvas>
        </div>
      </Suspense>
    </div>
  );
}

function LoadingAnimation() {
  return (
    <div className="fixed inset-0 flex justify-center items-center bg-white bg-opacity-80 z-50">
      <div className="text-2xl font-semibold text-gray-500 animate-fadeIn flex content-center items-center justify-center">
        Loading<span className="dot-animation animate-blink">...</span>
      </div>
    </div>
  );
}

function AnimatedModel({ dispatch, onComplete, setPosition, currentSection, setCurrentSection }) {
  const modelRef = useRef(null);  
  const scroll = useScroll();
  const targetRotation = useRef(new THREE.Vector3(0, 0, 0));
  const targetScale = useRef(1);
  const targetPosition = useRef(new THREE.Vector3(0, 0, 0));

  const numSections = 6;
  const sectionHeight = 1 / numSections;

  const [lastUpdate, setLastUpdate] = useState(0);
  const throttleDelay = 50;

  const handleScrollUpdate = useCallback(() => {
    const newSection = Math.floor(scroll.offset * numSections);
    if (newSection !== currentSection) {
      setCurrentSection(newSection);
    }
  }, [scroll.offset, currentSection, numSections, setCurrentSection]);

  useEffect(() => {
    handleScrollUpdate();
  }, [scroll.offset, handleScrollUpdate]);

  useFrame((state, delta) => {
    const now = Date.now();
    if (now - lastUpdate < throttleDelay) return;
    setLastUpdate(now);

    const sectionRatio = scroll.offset;

    targetRotation.current.set(
      Math.PI * 2 * sectionRatio,
      Math.PI * 2 * sectionRatio,
      0
    );
    targetScale.current = 2 - sectionRatio * 1.3;
    targetPosition.current.set(0, -0.5 * (targetScale.current - 1), 0);

    if (modelRef.current) {
      gsap.to(modelRef.current.rotation, {
        x: targetRotation.current.x,
        y: targetRotation.current.y,
        duration: 0.1,
        ease: "power3.out",
      });
      gsap.to(modelRef.current.scale, {
        x: targetScale.current,
        y: targetScale.current,
        z: targetScale.current,
        duration: 0.1,
        ease: "power3.out",
      });
      gsap.to(modelRef.current.position, {
        x: targetPosition.current.x,
        y: targetPosition.current.y,
        z: targetPosition.current.z,
        duration: 0.1,
        ease: "power3.out",
      });

      const { x, y, z } = modelRef.current.position;
      setPosition({ x, y, z });

      if (scroll.offset >= 1) {
        onComplete();
      }
    }
  });

  return <Model ref={modelRef} position={[0, 0, 0]} />;
}

