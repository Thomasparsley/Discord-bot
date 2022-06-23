export class Optional<T> {
	private value: T | undefined;

	constructor(value: T | undefined) {
		this.value = value;
	}

	public isPresent(): boolean {
		return !this.isEmpty();
	}

	public isEmpty(): boolean {
		return this.value === undefined;
	}

	public get(): T {
		if (this.value === undefined) {
			throw "";
		}

		return this.value;
	}
}

export function Some<T>(value: T) {
	return new Optional<T>(value);
}

export function Empty<T>() {
	return new Optional<T>(undefined);
}