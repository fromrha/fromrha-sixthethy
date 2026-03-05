import { useState } from 'react'
import { Canvas } from '@react-three/fiber'
import Scene from './components/Scene'
import brandLogo from './assets/brand-fromrha-logomark-fff.svg'
import shinrinyokuLogo from './assets/brand-shinrinyoku-logomark-fff.svg'

function App() {
  const [isLogoHovered, setIsLogoHovered] = useState(false)

  return (

    <>
      {/* Top Navbar Placeholder with Blur */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '120px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          padding: '24px 40px',
          zIndex: 20,
          pointerEvents: 'none',
        }}
      >
        {/* Fading Blur Background */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'linear-gradient(to bottom, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 100%)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            maskImage: 'linear-gradient(to bottom, black 40%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to bottom, black 40%, transparent 100%)',
            zIndex: -1,
          }}
        />

        {/* Content Container */}
        <div style={{
          display: 'flex',
          width: '100%',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          fontFamily: 'monospace, sans-serif',
          color: '#fff',
          fontSize: '11px',
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}>

          {/* Logo (Left) with Barrel/Cylinder Animation */}
          <div style={{ flex: 1, display: 'flex', alignItems: 'flex-start' }}>
            <div
              style={{
                pointerEvents: 'auto',
                cursor: 'pointer',
                perspective: '1000px',
                height: '32px'
              }}
              onMouseEnter={() => setIsLogoHovered(true)}
              onMouseLeave={() => setIsLogoHovered(false)}
            >
              <div
                style={{
                  position: 'relative',
                  height: '100%',
                  transition: 'transform 0.6s cubic-bezier(0.76, 0, 0.24, 1)',
                  transformStyle: 'preserve-3d',
                  transform: isLogoHovered ? 'translateZ(-16px) rotateX(-90deg)' : 'translateZ(-16px) rotateX(0deg)'
                }}
              >
                {/* Invisible footprint gives container its natural width so hover boundary is tight */}
                <img src={brandLogo} alt="" style={{ height: '32px', visibility: 'hidden', pointerEvents: 'none' }} />

                {/* Front face (FromRHA) */}
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  backfaceVisibility: 'hidden',
                  transform: 'rotateX(0deg) translateZ(16px)'
                }}>
                  <img src={brandLogo} alt="FromRHA Logo" style={{ height: '32px', display: 'block' }} />
                </div>

                {/* Top face (Shinrinyoku) - Rolls down into view */}
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  backfaceVisibility: 'hidden',
                  transform: 'rotateX(90deg) translateZ(16px)',
                }}>
                  <img src={shinrinyokuLogo} alt="Shinrinyoku Logo" style={{ height: '32px', display: 'block' }} />
                </div>
              </div>
            </div>
          </div>

          {/* Sound toggle (Center-Left) */}
          <div style={{ flex: 1, display: 'flex', alignItems: 'flex-start', pointerEvents: 'auto', cursor: 'pointer', opacity: 0.8, marginTop: '8px' }}>
            <span style={{ marginRight: '8px', letterSpacing: '2px' }}>::::</span> SOUND [OFF]
          </div>

          {/* Intro Text (Center) */}
          <div style={{ flex: 1.5, opacity: 0.8, lineHeight: '1.4', marginTop: '8px' }}>
            FROMRHA IS A DESIGN-LED<br />
            CREATIVE AGENCY CRAFTING<br />
            EXPERIENCES FOR GLOBAL BRANDS.
          </div>

          {/* Locations & Time (Center-Right) */}
          <div style={{ flex: 1, opacity: 0.8, lineHeight: '1.4', marginTop: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '220px' }}>
              <span>📍 LONDON, UK</span>
              <span>10:20 GMT</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '220px' }}>
              <span>📍 AUCKLAND, NZ</span>
              <span>23:20 GMT+13</span>
            </div>
          </div>

          {/* Contact Button (Right) */}
          <div style={{ pointerEvents: 'auto', flex: 0.5, display: 'flex', justifyContent: 'flex-end' }}>
            <button style={{
              background: '#fff',
              color: '#000',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '100px',
              fontWeight: '600',
              cursor: 'pointer',
              fontSize: '13px',
              fontFamily: 'system-ui, sans-serif',
              textTransform: 'none',
              letterSpacing: 'normal',
              transition: 'background 0.2s'
            }}>
              Let's Talk
            </button>
          </div>
        </div>
      </div>

      <Canvas
        shadows
        colorManagement={true}
        camera={{ position: [0, 0, 6], fov: 70 }}
        style={{ height: '100vh', width: '100vw', touchAction: 'none' }}
      >
        <color attach="background" args={['#050505']} />
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <Scene />
      </Canvas>

      {/* Dark vignette overlay on the 4 corners */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          pointerEvents: 'none',
          background: 'radial-gradient(ellipse at center, transparent 15%, rgba(0,0,0,0.85) 100%)',
          zIndex: 10,
        }}
      />
    </>
  )
}

export default App
