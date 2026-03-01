import * as THREE from 'three'
import { Effect } from 'postprocessing'
import { wrapEffect } from '@react-three/postprocessing'

// Fragment shader using mainUv() — the correct way to do UV-space distortion
// in the postprocessing pipeline. Center stays flat; edges barrel outward.
const fragmentShader = /* glsl */ `
    uniform float uStrength;

    void mainUv(inout vec2 uv) {
        vec2 centered = uv - 0.5;
        float dist = dot(centered, centered); // squared distance from center
        // Positive strength = barrel / fish-eye distortion
        uv = centered * (1.0 + uStrength * dist) + 0.5;
    }
`

class LensDistortionEffectImpl extends Effect {
    constructor({ strength = 0.4 } = {}) {
        super('LensDistortionEffect', fragmentShader, {
            uniforms: new Map([
                ['uStrength', new THREE.Uniform(strength)]
            ])
        })
    }

    get strength() {
        return this.uniforms.get('uStrength').value
    }
    set strength(value) {
        this.uniforms.get('uStrength').value = value
    }
}

// Wrap it so it works as a JSX <LensDistortionEffect /> inside <EffectComposer>
export const LensDistortionEffect = wrapEffect(LensDistortionEffectImpl)
