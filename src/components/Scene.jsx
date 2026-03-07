import { useRef, useEffect, Suspense } from 'react'
import { useFrame } from '@react-three/fiber'
import { Environment } from '@react-three/drei'
import Card from './Card'
import * as THREE from 'three'

const ROWS = 8
const COLS = 8
const SPACING_Y = 2.05
const SPACING_X = 3.05 // Adjusted to match vertical gap of 0.05 (3 + 0.05)
const TOTAL_HEIGHT = ROWS * SPACING_Y
const TOTAL_WIDTH = COLS * SPACING_X

const Scene = () => {

    const containerGroup = useRef();

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

    // Track whether the pointer is inside the viewport
    const isPointerInside = useRef(false)

    // Grid wiggle: ref to the card group + smoothed rotation target
    const gridGroupRef = useRef()
    const smoothGridRot = useRef({ x: 0, y: 0 })

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
            targetScrollRefX.current += scrollDeltaX

            // Set Velocity
            velocity.current = { x: scrollDeltaX, y: scrollDeltaY }
        }

        const handlePointerUp = () => {
            isDragging.current = false
            document.body.style.cursor = 'grab'
        }

        const handlePointerEnter = () => { isPointerInside.current = true }
        const handlePointerLeave = () => { isPointerInside.current = false }

        document.body.style.cursor = 'grab'

        window.addEventListener('pointerdown', handlePointerDown)
        window.addEventListener('pointermove', handlePointerMove)
        window.addEventListener('pointerup', handlePointerUp)
        window.addEventListener('pointercancel', handlePointerUp)
        window.addEventListener('pointerenter', handlePointerEnter)
        window.addEventListener('pointerleave', handlePointerLeave)

        return () => {
            document.removeEventListener('touchmove', preventDefault)
            window.removeEventListener('pointerdown', handlePointerDown)
            window.removeEventListener('pointermove', handlePointerMove)
            window.removeEventListener('pointerup', handlePointerUp)
            window.removeEventListener('pointercancel', handlePointerUp)
            window.removeEventListener('pointerenter', handlePointerEnter)
            window.removeEventListener('pointerleave', handlePointerLeave)
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
        scrollRefX.current += (targetScrollRefX.current - scrollRefX.current) * 0.6
        scrollRefY.current += (targetScrollRefY.current - scrollRefY.current) * 0.6

        // --- Global Tilt Wiggle ---
        const targetRotX = isPointerInside.current ? -state.pointer.y * 0.06 : 0
        const targetRotY = isPointerInside.current ? state.pointer.x * 0.06 : 0

        smoothGridRot.current.x = THREE.MathUtils.lerp(smoothGridRot.current.x, targetRotX, 0.05)
        smoothGridRot.current.y = THREE.MathUtils.lerp(smoothGridRot.current.y, targetRotY, 0.05)

        if (gridGroupRef.current) {
            gridGroupRef.current.rotation.x = smoothGridRot.current.x
            gridGroupRef.current.rotation.y = smoothGridRot.current.y
        }
    })

    return (
        <group ref={containerGroup}>
            {/* HDR Environment map for vibrant, professional lighting */}
            <Environment preset="city" />
            <ambientLight intensity={3.0} />
            <directionalLight position={[5, 5, 5]} intensity={1.0} />

            {/* Grid group with wiggle rotation applied */}
            <group ref={gridGroupRef}>
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
                                    isPointerInside={isPointerInside}
                                />
                            ))}
                        </group>
                    ))}
                </Suspense>
            </group>
        </group>
    )
}

export default Scene
