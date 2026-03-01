import { Canvas } from '@react-three/fiber'
import Scene from './components/Scene'

function App() {
  return (
    <Canvas
      shadows
      camera={{ position: [0, 0, 6], fov: 70 }}
      style={{ height: '100vh', width: '100vw', touchAction: 'none' }}
    >
      <color attach="background" args={['#050505']} />
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <Scene />
    </Canvas>
  )
}

export default App
