const db = require("../../Config/connection");
const usersModel = db.usersModel;
const axios = require("axios");
const bcrypt = require("bcrypt");
const jwt = require("../../Services/jwt");
const randomstring = require("randomstring");
const { sequelize, Op } = require("sequelize")

const MSG_AUTH_KEY = process.env.MSG_AUTH_KEY;

exports.sendOtp = async (req, res) => {
    try {
        // Input validation
        const { name, mobile } = req.body;
        if (!name || !mobile) {
            return res.status(400).json({
                status: false,
                error: "Missing required parameters",
            });
        }

        // Save username and phone number in the users table
        await usersModel.create({
            name: name,
            phone_number: mobile,
        });

        const msgString = encodeURIComponent(
            "<#> ##OTP## is your ioasis Login OTP. C/YgRNjOFYM"
        );
        //url need to be updated
        const options = {
            method: "GET",
            url: `https://api.msg91.com/api/sendotp.php?authkey=${MSG_AUTH_KEY}&mobiles=${mobile}&message=Your%20OTP%20is%20##OTP##.%20Do%20not%20share%20it%20with%20anyone.&sender=YOUR_SENDER_ID&otp=&DLT_TE_ID=YOUR_DLT_TE_ID`,

        };

        // Use axios for asynchronous requests
        const response = await axios(options);

        const processedData = response.data;
        return res.status(200).json({
            status: true,
            data: processedData.message,
        });
    } catch (error) {
        console.error("Error in sendOtp:", error);
        res.status(500).json({
            status: false,
            error: "Internal Server Error",
        });
    }
};

exports.register = async (req, res) => {
    try {
        const { name, mobile, email, userName, password } = req.body;

        // Simple validation checks
        if (!name || !mobile || !email || !userName || !password) {
            return res.status(400).json({
                status: false,
                message: "All fields are required",
            });
        }

        const existingUser = await usersModel.findOne({
            where: {
                [Op.and]: [
                    { username: userName },
                    { is_deleted: 0 },
                ],
            },
        });

        if (existingUser) {
            return res.status(400).json({
                status: false,
                message: "Username already exists",
            });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await usersModel.create({
            full_name: name,
            phone_number: mobile,
            email_address: email,
            username: userName,
            user_password: hashedPassword,
        });
        console.log(user);
        const token = await jwt.generatetoken(user.id);
        console.log(token);
        return res.status(201).json({
            status: true,
            message: "User registered successfully",
            token: token,
            id: user.id
        });
    } catch (error) {
        console.error("Error in register:", error);
        return res.status(500).json({
            status: false,
            error: "Internal Server Error",
        });
    }
};

exports.login = async (req, res) => {
    try {
        const { userName, password } = req.body;
        console.log(req.body);
        // Simple validation checks
        if (!userName || !password) {
            return res.status(400).json({
                status: false,
                message: "Username and password are required",
            });
        }

        // Check if the user exists
        const user = await usersModel.findOne({
            where: {
                [Op.and]: [
                    { username: userName },
                    { is_deleted: 0 }, // Check if the user is not deleted (assuming 0 means not deleted)
                ],
            },
            attributes: ["id", "user_password"]
        });

        if (!user) {
            return res.status(401).json({
                status: false,
                message: "Invalid username or password",
            });
        }

        // Compare the provided password with the hashed password in the database
        const passwordMatch = await bcrypt.compare(password, user.user_password);

        if (!passwordMatch) {
            return res.status(401).json({
                status: false,
                message: "Invalid username or password",
            });
        }

        // Generate and return a JWT token for authentication
        const token = await jwt.generatetoken(user.id);
        console.log(token);
        return res.status(200).json({
            status: true,
            message: "Login successful",
            token: token,
            id: user.id
        });
    } catch (error) {
        console.error("Error in login:", error);
        return res.status(500).json({
            status: false,
            error: "Internal Server Error",
        });
    }
};

exports.testapi = async (req, res) => {
    try {
        res.json({
            status: "testing",
        })
    } catch (err) {
        // console.log();
        res.send("Syssssstem hang")
        console.log(err);
    }

}

exports.resetPassword = async (req, res) => {
    try {
        const { userName, newPassword, otp } = req.body;

        // Validate input
        if (!userName || !newPassword || !otp) {
            return res.status(400).json({
                status: false,
                message: "Username, newPassword, and OTP are required",
            });
        }

        // Check if the user exists
        const user = await usersModel.findOne({
            where: {
                [Op.and]: [
                    { username: userName },
                    { is_deleted: 0 },
                ],
            },
        });

        if (!user) {
            return res.status(401).json({
                status: false,
                message: "User not found",
            });
        }

        // Validate OTP
        // const msgString = encodeURIComponent(
        //     "<#> ##OTP## is your ioasis Login OTP. C/YgRNjOFYM"
        // );
        // //url need to be updated
        // const options = {
        //     method: "GET",
        //     url: `https://api.msg91.com/api/sendotp.php?authkey=${MSG_AUTH_KEY}&mobiles=${mobile}&message=Your%20OTP%20is%20##OTP##.%20Do%20not%20share%20it%20with%20anyone.&sender=YOUR_SENDER_ID&otp=&DLT_TE_ID=YOUR_DLT_TE_ID`,

        // };

        // // Use axios for asynchronous requests
        // const response = await axios(options);

        // const processedData = response.data;

        // Hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update the user's password in the database
        await usersModel.update(
            { password: hashedPassword },
            {
                where: {
                    username: userName,
                },
            }
        );

        return res.status(200).json({
            status: true,
            message: "Password reset successful",
            // data: processedData.message,
        });
    } catch (error) {
        console.error("Error in reset password:", error);
        return res.status(500).json({
            status: false,
            error: "Internal Server Error",
        });
    }
};
