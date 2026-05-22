import {
	CustomRuleClosureFactory,
	ValidationRule,
} from './contracts/Validation.js';
import { EmailRule } from './rules/EmailRule.js';
import { MaxRule } from './rules/MaxRule.js';
import { MinRule } from './rules/MinRule.js';
import { RequiredRule } from './rules/RequiredRule.js';

export class Validator {
	private errors: Record<string, string[]> = {};
	private normalizedRules: Record<string, (string | ValidationRule)[]> = {};
	private static extensions: Record<string, CustomRuleClosureFactory> = {};

	constructor(
		private data: Record<string, unknown>,
		rules: Record<string, string | (string | ValidationRule)[]>,
		private customMessages: Record<string, string> = {}
	) {
		this.normalizeRules(rules);
		this.run();
	}

	public static make(
		data: Record<string, unknown>,
		rules: Record<string, string | (string | ValidationRule)[]>,
		customMessages: Record<string, string> = {}
	): Validator {
		return new Validator(data, rules, customMessages);
	}

	public static extend(
		ruleName: string,
		factory: CustomRuleClosureFactory
	): void {
		Validator.extensions[ruleName] = factory;
	}

	private normalizeRules(
		rules: Record<string, string | (string | ValidationRule)[]>
	): void {
		for (const [attribute, ruleMix] of Object.entries(rules)) {
			let ruleArray: (string | ValidationRule)[] = [];
			if (typeof ruleMix === 'string') {
				ruleArray = ruleMix.split('|');
			} else {
				for (const item of ruleMix) {
					if (typeof item === 'string') {
						ruleArray.push(...item.split('|'));
					} else {
						ruleArray.push(item);
					}
				}
			}
			this.normalizedRules[attribute] = ruleArray;
		}
	}

	private run(): void {
		this.errors = {};

		for (const [attribute, attributeRules] of Object.entries(
			this.normalizedRules
		)) {
			const value = this.data[attribute];
			const isEmpty =
				value === undefined || value === null || value === '';
			let shouldBail = false;

			for (const rawRule of attributeRules) {
				if (rawRule === 'bail') {
					shouldBail = true;
					continue;
				}

				const rule =
					typeof rawRule === 'string'
						? this.resolveStringRule(rawRule)
						: rawRule;
				if (!rule) continue;

				const isImplicit = (rule as any).isImplicit === true;
				if (isEmpty && !isImplicit) continue;

				let ruleFailed = false;
				const ruleName =
					typeof rawRule === 'string'
						? rawRule.split(':')[0]
						: rule.constructor.name
								.toLowerCase()
								.replace('rule', '');

				rule.validate(attribute, value, (defaultMessage) => {
					ruleFailed = true;
					const customKeyWithAttr = `${attribute}.${ruleName}`;
					const finalMessagePattern =
						this.customMessages[customKeyWithAttr] ||
						this.customMessages[ruleName] ||
						defaultMessage;
					const localizedMessage = finalMessagePattern.replace(
						/:attribute/g,
						attribute
					);
					this.addError(attribute, localizedMessage);
				});

				if (shouldBail && ruleFailed) break;
			}
		}
	}

	private resolveStringRule(ruleString: string): ValidationRule | null {
		const [ruleName, ...paramParts] = ruleString.split(':');
		const paramString = paramParts.join(':');
		const params = paramString ? paramString.split(',') : [];

		if (ruleName === 'required') return new RequiredRule();
		if (ruleName === 'email') return new EmailRule();
		if (ruleName === 'min') return new MinRule(parseInt(params[0], 10));
		if (ruleName === 'max') return new MaxRule(parseInt(params[0], 10));

		if (Validator.extensions[ruleName]) {
			return Validator.extensions[ruleName](params);
		}

		throw new Error(`Validation rule "${ruleName}" is not registered.`);
	}

	private addError(attribute: string, message: string): void {
		if (!this.errors[attribute]) this.errors[attribute] = [];
		this.errors[attribute].push(message);
	}

	public passes(): boolean {
		return Object.keys(this.errors).length === 0;
	}
	public fails(): boolean {
		return !this.passes();
	}
	public invalid(): string[] {
		return Object.keys(this.errors);
	}
	public getError(name: string): string[] | null {
		return this.errors[name] ? this.errors[name] : null;
	}
	public getErrors(): Record<string, string[]> {
		return this.errors;
	}
}
