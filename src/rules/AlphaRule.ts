import { FailCallback, ValidationRule } from '../contracts/Validation';

export class AlphaRule implements ValidationRule {
	public validate(
		attribute: string,
		value: unknown,
		fail: FailCallback
	): void {
		if (typeof value !== 'string' || !/^[A-Za-z]+$/.test(value)) {
			fail(`The :attribute must only contain letters.`);
		}
	}
}
