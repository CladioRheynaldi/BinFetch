'use client';

import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';

interface ChatMessage {
  id: string;
  pickup_request_id: string;
  sender_id: string;
  sender_name: string;
  message: string;
  created_at: string;
}

interface ChatDrawerProps {
  pickupRequestId: string;
  isOpen: boolean;
  onClose: () => void;
  recipientName: string;
  myUserId: string;
}

export default function ChatDrawer({
  pickupRequestId,
  isOpen,
  onClose,
  recipientName,
  myUserId,
}: ChatDrawerProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [recipient, setRecipient] = useState(recipientName);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setRecipient(recipientName);
  }, [recipientName]);

  
  const loadMessages = async () => {
    setLoading(true);
    setError('');
    const token = localStorage.getItem('bf_token');
    if (!token) return;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/chat/${pickupRequestId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        if (data && typeof data === 'object' && !Array.isArray(data)) {
          setMessages(data.messages || []);
          const role = localStorage.getItem('bf_role');
          if (role === 'staff') {
            setRecipient(data.customerName || 'Customer');
          } else {
            setRecipient(data.staffName || 'Staff Member');
          }
        } else {
          setMessages(data);
        }
      } else {
        const errData = await response.json();
        setError(errData.message || 'Failed to load messages.');
      }
    } catch (err) {
      setError('Cannot connect to chat server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && pickupRequestId) {
      loadMessages();
    }
  }, [isOpen, pickupRequestId]);

  
  useEffect(() => {
    if (!isOpen || !pickupRequestId || !supabase) return;

    const channel = supabase
      .channel(`chat_room_${pickupRequestId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `pickup_request_id=eq.${pickupRequestId}`,
        },
        (payload: any) => {
          const incoming = payload.new as ChatMessage;
          setMessages((prev) => {
            
            if (prev.some((m) => m.id === incoming.id)) return prev;
            return [...prev, incoming];
          });
        }
      )
      .subscribe();

    return () => {
      if (supabase) {
        supabase.removeChannel(channel);
      }
    };
  }, [isOpen, pickupRequestId]);

  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const token = localStorage.getItem('bf_token');
    const senderName = localStorage.getItem('bf_full_name') || (localStorage.getItem('bf_role') === 'staff' ? 'Staff' : 'Customer');
    if (!token) return;

    const messageText = newMessage;
    setNewMessage(''); 

    
    const tempId = Math.random().toString();
    const tempMsg: ChatMessage = {
      id: tempId,
      pickup_request_id: pickupRequestId,
      sender_id: myUserId,
      sender_name: senderName,
      message: messageText,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempMsg]);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/chat/${pickupRequestId}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: messageText }),
      });

      if (!response.ok) {
        
        setMessages((prev) => prev.filter((m) => m.id !== tempId));
        setError('Failed to send message.');
      } else {
        const savedMsg = await response.json();
        
        setMessages((prev) =>
          prev.map((m) => (m.id === tempId ? savedMsg : m))
        );
      }
    } catch (err) {
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
      setError('Connection error. Failed to send.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-[90] flex justify-end animate-fade-in">
      {}
      <div className="absolute inset-0" onClick={onClose} />

      {}
      <div className="relative w-full sm:w-[460px] h-full bg-[#faf6eb]/98 border-l border-green-900/10 shadow-2xl flex flex-col z-[100] animate-slide-in">
        
        {}
        <div className="p-5 border-b border-green-900/10 bg-gradient-to-r from-green-950 to-green-900 text-white flex items-center justify-between shadow-sm">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-emerald-400">
              Active Chat Session
            </span>
            <h2 className="font-display text-lg font-bold truncate max-w-[280px]">
              {recipient}
            </h2>
            <span className="text-[10px] text-gray-300 font-mono mt-0.5 truncate max-w-[250px]">
              ID: {pickupRequestId}
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 bg-white/10 hover:bg-white/20 transition rounded-full flex items-center justify-center font-bold text-white text-base"
          >
            ✕
          </button>
        </div>

        {}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-pattern flex flex-col">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs text-center font-semibold animate-pulse">
              {error}
            </div>
          )}

          {loading && messages.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-500 gap-2">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-700"></div>
              <span className="text-xs font-semibold">Loading messages...</span>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 text-center space-y-3 px-6">
              <div className="text-4xl">💬</div>
              <p className="text-xs font-medium leading-relaxed">
                No messages yet. Send a message to start chatting with your assigned partner!
              </p>
            </div>
          ) : (
            messages.map((msg) => {
              const isMe = msg.sender_id === myUserId;
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} space-y-1 animate-fade-in`}
                >
                  <span className="text-[10px] text-gray-400 font-bold px-1 uppercase tracking-wide">
                    {msg.sender_name}
                  </span>
                  
                  <div
                    className={`px-4 py-2.5 text-sm rounded-2xl max-w-[82%] shadow-xs leading-relaxed ${
                      isMe
                        ? 'bg-green-700 text-white rounded-tr-none ml-auto'
                        : 'bg-white border border-gray-100 text-gray-800 rounded-tl-none mr-auto'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.message}</p>
                  </div>
                  
                  <span className="text-[9px] text-gray-400 px-1 font-semibold">
                    {new Date(msg.created_at).toLocaleTimeString(undefined, {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {}
        <form
          onSubmit={handleSend}
          className="p-4 bg-white/70 backdrop-blur-md border-t border-green-900/10 flex gap-3 items-center shadow-lg"
        >
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-4 py-3 rounded-2xl border border-green-900/15 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-green-700 text-gray-800 font-medium placeholder-gray-400 shadow-inner"
          />
          <button
            type="submit"
            className="w-11 h-11 bg-green-700 hover:bg-green-800 text-white flex items-center justify-center rounded-2xl transition-all duration-300 shadow hover:scale-105 active:scale-95 flex-shrink-0"
          >
            <span className="text-lg">✈️</span>
          </button>
        </form>

      </div>
    </div>
  );
}
