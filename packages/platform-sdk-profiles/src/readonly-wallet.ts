import { Coins, Contracts } from "@arkecosystem/platform-sdk";

import { Avatar } from "./avatar";
import { container } from "./container";
import { Identifiers, WalletStruct } from "./contracts";
import { WalletSetting } from "./enums";
import { DataRepository } from "./repositories/data-repository";
import { SettingRepository } from "./repositories/setting-repository";
import { WalletFlag } from "./wallet.models";

/**
 * 1. Read-only wallets fetch information about themselves from the network.
 * 2. They are not allowed to perform any write operation communication with the network.
 * 3. This is currently only used for contacts.
 */
export class ReadOnlyWallet {
	#dataRepository!: DataRepository;
	#settingRepository!: SettingRepository;

	#id!: string;
	#coin!: Coins.Coin;
	#wallet!: Contracts.WalletData;

	#address!: string;

	public constructor(id: string) {
		this.#id = id;
		this.#dataRepository = new DataRepository();
		this.#settingRepository = new SettingRepository(Object.values(WalletSetting));
	}

	/**
	 * These methods allow to switch out the underlying implementation of certain things like the coin.
	 */

	public async setCoin(coin: Coins.CoinSpec, network: string): Promise<ReadOnlyWallet> {
		this.#coin = await Coins.CoinFactory.make(coin, {
			network,
			httpClient: container.get(Identifiers.HttpClient),
		});

		return this;
	}

	public async setAddress(address: string): Promise<ReadOnlyWallet> {
		const isValidAddress: boolean = await this.coin().identity().address().validate(address);

		if (!isValidAddress) {
			throw new Error(`Failed to retrieve information for ${address} because it is invalid.`);
		}

		this.#address = address;

		this.#wallet = await this.#coin.client().wallet(address);

		return this;
	}

	public id(): string {
		return this.#id;
	}

	public coin(): Coins.Coin {
		return this.#coin;
	}

	public network(): Coins.CoinNetwork {
		return this.#coin.network();
	}

	public currency(): string {
		return this.network().currency.ticker;
	}

	public alias(): string | undefined {
		return this.settings().get(WalletSetting.Alias);
	}

	public address(): string {
		return this.#address;
	}

	public avatar(): string {
		return Avatar.make(this.address());
	}

	public data(): DataRepository {
		return this.#dataRepository;
	}

	public settings(): SettingRepository {
		return this.#settingRepository;
	}

	/**
	 * These methods serve as identifiers for special types of wallets.
	 */

	public isDelegate(): boolean {
		return this.#wallet.isDelegate();
	}

	public isKnown(): boolean {
		return this.#wallet.isKnown();
	}

	public isLedger(): boolean {
		// TODO: automatically determine this
		return this.data().has(WalletFlag.Ledger);
	}

	public isMultiSignature(): boolean {
		return this.#wallet.isMultiSignature();
	}

	public isSecondSignature(): boolean {
		return this.#wallet.isSecondSignature();
	}

	public isStarred(): boolean {
		return this.data().get(WalletFlag.Starred) === true;
	}

	public toggleStarred(): void {
		this.data().set(WalletFlag.Starred, !this.isStarred());
	}

	public toObject(): WalletStruct {
		const coinConfig: any = { ...this.coin().config().all() };
		delete coinConfig.httpClient;

		return {
			id: this.id(),
			coin: this.coin().manifest().get<string>("name"),
			coinConfig,
			network: this.network().id,
			address: this.address(),
			data: this.data().all(),
			settings: this.settings().all(),
		};
	}

	// #id!: string;
	// #name!: string;
	// #addresses: ContactAddress[] = [];
	// #starred!: boolean;

	// public constructor({ id, name, starred, addresses }: ContactStruct) {
	// 	this.#id = id;
	// 	this.#name = name;
	// 	this.#starred = starred;
	// 	this.#addresses = addresses;

	// 	for (const item of this.#addresses) {
	// 		item.avatar = Avatar.make(item.address);
	// 	}
	// }

	// public id(): string {
	// 	return this.#id;
	// }

	// public name(): string {
	// 	return this.#name;
	// }

	// public addresses(): ContactAddress[] {
	// 	return this.#addresses;
	// }

	// public isDelegate(): boolean {
	// 	return false;
	// }

	// public isKnown(): boolean {
	// 	return false;
	// }

	// public isLedger(): boolean {
	// 	return false;
	// }

	// public isMultiSignature(): boolean {
	// 	return false;
	// }

	// public isSecondSignature(): boolean {
	// 	return false;
	// }

	// public isStarred(): boolean {
	// 	return this.#starred;
	// }

	// public toggleStarred(): void {
	// 	this.#starred = !this.isStarred();
	// }

	// public toObject(): ContactStruct {
	// 	return {
	// 		id: this.id(),
	// 		name: this.name(),
	// 		starred: this.isStarred(),
	// 		addresses: this.addresses(),
	// 	};
	// }
}
