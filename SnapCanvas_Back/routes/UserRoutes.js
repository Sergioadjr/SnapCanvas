const express = require("express");
const router = express.Router();

// Controller
const{register, 
    login, 
    getCurrenteUser, 
    update,
    getUserById} = require("../controllers/UserController");

// Middlewares
const validate = require("../middlewares/handleValidation");
const {userCreateValidation, 
    loginValidation,
    userUpdateValidation,
} = require("../middlewares/userValidations");
const authGuard = require("../middlewares/authGuard");
const {imageUpload} = require("../middlewares/imageUpload");

// Rotas
router.post("/register", userCreateValidation(), validate, register);
router.post("/login", loginValidation(), validate, login);
router.get("/profile", authGuard, getCurrenteUser);
router.put("/", authGuard, userUpdateValidation(), validate, imageUpload.single("profileImage"), update);
router.get("/:id", getUserById);

module.exports = router;