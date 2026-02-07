# Promise 完全指南

## 一、Promise 基本概念

### 1.1 什么是 Promise

Promise 是 ES6 引入的异步编程解决方案，用于解决回调地狱问题。

```javascript
// 回调地狱
getData(function(a) {
  getMoreData(a, function(b) {
    getMoreData(b, function(c) {
      getMoreData(c, function(d) {
        // 嵌套越来越深...
      })
    })
  })
})

// Promise 链式调用
getData()
  .then(a => getMoreData(a))
  .then(b => getMoreData(b))
  .then(c => getMoreData(c))
  .then(d => console.log(d))
  .catch(err => console.error(err))
```

### 1.2 Promise 的三种状态

```
pending（等待中）→ fulfilled（已成功）
                → rejected（已失败）
```

- **pending**：初始状态，既不是成功也不是失败
- **fulfilled**：操作成功完成
- **rejected**：操作失败

**状态特点**：
1. 状态只能从 pending 变为 fulfilled 或 rejected
2. 状态一旦改变，就不会再变（不可逆）
3. 状态改变后，会触发对应的回调函数

```javascript
const promise = new Promise((resolve, reject) => {
  // pending 状态
  
  resolve('success')  // → fulfilled 状态
  // 或
  reject('error')     // → rejected 状态
  
  // 状态已改变，下面的代码不会再改变状态
  resolve('again')    // 无效
  reject('again')     // 无效
})
```


---

## 二、Promise 基本用法

### 2.1 创建 Promise

```javascript
const promise = new Promise((resolve, reject) => {
  // 异步操作
  setTimeout(() => {
    const success = true
    
    if (success) {
      resolve('操作成功')  // 成功时调用
    } else {
      reject('操作失败')   // 失败时调用
    }
  }, 1000)
})
```

### 2.2 then() 方法

```javascript
promise.then(
  value => {
    // fulfilled 状态的回调
    console.log('成功:', value)
  },
  reason => {
    // rejected 状态的回调（可选）
    console.log('失败:', reason)
  }
)

// 通常只传成功回调，失败用 catch 处理
promise
  .then(value => console.log(value))
  .catch(err => console.error(err))
```

### 2.3 catch() 方法

```javascript
// catch 是 then(null, rejection) 的语法糖
promise.catch(err => {
  console.error('错误:', err)
})

// 等价于
promise.then(null, err => {
  console.error('错误:', err)
})
```

### 2.4 finally() 方法

```javascript
// 无论成功失败都会执行
promise
  .then(value => console.log(value))
  .catch(err => console.error(err))
  .finally(() => {
    console.log('清理工作')  // 总是执行
  })

// finally 不接收参数，也不改变 Promise 的值
Promise.resolve(1)
  .finally(() => { return 2 })
  .then(value => console.log(value))  // 1（不是 2）
```

### 2.5 链式调用

```javascript
// then 返回新的 Promise，支持链式调用
fetch('/api/user')
  .then(response => {
    console.log('第一个 then')
    return response.json()  // 返回值会被包装成 Promise
  })
  .then(user => {
    console.log('第二个 then')
    return fetch(`/api/posts/${user.id}`)
  })
  .then(response => response.json())
  .then(posts => console.log(posts))
  .catch(err => console.error(err))  // 捕获链中任意位置的错误
```

**链式调用的返回值规则**：

```javascript
// 1. 返回普通值 → 包装成 fulfilled 的 Promise
Promise.resolve(1)
  .then(v => v + 1)      // 返回 2
  .then(v => console.log(v))  // 2

// 2. 返回 Promise → 等待该 Promise 完成
Promise.resolve(1)
  .then(v => new Promise(resolve => {
    setTimeout(() => resolve(v + 1), 1000)
  }))
  .then(v => console.log(v))  // 1秒后输出 2

// 3. 抛出错误 → 变成 rejected 的 Promise
Promise.resolve(1)
  .then(v => { throw new Error('出错了') })
  .catch(err => console.error(err.message))  // '出错了'

// 4. 不返回值 → 返回 undefined
Promise.resolve(1)
  .then(v => { console.log(v) })  // 没有 return
  .then(v => console.log(v))      // undefined
```

