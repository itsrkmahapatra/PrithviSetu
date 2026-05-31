export const INDIA_STATES = {
    "Odisha": {
        lang: "Odia", std: "0674, 0661, 0680, 0663", capital: "Bhubaneswar",
        assembly_seats: 147, parliament_seats: 21,
        districts: ["Angul", "Boudh", "Balangir", "Bargarh", "Balasore", "Bhadrak", "Cuttack", "Deogarh", "Dhenkanal", "Ganjam", "Gajapati", "Jharsuguda", "Jajpur", "Jagatsinghpur", "Khordha", "Keonjhar", "Kalahandi", "Kandhamal", "Koraput", "Kendrapara", "Malkangiri", "Mayurbhanj", "Nabarangpur", "Nuapada", "Nayagarh", "Puri", "Rayagada", "Sambalpur", "Subarnapur", "Sundargarh"]
    },
    "Maharashtra": {
        lang: "Marathi", std: "022, 020, 0712, 0253, 0240", capital: "Mumbai",
        assembly_seats: 288, parliament_seats: 48,
        districts: ["Ahmednagar", "Akola", "Amravati", "Aurangabad", "Beed", "Bhandara", "Buldhana", "Chandrapur", "Dhule", "Gadchiroli", "Gondia", "Hingoli", "Jalgaon", "Jalna", "Kolhapur", "Latur", "Mumbai City", "Mumbai Suburban", "Nagpur", "Nanded", "Nandurbar", "Nashik", "Osmanabad", "Palghar", "Parbhani", "Pune", "Raigad", "Ratnagiri", "Sangli", "Satara", "Sindhudurg", "Solapur", "Thane", "Wardha", "Washim", "Yavatmal"]
    },
    "Delhi": {
        lang: "Hindi, Punjabi, English", std: "011", capital: "New Delhi",
        assembly_seats: 70, parliament_seats: 7,
        districts: ["Central Delhi", "East Delhi", "New Delhi", "North Delhi", "North East Delhi", "North West Delhi", "Shahdara", "South Delhi", "South East Delhi", "South West Delhi", "West Delhi"]
    },
    "Uttar Pradesh": {
        lang: "Hindi, Urdu", std: "0522, 0120, 0512, 0542, 0562", capital: "Lucknow",
        assembly_seats: 403, parliament_seats: 80,
        districts: ["Agra", "Aligarh", "Allahabad", "Ambedkar Nagar", "Amethi", "Amroha", "Auraiya", "Azamgarh", "Baghpat", "Bahraich", "Ballia", "Balrampur", "Banda", "Barabanki", "Bareilly", "Basti", "Bhadohi", "Bijnor", "Budaun", "Bulandshahr", "Chandauli", "Chitrakoot", "Deoria", "Etah", "Etawah", "Faizabad", "Farrukhabad", "Fatehpur", "Firozabad", "Gautam Buddha Nagar", "Ghaziabad", "Ghazipur", "Gonda", "Gorakhpur", "Hamirpur", "Hapur", "Hardoi", "Hathras", "Jalaun", "Jaunpur", "Jhansi", "Kannauj", "Kanpur Dehat", "Kanpur Nagar", "Kasganj", "Kaushambi", "Kheri", "Kushinagar", "Lalitpur", "Lucknow", "Maharajganj", "Mahoba", "Mainpuri", "Mathura", "Mau", "Meerut", "Mirzapur", "Moradabad", "Muzaffarnagar", "Pilibhit", "Pratapgarh", "Rae Bareli", "Rampur", "Saharanpur", "Sambhal", "Sant Kabir Nagar", "Shahjahanpur", "Shamli", "Shravasti", "Siddharthnagar", "Sitapur", "Sonbhadra", "Sultanpur", "Unnao", "Varanasi"]
    },
    "Karnataka": {
        lang: "Kannada", std: "080, 0821, 0824, 0836", capital: "Bengaluru",
        assembly_seats: 224, parliament_seats: 28,
        districts: ["Bagalkot", "Ballari", "Belagavi", "Bengaluru Rural", "Bengaluru Urban", "Bidar", "Chamarajanagar", "Chikkaballapur", "Chikkamagaluru", "Chitradurga", "Dakshina Kannada", "Davanagere", "Dharwad", "Gadag", "Hassan", "Haveri", "Kalaburagi", "Kodagu", "Kolar", "Koppal", "Mandya", "Mysuru", "Raichur", "Ramanagara", "Shivamogga", "Tumakuru", "Udupi", "Uttara Kannada", "Vijayapura", "Yadgir"]
    }
    // All other states maintained in logic via common patterns
};

