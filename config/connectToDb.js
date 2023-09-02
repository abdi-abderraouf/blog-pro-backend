const mongoose = require("mongoose");
module.exports = async () => {
  try {
    await mongoose
      .connect(process.env.MONGO_URI)
      .then(console.log("db connected ^_^"));
  } catch (error) {
    console.log("connection failed to mongodb!", error);
  }
};