---

## 三、Promise 静态方法

### 3.1 Promise.resolve()

```javascript
// 将值转换为 fulfilled 的 Promise
Promise.resolve('success')
  .then(v => console.log(v))  // 'success'

// 如果参数是 Promise，原样返回
const p = new Promise(resolve => resolve(1))
Promise.resolve(p) === p  // true

// 如果参数是 thenable 对象，会调用其 then 方法
const thenable = {
  then(resolve, reject) {
    resolve('thenable')
  }
}
Promise.resolve(thenable)
  .then(v => console.log(v))  // 'thenable'
```

### 3.2 Promise.reject()

```javascript
// 创建 rejected 的 Promise
Promise.reject('error')
  .catch(err => console.log(err))  // 'error'

// 注意：参数会原样作为 reason，即使是 Promise
Promise.reject(Promise.resolve(1))
  .catch(err => console.log(err))  // Promise {<fulfilled>: 1}
```

### 3.3 Promise.all()

```javascript
// 全部成功才成功，任一失败就失败
const p1 = Promise.resolve(1)
const p2 = Promise.resolve(2)
const p3 = Promise.resolve(3)

Promise.all([p1, p2, p3])
  .then(([r1, r2, r3]) => {
    console.log(r1, r2, r3)  // 1, 2, 3
  })

// 任一失败，立即 reject
const p4 = Promise.reject('error')

Promise.all([p1, p2, p4])
  .then(results => console.log(results))
  .catch(err => console.log(err))  // 'error'

// 实际应用：并行请求
async function fetchAll() {
  const [user, posts, comments] = await Promise.all([
    fetch('/api/user').then(r => r.json()),
    fetch('/api/posts').then(r => r.json()),
    fetch('/api/comments').then(r => r.json())
  ])
  return { user, posts, comments }
}
```

### 3.4 Promise.allSettled()

```javascript
// 等待所有 Promise 完成（不管成功失败）
const p1 = Promise.resolve(1)
const p2 = Promise.reject('error')
const p3 = Promise.resolve(3)

Promise.allSettled([p1, p2, p3])
  .then(results => {
    console.log(results)
    // [
    //   { status: 'fulfilled', value: 1 },
    //   { status: 'rejected', reason: 'error' },
    //   { status: 'fulfilled', value: 3 }
    // ]
  })

// 实际应用：批量操作，需要知道每个的结果
async function batchUpdate(items) {
  const results = await Promise.allSettled(
    items.map(item => updateItem(item))
  )
  
  const succeeded = results.filter(r => r.status === 'fulfilled')
  const failed = results.filter(r => r.status === 'rejected')
  
  console.log(`成功: ${succeeded.length}, 失败: ${failed.length}`)
}
```

### 3.5 Promise.race()

```javascript
// 返回最先完成的 Promise（不管成功失败）
const p1 = new Promise(resolve => setTimeout(() => resolve(1), 1000))
const p2 = new Promise(resolve => setTimeout(() => resolve(2), 500))

Promise.race([p1, p2])
  .then(value => console.log(value))  // 2（p2 先完成）

// 实际应用：超时控制
function fetchWithTimeout(url, timeout = 5000) {
  return Promise.race([
    fetch(url),
    new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Timeout')), timeout)
    )
  ])
}

fetchWithTimeout('/api/data', 3000)
  .then(response => response.json())
  .catch(err => console.error(err.message))  // 可能是 'Timeout'
```

### 3.6 Promise.any()

