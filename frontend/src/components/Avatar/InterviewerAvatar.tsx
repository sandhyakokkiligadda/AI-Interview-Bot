import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { AvatarState, AvatarStyle } from '../../types';
import { Sparkles, Brain, Mic, Volume2, Smile, Award } from 'lucide-react';

interface InterviewerAvatarProps {
  state: AvatarState;
  visemeIntensity?: number; // 0 to 1, mouth openness from TTS
  avatarStyle?: AvatarStyle;
  className?: string;
  interviewerName?: string;
}

const AVATAR_PROFILES: Record<AvatarStyle, { name: string; title: string; skinColor: number; hairColor: number; eyeColor: number; accentColor: string }> = {
  eilik: {
    name: 'Eilik Robot',
    title: 'AI Proctored Interviewer',
    skinColor: 0xffffff,
    hairColor: 0x06b6d4,
    eyeColor: 0x06b6d4,
    accentColor: '#14b8a6'
  },
  elena: {
    name: 'Elena Vance',
    title: 'Senior Technical Lead',
    skinColor: 0xe8b898,
    hairColor: 0x2b1d16,
    eyeColor: 0x3b82f6,
    accentColor: '#6366f1'
  },
  priya: {
    name: 'Priya Sharma',
    title: 'Talent Acquisition & HR Lead',
    skinColor: 0xd49b74,
    hairColor: 0x1a110d,
    eyeColor: 0x5b3a29,
    accentColor: '#a855f7'
  },
  alex: {
    name: 'Alex Rivera',
    title: 'Principal Systems Architect',
    skinColor: 0xf0c8a5,
    hairColor: 0x3a3330,
    eyeColor: 0x10b981,
    accentColor: '#06b6d4'
  }
};

const STATE_BADGES: Record<AvatarState, { label: string; icon: React.ReactNode; color: string; ringColor: string }> = {
  idle: {
    label: 'Ready & Attentive',
    icon: <Sparkles className="w-3.5 h-3.5 text-slate-400" />,
    color: 'bg-slate-800/80 text-slate-300 border-slate-700',
    ringColor: 'rgba(99, 102, 241, 0.2)'
  },
  speaking: {
    label: 'Speaking Question...',
    icon: <Volume2 className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />,
    color: 'bg-indigo-950/80 text-indigo-300 border-indigo-500/40',
    ringColor: 'rgba(99, 102, 241, 0.7)'
  },
  listening: {
    label: 'Listening to Candidate...',
    icon: <Mic className="w-3.5 h-3.5 text-cyan-400 animate-bounce" />,
    color: 'bg-cyan-950/80 text-cyan-300 border-cyan-500/40',
    ringColor: 'rgba(6, 182, 212, 0.7)'
  },
  waiting: {
    label: 'Waiting for Answer...',
    icon: <Sparkles className="w-3.5 h-3.5 text-teal-400" />,
    color: 'bg-teal-950/80 text-teal-300 border-teal-500/40',
    ringColor: 'rgba(20, 184, 166, 0.6)'
  },
  thinking: {
    label: 'Analyzing Response...',
    icon: <Brain className="w-3.5 h-3.5 text-amber-400 animate-spin" />,
    color: 'bg-amber-950/80 text-amber-300 border-amber-500/40',
    ringColor: 'rgba(245, 158, 11, 0.6)'
  },
  encouraging: {
    label: 'Good Point!',
    icon: <Smile className="w-3.5 h-3.5 text-emerald-400" />,
    color: 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40',
    ringColor: 'rgba(16, 185, 129, 0.6)'
  },
  completed: {
    label: 'Interview Completed',
    icon: <Award className="w-3.5 h-3.5 text-violet-400" />,
    color: 'bg-violet-950/80 text-violet-300 border-violet-500/40',
    ringColor: 'rgba(168, 85, 247, 0.7)'
  }
};

