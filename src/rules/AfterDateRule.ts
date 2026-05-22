import { FailCallback, ValidationRule } from '../contracts/Validation';

export class AfterDateRule implements ValidationRule {
	constructor(private targetDateString: string) {}

	public validate(
		attribute: string,
		value: unknown,
		fail: FailCallback
	): void {
		const valueTime = Date.parse(String(value));
		const targetTime = Date.parse(this.targetDateString);

		if (isNaN(targetTime)) {
			throw new Error(
				`The validation boundary date "${this.targetDateString}" is invalid.`
			);
		}

		if (isNaN(valueTime) || valueTime <= targetTime) {
			fail(
				`The :attribute must be a date after ${this.targetDateString}.`
			);
		}
	}
}
