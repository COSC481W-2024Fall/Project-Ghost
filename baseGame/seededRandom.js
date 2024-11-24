export class SeededRandom {
    constructor(seed) {
        this.state = [seed >>> 0, (seed >>> 0) ^ 0x12345678]; // Initialize with seed
    }

    // Helper function to update the state (Xorshift128+)
    _next() {
        let [s0, s1] = this.state;
        this.state[0] = s1;
        s1 ^= s1 << 23; // a
        this.state[1] = s0 ^ s1 ^ (s1 >>> 17) ^ (s0 >>> 26); // b, c
        return (this.state[1] + s0) >>> 0;
    }

    // Generate a float between 0 and 1
    newFloat() {
        return this._next() / 0x100000000; // Convert to a float between 0 and 1
    }

    // Generate an integer between min (inclusive) and max (exclusive)
    newInt(min, max) {
        return min + Math.floor(this.newFloat() * (max - min));
    }
}
