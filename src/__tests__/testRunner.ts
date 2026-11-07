/**
 * Lightweight self-contained test assertion runner
 */

export function describe(name: string, fn: () => void) {
  try {
    fn();
  } catch (err) {
    console.error(`Suite failure [${name}]:`, err);
    throw err;
  }
}

export function it(name: string, fn: () => void) {
  try {
    fn();
  } catch (err) {
    console.error(`Test failure [${name}]:`, err);
    throw err;
  }
}

export function expect<T>(actual: T) {
  return {
    toBe(expected: T) {
      if (actual !== expected) {
        throw new Error(`Expected ${String(expected)} but received ${String(actual)}`);
      }
    },
    toEqual(expected: unknown) {
      if (JSON.stringify(actual) !== JSON.stringify(expected)) {
        throw new Error(
          `Expected ${JSON.stringify(expected)} but received ${JSON.stringify(actual)}`
        );
      }
    },
    toContain(expected: string) {
      if (typeof actual !== 'string' || !actual.includes(expected)) {
        throw new Error(`Expected string to contain "${expected}", received "${String(actual)}"`);
      }
    },
    toBeGreaterThan(expected: number) {
      if (typeof actual !== 'number' || actual <= expected) {
        throw new Error(`Expected ${Number(actual)} > ${expected}`);
      }
    },
    toBeLessThan(expected: number) {
      if (typeof actual !== 'number' || actual >= expected) {
        throw new Error(`Expected ${Number(actual)} < ${expected}`);
      }
    },
  };
}
