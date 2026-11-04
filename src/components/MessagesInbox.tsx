import { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Send, Search, Inbox, ArrowLeft, CheckCheck, Clock,
  Utensils, Heart, Store, Building2, Mail, MailOpen, Circle,
} from 'lucide-react';
import { easeOutExpo } from '@/lib/animations';
import { playSound } from '@/lib/sounds';

type SenderRole = 'donor' | 'volunteer' | 'ngo' | 'restaurant';

interface Message {
  id: string;
  fromMe: boolean;
  text: string;
  time: string;
  read: boolean;
}

interface Conversation {
  id: string;
  name: string;
  avatar: string;
  role: SenderRole;
  roleLabel: string;
  preview: string;
  timestamp: string;
  unread: number;
  messages: Message[];
}

const ROLE_STYLES: Record<SenderRole, { icon: typeof Utensils; color: string; bg: string }> = {
  donor: { icon: Utensils, color: 'text-orange-dark', bg: 'bg-orange' },
  volunteer: { icon: Heart, color: 'text-forest', bg: 'bg-forest' },
  ngo: { icon: Building2, color: 'text-forest', bg: 'bg-forest-light' },
  restaurant: { icon: Store, color: 'text-orange-dark', bg: 'bg-orange-dark' },
};

const AVATAR_COLORS = ['bg-forest', 'bg-orange', 'bg-forest-light', 'bg-orange-dark', 'bg-dark-light'];

const INITIAL_CONVERSATIONS: Conversation[] = [
  {
    id: 'c1',
    name: 'Bella Trattoria',
    avatar: 'BT',
    role: 'restaurant',
    roleLabel: 'Restaurant',
    preview: 'Hi! We have 80 portions of fresh pasta ready for pickup tonight.',
    timestamp: '2 min ago',
    unread: 2,
    messages: [
      { id: 'm1', fromMe: false, text: 'Hi! We have 80 portions of fresh pasta ready for pickup tonight. Is anyone available to collect?', time: '10:15 AM', read: true },
      { id: 'm2', fromMe: false, text: 'The food was prepared this morning and is still sealed in thermal containers.', time: '10:16 AM', read: false },
      { id: 'm3', fromMe: false, text: 'Pickup window is between 6-8 PM at our Riverside location.', time: '10:17 AM', read: false },
    ],
  },
  {
    id: 'c2',
    name: 'Hope Foundation',
    avatar: 'HF',
    role: 'ngo',
    roleLabel: 'NGO',
    preview: 'Thank you for the delivery yesterday! The families were so grateful.',
    timestamp: '1 hr ago',
    unread: 1,
    messages: [
      { id: 'm1', fromMe: true, text: 'Just dropped off 120 meals at your Old Town shelter. Let me know if you need more this week!', time: 'Yesterday', read: true },
      { id: 'm2', fromMe: false, text: 'Thank you for the delivery yesterday! The families were so grateful. Could we schedule a regular weekly pickup?', time: '9:30 AM', read: false },
    ],
  },
  {
    id: 'c3',
    name: 'Amara Okafor',
    avatar: 'AO',
    role: 'volunteer',
    roleLabel: 'Volunteer',
    preview: 'I can cover the Harbor District route this Saturday.',
    timestamp: '3 hrs ago',
    unread: 0,
    messages: [
      { id: 'm1', fromMe: false, text: 'I can cover the Harbor District route this Saturday. What time should I start?', time: '8:02 AM', read: true },
      { id: 'm2', fromMe: true, text: 'That would be amazing! Pickup is at 11 AM from Green Grocer Co.', time: '8:15 AM', read: true },
      { id: 'm3', fromMe: false, text: 'Got it, I\'ll be there. Thanks for organizing!', time: '8:16 AM', read: true },
    ],
  },
  {
    id: 'c4',
    name: 'Green Grocer Co.',
    avatar: 'GG',
    role: 'donor',
    roleLabel: 'Food Donor',
    preview: 'We\'ll have fresh produce every Tuesday and Thursday from now on.',
    timestamp: 'Yesterday',
    unread: 0,
    messages: [
      { id: 'm1', fromMe: false, text: 'We\'ll have fresh produce every Tuesday and Thursday from now on. Usually around 50-60 kg.', time: 'Yesterday 3:00 PM', read: true },
      { id: 'm2', fromMe: true, text: 'That\'s great news! I\'ll coordinate with the volunteers to set up a regular pickup schedule.', time: 'Yesterday 3:30 PM', read: true },
    ],
  },
  {
    id: 'c5',
    name: 'Sunrise Café',
    avatar: 'SC',
    role: 'restaurant',
    roleLabel: 'Café',
    preview: 'Sorry for the late notice, but we have surplus breakfast items today.',
    timestamp: 'Yesterday',
    unread: 3,
    messages: [
      { id: 'm1', fromMe: false, text: 'Sorry for the late notice, but we have surplus breakfast items today — about 40 servings of pastries and sandwiches.', time: 'Yesterday 11:00 AM', read: false },
      { id: 'm2', fromMe: false, text: 'Best if picked up within 2 hours.', time: 'Yesterday 11:01 AM', read: false },
      { id: 'm3', fromMe: false, text: 'Let me know if anyone is nearby Greenfield!', time: 'Yesterday 11:02 AM', read: false },
    ],
  },
  {
    id: 'c6',
    name: 'Diego Martinez',
    avatar: 'DM',
    role: 'volunteer',
    roleLabel: 'Volunteer',
    preview: 'Route completed! All 15 deliveries done in the East region.',
    timestamp: '2 days ago',
    unread: 0,
    messages: [
      { id: 'm1', fromMe: false, text: 'Route completed! All 15 deliveries done in the East region. Photos uploaded to the system.', time: 'Tuesday 5:00 PM', read: true },
      { id: 'm2', fromMe: true, text: 'Fantastic work, Diego! Thank you for the dedication.', time: 'Tuesday 5:10 PM', read: true },
    ],
  },
];

