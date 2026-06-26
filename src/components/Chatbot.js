// components/Chatbot.js
import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { getChatbotResponses } from '../api/bikeApi';
import './Chatbot.css';

const Chatbot = ({ language, translations }) => {
  const location = useLocation();

  const [isOpen, setIsOpen] = useState(false);
  const [responsesByLang, setResponsesByLang] = useState(null);
  const [messages, setMessages] = useState([
    {
      type: 'bot',
      text: language === 'english' ? 'Hello! I\'m BikeBot, your motorcycle assistant. How can I help you today?' : 'ආයුබෝවන්! මම BikeBot, ඔබේ මෝටර් සයිකල් සහායකයා. අද මම ඔබට කෙසේ උදව් කළ හැකිද?',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    let mounted = true;
    getChatbotResponses()
      .then((data) => {
        if (!mounted) return;
        setResponsesByLang(data);
      })
      .catch((e) => {
        console.error(e);
        if (!mounted) return;
        setResponsesByLang(null);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const handleSendMessage = () => {
    if (inputMessage.trim() === '') return;

    const userMessage = {
      type: 'user',
      text: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate bot typing delay
    setTimeout(() => {
      const botResponse = getBotResponse(inputMessage, language);
      const botMessage = {
        type: 'bot',
        text: botResponse,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 1000);
  };

  const getBotResponse = (message, language) => {
    const lowerMessage = message.toLowerCase();
    const responses = responsesByLang?.[language];

    if (!responses) {
      return language === 'english'
        ? 'Backend chatbot responses are not available right now. Please try again.'
        : 'චැට්බොට් තොරතුරු මේ මොහොතේ ලබාගත නොහැක. කරුණාකර නැවත උත්සාහ කරන්න.';
    }

    // Check for specific keywords
    if (lowerMessage.includes('spare') || lowerMessage.includes('part')) {
      return responses.spareParts;
    }
    if (lowerMessage.includes('helmet') || lowerMessage.includes('gear')) {
      return responses.gear;
    }
    if (lowerMessage.includes('price') || lowerMessage.includes('cost')) {
      return responses.pricing;
    }
    if (lowerMessage.includes('sell') || lowerMessage.includes('post')) {
      return responses.selling;
    }
    if (lowerMessage.includes('buy') || lowerMessage.includes('purchase')) {
      return responses.buying;
    }
    if (lowerMessage.includes('help') || lowerMessage.includes('support')) {
      return responses.help;
    }
    if (lowerMessage.includes('contact') || lowerMessage.includes('phone')) {
      return responses.contact;
    }
    if (lowerMessage.includes('thank') || lowerMessage.includes('thanks')) {
      return responses.thanks;
    }
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
      return responses.greeting;
    }

    // Default response
    return responses.default;
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  const quickReplies = [
    { text: language === 'english' ? 'Show me bikes' : 'මට බයිසිකල් පෙන්වන්න', value: 'show bikes' },
    { text: language === 'english' ? 'Spare parts' : 'අමතර කොටස්', value: 'spare parts' },
    { text: language === 'english' ? 'Safety gear' : 'ආරක්ෂණ උපකරණ', value: 'safety gear' },
    { text: language === 'english' ? 'Contact support' : 'සහාය අමතන්න', value: 'contact support' }
  ];

  // Hide chatbot on post-ad page to prevent overlapping with form footer controls
  if (location.pathname.replace(/\/+$/, '') === '/post-ad') {
    return null;
  }

  return (
    <div className="chatbot-container">
      {/* Chat Toggle Button */}
      <button 
        className={`chat-toggle ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? (
          <span className="close-icon">✕</span>
        ) : (
          <div className="engine-logo">
            <svg viewBox="0 0 100 100" className="engine-icon">
              <defs>
                <linearGradient id="engineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FFD600" />
                  <stop offset="100%" stopColor="#FFC107" />
                </linearGradient>
              </defs>
              {/* Engine Block */}
              <rect x="20" y="30" width="60" height="40" fill="url(#engineGradient)" stroke="#333" strokeWidth="2" rx="5"/>
              {/* Cylinder Head */}
              <rect x="25" y="20" width="50" height="15" fill="#FFC107" stroke="#333" strokeWidth="2" rx="3"/>
              {/* Pistons */}
              <circle cx="35" cy="27" r="4" fill="#333"/>
              <circle cx="50" cy="27" r="4" fill="#333"/>
              <circle cx="65" cy="27" r="4" fill="#333"/>
              {/* Exhaust Pipe */}
              <rect x="80" y="45" width="15" height="8" fill="#888" stroke="#333" strokeWidth="1" rx="4"/>
              {/* Air Filter */}
              <rect x="5" y="42" width="15" height="12" fill="#666" stroke="#333" strokeWidth="1" rx="2"/>
              {/* Spark Plug Wires */}
              <line x1="35" y1="20" x2="35" y2="15" stroke="#333" strokeWidth="2"/>
              <line x1="50" y1="20" x2="50" y2="15" stroke="#333" strokeWidth="2"/>
              <line x1="65" y1="20" x2="65" y2="15" stroke="#333" strokeWidth="2"/>
              {/* Oil Pan */}
              <rect x="25" y="70" width="50" height="10" fill="#444" stroke="#333" strokeWidth="1" rx="5"/>
              {/* Cooling Fins */}
              <line x1="20" y1="35" x2="15" y2="35" stroke="#333" strokeWidth="1"/>
              <line x1="20" y1="40" x2="15" y2="40" stroke="#333" strokeWidth="1"/>
              <line x1="20" y1="45" x2="15" y2="45" stroke="#333" strokeWidth="1"/>
              <line x1="20" y1="50" x2="15" y2="50" stroke="#333" strokeWidth="1"/>
            </svg>
          </div>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="chat-window">
          {/* Chat Header */}
          <div className="chat-header">
            <div className="bot-info">
              <div className="bot-avatar">
                <svg viewBox="0 0 50 50" className="bot-engine-icon">
                  <defs>
                    <linearGradient id="botGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#FFD600" />
                      <stop offset="100%" stopColor="#FFC107" />
                    </linearGradient>
                  </defs>
                  <rect x="10" y="15" width="30" height="20" fill="url(#botGradient)" stroke="#333" strokeWidth="1" rx="3"/>
                  <rect x="12" y="10" width="26" height="8" fill="#FFC107" stroke="#333" strokeWidth="1" rx="2"/>
                  <circle cx="18" cy="14" r="2" fill="#333"/>
                  <circle cx="25" cy="14" r="2" fill="#333"/>
                  <circle cx="32" cy="14" r="2" fill="#333"/>
                  <rect x="40" y="22" width="8" height="4" fill="#888" stroke="#333" strokeWidth="1" rx="2"/>
                  <rect x="2" y="21" width="8" height="6" fill="#666" stroke="#333" strokeWidth="1" rx="1"/>
                  <rect x="12" y="35" width="26" height="5" fill="#444" stroke="#333" strokeWidth="1" rx="3"/>
                </svg>
              </div>
              <div className="bot-details">
                <h4>BikeBot</h4>
                <span className="online-status">
                  <span className="online-dot"></span>
                  {translations.online}
                </span>
              </div>
            </div>
            <button className="minimize-btn" onClick={() => setIsOpen(false)}>
              <span>―</span>
            </button>
          </div>

          {/* Chat Messages */}
          <div className="chat-messages">
            {messages.map((message, index) => (
              <div key={index} className={`message ${message.type}`}>
                {message.type === 'bot' && (
                  <div className="message-avatar">
                    <svg viewBox="0 0 30 30" className="small-engine-icon">
                      <rect x="5" y="8" width="20" height="14" fill="#FFD600" stroke="#333" strokeWidth="1" rx="2"/>
                      <rect x="6" y="5" width="18" height="6" fill="#FFC107" stroke="#333" strokeWidth="1" rx="1"/>
                      <circle cx="10" cy="8" r="1" fill="#333"/>
                      <circle cx="15" cy="8" r="1" fill="#333"/>
                      <circle cx="20" cy="8" r="1" fill="#333"/>
                    </svg>
                  </div>
                )}
                <div className="message-content">
                  <div className="message-bubble">
                    {message.text}
                  </div>
                  <div className="message-time">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="message bot">
                <div className="message-avatar">
                  <svg viewBox="0 0 30 30" className="small-engine-icon">
                    <rect x="5" y="8" width="20" height="14" fill="#FFD600" stroke="#333" strokeWidth="1" rx="2"/>
                    <rect x="6" y="5" width="18" height="6" fill="#FFC107" stroke="#333" strokeWidth="1" rx="1"/>
                    <circle cx="10" cy="8" r="1" fill="#333"/>
                    <circle cx="15" cy="8" r="1" fill="#333"/>
                    <circle cx="20" cy="8" r="1" fill="#333"/>
                  </svg>
                </div>
                <div className="message-content">
                  <div className="message-bubble typing">
                    <div className="typing-indicator">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Replies */}
          <div className="quick-replies">
            {quickReplies.map((reply, index) => (
              <button
                key={index}
                className="quick-reply"
                onClick={() => {
                  setInputMessage(reply.value);
                  handleSendMessage();
                }}
              >
                {reply.text}
              </button>
            ))}
          </div>

          {/* Chat Input */}
          <div className="chat-input">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={translations.typePlaceholder}
              className="message-input"
            />
            <button 
              className="send-button"
              onClick={handleSendMessage}
              disabled={inputMessage.trim() === ''}
            >
              <svg viewBox="0 0 24 24" className="send-icon">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" fill="currentColor"/>
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chatbot;
