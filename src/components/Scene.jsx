import { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import Card from './Card'
import { EffectComposer, Vignette, ChromaticAberration } from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'
import * as THREE from 'three'

const COUNT = 16 // Increased for better fill
const SPACING = 2.05 // Tighter vertical spacing
const TOTAL_HEIGHT = COUNT * SPACING

// 4 Columns configuration, closer together
const COLUMNS = [
    { id: 0, xOffset: -4.65 },
    { id: 1, xOffset: -1.55 },
    { id: 2, xOffset: 1.55 },
    { id: 3, xOffset: 4.65 }
]

const Scene = () => {
    const scrollRef = useRef(0)
    const targetScrollRef = useRef(0)

    // Drag state
    const isDragging = useRef(false)
    const lastY = useRef(0)
    const velocity = useRef(0)

    useEffect(() => {
        const preventDefault = (e) => e.preventDefault()
        document.addEventListener('touchmove', preventDefault, { passive: false })

        const handlePointerDown = (e) => {
            isDragging.current = true
            lastY.current = e.clientY
            velocity.current = 0
            document.body.style.cursor = 'grabbing'
        }

        const handlePointerMove = (e) => {
            if (!isDragging.current) return

            const deltaY = e.clientY - lastY.current
            lastY.current = e.clientY

            const scrollDelta = deltaY * 0.015
            targetScrollRef.current -= scrollDelta
            velocity.current = -scrollDelta
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

    useFrame(() => {
        if (!isDragging.current) {
            velocity.current *= 0.95 // Friction
            targetScrollRef.current += velocity.current
        }

        // Smooth scroll interpolation
        scrollRef.current += (targetScrollRef.current - scrollRef.current) * 0.1
    })

    return (
        <group>
            {COLUMNS.map((col) => (
                <group key={col.id}>
                    {Array.from({ length: COUNT }).map((_, i) => (
                        <Card
                            key={i}
                            index={i}
                            scrollRef={scrollRef}
                            spacing={SPACING}
                            totalHeight={TOTAL_HEIGHT}
                            xOffset={col.xOffset}
                        />
                    ))}
                </group>
            ))}

            <EffectComposer>
                <Vignette eskil={false} offset={0.1} darkness={1.1} />
                <ChromaticAberration
                    blendFunction={BlendFunction.NORMAL}
                    offset={new THREE.Vector2(0.002, 0.002)}
                />
            </EffectComposer>
        </group>
    )
}

export default Scene
