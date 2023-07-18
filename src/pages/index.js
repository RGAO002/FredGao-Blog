import * as React from "react"
import { Link, graphql } from "gatsby"
import styled from "styled-components"

import Layout from "../components/layout"
import Seo from "../components/seo"

// Styled Components
const HomePageContainer = styled.div`
  margin: 0 auto;
  max-width: 800px;
  padding: 1.5rem 1rem;
`

const PostLink = styled(Link)`
  text-decoration: none;
  color: var(--color-article-title);
  transition: color 0.5s ease-out;
  &:hover {
    color: #007acc;
  }
`

const PostTitle = styled.h2`
  margin-bottom: 0;
`

const PostDate = styled.h3`
  color: #777;
  margin-top: 0;
`

const PostExcerpt = styled.p`
  color: var(--color-post-excerpt);
  transition: color 0.5s ease-out;
`

// Home Page Component
const IndexPage = ({ data }) => (
  <Layout>
    <Seo title="Home" />
    <HomePageContainer>
      <h1>Fred's Thoughts</h1>
      <h4>{data.allMarkdownRemark.totalCount} Posts</h4>
      {data.allMarkdownRemark.edges.map(({ node }) => (
        <article key={node.id}>
          <PostLink to={node.fields.slug}>
            <PostTitle>{node.frontmatter.title}</PostTitle>
          </PostLink>
          <PostDate>{node.frontmatter.date}</PostDate>
          <PostExcerpt>{node.excerpt}</PostExcerpt>
        </article>
      ))}
    </HomePageContainer>
  </Layout>
)

export default IndexPage

export const query = graphql`
  query MyQuery {
    allMarkdownRemark(sort: { fields: [frontmatter___date], order: DESC }) {
      totalCount
      edges {
        node {
          id
          frontmatter {
            title
            date(formatString: "MMMM DD, YYYY")
          }
          fields {
            slug
          }
          excerpt
        }
      }
    }
  }
`
