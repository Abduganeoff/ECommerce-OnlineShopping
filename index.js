const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');

const authRouter = require('./routes/admin/auth');
const adminProductRouter = require('./routes/admin/products');
const productRouter = require('./routes/products');
const cartRouter = require('./routes/carts');

app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession(
    {
        keys: ['superKey']
    }
));
app.use(authRouter);
app.use(adminProductRouter);
app.use(productRouter);
app.use(cartRouter);


app.listen(3000, ()=> {
    console.log('Working...');
});