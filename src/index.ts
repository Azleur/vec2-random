import { rng, GetDefaultGenerator } from '@azleur/random';
import { Vec2, FromPolar } from '@azleur/vec2';
import { Interpolate } from '@azleur/math-util';

export class RngVec2Provider {
    generator: rng;
    constructor(generator?: rng) {
        this.generator = generator || GetDefaultGenerator();
    }


    /** Returns a uniform random Vec2 in the range [minX, maxX] x [minY, maxY]. */
    Uniform(minX: number, minY: number, maxX: number, maxY: number): Vec2;
    /** Returns a uniform random Vec2 in the range [min.x, max.x] x [min.y, max.y]. */
    Uniform(min: Vec2, max: Vec2): Vec2;
    /** Returns a uniform random Vec2 in the range [0, 1]^2. */
    Uniform(): Vec2;
    Uniform(a?: number | Vec2, b?: number | Vec2, c?: number, d?: number): Vec2 {
        if (a !== undefined && b !== undefined && c !== undefined && d !== undefined) { // 4 numbers.
            return new Vec2(
                Interpolate(a as number, c as number, this.generator()),
                Interpolate(b as number, d as number, this.generator())
            );
        } else if (a !== undefined && b !== undefined && c === undefined && d === undefined) { // 2 Vec2s.
            return new Vec2(
                Interpolate((a as Vec2).x, (b as Vec2).x, this.generator()),
                Interpolate((a as Vec2).y, (b as Vec2).y, this.generator())
            );
        } else { // Assuming no args; vec in [0, 1]^2.
            return new Vec2(this.generator(), this.generator());
        }
    }

    /** Returns a uniform random Vec2 in the radius r ball. */
    BallUniform(R: number = 1): Vec2 {
        const r = Math.sqrt(this.generator()) * R;
        const a = this.generator() * 2 * Math.PI;
        return FromPolar(r, a);
    }

    /** Returns a uniform random Vec2 in the ring with given inner and outer radii. */
    RingUniform(innerRadius: number, outerRadius: number): Vec2 {
        const r2 = innerRadius * innerRadius;
        const R2 = outerRadius * outerRadius;
        const radius2 = Interpolate(r2, R2, this.generator());
        const radius = Math.sqrt(radius2);
        const angle = this.generator() * 2 * Math.PI;
        return FromPolar(radius, angle);
    }

    // TODO: TEST!
    /** Returns a random Vec2 in the ring with given inner and outer radii, with a radial finite bell distribution. */
    RingBell(innerRadius: number, outerRadius: number): Vec2 {
        const r2 = innerRadius * innerRadius;
        const R2 = outerRadius * outerRadius;
        const weight = (this.generator() + this.generator() + this.generator() + this.generator()) / 4; // Bates n=4.
        const radius2 = Interpolate(r2, R2, weight);
        const radius = Math.sqrt(radius2);
        const angle = this.generator() * 2 * Math.PI;
        return FromPolar(radius, angle);
    }

    /** Uses the Box-Muller method to generate two independent normal samples. */
    Normal(): Vec2 {
        const u1 = this.generator();
        const u2 = this.generator();

        const a = Math.sqrt(-2 * Math.log(u1));
        const b = Math.cos(2 * Math.PI * u2);
        const c = Math.sin(2 * Math.PI * u2);

        return new Vec2(a * b, a * c);
    }
}
