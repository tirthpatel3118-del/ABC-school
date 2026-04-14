const schoolProfile = {
  name: "ABC School",
  address: "ABC School,Opp. Amul Heights,Vaghasi/Kailash Farm Road,Anand-388001",
  phone: "+91 7202857964",
  email: "abc2014anand@gmail.com",
  links: {
    instagram: "https://www.instagram.com/abc_school_anand/",
    facebook: "https://www.facebook.com/share/1AccjRSMpo/",
    youtube: "https://www.youtube.com/channel/UCfUJ225O6RU5ZpctKxLElZg",
    whatsapp: "https://api.whatsapp.com/send/?phone=917202857964&text&type=phone_number&app_absent=0",
    playstore: "https://play.google.com/store/apps/details?id=com.wamasoftware.abcschool&hl=gu"
  }
};

const faqData = [
  {
    category: "General Info",
    question: "What are the school timings?",
    answer: "School timings are from 8:00 AM to 2:30 PM on Monday through Friday. Saturdays are a half-day until 12:30 PM."
  },
  {
    category: "Admissions & Fees",
    question: "How can I take admission?",
    answer: "You can contact the school office, collect the admission form, submit required documents, and complete the fee process."
  },
  {
    category: "Admissions & Fees",
    question: "What is the fee structure?",
    answer: "Fee structures vary depending on the class in question. Please contact the principal's office or send us a WhatsApp message to get a detailed breakdown.",
    action: {
      label: "Ask on WhatsApp",
      url: schoolProfile.links.whatsapp || "https://wa.me/917202857964"
    }
  },
  {
    category: "Campus & Facilities",
    question: "Does the school provide transportation?",
    answer: "Yes, we provide secure bus services covering various core routes across Anand. The transport desk can provide route details."
  },
  {
    category: "Academics",
    question: "Which classes are available?",
    answer: "Our school currently supports classes from nursery up to the Class 2."
  },
  {
    category: "Contact & App",
    question: "How can I download the school app?",
    answer: "You can download our official Android app directly from the Google Play Store to stay updated.",
    action: {
      label: "Download on Play Store",
      url: schoolProfile.links.playstore || "#"
    }
  },
  {
    category: "Contact & App",
    question: "How can I contact the school?",
    answer: "You can call us, send an email, or direct message us using the official links listed below.",
    action: {
      label: "Contact via WhatsApp",
      url: schoolProfile.links.whatsapp || "https://wa.me/917202857964"
    }
  }
];

const linkElements = document.querySelectorAll("[data-link]");
const faqList = document.getElementById("faq-list");
const chatWindow = document.getElementById("chat-window");
const chatForm = document.getElementById("chat-form");
const chatInput = document.getElementById("chat-input");
const suggestionRow = document.getElementById("suggestion-row");

function applySchoolProfile() {
  document.title = schoolProfile.name;
  document.querySelector(".brand-mark h1").textContent = schoolProfile.name;
  document.querySelector(".hero-copy h2").textContent = `${schoolProfile.name} online, all in one place.`;
  document.getElementById("footer-school-name").textContent = schoolProfile.name;
  document.getElementById("school-address").textContent = schoolProfile.address;
  document.getElementById("school-phone").textContent = schoolProfile.phone;
  document.getElementById("school-email").textContent = schoolProfile.email || "Email coming soon";

  linkElements.forEach((element) => {
    const key = element.dataset.link;
    const linkValue = schoolProfile.links[key];
    const description = element.querySelector("span:last-child");

    if (linkValue) {
      element.href = linkValue;
      element.classList.remove("disabled");
      element.removeAttribute("aria-disabled");
      if (description?.dataset.originalText) {
        description.textContent = description.dataset.originalText;
      }
      return;
    }

    element.href = "#";
    element.classList.add("disabled");
    element.setAttribute("aria-disabled", "true");

    if (description) {
      if (!description.dataset.originalText) {
        description.dataset.originalText = description.textContent || "";
      }
      description.textContent = "Link coming soon";
    }
  });
}

