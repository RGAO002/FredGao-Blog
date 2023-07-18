---
title: "Redux-Saga-1"
date: "2022-11-23"
description: "Redux Saga Basics 101"
---

## Using Redux-Saga Middleware

Similar to Redux-Thunk, Redux-Saga is a middleware for managing asynchronous operations (Side Effect) of Redux applications, created by Yassine Elouafi, a developer from Canada. Redux-Saga uses the Generator feature of ES6, making asynchronous processes easier to read, write, and test. In this way, developers can clearly describe the asynchronous process in the application.

### Generator Function

Before delving into Redux-Saga, we need to first understand the Generator function in JavaScript. The Generator function is an asynchronous programming solution provided by ES6, with syntax behavior completely different from traditional functions, defined as **`function*`**, and it can use the **`yield`** keyword to pause the execution of the function. It can be paused and resumed. Generator functions have multiple states, which can switch back and forth, which is why they can handle asynchronous operations.

The Generator function is a state machine that encapsulates multiple internal states. When you call a Generator function, it does not immediately execute the code in the function body, but instead returns a special iterator, called a Generator object. This Generator object has a **`next`** method. You can control the execution of the Generator function by calling this **`next`** method. In other words, the Generator function is not only a state machine but also a function to generate iterator objects. The returned iterator object can traverse each state in the Generator function one by one.

Each time the **`next`** method is called, the Generator function will start executing from where it was last paused until it encounters the next **`yield`** expression or the function ends. The **`next`** method returns an object, the **`value`** attribute of this object is the value of the **`yield`** expression, and the **`done`** attribute is a Boolean value indicating whether the Generator function has finished executing.

A simple Generator function can be written like this:

```jsx
function* gen() {
	console.log('a');
	yield;
	console.log('b');
}

const g = gen()
g //gen {<suspended>}

g.next() //a b {value: undefined, done: true}

function* gen2(i)
{
	yield i;
	yield i + 10;
}
const g2 = gen2(5)

const gObj = g2.next()
console.log(gObj) //{value: 5, done: false}

const jObj = g2.next()
console.log(jObj) //{value: 15, done: false}

console.log(g2.next()) {value: undefined, done: true}
```

In this example, **`gen2`** is a Generator function, which defines two states (through the **`yield`** keyword). We can traverse these states using the **`next`** method.

In addition to **`yield`** and **`next`**, the Generator function has two important methods: **`throw`** and **`return`**

The **`throw`** method: can throw an error outside the Generator function, and then catch it inside the Generator function. If the error is not caught by the **`try...catch`** statement inside the Generator function, then the error will be received by the object returned by the **`throw`** method.

The **`return`** method: can end the execution of the Generator function in advance, and set the **`done`** attribute to **`true`**. The **`return`** method accepts a parameter, which will become the **`value`** attribute of the object returned by the **`next`** method.

### Redux-Saga Workflow

First, we need to install Redux-Saga in the project:

```
npm install redux-saga
```

Create a `**root-saga.js`\*\*:

```jsx
import { all, call } from "redux-saga/effects"

import { categoriesSaga } from "./categories/category.saga"

export function* rootSaga() {
  yield all([call(categoriesSaga)])
}
```

**`rootSaga`** is a core concept in Redux-Saga, it is the entry point of all sagas (or all asynchronous operations). In a large application, you may have many different sagas, each saga is responsible for handling a specific asynchronous operation. **`rootSaga`** is where all these sagas are organized and started.

**`rootSaga`** is a Generator function, it uses the **`yield all([call(categoriesSaga)]);`** line of code to start all sagas. The **`all`** and **`call`** here are the effect creation functions of Redux-Saga.

- The **`all`** function is used to start multiple sagas at the same time. It receives an array of sagas and starts all of them in parallel.

- The **`call`** function is used to call a function (which should be a Generator function). It can also pass parameters to this function. This is similar to calling a function directly, but in Redux-Saga, if you want to call a function, you need to use the **`call`** function to do it.

So, the line of code **`yield all([call(categoriesSaga)]);`** means to execute the **`categoriesSaga`** saga in parallel. If there are more sagas, they can all be put into this array, for example: **`yield all([call(categoriesSaga), call(userSaga), call(orderSaga)]);`**.

