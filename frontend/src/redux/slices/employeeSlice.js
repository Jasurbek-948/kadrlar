import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Xodimlarni olish
export const fetchEmployees = createAsyncThunk(
  "employees/fetchEmployees",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/employees");
      if (!Array.isArray(response.data)) {
        return rejectWithValue("Serverdan noto'g'ri formatda ma'lumot keldi!");
      }
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Ma'lumotlarni olishda muammo yuz berdi!");
    }
  }
);

// Xodimni ID bo‘yicha olish
export const fetchEmployeeById = createAsyncThunk(
  "employees/fetchEmployeeById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/employees/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Xodim topilmadi!");
    }
  }
);

// Bo‘limlarni olish
export const fetchDepartments = createAsyncThunk(
  "employees/fetchDepartments",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/departments");
      const data = response.data;
      const filteredData = data.reduce((acc, dept) => {
        if (dept.name && dept.positions) {
          acc[dept.name] = {
            positions: dept.positions.filter((pos) => pos.name != null),
            maxEmployees: dept.maxEmployees,
          };
        }
        return acc;
      }, {});
      return filteredData;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Bo'limlarni olishda muammo yuz berdi!");
    }
  }
);

// Hozirgi xodimlar sonini olish
export const fetchEmployeeCounts = createAsyncThunk(
  "employees/fetchEmployeeCounts",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/employee-counts");
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Xodimlar sonini olishda muammo yuz berdi!");
    }
  }
);

// Yangi xodim qo‘shish
export const addEmployee = createAsyncThunk(
  "employees/addEmployee",
  async (employeeData, { rejectWithValue }) => {
    try {
      const response = await api.post("/employees", employeeData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || "Xodim qo'shilmadi!");
    }
  }
);

// Xodimni yangilash
export const updateEmployee = createAsyncThunk(
  "employees/updateEmployee",
  async ({ id, updatedData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/employees/${id}`, updatedData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Ma'lumotlar yangilanmadi!");
    }
  }
);

// Ta'til holatini yangilash
export const updateVacationStatus = createAsyncThunk(
  "employees/updateVacationStatus",
  async ({ id, vacationStatus, vacationStart, vacationEnd }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/employees/${id}/vacation`, {
        vacationStatus,
        vacationStart,
        vacationEnd,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Ta'til holatini yangilashda xatolik!");
    }
  }
);

// Xodimni arxivga ko‘chirish
export const archiveEmployee = createAsyncThunk(
  "employees/archiveEmployee",
  async (employeeId, { rejectWithValue }) => {
    try {
      await api.put(`/employees/archive/${employeeId}`);
      return employeeId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Arxivga ko'chirishda muammo yuz berdi!");
    }
  }
);

// Hujjat yuklash
export const uploadDocuments = createAsyncThunk(
  "employees/uploadDocuments",
  async ({ employeeId, formData }, { rejectWithValue, dispatch }) => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      xhr.open("POST", `http://localhost:5000/api/employees/${employeeId}/documents`, true);
      xhr.setRequestHeader("Authorization", `Bearer ${localStorage.getItem("token")}`);

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          dispatch(employeeSlice.actions.setUploadProgress(progress));
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          const response = JSON.parse(xhr.responseText);
          resolve(response);
        } else {
          const errorData = JSON.parse(xhr.responseText);
          reject(rejectWithValue(errorData.message || "Hujjatlar yuklanmadi!"));
        }
      };

      xhr.onerror = () => {
        reject(rejectWithValue("Server bilan bog'lanishda xatolik!"));
      };

      xhr.send(formData);
    });
  }
);

