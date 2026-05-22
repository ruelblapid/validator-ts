import { FailCallback, ValidationRule } from '../contracts/Validation';

export class StringRule implements ValidationRule {
	public validate(
		attribute: string,
		value: unknown,
		fail: FailCallback
	): void {
		if (typeof value !== 'string') {
			fail(`The :attribute must be a string.`);
		}
	}
}
