# call、apply、bind 完全指南

## 一、基本概念

这三个方法都是 `Function.prototype` 上的方法，用于改变函数执行时的 `this` 指向。

```javascript
Function.prototype.call
Function.prototype.apply
Function.prototype.bind
```

### 核心区别

| 方法 | 参数传递 | 执行时机 | 返回值 |
|------|---------|---------|--------|
| call | 逐个传递 | 立即执行 | 函数执行结果 |
| apply | 数组传递 | 立即执行 | 函数执行结果 |
| bind | 逐个传递 | 返回新函数，手动执行 | 绑定后的新函数 |

---

## 二、详细使用方法

### 2.1 call 详解

**语法**：
```javascript
fn.call(thisArg, arg1, arg2, arg3, ...)
```

**参数说明**：
- `thisArg`：函数执行时 this 的指向
- `arg1, arg2, ...`：传递给函数的参数，逐个列出

**基础示例**：
```javascript
function greet(greeting, punctuation) {
  console.log(`${greeting}, ${this.name}${punctuation}`)
}

const person = { name: 'Tom' }

// 不使用 call，直接调用
greet('Hello', '!')  // Hello, undefined!（this 指向 window）

// 使用 call，改变 this 指向
greet.call(person, 'Hello', '!')  // Hello, Tom!
greet.call(person, 'Hi', '~')     // Hi, Tom~
```

**无参数情况**：
```javascript
function sayName() {
  console.log(this.name)
}

const obj = { name: 'Tom' }

sayName.call(obj)  // Tom
sayName.call()     // undefined（this 指向 window）
```

**多个对象切换**：
```javascript
function introduce() {
  console.log(`I'm ${this.name}, ${this.age} years old`)
}

const tom = { name: 'Tom', age: 18 }
const jerry = { name: 'Jerry', age: 20 }

introduce.call(tom)    // I'm Tom, 18 years old
introduce.call(jerry)  // I'm Jerry, 20 years old
```

**有返回值的函数**：
```javascript
function add(a, b) {
  return this.base + a + b
}

const calculator = { base: 10 }

const result = add.call(calculator, 5, 3)
console.log(result)  // 18
```

---

### 2.2 apply 详解

**语法**：
```javascript
fn.apply(thisArg, [arg1, arg2, arg3, ...])
```

**参数说明**：
- `thisArg`：函数执行时 this 的指向
- `[argsArray]`：传递给函数的参数数组（或类数组对象）

**基础示例**：
```javascript
function greet(greeting, punctuation) {
  console.log(`${greeting}, ${this.name}${punctuation}`)
}

const person = { name: 'Tom' }

// 参数以数组形式传递
greet.apply(person, ['Hello', '!'])  // Hello, Tom!
greet.apply(person, ['Hi', '~'])     // Hi, Tom~
```

**与 call 的对比**：
```javascript
function sum(a, b, c, d) {
  return this.base + a + b + c + d
}

const obj = { base: 100 }

// call：参数逐个传递
sum.call(obj, 1, 2, 3, 4)      // 110

// apply：参数以数组传递
sum.apply(obj, [1, 2, 3, 4])   // 110
```

**动态参数场景（apply 的优势）**：
```javascript
// 当参数是数组时，apply 更方便
const numbers = [5, 6, 2, 3, 7]

// 使用 apply
Math.max.apply(null, numbers)  // 7
Math.min.apply(null, numbers)  // 2

// 使用 call 需要展开
Math.max.call(null, ...numbers)  // 7（ES6 才支持）

// 合并数组
const arr1 = [1, 2, 3]
const arr2 = [4, 5, 6]
Array.prototype.push.apply(arr1, arr2)
console.log(arr1)  // [1, 2, 3, 4, 5, 6]
```

**类数组作为参数**：
```javascript
function logArgs(a, b, c) {
  console.log(a, b, c)
}

// 类数组对象也可以
const arrayLike = { 0: 'x', 1: 'y', 2: 'z', length: 3 }
logArgs.apply(null, arrayLike)  // x y z

// arguments 对象
function wrapper() {
  logArgs.apply(null, arguments)
}
wrapper('a', 'b', 'c')  // a b c
```

---

### 2.3 bind 详解

**语法**：
```javascript
const boundFn = fn.bind(thisArg, arg1, arg2, ...)
```

**参数说明**：
- `thisArg`：绑定的 this 值
- `arg1, arg2, ...`：预设的参数（可选）
- **返回值**：一个新函数，需要手动调用

**基础示例**：
```javascript
function greet(greeting, punctuation) {
  console.log(`${greeting}, ${this.name}${punctuation}`)
}

