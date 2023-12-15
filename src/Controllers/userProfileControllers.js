exports.getUserProfile = async (req, res) => {
    try {
        const { id } = req.params;
        const userProfile = await usersModel.findOne({
            where: {
                id: id,
            },
            attributes: ['id', 'username', 'email_address', 'phone_number', 'address', 'bio'],
        });
        res.status(200).json({
            status: true,
            message: 'User Profile fetched successfully',
            data: userProfile,
        });
    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ error: 'Error fetching user profile' });
    }
}