export const DISTRICT_DIRECTORY = {
    "Bhubaneswar": { dm: "Chanchal Rana, IAS", mp: "Aparajita Sarangi", mla: "Ananta Narayan Jena" },
    "Mumbai": { dm: "Sanjay Yadav, IAS", mp: "Arvind Sawant", mla: "Rahul Narwekar" },
    "New Delhi": { dm: "K.S. Meena, IAS", mp: "Bansuri Swaraj", mla: "Arvind Kejriwal" },
    "Lucknow": { dm: "Surya Pal Gangwar, IAS", mp: "Rajnath Singh", mla: "Brijesh Pathak" },
    "Bengaluru": { dm: "K.A. Dayananda, IAS", mp: "Tejasvi Surya", mla: "R. Ashoka" },
    "Pune": { dm: "Suhas Diwase, IAS", mp: "Murlidhar Mohol", mla: "Chandrakant Patil" },
    "Ahmedabad": { dm: "Pravina D.K., IAS", mp: "Amit Shah", mla: "Bhupendra Patel" },
    "Kolkata": { dm: "Sumit Gupta, IAS", mp: "Sudeep Bandyopadhyay", mla: "Firhad Hakim" },
    "Chennai": { dm: "Rashmi Siddharth Zagade, IAS", mp: "Dayanidhi Maran", mla: "M.K. Stalin" },
    "Hyderabad": { dm: "Anudeep Durishetty, IAS", mp: "Asaduddin Owaisi", mla: "Akbaruddin Owaisi" },
    "Patna": { dm: "Chandrashekhar Singh, IAS", mp: "Ravi Shankar Prasad", mla: "Nitin Nabin" },
    "Jaipur": { dm: "Prakash Rajpurohit, IAS", mp: "Manju Sharma", mla: "Kali Charan Saraf" },
    "Bhopal": { dm: "Kaushlendra Singh, IAS", mp: "Alok Sharma", mla: "Vishvas Sarang" },
    "Chandigarh": { dm: "Vinay Pratap Singh, IAS", mp: "Manish Tewari", mla: "N/A (UT)" },
    "Thiruvananthapuram": { dm: "Geromic George, IAS", mp: "Shashi Tharoor", mla: "Antony Raju" },
    "Ranchi": { dm: "Rahul Kumar Sinha, IAS", mp: "Sanjay Seth", mla: "C.P. Singh" },
    "Raipur": { dm: "Dr. Gaurav Kumar Singh, IAS", mp: "Brijmohan Agrawal", mla: "Brijmohan Agrawal" },
    "Guwahati": { dm: "Sumit Sattawan, IAS", mp: "Bijuli Kalita Medhi", mla: "Siddhartha Bhattacharya" },
    "Srinagar": { dm: "Dr. Bilal Mohi-Ud-Din Bhat, IAS", mp: "Aga Syed Ruhullah Mehdi", mla: "TBD" },
    "Jammu": { dm: "Sachin Kumar Vaishya, IAS", mp: "Jugal Kishore Sharma", mla: "TBD" },
    "Shimla": { dm: "Anupam Kashyap, IAS", mp: "Suresh Kumar Kashyap", mla: "Anirudh Singh" },
    "Dehradun": { dm: "Sonika, IAS", mp: "Mala Rajya Laxmi Shah", mla: "Vinod Chamoli" },
    "Agartala": { dm: "Dr. Vishal Kumar, IAS", mp: "Biplab Kumar Deb", mla: "Manik Saha" },
    "Aizawl": { dm: "Nazuk Kumar, IAS", mp: "Richard Vanlalhmangaiha", mla: "Lalduhoma" },
    "Kohima": { dm: "Kumar Ramnikant, IAS", mp: "S. Supongmeren Jamir", mla: "Dr. Neikiesalie Kire" },
    "Imphal": { dm: "Th. Kirankumar, IAS", mp: "Angomcha Bimol Akoijam", mla: "N. Biren Singh" },
    "Shillong": { dm: "R.M. Kurbah, IAS", mp: "Ricky AJ Syngkon", mla: "Ampareen Lyngdoh" },
    "Itanagar": { dm: "Shweta Nagarkoti Mehta, IAS", mp: "Kiren Rijiju", mla: "Techi Kaso" },
    "Gangtok": { dm: "Tushar G. Nikhare, IAS", mp: "Indra Hang Subba", mla: "P.S. Tamang" },
    "Panaji": { dm: "Sneha Gitte, IAS", mp: "Shripad Yesso Naik", mla: "Babush Monserrate" }
};

export const WORLD_COUNTRIES = {
    "in": { lang: "Hindi, English", code: "+91", currency: "INR", continent: "Asia", capital: "New Delhi" },
    "us": { lang: "English", code: "+1", currency: "USD", continent: "North America", capital: "Washington D.C." },
    "gb": { lang: "English", code: "+44", currency: "GBP", continent: "Europe", capital: "London" },
    "fr": { lang: "French", code: "+33", currency: "EUR", continent: "Europe", capital: "Paris" },
    "de": { lang: "German", code: "+49", currency: "EUR", continent: "Europe", capital: "Berlin" },
    "jp": { lang: "Japanese", code: "+81", currency: "JPY", continent: "Asia", capital: "Tokyo" }
};
