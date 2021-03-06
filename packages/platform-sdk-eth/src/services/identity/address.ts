import { Coins, Contracts, Exceptions } from "@arkecosystem/platform-sdk";
import { Buffoon } from "@arkecosystem/platform-sdk-crypto";
import Wallet from "ethereumjs-wallet";

import { createWallet, getAddress } from "./utils";

export class Address implements Contracts.Address {
	readonly #config: Coins.Config;

	public constructor(config: Coins.Config) {
		this.#config = config;
	}

	public async fromMnemonic(mnemonic: string): Promise<string> {
		try {
			return getAddress(createWallet(mnemonic, this.#config.get("network.crypto.slip44")));
		} catch (error) {
			throw new Exceptions.CryptoException(error);
		}
	}

	public async fromMultiSignature(min: number, publicKeys: string[]): Promise<string> {
		throw new Exceptions.NotSupported(this.constructor.name, "fromMultiSignature");
	}

	public async fromPublicKey(publicKey: string): Promise<string> {
		try {
			return getAddress(Wallet.fromPublicKey(Buffoon.fromHex(publicKey)));
		} catch (error) {
			throw new Exceptions.CryptoException(error);
		}
	}

	public async fromPrivateKey(privateKey: string): Promise<string> {
		try {
			return getAddress(Wallet.fromPrivateKey(Buffoon.fromHex(privateKey)));
		} catch (error) {
			throw new Exceptions.CryptoException(error);
		}
	}

	public async fromWIF(wif: string): Promise<string> {
		throw new Exceptions.NotSupported(this.constructor.name, "fromWIF");
	}

	public async validate(address: string): Promise<boolean> {
		return address !== undefined;
	}
}