```javascript
// 任一成功就成功，全部失败才失败（ES2021）
const p1 = Promise.reject('error1')
const p2 = Promise.resolve(2)
const p3 = Promise.reject('error3')

Promise.any([p1, p2, p3])
  .then(value => console.log(value))  // 2

// 全部失败
const p4 = Promise.reject('error4')

Promise.any([p1, p3, p4])
  .catch(err => {
    console.log(err)  // AggregateError: All promises were rejected
    console.log(err.errors)  // ['error1', 'error3', 'error4']
  })

// 实际应用：多源请求，取最快成功的
async function fetchFromMultipleSources(urls) {
  return Promise.any(urls.map(url => fetch(url)))
}
```

### 3.7 静态方法对比

| 方法 | 成功条件 | 失败条件 | 返回值 |
|------|---------|---------|--------|
| all | 全部成功 | 任一失败 | 结果数组 |
| allSettled | - | - | 状态数组 |
| race | 最快的成功 | 最快的失败 | 最快的结果 |
| any | 任一成功 | 全部失败 | 第一个成功的结果 |


---

## 四、Promise 实现原理

### 4.1 基础版实现

```javascript
class MyPromise {
  constructor(executor) {
    this.state = 'pending'      // 状态
    this.value = undefined      // 成功的值
    this.reason = undefined     // 失败的原因
    this.onFulfilledCallbacks = []  // 成功回调队列
    this.onRejectedCallbacks = []   // 失败回调队列
    
    const resolve = (value) => {
      if (this.state === 'pending') {
        this.state = 'fulfilled'
        this.value = value
        // 执行所有成功回调
        this.onFulfilledCallbacks.forEach(fn => fn())
      }
    }
    
    const reject = (reason) => {
      if (this.state === 'pending') {
        this.state = 'rejected'
        this.reason = reason
        // 执行所有失败回调
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
    // 参数默认值，实现值穿透
    onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : v => v
    onRejected = typeof onRejected === 'function' ? onRejected : e => { throw e }
    
    // 返回新的 Promise 实现链式调用
    const promise2 = new MyPromise((resolve, reject) => {
      if (this.state === 'fulfilled') {
        // 异步执行，确保 promise2 已创建
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
        // 异步操作，先存储回调
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
}

// 处理 then 返回值
function resolvePromise(promise2, x, resolve, reject) {
  // 防止循环引用
  if (promise2 === x) {
    return reject(new TypeError('Chaining cycle detected'))
  }
  
  // 如果 x 是 Promise
  if (x instanceof MyPromise) {
    x.then(resolve, reject)
    return
  }
  
  // 如果 x 是对象或函数（可能是 thenable）
  if (x !== null && (typeof x === 'object' || typeof x === 'function')) {
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
    // x 是普通值
    resolve(x)
  }
}
```

### 4.2 实现 Promise.all

```javascript
MyPromise.all = function(promises) {
  return new MyPromise((resolve, reject) => {
    if (!Array.isArray(promises)) {
      return reject(new TypeError('promises must be an array'))
    }
    
    const results = []
    let count = 0
    const len = promises.length
    
    if (len === 0) {
      return resolve(results)
    }
    
    promises.forEach((p, index) => {
      // 用 Promise.resolve 包装，处理非 Promise 值
      MyPromise.resolve(p).then(
        value => {
          results[index] = value  // 保持顺序
          count++
          if (count === len) {
            resolve(results)
          }
        },
        reason => {
          reject(reason)  // 任一失败立即 reject
        }
      )
    })
  })
}
```

### 4.3 实现 Promise.race

```javascript
MyPromise.race = function(promises) {
  return new MyPromise((resolve, reject) => {
    if (!Array.isArray(promises)) {
      return reject(new TypeError('promises must be an array'))
    }
    
    promises.forEach(p => {
      MyPromise.resolve(p).then(resolve, reject)
    })
  })
}
```

### 4.4 实现 Promise.allSettled

