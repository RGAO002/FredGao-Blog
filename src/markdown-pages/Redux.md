---
title: "Redux Thoughts"
date: "2022-08-10"
description: "Redux"
---

## Reducer & useReducer()

在进入 Redux 话题之前，先要介绍一下 Reducer 的概念以及 useReducer 钩子的使用方式。我们首先会在 `**user.context.jsx**` 这个 Context 文件当中进行修改，将原先的 `**useState**` 变成 `**useReducer` 。\*\*

**Reducer** 的概念是一个纯函数，它接受先前的状态和一个 action，并返回新的状态。其最主要的作用在于管理应用的状态，并在发生特定的 action 时，能基于先前的状态返回新的状态。

`**useReducer**` 则是 React 的一种 Hook，它接受一个 reducer 函数和一个初始状态作为参数，返回一个新的状态以及一个与其配套的 dispatch 方法。尤其相较于**`useState`**，其最主要的作用是提供了一种更为复杂或者说更为可控的方式来通过 dispatch action 来更新状态，特别适用于状态逻辑复杂或者同一组件需要操作多个子值的情况。

```jsx
const INITIAL_STATE = {
  isCartOpen: false,
  cartItems: [],
  cartCount: 0,
  cartTotal: 0,
}

const CART_ACTION_TYPES = {
  //定义这样一个object的目的是dispatch时避免type写错
  SET_CART_ITEMS: "SET_CART_ITEMS",
  SET_IS_CART_OPEN: "SET_IS_CART_OPEN",
}

const cartReducer = (state, action) => {
  const { type, payload } = action

  switch (type) {
    case CART_ACTION_TYPES.SET_CART_ITEMS:
      return {
        ...state,
        ...payload,
      }
    case CART_ACTION_TYPES.SET_IS_CART_OPEN:
      return {
        ...state,
        isCartOpen: payload,
      }

    default:
      throw new Error(`Unhandled type of ${type} in cartReducer`)
  }
}
```

在这里，**`state`** 和 **`action`** 是 reducer 函数的两个参数。**`state`** 参数代表当前的状态，**`action`** 参数则代表要执行的动作。**`action`** 包含 **`type`** 和 **`payload`** 两个属性（仅对于本例，实际上 action），其中 **`type`** 是指定进行何种操作，而 **`payload`** 是传递的数据。

```jsx
const updateCartItemsReducer = newCartItems => {
  const newCartCount = newCartItems.reduce((total, cartItem) => {
    return total + cartItem.quantity
  }, 0)

  const newCartTotal = newCartItems.reduce((total, cartItem) => {
    return total + cartItem.price * cartItem.quantity
  }, 0)

  dispatch(
    createAction(CART_ACTION_TYPES.SET_CART_ITEMS, {
      cartItems: newCartItems,
      cartCount: newCartCount,
      cartTotal: newCartTotal,
    })
  )
}
```

上面这段代码创建了一个 **`updateCartItemsReducer`** 函数，它接受一个新的购物车项目数组，计算新的购物车项目数量和总金额，并使用 **`dispatch`** 方法来更新购物车的状态。

```jsx
const [{ cartItems, isCartOpen, cartCount, cartTotal }, dispatch] = useReducer(
  cartReducer,
  INITIAL_STATE
)
```

**`useReducer`** Hook 接受两个参数，第一个参数是 reducer 函数，第二个参数是初始状态。然后，它返回一个新的状态和一个 dispatch 方法。在这里，我们对返回的状态进行了解构，以便直接使用 **`cartItems`**、**`isCartOpen`**、**`cartCount`** 和 **`cartTotal`**。
