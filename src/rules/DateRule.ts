import { FailCallback, ValidationRule } from '../contracts/Validation';

export class DateRule implements ValidationRule {
	public validate(
		attribute: string,
		value: unknown,
		fail: FailCallback
	): void {
		if (value instanceof Date && !isNaN(value.getTime())) {
			return;
		}

		if (typeof value !== 'string' && typeof value !== 'number') {
			fail(`The :attribute is not a valid date.`);
			return;
		}

		const timestamp = Date.parse(String(value));
		if (isNaN(timestamp)) {
			fail(`The :attribute is not a valid date.`);
		}
	}
}
