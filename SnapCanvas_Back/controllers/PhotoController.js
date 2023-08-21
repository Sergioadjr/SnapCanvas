const Photo = require("../models/Photo");
const mongoose = require("mongoose");
const User = require("../models/User");

const insertPhoto = async (req, res) => {
    const { title } = req.body;
    const image = req.file.filename;


    const reqUser = req.user
    const user = await User.findById(reqUser._id);

    // Criação da foto
    const newPhoto = await Photo.create({
        image,
        title,
        userId: user._id,
        userName: user.name,
    });

    // Se a foto for criada, retorna dados
    if (!newPhoto) {
        res.status(422).json({
            errors: ["Houve algum erro, tenta novamente mais tarde"]
        });
        return;
    }
    res.status(201).json(newPhoto);
};

// Excluir fotos pelo do db

const deletePhoto = async (req, res) => {
    const { id } = req.params;
    const reqUser = req.user;

    try {
        const photo = await Photo.findById(new mongoose.Types.ObjectId(id));

        // verificar se a foto existe:
        if (!photo) {
            res.status(404).json({ errors: ["Foto não encontrada"] });
            return;
        }

        // Verificar ser a foto pertence ao usuário
        if (!photo.userId.equals(reqUser._id)) {
            res.status(404).json({ errors: ["Ocorreu um erro, tente mais tarde"] });
        }
        await Photo.findByIdAndDelete(photo._id)
        res.status(200).json({ id: photo._id, message: "Foto excluída com sucesso." });

    } catch (error) {
        res.status(404).json({ errors: ["Foto não encontrada"] });
    }
};

// Busca de todas as fotos

const getAllPhotos = async (req, res) => {
    const photos = await Photo.find({})
        .sort([['createdAt', -1]])
        .exec();
    return res.status(200).json(photos);
}

// Busca fotos por usuário
const getUserPhotos = async (req, res) => {

    const { id } = req.params
    const photos = await Photo.findOneAndUpdate({ userId: id })
        .sort([['createdAt', -1]])
        .exec()
    return res.status(200).json(photos);
}

// Busca de fotos pelo ID
const getPhotoById = async (req, res) => {
    const { id } = req.params
    const photo = await Photo.findById(new mongoose.Types.ObjectId(id))

    // Checagem de foto
    if (!photo) {
        res.status(404).json({ errors: ["Foto não encontrada"] })
        return
    }
    res.status(200).json(photo);
}

// Update da foto
const updatePhoto = async (req, res) => {
    const { id } = req.params
    const { title } = req.body

    const reqUser = req.user
    const photo = await Photo.findById(id)

    // Checagem da existência da foto
    if (!photo) {
        res.status(404).json({ errors: ["Foto não encontrada"] })
    }
    if (!photo.userId.equals(reqUser.id)) {
        res.status(422).json({ errors: ["Ocorreu um erro, tente novamente mais tarde"] })
        return;
    }

    if (title) {
        photo.title = title
    }

    await photo.save()

    res.status(200).json({ photo, message: "Foto atualizada com sucesso ;)" })
}

// Funcionalidade do like
const likePhoto = async (req, res) => {
    const { id } = req.params
    const reqUser = req.user
    const photo = await Photo.findById(id)

    // Busca da foto
    if (!photo) {
        res.status(404).json({ errors: ["Foto não encontrada"] })
    }

    // Checagem de apenas um like
    if (photo.likes.includes(reqUser._id)) {
        res.status(422).json({ errors: ["Você já curtiu esta foto."] })
        return
    }

    // 
    photo.likes.push(reqUser._id)
    photo.save()

    res.status(200).json({ photo: id, userId: reqUser._id, message: "A foto foi curtida." })
};

// Funcionalidade de comentários
const commentPhoto = async (req, res) => {
    const { id } = req.params
    const { comment } = req.body

    const reqUser = req.user

    const user = await User.findById(reqUser._id);
    const photo = await Photo.findById(id);

    if (!photo) {
        res.status(404).json({ errors: ["Foto não encontrada"] })
    }

    // Colocar comentário
    const userComment = { comment, userName: user.name, userImage: user.profileImage, userId: user._id };

    photo.comments.push(userComment)
    await photo.save()

    res.status(200).json(({
        comment: userComment,
        message: "O comentário foi adicionado com sucesso!",
    }));
}

// Busca de imagens
const searchPhotos = async(req,res) => {
    const{q} = req.query
    const photos = await Photo.find({title: new RegExp(q,"i")}).exec()

    res.status(200).json(photos);
}


module.exports = {
    insertPhoto,
    deletePhoto,
    getAllPhotos,
    getUserPhotos,
    getPhotoById,
    updatePhoto,
    likePhoto,
    commentPhoto,
    searchPhotos,
}