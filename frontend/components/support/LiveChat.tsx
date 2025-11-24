'use client';

import { useState } from 'react';

interface Message {
  id: string;
  sender: 'user' | 'agent';
  text: string;
  timestamp: string;
}

export default function LiveChat() {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', sender: 'agent', text: 'Hello! How can I help you today?', timestamp: '14:30' },
    { id: '2', sender: 'user', text: 'I need help with my proxy connection', timestamp: '14:31' },
    { id: '3', sender: 'agent', text: 'Sure! What issue are you experiencing?', timestamp: '14:31' },
  ]);
  const [input, setInput] = useState('');
  const [online, setOnline] = useState(true);

  const handleSend = () => {
    if (input.trim()) {
      setMessages([...messages, {
        id: Date.now().toString(),
        sender: 'user',
        text: input,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }]);
      setInput('');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 max-w-md mx-auto h-96 flex flex-col">
      <div className="flex justify-between items-center mb-4 pb-4 border-b">
        <h3 className="text-lg font-bold">Live Chat Support</h3>
        <span className={`w-3 h-3 rounded-full ${online ? 'bg-green-500' : 'bg-gray-400'}`}></span>
      </div>

      <div className="flex-1 overflow-y-auto mb-4 space-y-3">
        {messages.map(msg => (
          <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xs px-3 py-2 rounded-lg ${
              msg.sender === 'user'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-800'
            }`}>
              <p className="text-sm">{msg.text}</p>
              <p className={`text-xs mt-1 ${msg.sender === 'user' ? 'text-blue-100' : 'text-gray-500'}`}>
                {msg.timestamp}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Type a message..."
          className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleSend}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Send
        </button>
      </div>
    </div>
  );
}
