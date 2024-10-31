document.addEventListener('DOMContentLoaded', function () {
    const flightData = JSON.parse(localStorage.getItem('flightData'));

    const resultsContainer = document.getElementById('flight-results');

    if (flightData && flightData.best_flights && flightData.best_flights.length > 0) {
        flightData.best_flights.forEach(flight => {
           
            const flightInfo = document.createElement('div');
            flightInfo.classList.add('card');

            
            const segments = flight.flights.map(segment => `
                <div class="flight-segment">
                    <img src="${segment.airline_logo}" alt="${segment.airline}" class="airline-logo">
                    <div>
                        <h4>${segment.airline} - Flight ${segment.flight_number}</h4>
                        <p><strong>Departure:</strong> ${segment.departure_airport.name} at ${segment.departure_airport.time}</p>
                        <p><strong>Arrival:</strong> ${segment.arrival_airport.name} at ${segment.arrival_airport.time}</p>
                        <p><strong>Duration:</strong> ${segment.duration} minutes</p>
                        <p><strong>Airplane:</strong> ${segment.airplane}</p>
                    </div>
                </div>
            `).join('');

            
            flightInfo.innerHTML = `
                <div class="card-body">
                    ${segments}
                    <div class="flight-price">
                        <h3>₹${flight.price}</h3>
                    </div>
                    <div class="buy-button-container">
                        <button class="buy-btn" onclick="handleBuy('${flight.price}')">Buy Now</button>
                    </div>
                </div>
            `;

            resultsContainer.appendChild(flightInfo);
        });
    } else {
        resultsContainer.innerHTML = '<p>No flights found.</p>';
    }
});

async function handleBuy(price) {
    const amount = price ; 

    try {
        
        const response = await fetch('/create-order', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                amount: amount,
                currency: 'INR',
                receipt: 'receipt#1',
                notes: {}
            })
        });

        const order = await response.json();

        if (!order || !order.id) {
            throw new Error("Failed to create order. Please try again.");
        }

        const options = {
            key: 'rzp_test_Xm2ZGPXd2yxlDH', 
            amount: order.amount, 
            currency: order.currency,
            name: 'flight-booker',
            description: 'Test Transaction',
            order_id: order.id, 
            callback_url: 'http://localhost:3000/payment-success', 
            prefill: {
                name: 'Shranks',
                email: 'shranks@example.com',
                contact: '9999999999'
            },
            theme: {
                color: '#F37254'
            },
        };

        const rzp = new Razorpay(options);
        rzp.open();
    } catch (error) {
        console.error("Error in handleBuy:", error);
        alert("There was an error processing your request. Please try again.");
    }
}
