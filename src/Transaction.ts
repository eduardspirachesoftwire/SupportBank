export class Transaction {
    private _date: Date;
    private _sender: string;
    private _receiver: string;
    private _narrative: string;
    private _amount: number;

    constructor(date: Date, sender: string, receiver: string, narrative: string, amount: number) {
        this._date = date;
        this._sender = sender;
        this._receiver = receiver;
        this._narrative = narrative;
        this._amount = amount;
    }

    get sender(): string {
        return this._sender;
    }

    get receiver(): string {
        return this._receiver;
    }

    get amount(): number {
        return this._amount;
    }
}