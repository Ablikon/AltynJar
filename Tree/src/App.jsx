import { useState, useEffect, Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, PerspectiveCamera, MeshTransmissionMaterial, Float, Sparkles } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import * as THREE from 'three';
import './App.css';

// Оптимизация стеклянной банки
function GlassJar({ isMobile }) {
  const samples = isMobile ? 16 : 32;
  const resolution = isMobile ? 512 : 1024;
  
  return (
    <group position={[0, 0, 0]}>
      {/* Основное тело */}
      <mesh castShadow receiveShadow position={[0, 0, 0]}>
        <cylinderGeometry args={[1.8, 2, 3.5, 64, 1]} />
        <MeshTransmissionMaterial
          backside
          samples={samples}
          resolution={resolution}
          transmission={0.98}
          roughness={0.02}
          thickness={0.3}
          ior={1.52}
          chromaticAberration={0.03}
          anisotropy={0.5}
          distortion={0.05}
          distortionScale={0.1}
          temporalDistortion={0.05}
          color="#ffffff"
          attenuationDistance={2}
          attenuationColor="#e8f4f8"
        />
      </mesh>
      
      {/* Горлышко */}
      <mesh position={[0, 2, 0]} castShadow>
        <cylinderGeometry args={[1.3, 1.4, 0.5, 64]} />
        <MeshTransmissionMaterial
          backside
          samples={samples}
          resolution={resolution}
          transmission={0.98}
          roughness={0.02}
          thickness={0.2}
          ior={1.52}
          chromaticAberration={0.03}
          color="#ffffff"
        />
      </mesh>
      
      {/* Золотая крышка с текстурой */}
      <mesh position={[0, 2.5, 0]} castShadow>
        <cylinderGeometry args={[1.45, 1.45, 0.25, 64]} />
        <meshStandardMaterial 
          color="#d4af37"
          metalness={1}
          roughness={0.15}
          envMapIntensity={2}
        />
      </mesh>
      
      {/* Ободок крышки */}
      <mesh position={[0, 2.4, 0]} castShadow>
        <torusGeometry args={[1.45, 0.08, 16, 64]} />
        <meshStandardMaterial 
          color="#b8941f"
          metalness={0.95}
          roughness={0.2}
        />
      </mesh>
      
      {/* Ручка */}
      <mesh position={[0, 2.75, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <torusGeometry args={[0.35, 0.12, 16, 32]} />
        <meshStandardMaterial 
          color="#d4af37"
          metalness={1}
          roughness={0.15}
        />
      </mesh>
      
      {/* Дно */}
      <mesh position={[0, -1.75, 0]} receiveShadow>
        <cylinderGeometry args={[2, 2, 0.15, 64]} />
        <MeshTransmissionMaterial
          backside
          samples={isMobile ? 8 : 16}
          resolution={isMobile ? 256 : 512}
          transmission={0.95}
          roughness={0.05}
          thickness={0.4}
          ior={1.52}
          color="#ffffff"
        />
      </mesh>
    </group>
  );
}

// Оптимизация записок
function FloatingNote({ text, index, total, color, type, photo, isMobile }) {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);
  const [texture, setTexture] = useState(null);
  
  const angle = (index / total) * Math.PI * 2;
  const radius = 0.8 + Math.random() * 0.4;
  const height = -0.8 + Math.random() * 1.8;
  
  // Загрузка текстуры если есть фото
  useEffect(() => {
    if (photo) {
      const loader = new THREE.TextureLoader();
      
      // Проверяем, это base64 или URL
      if (photo.startsWith('data:image')) {
        // Это base64 - загружаем напрямую
        loader.load(
          photo,
          (loadedTexture) => {
            setTexture(loadedTexture);
          },
          undefined,
          (error) => {
            console.error('Error loading base64 texture:', error);
          }
        );
      } else {
        // Это URL - добавляем API URL
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
        loader.load(
          `${apiUrl}${photo}`,
          (loadedTexture) => {
            setTexture(loadedTexture);
          },
          undefined,
          (error) => {
            console.error('Error loading URL texture:', error);
          }
        );
      }
    }
  }, [photo]);
  
  useFrame((state) => {
    if (meshRef.current) {
      const time = state.clock.getElapsedTime();
      meshRef.current.position.x = Math.cos(angle + time * 0.15) * radius;
      meshRef.current.position.z = Math.sin(angle + time * 0.15) * radius;
      meshRef.current.position.y = height + Math.sin(time * 0.4 + index) * 0.15;
      
      meshRef.current.rotation.x = Math.sin(time * 0.25 + index) * 0.2;
      meshRef.current.rotation.y = time * 0.15 + index;
      meshRef.current.rotation.z = Math.cos(time * 0.3 + index) * 0.15;
      
      if (hovered) {
        meshRef.current.scale.lerp(new THREE.Vector3(1.3, 1.3, 1.3), 0.15);
      } else {
        meshRef.current.scale.lerp(new THREE.Vector3(1, 1, 1), 0.15);
      }
    }
  });
  
  return (
    <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.5}>
      <mesh 
        ref={meshRef}
        castShadow={!isMobile}
        receiveShadow={!isMobile}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <boxGeometry args={photo ? [0.6, 0.6, 0.02] : [0.5, 0.35, 0.015]} />
        {texture ? (
          <meshStandardMaterial 
            map={texture}
            roughness={0.6}
            metalness={0.05}
            emissive={hovered ? '#ffffff' : '#000000'}
            emissiveIntensity={hovered ? 0.2 : 0}
          />
        ) : (
          <meshStandardMaterial 
            color={color}
            roughness={0.6}
            metalness={0.05}
            emissive={hovered ? color : '#000000'}
            emissiveIntensity={hovered ? 0.4 : 0}
          />
        )}
      </mesh>
    </Float>
  );
}

