import { FailCallback, ValidationRule } from '../contracts/Validation';

export class ImageRule implements ValidationRule {
	public validate(
		attribute: string,
		value: unknown,
		fail: FailCallback
	): void {
		const allowedExtensions = [
			'jpeg',
			'jpg',
			'png',
			'bmp',
			'gif',
			'svg',
			'webp',
		];
		let filename = '';

		if (typeof value === 'string') {
			filename = value;
		} else if (value && typeof value === 'object' && 'name' in value) {
			filename = String((value as any).name);
		} else {
			fail(`The :attribute must be an image.`);
			return;
		}

		const extension = filename.split('.').pop()?.toLowerCase() || '';
		if (!allowedExtensions.includes(extension)) {
			fail(`The :attribute must be an image.`);
		}
	}
}
