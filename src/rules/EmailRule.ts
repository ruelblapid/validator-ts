import { FailCallback, ValidationRule } from '../contracts/Validation';

export class EmailRule implements ValidationRule {
	public validate(attr: string, val: unknown, fail: FailCallback) {
		if (typeof val === 'string' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val))
			fail(`The :attribute must be a valid email address.`);
	}
}
