class ApiError extends Error {
  constructor(statusCode, message, errors = [], stack = "") {
    super(message);
    this.statusCode = statusCode;
    // `status` bhi set karte hain kyunke sab error paths ek jaise nahi hain:
    // middleware/error.middleware.js `statusCode` parhta hai, magar
    // controllers/order.controller.js ka placeOrder catch `err.status || 500`
    // karta hai. Dono set hone se ApiError har jagah sahi code deta hai,
    // warna order flow mein phenka gaya ApiError 500 ban jata.
    this.status = statusCode;
    this.errors = errors;
    this.success = false;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export default ApiError;
