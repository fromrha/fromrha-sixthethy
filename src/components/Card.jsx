import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

const RADIUS = 12 // Radius of the large invisible cylinder

const Card = ({ index, scrollRef, spacing, totalHeight, xOffset = 0 }) => {
    const meshRef = useRef()
    const materialRef = useRef()
    const prevScrollRef = useRef(0)

    useFrame((state) => {
        if (!meshRef.current) return

        // Calculate scroll velocity for tilt
        const velocity = scrollRef.current - prevScrollRef.current
        prevScrollRef.current = scrollRef.current

        // Calculate base Y position
        let y = index * spacing - scrollRef.current

        // Infinite recycling logic
        const halfHeight = totalHeight / 2
        // Wrap Y around the total height range [-halfHeight, halfHeight]
        y = ((y + halfHeight) % totalHeight + totalHeight) % totalHeight - halfHeight

        // Cylindrical positioning math
        // Depth (Z) and Rotation (X) based on Y position along the arc
        const angle = y / RADIUS
        const baseZ = Math.cos(angle) * RADIUS - RADIUS
        const baseRotationX = -angle

        // Update mesh position
        meshRef.current.position.set(xOffset, y, baseZ)

        // Tilt effect based on mouse and scroll velocity
        // state.pointer holds normalized mouse coordinates: [-1, 1]
        const tiltX = (state.pointer.y * 0.1) + (velocity * 2)
        const tiltY = (state.pointer.x * 0.1)

        meshRef.current.rotation.set(baseRotationX + tiltX, tiltY, 0)

        // Simple fade based on distance from center
        const opacity = Math.max(0, 1 - Math.abs(y) / (totalHeight / 2))
        if (materialRef.current) {
            materialRef.current.opacity = opacity
        }
    })

    return (
        <mesh ref={meshRef}>
            <planeGeometry args={[3, 2, 32, 32]} />
            <meshStandardMaterial
                ref={materialRef}
                color="#333"
                transparent
                side={THREE.DoubleSide}
                onBeforeCompile={(shader) => {
                    shader.vertexShader = shader.vertexShader.replace(
                        '#include <begin_vertex>',
                        `
                        #include <begin_vertex>
                        
                        // Calculate world position
                        vec4 worldPos = modelMatrix * vec4(position, 1.0);
                        
                        // Calculate distance from screen center
                        float EdgeDistance = pow(length(worldPos.xy), 2.0);
                        float DistortionStrength = -0.012;
                        
                        // Phantom Land style Vertex Distortion
                        // VertexPosition = Position + (DistortionStrength * Normal * EdgeDistance)
                        transformed += normal * (DistortionStrength * EdgeDistance);
                        `
                    )
                }}
            />
        </mesh>
    )
}

export default Card
