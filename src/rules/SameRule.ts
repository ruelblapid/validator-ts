import { FailCallback, ValidationRule } from '../contracts/Validation';
import { dataGet } from '../utils/data';

export class SameRule implements ValidationRule {
	constructor(
		private otherField: string,
		private allData: Record<string, unknown>
	) {}

	public validate(
		attribute: string,
		value: unknown,
		fail: FailCallback
	): void {
		// Uses our dot-notation utility helper to grab the comparison value safely
		const otherValue = dataGet(this.allData, this.otherField);

		if (value !== otherValue) {
			fail(`The :attribute and ${this.otherField} must match.`);
		}
	}
}