function Avatar({ conversation, size = 'md' }: { conversation: Conversation; size?: 'sm' | 'md' | 'lg' }) {
  const sizes = {
    sm: 'h-10 w-10 text-xs',
    md: 'h-12 w-12 text-sm',
    lg: 'h-14 w-14 text-base',
  };
  const colorIndex = conversation.id.charCodeAt(1) % AVATAR_COLORS.length;
  return (
    <div className={`flex shrink-0 items-center justify-center rounded-2xl font-extrabold text-white ${sizes[size]} ${AVATAR_COLORS[colorIndex]}`}>
      {conversation.avatar}
    </div>
  );
}

function ConversationItem({
  conversation,
  isSelected,
  onClick,
}: {
  conversation: Conversation;
  isSelected: boolean;
  onClick: () => void;
}) {
  const RoleIcon = ROLE_STYLES[conversation.role].icon;
  return (
    <motion.button
      layout
      onClick={onClick}
      whileHover={{ x: 4 }}
      className={`flex w-full items-start gap-3 rounded-2xl p-3.5 text-left transition ${
        isSelected ? 'bg-forest/8' : 'hover:bg-dark/5'
      }`}
    >
      <div className="relative">
        <Avatar conversation={conversation} />
        <div className={`absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full border-2 border-cream ${ROLE_STYLES[conversation.role].bg}`}>
          <RoleIcon className="h-2.5 w-2.5 text-white" />
        </div>
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <span className={`truncate text-sm ${conversation.unread > 0 ? 'font-extrabold text-dark' : 'font-bold text-dark/80'}`}>
            {conversation.name}
          </span>
          <span className="shrink-0 text-xs text-dark/40">{conversation.timestamp}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className={`text-xs ${ROLE_STYLES[conversation.role].color} font-semibold`}>
            {conversation.roleLabel}
          </span>
        </div>
        <div className="mt-0.5 flex items-center justify-between gap-2">
          <p className={`truncate text-xs ${conversation.unread > 0 ? 'font-semibold text-dark/70' : 'text-dark/45'}`}>
            {conversation.unread > 0 && <Circle className="mr-1 inline h-2 w-2 fill-orange text-orange" />}
            {conversation.preview}
          </p>
          {conversation.unread > 0 && (
            <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-orange px-1.5 text-xs font-extrabold text-white">
              {conversation.unread}
            </span>
          )}
        </div>
      </div>
    </motion.button>
  );
}

