import { FailCallback, ValidationRule } from '../contracts/Validation';
/** Built-In Core Rule Fallbacks */
export class RequiredRule implements ValidationRule {
	public isImplicit = true;
	public validate(attr: string, val: unknown, fail: FailCallback) {
		if (val === undefined || val === null || val === '')
			fail(`The :attribute field is required.`);
	}
}
