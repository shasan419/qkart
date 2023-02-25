const httpStatus = require("http-status");
const { Cart, Product } = require("../models");
const ApiError = require("../utils/ApiError");
const config = require("../config/config");


/**
 * Fetches cart for a user
 * - Fetch user's cart from Mongo
 * - If cart doesn't exist, throw ApiError
 * --- status code  - 404 NOT FOUND
 * --- message - "User does not have a cart"
 *
 * @param {User} user
 * @returns {Promise<Cart>}
 * @throws {ApiError}
 */
const getCartByUser = async (user) => {
  const data = await Cart.findOne({ email: user.email});
  if(!data){
    throw new ApiError(httpStatus.NOT_FOUND, "User does not have a cart")
  }
  return data
};

/**
 * Adds a new product to cart
 * - Get user's cart object using "Cart" model's findOne() method
 * --- If it doesn't exist, create one
 * --- If cart creation fails, throw ApiError with "500 Internal Server Error" status code
 *
 * - If product to add already in user's cart, throw ApiError with
 * --- status code  - 400 BAD REQUEST
 * --- message - "Product already in cart. Use the cart sidebar to update or remove product from cart"
 *
 * - If product to add not in "products" collection in MongoDB, throw ApiError with
 * --- status code  - 400 BAD REQUEST
 * --- message - "Product doesn't exist in database"
 *
 * - Otherwise, add product to user's cart
 *
 *
 *
 * @param {User} user
 * @param {string} productId
 * @param {number} quantity
 * @returns {Promise<Cart>}
 * @throws {ApiError}
 */
// const addProductToCart = async (user, productId, quantity) => {
//   let data = await Cart.findOne({ email: user.email});
//   if(!data){
//     const created = await Cart.create({email:user.email,cartItems:[]});
//     if(!created){
//       throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, httpStatus["500_MESSAGE"])
//     }
//     data = await Cart.findOne({ email: user.email});
//   }
//   if(data.cartItems.length > 0){
//     for(var i=0;i<data.cartItems.length;i++){
//       let proID = data.cartItems[i].product._id.toString();
//       if(proID === productId){
//         throw new ApiError(httpStatus.BAD_REQUEST,"Product already in cart. Use the cart sidebar to update or remove product from cart")
//       }
//     }
//   }
//   const isThere = await Product.findOne({_id: productId})
//   if(!isThere){
//     throw new ApiError(httpStatus.BAD_REQUEST,"Product doesn't exist in database")
//   }
//   const addedProduct = await Cart.findOneAndUpdate({email:user.email},{$push: {cartItems: {product:isThere,quantity:quantity}}},{returnOriginal: false})
//   return addedProduct
// };

const addProductToCart = async (user, productId, quantity) => {
  var cart = await Cart.findOne({email:user.email})
  var product = await Product.findOne({_id:productId})
  if(!product){
    throw new ApiError(httpStatus.BAD_REQUEST,"Product doesn't exist in database")
  }
  if(!cart){
      cart = await Cart.create({
      email:user.email,
      cartItems:[],
    })
  }
  if(cart){
    cart.cartItems.forEach(element => {
      if(element.product._id==productId){
        throw new ApiError(httpStatus.BAD_REQUEST,"Product already in cart. Use the cart sidebar to update or remove product from cart")
      }
    });
    cart.cartItems.push({product,quantity})
    await  cart.save()
    return cart
  }
  if(!cart) throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR,"Internal Server Error")
};

/**
 * Updates the quantity of an already existing product in cart
 * - Get user's cart object using "Cart" model's findOne() method
 * - If cart doesn't exist, throw ApiError with
 * --- status code  - 400 BAD REQUEST
 * --- message - "User does not have a cart. Use POST to create cart and add a product"
 *
 * - If product to add not in "products" collection in MongoDB, throw ApiError with
 * --- status code  - 400 BAD REQUEST
 * --- message - "Product doesn't exist in database"
 *
 * - If product to update not in user's cart, throw ApiError with
 * --- status code  - 400 BAD REQUEST
 * --- message - "Product not in cart"
 *
 * - Otherwise, update the product's quantity in user's cart to the new quantity provided
 *
 *
 * @param {User} user
 * @param {string} productId
 * @param {number} quantity
 * @returns {Promise<Cart>
 * @throws {ApiError}
 */
