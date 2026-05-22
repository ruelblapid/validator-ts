import { FailCallback, ValidationRule } from '../contracts/Validation';

export class MimesRule implements ValidationRule {
	constructor(private allowedExtensions: string[]) {}

	public validate(
		attribute: string,
		value: unknown,
		fail: FailCallback
	): void {
		let filename = '';

		if (typeof value === 'string') {
			filename = value;
		} else if (value && typeof value === 'object' && 'name' in value) {
			filename = String((value as any).name);
		} else {
			fail(
				`The :attribute must be a file of type: ${this.allowedExtensions.join(', ')}.`
			);
			return;
		}

		const extension = filename.split('.').pop()?.toLowerCase() || '';
		if (
			!this.allowedExtensions
				.map((ext) => ext.toLowerCase())
				.includes(extension)
		) {
			fail(
				`The :attribute must be a file of type: ${this.allowedExtensions.join(', ')}.`
			);
		}
	}
}
