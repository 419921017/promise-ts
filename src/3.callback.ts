// promise解决的问题
// 1. 异步并发问题
// 2. 回调地狱, 回调函数

const after = (times: number, callback: Function) => {
  let obj = {} as any;
  return function (key: string, val: any) {
    obj[key] = val;
    --times == 0 && callback(obj);
  };
};

const fs = require('fs');

const fn = after(2, (obj) => {
  console.log(obj);
});

fs.readFile('./name.txt', 'utf8', (err, data) => {
  fn('name', data);
});

fs.readFile('./age.txt', 'utf8', (err, data) => {
  fn('age', data);
});

export {};
