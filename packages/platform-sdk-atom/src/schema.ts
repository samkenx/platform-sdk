import { ValidatorSchema } from "@arkecosystem/platform-sdk-support";

export const schema = ValidatorSchema.object().shape({
	network: ValidatorSchema.string().oneOf(["cosmos.mainnet", "cosmos.testnet", "terra.mainnet", "terra.testnet"]),
	peer: ValidatorSchema.string().url().notRequired(),
	httpClient: ValidatorSchema.object(),
});
