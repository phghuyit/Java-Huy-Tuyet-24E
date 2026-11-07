"use client";
import { useSyncExternalStore } from "react";
import { adminUsers } from "@/data/admin-users";
import { isAdminRole } from "./permissions";
import {
  EMAIL_PATTERN,
  buildSession,
  hashPassword,
  isExpired,
  verifyPassword,
} from "./auth";
import { requestApi } from "./api";
const USERS_KEY = "vela-admin-users-v2";
const SESSION_KEY = "vela-admin-session-v1";
const serverSnapshot = {
  users: adminUsers,
  session: null,
  ready: false,
};
let snapshot = serverSnapshot;
let initialized = false;
const listeners = new Set();
const emit = () => listeners.forEach((listener) => listener());
function readUsers() {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    if (!raw) return adminUsers;
    const value = JSON.parse(raw);
    if (!Array.isArray(value) || !value.length) return adminUsers;
    if (value.some((item) => !isAdminRole(item.role))) return adminUsers;
    return value;
  } catch {
    return adminUsers;
  }
}
function readSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const value = JSON.parse(raw);
    if (!value?.token || !value.user || isExpired(value)) {
      localStorage.removeItem(SESSION_KEY);
      return null;
    }
    return value;
  } catch {
    return null;
  }
}
function initialize() {
  if (initialized) return;
  initialized = true;
  snapshot = { users: readUsers(), session: readSession(), ready: true };
  window.addEventListener("storage", (event) => {
    if (event.key === SESSION_KEY || event.key === USERS_KEY) {
      snapshot = { users: readUsers(), session: readSession(), ready: true };
      emit();
    }
  });
  emit();
}
function subscribe(listener) {
  listeners.add(listener);
  initialize();
  return () => {
    listeners.delete(listener);
  };
}
function commit(next) {
  snapshot = { ...snapshot, ...next, ready: true };
  try {
    localStorage.setItem(USERS_KEY, JSON.stringify(snapshot.users));
    if (snapshot.session) {
      localStorage.setItem(SESSION_KEY, JSON.stringify(snapshot.session));
    } else {
      localStorage.removeItem(SESSION_KEY);
    }
  } catch {
  }
  emit();
}
function currentUsers() {
  initialize();
  return readUsers();
}
export const authActions = {
  async login(email, password) {
    try {
      const res = await requestApi("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      const rawRole = (res.roleCode || res.role?.code || res.role || "").toString().toUpperCase();
      let role = "owner";
      if (rawRole === "RECEPTIONIST" || rawRole === "DESK") role = "receptionist";
      else role = "owner";

      const account = {
        id: String(res.id),
        name: res.name || res.fullName || "Quản trị viên",
        email: res.email,
        role: role,
        staffId: null,
        active: true,
      };
      const session = buildSession(account);
      commit({ users: currentUsers(), session });
      return session;
    } catch (apiError) {
      throw apiError;
    }
  },
  async logout() {
    try {
      await requestApi("/api/auth/logout", { method: "POST" });
    } catch {
    }
    commit({ users: currentUsers(), session: null });
  },
  hasAdminAccount(email) {
    const normalized = email.trim().toLowerCase();
    return currentUsers().some(
      (user) => user.email.toLowerCase() === normalized && user.active,
    );
  },
  setAdminPassword(email, password) {
    const users = currentUsers();
    const normalized = email.trim().toLowerCase();
    const account = users.find(
      (user) => user.email.toLowerCase() === normalized,
    );
    if (!account) throw new Error("Không tìm thấy tài khoản quản trị.");
    if (!account.active) throw new Error("Tài khoản đã bị vô hiệu hóa.");
    if (password.length < 8) throw new Error("Mật khẩu tối thiểu 8 ký tự.");
    const now = new Date().toISOString().slice(0, 16);
    commit({
      users: users.map((user) =>
        user.id === account.id
          ? { ...user, passwordHash: hashPassword(password), updatedAt: now }
          : user,
      ),
      session: null,
    });
  },
};
export function useAuth() {
  const value = useSyncExternalStore(
    subscribe,
    () => snapshot,
    () => serverSnapshot,
  );
  return {
    ...value,
    isAuthenticated: Boolean(value.session),
    actions: authActions,
  };
}
