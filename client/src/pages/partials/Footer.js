import React from 'react'

function Footer() {
  return (
    <>
    <footer style={{ textAlign: "center", padding: "10px", background: "#f8f9fa" }}>
      © {new Date().getFullYear()} Expense tracker
    </footer>
    </>
  )
}

export default Footer
