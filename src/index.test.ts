import { RngVec2Provider } from './index';
import { Stats, Validation, nullStats, getIngestor, validate } from 'statistics';
import { Vec2 } from 'vec2';

const SAMPLES = 8000;

test("Uniform() variants generate uniform values in a rectangle.", () => {
    const provider = new RngVec2Provider();

    const helper = (sut: () => Vec2, xVal: Validation, yVal: Validation): void => {
        const xIngestor = getIngestor();
        const yIngestor = getIngestor();
        let xStats: Stats = nullStats();
        let yStats: Stats = nullStats();
        for (let i = 0; i < SAMPLES; i++) {
            const sample = sut();
            xStats = xIngestor(sample.x);
            yStats = yIngestor(sample.y);
        }

        expect(validate(xStats, xVal)).toBe(true);
        expect(validate(yStats, yVal)).toBe(true);
        // TODO: Correlation.
    }

    helper(
        () => provider.Uniform(),
        { tolerance: 0.1, min: 0, max: 1, mean: 0.5, variance: 1 / 12 },
        { tolerance: 0.1, min: 0, max: 1, mean: 0.5, variance: 1 / 12 }
    );
    helper(
        () => provider.Uniform(new Vec2(-1, -2), new Vec2(3, 4)),
        { tolerance: 0.1, min: -1, max: 3, mean: 1, variance: 4 / 3 },
        { tolerance: 0.1, min: -2, max: 4, mean: 1, variance: 3 }
    );
    helper(
        () => provider.Uniform(-1, -2, 3, 4),
        { tolerance: 0.1, min: -1, max: 3, mean: 1, variance: 4 / 3 },
        { tolerance: 0.1, min: -2, max: 4, mean: 1, variance: 3 }
    );
});

test("BallUniform(R) provides uniform values inside the radius R ball", () => {
    const provider = new RngVec2Provider();

    for (let R = 0.5; R <= 2; R += 0.25) {
        const xIngestor = getIngestor();
        const yIngestor = getIngestor();
        const radiusIngestor = getIngestor();
        const angleIngestor = getIngestor();
        let xStats: Stats = nullStats();
        let yStats: Stats = nullStats();
        let radiusStats: Stats = nullStats();
        let angleStats: Stats = nullStats();

        for (let i = 0; i < SAMPLES; i++) {
            const sample = provider.BallUniform(R);
            xStats = xIngestor(sample.x);
            yStats = yIngestor(sample.y);
            radiusStats = radiusIngestor(sample.Mag());
            angleStats = angleIngestor(sample.Argument());
        }

        // TODO: CHECK VARIANCES!
        expect(validate(xStats, { tolerance: 0.1, min: -R, max: +R, mean: 0 })).toBe(true);
        expect(validate(yStats, { tolerance: 0.1, min: -R, max: +R, mean: 0 })).toBe(true);
        expect(validate(radiusStats, { tolerance: 0.1, min: 0, max: R })).toBe(true);
        expect(validate(angleStats, { tolerance: 0.1, min: -Math.PI, max: +Math.PI, mean: 0, variance: Math.PI * Math.PI / 3 })).toBe(true);
    }
});

test("RingUniform(r, R) provides uniform values inside the ring with inner radius r and outer radius R", () => {
    const provider = new RngVec2Provider();

    for (let r = 0.5; r <= 2; r += 0.25) {
        for (let d = 0.5; d <= 1; d += 0.25) {
            let R = r + d;
            const xIngestor = getIngestor();
            const yIngestor = getIngestor();
            const radiusIngestor = getIngestor();
            const angleIngestor = getIngestor();
            let xStats: Stats = nullStats();
            let yStats: Stats = nullStats();
            let radiusStats: Stats = nullStats();
            let angleStats: Stats = nullStats();

            for (let i = 0; i < SAMPLES; i++) {
                const sample = provider.RingUniform(r, R);
                xStats = xIngestor(sample.x);
                yStats = yIngestor(sample.y);
                radiusStats = radiusIngestor(sample.Mag());
                angleStats = angleIngestor(sample.Argument());
            }

            // TODO: CHECK VARIANCES!
            expect(validate(xStats, { tolerance: 0.1, min: -R, max: +R, mean: 0 })).toBe(true);
            expect(validate(yStats, { tolerance: 0.1, min: -R, max: +R, mean: 0 })).toBe(true);
            expect(validate(radiusStats, { tolerance: 0.1, min: r, max: R })).toBe(true);
            expect(validate(angleStats, { tolerance: 0.1, min: -Math.PI, max: +Math.PI, mean: 0, variance: Math.PI * Math.PI / 3 })).toBe(true);
        }
    }
});
