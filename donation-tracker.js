function form() {
    document.getElementById('donationForm').addEventListener('submit', function(event) {
        event.preventDefault();

        const charityName = document.getElementById('charityName').value;
        const donationAmount = document.getElementById('donationAmount').value;
        const donationDate = document.getElementById('donationDate').value;
        const donorComment = document.getElementById('donorComment').value;
 
        const donationData = {
            charityName: charityName,
            donationAmount: donationAmount,
            donationDate: donationDate,
            donorComment: donorComment
        };

        const validation = validateForm(donationData);

        if (!validation.isValid) {
            document.getElementById('errorMessage').innerText = validation.message;
            return;
        } else {
            document.getElementById('errorMessage').innerHTML = '';
        }

        donationData.donationAmount = parseFloat(donationData.donationAmount);

        console.log('Donation Data:', donationData);

        document.getElementById('donationForm').reset();
        document.getElementById.innerHTML = 'Donation submitted correctly.';
        addDonationToLS(donationData);
        updateTable();
        updateTD();
        updateDom(donationData.donationAmount);
    });
}

function validateForm(data) {
    if(!data.charityName || !data.donationAmount || !data.donationDate) {
        return {
            isValid: false,
            message: 'Fill out all the fields correctly.'
        };
    }
    const donationAmount = parseFloat(data.donationAmount);
    if (isNaN(donationAmount) || donationAmount < 0) {
        return {
            isValid: false,
            message: 'Donation amount must be a positive number.'
        };  
    }
    return { isValid: true};
}

function processDD(data) {
    return {
        charityName: data.charityName,
        donationAmount: parseFloat(data.donationAmount),
        donationDate: data.donationDate,
        donorComment: data.donorComment
    };
}

function addDonationToLS(donation) {
    if (typeof window !== "undefined" && window.localStorage) {
        let donations = JSON.parse(localStorage.getItem('donations')) || [];
        donations.push(donation);
        localStorage.setItem('donations', JSON.stringify(donations)); 
    } else {
        console.error('localStorage is not available in this enviroment.')
    }
}

function updateTable() {
    const donations = JSON.parse(localStorage.getItem('donations')) || [];
    const tableBody = document.getElementById('donationTableBody');

    if(!tableBody) {
        console.error('Element with ID "donationTableBody not found');
        return;
    }

    tableBody.innerHTML = '';

    donations.forEach((donation, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${donation.charityName}</td>
            <td>${donation.donationAmount.toFixed(2)}</td>
            <td>${donation.donationDate}</td>
            <td>${donation.donorComment}</td>
            <td><button onclick="deleteDonation(${index})">Delete</button></td>
        `;
        tableBody.appendChild(row);
    });
}

function deleteDonation(index) {
    let donations = JSON.parse(localStorage.getItem('donations')) || [];
    donations.splice(index, 1);
    localStorage.setItem('donations', JSON.stringify(donations));
    updateTable();
    updateTD();
}

function updateTD() {
    let donations = JSON.parse(localStorage.getItem('donations')) || [];
    const total = donations.reduce((sum, donation) => sum + donation.donationAmount, 0);
    document.getElementById('totalDonations.').innerText = total.toFixed(2);
}

function updateDom(value) {
    let resultNode = document.querySelector("#result");
    if(resultNode) {
        resultNode.textContent = `Result of the operation is ${value}`;
    }

    const errorMessageElement = document.getElementById('errorMessage');
    if (errorMessageElement) {
        errorMessageElement.textContent = '';
    }
}

function init() {
    form();
    updateTable();
    updateTD();
}


if(typeof window !== "undefined") {
    init();
} else {
    module.exports = {validateForm, processDD, updateDom, addDonationToLS, updateTable, deleteDonation, updateTD};
}