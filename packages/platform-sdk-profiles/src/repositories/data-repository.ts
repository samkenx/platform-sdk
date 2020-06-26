import dot from "dot-prop";

export class DataRepository {
	#items: object = {};
	#snapshot: object | undefined;

	public constructor(items?: object) {
		this.#items = items || {};
	}

	public all(): object {
		return this.#items;
	}

	public keys(): string[] {
		return Object.keys(this.#items);
	}

	public values<T>(): T[] {
		return Object.values(this.#items);
	}

	public get<T>(key: string, defaultValue?: T | undefined): T | undefined {
		return dot.get(this.#items, key, defaultValue);
	}

	public set(key: string, value: unknown): void {
		dot.set(this.#items, key, value);
	}

	public fill(entries: object): void {
		for (const [key, value] of Object.entries(entries)) {
			this.set(key, value);
		}
	}

	public has(key: string): boolean {
		return dot.has(this.#items, key);
	}

	public missing(key: string): boolean {
		return !this.has(key);
	}

	public forget(key: string): void {
		dot.delete(this.#items, key);
	}

	public flush(): void {
		this.#items = {};
	}

	public snapshot(): void {
		this.#snapshot = { ...this.all() };
	}

	public restore(): void {
		if (!this.#snapshot) {
			throw new Error("There is no snapshot to restore.");
		}

		this.flush();

		for (const [key, value] of Object.entries(this.#snapshot)) {
			this.set(key, value);
		}
	}

	public toJSON(): string {
		return JSON.stringify(this.#items);
	}
}
