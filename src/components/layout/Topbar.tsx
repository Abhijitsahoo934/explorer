import React, { useState, useEffect, useRef } from 'react';
import { Search, Bell, User, Sun, Moon, LogOut, Settings, Command } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { notificationService } from '../../lib/notificationService';
import { supabase } from '../../lib/supabase';
import { useTheme } from '../ThemeProvider';
import { SettingsModal } from './SettingsModal';
import { useCommandPalette } from '../../hooks/useCommandPalette';

interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning';
  is_read: boolean;
  created_at: string;
}

export const Topbar: React.FC = () => {
  const navigate = useNavigate();
  const { open: openCommandPalette } = useCommandPalette();

  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  
  // Profile & Settings States
  const [showProfile, setShowProfile] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  
  const notifDropdownRef = useRef<HTMLDivElement>(null);
  const profileDropdownRef = useRef<HTMLDivElement>(null);
  
  const { resolvedTheme, setTheme } = useTheme();

  useEffect(() => {
    let isMounted = true;
    let subscription: { unsubscribe: () => void } | null = null;

    const fetchAndSubscribe = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!isMounted) return;

        if (user) setUserEmail(user.email ?? null);

        const notifs = await notificationService.getNotifications();
        if (!isMounted) return;
        setNotifications(notifs as AppNotification[]);

        // Keep bell dropdown in sync with live DB changes (user-scoped).
        const refetch = () => {
          void notificationService
            .getNotifications()
            .then((next) => {
              if (isMounted) setNotifications(next as AppNotification[]);
            })
            .catch((e) => console.error('Notification refresh failed:', e));
        };

        subscription = (await notificationService.subscribeToNotifications(refetch)) as {
          unsubscribe: () => void;
        };
      } catch (error) {
        console.error("Topbar init error:", error);
      }
    };

    void fetchAndSubscribe();

    return () => {
      isMounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((notification) => ({ ...notification, is_read: true })));
    } catch (error) {
      console.error('Mark all as read failed:', error);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await notificationService.markAsRead(notificationId);
      setNotifications((prev) =>
        prev.map((notification) =>
          notification.id === notificationId
            ? { ...notification, is_read: true }
            : notification
        )
      );
    } catch (error) {
      console.error('Mark as read failed:', error);
    }
  };

  // Click Outside logic
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifDropdownRef.current && !notifDropdownRef.current.contains(event.target as Node) && !(event.target as Element).closest('#bell-btn')) {
        setShowNotifications(false);
      }
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node) && !(event.target as Element).closest('#profile-btn')) {
        setShowProfile(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/auth', { replace: true });
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <>
      <header className="h-16 border-b border-border flex items-center justify-between px-6 md:px-8 bg-sidebar/80 backdrop-blur-2xl sticky top-0 z-[100] shrink-0 transition-all duration-300">
        
        {/* Opens global command palette (folders + apps) — ⌘/Ctrl K */}
        <div className="relative w-full max-w-xl flex-1 group">
          <button
            type="button"
            onClick={() => {
              setShowNotifications(false);
              setShowProfile(false);
              openCommandPalette();
            }}
            className="flex w-full items-center gap-3 rounded-2xl border border-border bg-card/50 py-2.5 pl-11 pr-16 text-left text-sm text-muted shadow-sm transition-all hover:border-accent/30 hover:bg-card-hover focus:outline-none focus-visible:ring-4 focus-visible:ring-accent/10"
          >
            <div className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-muted transition-all duration-300 group-hover:text-accent">
              <Search size={18} strokeWidth={2} />
            </div>
            <span className="truncate font-medium">Search folders & apps…</span>
            <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center gap-2">
              <kbd className="hidden sm:inline-flex items-center gap-1 rounded-lg border border-border bg-background/50 px-2 py-1 text-[10px] font-black uppercase tracking-widest text-muted shadow-sm">
                <Command size={10} /> K
              </kbd>
            </div>
          </button>
        </div>

        {/* RIGHT SIDE ACTIONS */}
        <div className="flex items-center gap-2 ml-6 pl-6 border-l border-border/50 relative">
          <button onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')} className="p-2.5 text-muted hover:text-foreground hover:bg-card-hover rounded-xl transition-all border border-transparent hover:border-border">
            {resolvedTheme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <button id="bell-btn" onClick={() => setShowNotifications(!showNotifications)} className={`relative p-2.5 rounded-xl transition-all ${showNotifications ? 'bg-accent/10 text-accent' : 'text-muted hover:text-foreground hover:bg-card-hover'}`}>
            <Bell size={18} />
            {unreadCount > 0 && <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-background animate-pulse" />}
          </button>

          <AnimatePresence>
            {showNotifications && (
              <motion.div
                ref={notifDropdownRef}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                className="absolute top-[calc(100%+16px)] right-20 w-[360px] max-w-[calc(100vw-48px)] bg-card border border-border rounded-2xl shadow-premium p-2 z-50 backdrop-blur-2xl"
              >
                <div className="flex items-center justify-between px-3 py-2">
                  <div>
                    <p className="text-[10px] uppercase tracking-widest font-black text-muted">Notifications</p>
                    <p className="text-xs text-foreground font-bold mt-1">{unreadCount} unread</p>
                  </div>
                  <button
                    onClick={handleMarkAllAsRead}
                    disabled={unreadCount === 0}
                    className="text-[10px] uppercase tracking-widest font-black text-accent disabled:text-muted/50 disabled:cursor-not-allowed"
                  >
                    Mark all read
                  </button>
                </div>

                <div className="max-h-[360px] overflow-y-auto custom-scrollbar space-y-2 px-1 pb-1">
                  {notifications.length > 0 ? (
                    notifications.map((notification) => (
                      <button
                        key={notification.id}
                        onClick={() => handleMarkAsRead(notification.id)}
                        className={`w-full text-left rounded-2xl border px-4 py-3 transition-all ${
                          notification.is_read
                            ? 'border-border bg-background/50 text-muted'
                            : 'border-accent/20 bg-accent/5 text-foreground'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-bold">{notification.title}</p>
                            <p className="text-xs mt-1 leading-relaxed">{notification.message}</p>
                          </div>
                          {!notification.is_read && (
                            <span className="mt-1 w-2.5 h-2.5 rounded-full bg-accent shrink-0" />
                          )}
                        </div>
                        <div className="mt-3 text-[10px] uppercase tracking-[0.2em] font-black opacity-70">
                          {new Date(notification.created_at).toLocaleString()}
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="rounded-2xl border border-border bg-background/40 px-4 py-8 text-center">
                      <Bell size={18} className="mx-auto text-muted mb-3" />
                      <p className="text-sm font-bold text-foreground">No notifications yet</p>
                      <p className="text-xs text-muted mt-2">Activity updates from folders and apps will appear here.</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div id="profile-btn" onClick={() => setShowProfile(!showProfile)} className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent to-accent-hover flex items-center justify-center text-white shadow-lg cursor-pointer hover:scale-105 transition-all ml-2">
            <User size={16} strokeWidth={3} />
          </div>

          {/* Profile Dropdown Placeholder (Re-use your existing profile logic here) */}
          <AnimatePresence>
            {showProfile && (
              <motion.div ref={profileDropdownRef} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="absolute top-[calc(100%+16px)] right-0 w-64 bg-card border border-border rounded-2xl shadow-premium p-2 z-50 backdrop-blur-2xl">
                <div className="p-3 bg-background/50 rounded-xl mb-2">
                    <p className="text-[10px] uppercase font-black text-muted tracking-widest mb-1">User Instance</p>
                    <p className="text-xs font-bold truncate text-foreground">{userEmail}</p>
                </div>
                <button onClick={() => { setIsSettingsOpen(true); setShowProfile(false); }} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted hover:text-foreground hover:bg-card-hover transition-all">
                  <Settings size={14} /> Preferences
                </button>
                <div className="h-px bg-border/50 my-2" />
                <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-red-500 hover:bg-red-500/10 transition-all font-bold">
                  <LogOut size={14} /> Terminate Session
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </>
  );
};
