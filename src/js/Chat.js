import ChatAPI from "./api/ChatAPI";

export default class Chat {
  constructor(container) {
    this.container = container;
    this.api = new ChatAPI();
    this.websocket = null;
    this.user = null;
    this.usersList = [];
    this.messagesList = [];
  }

  init() {
    this.promptUsername();
  }

  promptUsername() {
    const prompt = document.createElement('div');
    prompt.classList.add('prompt');

    const promptTitle = document.createElement('h3');
    promptTitle.classList.add('prompt_title');
    promptTitle.textContent = 'Enter an alias';

    const promptInput = document.createElement('input');
    promptInput.classList.add('prompt_input');

    const promptButton = document.createElement('button');
    promptButton.classList.add('prompt_button');
    promptButton.type = 'button';
    promptButton.textContent = 'Continue';

    const errorMsg = document.createElement('div');
    errorMsg.classList.add('prompt_error-msg');

    prompt.append(promptTitle, promptInput, promptButton, errorMsg);
    document.body.append(prompt);
  
    promptButton.addEventListener('click', () => {
      const username = promptInput.value.trim();
      if (!username) {
        errorMsg.textContent = 'Enter an alias!';
        errorMsg.classList.add('active');
        return;
      }

      this.api.create({ name: username })
        .then(res => {
          this.user = res.user;
          prompt.remove();
          this.initWebSocket();
          this.renderChat();
        })
        .catch ((err) => {
          errorMsg.textContent = err.message; 
          errorMsg.classList.add('active');
          return
        }); 
    });

    promptInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') promptButton.click();
    });
  }

  initWebSocket() {
    this.websocket = new WebSocket('ws://localhost:3000');

    this.websocket.onmessage = (e) => {
      const data = JSON.parse(e.data);

      // Получили список пользователей
      if (Array.isArray(data)) {
        this.usersList = data;
        this.renderUsers();
        return;
      }

      // Получили сообщение
      this.messagesList.push(data);
      this.renderMessage(data);
    };

    this.websocket.onopen = () => console.log("WebSocket connected");
    this.websocket.onclose = () => console.log("WebSocket disconnected");
    this.websocket.onerror = (err) => console.log(err);

    // обработчик на закрытие вкладки / обновление страницы
    window.addEventListener('beforeunload', () => {
      if (this.websocket && this.user) {
        this.websocket.send(JSON.stringify({ type: "exit", user: this.user }));
        this.websocket.close();
      }
    });
  }

  renderChat() {
    const chat = document.createElement('div');
    chat.classList.add('chat');

    const userBox = document.createElement('div');
    userBox.classList.add('user-box');

    const userList = document.createElement('ul');
    userList.classList.add('user-box_list');

    const messageBox = document.createElement('div');
    messageBox.classList.add('message-box');

    const messageList = document.createElement('ul');
    messageList.classList.add('message-box_list');

    const messageInput = document.createElement('input');
    messageInput.classList.add('message-box_input');
    messageInput.placeholder = 'Type your message here';

    const sendMessageButton = document.createElement('button');
    sendMessageButton.classList.add('message-box_send-button');
    sendMessageButton.textContent = 'Send';

    const exitButton = document.createElement('button');
    exitButton.classList.add('chat_exit-button');
    exitButton.textContent = 'Exit Chat';

    userBox.append(userList);
    messageBox.append(messageList, messageInput, sendMessageButton);
    chat.append(userBox, messageBox, exitButton);
    this.container.append(chat);

    sendMessageButton.addEventListener("click", () => this.sendMessage());
    exitButton.addEventListener('click', () => this.exitChat());
    messageInput.addEventListener("keypress", e => {
      if (e.key === "Enter") this.sendMessage();
    });
  }

  renderUsers() {
    const ul = this.container.querySelector('.user-box_list');
    ul.innerHTML = '';
    this.usersList.forEach(user => {
      const li = document.createElement("li");
      li.classList.add('user-box_name');
      li.textContent = user.name === this.user.name ? `${user.name} (You)` : user.name;
      ul.append(li);
    });
  }

  renderMessage(msg) {
    const li = document.createElement('li');
    li.classList.add('message-box_msg');

    const isOwn = msg.user.name === this.user.name;
    if (isOwn) li.classList.add('message-own');

    const timestamp = new Date(); // текущее время на клиенте
    const timeStr = timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const dateStr = timestamp.toLocaleDateString();

    const meta = document.createElement("div");
    meta.classList.add("message-box_msg_meta");
    meta.textContent = `${isOwn ? "You" : msg.user.name}, ${timeStr} ${dateStr}`;

    const text = document.createElement("div");
    text.classList.add("message-box_msg_text");
    text.textContent = msg.message;

    li.append(meta, text);
    const ul = this.container.querySelector('.message-box_list');
    ul.append(li);

    ul.scrollTop = ul.scrollHeight;
  }

  sendMessage() {
    const input = this.container.querySelector('.message-box_input');
    const message = input.value.trim();
    if (!message) return;

    const msgObj = {
      type: "send",
      message: message,
      user: this.user,
    };

    this.websocket.send(JSON.stringify(msgObj));
    input.value = '';
  }

  exitChat() {
    if (this.websocket && this.user) {
      this.websocket.send(JSON.stringify({ type: "exit", user: this.user }));
      this.websocket.close();
      this.user = null;
      const chat = document.querySelector('.chat');
      if (chat) chat.remove();
      this.promptUsername();
    }
  }
}
