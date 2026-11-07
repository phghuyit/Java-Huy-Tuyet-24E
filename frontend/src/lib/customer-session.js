"use client";
import { useSyncExternalStore } from "react";
import { SESSION_HOURS, isExpired } from "./auth";
const SESSION_KEY = "vela-customer-session-v1";
const serverSnapshot = { session: null, ready: false };
let snapshot = serverSnapshot;
let initialized = false;
const listeners = new Set();
const emit = () => listeners.forEach((listener) => listener());
function read() {
    try {
        const raw = localStorage.getItem(SESSION_KEY);
        if (!raw)
            return null;
        const value = JSON.parse(raw);
        if (!value?.customerId || !value.token || isExpired(value)) {
            localStorage.removeItem(SESSION_KEY);
            return null;
        }
        return value;
    }
    catch {
        return null;
    }
}
function initialize() {
    if (initialized)
        return;
    initialized = true;
    snapshot = { session: read(), ready: true };
    window.addEventListener("storage", (event) => {
        if (event.key === SESSION_KEY) {
            snapshot = { session: read(), ready: true };
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
function write(session) {
    snapshot = { session, ready: true };
    try {
        if (session)
            localStorage.setItem(SESSION_KEY, JSON.stringify(session));
        else
            localStorage.removeItem(SESSION_KEY);
    }
    catch {
    }
    emit();
}
export function startCustomerSession(customer) {
    write({
        customerId: customer.id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        token: customer.token || btoa(`${customer.id}:${Date.now()}`).replace(/=+$/, ""),
        expiresAt: new Date(Date.now() + SESSION_HOURS * 3600 * 1000).toISOString(),
    });
}
export function endCustomerSession() {
  write(null);
  if (typeof window !== "undefined") {
    fetch(
      `${(process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080").replace(/\/$/, "")}/api/auth/client/logout`,
      {
        method: "POST",
        credentials: "include",
      }
    ).catch(() => {});
  }
}
export function useCustomerSession() {
    const { session, ready } = useSyncExternalStore(subscribe, () => snapshot, () => serverSnapshot);
    const customer = session
        ? {
            id: session.customerId,
            name: session.name || "Khách hàng",
            email: session.email || "",
            phone: session.phone || "",
            note: "",
            createdAt: session.createdAt || new Date().toISOString().slice(0, 10),
            updatedAt: session.updatedAt || new Date().toISOString().slice(0, 10),
        }
        : null;
    return {
        customer,
        ready,
        isAuthenticated: Boolean(customer),
        logout: endCustomerSession,
    };
}