const person = { name: 'Tom' }

// bind 返回新函数，不会立即执行
const boundGreet = greet.bind(person)
console.log(typeof boundGreet)  // 'function'

// 手动调用
boundGreet('Hello', '!')  // Hello, Tom!
boundGreet('Hi', '~')     // Hi, Tom~
```

**预设参数（偏函数/柯里化）**：
```javascript
function greet(greeting, punctuation) {
  console.log(`${greeting}, ${this.name}${punctuation}`)
}

const person = { name: 'Tom' }

// 预设第一个参数
const sayHello = greet.bind(person, 'Hello')
sayHello('!')  // Hello, Tom!
sayHello('?')  // Hello, Tom?

// 预设所有参数
const sayHelloWithExclaim = greet.bind(person, 'Hello', '!')
sayHelloWithExclaim()  // Hello, Tom!
```

**分步传参**：
```javascript
function add(a, b, c, d) {
  return a + b + c + d
}

// 第一次 bind：预设 a = 1
const add1 = add.bind(null, 1)
add1(2, 3, 4)  // 10 (1 + 2 + 3 + 4)

// 第二次 bind：预设 a = 1, b = 2
const add1and2 = add.bind(null, 1, 2)
add1and2(3, 4)  // 10 (1 + 2 + 3 + 4)

// 第三次 bind：预设 a = 1, b = 2, c = 3
const add1and2and3 = add.bind(null, 1, 2, 3)
add1and2and3(4)  // 10 (1 + 2 + 3 + 4)
```

**bind 多次调用（this 只绑定一次）**：
```javascript
function fn() {
  console.log(this.name)
}

const obj1 = { name: 'obj1' }
const obj2 = { name: 'obj2' }
const obj3 = { name: 'obj3' }

const bound1 = fn.bind(obj1)
const bound2 = bound1.bind(obj2)
const bound3 = bound2.bind(obj3)

bound1()  // 'obj1'
bound2()  // 'obj1'（不是 obj2！）
bound3()  // 'obj1'（不是 obj3！）

// 结论：bind 只有第一次生效，后续 bind 无法改变 this
```

**bind 与 new 的关系**：
```javascript
function Person(name, age) {
  this.name = name
  this.age = age
}

const obj = { x: 1 }

// 绑定 this 为 obj
const BoundPerson = Person.bind(obj)

// 普通调用：this 指向 obj
BoundPerson('Tom', 18)
console.log(obj.name)  // 'Tom'
console.log(obj.age)   // 18

// new 调用：this 指向新实例，忽略绑定的 obj
const p = new BoundPerson('Jerry', 20)
console.log(p.name)    // 'Jerry'
console.log(p.age)     // 20
console.log(p.x)       // undefined（不是 obj）
```

---

### 2.4 三者对比示例

```javascript
function introduce(greeting, ending) {
  console.log(`${greeting}! I'm ${this.name}. ${ending}`)
}

const person = { name: 'Tom' }

// call：立即执行，参数逐个传
introduce.call(person, 'Hi', 'Nice to meet you')
// Hi! I'm Tom. Nice to meet you

// apply：立即执行，参数数组传
introduce.apply(person, ['Hello', 'How are you'])
// Hello! I'm Tom. How are you

// bind：返回新函数，手动调用
const boundIntroduce = introduce.bind(person, 'Hey')
boundIntroduce('See you')
// Hey! I'm Tom. See you
```

**选择指南**：
```javascript
// 场景1：知道具体参数，立即执行 → call
fn.call(obj, 1, 2, 3)

// 场景2：参数是数组，立即执行 → apply
fn.apply(obj, [1, 2, 3])
fn.apply(obj, args)  // args 是变量

// 场景3：需要延迟执行或多次调用 → bind
const bound = fn.bind(obj, 1, 2)
button.onclick = bound
setTimeout(bound, 1000)
```

---

## 三、thisArg 的处理规则

### 3.1 非严格模式

```javascript
function showThis() {
  console.log(this)
}

// null 或 undefined → 指向全局对象 (window/global)
showThis.call(null)       // window
showThis.call(undefined)  // window

// 基本类型 → 自动装箱为包装对象
showThis.call(123)        // Number {123}
showThis.call('str')      // String {'str'}
showThis.call(true)       // Boolean {true}
```

### 3.2 严格模式

```javascript
'use strict'

function showThis() {
  console.log(this)
}

// null 或 undefined → 保持原值
showThis.call(null)       // null
showThis.call(undefined)  // undefined

