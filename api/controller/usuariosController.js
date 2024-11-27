import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from 'dotenv';
import usuariosModel from "../model/usuariosModel.js";
import mongoose from "mongoose";

dotenv.config();
 //const secretKey = 'SECRETA';
const secretKey = process.env.SECRET_KEY;

//Mostrar todos los usuarios
export const agarrarTodosLosUsuarios = async (req, res) => {
    try {
        const { sort, order = 'asc', page = 1, limit = 10 } = req.query; // default limit to 10

        const validSortFields = ['name', 'email', 'username']; // Define valid sort fields
        const validOrder = ['asc', 'desc'];

        // Validate sort and order
        if (sort && !validSortFields.includes(sort)) {
            return res.status(400).json({ error: 'Invalid sort field' });
        }
        if (order && !validOrder.includes(order)) {
            return res.status(400).json({ error: 'Invalid order' });
        }

        const pageNumber = parseInt(page, 10);
        const limitNumber = parseInt(limit, 10);

        // Validate pagination values
        if (isNaN(pageNumber) || pageNumber <= 0) {
            return res.status(400).json({ error: 'Invalid page number' });
        }

        if (isNaN(limitNumber) || limitNumber <= 0) {
            return res.status(400).json({ error: 'Invalid limit' });
        }

        const queryOptions = {};
        
        // Set the sorting order
        if (sort) {
            queryOptions.sort = { [sort]: order === 'asc' ? 1 : -1 }; // 1 for ascending, -1 for descending
        }

        // Fetch the users with pagination and sorting
        const usuarios = await usuariosModel.find()
            .sort(queryOptions.sort)
            .skip((pageNumber - 1) * limitNumber) // Pagination
            .limit(limitNumber); // Convert limit to number

        // Get the total count of users for pagination info
        const totalCount = await usuariosModel.countDocuments();

        // Send response with data and total count for pagination
        res.json({ totalCount, usuarios });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Get user by name
export const obtenerUsuarioPorNombre = async (req, res) => {
    const { name } = req.params; // Extract name from URL parameters

    if (!name) {
        return res.status(400).send("El nombre es requerido");
    }

    try {
        // Search for the user by name in the MongoDB database
        const user = await usuariosModel.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });

        if (!user) {
            return res.status(404).send({ mensaje: "No se encontró el usuario con ese nombre" });
        }

        // Send the user data as a response
        res.json({
            _id: user._id,
            name: user.name,
            username: user.username,
            email: user.email,
        });
    } catch (error) {
        console.error("Error fetching user by name:", error);
        res.status(500).send("Error al buscar el usuario por nombre");
    }
};




//Adherir Usuarios
const adherirUsuario = async (newUser) => {
    const existingUser = await usuariosModel.findOne({ name: newUser.name });
    if (existingUser) {
        throw new Error("El usuario ya existe");
    }

    const newPassword = await bcrypt.hash(newUser.password, 10);
    //const userCount = await usuariosModel.countDocuments(); // Get the current user count
    //newUser.id = userCount > 0 ? userCount + 1 : 1;
    const orderedUsuarios = new usuariosModel({
        //id: newUser.id,
        name: newUser.name,
        username: newUser.username,
        email: newUser.email,
        password: newPassword,
    });

    try {
        const savedUser = await orderedUsuarios.save(); // Save to MongoDB
        return savedUser;
    } catch (err) {
        console.error("Error guardando el usuario en la base de datos", err);
        throw new Error("Error al guardar el usuario en la base de datos");
    }
};



export const agregarUsuarios = async (req, res) => {
    const { name, username, email, password } = req.body;

    if (!name) {
        return res.status(400).send("El nombre es requerido");
    }
    if (!username) {
        return res.status(400).send("El nombre de usuario es requerido");
    }
    if (!email) {
        return res.status(400).send("El email es requerido");
    }
    if (!password) {
        return res.status(400).send("El password es requerido");
    }

    const newUser = { name, username, email, password };

    try {
        const addedUser = await adherirUsuario(newUser);
        res.json(addedUser);
    } catch (err) {
        if (err.message === "El usuario ya existe") {
            return res.status(400).send(err.message);
        }
        return res.status(500).send("Error adheriendo al usuario");
    }
};


//Login user
export const loginUsuario = async (req, res) => {
    const { email, password } = req.body;

    if (!email) {
        return res.status(400).send("El email es requerido");
    }
    if (!password) {
        return res.status(400).send("El password es requerido");
    }

    try {
        // Find user by email in the MongoDB database
        const user = await usuariosModel.findOne({ email });

        if (!user) {
            return res.status(404).send({ mensaje: "No se encontró el usuario" });
        }

        // Compare the provided password with the hashed password in the database
        const validPassword = await bcrypt.compare(password, user.password);

        if (!validPassword) {
            return res.status(401).json({ mensaje: "El password es incorrecto" });
        }

        // Generate a JWT token
        const jwtToken = jwt.sign(
            {usuario:{ _id: user._id, email: user.email, name: user.name, username:user.username }}
            , secretKey, { expiresIn: process.env.EXPIRATION || '30s' });
            console.log("Generated JWT Token:", jwtToken);
            // console.log('expiration', process.env.EXPIRATION);
        res.json({ 
            usuario: {
                _id: user._id, 
                name:user.name,
                username: user.username,
                email: user.email
            },
            jwtToken
        });
    } catch (error) {
        console.error("Error during login:", error);
        res.status(500).send("Error al iniciar sesión");
    }
};