import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// Intizomiy jazo yozuvlarini olish
export const fetchDisciplinaryActions = createAsyncThunk(
  "disciplinary/fetchDisciplinaryActions",
  async (_, { rejectWithValue }) => {
    const token = localStorage.getItem("token");
    if (!token) {
      return rejectWithValue("Tizimga kiring!");
    }

    try {
      const response = await fetch("http://localhost:5000/api/disciplinary", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 401) {
          localStorage.removeItem("token");
          return rejectWithValue("Tizimga qayta kiring! Token yaroqsiz.");
        }
        return rejectWithValue(`Server xatosi: ${response.status}`);
      }

      const data = await response.json();
      console.log("Serverdan qaytgan ma'lumotlar:", data);

      const mappedData = data.map((item) => ({
        _id: item._id,
        employeeId: item.employeeId,
        fullName: item.fullName || item.name || "",
        position: item.position || item.jobTitle || "",
        orderDetails: item.orderDetails || item.details || "",
        orderDate: item.orderDate || "",
        reason: item.reason || item.description || "",
      }));

      return mappedData;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Intizomiy jazo qo‘shish
export const addDisciplinaryAction = createAsyncThunk(
  "disciplinary/addDisciplinaryAction",
  async (formData, { rejectWithValue }) => {
    const token = localStorage.getItem("token");
    if (!token) {
      return rejectWithValue("Tizimga kiring!");
    }

    try {
      const response = await fetch("http://localhost:5000/api/disciplinary/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData.message || "Ma'lumot qo'shishda xatolik yuz berdi");
      }

      return await response.json();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Intizomiy jazo tahrirlash
export const updateDisciplinaryAction = createAsyncThunk(
  "disciplinary/updateDisciplinaryAction",
  async ({ id, formData }, { rejectWithValue }) => {
    const token = localStorage.getItem("token");
    if (!token) {
      return rejectWithValue("Tizimga kiring!");
    }

    try {
      const response = await fetch(`http://localhost:5000/api/disciplinary/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData.message || "Ma'lumotni yangilashda xatolik yuz berdi");
      }

      const data = await response.json();
      console.log("Serverdan qaytgan yangilangan ma'lumot:", data);
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Intizomiy jazo o‘chirish
export const deleteDisciplinaryAction = createAsyncThunk(
  "disciplinary/deleteDisciplinaryAction",
  async (id, { rejectWithValue }) => {
    const token = localStorage.getItem("token");
    if (!token) {
      return rejectWithValue("Tizimga kiring!");
    }

    try {
      const response = await fetch(`http://localhost:5000/api/disciplinary/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData.message || `HTTP xatolik: ${response.status}`);
      }

      return id;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const disciplinarySlice = createSlice({
  name: "disciplinary",
  initialState: {
    actions: [],
    filteredActions: [],
    selectedYear: null,
    status: "idle",
    error: null,
  },
  reducers: {
    setFilteredActions: (state, action) => {
      state.filteredActions = action.payload;
    },
    setSelectedYear: (state, action) => {
      state.selectedYear = action.payload;
      if (!state.selectedYear) {
        state.filteredActions = state.actions;
      } else {
        state.filteredActions = state.actions.filter((action) => {
          const actionYear = new Date(action.orderDate).getFullYear();
          return actionYear === state.selectedYear;
        });
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Disciplinary Actions
      .addCase(fetchDisciplinaryActions.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchDisciplinaryActions.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.actions = action.payload;
        if (!state.selectedYear) {
          state.filteredActions = action.payload;
        } else {
          state.filteredActions = action.payload.filter((action) => {
            if (!action.orderDate || isNaN(new Date(action.orderDate))) {
              return false; // Agar orderDate noto‘g‘ri bo‘lsa, filtrdan o‘tmaydi
            }
            const actionYear = new Date(action.orderDate).getFullYear();
            return actionYear === state.selectedYear;
          });
        }
      })
      .addCase(fetchDisciplinaryActions.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      // Add Disciplinary Action
      .addCase(addDisciplinaryAction.pending, (state) => {
        state.status = "loading";
      })
      .addCase(addDisciplinaryAction.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.actions.push(action.payload);
        if (!state.selectedYear) {
          state.filteredActions.push(action.payload);
        } else {
          const actionYear = new Date(action.payload.orderDate).getFullYear();
          if (actionYear === state.selectedYear) {
            state.filteredActions.push(action.payload);
          }
        }
      })
      .addCase(addDisciplinaryAction.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      // Update Disciplinary Action
      .addCase(updateDisciplinaryAction.pending, (state) => {
        state.status = "loading";
      })
      .addCase(updateDisciplinaryAction.fulfilled, (state, action) => {
        state.status = "succeeded";
        const updatedAction = action.payload;
        console.log("Yangilangan ma'lumot (state.actions dan oldin):", updatedAction);
        state.actions = state.actions.map((action) =>
          action._id === updatedAction._id ? updatedAction : action
        );
        console.log("Yangilangan state.actions:", state.actions);
        if (!state.selectedYear) {
          state.filteredActions = state.actions;
        } else {
          state.filteredActions = state.actions.filter((action) => {
            if (!action.orderDate || isNaN(new Date(action.orderDate))) {
              return false;
            }
            const actionYear = new Date(action.orderDate).getFullYear();
            return actionYear === state.selectedYear;
          });
        }
        console.log("Yangilangan state.filteredActions:", state.filteredActions);
      })
      .addCase(updateDisciplinaryAction.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      // Delete Disciplinary Action
      .addCase(deleteDisciplinaryAction.pending, (state) => {
        state.status = "loading";
      })
      .addCase(deleteDisciplinaryAction.fulfilled, (state, action) => {
        state.status = "succeeded";
        const deletedId = action.payload;
        state.actions = state.actions.filter((action) => action._id !== deletedId);
        state.filteredActions = state.filteredActions.filter(
          (action) => action._id !== deletedId
        );
      })
      .addCase(deleteDisciplinaryAction.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export const { setFilteredActions, setSelectedYear } = disciplinarySlice.actions;
export default disciplinarySlice.reducer;