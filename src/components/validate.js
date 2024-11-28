export const validate = (data, type) => {
  const errors = {};
  const regexName = /^[a-zA-Z0-9 ]+$/;
  const regexOnlyNumber = /^\d+$/;

  if (!data.email) {
    errors.email = "Email is Required!";
  } else if (!/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(String(data.email).toLowerCase())) {
    errors.email = "Email address is invalid!";
  } else {
    delete errors.email;
  }

  if (!data.password) {
    errors.password = "Password is Required";
  } else if (!(data.password.length >= 6)) {
    errors.password = "Password needs to be 6 character or more";
  } else {
    delete errors.password;
  }

  if (type === "signUp") {
    if (!data.name.trim()) {
      errors.name = "Username is Required!";

      //sanitize user name to avoid sql injection
    } else if (!regexName.test(data.name.trim())) {
      errors.name = "Invalid name format";

      //check if the user name containing only digits
    } else if (regexOnlyNumber.test(data.name.trim())) {
      errors.name = "Invalid name format";

    } else {
      delete errors.name;
    }

    if (!data.confirmPassword) {
      errors.confirmPassword = "Confirm the Password";
    } else if (!(data.confirmPassword === data.password)) {
      errors.confirmPassword = "Password is not match!";
    } else {
      delete errors.confirmPassword;
    }

    if (data.IsAccepted) {
      delete errors.IsAccepted;
    } else {
      errors.IsAccepted = "Accept terms!";
    }
  }

  return errors;
};
