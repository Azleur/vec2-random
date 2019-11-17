# Random utilities for 2D vectors

**This is a Work In Progress!**

This TypeScript module provides random number generation in 2D space, with the help of [vec2](https://github.com/Azleur/vec2).

To start serving vectors, create a new provider:

```typescript
const provider = new RngVec2Provider();

const vector: Vec2 = provider.Uniform(); // 0 <= x,y <= 1.
...
```

The provider wraps a random number generator. Any function `() => number` that returns uniform random values in the range `[0, 1)` will do. The module [random](https://github.com/Azleur/random) provides some defaults.

## Boxes and balls

You can generate uniformly distributed samples in different shapes:

```typescript
const inBox = provider.Uniform(1, 1, 3, 4); // Vector in [1, 3] x [1, 4].
const inBall = provider.BallUniform(2); // Vector in ball of center (0, 0) and radius 2.
const inRadius = provider.RingUniform(5, 7); // Vector in "doughnut", radius in [5, 7].
```

## Gauss love

You can sample the standard normal distribution:

```typescript
const gauss = provider.Normal();
gauss.x; // Normal distribution with mean 0, variance 1.
gauss.y; // Independent from gauss.x, same distribution.
```
