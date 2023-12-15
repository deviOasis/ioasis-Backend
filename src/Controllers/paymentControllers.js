const Razorpay = require('razorpay');
const shortid = require("shortid")
const razorpay = new Razorpay({
    key_id: 'rzp_test_KPDVnbAEecMRkj',
    key_secret: 'swCOqu595Z6FSvv1Ox0PijgV'
});
exports.payment = async (req, res) => {
    try {
        const courseIds = req.body.courseIds;
        let amount = 0;
        const currency = 'INR';
        const idsLength = courseIds.length;
        for (let i = 0; i < idsLength; i++) {
            amount += 100;
        }
        console.log(courseIds);
        console.log(amount);
        const payment_capture = 1;
        const options = {
            amount: amount * 100, // Razorpay expects amount in paise
            currency: currency,
            receipt: shortid.generate(),
            payment_capture: payment_capture,
        }
        const order = await razorpay.orders.create(options);
        console.log(order);
        res.status(200).json({
            message: 'Payment processed successfully',
            orderid: order.id,
            amount: amount,
        })
    } catch (error) {
        console.error('Error processing payment:', error);
        res.status(500).json({ error: 'Payment processing failed' });
    }
}

exports.paymentVerification = async (req, res) => {
    try {
        const secret = 'stslBee/nIC3VI1w'
        console.log(req.body);
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
        res.send("OK");


    } catch (error) {

    }
}