function renderFaqList() {
  faqList.innerHTML = "";

  const categorized = faqData.reduce((acc, item) => {
    const cat = item.category || "Other";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});

  Object.keys(categorized).forEach(category => {
    const catHeader = document.createElement("li");
    catHeader.className = "faq-category-header";
    catHeader.textContent = category;
    faqList.appendChild(catHeader);

    categorized[category].forEach(item => {
      const questionItem = document.createElement("li");
      questionItem.className = "faq-item";
      questionItem.textContent = item.question;
      // Allow clicking the question to make the bot answer it
      questionItem.addEventListener("click", () => sendQuestion(item.question));
      faqList.appendChild(questionItem);
    });
  });
}

function addMessage(sender, text, action = null) {
  const message = document.createElement("div");
  message.className = `message ${sender}`;

  const textNode = document.createElement("div");
  textNode.textContent = text;
  message.appendChild(textNode);

  if (action && action.url && action.url !== "") {
    const btn = document.createElement("a");
    btn.className = "chat-action-btn";
    btn.href = action.url;
    if (!action.url.startsWith("#")) {
      btn.target = "_blank";
      btn.rel = "noopener noreferrer";
    }
    btn.textContent = action.label;
    message.appendChild(btn);
  }

  chatWindow.appendChild(message);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

function showTypingIndicator(id) {
  const message = document.createElement("div");
  message.className = `message bot`;
  message.id = id;
  message.innerHTML = `<div class="typing-dots"><span></span><span></span><span></span></div>`;
  chatWindow.appendChild(message);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

function removeTypingIndicator(id) {
  const message = document.getElementById(id);
  if (message) {
    message.remove();
  }
}

function levenshteinDistance(a, b) {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const matrix = Array.from({ length: a.length + 1 }, () => Array(b.length + 1).fill(0));
  for (let i = 0; i <= a.length; i++) matrix[i][0] = i;
  for (let j = 0; j <= b.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      if (a[i - 1] === b[j - 1]) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,     // deletion
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j - 1] + 1  // substitution
        );
      }
    }
  }
  return matrix[a.length][b.length];
}

function scoreFaq(question, candidate) {
  const candidateText = candidate.question.toLowerCase() + " " + candidate.answer.toLowerCase();

  const questionWords = question
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .split(/\s+/)
    .filter(w => w.length > 2);

  const candidateWords = candidateText
    .replace(/[^\w\s]/g, "")
    .split(/\s+/)
    .filter(w => w.length > 2);

  return questionWords.reduce((score, qWord) => {
    if (candidateWords.includes(qWord)) {
      return score + 2;
    }

    const threshold = qWord.length > 4 ? 2 : 1;
    const hasCloseMatch = candidateWords.some(cWord => {
      if (Math.abs(cWord.length - qWord.length) > threshold) return false;
      return levenshteinDistance(qWord, cWord) <= threshold;
    });

    if (hasCloseMatch) {
      return score + 1;
    }

    return score;
  }, 0);
}

function getBotReply(question) {
  if (!question.trim()) {
    return { answer: "Please type a question so I can help you." };
  }

  const normalized = question.toLowerCase();
  const bestMatch = faqData
    .map((item) => ({ item, score: scoreFaq(normalized, item) }))
    .sort((a, b) => b.score - a.score)[0];

  if (!bestMatch || bestMatch.score === 0) {
    return {
      answer: "I do not have that answer yet. For more inquiry, please fill out the 'Get in Touch' form below so we can assist you better.",
      action: {
        label: "Go to Inquiry Form",
        url: "#inquiry-form"
      }
    };
  }

  return bestMatch.item;
}

function sendQuestion(question) {
  addMessage("user", question);

  const typingId = "typing-" + Date.now();
  showTypingIndicator(typingId);

  window.setTimeout(() => {
    removeTypingIndicator(typingId);
    const reply = getBotReply(question);
    addMessage("bot", reply.answer, reply.action);
  }, 1200);
}

chatForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const question = chatInput.value.trim();

  if (!question) {
    return;
  }

  sendQuestion(question);
  chatInput.value = "";
});

