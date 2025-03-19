import React from 'react'

function Footer() {
    return (
        <>
            <div className="text-center py-3 mt-auto">
                <p>&copy; {new Date().getFullYear()} expense tracker. All rights reserved.</p>
            </div>
        </>
    )
}

export default Footer
