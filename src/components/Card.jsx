import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const RADIUS = 15 // Radius of the large invisible cylinder

const Card = ({ index, scrollRef, spacing, totalHeight }) => {
    const meshRef = useRef()

    useFrame((state, delta) => {
        if (!meshRef.current) return

        // Calculate base Y position
        let y = index * spacing - scrollRef.current

        // Infinite recycling logic
        const halfHeight = totalHeight / 2
        // Wrap Y around the total height range [-halfHeight, halfHeight]
        y = ((y + halfHeight) % totalHeight + totalHeight) % totalHeight - halfHeight

        // Cylindrical positioning math
        // Depth (Z) and Rotation (X) based on Y position along the arc
        const angle = y / RADIUS
        const z = Math.cos(angle) * RADIUS - RADIUS
        const rotationX = -angle

        // Update mesh
        meshRef.current.position.set(0, y, z)
        meshRef.current.rotation.set(rotationX, 0, 0)

        // Simple fade based on distance from center (optional but nice)
        const opacity = Math.max(0, 1 - Math.abs(y) / (totalHeight / 2))
        meshRef.current.material.opacity = opacity
    })

    return (
        <mesh ref={meshRef}>
            <planeGeometry args={[3, 2]} />
            <meshStandardMaterial
                color="#333"
                transparent
                side={THREE.DoubleSide}
            />
        </mesh>
    )
}

export default Card
