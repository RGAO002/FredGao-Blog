---
title: "Redux-Saga-2"
date: "2022-12-22"
description: "Redux Saga Basics 101"
---

### Redux-Saga Effects

Some unmentioned Redux-Saga operations, such as **`takeEvery`**, **`take`**, **`fork`** etc., are also essentially Effect creating functions. They don't directly execute function calls or dispatch actions, but return an Effect description object instead. This object contains instructions on what operation to execute, such as which function to call, what are the parameters (for **`call`**), or which action to dispatch (for **`put`**).

The benefit of this design is that the Saga function itself remains pure; it only returns a series of Effect description objects, rather than directly executing side-effect operations. This makes Saga functions easier to test, as you can directly check the Effect description objects returned by the Saga function, without needing to mock function calls or action dispatches.

Actual function calls or action dispatches are performed by Redux-Saga middleware. When a Saga function returns an Effect description object through a **`yield`** statement, Redux-Saga middleware takes over the Effect and performs operations based on the information in the Effect description. For example, for the **`call`** Effect, the middleware calls the specified function with the specified parameters; for the **`put`** Effect, the middleware dispatches the specified action.

So, you can understand that **`call`** and **`put`** are telling Redux-Saga middleware: "I want to do this operation, you help me do it". Instead of directly executing the operation. This is why we say they return an Effect that describes an operation, rather than immediately executing an operation.

### Moving checkUserSession to Redux-Saga

In our application, we need to get the user's status when they log in. In the previous implementation, we used the Firebase API's **`onAuthStateChangedListener`** to listen for changes in the user's authentication status. However, while this Listener method can work, it is not convenient for us to manage and monitor state. To solve this problem, we decided to move this asynchronous operation into Redux-Saga.

First, we create a function named **`getCurrentUser`**, which returns a new Promise:

```jsx
export const getCurrentUser = () => {
  return new Promise((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(
      auth,
      userAuth => {
        unsubscribe()
        resolve(userAuth)
      },
      reject
    )
  })
}
```

Here, the first argument of **`onAuthStateChanged`** is **`auth`**, which we previously returned with **`getAuth`**, representing the current authentication information. The second function will be executed when the Promise is successfully returned. When the authentication status changes, we immediately execute unsubscribe to cancel listening (to avoid memory leaks) and use the **`resolve`** method to return the user's authentication information. The third argument is executed when rejected, if an error occurs, we use the **`reject`** method to return the error.

Next, we add a few new action types to **`USER_ACTION_TYPES`** to meet our needs:

```jsx
export const USER_ACTION_TYPES = {
  SET_CURRENT_USER: "user/SET_CURRENT_USER",
  GOOGLE_SIGN_IN_START: "user/GOOGLE_SIGN_IN_START",
  CHECK_USER_SESSION: "user/CHECK_USER_SESSION",
  EMAIL_SIGN_IN_START: "user/EMAIL_SIGN_IN_START",
  SIGN_IN_SUCCESS: "user/SIGN_IN_SUCCESS",
  SIGN_IN_FAILED: "user/SIGN_IN_FAILED",
}
```

Then we create the Saga. Our requirement here is to check the current user status, so we first create an **`onCheckUserSession`** saga to bind **`CHECK_USER_SESSION`**. As soon as a CHECK_USER_SESSION action is heard from the user, the **`isUserAuthenticated`** saga is automatically executed.

What **`isUserAuthenticated`** does is to call the **`getCurrentUser`** function to get the user's authentication information, and then update our status based on this information. Here **`call(getCurrentUser)`**, and the returned promise result is put into userAuth. (Of course, if no promise result is returned, it means that the current user is not logged in, then just return directly, so the value of currentUser is still null).

Then, call **`getSnapshotFromUserAuth`** again and pass in **`userAuth`** to get **`userSnapshot`**. This snapshot contains the user information we need. What **`put(signInSuccess)`** does is to send the action to the user reducer again, and update the user data in the snapshot into the store through the reducer. In this way, our store contains our user information.

```jsx
import { takeLatest, put, all, call } from "redux-saga/effects"
import { USER_ACTION_TYPES } from "./user.types"
import { signInSuccess, signInFailed } from "./user.action"
import {
  getCurrentUser,
  createUserDocumentFromAuth,
} from "../../utils/firebase/firebase.utils"

export function* getSnapshotFromUserAuth(userAuth, additionalDetails) {
  try {
    const userSnapshot = yield call(
      createUserDocumentFromAuth,
      userAuth,
      additionalDetails
    )
    yield put(signInSuccess({ id: userSnapshot.id, ...userSnapshot.data() }))
    //Here, due to firebase, id will not exist in snapshot.data(), so we need to extract id separately
  } catch (error) {
    yield put(signInFailed(error))
  }
}

export function* isUserAuthenticated() {
  try {
    const userAuth = yield call(getCurrentUser)
    if (!userAuth) return
    yield call(getSnapshotFromUserAuth, userAuth)
    // yield put(signInSuccess(userAuth));
  } catch (error) {
    yield put(signInFailed(error))
  }
}

export function* onCheckUserSession() {
  yield takeLatest(USER_ACTION_TYPES.CHECK_USER_SESSION, isUserAuthenticated)
}

export function* userSagas() {
  yield all([call(onCheckUserSession)])
}
```

```jsx
export const userReducer = (state = INITIAL_STATE, action) => {
  // console.log(state, action);
  const { type, payload } = action

  switch (type) {
    case USER_ACTION_TYPES.SIGN_IN_SUCCESS:
      return { ...state, currentUser: payload }
    //...

    default:
      return state
  }
}
```

Finally, all we need to do is dispatch the **`checkUserSession`** action in **`app.js`**. In this way, when the component is mounted, **`checkUserSession`** will send a **`USER_ACTION_TYPES.CHECK_USER_SESSION`** action, and it will be received by **`onCheckUserSession`** in user saga through **`takeLatest`**. After that, the process is the same as mentioned above.

```jsx
useEffect(() => {
  dispatch(checkUserSession())
}, [])
```

Of course, let's not forget to add `userSagas` in the root saga for implementation and monitoring:

```jsx
import { all, call } from "redux-saga/effects"

import { categoriesSaga } from "./categories/category.saga"
import { userSagas } from "./user/user.saga"

export function* rootSaga() {
  yield all([call(categoriesSaga), call(userSagas)])
}
```

Let's retrace the entire process once more: `rootSaga` adds `call(userSagas)`, `useEffect` in `app.js` dispatches to `checkUserSession` during mount, which is picked up by `onCheckUserSession`'s `takeLatest`, executing `isUserAuthenticated`; `isUserAuthenticated` calls `getCurrentUser` and receives the returned promise. If the promise exists, it continues to call `getSnapshotFromUserAuth`, passing in `userAuth` as an argument. If successful, it emits a `signInSuccess` action, storing the data that includes an ID as payload into `currentUser`.
