const express = require('express');

const productRepo = require('../repositories/products');
const cartsRepo = require('../repositories/carts');
const cartShowTemplate = require('../views/carts/show');

const router = express.Router();

router.post('/cart/products', async (req, res) => {

    let cart;
    if(!req.session.cartId) {

    cart = await cartsRepo.create({ items: [] });
    req.session.cartId = cart.userId;

    } else {
        cart = await cartsRepo.getOne(req.session.cartId);
    }

    const existingItem = cart.items.find( item => item.userId === req.body.productId);

    if(existingItem) {
        existingItem.quantity++;
    } else {
        cart.items.push({ userId: req.body.productId, quantity: 1 });
    }

    await cartsRepo.update(cart.userId, {
        items: cart.items
    })

    res.redirect('/cart');
});

router.get('/cart', async (req, res) => {
    if(!req.session.cartId) {
        return res.redirect('/');
    }

    const cart = await cartsRepo.getOne(req.session.cartId);
    console.log(cart);

    for(let item of cart.items) {
        const product = await productRepo.getOne(item.userId);

        item.product = product;
    }

    res.send(cartShowTemplate({ items: cart.items }))
});

router.post('/cart/products/delete', async (req, res) => {
    const { itemId } = req.body;

    const cart = await cartsRepo.getOne(req.session.cartId);

    const items = cart.items.filter( item => item.userId !== itemId);

    await cartsRepo.update( req.session.cartId, { items });
    
    res.redirect('/cart');
});

module.exports = router;