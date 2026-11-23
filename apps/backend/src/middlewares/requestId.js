import crypto from "node:crypto";

export const requestId = (req, res, next) => {
  const incomingId = req.headers["x-request-id"];
  const id =
    typeof incomingId === "string" && incomingId.trim()
      ? incomingId.trim()
      : crypto.randomUUID();

  req.id = id;
  res.setHeader("X-Request-Id", id);
  next();
};
