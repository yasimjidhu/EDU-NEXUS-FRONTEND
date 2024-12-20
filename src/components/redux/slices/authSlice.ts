import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { axiosInstance } from "../../../constants/axiosInstance";
import axios from 'axios'


export interface AuthState {
    user: any;
    loading: boolean;
    error: string | null;
    email: string | null;
}

interface SignupData {
    username: string;
    email: string;
    password: string;
}

interface OTPData {
    email?: any; 
    otp: string;
    token?:any; 
}

interface RejectValue {
    error: string;
}
interface LoginData{
    email:string
    password:string
}

interface ForgotPasswordData{
    email:string
}

interface ResetPassword{
    newPassword:string,
    email:string
}


export const signupUser = createAsyncThunk<
    any,
    SignupData,
    { rejectValue: RejectValue }
>(
    'auth/signup',
    async (data: SignupData, { rejectWithValue }) => {
        try {
            const response = await axios.post('https://api-gateway-new.onrender.com/auth/signup', data);
            const {user,token} = response.data
            
            localStorage.setItem('email',user.email)
            localStorage.setItem('signupToken',token)
            return response.data      
        } catch (error:any) {
            console.log('this is the signup eror',error.response.data.message);
            return rejectWithValue({error:error.response.data.message})
        }
    }
);



export const verifyOTP = createAsyncThunk<
any,
OTPData,
{ rejectValue: RejectValue }
>(
    'auth/verifyotp',
    async (data: OTPData, { rejectWithValue }) => {
        try {
            const response = await axios.post('https://api-gateway-new.onrender.com/auth/verify-otp', data);
            return response.data;
            
        } catch (error:any) {
            return rejectWithValue({ error: error.response.data.message });
        }
    }
)

export const resendOtp = createAsyncThunk<
any,
ForgotPasswordData,
{ rejectValue: RejectValue }
>(
    'auth/resendotp',
    async (data:ForgotPasswordData, { rejectWithValue }) => {
      try {
        const response = await axios.post('https://api-gateway-new.onrender.com/auth/resendOtp',data);
        console.log('response in authslice of resend otp',response)
        return response.data;
      } catch (error) {
        console.log(error);
        return rejectWithValue({ error: 'Error occurred in resend slice' });
      }
    }
  );



export const userLogin = createAsyncThunk<
  any,
  LoginData,
  { rejectValue: RejectValue }
>(
  'auth/login',
  async (data: LoginData, { rejectWithValue }) => {
    try {
        console.log('login called in slice',data)
      const response = await axios.post('https://api-gateway-new.onrender.com/auth/login', 
        data,{
        headers:{
            'Content-Type': 'application/json',
        }
      }
    );
      const {access_token,refresh_token} = response.data
    
      console.log('access token in login',access_token)
      sessionStorage.setItem('access_token', access_token);
      localStorage.setItem('refresh_token', refresh_token);

      return response.data;
    } catch (error: any) {
        console.log('login error in slice',error)
        return rejectWithValue({error:error.response.data.error})
    }
  }
)



export const forgotPassword = createAsyncThunk<
any,
ForgotPasswordData,
{rejectValue:RejectValue}
>(
    'auth/forgot-password',
    async (data:ForgotPasswordData,{rejectWithValue})=>{
        try {
            
            const response = await axiosInstance.post('/auth/forgot-password',data)
            return response.data
        } catch (error) {
            console.log('error in slice bro',error)
            return rejectWithValue({error:'error occured in forgot-password'})
        }
    }
)

export const resetPassword = createAsyncThunk<
any,
ResetPassword,
{rejectValue:RejectValue}
>(
    'auth/reset-password',
    async (data:ResetPassword,{rejectWithValue})=>{
        try {
            const response = await axiosInstance.post('/auth/reset-password',data)
            return response.data
        } catch (error) {
            console.log(error)
            return rejectWithValue({error:'error occured in reset password slice'})
        }
    }
)