// 基本类型 → 保持原值，不装箱
showThis.call(123)        // 123
showThis.call('str')      // 'str'
```

---

## 四、实现原理

### 4.1 手写 call

```javascript
Function.prototype.myCall = function(context, ...args) {
  // 1. 处理 context
  // null/undefined → window，基本类型 → 包装对象
  if (context === null || context === undefined) {
    context = globalThis  // 浏览器是 window，Node 是 global
  } else {
    context = Object(context)  // 基本类型转包装对象
  }
  
  // 2. 将函数设置为 context 的属性
  // 使用 Symbol 避免属性名冲突
  const fn = Symbol('fn')
  context[fn] = this  // this 就是调用 myCall 的函数
  
  // 3. 执行函数
  const result = context[fn](...args)
  
  // 4. 删除临时属性
  delete context[fn]
  
  // 5. 返回结果
  return result
}

// 测试
function greet(greeting) {
  return `${greeting}, ${this.name}`
}
const person = { name: 'Tom' }
greet.myCall(person, 'Hello')  // 'Hello, Tom'
```

**原理解析**：

```javascript
// 当我们调用 greet.call(person, 'Hello') 时
// 实际上相当于：
person.greet = greet
person.greet('Hello')  // 此时 this 指向 person
delete person.greet
```

### 4.2 手写 apply

```javascript
Function.prototype.myApply = function(context, args = []) {
  // 1. 处理 context
  if (context === null || context === undefined) {
    context = globalThis
  } else {
    context = Object(context)
  }
  
  // 2. 参数校验
  if (args !== null && args !== undefined && !Array.isArray(args)) {
    // 类数组也可以，这里简化处理
    if (typeof args[Symbol.iterator] !== 'function') {
      throw new TypeError('CreateListFromArrayLike called on non-object')
    }
  }
  
  // 3. 将函数设置为 context 的属性
  const fn = Symbol('fn')
  context[fn] = this
  
  // 4. 执行函数（展开数组参数）
  const result = context[fn](...(args || []))
  
  // 5. 删除临时属性
  delete context[fn]
  
  return result
}

// 测试
function sum(a, b, c) {
  return this.base + a + b + c
}
const obj = { base: 10 }
sum.myApply(obj, [1, 2, 3])  // 16
```

### 4.3 手写 bind

```javascript
Function.prototype.myBind = function(context, ...args) {
  // 保存原函数
  const self = this
  
  // 返回一个新函数
  const fBound = function(...innerArgs) {
    // 合并参数
    const finalArgs = args.concat(innerArgs)
    
    // 判断是否作为构造函数调用（new 调用）
    // 如果是 new 调用，this 指向新创建的实例，而不是 context
    return self.apply(
      this instanceof fBound ? this : context,
      finalArgs
    )
  }
  
  // 维护原型关系（让 new 出来的实例能访问原函数原型上的属性）
  if (this.prototype) {
    fBound.prototype = Object.create(this.prototype)
  }
  
  return fBound
}

// 测试
function Person(name, age) {
  this.name = name
  this.age = age
}
Person.prototype.sayHi = function() {
  console.log(`Hi, I'm ${this.name}`)
}

const obj = { x: 1 }
const BoundPerson = Person.myBind(obj, 'Tom')

// 普通调用
BoundPerson(18)
console.log(obj.name)  // 'Tom'
console.log(obj.age)   // 18

// 作为构造函数调用
const p = new BoundPerson(20)
console.log(p.name)    // 'Tom'
console.log(p.age)     // 20
p.sayHi()              // Hi, I'm Tom
console.log(p instanceof Person)  // true
```

**bind 的特殊之处**：

```javascript
// 1. bind 返回的函数可以作为构造函数
function Foo(name) {
  this.name = name
}

const Bar = Foo.bind({ x: 1 })
const bar = new Bar('Tom')

console.log(bar.name)  // 'Tom'（不是 undefined）
console.log(bar.x)     // undefined（new 时忽略了绑定的 this）

// 2. bind 可以预设参数（柯里化）
function add(a, b, c) {
  return a + b + c
}

const add5 = add.bind(null, 5)
add5(1, 2)  // 8 (5 + 1 + 2)

const add5and6 = add.bind(null, 5, 6)
add5and6(7)  // 18 (5 + 6 + 7)
```

---

## 五、使用场景

### 5.1 借用方法

```javascript
// 1. 类数组转数组
function fn() {
  // arguments 是类数组，没有数组方法
  const args = Array.prototype.slice.call(arguments)
  // 或
  const args2 = [].slice.call(arguments)
  // ES6 更简单
  const args3 = Array.from(arguments)
  const args4 = [...arguments]
}

