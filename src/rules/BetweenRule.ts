import { FailCallback, ValidationRule } from '../contracts/Validation';

export class BetweenRule implements ValidationRule {
	constructor(
		private min: number,
		private max: number
	) {}

	public validate(
		attribute: string,
		value: unknown,
		fail: FailCallback
	): void {
		let size: number;

		if (Array.isArray(value)) {
			size = value.length;
		} else if (typeof value === 'number') {
			size = value;
		} else if (typeof value === 'string') {
			// If it looks numeric, treat it as a number; otherwise, check character length
			size =
				!isNaN(Number(value)) && value.trim() !== ''
					? Number(value)
					: [...value].length;
		} else {
			return; // Skip unsupported types gracefully
		}

		if (size < this.min || size > this.max) {
			fail(`The :attribute must be between ${this.min} and ${this.max}.`);
		}
	}
}
