const fs = require('fs');

let events = {
  arr: [],
  on(fn) {
    this.arr.push(fn);
  },
  emit() {
    this.arr.forEach((fn) => fn());
  },
};

let person = {} as any;
events.on(() => {
  Object.keys(person).length === 2 && console.log(person);
});

fs.readFile('./name.txt', 'utf8', (err, data) => {
  person.name = data;
  events.emit();
});

fs.readFile('./age.txt', 'utf8', (err, data) => {
  person.age = data;
  events.emit();
});

export {};