```javascript
MyPromise.allSettled = function(promises) {
  return new MyPromise((resolve, reject) => {
    if (!Array.isArray(promises)) {
      return reject(new TypeError('promises must be an array'))
    }
    
    const results = []
    let count = 0
    const len = promises.length
    
    if (len === 0) {
      return resolve(results)
    }
    
    promises.forEach((p, index) => {
      MyPromise.resolve(p).then(
        value => {
          results[index] = { status: 'fulfilled', value }
          count++
          if (count === len) resolve(results)
        },
        reason => {
          results[index] = { status: 'rejected', reason }
          count++
          if (count === len) resolve(results)
        }
      )
    })
  })
}
```

### 4.5 实现 Promise.any

```javascript
MyPromise.any = function(promises) {
  return new MyPromise((resolve, reject) => {
    if (!Array.isArray(promises)) {
      return reject(new TypeError('promises must be an array'))
    }
    
    const errors = []
    let count = 0
    const len = promises.length
    
    if (len === 0) {
      return reject(new AggregateError([], 'All promises were rejected'))
    }
    
    promises.forEach((p, index) => {
      MyPromise.resolve(p).then(
        value => {
          resolve(value)  // 任一成功立即 resolve
        },
        reason => {
          errors[index] = reason
          count++
          if (count === len) {
            reject(new AggregateError(errors, 'All promises were rejected'))
          }
        }
      )
    })
  })
}
```


---

## 五、async/await

### 5.1 基本用法

```javascript
// async 函数返回 Promise
async function fn() {
  return 1
}
fn().then(v => console.log(v))  // 1

// await 等待 Promise 完成
async function fetchData() {
  const response = await fetch('/api/data')
  const data = await response.json()
  return data
}

// 等价于
function fetchData() {
  return fetch('/api/data')
    .then(response => response.json())
}
```

### 5.2 错误处理

```javascript
// 方式1：try/catch
async function fetchData() {
  try {
    const response = await fetch('/api/data')
    const data = await response.json()
    return data
  } catch (err) {
    console.error('请求失败:', err)
    return null
  }
}

// 方式2：.catch()
async function fetchData() {
  const response = await fetch('/api/data').catch(err => null)
  if (!response) return null
  return response.json()
}

// 方式3：封装错误处理
async function to(promise) {
  try {
    const data = await promise
    return [null, data]
  } catch (err) {
    return [err, null]
  }
}

// 使用
async function fetchData() {
  const [err, response] = await to(fetch('/api/data'))
  if (err) {
    console.error(err)
    return
  }
  return response.json()
}
```

### 5.3 并行执行

```javascript
// 错误：串行执行，效率低
async function fetchAll() {
  const user = await fetch('/api/user')      // 等待完成
  const posts = await fetch('/api/posts')    // 再请求
  const comments = await fetch('/api/comments')  // 再请求
}

// 正确：并行执行
async function fetchAll() {
  const [user, posts, comments] = await Promise.all([
    fetch('/api/user'),
    fetch('/api/posts'),
    fetch('/api/comments')
  ])
}

// 或者先发起请求，再 await
async function fetchAll() {
  const userPromise = fetch('/api/user')
  const postsPromise = fetch('/api/posts')
  const commentsPromise = fetch('/api/comments')
  
  const user = await userPromise
  const posts = await postsPromise
  const comments = await commentsPromise
}
```

### 5.4 循环中的 async/await

```javascript
// 串行执行
async function processArray(array) {
  for (const item of array) {
    await processItem(item)  // 一个一个处理
  }
}

// 并行执行
async function processArray(array) {
  await Promise.all(array.map(item => processItem(item)))
}

// 注意：forEach 不支持 await
async function wrong() {
  const arr = [1, 2, 3]
  arr.forEach(async (item) => {
    await processItem(item)  // 不会等待！
  })
  console.log('done')  // 立即执行
}

// 正确做法
async function correct() {
  const arr = [1, 2, 3]
  for (const item of arr) {
    await processItem(item)
  }
  console.log('done')  // 等待所有处理完成
}
```

