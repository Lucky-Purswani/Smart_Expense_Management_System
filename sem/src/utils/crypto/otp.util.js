export const generateOtp = () => {
    // TODO: generate 6 digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000);
    return otp.toString();
  };
  
  export const getOtpExpiry = () => {
    // TODO: OTP expiry (10 minutes)
    const expiry = new Date();
    expiry.setMinutes(expiry.getMinutes() + 10);
    return expiry;
  };