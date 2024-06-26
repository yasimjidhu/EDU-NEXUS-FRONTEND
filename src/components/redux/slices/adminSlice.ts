import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { axiosInstance } from "../../../constants/axiosInstance";

interface Category {
    _id?:string | null;
    name: string;
    description: string;
    image: File| string|null;
}

interface RejectValue {
    error: string;
}

interface BlockCategoryResponse {
    success: boolean;
    message?: string;
    categories:Category[]
}

export interface CategoryState {
    categories: Category[];
    loading: boolean;
    error: string | null;
}

const initialState: CategoryState = {
    categories: [],
    loading: false,
    error: null,
};

export const addCategory = createAsyncThunk<
    Category,
    Category,
    { rejectValue: RejectValue }
>(
    'categories/add-category',
    async (data: Category, { rejectWithValue }) => {
        try {
         
            const response = await axiosInstance.post('/course/add-category', data);
            return response.data; 
        } catch (error: any) {
            console.log('this is the add category error>>>', error);
            return rejectWithValue({ error: error.message || 'Failed to add category' });
        }
    }
);

export const getAllCategories = createAsyncThunk<
    Category[],
    void,
    { rejectValue: RejectValue }
>(
    'categories/get-all-categories',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get('/course/get-all-categories');
            return response.data; 
        } catch (error: any) {
            console.error('Failed to fetch categories:', error);
            return rejectWithValue({ error: error.message || 'Failed to fetch categories' });
        }
    }
);


export const  updateCategories = createAsyncThunk<
    Category,
    Category,
    { rejectValue: RejectValue }
>(
    'categories/update-category',
    async (data:Category, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.put('/course/update-category',data);
            return response.data; 
        } catch (error: any) {
            console.error('Failed to edit categories:', error);
            return rejectWithValue({ error: error.message || 'Failed to update categories' });
        }
    }
);

export const blockCategory = createAsyncThunk<
    BlockCategoryResponse,
    string, 
    { rejectValue: RejectValue }
>(
    'categories/block-category',
    async (categoryId: string, { rejectWithValue }) => {
        try {
            console.log('block slice called',categoryId)
            const response = await axiosInstance.post(`/course/block-category/${categoryId}`);
            return response.data; 
        } catch (error: any) {
            console.error('Failed to block category:', error);
            return rejectWithValue({ error: error.message || 'Failed to block category' });
        }
    }
);





const categorySlice = createSlice({
    name: 'categories',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(addCategory.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(addCategory.fulfilled, (state, action: PayloadAction<Category>) => {
                state.loading = false;
                state.categories = [...state.categories, action.payload];
                state.error = null;
            })
            .addCase(addCategory.rejected, (state, action: PayloadAction<RejectValue | undefined>) => {
                state.loading = false;
                state.error = action.payload?.error || 'Failed to add category';
            })
            .addCase(getAllCategories.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getAllCategories.fulfilled, (state, action: PayloadAction<Category[]>) => {
                state.loading = false;
                state.categories = action.payload; 
                state.error = null;
            })
            .addCase(getAllCategories.rejected, (state, action: PayloadAction<RejectValue | undefined>) => {
                state.loading = false;
                state.error = action.payload?.error || 'Failed to fetch categories';
            })

        },
});

export default categorySlice.reducer;
