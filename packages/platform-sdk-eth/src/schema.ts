import { ValidatorSchema } from "@arkecosystem/platform-sdk-support";

export const schema = ValidatorSchema.object().shape({
	network: ValidatorSchema.string().oneOf(["mainnet", "ropsten", "rinkeby", "goerli", "kovan"]),
	peer: ValidatorSchema.string().url().notRequired(),
	httpClient: ValidatorSchema.object(),
});
