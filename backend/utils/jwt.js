import jwt from "jsonwebtoken";

export const generateToken = (user, isRefreshToken = false) => {
  const secret = isRefreshToken
    ? process.env.JWT_REFRESH_SECRET
    : process.env.JWT_SECRET;
  // default to a sane timespan if env var missing or invalid
  const expiresIn = isRefreshToken
    ? process.env.JWT_REFRESH_EXPIRES_IN || "7d"
    : process.env.JWT_EXPIRES_IN || "24h";

  if (!secret) {
    throw new Error(
      "JWT secret is not configured (process.env.JWT_SECRET / JWT_REFRESH_SECRET)",
    );
  }

  return jwt.sign(
    {
      sub: user.student_id,
      mat_no:user.matric_number,
      type: "user",
    },
    secret,
    { expiresIn },
  );
};



export const generateAdminToken = (admin, isRefreshToken = false) => {
  const secret = isRefreshToken ? process.env.JWT_REFRESH_SECRET : process.env.JWT_SECRET;
  const expiresIn = isRefreshToken ? (process.env.JWT_REFRESH_EXPIRES_IN || '7d') : (process.env.JWT_EXPIRES_IN || '24h');

  if (!secret) {
    throw new Error('JWT secret is not configured (process.env.JWT_SECRET / JWT_REFRESH_SECRET)');
  }

  return jwt.sign(
    {
      sub: admin.admin_id,
      email: admin.email,
      type: 'admin'
    },
    secret,
    { expiresIn }
  );
};

export const verifyToken = (token, isRefreshToken = false) => {
  const secret = isRefreshToken ? process.env.JWT_REFRESH_SECRET : process.env.JWT_SECRET;
  return jwt.verify(token, secret);
};
 