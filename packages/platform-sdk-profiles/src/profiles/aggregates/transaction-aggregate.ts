import { Coins, Contracts } from "@arkecosystem/platform-sdk";

import { ExtendedTransactionData } from "../../dto/transaction";
import { ExtendedTransactionDataCollection } from "../../dto/transaction-collection";
import { transformTransactionData } from "../../dto/transaction-mapper";
import { promiseAllSettledByKey } from "../../helpers/promise";
import { ReadWriteWallet } from "../../wallets/wallet.models";
import { ProfileContract } from "../profile.models";

type HistoryMethod = string;
type HistoryWallet = ExtendedTransactionDataCollection;

export class TransactionAggregate {
	readonly #profile: ProfileContract;

	#history: Record<HistoryMethod, Record<string, HistoryWallet>> = {};

	public constructor(profile: ProfileContract) {
		this.#profile = profile;
	}

	public async transactions(query: Contracts.ClientPagination = {}): Promise<ExtendedTransactionDataCollection> {
		return this.aggregate("transactions", query);
	}

	public async sentTransactions(query: Contracts.ClientPagination = {}): Promise<ExtendedTransactionDataCollection> {
		return this.aggregate("sentTransactions", query);
	}

	public async receivedTransactions(
		query: Contracts.ClientPagination = {},
	): Promise<ExtendedTransactionDataCollection> {
		return this.aggregate("receivedTransactions", query);
	}

	public hasMore(method: string): boolean {
		return Object.values(this.#history[method] || {})
			.map((response) => response.hasMorePages())
			.includes(true);
	}

	public flush(): void {
		this.#history = {};
	}

	private async aggregate(
		method: string,
		query: Contracts.ClientPagination,
	): Promise<ExtendedTransactionDataCollection> {
		if (!this.#history[method]) {
			this.#history[method] = {};
		}

		const syncedWallets: ReadWriteWallet[] = this.getWallets();

		const requests: Record<string, Promise<Coins.TransactionDataCollection>> = {};

		for (const syncedWallet of syncedWallets) {
			requests[syncedWallet.id()] = new Promise((resolve, reject) => {
				const lastResponse: HistoryWallet = this.#history[method][syncedWallet.id()];

				if (lastResponse && !lastResponse.hasMorePages()) {
					return reject(
						`Fetched all transactions for ${syncedWallet.id()}. Call [#flush] if you want to reset the history.`,
					);
				}

				if (lastResponse && lastResponse.hasMorePages()) {
					return resolve(syncedWallet[method]({ cursor: lastResponse.nextPage(), ...query }));
				}

				return resolve(syncedWallet[method](query));
			});
		}

		const responses = await promiseAllSettledByKey<ExtendedTransactionDataCollection>(requests);
		const result: ExtendedTransactionData[] = [];

		for (const [id, request] of Object.entries(responses || {})) {
			if (request.status === "rejected" || request.value instanceof Error) {
				continue;
			}

			if (request.value.isEmpty()) {
				continue;
			}

			for (const transaction of request.value.items()) {
				result.push(transformTransactionData(this.getWallet(id), transaction));
			}

			this.#history[method][id] = request.value;
		}

		return new ExtendedTransactionDataCollection(result, {
			prev: undefined,
			self: undefined,
			next: Number(this.hasMore(method)),
		});
	}

	private getWallet(id: string): ReadWriteWallet {
		return this.#profile.wallets().findById(id);
	}

	private getWallets(): ReadWriteWallet[] {
		return this.#profile
			.wallets()
			.values()
			.filter((wallet: ReadWriteWallet) => wallet.hasSyncedWithNetwork());
	}
}
