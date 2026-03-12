document.addEventListener('DOMContentLoaded', () => {
    // --- Tooltip Initialization ---
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });

    const checkInInput = document.getElementById('checkIn');
    const checkOutInput = document.getElementById('checkOut');
    const bookingForm = document.getElementById('bookingForm');

    // 1. Set Min Check-in to Today
    const today = new Date().toISOString().split('T')[0];
    checkInInput.setAttribute('min', today);

    // 2. Handle Check-in Change
    checkInInput.addEventListener('change', () => {
        const checkInDate = checkInInput.value;

        if (checkInDate) {
            // Enable Check-out
            checkOutInput.removeAttribute('disabled');

            // Set Min Check-out to Check-in + 1 day
            const nextDay = new Date(checkInDate);
            nextDay.setDate(nextDay.getDate() + 1);
            const minCheckOut = nextDay.toISOString().split('T')[0];

            checkOutInput.setAttribute('min', minCheckOut);

            // If current check-out is before new min, reset it
            if (checkOutInput.value && checkOutInput.value < minCheckOut) {
                checkOutInput.value = '';
            }
        }
    });

    // --- Guest Limit Logic ---
    const roomTypeInput = document.getElementById('roomType');
    const adultsInput = document.getElementById('adults');
    const childrenInput = document.getElementById('children');
    const guestLimitInfo = document.getElementById('guestLimitInfo');
    const selectedRoomName = document.getElementById('selectedRoomName');
    const maxGuestCount = document.getElementById('maxGuestCount');

    const roomLimits = {
        'single': { name: 'Single Room', max: 1 },
        'double': { name: 'Double Room', max: 2 },
        'suite': { name: 'Suite', max: 4 },
        'deluxe': { name: 'Deluxe Suite', max: 6 }
    };

    roomTypeInput.addEventListener('change', () => {
        const type = roomTypeInput.value;
        if (roomLimits[type]) {
            const limit = roomLimits[type];
            selectedRoomName.textContent = limit.name;
            maxGuestCount.textContent = limit.max;
            guestLimitInfo.classList.remove('d-none');

            // Trigger guest count validation immediately
            validateGuestCount();
        } else {
            guestLimitInfo.classList.add('d-none');
        }
    });

    const validateGuestCount = () => {
        const type = roomTypeInput.value;
        if (!type) return true;

        const limit = roomLimits[type].max;
        const totalGuests = parseInt(adultsInput.value || 0) + parseInt(childrenInput.value || 0);

        if (totalGuests > limit) {
            adultsInput.classList.add('is-invalid');
            childrenInput.classList.add('is-invalid');
            return false;
        } else {
            adultsInput.classList.remove('is-invalid');
            childrenInput.classList.remove('is-invalid');
            return true;
        }
    };

    [adultsInput, childrenInput].forEach(input => {
        input.addEventListener('input', validateGuestCount);
    });

    // --- Form Validation Engine ---
    const submitBtn = document.getElementById('submitBtn');

    const validateForm = () => {
        let isValid = true;

        // Required Check
        const requiredFields = bookingForm.querySelectorAll('[required]');
        requiredFields.forEach(field => {
            if (!field.value || (field.type === 'number' && field.value < field.min)) {
                field.classList.add('is-invalid');
                isValid = false;
            } else {
                field.classList.remove('is-invalid');
                field.classList.add('is-valid');
            }
        });

        // Date Logic Check
        if (checkInInput.value && checkOutInput.value) {
            if (checkOutInput.value <= checkInInput.value) {
                checkOutInput.classList.add('is-invalid');
                isValid = false;
            }
        }

        // Guest Count Logic Check
        if (!validateGuestCount()) {
            isValid = false;
        }

        // Toggle Submit Button
        submitBtn.disabled = !isValid;
        return isValid;
    };

    // Real-time listeners
    bookingForm.querySelectorAll('input, select, textarea').forEach(input => {
        input.addEventListener('input', validateForm);
        input.addEventListener('change', validateForm);
    });

    // Final Submission Handler
    bookingForm.addEventListener('submit', (e) => {
        e.preventDefault();

        if (validateForm()) {
            showSuccess();
        } else {
            bookingForm.classList.add('was-validated');
        }
    });

    const showSuccess = () => {
        const overlay = document.getElementById('successOverlay');
        overlay.classList.add('show');

        // Disable button to prevent double clicks during animation
        submitBtn.disabled = true;

        setTimeout(() => {
            overlay.classList.remove('show');
            bookingForm.reset();
            bookingForm.classList.remove('was-validated');
            guestLimitInfo.classList.add('d-none');

            // Clear validation classes
            bookingForm.querySelectorAll('.is-valid, .is-invalid').forEach(el => {
                el.classList.remove('is-valid', 'is-invalid');
            });

            // Re-disable checkout since form is reset
            checkOutInput.setAttribute('disabled', 'true');
            validateForm();
        }, 3000);
    };
});
