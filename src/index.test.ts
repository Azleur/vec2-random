import { RngVec2Provider } from '.';
import {
    ObserveCovariance,
    CovarianceValidation,
    CovarianceValidate,
    GetCovarianceIngestor,
    NullCovarianceStats
} from '@azleur/stats';
import { Vec2 } from '@azleur/vec2';

const SAMPLES = 10000;

test("Uniform() variants generate uniform values in a rectangle.", () => {
    const provider = new RngVec2Provider();

    const helper = (sut: () => Vec2, validation: CovarianceValidation): void => {
        const stats = ObserveCovariance(sut, SAMPLES);
        expect(CovarianceValidate(stats, validation)).toBe(true);
    }

    helper(
        () => provider.Uniform(),
        {
            tolerance: 0.1,
            covariance: 0,
            x: { tolerance: 0.1, min: 0, max: 1, mean: 0.5, variance: 1 / 12 },
            y: { tolerance: 0.1, min: 0, max: 1, mean: 0.5, variance: 1 / 12 },
        }
    );

    helper(
        () => provider.Uniform(new Vec2(-1, -2), new Vec2(3, 4)),
        {
            tolerance: 0.1,
            covariance: 0,
            x: { min: -1, max: 3, mean: 1, variance: 4 / 3 },
            y: { min: -2, max: 4, mean: 1, variance: 3 },
        }
    );

    helper(
        () => provider.Uniform(-1, -2, 3, 4),
        {
            tolerance: 0.1,
            covariance: 0,
            x: { min: -1, max: 3, mean: 1, variance: 4 / 3 },
            y: { tolerance: 0.1, min: -2, max: 4, mean: 1, variance: 3 },
        }
    );
});

test("BallUniform(R) provides uniform values inside the radius R ball", () => {
    const provider = new RngVec2Provider();

    for (let R = 0.5; R <= 4; R += 0.25) {
        const cartesianIngestor = GetCovarianceIngestor();
        const radialIngestor = GetCovarianceIngestor();

        let cartesianStats = NullCovarianceStats();
        let radialStats = NullCovarianceStats();

        for (let i = 0; i < SAMPLES; i++) {
            const sample = provider.BallUniform(R);
            cartesianStats = cartesianIngestor(sample.x, sample.y);
            radialStats = radialIngestor(sample.Mag(), sample.Argument());
        }

        const cartesianExpected = {
            tolerance: 0.1,
            covariance: 0,
            x: { min: -R, max: +R, mean: 0, },
            y: { min: -R, max: +R, mean: 0, },
        };

        const radialExpected = {
            tolerance: 0.1,
            covariance: 0,
            x: { min: 0, max: R, mean: (2 * R) / 3, variance: (R * R) / 18, },
            y: { min: -Math.PI, max: +Math.PI, mean: 0, variance: (Math.PI * Math.PI) / 3, },
        };

        expect(CovarianceValidate(cartesianStats, cartesianExpected)).toBe(true);
        expect(CovarianceValidate(radialStats, radialExpected)).toBe(true);
    }
});

test("RingUniform(r, R) provides uniform values inside the ring with inner radius r and outer radius R", () => {
    const provider = new RngVec2Provider();

    for (let r = 0.5; r <= 2; r += 0.25) {
        for (let d = 0.5; d <= 1; d += 0.25) {
            let R = r + d;
            const cartesianIngestor = GetCovarianceIngestor();
            const radialIngestor = GetCovarianceIngestor();

            let cartesianStats = NullCovarianceStats();
            let radialStats = NullCovarianceStats();

            for (let i = 0; i < SAMPLES; i++) {
                const sample = provider.RingUniform(r, R);
                cartesianStats = cartesianIngestor(sample.x, sample.y);
                radialStats = radialIngestor(sample.Mag(), sample.Argument());
            }

            const cartesianExpected = {
                tolerance: 0.1,
                covariance: 0,
                x: { min: -R, max: +R, mean: 0, },
                y: { min: -R, max: +R, mean: 0, },
            };

            const [meanR, varR] = (() => {
                const Rr2 = R * R - r * r;
                const Rr3 = R * R * R - r * r * r;
                const Rr4 = R * R * R * R - r * r * r * r;

                const mean = (2 * Rr3) / (3 * Rr2);
                const variance = Rr4 / (2 * Rr2) - mean * mean;

                return [mean, variance];
            })();
            const radialExpected = {
                tolerance: 0.1,
                covariance: 0,
                x: { min: r, max: R, mean: meanR, variance: varR, },
                y: { min: -Math.PI, max: +Math.PI, mean: 0, variance: (Math.PI * Math.PI) / 3, },
            };

            expect(CovarianceValidate(cartesianStats, cartesianExpected)).toBe(true);
            expect(CovarianceValidate(radialStats, radialExpected)).toBe(true);
        }
    }
});

test("Normal() returns two independent normal variables", () => {
    const provider = new RngVec2Provider();

    const stats = ObserveCovariance(() => provider.Normal(), SAMPLES);
    const expected = {
        tolerance: 0.1,
        covariance: 0,
        x: { mean: 0, variance: 1, },
        y: { mean: 0, variance: 1, },
    };

    console.log(stats);

    expect(CovarianceValidate(stats, expected)).toBe(true);
});
