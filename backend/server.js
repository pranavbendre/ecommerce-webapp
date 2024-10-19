const express = require('express');
const mongoose = require('mongoose');
const axios = require('axios');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const mongoURI = 'mongodb://localhost:27017/Product';

const PORT = 5000;

// MongoDB connection
mongoose.connect(mongoURI)
    .then(() => console.log('MongoDB connected!'))
    .catch(err => console.log(err));

// Define the Product Schema
const productSchema = new mongoose.Schema({
    title: String,
    price: Number,
    description: String,
    category: String,
    image: String,
    sold: Boolean,
    dateOfSale: Date
});

const Product = mongoose.model('Product', productSchema);

// API to initialize database with seed data
app.get('/api/init', async (req, res) => {
    try {
        const response = await axios.get('https://s3.amazonaws.com/roxiler.com/product_transaction.json');
        await Product.deleteMany({});
        await Product.insertMany(response.data);
        res.status(200).json({ message: 'Database initialized' });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// API to list all transactions with search and pagination
app.get('/api/transactions', async (req, res) => {
    const { page = req.query, perPage = 10, search } = req.query;
    const query = search ? {
        $or: [
            { title: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } },
            { price: search }
        ]
    } : {};

    const transactions = await Product.find(query)
        .limit(perPage)
        .skip((page - 1) * perPage);
    
    const totalCount = await Product.countDocuments(query);
    
    res.json({ transactions, totalCount });
});

// API for statistics
app.get('/api/statistics/:month', async (req, res) => {
    const month = req.params.month;
    
    if (isNaN(month) || month < 1 || month > 12) {
        return res.status(400).json({ error: 'Invalid month parameter. Please provide a month between 1 and 12.' });
    }

    const startDate = new Date(new Date().getFullYear() -2 ,  month - 1, 1);
    console.log(startDate);
    
    const endDate = new Date(new Date().getFullYear() -2, month, 0);
    console.log(endDate);
    try {
    const totalSales = await Product.aggregate([
        { $match: { dateOfSale: { $gte: startDate, $lt: endDate }, sold: true }},
        { $group: { _id: null, totalAmount: { $sum: "$price" }, totalItemsSold: { $sum: 1 }}}
    ]);
    console.log(totalSales);
    

    const totalNotSoldItems = await Product.countDocuments({
        dateOfSale: { $gte: startDate, $lt: endDate },
        sold: false
    });

    res.json({
        totalSalesAmount: totalSales[0]?.totalAmount || 0,
        totalItemsSold: totalSales[0]?.totalItemsSold || 0,
        totalNotSoldItems: totalNotSoldItems
    });

} catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({ error: 'Internal server error' });
}

});


// API for bar chart data
app.get('/api/bar-chart/:month', async (req, res) => {
    const month = req.params.month;
    if (isNaN(month) || month < 1 || month > 12) {
        return res.status(400).json({ error: 'Invalid month parameter. Please provide a month between 1 and 12.' });
    }

    const startDate = new Date(new Date().getFullYear() -2 ,  month - 1, 1);
    const endDate = new Date(new Date().getFullYear() -2, month, 0);

    try {
    const priceRanges = [
        { range: "0-100", min: 0, max: 100 },
        { range: "101-200", min: 101, max: 200 },
        { range: "201-300", min: 201, max: 300 },
        { range: "301-400", min: 301, max: 400 },
        { range: "401-500", min: 401, max: 500 },
        { range: "501-600", min: 501, max: 600 },
        { range: "601-700", min: 601, max: 700 },
        { range: "701-800", min: 701, max: 800 },
        { range: "801-900", min: 801, max: 900 },
        { range: "901-above", min: 901 }
    ];

    const results = await Promise.all(priceRanges.map(async ({ range, min, max }) => {
        return {
            range,
            count:
                await Product.countDocuments({
                    dateOfSale: { $gte:startDate ,$lt:endDate },
                    price : {$gte:min , $lte:max}
                })
        };
    }));

    res.json(results);

    }catch (error) {
        console.error('Error fetching bar chart data:', error);
        res.status(500).json({ error: 'Internal server error' });
    }

});

// API for pie chart data
app.get('/api/pie-chart/:month', async (req, res) => {
    const month = parseInt(req.params.month);
    if (isNaN(month) || month < 1 || month > 12) {
        return res.status(400).json({ error: 'Invalid month parameter. Please provide a month between 1 and 12.' });
    }

    const startDate = new Date(new Date().getFullYear() -2 ,  month - 1, 1);
    const endDate = new Date(new Date().getFullYear() -2, month, 0);

    try {
    const categoriesCount = await Product.aggregate([
        {
            $match:{
                dateOfSale:{ $gte:startDate ,$lt:endDate }
            }
        },
        {
            $group:{
                _id:"$category",
                count:{ $sum :1 }
            }
        }
    ]);

   res.json(categoriesCount);

} catch (error) {
    console.error('Error fetching pie chart data:', error);
    res.status(500).json({ error: 'Internal server error' });
}

});

// Combined API to fetch all statistics
app.get('/api/combined/:month', async (req,res) => {
   const month=req.params.month;
   const statistics=await Promise.all([
       axios.get(`http://localhost:${PORT}/api/statistics/${month}`),
       axios.get(`http://localhost:${PORT}/api/bar-chart/${month}`),
       axios.get(`http://localhost:${PORT}/api/pie-chart/${month}`)
   ]);

   res.json({
       statistics:data[0].data,
       barChart:data[1].data,
       pieChart:data[2].data
   });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));