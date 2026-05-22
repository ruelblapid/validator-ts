import { useCallback, useMemo, useState } from 'react';
import { Validator } from '../Validator.js';
import { ValidationRule } from '../contracts/Validation.js';

export function useReactFormValidator<T extends Record<string, unknown>>(
	initialData: T,
	rules: Record<keyof T | string, string | (string | ValidationRule)[]>,
	customMessages: Record<string, string> = {}
) {
	const [form, setForm] = useState<T>(initialData);

	const validator = useMemo(() => {
		return Validator.make(
			form as Record<string, unknown>,
			rules,
			customMessages
		);
	}, [form, rules, customMessages]);

	const handleChange = useCallback((field: keyof T, value: unknown) => {
		setForm((prev) => ({
			...prev,
			[field]: value,
		}));
	}, []);

	return {
		form,
		setForm,
		handleChange,
		errors: validator.getErrors(),
		invalidFields: validator.invalid(),
		passes: validator.passes(),
		fails: validator.fails(),
		getError: (field: keyof T | string) =>
			validator.getError(field as string),
	};
}
