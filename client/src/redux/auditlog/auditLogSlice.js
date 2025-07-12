import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiClient from "../../utils/api";
import { toast } from "react-toastify";
import Logger from "../../utils/logger";

// Tüm audit logları getir
export const getAuditLogs = createAsyncThunk(
  "auditlog/getAuditLogs",
  async (params = {}, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams();

      // Filtre ve sayfalama parametrelerini ekle
      if (params.page) queryParams.append("page", params.page);
      if (params.limit) queryParams.append("limit", params.limit);
      if (params.action) queryParams.append("action", params.action);
      if (params.resource) queryParams.append("resource", params.resource);
      if (params.userId) queryParams.append("userId", params.userId);
      if (params.startDate) queryParams.append("startDate", params.startDate);
      if (params.endDate) queryParams.append("endDate", params.endDate);
      if (params.search) queryParams.append("search", params.search);
      if (params.sortBy) queryParams.append("sortBy", params.sortBy);
      if (params.sortDirection)
        queryParams.append("sortDirection", params.sortDirection);

      const queryString = queryParams.toString();
      const url = `/auditlogs${queryString ? `?${queryString}` : ""}`;

      const res = await apiClient.get(url);
      return res.data;
    } catch (err) {
      Logger.error("Audit loglar getirilirken hata:", err);
      return rejectWithValue(
        err.response?.data || { msg: "Audit loglar yüklenemedi" }
      );
    }
  }
);

// Benzersiz işlem türlerini getir
export const getAuditLogActions = createAsyncThunk(
  "auditlog/getAuditLogActions",
  async (_, { rejectWithValue }) => {
    try {
      const res = await apiClient.get("/auditlogs/actions");
      return res.data;
    } catch (err) {
      Logger.error("İşlem türleri getirilirken hata:", err);
      return rejectWithValue(
        err.response?.data || { msg: "İşlem türleri yüklenemedi" }
      );
    }
  }
);

// Benzersiz kaynak türlerini getir
export const getAuditLogResources = createAsyncThunk(
  "auditlog/getAuditLogResources",
  async (_, { rejectWithValue }) => {
    try {
      const res = await apiClient.get("/auditlogs/resources");
      return res.data;
    } catch (err) {
      Logger.error("Kaynak türleri getirilirken hata:", err);
      return rejectWithValue(
        err.response?.data || { msg: "Kaynak türleri yüklenemedi" }
      );
    }
  }
);

const auditLogSlice = createSlice({
  name: "auditlog",
  initialState: {
    auditLogs: [],
    pagination: {
      page: 1,
      limit: 20,
      total: 0,
      totalPages: 0,
    },
    actions: [],
    resources: [],
    loading: false,
    actionsLoading: false,
    resourcesLoading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Audit logları getirme
      .addCase(getAuditLogs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAuditLogs.fulfilled, (state, action) => {
        state.loading = false;
        state.auditLogs = action.payload.auditlogs;
        state.pagination = action.payload.pagination;
      })
      .addCase(getAuditLogs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        if (action.payload?.msg) {
          toast.error(action.payload.msg);
        }
      })

      // İşlem türlerini getirme
      .addCase(getAuditLogActions.pending, (state) => {
        state.actionsLoading = true;
      })
      .addCase(getAuditLogActions.fulfilled, (state, action) => {
        state.actionsLoading = false;
        state.actions = action.payload;
      })
      .addCase(getAuditLogActions.rejected, (state, action) => {
        state.actionsLoading = false;
        if (action.payload?.msg) {
          toast.error(action.payload.msg);
        }
      })

      // Kaynak türlerini getirme
      .addCase(getAuditLogResources.pending, (state) => {
        state.resourcesLoading = true;
      })
      .addCase(getAuditLogResources.fulfilled, (state, action) => {
        state.resourcesLoading = false;
        state.resources = action.payload;
      })
      .addCase(getAuditLogResources.rejected, (state, action) => {
        state.resourcesLoading = false;
        if (action.payload?.msg) {
          toast.error(action.payload.msg);
        }
      });
  },
});

export const { clearError } = auditLogSlice.actions;
export default auditLogSlice.reducer;
