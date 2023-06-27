import * as fs from 'fs';
import * as log4js from 'log4js';
import {Transaction} from "./Transaction";
import {Account} from "./Account";

log4js.configure({
    appenders: {
        file: { type: 'fileSync', filename: 'logs/debug.log' }
    },
    categories: {
        default: { appenders: ['file'], level: 'debug'}
    }
});

const logger = log4js.getLogger('supportbank.log');

const filePath: string = "DodgyTransactions2015.csv";
let fileLines: Array<string>;
function parseFile(): void {
    const file = fs.readFileSync(filePath, 'utf-8');
    fileLines = file.split('\n');
    fileLines.shift();
    logger.log("Finished parsing file ", filePath);
}

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
function storeTransactions(): void {
    logger.log("Storing and parsing transactions");
    for (let line of fileLines) {
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
    logger.log("Creating accounts", filePath);
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
    logger.log("Registering transactions", filePath);
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

parseFile();
storeTransactions();
storeUniquePeople(transactionList);
createAccounts();
updateAccountValues();

const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});

readline.question('Please enter the query: ', (limit: string) => {
    if (limit === "List All") {
        listBalances();
    } else {
        let queryWords = limit.split(" ");
        let account = identifyAccount(queryWords[1] + " " + queryWords[2]);
        if (account == null) {
            console.log("Account does not exist.");
        } else {
            console.log(account.transactions);
        }
    }
    readline.close();
});