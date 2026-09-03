import { useState, useEffect, useRef, useCallback } from "react";
import { CollabUser, LivePresenceUser, LiveActivityEvent, AppNavView } from "../types";

const LOCAL_STORAGE_USER_KEY = "tnb_fleet_collab_user";

export const PRESET_COLLAB_USERS: CollabUser[] = [
  {
    id: "user-chan",
    name: "วิชาญ ใจกล้า",
    nickname: "ช่างชาญ",
    role: "หัวหน้าช่างประจำศูนย์ (Foreman)",
    department: "แผนกซ่อมบำรุงและช่วงล่าง",
    color: "#2563EB",
    avatarIcon: "Wrench"
  },
  {
    id: "user-prasit",
    name: "ประสิทธิ์ ศรีสวัสดิ์",
    nickname: "ช่างสิทธิ์",
    role: "ช่างเครื่องยนต์ดีเซล & ส่งกำลัง",
    department: "แผนกซ่อมบำรุงเครื่องยนต์",
    color: "#D97706",
    avatarIcon: "Wrench"
  },
  {
    id: "user-pornthip",
    name: "พรทิพย์ สุวรรณฉัตร",
    nickname: "ทิพย์",
    role: "เจ้าหน้าที่จัดซื้อ & สโตร์อะไหล่",
    department: "ฝ่ายจัดซื้อและพัสดุ",
    color: "#059669",
    avatarIcon: "Boxes"
  },
  {
    id: "user-thanaphat",
    name: "ธนภัทร วัฒนพาณิชย์",
    nickname: "ภัทร",
    role: "ผู้จัดการศูนย์ซ่อมบำรุง TNB Logistics",
    department: "ฝ่ายบริหารกองยานพาหนะ",
    color: "#7C3AED",
    avatarIcon: "ShieldCheck"
  },
  {
    id: "user-sommai",
    name: "สมหมาย วงศ์ดี",
    nickname: "พี่หมาย",
    role: "พนักงานขับรถสายหลัก",
    department: "ฝ่ายปฏิบัติการขนส่ง",
    color: "#DC2626",
    avatarIcon: "Truck"
  }
];

function getInitialUser(): CollabUser {
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_USER_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && parsed.name) return parsed;
    }
  } catch (e) {
    // ignore
  }
  // Default to Foreman
  return PRESET_COLLAB_USERS[0];
}

interface RealtimeCollabHookProps {
  currentView: AppNavView;
  activeTicketId?: string;
  onDataSync?: (entity: string, data: any, updatedBy: any, activity?: LiveActivityEvent) => void;
  onFullStateSync?: (state: any) => void;
}

export function useRealtimeCollab({
  currentView,
  activeTicketId,
  onDataSync,
  onFullStateSync
}: RealtimeCollabHookProps) {
  const [currentUser, setCurrentUserState] = useState<CollabUser>(getInitialUser);
  const [onlineUsers, setOnlineUsers] = useState<LivePresenceUser[]>([]);
  const [recentActivities, setRecentActivities] = useState<LiveActivityEvent[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [lastNotification, setLastNotification] = useState<{ title: string; desc: string; user?: any } | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const setCurrentUser = useCallback((user: CollabUser) => {
    setCurrentUserState(user);
    try {
      localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(user));
    } catch (e) {
      // ignore
    }
    // Update presence on ws if connected
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: "register_presence",
        user,
        currentView,
        activeTicketId
      }));
    }
  }, [currentView, activeTicketId]);

  // Connect WebSocket
  const connectWs = useCallback(() => {
    if (typeof window === "undefined") return;

    try {
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const host = window.location.host;
      const wsUrl = `${protocol}//${host}/ws/sync`;

      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
        // Register presence immediately
        ws.send(JSON.stringify({
          type: "register_presence",
          user: currentUser,
          currentView,
          activeTicketId
        }));

        // Start heartbeat
        if (heartbeatIntervalRef.current) clearInterval(heartbeatIntervalRef.current);
        heartbeatIntervalRef.current = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: "heartbeat" }));
          }
        }, 30000);
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);

          if (msg.type === "init") {
            if (Array.isArray(msg.users)) {
              setOnlineUsers(msg.users);
            }
            if (Array.isArray(msg.recentActivities)) {
              setRecentActivities(msg.recentActivities);
            }
          } else if (msg.type === "presence_update") {
            if (Array.isArray(msg.users)) {
              setOnlineUsers(msg.users);
            }
          } else if (msg.type === "activity_event") {
            if (msg.activity) {
              setRecentActivities((prev) => [msg.activity, ...prev.slice(0, 49)]);
              setLastNotification({
                title: msg.activity.title,
                desc: msg.activity.description,
                user: { name: msg.activity.userName, color: msg.activity.userColor }
              });
            }
          } else if (msg.type === "data_sync") {
            if (msg.activity) {
              setRecentActivities((prev) => [msg.activity, ...prev.slice(0, 49)]);
              setLastNotification({
                title: msg.activity.title,
                desc: msg.activity.description,
                user: msg.updatedBy
              });
            }
            if (onDataSync) {
              onDataSync(msg.entity, msg.data, msg.updatedBy, msg.activity);
            }
          } else if (msg.type === "full_state_sync") {
            if (onFullStateSync && msg.data) {
              onFullStateSync(msg.data);
            }
          }
        } catch (err) {
          console.error("[useRealtimeCollab] Parse error:", err);
        }
      };

      ws.onclose = () => {
        setIsConnected(false);
        if (heartbeatIntervalRef.current) clearInterval(heartbeatIntervalRef.current);
        // Attempt reconnect in 3s
        if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = setTimeout(() => {
          connectWs();
        }, 3000);
      };

      ws.onerror = (err) => {
        console.warn("[useRealtimeCollab] WS connection error, will retry:", err);
        ws.close();
      };
    } catch (e) {
      console.error("[useRealtimeCollab] Failed to init ws:", e);
    }
  }, [currentUser, currentView, activeTicketId, onDataSync, onFullStateSync]);

  useEffect(() => {
    connectWs();
    return () => {
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (heartbeatIntervalRef.current) clearInterval(heartbeatIntervalRef.current);
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connectWs]);

  // When currentView or activeTicketId changes, notify server
  useEffect(() => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: "navigate",
        view: currentView,
        ticketId: activeTicketId
      }));
    }
  }, [currentView, activeTicketId]);

  // Broadcast mutation to other users
  const broadcastMutation = useCallback((
    entity: string,
    data: any,
    title: string,
    actionDescription: string,
    actionType?: LiveActivityEvent["actionType"],
    targetId?: string
  ) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: "mutation",
        entity,
        data,
        title,
        actionDescription,
        actionType: actionType || "TICKET_UPDATED",
        targetId
      }));
    }
  }, []);

  // Broadcast activity
  const logActivity = useCallback((
    actionType: LiveActivityEvent["actionType"],
    title: string,
    description: string,
    targetId?: string
  ) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: "log_activity",
        actionType,
        title,
        description,
        targetId
      }));
    }
  }, []);

  // Broadcast full state sync
  const broadcastStateSync = useCallback((state: any) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: "sync_full_state",
        state
      }));
    }
  }, []);

  return {
    currentUser,
    setCurrentUser,
    onlineUsers,
    recentActivities,
    isConnected,
    lastNotification,
    clearNotification: () => setLastNotification(null),
    broadcastMutation,
    broadcastStateSync,
    logActivity,
    reconnect: connectWs
  };
}
