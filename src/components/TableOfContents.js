import React from "react"
import "./TableOfContents.css"

const TableOfContents = ({ tableOfContents }) => (
  <div
    className="table-of-contents"
    dangerouslySetInnerHTML={{ __html: tableOfContents }}
  />
)

export default TableOfContents
