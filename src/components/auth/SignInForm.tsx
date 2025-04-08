"use client";
import { ChevronLeftIcon } from "@/icons";
import Link from "next/link";
import React, { useState } from "react";

export default function SignInForm() {
  const [isLoading, setIsLoading] = useState(false);

  const handleFacebookSignIn = async () => {
    try {
      setIsLoading(true);
      const backendUrl = "https://facebook-chatbot-rj6n.onrender.com/auth/app_credentials";
      const response = await fetch(backendUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      const { APP_ID } = data;

      if (APP_ID) {
        const redirectUri = encodeURIComponent(`${window.location.origin}/facebook/callback`);
        const scope = encodeURIComponent("pages_show_list,pages_read_engagement,pages_messaging");
        const responseType = encodeURIComponent("token");
        const url = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${APP_ID}&redirect_uri=${redirectUri}&scope=${scope}&response_type=${responseType}`;
        window.open(url, "_self");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-md space-y-6 rounded-2xl bg-white p-8 shadow-lg dark:bg-gray-800">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            Facebook page manager
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Sign in to manage your Facebook pages
          </p>
        </div>

        <div className="space-y-4">
          <button
            onClick={handleFacebookSignIn}
            disabled={isLoading}
            className="relative w-full rounded-lg bg-[#1877F2] px-6 py-3 text-white transition-all
              hover:bg-[#1869D9] focus:outline-none focus:ring-2 focus:ring-[#1877F2] focus:ring-offset-2
              disabled:opacity-70 disabled:cursor-not-allowed"
          >
            <div className="flex items-center justify-center space-x-4">
              {isLoading ? (
                <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              ) : (
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              )}
              <span className="font-semibold">
                {isLoading ? "Connecting..." : "Continue with Facebook"}
              </span>
            </div>
          </button>
        </div>

        <div className="text-center text-sm text-gray-600 dark:text-gray-400">
          Need help? Visit our{' '}
          <a href="#" className="font-medium text-[#1877F2] hover:text-[#1869D9]">
            documentation
          </a>
        </div>
      </div>

      <Link
        href="/"
        className="mt-8 inline-flex items-center text-sm text-gray-500 transition-colors 
          hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
      >
        <ChevronLeftIcon />
        <span>Back to dashboard</span>
      </Link>
    </div>
  );
}