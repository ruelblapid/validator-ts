import { FailCallback, ImplicitRule } from '../contracts/Validation';
import { dataGet } from '../utils/data';

export class RequiredIfRule implements ImplicitRule {
	public isImplicit: true = true; // Must be implicit to run when the field is missing

	constructor(
		private anotherField: string,
		private targetValue: string,
		private allData: Record<string, unknown>
	) {}

	public validate(
		attribute: string,
		value: unknown,
		fail: FailCallback
	): void {
		const actualValue = dataGet(this.allData, this.anotherField);

		// Cast comparison value to string to ensure fluid loose matching (handles numbers/booleans)
		if (String(actualValue) === this.targetValue) {
			if (value === undefined || value === null || value === '') {
				fail(
					`The :attribute field is required when ${this.anotherField} is ${this.targetValue}.`
				);
			}
		}
	}
}
