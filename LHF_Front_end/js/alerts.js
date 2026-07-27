// Alerts utility wrapper for SweetAlert2
const Alerts = {
    getPrimaryColor() {
        const computedStyle = getComputedStyle(document.documentElement);
        return computedStyle.getPropertyValue('--primary-color').trim() ||
               computedStyle.getPropertyValue('--brand-color').trim() ||
               computedStyle.getPropertyValue('--accent-color').trim() ||
               computedStyle.getPropertyValue('--accent').trim() ||
               '#2563eb';
    },

    async success(message) {
        return Swal.fire({
            icon: 'success',
            title: 'Success',
            text: message,
            timer: 1500,
            showConfirmButton: false,
            timerProgressBar: true,
            background: '#ffffff',
            color: '#0f172a',
            customClass: {
                popup: 'swal2-premium-popup'
            }
        });
    },

    async error(message) {
        return Swal.fire({
            icon: 'error',
            title: 'Error',
            text: message,
            confirmButtonColor: this.getPrimaryColor(),
            background: '#ffffff',
            color: '#0f172a',
            customClass: {
                popup: 'swal2-premium-popup',
                confirmButton: 'swal2-premium-confirm'
            }
        });
    },

    async warning(message) {
        return Swal.fire({
            icon: 'warning',
            title: 'Warning',
            text: message,
            confirmButtonColor: this.getPrimaryColor(),
            background: '#ffffff',
            color: '#0f172a',
            customClass: {
                popup: 'swal2-premium-popup',
                confirmButton: 'swal2-premium-confirm'
            }
        });
    },

    async confirm(message, confirmText = 'Confirm', cancelText = 'Cancel') {
        const result = await Swal.fire({
            icon: 'question',
            title: 'Are you sure?',
            text: message,
            showCancelButton: true,
            confirmButtonColor: this.getPrimaryColor(),
            cancelButtonColor: '#64748b',
            confirmButtonText: confirmText,
            cancelButtonText: cancelText,
            background: '#ffffff',
            color: '#0f172a',
            customClass: {
                popup: 'swal2-premium-popup',
                confirmButton: 'swal2-premium-confirm',
                cancelButton: 'swal2-premium-cancel'
            }
        });
        return result.isConfirmed;
    }
};

// Inject custom styles for modern premium popup design
(function() {
    const style = document.createElement('style');
    style.textContent = `
        .swal2-premium-popup {
            border-radius: 16px !important;
            font-family: 'Outfit', 'Inter', -apple-system, sans-serif !important;
            padding: 2rem !important;
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04) !important;
        }
        .swal2-premium-confirm, .swal2-premium-cancel {
            border-radius: 8px !important;
            font-weight: 500 !important;
            padding: 10px 24px !important;
            font-size: 14px !important;
        }
    `;
    document.head.appendChild(style);
})();
