class SafaChatWidget extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });

    this.apiKey = this.getAttribute('api-key') || 'uKI5Y2zgfmak6NpVVVsD7Hcxy9W1Teq5';

    this.shadowRoot.innerHTML = `
      <style>
        #chat-button {
          position: fixed;
          bottom: 20px;
          right: 20px;
          background: #007bff;
          color: white;
          border: none;
          border-radius: 50%;
          width: 60px;
          height: 60px;
          font-size: 24px;
          cursor: pointer;
          z-index: 10000;
        }

        #chat-box {
          position: fixed;
          bottom: 90px;
          right: 20px;
          width: 300px;
          height: 400px;
          background: white;
          border-radius: 10px;
          box-shadow: 0 0 10px rgba(0,0,0,0.1);
          display: none;
          flex-direction: column;
          z-index: 10000;
        }

        #messages {
          flex: 1;
          padding: 10px;
          overflow-y: auto;
          font-size: 14px;
        }

        #input {
          display: flex;
          border-top: 1px solid #eee;
        }

        #input input {
          flex: 1;
          padding: 8px;
          border: none;
          font-size: 14px;
        }

        #input button {
          background: #007bff;
          color: white;
          border: none;
          padding: 8px 12px;
          cursor: pointer;
        }
      </style>

      <button id="chat-button">💬</button>
      <div id="chat-box">
        <div id="messages"></div>
        <div id="input">
          <input type="text" placeholder="Type your message..." />
          <button>Send</button>
        </div>
      </div>
    `;
  }

  connectedCallback() {
    const button = this.shadowRoot.querySelector('#chat-button');
    const chatBox = this.shadowRoot.querySelector('#chat-box');
    const input = this.shadowRoot.querySelector('#input input');
    const send = this.shadowRoot.querySelector('#input button');
    const messages = this.shadowRoot.querySelector('#messages');

    button.onclick = () => {
      chatBox.style.display = chatBox.style.display === 'none' ? 'flex' : 'none';
    };

    send.onclick = async () => {
      const message = input.value.trim();
      if (!message) return;

      messages.innerHTML += `<div><strong>You:</strong> ${message}</div>`;
      input.value = '';

      const res = await fetch("https://safarepo-1.onrender.com/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": this.apiKey,
        },
        body: JSON.stringify({ message }),
      });

      const data = await res.json();
      messages.innerHTML += `<div><strong>Safa:</strong> ${data.reply}</div>`;
      messages.scrollTop = messages.scrollHeight;
    };
  }
}

customElements.define('safa-chat-widget', SafaChatWidget);
