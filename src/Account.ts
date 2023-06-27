import {Transaction} from "./Transaction";

export class Account {
    private _owner: string;
    private _balance: number;
    private _transactions: Array<Transaction>;

    constructor(owner: string, balance: number, transactions: Array<Transaction>) {
        this._owner = owner;
        this._balance = balance;
        this._transactions = transactions;
    }

    public logTransaction(transaction: Transaction): void {
        if (transaction.sender === this._owner) {
            this._balance -= transaction.amount;
        } else if (transaction.receiver === this._owner) {
            this._balance = this._balance + transaction.amount;
        } else {
            return;
        }
        this._transactions.push(transaction);
    }

    get owner(): string {
        return this._owner;
    }

    get balance(): number {
        return this._balance;
    }

    get transactions(): Array<Transaction> {
        return this._transactions;
    }
}