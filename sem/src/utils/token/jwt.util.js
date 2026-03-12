import jwt from "jsonwebtoken";
import { config } from "../../config/env.js";

export const generateAccessToken = (payload) => {
  // TODO: create access token
  return jwt.sign(payload, config.jwt.accessSecret, {
    expiresIn: "15m"
  });
};

export const generateRefreshToken = (payload) => {
  // TODO: create refresh token
  return jwt.sign(payload, config.jwt.refreshSecret, {
    expiresIn: "7d"
  });
};

export const verifyAccessToken = (token) => {
  // TODO: verify access token
  return jwt.verify(token, config.jwt.accessSecret);
};

export const verifyRefreshToken = (token) => {
  // TODO: verify refresh token
  return jwt.verify(token, config.jwt.refreshSecret);
};