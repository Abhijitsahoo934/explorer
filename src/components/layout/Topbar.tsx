import React, { useEffect, useRef, useState } from 'react';
import { Search, Bell, User, Sun, Moon, LogOut, Settings, Command, Menu } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { notificationService } from '../../lib/notificationService';
import { supabase } from '../../lib/supabase';
import { useTheme } from '../ThemeProvider';
import { SettingsModal } from './SettingsModal';
import { useCommandPalette } from '../../hooks/useCommandPalette';
import { useAuth } from '../../hooks/useAuth';
import { getUserDisplayName, getUserInitials } from '../../lib/authProfile';
import { logger } from '../../platform/observability/logger';

interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning';
  is_read: boolean;
  created_at: string;
}

export const Topbar: React.FC<{ onOpenSidebar?: () => void }> = ({ onOpenSidebar }) => {
  const navigate = useNavigate();
  const { open: openCommandPalette } = useCommandPalette();

  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  const notifDropdownRef = useRef<HTMLDivElement>(null);
  const profileDropdownRef = useRef<HTMLDivElement>(null);

  const { resolvedTheme, setTheme } = useTheme();
  const { user } = useAuth();

  useEffect(() => {
    let isMounted = true;
    let subscription: { unsubscribe: () => void } | null = null;

    const fetchAndSubscribe = async () => {
      try {
        await supabase.auth.getUser();
        if (!isMounted) return;

        const notifs = await notificationService.getNotifications();
        if (!isMounted) return;
        setNotifications(notifs as AppNotification[]);

        const refetch = () => {
          void notificationService
            .getNotifications()
            .then((next) => {
              if (isMounted) setNotifications(next as AppNotification[]);
            })
            .catch((e) => logger.warn('notification_refresh', 'Notification refresh failed', { error: e }));
        };

        subscription = (await notificationService.subscribeToNotifications(refetch)) as {
          unsubscribe: () => void;
        };
      } catch (error) {
        logger.error('topbar_init', error);
      }
    };

    void fetchAndSubscribe();

    return () => {
      isMounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const motionMedia = window.matchMedia('(prefers-reduced-motion: reduce)');
    const apply = () => setPrefersReducedMotion(motionMedia.matches);
    apply();

    motionMedia.addEventListener('change', apply);
    return () => motionMedia.removeEventListener('change', apply);
  }, []);

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

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((notification) => ({ ...notification, is_read: true })));
    } catch (error) {
      logger.error('notifications_mark_all_read', error);
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
      logger.error('notifications_mark_read', error, { notificationId });
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/auth', { replace: true });
  };

  const unreadCount = notifications.filter((notification) => !notification.is_read).length;
  const userDisplayName = getUserDisplayName(user);
  const userInitials = getUserInitials(user);

  return (
    <>
      <header className="sticky top-0 z-100 flex h-16 shrink-0 items-center justify-between border-b border-border bg-sidebar/80 px-3 backdrop-blur-2xl transition-all duration-300 sm:px-4 md:px-6 lg:px-8">
        <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={onOpenSidebar}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border bg-card/50 text-muted transition-all hover:bg-card-hover hover:text-foreground lg:hidden"
            aria-label="Open navigation"
          >
            <Menu size={18} />
          </button>

          <div className="relative min-w-0 flex-1 max-w-xl">
            <button
              type="button"
              onClick={() => {
                setShowNotifications(false);
                setShowProfile(false);
                openCommandPalette();
              }}
              className="flex w-full items-center gap-3 rounded-2xl border border-border bg-card/50 py-2.5 pl-10 pr-3 text-left text-sm text-muted shadow-sm transition-all hover:border-accent/30 hover:bg-card-hover focus:outline-none focus-visible:ring-4 focus-visible:ring-accent/10 sm:pl-11 sm:pr-16"
            >
              <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-muted transition-all duration-300 group-hover:text-accent sm:left-4">
                <Search size={18} strokeWidth={2} />
              </div>
              <span className="truncate font-medium sm:hidden">Search...</span>
              <span className="hidden truncate font-medium sm:block">Search folders & apps...</span>
              <div className="pointer-events-none absolute inset-y-0 right-3 hidden items-center gap-2 md:flex">
                <kbd className="inline-flex items-center gap-1 rounded-lg border border-border bg-background/50 px-2 py-1 text-[10px] font-black uppercase tracking-widest text-muted shadow-sm">
                  <Command size={10} /> K
                </kbd>
              </div>
            </button>
          </div>
        </div>

        <div className="relative ml-2 flex items-center gap-1 border-l border-border/50 pl-2 sm:ml-4 sm:gap-2 sm:pl-4 lg:ml-6 lg:pl-6">
          <button
            onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
            className="rounded-xl border border-transparent p-2 text-muted transition-all hover:border-border hover:bg-card-hover hover:text-foreground sm:p-2.5"
            aria-label="Toggle theme"
          >
            {resolvedTheme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <button
            id="bell-btn"
            onClick={() => {
              setShowProfile(false);
              setShowNotifications((value) => !value);
            }}
            className={`relative rounded-xl p-2 transition-all sm:p-2.5 ${showNotifications ? 'bg-accent/10 text-accent' : 'text-muted hover:bg-card-hover hover:text-foreground'}`}
            aria-label="Notifications"
          >
            <Bell size={18} />
            {unreadCount > 0 && <span className={`absolute right-2 top-2 h-2 w-2 rounded-full border-2 border-background bg-red-500 ${prefersReducedMotion ? '' : 'animate-pulse'}`} />}
          </button>

          <AnimatePresence>
            {showNotifications && (
              <motion.div
                ref={notifDropdownRef}
                initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 10 }}
                animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
                exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 6 }}
                transition={{ duration: prefersReducedMotion ? 0.12 : 0.18, ease: 'easeOut' }}
                className="fixed left-3 right-3 top-18 z-50 rounded-2xl border border-border bg-card p-2 shadow-premium backdrop-blur-2xl sm:absolute sm:left-auto sm:right-14 sm:top-[calc(100%+16px)] sm:w-90 sm:max-w-[calc(100vw-48px)]"
              >
                <div className="flex items-center justify-between gap-3 px-3 py-2">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted">Notifications</p>
                    <p className="mt-1 text-xs font-bold text-foreground">{unreadCount} unread</p>
                  </div>
                  <button
                    onClick={handleMarkAllAsRead}
                    disabled={unreadCount === 0}
                    className="shrink-0 text-[10px] font-black uppercase tracking-widest text-accent disabled:cursor-not-allowed disabled:text-muted/50"
                  >
                    Mark all read
                  </button>
                </div>

                <div className="max-h-[min(60vh,360px)] space-y-2 overflow-y-auto px-1 pb-1 custom-scrollbar">
                  {notifications.length > 0 ? (
                    notifications.map((notification) => (
                      <button
                        key={notification.id}
                        onClick={() => handleMarkAsRead(notification.id)}
                        className={`w-full rounded-2xl border px-4 py-3 text-left transition-all ${
                          notification.is_read
                            ? 'border-border bg-background/50 text-muted'
                            : 'border-accent/20 bg-accent/5 text-foreground'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-sm font-bold">{notification.title}</p>
                            <p className="mt-1 text-xs leading-relaxed">{notification.message}</p>
                          </div>
                          {!notification.is_read && <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-accent" />}
                        </div>
                        <div className="mt-3 text-[10px] font-black uppercase tracking-[0.2em] opacity-70">
                          {new Date(notification.created_at).toLocaleString()}
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="rounded-2xl border border-border bg-background/40 px-4 py-8 text-center">
                      <Bell size={18} className="mx-auto mb-3 text-muted" />
                      <p className="text-sm font-bold text-foreground">No notifications yet</p>
                      <p className="mt-2 text-xs text-muted">Activity updates from folders and apps will appear here.</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            id="profile-btn"
            type="button"
            onClick={() => {
              setShowNotifications(false);
              setShowProfile((value) => !value);
            }}
            className="ml-1 flex h-9 w-9 items-center justify-center rounded-xl bg-linear-to-br from-accent to-accent-hover text-xs font-black uppercase tracking-wide text-white shadow-lg transition-all hover:scale-105 sm:ml-2"
            aria-label="Profile"
          >
            {userInitials || <User size={16} strokeWidth={3} />}
          </button>

          <AnimatePresence>
            {showProfile && (
              <motion.div
                ref={profileDropdownRef}
                initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 10 }}
                animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
                exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 6 }}
                transition={{ duration: prefersReducedMotion ? 0.12 : 0.18, ease: 'easeOut' }}
                className="fixed left-3 right-3 top-18 z-50 rounded-2xl border border-border bg-card p-2 shadow-premium backdrop-blur-2xl sm:absolute sm:left-auto sm:right-0 sm:top-[calc(100%+16px)] sm:w-64"
              >
                <div className="mb-2 rounded-xl bg-background/50 p-3">
                  <p className="mb-1 text-[10px] font-black uppercase tracking-widest text-muted">User Instance</p>
                  <p className="truncate text-sm font-bold text-foreground">{userDisplayName}</p>
                  <p className="mt-1 truncate text-xs text-muted">{user?.email}</p>
                </div>
                <button
                  onClick={() => {
                    setIsSettingsOpen(true);
                    setShowProfile(false);
                  }}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted transition-all hover:bg-card-hover hover:text-foreground"
                >
                  <Settings size={14} /> Preferences
                </button>
                <div className="my-2 h-px bg-border/50" />
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-bold text-red-500 transition-all hover:bg-red-500/10"
                >
                  <LogOut size={14} /> Sign out
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
