export const validateEmail = (email) => {
    return email.match(
      /[^@]+@[^@]+\.[^@]+/
    );
  };