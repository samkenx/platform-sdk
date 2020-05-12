import { Contracts, Exceptions } from "@arkecosystem/platform-sdk";
import Wallet from "ethereumjs-wallet";

import { PrivateKey } from "./private-key";

export class PublicKey implements Contracts.PublicKey {
	readonly #privateKey: PrivateKey;

	public constructor() {
		this.#privateKey = new PrivateKey();
	}

	public async fromPassphrase(passphrase: string): Promise<string> {
		const privateKey = Buffer.from(await this.#privateKey.fromPassphrase(passphrase), "hex");
		const keyPair = Wallet.fromPrivateKey(privateKey);

		return keyPair.getPublicKey().toString("hex");
	}

	public async fromMultiSignature(min: number, publicKeys: string[]): Promise<string> {
		throw new Exceptions.NotSupported(this.constructor.name, "fromMultiSignature");
	}

	public async fromWIF(wif: string): Promise<string> {
		throw new Exceptions.NotSupported(this.constructor.name, "fromWIF");
	}
}