import { FailCallback, ValidationRule } from '../contracts/Validation';

export class ConfirmedRule implements ValidationRule {
	// We accept the full root data object via the constructor
	constructor(private allData: Record<string, unknown>) {}

	public validate(
		attribute: string,
		value: unknown,
		fail: FailCallback
	): void {
		const confirmationField = `${attribute}_confirmation`;
		const confirmationValue = this.allData[confirmationField];

		if (value !== confirmationValue) {
			fail(`The :attribute confirmation does not match.`);
		}
	}
}
