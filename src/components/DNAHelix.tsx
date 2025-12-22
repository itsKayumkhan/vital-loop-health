import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

interface HelixStrandProps {
  offset: number;
}

const HelixStrand = ({ offset }: HelixStrandProps) => {
  const groupRef = useRef<THREE.Group>(null);
  
  const spheres = useMemo(() => {
    const items = [];
    const numSpheres = 24;
    const helixRadius = 1.5;
    const helixHeight = 10;
    const turns = 3;
    
    for (let i = 0; i < numSpheres; i++) {
      const t = (i / numSpheres) * Math.PI * 2 * turns;
      const y = (i / numSpheres - 0.5) * helixHeight;
      const x = Math.cos(t + offset) * helixRadius;
      const z = Math.sin(t + offset) * helixRadius;
      
      items.push({
        position: [x, y, z] as [number, number, number],
        scale: 0.18,
        color: '#48b275',
        emissive: '#48b275',
      });
    }
    return items;
  }, [offset]);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.25;
    }
  });

  return (
    <group ref={groupRef}>
      {spheres.map((sphere, i) => (
        <mesh key={i} position={sphere.position}>
          <sphereGeometry args={[sphere.scale, 20, 20]} />
          <MeshDistortMaterial
            color={sphere.color}
            emissive={sphere.emissive}
            emissiveIntensity={0.3}
            speed={1.5}
            distort={0.15}
            roughness={0.3}
            metalness={0.7}
          />
        </mesh>
      ))}
    </group>
  );
};

const ConnectingBars = () => {
  const groupRef = useRef<THREE.Group>(null);
  
  const bars = useMemo(() => {
    const items = [];
    const numBars = 12;
    const helixRadius = 1.5;
    const helixHeight = 10;
    const turns = 3;
    
    for (let i = 0; i < numBars; i++) {
      const t = (i / numBars) * Math.PI * 2 * turns;
      const y = (i / numBars - 0.5) * helixHeight;
      const x1 = Math.cos(t) * helixRadius;
      const z1 = Math.sin(t) * helixRadius;
      const x2 = Math.cos(t + Math.PI) * helixRadius;
      const z2 = Math.sin(t + Math.PI) * helixRadius;
      
      const midX = (x1 + x2) / 2;
      const midZ = (z1 + z2) / 2;
      const length = Math.sqrt((x2 - x1) ** 2 + (z2 - z1) ** 2);
      const angle = Math.atan2(z2 - z1, x2 - x1);
      
      items.push({
        position: [midX, y, midZ] as [number, number, number],
        rotation: [0, -angle, Math.PI / 2] as [number, number, number],
        length: length,
      });
    }
    return items;
  }, []);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.25;
    }
  });

  return (
    <group ref={groupRef}>
      {bars.map((bar, i) => (
        <mesh key={i} position={bar.position} rotation={bar.rotation}>
          <cylinderGeometry args={[0.04, 0.04, bar.length, 8]} />
          <meshStandardMaterial 
            color="#0a2e43"
            transparent 
            opacity={0.8}
            emissive="#48b275"
            emissiveIntensity={0.15}
          />
        </mesh>
      ))}
    </group>
  );
};

const GlowSphere = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      const scale = 1 + Math.sin(state.clock.elapsedTime * 1.5) * 0.08;
      meshRef.current.scale.setScalar(scale);
    }
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[4, 32, 32]} />
      <meshStandardMaterial
        color="#48b275"
        transparent
        opacity={0.03}
        emissive="#48b275"
        emissiveIntensity={0.05}
      />
    </mesh>
  );
};

const ParticleField = () => {
  const pointsRef = useRef<THREE.Points>(null);
  
  const particles = useMemo(() => {
    const positions = [];
    const count = 50;
    
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      const radius = 3 + Math.random() * 3;
      
      positions.push(
        radius * Math.sin(phi) * Math.cos(theta),
        (Math.random() - 0.5) * 12,
        radius * Math.sin(phi) * Math.sin(theta)
      );
    }
    
    return new Float32Array(positions);
  }, []);

  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = state.clock.elapsedTime * 0.05;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particles.length / 3}
          array={particles}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.08}
        color="#48b275"
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  );
};

const Scene = () => {
  return (
    <>
      <ambientLight intensity={0.3} />
      <pointLight position={[10, 10, 10]} intensity={1.2} color="#48b275" />
      <pointLight position={[-10, -10, -10]} intensity={0.4} color="#0a2e43" />
      <spotLight
        position={[0, 15, 5]}
        angle={0.4}
        penumbra={1}
        intensity={0.8}
        color="#48b275"
      />
      
      <Float
        speed={1.5}
        rotationIntensity={0.3}
        floatIntensity={0.4}
      >
        <HelixStrand offset={0} />
        <HelixStrand offset={Math.PI} />
        <ConnectingBars />
      </Float>
      
      <GlowSphere />
      <ParticleField />
    </>
  );
};

const DNAHelix = () => {
  return (
    <div className="w-full h-full absolute inset-0 helix-container opacity-60">
      <Canvas
        camera={{ position: [0, 0, 12], fov: 40 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <Scene />
      </Canvas>
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-transparent to-background/90" />
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-transparent via-transparent to-background/60" />
    </div>
  );
};

export default DNAHelix;
