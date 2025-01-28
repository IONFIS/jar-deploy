"use client";

import React, {
  useRef,
  useEffect,
  Suspense,
  useCallback,
  useState,
} from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  ScrollControls,
  Environment,
  AdaptiveDpr,
  AdaptiveEvents,
  PerformanceMonitor,
  useScroll,
} from "@react-three/drei";
import { Model } from "./Model";
import gsap from "gsap";
import { useDispatch, useSelector } from "react-redux";
import {
  setAnimationComplete,
  setPosition,
  setCurrentSection,
  selectAnimationState,
} from "@/app/redux/slice";
import * as THREE from "three";

const isMobile = typeof window !== "undefined" && window.innerWidth <= 768;

export default function App() {
  const dispatch = useDispatch();
  const { animationComplete, position, currentSection } =
    useSelector(selectAnimationState);

  useEffect(() => {
    document.body.style.overflow = animationComplete ? "auto" : "hidden";
  }, [animationComplete]);

  return (
    <div
      style={{
        height: "100vh",
        width: "100vw",
        position: "relative",
        overflow: "hidden",
      }}
    >
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
            shadows={false}
            dpr={isMobile ? [1, 1.25] : [1, 2]} // Resolution change
            gl={{ antialias: !isMobile }}
            camera={{
              fov: isMobile ? 35 : 40,
              position: [8, 3, 8],
              near: 0.1,
              far: 100,
            }}
          >
            <AdaptiveDpr pixelated />
            <AdaptiveEvents />
            <ambientLight intensity={0.5} />
            <directionalLight position={[5, 10, 5]} intensity={1.2} />
            <PerformanceMonitor
              onFallback={() => console.log("Performance dropped!")}
            >
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
            </PerformanceMonitor>
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

function AnimatedModel({
  dispatch,
  onComplete,
  setPosition,
  currentSection,
  setCurrentSection,
}) {
  const modelRef = useRef(null);
  const scroll = useScroll();
  const targetRotation = useRef(new THREE.Vector3(0, 0, 0));
  const targetScale = useRef(1);
  const targetPosition = useRef(new THREE.Vector3(0, 0, 0));
  const [animationStarted, setAnimationStarted] = useState(false);
  const [isVisible, setIsVisible] = useState(false); // Track visibility
  const [animationTriggered, setAnimationTriggered] = useState(false); // Track if animation has been triggered

  const numSections = 6;
  const throttleDelay = 50; // Frame rate change karne ke liye
  const [lastUpdate, setLastUpdate] = useState(0);

  const throttle = (fn, delay) => {
    let lastCall = 0;
    return (...args) => {
      const now = Date.now();
      if (now - lastCall < delay) return;
      lastCall = now;
      return fn(...args);
    };
  };

  const handleScrollUpdate = useCallback(
    throttle(() => {
      const newSection = Math.floor(scroll.offset * numSections);
      if (newSection !== currentSection) {
        setCurrentSection(newSection);
      }
    }, throttleDelay),
    [scroll.offset, currentSection, numSections, setCurrentSection]
  );

  useEffect(() => {
    handleScrollUpdate();
  }, [scroll.offset, handleScrollUpdate]);

  useFrame(() => {
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
        duration: 0.2,
        ease: "power3.out",
      });
      gsap.to(modelRef.current.scale, {
        x: targetScale.current,
        y: targetScale.current,
        z: targetScale.current,
        duration: 0.2,
        ease: "power3.out",
      });
      gsap.to(modelRef.current.position, {
        x: targetPosition.current.x,
        y: targetPosition.current.y,
        z: targetPosition.current.z,
        duration: 0.2,
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

  return <Model ref={modelRef} position={[0, 0, 0]} />;
}
