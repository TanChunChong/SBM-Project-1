function adjustChatContainerPadding() {
    const chatContainer = document.querySelector('.chat-container');
    const inputContainerHeight = document.querySelector('.input-container').offsetHeight;
    const viewportHeight = window.innerHeight;
    const documentHeight = document.documentElement.clientHeight;

    if (viewportHeight < documentHeight) {
        chatContainer.style.paddingBottom = inputContainerHeight + 'px';
    } else {
        chatContainer.style.paddingBottom = '60px';
    }
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

document.querySelector('.chat-input').addEventListener('focus', adjustChatContainerPadding);

window.addEventListener('resize', adjustChatContainerPadding);

document.querySelector('.send-button').addEventListener('click', () => {
    const chatContainer = document.querySelector('.chat-container');
    chatContainer.scrollTop = chatContainer.scrollHeight;
});
