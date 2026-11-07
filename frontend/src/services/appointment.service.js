import { apiClient } from "./axiosClient.js";

export const appointmentService = {
  getAll: async () => {
    const res = await apiClient.get("/api/appointments");
    return res.data;
  },

  getBusySlots: async (date, staffId) => {
    const params = new URLSearchParams();
    if (date) params.set("date", date);
    if (staffId && staffId !== "all") params.set("staffId", staffId);
    const qs = params.toString();
    const res = await apiClient.get(`/api/appointments/busy-slots${qs ? `?${qs}` : ""}`);
    return res.data;
  },

  lookup: async (bookingCode, phone) => {
    const res = await apiClient.post("/api/appointments/lookup", {
      bookingCode,
      phone,
    });
    return res.data;
  },

  cancelLookup: async (bookingCode, phone, reason = "") => {
    const res = await apiClient.post("/api/appointments/lookup/cancel", {
      bookingCode,
      phone,
      reason,
    });
    return res.data;
  },

  getMy: async (customerId) => {
    const params = new URLSearchParams();
    if (customerId) params.set("customerId", customerId);
    params.set("_t", Date.now().toString());
    const res = await apiClient.get(`/api/appointments/my?${params.toString()}`);
    return res.data;
  },

  getById: async (id) => {
    const res = await apiClient.get(`/api/appointments/${id}`);
    return res.data;
  },

  create: async (data) => {
    const res = await apiClient.post("/api/appointments", data);
    return res.data;
  },

  recordPayment: async (id, data) => {
    const res = await apiClient.patch(`/api/appointments/${id}/payment`, data);
    return res.data;
  },

  rescheduleMy: async (id, data) => {
    const res = await apiClient.put(`/api/profile/appointments/${id}/reschedule`, data);
    return res.data;
  },

  cancelMy: async (id, reason = "") => {
    const res = await apiClient.post(`/api/profile/appointments/${id}/cancel`, {
      reason,
    });
    return res.data;
  },

  update: async (id, data) => {
    const hasScheduleFields =
      data?.appointmentDate != null ||
      data?.startTime != null ||
      data?.timeStart != null ||
      data?.endTime != null ||
      data?.timeEnd != null ||
      data?.staffId != null;

    const hasPaymentFields =
      data?.paymentStatus != null ||
      data?.paymentMethod != null ||
      data?.amountPaid != null;

    if (hasPaymentFields && !hasScheduleFields && !data?.status) {
      const res = await apiClient.patch(`/api/appointments/${id}/payment`, data);
      return res.data;
    }

    if (hasScheduleFields) {
      const res = await apiClient.put(`/api/appointments/${id}`, data);
      return res.data;
    }

    if (data?.status && !hasPaymentFields) {
      const res = await apiClient.patch(`/api/appointments/${id}/status`, {
        status: data.status,
        note: data.note || data.notes || data.adminNote || data.cancellationReason || "",
        changedBy: data.changedBy || null,
      });
      return res.data;
    }

    const res = await apiClient.put(`/api/appointments/${id}`, data);
    return res.data;
  },

  updateStatus: async (id, { status, note, changedBy }) => {
    const res = await apiClient.patch(`/api/appointments/${id}/status`, {
      status,
      note,
      changedBy,
    });
    return res.data;
  },
};

export const {
  getAll: getAppointmentsApi,
  getBusySlots: getBusySlotsApi,
  lookup: lookupAppointmentApi,
  cancelLookup: cancelLookupAppointmentApi,
  getMy: getMyAppointmentsApi,
  getById: getAppointmentByIdApi,
  create: createAppointmentApi,
  recordPayment: recordAppointmentPaymentApi,
  rescheduleMy: rescheduleMyAppointmentApi,
  cancelMy: cancelMyAppointmentApi,
  updateStatus: updateAppointmentStatusApi,
} = appointmentService;
