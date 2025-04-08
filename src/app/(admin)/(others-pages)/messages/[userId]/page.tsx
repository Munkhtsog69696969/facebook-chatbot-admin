"use client"

import { useParams } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { format } from "date-fns"
import { useSocket } from "@/context/SocketContext"

interface PrivateMessages {
    data: [
        {
            id: string,
            messages: {
                data: Message[],
                paging: {
                    cursors: {
                        before: string,
                        after: string
                    },
                    next: string
                }
            }
        }
    ]
}

interface Message {
    created_time: string,
    from: {
        email: string,
        id: string,
        name: string
    },
    id: string,
    message: string,
    to: {
        data: [
            {
                email: string,
                id: string,
                name: string
            }
        ]
    }
}

interface PaginationMessages {
    data: Message[],
    paging: {
        cursors: {
            before: string,
            after: string
        },
        next: string
    }
}

interface Pagination {
    cursors: {
        before: string,
        after: string
    },
    next: string
}

interface socketMessage {
    userText : string,
    data : {
        message_id:string,
        recipient_id:string,
    },
    created_time : string,
}

export default function PrivateMessage() {
    const { socket } = useSocket()
    const params = useParams()
    const userId = params.userId as string
    const [messages, setMessages] = useState<Message[] | null>([])
    const [nextPagingUrl, setNextPagingUrl] = useState<Pagination | null>(null)
    const [loading, setLoading] = useState(false)
    const [newMessage, setNewMessage] = useState<string>("")
    const containerRef = useRef<HTMLDivElement>(null)
    const [socketMessage, setSocketMessage] = useState<socketMessage[] | null>(null)
    const [editingMessage, setEditingMessage] = useState<string | null>(null)
    const [editText, setEditText] = useState("")

    const scrollToBottom = () => {
        if (containerRef.current) {
            containerRef.current.scrollTop = containerRef.current.scrollHeight
        }
    }

    const fetchInitialUserMessages = async() => {
        try {
            setLoading(true)
            const url = new URL(`https://facebook-chatbot-rj6n.onrender.com/messenger/messages/${userId}`)
        
            const res = await fetch(url.toString(), {
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                }
            })
    
            const data: PrivateMessages = await res.json()
            // console.log("Initial fetch data", data)
            // Reverse the messages array to show oldest first
            setMessages(data.data[0].messages.data.reverse())
            setNextPagingUrl(data.data[0].messages.paging)
            setTimeout(scrollToBottom, 100) 
            // scrollToBottom()
        } catch (error) {
            console.error('Error fetching messages:', error)
        } finally {
            setLoading(false)
        }       
    }
    
    async function getNextChats() {
        if (!nextPagingUrl?.next || loading) return
        
        try {
            setLoading(true)
            const url = new URL(nextPagingUrl.next)
            const prevHeight = containerRef.current?.scrollHeight || 0
    
            const res = await fetch(url.toString(), {
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            const data: PaginationMessages = await res.json()
            
            if (data.data) {
                // First reverse the new messages to maintain chronological order
                const newMessages = [...data.data].reverse()
                
                // Then merge with existing messages without reversing them again
                setMessages(prev => prev ? [...newMessages, ...prev] : newMessages)
                setNextPagingUrl(data.paging)
                
                // Maintain scroll position after loading more messages
                setTimeout(() => {
                    if (containerRef.current) {
                        const newHeight = containerRef.current.scrollHeight
                        containerRef.current.scrollTop = newHeight - prevHeight
                    }
                }, 100)
            }
        } catch (error) {
            console.error('Error fetching more messages:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        const container = containerRef.current
        if (!container) return

        const handleScroll = () => {
            if (container.scrollTop === 0 && !loading && nextPagingUrl?.next) {
                getNextChats()
            }
        }

        container.addEventListener('scroll', handleScroll)
        return () => container.removeEventListener('scroll', handleScroll)
    }, [loading, nextPagingUrl])

    useEffect(() => {
        if (userId) {
            fetchInitialUserMessages()
        }
    }, [userId])

    useEffect(()=>{
        if(socket){
            socket.on("page-sent-message", (message: socketMessage) => {
                message.created_time= new Date().toISOString()
                setSocketMessage(prev => prev ? [...prev, message] : [message])
                setTimeout(scrollToBottom, 100) 
            })

            socket.on("user-sent-message",(message:socketMessage)=>{
                message.created_time= new Date().toISOString()
                // console.log("user-sent-message", message)
                setSocketMessage(prev => prev ? [...prev, message] : [message])
                setTimeout(scrollToBottom, 100) 
            })
        }

    },[socket])

    const sendMessage=async()=>{
        try {
            const url = new URL(`https://facebook-chatbot-rj6n.onrender.com/messenger/messages/${userId}`)
            const res = await fetch(url.toString(), {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({message: newMessage})
            })
    
            const data = await res.json()
            // console.log("Send message data", data)
            setNewMessage("") 
        } catch (error) {
            console.error('Error sending message:', error)
        }
    }

    const handleEditMessage = (messageId: string, currentText: string) => {
        setEditingMessage(messageId);
        setEditText(currentText);
    };

    const handleDeleteMessage = (messageId: string) => {
        console.log('Delete message:', messageId);
        // Delete logic will go here
    };

    const handleSaveEdit = (messageId: string) => {
        console.log('Save edit:', messageId, editText);
        setEditingMessage(null);
        setEditText("");
        // Save edit logic will go here
    };

    const handleCancelEdit = () => {
        setEditingMessage(null);
        setEditText("");
    };

    // console.log(messages)

    return (
        <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
            <div className="border-b border-gray-200 dark:border-gray-800 p-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Messages</h2>
            </div>
            
            <div 
                ref={containerRef} 
                className="h-[calc(100vh-280px)] overflow-y-auto p-4 space-y-4 [&::-webkit-scrollbar]:w-2 
                [&::-webkit-scrollbar-track]:bg-transparent
                [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full
                dark:[&::-webkit-scrollbar-thumb]:bg-gray-600
                hover:[&::-webkit-scrollbar-thumb]:bg-gray-400
                dark:hover:[&::-webkit-scrollbar-thumb]:bg-gray-500"
            >
                {loading && (
                    <div className="text-center py-2">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                    </div>
                )}

                {messages?.map((message) => (
                    <div
                        key={message.id}
                        className={`flex ${
                            message.from.id === userId ? 'justify-start' : 'justify-end'
                        }`}
                    >
                        <div className={`max-w-[70%] rounded-lg p-3 group relative ${
                            message.from.id === userId
                                ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
                                : 'bg-blue-500 text-white'
                        }`}>
                            {message.from.id !== userId && (
                                <div className="absolute right-0 top-0 -mt-2 -mr-2 hidden group-hover:flex space-x-1">
                                    <button 
                                        onClick={() => handleEditMessage(message.id, message.message)}
                                        className="p-1 rounded-full bg-white dark:bg-gray-700 shadow-lg 
                                            hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                                        title="Edit message"
                                    >
                                        <svg className="w-4 h-4 text-gray-600 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                    </button>
                                    <button 
                                        onClick={() => handleDeleteMessage(message.id)}
                                        className="p-1 rounded-full bg-white dark:bg-gray-700 shadow-lg 
                                            hover:bg-red-100 dark:hover:bg-red-900 transition-colors"
                                        title="Delete message"
                                    >
                                        <svg className="w-4 h-4 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>
                            )}
                            {editingMessage === message.id ? (
                                <div className="flex flex-col gap-2">
                                    <input
                                        type="text"
                                        value={editText}
                                        onChange={(e) => setEditText(e.target.value)}
                                        className="rounded px-2 py-1 text-sm text-gray-900 dark:text-white 
                                            bg-white dark:bg-gray-700 border border-gray-200 
                                            dark:border-gray-600 focus:outline-none focus:ring-2 
                                            focus:ring-blue-500"
                                        autoFocus
                                    />
                                    <div className="flex justify-end gap-2">
                                        <button
                                            onClick={() => handleSaveEdit(message.id)}
                                            className="px-2 py-1 text-xs text-white bg-blue-500 
                                                rounded hover:bg-blue-600"
                                        >
                                            Save
                                        </button>
                                        <button
                                            onClick={handleCancelEdit}
                                            className="px-2 py-1 text-xs text-gray-600 dark:text-gray-300 
                                                bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200 
                                                dark:hover:bg-gray-600"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <p className="text-sm break-words">{message.message}</p>
                                    <p className="text-xs mt-1 opacity-70">
                                        {format(new Date(message.created_time), 'MMM d, yyyy HH:mm')}
                                    </p>
                                </>
                            )}
                        </div>
                    </div>
                ))}

                {socketMessage?.map((message: socketMessage, index) => (
                    <div
                        key={index}
                        className={`flex ${
                            message.data.recipient_id === userId ? 'justify-end' : 'justify-start'
                        }`}
                    >
                        <div className={`max-w-[70%] rounded-lg p-3 group relative ${
                            message.data.recipient_id === userId
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
                        }`}>
                            {message.data.recipient_id === userId && (
                                <div className="absolute right-0 top-0 -mt-2 -mr-2 hidden group-hover:flex space-x-1">
                                    <button 
                                        onClick={() => handleEditMessage(message.data.message_id, message.userText)}
                                        className="p-1 rounded-full bg-white dark:bg-gray-700 shadow-lg 
                                            hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                                        title="Edit message"
                                    >
                                        <svg className="w-4 h-4 text-gray-600 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                    </button>
                                    <button 
                                        onClick={() => handleDeleteMessage(message.data.message_id)}
                                        className="p-1 rounded-full bg-white dark:bg-gray-700 shadow-lg 
                                            hover:bg-red-100 dark:hover:bg-red-900 transition-colors"
                                        title="Delete message"
                                    >
                                        <svg className="w-4 h-4 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>
                            )}
                            {editingMessage === message.data.message_id ? (
                                <div className="flex flex-col gap-2">
                                    <input
                                        type="text"
                                        value={editText}
                                        onChange={(e) => setEditText(e.target.value)}
                                        className="rounded px-2 py-1 text-sm text-gray-900 dark:text-white 
                                            bg-white dark:bg-gray-700 border border-gray-200 
                                            dark:border-gray-600 focus:outline-none focus:ring-2 
                                            focus:ring-blue-500"
                                        autoFocus
                                    />
                                    <div className="flex justify-end gap-2">
                                        <button
                                            onClick={() => handleSaveEdit(message.data.message_id)}
                                            className="px-2 py-1 text-xs text-white bg-blue-500 
                                                rounded hover:bg-blue-600"
                                        >
                                            Save
                                        </button>
                                        <button
                                            onClick={handleCancelEdit}
                                            className="px-2 py-1 text-xs text-gray-600 dark:text-gray-300 
                                                bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200 
                                                dark:hover:bg-gray-600"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <p className="text-sm break-words">{message.userText}</p>
                                    <p className="text-xs mt-1 opacity-70">
                                        {format(new Date(message.created_time), 'MMM d, yyyy HH:mm')}
                                    </p>
                                </>
                            )}
                        </div>
                    </div>
                ))}

                {!loading && !messages?.length && (
                    <div className="text-center py-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
                            <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                        </div>
                        <p className="text-gray-500 dark:text-gray-400">No messages found</p>
                    </div>
                )}
            </div>

            <div className="border-t border-gray-200 dark:border-gray-800 p-4">
                <form className="flex items-center gap-2" onSubmit={(e) => {
                    e.preventDefault()
                    if (!newMessage.trim()) return
                    sendMessage()
                }}>
                    <input
                        type="text"
                        placeholder="Type a message..."
                        className="flex-1 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 
                            px-4 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400
                            focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                    />
                    <button
                        type="submit"
                        className="inline-flex items-center justify-center rounded-lg bg-blue-500 px-4 py-2 text-sm 
                            font-medium text-white hover:bg-blue-600 focus:outline-none focus:ring-2 
                            focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
                    >
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                    </button>
                </form>
            </div>
        </div>
    )
}