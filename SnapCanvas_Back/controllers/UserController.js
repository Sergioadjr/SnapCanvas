const User = require("../models/User");

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const mongoose = require("mongoose");

const jwtSecret = process.env.JWT_SECRET;

// Generate user token
const generateToken = (id) => {
    return jwt.sign({ id }, jwtSecret, {
        expiresIn: "365d",
    });
};

// Register user and sing in
const register = async (req, res) => {
    const { name, email, password } = req.body

    //   Check se o usuario existe 
    const user = await User.findOne({ email })
    if (user) {
        res.status(422).json({ errors: ["E-mail já cadastrado, utilize outro e-mail"] })
        return
    }

    // Gerando password hash
    const salt = await bcrypt.genSalt()
    const passwordHash = await bcrypt.hash(password, salt)

    // Criar usuário
    const newUser = await User.create({
        name,
        email,
        password: passwordHash
    })

    // Checagem da criação de usuário com sucesso, retornando o token
    if (!newUser) {
        res.status(422).json({ errors: ["Erro! Por favor, tente mais tarde."] })
        return
    }

    res.status(201).json({
        _id: newUser._id,
        token: generateToken(newUser._id),
    });

};

// Login do usuário 
const login = async (req, res) => {
    const { email, password } = req.body

    const user = await User.findOne({ email })

    // Checagem a existência do usuário
    if (!user) {
        res.status(404).json({ errors: ["Usuário não encontrado"] })
        return
    }

    // checagem de senha
    if (!(await bcrypt.compare(password, user.password))) {
        res.status(422).json({ erros: ["Senha inválida"] })
        return
    }

    res.status(201).json({
        _id: user._id,
        profileImage: user.profileImage,
        token: generateToken(user._id),
    });
};

// 
const getCurrenteUser = async (req, res) => {
    const user = req.user;
    res.status(200).json(user);
};

const update = async (req, res) => {
    const { name, password, bio } = req.body

    let profileImage = null

    if (req.file) {
        profileImage = req.file.filename
    }

    const reqUser = req.user

    const user = await User.findById(new mongoose.Types.ObjectId(reqUser._id)).select("-password");


    if (name) {
        user.name = name;
    }

    if (password) {
        // Gerando password hash
        const salt = await bcrypt.genSalt()
        const passwordHash = await bcrypt.hash(password, salt)

        user.password = passwordHash;
    }

    if (profileImage) {
        user.profileImage = profileImage;
    }

    if (bio) {
        user.bio = bio;
    }

    await user.save();
    res.status(200).json(user);

};

// Busca do usuário pelo ID
const getUserById = async (req, res) => {
    const { id } = req.params

    try {
        const user = await User.findById(new mongoose.Types.ObjectId(id)).select("-password")


        if (!user) {
            res.status(404).json({ errors: ["Usuário não encontrado!!"] })
            return;
        }
        res.status(200).json(user);

    } catch (error) {
        res.status(404).json({ errors: ["Usuário não encontrado."] })
        return;
    }

}

module.exports = {
    register,
    login,
    getCurrenteUser,
    update,
    getUserById,
};