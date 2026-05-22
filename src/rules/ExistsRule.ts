import { FailCallback, ValidationRule } from '../contracts/Validation';

export abstract class ExistsRule implements ValidationRule {
	constructor(
		protected table: string,
		protected column: string
	) {}

	abstract existsInDatabase(
		table: string,
		column: string,
		value: unknown
	): Promise<boolean>;

	public async validate(
		attribute: string,
		value: unknown,
		fail: FailCallback
	): Promise<void> {
		if (value === undefined || value === null || value === '') return;

		const exists = await this.existsInDatabase(
			this.table,
			this.column,
			value
		);
		if (!exists) {
			fail(`The selected :attribute is invalid.`);
		}
	}
}
