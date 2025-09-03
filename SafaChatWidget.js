class SafaChatWidget extends HTMLElement {
  constructor() {
    super();

    // Font Awesome (optional/safe to keep)
    if (!document.getElementById("fontawesome-css")) {
      const link = document.createElement("link");
      link.id = "fontawesome-css";
      link.rel = "stylesheet";
      link.href =
        "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css";
      document.head.appendChild(link);
    }

    this.attachShadow({ mode: "open" });

    this.apiKey =
      this.getAttribute("api-key") || "uKI5Y2zgfmak6NpVVVsD7Hcxy9W1Teq5";

    this.shadowRoot.innerHTML = `
      <style>
        /* Make the host invisible and non-blocking so no rectangle leaks onto pages */
        :host {
          all: initial;
          /* Custom props + sensible defaults */
          --color1: #fbd3e9;      /* soft blush */
          --color2: #fcd4b6;      /* warm peach */
          --color3: #fef6d8;      /* champagne gold */
          --primary-gradient: linear-gradient(135deg, #e75480 0%, #b57edc 100%);
          --border-radius: 20px;
          --box-shadow: 0 4px 20px rgba(0,0,0,0.2);
          --zindex: 2147483000;
          --text-color: #3a2e3f;
          --primary-color: #6b1f4f;
          --background-color: linear-gradient(135deg, var(--color1), var(--color2), var(--color3));
          pointer-events: none; /* host itself ignores clicks */
          font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
        }

        /* Interactive children accept clicks */
        #chat-button, #chat-box, #chat-label { pointer-events: auto; }
        #hf-btn {
          background: var(--primary-gradient);
          color: white;
          border: none;
          border-radius: var(--border-radius);
          padding: 8px 12px;
          font-size: 14px;
          cursor: pointer;
          font-weight: 600;
          box-shadow: 0 0 12px rgba(183, 126, 220, 0.7);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        #hf-btn:hover {
          transform: scale(1.05);
          box-shadow: 0 0 20px rgba(183, 126, 220, 1);
        }
        /* Bubble */
        #chat-button {
          position: fixed;
          bottom: 20px;
          right: 20px;
          background: var(--primary-gradient);
          box-shadow: 0 0 12px 3px rgba(231, 84, 128, 0.7);
          color: #6b1f4f;
          border: none;
          border-radius: 50%;
          width: 65px;
          height: 65px;
          font-size: 30px;
          cursor: pointer;
          z-index: var(--zindex);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: box-shadow 0.5s ease, transform 0.3s ease;
          user-select: none;
          animation: gentlePulse 4s infinite;
        }
        #chat-button:hover {
          box-shadow: 0 0 20px 6px rgba(183, 126, 220, 0.9);
          transform: scale(1.1);
        }

        @keyframes gentlePulse {
          0%, 100% { box-shadow: 0 0 12px 3px rgba(231, 84, 128, 0.7); }
          50% { box-shadow: 0 0 20px 6px rgba(183, 126, 220, 0.9); }
        }
        @keyframes backgroundShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }  

        /* Label near chat button */
        #chat-label {
          position: fixed;
          bottom: 90px;
          right: 22px;
          font-weight: 700;
          color: #6b1f4f;
          text-shadow: 0 0 8px rgba(107, 31, 79, 0.6);
          user-select: none;
          pointer-events: none;
          font-size: 16px;
          letter-spacing: 1.3px;
          animation: romanticGlow 3s ease-in-out infinite alternate;
          z-index: var(--zindex);
        }
        @keyframes romanticGlow {
          from { text-shadow: 0 0 8px #e75480cc, 0 0 16px #b57edccc; }
          to   { text-shadow: 0 0 16px #b57edccc, 0 0 24px #e75480cc; }
        }

        /* Chat box — hidden by default; gradient lives here (NOT on :host) */
        #chat-box {
          position: fixed;
          bottom: 90px;
          right: 20px;
          width: 340px;
          max-width: 90vw;
          height: 480px;
          background: var(--background-color);
          border-radius: var(--border-radius);
          box-shadow: var(--box-shadow);
          display: none;
          flex-direction: column;
          z-index: var(--zindex);
          overflow: hidden;
          user-select: text;
          border: 2px solid transparent;
          transition: border-color 0.4s ease;
          animation: backgroundShift 8s ease-in-out infinite;
        }
        #chat-box.show { border-color: #b57edc88; }

        #chat-header {
          background: var(--primary-gradient);
          color: white;
          padding: 14px 18px;
          font-weight: 700;
          font-size: 20px;
          display: flex;
          align-items: center;
          gap: 14px;
          box-shadow: 0 2px 12px rgba(183, 126, 220, 0.5);
          user-select: none;
        }
        #chat-header img {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          box-shadow: 0 0 12px #b57edccc;
          border: 2px solid white;
          transition: box-shadow 0.3s ease;
        }
        #chat-header img:hover { box-shadow: 0 0 20px #e75480ff; }

        #messages {
          flex: 1;
          padding: 14px;
          overflow-y: auto;
          font-size: 15px;
          color: var(--text-color);
          background: #fef9fc;
          scrollbar-width: thin;
          scrollbar-color: #e75480 #f1d9e3;
        }
        #messages::-webkit-scrollbar { width: 8px; }
        #messages::-webkit-scrollbar-thumb { background: #e75480; border-radius: 4px; }
        #messages div { margin-bottom: 14px; line-height: 1.4; }

        #messages .user-msg {
          text-align: right;
          font-weight: 700;
          color: var(--primary-color);
          background: #f8d4e0;
          padding: 6px 12px;
          border-radius: 14px 14px 0 14px;
          display: inline-block;
          max-width: 75%;
          word-wrap: break-word;
        }
        #messages .bot-msg {
          text-align: left;
          color: #6b4a70;
          background: #e9d9f2;
          padding: 6px 12px;
          border-radius: 14px 14px 14px 0;
          display: inline-block;
          max-width: 75%;
          word-wrap: break-word;
        }
        .typing-bubble {
          text-align: left;
          background: #e9d9f2;
          padding: 6px 12px;
          border-radius: 14px 14px 14px 0;
          display: inline-block;
          max-width: 75%;
        }
        .typing-dots { display: flex; align-items: center; gap: 4px; }
        .typing-dots span {
          width: 6px; height: 6px; background: #6b4a70; border-radius: 50%;
          animation: typingBlink 1.4s infinite ease-in-out;
        }
        .typing-dots span:nth-child(2) { animation-delay: 0.2s; }
        .typing-dots span:nth-child(3) { animation-delay: 0.4s; }
        @keyframes typingBlink {
          0%, 80%, 100% { opacity: 0.3; transform: translateY(0); }
          40% { opacity: 1; transform: translateY(-2px); }
        }

        #input {
          display: flex;
          border-top: 1px solid #e8d3e9;
          padding: 10px;
          background: white;
          align-items: center;
          max-width: 100%;
          box-sizing: border-box;
          gap: 8px;
        }
        #input input {
          flex: 1;
          padding: 12px 16px;
          border: 1.8px solid #b57edc;
          border-radius: var(--border-radius);
          font-size: 15px;
          outline-offset: 0;
          outline-color: #e75480;
          min-width: 0;
          transition: border-color 0.3s ease;
        }
        #input input:focus { border-color: #e75480; box-shadow: 0 0 8px #e75480bb; }

        #input button, #predict-btn {
          background: var(--primary-gradient);
          box-shadow: 0 0 10px 3px rgba(231, 84, 128, 0.7);
          color: #6b1f4f;
          border: none;
          border-radius: 50%;
          width: 42px;
          height: 42px;
          cursor: pointer;
          font-size: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: box-shadow 0.4s ease, transform 0.3s ease;
        }
        #input button:hover, #predict-btn:hover { box-shadow: 0 0 18px 5px rgba(183, 126, 220, 0.9); transform: scale(1.1); }
        #send-btn i { pointer-events: none; }

        #typing-indicator {
          margin-left: 12px;
          width: 42px; height: 42px;
          display: none;
          align-items: center; justify-content: center;
        }
        #typing-indicator lottie-player { width: 42px; height: 42px; }

        /* Mobile */
        @media (max-width: 480px) {
          #chat-box { width: 90vw; height: 400px; right: 5vw; bottom: 80px; }
          #chat-button { width: 55px; height: 55px; font-size: 24px; }
          #chat-label { font-size: 13px; bottom: 75px; right: 18px; }
          #input button, #predict-btn { width: 36px; height: 36px; font-size: 16px; }
          #input input { font-size: 14px; padding: 8px 12px; }
          #chat-header { font-size: 16px; padding: 10px 14px; }
          #chat-header img { width: 28px; height: 28px; }
        }
      </style>

      <button id="chat-button" aria-label="Chat With Safa">💬</button>
      <div id="chat-label">Safa</div>

      <div id="chat-box" role="region" aria-live="polite" aria-label="Safa Chat Widget">
        <div id="chat-header">
          <img src="https://safachatwidget.onrender.com/baby-safa-avatar.png" alt="Baby Safa avatar" />
          Safa
        </div>
        <div id="messages" aria-atomic="true" aria-relevant="additions"></div>
        <div id="input">
          <input type="text" placeholder="Type your message..." aria-label="Chat message input" />
          <button id="mic-btn" title="Voice input (mic)">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="#3da9fc" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 14C13.6569 14 15 12.6569 15 11V5C15 3.34315 13.6569 2 12 2C10.3431 2 9 3.34315 9 5V11C9 12.6569 10.3431 14 12 14Z"/>
              <path d="M19 11C19 14.3137 16.3137 17 13 17H11C7.68629 17 5 14.3137 5 11" stroke="#3da9fc" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <line x1="12" y1="19" x2="12" y2="22" stroke="#3da9fc" stroke-width="2" stroke-linecap="round"/>
              <line x1="8" y1="22" x2="16" y2="22" stroke="#3da9fc" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </button>

          <button id="send-btn" aria-label="Send message">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="#3da9fc" xmlns="http://www.w3.org/2000/svg">
              <path d="M2 21L23 12L2 3V10L17 12L2 14V21Z" />
            </svg>
          </button>
          <button id="hf-btn">🎥</button>

          <button id="predict-btn" title="Get prediction" aria-label="Predict">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 17L9 11L13 15L21 7" stroke="#3da9fc" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <circle cx="3" cy="17" r="2" fill="#3da9fc"/>
              <circle cx="9" cy="11" r="2" fill="#3da9fc"/>
              <circle cx="13" cy="15" r="2" fill="#3da9fc"/>
              <circle cx="21" cy="7" r="2" fill="#3da9fc"/>
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
    const button = this.shadowRoot.querySelector("#chat-button");
    const chatBox = this.shadowRoot.querySelector("#chat-box");
    const input = this.shadowRoot.querySelector("#input input");
    const sendBtn = this.shadowRoot.querySelector("#send-btn");
    const micBtn = this.shadowRoot.querySelector("#mic-btn");
    const messages = this.shadowRoot.querySelector("#messages");
    const typingIndicator = this.shadowRoot.querySelector("#typing-indicator");
    const predictBtn = this.shadowRoot.querySelector("#predict-btn");
    const hfBtn = this.shadowRoot.querySelector("#hf-btn");
    let typingBubbleEl = null;
    hfBtn.onclick = async () => {
      const message = input.value.trim();
      if (!message) return;

      input.value = "";
      appendMessage("user", message);
      showBotTyping();

      try {
        const res = await fetch(
          "https://venunath-safa-video-api.hf.space/embed/Venunath/safa-video-api/api/predict",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ data: [message] }),
          }
        );

        if (!res.ok) {
          appendMessage("bot", `Error ${res.status}: ${await res.text()}`);
          return;
        }

        const data = await res.json();
        const filePath = data.data[0]; 
        const videoUrl = `https://venunath-safa-video-api.hf.space/embed/Venunath/safa-video-api${filePath}`;

        appendMessage("bot", `🎥 Video ready! You can watch it here:`);

        const videoEl = document.createElement("video");
        videoEl.src = videoUrl;
        videoEl.controls = true;
        videoEl.style.maxWidth = "100%";
        messages.appendChild(videoEl);

        const dl = document.createElement("a");
        dl.href = videoUrl;
        dl.download = "safa_video.mp4";
        dl.textContent = "⬇️ Download Video";
        dl.style.display = "block";
        dl.style.marginTop = "6px";
        messages.appendChild(dl);

        messages.scrollTop = messages.scrollHeight;
      } catch (err) {
        appendMessage("bot", `HF error: ${err.message}`);
      } finally {
        hideBotTyping();
      }
    };

    const showBotTyping = () => {
      if (typingBubbleEl) return;
      typingBubbleEl = document.createElement("div");
      typingBubbleEl.className = "bot-msg typing-bubble";
      typingBubbleEl.innerHTML = `
        <div class="typing-dots">
          <span></span><span></span><span></span>
        </div>
      `;
      messages.appendChild(typingBubbleEl);
      messages.scrollTop = messages.scrollHeight;
    };

    const hideBotTyping = () => {
      if (typingBubbleEl) {
        typingBubbleEl.remove();
        typingBubbleEl = null;
      }
    };

    // Lottie (once)
    if (!document.getElementById("lottie-player-script")) {
      const script = document.createElement("script");
      script.id = "lottie-player-script";
      script.src =
        "https://unpkg.com/@lottiefiles/lottie-player@latest/dist/lottie-player.js";
      document.head.appendChild(script);
    }

    // Append chat message
    const appendMessage = (sender, text) => {
      const div = document.createElement("div");
      div.className = sender === "user" ? "user-msg" : "bot-msg";
      div.textContent = `${sender === "user" ? "You" : "Safa"}: ${text}`;
      messages.appendChild(div);
      messages.scrollTop = messages.scrollHeight;
    };

    // Send normal chat
    const sendMessage = async (message) => {
      appendMessage("user", message);
      showBotTyping();
      await new Promise((resolve) => setTimeout(resolve, 50));

      try {
        const res = await fetch("https://safarepo-mcto.onrender.com/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": this.apiKey,
          },
          body: JSON.stringify({ message }),
        });

        if (!res.ok) {
          const errorText = await res.text();
          appendMessage("bot", `Error ${res.status}: ${errorText}`);
          hideBotTyping();
          return;
        }

        const data = await res.json();
        appendMessage("bot", data.reply);
      } catch (err) {
        appendMessage("bot", `Network error: ${err.message}`);
      } finally {
        hideBotTyping();
      }
    };

    // Predict
    predictBtn.onclick = async () => {
      showBotTyping();
      await new Promise((resolve) => setTimeout(resolve, 50));

      const message = input.value.trim();
      if (!message) {
        appendMessage("bot", "Please enter a message before predicting.");
        hideBotTyping();
        return;
      }

      input.value = "";
      appendMessage("user", message);

      try {
        const res = await fetch("https://safarepo-mcto.onrender.com/predict", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": this.apiKey,
          },
          body: JSON.stringify({ message }),
        });

        if (!res.ok) {
          const errorText = await res.text();
          appendMessage("bot", `Error ${res.status}: ${errorText}`);
          hideBotTyping();
          return;
        }

        const data = await res.json();

        let botMessage = "";
        if (data.predictions) {
          const months = data.predictions.futureMonths?.join(", ") || "";
          const sales = data.predictions.predictedSales?.join(", ") || "";
          botMessage += `📈 Sales prediction for months [${months}]: [${sales}]\n\n`;
        }
        if (data.suggestions) {
          botMessage += `💡 Suggestions:\n${data.suggestions}`;
        }
        if (!botMessage) botMessage = "No prediction or suggestions available.";

        appendMessage("bot", botMessage);
      } catch (err) {
        appendMessage("bot", `Prediction error: ${err.message}`);
      } finally {
        hideBotTyping();
      }
    };

    // Toggle open/close
    button.onclick = () => {
      chatBox.style.display =
        chatBox.style.display === "none" ? "flex" : "none";
      input.focus();
    };

    // Send via button
    sendBtn.onclick = () => {
      const message = input.value.trim();
      if (!message) return;
      input.value = "";
      sendMessage(message);
    };

    // Send via Enter
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        const message = input.value.trim();
        if (!message) return;
        input.value = "";
        sendMessage(message);
      }
    });

    // Voice (if available)
    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = "en-US";
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
      micBtn.style.display = "none";
    }
  }
}

customElements.define("safa-chat-widget", SafaChatWidget);
