import { requestApi } from "./axiosClient.js";

export const trashService = {
  getAll: async (categoryFilter = "all") => {
    const res = await requestApi(`/api/trash?categoryFilter=${categoryFilter || "all"}`);
    return Array.isArray(res) ? res : [];
  },

  restore: async (trashId) => {
    let type = "inventory";
    let id = trashId;

    if (typeof trashId === "string") {
      if (trashId.startsWith("prod-")) {
        type = "inventory";
        id = trashId.replace("prod-", "");
      } else if (trashId.startsWith("svc-")) {
        type = "service";
        id = trashId.replace("svc-", "");
      } else if (trashId.startsWith("cat-")) {
        type = "category";
        id = trashId.replace("cat-", "");
      }
    }

    if (!isNaN(Number(id))) {
      await requestApi(`/api/trash/restore/${type}/${id}`, { method: "POST" });
    }
    return true;
  },

  permanentDelete: async (trashId) => {
    let type = "inventory";
    let id = trashId;

    if (typeof trashId === "string") {
      if (trashId.startsWith("prod-")) {
        type = "inventory";
        id = trashId.replace("prod-", "");
      } else if (trashId.startsWith("svc-")) {
        type = "service";
        id = trashId.replace("svc-", "");
      } else if (trashId.startsWith("cat-")) {
        type = "category";
        id = trashId.replace("cat-", "");
      }
    }

    if (!isNaN(Number(id))) {
      await requestApi(`/api/trash/${type}/${id}`, { method: "DELETE" });
    }
    return true;
  },

  emptyTrash: async () => {
    return true;
  },
};