// 2. 判断数据类型
function getType(value) {
  return Object.prototype.toString.call(value).slice(8, -1).toLowerCase()
}

getType([])        // 'array'
getType({})        // 'object'
getType(null)      // 'null'
getType(new Date)  // 'date'

// 3. 借用数组方法操作类数组
const arrayLike = { 0: 'a', 1: 'b', 2: 'c', length: 3 }

Array.prototype.push.call(arrayLike, 'd')
console.log(arrayLike)  // { 0: 'a', 1: 'b', 2: 'c', 3: 'd', length: 4 }

Array.prototype.forEach.call(arrayLike, item => console.log(item))
// a, b, c, d
```

### 5.2 继承

```javascript
// 构造函数继承
function Parent(name) {
  this.name = name
  this.colors = ['red', 'blue']
}

function Child(name, age) {
  // 调用父构造函数，继承属性
  Parent.call(this, name)
  this.age = age
}

const child = new Child('Tom', 18)
console.log(child.name)    // 'Tom'
console.log(child.colors)  // ['red', 'blue']
```

### 5.3 求数组最大/最小值

```javascript
const numbers = [5, 6, 2, 3, 7]

// Math.max 接收的是多个参数，不是数组
// 使用 apply 展开数组
const max = Math.max.apply(null, numbers)  // 7
const min = Math.min.apply(null, numbers)  // 2

// ES6 更简单
const max2 = Math.max(...numbers)
const min2 = Math.min(...numbers)
```

### 5.4 合并数组

```javascript
const arr1 = [1, 2, 3]
const arr2 = [4, 5, 6]

// 使用 apply 将 arr2 展开后 push 到 arr1
Array.prototype.push.apply(arr1, arr2)
console.log(arr1)  // [1, 2, 3, 4, 5, 6]

// ES6 更简单
arr1.push(...arr2)
```

### 5.5 绑定事件回调的 this

```javascript
class Button {
  constructor() {
    this.count = 0
    this.button = document.querySelector('button')
    
    // 问题：事件回调中 this 指向 button 元素
    // this.button.addEventListener('click', this.handleClick)
    
    // 解决方案1：bind
    this.button.addEventListener('click', this.handleClick.bind(this))
    
    // 解决方案2：箭头函数
    // this.button.addEventListener('click', () => this.handleClick())
  }
  
  handleClick() {
    this.count++
    console.log(this.count)
  }
}
```

### 5.6 柯里化和偏函数

```javascript
// 使用 bind 实现偏函数
function multiply(a, b) {
  return a * b
}

const double = multiply.bind(null, 2)
const triple = multiply.bind(null, 3)

double(5)  // 10
triple(5)  // 15

// 日志函数
function log(level, time, message) {
  console.log(`[${level}] ${time}: ${message}`)
}

const info = log.bind(null, 'INFO')
const error = log.bind(null, 'ERROR')

info(new Date().toISOString(), 'User logged in')
error(new Date().toISOString(), 'Connection failed')
```

### 5.7 函数节流/防抖中保持 this

```javascript
function debounce(fn, delay) {
  let timer = null
  
  return function(...args) {
    // 保存 this，确保 fn 执行时 this 正确
    const context = this
    
    clearTimeout(timer)
    timer = setTimeout(() => {
      fn.apply(context, args)
    }, delay)
  }
}

const obj = {
  name: 'Tom',
  greet: debounce(function() {
    console.log(`Hello, ${this.name}`)
  }, 1000)
}

obj.greet()  // 1秒后输出：Hello, Tom
```

### 5.8 React 中绑定 this

```javascript
class MyComponent extends React.Component {
  constructor(props) {
    super(props)
    this.state = { count: 0 }
    
    // 方式1：在构造函数中 bind
    this.handleClick = this.handleClick.bind(this)
  }
  
  handleClick() {
    this.setState({ count: this.state.count + 1 })
  }
  
  // 方式2：使用箭头函数（类字段语法）
  handleClick2 = () => {
    this.setState({ count: this.state.count + 1 })
  }
  
  render() {
    return (
      <div>
        <button onClick={this.handleClick}>Click</button>
        {/* 方式3：内联 bind（不推荐，每次渲染都创建新函数） */}
        <button onClick={this.handleClick.bind(this)}>Click</button>
        {/* 方式4：内联箭头函数（不推荐） */}
        <button onClick={() => this.handleClick()}>Click</button>
      </div>
    )
  }
}
```

---

## 六、面试高频题

### Q1: call 和 apply 的区别？

```javascript
// 唯一区别：参数传递方式不同
fn.call(context, arg1, arg2, arg3)    // 逐个传递
fn.apply(context, [arg1, arg2, arg3]) // 数组传递

