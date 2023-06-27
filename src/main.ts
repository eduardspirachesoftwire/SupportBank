import * as fs from 'fs';
import {Transaction} from "./Transaction";
import {Account} from "./Account";

const filePath: string = "transactions.csv";
let fileLines: Array<string>;

function parseFile(): void {
    const file = fs.readFileSync(filePath, 'utf-8');
    fileLines = file.split('\n');
    fileLines.shift();

}

let transactionList: Array<Transaction> = [];
function storeTransactions(): void {
    for (let line of fileLines) {
        let words: any[] = line.split(",");
        let transaction: Transaction = new Transaction(words[0], words[1], words[2], words[3], Number(words[4]));
        transactionList.push(transaction);
    }
}

let personList: string[] = [];
function storeUniquePeople(transactionList: Array<Transaction>): void {
    for (let transaction of transactionList) {
        personList.push(transaction.sender);
        personList.push(transaction.receiver);
    }
    let uniqueValue = (value: string, index: number, self: string[]) => self.indexOf(value) === index && value != null;
    personList = personList.filter(uniqueValue);
}

let accountList: Array<Account> = [];
function createAccounts(): void {
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