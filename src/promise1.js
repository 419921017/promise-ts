let status = {
  PENDING: 'PENDING',
  FULFILLED: 'FULFILLED',
  REJECTED: 'REJECTED',
};

function resolvePromise(promise2, x, resolve, reject) {
  if (promise2 === x) {
    throw TypeError('promise2 !== x');
  }

  if ((typeof x === 'object' && x !== null) || typeof x === 'function') {
    let called = false;
    try {
      let then = x.then;
      if (typeof then === 'function') {
        then.call(
          x,
          (y) => {
            if (called) {
              return;
            }
            called = true;
            resolvePromise(promise2, y, resolve, reject);
          },
          (r) => {
            if (called) {
              return;
            }
            called = true;
            reject(r);
          }
        );
      } else {
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
  constructor(executor) {
    this.status = status.PENDING;
    this.value = undefined;
    this.reason = undefined;
    this.fulfilledCallbacks = [];
    this.rejectedCallbacks = [];

    const resolve = (value) => {
      if (this.status === status.PENDING) {
        if (value instanceof Promise) {
          value.then(resolve, reject);
        }
        this.status = status.FULFILLED;
        this.value = value;
        this.fulfilledCallbacks.forEach((fn) => fn());
      }
    };

    const reject = (reason) => {
      if (this.status === status.PENDING) {
        this.status = status.REJECTED;
        this.reason = reason;
        this.rejectedCallbacks.forEach((fn) => fn());
      }
    };

    try {
      executor(resolve, reject);
    } catch (e) {
      reject(e);
    }
  }
  then(onFulfilled, onRejected) {
    onFulfilled =
      typeof onFulfilled === 'function' ? onFulfilled : (val) => val;
    onRejected =
      typeof onRejected === 'function'
        ? onRejected
        : (e) => {
            throw e;
          };

    let promise2 = new Promise((resolve, reject) => {
      if (this.status === status.FULFILLED) {
        setTimeout(() => {
          try {
            let x = onFulfilled(this.value);
            resolvePromise(promise2, x, resolve, reject);
          } catch (e) {
            reject(e);
          }
        }, 0);
      }
      if (this.status === status.REJECTED) {
        setTimeout(() => {
          try {
            let x = onRejected(this.reason);
            resolvePromise(promise2, x, resolve, reject);
          } catch (e) {
            reject(e);
          }
        }, 0);
      }
      if (this.status === status.PENDING) {
        this.fulfilledCallbacks.push(() => {
          setTimeout(() => {
            try {
              let x = onFulfilled(this.value);
              resolvePromise(promise2, x, resolve, reject);
            } catch (e) {
              reject(e);
            }
          }, 0);
        });

        this.rejectedCallbacks.push(() => {
          setTimeout(() => {
            try {
              let x = onRejected(this.reason);
              resolvePromise(promise2, x, resolve, reject);
            } catch (e) {
              reject(e);
            }
          }, 0);
        });
      }
    });
    return promise2;
  }

  catch(errorFn) {
    this.then(null, errorFn);
  }

  static resolve() {
    return new Promise((resolve, _) => {
      resolve();
    });
  }

  static reject() {
    return new Promise((_, reject) => {
      reject();
    });
  }

  static all(promises) {
    return new Promise((resolve, reject) => {
      let arr = [];
      let times = 0;
      let handlePromise = (key, value) => {
        arr[key] = value;
        if (++times === promises.length) {
          resolve(arr);
        }
      };
      for (let i = 0; i < promises.length; i++) {
        const promise = promises[i];
        if (
          ((typeof promise === 'object' && promise !== null) ||
            typeof promise === 'function') &&
          typeof promise.then === 'function'
        ) {
          this.then((data) => {
            handlePromise(i, data);
          }, reject);
        } else {
          handlePromise(i, promise);
        }
      }
    });
  }

  static race(promises) {
    return new Promise((resolve, reject) => {
      for (let i = 0; i < promises.length; i++) {
        const promise = promises[i];
        Promise.resolve(promise).then(
          (data) => {
            resolve(data);
          },
          (reason) => reject(reason)
        );
      }
    });
  }

  static finally(callback) {
    return this.then(
      (value) => {
        Promise.resolve(callback()).then(() => value);
      },
      (reason) => {
        Promise.resolve(callback()).then(() => {
          throw reason;
        });
      }
    );
  }

  static deferred() {
    let dfd = {};
    dfd.promise = new Promise((resolve, reject) => {
      dfd.resolve = resolve;
      dfd.reject = reject;
    });
    return dfd;
  }
}

module.exports = Promise;
