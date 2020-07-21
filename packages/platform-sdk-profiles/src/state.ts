/* eslint-disable @typescript-eslint/no-floating-promises */

// import { useEffect, useReducer } from "react";

// import { Storage } from "./env.models";

// type State = Record<string, unknown>;

// type Action =
// 	| { type: "init"; state: State }
// 	| { type: "set"; key: string; value: unknown }
// 	| { type: "forget"; key: string }
// 	| { type: "flush" };

// const reducer = (state: State, action: Action) => {
// 	switch (action.type) {
// 		case "init":
// 			return action.state;

// 		case "set":
// 			return { ...state, [action.key]: action.value };

// 		default:
// 			throw new Error();
// 	}
// };

// export const useStore = (storage: Storage): Storage => {
// 	const [state, dispatch] = useReducer(reducer, {});

// 	useEffect(() => {
// 		const setInitialState = async () => dispatch({ type: "init", state: await storage.all() });

// 		setInitialState();
// 	}, [storage]);

// 	const all = async () => state;

// 	const get = async <T>(key: string) => state[key] as T | undefined;

// 	const count = async () => Object.keys(state).length;

// 	const flush = async () => {
// 		await storage.flush();

// 		dispatch({ type: "init", state: {} });
// 	};

// 	const forget = async (key: string) => {
// 		await storage.forget(key);

// 		dispatch({ type: "set", key, value: undefined });
// 	};

// 	const set = async (key: string, value: any) => {
// 		await storage.set(key, value);

// 		dispatch({ type: "set", key, value });
// 	};

// 	const snapshot = () => storage.snapshot();

// 	const restore = () => storage.restore();

// 	return { all, get, count, set, flush, forget, snapshot, restore };
// };

import { init, RematchStore } from "@rematch/core";

export class StateStorage {
	readonly #state: RematchStore;
	readonly #registrations: Record<string, Function> = {};

	public constructor() {
		this.#state = init({
			models: {
				count: {
					state: 0,
					reducers: {
						increment(state, payload) {
							return state + payload;
						},
					},
				},
			},
		});
	}

	public register(type: string, fn: Function): void {
		if (this.#registrations[type]) {
			throw new Error("A handler for this type is already registered.");
		}

		this.#registrations[type] = fn;
	}

	public has(type: string): boolean {
		return this.#registrations[type] !== undefined;
	}

	public dispatch(type: string, payload: object): void {
		this.#state.dispatch({ type, payload });
	}
}

// export class StateStorage implements Storage {
// 	readonly #store: Storage;
// 	readonly #state: RematchStore;

// 	public constructor(store: Storage) {
// 		this.#store = store;

// 		this.#state = init({
// 			models: {
// 				count: {
// 					state: 0,
// 					reducers: {
// 						increment(state, payload) {
// 							return state + payload;
// 						},
// 					},
// 				},
// 			},
// 		});
// 	}

// 	public async all(): Promise<Record<string, unknown>> {
// 		return this.#store.all();
// 	}

// 	public async get<T>(key: string): Promise<T | undefined> {
// 		return this.#store.get(key);
// 	}

// 	public async set(key: string, value: string | object): Promise<void> {
// 		await this.#store.set(key, value);

// 		this.dispatch({ type: "set", key, value });
// 	}

// 	public async forget(key: string): Promise<void> {
// 		await this.#store.forget(key);

// 		this.dispatch({ type: "set", key, value: undefined });
// 	}

// 	public async flush(): Promise<void> {
// 		await this.#store.flush();

// 		this.dispatch({ type: "init", state: {} });
// 	}

// 	public async count(): Promise<number> {
// 		return this.#store.count();
// 	}

// 	public async snapshot(): Promise<void> {
// 		await this.#store.snapshot();
// 	}

// 	public async restore(): Promise<void> {
// 		await this.#store.restore();

// 		this.dispatch({ type: "init", state: {} });
// 	}

// 	private dispatch(payload: object): void {
// 		this.#state.dispatch(payload);
// 	}
// }
