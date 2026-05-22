import { FailCallback, ValidationRule } from '../contracts/Validation';

export class AlphaNumRule implements ValidationRule {
	public validate(
		attribute: string,
		value: unknown,
		fail: FailCallback
	): void {
		const stringValue = String(value);
		if (!/^[A-Za-z0-9]+$/.test(stringValue)) {
			fail(`The :attribute must only contain letters and numbers.`);
		}
	}
}
