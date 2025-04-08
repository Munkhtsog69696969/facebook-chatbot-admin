"use client"
import React, { useEffect } from "react";

export default function FacebookCallbackForm(){

    //extract short lived token from the URL
    useEffect(() => {
        const url = window.location.href;
        const urlParams = new URLSearchParams(url.split("#")[1]);
        const accessToken : string | null = urlParams.get("access_token");
       
        // console.log("Access Token:", accessToken);

        const sendToken= async (token: string) => {
            try{
                const response=await fetch("https://facebook-chatbot-rj6n.onrender.com/auth/set-cookie", {
                    method: "POST",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ access_token: token }),
                });
                if (!response.ok) {
                    throw new Error("Network response was not ok");
                }

                const data = await response.json();
                console.log("Response from server:", data);
                
                if(response.status === 200) {
                    window.location.href = "/";
                }

            }catch(err){
                console.error(err);
            }
        }

        if (accessToken) {
            sendToken(accessToken)
        } else {
            console.error("Access token not found in the URL.");
        }
    }, []);

    return (
        <div>
            Facebook Callback
        </div>
    )
}