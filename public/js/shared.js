// Shared JavaScript Functions

// Feedback System
const showFeedback = (message, type = 'success') => {
    const feedbackDiv = document.createElement('div');
    feedbackDiv.className = `feedback-message feedback-${type}`;
    feedbackDiv.innerHTML = message;
    
    // Add to page
    document.querySelector('.content-section').prepend(feedbackDiv);
    
    // Remove after delay
    setTimeout(() => {
        feedbackDiv.remove();
    }, type === 'error' ? 5000 : 3000);
};

// Loading States
const showLoading = (button) => {
    const originalContent = button.innerHTML;
    button.setAttribute('data-original-content', originalContent);
    button.disabled = true;
    button.innerHTML = `
        <span class="loading-spinner"></span>
        <span class="ms-2">Loading...</span>
    `;
};

const hideLoading = (button) => {
    const originalContent = button.getAttribute('data-original-content');
    button.innerHTML = originalContent;
    button.disabled = false;
};

// Help System
const showHelp = () => {
    const helpModal = new bootstrap.Modal(document.getElementById('helpModal'));
    helpModal.show();
};

const showGuide = (section) => {
    // Implement guide system
    console.log(`Show guide for: ${section}`);
};

// Form Validation
const validateForm = (form) => {
    const requiredFields = form.querySelectorAll('[required]');
    let isValid = true;
    
    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            isValid = false;
            field.classList.add('is-invalid');
            
            // Add error message if not exists
            if (!field.nextElementSibling?.classList.contains('invalid-feedback')) {
                const feedback = document.createElement('div');
                feedback.className = 'invalid-feedback';
                feedback.textContent = 'This field is required';
                field.parentNode.insertBefore(feedback, field.nextSibling);
            }
        } else {
            field.classList.remove('is-invalid');
        }
    });
    
    return isValid;
};

// Error Handling
const handleError = async (error, context) => {
    console.error(`${context}:`, error);
    
    // Show user-friendly message
    showFeedback(
        error.message || 'An unexpected error occurred. Please try again.',
        'error'
    );
    
    // Track error
    if (window.gtag) {
        gtag('event', 'error', {
            error_name: error.name,
            error_message: error.message,
            error_context: context
        });
    }
};

// Mobile Detection
const isMobile = () => {
    return window.innerWidth <= 768;
};

// Responsive Adjustments
const handleResponsive = () => {
    const editor = document.querySelector('.pell-content');
    if (editor) {
        editor.style.height = isMobile() ? '200px' : '300px';
    }
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Setup responsive handlers
    window.addEventListener('resize', handleResponsive);
    handleResponsive();
    
    // Setup form validation
    document.querySelectorAll('form').forEach(form => {
        form.addEventListener('submit', (e) => {
            if (!validateForm(form)) {
                e.preventDefault();
            }
        });
    });
});

// Export functions for use in other files
window.QuickNotes = {
    showFeedback,
    showLoading,
    hideLoading,
    showHelp,
    showGuide,
    validateForm,
    handleError
};
