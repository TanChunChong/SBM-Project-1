document.addEventListener('DOMContentLoaded', () => {
    const chatContainer = document.querySelector('.chat-container');
    const chatInput = document.querySelector('.chat-input');
    const sendButton = document.querySelector('.send-button');

    const messages = [
        { sender: 'bot', text: 'Hello! How can I assist you today?' },
        { sender: 'user', text: 'What is the weather like today?' },
        { sender: 'bot', text: 'The weather is sunny with a high of 25°C.' },
        { sender: 'user', text: 'Thank you!' },
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

    sendButton.addEventListener('click', () => {
        const userMessage = chatInput.value.trim();
        if (userMessage) {
            messages.push({ sender: 'user', text: userMessage });
            chatInput.value = '';
            renderMessages();
            // Simulate bot response after a short delay
            setTimeout(() => {
                messages.push({ sender: 'bot', text: 'I am here to help!' });
                renderMessages();
            }, 1000);
        }
    });

    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendButton.click();
        }
    });

    renderMessages();
});
