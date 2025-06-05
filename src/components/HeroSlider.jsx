import React, { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, Play, Recycle } from "lucide-react";
import * as THREE from "three";

const HeroSlider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showRecycle, setShowRecycle] = useState(false);
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const meshRef = useRef(null);

  const slides = [
    {
      id: "grow",
      title: "GROW",
      subtitle:
        "Ketika tanaman tumbuh dengan memadukan nutrisi dan menyerap air dan nutrisi dari tanah untuk kebutuhan hidupnya yang akan hidup dengan sendirinya",
      image: "/images/grow.png",
      bgColor: "bg-green-600",
      textColor: "text-white",
      glbFile: "/models/tanaman.glb", // Path ke file .glb Anda
    },
    {
      id: "decay",
      title: "DECAY",
      subtitle:
        "Sampah organik yang telah busuk dipengaruhi dengan kondisi cuaca dan lingkungan menjadi kompos yang sangat berguna",
      image:
        "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=800&h=600&fit=crop",
      bgColor: "bg-orange-600",
      textColor: "text-white",
      isDecay: true,
      glbFile: "/models/plastik.glb", // Path ke file .glb Anda
    },
    {
      id: "flow",
      title: "FLOW",
      subtitle:
        "Aliran air yang mengalirkan keharmonisan dengan lingkungan yang diiringi dengan ketenangan hati dan jiwa kita",
      image: "/images/flow.png",
      bgColor: "bg-blue-600",
      textColor: "text-white",
      glbFile: "/models/air.glb", // Path ke file .glb Anda
    },
  ];

  const recycleSlide = {
    id: "recycle",
    title: "RECYCLE",
    subtitle:
      "Sampah organik yang telah busuk dipengaruhi dengan kondisi cuaca dan lingkungan dapat dimanfaatkan kembali dan tidak terbuang sia-sia",
    image:
      "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=800&h=600&fit=crop",
    bgColor: "bg-green-500",
    textColor: "text-white",
    glbFile: "/models/recycle.glb", // Path ke file .glb Anda
  };

  const nextSlide = () => {
    if (showRecycle) {
      setShowRecycle(false);
      setCurrentSlide(1); // Back to decay
    } else {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }
  };

  const prevSlide = () => {
    if (showRecycle) {
      setShowRecycle(false);
      setCurrentSlide(1); // Back to decay
    } else {
      setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    }
  };

  const openRecycle = () => {
    setShowRecycle(true);
  };

  // Auto-slide functionality (optional)
  useEffect(() => {
    if (!showRecycle) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
      }, 5000); // Change slide every 5 seconds

      return () => clearInterval(interval);
    }
  }, [showRecycle]);

  const currentData = showRecycle ? recycleSlide : slides[currentSlide];

  // Initialize Three.js scene
  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, 400 / 400, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });

    renderer.setSize(400, 400);
    renderer.setClearColor(0x000000, 0);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mountRef.current.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 5);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    // Load GLB model using fetch and manual parsing
    const currentData = showRecycle ? recycleSlide : slides[currentSlide];

    // For now, create a placeholder geometry while GLB loads
    // You can replace this with actual GLB loading implementation
    const createPlaceholderGeometry = (slideId) => {
      switch (slideId) {
        case "grow":
          return new THREE.SphereGeometry(1.5, 32, 32);
        case "decay":
          return new THREE.BoxGeometry(2, 2, 2);
        case "flow":
          return new THREE.TorusGeometry(1.2, 0.4, 16, 100);
        case "recycle":
          return new THREE.OctahedronGeometry(1.5);
        default:
          return new THREE.SphereGeometry(1.5, 32, 32);
      }
    };

    // Create placeholder mesh (replace with GLB loader when available)
    const geometry = createPlaceholderGeometry(currentData.id);
    const material = new THREE.MeshPhongMaterial({
      color:
        currentData.id === "grow"
          ? 0x4ade80
          : currentData.id === "decay"
          ? 0xea580c
          : currentData.id === "flow"
          ? 0x2563eb
          : 0x22c55e,
      shininess: 100,
      transparent: true,
      opacity: 0.7,
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    scene.add(mesh);

    camera.position.z = 5;

    // Store references
    sceneRef.current = scene;
    rendererRef.current = renderer;
    meshRef.current = mesh;

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);

      if (meshRef.current) {
        meshRef.current.rotation.x += 0.005;
        meshRef.current.rotation.y += 0.01;

        // Add floating animation
        meshRef.current.position.y = Math.sin(Date.now() * 0.001) * 0.2;
      }

      renderer.render(scene, camera);
    };
    animate();

    // Cleanup function
    return () => {
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, []);

  // Update 3D object when slide changes
  useEffect(() => {
    if (!sceneRef.current) return;

    // Clear previous model
    if (meshRef.current) {
      sceneRef.current.remove(meshRef.current);
      // Dispose of geometry and material
      if (meshRef.current.geometry) meshRef.current.geometry.dispose();
      if (meshRef.current.material) meshRef.current.material.dispose();
      meshRef.current = null;
    }

    const currentData = showRecycle ? recycleSlide : slides[currentSlide];

    // Create placeholder geometry (replace with GLB loader)
    const createPlaceholderGeometry = (slideId) => {
      switch (slideId) {
        case "grow":
          return new THREE.SphereGeometry(1.5, 32, 32);
        case "decay":
          return new THREE.BoxGeometry(2, 2, 2);
        case "flow":
          return new THREE.TorusGeometry(1.2, 0.4, 16, 100);
        case "recycle":
          return new THREE.OctahedronGeometry(1.5);
        default:
          return new THREE.SphereGeometry(1.5, 32, 32);
      }
    };

    const geometry = createPlaceholderGeometry(currentData.id);
    const material = new THREE.MeshPhongMaterial({
      color:
        currentData.id === "grow"
          ? 0x4ade80
          : currentData.id === "decay"
          ? 0xea580c
          : currentData.id === "flow"
          ? 0x2563eb
          : 0x22c55e,
      shininess: 100,
      transparent: true,
      opacity: 0.7,
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    sceneRef.current.add(mesh);
    meshRef.current = mesh;
  }, [currentSlide, showRecycle]);

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-700"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url(${currentData.image})`,
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex items-center justify-center h-full">
        <div className="text-center px-6 max-w-4xl mx-auto">
          {/* 3D Object Container - positioned behind title but above background */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 -z-10">
            <div
              ref={mountRef}
              className="w-96 h-96 opacity-30 hover:opacity-50 transition-opacity duration-500"
              style={{ filter: "blur(1px)" }}
            />
          </div>

          {/* Main Title - positioned above 3D object */}
          <h1
            className={`relative z-20 text-6xl md:text-8xl font-bold mb-6 ${currentData.textColor} tracking-wider drop-shadow-2xl`}
          >
            {currentData.title}
          </h1>

          {/* Subtitle */}
          <p
            className={`relative z-20 text-lg md:text-xl ${currentData.textColor} mb-8 max-w-2xl mx-auto leading-relaxed drop-shadow-lg`}
          >
            {currentData.subtitle}
          </p>

          {/* Action Buttons - positioned above everything */}
          <div className="relative z-30 flex flex-col sm:flex-row gap-4 items-center justify-center">
            {currentData.isDecay && !showRecycle ? (
              <button
                onClick={openRecycle}
                className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-full transition-colors duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <Recycle size={20} />
                Lihat Recycle
              </button>
            ) : (
              <button className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-full transition-colors duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105">
                <Play size={20} />
                Mulai Sekarang
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-6 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-3 rounded-full transition-all duration-300 z-20"
      >
        <ChevronLeft size={24} />
      </button>

      <button
        onClick={nextSlide}
        className="absolute right-6 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-3 rounded-full transition-all duration-300 z-20"
      >
        <ChevronRight size={24} />
      </button>

      {/* Slide Indicators */}
      {!showRecycle && (
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-3 z-20">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                currentSlide === index ? "bg-white" : "bg-white bg-opacity-50"
              }`}
            />
          ))}
        </div>
      )}

      {/* Current Slide Info */}
      <div className="absolute bottom-8 right-8 text-white text-sm z-20">
        {showRecycle ? "RECYCLE" : `${currentSlide + 1} / ${slides.length}`}
      </div>

      {/* Social Media Links (Optional) */}
      <div className="absolute left-8 bottom-1/2 transform translate-y-1/2 flex flex-col space-y-4 z-20">
        <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-white hover:bg-opacity-30 cursor-pointer transition-all duration-300">
          <span className="text-sm">f</span>
        </div>
        <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-white hover:bg-opacity-30 cursor-pointer transition-all duration-300">
          <span className="text-sm">t</span>
        </div>
        <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-white hover:bg-opacity-30 cursor-pointer transition-all duration-300">
          <span className="text-sm">ig</span>
        </div>
      </div>
    </div>
  );
};

export default HeroSlider;
