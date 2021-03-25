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
function resolvePromise(promise2, x, resolve, reject) {
    console.log(promise2, x, resolve, reject);
    if (promise2 == x) {
        return reject(new TypeError("类型错误"));
    }
    if ((typeof x === "object" && x !== null) || typeof x === "function") {
        // 通过called确保只能调用一次
        var called_1 = false;
        try {
            var then = x.then;
            if (typeof then === "function") {
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
        var promise2 = new Promise(function (reslove, reject) {
            if (_this.status === "FULFILLED" /* fulfilled */) {
                setTimeout(function () {
                    try {
                        var x = onFulfilled(_this.value);
                        resolvePromise(promise2, x, reslove, reject);
                        // reslove(x);
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
                        resolvePromise(promise2, x, reslove, reject);
                        // reslove(x);
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
                            resolvePromise(promise2, x, reslove, reject);
                            // reslove(x);
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
                            resolvePromise(promise2, x, reslove, reject);
                            // reslove(x);
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
    return Promise;
}());

module.exports = Promise$1;
