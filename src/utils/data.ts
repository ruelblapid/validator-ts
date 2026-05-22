/**
 * Safely extracts a value from a deeply nested object using dot-notation.
 * Example: dataGet({ user: { age: 25 } }, 'user.age') -> 25
 */
export function dataGet(
	target: Record<string, unknown>,
	path: string
): unknown {
	return path.split('.').reduce((accumulator: unknown, key: string) => {
		if (
			accumulator &&
			typeof accumulator === 'object' &&
			key in (accumulator as object)
		) {
			return (accumulator as Record<string, unknown>)[key];
		}
		return undefined;
	}, target);
}
