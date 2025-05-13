import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// Foydalanuvchi login qilish
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();
      if (!response.ok) {
        return rejectWithValue(data.error || "Login xatosi!");
      }

      return data.token;
    } catch (error) {
      return rejectWithValue(error.message || "Server bilan bog'lanishda xatolik!");
    }
  }
);

// Foydalanuvchi logout qilish
export const logoutUser = createAsyncThunk("auth/logoutUser", async (_, { rejectWithValue, getState }) => {
  try {
    console.log("Logout jarayoni boshlandi (authSlice)");
    const { auth } = getState();
    const token = auth.token;

    // Optional: Server-side logout (uncomment if your backend has a logout endpoint)
    /*
    const response = await fetch("http://localhost:5000/api/auth/logout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const data = await response.json();
      return rejectWithValue(data.error || "Logout xatosi!");
    }
    */

    return true;
  } catch (error) {
    console.error("Logout xatosi (authSlice):", error);
    return rejectWithValue(error.message || "Logout jarayonida xatolik!");
  }
});

const authSlice = createSlice({
  name: "auth",
  initialState: {
    token: localStorage.getItem("token") || null,
    isAuthenticated: !!localStorage.getItem("token"),
    status: "idle",
    error: null,
  },
  reducers: {
    login: (state, action) => {
      state.token = action.payload;
      state.isAuthenticated = true;
      state.status = "succeeded";
      state.error = null;
      localStorage.setItem("token", action.payload);
    },
    logout: (state) => {
      state.token = null;
      state.isAuthenticated = false;
      state.status = "idle";
      state.error = null;
      localStorage.removeItem("token");
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.token = action.payload;
        state.isAuthenticated = true;
        state.error = null;
        localStorage.setItem("token", action.payload);
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(logoutUser.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.status = "succeeded";
        state.token = null;
        state.isAuthenticated = false;
        state.error = null;
        localStorage.removeItem("token");
        console.log("Logout muvaffaqiyatli yakunlandi (authSlice)");
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
        // Still clear local state to ensure client-side logout
        state.token = null;
        state.isAuthenticated = false;
        localStorage.removeItem("token");
        console.log("Logout xatosi, lekin local state tozalandi (authSlice)");
      });
  },
});

export const { login, logout } = authSlice.actions;
export default authSlice.reducer;