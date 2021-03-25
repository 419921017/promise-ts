// 函数柯里化, 让函数的功能更加具体(保留参数), 暂存变量
// 返柯里化, 让函数的范围变大

type UtilsType = 'isString' | 'isNumber' | 'isBoolean';
type ReturnFn = (val: unknown) => boolean;
let utils: Record<UtilsType, ReturnFn> = {} as any;
function isType(type: string) {
  return function (val: unknown) {
    return Object.prototype.toString.call(val) == `[object ${type}]`;
  };
}

['String', 'Number', 'Boolean'].forEach((type) => {
  utils['is' + type] = isType(type);
});

console.log(utils.isNumber(123));
console.log(utils.isString('abcs'));

const currying = (fn: Function) => {
  const exec = (sumArgs: any[]) => {
    return sumArgs.length >= fn.length
      ? fn(...sumArgs)
      : (...args: any[]) => exec([...sumArgs, ...args]);
  };
  return exec([]); // 空数组默认是空的, 用于收集每次传的参数
};

function sum(a, b, c, d) {
  return a + b + c + d;
}

console.log('currying', currying(sum)(1)(2, 3)(4));

export {};