// 记忆技巧：
// apply 的 a 像 array，所以用数组传参
```

### Q2: call/apply 和 bind 的区别？

```javascript
// 1. 执行时机
fn.call(obj)   // 立即执行
fn.apply(obj)  // 立即执行
fn.bind(obj)   // 返回新函数，需要手动调用

// 2. 返回值
fn.call(obj)   // 返回函数执行结果
fn.apply(obj)  // 返回函数执行结果
fn.bind(obj)   // 返回绑定后的新函数

// 3. 多次绑定
const bound1 = fn.bind(obj1)
const bound2 = bound1.bind(obj2)
bound2()  // this 仍然指向 obj1，bind 只生效一次
```

### Q3: 如何实现一个 bind？

```javascript
Function.prototype.myBind = function(context, ...args) {
  const self = this
  
  const fBound = function(...innerArgs) {
    // new 调用时，this 指向实例
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

### Q4: bind 后的函数能否再次 bind？

```javascript
function fn() {
  console.log(this.name)
}

const obj1 = { name: 'obj1' }
const obj2 = { name: 'obj2' }

const bound1 = fn.bind(obj1)
const bound2 = bound1.bind(obj2)

bound2()  // 'obj1'

// 结论：bind 只生效一次，后续 bind 无法改变 this
```

### Q5: 箭头函数能用 call/apply/bind 吗？

```javascript
const arrowFn = () => {
  console.log(this)
}

const obj = { name: 'obj' }

arrowFn.call(obj)   // window（无效）
arrowFn.apply(obj)  // window（无效）
arrowFn.bind(obj)() // window（无效）

// 结论：箭头函数没有自己的 this，call/apply/bind 无法改变其 this
// 箭头函数的 this 在定义时就确定了，继承自外层作用域
```

### Q6: 如何让 call/apply/bind 对箭头函数生效？

```javascript
// 无法直接生效，但可以通过包装实现
const obj = { name: 'obj' }

// 方式1：包装成普通函数
const wrapper = function() {
  const arrowFn = () => console.log(this.name)
  arrowFn()
}
wrapper.call(obj)  // 'obj'

// 方式2：在定义时就绑定
const createArrowFn = function() {
  return () => console.log(this.name)
}
const boundArrowFn = createArrowFn.call(obj)
boundArrowFn()  // 'obj'
```

### Q7: 输出题

```javascript
var name = 'window'

const obj = {
  name: 'obj',
  fn1: function() {
    console.log(this.name)
  },
  fn2: () => {
    console.log(this.name)
  }
}

const fn1 = obj.fn1
const fn2 = obj.fn2

obj.fn1()           // ?
obj.fn2()           // ?
fn1()               // ?
fn2()               // ?
fn1.call(obj)       // ?
fn2.call(obj)       // ?
obj.fn1.bind({ name: 'bound' })()  // ?
obj.fn2.bind({ name: 'bound' })()  // ?

// 答案：
// obj.fn1()           → 'obj'（隐式绑定）
// obj.fn2()           → 'window'（箭头函数继承外层 this）
// fn1()               → 'window'（默认绑定）
// fn2()               → 'window'（箭头函数）
// fn1.call(obj)       → 'obj'（显式绑定）
// fn2.call(obj)       → 'window'（箭头函数无法改变 this）
// obj.fn1.bind(...)() → 'bound'（bind 绑定）
// obj.fn2.bind(...)() → 'window'（箭头函数无法改变 this）
```

---

## 七、总结

### 使用场景速查

| 场景 | 推荐方法 |
|------|---------|
| 借用方法（类型判断、类数组操作） | call |
| 传递数组参数（Math.max、数组合并） | apply |
| 事件回调绑定 this | bind |
| 柯里化/偏函数 | bind |
| 构造函数继承 | call |
| 需要延迟执行 | bind |

### 核心要点

1. **call/apply 立即执行，bind 返回新函数**
2. **call 逐个传参，apply 数组传参**
3. **bind 可以预设参数（柯里化）**
4. **bind 返回的函数作为构造函数时，绑定的 this 会被忽略**
5. **箭头函数的 this 无法被 call/apply/bind 改变**
6. **bind 只生效一次，多次 bind 无效**
