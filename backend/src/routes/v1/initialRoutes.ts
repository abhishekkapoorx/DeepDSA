import express from "express";

const router = express.Router();

// Basic health check route
router.get("/health", (req, res) => {
    res.status(200).json({ 
        success: true, 
        message: "API v1 is running",
        version: "1.0.0"
    });
});

// Add more routes here as needed
// Example:
// router.use("/users", userRoutes);
// router.use("/auth", authRoutes);

export default router; 