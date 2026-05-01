const express = require('express');
const router = express.Router();

router.post('/wheel', (req, res) => {
    const { variantsCount } = req.body;

    if (!variantsCount || variantsCount < 2) {
        return res.status(400).json({ error: "Need at least 2 variants" });
    }

    const randomAngle = Math.random() * 360;
    const minSpins = 5;
    const targetRotation = (360 * minSpins) + randomAngle;

    const normalizedAngle = (360 - randomAngle) % 360;
    const sliceAngle = 360 / variantsCount;
    const winnerIndex = Math.floor(normalizedAngle / sliceAngle);

    res.json({
        targetRotation,
        winnerIndex
    });
});

module.exports = router;