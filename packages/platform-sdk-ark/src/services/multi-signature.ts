import { Coins, Contracts } from "@arkecosystem/platform-sdk";
import { Arr } from "@arkecosystem/platform-sdk-support";

export class MultiSignatureService implements Contracts.MultiSignatureService {
	readonly #config: Coins.Config;
	readonly #http: Contracts.HttpClient;

	private constructor(config: Coins.Config) {
		this.#config = config;
		this.#http = config.get<Contracts.HttpClient>("httpClient");
	}

	public static async construct(config: Coins.Config): Promise<MultiSignatureService> {
		return new MultiSignatureService(config);
	}

	public async destruct(): Promise<void> {
		//
	}

	public async all(publicKey: string, state?: string): Promise<any[]> {
		const response = await this.get("transactions", {
			publicKey,
			state,
		});

		return response.map((transaction) => {
			return {
				...transaction.data,
				multiSignature: transaction.multisigAsset,
				timestamp: transaction.timestamp,
			};
		});
	}

	public async findById(id: string): Promise<Contracts.MultiSignatureTransaction> {
		return this.get(`transaction/${id}`);
	}

	public async broadcast(transaction: Contracts.MultiSignatureTransaction): Promise<string> {
		let multiSignature = transaction.multiSignature;

		if (transaction.asset && transaction.asset.multiSignature) {
			multiSignature = transaction.asset.multiSignature;
		}

		const { id } = await this.post("transaction", {
			data: transaction,
			multisigAsset: multiSignature,
		});

		return id;
	}

	private async get(path: string, query?: Contracts.KeyValuePair): Promise<Contracts.KeyValuePair> {
		const response = await this.#http.get(`${this.getPeer()}/${path}`, query);

		return response.json();
	}

	private async post(path: string, body: Contracts.KeyValuePair): Promise<Contracts.KeyValuePair> {
		const response = await this.#http.post(`${this.getPeer()}/${path}`, body);

		return response.json();
	}

	private getPeer(): string {
		if (this.#config.has("peerMultiSignature")) {
			return this.#config.get<string>("peerMultiSignature");
		}

		throw new Error(
			"No MultiSignature peer has been provided. Please provide it if you wish to use MultiSignature features.",
		);
	}
}
