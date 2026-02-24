import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  time: string;
}

const Support = () => {
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);

  const today = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  const handleSend = () => {
    if (!message.trim()) return;
    
    const newMessage: Message = {
      id: Date.now().toString(),
      text: message,
      isUser: true,
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    };
    
    setMessages([...messages, newMessage]);
    setMessage('');

    // Simulate support response
    setTimeout(() => {
      const supportResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: "Thanks for reaching out! We'll get back to you shortly.",
        isUser: false,
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, supportResponse]);
    }, 1000);
  };

  return (
    <div className="w-full min-h-screen bg-[#1a1a1a] flex flex-col relative overflow-hidden">
      {/* Background pattern */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `url('/logo/Fast bite transparent I.png')`,
          backgroundSize: '60px 60px',
          backgroundRepeat: 'repeat'
        }}
      />

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between px-4 py-4">
        <div className="flex items-center gap-3">
          <div 
            className="w-12 h-12 rounded-full bg-[#FF6B35] flex items-center justify-center cursor-pointer"
            onClick={() => navigate(-1)}
          >
            <img 
              src="/logo/Fast bite transparent I.png" 
              alt="Fast Bites" 
              className="w-8 h-8 object-contain"
            />
          </div>
          <span className="text-white font-semibold text-lg">Fast Bites Support</span>
        </div>
        <button className="w-12 h-12 rounded-full bg-[#FF6B35] flex items-center justify-center">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
        </button>
      </div>

      {/* Chat area */}
      <div className="relative z-10 flex-1 flex flex-col px-4 pb-24 overflow-y-auto">
        {/* Date pill */}
        <div className="flex justify-center my-4">
          <div className="px-4 py-2 bg-[#2a2a2a] rounded-full">
            <span className="text-white text-sm">{today}</span>
          </div>
        </div>

        {/* Messages */}
        <div className="flex flex-col gap-3">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] px-4 py-3 rounded-2xl ${
                  msg.isUser
                    ? 'bg-[#3a3a3a] text-white rounded-br-sm'
                    : 'bg-[#FF6B35] text-white rounded-bl-sm'
                }`}
              >
                <p className="text-sm">{msg.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Input area */}
      <div className="fixed bottom-0 left-0 right-0 z-20 px-4 py-4 bg-[#1a1a1a]">
        <div className="flex items-center gap-3">
          <div className="flex-1 flex items-center bg-[#2a2a2a] rounded-full px-4 py-3">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Message"
              className="flex-1 bg-transparent text-white placeholder-gray-500 outline-none text-sm"
            />
            <button className="text-gray-400 ml-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>
          <button 
            onClick={handleSend}
            className="w-12 h-12 rounded-full bg-[#FF6B35] flex items-center justify-center"
          >
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Support;
