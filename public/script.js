document.getElementById('flight-search-form').addEventListener('submit', async function(event) {
    event.preventDefault(); // Prevent the default form submission

    // Get form data
    const departure = document.getElementById('departure').value;
    const arrival = document.getElementById('arrival').value;
    const departureDate = document.getElementById('departure-date').value;
    const returnDate = document.getElementById('return-date').value;
    const flightType = document.querySelector('input[name="flight-type"]:checked').value;

    // Set the currency parameter
    const currency = 'INR'; // Set the currency to INR

    try {
        const response = await fetch(`/api/search-flights`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                departureIds: departure,
                arrivalIds: arrival,
                outboundDate: departureDate,
                returnDate: returnDate,
                type: flightType,
                currency: currency // Add currency parameter here
            })
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        console.log('Fetched Data:', data); // Log the fetched data

        // Store the flight data in local storage
        localStorage.setItem('flightData', JSON.stringify(data)); // Store the flight data

        // Redirect to the results page
        window.location.href = 'results.html'; // Ensure the results page is correctly named
    } catch (error) {
        console.error('Error fetching flight data:', error);
        document.getElementById('flight-results').innerHTML = '<p>Failed to fetch flight data.</p>';
    }
});
function toggleReturnDate() {
    const returnDateGroup = document.getElementById("return-date-group");
    const oneWayOption = document.getElementById("one-way");
    
    if (oneWayOption.checked) {
        // Hide the return date field if "One-way" is selected
        returnDateGroup.style.display = "none";
    } else {
        // Show the return date field for other options
        returnDateGroup.style.display = "block";
    }
}

// Initial call to set visibility based on default selected option
toggleReturnDate();