// Оптимизация сердечек
function FloatingHearts({ count = 20 }) {
  const heartsRef = useRef();
  
  const hearts = Array.from({ length: count }, (_, i) => ({
    position: [
      (Math.random() - 0.5) * 10,
      Math.random() * 8 - 2,
      (Math.random() - 0.5) * 10
    ],
    scale: 0.1 + Math.random() * 0.15,
    speed: 0.5 + Math.random() * 0.5,
    offset: Math.random() * Math.PI * 2
  }));
  
  useFrame((state) => {
    if (heartsRef.current) {
      heartsRef.current.children.forEach((heart, i) => {
        const time = state.clock.getElapsedTime();
        const config = hearts[i];
        
        heart.position.x = config.position[0] + Math.sin(time * config.speed + config.offset) * 2;
        heart.position.y = config.position[1] + Math.sin(time * config.speed * 0.5) * 1.5;
        heart.position.z = config.position[2] + Math.cos(time * config.speed + config.offset) * 2;
        
        heart.rotation.y = time * 0.5;
        heart.rotation.z = Math.sin(time * config.speed) * 0.2;
      });
    }
  });
  
  // SVG сердечка в 3D
  const heartShape = new THREE.Shape();
  heartShape.moveTo(0, 0);
  heartShape.bezierCurveTo(0, -0.3, -0.6, -0.3, -0.6, 0);
  heartShape.bezierCurveTo(-0.6, 0.3, 0, 0.6, 0, 1);
  heartShape.bezierCurveTo(0, 0.6, 0.6, 0.3, 0.6, 0);
  heartShape.bezierCurveTo(0.6, -0.3, 0, -0.3, 0, 0);
  
  const extrudeSettings = {
    depth: 0.2,
    bevelEnabled: true,
    bevelThickness: 0.05,
    bevelSize: 0.05,
    bevelSegments: 3
  };
  
  return (
    <group ref={heartsRef}>
      {hearts.map((heart, i) => (
        <Float key={i} speed={2} rotationIntensity={0.5} floatIntensity={1}>
          <mesh 
            position={heart.position} 
            scale={heart.scale}
            castShadow
          >
            <extrudeGeometry args={[heartShape, extrudeSettings]} />
            <meshStandardMaterial 
              color={i % 3 === 0 ? '#ff69b4' : i % 3 === 1 ? '#ffd700' : '#87ceeb'}
              emissive={i % 3 === 0 ? '#ff69b4' : i % 3 === 1 ? '#ffd700' : '#87ceeb'}
              emissiveIntensity={0.3}
              roughness={0.4}
              metalness={0.2}
            />
          </mesh>
        </Float>
      ))}
    </group>
  );
}

