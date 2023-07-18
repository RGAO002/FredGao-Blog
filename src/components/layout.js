// Layout.js

import * as React from "react"
import { useStaticQuery, graphql } from "gatsby"
import Header from "./header"
import Toggle from "./Toggle"
import { Helmet } from "react-helmet"
import sun from "../images/sun.png"
import moon from "../images/moon.png"

import "./layout.css"

const Layout = ({ children }) => {
  const [theme, setTheme] = React.useState(null)

  React.useEffect(() => {
    setTheme(window.__theme)
    window.__onThemeChange = () => {
      setTheme(window.__theme)
    }
  }, [])

  const data = useStaticQuery(graphql`
    query SiteTitleQuery {
      site {
        siteMetadata {
          title
        }
      }
    }
  `)

  return (
    <>
      <Helmet
        bodyAttributes={{
          class: theme,
        }}
        meta={[
          {
            name: "theme-color",
            content: theme === "light" ? "#ffa8c5" : "#282c35",
          },
        ]}
      />
      <Header
        siteTitle={data.site.siteMetadata?.title || `Title`}
        theme={theme}
      ></Header>

      <div
        style={{
          margin: `0 auto`,
          maxWidth: `var(--size-content)`,
          padding: `var(--size-gutter)`,
          color: "var(--textNormal)",
          background: "var(--bg)",
          transition: "color 0.2s ease-out, background 0.2s ease-out",
        }}
      >
        <main>{children}</main>
        <footer
          style={{
            marginTop: `var(--space-5)`,
            fontSize: `var(--font-sm)`,
          }}
        >
          © {new Date().getFullYear()} &middot; Built with
          {` `}
          <a
            style={{ color: `var(--color-title)` }}
            href="https://www.gatsbyjs.com"
          >
            Gatsby
          </a>
        </footer>
      </div>
    </>
  )
}

export default Layout
