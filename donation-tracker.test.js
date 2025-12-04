const {validateForm, processDD, updateDom, addDonationToLS, updateTable, deleteDonation, updateTD} = require('./donation-tracker');

const { JSDOM } = require("jsdom");

beforeEach(() => {
    global.window = {};
    const localStorageMock = (() => {
        let store = {};

        return {
            getItem: (key) => store[key] || null,
            setItem: (key, value) => {
                store[key] = value.toString();
            },
            removeItem: (key) => {
                delete store[key];
            },
            clear: () => {
                store = {};
            }
        };
    })();
    Object.defineProperty(window, 'localStorage', {
        value: localStorageMock,
    });
});

test('should add an item to the localStorage', () => {
    const item = {name: 'Test Item' };
    localStorage.setItem('testKey', JSON.stringify(item));
    const retrievedItem = JSON.parse(localStorage.getItem('testKey'));
    expect(retrievedItem).toEqual(item);
});

test('should remove an item from localStorage', () => {
    localStorage.setItem('testKey', 'value');
    localStorage.removeItem('testKey');
    expect(localStorage.getItem('testKey')).toBeNull();
});

test("updateDom with valid args adds updates text in html element", () => {
    const testDom = new JSDOM(`<!DOCTYPE html><p id="result">Hello world</p>`);
    global.document = testDom.window.document;
    const testValue = 30;

    updateDom(testValue);

    const actualHTML = global.document.querySelector("#result").textContent;
    expect(actualHTML).toBe("Result of the operation is 30");
});

describe('Donation Tracker Component', () => {
    let dataForm;

    beforeEach(() => {
        dataForm = {
            charityName: '',
            donationAmount: '',
            donationDate: '',
            donorComment: ''
        };
    });

    describe('Unit Tests', () => {
        test('validateForm identifies empty required fields', () => {
            dataForm.charityName = '';
            dataForm.donationAmount = '';
            dataForm.donationDate = '';
            const result = validateForm(dataForm);
            expect(result).toEqual({
                isValid: false,
                message: 'Fill out all the fields correctly.'
            });
        });

        test('validateForm sees invalid donation amount', () => {
            dataForm.charityName = 'Charity A';
            dataForm.donationAmount = '-50';
            dataForm.donationDate = '2023-10-01';
            const result = validateForm(dataForm);
            expect(result).toEqual({
                isValid: false,
                message: 'Donation amount must be a positive number.'
            });
        });

        test('processDD returns the correct donation input', () => {
            dataForm.charityName = 'Charity A';
            dataForm.donationAmount = '100';
            dataForm.donationDate = '2023-10-01';
            dataForm.donorComment = 'Keep up the good work!';
            const result = validateForm(dataForm);
            expect(result).toEqual({
                isValid: true
            });
        });
    });
    
    describe('Integration Tests', () => {
        test('validateForm identifies empty required fields', () => {
            dataForm.charityName = 'Charity A';
            dataForm.donationAmount = '100';
            dataForm.donationDate = '2023-10-01';
            dataForm.donorComment = 'Great job.';
            const validation = validateForm(dataForm);
            expect(validation.isValid).toBe(true);
            const donationData = processDD(dataForm);
            expect(donationData).toEqual({
                charityName: 'Charity A',
                donationAmount: 100,
                donationDate: '2023-10-01',
                donorComment: 'Great job.'
            });
        });

        test('Submitting the current form with invalid data is triggering the validation feedback', () => {
            dataForm.charityName = '';
            dataForm.donationAmount = 'pop';
            dataForm.donationDate = '';
            const validation = validateForm(dataForm);
            expect(validation.isValid).toBe(false);
            expect(validation.message).toBe('Fill out all the fields correctly.');
        });

        test('Submitting form updates to the temporary data properly', () => {
            const validateForm = {
                charityName: 'Charity A',
                donationAmount: 100,
                donationDate: '2023-10-01',
                donorComment: 'Great job.'
            };

            const donationData = processDD(validateForm);
            addDonationToLS(donationData);
            const donations = JSON.parse(localStorage.getItem('donations'));
            expect(donations).toHaveLength(1);
            expect(donations[0]).toEqual(donationData);
        });

        test('Submitting form with incomplete or unproper data triggers in the DOM', () => {
            const dataForm = {
                charityName: '',
                donationAmount: 'invalid',
                donationDate: '',
                donorComment: ''
            };

            const validation = validateForm(dataForm);
            if (!validation.isValid) {
                updateDom(validation.message);
            }

            expect(validation.message).toBe('Fill out all the fields correctly.');
            /*const errorMessage = document.getElementById('errorMessage');
            expect(errorMessage).toBe('Fill out all the fields correctly.');*/
        });

        test('It should add donation to localStorage', () => {
            const donationData = {
                charityName: 'Charity A',
                donationAmount: 100,
                donationDate: '2023-10-01',
                donorComment: 'Great job!.'
            };

            addDonationToLS(donationData);
            const donations = JSON.parse(localStorage.getItem('donations'));
            expect(donations).toHaveLength(2);
            expect(donations[0]).toEqual(donationData);
        });
    });
});