import { Contracts } from "@arkecosystem/platform-sdk";
import { BigNumber } from "@arkecosystem/utils";

export class Block implements Contracts.Block {
	readonly #data: Contracts.KeyValuePair;

	public constructor(data: Contracts.KeyValuePair) {
		this.#data = data;
	}

	public getId(): string {
		return this.#data.hash;
	}

	public getHeight(): string {
		return this.#data.number;
	}

	public getTimestamp(): string {
		return this.#data.timestamp;
	}

	public getConfirmations(): BigNumber {
		return BigNumber.ZERO;
	}

	public getTransactionsCount(): number {
		return this.#data.transactions.length;
	}

	public getGenerator(): string {
		return this.#data.miner;
	}

	public getForgedReward(): BigNumber {
		return BigNumber.ZERO;
	}

	public getForgedAmount(): BigNumber {
		const transactions: { value: string }[] = Object.values(this.#data.transactions);

		return transactions
			.map((transaction) => BigNumber.make(transaction.value))
			.reduce((accumulator, currentValue) => accumulator.plus(currentValue), BigNumber.ZERO);
	}

	public getForgedFee(): BigNumber {
		return BigNumber.make(this.#data.gasUsed);
	}

	public getForgedTotal(): BigNumber {
		return this.getForgedReward().plus(this.getForgedAmount()).plus(this.getForgedFee());
	}

	/**
	 * Only use this function if you can ensure that the unnormalised data is handled!
	 */
	public toObject(): Contracts.KeyValuePair {
		return this.#data;
	}
}