export const InterviewerAvatar: React.FC<InterviewerAvatarProps> = ({
  state,
  visemeIntensity = 0,
  avatarStyle = 'elena',
  className = '',
  interviewerName
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const stateRef = useRef<AvatarState>(state);
  const visemeRef = useRef<number>(visemeIntensity);
  const profile = AVATAR_PROFILES[avatarStyle] || AVATAR_PROFILES.elena;

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    visemeRef.current = visemeIntensity;
  }, [visemeIntensity]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 360;
    const height = container.clientHeight || 420;

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 0.1, 3.2);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    container.replaceChildren(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffeedd, 1.4);
    keyLight.position.set(2, 3, 3);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x818cf8, 1.8);
    rimLight.position.set(-2, 2, -2);
    scene.add(rimLight);

    const fillLight = new THREE.DirectionalLight(0x06b6d4, 0.8);
    fillLight.position.set(0, -2, 2);
    scene.add(fillLight);

    // Character Group
    const characterGroup = new THREE.Group();
    scene.add(characterGroup);

    // Head
    const headGeo = new THREE.SphereGeometry(0.72, 32, 32);
    headGeo.scale(0.9, 1.05, 0.95);
    const skinMat = new THREE.MeshStandardMaterial({
      color: profile.skinColor,
      roughness: 0.6,
      metalness: 0.05
    });
    const head = new THREE.Mesh(headGeo, skinMat);
    head.position.y = 0.25;
    characterGroup.add(head);

    // Hair
    const hairGeo = new THREE.SphereGeometry(0.76, 24, 24);
    hairGeo.scale(0.94, 1.08, 0.98);
    const hairMat = new THREE.MeshStandardMaterial({
      color: profile.hairColor,
      roughness: 0.8,
      metalness: 0.1
    });
    const hair = new THREE.Mesh(hairGeo, hairMat);
    hair.position.set(0, 0.38, -0.06);
    characterGroup.add(hair);

    // Hair bang front
    const bangGeo = new THREE.CylinderGeometry(0.74, 0.72, 0.25, 20, 1, false, 0, Math.PI);
    const bang = new THREE.Mesh(bangGeo, hairMat);
    bang.rotation.x = -0.3;
    bang.rotation.z = Math.PI;
    bang.position.set(0, 0.78, 0.3);
    characterGroup.add(bang);

    // Neck & Torso (Professional Suit / Blazer)
    const neckGeo = new THREE.CylinderGeometry(0.24, 0.3, 0.45, 16);
    const neck = new THREE.Mesh(neckGeo, skinMat);
    neck.position.y = -0.35;
    characterGroup.add(neck);

    const suitGeo = new THREE.CylinderGeometry(0.65, 0.95, 0.9, 24);
    const suitMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.7,
      metalness: 0.1
    });
    const suit = new THREE.Mesh(suitGeo, suitMat);
    suit.position.y = -0.9;
    characterGroup.add(suit);

    // Collar / Shirt
    const shirtGeo = new THREE.ConeGeometry(0.4, 0.5, 3);
    const shirtMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.5 });
    const shirt = new THREE.Mesh(shirtGeo, shirtMat);
    shirt.position.set(0, -0.55, 0.48);
    shirt.rotation.x = 0.25;
    characterGroup.add(shirt);

    // Eyes Group
    const eyesGroup = new THREE.Group();
    characterGroup.add(eyesGroup);

    const eyeWhiteMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2 });
    const irisMat = new THREE.MeshStandardMaterial({ color: profile.eyeColor, roughness: 0.4 });
    const pupilMat = new THREE.MeshBasicMaterial({ color: 0x050505 });

    const createEye = (x: number) => {
      const eyePivot = new THREE.Group();
      eyePivot.position.set(x, 0.36, 0.58);

      const sclera = new THREE.Mesh(new THREE.SphereGeometry(0.11, 16, 16), eyeWhiteMat);
      sclera.scale.set(1.2, 0.9, 0.7);
      eyePivot.add(sclera);

      const iris = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.065, 0.05, 16), irisMat);
      iris.rotation.x = Math.PI / 2;
      iris.position.z = 0.07;
      eyePivot.add(iris);

      const pupil = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.06, 12), pupilMat);
      pupil.rotation.x = Math.PI / 2;
      pupil.position.z = 0.075;
      eyePivot.add(pupil);

      // Eyelid for blinking
      const eyelidGeo = new THREE.SphereGeometry(0.12, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2);
      const eyelid = new THREE.Mesh(eyelidGeo, skinMat);
      eyelid.rotation.x = -Math.PI / 2;
      eyelid.position.z = 0.01;
      eyelid.scale.set(1.25, 1.0, 0.75);
      eyelid.visible = false;
      eyePivot.add(eyelid);

      return { pivot: eyePivot, eyelid };
    };

    const leftEye = createEye(-0.24);
    const rightEye = createEye(0.24);
    eyesGroup.add(leftEye.pivot);
    eyesGroup.add(rightEye.pivot);

    // Eyebrows
    const browGeo = new THREE.BoxGeometry(0.22, 0.035, 0.04);
    const browMat = new THREE.MeshStandardMaterial({ color: profile.hairColor, roughness: 0.9 });
    const leftBrow = new THREE.Mesh(browGeo, browMat);
    leftBrow.position.set(-0.24, 0.51, 0.62);
    leftBrow.rotation.z = 0.08;
    characterGroup.add(leftBrow);

    const rightBrow = new THREE.Mesh(browGeo, browMat);
    rightBrow.position.set(0.24, 0.51, 0.62);
    rightBrow.rotation.z = -0.08;
    characterGroup.add(rightBrow);

    // Mouth
    const mouthGeo = new THREE.TorusGeometry(0.12, 0.035, 12, 24, Math.PI);
    const mouthMat = new THREE.MeshStandardMaterial({ color: 0x9f3e4b, roughness: 0.5 });
    const mouth = new THREE.Mesh(mouthGeo, mouthMat);
    mouth.position.set(0, 0.08, 0.62);
    mouth.rotation.x = 0.35;
    mouth.rotation.z = Math.PI;
    characterGroup.add(mouth);

    // Floating Halo / Soundwave Ring
    const ringGeo = new THREE.TorusGeometry(1.35, 0.025, 16, 64);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x6366f1,
      transparent: true,
      opacity: 0.45
    });
    const haloRing = new THREE.Mesh(ringGeo, ringMat);
    haloRing.rotation.x = Math.PI / 2.2;
    haloRing.position.y = 0.25;
    scene.add(haloRing);

    // Orbiting particles for thinking/completed
    const particlesCount = 36;
    const particlesGeo = new THREE.BufferGeometry();
    const posArray = new Float32Array(particlesCount * 3);
    for (let i = 0; i < particlesCount * 3; i += 3) {
      const angle = (i / (particlesCount * 3)) * Math.PI * 2;
      const r = 1.35 + (Math.random() - 0.5) * 0.3;
      posArray[i] = Math.cos(angle) * r;
      posArray[i + 1] = (Math.random() - 0.5) * 0.4 + 0.25;
      posArray[i + 2] = Math.sin(angle) * r;
    }
    particlesGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const particlesMat = new THREE.PointsMaterial({
      size: 0.04,
      color: 0x06b6d4,
      transparent: true,
      opacity: 0.6
    });
    const particlePoints = new THREE.Points(particlesGeo, particlesMat);
    scene.add(particlePoints);

    // Animation variables
    let clock = new THREE.Clock();
    let blinkTimer = 0;
    let isBlinking = false;
    let nextBlinkInterval = 3.5;
    let animId: number;

    const animate = () => {
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();
      const currentState = stateRef.current;
      const currentViseme = visemeRef.current;

      // Natural blinking
      blinkTimer += delta;
      if (blinkTimer > nextBlinkInterval) {
        isBlinking = true;
        leftEye.eyelid.visible = true;
        rightEye.eyelid.visible = true;
        if (blinkTimer > nextBlinkInterval + 0.16) {
          isBlinking = false;
          leftEye.eyelid.visible = false;
          rightEye.eyelid.visible = false;
          blinkTimer = 0;
          nextBlinkInterval = 2.8 + Math.random() * 3.0;
        }
      }

      // Natural breathing sway
      const breathing = Math.sin(elapsed * 1.5) * 0.02;
      characterGroup.position.y = breathing;

      // Halo rotation
      haloRing.rotation.z = elapsed * 0.3;
      particlePoints.rotation.y = elapsed * 0.25;

      // State-specific expressions & kinematics
      if (currentState === 'speaking') {
        // Mouth movement driven by viseme intensity
        const openness = Math.max(0.1, currentViseme || Math.abs(Math.sin(elapsed * 12)) * 0.7);
        mouth.scale.set(1.0, 1.0 + openness * 2.2, 1.0 + openness * 0.6);
        mouth.position.y = 0.08 - openness * 0.04;

        // Subtle head emphasis nod
        characterGroup.rotation.x = Math.sin(elapsed * 4) * 0.04;
        characterGroup.rotation.y = Math.sin(elapsed * 1.8) * 0.06;

        ringMat.color.setHex(0x6366f1);
        ringMat.opacity = 0.75 + Math.sin(elapsed * 6) * 0.2;
        haloRing.scale.setScalar(1.0 + openness * 0.08);

      } else if (currentState === 'listening') {
        // Attentive tilt: slightly tilted head towards candidate
        characterGroup.rotation.z = 0.06;
        characterGroup.rotation.x = 0.04;
        characterGroup.rotation.y = Math.sin(elapsed * 1.2) * 0.03;

        // Subtle calm mouth
        mouth.scale.set(1.0, 0.9, 1.0);
        mouth.position.y = 0.08;

        // Eyebrows slightly lifted attentively
        leftBrow.position.y = 0.52;
        rightBrow.position.y = 0.52;

        ringMat.color.setHex(0x06b6d4);
        ringMat.opacity = 0.8 + Math.sin(elapsed * 4) * 0.2;
        haloRing.scale.setScalar(1.02 + Math.sin(elapsed * 3) * 0.03);

      } else if (currentState === 'thinking') {
        // Pondering look: tilted up and to the right
        characterGroup.rotation.x = -0.06;
        characterGroup.rotation.y = 0.12;
        characterGroup.rotation.z = -0.03;

        leftEye.pivot.rotation.x = -0.15;
        rightEye.pivot.rotation.x = -0.15;
        leftEye.pivot.rotation.y = 0.15;
        rightEye.pivot.rotation.y = 0.15;

        // Puzzled / contemplating eyebrows
        leftBrow.position.y = 0.53;
        rightBrow.position.y = 0.49;

        mouth.scale.set(0.85, 0.7, 1.0);

        ringMat.color.setHex(0xf59e0b);
        ringMat.opacity = 0.65;
        particlePoints.rotation.y = elapsed * 1.2; // faster thinking particles

      } else if (currentState === 'encouraging') {
        // Warm smile
        mouth.scale.set(1.2, 1.3, 1.0);
        mouth.position.y = 0.09;
        characterGroup.rotation.x = Math.sin(elapsed * 3) * 0.03; // supportive nod
        characterGroup.rotation.y = 0;
        characterGroup.rotation.z = 0;

        leftBrow.position.y = 0.52;
        rightBrow.position.y = 0.52;

        ringMat.color.setHex(0x10b981);
        ringMat.opacity = 0.7;

      } else if (currentState === 'completed') {
        // Congratulatory stance
        mouth.scale.set(1.25, 1.4, 1.0);
        characterGroup.rotation.x = 0;
        characterGroup.rotation.y = Math.sin(elapsed * 1.5) * 0.08;

        ringMat.color.setHex(0xa855f7);
        ringMat.opacity = 0.85;
        haloRing.scale.setScalar(1.05 + Math.sin(elapsed * 2) * 0.05);

      } else {
        // Idle
        characterGroup.rotation.x = Math.sin(elapsed * 0.8) * 0.02;
        characterGroup.rotation.y = Math.sin(elapsed * 0.6) * 0.03;
        characterGroup.rotation.z = 0;

        mouth.scale.set(1.0, 1.0, 1.0);
        mouth.position.y = 0.08;

        leftBrow.position.y = 0.51;
        rightBrow.position.y = 0.51;

        leftEye.pivot.rotation.set(0, 0, 0);
        rightEye.pivot.rotation.set(0, 0, 0);

        ringMat.color.setHex(0x6366f1);
        ringMat.opacity = 0.35 + Math.sin(elapsed) * 0.1;
      }

      renderer.render(scene, camera);
      animId = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
      renderer.dispose();
      headGeo.dispose();
      skinMat.dispose();
    };
  }, [profile]);

  const badge = STATE_BADGES[state] || STATE_BADGES.idle;

  return (
    <div className={`relative flex flex-col items-center justify-center ${className}`}>
      {/* Ambient background glow ring */}
      <div
        className="absolute inset-0 rounded-3xl blur-2xl transition-all duration-700 pointer-events-none"
        style={{
          background: `radial-gradient(circle at center, ${badge.ringColor} 0%, transparent 70%)`
        }}
      />

      {/* 3D Canvas Container */}
      <div
        ref={mountRef}
        className="relative w-full h-80 sm:h-96 rounded-2xl overflow-hidden glass-panel flex items-center justify-center shadow-2xl"
      />

      {/* Floating Interviewer Name & State Badge */}
      <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/80 backdrop-blur-md border border-slate-700/60 shadow-lg text-xs">
        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
        <span className="font-semibold text-slate-200">
          {interviewerName || profile.name}
        </span>
        <span className="text-slate-400 text-[10px] hidden sm:inline">• {profile.title}</span>
      </div>

      {/* Active State Badge */}
      <div
        className={`absolute bottom-4 flex items-center gap-2 px-3.5 py-1.5 rounded-full border shadow-xl text-xs font-medium backdrop-blur-md transition-all duration-300 ${badge.color}`}
      >
        {badge.icon}
        <span>{badge.label}</span>
      </div>
    </div>
  );
};
