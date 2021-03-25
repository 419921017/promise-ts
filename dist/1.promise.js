/*
 * @Descripttion: your project
 * @version: 1.0
 * @Author: power_840
 * @Date: 2021-03-25 20:44:09
 * @LastEditors: power_840
 * @LastEditTime: 2021-03-25 20:51:05
 */

const Promise = require("./bundle.cjs");
console.log(Promise);

let promise = new Promise((reslove, reject) => {
  // reslove("success");
  setTimeout(() => {
    reslove("success");
  }, 1000);
});
console.log("promise", Promise);

promise.then(
  (data) => {
    console.log("then", data);
  },
  (err) => {
    console.log("err", err);
  }
);
promise.then(
  (data) => {
    console.log("then", data);
  },
  (err) => {
    console.log("err", err);
  }
);
