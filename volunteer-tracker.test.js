const { getLogsFromStorage, saveLogsToStorage, updateTotalHours, addRowToTable, handleFormSubmission, fillStars, clearStars } = require('./volunteer-tracker.js');

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

describe('Volunteer Tracker Component', () => {
    let dataForm;

    beforeEach(() => {
        dataForm = {
            charityName: '',
            hoursVolunteered: '',
            date: ''
        };
    });

    describe('Unit Tests', () => {
        test('should calculate total volunteer hours correctly', () => {
            const logs = [
                { hoursVolunteered: '5' },
                { hoursVolunteered: '3' },
                { hoursVolunteered: '7' }
            ];
            localStorage.setItem("volunteerLogs", JSON.stringify(logs));
            updateTotalHours();
            const totalHours = document.getElementById('total-hours').textContent;
            expect(totalHours).toBe('Total Hours Volunteered: 15');
        });

        test('fillStars updates the rating correctly', () => {
            const starElements = document.querySelectorAll(".star");
            fillStars(3);
            expect(starElements[3].classList.contains("filled")).toBe(true);
        });

        test('clearStars removes all filled stars', () => {
            const starElements = document.querySelectorAll(".star");
            clearStars();
            expect(starElements[0].classList.contains("filled")).toBe(false);
        });
    });

    describe('Integration Tests', () => {
        test('submitting form adds a new entry to the table and localStorage', () => {
            dataForm.charityName = 'Charity A';
            dataForm.hoursVolunteered = '5';
            dataForm.date = '2023-04-01';

            handleFormSubmission({ preventDefault: jest.fn() });

            const logs = JSON.parse(localStorage.getItem('volunteerLogs'));
            expect(logs).toHaveLength(1);
            expect(logs[0].charityName).toBe('Charity A');
            expect(logs[0].hoursVolunteered).toBe(5);

            const table = document.querySelector('#volunteer-table tbody');
            expect(table.childElementCount).toBe(1);
            expect(table.children[0].querySelector('td').textContent).toBe('Charity A');
        });

        test('should delete an entry from table and localStorage correctly', () => {
            const donationData = { id: 1, charityName: 'Charity A', hoursVolunteered: '5', date: '2023-04-01' };
            const logs = [donationData];
            localStorage.setItem("volunteerLogs", JSON.stringify(logs));
            addRowToTable(donationData);

            const deleteButton = document.querySelector('.delete-button');
            deleteButton.click();

            const updatedLogs = JSON.parse(localStorage.getItem('volunteerLogs'));
            expect(updatedLogs).toHaveLength(0);
            const table = document.querySelector('#volunteer-table tbody');
            expect(table.childElementCount).toBe(0);
        });

        test('should display error message for incomplete form submission', () => {
            dataForm.charityName = '';
            dataForm.hoursVolunteered = '';
            dataForm.date = '';

            handleFormSubmission({ preventDefault: jest.fn() });

            const errorMessage = document.getElementById('error-message').textContent;
            expect(errorMessage).toBe('Please complete all fields properly.\nHours should be more than 0.\n');
        });

        test('should update total hours when a record is deleted', () => {
            const logs = [
                { hoursVolunteered: '5' },
                { hoursVolunteered: '3' }
            ];
            localStorage.setItem("volunteerLogs", JSON.stringify(logs));

            updateTotalHours();
            const totalHoursBefore = document.getElementById('total-hours').textContent;
            expect(totalHoursBefore).toBe('Total Hours Volunteered: 8');


            const deleteButton = document.querySelector('.delete-button');
            deleteButton.click();

            updateTotalHours();
            const totalHoursAfter = document.getElementById('total-hours').textContent;
            expect(totalHoursAfter).toBe('Total Hours Volunteered: 3');
        });
    });
});
