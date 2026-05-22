import { FailCallback, ValidationRule } from '../contracts/Validation';

export class IntegerRule implements ValidationRule {
	public validate(
		attribute: string,
		value: unknown,
		fail: FailCallback
	): void {
		const num = Number(value);
		const isInteger =
			!isNaN(num) && Number.isInteger(num) && String(value).trim() !== '';

		if (!isInteger) {
			fail(`The :attribute must be an integer.`);
		}
	}
}
