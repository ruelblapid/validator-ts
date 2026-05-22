import { FailCallback, ValidationRule } from '../contracts/Validation';

export class ArrayRule implements ValidationRule {
	public validate(
		attribute: string,
		value: unknown,
		fail: FailCallback
	): void {
		if (!Array.isArray(value)) {
			fail(`The :attribute must be an array.`);
		}
	}
}
