/**
 * Type-safe memoization utility for store operations
 * Caches the result of function calls based on stringified arguments
 */
export function memoize<Args extends unknown[], Result>(
  fn: (...args: Args) => Result
): (...args: Args) => Result {
  let lastArgs: string | null = null;
  let lastResult: Result | null = null;
  
  return (...args: Args): Result => {
    const currentArgs = JSON.stringify(args);
    if (currentArgs !== lastArgs) {
      lastArgs = currentArgs;
      lastResult = fn(...args);
    }
    return lastResult as Result;
  };
} 