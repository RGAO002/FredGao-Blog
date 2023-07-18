import React from "react"
import { graphql } from "gatsby"
import Layout from "../components/layout"
import TableOfContents from "../components/TableOfContents"

const BlogPost = ({ data }) => {
  const post = data.markdownRemark
  console.log(post)
  return (
    <Layout>
      <div>
        <h1>{post.frontmatter.title}</h1>
        <h4>{post.frontmatter.date}</h4>
        <TableOfContents tableOfContents={post.tableOfContents} />
        <div dangerouslySetInnerHTML={{ __html: post.html }}></div>
      </div>
    </Layout>
  )
}

export default BlogPost

export const query = graphql`
  query ($slug: String!) {
    markdownRemark(fields: { slug: { eq: $slug } }) {
      html
      tableOfContents
      frontmatter {
        title
        date
      }
    }
  }
`
