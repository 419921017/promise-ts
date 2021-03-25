/*
 * @Descripttion: your project
 * @version: 1.0
 * @Author: power_840
 * @Date: 2021-03-25 20:44:09
 * @LastEditors: power_840
 * @LastEditTime: 2021-03-25 21:30:18
 */

const Promise = require("./bundle.cjs");
// console.log(Promise);

// let promise = new Promise((reslove, reject) => {
//   reslove("success");
// });

// // promise.then(
//   (data) => {
//     console.log("then", data);
//   },
//   (err) => {
//     console.log("err", err);
//   }
// );
// promise.then(
//   (data) => {
//     console.log("then", data);
//   },
//   (err) => {
//     console.log("err", err);
//   }
// );

let promise2 = new Promise((resolve, reject) => {
  setTimeout(() => {
    reject("ok");
  }, 1000);
}).then(
  (data) => {
    return 1;
  },
  (err) => {
    throw new Error("failed");
  }
);

promise2.then(
  (data) => {
    console.log(data, "**");
  },
  (err) => {
    console.log(err, "---");
  }
);
