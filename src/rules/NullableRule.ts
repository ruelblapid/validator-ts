import { FailCallback, ValidationRule } from '../contracts/Validation';

export class NullableRule implements ValidationRule {
	public validate(
		attribute: string,
		value: unknown,
		fail: FailCallback
	): void {}
}
