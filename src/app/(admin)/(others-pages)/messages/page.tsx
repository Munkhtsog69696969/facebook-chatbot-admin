"use client"

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

interface UserList {
  users:[
    {
      email:string
      id:string
      name:string
      picture:{
        data:{
          height:number
          is_silhouette:boolean
          url:string
          width:number
        }
      }
    }
  ]
}

export default function Messages() {
  const [userList, setUserList] = useState<UserList | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(()=>{
    const fetchUsers=async()=>{
      try{
        setLoading(true)

        const response=await fetch('https://facebook-chatbot-rj6n.onrender.com/messenger/users', {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          }
        })

        const data=await response.json()
        // console.log(data)

        if(response.ok){
          setUserList(data)
        }else{
          console.error('Error fetching users:', data)
        }
      }catch(err){
        console.error(err)
      }finally{
        setLoading(false)
      }
    }

    fetchUsers()
  },[])

  console.log(userList)

  return (
    <div>
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
        <h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-7">
          Messages
        </h3>

        {loading ? (
          <div className="flex items-center justify-center h-96">
            <svg
              className="animate-spin h-10 w-10 text-blue-500"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </div>
        ) : userList?.users && userList.users.length > 0 ? (
          <div className="space-y-4">
            {userList.users.map((user) => (
              <Link
                href={`/messages/${user.id}`}
                key={user.id}
                className="flex items-center gap-4 p-4 rounded-lg hover:bg-gray-50 
                  dark:hover:bg-gray-800/50 transition-colors duration-200"
              >
                <div className="relative h-12 w-12 flex-shrink-0">
                  {user.picture ? (
                    <Image
                      src={user.picture.data.url}
                      alt={user.name}
                      width={48}
                      height={48}
                      className="rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900 
                      flex items-center justify-center">
                      <span className="text-lg font-semibold text-blue-600 
                        dark:text-blue-300">
                        {user.name.charAt(0)}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white 
                    truncate">
                    {user.name}
                  </h4>
                  {user.email && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                      {user.email}
                    </p>
                  )}
                </div>

                <svg
                  className="h-5 w-5 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 
              rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
              <svg
                className="h-8 w-8 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 
                    9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 
                    4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
              No messages yet
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Start a conversation to see your messages here
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
