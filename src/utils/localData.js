export const INDIA_STATES = {
    "Odisha": { 
        lang: "Odia, English", std: "0674, 0661", capital: "Bhubaneswar", 
        assembly_seats: 147, parliament_seats: 21,
        districts: ["Khurda", "Cuttack", "Ganjam", "Puri", "Sambalpur", "Balasore", "Bhadrak", "Jajpur", "Mayurbhanj"]
    },
    "Maharashtra": { 
        lang: "Marathi", std: "022, 020", capital: "Mumbai", 
        assembly_seats: 288, parliament_seats: 48,
        districts: ["Mumbai", "Pune", "Nagpur", "Thane", "Nashik", "Aurangabad", "Solapur"]
    },
    "Karnataka": { 
        lang: "Kannada", std: "080", capital: "Bengaluru", 
        assembly_seats: 224, parliament_seats: 28,
        districts: ["Bengaluru", "Mysuru", "Hubli", "Belagavi", "Mangaluru"]
    },
    "Tamil Nadu": { 
        lang: "Tamil", std: "044, 0422", capital: "Chennai", 
        assembly_seats: 234, parliament_seats: 39,
        districts: ["Chennai", "Coimbatore", "Madurai", "Salem", "Trichy"]
    },
    "Uttar Pradesh": { 
        lang: "Hindi, Urdu", std: "0522, 0120", capital: "Lucknow", 
        assembly_seats: 403, parliament_seats: 80,
        districts: ["Lucknow", "Kanpur", "Varanasi", "Agra", "Meerut", "Ghaziabad", "Prayagraj"]
    },
    "Gujarat": { 
        lang: "Gujarati, Hindi", std: "079", capital: "Gandhinagar", 
        assembly_seats: 182, parliament_seats: 26,
        districts: ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Bhavnagar"]
    },
    "West Bengal": { 
        lang: "Bengali, English", std: "033", capital: "Kolkata", 
        assembly_seats: 294, parliament_seats: 42,
        districts: ["Kolkata", "Howrah", "Darjeeling", "Siliguri", "Asansol"]
    },
    "Bihar": { 
        lang: "Hindi, Maithili", std: "0612", capital: "Patna", 
        assembly_seats: 243, parliament_seats: 40,
        districts: ["Patna", "Gaya", "Bhagalpur", "Muzaffarpur", "Purnia"]
    },
    "Rajasthan": { 
        lang: "Hindi, Rajasthani", std: "0141", capital: "Jaipur", 
        assembly_seats: 200, parliament_seats: 25,
        districts: ["Jaipur", "Jodhpur", "Udaipur", "Kota", "Ajmer"]
    },
    "Madhya Pradesh": { 
        lang: "Hindi", std: "0755", capital: "Bhopal", 
        assembly_seats: 230, parliament_seats: 29,
        districts: ["Indore", "Bhopal", "Gwalior", "Jabalpur", "Ujjain"]
    },
    "Kerala": { 
        lang: "Malayalam", std: "0471, 0484", capital: "Thiruvananthapuram", 
        assembly_seats: 140, parliament_seats: 20,
        districts: ["Thiruvananthapuram", "Kochi", "Kozhikode", "Thrissur", "Kollam"]
    },
    "Andhra Pradesh": { 
        lang: "Telugu, Urdu", std: "0866, 0891", capital: "Amaravati", 
        assembly_seats: 175, parliament_seats: 25,
        districts: ["Visakhapatnam", "Vijayawada", "Guntur", "Nellore", "Kurnool"]
    },
    "Telangana": { 
        lang: "Telugu, Urdu", std: "040", capital: "Hyderabad", 
        assembly_seats: 119, parliament_seats: 17,
        districts: ["Hyderabad", "Warangal", "Nizamabad", "Khammam", "Karimnagar"]
    },
    "Delhi": { 
        lang: "Hindi, Punjabi, English", std: "011", capital: "New Delhi", 
        assembly_seats: 70, parliament_seats: 7,
        districts: ["New Delhi", "North Delhi", "South Delhi", "West Delhi", "East Delhi"]
    },
    "Punjab": { 
        lang: "Punjabi", std: "0172, 0161", capital: "Chandigarh", 
        assembly_seats: 117, parliament_seats: 13,
        districts: ["Ludhiana", "Amritsar", "Jalandhar", "Patiala", "Bathinda"]
    },
    "Haryana": { 
        lang: "Hindi, Punjabi", std: "0172", capital: "Chandigarh", 
        assembly_seats: 90, parliament_seats: 10,
        districts: ["Gurugram", "Faridabad", "Panipat", "Ambala", "Hisar"]
    },
    "Jharkhand": { 
        lang: "Hindi, Santali", std: "0651", capital: "Ranchi", 
        assembly_seats: 81, parliament_seats: 14,
        districts: ["Ranchi", "Jamshedpur", "Dhanbad", "Bokaro", "Deoghar"]
    },
    "Chhattisgarh": { 
        lang: "Chhattisgarhi, Hindi", std: "0771", capital: "Raipur", 
        assembly_seats: 90, parliament_seats: 11,
        districts: ["Raipur", "Bhilai", "Bilaspur", "Korba", "Durg"]
    }
};

export const WORLD_COUNTRIES = {
    "in": { lang: "Hindi, English", code: "+91", currency: "INR", continent: "Asia", capital: "New Delhi" },
    "us": { lang: "English", code: "+1", currency: "USD", continent: "North America", capital: "Washington D.C." },
    "gb": { lang: "English", code: "+44", currency: "GBP", continent: "Europe", capital: "London" },
    "fr": { lang: "French", code: "+33", currency: "EUR", continent: "Europe", capital: "Paris" },
    "de": { lang: "German", code: "+49", currency: "EUR", continent: "Europe", capital: "Berlin" },
    "jp": { lang: "Japanese", code: "+81", currency: "JPY", continent: "Asia", capital: "Tokyo" },
    "cn": { lang: "Chinese", code: "+86", currency: "CNY", continent: "Asia", capital: "Beijing" },
    "ru": { lang: "Russian", code: "+7", currency: "RUB", continent: "Europe/Asia", capital: "Moscow" },
    "br": { lang: "Portuguese", code: "+55", currency: "BRL", continent: "South America", capital: "Brasilia" },
    "au": { lang: "English", code: "+61", currency: "AUD", continent: "Oceania", capital: "Canberra" },
    "ca": { lang: "English, French", code: "+1", currency: "CAD", continent: "North America", capital: "Ottawa" },
    "sa": { lang: "Arabic", code: "+966", currency: "SAR", continent: "Asia", capital: "Riyadh" },
    "ae": { lang: "Arabic", code: "+971", currency: "AED", continent: "Asia", capital: "Abu Dhabi" }
};
