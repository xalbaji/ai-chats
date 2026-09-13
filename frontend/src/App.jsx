import { useState, useRef, useEffect, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

import {
  Sparkles,
  ArrowUpRight,
  Copy,
  Check,
  MessageSquarePlus,
  Settings,
  Search,
  Images,
  Plug,
  Telescope,
  PanelLeft,
  ChevronDown,
  ExternalLink,
  CircleHelp,
  LogIn,
  Code2,
  PenLine,
  BarChart3,
  Lightbulb,
  ThumbsUp,
  ThumbsDown,
  Share2,
  Clock,
  MessageSquare,
  CirclePlus,
  Send,
  Download,
  FileText,
  X,
  Reply,
} from 'lucide-react';
import './App.css';
import { AppLogo } from './components/AppLogo';
import { AuthPanel } from './components/AuthPanel';
import {
  Attachment,
  AttachmentAction,
  AttachmentActions,
  AttachmentContent,
  AttachmentDescription,
  AttachmentMedia,
  AttachmentTitle,
} from './components/ui/attachment';
import { PricingCard } from './components/ui/pricing-card';
import { ShimmerDemo } from './components/ui/shimmer';
import { Marker, MarkerContent, MarkerIcon } from './components/ui/marker';
import { Spinner } from './components/ui/spinner';
import { InputGroup, InputGroupAddon, InputGroupInput } from './components/ui/input-group';
import { Avatar, AvatarBadge, AvatarFallback } from './components/ui/avatar';
import {
  AnimatedThemeToggler,
  Meteors,
  SmoothCursor,
  TypingAnimation,
} from './components/ui/magicui';

const normalizeStoredSession = (session) => ({
  ...session,
  messages: (session.messages || []).map((message) => ({
    ...message,
    timestamp: message.timestamp ? new Date(message.timestamp) : new Date(),
  })),
});

const normalizeStoredSessions = (sessionsList) => {
  if (!Array.isArray(sessionsList)) return [];
  return sessionsList.map(normalizeStoredSession);
};

const API_BASE_URL = process.env.REACT_APP_API_URL || (
  process.env.NODE_ENV === 'production'
    ? 'https://ai-chats-5c1s.onrender.com'
    : 'http://localhost:5000'
);

const formatFileSize = (bytes = 0) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const createWelcomeSession = () => ({
  id: Date.now(),
  title: 'New chat',
  messages: [{
    id: Date.now() + 1,
    role: 'assistant',
    content: "Hello! I'm your AI assistant. How can I help you today?",
    timestamp: new Date(),
  }],
});

const createClientId = () => {
  if (window.crypto?.randomUUID) return window.crypto.randomUUID();
  return `client_${Date.now()}_${Math.random().toString(36).slice(2)}`;
};

export default function App() {
  const [auth, setAuth] = useState(() => {
    try { return JSON.parse(localStorage.getItem('nivo_auth') || 'null'); } catch { return null; }
  });
  const [showAuth, setShowAuth] = useState(false);
  const [clientId] = useState(() => {
    const stored = localStorage.getItem('nivo_client_id');
    if (stored) return stored;
    const created = createClientId();
    localStorage.setItem('nivo_client_id', created);
    return created;
  });
  const sessionsLoadedRef = useRef(false);
  const [sessions, setSessions] = useState(() => {
    try {
      const saved = localStorage.getItem('chat_sessions');
      if (saved) {
        const parsed = JSON.parse(saved);
        const normalized = normalizeStoredSessions(parsed);
        if (normalized.length > 0) {
          return normalized;
        }
      }
    } catch (error) {
      console.warn('Failed to load saved sessions:', error);
    }

    return [
      {
        id: Date.now(),
        title: 'New chat',
        messages: [
          {
            id: 1,
            role: 'assistant',
            content: "Hello! I'm your AI assistant. How can I help you today?",
            timestamp: new Date(),
          },
        ],
      },
    ];
  });
  const [currentSessionId, setCurrentSessionId] = useState(() => {
    try {
      const saved = localStorage.getItem('chat_sessions');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed[0].id;
        }
      }
    } catch (error) {
      console.warn('Failed to restore active session:', error);
    }

    return Date.now();
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [input, setInput] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMode, setLoadingMode] = useState('thinking');
  const [copiedId, setCopiedId] = useState(null);
  const [showSidebar, setShowSidebar] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [activeView, setActiveView] = useState('chat');
  const [settings, setSettings] = useState({
    compactMode: false,
    soundOn: true,
    saveHistory: true,
    autoImageGen: true,
    preferredModel: 'Gemini 2.5 Flash',
  });
  const [isActivelyTyping, setIsActivelyTyping] = useState(false);
  const [replyTarget, setReplyTarget] = useState(null);
  // IDs of assistant messages whose typing animation has completed
  const [animatedMsgIds, setAnimatedMsgIds] = useState(() => new Set());

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const suggestions = [
    { icon: Code2, label: 'Write code', color: '#4f46e5', prompt: 'Write a React component for a todo list with Tailwind' },
    { icon: PenLine, label: 'Draft email', color: '#0891b2', prompt: 'Draft a professional email requesting time off' },
    { icon: BarChart3, label: 'Analyze data', color: '#059669', prompt: 'Explain how to analyze quarterly sales trends' },
    { icon: Lightbulb, label: 'Brainstorm', color: '#d97706', prompt: 'Give me 10 creative startup ideas' },
  ];

  const currentSession = sessions.find((session) => session.id === currentSessionId) || sessions[0];
  const messages = useMemo(() => currentSession?.messages || [], [currentSession]);
  const filteredSessions = sessions.filter((session) => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return true;

    const title = (session.title || '').toLowerCase();
    const matchesTitle = title.includes(query);
    const matchesContent = (session.messages || []).some((message) =>
      (message.content || '').toLowerCase().includes(query)
    );

    return matchesTitle || matchesContent;
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (messages.length > 1) {
      scrollToBottom();
    }
  }, [messages]);

  useEffect(() => {
    if (!sessionsLoadedRef.current) return;
    localStorage.setItem('chat_sessions', JSON.stringify(sessions));
    if (!auth?.token) {
      localStorage.setItem('chat_sessions', JSON.stringify(sessions));
      return;
    }
    fetch(`${API_BASE_URL}/api/sessions`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${auth?.token}`,
      },
      body: JSON.stringify({ sessions }),
    }).catch((error) => console.warn('Cloud chat history is unavailable:', error));
  }, [auth, clientId, sessions]);

  useEffect(() => {
    let cancelled = false;

    const loadCloudSessions = async () => {
      if (!auth?.token) {
        sessionsLoadedRef.current = true;
        return;
      }
      try {
        const response = await fetch(`${API_BASE_URL}/api/sessions`, {
          headers: { Authorization: `Bearer ${auth.token}` },
        });
        if (!response.ok) throw new Error('Cloud history unavailable');
        const data = await response.json();
        if (!cancelled) {
          const restored = Array.isArray(data.sessions) && data.sessions.length > 0
            ? normalizeStoredSessions(data.sessions)
            : [createWelcomeSession()];
          setSessions(restored);
          setCurrentSessionId(restored[0].id);
        }
      } catch (error) {
        console.warn('Using local chat history:', error);
      } finally {
        if (!cancelled) sessionsLoadedRef.current = true;
      }
    };

    loadCloudSessions();
    return () => { cancelled = true; };
  }, [auth, clientId]);

  useEffect(() => { inputRef.current?.focus(); }, []);

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('nivo_auth');
    const guestSession = {
      id: Date.now(),
      title: 'New chat',
      messages: [{
        id: Date.now() + 1,
        role: 'assistant',
        content: "Hello! I'm your AI assistant. How can I help you today?",
        timestamp: new Date(),
      }],
    };
    sessionsLoadedRef.current = true;
    setSessions([guestSession]);
    setCurrentSessionId(guestSession.id);
    setAuth(null);
    setShowAuth(false);
  };

  const handleAuthenticated = (data) => {
    localStorage.setItem('nivo_auth', JSON.stringify(data));
    const welcomeSession = createWelcomeSession();
    setSessions([welcomeSession]);
    setCurrentSessionId(welcomeSession.id);
    sessionsLoadedRef.current = false;
    setAuth(data);
    setShowAuth(false);
  };

  const displayName = auth?.user?.name?.trim() || '';
  const displayInitials = displayName
    ? displayName.split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase()
    : 'G';

  const handleInputChange = (e) => {
    setInput(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 160) + 'px';

    setIsActivelyTyping(true);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      setIsActivelyTyping(false);
    }, 1500);
  };

  const handleFileSelect = (file) => {
    if (!file) return;
    setSelectedImage(file);
    if (file.type.startsWith('image/')) {
      setImagePreview(URL.createObjectURL(file));
    } else {
      setImagePreview(null);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
  };

  const handlePaste = (e) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (const item of Array.from(items)) {
      if (item.type.indexOf('image') !== -1) {
        const file = item.getAsFile();
        if (file) handleFileSelect(file);
        break;
      }
    }
  };

  const removeSelectedImage = () => {
    setSelectedImage(null);
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
      setImagePreview(null);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const getSimulatedResponse = (text) => {
    const lower = text.toLowerCase();
    if (lower.includes('todo') || lower.includes('react')) {
      return `Here is a clean React component for a Todo list built with Tailwind CSS:

\`\`\`jsx
import React, { useState } from 'react';
import { Check, Trash2, Plus } from 'lucide-react';

export default function TodoList() {
  const [todos, setTodos] = useState([
    { id: 1, text: 'Explore interactive fluid canvas background', done: true },
    { id: 2, text: 'Connect JIM AI Assistant API', done: false }
  ]);
  const [text, setText] = useState('');

  const addTodo = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setTodos([...todos, { id: Date.now(), text: text.trim(), done: false }]);
    setText('');
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-slate-900 text-white rounded-2xl shadow-xl border border-slate-800">
      <h2 className="text-xl font-bold mb-4">Todo List</h2>
      <form onSubmit={addTodo} className="flex gap-2 mb-4">
        <input 
          value={text} 
          onChange={(e) => setText(e.target.value)}
          placeholder="New task..."
          className="flex-1 bg-slate-800 px-4 py-2 rounded-lg border border-slate-700 outline-none focus:border-indigo-500"
        />
        <button type="submit" className="p-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg">
          <Plus size={20} />
        </button>
      </form>
    </div>
  );
}
\`\`\`
Let me know if you'd like me to add local storage persistence or filtering!`;
    }

    if (lower.includes('email') || lower.includes('time off')) {
      return `### Subject: Time Off Request – Melvin Suan

Dear [Manager's Name],

I am writing to formally request time off from **[Start Date]** to **[End Date]** for personal reasons. 

Before departing, I will ensure that:
1. All critical deliverables and ongoing sprint tasks are up-to-date.
2. My team members are briefed on ongoing coverage.
3. Relevant handoff documents are shared in our team repository.

Thank you for considering my request. Please let me know if you need any additional details.

Best regards,  
**Melvin Suan**`;
    }

    if (lower.includes('startup') || lower.includes('ideas')) {
      return `Here are **4 high-potential startup ideas** combining modern AI and interactive UX:

1. **Ambient Flow AI**: Real-time fluid neural backgrounds that dynamically visualize biometric focus and brainwave states during deep work sessions.
2. **AutoDoc Synthesizer**: AI pipeline transforming engineering architecture diagrams directly into verified codebases and infrastructure templates.
3. **Adaptive Canvas Tutor**: Interactive STEM learning platform using physics engines and interactive mathematical formulas ($$E = mc^2$$).
4. **Contextual Meeting Agent**: Autonomous meeting note summarizer with instant action-item delegation into Jira/Linear.`;
    }

    return `I received your prompt: **"${text}"**. 

How would you like to proceed? I can help you:
- 🛠️ Write or debug code in JavaScript, React, Python, etc.
- 🎨 Design interactive UI components and animated backgrounds.
- 📊 Analyze data patterns or brainstorm creative concepts.`;
  };

  const handleNewChat = () => {
    const newSession = {
      id: Date.now(),
      title: 'New chat',
      messages: [
        {
          id: Date.now() + 1,
          role: 'assistant',
          content: "Hello! I'm your AI assistant. How can I help you today?",
          timestamp: new Date(),
        },
      ],
    };

    setSessions((prev) => [newSession, ...prev]);
    setCurrentSessionId(newSession.id);
    setSearchQuery('');
  };

  const handleSelectSession = (id) => {
    setCurrentSessionId(id);
    setSearchQuery('');
  };

  const handleDeleteSession = (id) => {
    setSessions((prev) => {
      const filtered = prev.filter((session) => session.id !== id);
      if (filtered.length === 0) {
        const fallback = {
          id: Date.now(),
          title: 'New chat',
          messages: [
            {
              id: Date.now() + 1,
              role: 'assistant',
              content: "Hello! I'm your AI assistant. How can I help you today?",
              timestamp: new Date(),
            },
          ],
        };
        setCurrentSessionId(fallback.id);
        return [fallback];
      }

      if (id === currentSessionId) {
        setCurrentSessionId(filtered[0].id);
      }
      return filtered;
    });
  };

  const sidebarPromptSets = {
    images: [
      'Generate a cinematic portrait of a futuristic cyberpunk cat wearing a neon blue scarf in a studio scene.',
      'Create a realistic fantasy landscape with a glowing lake, mountains, and a golden sunset sky.',
      'Generate a polished product mockup of a premium smartwatch on a dark luxury stand.',
      'Create a realistic superhero poster of a brave woman standing in a dramatic city skyline at night.',
      'Generate a high-detail cartoon scene of a cheerful fox reading a book in a cozy forest cabin.',
    ],
    plugins: [
      'Suggest 3 useful plugins for a modern AI chatbot workspace.',
      'List 5 productivity plugins that would improve a developer AI assistant.',
      'Recommend the best plugins for research, writing, and workflow automation in one AI app.',
      'Suggest tools and plugins for building a smarter AI productivity dashboard.',
      'Give me creative plugin ideas for a premium chatbot interface with team collaboration features.',
    ],
    research: [
      'Do a deep research summary on how AI chatbots improve business productivity.',
      'Research the latest trends in multimodal AI and summarize the biggest opportunities for startups.',
      'Give me a concise research overview of how AI assistants are transforming customer support workflows.',
      'Summarize the most important business impacts of generative AI across marketing, operations, and product.',
      'Research how AI copilots are changing software development teams and explain the top benefits.',
    ],
  };

  const getRandomSidebarPrompt = (type) => {
    const prompts = sidebarPromptSets[type] || [];
    if (!prompts.length) return 'Help me with something useful today.';
    return prompts[Math.floor(Math.random() * prompts.length)];
  };

  const triggerSidebarPrompt = (prompt) => {
    setActiveView('chat');
    setInput(prompt);
    inputRef.current?.focus();
  };

  const openSettingsPage = () => {
    setActiveView('settings');
  };

  const openPricingPage = () => {
    setActiveView('pricing');
  };

  const openHelpPage = () => {
    setActiveView('help');
  };

  const handleSend = async (overrideText) => {
    const rawText = overrideText || input;
    const text = rawText.trim();
    if ((!text && !selectedImage && !replyTarget?.imageUrl && !replyTarget?.generatedImage) || isLoading) return;

    const replyInstruction = replyTarget?.content ? text : text;

    const shouldShowDrawing = /(?:generate|create|draw|make|render|design|add|change).*(?:image|photo|picture|poster|portrait|scene|art|illustration|background|bowtie|hat|glasses|shirt)|(?:enhance|improve|upscale|beautify|fix).*?(?:image|photo|picture)/i.test(text) || Boolean(selectedImage?.type?.startsWith('image/'));
    const shouldWaitForImage = shouldShowDrawing || Boolean(selectedImage) || Boolean(replyTarget?.imageUrl || replyTarget?.generatedImage);

    setLoadingMode(shouldShowDrawing ? 'drawing' : 'thinking');
    const requestStart = Date.now();
    let responseHasImage = false;

    let uploadedImage = selectedImage;
    const replyTargetImageUrl = replyTarget?.imageUrl || replyTarget?.generatedImage || null;

    if (!uploadedImage && replyTargetImageUrl) {
      try {
        const imageResponse = await fetch(replyTargetImageUrl);
        const blob = await imageResponse.blob();
        uploadedImage = new File([blob], 'reply-target-image.png', {
          type: blob.type || 'image/png',
        });
      } catch (error) {
        console.warn('Failed to fetch reply target image:', error);
      }
    }

    const userMsg = {
      id: Date.now(),
      role: 'user',
      content: replyInstruction,
      image: imagePreview || replyTargetImageUrl,
      fileName: selectedImage?.name || null,
      fileType: selectedImage?.type || null,
      timestamp: new Date(),
    };

    const sessionForRequest = currentSession || createWelcomeSession();
    const responseSessionId = currentSession?.id || sessionForRequest.id;
    const activeMessages = sessionForRequest.messages || [];
    const sessionMessages = [...activeMessages, userMsg];

    setSessions((prev) => {
      const hasCurrentSession = prev.some((session) => session.id === responseSessionId);
      const sourceSessions = hasCurrentSession ? prev : [sessionForRequest];
      const targetId = responseSessionId;
      if (!hasCurrentSession) setCurrentSessionId(targetId);
      return sourceSessions.map((session) => {
      if (session.id !== targetId) return session;

      const title = session.title === 'New chat' ? text.trim().slice(0, 28) : session.title;
      return {
        ...session,
        title,
        messages: sessionMessages,
      };
      });
    });

    const historyPayload = sessionMessages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    setInput('');
    setSelectedImage(null);
    setImagePreview(null);
    setReplyTarget(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (inputRef.current) inputRef.current.style.height = 'auto';
    setIsLoading(true);

    try {
      let res;

      if (uploadedImage) {
        const formData = new FormData();
        formData.append('message', userMsg.content || 'Explain this image');
        formData.append('file', uploadedImage);
        formData.append('history', JSON.stringify(historyPayload));
        res = await fetch(`${API_BASE_URL}/api/chat`, {
          method: 'POST',
          body: formData,
        });
      } else {
        res = await fetch(`${API_BASE_URL}/api/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: userMsg.content,
            history: historyPayload,
          }),
        });
      }

      if (!res.ok) throw new Error('API request failed');
      const data = await res.json();
      const imageUrl = data.generatedImage || data.imageUrl || null;
      responseHasImage = Boolean(imageUrl);

      const botMsg = {
        id: Date.now() + 1,
        role: 'assistant',
        content: data.reply,
        generatedImage: imageUrl,
        imageUrl,
        generatedFile: data.generatedFile || null,
        timestamp: new Date(),
      };

      setSessions((prev) => prev.map((session) => {
        if (session.id !== responseSessionId) return session;
        return {
          ...session,
          messages: [...session.messages, botMsg],
        };
      }));
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 800));
      const simulatedReply = getSimulatedResponse(userMsg.content);
      setSessions((prev) => prev.map((session) => {
        if (session.id !== responseSessionId) return session;
        return {
          ...session,
          messages: [
            ...session.messages,
            {
              id: Date.now() + 1,
              role: 'assistant',
              content: simulatedReply,
              timestamp: new Date(),
            },
          ],
        };
      }));
    } finally {
      const elapsed = Date.now() - requestStart;
      const minDelay = shouldWaitForImage ? 900 : 500;
      const imageRenderDelay = shouldWaitForImage && responseHasImage ? 450 : 0;
      const totalDelay = Math.max(0, minDelay - elapsed) + imageRenderDelay;

      if (totalDelay > 0) {
        await new Promise((resolve) => setTimeout(resolve, totalDelay));
      }
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const downloadImage = async (imageUrl, messageId) => {
    if (!imageUrl) return;

    const filename = `nivo-ai-image-${messageId || Date.now()}.png`;

    try {
      const response = await fetch(imageUrl);
      if (!response.ok) throw new Error('Image download failed');
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = objectUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(objectUrl);
    } catch (error) {
      // Remote providers may block CORS; let the browser handle the fallback.
      const link = document.createElement('a');
      link.href = imageUrl;
      link.download = filename;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      link.remove();
    }
  };

  const downloadFile = (file, messageId) => {
    if (!file?.content) return;
    const blob = new Blob([file.content], { type: file.mimeType || 'text/plain' });
    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = objectUrl;
    link.download = file.name || `nivo-ai-file-${messageId || Date.now()}.txt`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(objectUrl);
  };

  const formatTime = (date) => {
    const safeDate = date instanceof Date ? date : new Date(date);
    if (Number.isNaN(safeDate.getTime())) {
      return 'Now';
    }
    return safeDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const isConsecutive = (index) => {
    if (index === 0) return false;
    return messages[index].role === messages[index - 1].role;
  };

  const isWelcomeVisible = messages.length === 0 || (messages.length === 1 && messages[0].role === 'assistant');
  const isUserTyping = input.trim().length > 0 || isActivelyTyping;

  const renderPageView = () => {
    if (activeView === 'settings') {
      return (
        <div className="page-shell settings-page">
          <div className="page-header-row">
            <div>
              <p className="page-eyebrow">Preferences</p>
              <h2 className="page-title">Settings</h2>
            </div>
            <button className="secondary-btn" onClick={() => setActiveView('chat')}>Back to chat</button>
          </div>

          <div className="settings-grid">
            <div className="setting-card">
              <div className="setting-row">
                <div>
                  <h3>Dark mode</h3>
                  <p>Switch between dark and light themes.</p>
                </div>
                <AnimatedThemeToggler
                  isDark={darkMode}
                  onToggle={(val) => setDarkMode(val)}
                />
              </div>

              <div className="setting-row">
                <div>
                  <h3>Compact layout</h3>
                  <p>Reduce spacing for a denser chat view.</p>
                </div>
                <button
                  className={`toggle ${settings.compactMode ? 'on' : ''}`}
                  onClick={() => setSettings((prev) => ({ ...prev, compactMode: !prev.compactMode }))}
                  aria-label="Toggle compact mode"
                >
                  <span className="toggle-knob" />
                </button>
              </div>

              <div className="setting-row">
                <div>
                  <h3>Sound alerts</h3>
                  <p>Play notification sounds for responses.</p>
                </div>
                <button
                  className={`toggle ${settings.soundOn ? 'on' : ''}`}
                  onClick={() => setSettings((prev) => ({ ...prev, soundOn: !prev.soundOn }))}
                  aria-label="Toggle sound alerts"
                >
                  <span className="toggle-knob" />
                </button>
              </div>
            </div>

            <div className="setting-card">
              <div className="setting-select-wrap">
                <label htmlFor="model-select">Preferred model</label>
                <select
                  id="model-select"
                  value={settings.preferredModel}
                  onChange={(e) => setSettings((prev) => ({ ...prev, preferredModel: e.target.value }))}
                >
                  <option>Gemini 2.5 Flash</option>
                  <option>GPT-4o mini</option>
                  <option>Claude 3.5 Sonnet</option>
                  <option>Local model</option>
                </select>
              </div>

              <div className="setting-row">
                <div>
                  <h3>Save chat history</h3>
                  <p>Keep your conversations across sessions.</p>
                </div>
                <button
                  className={`toggle ${settings.saveHistory ? 'on' : ''}`}
                  onClick={() => setSettings((prev) => ({ ...prev, saveHistory: !prev.saveHistory }))}
                  aria-label="Toggle save chat history"
                >
                  <span className="toggle-knob" />
                </button>
              </div>

              <div className="setting-row">
                <div>
                  <h3>Auto image generation</h3>
                  <p>Generate images automatically when the prompt fits.</p>
                </div>
                <button
                  className={`toggle ${settings.autoImageGen ? 'on' : ''}`}
                  onClick={() => setSettings((prev) => ({ ...prev, autoImageGen: !prev.autoImageGen }))}
                  aria-label="Toggle auto image generation"
                >
                  <span className="toggle-knob" />
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (activeView === 'pricing') {
      return (
        <div className="page-shell pricing-page">
          <div className="page-header-row">
            <div>
              <p className="page-eyebrow">Plans</p>
              <h2 className="page-title">See plans and pricing</h2>
            </div>
            <button className="secondary-btn" onClick={() => setActiveView('chat')}>Back to chat</button>
          </div>

          <div className="pricing-grid">
            <PricingCard
              title="Starter"
              badge="Free"
              description="Basic AI tools for everyday tasks."
              price="$0"
              period=""
              features={[
                "Basic chat access",
                "Limited image creation",
                "Community support",
              ]}
              upcomingFeature={null}
              buttonText="Current plan"
            />

            <PricingCard
              title="Pro"
              badge="Popular"
              description="For users who need maximum power."
              price="$12"
              period="/mo"
              features={[
                "Unlimited prompts",
                "Priority image generation",
                "Advanced tools",
              ]}
              upcomingFeature="SSO (coming soon)"
              buttonText="Get started"
            />
          </div>
        </div>
      );
    }

    if (activeView === 'help') {
      return (
        <div className="page-shell help-page">
          <div className="page-header-row">
            <div>
              <p className="page-eyebrow">Support</p>
              <h2 className="page-title">Help</h2>
            </div>
            <button className="secondary-btn" onClick={() => setActiveView('chat')}>Back to chat</button>
          </div>

          <div className="help-box">
            <h3>Need help?</h3>
            <p>Try one of these quick fixes:</p>
            <ul>
              <li>Refresh the page if the app stops responding.</li>
              <li>Check the backend server is running on port 5000.</li>
              <li>Use a shorter message if the model is overloaded.</li>
              <li>Open Settings to adjust model and preferences.</li>
            </ul>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className={`app-container ${darkMode ? 'dark' : 'light'}`}>
      <SmoothCursor />
      <Meteors number={30} />
      {/* SIDEBAR */}
      <aside className={`sidebar ${showSidebar ? 'open' : 'closed'}`}>
        <div className="sidebar-top">
          <div className="brand">
            <div className="brand-badge">
              <img className="sidebar-brand-logo" src="/nivoai-logo-transparent.png" alt="NivoAi" />
            </div>
            <button className="sidebar-collapse-btn" onClick={() => setShowSidebar(false)} aria-label="Close sidebar">
              <PanelLeft size={18} strokeWidth={1.7} />
            </button>
          </div>

          <button className="new-chat-btn" onClick={handleNewChat}>
            <MessageSquarePlus size={18} strokeWidth={1.8} />
            <span>New chat</span>
          </button>

          <InputGroup className="sidebar-search-container">
            <InputGroupAddon>
              <Search size={17} strokeWidth={1.8} className="sidebar-search-icon" />
            </InputGroupAddon>
            <InputGroupInput
              type="text"
              placeholder="Search chats..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search chats"
            />
            {searchQuery.trim() && (
              <InputGroupAddon align="inline-end" className="search-result-count">
                {filteredSessions.length}
              </InputGroupAddon>
            )}
          </InputGroup>
          <button className="nav-item" onClick={() => triggerSidebarPrompt(getRandomSidebarPrompt('images'))}>
            <Images size={18} strokeWidth={1.8} /><span>Images</span>
          </button>
          <button className="nav-item" onClick={() => triggerSidebarPrompt(getRandomSidebarPrompt('plugins'))}>
            <Plug size={18} strokeWidth={1.8} /><span>Plugins</span>
          </button>
          <button className="nav-item" onClick={() => triggerSidebarPrompt(getRandomSidebarPrompt('research'))}>
            <Telescope size={18} strokeWidth={1.8} /><span>Deep research</span>
          </button>
        </div>

        <div className="sidebar-scroll">
          <div className="history-list">
            <div className="history-section-title">Recent</div>
            {filteredSessions.map((session) => (
              <div
                key={session.id}
                className={`history-item ${session.id === currentSessionId ? 'active' : ''}`}
                onClick={() => handleSelectSession(session.id)}
              >
                <MessageSquare size={14} strokeWidth={2} className="history-icon" />
                <div className="history-body">
                  <span className="history-title">
                    {(session.title || 'New chat').length > 25
                      ? `${(session.title || 'New chat').substring(0, 25)}...`
                      : (session.title || 'New chat')}
                  </span>
                  <span className="history-meta">{(session.messages || []).length} messages</span>
                </div>
                <button
                  className="history-delete-btn"
                  onClick={(event) => {
                    event.stopPropagation();
                    handleDeleteSession(session.id);
                  }}
                  aria-label={`Delete ${session.title || 'chat'}`}
                  title="Delete chat"
                >
                  ×
                </button>
                {session.id === currentSessionId && <div className="history-active-dot" />}
              </div>
            ))}
            {filteredSessions.length === 0 && (
              <div className="history-empty">No matching chats</div>
            )}
          </div>
        </div>

        <div className="sidebar-bottom">
          <button className="menu-item" onClick={openPricingPage}>
            <span><span className="menu-icon"><Sparkles size={17} strokeWidth={1.8} /></span>See plans and pricing</span>
            <ExternalLink size={14} strokeWidth={1.8} />
          </button>
          <button className="menu-item" onClick={openSettingsPage}>
            <span><span className="menu-icon"><Settings size={17} strokeWidth={1.8} /></span>Settings</span>
          </button>
          <button className="menu-item" onClick={openHelpPage}>
            <span><span className="menu-icon"><CircleHelp size={17} strokeWidth={1.8} /></span>Help</span><ExternalLink size={14} strokeWidth={1.8} />
          </button>
          <div className="login-prompt">
            {auth?.token && (
              <div className="account-summary">
                <Avatar className="account-avatar"><AvatarFallback>{displayInitials}</AvatarFallback></Avatar>
                <strong>{displayName}</strong>
              </div>
            )}
            {!auth?.token && <strong>Guest workspace</strong>}
            <p>{auth?.user?.email || 'Sign in to save chats across devices.'}</p>
            {auth?.token ? (
              <button className="login-btn" onClick={handleLogout}><LogIn size={16} strokeWidth={1.8} />Log out</button>
            ) : (
              <button className="login-btn" onClick={() => setShowAuth(true)}><LogIn size={16} strokeWidth={1.8} />Log in</button>
            )}
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="main-content">
        <header className="main-header">
          <div className="header-left">
            <button
              className="header-btn"
              onClick={() => setShowSidebar(!showSidebar)}
              aria-label={showSidebar ? 'Close sidebar' : 'Open sidebar'}
            >
              <PanelLeft size={18} strokeWidth={1.7} />
            </button>
            <div className="header-title-group">
              <div className="header-title">NivoAi <ChevronDown size={15} strokeWidth={1.8} /></div>
            </div>
          </div>
        </header>

        {activeView !== 'chat' ? (
          renderPageView()
        ) : (
          <div className="chat-scroll">
            {/* WELCOME SCREEN */}
            {isWelcomeVisible && (
              <div className="welcome-wrap">
                <div className="welcome-hero">
                  <div className="hero-mark">
                    <AppLogo size={44} rounded="14px" glow={true} />
                  </div>
                  <h1 className="hero-title">
                    How can I help you <br />
                    <span className="italic-text">{displayName ? `today, ${displayName}?` : 'today?'}</span>
                  </h1>
                  <p className="hero-desc">
                    Ask me anything — coding, writing, analysis, brainstorming, or image generation.
                  </p>
                </div>

                <div className="suggestion-grid">
                  {suggestions.map((s, i) => (
                    <button
                      key={i}
                      className="suggestion-tile"
                      onClick={() => handleSend(s.prompt)}
                      style={{ animationDelay: `${0.1 + i * 0.06}s` }}
                    >
                      <div className="tile-icon" style={{ '--tile-color': s.color }}>
                        <s.icon size={17} strokeWidth={2.1} />
                      </div>
                      <div className="tile-body">
                        <span className="tile-label">{s.label}</span>
                        <span className="tile-desc">{s.prompt}</span>
                      </div>
                      <ArrowUpRight size={14} strokeWidth={2} className="tile-arrow" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* MESSAGE FEED */}
            {!isWelcomeVisible && (
              <div className="message-list">
              {messages.map((msg, index) => {
                const consecutive = isConsecutive(index);
                return (
                  <div
                    key={msg.id}
                    className={`msg-row ${msg.role} ${consecutive ? 'consecutive' : ''}`}
                  >
                    {!consecutive && (
                      <div className="msg-avatar-wrap">
                        <Avatar className={`msg-avatar ${msg.role}`}>
                          {msg.role === 'assistant' ? (
                            <AppLogo size={36} rounded="12px" glow={true} />
                          ) : null}
                          {msg.role === 'user' && <AvatarFallback>{displayInitials}</AvatarFallback>}
                          {msg.role === 'assistant' && <AvatarBadge aria-label="Online" />}
                        </Avatar>
                      </div>
                    )}
                    {consecutive && <div className="msg-avatar-spacer" />}

                    <div className="msg-body">
                      {!consecutive && (
                        <div className="msg-meta">
                          <span className="msg-author">
                            {msg.role === 'user' ? (displayName || 'Guest') : 'NivoAi'}
                          </span>
                          <span className="msg-time">
                            <Clock size={10} strokeWidth={2} />
                            {formatTime(msg.timestamp)}
                          </span>
                        </div>
                      )}
                      <div className="msg-bubble">
                        {msg.image && (
                          <div className="msg-image-attachment">
                            <img src={msg.image} alt="Uploaded attachment" />
                          </div>
                        )}

                        {(msg.imageUrl || msg.generatedImage) && (
                          <div className="msg-generated-image">
                            <img src={msg.imageUrl || msg.generatedImage} alt="Generated content" />
                            <button
                              className="generated-image-download"
                              onClick={() => downloadImage(msg.imageUrl || msg.generatedImage, msg.id)}
                              title="Download image"
                              aria-label="Download generated image"
                              type="button"
                            >
                              <Download size={16} strokeWidth={2} />
                            </button>
                          </div>
                        )}

                        {msg.fileName && !msg.image && (
                          <div className="msg-file-attachment">
                            <FileText size={16} aria-hidden="true" />
                            <span>{msg.fileName}</span>
                          </div>
                        )}

                        {msg.generatedFile && (
                          <button
                            className="generated-file-download"
                            onClick={() => downloadFile(msg.generatedFile, msg.id)}
                            type="button"
                          >
                            <FileText size={16} strokeWidth={1.8} />
                            <span>{msg.generatedFile.name || 'Download generated file'}</span>
                            <Download size={15} strokeWidth={2} />
                          </button>
                        )}

                        {msg.role === 'assistant' ? (() => {
                          // Find the id of the very last assistant message
                          const lastAssistantMsg = [...messages].reverse().find(m => m.role === 'assistant');
                          const isLatest = lastAssistantMsg?.id === msg.id;
                          const isDone = animatedMsgIds.has(msg.id);

                          // Already animated or not the latest → full markdown
                          if (!isLatest || isDone) {
                            return (
                              <ReactMarkdown
                                remarkPlugins={[remarkGfm, remarkMath]}
                                rehypePlugins={[rehypeKatex]}
                                components={{
                                  h1: ({ children, ...props }) => <h1 className="markdown-h1" {...props}>{children}</h1>,
                                  h2: ({ children, ...props }) => <h2 className="markdown-h2" {...props}>{children}</h2>,
                                  h3: ({ children, ...props }) => <h3 className="markdown-h3" {...props}>{children}</h3>,
                                  p: ({ ...props }) => <p className="markdown-p" {...props} />,
                                  ul: ({ ...props }) => <ul className="markdown-ul" {...props} />,
                                  ol: ({ ...props }) => <ol className="markdown-ol" {...props} />,
                                  li: ({ ...props }) => <li className="markdown-li" {...props} />,
                                  code: ({ className, children, ...props }) => {
                                    const isInline = !className && typeof children === 'string' && !children.includes('\n');
                                    return isInline ? (
                                      <code className="markdown-inline-code" {...props}>
                                        {children}
                                      </code>
                                    ) : (
                                      <pre className="markdown-code-block">
                                        <code className={className} {...props}>
                                          {children}
                                        </code>
                                      </pre>
                                    );
                                  },
                                }}
                              >
                                {msg.content}
                              </ReactMarkdown>
                            );
                          }

                          // Latest message — animate it
                          return (
                            <TypingAnimation
                              key={msg.id}
                              text={msg.content}
                              duration={14}
                              onComplete={() =>
                                setAnimatedMsgIds(prev => new Set([...prev, msg.id]))
                              }
                            />
                          );
                        })() : (
                          <p className="markdown-p">{msg.content}</p>
                        )}
                      </div>

                      {msg.role === 'assistant' && (
                        <div className="msg-toolbar">
                          <button
                            className="tool-btn"
                            onClick={() => copyToClipboard(msg.content, msg.id)}
                            title="Copy to clipboard"
                          >
                            {copiedId === msg.id ? (
                              <Check size={12} strokeWidth={2} />
                            ) : (
                              <Copy size={12} strokeWidth={2} />
                            )}
                            <span>{copiedId === msg.id ? 'Copied' : 'Copy'}</span>
                          </button>
                          <button
                            className="tool-btn"
                            onClick={() => setReplyTarget(msg)}
                            title="Reply to this message"
                          >
                            <Reply size={12} strokeWidth={2} />
                            <span>Reply</span>
                          </button>
                          <button className="tool-btn" title="Helpful">
                            <ThumbsUp size={12} strokeWidth={2} />
                          </button>
                          <button className="tool-btn" title="Not helpful">
                            <ThumbsDown size={12} strokeWidth={2} />
                          </button>
                          <button className="tool-btn" title="Share">
                            <Share2 size={12} strokeWidth={2} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {isLoading && (
                <div className="msg-row assistant">
                  <div className="msg-avatar-wrap">
                    <Avatar className="msg-avatar assistant">
                      <AppLogo size={36} rounded="12px" glow={true} />
                      <AvatarBadge aria-label="Online" />
                    </Avatar>
                  </div>
                  <div className="msg-body">
                    {loadingMode === 'drawing' ? (
                      <div className="typing-box drawing-mode">
                        <div className="loading-icon-wrap">
                          <PenLine size={14} strokeWidth={2.2} className="loading-icon" />
                        </div>
                        <ShimmerDemo>NivoAi is drawing…</ShimmerDemo>
                      </div>
                    ) : (
                      <Marker role="status" className="ai-thinking-marker">
                        <MarkerIcon><Spinner /></MarkerIcon>
                        <MarkerContent><ShimmerDemo /></MarkerContent>
                      </Marker>
                    )}
                  </div>
                </div>
              )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
        )}

        {activeView === 'chat' && (
          <div className="chat-footer">
            {/* DYNAMIC STATUS BAR */}
            {(isUserTyping || isLoading) && (
              <div className="chat-status-bar">
                {isUserTyping && !isLoading && (
                  <div className="status-pill typing">
                    <span className="pill-pulse-dot" />
                    <span>Neural Pulse Active · Drafting prompt...</span>
                  </div>
                )}
                {isLoading && (
                  <div className="status-pill processing">
                    <span className="pill-pulse-dot" />
                    <span>
                      {loadingMode === 'drawing'
                        ? 'Rendering your image...'
                        : '3D Neural Core synthesizing response...'}
                    </span>
                  </div>
                )}
              </div>
            )}

            <div
              className={`input-shell ${isUserTyping && !isLoading ? 'is-typing neural-pulse' : ''} ${isLoading ? 'is-processing' : ''}`}
            >
              {isLoading && <div className="processing-indicator-line" />}

              {replyTarget && (
                <div className="reply-context-bar">
                  <span className="reply-context-label">Replying to:</span>
                  <span className="reply-context-text">{replyTarget.content.replace(/\s+/g, ' ').trim().slice(0, 90)}{replyTarget.content.length > 90 ? '…' : ''}</span>
                  <button className="reply-clear-btn" onClick={() => setReplyTarget(null)} type="button">Cancel</button>
                </div>
              )}

              {selectedImage && (
                <div className="image-preview-bar">
                  <Attachment className="composer-attachment" orientation="horizontal">
                    <AttachmentMedia variant={imagePreview ? 'image' : 'file'}>
                      {imagePreview ? (
                        <img src={imagePreview} alt={`Preview of ${selectedImage.name || 'attached image'}`} />
                      ) : (
                        <FileText size={20} aria-hidden="true" />
                      )}
                    </AttachmentMedia>
                    <AttachmentContent>
                      <AttachmentTitle>{selectedImage?.name || 'Attached image'}</AttachmentTitle>
                      <AttachmentDescription>
                        {(selectedImage?.type || 'image').split('/').pop().toUpperCase()} · {formatFileSize(selectedImage?.size)}
                      </AttachmentDescription>
                    </AttachmentContent>
                    <AttachmentActions>
                      <AttachmentAction onClick={removeSelectedImage} aria-label="Remove attachment" title="Remove attachment">
                        <X size={15} strokeWidth={2} />
                      </AttachmentAction>
                    </AttachmentActions>
                  </Attachment>
                </div>
              )}

              <div className="input-box">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  accept="*/*"
                  style={{ display: 'none' }}
                />
                <button
                  className="input-attach-btn"
                  onClick={() => fileInputRef.current?.click()}
                  title="Attach a file or document"
                  type="button"
                >
                  <CirclePlus size={23} strokeWidth={1.5} />
                </button>

                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  onPaste={handlePaste}
                  placeholder={
                    isLoading
                      ? 'AI is generating a response...'
                      : 'Message NivoAi...'
                  }
                  rows={1}
                  disabled={isLoading}
                  aria-label="Message input"
                />
                <button
                  className={`send-fab ${(input.trim() || selectedImage) && !isLoading ? 'active' : ''}`}
                  onClick={() => handleSend()}
                  disabled={(!input.trim() && !selectedImage) || isLoading}
                  aria-label="Send message"
                >
                  <Send size={18} strokeWidth={1.5} />
                </button>
              </div>
            </div>
            <p className="footer-note">AI can make mistakes. Consider verifying important information.</p>
          </div>
        )}
      </main>
      {showAuth && <AuthPanel onAuthenticated={handleAuthenticated} onClose={() => setShowAuth(false)} />}
    </div>
  );
}
