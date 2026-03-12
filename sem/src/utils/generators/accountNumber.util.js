export const generateAccountNumber = () => {

    // TODO: generate unique account number
  
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 9000 + 1000);
  
    return `ACC${timestamp}${random}`;
  };