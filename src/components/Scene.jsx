import { useRef, useEffect, Suspense } from 'react'
import { useFrame } from '@react-three/fiber'
import Card from './Card'
import { EffectComposer, Vignette, ChromaticAberration } from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'
import * as THREE from 'three'
import { Vector2 } from 'three'

const ROWS = 8
const COLS = 8
const SPACING_Y = 2.05
const SPACING_X = 3.1
const TOTAL_HEIGHT = ROWS * SPACING_Y
const TOTAL_WIDTH = COLS * SPACING_X

const Scene = () => {
    // Scroll state for Y (Vertical)
    const scrollRefY = useRef(0)
    const targetScrollRefY = useRef(0)

    // Scroll state for X (Horizontal)
    const scrollRefX = useRef(0)
    const targetScrollRefX = useRef(0)

    // Drag state
    const isDragging = useRef(false)
    const lastPos = useRef({ x: 0, y: 0 })
    const velocity = useRef({ x: 0, y: 0 })

    // Reactive chromatic aberration offset (starts at zero)
    const chromaticOffset = useRef(new Vector2(0, 0))
    const chromaticOffsetDamped = useRef(new Vector2(0, 0))

    useEffect(() => {
        const preventDefault = (e) => e.preventDefault()
        document.addEventListener('touchmove', preventDefault, { passive: false })

        const handlePointerDown = (e) => {
            isDragging.current = true
            lastPos.current = { x: e.clientX, y: e.clientY }
            velocity.current = { x: 0, y: 0 }
            document.body.style.cursor = 'grabbing'
        }

        const handlePointerMove = (e) => {
            if (!isDragging.current) return

            const deltaX = e.clientX - lastPos.current.x
            const deltaY = e.clientY - lastPos.current.y

            lastPos.current = { x: e.clientX, y: e.clientY }

            // Update Target Scroll (Fixing axis: match mouse drag direction like paper)
            const scrollDeltaY = deltaY * 0.015
            const scrollDeltaX = deltaX * 0.015

            targetScrollRefY.current += scrollDeltaY
            targetScrollRefX.current -= scrollDeltaX

            // Set Velocity
            velocity.current = { x: -scrollDeltaX, y: scrollDeltaY }
        }

        const handlePointerUp = () => {
            isDragging.current = false
            document.body.style.cursor = 'grab'
        }

        document.body.style.cursor = 'grab'

        window.addEventListener('pointerdown', handlePointerDown)
        window.addEventListener('pointermove', handlePointerMove)
        window.addEventListener('pointerup', handlePointerUp)
        window.addEventListener('pointercancel', handlePointerUp)

        return () => {
            document.removeEventListener('touchmove', preventDefault)
            window.removeEventListener('pointerdown', handlePointerDown)
            window.removeEventListener('pointermove', handlePointerMove)
            window.removeEventListener('pointerup', handlePointerUp)
            window.removeEventListener('pointercancel', handlePointerUp)
            document.body.style.cursor = 'auto'
        }
    }, [])

    useFrame((state, delta) => {
        if (!isDragging.current) {
            // Friction
            velocity.current.x *= 0.95
            velocity.current.y *= 0.95

            targetScrollRefX.current += velocity.current.x
            targetScrollRefY.current += velocity.current.y
        }

        // Smooth scroll interpolation
        scrollRefX.current += (targetScrollRefX.current - scrollRefX.current) * 0.1
        scrollRefY.current += (targetScrollRefY.current - scrollRefY.current) * 0.1

        // Reactive chromatic aberration: scale with velocity magnitude, 0 when idle
        const speed = Math.sqrt(
            velocity.current.x * velocity.current.x +
            velocity.current.y * velocity.current.y
        )
        const targetCA = Math.min(speed * 0.012, 0.008) // clamp max so it's never broken
        chromaticOffsetDamped.current.x = THREE.MathUtils.damp(chromaticOffsetDamped.current.x, targetCA, 8, delta)
        chromaticOffsetDamped.current.y = THREE.MathUtils.damp(chromaticOffsetDamped.current.y, targetCA, 8, delta)
        chromaticOffset.current.set(chromaticOffsetDamped.current.x, chromaticOffsetDamped.current.y)
    })

    return (
        <group>
            <ambientLight intensity={2.5} />
            <directionalLight position={[5, 5, 5]} intensity={1.0} />
            <Suspense fallback={null}>
                {Array.from({ length: COLS }).map((_, colIndex) => (
                    <group key={`col-${colIndex}`}>
                        {Array.from({ length: ROWS }).map((_, rowIndex) => (
                            <Card
                                key={`card-${colIndex}-${rowIndex}`}
                                colIndex={colIndex}
                                rowIndex={rowIndex}
                                scrollRefX={scrollRefX}
                                scrollRefY={scrollRefY}
                                spacingX={SPACING_X}
                                spacingY={SPACING_Y}
                                totalHeight={TOTAL_HEIGHT}
                                totalWidth={TOTAL_WIDTH}
                            />
                        ))}
                    </group>
                ))}
            </Suspense>

            <EffectComposer>
                <Vignette eskil={false} offset={0.1} darkness={0.8} />
                <ChromaticAberration
                    blendFunction={BlendFunction.NORMAL}
                    offset={chromaticOffset.current}
                />
            </EffectComposer>
        </group>
    )
}

export default Scene
