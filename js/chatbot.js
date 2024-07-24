document.addEventListener('DOMContentLoaded', () => {
    const chatContainer = document.querySelector('.chat-container');
    const chatInput = document.querySelector('.chat-input');
    const sendButton = document.querySelector('.send-button');

    const messages = [
        { sender: 'bot', text: 'Hello! How can I assist you today?' }
    ];

    const renderMessages = () => {
        chatContainer.innerHTML = '';
        messages.forEach(message => {
            const messageElement = document.createElement('div');
            messageElement.classList.add('message');
            messageElement.classList.add(message.sender === 'user' ? 'user-message' : 'bot-message');
            messageElement.textContent = message.text;
            chatContainer.appendChild(messageElement);
        });
        chatContainer.scrollTop = chatContainer.scrollHeight;
    };

    const sendMessageToAPI = async (userMessage) => {
        const response = await fetch('http://localhost:3000/generate-response', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message: userMessage }),
        });

        const data = await response.json();
        return data.response;
    };

    sendButton.addEventListener('click', async () => {
        const userMessage = chatInput.value.trim();
        if (userMessage) {
            messages.push({ sender: 'user', text: userMessage });
            chatInput.value = '';
            renderMessages();
            // Get bot response from API
            const botResponse = await sendMessageToAPI(userMessage);
            messages.push({ sender: 'bot', text: botResponse });
            renderMessages();
        }
    });

    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendButton.click();
        }
    });

    renderMessages();
});