export const logoutUser = createAsyncThunk<any, void, { rejectValue: RejectValue }>(
    'auth/logout-user',
    async (_, { rejectWithValue }) => {
      try {
        const response = await axiosInstance.post('/auth/logout');
        document.cookie = 'access_token=; Max-Age=0; Secure; SameSite=Strict';
        document.cookie = 'refresh_token=; Max-Age=0; Secure; SameSite=Strict';
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        return response.data;
      } catch (error) {
        console.log(error);
        return rejectWithValue({ error: 'Error occurred in logout slice' });
      }
    }
  );

  export const generateTokensForOauthUsers = createAsyncThunk<any, any, { rejectValue: RejectValue }>(
    'auth/generate-tokens',
    async (user: any, { rejectWithValue }) => {
      try {
        const response = await axios.post('https://api-gateway-new.onrender.com/auth/token', user,{
            headers:{
                'Content-Type': 'application/json',
            }
        });
        console.log('generated tokens in frontend',response.data)
        const {tokens} = response.data
        localStorage.setItem('access_token',tokens.access_token)
        localStorage.setItem('refresh_token',tokens.refresh_token)
        sessionStorage.setItem('access_token',tokens.access_token)
        return response.data;
      } catch (error) {
        console.error(error);
        return rejectWithValue({ error: 'Error occurred in generateTokensForOauthUsers' });
      }
    }
  );
  

  export const logoutAdmin = createAsyncThunk<any, void, { rejectValue: RejectValue }>(
    'auth/logout-admin',
    async (_, { rejectWithValue }) => {
      try {
        const response = await axiosInstance.post('/auth/logout');
        return response.data;
      } catch (error) {
        console.log(error);
        return rejectWithValue({ error: 'Error occurred in logout slice' });
      }
    }
  );


  


const userDetails: AuthState = {
    user: null,
    loading: false,
    error: null,
    email:null
}

const authSlice = createSlice({
    name: 'auth',
    initialState: userDetails,
    reducers: {
        logout(state) {
            state.user = null;
        },
        setUser:(state,action:PayloadAction<any>)=>{
            state.user = action.payload
        }

    },
    extraReducers: (builder) => {
        builder
            .addCase(signupUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(signupUser.fulfilled, (state, action: PayloadAction<any>) => {
                state.loading = false;
                state.user = action.payload.user;
                if (action.payload.error) {
                    state.error = action.payload.error;
                }
                state.email = state.user ? state.user.email : null
            })
            .addCase(signupUser.rejected, (state, action: PayloadAction<RejectValue | undefined>) => {
                state.loading = false;
                
                state.error = action.payload?.error || 'An error occurred';
            })
            .addCase(verifyOTP.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(verifyOTP.fulfilled, (state, action: PayloadAction<any>) => {
                state.loading = false
                state.user = action.payload.user
            })
            .addCase(verifyOTP.rejected, (state, action: PayloadAction<RejectValue | undefined>) => {
                state.loading = false;
                state.error = action.payload?.error || 'An error occurred';
            })
            .addCase(userLogin.pending,(state)=>{
                state.loading = true
                state.error = null
            })
            .addCase(userLogin.fulfilled,(state,action:PayloadAction<any>)=>{
                state.loading = false
                state.user = action.payload.user
            })
            .addCase(userLogin.rejected,(state,action:PayloadAction<RejectValue | undefined>)=>{
                state.loading = false
                state.error = action.payload?.error || 'Failed to login'
            })
            .addCase(forgotPassword.pending,(state)=>{
                state.loading = true
                state.error = null
            })
            .addCase(forgotPassword.fulfilled,(state,action:PayloadAction<any>)=>{
                state.loading = false
                state.email = action.payload
            })
            .addCase(forgotPassword.rejected,(state,action:PayloadAction<RejectValue | undefined>)=>{
                state.loading = false
                state.error = action.payload?.error || 'An error occured'
            })
            .addCase(resendOtp.pending,(state)=>{
                state.loading = true
                state.error = null
            })
            .addCase(resendOtp.fulfilled,(state)=>{
                state.loading = false
                state.error = null
            })
            .addCase(resendOtp.rejected,(state,action:PayloadAction<RejectValue | undefined>)=>{
                state.loading = false
                state.error = action.payload?.error || 'An error occured'
            })
            .addCase(generateTokensForOauthUsers.pending,(state)=>{
                state.loading = true
                state.error = null
            })
            .addCase(generateTokensForOauthUsers.fulfilled,(state)=>{
                state.loading = false
                state.error = null
            })
            .addCase(generateTokensForOauthUsers.rejected,(state,action:PayloadAction<RejectValue | undefined>)=>{
                state.loading = false
                state.error = action.payload?.error || 'An error occured'
            })
            
        }
});

export const {setUser} = authSlice.actions;

export default authSlice.reducer;
