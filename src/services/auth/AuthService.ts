import dbPromise from '../../models/index.js';
import bcrypt from 'bcryptjs';
import { ModelStatic, Model } from 'sequelize';

export class AuthService {
    getStatus() {
        return {
            status: 'OK',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            environment: process.env.NODE_ENV || 'development'
        };
    }    async signup(email: string, password: string, nombre: string, zonaId: string, deporteId?: string, nivel?: number) {
        const db = await dbPromise;
        
        // Verificar que el modelo Usuario existe
        const Usuario = (db.Usuario && typeof db.Usuario === 'function' && 'findOne' in db.Usuario)
            ? db.Usuario as ModelStatic<Model<any, any>>
            : null;
        
        if (!Usuario) {
            throw new Error('Modelo Usuario no encontrado');
        }

        // Verificar si el usuario ya existe
        const existingUser = await Usuario.findOne({ where: { correo: email } });
        if (existingUser) {
            throw new Error('El usuario ya existe');
        }

        // Verificar que la zona existe
        const Zona = (db.Zona && typeof db.Zona === 'function' && 'findByPk' in db.Zona)
            ? db.Zona as ModelStatic<Model<any, any>>
            : null;
        
        if (Zona) {
            const zonaExists = await Zona.findByPk(zonaId);
            if (!zonaExists) {
                throw new Error('La zona especificada no existe');
            }
        }

        // Verificar que el deporte existe (si se proporciona)
        if (deporteId) {
            const Deporte = (db.Deporte && typeof db.Deporte === 'function' && 'findByPk' in db.Deporte)
                ? db.Deporte as ModelStatic<Model<any, any>>
                : null;
            
            if (Deporte) {
                const deporteExists = await Deporte.findByPk(deporteId);
                if (!deporteExists) {
                    throw new Error('El deporte especificado no existe');
                }
            }
        }

        // Hashear la contraseña
        const hashedPassword = await bcrypt.hash(password, 10);

        // Crear el usuario
        const newUser = await Usuario.create({
            correo: email,
            contraseña: hashedPassword,
            nombre,
            zonaId,
            deporteId,
            nivel
        });

        // Retornar datos del usuario sin la contraseña
        const userData = newUser.get();
        const { contraseña, ...userWithoutPassword } = userData;
        return userWithoutPassword;
    }

    async login(email: string, password: string) {
        const db = await dbPromise;
        // Filtrar solo modelos válidos
        const Usuario = (db.Usuario && typeof db.Usuario === 'function' && 'findOne' in db.Usuario)
            ? db.Usuario as ModelStatic<Model<any, any>>
            : null;
        if (!Usuario) return null;
        const usuario = await Usuario.findOne({ where: { correo: email } });
        if (!usuario) return null;
        // Acceder a los datos con get() de Sequelize
        const usuarioData = usuario.get();
        const match = await bcrypt.compare(password, usuarioData.contraseña);
        if (!match) return null;
        const { contraseña, ...userData } = usuarioData;
        return userData;
    }
}