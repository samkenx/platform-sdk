import { Coin } from "./coin";
import { Config } from "./config";
import { CoinOptions, CoinSpec } from "./contracts";
import { Manifest } from "./manifest";
import { NetworkRepository } from "./network-repository";

export class CoinFactory {
	public static async make(coin: CoinSpec, options: CoinOptions): Promise<Coin> {
		const { manifest, services } = coin;

		const networks: NetworkRepository = new NetworkRepository(manifest.networks);

		/**
		 * This block is responsible for adding a custom network with a unique name
		 * before the coin is initialised. This allows us to use coins that are not
		 * part of the default network list that can be found in the manifest file.
		 */
		if (typeof options.network === "object") {
			networks.push(options.network.id, options.network);
		}

		const config: Config = new Config(options, coin.schema);
		config.set("network", networks.get(config.get<string>("network")));

		return new Coin({
			networks,
			manifest: new Manifest(manifest),
			config,
			services: {
				client: await services.ClientService.construct(config),
				fee: await services.FeeService.construct(config),
				identity: await services.IdentityService.construct(config),
				ledger: await services.LedgerService.construct(config),
				link: await services.LinkService.construct(config),
				message: await services.MessageService.construct(config),
				multiSignature: await services.MultiSignatureService.construct(config),
				peer: await services.PeerService.construct(config),
				transaction: await services.TransactionService.construct(config),
			},
		});
	}
}