function Scene({ notes, isMobile }) {
  const colors = {
    good: '#ffd700',
    wish: '#ff69b4',
    memory: '#87ceeb'
  };
  
  // Небольшая оптимизация только для мобильных
  const cameraPosition = isMobile ? [0, 0, 11] : [0, 0, 9];
  
  return (
    <>
      <PerspectiveCamera makeDefault position={cameraPosition} fov={isMobile ? 60 : 50} />
      
      <color attach="background" args={['#8B7FC7']} />
      <fog attach="fog" args={['#8B7FC7', 8, 20]} />
      
      <ambientLight intensity={0.4} />
      <directionalLight 
        position={[8, 12, 5]} 
        intensity={1.2} 
        castShadow
        shadow-mapSize-width={isMobile ? 1024 : 2048}
        shadow-mapSize-height={isMobile ? 1024 : 2048}
      />
      <pointLight position={[-8, -8, -5]} intensity={0.6} color="#ff69b4" />
      <pointLight position={[8, 5, 8]} intensity={0.4} color="#87ceeb" />
      <spotLight 
        position={[0, 15, 0]} 
        angle={0.4} 
        penumbra={1} 
        intensity={1}
        castShadow
        shadow-mapSize-width={isMobile ? 1024 : 2048}
        shadow-mapSize-height={isMobile ? 1024 : 2048}
      />
      
      <GlassJar isMobile={isMobile} />
      
      {notes.map((note, i) => (
        <FloatingNote
          key={note.id}
          text={note.text}
          index={i}
          total={notes.length}
          color={colors[note.type] || colors.good}
          type={note.type}
          photo={note.photo}
        />
      ))}
      
      <FloatingHearts />
      
      <Sparkles 
        count={150} 
        scale={8} 
        size={3} 
        speed={0.3}
        opacity={0.6}
        color="#ffd700"
      />
      
      <Environment preset="sunset" />
      <OrbitControls 
        enableZoom={false}
        enablePan={false}
        minPolarAngle={Math.PI / 3}
        maxPolarAngle={Math.PI / 1.8}
        autoRotate
        autoRotateSpeed={0.8}
        dampingFactor={0.05}
        rotateSpeed={0.5}
      />
    </>
  );
}

