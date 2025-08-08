class SafaChatWidget extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });

    this.apiKey = this.getAttribute('api-key') || 'uKI5Y2zgfmak6NpVVVsD7Hcxy9W1Teq5';

    this.shadowRoot.innerHTML = `
      <style>
        @import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css');

        :host {
          font-family: Arial, sans-serif;
          --primary-color: #007bff;
          --background-color: #fff;
          --text-color: #222;
          --border-radius: 10px;
          --box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
          --zindex: 10000;
        }

        #chat-button {
          position: fixed;
          bottom: 20px;
          right: 20px;
          background: var(--primary-color);
          color: white;
          border: none;
          border-radius: 50%;
          width: 60px;
          height: 60px;
          font-size: 26px;
          cursor: pointer;
          z-index: var(--zindex);
          box-shadow: var(--box-shadow);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background-color 0.3s ease;
          user-select: none;
        }
        #chat-button:hover {
          background-color: #0056b3;
        }
        #chat-button[aria-label] {
          position: fixed;
        }
        #chat-button[aria-label]:hover::after {
          content: attr(aria-label);
          position: absolute;
          bottom: 70px;
          right: 0;
          background: #222;
          color: white;
          padding: 6px 10px;
          border-radius: 5px;
          white-space: nowrap;
          font-size: 12px;
          pointer-events: none;
          opacity: 0.85;
        }

        #chat-box {
          position: fixed;
          bottom: 90px;
          right: 20px;
          width: 320px;
          max-width: 90vw;
          height: 450px;
          background: var(--background-color);
          border-radius: var(--border-radius);
          box-shadow: var(--box-shadow);
          display: none;
          flex-direction: column;
          z-index: var(--zindex);
          overflow: hidden;
          user-select: text;
        }

        #messages {
          flex: 1;
          padding: 12px;
          overflow-y: auto;
          font-size: 14px;
          color: var(--text-color);
          background: #f9f9f9;
        }

        #messages div {
          margin-bottom: 12px;
          line-height: 1.3;
        }

        #messages .user-msg {
          text-align: right;
          font-weight: 600;
          color: var(--primary-color);
        }

        #messages .bot-msg {
          text-align: left;
          color: #444;
        }

        #input {
          display: flex;
          border-top: 1px solid #ddd;
          padding: 8px;
          background: white;
        }

        #input input {
          flex: 1;
          padding: 10px;
          border: 1px solid #ccc;
          border-radius: var(--border-radius);
          font-size: 14px;
          outline-offset: 0;
          outline-color: var(--primary-color);
        }

        #input button {
          background: var(--primary-color);
          color: white;
          border: none;
          border-radius: var(--border-radius);
          padding: 0 14px;
          margin-left: 8px;
          cursor: pointer;
          font-size: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background-color 0.3s ease;
        }

        #input button:hover {
          background-color: #0056b3;
        }

        #typing-indicator {
          margin-left: 10px;
          width: 40px;
          height: 40px;
          display: none;
          align-items: center;
          justify-content: center;
        }
      </style>

      <button id="chat-button" aria-label="Open Safa Chat">💬</button>
      <div id="chat-box" role="region" aria-live="polite" aria-label="Safa Chat Widget">
        <div id="messages" aria-atomic="true" aria-relevant="additions"></div>
        <div id="input">
          <input type="text" placeholder="Type your message..." aria-label="Chat message input" />
          <button id="mic-btn" title="Voice input (mic)">
            <i class="fa-solid fa-microphone"></i>
          </button>
          <button id="send-btn" aria-label="Send message">Send</button>
          <div id="typing-indicator">
            <!-- Lottie animation container -->
            <lottie-player src="https://assets4.lottiefiles.com/packages/lf20_tyqe4oog.json"  
              background="transparent"  speed="1"  style="width: 40px; height: 40px;"  loop  autoplay>
            </lottie-player>
          </div>
        </div>
      </div>

      <script src="https://unpkg.com/@lottiefiles/lottie-player@latest/dist/lottie-player.js"></script>
    `;
  }

  connectedCallback() {
    const button = this.shadowRoot.querySelector('#chat-button');
    const chatBox = this.shadowRoot.querySelector('#chat-box');
    const input = this.shadowRoot.querySelector('#input input');
    const sendBtn = this.shadowRoot.querySelector('#send-btn');
    const micBtn = this.shadowRoot.querySelector('#mic-btn');
    const messages = this.shadowRoot.querySelector('#messages');
    const typingIndicator = this.shadowRoot.querySelector('#typing-indicator');

    button.onclick = () => {
      chatBox.style.display = chatBox.style.display === 'none' ? 'flex' : 'none';
      input.focus();
    };

    const appendMessage = (sender, text) => {
      const div = document.createElement('div');
      div.className = sender === 'user' ? 'user-msg' : 'bot-msg';
      div.textContent = `${sender === 'user' ? 'You' : 'Safa'}: ${text}`;
      messages.appendChild(div);
      messages.scrollTop = messages.scrollHeight;
    };

    const sendMessage = async (message) => {
      appendMessage('user', message);
      typingIndicator.style.display = 'flex';

      try {
        const res = await fetch("https://safarepo-1.onrender.com/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": this.apiKey,
          },
          body: JSON.stringify({ message }),
        });

        if (!res.ok) {
          const errorText = await res.text();
          appendMessage('bot', `Error ${res.status}: ${errorText}`);
          typingIndicator.style.display = 'none';
          return;
        }

        const data = await res.json();
        appendMessage('bot', data.reply);

      } catch (err) {
        appendMessage('bot', `Network error: ${err.message}`);
      } finally {
        typingIndicator.style.display = 'none';
      }
    };

    sendBtn.onclick = () => {
      const message = input.value.trim();
      if (!message) return;
      input.value = '';
      sendMessage(message);
    };

    input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      const message = input.value.trim();
      if (!message) return;
      input.value = '';
      sendMessage(message);
    }
  });

    // Mic button with basic speech recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      micBtn.onclick = () => {
        micBtn.disabled = true;
        recognition.start();
      };

      recognition.onresult = (event) => {
        const speechResult = event.results[0][0].transcript;
        input.value = speechResult;
        micBtn.disabled = false;
        sendBtn.click();
      };

      recognition.onerror = () => {
        micBtn.disabled = false;
      };

      recognition.onend = () => {
        micBtn.disabled = false;
      };
    } else {
      micBtn.style.display = 'none';
    }
  }
}

customElements.define('SafaChatWidget', SafaChatWidget);
