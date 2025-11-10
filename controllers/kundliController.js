const { GoogleGenerativeAI } = require("@google/generative-ai");
const Kundli = require("../models/Kundli");
const axios = require("axios");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

// Get coordinates from place name using OpenStreetMap API
async function getCoordinates(placeName) {
  try {
    const response = await axios.get(`https://nominatim.openstreetmap.org/search`, {
      params: {
        q: placeName,
        format: 'json',
        limit: 1
      }
    });
    
    if (response.data && response.data.length > 0) {
      const { lat, lon } = response.data[0];
      return { lat: parseFloat(lat), lon: parseFloat(lon) };
    }
    throw new Error('Location not found');
  } catch (error) {
    // Fallback to static coordinates for common cities
    const cityCoords = {
      "New Delhi": { lat: 28.6139, lon: 77.2090 },
      "Delhi": { lat: 28.6139, lon: 77.2090 },
      "Mumbai": { lat: 19.0760, lon: 72.8777 },
      "Kolkata": { lat: 22.5726, lon: 88.3639 },
      "Chennai": { lat: 13.0827, lon: 80.2707 },
      "Bengaluru": { lat: 12.9716, lon: 77.5946 },
      "Jaipur": { lat: 26.9124, lon: 75.7873 },
    };
    
    const coords = cityCoords[placeName] || cityCoords["Delhi"];
    return coords;
  }
}

// Enhanced astrology calculations with location
function getAstrologyData(date, time, lat, lon) {
  const birthDate = new Date(`${date}T${time}`);
  const year = birthDate.getFullYear();
  const month = birthDate.getMonth() + 1;
  const day = birthDate.getDate();
  const hour = birthDate.getHours();
  const minute = birthDate.getMinutes();
  
  // Calculate day of year
  const dayOfYear = Math.floor((birthDate - new Date(year, 0, 0)) / (1000 * 60 * 60 * 24));
  
  // Enhanced planetary calculations considering location
  const locationFactor = (lat + lon) / 100;
  
  const planets = {
    sun: {
      sign: getZodiacSign(month, day),
      degree: ((day - 1) * 30 / 31) + (locationFactor * 0.1),
      house: getHouse(dayOfYear, 1)
    },
    moon: {
      sign: getZodiacSign((month + Math.floor(dayOfYear / 29.5)) % 12 + 1, day),
      degree: (dayOfYear * 13.2) % 30,
      house: getHouse(dayOfYear, 2)
    },
    mars: {
      sign: getZodiacSign((month + Math.floor(dayOfYear / 687)) % 12 + 1, day),
      degree: (dayOfYear * 0.53) % 30,
      house: getHouse(dayOfYear, 3)
    },
    mercury: {
      sign: getZodiacSign((month + Math.floor(dayOfYear / 88)) % 12 + 1, day),
      degree: (dayOfYear * 4.1) % 30,
      house: getHouse(dayOfYear, 4)
    },
    venus: {
      sign: getZodiacSign((month + Math.floor(dayOfYear / 225)) % 12 + 1, day),
      degree: (dayOfYear * 1.6) % 30,
      house: getHouse(dayOfYear, 5)
    },
    jupiter: {
      sign: getZodiacSign((month + Math.floor(dayOfYear / 4333)) % 12 + 1, day),
      degree: (dayOfYear * 0.08) % 30,
      house: getHouse(dayOfYear, 6)
    },
    saturn: {
      sign: getZodiacSign((month + Math.floor(dayOfYear / 10759)) % 12 + 1, day),
      degree: (dayOfYear * 0.03) % 30,
      house: getHouse(dayOfYear, 7)
    },
    rahu: {
      sign: getZodiacSign((13 - month) % 12 + 1, day),
      degree: (360 - (dayOfYear * 0.05)) % 30,
      house: getHouse(dayOfYear, 8)
    },
    ketu: {
      sign: getZodiacSign((7 - month) % 12 + 1, day),
      degree: (dayOfYear * 0.05) % 30,
      house: getHouse(dayOfYear, 9)
    }
  };
  
  return planets;
}

function getZodiacSign(month, day) {
  const signs = [
    "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
    "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
  ];
  
  const signDates = [
    [3, 21], [4, 20], [5, 21], [6, 21], [7, 23], [8, 23],
    [9, 23], [10, 23], [11, 22], [12, 22], [1, 20], [2, 19]
  ];
  
  for (let i = 0; i < signDates.length; i++) {
    const [signMonth, signDay] = signDates[i];
    if (month < signMonth || (month === signMonth && day < signDay)) {
      return signs[i === 0 ? 11 : i - 1];
    }
  }
  return signs[11];
}

function getHouse(dayOfYear, planetOffset) {
  return ((dayOfYear + planetOffset * 30) % 360 / 30) + 1;
}

// Generate Kundli
exports.generateKundli = async (req, res) => {
  try {
    const { name, dateOfBirth, timeOfBirth, placeOfBirth, paymentId } = req.body;
    const userId = req.user.id;

    if (!name || !dateOfBirth || !timeOfBirth || !placeOfBirth) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields: name, dateOfBirth, timeOfBirth, placeOfBirth",
      });
    }

    // Verify payment is provided
    if (!paymentId) {
      return res.status(400).json({
        success: false,
        message: "Payment verification required. Please complete payment first.",
      });
    }

    // TODO: Add payment verification logic here
    // For now, we'll proceed if paymentId is provided

    const { lat, lon } = await getCoordinates(placeOfBirth);
    const planets = getAstrologyData(dateOfBirth, timeOfBirth, lat, lon);

    const prompt = `
      निम्नलिखित व्यक्ति के लिए विस्तृत वैदिक ज्योतिष कुंडली तैयार करें:
      नाम: ${name}
      जन्म तिथि: ${dateOfBirth}
      जन्म समय: ${timeOfBirth}
      जन्म स्थान: ${placeOfBirth} (अक्षांश: ${lat}, देशांतर: ${lon})
      
      ग्रहों की स्थिति:
      ${JSON.stringify(planets, null, 2)}
      
      कृपया निम्नलिखित विषयों पर विस्तार से बताएं (केवल हिंदी में):
      1. सूर्य, चंद्र और लग्न के आधार पर व्यक्तित्व के मुख्य गुण
      2. करियर और व्यवसाय संबंधी मार्गदर्शन
      3. विवाह और रिश्तों की संभावनाएं
      4. स्वास्थ्य संबंधी सुझाव
      5. भाग्यशाली संख्या, रंग और रत्न
      6. अनुकूल और प्रतिकूल समय
      7. उपाय और सुझाव
      
      कृपया पूरी जानकारी केवल हिंदी भाषा में दें।
    `;

    const result = await model.generateContent(prompt);
    const interpretation = result.response.text();

    const newKundli = await Kundli.create({
      userId,
      name,
      date: dateOfBirth,
      time: timeOfBirth,
      city: placeOfBirth,
      lat,
      lon,
      planets,
      interpretation,
    });

    res.status(200).json({ success: true, data: newKundli });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get all Kundlis for a user
exports.getUserKundlis = async (req, res) => {
  try {
    const userId = req.user.id;
    const kundlis = await Kundli.find({ userId }).sort({ createdAt: -1 });
    
    res.status(200).json({ success: true, data: kundlis });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get single Kundli by ID
exports.getKundliById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const kundli = await Kundli.findOne({ _id: id, userId });
    if (!kundli) {
      return res.status(404).json({ success: false, message: "Kundli not found" });
    }
    
    res.status(200).json({ success: true, data: kundli });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  }
};