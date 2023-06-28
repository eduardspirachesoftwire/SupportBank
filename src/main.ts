import * as fs from 'fs';
import * as log4js from 'log4js';
import {Transaction} from "./Transaction";
import {Account} from "./Account";
import {File} from "./File";

const readLineSync = require('readline-sync');
export class MyJSONObj {
    Date: Date;
    FromAccount: string;
    ToAccount: string;
    Narrative: string;
    Amount: number;

    constructor(Date: Date, FromAccount: string, ToAccount: string, Narrative: string, Amount: number) {
        this.Date = Date;
        this.FromAccount = FromAccount;
        this.ToAccount = ToAccount;
        this.Narrative = Narrative;
        this.Amount = Amount;
    }
}

log4js.configure({
    appenders: {
        file: {type: 'fileSync', filename: 'logs/debug.log'}
    },
    categories: {
        default: {appenders: ['file'], level: 'debug'}
    }
});

const logger = log4js.getLogger('supportbank.log');



let parseDate = (stringDate: string) => {
    let words = stringDate.split("/");
    if (words.length != 3) {
        logger.log("Date in incorrect format");
        return null;
    } else {
        return new Date(Number(words[2]), Number(words[1]), Number(words[0]));
    }
}

let transactionList: Array<Transaction> = [];
let jsonList: Array<MyJSONObj> = [];

function storeTransactionsJSON(): void {
    logger.log("Storing and parsing transactions");
    for (let jsonObj of inputFile.fileJsonArray) {
        transactionList.push(new Transaction(jsonObj.Date,
            jsonObj.FromAccount, jsonObj.ToAccount, jsonObj.Narrative, jsonObj.Amount));
    }

}

function storeTransactionsCSV(): void {
    for (let line of inputFile.fileLines) {
        let words: any[] = line.split(",");
        let date = parseDate(words[0]);
        if (date == null) {
            continue;
        }
        let transactionValue = Number(words[4]);
        if (isNaN(+transactionValue)) {
            logger.log("Transaction value must be a number");
            continue;
        }
        let transaction: Transaction = new Transaction(date, words[1], words[2], words[3], transactionValue);
        transactionList.push(transaction);
    }
}

let personList: string[] = [];

function storeUniquePeople(transactionList: Array<Transaction>): void {
    logger.log("Identifying unique people to create accounts");
    for (let transaction of transactionList) {
        personList.push(transaction.sender);
        personList.push(transaction.receiver);
    }
    let uniqueValue = (value: string, index: number, self: string[]) => self.indexOf(value) === index && value != null;
    personList = personList.filter(uniqueValue);
}

let accountList: Array<Account> = [];

function createAccounts(): void {
    logger.log("Creating accounts", inputFile.filePath);
    for (let person of personList) {
        let account = new Account(person, 0, []);
        accountList.push(account);
    }
}

function identifyAccount(ownerName: string) {
    for (let account of accountList) {
        if (account.owner === ownerName) {
            return account;
        }
    }
    return null;
}

function updateAccountValues(): void {
    logger.log("Registering transactions", inputFile.filePath);
    for (let transaction of transactionList) {
        let sender = identifyAccount(transaction.sender);
        let receiver = identifyAccount(transaction.receiver);
        if (sender != null) {
            sender.logTransaction(transaction);
        }
        if (receiver != null) {
            receiver.logTransaction(transaction);
        }
    }
}

function listBalances(): void {
    for (let account of accountList) {
        console.log(account.owner + ": " + account.balance.toFixed(2));
    }
}

let inputFile: File;

function getUserInput() {
    while (true) {
        const query = readLineSync.question('Enter query\n> ');
        let queryWords = query.split(" ");
        if (queryWords[0] === "Import") {
            let filePath = queryWords[2];
            inputFile = new File(filePath);
            inputFile.determineFileType();
            main();
        } else if (queryWords[0] === "List") {
            if (queryWords[1] === "All") {
                listBalances();
            } else {
                let account = identifyAccount(queryWords[1] + " " + queryWords[2]);
                if (account == null) {
                    console.log("Account does not exist.");
                } else {
                    console.log(account.transactions);
                }
            }
        } else {
            break;
        }
        console.log();
    }
}
getUserInput();
function main() {
    inputFile.readFileContents();
    if (inputFile.fileType === "json") {
        inputFile.parseFileJSON();
        storeTransactionsJSON();
    } else {
        inputFile.parseFileCSV();
        storeTransactionsCSV();
    }
    storeUniquePeople(transactionList);
    createAccounts();
    updateAccountValues();
}
