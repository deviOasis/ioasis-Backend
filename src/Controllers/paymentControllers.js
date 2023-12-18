const db = require("../../Config/connection");
const paymentsModel = db.paymentsModel;
const usersModel = db.usersModel;
const Razorpay = require('razorpay');
const shortid = require("shortid")
const razorpay = new Razorpay({
    key_id: 'rzp_test_KPDVnbAEecMRkj',
    key_secret: 'swCOqu595Z6FSvv1Ox0PijgV'
});
exports.payment = async (req, res) => {
    try {
        const { userId, courseIds, isDemo } = req.body;
        if (isDemo) {
            const [updatedRowsCount] = await usersModel.update(
                { demoTimestamp: new Date() },
                { where: { id: userId } }
            );

            if (updatedRowsCount > 0) {
                res.status(200).json({
                    message: 'Demo started successfully',
                    order_id: '',
                    userId: userId,
                });
            } else {
                res.status(500).json({
                    error: 'Failed to start demo. User not found or no update occurred.',
                });
            }
        } else {
            const currency = 'INR';

            // Calculate the total amount based on the number of courses
            const amount = courseIds.reduce((totalAmount, courseId) => totalAmount + 100, 0);

            // Log input data for debugging
            console.log('Course IDs:', courseIds);
            console.log('Total Amount:', amount);

            const payment_capture = 1;

            // Create a Razorpay order
            const options = {
                amount: amount * 100, // Razorpay expects amount in paise
                currency: currency,
                receipt: shortid.generate(),
                payment_capture: payment_capture,
            };

            const order = await razorpay.orders.create(options);
            console.log('Razorpay Order:', order);

            // Create a new payment entry in the database
            const newPayment = {
                user_id: userId,
                order_id: order.id,
                status: order.status,
                amount: amount,
                currency: currency,
                receipt: order.receipt,
            };

            const createdPayment = await paymentsModel.create(newPayment);

            res.status(200).json({
                message: 'Payment processed successfully',
                orderId: order.id,
                amount: amount,
            });
        }
    } catch (error) {
        console.error('Error processing payment:', error);
        res.status(500).json({ error: 'Payment processing failed' });
    }
};

exports.paymentVerification = async (req, res) => {
    try {
        const secret = 'stslBee/nIC3VI1w'
        console.log(req.body.payload.payment.entity);
        const crypto = require('crypto');
        const shasum = crypto.createHmac('sha256', secret)
        shasum.update(JSON.stringify(req.body))
        const digest = shasum.digest('hex')
        console.log(digest, req.headers['x-razorpay-signature'])
        if (digest === req.headers['x-razorpay-signature']) {
            console.log('request is legit')
        } else {
            console.log('request is not legit')
        }
        res.json({ status: "ok" });
        // res.status(200);


    } catch (error) {
        console.log(error);
    }
}

