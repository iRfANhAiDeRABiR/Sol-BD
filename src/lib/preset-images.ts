export interface ImagePreset {
  id: string;
  name: string;
  category: string;
  url: string;
  tags: string[];
}

export const PRESET_PRODUCT_IMAGES: ImagePreset[] = [
  {
    id: 'win11',
    name: 'Windows 11 Pro (Modern UI)',
    category: 'windows',
    url: 'https://images.unsplash.com/photo-1629654297299-c8506221ca97?w=1000&auto=format&fit=crop&q=80',
    tags: ['windows 11', 'os', 'microsoft'],
  },
  {
    id: 'win10',
    name: 'Windows 10 Pro (Business Laptop)',
    category: 'windows',
    url: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=1000&auto=format&fit=crop&q=80',
    tags: ['windows 10', 'os', 'pc'],
  },
  {
    id: 'office2024',
    name: 'Microsoft Office 365 / 2024',
    category: 'office',
    url: 'https://images.unsplash.com/photo-1542744094-3a3172720449?w=1000&auto=format&fit=crop&q=80',
    tags: ['office', 'excel', 'word', 'microsoft'],
  },
  {
    id: 'office365',
    name: 'Microsoft 365 Cloud Workspace',
    category: 'office',
    url: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=1000&auto=format&fit=crop&q=80',
    tags: ['office 365', 'productivity', 'cloud'],
  },
  {
    id: 'idm',
    name: 'IDM (High-Speed Download)',
    category: 'utility',
    url: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1000&auto=format&fit=crop&q=80',
    tags: ['idm', 'download manager', 'utility'],
  },
  {
    id: 'adobe',
    name: 'Adobe Creative Cloud (Design & Editing)',
    category: 'creative-design',
    url: 'https://images.unsplash.com/photo-1572044162444-ad60f128bdea?w=1000&auto=format&fit=crop&q=80',
    tags: ['adobe', 'photoshop', 'illustrator', 'creative'],
  },
  {
    id: 'canva',
    name: 'Canva Pro (Graphic Design Studio)',
    category: 'creative-design',
    url: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=1000&auto=format&fit=crop&q=80',
    tags: ['canva', 'design', 'social media'],
  },
  {
    id: 'antivirus',
    name: 'Kaspersky / Antivirus Cyber Shield',
    category: 'antivirus',
    url: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=1000&auto=format&fit=crop&q=80',
    tags: ['antivirus', 'security', 'cybersecurity'],
  },
  {
    id: 'eset',
    name: 'ESET / Bitdefender Security Core',
    category: 'antivirus',
    url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1000&auto=format&fit=crop&q=80',
    tags: ['eset', 'security', 'shield'],
  },
  {
    id: 'nordvpn',
    name: 'NordVPN / ExpressVPN Shield',
    category: 'vpn-privacy',
    url: 'https://images.unsplash.com/photo-1510511459019-5dee85718698?w=1000&auto=format&fit=crop&q=80',
    tags: ['vpn', 'nordvpn', 'privacy'],
  },
  {
    id: 'ai-tools',
    name: 'ChatGPT Plus / Claude Pro AI Tools',
    category: 'ai-tools',
    url: 'https://images.unsplash.com/photo-1677442136019-21780efad99a?w=1000&auto=format&fit=crop&q=80',
    tags: ['ai', 'chatgpt', 'claude', 'openai'],
  },
  {
    id: 'streaming',
    name: 'Digital Subscriptions & Streaming',
    category: 'subscriptions',
    url: 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=1000&auto=format&fit=crop&q=80',
    tags: ['netflix', 'spotify', 'youtube premium'],
  },
];

