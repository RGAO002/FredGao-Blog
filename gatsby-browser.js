/**
 * Implement Gatsby's Browser APIs in this file.
 *
 * See: https://www.gatsbyjs.com/docs/reference/config-files/gatsby-browser/
 */

// You can delete this file if you're not using
import React from "react"

export const onInitialClientRender = () => {
  // Check if the theme is already stored in localStorage
  let storedTheme =
    typeof window !== "undefined" && window.localStorage.getItem("theme")

  // If the theme isn't stored, use the default "light" theme
  if (!storedTheme) {
    storedTheme = "light"
  }

  // Update the window.__theme property
  window.__theme = storedTheme

  // Update the localStorage with the chosen theme
  window.__setPreferredTheme = newTheme => {
    window.localStorage.setItem("theme", newTheme)
    window.__theme = newTheme

    window.__onThemeChange()
  }
}

export const wrapRootElement = ({ element }) => {
  // 获取用户的主题偏好
  const theme =
    (typeof window !== "undefined" && window.localStorage.getItem("theme")) ||
    "light"

  window.__theme = theme

  // 创建一个新的 div，作为根元素，并设置 data-theme 属性
  const rootElement = <div data-theme={theme}>{element}</div>

  return rootElement
}