const updateProductInCart = async (user, productId, quantity) => {
  let data = await Cart.findOne({ email: user.email});
  if(!data){
      throw new ApiError(httpStatus.BAD_REQUEST, "User does not have a cart. Use POST to create cart and add a product")
  }
  const isThere = await Product.findOne({_id: productId})
  if(!isThere){
    throw new ApiError(httpStatus.BAD_REQUEST,"Product doesn't exist in database")
  }
  if(data.cartItems.length > 0){
    for(var i=0;i<data.cartItems.length;i++){
      let proID = data.cartItems[i].product._id.toString();
      if(proID === productId){
        data.cartItems[i].quantity = quantity;
        const updatedProduct = await data.save();
        return updatedProduct
      }
    }
  }
  throw new ApiError(httpStatus.BAD_REQUEST,"Product not in cart")   
};

/**
 * Deletes an already existing product in cart
 * - If cart doesn't exist for user, throw ApiError with
 * --- status code  - 400 BAD REQUEST
 * --- message - "User does not have a cart"
 *
 * - If product to update not in user's cart, throw ApiError with
 * --- status code  - 400 BAD REQUEST
 * --- message - "Product not in cart"
 *
 * Otherwise, remove the product from user's cart
 *
 *
 * @param {User} user
 * @param {string} productId
 * @throws {ApiError}
 */
const deleteProductFromCart = async (user, productId) => {
  let data = await Cart.findOne({ email: user.email});
  if(!data){
      throw new ApiError(httpStatus.BAD_REQUEST, "User does not have a cart")
  }
  if(data.cartItems.length > 0){
    for(var i=0;i<data.cartItems.length;i++){
      let proID = data.cartItems[i].product._id.toString();
      let delID = data.cartItems[i]._id;
      if(proID === productId){
        await Cart.findOneAndUpdate({email:user.email},{ $pull: { cartItems: { $elemMatch: { _id:delID } } } },{returnOriginal: false})
      }else{
        throw new ApiError(httpStatus.BAD_REQUEST,"Product not in cart")
      }
    }
  }

};


// TODO: CRIO_TASK_MODULE_TEST - Implement checkout function
/**
 * Checkout a users cart.
 * On success, users cart must have no products.
 *
 * @param {User} user
 * @returns {Promise}
 * @throws {ApiError} when cart is invalid
 */
const checkout = async (user)=> {
  const cart = await Cart.findOne({ email: user.email})
  if(!cart){
    throw new ApiError(httpStatus.NOT_FOUND,"User does not have a cart")
  }
  if(cart.cartItems.length === 0){
    throw new ApiError(httpStatus.BAD_REQUEST,"cart is empty")
  }
  const check = await user.hasSetNonDefaultAddress();
  if(!check){
    throw new ApiError(httpStatus.BAD_REQUEST,"set address first")
  }
  let productCost = [];
  for(var i=0;i<cart.cartItems.length;i++){
    let tquantity = cart.cartItems[i].quantity
    let cost = cart.cartItems[i].product.cost
    let total = cost*tquantity;
    productCost.push(total);
  }
  let totalMoney = productCost.reduce((acc, cur) => {
    return acc + cur;
});
  if(user.walletMoney < totalMoney){
    throw new ApiError(httpStatus.BAD_REQUEST,"Not enough money in wallet")
  }
  user.walletMoney = user.walletMoney - totalMoney;
  cart.cartItems = [];
  const updatedCart = await cart.save();

  return updatedCart
};

module.exports = {
  getCartByUser,
  addProductToCart,
  updateProductInCart,
  deleteProductFromCart,
  checkout,
};
