import React from "react";
import { Link } from "react-router-dom";
import Footer from "../layouts/Footer";

const ErrorPage = () => {
    return (
        <>
            <div className="d-flex align-items-center flex-column w-100 mt-5 p-5">
                <div className="flex  h-screen items-center justify-center bg-gray-100 w-50 ">
                    <div className="bg-white p-8 rounded-2xl shadow-lg text-center p-5">
                        <h1 className="text-4xl font-bold text-red-500">Oops!</h1>
                        <p className="text-lg text-gray-600 mt-4">Something went wrong.</p>
                        <Link to="/login" className="mt-6 bg-blue-500 px-4 py-2 rounded-lg hover:bg-blue-600">
                            Go to Login page
                        </Link>
                    </div>
                </div>

                <footer className="p-5">
                    <Footer />
                </footer>
            </div>

        </>
    );
};

export default ErrorPage;
