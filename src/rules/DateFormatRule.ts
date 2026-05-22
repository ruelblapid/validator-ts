import { FailCallback, ValidationRule } from '../contracts/Validation';

export class DateFormatRule implements ValidationRule {
	constructor(private format: string) {}

	public validate(
		attribute: string,
		value: unknown,
		fail: FailCallback
	): void {
		if (typeof value !== 'string') {
			fail(`The :attribute does not match the format ${this.format}.`);
			return;
		}

		// 🚀 Clean token isolation using exact character boundary maps
		let regexString = this.format
			.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&') // 1. Escape layout boundaries first
			.replace(/d/g, '(0[1-9]|[12]\\d|3[01])') // 2. Replace 'd' BEFORE injecting matching '\\d' tokens
			.replace(/Y/g, '\\d{4}') // 3. Replace 'Y' (4-digit Year)
			.replace(/m/g, '(0[1-9]|1[0-2])') // 4. Replace 'm' (2-digit Month)
			.replace(/H/g, '(0\\d|1\\d|2[0-3])') // 5. Replace 'H' (24-Hour)
			.replace(/i/g, '[0-5]\\d') // 6. Replace 'i' (Minutes)
			.replace(/s/g, '[0-5]\\d'); // 7. Replace 's' (Seconds)

		const strictRegex = new RegExp(`^${regexString}$`);

		if (!strictRegex.test(value)) {
			fail(`The :attribute does not match the format ${this.format}.`);
		}
	}
}
