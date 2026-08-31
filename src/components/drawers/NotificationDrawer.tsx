import React from 'react';
import { X, Bell, Check, CheckCheck, Trash2, ArrowRight } from 'lucide-react';
import { useItems } from '../../context/ItemsContext';
import { getCategoryInfo } from '../../utils/categoryHelpers';
import { motion, AnimatePresence } from 'motion/react';

export const NotificationDrawer: React.FC = () => {
  const {
    isNotificationsOpen,
    setIsNotificationsOpen,
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    items,
    setSelectedItemForDetail,
  } = useItems();

  if (!isNotificationsOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-hidden">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsNotificationsOpen(false)}
          className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs"
        />

        <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 280 }}
            className="w-screen max-w-md bg-white dark:bg-slate-900 shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col"
          >
            {/* Drawer Header */}
            <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400 flex items-center justify-center">
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white font-display">Notifications</h3>
                  <p className="text-xs text-slate-400">Timely life reminders & alerts</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {notifications.some((n) => !n.read) && (
                  <button
                    onClick={markAllNotificationsRead}
                    className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium flex items-center gap-1"
                    title="Mark all as read"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    <span>Read all</span>
                  </button>
                )}
                <button
                  onClick={() => setIsNotificationsOpen(false)}
                  className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Notification List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2.5 divide-y divide-slate-100 dark:divide-slate-800/40">
              {notifications.length > 0 ? (
                notifications.map((notif) => {
                  const catInfo = getCategoryInfo(notif.type);
                  return (
                    <div
                      key={notif.id}
                      className={`p-3.5 rounded-2xl transition-all ${
                        notif.read
                          ? 'bg-slate-50/60 dark:bg-slate-800/30 opacity-75'
                          : 'bg-indigo-50/40 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2.5">
                          <span className="text-base mt-0.5">{catInfo.emoji}</span>
                          <div>
                            <h4 className={`text-xs font-bold text-slate-900 dark:text-white ${notif.read ? 'font-medium' : ''}`}>
                              {notif.title}
                            </h4>
                            <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 leading-snug">
                              {notif.message}
                            </p>
                            <span className="text-[10px] text-slate-400 mt-1 block">
                              {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          {notif.itemId && (
                            <button
                              onClick={() => {
                                const target = items.find((i) => i.id === notif.itemId);
                                if (target) {
                                  setSelectedItemForDetail(target);
                                  setIsNotificationsOpen(false);
                                }
                              }}
                              className="p-1 text-slate-400 hover:text-indigo-600"
                              title="View item"
                            >
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {!notif.read && (
                            <button
                              onClick={() => markNotificationRead(notif.id)}
                              className="p-1 text-slate-400 hover:text-emerald-600"
                              title="Mark read"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-12 text-center text-slate-400 text-sm">
                  No notifications yet. You're all caught up!
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
};
