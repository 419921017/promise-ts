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

class Promise {
  public status: STATUS;
  public value;
  public reason;
  constructor(executor) {
    this.status = STATUS.pending;
    const resolve = (value: any) => {
      if (this.status === STATUS.pending) {
        this.status = STATUS.fulfilled;
        this.value = value;
      }
    };

    const reject = (reason: any) => {
      if (this.status === STATUS.pending) {
        this.status = STATUS.rejected;
        this.reason = reason;
      }
    };
    try {
      executor(resolve, reject);
    } catch (error) {
      reject(error);
    }
  }
}

export default Promise;
