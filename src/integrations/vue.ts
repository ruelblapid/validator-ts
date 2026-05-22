import { computed, reactive } from 'vue';
import { Validator } from '../Validator.js';
import { ValidationRule } from '../contracts/Validation.js';

export function useVueFormValidator<T extends Record<string, unknown>>(
	initialData: T,
	rules: Record<keyof T | string, string | (string | ValidationRule)[]>,
	customMessages: Record<string, string> = {}
) {
	const form = reactive(initialData);

	const validator = computed(() => {
		return Validator.make(
			form as Record<string, unknown>,
			rules,
			customMessages
		);
	});

	return {
		form,
		errors: computed(() => validator.value.getErrors()),
		invalidFields: computed(() => validator.value.invalid()),
		passes: computed(() => validator.value.passes()),
		fails: computed(() => validator.value.fails()),
		getError: (field: keyof T | string) =>
			validator.value.getError(field as string),
	};
}
