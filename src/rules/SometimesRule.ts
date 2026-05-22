import { FailCallback, ValidationRule } from '../contracts/Validation';

export class SometimesRule implements ValidationRule {
	public validate(
		attribute: string,
		value: unknown,
		fail: FailCallback
	): void {}
}
