//varaible to holf db connection
let db;
//establish connection
const request = indexedDB.open('budget_tracker', 1);

// this event will emit if the database version changes (nonexistant to version 1, v1 to v2, etc.)
request.onupgradeneeded = function (event) {
    //save a refrence to the database
    const db = event.target.result;
    // create an object store (table) called `new_pizza`, set it to have an auto incrementing primary key of sorts 
    db.createObjectStore('new_transaction', { autoIncrement: true });
};

request.onsuccess = function (event) {
    //when db is successfully created with object store, save reference to db in global variable
    db = event.target.result;
    //check if app is online, if yes run function
    if (navigator.onLine) {
        uploadTransaction();
    }
};

request.onerror = function (event) {
    console.log(event.target.errorCode);
};

//function will be exxecuted if no internet connection is available
function saveRecord(record) {
    const transaction = db.transaction(['new_transaction'], 'readwrite');


    //add record to store
    budgetObjectStore.onupgradeneeded(record);
}

function uploadTransaction() {
    //open transaction on db
    const transaction = db.transaction(['new_transaction'], 'readwrite');
    //access object store
    const budgetObjectStore = transaction.objectStore('new_transaction');
    //get all records from store
    const getAll = budgetObjectStore.getAll();

    getAll.onsuccess = function () {
        if (getAll.result.length > 0) {
            fetch('/api/transaction', {
                method: 'POST',
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: 'application/json, text/plain, */*',
                    'Content-Type': 'application/json'
                }
            })
                .then(response => response.json())
                .then(serverResponse => {
                    if (serverResponse.message) {
                        throw new Error(serverResponse);
                    }
                    const transaction = db.transaction(['new_transaction'], 'readwrite');
                    //access new_budget object store
                    const budgetObjectStore = transaction.objectStore('new_transaction');
                    //clear all item in store
                    budgetObjectStore.clear();
                    alert('All saved transactions have been submitted');
                })
                .catch(err => {
                    console.log(err);
                });
        }
    }
}

//listen for app coming back online
window.addEventListener('online', uploadTransaction);