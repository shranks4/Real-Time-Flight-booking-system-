import express from 'express';
import fetch from 'node-fetch';
import path from 'path';
import cors from 'cors';
import Razorpay from 'razorpay';
import bodyParser from 'body-parser';
import * as fs from 'fs';

const app = express();
const PORT = 3000;


app.use(cors());
app.use(express.json());
app.use(express.static('public')); 
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true}));

const apiKey = 'Your API Key';

var razorpay = new Razorpay({
    key_id: 'API Key',
    key_secret: 'Api Key',
  });


app.post('/api/search-flights', async (req, res) => {
    const { departureIds, arrivalIds, outboundDate, returnDate, type, currency } = req.body;

    
    const currencyValue = currency || 'INR'; 

    
    let url = `https://serpapi.com/search?engine=google_flights&departure_id=${departureIds}&arrival_id=${arrivalIds}&type=${type}&outbound_date=${outboundDate}&currency=${currencyValue}&api_key=${apiKey}`;
    
    if (type !== '2' && returnDate) {
        url += `&return_date=${returnDate}`; 
    }

    try {
        console.log('Fetching flight data from:', url); 
        const response = await fetch(url);
        
        if (!response.ok) {
            const errorMessage = await response.text(); 
            console.error('Error fetching flight data:', errorMessage);
            return res.status(response.status).json({ error: `Error fetching flight data: ${response.statusText}` });
        }

        const flightData = await response.json();
        console.log('Received flight data:', flightData);
        res.json(flightData);
    } catch (error) {
        console.error('Error in flight search:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});


const readData = () =>{
    if(fs.existsSync('orders.json')){
        const data = fs.readFileSync('orders.json');
        return JSON.parse(data);
    }
    return [];
};

const writeData = (data) => {
    fs.writeFileSync('orders.json',JSON.stringify(data,null,2));
};

if(!fs.existsSync('orders.json')){
    writeData([]);
}

app.post('/create-order', async(req, res) => {
    try{
        const{ amount, currency, receipt, notes} = req.body;

        const options = {
            amount: amount * 100,
            currency,
            receipt,
            notes,
        };

        const order = await razorpay.orders.create(options);

        const orders = readData();
        orders.push({
            order_id: order.id,
            amount: order.amount,
            currency: order.currency,
            receipt: order.receipt,
            status: 'created',
        });
        writeData(orders);
        res.json(order);
    }
    catch (error) {
        console.error(error);
        
        res.status(500).json({ error: 'Error creating order' });
    }
}); 


app.get('/payment-success', (req,res) => {
    res.sendFile(path.join(__dirname, 'public', 'success.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

