const fs = require('fs');

const promisify = (fn) => (...args) => {
  return new Promise((resolve, reject) => {
    fn(...args, function (err, data) {
      if (err) {
        reject(err);
      }
      resolve(data);
    });
  });
};

const read = promisify(fs.readFile);

read('./age.txt', 'utf8')
  .then((data) => {
    console.log(data);
  })
  .catch((err) => {
    console.log(err);
  });
