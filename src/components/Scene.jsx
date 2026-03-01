import { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import Card from './Card'
import { EffectComposer, Vignette, ChromaticAberration } from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'
import * as THREE from 'three'

const COUNT = 10 // Increased for better fill
const SPACING = 2.5
const TOTAL_HEIGHT = COUNT * SPACING

// 4 Columns configuration
const COLUMNS = [
    { id: 0, xOffset: -5.25 },
    { id: 1, xOffset: -1.75 },
    { id: 2, xOffset: 1.75 },
    { id: 3, xOffset: 5.25 }
]

const Scene = () => {
    const scrollRef = useRef(0)
    const targetScrollRef = useRef(0)

    useEffect(() => {
        const handleWheel = (e) => {
            targetScrollRef.current += e.deltaY * 0.005
        }

        window.addEventListener('wheel', handleWheel, { passive: true })
        return () => window.removeEventListener('wheel', handleWheel)
    }, [])

    useFrame(() => {
        // Smooth scroll interpolation
        scrollRef.current += (targetScrollRef.current - scrollRef.current) * 0.05
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
