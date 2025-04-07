import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// Bo'limlarni olish
export const fetchDepartments = createAsyncThunk(
  "departments/fetchDepartments",
  async (_, { rejectWithValue }) => {
    const token = localStorage.getItem("token");
    if (!token) {
      return rejectWithValue("Tizimga kiring!");
    }

    try {
      const response = await fetch("http://localhost:5000/api/departments", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("token");
          return rejectWithValue("Tizimga qayta kiring! Token yaroqsiz.");
        }
        return rejectWithValue("Bo'limlarni olishda muammo yuz berdi");
      }

      const result = await response.json();
      if (typeof result !== "object" || result === null) {
        return rejectWithValue("Serverdan noto'g'ri formatda ma'lumot keldi");
      }

      return result;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Xodimlar sonini olish
export const fetchEmployeeCounts = createAsyncThunk(
  "departments/fetchEmployeeCounts",
  async (_, { rejectWithValue }) => {
    const token = localStorage.getItem("token");
    if (!token) {
      return rejectWithValue("Tizimga kiring!");
    }

    try {
      const response = await fetch("http://localhost:5000/api/employees", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("token");
          return rejectWithValue("Tizimga qayta kiring! Token yaroqsiz.");
        }
        return rejectWithValue(`Server javobi: ${response.status}`);
      }

      const employees = await response.json();
      if (!Array.isArray(employees)) {
        return rejectWithValue("Serverdan noto'g'ri formatda ma'lumot keldi");
      }

      const counts = {};
      employees.forEach((employee) => {
        if (employee.isArchived) return; // Arxivlangan xodimlarni hisobga olmaymiz
        const department = employee.jobData.department;
        const position = employee.jobData.position;
        if (!counts[department]) counts[department] = {};
        counts[department][position] = (counts[department][position] || 0) + 1;
      });

      return counts;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Yangi xodim qo‘shish
export const addEmployee = createAsyncThunk(
  "departments/addEmployee",
  async (employeeData, { rejectWithValue }) => {
    const token = localStorage.getItem("token");
    if (!token) {
      return rejectWithValue("Tizimga kiring!");
    }

    try {
      const response = await fetch("http://localhost:5000/api/employees", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(employeeData),
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("token");
          return rejectWithValue("Tizimga qayta kiring! Token yaroqsiz.");
        }
        const errorData = await response.json();
        return rejectWithValue(errorData.message || "Xodim qo‘shishda muammo yuz berdi");
      }

      const result = await response.json();
      return result;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Xodim ma’lumotlarini ID bo‘yicha olish
export const fetchEmployeeById = createAsyncThunk(
  "departments/fetchEmployeeById",
  async (employeeId, { rejectWithValue }) => {
    const token = localStorage.getItem("token");
    if (!token) {
      return rejectWithValue("Tizimga kiring!");
    }

    try {
      const response = await fetch(`http://localhost:5000/api/employees/${employeeId}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("token");
          return rejectWithValue("Tizimga qayta kiring! Token yaroqsiz.");
        }
        return rejectWithValue("Xodim ma’lumotlarini olishda muammo yuz berdi");
      }

      const result = await response.json();
      return result;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const departmentSlice = createSlice({
  name: "departments",
  initialState: {
    departments: [],
    positionsByDepartment: {},
    employeeCounts: {},
    currentEmployee: null, // Joriy xodim ma’lumotlari
    currentEmployeeStatus: "idle", // Joriy xodimni olish holati
    currentEmployeeError: null, // Joriy xodimni olishdagi xatolar
    addStatus: "idle", // Qo‘shish jarayoni uchun holat
    addError: null, // Qo‘shish jarayonidagi xatolar
    status: "idle",
    error: null,
  },
  reducers: {
    // Qo‘shish holatini boshlang‘ich holatga qaytarish
    resetAddState: (state) => {
      state.addStatus = "idle";
      state.addError = null;
    },
    // Joriy xodim ma’lumotlarini tozalash
    clearCurrentEmployee: (state) => {
      state.currentEmployee = null;
      state.currentEmployeeStatus = "idle";
      state.currentEmployeeError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Departments
      .addCase(fetchDepartments.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchDepartments.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.positionsByDepartment = action.payload;
      })
      .addCase(fetchDepartments.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      // Fetch Employee Counts
      .addCase(fetchEmployeeCounts.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchEmployeeCounts.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.employeeCounts = action.payload;
      })
      .addCase(fetchEmployeeCounts.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      // Add Employee
      .addCase(addEmployee.pending, (state) => {
        state.addStatus = "loading";
        state.addError = null;
      })
      .addCase(addEmployee.fulfilled, (state, action) => {
        state.addStatus = "succeeded";
        state.departments.push(action.payload); // Yangi xodimni qo‘shish (agar kerak bo‘lsa)
      })
      .addCase(addEmployee.rejected, (state, action) => {
        state.addStatus = "failed";
        state.addError = action.payload;
      })
      // Fetch Employee By ID
      .addCase(fetchEmployeeById.pending, (state) => {
        state.currentEmployeeStatus = "loading";
        state.currentEmployeeError = null;
      })
      .addCase(fetchEmployeeById.fulfilled, (state, action) => {
        state.currentEmployeeStatus = "succeeded";
        state.currentEmployee = action.payload;
      })
      .addCase(fetchEmployeeById.rejected, (state, action) => {
        state.currentEmployeeStatus = "failed";
        state.currentEmployeeError = action.payload;
      });
  },
});

export const { resetAddState, clearCurrentEmployee } = departmentSlice.actions;
export default departmentSlice.reducer;