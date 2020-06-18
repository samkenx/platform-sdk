// TODO: create a proper contract for this
export type Ledger = any;

export interface LedgerService {
	destruct(): Promise<void>;

	connect(ledger: Ledger): Promise<void>;

	disconnect(): Promise<void>;

	getVersion(): Promise<string>;

	getPublicKey(path: string): Promise<string>;

	signTransaction(path: string, payload: Buffer): Promise<string>;

	signTransactionWithSchnorr(path: string, payload: Buffer): Promise<string>;

	signMessage(path: string, payload: Buffer): Promise<string>;

	signMessageWithSchnorr(path: string, payload: Buffer): Promise<string>;
}
