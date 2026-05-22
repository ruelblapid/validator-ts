import { computed, reactive, ref } from 'vue';
import { Validator } from '../Validator';
import { ValidationRule } from '../contracts/Validation';

/**
 *SYNCHRONOUS COMPOSABLE: Instant Keystroke Validation
 */

export function useVueFormValidator<T extends Record<string, unknown>>(
	initialData: T,
	rules: Record<keyof T | string, string | (string | ValidationRule)[]>,
	customMessages: Record<string, string> = {}
) {
	const form = reactive(initialData);

	const validator = computed(() => {
		const v = Validator.make(
			form as Record<string, unknown>,
			rules,
			customMessages
		);
		v.validateSync(); // 🚀 Uses the instant, synchronous evaluation loop!
		return v;
	});

	return {
		form,
		errors: computed(() => validator.value.getErrors()),
		passes: computed(() => validator.value.passes()),
		fails: computed(() => validator.value.fails()),
		getError: (field: keyof T | string) =>
			validator.value.getErrors()[field as string] || null,
	};
}

/**
 * ASYNCHRONOUS COMPOSABLE: Controlled Server Validation
 */
export function useVueAsyncFormValidator<T extends Record<string, unknown>>(
	initialData: T,
	rules: Record<keyof T | string, string | (string | ValidationRule)[]>,
	customMessages: Record<string, string> = {}
) {
	const form = reactive(initialData);
	const errors = ref<Record<string, string[]>>({});
	const isPending = ref(false);
	const isValid = ref(true);

	// Controlled execution trigger
	const validateAsync = async () => {
		isPending.value = true;
		const v = Validator.make(
			form as Record<string, unknown>,
			rules,
			customMessages
		);
		await v.validate();
		errors.value = v.getErrors();
		isValid.value = v.passes();
		isPending.value = false;
		return v.passes();
	};

	return {
		form,
		validateAsync,
		errors,
		isPending,
		passes: computed(() => isValid.value),
		fails: computed(() => !isValid.value),
		getError: (field: keyof T | string) =>
			errors.value[field as string] || null,
	};
}
