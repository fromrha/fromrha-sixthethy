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
        if (texture && texture.minFilter !== THREE.LinearFilter) {
            texture.minFilter = THREE.LinearFilter
            texture.magFilter = THREE.LinearFilter
            texture.colorSpace = THREE.SRGBColorSpace 
            texture.needsUpdate = true
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
        const targetX = isPointerInside?.current ? state.pointer.x : 0
        const targetY = isPointerInside?.current ? state.pointer.y : 0
        smoothPointerX.current = THREE.MathUtils.lerp(smoothPointerX.current, targetX, 0.06)
        smoothPointerY.current = THREE.MathUtils.lerp(smoothPointerY.current, targetY, 0.06)

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
        // Drastically reduced multipliers and clamped the max tilt to prevent motion sickness
        const maxTilt = 0.3 // limits the rotation to a reasonable max angle
        const tiltX = (smoothPointerY.current * 0.05) + THREE.MathUtils.clamp(velocityY * 0.5, -maxTilt, maxTilt)
        const tiltY = (smoothPointerX.current * 0.05) + THREE.MathUtils.clamp(velocityX * 0.5, -maxTilt, maxTilt)

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
            <planeGeometry args={[3, 2, 16, 16]} />
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
                    
                    // 1. Lens Distortion: Warp UVs for barrel distortion at edges
                    shader.vertexShader = shader.vertexShader.replace(
                        '#include <uv_vertex>',
                        `
                        #include <uv_vertex>
                        #ifdef USE_MAP
                            vec2 centeredUv = vMapUv - 0.5;
                            float uvDist = dot(centeredUv, centeredUv);
                            // uStrength = 0.4 (subtle barrel distortion from original effect)
                            vMapUv = centeredUv * (1.0 + 0.4 * uvDist) + 0.5;
                        #endif
                        `
                    )

                    // 2. Velocity-based Geometry Displacement (Extrusion)
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
                        float DistortionStrength = distClamp * -0.015;
                        
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
