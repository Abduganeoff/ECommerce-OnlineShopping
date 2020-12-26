const express = require('express');
const multer = require('multer');

const productRepo = require('../../repositories/products');
const newProductTemplate = require('../../views/admin/product/new');
const productIndexTemplate = require('../../views/admin/product/index');
const productEditTemplate = require('../../views/admin/product/edit');
const { requireTitle, requirePrice } = require('./validators');
const { handleErrors, requireAuth } = require('./middlewares');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });


router.get('/admin/products', requireAuth, async (req, res) => {
    const products = await productRepo.getAll();
    res.send(productIndexTemplate({ products }));
});

router.get('/admin/products/new', requireAuth, (req, res) => {
    res.send(newProductTemplate( {} ));
});

router.get('/admin/products/:userId/edit', requireAuth, async (req, res) => {
    const product = await productRepo.getOne(req.params.userId);

    if(!product) {
        return res.send('Not found');
    }

    res.send(productEditTemplate({ product }));
});

router.post(
    '/admin/products/:userId/edit',
    requireAuth,
    upload.single('image'),
    [requireTitle, requirePrice],
    handleErrors(productEditTemplate, async (req) => {
        const product = await productRepo.getOne(req.params.userId);

        return { product };
    }),
    async (req, res) => {
        const changes = req.body;

        if(req.file) {
            changes.image = req.file.buffer.toString('base64');
        }

        try {
            await productRepo.update(req.params.userId, changes);
        } catch(err) {
            return res.send('Could not find item');
        }

        res.redirect('/admin/products');
    }
);


router.post(
    '/admin/products/:userId/delete',
    requireAuth,
    async (req, res) => {
        await productRepo.delete(req.params.userId);

        res.redirect('/admin/products');
    }
);


router.post('/admin/products/new',
    requireAuth,
    upload.single('image'), 
    [requireTitle, requirePrice], 
    handleErrors(newProductTemplate),
    async (req, res) => {
        const image = req.file.buffer.toString('base64');
        const { title, price } = req.body;

        await productRepo.create({ title, price, image });
        
        res.redirect('/admin/products');
});




module.exports = router;