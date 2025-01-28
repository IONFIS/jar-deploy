"use client";

import React, { useRef, useEffect, Suspense, useCallback, useState, memo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { ScrollControls, Environment, useScroll } from "@react-three/drei";
import { Model } from "./Model";
import gsap from "gsap";
import { useDispatch, useSelector } from "react-redux";
import { setAnimationComplete, setPosition, setCurrentSection, selectAnimationState } from '@/app/redux/slice';
import * as THREE from 'three';

// Detect mobile devices to adjust settings
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
            dpr={isMobile ? [1, 1.5] : [1, 2]} // Optimize device pixel ratio
            gl={{ antialias: !isMobile }} // Reduce antialiasing on mobile
            camera={{
              fov: isMobile ? 30 : 40, // Adjust FOV for mobile
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

// Custom Simple Loading Animation Component using Tailwind CSS
function LoadingAnimation() {
  return (
    <div className="fixed inset-0 flex justify-center items-center bg-white bg-opacity-80 z-50">
      <div className="text-2xl font-semibold text-gray-500 animate-fadeIn">
        Loading<span className="dot-animation animate-blink">...</span>
      </div>
    </div>
  );
}

// Memoized AnimatedModel component to avoid unnecessary re-renders
const AnimatedModel = memo(({ dispatch, onComplete, setPosition, currentSection, setCurrentSection }) => {
  const modelRef = useRef(null);
  const groupRef = useRef(null); // Reference to the group container that holds the model
  const scroll = useScroll();
  const targetRotation = useRef(new THREE.Vector3(0, 0, 0));
  const targetScale = useRef(1);
  const targetPosition = useRef(new THREE.Vector3(0, 0, 0));
  const [animationStarted, setAnimationStarted] = useState(false);
  const [isVisible, setIsVisible] = useState(false); // Track visibility
  const [animationTriggered, setAnimationTriggered] = useState(false); // Track if animation has been triggered

  const numSections = 6;
  const sectionHeight = 1 / numSections;

  const [lastUpdate, setLastUpdate] = useState(0);
  const throttleDelay = 30; // Reduced throttle delay for smoother animation

  // Memoized scroll update to prevent unnecessary re-renders
  const handleScrollUpdate = useCallback(() => {
    const newSection = Math.floor(scroll.offset * numSections);
    if (newSection !== currentSection) {
      setCurrentSection(newSection);
    }

    // Check if the current section is in the viewport
    const visibleSection = scroll.offset >= (currentSection / numSections) && scroll.offset < ((currentSection + 1) / numSections);
    setIsVisible(visibleSection);
  }, [scroll.offset, currentSection, numSections, setCurrentSection]);

  useEffect(() => {
    handleScrollUpdate();
  }, [scroll.offset, handleScrollUpdate]);

  // Initialize the animation once
  useEffect(() => {
    if (modelRef.current && !animationTriggered && isVisible) {
      // Ensure groupRef is correctly referencing an Object3D before applying gsap.set
      if (groupRef.current) {
        // If groupRef.current is an Object3D, we can safely manipulate it
        gsap.set(groupRef.current.rotation, { x: 0, y: 0 });
        gsap.set(groupRef.current.scale, { x: 1, y: 1, z: 1 });
      }

      // Start the animation on mount (only once) if the model is visible
      gsap.to(groupRef.current.rotation, { x: Math.PI, y: Math.PI, duration: 2 });
      setAnimationTriggered(true); // Ensure animation runs only once
    }
  }, [animationTriggered, isVisible]);

  // Scroll-driven updates to animation (rotation, scale, position)
  useFrame((state, delta) => {
    if (!isVisible) return; // Skip frame updates when model is not visible

    const now = Date.now();
    if (now - lastUpdate < throttleDelay) return; // Throttle frame updates
    setLastUpdate(now);

    const sectionRatio = scroll.offset;

    targetRotation.current.set(
      Math.PI * 2 * sectionRatio,
      Math.PI * 2 * sectionRatio,
      0
    );
    targetScale.current = 2 - sectionRatio * 1.3;
    targetPosition.current.set(0, -0.5 * (targetScale.current - 1), 0);

    if (groupRef.current) {
      // Apply smoother updates to group using gsap with fewer updates
      gsap.to(groupRef.current.rotation, {
        x: targetRotation.current.x,
        y: targetRotation.current.y,
        duration: 0.05,
        ease: "power3.out",
      });

      // Animate scale individually (workaround to prevent scale modification error)
      gsap.to(groupRef.current.scale, {
        x: targetScale.current,
        y: targetScale.current,
        z: targetScale.current,
        duration: 0.05,
        ease: "power3.out",
      });

      gsap.to(groupRef.current.position, {
        x: targetPosition.current.x,
        y: targetPosition.current.y,
        z: targetPosition.current.z,
        duration: 0.05,
        ease: "power3.out",
      });

      const { x, y, z } = groupRef.current.position;
      setPosition({ x, y, z });

      if (scroll.offset >= 1) {
        onComplete();
      }
    }
  });

  return (
    <group ref={groupRef}>
      <Model ref={modelRef} position={[0, 0, 0]} />
    </group>
  );
});
