import { usersModel } from "../../models/users.model.js";
import { logger } from "../../utils/loggers.js";

class UserDaoMongo extends usersModel
{
    constructor() {
        super();
    }
    
      // Agrega un nuevo usuario
      async addUser(userData) 
      {
          try 
          {
            let userCreate = await usersModel.create(userData);
            return userCreate
          } catch (error) {
            logger.error('Error al agregar el usuario:', error);
            return 'Error al agregar el usuario';
          }
      }
    
      // Actualiza un usuario existente
      async updateUser(id, userData) 
      {
        try 
        {
          const user = await UserDaoMongo.findById(id);   
          if (!user) {
            return 'Usuario no encontrado';
          } 
          // Actualiza los campos del usuario
          user.set(userData);
    
          await user.save();
          return 'Usuario actualizado';
        } catch (error) {
          logger.error('Error al actualizar el usuario:', error);
          return 'Error al actualizar el usuario';
        }
      }
    
      // Obtiene todos los usuarios
      async getUsers() 
      {
        try 
        {
          const users = await UserDaoMongo.find({});
          return users;
        } catch (error) {
          logger.error('Error al obtener los usuarios:', error);
          return [];
        }
      }
    
      // Obtiene un usuario por ID
      async getUserById(id) 
      {
        try 
        {
          //La propiedad lean() arregla el error own properties que se muestra al momento de querer mostrar datos desde mongoose, ya que,
          //viene con propiedades propias de mongoose y lean() se las quita para quedar solo el json
          const user = await UserDaoMongo.findById(id).lean();    
          if (!user) 
          {
            return 'Usuario no encontrado';
          }   
          return user;
        } catch (error) {
          logger.error('Error al obtener el usuario:', error);
          return 'Error al obtener el usuario';
        }
      }
      // Elimina un usuario por ID
      async deleteUser(id) 
      {
        try 
        {
          const user = await UserDaoMongo.findById(id);  
          if (!user) {
            return 'Usuario no encontrado';
          }
    
          await user.remove();
          return 'Usuario eliminado';
        } catch (error) {
          logger.error('Error al eliminar el usuario:', error);
          return 'Error al eliminar el usuario';
        }
      }
      async findUser(email) {
        try {
          const user = await UserDaoMongo.findOne({ email }, { email: 1, first_name: 1, last_name: 1, password: 1, rol:1 });
      
          if (!user) {
            return "Usuario no encontrado";
          }
      
          return user;
        } catch (error) {
          logger.error('Error al validar usuario', error);
          return 'Error al obtener el usuario';
        }
      }
      async findEmail(param) {
        try {
          const user = await UserDaoMongo.findOne(param)    
          return user
        } catch (error) {
          logger.error('Error al validar usuario', error);
          return 'Error al obtener el usuario';
        }
      }
}
export default UserDaoMongo;