import React from 'react'

function Footer() {
    return (
        <>
            <footer className="text-center py-3 mt-auto">
                <p>&copy; {new Date().getFullYear()} expense tracker. All rights reserved.</p>
            </footer>
        </>
    )
}

export default Footer