// Hujjatlarni olish
export const fetchDocuments = createAsyncThunk(
  "employees/fetchDocuments",
  async (employeeId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/employees/${employeeId}/documents`);
      return response.data.documents || [];
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Hujjatlarni olishda muammo yuz berdi!");
    }
  }
);

const employeeSlice = createSlice({
  name: "employees",
  initialState: {
    employees: [],
    filteredEmployees: [],
    currentEmployee: null,
    selectedEmployee: null,
    selectedVacationStatus: "",
    isVacationModalVisible: false,
    isDeleteModalVisible: false,
    searchTerm: "",
    documents: [],
    departments: {},
    employeeCounts: {},
    status: "idle",
    fetchStatus: "idle",
    updateStatus: "idle",
    vacationStatus: "idle",
    archiveStatus: "idle",
    uploadStatus: "idle",
    documentsStatus: "idle",
    departmentsStatus: "idle",
    employeeCountsStatus: "idle",
    addStatus: "idle",
    error: null,
    fetchError: null,
    updateError: null,
    vacationError: null,
    archiveError: null,
    uploadError: null,
    documentsError: null,
    departmentsError: null,
    employeeCountsError: null,
    addError: null,
    uploadProgress: 0,
    currentStep: 0,
  },
  reducers: {
    clearCurrentEmployee: (state) => {
      state.currentEmployee = null;
      state.fetchStatus = "idle";
      state.fetchError = null;
    },
    resetUploadState: (state) => {
      state.uploadStatus = "idle";
      state.uploadError = null;
      state.uploadProgress = 0;
    },
    resetDocumentsState: (state) => {
      state.documentsStatus = "idle";
      state.documentsError = null;
      state.documents = [];
    },
    resetAddState: (state) => {
      state.addStatus = "idle";
      state.addError = null;
    },
    setCurrentStep: (state, action) => {
      state.currentStep = action.payload;
    },
    resetCurrentStep: (state) => {
      state.currentStep = 0;
    },
    setFilteredEmployees: (state, action) => {
      state.filteredEmployees = action.payload;
    },
    setSelectedEmployee: (state, action) => {
      state.selectedEmployee = action.payload;
    },
    setSelectedVacationStatus: (state, action) => {
      state.selectedVacationStatus = action.payload;
    },
    setIsVacationModalVisible: (state, action) => {
      state.isVacationModalVisible = action.payload;
    },
    setIsDeleteModalVisible: (state, action) => {
      state.isDeleteModalVisible = action.payload;
    },
    setSearchTerm: (state, action) => {
      state.searchTerm = action.payload;
    },
    setUploadProgress: (state, action) => {
      state.uploadProgress = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchEmployees.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchEmployees.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.employees = action.payload.filter((employee) => !employee.isArchived);
        state.filteredEmployees = action.payload.filter((employee) => !employee.isArchived);
      })
      .addCase(fetchEmployees.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
        state.filteredEmployees = [];
      })
      .addCase(fetchEmployeeById.pending, (state) => {
        state.fetchStatus = "loading";
        state.fetchError = null;
      })
      .addCase(fetchEmployeeById.fulfilled, (state, action) => {
        state.fetchStatus = "succeeded";
        state.currentEmployee = action.payload;
      })
      .addCase(fetchEmployeeById.rejected, (state, action) => {
        state.fetchStatus = "failed";
        state.fetchError = action.payload;
      })
      .addCase(fetchDepartments.pending, (state) => {
        state.departmentsStatus = "loading";
        state.departmentsError = null;
      })
      .addCase(fetchDepartments.fulfilled, (state, action) => {
        state.departmentsStatus = "succeeded";
        state.departments = action.payload;
      })
      .addCase(fetchDepartments.rejected, (state, action) => {
        state.departmentsStatus = "failed";
        state.departmentsError = action.payload;
      })
      .addCase(fetchEmployeeCounts.pending, (state) => {
        state.employeeCountsStatus = "loading";
        state.employeeCountsError = null;
      })
      .addCase(fetchEmployeeCounts.fulfilled, (state, action) => {
        state.employeeCountsStatus = "succeeded";
        state.employeeCounts = action.payload;
      })
      .addCase(fetchEmployeeCounts.rejected, (state, action) => {
        state.employeeCountsStatus = "failed";
        state.employeeCountsError = action.payload;
      })
      .addCase(addEmployee.pending, (state) => {
        state.addStatus = "loading";
        state.addError = null;
      })
      .addCase(addEmployee.fulfilled, (state, action) => {
        state.addStatus = "succeeded";
        state.employees.push(action.payload);
        state.filteredEmployees.push(action.payload);
      })
      .addCase(addEmployee.rejected, (state, action) => {
        state.addStatus = "failed";
        state.addError = action.payload;
      })
      .addCase(updateEmployee.pending, (state) => {
        state.updateStatus = "loading";
        state.updateError = null;
      })
      .addCase(updateEmployee.fulfilled, (state, action) => {
        state.updateStatus = "succeeded";
        state.employees = state.employees.map((emp) =>
          emp._id === action.payload._id ? action.payload : emp
        );
        state.filteredEmployees = state.filteredEmployees.map((emp) =>
          emp._id === action.payload._id ? action.payload : emp
        );
        state.currentEmployee = action.payload;
        if (state.selectedEmployee?._id === action.payload._id) {
          state.selectedEmployee = action.payload;
        }
      })
      .addCase(updateEmployee.rejected, (state, action) => {
        state.updateStatus = "failed";
        state.updateError = action.payload;
      })
      .addCase(updateVacationStatus.pending, (state) => {
        state.vacationStatus = "loading";
        state.vacationError = null;
      })
      .addCase(updateVacationStatus.fulfilled, (state, action) => {
        state.vacationStatus = "succeeded";
        const updatedEmployee = action.payload;
        state.employees = state.employees.map((employee) =>
          employee._id === updatedEmployee._id ? updatedEmployee : employee
        );
        state.filteredEmployees = state.filteredEmployees.map((employee) =>
          employee._id === updatedEmployee._id ? updatedEmployee : employee
        );
        if (state.currentEmployee?._id === updatedEmployee._id) {
          state.currentEmployee = updatedEmployee;
        }
        if (state.selectedEmployee?._id === updatedEmployee._id) {
          state.selectedEmployee = updatedEmployee;
        }
        state.isVacationModalVisible = false;
        state.selectedVacationStatus = "";
      })
      .addCase(updateVacationStatus.rejected, (state, action) => {
        state.vacationStatus = "failed";
        state.vacationError = action.payload;
      })
      .addCase(archiveEmployee.pending, (state) => {
        state.archiveStatus = "loading";
        state.archiveError = null;
      })
      .addCase(archiveEmployee.fulfilled, (state, action) => {
        state.archiveStatus = "succeeded";
        state.employees = state.employees.filter((employee) => employee._id !== action.payload);
        state.filteredEmployees = state.filteredEmployees.filter(
          (employee) => employee._id !== action.payload
        );
        if (state.currentEmployee?._id === action.payload) {
          state.currentEmployee = null;
        }
        if (state.selectedEmployee?._id === action.payload) {
          state.selectedEmployee = null;
        }
        state.isDeleteModalVisible = false;
      })
      .addCase(archiveEmployee.rejected, (state, action) => {
        state.archiveStatus = "failed";
        state.archiveError = action.payload;
      })
      .addCase(uploadDocuments.pending, (state) => {
        state.uploadStatus = "loading";
        state.uploadError = null;
        state.uploadProgress = 0;
      })
      .addCase(uploadDocuments.fulfilled, (state, action) => {
        state.uploadStatus = "succeeded";
        state.uploadProgress = 100;
        if (state.currentEmployee && state.currentEmployee._id === action.payload._id) {
          state.currentEmployee.documents = action.payload.documents;
        }
        state.employees = state.employees.map((emp) =>
          emp._id === action.payload._id ? action.payload : emp
        );
        state.filteredEmployees = state.filteredEmployees.map((emp) =>
          emp._id === action.payload._id ? action.payload : emp
        );
        if (state.selectedEmployee?._id === action.payload._id) {
          state.selectedEmployee = action.payload;
        }
      })
      .addCase(uploadDocuments.rejected, (state, action) => {
        state.uploadStatus = "failed";
        state.uploadError = action.payload;
        state.uploadProgress = 0;
      })
      .addCase(fetchDocuments.pending, (state) => {
        state.documentsStatus = "loading";
        state.documentsError = null;
      })
      .addCase(fetchDocuments.fulfilled, (state, action) => {
        state.documentsStatus = "succeeded";
        state.documents = action.payload;
      })
      .addCase(fetchDocuments.rejected, (state, action) => {
        state.documentsStatus = "failed";
        state.documentsError = action.payload;
      });
  },
});

export const {
  clearCurrentEmployee,
  resetUploadState,
  resetDocumentsState,
  resetAddState,
  setCurrentStep,
  resetCurrentStep,
  setFilteredEmployees,
  setSelectedEmployee,
  setSelectedVacationStatus,
  setIsVacationModalVisible,
  setIsDeleteModalVisible,
  setSearchTerm,
  setUploadProgress,
} = employeeSlice.actions;

export default employeeSlice.reducer;