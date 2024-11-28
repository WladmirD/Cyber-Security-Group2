import React, { useEffect, useState } from 'react';
import emailIcon from '../img/email.svg';
import passwordIcon from '../img/password.svg';
import styles from './SignUp.module.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { notify } from './toast';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { ChartNoAxesColumnIcon } from 'lucide-react';


const Login = ({ setIsLoggedIn, setWelcomeUser, setUserIdCurrent }) => {
  const [data, setData] = useState({
    email: '',
    password: '',
  });
  const [touched, setTouched] = useState({});

  const connection_sqliteserver_url = 'http://localhost:5050';

  const notifySuccess = (email, resultdata) => {
    setIsLoggedIn(true);
    setWelcomeUser(email)
    setUserIdCurrent(resultdata.data[0].userid);
    notify('You login to your account successfully', 'success');

  }

  const notifyFailure = () => {
    setUserIdCurrent('');
    setIsLoggedIn(false);
    setWelcomeUser('');
    notify('Your password or your email is wrong', 'error');
  }


  const checkData = (obj) => {
    const { email, password } = obj;
    const urlApi = connection_sqliteserver_url + '/model/login';
    const api = axios
      .post(urlApi, { email, password }) // Make a POST request and send email and password in the request body
      .then((response) => response.data)
      .then((data) => {
        // console.log(data)
        data.success // Change this to data.success as per your server response
          ? notifySuccess(email, data)
          : notifyFailure()
      }
      );
    // toast.promise(api, {
    //   pending: 'Loading your data...',
    //   success: false,
    //   error: 'Something went wrong!',
    // });
  };

  const changeHandler = (event) => {
    if (event.target.name === 'IsAccepted') {
      setData({ ...data, [event.target.name]: event.target.checked });
    } else {
      setData({ ...data, [event.target.name]: event.target.value });
    }
  };

  const focusHandler = (event) => {
    setTouched({ ...touched, [event.target.name]: true });
  };

  const submitHandler = (event) => {
    event.preventDefault();
    checkData(data);
  };

  return (
    <div
      style={{
        display: 'flex',
        'justify-content': 'flex-start',
        'min-height': '0px'
      }}
      className={styles.container}
    >
      <form
        className={styles.formLogin}
        onSubmit={submitHandler}
        autoComplete='off'
        style={{ width: '99%' }}
      >
        <h2>Sign In</h2>
        <div>
          <div>
            <input
              type='text'
              name='email'
              value={data.email}
              placeholder='E-mail'
              onChange={changeHandler}
              onFocus={focusHandler}
              autoComplete='off'
            />
            <img src={emailIcon} alt='' />
          </div>
        </div>
        <div>
          <div>
            <input
              type='password'
              name='password'
              value={data.password}
              placeholder='Password'
              onChange={changeHandler}
              onFocus={focusHandler}
              autoComplete='off'
            />
            <img src={passwordIcon} alt='' />
          </div>
        </div>

        <div>
          <button type='submit'>Login</button>
          <span
            style={{
              color: '#a29494',
              textAlign: 'center',
              display: 'inline-block',
              width: '100%',
            }}
          >
            Don't have a account? <Link to='/signup'>Create account</Link>
          </span>
        </div>
      </form>
      <ToastContainer />
    </div>
  );
};

export default Login;
