import { FailCallback, ValidationRule } from '../contracts/Validation';

export class NumericRule implements ValidationRule {
	public validate(
		attribute: string,
		value: unknown,
		fail: FailCallback
	): void {
		// Allows pure numbers or numeric strings (like "123" or "45.6")
		const isNumeric =
			(typeof value === 'number' && !isNaN(value)) ||
			(typeof value === 'string' &&
				value.trim() !== '' &&
				!isNaN(Number(value)));

		if (!isNumeric) {
			fail(`The :attribute must be a number.`);
		}
	}
}
