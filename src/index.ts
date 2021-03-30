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
  pending = 'PENDING',
  fulfilled = 'FULFILLED',
  rejected = 'REJECTED',
}
// 兼容别人的promise
function resolvePromise(promise2, x, resolve, reject) {
  if (promise2 == x) {
    return reject(new TypeError('类型错误'));
  }
  if ((typeof x === 'object' && x !== null) || typeof x === 'function') {
    // 通过called确保只能调用一次, 状态一旦发生改变, 不能修改, 直接返回
    let called = false;
    try {
      // 这里的promise可能是别人实现的promise
      const then = x.then;
      if (typeof then === 'function') {
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
      } else {
        // 普通对象处理
        resolve(x);
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
  static deferred;
  public status: STATUS;
  public value: any = undefined;
  public reason: any = undefined;
  public onResolvedCallbacks: Function[] = [];
  public onRejectedCallbacks: Function[] = [];
  constructor(executor) {
    this.status = STATUS.pending;
    const resolve = (value: any) => {
      if (this.status === STATUS.pending) {
        // 需要考虑传入的value是promise的情况
        if (value instanceof Promise) {
          return value.then(resolve, reject);
        }
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
  then(onFulfilled?, onRejected?) {
    // 如果onFulfilled不是函数, 将值传递给下个
    onFulfilled =
      typeof onFulfilled === 'function' ? onFulfilled : (val) => val;
    // 如果onRejected不是函数, 将错误传递给下个
    onRejected =
      typeof onRejected === 'function'
        ? onRejected
        : (err) => {
            throw err;
          };
    let promise2 = new Promise((resolve, reject) => {
      if (this.status === STATUS.fulfilled) {
        setTimeout(() => {
          try {
            let x = onFulfilled(this.value);
            resolvePromise(promise2, x, resolve, reject);
            // resolve(x);
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
            resolvePromise(promise2, x, resolve, reject);
            // resolve(x);
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
              resolvePromise(promise2, x, resolve, reject);
              // resolve(x);
            } catch (error) {
              reject(error);
            }
          }, 0);
        });
        this.onRejectedCallbacks.push(() => {
          setTimeout(() => {
            try {
              let x = onRejected(this.reason);
              resolvePromise(promise2, x, resolve, reject);
              // resolve(x);
            } catch (error) {
              reject(error);
            }
          }, 0);
        });
      }
    });
    return promise2;
  }
  catch(onRejected) {
    return this.then(null, onRejected);
  }
  // finally的结果不会影响后续结果
  // 无论成功和失败都要执行的逻辑(callback)
  // finally传给后续的then的值是上一次值接受的值
  // 成功直接传递给下一个resolve
  // 失败也是直接传递给下一个reject
  finally(callback) {
    return this.then(
      (value) => Promise.resolve(callback()).then(() => value),
      (err) =>
        Promise.resolve(callback()).then(() => {
          throw err;
        })
    );
  }
  static resolve(value?) {
    return new Promise((resolve, _) => {
      resolve(value);
    });
  }
  static reject(reason?) {
    return new Promise((_, reject) => {
      reject(reason);
    });
  }
  static all(values) {
    return new Promise((resolve, reject) => {
      let timers = 0;
      let arr = [];
      function changeArr(value, key) {
        arr[key] = value;
        if (++timers === values.length) {
          resolve(arr);
        }
      }
      for (let i = 0; i < values.length; i++) {
        const value = values[i];
        if (isPromise(value)) {
          value.then((data) => {
            changeArr(data, i);
          }, reject);
        } else {
          changeArr(value, i);
        }
      }
    });
  }
  static race(promises) {
    return new Promise((resolve, reject) => {
      for (let i = 0; i < promises.length; i++) {
        const promise = promises[i];
        // if (isPromise(promise)) {
        //   promise.then((data) => {
        //     resolve(data);
        //   }, reject);
        // } else {
        //   resolve(promise);
        // }
        Promise.resolve(promise).then(
          (value) => resolve(value),
          (reason) => reject(reason)
        );
      }
    });
  }
}

function isPromise(val) {
  if (
    val &&
    ((typeof val === 'object' && val !== null) || typeof val === 'function') &&
    typeof val.then === 'function'
  ) {
    return true;
  }
  return false;
}

Promise.deferred = function () {
  let dfd = {} as any;
  dfd.promise = new Promise((resolve, reject) => {
    dfd.resolve = resolve;
    dfd.reject = reject;
  });
  return dfd;
};

export default Promise;
