'use strict';

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
// 兼容别人的promise
function resolvePromise(promise2, x, resolve, reject) {
    if (promise2 == x) {
        return reject(new TypeError('类型错误'));
    }
    if ((typeof x === 'object' && x !== null) || typeof x === 'function') {
        // 通过called确保只能调用一次, 状态一旦发生改变, 不能修改, 直接返回
        var called_1 = false;
        try {
            // 这里的promise可能是别人实现的promise
            var then = x.then;
            if (typeof then === 'function') {
                then.call(x, function (y) {
                    if (called_1) {
                        return;
                    }
                    called_1 = true;
                    // resolve(y);
                    // y也有可能是个promise, y需要递归处理
                    resolvePromise(promise2, y, resolve, reject);
                }, function (r) {
                    if (called_1) {
                        return;
                    }
                    called_1 = true;
                    // 只要失败就直接抛出, 不需要进行额外处理
                    reject(r);
                });
            }
            else {
                // 普通对象处理
                resolve(x);
            }
        }
        catch (error) {
            if (called_1) {
                return;
            }
            called_1 = true;
            reject(error);
        }
    }
    else {
        resolve(x);
    }
}
var Promise$1 = /** @class */ (function () {
    function Promise(executor) {
        var _this = this;
        this.value = undefined;
        this.reason = undefined;
        this.onResolvedCallbacks = [];
        this.onRejectedCallbacks = [];
        this.status = "PENDING" /* pending */;
        var resolve = function (value) {
            if (_this.status === "PENDING" /* pending */) {
                // 需要考虑传入的value是promise的情况
                if (value instanceof Promise) {
                    return value.then(resolve, reject);
                }
                _this.status = "FULFILLED" /* fulfilled */;
                _this.value = value;
                _this.onResolvedCallbacks.forEach(function (fn) { return fn(); });
            }
        };
        var reject = function (reason) {
            if (_this.status === "PENDING" /* pending */) {
                _this.status = "REJECTED" /* rejected */;
                _this.reason = reason;
                _this.onRejectedCallbacks.forEach(function (fn) { return fn(); });
            }
        };
        try {
            executor(resolve, reject);
        }
        catch (error) {
            reject(error);
        }
    }
    Promise.prototype.then = function (onFulfilled, onRejected) {
        var _this = this;
        // 如果onFulfilled不是函数, 将值传递给下个
        onFulfilled =
            typeof onFulfilled === 'function' ? onFulfilled : function (val) { return val; };
        // 如果onRejected不是函数, 将错误传递给下个
        onRejected =
            typeof onRejected === 'function'
                ? onRejected
                : function (err) {
                    throw err;
                };
        var promise2 = new Promise(function (resolve, reject) {
            if (_this.status === "FULFILLED" /* fulfilled */) {
                setTimeout(function () {
                    try {
                        var x = onFulfilled(_this.value);
                        resolvePromise(promise2, x, resolve, reject);
                        // resolve(x);
                    }
                    catch (error) {
                        reject(error);
                    }
                }, 0);
            }
            if (_this.status === "REJECTED" /* rejected */) {
                setTimeout(function () {
                    try {
                        // NOTE: 失败的时候也是返回给下个promise的then
                        var x = onRejected(_this.reason);
                        resolvePromise(promise2, x, resolve, reject);
                        // resolve(x);
                    }
                    catch (error) {
                        reject(error);
                    }
                }, 0);
            }
            if (_this.status === "PENDING" /* pending */) {
                _this.onResolvedCallbacks.push(function () {
                    setTimeout(function () {
                        try {
                            var x = onFulfilled(_this.value);
                            resolvePromise(promise2, x, resolve, reject);
                            // resolve(x);
                        }
                        catch (error) {
                            reject(error);
                        }
                    }, 0);
                });
                _this.onRejectedCallbacks.push(function () {
                    setTimeout(function () {
                        try {
                            var x = onRejected(_this.reason);
                            resolvePromise(promise2, x, resolve, reject);
                            // resolve(x);
                        }
                        catch (error) {
                            reject(error);
                        }
                    }, 0);
                });
            }
        });
        return promise2;
    };
    Promise.prototype.catch = function (onRejected) {
        return this.then(null, onRejected);
    };
    // finally的结果不会影响后续结果
    // 无论成功和失败都要执行的逻辑(callback)
    // finally传给后续的then的值是上一次值接受的值
    // 成功直接传递给下一个resolve
    // 失败也是直接传递给下一个reject
    Promise.prototype.finally = function (callback) {
        return this.then(function (value) { return Promise.resolve(callback()).then(function () { return value; }); }, function (err) {
            return Promise.resolve(callback()).then(function () {
                throw err;
            });
        });
    };
    Promise.resolve = function (value) {
        return new Promise(function (resolve, _) {
            resolve(value);
        });
    };
    Promise.reject = function (reason) {
        return new Promise(function (_, reject) {
            reject(reason);
        });
    };
    Promise.all = function (values) {
        return new Promise(function (resolve, reject) {
            var timers = 0;
            var arr = [];
            function changeArr(value, key) {
                arr[key] = value;
                if (++timers === values.length) {
                    resolve(arr);
                }
            }
            var _loop_1 = function (i) {
                var value = values[i];
                if (isPromise(value)) {
                    value.then(function (data) {
                        changeArr(data, i);
                    }, reject);
                }
                else {
                    changeArr(value, i);
                }
            };
            for (var i = 0; i < values.length; i++) {
                _loop_1(i);
            }
        });
    };
    Promise.race = function (promises) {
        return new Promise(function (resolve, reject) {
            for (var i = 0; i < promises.length; i++) {
                var promise = promises[i];
                Promise.resolve(promise).then(function (value) { return resolve(value); }, function (reason) { return reject(reason); });
            }
        });
    };
    return Promise;
}());
function isPromise(val) {
    if (val &&
        ((typeof val === 'object' && val !== null) || typeof val === 'function') &&
        typeof val.then === 'function') {
        return true;
    }
    return false;
}
Promise$1.deferred = function () {
    var dfd = {};
    dfd.promise = new Promise$1(function (resolve, reject) {
        dfd.resolve = resolve;
        dfd.reject = reject;
    });
    return dfd;
};

module.exports = Promise$1;
