import { FailCallback, ValidationRule } from '../contracts/Validation';

export class BooleanRule implements ValidationRule {
	public validate(
		attribute: string,
		value: unknown,
		fail: FailCallback
	): void {
		const acceptable = [true, false, 1, 0, '1', '0', 'true', 'false'];

		if (!acceptable.includes(value as any)) {
			fail(`The :attribute field must be true or false.`);
		}
	}
}