export default function MessagesInbox({ onClose, onUnreadChange }: { onClose: () => void; onUnreadChange?: (count: number) => void }) {
  const [conversations, setConversations] = useState<Conversation[]>(INITIAL_CONVERSATIONS);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [replyText, setReplyText] = useState('');
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const scrollRef = useRef<HTMLDivElement>(null);

  const totalUnread = useMemo(() => conversations.reduce((sum, c) => sum + c.unread, 0), [conversations]);

  useEffect(() => {
    onUnreadChange?.(totalUnread);
  }, [totalUnread, onUnreadChange]);

  const filteredConversations = useMemo(() => {
    let list = conversations;
    if (filter === 'unread') list = list.filter((c) => c.unread > 0);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((c) => c.name.toLowerCase().includes(q) || c.preview.toLowerCase().includes(q));
    }
    return list;
  }, [conversations, search, filter]);

  const selected = conversations.find((c) => c.id === selectedId) || null;

  const openConversation = (id: string) => {
    setSelectedId(id);
    setConversations((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, unread: 0, messages: c.messages.map((m) => ({ ...m, read: true })) } : c
      )
    );
  };

  const sendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedId) return;
    playSound('send');
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    setConversations((prev) =>
      prev.map((c) =>
        c.id === selectedId
          ? {
              ...c,
              preview: replyText.trim(),
              timestamp: 'Just now',
              messages: [
                ...c.messages,
                { id: `m${Date.now()}`, fromMe: true, text: replyText.trim(), time: timeStr, read: true },
              ],
            }
          : c
      )
    );
    setReplyText('');
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [selected?.messages.length, selectedId]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (selectedId) setSelectedId(null);
        else onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [selectedId, onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[70] flex flex-col bg-cream"
    >
      {/* Top bar */}
      <div className="flex items-center justify-between border-b border-dark/8 bg-white px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          {selectedId && (
            <button
              onClick={() => setSelectedId(null)}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-dark/5 text-dark transition hover:bg-dark/10 lg:hidden"
              aria-label="Back to conversations"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
          )}
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-forest/12">
            <Inbox className="h-5 w-5 text-forest" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-dark">Messages</h2>
            <p className="text-xs text-dark/45">
              {totalUnread > 0 ? `${totalUnread} unread ${totalUnread === 1 ? 'message' : 'messages'}` : 'All caught up!'}
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-dark/5 text-dark transition hover:bg-dark/10"
          aria-label="Close messages"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Conversation list */}
        <div className={`flex w-full flex-col border-r border-dark/8 bg-white lg:w-[360px] xl:w-[400px] ${selectedId ? 'hidden lg:flex' : 'flex'}`}>
          {/* Search + filter */}
          <div className="space-y-3 border-b border-dark/8 p-4">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-dark/35" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search conversations..."
                className="w-full rounded-xl border border-dark/12 bg-cream/40 py-2.5 pl-10 pr-4 text-sm text-dark placeholder:text-dark/35 focus:border-forest focus:outline-none"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`flex-1 rounded-lg py-2 text-xs font-bold transition ${
                  filter === 'all' ? 'bg-forest text-cream' : 'bg-dark/5 text-dark/55 hover:bg-dark/10'
                }`}
              >
                All ({conversations.length})
              </button>
              <button
                onClick={() => setFilter('unread')}
                className={`flex-1 rounded-lg py-2 text-xs font-bold transition ${
                  filter === 'unread' ? 'bg-orange text-white' : 'bg-dark/5 text-dark/55 hover:bg-dark/10'
                }`}
              >
                Unread {totalUnread > 0 && `(${totalUnread})`}
              </button>
            </div>
          </div>

          {/* List */}
          <div className="flex-1 space-y-1 overflow-y-auto p-2">
            {filteredConversations.length === 0 ? (
              <div className="flex flex-col items-center py-16 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-dark/5">
                  <Mail className="h-8 w-8 text-dark/25" />
                </div>
                <p className="mt-4 font-bold text-dark/50">No conversations found</p>
                <p className="mt-1 text-sm text-dark/35">
                  {filter === 'unread' ? 'No unread messages' : 'Try a different search'}
                </p>
              </div>
            ) : (
              <AnimatePresence mode="popLayout">
                {filteredConversations.map((conv) => (
                  <ConversationItem
                    key={conv.id}
                    conversation={conv}
                    isSelected={conv.id === selectedId}
                    onClick={() => openConversation(conv.id)}
                  />
                ))}
              </AnimatePresence>
            )}
          </div>

          <div className="border-t border-dark/8 p-3 text-center">
            <p className="text-xs text-dark/35">
              Prototype demo — sample conversation data
            </p>
          </div>
        </div>

        {/* Thread view */}
        <div className={`flex-1 flex-col ${selectedId ? 'flex' : 'hidden lg:flex'}`}>
          {selected ? (
            <>
              {/* Thread header */}
              <div className="flex items-center gap-3 border-b border-dark/8 bg-white px-4 py-3 sm:px-6">
                <button
                  onClick={() => setSelectedId(null)}
                  className="hidden h-9 w-9 items-center justify-center rounded-xl bg-dark/5 text-dark transition hover:bg-dark/10 lg:flex"
                  aria-label="Back to conversations"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <Avatar conversation={selected} size="md" />
                <div className="min-w-0 flex-1">
                  <h3 className="truncate font-extrabold text-dark">{selected.name}</h3>
                  <p className="flex items-center gap-1 text-xs text-dark/45">
                    {(() => {
                      const RoleIcon = ROLE_STYLES[selected.role].icon;
                      return <><RoleIcon className="h-3 w-3" /> {selected.roleLabel}</>;
                    })()}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 rounded-full bg-forest/8 px-3 py-1.5 text-xs font-bold text-forest">
                  <CheckCheck className="h-3.5 w-3.5" />
                  Active
                </div>
              </div>

              {/* Messages */}
              <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto bg-cream/30 p-4 sm:p-6">
                {selected.messages.map((msg, i) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(i * 0.04, 0.3), duration: 0.4 }}
                    className={`flex ${msg.fromMe ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[75%] rounded-2xl px-4 py-3 sm:max-w-[60%] ${
                        msg.fromMe
                          ? 'rounded-br-md bg-gradient-to-r from-forest to-forest-light text-cream shadow-md'
                          : 'rounded-bl-md bg-white text-dark shadow-sm'
                      }`}
                    >
                      <p className="text-sm leading-relaxed">{msg.text}</p>
                      <div className={`mt-1.5 flex items-center gap-1 text-[10px] ${msg.fromMe ? 'text-cream/60' : 'text-dark/35'}`}>
                        <Clock className="h-3 w-3" />
                        {msg.time}
                        {msg.fromMe && <CheckCheck className="ml-0.5 h-3 w-3" />}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Reply box */}
              <div className="border-t border-dark/8 bg-white p-4 sm:px-6">
                <form onSubmit={sendReply} className="flex items-end gap-2 sm:gap-3">
                  <input
                    type="text"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder={`Reply to ${selected.name}...`}
                    className="flex-1 rounded-xl border border-dark/12 bg-cream/40 px-4 py-3 text-sm text-dark placeholder:text-dark/35 focus:border-forest focus:outline-none"
                  />
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="submit"
                    disabled={!replyText.trim()}
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-r from-forest to-forest-light text-cream shadow-md transition disabled:opacity-40"
                    aria-label="Send message"
                  >
                    <Send className="h-5 w-5" />
                  </motion.button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center bg-cream/20 p-8 text-center">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, ease: easeOutExpo }}
                className="flex h-20 w-20 items-center justify-center rounded-3xl bg-dark/5"
              >
                <MailOpen className="h-10 w-10 text-dark/25" />
              </motion.div>
              <h3 className="mt-6 text-lg font-extrabold text-dark/50">Select a conversation</h3>
              <p className="mt-2 max-w-xs text-sm text-dark/35">
                Choose a conversation from the list to view messages and reply
              </p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
