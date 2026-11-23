export const sendSuccess = (
  res,
  { statusCode = 200, message = "Success", data = null, meta = null } = {},
) => {
  const payload = {
    success: true,
    message,
    ...(data !== null && { data }),
    ...(meta !== null && { meta }),
  };

  return res.status(statusCode).json(payload);
};

export const sendCreated = (res, { message = "Created", data = null } = {}) =>
  sendSuccess(res, { statusCode: 201, message, data });
