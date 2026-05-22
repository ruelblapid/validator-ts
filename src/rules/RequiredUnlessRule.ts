import { FailCallback, ImplicitRule } from '../contracts/Validation';
import { dataGet } from '../utils/data';

export class RequiredUnlessRule implements ImplicitRule {
	public isImplicit: true = true;

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

		if (String(actualValue) !== this.targetValue) {
			if (value === undefined || value === null || value === '') {
				fail(
					`The :attribute field is required unless ${this.anotherField} is ${this.targetValue}.`
				);
			}
		}
	}
}
