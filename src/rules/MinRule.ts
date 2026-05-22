import { FailCallback, ValidationRule } from '../contracts/Validation';

export class MinRule implements ValidationRule {
	constructor(private min: number) {}
	public validate(attr: string, val: unknown, fail: FailCallback) {
		if (typeof val === 'string' && val.length < this.min)
			fail(`The :attribute must be at least ${this.min} characters.`);
	}
}
