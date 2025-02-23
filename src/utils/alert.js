// utils/alert.js
export default function showAlert(message, type = 'info') {
    const alertBox = document.createElement('div');
    alertBox.textContent = message;
    alertBox.className = `alert alert-${type}`;
    
    // Basic styling
    alertBox.style.position = 'fixed';

    alertBox.style.padding = '10px 20px';
    alertBox.style.borderRadius = '5px';
    alertBox.style.zIndex = '10000';
    alertBox.style.color = '#fff';
    alertBox.style.fontSize = '16px';
    alertBox.style.fontWeight = 'bold';
    alertBox.style.boxShadow = '0px 4px 6px rgba(0,0,0,0.1)';
    
    // Set background color based on type
    switch (type) {
        //-----------------------LOG IN---------------------------
        case 'login_success':
            alertBox.style.position = 'fixed';
            alertBox.style.top = '40px';
            alertBox.style.left = '50%';
            alertBox.style.transform = 'translateX(-50%)';
            //alertBox.style.right = '20px';
            alertBox.style.padding = '10px 20px';
            alertBox.style.boxShadow = '0px 4px 10px rgba(0, 0, 0, 0.2)'; // Added shadow
           
            alertBox.style.backgroundColor = '#28a745'; // Green
            break;
        case 'login_error':
            alertBox.style.position = 'fixed';
            alertBox.style.top = '40px';
            alertBox.style.left = '50%';
            alertBox.style.transform = 'translateX(-50%)';
            //alertBox.style.right = '20px';
            alertBox.style.padding = '10px 20px';
            alertBox.style.boxShadow = '0px 4px 10px rgba(0, 0, 0, 0.2)'; // Added shadow
            alertBox.style.backgroundColor = '#dc3545'; // Red
            break;
        
        //-----------------------SIGN UP---------------------------
        case 'signup_success':
            alertBox.style.position = 'fixed';
            alertBox.style.top = '40px';
            alertBox.style.left = '50%';
            alertBox.style.transform = 'translateX(-50%)';
            //alertBox.style.right = '20px';
            alertBox.style.padding = '10px 20px';
            alertBox.style.boxShadow = '0px 4px 10px rgba(0, 0, 0, 0.2)'; // Added shadow
            alertBox.style.backgroundColor = '#28a745'; // Green
            break;
        case 'signup_error':
                alertBox.style.position = 'fixed';
                alertBox.style.top = '40px';
                alertBox.style.left = '50%';
                alertBox.style.transform = 'translateX(-50%)';
                //alertBox.style.right = '20px';
                alertBox.style.padding = '10px 20px';
                alertBox.style.boxShadow = '0px 4px 10px rgba(0, 0, 0, 0.2)'; // Added shadow
                alertBox.style.backgroundColor = '#dc3545'; // Red
                break;

          //-----------------------COMPLAINTS (With Slide Animation)---------------------------
          case 'complaint_success':
            alertBox.style.position = 'fixed';
            alertBox.style.bottom = '-50px'; // Start hidden
            alertBox.style.left = '100px';
            alertBox.style.transform = 'translateX(-50%)';
            alertBox.style.padding = '10px 20px';
            alertBox.style.boxShadow = '0px 4px 10px rgba(0, 0, 0, 0.2)';
            alertBox.style.backgroundColor = '#28a745';
        // Slow Slide In (1.5s)
        alertBox.style.transition = 'bottom 1.5s ease-in-out';
        setTimeout(() => {
            alertBox.style.bottom = '20px';
        }, 100);

        // Slow Slide Out (1.5s)
        setTimeout(() => {
            alertBox.style.bottom = '-50px';
        }, 4000); // Wait 3s, then slide out slowly
        break;
    
        case 'complaint_error':
            alertBox.style.position = 'fixed';
            alertBox.style.bottom = '-50px'; // Start hidden
            alertBox.style.left = '100px';
            alertBox.style.transform = 'translateX(-50%)';
            alertBox.style.padding = '10px 20px';
            alertBox.style.boxShadow = '0px 4px 10px rgba(0, 0, 0, 0.2)';
            alertBox.style.backgroundColor = '#dc3545'; // Red
        // Slow Slide In (1.5s)
        alertBox.style.transition = 'bottom 1.5s ease-in-out';
        setTimeout(() => {
            alertBox.style.bottom = '20px';
        }, 100);

        // Slow Slide Out (1.5s)
        setTimeout(() => {
            alertBox.style.bottom = '-50px';
        }, 4000); // Wait 3s, then slide out slowly
        break;
        case 'warning':
            alertBox.style.backgroundColor = '#ffc107'; // Yellow
            alertBox.style.color = '#000';
            break;

        default:
            alertBox.style.backgroundColor = '#007bff'; // Blue
    }

    document.body.appendChild(alertBox);

    // Remove the alert after 3 seconds
    setTimeout(() => {
        alertBox.style.opacity = '0';
        setTimeout(() => alertBox.remove(), 500);
    }, 3000);
}