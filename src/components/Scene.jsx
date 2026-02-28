import { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import Card from './Card'

const COUNT = 10 // Increased for better fill
const SPACING = 2.5
const TOTAL_HEIGHT = COUNT * SPACING

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
            {Array.from({ length: COUNT }).map((_, i) => (
                <Card
                    key={i}
                    index={i}
                    scrollRef={scrollRef}
                    spacing={SPACING}
                    totalHeight={TOTAL_HEIGHT}
                />
            ))}
        </group>
    )
}

export default Scene