Next, in **`store.js`**, import, add and run Redux-Saga middleware:

```jsx
//Other imports and configs omitted
import createSagaMiddleware from "redux-saga"
import { rootSaga } from "./root-saga"

const sagaMiddleware = createSagaMiddleware()

const middleWares = [
  process.env.NODE_ENV === "development" && logger,
  sagaMiddleware,
].filter(Boolean)

sagaMiddleware.run(rootSaga)
```

Then, taking category reducer as an example, we will modify the `**fetchCategoriesAsync**` action that previously called Redux-Thunk to use Redux-Saga. **Both are middlewares for handling asynchronous operations in Redux, and are generally not used at the same time.**

```jsx
import { takeLatest, all, call, put } from "redux-saga/effects"

import { getCategoriesAndDocuments } from "../../utils/firebase/firebase.utils"

import {
  fetchCategoriesSuccess,
  fetchCategoriesFailed,
} from "./category.action"

import { CATEGORIES_ACTION_TYPES } from "./category.types"

export function* fetchCategoriesAsync() {
  try {
    const categoriesArray = yield call(getCategoriesAndDocuments, "categories")
    yield put(fetchCategoriesSuccess(categoriesArray))
  } catch (err) {
    yield put(fetchCategoriesFailed(err))
  }
}

export function* onFetchCategories() {
  yield takeLatest(
    CATEGORIES_ACTION_TYPES.FETCH_CATEGORIES_START,
    fetchCategoriesAsync
  )
}

export function* categoriesSaga() {
  yield all([call(onFetchCategories)])
}
```

In Redux-Saga, a Saga is a Generator function, any function that contains `**yield**` and other `**Generator**` function keywords can be called a Saga. We can use the **`yield`** keyword in this function to describe our asynchronous operation. In this example, **`fetchCategoriesAsync`** is a Saga that describes an asynchronous operation: first, we use **`yield call`** to call the **`getCategoriesAndDocuments`** function to get category information; then, we use **`yield put`** to dispatch an action to update the state of the Redux store.

**`yield call`** is an effect creator, it is used to create effects that describe "call function". In our example, **`yield call(getCategoriesAndDocuments, "categories")`** creates an effect that describes the operation of calling the **`getCategoriesAndDocuments`** function. The Redux-Saga middleware will handle these effects when executing the Generator function. For **`call`** effect, the middleware will call the given function and suspend the Generator function until the function returns. That is to say, any call to a function in a Saga must use `**call**`.

**`yield put`** is also an effect creator, it is used to create effects that describe "dispatch action". In our example, **`yield put(fetchCategoriesSuccess(categoriesArray))`** creates an effect that describes the operation of dispatching **`fetchCategoriesSuccess`** action. The Redux-Saga middleware will handle these effects when executing the Generator function. For the **`put`** effect, the middleware will dispatch the given action. This effect describes a dispatch action operation, not an immediate dispatch action. When we dispatch an action in a Saga, we use the `**put**` keyword.

**`yield takeLatest`** is a helper function, it creates a Saga that forks a new task to execute the given Saga each time it receives the specified action. If this Saga has already forked a task when it received the action last time and this task has not yet ended, then **`takeLatest`** will cancel this task. This means that if multiple identical actions are dispatched, **`takeLatest`** will only execute the Saga corresponding to the last action. Therefore, `**takeLatest**` is essentially a binding to an action, similar to watching an action and responding in a Saga, just like a reducer. However, it usually does not return a new state object like a reducer, it usually executes another Saga.

`**yield all**` is an effect creator, it is used to handle multiple effects in parallel. In our example, **`yield all([call(onFetchCategories)])`** creates an effect that describes the operation of calling **`onFetchCategories`** in parallel. The Redux-Saga middleware will handle these effects when executing the Generator function. For the **`all`** effect, the middleware will handle all effects in parallel and suspend the Generator function until all effects are handled. Any action that needs to be monitored must be registered in `**yield all**`. This allows us to manage all Sagas centrally in one place, rather than manage them separately in multiple places.
