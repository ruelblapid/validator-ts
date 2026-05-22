import { FailCallback, ValidationRule } from '../contracts/Validation';

export abstract class UniqueRule implements ValidationRule {
	constructor(
		protected table: string,
		protected column: string
	) {}

	abstract isUnique(
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

		const unique = await this.isUnique(this.table, this.column, value);
		if (!unique) {
			fail(`The :attribute has already been taken.`);
		}
	}
}
