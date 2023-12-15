module.exports = (app) => {
    const testController = require("../Controllers/testController.js")
    const loginController = require("../Controllers/loginControllers.js")
    const paymentController = require("../Controllers/paymentControllers.js")
    const courseMappingController = require("../Controllers/mappingControllers.js")
    const jwtAuth = require("../../Services/jwt");
    var router = require("express").Router();

    router.get("/", jwtAuth.jwtAuthentication, testController.testapi)
    router.post("/sendotp", loginController.sendOtp);
    router.post("/register", loginController.register)
    router.post("/login", loginController.login)
    router.post("/resetPassword", loginController.resetPassword)
    router.post("/razorpayPaymentCapture", paymentController.payment)
    router.get("/getCourseMapping", courseMappingController.getCourseMapping)
    app.use("/api/v1", router);
};
