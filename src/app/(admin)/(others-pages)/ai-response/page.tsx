"use client"

import React, { useEffect, useState } from 'react'

export default function AiResponse() {
  const [currentResponseMessage, setCurrentResponseMessage] = useState('')
  const [currentResponseComment, setCurrentResponseComment] = useState('')
  const [newResponseMessage, setNewResponseMessage] = useState('')
  const [newResponseComment, setNewResponseComment] = useState('')
  const [responseType, setResponseType] = useState<'message' | 'comment'>('message')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const currentResponse = responseType === 'message' ? currentResponseMessage : currentResponseComment
  const newResponse = responseType === 'message' ? newResponseMessage : newResponseComment
  
  const handleNewResponseChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (responseType === 'message') {
      setNewResponseMessage(e.target.value)
    } else {
      setNewResponseComment(e.target.value)
    }
  }

  const handleReset = () => {
    if (responseType === 'message') {
      setNewResponseMessage('')
    } else {
      setNewResponseComment('')
    }
  }

  const fetchCurrentMessageResponse=async()=>{
    try{
        const url="https://facebook-chatbot-rj6n.onrender.com/page/ai-response-message"
        const response=await fetch(url,{
                method:"GET",
                credentials:"include",
                headers: { 'Content-Type': 'application/json' }
            }
        )

        if(!response.ok){
            throw new Error(`Failed to fetch message response: ${response.statusText}`)
        }

        const data=await response.json()

        setCurrentResponseMessage(data.customPrompt)
    }catch(err){
        console.error(err)
    }
  }

  const fetchCurrentCommentResponse=async()=>{
    try{
        const url="https://facebook-chatbot-rj6n.onrender.com/page/ai-response-comment"
        const response=await fetch(url,{
                method:"GET",
                credentials:"include",
                headers: { 'Content-Type': 'application/json' }
            }
        )

        if(!response.ok){
            throw new Error(`Failed to fetch comment response: ${response.statusText}`)
        }

        const data=await response.json()

        setCurrentResponseComment(data.customPrompt)
    }catch(err){
        console.error(err)
    }
  }

  useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoading(true)
      setError('')
      try {
        await Promise.all([
          fetchCurrentMessageResponse(),
          fetchCurrentCommentResponse()
        ])
      } catch (err) {
        console.error("Error fetching responses:", err)
        setError('Failed to load responses')
      } finally {
        setIsLoading(false)
      }
    }

    fetchInitialData()
  }, [])

//   useEffect(()=>{
//     if(responseType=="message" && !currentResponseMessage){
//         fetchCurrentMessageResponse()
//     }else if(responseType=="comment" && !currentResponseComment){
//         fetchCurrentCommentResponse()
//     }
//   },[responseType])
  useEffect(() => {
    if (responseType === "message" && !currentResponseMessage) {
      fetchCurrentMessageResponse()
    } else if (responseType === "comment" && !currentResponseComment) {
      fetchCurrentCommentResponse()
    }
  }, [responseType, currentResponseMessage, currentResponseComment]) // Added missing dependencies

  const handleUpdateResponse=async()=>{
    if(responseType=="comment" && newResponseComment.trim()==""){
        return
    }

    if(responseType=="message" && newResponseMessage.trim()==""){
        return 
    }

    try{
        const url="https://facebook-chatbot-rj6n.onrender.com/page/ai-response"
        const response=await fetch(url,{
            method:"PUT",
            body:JSON.stringify({newResponse, type:responseType}),
            credentials:"include",
            headers: { 'Content-Type': 'application/json' }
        })

        if(!response.ok){
            throw new Error(`Failed to fetch updater response: ${response.statusText}`)
        }

        const data=await response.json()
        console.log(data)

        if(data.type=="comment"){
            setCurrentResponseComment(data.newMessage)
        }else if(data.type=="message"){
            setCurrentResponseMessage(data.newMessage)
        }
    }catch(err){
        console.error("Error fetching responses:", err)
        setError('Failed to update responses')
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 dark:border-red-800 dark:bg-red-900/10">
        <div className="flex items-center gap-3">
          <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h3 className="text-lg font-medium text-red-900 dark:text-red-200">{error}</h3>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Title Section */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
              AI Response Management
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
                Update your AI&apos;s response patterns and behaviors {/* Fixed unescaped entity */}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-sm font-medium ${
              responseType === 'message' 
                ? 'text-blue-600 dark:text-blue-400' 
                : 'text-gray-500 dark:text-gray-400'
            }`}>
              Message
            </span>
            <button
              onClick={() => setResponseType(prev => prev === 'message' ? 'comment' : 'message')}
              className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              style={{
                backgroundColor: responseType === 'message' ? '#3b82f6' : '#6b7280'
              }}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  responseType === 'message' ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <span className={`text-sm font-medium ${
              responseType === 'comment' 
                ? 'text-blue-600 dark:text-blue-400' 
                : 'text-gray-500 dark:text-gray-400'
            }`}>
              Comment
            </span>
          </div>
        </div>
      </div>

      {/* Current Response Section */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
        <div className="mb-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Current {responseType === 'message' ? 'Message' : 'Comment'} Response Pattern
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            This is how your AI currently responds to {responseType}s
          </p>
          <textarea
            value={currentResponse}
            readOnly
            className="w-full h-48 rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 
              text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none 
              focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 
              dark:text-white dark:placeholder-gray-400"
            placeholder={`Current AI ${responseType} response pattern...`}
          />
        </div>
      </div>

      {/* New Response Section */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
        <div className="mb-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            New {responseType === 'message' ? 'Message' : 'Comment'} Response Pattern
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Define how you want your AI to respond to {responseType}s going forward
          </p>
          <textarea
            value={newResponse}
            onChange={handleNewResponseChange}
            className="w-full h-48 rounded-lg border border-gray-300 bg-white px-4 py-3 
              text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none 
              focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 
              dark:text-white dark:placeholder-gray-400"
            placeholder={`Enter new AI ${responseType} response pattern...`}
          />
        </div>

        <div className="flex justify-end space-x-4">
          <button
            onClick={handleReset}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border 
              border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 
              focus:ring-offset-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-300 
              dark:border-gray-600 dark:hover:bg-gray-700"
          >
            Reset
          </button>
          <button
            onClick={handleUpdateResponse}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 
              rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 
              focus:ring-offset-2 focus:ring-blue-500 dark:hover:bg-blue-800"
          >
            Update {responseType === 'message' ? 'Message' : 'Comment'} Response
          </button>
        </div>
      </div>
    </div>
  )
}
