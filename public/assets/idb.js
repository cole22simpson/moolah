let db;

// establish a connection to an indexedDB db named moolah and set it to version 1
const request = indexedDB.open('moolah', 1)

request.onupgradeneeded = function(event) {
  const db = event.target.result;

  db.createObjectStore('moolah', { autoIncrement: true });
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
  const transaction = db.transaction(['moolah'], 'readwrite');

  const moolahObjectStore = transaction.objectStore('moolah');

  moolahObjectStore.add(record);
}

function uploadTransaction() {
  const transaction = db.transaction(['moolah'], 'readwrite');

  const moolahObjectStore = transaction.objectStore('moolah');

  const getAll = moolahObjectStore.getAll();

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

        const transaction = db.transaction(['moolah'], 'readwrite');
        const moolahObjectStore = transaction.objectStore('moolah');
        moolahObjectStore.clear();

        alert('All saved transactions have been submitted!');
      })
      .catch(err => {
        console.log(err);
      });
    }
  };
}

window.addEventListener('online', uploadTransaction)