import LskBetanet from "./networks/lsk/betanet.json";
import LskMainnet from "./networks/lsk/mainnet.json";
import LskTestnet from "./networks/lsk/testnet.json";

export const manifest = {
	name: "LSK",
	networks: {
		"lsk.mainnet": LskMainnet,
		"lsk.testnet": LskTestnet,
		"lsk.betanet": LskBetanet,
	},
};