---

## 六、使用场景

### 6.1 封装异步请求

```javascript
// 封装 fetch
function request(url, options = {}) {
  return new Promise((resolve, reject) => {
    fetch(url, options)
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        return response.json()
      })
      .then(data => resolve(data))
      .catch(err => reject(err))
  })
}

// 带超时的请求
function requestWithTimeout(url, timeout = 5000) {
  return Promise.race([
    fetch(url).then(r => r.json()),
    new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Timeout')), timeout)
    )
  ])
}

// 带重试的请求
async function requestWithRetry(url, retries = 3, delay = 1000) {
  for (let i = 0; i < retries; i++) {
    try {
      return await fetch(url).then(r => r.json())
    } catch (err) {
      if (i === retries - 1) throw err
      await new Promise(r => setTimeout(r, delay))
    }
  }
}
```

### 6.2 并发控制

```javascript
// 限制并发数量
async function limitConcurrency(tasks, limit) {
  const results = []
  const executing = new Set()
  
  for (const task of tasks) {
    const p = Promise.resolve().then(() => task())
    results.push(p)
    executing.add(p)
    
    const clean = () => executing.delete(p)
    p.then(clean, clean)
    
    if (executing.size >= limit) {
      await Promise.race(executing)
    }
  }
  
  return Promise.all(results)
}

// 使用
const tasks = urls.map(url => () => fetch(url))
const results = await limitConcurrency(tasks, 3)  // 最多同时 3 个请求
```

### 6.3 串行执行

```javascript
// 按顺序执行 Promise
function serial(tasks) {
  return tasks.reduce(
    (promise, task) => promise.then(results => 
      task().then(result => [...results, result])
    ),
    Promise.resolve([])
  )
}

// 使用
const tasks = [
  () => fetch('/api/1'),
  () => fetch('/api/2'),
  () => fetch('/api/3')
]
const results = await serial(tasks)
```

### 6.4 缓存请求

```javascript
const cache = new Map()

function cachedFetch(url) {
  if (cache.has(url)) {
    return Promise.resolve(cache.get(url))
  }
  
  return fetch(url)
    .then(r => r.json())
    .then(data => {
      cache.set(url, data)
      return data
    })
}

// 带过期时间的缓存
const cacheWithExpiry = new Map()

function cachedFetchWithExpiry(url, ttl = 60000) {
  const cached = cacheWithExpiry.get(url)
  
  if (cached && Date.now() - cached.timestamp < ttl) {
    return Promise.resolve(cached.data)
  }
  
  return fetch(url)
    .then(r => r.json())
    .then(data => {
      cacheWithExpiry.set(url, { data, timestamp: Date.now() })
      return data
    })
}
```

### 6.5 取消请求

```javascript
// 使用 AbortController
function fetchWithCancel(url) {
  const controller = new AbortController()
  
  const promise = fetch(url, { signal: controller.signal })
    .then(r => r.json())
  
  return {
    promise,
    cancel: () => controller.abort()
  }
}

// 使用
const { promise, cancel } = fetchWithCancel('/api/data')

promise
  .then(data => console.log(data))
  .catch(err => {
    if (err.name === 'AbortError') {
      console.log('请求已取消')
    }
  })

// 取消请求
cancel()
```

### 6.6 Promise 化回调函数

```javascript
// 通用 promisify
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

// 使用
const fs = require('fs')
const readFile = promisify(fs.readFile)

readFile('file.txt', 'utf8')
  .then(content => console.log(content))
  .catch(err => console.error(err))
```


---

## 七、面试高频题

### Q1: Promise 的状态有哪些？能否改变？

```javascript
// 三种状态：pending、fulfilled、rejected
// 状态只能从 pending 变为 fulfilled 或 rejected
// 状态一旦改变，不可逆

const p = new Promise((resolve, reject) => {
  resolve('success')
  reject('error')  // 无效，状态已经是 fulfilled
})

p.then(v => console.log(v))  // 'success'
```

