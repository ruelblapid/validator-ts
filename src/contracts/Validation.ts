export type FailCallback = (message: string) => void;

export interface ValidationRule {
	validate(attribute: string, value: unknown, fail: FailCallback): void;
}

export type CustomRuleClosureFactory = (params: string[]) => ValidationRule;
