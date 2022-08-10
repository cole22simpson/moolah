let db;

// establish a connection to an indexedDB db named moolah and set it to version 1
const request = indexedDB.open('moolah', 1)

request.onupgradeneeded = function(event) {
  const db = event.target.result;

  db.createObjectStore('new_trans', { autoIncrement: true });
};

request.onsuccess = function(event) {
  db = event.target.result;

  if (navigator.onLine) {
    uploadTransaction();
  }
};

request.onerror = function(event) {
  console.log(event.target.errorCode);
}

function saveRecord(record) {
  const transaction = db.transaction(['new_trans'], 'readwrite');

  const budgetObjectStore = transaction.objectStore('new_trans');

  budgetObjectStore.add(record);
}

function uploadBudget() {
  const transaction = db.transaction(['new_trans'], 'readwrite');

  const budgetObjectStore = transaction.objectStore('new_trans');

  const getAll = budgetObjectStore.getAll();

  getAll.onsuccess = function() {
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

        const transaction = db.transaction(['new_trans'], 'readwrite');
        const budgetObjectStore = transaction.objectStore('new_trans');
        budgetObjectStore.clear();
      })
      .catch(err => {
        console.log(err);
      });
    }
  };
}

window.addEventListener('online', uploadTransaction)