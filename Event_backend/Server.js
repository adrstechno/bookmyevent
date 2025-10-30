import express from 'express';
const app = express();
import dotenv from 'dotenv';
dotenv.config();
import db from './Config/DatabaseCon.js';   
import UserRouter from './Router/UserRouter.js';
import ServiceRouter from './Router/ServiceROuter.js';
import VendorRouter from './Router/VendorRouter.js';


// 🟢 Parse incoming requests before routes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 🟢 Then mount routers
app.use('/User', UserRouter);
app.use('/Service', ServiceRouter);
app.use('/Vendor', VendorRouter);


app.get('/', (req, res) => {
    res.send('Welcome to the Event Management API');
});

app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
});
