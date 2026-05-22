import { useCallback, useMemo, useState } from 'react';
import { Validator } from '../Validator';
import { ValidationRule } from '../contracts/Validation';

/**
 * SYNCHRONOUS HOOK: Instant keystroke validation
 * Best for fast local layout constraints (min, max, email format, required)
 */
export function useReactFormValidator<T extends Record<string, unknown>>(
	initialData: T,
	rules: Record<keyof T | string, string | (string | ValidationRule)[]>,
	customMessages: Record<string, string> = {}
) {
	const [form, setForm] = useState<T>(initialData);

	// Run synchronously via useMemo so there is zero rendering delay
	const validator = useMemo(() => {
		const v = Validator.make(
			form as Record<string, unknown>,
			rules,
			customMessages
		);
		// Explicitly runs sync rules; skips async lookups seamlessly on keystroke
		v.validateSync();
		return v;
	}, [form, rules, customMessages]);

	const handleChange = useCallback((field: keyof T, value: unknown) => {
		setForm((prev) => ({ ...prev, [field]: value }));
	}, []);

	return {
		form,
		setForm,
		handleChange,
		errors: validator.getErrors(),
		passes: validator.passes(),
		fails: validator.fails(),
		getError: (field: keyof T | string) =>
			validator.getErrors()[field as string] || null,
	};
}

/**
 * ASYNCHRONOUS HOOK: Explicit / Managed Lifecycle Validation
 * Best for network checks (unique email lookup, coupon codes, server validations)
 */
export function useReactAsyncFormValidator<T extends Record<string, unknown>>(
	initialData: T,
	rules: Record<keyof T | string, string | (string | ValidationRule)[]>,
	customMessages: Record<string, string> = {}
) {
	const [form, setForm] = useState<T>(initialData);
	const [errors, setErrors] = useState<Record<string, string[]>>({});
	const [isPending, setIsPending] = useState(false);
	const [isValid, setIsValid] = useState(true);

	const handleChange = useCallback((field: keyof T, value: unknown) => {
		setForm((prev) => ({ ...prev, [field]: value }));
	}, []);

	// Call this explicitly on form submit or input blur events
	const validateAsync = useCallback(
		async (currentData = form) => {
			setIsPending(true);
			const v = Validator.make(
				currentData as Record<string, unknown>,
				rules,
				customMessages
			);
			await v.validate();
			setErrors(v.getErrors());
			setIsValid(v.passes());
			setIsPending(false);
			return v.passes();
		},
		[form, rules, customMessages]
	);

	return {
		form,
		setForm,
		handleChange,
		validateAsync,
		errors,
		isPending,
		passes: isValid,
		fails: !isValid,
		getError: (field: keyof T | string) => errors[field as string] || null,
	};
}
