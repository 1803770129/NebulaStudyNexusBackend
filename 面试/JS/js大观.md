# JavaScript 面试完全指南

## 目录

1. [数据类型与类型  转换](#一数据类型与类型转换)
2. [变量与作用域](#二变量与作用域)
3. [闭包](#三闭包)
4. [this 指向](#四this-指向)
5. [原型与继承](#五原型与继承)
6. [异步编程](#六异步编程)
7. [Event Loop 事件循环](#七event-loop-事件循环)
8. [ES6+ 新特性](#八es6-新特性)
9. [函数式编程](#九函数式编程)
10. [手写代码题](#十手写代码题)
11. [性能优化](#十一性能优化)
12. [设计模式](#十二设计模式)

---
  
## 一、数据类型与类型转换

### 1.1 数据类型

**基本类型（7种）**：
- `undefined`
- `null`
- `boolean`
- `number`
- `string`
- `symbol` (ES6)
- `bigint` (ES2020)

**引用类型**：
- `Object`（包括 Array、Function、Date、RegExp、Map、Set 等）

### 1.2 类型判断

```javascript
// 1. typeof - 适合判断基本类型
typeof undefined    // 'undefined'
typeof null         // 'object' (历史遗留 bug)
typeof true         // 'boolean'
typeof 123          // 'number'
typeof 'str'        // 'string'
typeof Symbol()     // 'symbol'
typeof 123n         // 'bigint'
typeof {}           // 'object'
typeof []           // 'object'
typeof function(){} // 'function'

// 2. instanceof - 判断引用类型
[] instanceof Array     // true
{} instanceof Object    // true
(() => {}) instanceof Function // true

// 3. Object.prototype.toString.call() - 最准确
Object.prototype.toString.call(null)      // '[object Null]'
Object.prototype.toString.call([])        // '[object Array]'
Object.prototype.toString.call({})        // '[object Object]'
Object.prototype.toString.call(new Date)  // '[object Date]'

// 4. 封装通用类型判断函数
function getType(value) {
  if (value === null) return 'null'
  if (typeof value !== 'object') return typeof value
  return Object.prototype.toString.call(value).slice(8, -1).toLowerCase()
}
```

### 1.3 类型转换

**隐式转换规则**：

```javascript
// 1. 转 Boolean（假值）
Boolean(undefined)  // false
Boolean(null)       // false
Boolean(0)          // false
Boolean(NaN)        // false
Boolean('')         // false
Boolean(false)      // false
// 其他都是 true，包括 [], {}, '0'

// 2. 转 Number
Number(null)        // 0
Number(undefined)   // NaN
Number(true)        // 1
Number(false)       // 0
Number('')          // 0
Number('123')       // 123
Number('123abc')    // NaN
Number([])          // 0
Number([1])         // 1
Number([1,2])       // NaN
Number({})          // NaN

// 3. 转 String
String(null)        // 'null'
String(undefined)   // 'undefined'
String(true)        // 'true'
String([1,2,3])     // '1,2,3'
String({})          // '[object Object]'
```

**经典面试题**：

```javascript
// == 的隐式转换
[] == ![]           // true
// 解析：![] = false, [] == false, [] 转数字为 0, false 转数字为 0

[] == false         // true
{} == false         // false (语法解析为代码块)
({}) == false       // false

null == undefined   // true
null === undefined  // false

NaN == NaN          // false
NaN === NaN         // false

// + 运算符
1 + '2'             // '12'
1 + 2 + '3'         // '33'
'1' + 2 + 3         // '123'

// - * / 运算符（都转数字）
'5' - 3             // 2
'5' * '2'           // 10
```

### 1.4 面试题

**Q: 如何判断一个变量是数组？**

```javascript
// 方法1：Array.isArray()（推荐）
Array.isArray([])  // true

// 方法2：instanceof
[] instanceof Array  // true

// 方法3：Object.prototype.toString
Object.prototype.toString.call([]) === '[object Array]'

// 方法4：constructor
[].constructor === Array  // true
```

**Q: null 和 undefined 的区别？**

```javascript
// null：表示"空值"，是一个被赋予的值
let a = null  // 主动赋值为空

// undefined：表示"未定义"
let b         // 声明但未赋值
function fn(x) { console.log(x) }
fn()          // undefined，参数未传

// 类型
typeof null       // 'object'
typeof undefined  // 'undefined'

// 转数字
Number(null)      // 0
Number(undefined) // NaN
```

---

## 二、变量与作用域

### 2.1 var、let、const 区别

| 特性 | var | let | const |
|------|-----|-----|-------|
| 作用域 | 函数作用域 | 块级作用域 | 块级作用域 |
| 变量提升 | 是 | 否（TDZ） | 否（TDZ） |
| 重复声明 | 允许 | 不允许 | 不允许 |
| 重新赋值 | 允许 | 允许 | 不允许 |
| 全局属性 | 是 | 否 | 否 |

```javascript
// 变量提升
console.log(a)  // undefined
var a = 1

console.log(b)  // ReferenceError: Cannot access 'b' before initialization
let b = 2

// 暂时性死区 (TDZ)
var x = 1
{
  console.log(x)  // ReferenceError
  let x = 2
}

// const 的"不变"
const obj = { a: 1 }
obj.a = 2       // 可以修改属性
obj = {}        // TypeError: Assignment to constant variable
```

### 2.2 作用域与作用域链

```javascript
// 作用域链查找
var a = 1
function outer() {
  var b = 2
  function inner() {
    var c = 3
    console.log(a, b, c)  // 1, 2, 3
  }
  inner()
}
outer()

// 经典面试题：循环中的 var
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 100)
}
// 输出：3, 3, 3

// 解决方案1：let
for (let i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 100)
}
// 输出：0, 1, 2

// 解决方案2：闭包
for (var i = 0; i < 3; i++) {
  (function(j) {
    setTimeout(() => console.log(j), 100)
  })(i)
}
// 输出：0, 1, 2

// 解决方案3：setTimeout 第三个参数
for (var i = 0; i < 3; i++) {
  setTimeout((j) => console.log(j), 100, i)
}
```

---

## 三、闭包

### 3.1 什么是闭包

闭包是指有权访问另一个函数作用域中变量的函数。

```javascript
function outer() {
  let count = 0
  return function inner() {
    count++
    return count
  }
}

const counter = outer()
counter()  // 1
counter()  // 2
counter()  // 3
```

### 3.2 闭包的应用

```javascript
// 1. 数据私有化
function createPerson(name) {
  let _age = 0  // 私有变量
  return {
    getName: () => name,
    getAge: () => _age,
    setAge: (age) => { _age = age }
  }
}

// 2. 函数柯里化
function curry(fn) {
  return function curried(...args) {
    if (args.length >= fn.length) {
      return fn.apply(this, args)
    }
    return function(...moreArgs) {
      return curried.apply(this, args.concat(moreArgs))
    }
  }
}

const add = (a, b, c) => a + b + c
const curriedAdd = curry(add)
curriedAdd(1)(2)(3)  // 6
curriedAdd(1, 2)(3)  // 6

// 3. 防抖
function debounce(fn, delay) {
  let timer = null
  return function(...args) {
    clearTimeout(timer)
    timer = setTimeout(() => {
      fn.apply(this, args)
    }, delay)
  }
}

// 4. 节流
function throttle(fn, delay) {
  let lastTime = 0
  return function(...args) {
    const now = Date.now()
    if (now - lastTime >= delay) {
      fn.apply(this, args)
      lastTime = now
    }
  }
}

// 5. 模块模式
const module = (function() {
  let privateVar = 0
  
  function privateMethod() {
    return privateVar
  }
  
  return {
    publicMethod: function() {
      privateVar++
      return privateMethod()
    }
  }
})()
```

### 3.3 闭包的问题

```javascript
// 内存泄漏
function createClosure() {
  const largeData = new Array(1000000).fill('x')
  return function() {
    console.log(largeData.length)
  }
}

const closure = createClosure()
// largeData 无法被回收

// 解决：手动释放
closure = null
```

---

## 四、this 指向

### 4.1 this 绑定规则

```javascript
// 1. 默认绑定（独立函数调用）
function fn() {
  console.log(this)
}
fn()  // window（严格模式下是 undefined）

// 2. 隐式绑定（对象方法调用）
const obj = {
  name: 'obj',
  fn() {
    console.log(this.name)
  }
}
obj.fn()  // 'obj'

// 隐式丢失
const fn2 = obj.fn
fn2()  // undefined（this 指向 window）

// 3. 显式绑定（call/apply/bind）
function greet(greeting) {
  console.log(`${greeting}, ${this.name}`)
}
const person = { name: 'Tom' }

greet.call(person, 'Hello')    // 'Hello, Tom'
greet.apply(person, ['Hi'])    // 'Hi, Tom'
const boundGreet = greet.bind(person)
boundGreet('Hey')              // 'Hey, Tom'

// 4. new 绑定
function Person(name) {
  this.name = name
}
const p = new Person('Tom')
console.log(p.name)  // 'Tom'
```

### 4.2 箭头函数的 this

```javascript
// 箭头函数没有自己的 this，继承外层作用域
const obj = {
  name: 'obj',
  fn: function() {
    setTimeout(() => {
      console.log(this.name)  // 'obj'
    }, 100)
  },
  fn2: () => {
    console.log(this.name)  // undefined（继承全局）
  }
}

// 箭头函数不能用 call/apply/bind 改变 this
const arrowFn = () => console.log(this)
arrowFn.call({ name: 'test' })  // 仍然是 window
```

### 4.3 this 优先级

```
new 绑定 > 显式绑定 > 隐式绑定 > 默认绑定
```

### 4.4 面试题

```javascript
// 题目1
var name = 'window'
const obj = {
  name: 'obj',
  fn1: function() {
    console.log(this.name)
  },
  fn2: () => {
    console.log(this.name)
  },
  fn3: function() {
    return function() {
      console.log(this.name)
    }
  },
  fn4: function() {
    return () => {
      console.log(this.name)
    }
  }
}

obj.fn1()        // 'obj'
obj.fn2()        // 'window'
obj.fn3()()      // 'window'
obj.fn4()()      // 'obj'

// 题目2
function Foo() {
  getName = function() { console.log(1) }
  return this
}
Foo.getName = function() { console.log(2) }
Foo.prototype.getName = function() { console.log(3) }
var getName = function() { console.log(4) }
function getName() { console.log(5) }

Foo.getName()           // 2
getName()               // 4
Foo().getName()         // 1
getName()               // 1
new Foo.getName()       // 2
new Foo().getName()     // 3
new new Foo().getName() // 3
```


---

## 五、原型与继承

### 5.1 原型链

```javascript
// 每个函数都有 prototype 属性
// 每个对象都有 __proto__ 属性

function Person(name) {
  this.name = name
}
Person.prototype.sayHi = function() {
  console.log(`Hi, I'm ${this.name}`)
}

const p = new Person('Tom')

// 原型链关系
p.__proto__ === Person.prototype                    // true
Person.prototype.__proto__ === Object.prototype     // true
Object.prototype.__proto__ === null                 // true

// 函数的原型链
Person.__proto__ === Function.prototype             // true
Function.prototype.__proto__ === Object.prototype   // true

// 特殊情况
Function.__proto__ === Function.prototype           // true
Object.__proto__ === Function.prototype             // true
```

### 5.2 原型链图解

```
实例 p
  │
  └── __proto__ ──→ Person.prototype
                        │
                        ├── constructor ──→ Person
                        │
                        └── __proto__ ──→ Object.prototype
                                              │
                                              └── __proto__ ──→ null
```

### 5.3 继承方式

```javascript
// 1. 原型链继承
function Parent() {
  this.colors = ['red', 'blue']
}
Parent.prototype.getColors = function() {
  return this.colors
}

function Child() {}
Child.prototype = new Parent()

// 缺点：引用类型属性被所有实例共享
const c1 = new Child()
const c2 = new Child()
c1.colors.push('green')
console.log(c2.colors)  // ['red', 'blue', 'green']

// 2. 构造函数继承
function Parent(name) {
  this.name = name
  this.colors = ['red', 'blue']
}

function Child(name) {
  Parent.call(this, name)  // 继承属性
}

// 缺点：无法继承原型方法

// 3. 组合继承（最常用）
function Parent(name) {
  this.name = name
  this.colors = ['red', 'blue']
}
Parent.prototype.sayName = function() {
  console.log(this.name)
}

function Child(name, age) {
  Parent.call(this, name)  // 第二次调用 Parent
  this.age = age
}
Child.prototype = new Parent()  // 第一次调用 Parent
Child.prototype.constructor = Child

// 缺点：Parent 构造函数被调用两次

// 4. 寄生组合继承（最佳方案）
function Parent(name) {
  this.name = name
  this.colors = ['red', 'blue']
}
Parent.prototype.sayName = function() {
  console.log(this.name)
}

function Child(name, age) {
  Parent.call(this, name)
  this.age = age
}

// 核心：创建一个空对象，原型指向 Parent.prototype
Child.prototype = Object.create(Parent.prototype)
Child.prototype.constructor = Child

// 5. ES6 class 继承
class Parent {
  constructor(name) {
    this.name = name
  }
  sayName() {
    console.log(this.name)
  }
}

class Child extends Parent {
  constructor(name, age) {
    super(name)  // 必须先调用 super
    this.age = age
  }
}
```

### 5.4 instanceof 原理

```javascript
// 手写 instanceof
function myInstanceof(obj, constructor) {
  if (obj === null || typeof obj !== 'object') {
    return false
  }
  
  let proto = Object.getPrototypeOf(obj)
  
  while (proto !== null) {
    if (proto === constructor.prototype) {
      return true
    }
    proto = Object.getPrototypeOf(proto)
  }
  
  return false
}
```

### 5.5 new 操作符原理

```javascript
// new 做了什么
// 1. 创建一个新对象
// 2. 将新对象的 __proto__ 指向构造函数的 prototype
// 3. 执行构造函数，this 指向新对象
// 4. 如果构造函数返回对象，则返回该对象；否则返回新对象

function myNew(Constructor, ...args) {
  // 1. 创建新对象，原型指向构造函数的 prototype
  const obj = Object.create(Constructor.prototype)
  
  // 2. 执行构造函数
  const result = Constructor.apply(obj, args)
  
  // 3. 判断返回值
  return result instanceof Object ? result : obj
}

// 测试
function Person(name) {
  this.name = name
}
const p = myNew(Person, 'Tom')
console.log(p.name)  // 'Tom'
```

---

## 六、异步编程

### 6.1 回调函数

```javascript
// 回调地狱
getData(function(a) {
  getMoreData(a, function(b) {
    getMoreData(b, function(c) {
      getMoreData(c, function(d) {
        // ...
      })
    })
  })
})
```

### 6.2 Promise

```javascript
// Promise 基本用法
const promise = new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve('success')
    // reject('error')
  }, 1000)
})

promise
  .then(res => console.log(res))
  .catch(err => console.log(err))
  .finally(() => console.log('done'))

// Promise 链式调用
fetch('/api/user')
  .then(res => res.json())
  .then(user => fetch(`/api/posts/${user.id}`))
  .then(res => res.json())
  .then(posts => console.log(posts))
  .catch(err => console.error(err))

// Promise 静态方法
// Promise.all - 全部成功才成功
Promise.all([p1, p2, p3])
  .then(([r1, r2, r3]) => {})
  .catch(err => {})  // 任一失败就失败

// Promise.race - 取最快的结果
Promise.race([p1, p2, p3])
  .then(result => {})  // 最快完成的结果

// Promise.allSettled - 等待全部完成（不管成功失败）
Promise.allSettled([p1, p2, p3])
  .then(results => {
    // [{ status: 'fulfilled', value: x }, { status: 'rejected', reason: y }]
  })

// Promise.any - 任一成功就成功
Promise.any([p1, p2, p3])
  .then(result => {})  // 第一个成功的结果
  .catch(err => {})    // 全部失败才失败
```

### 6.3 手写 Promise

```javascript
class MyPromise {
  constructor(executor) {
    this.state = 'pending'
    this.value = undefined
    this.reason = undefined
    this.onFulfilledCallbacks = []
    this.onRejectedCallbacks = []
    
    const resolve = (value) => {
      if (this.state === 'pending') {
        this.state = 'fulfilled'
        this.value = value
        this.onFulfilledCallbacks.forEach(fn => fn())
      }
    }
    
    const reject = (reason) => {
      if (this.state === 'pending') {
        this.state = 'rejected'
        this.reason = reason
        this.onRejectedCallbacks.forEach(fn => fn())
      }
    }
    
    try {
      executor(resolve, reject)
    } catch (err) {
      reject(err)
    }
  }
  
  then(onFulfilled, onRejected) {
    onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : v => v
    onRejected = typeof onRejected === 'function' ? onRejected : e => { throw e }
    
    const promise2 = new MyPromise((resolve, reject) => {
      if (this.state === 'fulfilled') {
        queueMicrotask(() => {
          try {
            const x = onFulfilled(this.value)
            resolvePromise(promise2, x, resolve, reject)
          } catch (err) {
            reject(err)
          }
        })
      }
      
      if (this.state === 'rejected') {
        queueMicrotask(() => {
          try {
            const x = onRejected(this.reason)
            resolvePromise(promise2, x, resolve, reject)
          } catch (err) {
            reject(err)
          }
        })
      }
      
      if (this.state === 'pending') {
        this.onFulfilledCallbacks.push(() => {
          queueMicrotask(() => {
            try {
              const x = onFulfilled(this.value)
              resolvePromise(promise2, x, resolve, reject)
            } catch (err) {
              reject(err)
            }
          })
        })
        
        this.onRejectedCallbacks.push(() => {
          queueMicrotask(() => {
            try {
              const x = onRejected(this.reason)
              resolvePromise(promise2, x, resolve, reject)
            } catch (err) {
              reject(err)
            }
          })
        })
      }
    })
    
    return promise2
  }
  
  catch(onRejected) {
    return this.then(null, onRejected)
  }
  
  finally(callback) {
    return this.then(
      value => MyPromise.resolve(callback()).then(() => value),
      reason => MyPromise.resolve(callback()).then(() => { throw reason })
    )
  }
  
  static resolve(value) {
    if (value instanceof MyPromise) return value
    return new MyPromise(resolve => resolve(value))
  }
  
  static reject(reason) {
    return new MyPromise((_, reject) => reject(reason))
  }
  
  static all(promises) {
    return new MyPromise((resolve, reject) => {
      const results = []
      let count = 0
      
      promises.forEach((p, i) => {
        MyPromise.resolve(p).then(
          value => {
            results[i] = value
            count++
            if (count === promises.length) {
              resolve(results)
            }
          },
          reject
        )
      })
    })
  }
  
  static race(promises) {
    return new MyPromise((resolve, reject) => {
      promises.forEach(p => {
        MyPromise.resolve(p).then(resolve, reject)
      })
    })
  }
}

function resolvePromise(promise2, x, resolve, reject) {
  if (promise2 === x) {
    return reject(new TypeError('Chaining cycle detected'))
  }
  
  if (x instanceof MyPromise) {
    x.then(resolve, reject)
  } else if (x !== null && (typeof x === 'object' || typeof x === 'function')) {
    let called = false
    try {
      const then = x.then
      if (typeof then === 'function') {
        then.call(
          x,
          y => {
            if (called) return
            called = true
            resolvePromise(promise2, y, resolve, reject)
          },
          r => {
            if (called) return
            called = true
            reject(r)
          }
        )
      } else {
        resolve(x)
      }
    } catch (err) {
      if (called) return
      called = true
      reject(err)
    }
  } else {
    resolve(x)
  }
}
```

### 6.4 async/await

```javascript
// async/await 是 Generator + Promise 的语法糖
async function fetchData() {
  try {
    const user = await fetch('/api/user').then(r => r.json())
    const posts = await fetch(`/api/posts/${user.id}`).then(r => r.json())
    return posts
  } catch (err) {
    console.error(err)
  }
}

// 并行执行
async function parallel() {
  const [user, posts] = await Promise.all([
    fetch('/api/user'),
    fetch('/api/posts')
  ])
}

// 错误处理
async function withErrorHandling() {
  const result = await fetch('/api/data').catch(err => null)
  if (!result) return
}

// async 函数返回 Promise
async function fn() {
  return 1
}
fn().then(console.log)  // 1
```

### 6.5 面试题

```javascript
// 题目1：Promise 执行顺序
console.log(1)

setTimeout(() => {
  console.log(2)
}, 0)

Promise.resolve().then(() => {
  console.log(3)
}).then(() => {
  console.log(4)
})

console.log(5)

// 输出：1, 5, 3, 4, 2

// 题目2：async/await 执行顺序
async function async1() {
  console.log('async1 start')
  await async2()
  console.log('async1 end')
}

async function async2() {
  console.log('async2')
}

console.log('script start')

setTimeout(() => {
  console.log('setTimeout')
}, 0)

async1()

new Promise((resolve) => {
  console.log('promise1')
  resolve()
}).then(() => {
  console.log('promise2')
})

console.log('script end')

// 输出：
// script start
// async1 start
// async2
// promise1
// script end
// async1 end
// promise2
// setTimeout
```


---

## 七、Event Loop 事件循环

### 7.1 浏览器 Event Loop

```
┌───────────────────────────┐
│         Call Stack        │
└───────────────────────────┘
              ↓
┌───────────────────────────┐
│      Microtask Queue      │  ← Promise.then, MutationObserver, queueMicrotask
└───────────────────────────┘
              ↓
┌───────────────────────────┐
│      Macrotask Queue      │  ← setTimeout, setInterval, I/O, UI rendering
└───────────────────────────┘
```

**执行顺序**：
1. 执行同步代码（Call Stack）
2. 清空微任务队列（Microtask Queue）
3. 执行一个宏任务（Macrotask Queue）
4. 重复 2-3

### 7.2 宏任务与微任务

**宏任务（Macrotask）**：
- setTimeout / setInterval
- setImmediate（Node.js）
- I/O 操作
- UI 渲染
- requestAnimationFrame

**微任务（Microtask）**：
- Promise.then / catch / finally
- MutationObserver
- queueMicrotask
- process.nextTick（Node.js）

### 7.3 经典面试题

```javascript
// 题目1
console.log('start')

setTimeout(() => {
  console.log('timeout1')
  Promise.resolve().then(() => {
    console.log('promise1')
  })
}, 0)

setTimeout(() => {
  console.log('timeout2')
  Promise.resolve().then(() => {
    console.log('promise2')
  })
}, 0)

Promise.resolve().then(() => {
  console.log('promise3')
})

console.log('end')

// 输出：start, end, promise3, timeout1, promise1, timeout2, promise2

// 题目2
async function async1() {
  console.log('async1 start')
  await async2()
  console.log('async1 end')
}

async function async2() {
  console.log('async2')
}

console.log('script start')

setTimeout(() => {
  console.log('setTimeout')
}, 0)

async1()

new Promise((resolve) => {
  console.log('promise1')
  resolve()
}).then(() => {
  console.log('promise2')
})

console.log('script end')

// 输出：
// script start
// async1 start
// async2
// promise1
// script end
// async1 end
// promise2
// setTimeout

// 题目3：复杂嵌套
Promise.resolve().then(() => {
  console.log(1)
  return Promise.resolve(2)
}).then(res => {
  console.log(res)
})

Promise.resolve().then(() => {
  console.log(3)
}).then(() => {
  console.log(4)
}).then(() => {
  console.log(5)
})

// 输出：1, 3, 4, 2, 5
// 注意：return Promise.resolve() 会产生额外的微任务
```

### 7.4 Node.js Event Loop

```
   ┌───────────────────────────┐
┌─>│           timers          │  ← setTimeout, setInterval
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │     pending callbacks     │  ← I/O 回调
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │       idle, prepare       │  ← 内部使用
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │           poll            │  ← 获取新的 I/O 事件
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │           check           │  ← setImmediate
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
└──┤      close callbacks      │  ← socket.on('close')
   └───────────────────────────┘
```

```javascript
// Node.js 特有
setImmediate(() => {
  console.log('setImmediate')
})

setTimeout(() => {
  console.log('setTimeout')
}, 0)

// 输出顺序不确定（取决于事件循环启动时间）

// 但在 I/O 回调中，setImmediate 总是先执行
const fs = require('fs')
fs.readFile('file.txt', () => {
  setTimeout(() => console.log('timeout'), 0)
  setImmediate(() => console.log('immediate'))
})
// 输出：immediate, timeout

// process.nextTick 优先级最高
Promise.resolve().then(() => console.log('promise'))
process.nextTick(() => console.log('nextTick'))
// 输出：nextTick, promise
```

---

## 八、ES6+ 新特性

### 8.1 解构赋值

```javascript
// 数组解构
const [a, b, ...rest] = [1, 2, 3, 4, 5]
// a = 1, b = 2, rest = [3, 4, 5]

// 默认值
const [x = 1, y = 2] = [undefined, null]
// x = 1, y = null（null 不触发默认值）

// 对象解构
const { name, age: userAge, gender = 'male' } = { name: 'Tom', age: 18 }
// name = 'Tom', userAge = 18, gender = 'male'

// 嵌套解构
const { data: { list } } = { data: { list: [1, 2, 3] } }

// 函数参数解构
function fn({ name, age = 18 } = {}) {
  console.log(name, age)
}
```

### 8.2 展开运算符

```javascript
// 数组展开
const arr1 = [1, 2, 3]
const arr2 = [...arr1, 4, 5]  // [1, 2, 3, 4, 5]

// 对象展开
const obj1 = { a: 1, b: 2 }
const obj2 = { ...obj1, c: 3 }  // { a: 1, b: 2, c: 3 }

// 浅拷贝
const copy = [...arr]
const copyObj = { ...obj }

// 合并
const merged = [...arr1, ...arr2]
const mergedObj = { ...obj1, ...obj2 }
```

### 8.3 箭头函数

```javascript
// 基本语法
const fn = (a, b) => a + b

// 特点
// 1. 没有自己的 this
// 2. 没有 arguments
// 3. 不能用作构造函数
// 4. 没有 prototype

// 不适用场景
const obj = {
  name: 'obj',
  fn: () => {
    console.log(this.name)  // undefined
  }
}

// 需要 arguments 时
const fn = (...args) => {
  console.log(args)  // 使用 rest 参数代替
}
```

### 8.4 Symbol

```javascript
// 创建唯一标识符
const s1 = Symbol('desc')
const s2 = Symbol('desc')
s1 === s2  // false

// 作为对象属性
const KEY = Symbol('key')
const obj = {
  [KEY]: 'value',
  name: 'obj'
}

// Symbol 属性不会被常规遍历
Object.keys(obj)                    // ['name']
Object.getOwnPropertySymbols(obj)   // [Symbol(key)]
Reflect.ownKeys(obj)                // ['name', Symbol(key)]

// 内置 Symbol
Symbol.iterator    // 迭代器
Symbol.toStringTag // 自定义 toString 标签
Symbol.hasInstance // 自定义 instanceof 行为
```

### 8.5 Map 和 Set

```javascript
// Set - 唯一值集合
const set = new Set([1, 2, 2, 3])
set.add(4)
set.delete(1)
set.has(2)      // true
set.size        // 3
set.clear()

// 数组去重
const unique = [...new Set(arr)]

// Map - 键值对集合
const map = new Map()
map.set('key', 'value')
map.set({}, 'object key')  // 可以用对象作为键
map.get('key')
map.has('key')
map.delete('key')
map.size

// WeakMap / WeakSet
// 键必须是对象，弱引用，不阻止垃圾回收
const wm = new WeakMap()
let obj = {}
wm.set(obj, 'data')
obj = null  // obj 可以被垃圾回收
```

### 8.6 Proxy 和 Reflect

```javascript
// Proxy - 代理对象操作
const target = { name: 'Tom', age: 18 }

const proxy = new Proxy(target, {
  get(target, prop, receiver) {
    console.log(`Getting ${prop}`)
    return Reflect.get(target, prop, receiver)
  },
  set(target, prop, value, receiver) {
    console.log(`Setting ${prop} = ${value}`)
    return Reflect.set(target, prop, value, receiver)
  },
  deleteProperty(target, prop) {
    console.log(`Deleting ${prop}`)
    return Reflect.deleteProperty(target, prop)
  },
  has(target, prop) {
    console.log(`Checking ${prop}`)
    return Reflect.has(target, prop)
  }
})

proxy.name        // Getting name
proxy.age = 20    // Setting age = 20
delete proxy.name // Deleting name
'age' in proxy    // Checking age

// 实现响应式（Vue 3 原理）
function reactive(obj) {
  return new Proxy(obj, {
    get(target, key, receiver) {
      track(target, key)  // 收集依赖
      const result = Reflect.get(target, key, receiver)
      if (typeof result === 'object') {
        return reactive(result)  // 深层代理
      }
      return result
    },
    set(target, key, value, receiver) {
      const result = Reflect.set(target, key, value, receiver)
      trigger(target, key)  // 触发更新
      return result
    }
  })
}
```

### 8.7 迭代器和生成器

```javascript
// 迭代器协议
const iterable = {
  [Symbol.iterator]() {
    let i = 0
    return {
      next() {
        if (i < 3) {
          return { value: i++, done: false }
        }
        return { value: undefined, done: true }
      }
    }
  }
}

for (const v of iterable) {
  console.log(v)  // 0, 1, 2
}

// 生成器
function* generator() {
  yield 1
  yield 2
  yield 3
}

const gen = generator()
gen.next()  // { value: 1, done: false }
gen.next()  // { value: 2, done: false }
gen.next()  // { value: 3, done: false }
gen.next()  // { value: undefined, done: true }

// 生成器实现异步
function* asyncGenerator() {
  const user = yield fetch('/api/user')
  const posts = yield fetch(`/api/posts/${user.id}`)
  return posts
}

// 自动执行器
function co(gen) {
  const g = gen()
  
  function next(data) {
    const result = g.next(data)
    if (result.done) return result.value
    result.value.then(data => next(data))
  }
  
  next()
}
```

### 8.8 模块化

```javascript
// ES Module
// 导出
export const name = 'module'
export function fn() {}
export default class MyClass {}

// 导入
import MyClass, { name, fn } from './module.js'
import * as module from './module.js'

// 动态导入
const module = await import('./module.js')

// CommonJS
// 导出
module.exports = { name, fn }
exports.name = 'module'

// 导入
const { name, fn } = require('./module')

// 区别
// ES Module: 静态分析，编译时确定依赖，值的引用
// CommonJS: 动态加载，运行时确定依赖，值的拷贝
```

### 8.9 可选链和空值合并

```javascript
// 可选链 ?.
const user = { profile: { name: 'Tom' } }
user?.profile?.name     // 'Tom'
user?.address?.city     // undefined（不报错）
user?.getName?.()       // 安全调用方法

// 空值合并 ??
const value = null ?? 'default'     // 'default'
const value2 = undefined ?? 'default' // 'default'
const value3 = 0 ?? 'default'       // 0（只有 null/undefined 才用默认值）
const value4 = '' ?? 'default'      // ''

// 与 || 的区别
0 || 'default'   // 'default'（0 是假值）
0 ?? 'default'   // 0（0 不是 null/undefined）
```


---

## 九、函数式编程

### 9.1 纯函数

```javascript
// 纯函数：相同输入总是返回相同输出，无副作用
// 纯函数
const add = (a, b) => a + b

// 非纯函数
let count = 0
const increment = () => ++count  // 依赖外部状态

// 非纯函数
const getTime = () => new Date()  // 每次返回不同值
```

### 9.2 高阶函数

```javascript
// 接收函数作为参数或返回函数
// 常见高阶函数
const arr = [1, 2, 3, 4, 5]

// map - 映射
arr.map(x => x * 2)  // [2, 4, 6, 8, 10]

// filter - 过滤
arr.filter(x => x > 2)  // [3, 4, 5]

// reduce - 归约
arr.reduce((acc, cur) => acc + cur, 0)  // 15

// find - 查找
arr.find(x => x > 2)  // 3

// some - 存在
arr.some(x => x > 4)  // true

// every - 全部
arr.every(x => x > 0)  // true

// flatMap - 扁平映射
[[1, 2], [3, 4]].flatMap(x => x)  // [1, 2, 3, 4]
```

### 9.3 函数柯里化

```javascript
// 柯里化：将多参数函数转换为一系列单参数函数
function curry(fn) {
  return function curried(...args) {
    if (args.length >= fn.length) {
      return fn.apply(this, args)
    }
    return function(...moreArgs) {
      return curried.apply(this, args.concat(moreArgs))
    }
  }
}

const add = (a, b, c) => a + b + c
const curriedAdd = curry(add)

curriedAdd(1)(2)(3)    // 6
curriedAdd(1, 2)(3)    // 6
curriedAdd(1)(2, 3)    // 6

// 应用：参数复用
const log = curry((level, message) => console.log(`[${level}] ${message}`))
const info = log('INFO')
const error = log('ERROR')

info('Hello')   // [INFO] Hello
error('Oops')   // [ERROR] Oops
```

### 9.4 函数组合

```javascript
// compose - 从右到左执行
const compose = (...fns) => x => fns.reduceRight((acc, fn) => fn(acc), x)

// pipe - 从左到右执行
const pipe = (...fns) => x => fns.reduce((acc, fn) => fn(acc), x)

const add10 = x => x + 10
const multiply2 = x => x * 2
const subtract5 = x => x - 5

const composed = compose(subtract5, multiply2, add10)
composed(5)  // (5 + 10) * 2 - 5 = 25

const piped = pipe(add10, multiply2, subtract5)
piped(5)  // (5 + 10) * 2 - 5 = 25
```

### 9.5 偏函数

```javascript
// 偏函数：固定部分参数
function partial(fn, ...presetArgs) {
  return function(...laterArgs) {
    return fn(...presetArgs, ...laterArgs)
  }
}

const greet = (greeting, name) => `${greeting}, ${name}!`
const sayHello = partial(greet, 'Hello')

sayHello('Tom')   // 'Hello, Tom!'
sayHello('Jerry') // 'Hello, Jerry!'
```

---

## 十、手写代码题

### 10.1 防抖和节流

```javascript
// 防抖：延迟执行，重复触发重新计时
function debounce(fn, delay, immediate = false) {
  let timer = null
  
  return function(...args) {
    const context = this
    
    if (timer) clearTimeout(timer)
    
    if (immediate && !timer) {
      fn.apply(context, args)
    }
    
    timer = setTimeout(() => {
      if (!immediate) {
        fn.apply(context, args)
      }
      timer = null
    }, delay)
  }
}

// 节流：固定频率执行
function throttle(fn, delay) {
  let lastTime = 0
  let timer = null
  
  return function(...args) {
    const context = this
    const now = Date.now()
    const remaining = delay - (now - lastTime)
    
    if (remaining <= 0) {
      if (timer) {
        clearTimeout(timer)
        timer = null
      }
      fn.apply(context, args)
      lastTime = now
    } else if (!timer) {
      timer = setTimeout(() => {
        fn.apply(context, args)
        lastTime = Date.now()
        timer = null
      }, remaining)
    }
  }
}
```

### 10.2 深拷贝

```javascript
function deepClone(obj, hash = new WeakMap()) {
  // 处理 null 和基本类型
  if (obj === null || typeof obj !== 'object') {
    return obj
  }
  
  // 处理循环引用
  if (hash.has(obj)) {
    return hash.get(obj)
  }
  
  // 处理特殊对象
  if (obj instanceof Date) {
    return new Date(obj)
  }
  if (obj instanceof RegExp) {
    return new RegExp(obj)
  }
  if (obj instanceof Map) {
    const map = new Map()
    hash.set(obj, map)
    obj.forEach((value, key) => {
      map.set(deepClone(key, hash), deepClone(value, hash))
    })
    return map
  }
  if (obj instanceof Set) {
    const set = new Set()
    hash.set(obj, set)
    obj.forEach(value => {
      set.add(deepClone(value, hash))
    })
    return set
  }
  
  // 处理数组和普通对象
  const clone = Array.isArray(obj) ? [] : {}
  hash.set(obj, clone)
  
  // 拷贝 Symbol 属性
  const symbolKeys = Object.getOwnPropertySymbols(obj)
  symbolKeys.forEach(key => {
    clone[key] = deepClone(obj[key], hash)
  })
  
  // 拷贝普通属性
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      clone[key] = deepClone(obj[key], hash)
    }
  }
  
  return clone
}
```

### 10.3 call、apply、bind

```javascript
// call
Function.prototype.myCall = function(context, ...args) {
  context = context ?? window
  context = Object(context)
  
  const fn = Symbol('fn')
  context[fn] = this
  
  const result = context[fn](...args)
  delete context[fn]
  
  return result
}

// apply
Function.prototype.myApply = function(context, args = []) {
  context = context ?? window
  context = Object(context)
  
  const fn = Symbol('fn')
  context[fn] = this
  
  const result = context[fn](...args)
  delete context[fn]
  
  return result
}

// bind
Function.prototype.myBind = function(context, ...args) {
  const self = this
  
  const fBound = function(...innerArgs) {
    // 作为构造函数时，this 指向实例
    return self.apply(
      this instanceof fBound ? this : context,
      args.concat(innerArgs)
    )
  }
  
  // 继承原型
  if (this.prototype) {
    fBound.prototype = Object.create(this.prototype)
  }
  
  return fBound
}
```

### 10.4 数组扁平化

```javascript
// 方法1：递归
function flatten(arr, depth = Infinity) {
  return arr.reduce((acc, cur) => {
    if (Array.isArray(cur) && depth > 0) {
      return acc.concat(flatten(cur, depth - 1))
    }
    return acc.concat(cur)
  }, [])
}

// 方法2：迭代
function flatten(arr) {
  const stack = [...arr]
  const result = []
  
  while (stack.length) {
    const item = stack.pop()
    if (Array.isArray(item)) {
      stack.push(...item)
    } else {
      result.unshift(item)
    }
  }
  
  return result
}

// 方法3：toString（仅适用于数字数组）
function flatten(arr) {
  return arr.toString().split(',').map(Number)
}

// 方法4：flat
arr.flat(Infinity)
```

### 10.5 数组去重

```javascript
// 方法1：Set
const unique = arr => [...new Set(arr)]

// 方法2：filter + indexOf
const unique = arr => arr.filter((item, index) => arr.indexOf(item) === index)

// 方法3：reduce
const unique = arr => arr.reduce((acc, cur) => {
  if (!acc.includes(cur)) acc.push(cur)
  return acc
}, [])

// 方法4：对象键（仅适用于基本类型）
const unique = arr => {
  const obj = {}
  return arr.filter(item => {
    const key = typeof item + item
    return obj.hasOwnProperty(key) ? false : (obj[key] = true)
  })
}
```

### 10.6 EventEmitter 发布订阅

```javascript
class EventEmitter {
  constructor() {
    this.events = {}
  }
  
  on(event, callback) {
    if (!this.events[event]) {
      this.events[event] = []
    }
    this.events[event].push(callback)
    return this
  }
  
  off(event, callback) {
    if (!this.events[event]) return this
    
    if (!callback) {
      delete this.events[event]
    } else {
      this.events[event] = this.events[event].filter(cb => cb !== callback)
    }
    return this
  }
  
  emit(event, ...args) {
    if (!this.events[event]) return this
    
    this.events[event].forEach(callback => {
      callback.apply(this, args)
    })
    return this
  }
  
  once(event, callback) {
    const wrapper = (...args) => {
      callback.apply(this, args)
      this.off(event, wrapper)
    }
    this.on(event, wrapper)
    return this
  }
}

// 使用
const emitter = new EventEmitter()
emitter.on('click', (x) => console.log(x))
emitter.emit('click', 'hello')  // 'hello'
```

### 10.7 实现 Object.create

```javascript
function myObjectCreate(proto, propertiesObject) {
  if (typeof proto !== 'object' && typeof proto !== 'function') {
    throw new TypeError('Object prototype may only be an Object or null')
  }
  
  function F() {}
  F.prototype = proto
  const obj = new F()
  
  if (propertiesObject !== undefined) {
    Object.defineProperties(obj, propertiesObject)
  }
  
  if (proto === null) {
    obj.__proto__ = null
  }
  
  return obj
}
```

### 10.8 实现 JSON.stringify

```javascript
function jsonStringify(value) {
  const type = typeof value
  
  // 处理基本类型
  if (type !== 'object' || value === null) {
    if (type === 'string') {
      return `"${value}"`
    }
    if (type === 'undefined' || type === 'function' || type === 'symbol') {
      return undefined
    }
    if (Number.isNaN(value) || value === Infinity || value === -Infinity) {
      return 'null'
    }
    return String(value)
  }
  
  // 处理数组
  if (Array.isArray(value)) {
    const result = value.map(item => {
      const str = jsonStringify(item)
      return str === undefined ? 'null' : str
    })
    return `[${result.join(',')}]`
  }
  
  // 处理对象
  const result = []
  for (const key in value) {
    if (value.hasOwnProperty(key)) {
      const str = jsonStringify(value[key])
      if (str !== undefined) {
        result.push(`"${key}":${str}`)
      }
    }
  }
  return `{${result.join(',')}}`
}
```

### 10.9 实现 JSON.parse

```javascript
// 方法1：eval（不安全）
function jsonParse(str) {
  return eval('(' + str + ')')
}

// 方法2：new Function（相对安全）
function jsonParse(str) {
  return new Function('return ' + str)()
}

// 方法3：递归下降解析器（完整实现）
function jsonParse(str) {
  let index = 0
  
  function parseValue() {
    skipWhitespace()
    const char = str[index]
    
    if (char === '"') return parseString()
    if (char === '{') return parseObject()
    if (char === '[') return parseArray()
    if (char === 't') return parseTrue()
    if (char === 'f') return parseFalse()
    if (char === 'n') return parseNull()
    return parseNumber()
  }
  
  function skipWhitespace() {
    while (/\s/.test(str[index])) index++
  }
  
  function parseString() {
    index++ // skip opening quote
    let result = ''
    while (str[index] !== '"') {
      if (str[index] === '\\') {
        index++
        const escapes = { n: '\n', r: '\r', t: '\t', '"': '"', '\\': '\\' }
        result += escapes[str[index]] || str[index]
      } else {
        result += str[index]
      }
      index++
    }
    index++ // skip closing quote
    return result
  }
  
  function parseNumber() {
    const start = index
    if (str[index] === '-') index++
    while (/\d/.test(str[index])) index++
    if (str[index] === '.') {
      index++
      while (/\d/.test(str[index])) index++
    }
    return Number(str.slice(start, index))
  }
  
  function parseObject() {
    index++ // skip {
    skipWhitespace()
    const obj = {}
    
    if (str[index] === '}') {
      index++
      return obj
    }
    
    while (true) {
      skipWhitespace()
      const key = parseString()
      skipWhitespace()
      index++ // skip :
      const value = parseValue()
      obj[key] = value
      skipWhitespace()
      if (str[index] === '}') {
        index++
        return obj
      }
      index++ // skip ,
    }
  }
  
  function parseArray() {
    index++ // skip [
    skipWhitespace()
    const arr = []
    
    if (str[index] === ']') {
      index++
      return arr
    }
    
    while (true) {
      arr.push(parseValue())
      skipWhitespace()
      if (str[index] === ']') {
        index++
        return arr
      }
      index++ // skip ,
    }
  }
  
  function parseTrue() {
    index += 4
    return true
  }
  
  function parseFalse() {
    index += 5
    return false
  }
  
  function parseNull() {
    index += 4
    return null
  }
  
  return parseValue()
}
```

### 10.10 实现 LRU 缓存

```javascript
class LRUCache {
  constructor(capacity) {
    this.capacity = capacity
    this.cache = new Map()
  }
  
  get(key) {
    if (!this.cache.has(key)) {
      return -1
    }
    
    // 移到最后（最近使用）
    const value = this.cache.get(key)
    this.cache.delete(key)
    this.cache.set(key, value)
    
    return value
  }
  
  put(key, value) {
    if (this.cache.has(key)) {
      this.cache.delete(key)
    } else if (this.cache.size >= this.capacity) {
      // 删除最久未使用（第一个）
      const firstKey = this.cache.keys().next().value
      this.cache.delete(firstKey)
    }
    
    this.cache.set(key, value)
  }
}
```


---

## 十一、性能优化

### 11.1 内存管理

```javascript
// 内存泄漏常见场景

// 1. 意外的全局变量
function leak() {
  leakedVar = 'I am global'  // 没有 var/let/const
}

// 2. 被遗忘的定时器
const timer = setInterval(() => {
  // 引用了外部变量
}, 1000)
// 忘记 clearInterval(timer)

// 3. 闭包
function createClosure() {
  const largeData = new Array(1000000)
  return function() {
    console.log(largeData.length)
  }
}
const closure = createClosure()
// largeData 无法被回收

// 4. DOM 引用
const elements = {
  button: document.getElementById('button')
}
document.body.removeChild(document.getElementById('button'))
// elements.button 仍然引用着 DOM

// 5. 事件监听器
element.addEventListener('click', handler)
// 元素移除前忘记 removeEventListener
```

### 11.2 代码优化

```javascript
// 1. 避免频繁操作 DOM
// 差
for (let i = 0; i < 1000; i++) {
  document.body.innerHTML += '<div>' + i + '</div>'
}

// 好
const fragment = document.createDocumentFragment()
for (let i = 0; i < 1000; i++) {
  const div = document.createElement('div')
  div.textContent = i
  fragment.appendChild(div)
}
document.body.appendChild(fragment)

// 2. 使用事件委托
// 差
document.querySelectorAll('li').forEach(li => {
  li.addEventListener('click', handler)
})

// 好
document.querySelector('ul').addEventListener('click', e => {
  if (e.target.tagName === 'LI') {
    handler(e)
  }
})

// 3. 避免强制同步布局
// 差
for (let i = 0; i < elements.length; i++) {
  elements[i].style.width = box.offsetWidth + 'px'  // 每次都触发重排
}

// 好
const width = box.offsetWidth
for (let i = 0; i < elements.length; i++) {
  elements[i].style.width = width + 'px'
}

// 4. 使用 requestAnimationFrame
function animate() {
  // 动画逻辑
  requestAnimationFrame(animate)
}
requestAnimationFrame(animate)

// 5. 使用 Web Worker 处理耗时任务
const worker = new Worker('worker.js')
worker.postMessage(data)
worker.onmessage = e => console.log(e.data)
```

### 11.3 网络优化

```javascript
// 1. 请求合并
// 差：多次请求
await fetch('/api/user/1')
await fetch('/api/user/2')
await fetch('/api/user/3')

// 好：批量请求
await fetch('/api/users?ids=1,2,3')

// 2. 请求缓存
const cache = new Map()

async function fetchWithCache(url) {
  if (cache.has(url)) {
    return cache.get(url)
  }
  const response = await fetch(url)
  const data = await response.json()
  cache.set(url, data)
  return data
}

// 3. 请求取消
const controller = new AbortController()

fetch('/api/data', { signal: controller.signal })
  .then(res => res.json())
  .catch(err => {
    if (err.name === 'AbortError') {
      console.log('Request cancelled')
    }
  })

// 取消请求
controller.abort()

// 4. 并发控制
async function limitConcurrency(tasks, limit) {
  const results = []
  const executing = []
  
  for (const task of tasks) {
    const p = Promise.resolve().then(() => task())
    results.push(p)
    
    if (limit <= tasks.length) {
      const e = p.then(() => executing.splice(executing.indexOf(e), 1))
      executing.push(e)
      
      if (executing.length >= limit) {
        await Promise.race(executing)
      }
    }
  }
  
  return Promise.all(results)
}
```

---

## 十二、设计模式

### 12.1 单例模式

```javascript
// 方式1：闭包
const Singleton = (function() {
  let instance
  
  function createInstance() {
    return { name: 'singleton' }
  }
  
  return {
    getInstance() {
      if (!instance) {
        instance = createInstance()
      }
      return instance
    }
  }
})()

// 方式2：ES6 class
class Singleton {
  static instance
  
  constructor() {
    if (Singleton.instance) {
      return Singleton.instance
    }
    Singleton.instance = this
  }
  
  static getInstance() {
    if (!Singleton.instance) {
      Singleton.instance = new Singleton()
    }
    return Singleton.instance
  }
}

// 方式3：Proxy
function singleton(className) {
  let instance
  return new Proxy(className, {
    construct(target, args) {
      if (!instance) {
        instance = new target(...args)
      }
      return instance
    }
  })
}
```

### 12.2 工厂模式

```javascript
// 简单工厂
class UserFactory {
  static createUser(type) {
    switch (type) {
      case 'admin':
        return new Admin()
      case 'user':
        return new User()
      default:
        throw new Error('Unknown user type')
    }
  }
}

// 抽象工厂
class UIFactory {
  createButton() {}
  createInput() {}
}

class DarkUIFactory extends UIFactory {
  createButton() { return new DarkButton() }
  createInput() { return new DarkInput() }
}

class LightUIFactory extends UIFactory {
  createButton() { return new LightButton() }
  createInput() { return new LightInput() }
}
```

### 12.3 观察者模式

```javascript
class Subject {
  constructor() {
    this.observers = []
  }
  
  addObserver(observer) {
    this.observers.push(observer)
  }
  
  removeObserver(observer) {
    this.observers = this.observers.filter(o => o !== observer)
  }
  
  notify(data) {
    this.observers.forEach(observer => observer.update(data))
  }
}

class Observer {
  update(data) {
    console.log('Received:', data)
  }
}

// 使用
const subject = new Subject()
const observer1 = new Observer()
const observer2 = new Observer()

subject.addObserver(observer1)
subject.addObserver(observer2)
subject.notify('Hello')  // 两个观察者都收到通知
```

### 12.4 发布订阅模式

```javascript
// 与观察者模式的区别：有一个事件中心
class EventBus {
  constructor() {
    this.events = {}
  }
  
  subscribe(event, callback) {
    if (!this.events[event]) {
      this.events[event] = []
    }
    this.events[event].push(callback)
    
    // 返回取消订阅函数
    return () => {
      this.events[event] = this.events[event].filter(cb => cb !== callback)
    }
  }
  
  publish(event, data) {
    if (this.events[event]) {
      this.events[event].forEach(callback => callback(data))
    }
  }
}

// 使用
const bus = new EventBus()
const unsubscribe = bus.subscribe('message', data => console.log(data))
bus.publish('message', 'Hello')  // 'Hello'
unsubscribe()
bus.publish('message', 'World')  // 无输出
```

### 12.5 策略模式

```javascript
// 定义策略
const strategies = {
  S: salary => salary * 4,
  A: salary => salary * 3,
  B: salary => salary * 2
}

// 使用策略
function calculateBonus(level, salary) {
  return strategies[level](salary)
}

calculateBonus('S', 10000)  // 40000
calculateBonus('A', 10000)  // 30000

// 表单验证策略
const validators = {
  required: value => value !== '' || '必填',
  minLength: (value, len) => value.length >= len || `最少${len}个字符`,
  email: value => /^[\w-]+@[\w-]+\.\w+$/.test(value) || '邮箱格式错误'
}

function validate(value, rules) {
  for (const rule of rules) {
    const [name, ...args] = rule.split(':')
    const result = validators[name](value, ...args)
    if (result !== true) return result
  }
  return true
}

validate('', ['required'])  // '必填'
validate('ab', ['minLength:3'])  // '最少3个字符'
```

### 12.6 代理模式

```javascript
// 虚拟代理：图片懒加载
class ProxyImage {
  constructor(src) {
    this.src = src
  }
  
  setSrc(src) {
    const img = new Image()
    img.onload = () => {
      this.src = src
    }
    img.src = src
    this.src = 'loading.gif'  // 先显示 loading
  }
}

// 缓存代理
function createProxyFactory(fn) {
  const cache = new Map()
  
  return function(...args) {
    const key = args.join(',')
    if (cache.has(key)) {
      return cache.get(key)
    }
    const result = fn.apply(this, args)
    cache.set(key, result)
    return result
  }
}

const proxyMultiply = createProxyFactory((a, b) => a * b)
proxyMultiply(2, 3)  // 计算
proxyMultiply(2, 3)  // 从缓存获取
```

### 12.7 装饰器模式

```javascript
// ES7 装饰器
function log(target, name, descriptor) {
  const original = descriptor.value
  
  descriptor.value = function(...args) {
    console.log(`Calling ${name} with`, args)
    const result = original.apply(this, args)
    console.log(`Result:`, result)
    return result
  }
  
  return descriptor
}

class Calculator {
  @log
  add(a, b) {
    return a + b
  }
}

// 函数装饰器
function withLogging(fn) {
  return function(...args) {
    console.log('Before')
    const result = fn.apply(this, args)
    console.log('After')
    return result
  }
}

const add = withLogging((a, b) => a + b)
add(1, 2)
```

---

## 十三、常见面试题汇总

### 13.1 输出题

```javascript
// 题目1
var a = 10
;(function() {
  console.log(a)
  a = 5
  console.log(window.a)
  var a = 20
  console.log(a)
})()
// 输出：undefined, 10, 20

// 题目2
var obj = {
  say: function() {
    var f1 = () => {
      console.log('1', this)
    }
    f1()
  },
  pro: {
    getPro: () => {
      console.log(this)
    }
  }
}
var o = obj.say
o()           // 1, window
obj.say()     // 1, obj
obj.pro.getPro()  // window

// 题目3
var name = 'window'
var person1 = {
  name: 'person1',
  show1: function() {
    console.log(this.name)
  },
  show2: () => console.log(this.name),
  show3: function() {
    return function() {
      console.log(this.name)
    }
  },
  show4: function() {
    return () => console.log(this.name)
  }
}
var person2 = { name: 'person2' }

person1.show1()  // person1
person1.show1.call(person2)  // person2

person1.show2()  // window
person1.show2.call(person2)  // window

person1.show3()()  // window
person1.show3().call(person2)  // person2
person1.show3.call(person2)()  // window

person1.show4()()  // person1
person1.show4().call(person2)  // person1
person1.show4.call(person2)()  // person2
```

### 13.2 实现题

```javascript
// 1. 实现 sleep 函数
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))

// 2. 实现 retry 函数
async function retry(fn, times = 3, delay = 1000) {
  for (let i = 0; i < times; i++) {
    try {
      return await fn()
    } catch (err) {
      if (i === times - 1) throw err
      await sleep(delay)
    }
  }
}

// 3. 实现 promisify
function promisify(fn) {
  return function(...args) {
    return new Promise((resolve, reject) => {
      fn(...args, (err, result) => {
        if (err) reject(err)
        else resolve(result)
      })
    })
  }
}

// 4. 实现 compose（从右到左）
const compose = (...fns) => x => fns.reduceRight((acc, fn) => fn(acc), x)

// 5. 实现 pipe（从左到右）
const pipe = (...fns) => x => fns.reduce((acc, fn) => fn(acc), x)

// 6. 实现 memorize
function memorize(fn) {
  const cache = new Map()
  return function(...args) {
    const key = JSON.stringify(args)
    if (cache.has(key)) return cache.get(key)
    const result = fn.apply(this, args)
    cache.set(key, result)
    return result
  }
}

// 7. 实现 LazyMan
class LazyMan {
  constructor(name) {
    this.tasks = []
    this.tasks.push(() => {
      console.log(`Hi, I'm ${name}`)
      this.next()
    })
    setTimeout(() => this.next(), 0)
  }
  
  next() {
    const task = this.tasks.shift()
    task && task()
  }
  
  sleep(time) {
    this.tasks.push(() => {
      setTimeout(() => {
        console.log(`Wake up after ${time}s`)
        this.next()
      }, time * 1000)
    })
    return this
  }
  
  sleepFirst(time) {
    this.tasks.unshift(() => {
      setTimeout(() => {
        console.log(`Wake up after ${time}s`)
        this.next()
      }, time * 1000)
    })
    return this
  }
  
  eat(food) {
    this.tasks.push(() => {
      console.log(`Eat ${food}`)
      this.next()
    })
    return this
  }
}

// 8. 实现 add(1)(2)(3)
function add(a) {
  function sum(b) {
    a = a + b
    return sum
  }
  sum.toString = () => a
  return sum
}

// 9. 实现 a == 1 && a == 2 && a == 3
const a = {
  value: 1,
  valueOf() {
    return this.value++
  }
}
// 或
let val = 1
Object.defineProperty(window, 'a', {
  get() {
    return val++
  }
})
```

---

## 总结

JavaScript 面试核心知识点：

1. **基础**：数据类型、类型转换、作用域、闭包
2. **核心**：this 指向、原型链、继承
3. **异步**：Promise、async/await、Event Loop
4. **ES6+**：解构、箭头函数、Proxy、迭代器
5. **手写**：防抖节流、深拷贝、Promise、call/apply/bind
6. **设计模式**：单例、工厂、观察者、发布订阅
7. **性能**：内存管理、代码优化、网络优化

掌握这些知识点，配合大量练习，足以应对绝大多数前端面试！
