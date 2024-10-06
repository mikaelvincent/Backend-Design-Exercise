module.exports = (req, res, next) => {
    const method = req.method;
    const route = req.originalUrl;
    const timestamp = new Date().toISOString();
  
    console.log(`[${timestamp}] ${method} ${route}`);
    next();
  };
  