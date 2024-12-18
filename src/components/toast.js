import { toast } from 'react-toastify';

export const notify = (text, type) => {
  if (type === 'success') {
    toast.success(text, {
      position: 'top-center',
      autoClose: 9050,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
  } else if (type === 'warning') {
    toast.warn(text, {
      position: 'top-center',
      autoClose: 9050,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
  } else {
    toast.error(text, {
      position: 'top-center',
      autoClose: 9050,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
  }
};
