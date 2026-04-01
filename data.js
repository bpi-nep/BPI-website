import { kv } from '@vercel/kv';
import jwt from 'jsonwebtoken';

export const config = { api: { bodyParser: { sizeLimit: '10mb' } } };

const JWT_SECRET = process.env.JWT_SECRET || 'bpi-super-secret-key-2026';

// Fallback default data
const DEFAULTS = {
  ann: "New Training Sessions Starting — CTEVT-Certified Vocational Courses Now Open for Admission. Contact BPI Today.",
  slides: [
    {tag:"CTEVT Certified Vocational Training",title:"Empowering Youth<br>in Sudurpaschim Pradesh",nep:"सीप सिकौं, आत्मनिर्भर बनौं, भविष्य सुरक्षित गरौं।",desc:"B Polytechnic Institute — Dhangadhi's trusted TVET institute since 2008. Real skills. Real jobs. Real futures.",btn1:"Explore Courses",btn2:"Free Counselling",bg:"linear-gradient(135deg,#3E0808 0%,#0D1F3C 100%)"},
    {tag:"BPI–Rojgaar Career Clinic",title:"Free Career Guidance<br>for Trained Youth",nep:"तपाईंको सीप छ — BPI ले बाटो देखाउँछ।",desc:"Honest, free employment guidance. No fees. No pressure. No hidden agenda.",btn1:"Book Counselling",btn2:"Learn More",bg:"linear-gradient(135deg,#0D1F3C 0%,#162D52 50%,#6B1212 100%)"},
    {tag:"New Sessions Starting Soon",title:"Build Your Skill.<br>Secure Your Future.",nep:"आजै Admission को लागि सम्पर्क गर्नुस्।",desc:"Construction, Hospitality, Electrical, Tailoring, Agriculture — CTEVT-certified courses at BPI Dhangadhi.",btn1:"Apply Now",btn2:"View Courses",bg:"linear-gradient(135deg,#6B1212 0%,#3E0808 40%,#0D1F3C 100%)"}
  ],
  courses: [
    {title:"Building Electrician",category:"Technical",desc:"CTEVT-certified electrical wiring, installation and safety.",fee:"Contact BPI",duration:"45 Days",badge:"CTEVT",img:"",contact:"bpinepal20@gmail.com",status:"Published"}
  ],
  history: [],
  services: [],
  partners: ["International Labour Organisation (ILO)"],
  gallery: [],
  rojgaar: {h:"Tapaiiko Sip Chha.<br>Aba Bato Pani Chha.",nep:"तपाईंको सीप छ। अब बाटो पनि छ।",p1:"BPI–Rojgaar is the career counselling arm of B Polytechnic Institute.",p2:"",btn1:"Book Free Counselling",btn2:"Contact Us"},
  branding: {
    name: "B Polytechnic Institute",
    sub: "Pvt. Ltd. · CTEVT Affiliated",
    nep: "सीप सिकौं, आत्मनिर्भर बनौं, भविष्य सुरक्षित गरौं।",
    title: "B Polytechnic Institute Pvt. Ltd.",
    logoUrl: ""
  },
  social: {fb:"", ig:"", tt:"", x:"", yt:"", li:""},
  location: {
    loc1: {city:"Sukedhara, Kathmandu", prov:"Bagmati Province", addr:"Sukedhara, Kathmandu-5", map:"https://maps.google.com/?q=Sukedhara+Kathmandu"},
    loc2: {city:"Dhangadhi-1, Kailali", prov:"Sudurpashchim Province", addr:"Dhangadhi-1, Kailali", map:"https://maps.google.com/?q=Dhangadhi+Kailali+Nepal"},
    contactEmail: "bpinepal20@gmail.com",
    contactEmail2: "beepolytechnic@gmail.com",
    phone1: "+977-91-524485",
    phone2: "+977-9868558730",
    hours: "Sunday–Friday, 9AM–5PM"
  },
  notifications: []
};


export default async function handler(req, res) {
  // CORS setup
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Expires', '0');
  res.setHeader('Surrogate-Control', 'no-store');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'GET') {
      let data = await kv.get('bpiSiteData');
      if (!data) {
        // Init if empty
        data = DEFAULTS;
        await kv.set('bpiSiteData', data);
      }
      return res.status(200).json(data);
      
    } else if (req.method === 'POST') {
      // Authenticate
      const authHeader = req.headers['authorization'];
      const token = authHeader && authHeader.split(' ')[1];
      if (!token) return res.status(401).json({ error: 'Unauthorized' });

      try {
        jwt.verify(token, JWT_SECRET);
      } catch (err) {
        return res.status(403).json({ error: 'Forbidden' });
      }

      const newData = req.body;
      if (!newData) return res.status(400).json({ error: 'No data provided' });

      await kv.set('bpiSiteData', newData);
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method Not Allowed' });
  } catch (error) {
    console.error('Data API Error:', error);
    // If kv fails (e.g. not configured), return defaults so site doesn't crash completely.
    if (req.method === 'GET') {
      return res.status(200).json(DEFAULTS);
    }
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
