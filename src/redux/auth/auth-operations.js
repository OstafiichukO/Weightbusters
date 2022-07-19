import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { createAsyncThunk } from '@reduxjs/toolkit';

axios.defaults.baseURL = 'https://weightbusters-api.herokuapp.com';

const token = {
  set(token) {
    axios.defaults.headers.common.Authorization = `Bearer ${token}`;
  },
  unset() {
    axios.defaults.headers.common.Authorization = '';
  },
};

const register = createAsyncThunk('auth/register', async credentials => {
  try {
    const { data } = await axios.post('/auth/signup', credentials);
    token.set(data.data.user.verificationToken);
    toast.success('Registration successfull. Confirm your email!');
    return data;
  } catch (error) {
    if (error.response.status === 409) {
      return toast.error('The user with this email already registered');
    } else if (error.response.status === 500) {
      return toast.error(
        'Oops, something went wrong. Try to refresh this page or try again later'
      );
    } else {
      return toast.error(error.message);
    }
  }
});

const logIn = createAsyncThunk('auth/login', async credentials => {
  try {
    const { data } = await axios.post('/auth/login', credentials);
    token.set(data.data.token);

    return data;
  } catch (error) {
    if (error.response.status === 401) {
      return toast.error('Email is wrong or not verify, or password is wrong');
    } else if (error.response.status === 500) {
      return toast.error(
        'Oops, something went wrong. Try to refresh this page or try again later'
      );
    } else {
      return toast.error(error.message);
    }
  }
});

const logOut = createAsyncThunk('auth/logout', async () => {
  try {
    await axios.get('/auth/logout');
    token.unset();
    localStorage.setItem('user', JSON.stringify(null));
  } catch (error) {
    console.log(error.message);
  }
});

const fetchCurrentUser = createAsyncThunk(
  'users/current',
  async (_, thunkAPI) => {
    const state = thunkAPI.getState();
    const persistedToken = state.auth.token;

    if (persistedToken === null) {
      return thunkAPI.rejectWithValue();
    }
    token.set(persistedToken);
    try {
      const { data } = await axios.get('/users/current');
      return data;
    } catch (error) {
      console.log(error.message);
    }
  }
);

const authOperations = {
  register,
  logIn,
  logOut,
  fetchCurrentUser,
};
export default authOperations;
