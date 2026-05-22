import { FailCallback, ValidationRule } from '../contracts/Validation';

export class UniqueEmailRule implements ValidationRule {
	// Simulate an async data call / API lookup query
	private async checkDatabaseAvailability(email: string): Promise<boolean> {
		return new Promise((resolve) => {
			setTimeout(() => {
				const takenEmails = ['admin@site.com', 'hello@rbl.dev'];
				resolve(!takenEmails.includes(email));
			}, 400); // 400ms server delay simulation
		});
	}

	public async validate(
		attribute: string,
		value: unknown,
		fail: FailCallback
	): Promise<void> {
		if (typeof value !== 'string') return;

		const isAvailable = await this.checkDatabaseAvailability(value);
		if (!isAvailable) {
			fail(`The :attribute has already been taken.`);
		}
	}
}
