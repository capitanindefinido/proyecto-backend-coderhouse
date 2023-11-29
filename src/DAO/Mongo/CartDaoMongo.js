import UserDto from "../../dto/users.dto.js";
import { cartsModel } from "../../models/carts.model.js";
import ProductDaoMongo from "./ProductDaoMongo.js";
import TicketDaoMongo from "./TicketDaoMongo.js";

const prodAll = new ProductDaoMongo()
const ticketAll = new TicketDaoMongo()

class CartDaoMongo extends cartsModel
{
    constructor() {
        super();
    }
    async getCarts() 
    {
        try 
        {
          const carts = await CartDaoMongo.find({})
          .populate({
            path: "products.productId", // Rellenar la referencia "productId" en "products"
            model: "products", // Nombre del modelo al que hacer referencia
            select: "image description price stock", // Seleccionar los campos que deseas mostrar
          });
          return carts;
        } 
        catch (error) 
        {
          console.error('Error al obtener los carritos:', error);
          return [];
        }
      }
    async addCart(cartData) 
    {
        try 
        {
          await cartsModel.create(cartData);
          return 'Carrito agregado';
        } catch (error) {
          console.error('Error al agregar el carrito:', error);
          return 'Error al agregar el carrito';
        }
      }
    
      // Obtiene un carrito por ID
      async getCartById(id) 
      {
        try 
        {
          const cart = await cartsModel.findById(id)   
          if (!cart) {
            return 'Carrito no encontrado';
          } 
          return cart;
        } 
        catch (error) 
        {
          console.error('Error al obtener el carrito:', error);
          return 'Error al obtener el carrito';
        }
      }
    
      // Agrega un producto al carrito
      async addProductInCart(cartId, prodId) 
      {
        try 
        {
          const cart = await cartsModel.findById(cartId);
    
          if (!cart) 
          {
            return 'Carrito no encontrado';
          }
    
          // Verifica si el producto ya está en el carrito
          const existingProduct = cart.products.find((product) => product.productId === prodId);
    
          if (existingProduct) 
          {
            // Si el producto ya está en el carrito, aumenta la cantidad
            existingProduct.quantity += 1;
          } 
          else 
          {
            // Si el producto no está en el carrito, agrégalo
            cart.products.push({
              productId: prodId,
              quantity: 1,
            });
          } 
          await cart.save();
          return 'Producto agregado al carrito';
        } catch (error) {
          console.error('Error al agregar el producto al carrito:', error);
          return 'Error al agregar el producto al carrito';
        }
      }
      async removeProductFromCart(cartId, prodId) 
      {
        try 
        {
          const cart = await cartsModel.findById(cartId);
          if (!cart) 
          {
            return 'Carrito no encontrado';
          }
      
          // Busca el índice del producto en el carrito
          const productIndex = cart.products.findIndex((product) => product.productId === prodId);
      
          if (productIndex !== -1) 
          {
            // Si el producto se encuentra en el carrito, elimínalo
            cart.products.splice(productIndex, 1);
            await cart.save();
            return 'Producto eliminado del carrito';
          } 
          else 
          {
            // Si el producto no se encuentra en el carrito, devuelve un mensaje
            return 'Producto no encontrado en el carrito';
          }
        } catch (error) {
          console.error('Error al eliminar el producto del carrito:', error);
          return 'Error al eliminar el producto del carrito';
        }
      }
      async updateProductsInCart(cartId, newProducts) 
      {
        try 
        {
          const cart = await cartsModel.findById(cartId);
      
          if (!cart) 
          {
            return 'Carrito no encontrado';
          }
      
          // Actualiza los productos del carrito con el nuevo arreglo
          cart.products = newProducts;
      
          await cart.save();
          return 'Carrito actualizado con nuevos productos';
        } catch (error) {
          console.error('Error al actualizar el carrito con nuevos productos:', error);
          return 'Error al actualizar el carrito con nuevos productos';
        }
      }
      async updateProductInCart(cartId, prodId, updatedProduct) 
      {
        try 
        {
          const cart = await cartsModel.findById(cartId);
          if (!cart) 
          {
            return 'Carrito no encontrado';
          }     
          // Busca el producto en el carrito por su ID
          const productToUpdate = cart.products.find((product) => product.productId === prodId);
      
          if (!productToUpdate) 
          {
            return 'Producto no encontrado en el carrito';
          }
      
          // Actualiza el producto con la información proporcionada
          Object.assign(productToUpdate, updatedProduct);
      
          await cart.save();
          return 'Producto actualizado en el carrito';
        } catch (error) {
          console.error('Error al actualizar el producto en el carrito:', error);
          return 'Error al actualizar el producto en el carrito';
        }
      }
      async removeAllProductsFromCart(cartId) 
      {
        try {
          const cart = await cartsModel.findById(cartId);    
          if (!cart) 
          {
            return 'Carrito no encontrado';
          }
      
          // Elimina todos los productos del carrito
          cart.products = [];
          await cart.save();
          
          return 'Todos los productos han sido eliminados del carrito';
        } catch (error) {
          console.error('Error al eliminar los productos del carrito:', error);
          return 'Error al eliminar los productos del carrito';
        }
      }
      async getCartWithProducts(cartId) 
      {
        try
        {
          const cart = await cartsModel.findById(cartId).populate('products.productId').lean();
      
          if (!cart) {
            return 'Carrito no encontrado';
          }
      
          return cart;
        } catch (error) {
          console.error('Error al obtener el carrito con productos:', error);
          return 'Error al obtener el carrito con productos';
        }
      }    
      
      async purchaseCart(cartId, user) {
        try {
            const cart = await cartsModel.findById(cartId);
    
            if (!cart) {
                return { error: 'Carrito no encontrado' };
            }
    
            const productsNotPurchased = [];
            let montoTotal = 0
            for (const cartItem of cart.products) {
              try {
                  let prod = JSON.stringify(cartItem)
                  let prodJson = JSON.parse(prod)
          
                  let product = await prodAll.getProductById(prodJson.product);
                  if (!product) {
                      console.error(`Error al procesar el producto ${prodJson.product}: Producto no encontrado`);
                      productsNotPurchased.push(prodJson.product);
                  } else {
                      if (prodJson.quantity > product.stock) {
                          productsNotPurchased.push(product);
                      } else {
                          product.stock -= prodJson.quantity;
                          await prodAll.updateProduct(prodJson.product, product);
                      }
                  }
                  montoTotal += product.price * prodJson.quantity
              } catch (error) {
                  let prod = JSON.stringify(cartItem)
                  let prodJson = JSON.parse(prod)
                  console.error(`Error al procesar el producto ${prodJson.product}:`, error);
                  productsNotPurchased.push(prodJson.product);
              }
            }
            console.log(productsNotPurchased.length)
            console.log(user)
            if (productsNotPurchased.length > 0) {
              const date = new Date(); 
              const totalAmount = montoTotal; 
              const ticketData = {
                date,
                amount: totalAmount,
                purchaser: user.first_name,
                products: productsNotPurchased.map(item => item.productId),
              };
        
              // Crear un ticket con los productos no comprados
              const ticket = await ticketAll.createTicket(ticketData);
              console.log(ticket)
              cart.status = 'completed';
              await cart.save();
          
              return ticket;
            }else{
              cart.status = 'completed';
              await cart.save();
          
              return productsNotPurchased;
            }
            
        } catch (error) {
            console.error('Error al finalizar la compra:', error);
            return { error: 'Error al finalizar la compra' };
        }
    }
      
}
export default CartDaoMongo