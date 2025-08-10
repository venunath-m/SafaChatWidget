class SafaChatWidget extends HTMLElement {
  constructor() {
    super();
    if (!document.getElementById('fontawesome-css')) {
      const link = document.createElement('link');
      link.id = 'fontawesome-css';
      link.rel = 'stylesheet';
      link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';
      document.head.appendChild(link);
    }
    this.attachShadow({ mode: 'open' });

    this.apiKey = this.getAttribute('api-key') || 'uKI5Y2zgfmak6NpVVVsD7Hcxy9W1Teq5';

    this.shadowRoot.innerHTML = `
      <style>

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
          font-size: 28px;
          cursor: pointer;
          z-index: var(--zindex);
          box-shadow: var(--box-shadow);
          display: flex;  /* Make sure it is NOT display:none */
          align-items: center;
          justify-content: center;
          transition: background-color 0.3s ease, box-shadow 0.6s ease-in-out;
          user-select: none;
          animation: pulse 3s infinite;
        }

        #input button {
          background: var(--primary-color);
          color: white;
          border: none;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          margin-left: 8px;
          cursor: pointer;
          font-size: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background-color 0.3s ease;
          box-shadow: 0 0 8px #007bffaa;
        }
        #input button:hover {
          background-color: #0056b3;
          box-shadow: 0 0 12px #0056b3cc;
        }
        #send-btn i, #mic-btn i {
          font-size: 20px;
          pointer-events: none;
        }
        #chat-button:hover {
          background-color: #0056b3;
          box-shadow: 0 0 12px 4px #007bff88;
        }
        @keyframes pulse {
          0%, 100% { box-shadow: 0 0 10px 3px #007bff88; }
          50% { box-shadow: 0 0 18px 6px #007bffcc; }
        }

        /* Label near chat button for Safa */
        #chat-label {
          position: fixed;
          bottom: 90px;
          right: 20px;
          font-weight: bold;
          color: var(--primary-color);
          text-shadow: 0 0 5px #007bffaa;
          user-select: none;
          pointer-events: none;
          font-size: 14px;
          letter-spacing: 1.2px;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          animation: glow 2.5s ease-in-out infinite alternate;
          z-index: var(--zindex);
        }
        @keyframes glow {
          from {
            text-shadow: 0 0 6px #007bffcc, 0 0 12px #007bffcc;
          }
          to {
            text-shadow: 0 0 12px #3399ff, 0 0 20px #3399ff;
          }
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

        #chat-header {
          background: var(--primary-color);
          color: white;
          padding: 12px 16px;
          font-weight: 700;
          font-size: 18px;
          display: flex;
          align-items: center;
          gap: 12px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.15);
        }
        #chat-header img {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          box-shadow: 0 0 8px #3399ffaa;
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
          align-items: center;
        }

        #input input {
          flex: 1;
          padding: 10px 14px;
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
          border-radius: 50%;
          width: 40px;
          height: 40px;
          margin-left: 8px;
          cursor: pointer;
          font-size: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background-color 0.3s ease;
          box-shadow: 0 0 8px #007bffaa;
        }

        #input button:hover {
          background-color: #0056b3;
          box-shadow: 0 0 12px #0056b3cc;
        }

        /* Hide original Send button text, only icon shown */
        #send-btn i {
          pointer-events: none;
        }

        #typing-indicator {
          margin-left: 10px;
          width: 40px;
          height: 40px;
          display: none;
          align-items: center;
          justify-content: center;
        }
        #typing-indicator lottie-player {
          width: 40px;
          height: 40px;
        }
        #predict-btn {
          background: var(--primary-color);
          color: white;
          border: none;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          margin-left: 8px;
          cursor: pointer;
          font-size: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background-color 0.3s ease;
          box-shadow: 0 0 8px #007bffaa;
        }

        #predict-btn:hover {
          background-color: #0056b3;
          box-shadow: 0 0 12px #0056b3cc;
        }
 
      </style>

      <button id="chat-button" aria-label="Chat With Safa">💬</button>
      <div id="chat-label">Safa</div>

      <div id="chat-box" role="region" aria-live="polite" aria-label="Safa Chat Widget">
        <div id="chat-header">
          <img src="https://i.postimg.cc/XYxTzTjn/baby-safa-avatar.png" alt="Baby Safa avatar" />
          Safa
        </div>
        <div id="messages" aria-atomic="true" aria-relevant="additions"></div>
        <div id="input">
          <input type="text" placeholder="Type your message..." aria-label="Chat message input" />
          <button id="mic-btn" title="Voice input (mic)">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 14C13.6569 14 15 12.6569 15 11V5C15 3.34315 13.6569 2 12 2C10.3431 2 9 3.34315 9 5V11C9 12.6569 10.3431 14 12 14Z"/>
              <path d="M19 11C19 14.3137 16.3137 17 13 17H11C7.68629 17 5 14.3137 5 11" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <line x1="12" y1="19" x2="12" y2="22" stroke="white" stroke-width="2" stroke-linecap="round"/>
              <line x1="8" y1="22" x2="16" y2="22" stroke="white" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </button>
 
          <button id="send-btn" aria-label="Send message">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
              <path d="M2 21L23 12L2 3V10L17 12L2 14V21Z" />
            </svg>
          </button>
          <button id="predict-btn" title="Get prediction" aria-label="Predict">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 17L9 11L13 15L21 7" stroke="white" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
              <circle cx="3" cy="17" r="2" fill="white"/>
              <circle cx="9" cy="11" r="2" fill="white"/>
              <circle cx="13" cy="15" r="2" fill="white"/>
              <circle cx="21" cy="7" r="2" fill="white"/>
            </svg>
          </button>
          <div id="typing-indicator" style="display:none;">
            <lottie-player src="https://assets4.lottiefiles.com/packages/lf20_tyqe4oog.json"  
              background="transparent" speed="1" style="width: 40px; height: 40px;" loop autoplay>
            </lottie-player>
          </div>
        </div>
      </div>      
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
    const predictBtn = this.shadowRoot.querySelector('#predict-btn');

    if (!document.getElementById('lottie-player-script')) {
      const script = document.createElement('script');
      script.id = 'lottie-player-script';
      script.src = 'https://unpkg.com/@lottiefiles/lottie-player@latest/dist/lottie-player.js';
      document.head.appendChild(script);
    }


    predictBtn.onclick = async () => {
      typingIndicator.style.display = 'flex';

      const message = input.value.trim();

      try {
        const res = await fetch("https://safarepo-1.onrender.com/predict", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": this.apiKey,
          },
          body: JSON.stringify({ message }),  // <-- sending { message: "..." }
        });

        if (!res.ok) {
          const errorText = await res.text();
          appendMessage('bot', `Error ${res.status}: ${errorText}`);
          typingIndicator.style.display = 'none';
          return;
        }

        const data = await res.json();

        let botMessage  = '';

        if (data.predictions) {
          const months = data.predictions.futureMonths?.join(', ') || '';
          const sales = data.predictions.predictedSales?.join(', ') || '';
          botMessage  += `📈 Sales prediction for months [${months}]: [${sales}]\n\n`;
        }

        if (data.suggestions) {
          botMessage  += `💡 Suggestions:\n${data.suggestions}`;
        }

        if (!botMessage) {
          botMessage  = "No prediction or suggestions available.";
        }

        appendMessage('bot', botMessage);

      } catch (err) {
        appendMessage('bot', `Prediction error: ${err.message}`);
      } finally {
        typingIndicator.style.display = 'none';
      }
    };


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

customElements.define('safa-chat-widget', SafaChatWidget);

