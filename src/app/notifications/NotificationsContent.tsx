"use client";

import { useEffect, useState } from "react";
import { UserPlus, UserCheck, ArrowDownRight, ArrowUpRight, ShoppingBag, Bell } from "lucide-react";

type Notification = {
  id: string;
  type: "FRIEND_REQUEST" | "FRIEND_ACCEPTED" | "RC_RECEIVED" | "RC_SENT" | "PURCHASE_COMPLETED";
  message: string;
  isRead: boolean;
  createdAt: string;
};

const ICONS: Record<Notification["type"], typeof Bell> = {
  FRIEND_REQUEST: UserPlus,
  FRIEND_ACCEPTED: UserCheck,
  RC_RECEIVED: ArrowDownRight,
  RC_SENT: ArrowUpRight,
  PURCHASE_COMPLETED: ShoppingBag,
};

export function NotificationsContent() {
  const [items, setItems] = useState<Notification[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch("/api/notifications")
      .then((r) => r.json())
      .then((d) => {
        setItems(d.notifications ?? []);
        setLoaded(true);
      });
    // Mark everything read once the page has been opened.
    fetch("/api/notifications", { method: "POST" });
  }, []);

  return (
    <div className="mx-auto max-w-2xl animate-rise-in space-y-6">
      <h1 className="font-display text-3xl text-parchment-100">Notifications</h1>

      <div className="panel divide-y divide-white/[0.05]">
        {items.map((n) => {
          const Icon = ICONS[n.type];
          return (
            <div key={n.id} className={`flex items-start gap-3 p-4 ${!n.isRead ? "bg-gold-500/[0.03]" : ""}`}>
              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/[0.04]">
                <Icon size={14} className="text-gold-400" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm text-parchment-200">{n.message}</p>
                <p className="mt-0.5 text-xs text-parchment-500">{new Date(n.createdAt).toLocaleString()}</p>
              </div>
              {!n.isRead && <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-gold-400" />}
            </div>
          );
        })}
        {loaded && items.length === 0 && (
          <p className="p-8 text-center text-parchment-500">You're all caught up.</p>
        )}
      </div>
    </div>
  );
}
