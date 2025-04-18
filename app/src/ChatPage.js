import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const ChatPage = () => {
  const { complaintId } = useParams();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);

  const fetchChatMessages = useCallback(async () => {
    try {
      const response = await fetch(`http://localhost:5000/get-chat-messages/${complaintId}`);
      if (response.ok) {
        const data = await response.json();
        setMessages(data);
      } else {
        console.error('Failed to fetch chat messages');
      }
    } catch (error) {
      console.error('Error fetching chat messages:', error);
    }
  }, [complaintId]);

  useEffect(() => {
    fetchChatMessages();
    const intervalId = setInterval(fetchChatMessages, 5000); // Poll for new messages every 5 seconds
    return () => clearInterval(intervalId);
  }, [fetchChatMessages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (newMessage.trim() === '') return;
    try {
      const response = await fetch(`http://localhost:5000/send-chat-message/${complaintId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: newMessage, sender: complaintId }),
      });
      if (response.ok) {
        setNewMessage('');
        fetchChatMessages();
      } else {
        console.error('Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleBackClick = () => {
    navigate(-1);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: 'auto' }}>
      <button onClick={handleBackClick} style={{ marginBottom: '20px' }}>Back</button>
      <h2>Chat for Complaint {complaintId}</h2>
      <div style={{
        height: '400px',
        overflowY: 'scroll',
        border: '1px solid #ccc',
        padding: '10px',
        marginBottom: '20px'
      }}>
        {messages.map((msg, index) => (
          <div key={index} style={{
            marginBottom: '10px',
            textAlign: msg.sender === 'official' ? 'right' : 'left'
          }}>
            <strong>{msg.sender}: </strong>
            {msg.content}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div style={{ display: 'flex' }}>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          style={{ flexGrow: 1, marginRight: '10px', padding: '5px' }}
          placeholder="Type your message..."
        />
        <button onClick={handleSendMessage}>Send</button>
      </div>
    </div>
  );
};

export default ChatPage;