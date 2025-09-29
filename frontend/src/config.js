    // This configuration ensures that if the live URL is present, it uses that URL
    // and explicitly adds '/api' to the end of the base URL.
    
    const API_BASE = process.env.VITE_API_URL ? `${process.env.VITE_API_URL}/api` : "http://localhost:5000/api"; 
    export { API_BASE };
    
