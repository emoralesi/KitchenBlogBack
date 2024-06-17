import { getUserbyEmail, getUsersDescovery, saveUser } from "../dao/UserDao.js";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const UserRegister = async (body, res) => {
    try {

        const existingUser = await getUserbyEmail(body.email);

        if (existingUser) {
            return res.status(400).json({ message: 'El correo electrónico ya está registrado' });
        }
        // Hash de la contraseña
        const hashedPassword = await bcrypt.hash(body.password, 10);

        // Crear un nuevo usuario
        const usuario = {
            email: body.email,
            password: hashedPassword,
        };

        await saveUser(usuario);

        return res.status(200).json({ message: 'Usuario registrado con éxito' });

    } catch (error) {
        console.error('Error al registrar usuario:', error);
        return res.status(500).json({ message: 'Error interno del servidor al registrar usuario' });
    }
}

export const LoginUser = async (body, res) => {
    try {
        const usuario = await getUserbyEmail(body.email);

        if (!usuario) {
            return res.status(200).json({ status: 'notOK', message: 'El correo electrónico o la contraseña son incorrectos' });
        }

        // Verificar la contraseña
        const passwordMatch = await bcrypt.compare(body.password, usuario.password);

        if (!passwordMatch) {
            return res.status(200).json({ status: 'notOK', message: 'El correo electrónico o la contraseña son incorrectos' });
        }

        // Generar y devolver el token JWT
        const token = jwt.sign({ email: usuario.email }, 'secreto', { expiresIn: '50m' });
        return res.status(200).json({ status: 'ok', usuarioId: usuario._id, token: token });
    } catch (error) {
        console.error('Error al iniciar sesión:', error);
        return res.status(500).json({ status: 'error', message: 'Error interno del servidor al iniciar sesión' });
    }
}

export const getUserDescubrir = async (body, res) => {
    const usuarios = await getUsersDescovery(body.userId);
    console.log(usuarios);
    if (usuarios.length > 0) {
        res.status(200).json({ status: 'ok', message: 'Se encontraron ' + usuarios.length + ' usuarios', usuarios: usuarios });
    } else {
        res.status(200).json({ status: 'notContent', message: 'No se encontraron Posts' });
    }
}

export default { UserRegister, LoginUser }