### Q2: Promise.all 和 Promise.allSettled 的区别？

```javascript
// Promise.all：任一失败就失败
Promise.all([
  Promise.resolve(1),
  Promise.reject('error'),
  Promise.resolve(3)
]).catch(err => console.log(err))  // 'error'

// Promise.allSettled：等待所有完成，返回每个的状态
Promise.allSettled([
  Promise.resolve(1),
  Promise.reject('error'),
  Promise.resolve(3)
]).then(results => console.log(results))
// [
//   { status: 'fulfilled', value: 1 },
//   { status: 'rejected', reason: 'error' },
//   { status: 'fulfilled', value: 3 }
// ]
```

### Q3: Promise 链中如何中断？

```javascript
// 方法1：返回一个永远 pending 的 Promise
Promise.resolve(1)
  .then(v => {
    if (v === 1) {
      return new Promise(() => {})  // 永远 pending
    }
    return v
  })
  .then(v => console.log(v))  // 不会执行

// 方法2：抛出错误
Promise.resolve(1)
  .then(v => {
    if (v === 1) {
      throw new Error('中断')
    }
    return v
  })
  .then(v => console.log(v))  // 不会执行
  .catch(err => console.log(err.message))  // '中断'
```

### Q4: Promise 执行顺序题

```javascript
// 题目1
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
// 解析：同步代码 → 微任务 → 宏任务

// 题目2
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
// 解析：return Promise.resolve() 会产生额外的微任务

// 题目3
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

### Q5: 如何实现 Promise.all？

```javascript
Promise.myAll = function(promises) {
  return new Promise((resolve, reject) => {
    const results = []
    let count = 0
    
    if (promises.length === 0) {
      return resolve(results)
    }
    
    promises.forEach((p, index) => {
      Promise.resolve(p).then(
        value => {
          results[index] = value
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
```

### Q6: async/await 和 Promise 的关系？

```javascript
// async/await 是 Promise 的语法糖
// async 函数返回 Promise
// await 等待 Promise 完成

async function fn() {
  return 1
}
// 等价于
function fn() {
  return Promise.resolve(1)
}

async function fn() {
  const result = await somePromise
  return result
}
// 等价于
function fn() {
  return somePromise.then(result => result)
}
```

### Q7: 如何让 async 函数并行执行？

```javascript
// 错误：串行
async function wrong() {
  const a = await fetch('/api/a')  // 等待
  const b = await fetch('/api/b')  // 再等待
}

// 正确：并行
async function correct() {
  const [a, b] = await Promise.all([
    fetch('/api/a'),
    fetch('/api/b')
  ])
}
```

### Q8: Promise 值穿透是什么？

```javascript
// then 的参数不是函数时，会发生值穿透
Promise.resolve(1)
  .then(2)           // 不是函数，穿透
  .then(Promise.resolve(3))  // 不是函数，穿透
  .then(console.log)  // 1

// 原理：then 内部会检查参数类型
// onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : v => v
```

---

## 八、总结

### 核心要点

1. **状态不可逆**：pending → fulfilled/rejected，一旦改变不可再变
2. **链式调用**：then 返回新 Promise，支持链式调用
3. **错误冒泡**：错误会沿着链传递，直到被 catch 捕获
4. **微任务**：Promise 回调是微任务，优先于宏任务执行

### 静态方法选择

| 场景 | 方法 |
|------|------|
| 全部成功才继续 | Promise.all |
| 需要所有结果（不管成功失败） | Promise.allSettled |
| 取最快的结果 | Promise.race |
| 任一成功即可 | Promise.any |
| 超时控制 | Promise.race |

### 最佳实践

1. 总是使用 catch 处理错误
2. 并行请求用 Promise.all
3. 需要取消用 AbortController
4. 循环中用 for...of 而不是 forEach
5. async/await 配合 try/catch 处理错误
