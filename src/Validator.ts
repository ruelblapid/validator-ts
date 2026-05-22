import {
	CustomRuleClosureFactory,
	ValidationRule,
} from './contracts/Validation.js';
import { AfterDateRule } from './rules/AfterDateRule.js';
import { AlphaNumRule } from './rules/AlphaNumRule.js';
import { AlphaRule } from './rules/AlphaRule.js';
import { ArrayRule } from './rules/ArrayRule.js';
import { BeforeDateRule } from './rules/BeforeDateRule.js';
import { BetweenRule } from './rules/BetweenRule.js';
import { BooleanRule } from './rules/BooleanRule.js';
import { ConfirmedRule } from './rules/ConfirmedRule.js';
import { DateFormatRule } from './rules/DateFormatRule.js';
import { DateRule } from './rules/DateRule.js';
import { EmailRule } from './rules/EmailRule.js';
import { ImageRule } from './rules/ImageRule.js';
import { IntegerRule } from './rules/IntegerRule.js';
import { MaxRule } from './rules/MaxRule.js';
import { MimesRule } from './rules/MimesRule.js';
import { MinRule } from './rules/MinRule.js';
import { NullableRule } from './rules/NullableRule.js';
import { NumericRule } from './rules/NumericRule.js';
import { RegexRule } from './rules/RegexRule.js';
import { RequiredIfRule } from './rules/RequiredIfRule.js';
import { RequiredRule } from './rules/RequiredRule.js';
import { RequiredUnlessRule } from './rules/RequiredUnlessRule.js';
import { SameRule } from './rules/SameRule.js';
import { SometimesRule } from './rules/SometimesRule.js';
import { StringRule } from './rules/StringRule.js';
import { dataGet } from './utils/data';
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

	public async validate(): Promise<boolean> {
		this.errors = {};
		const validationPromises: Promise<void>[] = [];

		for (const [attribute, attributeRules] of Object.entries(
			this.normalizedRules
		)) {
			const value = dataGet(this.data, attribute);
			const isEmpty =
				value === undefined || value === null || value === '';

			const hasSometimes = attributeRules.includes('sometimes');
			const isMissing = value === undefined;

			if (hasSometimes && isMissing) {
				continue;
			}

			const hasNullable = attributeRules.includes('nullable');
			const isNullValue =
				value === undefined || value === null || value === '';
			if (hasNullable && isNullValue) {
				continue;
			}

			validationPromises.push(
				(async () => {
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

						// Wrap execution safely inside a Promise to manage potential async rules
						await Promise.resolve(
							rule.validate(
								attribute,
								value,
								(defaultMessage) => {
									ruleFailed = true;
									const customKeyWithAttr = `${attribute}.${ruleName}`;
									const finalMessagePattern =
										this.customMessages[
											customKeyWithAttr
										] ||
										this.customMessages[ruleName] ||
										defaultMessage;
									const localizedMessage =
										finalMessagePattern.replace(
											/:attribute/g,
											attribute
										);
									this.addError(attribute, localizedMessage);
								}
							)
						);

						if (shouldBail && ruleFailed) break;
					}
				})()
			);
		}

		// Await execution blocks concurrently across all fields
		await Promise.all(validationPromises);
		return this.passes();
	}

	/**
	 * Run the validation process synchronously across all rules.
	 * Automatically skips any complex asynchronous rule objects.
	 */
	public validateSync(): boolean {
		this.errors = {};

		for (const [attribute, attributeRules] of Object.entries(
			this.normalizedRules
		)) {
			const value = dataGet(this.data, attribute);
			const isEmpty =
				value === undefined || value === null || value === '';

			const hasSometimes = attributeRules.includes('sometimes');
			const isMissing = value === undefined;

			if (hasSometimes && isMissing) {
				continue;
			}

			const hasNullable = attributeRules.includes('nullable');
			const isNullValue =
				value === undefined || value === null || value === '';
			if (hasNullable && isNullValue) {
				continue;
			}

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

				// Skip async promise rule instances safely in synchronous mode
				if (
					//@ts-ignore
					typeof rule.validate(attribute, value, () => {})?.then ===
					'function'
				) {
					continue;
				}

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

		return this.passes();
	}

	private resolveStringRule(ruleString: string): ValidationRule | null {
		const [ruleName, ...paramParts] = ruleString.split(':');
		const paramString = paramParts.join(':');
		const params = paramString ? paramString.split(',') : [];

		if (ruleName === 'required') return new RequiredRule();
		if (ruleName === 'email') return new EmailRule();
		if (ruleName === 'min') return new MinRule(parseInt(params[0], 10));
		if (ruleName === 'max') return new MaxRule(parseInt(params[0], 10));

		if (ruleName === 'string') return new StringRule();
		if (ruleName === 'numeric') return new NumericRule();
		if (ruleName === 'integer') return new IntegerRule();
		if (ruleName === 'boolean') return new BooleanRule();
		if (ruleName === 'array') return new ArrayRule();
		if (ruleName === 'nullable') return new NullableRule();
		if (ruleName === 'between') {
			return new BetweenRule(
				parseInt(params[0], 10),
				parseInt(params[1], 10)
			);
		}
		if (ruleName === 'confirmed') {
			return new ConfirmedRule(this.data);
		}
		if (ruleName === 'same') {
			return new SameRule(params[0], this.data);
		}

		if (ruleName === 'date') return new DateRule();
		if (ruleName === 'after') return new AfterDateRule(paramString);
		if (ruleName === 'before') return new BeforeDateRule(paramString);
		if (ruleName === 'date_format') return new DateFormatRule(paramString);

		if (ruleName === 'sometimes') return new SometimesRule();

		if (ruleName === 'required_if') {
			const [anotherField, targetValue] = params;
			return new RequiredIfRule(anotherField, targetValue, this.data);
		}

		if (ruleName === 'required_unless') {
			const [anotherField, targetValue] = params;
			return new RequiredUnlessRule(anotherField, targetValue, this.data);
		}

		if (ruleName === 'image') return new ImageRule();
		if (ruleName === 'mimes') return new MimesRule(params);
		if (ruleName === 'alpha') return new AlphaRule();
		if (ruleName === 'alpha_num') return new AlphaNumRule();

		if (ruleName === 'regex') {
			let pattern = paramString;
			let flags = '';
			if (
				paramString.startsWith('/') &&
				paramString.lastIndexOf('/') > 0
			) {
				const lastSlash = paramString.lastIndexOf('/');
				pattern = paramString.slice(1, lastSlash);
				flags = paramString.slice(lastSlash + 1);
			}
			return new RegexRule(new RegExp(pattern, flags));
		}

		if (ruleName === 'unique' || ruleName === 'exists') {
			if (!Validator.extensions[ruleName]) {
				throw new Error(
					`The "${ruleName}" rule requires a database bridge. Please register one via Validator.extend('${ruleName}', ...) in your application bootstrapper.`
				);
			}
			return Validator.extensions[ruleName](params);
		}

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
