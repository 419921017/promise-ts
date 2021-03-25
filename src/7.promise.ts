/*
 * @Descripttion: your project
 * @version: 1.0
 * @Author: power_840
 * @Date: 2021-03-25 20:10:54
 * @LastEditors: power_840
 * @LastEditTime: 2021-03-25 21:37:49
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
        try {
          let x = onFulfilled(this.value);
          reslove(x);
        } catch (error) {
          reject(error);
        }
      }
      if (this.status === STATUS.rejected) {
        try {
          // NOTE: 失败的时候也是返回给下个promise的then
          let x = onRejected(this.reason);
          reslove(x);
        } catch (error) {
          reject(error);
        }
      }
      if (this.status === STATUS.pending) {
        this.onResolvedCallbacks.push(() => {
          try {
            let x = onFulfilled(this.value);
            reslove(x);
          } catch (error) {
            reject(error);
          }
        });
        this.onRejectedCallbacks.push(() => {
          try {
            let x = onRejected(this.reason);
            reslove(x);
          } catch (error) {
            reject(error);
          }
        });
      }
    });
    return promise2;
  }
}

export default Promise;
