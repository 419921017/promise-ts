/*
 * @Descripttion: your project
 * @version: 1.0
 * @Author: power_840
 * @Date: 2021-03-25 20:10:54
 * @LastEditors: power_840
 * @LastEditTime: 2021-03-25 22:43:44
 */
// promise解决的问题
// 1. 异步并发问题
// 2. 异步嵌套问题, 回调地狱, 回调函数

// promise标准
/**
 *
 * “promise” is an object or function with a then method whose behavior conforms to this specification. 必须是对象或者函数, 必须有then
 * “thenable” is an object or function that defines a then method. 必须有then
 * “value” is any legal JavaScript value (including undefined, a thenable, or a promise). resolve转入的value值类型
 * “exception” is a value that is thrown using the throw statement. 异常走失败
 * “reason” is a value that indicates why a promise was rejected. 失败
 */

// let newPromise = new Promise((resolve, reject) => {});

const enum STATUS {
  pending = "PENDING",
  fulfilled = "FULFILLED",
  rejected = "REJECTED",
}

function resolvePromise(promise2, x, resolve, reject) {
  console.log(promise2, x, resolve, reject);
  if (promise2 == x) {
    return reject(new TypeError("类型错误"));
  }
  if ((typeof x === "object" && x !== null) || typeof x === "function") {
    // 通过called确保只能调用一次
    let called = false;
    try {
      const then = x.then;
      if (typeof then === "function") {
        then.call(
          x,
          (y) => {
            if (called) {
              return;
            }
            called = true;
            // resolve(y);
            // y也有可能是个promise, y需要递归处理
            resolvePromise(promise2, y, resolve, reject);
          },
          (r) => {
            if (called) {
              return;
            }
            called = true;
            // 只要失败就直接抛出, 不需要进行额外处理
            reject(r);
          }
        );
      }
    } catch (error) {
      if (called) {
        return;
      }
      called = true;
      reject(error);
    }
  } else {
    resolve(x);
  }
}

class Promise {
  public status: STATUS;
  public value: any = undefined;
  public reason: any = undefined;
  public onResolvedCallbacks: Function[] = [];
  public onRejectedCallbacks: Function[] = [];
  constructor(executor) {
    this.status = STATUS.pending;
    const resolve = (value: any) => {
      if (this.status === STATUS.pending) {
        this.status = STATUS.fulfilled;
        this.value = value;
        this.onResolvedCallbacks.forEach((fn) => fn());
      }
    };

    const reject = (reason: any) => {
      if (this.status === STATUS.pending) {
        this.status = STATUS.rejected;
        this.reason = reason;
        this.onRejectedCallbacks.forEach((fn) => fn());
      }
    };
    try {
      executor(resolve, reject);
    } catch (error) {
      reject(error);
    }
  }
  then(onFulfilled, onRejected) {
    let promise2 = new Promise((reslove, reject) => {
      if (this.status === STATUS.fulfilled) {
        setTimeout(() => {
          try {
            let x = onFulfilled(this.value);
            resolvePromise(promise2, x, reslove, reject);
            // reslove(x);
          } catch (error) {
            reject(error);
          }
        }, 0);
      }
      if (this.status === STATUS.rejected) {
        setTimeout(() => {
          try {
            // NOTE: 失败的时候也是返回给下个promise的then
            let x = onRejected(this.reason);
            resolvePromise(promise2, x, reslove, reject);
            // reslove(x);
          } catch (error) {
            reject(error);
          }
        }, 0);
      }
      if (this.status === STATUS.pending) {
        this.onResolvedCallbacks.push(() => {
          setTimeout(() => {
            try {
              let x = onFulfilled(this.value);

              resolvePromise(promise2, x, reslove, reject);
              // reslove(x);
            } catch (error) {
              reject(error);
            }
          }, 0);
        });
        this.onRejectedCallbacks.push(() => {
          setTimeout(() => {
            try {
              let x = onRejected(this.reason);
              resolvePromise(promise2, x, reslove, reject);
              // reslove(x);
            } catch (error) {
              reject(error);
            }
          }, 0);
        });
      }
    });
    return promise2;
  }
}

export default Promise;
