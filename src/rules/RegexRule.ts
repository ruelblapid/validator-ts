import { FailCallback, ValidationRule } from '../contracts/Validation';

export class RegexRule implements ValidationRule {
	constructor(private pattern: RegExp) {}

	public validate(
		attribute: string,
		value: unknown,
		fail: FailCallback
	): void {
		const stringValue = String(value);
		if (!this.pattern.test(stringValue)) {
			fail(`The :attribute format is invalid.`);
		}
	}
}