suggestionRow.addEventListener("click", (event) => {
  const button = event.target.closest("button");

  if (!button) {
    return;
  }

  const question = button.textContent || "";
  sendQuestion(question);
});

applySchoolProfile();
renderFaqList();
const typingId = "typing-initial";
showTypingIndicator(typingId);
window.setTimeout(() => {
  removeTypingIndicator(typingId);
  addMessage(
    "bot",
    "Welcome to the abc school FAQ assistant. Ask me about admission, timing, app download, or contact details."
  );
}, 800);

// --- Scroll Animations ---
const observerOptions = {
  root: null,
  rootMargin: '0px',
  threshold: 0.12
};

const observer = new IntersectionObserver((entries, observer) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, observerOptions);

document.querySelectorAll('.scroll-fade').forEach(section => {
  observer.observe(section);
});

// --- Google Sheets Notice Board CMS ---
const SHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRnL3XzjG4aUbUHo_ifi6g18VS_1HnPhmLrH5yuPh65PY15STa0C2nktYaZAUu3tLMj3TDHPxj4m8jA/pub?output=csv";

function parseCSV(str) {
  const arr = [];
  let quote = false;
  for (let row = 0, col = 0, c = 0; c < str.length; c++) {
    let cc = str[c], nc = str[c + 1];
    arr[row] = arr[row] || [];
    arr[row][col] = arr[row][col] || '';

    if (cc == '"' && quote && nc == '"') { arr[row][col] += cc; ++c; continue; }
    if (cc == '"') { quote = !quote; continue; }
    if (cc == ',' && !quote) { ++col; continue; }
    if (cc == '\r' && nc == '\n' && !quote) { ++row; col = 0; ++c; continue; }
    if (cc == '\n' && !quote) { ++row; col = 0; continue; }
    if (cc == '\r' && !quote) { ++row; col = 0; continue; }

    arr[row][col] += cc;
  }
  return arr;
}

async function loadNotices() {
  const container = document.getElementById("dynamic-notices");
  if (!container) return;

  try {
    const response = await fetch(SHEET_CSV_URL);
    const csvText = await response.text();
    const data = parseCSV(csvText);

    // Remove header row and empty rows
    const rows = data.slice(1).filter(r => r.length >= 4 && r[0].trim() !== "");

    container.innerHTML = "";

    if (rows.length === 0) {
      container.innerHTML = "<p style='grid-column: 1/-1; color: var(--muted); text-align: center'>No recent notices.</p>";
      return;
    }

    rows.forEach(row => {
      const day = row[0] || '';
      const month = row[1] || '';
      const tag = row[2] || 'Notice';
      const title = row[3] || 'Update';
      const desc = row[4] || '';

      const isImportant = tag.toLowerCase().includes('important') || tag.toLowerCase().includes('urgent');
      const cardClass = isImportant ? "notice-card important" : "notice-card";
      const tagClass = isImportant ? "notice-tag alert" : "notice-tag";

      const cardHTML = `
        <div class="${cardClass}">
          <div class="notice-date">
            <strong>${day}</strong>
            <span>${month}</span>
          </div>
          <div class="notice-body">
            <span class="${tagClass}">${tag}</span>
            <h4>${title}</h4>
            <p>${desc}</p>
          </div>
        </div>
      `;
      container.innerHTML += cardHTML;
    });

  } catch (err) {
    console.error("Failed to load notices", err);
    container.innerHTML = "<p style='grid-column: 1/-1; color: var(--muted); text-align: center'>Failed to load notices.</p>";
  }
}

function initSlideshows() {
  const containers = document.querySelectorAll('.activity-image, .gallery-item');

  containers.forEach(container => {
    // Select only actual img tags (ignore comments or icons)
    const images = container.querySelectorAll('img');

    if (images.length > 1) {
      // Setup initial state
      images[0].classList.add('active');
      let currentIndex = 0;

      // Cycle every 3.5 seconds
      setInterval(() => {
        images[currentIndex].classList.remove('active');
        currentIndex = (currentIndex + 1) % images.length;
        images[currentIndex].classList.add('active');
      }, 3500);
    }
  });
}

loadNotices();
initSlideshows();