function App() {
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [noteType, setNoteType] = useState('good');
  const [isMobile, setIsMobile] = useState(false);
  const [showDrawer, setShowDrawer] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    fetchNotes();
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const fetchNotes = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || '';
      const res = await fetch(`${apiUrl}/api/notes`);
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const data = await res.json();
      
      // Проверяем что data это массив
      if (Array.isArray(data)) {
        setNotes(data);
      } else {
        console.error('API returned non-array data:', data);
        setNotes([]);
      }
    } catch (error) {
      console.error('Error fetching notes:', error);
      setNotes([]);
    }
  };

  const handlePhotoSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedPhoto(file);
      
      // Сжимаем изображение
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          // Максимальные размеры
          const MAX_WIDTH = 800;
          const MAX_HEIGHT = 800;
          
          let width = img.width;
          let height = img.height;
          
          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          ctx.drawImage(img, 0, 0, width, height);
          
          // Конвертируем в base64 с качеством 0.7
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
          setPhotoPreview(compressedBase64);
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = () => {
    setSelectedPhoto(null);
    setPhotoPreview(null);
  };

  const addNote = async () => {
    if (!newNote.trim()) return;
    
    const apiUrl = import.meta.env.VITE_API_URL || '';
    
    // Отправляем base64 вместо FormData
    await fetch(`${apiUrl}/api/notes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        text: newNote, 
        type: noteType,
        photo: photoPreview || null  // base64 строка
      }),
    });
    
    setNewNote('');
    setSelectedPhoto(null);
    setPhotoPreview(null);
    setShowForm(false);
    fetchNotes();
  };

  const deleteNote = async (id) => {
    if (!confirm('Удалить эту записку?')) return;
    
    const apiUrl = import.meta.env.VITE_API_URL || '';
    await fetch(`${apiUrl}/api/notes/${id}`, {
      method: 'DELETE',
    });
    
    fetchNotes();
  };

  return (
    <div className="app-container">
      <div className="canvas-container">
        <Canvas 
          shadows 
          dpr={isMobile ? [1, 1.5] : [1, 2]} // Меньше пикселей на мобильных
          gl={{ 
            antialias: true,
            alpha: false,
            powerPreference: "high-performance",
            stencil: false,
            depth: true
          }}
          performance={{ min: 0.5 }} // Автоматическое снижение качества при лагах
        >
          <Suspense fallback={null}>
            <Scene notes={notes} isMobile={isMobile} />
          </Suspense>
        </Canvas>
        
        <div className="jar-overlay">
          <motion.div 
            className="jar-title"
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          >
            <h1>✨ Good Things ✨</h1>
            <p>{notes.length} записок счастья</p>
          </motion.div>
        </div>
      </div>

      {/* Кнопка списка записок */}
      {notes.length > 0 && (
        <motion.button 
          className="drawer-toggle"
          onClick={() => setShowDrawer(!showDrawer)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <span>📝</span>
          <span className="drawer-count">{notes.length}</span>
        </motion.button>
      )}

      {/* Кнопка добавления */}
      <motion.button 
        className="fab-button"
        onClick={() => setShowForm(!showForm)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        {showForm ? '✕' : '+'}
      </motion.button>

      {/* Форма добавления записки */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowForm(false)}
          >
            <motion.div
              className="modal-content"
              initial={{ scale: 0.8, y: 100, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.8, y: 100, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h2>Добавить записку</h2>
              
              <div className="note-types">
                <button
                  className={noteType === 'good' ? 'active good' : ''}
                  onClick={() => setNoteType('good')}
                >
                  <span>💛</span>
                  <span>Хорошее</span>
                </button>
                <button
                  className={noteType === 'wish' ? 'active wish' : ''}
                  onClick={() => setNoteType('wish')}
                >
                  <span>💗</span>
                  <span>Желание</span>
                </button>
                <button
                  className={noteType === 'memory' ? 'active memory' : ''}
                  onClick={() => setNoteType('memory')}
                >
                  <span>💙</span>
                  <span>Память</span>
                </button>
              </div>

              {photoPreview && (
                <div className="photo-preview">
                  <img src={photoPreview} alt="Preview" />
                  <button onClick={removePhoto} className="remove-photo">✕</button>
                </div>
              )}

              {!photoPreview && (
                <label className="photo-upload">
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handlePhotoSelect}
                    hidden
                  />
                  <span>📷 Добавить фото</span>
                </label>
              )}
              
              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Напишите что-то приятное..."
                rows={6}
                maxLength={500}
              />
              
              <div className="char-count">{newNote.length}/500</div>
              
              <button onClick={addNote} className="submit-button">
                Добавить в банку ✨
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Выдвижная панель со списком */}
      <AnimatePresence>
        {showDrawer && (
          <>
            <motion.div
              className="drawer-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDrawer(false)}
            />
            <motion.div
              className="notes-drawer-mobile"
              initial={isMobile ? { y: '100%' } : { x: '-100%' }}
              animate={isMobile ? { y: 0 } : { x: 0 }}
              exit={isMobile ? { y: '100%' } : { x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            >
              <div className="drawer-header">
                <h3>Все записки</h3>
                <div className="drawer-actions">
                  <span className="count-badge">{notes.length}</span>
                  <button className="close-drawer" onClick={() => setShowDrawer(false)}>✕</button>
                </div>
              </div>
              <div className="notes-list">
                {notes.map((note) => (
                  <motion.div
                    key={note.id}
                    className={`note-item ${note.type}`}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ scale: 1.02 }}
                    layout
                  >
                    {note.photo ? (
                      <div className="note-photo">
                        <img src={note.photo} alt={note.text} />
                      </div>
                    ) : (
                      <span className="note-emoji">
                        {note.type === 'good' && '💛'}
                        {note.type === 'wish' && '💗'}
                        {note.type === 'memory' && '💙'}
                      </span>
                    )}
                    <div className="note-content">
                      <p>{note.text}</p>
                      <span className="note-date">
                        {new Date(note.created_at).toLocaleDateString('ru-RU', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                    <button 
                      className="delete-note-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNote(note.id);
                      }}
                      title="Удалить записку"
                    >
                      ✕
                    </button>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
