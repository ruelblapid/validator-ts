import { FailCallback, ValidationRule } from '../contracts/Validation';

export class MaxRule implements ValidationRule {
	constructor(private max: number) {}
	public validate(attr: string, val: unknown, fail: FailCallback) {
		if (typeof val === 'string' && val.length > this.max)
			fail(
				`The :attribute may not be greater than ${this.max} characters.`
			);
	}
}
