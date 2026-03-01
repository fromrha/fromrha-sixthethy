import { useRef, useMemo } from 'react'
import { useFrame, useThree, useLoader } from '@react-three/fiber'
import * as THREE from 'three'

const RADIUS = 30 // Larger = flatter cylinder, less extreme curvature

const Card = ({ colIndex, rowIndex, scrollRefX, scrollRefY, spacingY, spacingX, totalHeight, totalWidth, isPointerInside }) => {
    const meshRef = useRef()
    const materialRef = useRef()
    const prevScrollRefY = useRef(0)
    const prevScrollRefX = useRef(0)

    // Smooth pointer — lerps to actual pointer when inside, lerps to 0 when outside
    const smoothPointerX = useRef(0)
    const smoothPointerY = useRef(0)

    // Load random image texture
    const seedId = colIndex * 100 + rowIndex // unique seed per card
    const texture = useLoader(THREE.TextureLoader, `https://picsum.photos/seed/${seedId}/800/600`)

    // Apply Linear filtering for sharp images during distortion
    useMemo(() => {
        if (texture) {
            texture.minFilter = THREE.LinearFilter
            texture.magFilter = THREE.LinearFilter
            texture.encoding = THREE.sRGBEncoding // Vibrant un-dimmed images
            texture.colorSpace = THREE.SRGBColorSpace // Fallback for newer Three.js versions
        }
    }, [texture])

    // Shader Uniforms
    const uniforms = useMemo(() => ({
        uVelocity: { value: 0.0 }
    }), [])

    useFrame((state, delta) => {
        if (!meshRef.current) return

        // Calculate scroll velocity for tilt
        const velocityY = scrollRefY.current - prevScrollRefY.current
        const velocityX = scrollRefX.current - prevScrollRefX.current
        prevScrollRefY.current = scrollRefY.current
        prevScrollRefX.current = scrollRefX.current

        // Calculate reactive drag velocity for shader (normalized & clamped)
        const rawVelocity = Math.sqrt(velocityX * velocityX + velocityY * velocityY) * 5.0
        const clampedVelocity = Math.min(rawVelocity, 0.5)

        // Dampen the velocity for a smoother transition instead of snapping
        uniforms.uVelocity.value = THREE.MathUtils.damp(uniforms.uVelocity.value, clampedVelocity, 10, delta)

        // Smooth pointer: lerp toward actual pointer when inside viewport, back to 0 when outside
        const pointerTarget = isPointerInside?.current ? state.pointer : { x: 0, y: 0 }
        smoothPointerX.current = THREE.MathUtils.lerp(smoothPointerX.current, pointerTarget.x, 0.06)
        smoothPointerY.current = THREE.MathUtils.lerp(smoothPointerY.current, pointerTarget.y, 0.06)

        // Calculate base Y position (Vertical Infinite Wrap)
        let y = rowIndex * spacingY - scrollRefY.current
        const halfHeight = totalHeight / 2
        y = ((y + halfHeight) % totalHeight + totalHeight) % totalHeight - halfHeight

        // Calculate base X position (Horizontal Infinite Wrap)
        let x = colIndex * spacingX - scrollRefX.current
        const halfWidth = totalWidth / 2
        x = ((x + halfWidth) % totalWidth + totalWidth) % totalWidth - halfWidth

        // Cylindrical positioning math
        const angle = y / RADIUS
        const baseZ = Math.cos(angle) * RADIUS - RADIUS
        const baseRotationX = -angle

        // Update mesh position
        meshRef.current.position.set(x, y, baseZ)

        // Tilt effect — uses smoothed pointer so it returns to flat when mouse leaves
        const tiltX = (smoothPointerY.current * 0.1) + (velocityY * 2)
        const tiltY = (smoothPointerX.current * 0.1) + (velocityX * 2)

        meshRef.current.rotation.set(baseRotationX + tiltX, tiltY, 0)

        // Adjust opacity slightly based on distance from center for better blending at edges
        const distFromCenter = Math.sqrt(x * x + y * y)
        const maxDist = Math.min(halfHeight, halfWidth) * 1.5
        const opacity = Math.max(0, 1 - (distFromCenter / maxDist))

        if (materialRef.current) {
            materialRef.current.opacity = opacity
            materialRef.current.transparent = true
        }
    })

    return (
        <mesh ref={meshRef}>
            <planeGeometry args={[3, 2, 32, 32]} />
            <meshStandardMaterial
                ref={materialRef}
                map={texture}
                color="#fff"
                emissive="#ffffff"
                emissiveMap={texture}
                emissiveIntensity={0.4}
                envMapIntensity={1.5}
                roughness={0.4}
                metalness={0.0}
                transparent
                side={THREE.DoubleSide}
                onBeforeCompile={(shader) => {
                    shader.uniforms.uVelocity = uniforms.uVelocity
                    shader.vertexShader = `
                        uniform float uVelocity;
                        ${shader.vertexShader}
                    `
                    shader.vertexShader = shader.vertexShader.replace(
                        '#include <begin_vertex>',
                        `
                        #include <begin_vertex>
                        
                        // Calculate world position
                        vec4 worldPos = modelMatrix * vec4(position, 1.0);
                        
                        // Calculate distance from screen center
                        float EdgeDistance = pow(length(worldPos.xy), 2.0);
                        
                        // Reactive Distortion Strength based on velocity, clamped
                        float distClamp = clamp(uVelocity, 0.0, 0.3);
                        float DistortionStrength = distClamp * -0.015; // Reduced: was -0.05
                        
                        // Phantom Land style Vertex Distortion
                        transformed += normal * (DistortionStrength * EdgeDistance);
                        `
                    )
                }}
            />
        </mesh>
    )
}

export default Card
