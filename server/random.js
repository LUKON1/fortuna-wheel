const express = require('express');
const router = express.Router();

router.post('/wheel', (req, res) => {
    const { variantsCount, currentRotation = 0 } = req.body;

    if (!variantsCount || variantsCount < 2) {
        return res.status(400).json({ error: "Need at least 2 variants" });
    }

    const randomAngle = Math.random() * 360;
    const minSpins = 5;
    
    // Новое абсолютное значение угла
    const targetRotation = currentRotation + (360 * minSpins) + randomAngle;

    // Считаем индекс от итогового угла (приведенного к 1 кругу)
    const finalAngle = targetRotation % 360;
    const normalizedAngle = (360 - finalAngle) % 360;
    const sliceAngle = 360 / variantsCount;
    const winnerIndex = Math.floor(normalizedAngle / sliceAngle);

    res.json({
        targetRotation,
        winnerIndex
    });
});

module.exports = router;