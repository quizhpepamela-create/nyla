import React, { useState, useEffect } from 'react';
import { 
  ArrowRight, 
  School, 
  Rocket, 
  ShieldCheck, 
  TrendingUp, 
  X, 
  Sparkles, 
  PenTool, 
  CreditCard, 
  MessageSquare, 
  Smartphone, 
  Send, 
  CheckCircle2, 
  DollarSign, 
  Upload, 
  FileCheck, 
  HelpCircle,
  PhoneCall,
  Loader2,
  Star,
  ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ViewState } from '../types';
import { STUDENT_HOURLY_RATE, NYLA_FIXED_FEE, PROJECT_PACKAGES, calculatePVP, calculateStudentPayout } from '../constants';
import { useAuth } from '../context/AuthContext';

// @ts-ignore
import grafitoWearLogo from '../assets/images/grafito_wear_logo_1784684755052.jpg';
// @ts-ignore
import grafitoCollageTshirt from '../assets/images/grafito_collage_tshirt_1784724447673.jpg';
// @ts-ignore
import spidermanTshirt from '../assets/images/spiderman_tshirt_1784684779640.jpg';

interface StudentWork {
  title: string;
  description: string;
  badge: string;
  budget: number;
  hours: number;
  tech: string[];
  deliverableType: 'interface' | 'chart' | 'marketing';
  visualTitle: string;
  visualSubtitle: string;
  visualElements: string[];
  previewUrl: string;
}

interface StudentPortfolio {
  id: string;
  name: string;
  role: string;
  university: string;
  avatar: string;
  rating: number;
  reviewsCount: number;
  rate: number;
  category: 'web' | 'uiux' | 'data';
  skills: string[];
  bio: string;
  projects: StudentWork[];
}

const STUDENT_PORTFOLIOS: StudentPortfolio[] = [
  {
    id: 'elena-v',
    name: 'Elena Valery',
    role: 'Diseñadora Gráfica & Publicidad',
    university: 'Universidad del Azuay (UDA)',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCCg-sYd74mPtldBVLjpMlInRZpS-FvyONN-uEnSbU5vVhIMzgq1_nliHBmaDbOMJD6R0Vtrp-71v-t-N0l2Fi3itvfMNYHSX8XBlLq41trEqzFB1up1u-kbIYaqYU2O0R1iiffM2KBBBkS1q8nIZwwdlFTFReP6Uj4IxFhJa1GZB6pM4j75ZCuovgwg7vTUP_aJAqltVKtJArj5AayWm1kmDLUGpqFUOP2ekK9iac2W2wn32zwj-SFSIP6O_CM7qWrOKFPY2SIBlZn',
    rating: 4.9,
    reviewsCount: 42,
    rate: STUDENT_HOURLY_RATE,
    category: 'web',
    skills: ['Figma', 'Canva', 'Instagram', 'Branding', 'Ilustración'],
    bio: 'Me especializo en diseñar feeds de Instagram atractivos, logotipos vectoriales y materiales para marcas de moda urbana e independientes.',
    projects: [
      {
        title: 'Diseño de Feed de Instagram - Grafito Wear',
        description: 'Creación de 12 plantillas de post y 6 portadas de historias destacadas para la marca de ropa urbana Grafito Wear en Cuenca.',
        badge: 'Hito Completado • Garantía Escrow Liberada',
        budget: 48,
        hours: 8,
        tech: ['Figma', 'Canva', 'Ilustración'],
        deliverableType: 'interface',
        visualTitle: 'Grafito Wear - Colección Streetwear',
        visualSubtitle: 'Paleta de Colores y Grilla de Instagram',
        visualElements: [
          '🎨 Paleta de colores streetwear en tonos crema y azul cobalto',
          '📸 Grid dinámico con patrones estéticos de stickers juveniles',
          '📈 Aumento del 25% en clics al enlace de WhatsApp de compras'
        ],
        previewUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDH29C9NmwVGSKJdKGGgxwQ5jHR2ALCduDsdEhRQHUrUniMYElbjyIeQ6AscCL4LOfNaC4sDr6QA3Kn0NyENCyFbzhQgknh9hKPG3sWVZeEXMLd49lYPIWadBPRWEm6OW--UqXKYaanQatP_HGnHFdHlb-NQjqZ5NtJ1xlTV0Gdjin1GLoluCoktyLEo4z01_mOh7YjrQqgm7FrfNYFL1kVscZO2_SPduuqei5uVM369dHek52rG3-5sCcq2VCLqL7r0AjnRbjomS_Y'
      },
      {
        title: 'Diseño de Logotipo e Identidad',
        description: 'Diseño del logotipo vectorial y paleta de colores para una cafetería de especialidad local.',
        badge: 'Proyecto Entregado • 100% Calificación',
        budget: 35,
        hours: 7,
        tech: ['Figma', 'Illustrator'],
        deliverableType: 'marketing',
        visualTitle: 'Café Origin - Logotipo Vectorial',
        visualSubtitle: 'Isologotipo para Aplicación en Empaques',
        visualElements: [
          '☕ Logotipo limpio, minimalista y de alta resolución',
          '🎨 Paleta de colores tierra cálidos para coherencia visual',
          '📦 Archivos de marca listos para impresión de vasos y bolsas'
        ],
        previewUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB9b9KDMlx5KWnd1dwvbDtUCimPYcigJTAfvLrpiU4mJrwhPMgLR2YOhHY8RbEWOqzgZce4CoKz-azRii96L7cYWxBajz9BZtFS3VS-uvgCo2StSPSujbSJG_bST0huuqs_ezZTmhRuNiA8iib1g-7-I8faNiShuIRQTFQRf5P4QLOEXwA29pRupbN5LS0Lk2SHxt7cNc8sRMqP6SKuRHa48utMyP3ZFHVaotqfrupPSWBhVXw80XKIfALPvrzNx1L-FwrmHcBHVSZk'
      },
      {
        title: 'Diseño de Feed de Instagram - Adry Pastelería',
        description: 'Diseño y maquetación de 3 publicaciones emblemáticas de alta estética en Instagram, destacando tortas personalizadas exclusivas y cajas gourmet de regalos.',
        badge: 'Hito Completado • 3 Posts de Feed Validados',
        budget: 60,
        hours: 10,
        tech: ['Canva', 'Fotografía', 'Copywriting', 'Instagram'],
        deliverableType: 'marketing',
        visualTitle: 'Adry Pastelería - Post de Instagram',
        visualSubtitle: 'Estrategia Visual de Repostería Creativa',
        visualElements: [
          '🎂 Torta Cumpleaños "40" con silueta de fisicoculturista negra sobre crema blanca',
          '🎁 Caja Regalo "Tablita Gourmet" con vino, quesos, fresas y mini torta con dibujo de monigotes celebrando los 40 años',
          '👑 Torta "Princess Cake" decorada con perlas comestibles plateadas y una corona/tiara real plateada en la cima'
        ],
        previewUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB9b9KDMlx5KWnd1dwvbDtUCimPYcigJTAfvLrpiU4mJrwhPMgLR2YOhHY8RbEWOqzgZce4CoKz-azRii96L7cYWxBajz9BZtFS3VS-uvgCo2StSPSujbSJG_bST0huuqs_ezZTmhRuNiA8iib1g-7-I8faNiShuIRQTFQRf5P4QLOEXwA29pRupbN5LS0Lk2SHxt7cNc8sRMqP6SKuRHa48utMyP3ZFHVaotqfrupPSWBhVXw80XKIfALPvrzNx1L-FwrmHcBHVSZk'
      }
    ]
  },
  {
    id: 'nicolas-r',
    name: 'Mateo Ortiz',
    role: 'Creación de Contenido en TikTok & Facebook',
    university: 'Universidad de Cuenca',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA08kpLxAzrQpj-rebgESm964d7GAAlPgI04OfTPv_HWHvCAOnJgwWnI3BZnYz6UGMuNzO1-KZyZjb9SIb68W7BSGT-XiNqHZ9LQOrFNsSOp8HQjetkILTGWZaD2s3HzkMQL0XPQ9k2Svj2BG0B5grs3joKAXOkAKw1ahZ48rnpOjXPBhVb6YkqcUf0_mKMhuwC5eefKzq_OeQXepgVxV1NRt-ZU7rAwYaXBJPumV0GGyYoK-Dqu1qWGWSzq7YittTqUxqJEdzJwaw_',
    rating: 4.8,
    reviewsCount: 31,
    rate: STUDENT_HOURLY_RATE,
    category: 'data',
    skills: ['TikTok', 'Facebook Ads', 'CapCut', 'Edición de Video', 'Storytelling'],
    bio: 'Nos contactamos con Grafito mediante Facebook porque el dueño necesitaba publicidad en TikTok. Él había dejado su cuenta inactiva desde el 2025 pero quería volver a las redes sociales, y ya tenía algo de seguidores. Así que nosotros le hicimos la publicidad para TikTok y también para Facebook con excelentes resultados.',
    projects: [
      {
        title: 'Campaña de Lanzamiento y Reactivación de Redes - Grafito',
        description: 'Producción de videos dinámicos y anuncios optimizados para TikTok y Facebook de Grafito Wear, reactivando con éxito su cuenta inactiva desde el 2025 y atrayendo nuevos clientes.',
        badge: 'Completado • Validado por Tutor',
        budget: 35,
        hours: 7,
        tech: ['TikTok', 'Facebook Ads', 'CapCut'],
        deliverableType: 'chart',
        visualTitle: 'Grafito - Campaña TikTok y Facebook',
        visualSubtitle: 'Contenido Orgánico y Anuncios de Reactivación',
        visualElements: [
          '⚡ Videos dinámicos grabados y editados en CapCut con ritmos virales',
          '📱 Campaña de anuncios en Facebook para captar seguidores con el enlace de compra',
          '📈 Reactivación exitosa de la comunidad de Grafito que estuvo inactiva desde 2025'
        ],
        previewUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB_ApBabvPrf4O56mWkO3yEeYc5IvpHYKOHF9ZcVmIVGmcBPVAUvz9eKE7CQ8Zm63sfaVx-GQbZaQhZp9_2t6xATYKeM8C7rqB07nLE_BiX5fU_FU95GG3johXwjJP2Fftb7iNlZazhJTaY78HKuQyFh5QrlVS-NRJwXyM5TXgk6htcBWCkxzCuPxCy-aksKRCAY0IFPyHAgIlT4j12oMQKSFiOKDke3Z2Zd56XhrE3T_hUJ6vUJj_aDkFG_slJbNd2fDg8ofz2V6mY'
      }
    ]
  },
  {
    id: 'sofia-h',
    name: 'Sofía Cárdenas',
    role: 'Diseño de Modas & Estampados',
    university: 'Universidad del Azuay (UDA)',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA3IAbmw7mPDpl0mdfym-FTgFUC-ZZo-wq2i38wBAkO1UWbfLZglso3CXrfrAsKp5iozkNaziyaOE_pTXXuQv0CmuM4eVrO1x1qqAEfOQi6VUKJUq9rbxY9UXFdqRTr1i_JaDGUjO-wi6bYZhl05ME4NWgV85JItvwi7AZy6W44a9J5P8OCxAWqsKozS2rZBirTSbWsZFeRdx1jkZB9UohsIORsH1OtWYS4QoLHpfme8TvpUdxTUWhJjaivDg-yOrI0nOZCFBjdTliO',
    rating: 5.0,
    reviewsCount: 25,
    rate: STUDENT_HOURLY_RATE,
    category: 'uiux',
    skills: ['Illustrator', 'Estampados', 'Figma', 'Moda Urbana'],
    bio: 'Me dedico a crear patrones de estampado textiles e ilustraciones vectoriales con estilo juvenil para serigrafía de camisetas.',
    projects: [
      {
        title: 'Diseño de Estampado de T-Shirt - Collage Urbano',
        description: 'Ilustración vectorial completa estilo "sticker-bomb" adaptada para camisetas de la nueva colección de ropa urbana nacional.',
        badge: 'Entregado a Producción • Calificación Perfecta',
        budget: 80,
        hours: 10,
        tech: ['Illustrator', 'Estampados', 'Figma'],
        deliverableType: 'interface',
        visualTitle: 'Grafito - Estampado Collage',
        visualSubtitle: 'Arte Vectorial para Impresión Textil',
        visualElements: [
          '🎨 Gráficos 100% vectoriales escalables listos para el taller',
          '👕 Separación técnica de colores óptima para serigrafía en Cuenca',
          '🚀 Camiseta de algodón más vendida en los primeros 15 días'
        ],
        previewUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBQAbmkdHSvrBaQDXvy6zDoKjUDM01r5GXvE2V7O6eGqBGo7F2qLq9cIaDzVmYChfpBt8cFnH7p0mX2yO-hyCTwFu0bsZID76kG18UsZQoBB1xb-AprWBOsNiThFJk3slwzy0ssMapzAjcbZKN7E7cXe-doUk3klqOAq2kaSR_fTOfJiAn-Y4d9LkwtozrOOpn_jCEORkAYCEguyANCghpcIZ1qe417SsJlX2_VK5aoMkOY0QjKGYz3QmZj8Crqb6rTpHa98KXPa12i'
      }
    ]
  }
];

interface LandingPageProps {
  setView: (view: ViewState) => void;
}

export default function LandingPage({ setView }: LandingPageProps) {
  const { user, logout } = useAuth();
  const [showCookies, setShowCookies] = useState(false);
  const [selectedSuccessStory, setSelectedSuccessStory] = useState<'grafito' | 'adry'>('adry');

  // Student portfolios showcase states
  const [selectedPortfolioId, setSelectedPortfolioId] = useState<string | null>(null);
  const [portfolioCategory, setPortfolioCategory] = useState<'all' | 'web' | 'uiux' | 'data'>('all');
  const [activePortfolioTab, setActivePortfolioTab] = useState<number>(0); // active hito/trabajo tab

  // Payment methods section states
  const [activePaymentMethod, setActivePaymentMethod] = useState<'card' | 'paypal' | 'payphone' | 'gpay' | 'transfer'>('card');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [cardName, setCardName] = useState('MATEO SANTAMARIA');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  // Payphone Ecuadorian mobile app payment simulation states
  const [payphonePhone, setPayphonePhone] = useState('0991234567');
  const [payphoneState, setPayphoneState] = useState<'idle' | 'sending' | 'sent' | 'approved'>('idle');

  // Bank Transfer upload simulator states
  const [transferFileName, setTransferFileName] = useState<string | null>(null);
  const [isUploadingTransfer, setIsUploadingTransfer] = useState(false);
  const [transferUploaded, setTransferUploaded] = useState(false);

  // WhatsApp Business Chat Simulator States
  const [isWhatsAppOpen, setIsWhatsAppOpen] = useState(false);
  const [whatsAppMessages, setWhatsAppMessages] = useState<Array<{ sender: 'bot' | 'user'; text: string; time: string; template?: boolean }>>([
    { 
      sender: 'bot', 
      text: '¡Hola! Te saluda el canal oficial de WhatsApp Business de NYLA. ✅\n\nAquí puedes recibir notificaciones automáticas en tiempo real sobre tus contratos, garantías en custodia (Escrow) y entregas de proyectos. ¿Qué te gustaría probar?',
      time: '11:06' 
    }
  ]);
  const [whatsAppInput, setWhatsAppInput] = useState('');
  const [whatsAppTyping, setWhatsAppTyping] = useState(false);

  // YouTube tutorial video states
  const [youtubeLinkInput, setYoutubeLinkInput] = useState('https://youtu.be/lMESXRaNerk?si=h9uA0x_RW1RRNtwj');
  const [tutorialEmbedUrl, setTutorialEmbedUrl] = useState('https://www.youtube.com/embed/lMESXRaNerk');

  const updateEmbedUrl = (url: string) => {
    setYoutubeLinkInput(url);
    if (!url.trim()) return;
    try {
      let videoId = '';
      if (url.includes('v=')) {
        videoId = url.split('v=')[1].split('&')[0];
      } else if (url.includes('youtu.be/')) {
        videoId = url.split('youtu.be/')[1].split('?')[0];
      } else if (url.includes('embed/')) {
        videoId = url.split('embed/')[1].split('?')[0];
      } else if (url.length === 11) {
        videoId = url; // assume direct ID
      }
      
      if (videoId) {
        setTutorialEmbedUrl(`https://www.youtube.com/embed/${videoId}`);
      } else if (url.startsWith('http')) {
        setTutorialEmbedUrl(url);
      }
    } catch (e) {
      setTutorialEmbedUrl(url);
    }
  };

  useEffect(() => {
    // Show cookie banner with a slight delay
    const timer = setTimeout(() => {
      setShowCookies(true);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const [userStats, setUserStats] = useState<{ totalRegistered: number; activeLast30d: number } | null>(null);

  useEffect(() => {
    fetch('/api/stats/users')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => data && setUserStats(data))
      .catch(() => setUserStats(null));
  }, []);

  // Handler for simulating WhatsApp template notifications
  const handleSimulateWhatsAppNotification = (type: 'contract' | 'escrow' | 'payout') => {
    setWhatsAppTyping(true);
    setTimeout(() => {
      let text = '';
      if (type === 'contract') {
        text = '📋 *NOTIFICACIÓN NYLA BUSINESS:* ¡Hola! El contrato *"Desarrollo Módulo Fintech"* ha sido redactado con éxito. Por favor accede a tu portal para firmarlo electrónicamente: https://nyla.edu/contratos/cp-821';
      } else if (type === 'escrow') {
        text = '🔒 *NOTIFICACIÓN NYLA BUSINESS:* Los fondos de *$800.00 USD* han sido depositados exitosamente en la cuenta de garantía segura (Escrow). Estarán retenidos hasta la aprobación de la entrega final.';
      } else {
        text = '💰 *NOTIFICACIÓN NYLA BUSINESS:* El Emprendedor ha autorizado la liberación de fondos. Se han transferido los fondos correspondientes al estudiante Elena Valery (NYLA retuvo su comisión fija de $10.57).';
      }
      
      setWhatsAppMessages(prev => [
        ...prev,
        { sender: 'bot', text, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), template: true }
      ]);
      setWhatsAppTyping(false);
    }, 800);
  };

  const handleWhatsAppSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!whatsAppInput.trim()) return;

    const userText = whatsAppInput;
    setWhatsAppMessages(prev => [
      ...prev,
      { sender: 'user', text: userText, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
    ]);
    setWhatsAppInput('');
    setWhatsAppTyping(true);

    setTimeout(() => {
      let reply = '';
      const textLower = userText.toLowerCase();
      if (textLower.includes('hola') || textLower.includes('buenas')) {
        reply = '¡Hola! Es un gusto atenderte. Soy el bot de NYLA Business. Puedo ayudarte simulando alertas o resolviendo dudas rápidas sobre nuestra comisión fija o garantías Escrow.';
      } else if (textLower.includes('pago') || textLower.includes('comision') || textLower.includes('comisión')) {
        reply = 'En NYLA cobramos una comisión fija de $10.57 USD por proyecto, sin importar su tamaño. El resto del pago va íntegro para el estudiante universitario, a $5.00 USD por hora trabajada.';
      } else if (textLower.includes('payphone') || textLower.includes('metodo')) {
        reply = 'Soportamos cobros por PayPhone, tarjetas de crédito/débito, PayPal, Apple Pay, Google Pay y transferencia bancaria directa. ¡Todo integrado en nuestra pasarela!';
      } else {
        reply = 'Entendido. Tu mensaje ha sido registrado en nuestra API de WhatsApp Business. ¿Deseas simular alguna alerta del sistema usando los botones superiores?';
      }

      setWhatsAppMessages(prev => [
        ...prev,
        { sender: 'bot', text: reply, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
      ]);
      setWhatsAppTyping(false);
    }, 1000);
  };

  // Process Mock Payments
  const handleProcessPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessingPayment(true);
    setPaymentError(null);

    setTimeout(() => {
      if (activePaymentMethod === 'card' && cardNumber.length < 12) {
        setPaymentError('Por favor ingresa un número de tarjeta válido.');
        setIsProcessingPayment(false);
        return;
      }
      setIsProcessingPayment(false);
      setPaymentSuccess(true);
      
      // Send message to WhatsApp business simulator too!
      handleSimulateWhatsAppNotification('escrow');
    }, 1800);
  };

  // PayPhone notification push simulation
  const handlePayPhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPayphoneState('sending');
    setTimeout(() => {
      setPayphoneState('sent');
    }, 1200);
  };

  const handlePayphoneApprove = () => {
    setPayphoneState('sending');
    setTimeout(() => {
      setPayphoneState('approved');
      setPaymentSuccess(true);
      // Send WhatsApp receipt
      handleSimulateWhatsAppNotification('escrow');
    }, 1500);
  };

  // Drag and drop bank slip simulation
  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setTransferFileName(file.name);
      simulateTransferUpload();
    }
  };

  const simulateTransferUpload = () => {
    setIsUploadingTransfer(true);
    setTimeout(() => {
      setIsUploadingTransfer(false);
      setTransferUploaded(true);
      setPaymentSuccess(true);
      // WhatsApp notification
      handleSimulateWhatsAppNotification('escrow');
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-editorial-bg text-editorial-text font-sans overflow-x-hidden selection:bg-editorial-accent/20 selection:text-editorial-accent pb-12">
      
      {/* Top Navigation Bar */}
      <nav className="fixed top-0 left-0 w-full z-50 bg-editorial-bg/95 backdrop-blur-md border-b border-editorial-border shadow-sm">
        <div className="flex justify-between items-center w-full px-6 md:px-12 py-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-12">
            <span 
              onClick={() => setView('landing')} 
              className="font-serif font-black text-2xl md:text-3xl tracking-tighter text-editorial-text cursor-pointer"
            >
              NYLA.
            </span>
            <div className="hidden md:flex gap-8 text-[11px] uppercase tracking-[0.2em] font-bold">
              <a href="#hero" className="text-editorial-text border-b border-editorial-text pb-1 hover:opacity-60 transition-opacity">Inicio</a>
              <a href="#planes" className="text-editorial-text/70 hover:opacity-60 transition-opacity font-bold text-editorial-accent">Planes</a>
              <a href="#portafolios" className="text-editorial-text/70 hover:opacity-60 transition-opacity">Portafolios y Trabajos</a>
              <a href="#features" className="text-editorial-text/70 hover:opacity-60 transition-opacity">Cómo funciona</a>
              <a href="#payments-showcase" className="text-editorial-text/70 hover:opacity-60 transition-opacity">Métodos de Pago</a>
              <a href="#whatsapp-section" className="text-editorial-text/70 hover:opacity-60 transition-opacity">WhatsApp Business</a>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <button
                  onClick={() => setView('dashboard')}
                  className="hidden sm:block text-editorial-text/70 hover:text-editorial-text text-[11px] uppercase tracking-[0.2em] font-bold py-2.5 transition-colors duration-200 cursor-pointer"
                >
                  Ir a mi Dashboard
                </button>
                <button
                  onClick={async () => { await logout(); setView('landing'); }}
                  className="border border-editorial-text bg-editorial-text text-editorial-bg px-6 py-2.5 rounded-full text-[11px] uppercase tracking-[0.2em] font-bold hover:bg-transparent hover:text-editorial-text transition-colors duration-200 cursor-pointer"
                >
                  Cerrar sesión
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setView('login')}
                  className="hidden sm:block text-editorial-text/70 hover:text-editorial-text text-[11px] uppercase tracking-[0.2em] font-bold py-2.5 transition-colors duration-200 cursor-pointer"
                >
                  Iniciar sesión
                </button>
                <button
                  onClick={() => setView('register')}
                  className="border border-editorial-text bg-editorial-text text-editorial-bg px-6 py-2.5 rounded-full text-[11px] uppercase tracking-[0.2em] font-bold hover:bg-transparent hover:text-editorial-text transition-colors duration-200 cursor-pointer"
                >
                  Registrarse
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      <main className="pt-28 md:pt-32">
        
        {/* Hero Section */}
        <section id="hero" className="relative px-6 md:px-12 py-12 md:py-16 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-5 z-10 space-y-6 pt-4"
            >
              <span className="inline-block border border-editorial-border px-4 py-1.5 rounded-full text-[10px] font-bold tracking-[0.2em] uppercase text-editorial-text/70 bg-transparent">
                CONTRATO DIGITAL • PAGOS ESCROW
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif leading-[1.05] tracking-tight text-editorial-text">
                Conecta talento universitario con el <span className="italic">mundo emprendedor</span>
              </h1>
              <p className="text-editorial-muted text-base leading-relaxed max-w-xl">
                Nyla es el puente estratégico que permite a startups contratar estudiantes destacados para proyectos ágiles. Mediante contratos automáticos y retención en custodia (Escrow), garantizamos que todo pago sea justo y seguro.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 pt-2">
                <button
                  onClick={() => setView('register')}
                  className="bg-editorial-text text-editorial-bg px-8 py-4 rounded-full text-[11px] uppercase tracking-[0.2em] font-bold hover:opacity-90 transition-all shadow-sm flex items-center justify-center gap-2 group cursor-pointer"
                >
                  Probar Portal
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
                <a 
                  href="#portafolios"
                  className="border border-editorial-text text-editorial-text px-8 py-4 rounded-full text-[11px] uppercase tracking-[0.2em] font-bold hover:bg-editorial-text hover:text-editorial-bg transition-colors flex items-center justify-center gap-2 cursor-pointer no-underline text-center"
                >
                  Ver Trabajos Estudiantes
                </a>
              </div>

              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-editorial-border/60">
                <div>
                  <h4 className="text-2xl font-serif font-bold text-editorial-text">${NYLA_FIXED_FEE.toFixed(2)}</h4>
                  <p className="text-[9px] uppercase tracking-wider text-editorial-muted">Comisión Fija NYLA</p>
                </div>
                <div>
                  <h4 className="text-2xl font-serif font-bold text-editorial-text">${calculatePVP(PROJECT_PACKAGES[0].hours).toFixed(2)}</h4>
                  <p className="text-[9px] uppercase tracking-wider text-editorial-muted">Plan Mensual Desde</p>
                </div>
                <div>
                  <h4 className="text-2xl font-serif font-bold text-editorial-text">100%</h4>
                  <p className="text-[9px] uppercase tracking-wider text-editorial-muted">Garantía Escrow</p>
                </div>
              </div>

              {userStats && (
                <p className="text-[10px] uppercase tracking-wider text-editorial-muted font-bold">
                  {userStats.totalRegistered} usuarios registrados · {userStats.activeLast30d} activos este mes
                </p>
              )}
            </motion.div>

            {/* Right column: How it works, at a glance */}
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="lg:col-span-7 space-y-6"
            >
              <div className="bg-white border border-editorial-border rounded-[32px] p-8 shadow-sm space-y-6">
                <h3 className="text-md font-serif font-black text-editorial-text">Cómo funciona NYLA</h3>

                <div className="space-y-5">
                  <div className="flex gap-4 items-start">
                    <div className="w-9 h-9 rounded-full bg-editorial-text text-editorial-bg flex items-center justify-center font-serif font-black text-sm shrink-0">1</div>
                    <div>
                      <p className="font-bold text-sm text-editorial-text">El emprendedor publica el proyecto</p>
                      <p className="text-xs text-editorial-muted leading-relaxed mt-0.5">Describe lo que necesita y las habilidades requeridas.</p>
                    </div>
                  </div>
                  <div className="flex gap-4 items-start">
                    <div className="w-9 h-9 rounded-full bg-editorial-text text-editorial-bg flex items-center justify-center font-serif font-black text-sm shrink-0">2</div>
                    <div>
                      <p className="font-bold text-sm text-editorial-text">NYLA encuentra al estudiante ideal</p>
                      <p className="text-xs text-editorial-muted leading-relaxed mt-0.5">El match inteligente compara carrera, habilidades, experiencia y disponibilidad reales.</p>
                    </div>
                  </div>
                  <div className="flex gap-4 items-start">
                    <div className="w-9 h-9 rounded-full bg-editorial-text text-editorial-bg flex items-center justify-center font-serif font-black text-sm shrink-0">3</div>
                    <div>
                      <p className="font-bold text-sm text-editorial-text">Contrato digital y pago en garantía</p>
                      <p className="text-xs text-editorial-muted leading-relaxed mt-0.5">Los fondos quedan retenidos con Stripe hasta que se aprueba la entrega.</p>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-editorial-border/60 flex gap-4">
                  <button
                    onClick={() => setView('register')}
                    className="flex-1 bg-editorial-text text-editorial-bg py-3 rounded-full text-[11px] uppercase tracking-[0.15em] font-bold hover:opacity-90 transition-all cursor-pointer border-none"
                  >
                    Registrarme
                  </button>
                </div>
              </div>
            </motion.div>

          </div>
        </section>

        {/* Planes Mensuales — public pricing, visible to everyone without logging in */}
        <section id="planes" className="px-6 md:px-12 py-16 border-t border-editorial-border">
          <div className="max-w-7xl mx-auto space-y-10">
            <div className="space-y-3 max-w-2xl">
              <span className="inline-block border border-editorial-border px-3 py-1 rounded-full text-[9px] font-bold tracking-[0.15em] uppercase text-editorial-accent bg-white">
                PLANES MENSUALES
              </span>
              <h2 className="text-3xl md:text-4xl font-serif font-black text-editorial-text leading-tight tracking-tight">
                Un plan para cada tamaño de negocio
              </h2>
              <p className="text-editorial-muted text-sm leading-relaxed">
                Cada plan define cuántas horas al mes dedica el estudiante y qué contenido incluye. La comisión de NYLA es siempre ${NYLA_FIXED_FEE.toFixed(2)} USD; el resto es el pago fijo del estudiante, a ${STUDENT_HOURLY_RATE.toFixed(2)} USD/hora.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {PROJECT_PACKAGES.map(pkg => (
                <div
                  key={pkg.id}
                  className={`rounded-[28px] p-7 space-y-4 border ${
                    pkg.id === 'intermedio'
                      ? 'bg-editorial-text text-editorial-bg border-editorial-text shadow-md scale-[1.02]'
                      : 'bg-white border-editorial-border'
                  }`}
                >
                  <div>
                    <p className={`text-[10px] font-bold uppercase tracking-wider ${pkg.id === 'intermedio' ? 'text-editorial-bg/70' : 'text-editorial-muted'}`}>{pkg.hours} horas / mes</p>
                    <h3 className="font-serif font-black text-xl">{pkg.label}</h3>
                  </div>
                  <div>
                    <p className="text-3xl font-serif font-black">${calculatePVP(pkg.hours).toFixed(2)}<span className="text-xs font-sans font-normal"> /mes</span></p>
                    <p className={`text-[11px] ${pkg.id === 'intermedio' ? 'text-editorial-bg/70' : 'text-editorial-muted'}`}>Estudiante recibe ${calculateStudentPayout(pkg.hours).toFixed(2)}/mes</p>
                  </div>
                  <ul className="space-y-2 text-xs">
                    {pkg.includes.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className={`w-4 h-4 shrink-0 mt-0.5 ${pkg.id === 'intermedio' ? 'text-editorial-bg' : 'text-editorial-text'}`} />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => setView('register')}
                    className={`w-full py-3 rounded-full text-[11px] uppercase tracking-[0.15em] font-bold cursor-pointer border-none transition-all ${
                      pkg.id === 'intermedio'
                        ? 'bg-editorial-bg text-editorial-text hover:opacity-90'
                        : 'bg-editorial-text text-editorial-bg hover:opacity-90'
                    }`}
                  >
                    Elegir {pkg.label}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Ecosistema de la Plataforma: Demo Interactiva (Dashboard features quick-access) */}
        <section className="px-6 md:px-12 py-16 bg-editorial-light/40 border-t border-editorial-border">
          <div className="max-w-7xl mx-auto space-y-10">
            
            {/* Header of features block */}
            <div className="space-y-3 max-w-2xl">
              <span className="inline-block border border-editorial-border px-3 py-1 rounded-full text-[9px] font-bold tracking-[0.15em] uppercase text-editorial-accent bg-white">
                EXPLORA NUESTRO ECOSISTEMA
              </span>
              <h2 className="text-3xl md:text-4xl font-serif font-black text-editorial-text leading-tight tracking-tight">
                Accede Directamente a las Funciones de la Plataforma
              </h2>
              <p className="text-editorial-muted text-sm leading-relaxed">
                Prueba el portal interactivo real para ver cómo interactúan emprendedores y estudiantes universitarios destacados con contratos digitales automáticos y garantía de fondos.
              </p>
            </div>

            {/* Feature Cards Grid (4 Columns) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              
              {/* Card 1: Match con Estudiantes */}
              <div className="bg-white border border-editorial-border rounded-[24px] p-6 flex flex-col justify-between hover:border-editorial-text hover:shadow-md transition-all duration-300 group">
                <div className="space-y-4">
                  <div className="w-10 h-10 rounded-full bg-editorial-bg flex items-center justify-center text-editorial-text font-bold shrink-0">
                    🤝
                  </div>
                  <h3 className="text-lg font-serif font-black text-editorial-text group-hover:text-editorial-accent transition-colors">
                    Match de Estudiantes
                  </h3>
                  <p className="text-xs text-editorial-muted leading-relaxed">
                    Visualiza la lista de estudiantes preseleccionados, sus calificaciones de hitos anteriores de la universidad y sus porcentajes de afinidad con tu idea de software.
                  </p>
                </div>
                <button
                  onClick={() => setView('dashboard')}
                  className="mt-6 w-full bg-editorial-bg hover:bg-editorial-text text-editorial-text hover:text-editorial-bg py-2.5 rounded-xl text-[9px] uppercase tracking-wider font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer border border-editorial-border hover:border-editorial-text"
                >
                  Probar Match de Estudiantes
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

              {/* Card 2: Cómo Postulan (Postulaciones) */}
              <div className="bg-white border border-editorial-border rounded-[24px] p-6 flex flex-col justify-between hover:border-editorial-text hover:shadow-md transition-all duration-300 group">
                <div className="space-y-4">
                  <div className="w-10 h-10 rounded-full bg-editorial-bg flex items-center justify-center text-editorial-text font-bold shrink-0">
                    📝
                  </div>
                  <h3 className="text-lg font-serif font-black text-editorial-text group-hover:text-editorial-accent transition-colors">
                    Cómo Postulan / Proyectos
                  </h3>
                  <p className="text-xs text-editorial-muted leading-relaxed">
                    Mira la perspectiva del estudiante: cómo exploran las vacantes, envían sus propuestas técnicas detalladas, cotizan horas y aplican con garantía.
                  </p>
                </div>
                <button
                  onClick={() => setView('proyectos')}
                  className="mt-6 w-full bg-editorial-bg hover:bg-editorial-text text-editorial-text hover:text-editorial-bg py-2.5 rounded-xl text-[9px] uppercase tracking-wider font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer border border-editorial-border hover:border-editorial-text"
                >
                  Ver Cómo Postulan
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

              {/* Card 3: Chats y Mensajería */}
              <div className="bg-white border border-editorial-border rounded-[24px] p-6 flex flex-col justify-between hover:border-editorial-text hover:shadow-md transition-all duration-300 group">
                <div className="space-y-4">
                  <div className="w-10 h-10 rounded-full bg-editorial-bg flex items-center justify-center text-editorial-text font-bold shrink-0">
                    💬
                  </div>
                  <h3 className="text-lg font-serif font-black text-editorial-text group-hover:text-editorial-accent transition-colors">
                    Chats con Estudiantes
                  </h3>
                  <p className="text-xs text-editorial-muted leading-relaxed">
                    Simula la comunicación real: chatea con los talentos preseleccionados, revisa las propuestas de contratos digitales, envía adjuntos y aprueba hitos.
                  </p>
                </div>
                <button
                  onClick={() => setView('mensajes')}
                  className="mt-6 w-full bg-editorial-bg hover:bg-editorial-text text-editorial-text hover:text-editorial-bg py-2.5 rounded-xl text-[9px] uppercase tracking-wider font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer border border-editorial-border hover:border-editorial-text"
                >
                  Abrir Chats Activos
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

              {/* Card 4: Trabajos Realizados */}
              <div className="bg-white border border-editorial-border rounded-[24px] p-6 flex flex-col justify-between hover:border-editorial-text hover:shadow-md transition-all duration-300 group">
                <div className="space-y-4">
                  <div className="w-10 h-10 rounded-full bg-editorial-bg flex items-center justify-center text-editorial-text font-bold shrink-0">
                    🎨
                  </div>
                  <h3 className="text-lg font-serif font-black text-editorial-text group-hover:text-editorial-accent transition-colors">
                    Trabajos de Ejemplo
                  </h3>
                  <p className="text-xs text-editorial-muted leading-relaxed">
                    Explora los portafolios interactivos con los entregables listos de los estudiantes, código de React editable, wireframes de Figma y scripts de datos.
                  </p>
                </div>
                <a
                  href="#portafolios"
                  className="mt-6 w-full bg-editorial-text text-editorial-bg hover:opacity-90 py-2.5 rounded-xl text-[9px] uppercase tracking-wider font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer no-underline text-center"
                >
                  Ver Ejemplos Realizados
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>

            </div>

          </div>
        </section>

        {/* Portafolios y Trabajos de los Estudiantes Section */}
        <section id="portafolios" className="px-6 md:px-12 py-20 bg-white border-t border-editorial-border">
          <div className="max-w-7xl mx-auto space-y-12">
            
            {/* Section Header */}
            <div className="text-center space-y-4 max-w-2xl mx-auto">
              <span className="inline-block border border-editorial-border px-3.5 py-1 rounded-full text-[9px] font-bold tracking-[0.15em] uppercase text-editorial-text/70 bg-editorial-bg">
                DEMOSTRACIÓN DE TALENTO
              </span>
              <h2 className="text-3xl md:text-5xl font-serif font-black text-editorial-text leading-tight tracking-tight">
                Portafolios y Trabajos Reales de Estudiantes
              </h2>
              <p className="text-editorial-muted text-sm leading-relaxed">
                Explora los proyectos reales entregados con éxito por estudiantes de las mejores universidades. El dinero se libera de la custodia Escrow solo tras validar estos entregables.
              </p>
            </div>

            {/* Category Filter Tabs */}
            <div className="flex flex-wrap justify-center gap-2">
              {[
                { id: 'all', label: 'Todos los talentos' },
                { id: 'web', label: 'Desarrollo Frontend / React' },
                { id: 'uiux', label: 'Diseño UI/UX / Figma' },
                { id: 'data', label: 'Data Science / Python' }
              ].map(cat => (
                <button
                  key={cat.id}
                  onClick={() => {
                    setPortfolioCategory(cat.id as any);
                    setSelectedPortfolioId(null);
                    setActivePortfolioTab(0);
                  }}
                  className={`px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all duration-200 border cursor-pointer ${
                    portfolioCategory === cat.id
                      ? 'bg-editorial-text text-editorial-bg border-editorial-text'
                      : 'bg-editorial-bg text-editorial-muted border-editorial-border hover:bg-editorial-light'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Students Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {STUDENT_PORTFOLIOS.filter(student => portfolioCategory === 'all' || student.category === portfolioCategory).map(student => {
                const isSelected = selectedPortfolioId === student.id;
                return (
                  <div 
                    key={student.id} 
                    className={`bg-white border rounded-[32px] p-6 space-y-6 transition-all duration-300 flex flex-col justify-between ${
                      isSelected ? 'ring-2 ring-editorial-text border-editorial-text shadow-md' : 'border-editorial-border hover:border-editorial-text/40'
                    }`}
                  >
                    <div className="space-y-4">
                      {/* Student Header */}
                      <div className="flex gap-4 items-start">
                        <div className="w-14 h-14 rounded-full overflow-hidden border border-editorial-border bg-editorial-bg shrink-0">
                          <img className="w-full h-full object-cover" referrerPolicy="no-referrer" src={student.avatar} alt={student.name} />
                        </div>
                        <div className="space-y-1">
                          <h3 className="font-serif font-black text-md text-editorial-text">{student.name}</h3>
                          <p className="text-[10px] uppercase font-bold text-editorial-accent tracking-wider">{student.role}</p>
                          <div className="flex items-center gap-1 text-xs text-editorial-text font-bold">
                            <Star className="w-3.5 h-3.5 fill-current text-editorial-text shrink-0" />
                            <span>{student.rating}</span>
                            <span className="text-[10px] text-editorial-muted font-normal">({student.reviewsCount} trabajos)</span>
                          </div>
                        </div>
                      </div>

                      {/* University Verification Badge */}
                      <div className="bg-editorial-bg/60 border border-editorial-border/60 p-2.5 rounded-xl text-[10px] text-editorial-text flex items-center gap-2">
                        <School className="w-4 h-4 shrink-0 text-editorial-text" />
                        <span className="font-semibold truncate">{student.university}</span>
                      </div>

                      {/* Bio */}
                      <p className="text-xs text-editorial-muted leading-relaxed">
                        "{student.bio}"
                      </p>

                      {/* Skills tags */}
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {student.skills.map(skill => (
                          <span key={skill} className="bg-editorial-bg border border-editorial-border text-editorial-text text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 rounded">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Rates and Expand Trigger */}
                    <div className="pt-4 border-t border-editorial-border/60 flex items-center justify-between gap-2">
                      <div>
                        <p className="text-[9px] uppercase font-bold text-editorial-muted">Tarifa por hora</p>
                        <p className="font-serif font-black text-sm text-editorial-text">${student.rate.toFixed(2)} USD</p>
                      </div>

                      <button
                        onClick={() => {
                          setSelectedPortfolioId(isSelected ? null : student.id);
                          setActivePortfolioTab(0);
                        }}
                        className={`px-4 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all duration-300 cursor-pointer ${
                          isSelected
                            ? 'bg-editorial-accent text-white border border-editorial-accent'
                            : 'bg-editorial-text text-editorial-bg border border-editorial-text hover:bg-transparent hover:text-editorial-text'
                        }`}
                      >
                        {isSelected ? 'Cerrar Trabajos ▲' : 'Ver Trabajos realizado ▼'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Interactive Work Details Panel (shown when a student portfolio is selected) */}
            <AnimatePresence>
              {selectedPortfolioId && (
                (() => {
                  const currentStudent = STUDENT_PORTFOLIOS.find(s => s.id === selectedPortfolioId);
                  if (!currentStudent) return null;
                  const currentWork = currentStudent.projects[activePortfolioTab] || currentStudent.projects[0];
                  
                  return (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 20 }}
                      className="bg-editorial-bg/30 border border-editorial-border rounded-[32px] p-6 md:p-8 space-y-8"
                    >
                      {/* Selected Student Deliverables header */}
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-editorial-border pb-6">
                        <div>
                          <span className="text-[9px] uppercase tracking-wider font-bold text-editorial-accent">Micro-gigs y Trabajos Entregados por</span>
                          <h3 className="text-2xl font-serif font-black text-editorial-text mt-0.5">{currentStudent.name}</h3>
                        </div>

                        {/* Project selector tabs */}
                        <div className="flex gap-2 bg-white/50 border border-editorial-border p-1 rounded-xl">
                          {currentStudent.projects.map((proj, idx) => (
                            <button
                              key={proj.title}
                              onClick={() => setActivePortfolioTab(idx)}
                              className={`px-3.5 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                                activePortfolioTab === idx
                                  ? 'bg-editorial-text text-editorial-bg'
                                  : 'text-editorial-muted hover:text-editorial-text'
                              }`}
                            >
                              Trabajo {idx + 1}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Work Display: Details on left, simulated live output on right */}
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                        
                        {/* Details column (lg:col-span-5) */}
                        <div className="lg:col-span-5 space-y-6">
                          <div className="inline-flex items-center gap-1.5 bg-green-50 border border-green-200 text-green-900 px-3.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider">
                            <CheckCircle2 className="w-3.5 h-3.5 text-green-600" /> {currentWork.badge}
                          </div>

                          <div className="space-y-2">
                            <h4 className="text-xl font-serif font-bold text-editorial-text">{currentWork.title}</h4>
                            <p className="text-xs text-editorial-muted leading-relaxed">
                              {currentWork.description}
                            </p>
                          </div>

                          {/* Escrow payout data */}
                          <div className="grid grid-cols-2 gap-4 bg-white border border-editorial-border p-4 rounded-2xl">
                            <div>
                              <span className="text-[9px] uppercase text-editorial-muted font-bold">Presupuesto Escrow</span>
                              <p className="text-md font-serif font-black text-editorial-text">${currentWork.budget} USD</p>
                            </div>
                            <div>
                              <span className="text-[9px] uppercase text-editorial-muted font-bold">Tiempo de ejecución</span>
                              <p className="text-md font-serif font-black text-editorial-text">{currentWork.hours} horas invertidas</p>
                            </div>
                          </div>

                          {/* Tech stack used */}
                          <div className="space-y-2">
                            <span className="text-[9px] uppercase font-bold text-editorial-muted tracking-wider block">Habilidades Técnicas Aplicadas</span>
                            <div className="flex flex-wrap gap-2">
                              {currentWork.tech.map(t => (
                                <span key={t} className="bg-white border border-editorial-border text-editorial-text text-[9px] font-bold uppercase tracking-wide px-3 py-1 rounded-full">
                                  {t}
                                </span>
                              ))}
                            </div>
                          </div>

                          <button 
                            onClick={() => {
                              setView('dashboard');
                            }}
                            className="w-full bg-editorial-text text-editorial-bg py-3.5 rounded-xl text-[10px] uppercase tracking-widest font-bold hover:opacity-90 transition-all flex items-center justify-center gap-2 cursor-pointer"
                          >
                            Contratar Talento similar
                            <ArrowRight className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Interactive live output display (lg:col-span-7) */}
                        <div className="lg:col-span-7 space-y-3">
                          <span className="text-[9px] uppercase text-editorial-muted font-bold tracking-wider block flex items-center gap-1.5">
                            <ExternalLink className="w-3.5 h-3.5" /> Visualización de Entregable Realizado por el Estudiante
                          </span>

                          <div className="bg-white border border-editorial-border rounded-[24px] overflow-hidden shadow-sm">
                            {/* Simulated browser header */}
                            <div className="bg-editorial-bg border-b border-editorial-border px-4 py-2.5 flex items-center gap-2">
                              <div className="flex gap-1">
                                <div className="w-2.5 h-2.5 rounded-full bg-red-400"></div>
                                <div className="w-2.5 h-2.5 rounded-full bg-yellow-400"></div>
                                <div className="w-2.5 h-2.5 rounded-full bg-green-400"></div>
                              </div>
                              <div className="flex-1 bg-white border border-editorial-border rounded-md px-3 py-0.5 text-[10px] font-mono text-editorial-muted truncate text-center max-w-[400px] mx-auto">
                                https://nyla.app/estudiante/{currentStudent.id}/entregable-{activePortfolioTab + 1}
                              </div>
                            </div>

                            {/* Simulated delivery area */}
                            <div className="p-6 min-h-[280px] bg-editorial-light/40 flex flex-col justify-between">
                              {currentWork.deliverableType === 'interface' && (
                                <div className="space-y-4 bg-white border border-editorial-border rounded-xl p-4 shadow-xs">
                                  <div className="flex justify-between items-center border-b border-editorial-border/60 pb-2">
                                    <h5 className="font-serif font-bold text-xs text-editorial-text">{currentWork.visualTitle}</h5>
                                    <span className="text-[8px] bg-green-100 text-green-800 font-bold px-2 py-0.5 rounded-full">Lighthouse 99</span>
                                  </div>
                                  <p className="text-[10px] text-editorial-muted font-mono">{currentWork.visualSubtitle}</p>
                                  <div className="grid grid-cols-2 gap-2 text-[9px] font-sans text-editorial-text">
                                    <div className="bg-editorial-bg p-2 rounded border border-editorial-border/40">
                                      <p className="font-bold">Especialidad</p>
                                      <p className="text-editorial-muted">Diseño Gráfico / Branding</p>
                                    </div>
                                    <div className="bg-editorial-bg p-2 rounded border border-editorial-border/40">
                                      <p className="font-bold">Horarios Disponibles</p>
                                      <p className="text-green-700">✓ Lun - Vie (08:00 - 17:00)</p>
                                    </div>
                                  </div>
                                  <div className="space-y-1 pt-1">
                                    {currentWork.visualElements.map((el, i) => (
                                      <p key={i} className="text-[10px] font-semibold text-editorial-text flex items-center gap-1.5">
                                        <span className="text-green-600 font-bold">✔</span> {el}
                                      </p>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {currentWork.deliverableType === 'chart' && (
                                <div className="space-y-4 bg-white border border-editorial-border rounded-xl p-4 shadow-xs">
                                  <div className="flex justify-between items-center border-b border-editorial-border/60 pb-2">
                                    <h5 className="font-serif font-bold text-xs text-editorial-text">{currentWork.visualTitle}</h5>
                                    <span className="text-[8px] bg-editorial-accent text-white font-bold px-2 py-0.5 rounded-full">D3.js rendering</span>
                                  </div>
                                  <p className="text-[10px] text-editorial-muted">{currentWork.visualSubtitle}</p>
                                  
                                  {/* Simulated Chart visualization using css bars */}
                                  <div className="space-y-2.5 pt-2">
                                    <div className="space-y-1 text-[9px]">
                                      <div className="flex justify-between text-editorial-muted font-bold">
                                        <span>Facultad de Ingeniería (Promedio 8.7)</span>
                                        <span className="font-sans font-black text-editorial-text">87%</span>
                                      </div>
                                      <div className="w-full bg-editorial-light h-2 rounded-full overflow-hidden">
                                        <div className="bg-editorial-text h-full rounded-full" style={{ width: '87%' }}></div>
                                      </div>
                                    </div>
                                    <div className="space-y-1 text-[9px]">
                                      <div className="flex justify-between text-editorial-muted font-bold">
                                        <span>Facultad de Medicina (Promedio 9.1)</span>
                                        <span className="font-sans font-black text-editorial-text">91%</span>
                                      </div>
                                      <div className="w-full bg-editorial-light h-2 rounded-full overflow-hidden">
                                        <div className="bg-editorial-text h-full rounded-full" style={{ width: '91%' }}></div>
                                      </div>
                                    </div>
                                    <div className="space-y-1 text-[9px]">
                                      <div className="flex justify-between text-editorial-muted font-bold">
                                        <span>Facultad de Arte (Promedio 7.9)</span>
                                        <span className="font-sans font-black text-editorial-text">79%</span>
                                      </div>
                                      <div className="w-full bg-editorial-light h-2 rounded-full overflow-hidden">
                                        <div className="bg-editorial-text h-full rounded-full" style={{ width: '79%' }}></div>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="flex gap-2 justify-end text-[9px] font-bold text-editorial-muted pt-1">
                                    <span>● Riesgo deserción controlado</span>
                                    <span className="text-green-600 font-sans">● Alertas activas</span>
                                  </div>
                                </div>
                              )}

                              {currentWork.deliverableType === 'marketing' && (
                                <div className="space-y-4 bg-white border border-editorial-border rounded-xl p-4 shadow-xs">
                                  <div className="flex justify-between items-center border-b border-editorial-border/60 pb-2">
                                    <h5 className="font-serif font-bold text-xs text-editorial-text">{currentWork.visualTitle}</h5>
                                    <span className="text-[8px] bg-yellow-100 text-yellow-800 font-bold px-2 py-0.5 rounded-full">Conversion Funnel</span>
                                  </div>
                                  <p className="text-[10px] text-editorial-muted font-mono">{currentWork.visualSubtitle}</p>
                                  
                                  {/* Payment and checkout mock layout */}
                                  <div className="border border-editorial-border/80 rounded-xl p-3 bg-editorial-bg/30 space-y-2 text-[9px]">
                                    <div className="flex justify-between border-b border-editorial-border/40 pb-1.5 font-bold">
                                      <span>Producto</span>
                                      <span>Suscripción Mensual Café Origin</span>
                                    </div>
                                    <div className="flex justify-between font-bold text-editorial-accent">
                                      <span>Monto de Compra</span>
                                      <span>$29.90 USD</span>
                                    </div>
                                    <div className="pt-1.5">
                                      <span className="text-[8px] text-editorial-muted block uppercase font-bold">Datos de Envío</span>
                                      <span className="text-editorial-text font-medium">Elena Valery • UPM Residencia 1</span>
                                    </div>
                                  </div>

                                  <div className="space-y-1">
                                    {currentWork.visualElements.map((el, i) => (
                                      <p key={i} className="text-[10px] font-semibold text-editorial-text flex items-center gap-1.5">
                                        <span className="text-yellow-600 font-bold">✔</span> {el}
                                      </p>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Student delivery note block */}
                              <div className="mt-4 pt-3 border-t border-editorial-border flex items-center justify-between text-[10px] text-editorial-muted">
                                <span>Candidato: {currentStudent.name} ({currentStudent.university})</span>
                                <span className="font-mono bg-editorial-text text-editorial-bg px-2 py-0.5 rounded-md font-bold text-[9px]">CÓDIGO VERIFICADO NYLA ✅</span>
                              </div>
                            </div>
                          </div>
                        </div>

                      </div>
                    </motion.div>
                  );
                })()
              )}
            </AnimatePresence>

          </div>
        </section>

        {/* Dynamic & Interactive Payment Gateway Showcase Section */}
        <section id="payments-showcase" className="px-6 md:px-12 py-24 bg-editorial-light border-y border-editorial-border">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            
            {/* Left Content Column */}
            <div className="lg:col-span-5 space-y-6">
              <span className="inline-block border border-editorial-border px-3.5 py-1 rounded-full text-[9px] font-bold tracking-[0.15em] uppercase text-editorial-text/70 bg-white">
                INTEGRATED CHECKOUTS
              </span>
              <h2 className="text-3xl md:text-5xl font-serif text-editorial-text leading-tight tracking-tight">
                Múltiples métodos de pago, 100% integrados
              </h2>
              <p className="text-editorial-muted text-sm leading-relaxed">
                Nuestra plataforma admite diversas opciones para facilitar los depósitos en garantía desde cualquier parte de América Latina y Europa. Selecciona un método de pago en el panel interactivo a la derecha para experimentar el flujo completo del checkout simulado.
              </p>

              {/* Payment Methods tabs vertical selection */}
              <div className="space-y-2 pt-2">
                {[
                  { id: 'card', name: 'Tarjeta de Crédito / Débito', desc: 'Visa, Mastercard, Amex' },
                  { id: 'payphone', name: 'PayPhone Ecuador 🇪🇨', desc: 'Pagos móviles instantáneos con número de teléfono' },
                  { id: 'paypal', name: 'PayPal Checkout', desc: 'Pasarela internacional segura' },
                  { id: 'gpay', name: 'Google Pay / Apple Pay', desc: 'Monederos digitales un toque' },
                  { id: 'transfer', name: 'Transferencia Bancaria Directa', desc: 'Validación interactiva con comprobante' }
                ].map(method => (
                  <button
                    key={method.id}
                    type="button"
                    onClick={() => {
                      setActivePaymentMethod(method.id as any);
                      setPaymentSuccess(false);
                      setPaymentError(null);
                      setPayphoneState('idle');
                    }}
                    className={`w-full p-4 rounded-2xl border text-left flex justify-between items-center transition-all cursor-pointer ${
                      activePaymentMethod === method.id 
                        ? 'bg-white border-editorial-text shadow-sm' 
                        : 'bg-transparent border-editorial-border/40 hover:bg-white/50'
                    }`}
                  >
                    <div>
                      <p className="text-xs font-bold text-editorial-text uppercase tracking-wider">{method.name}</p>
                      <p className="text-[10px] text-editorial-muted mt-0.5">{method.desc}</p>
                    </div>
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                      activePaymentMethod === method.id ? 'bg-editorial-text border-editorial-text' : 'border-editorial-border'
                    }`}>
                      {activePaymentMethod === method.id && <span className="w-1.5 h-1.5 bg-editorial-bg rounded-full"></span>}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Right Payment Simulator Column */}
            <div className="lg:col-span-7 bg-white border border-editorial-border rounded-[32px] p-6 md:p-8 space-y-6">
              
              <div className="border-b border-editorial-border pb-4 flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-serif font-bold text-editorial-text">Pasarela Interactiva de NYLA</h3>
                  <p className="text-xs text-editorial-muted mt-1">Estás simulando un depósito de garantía de prueba por un valor de <strong>$40.00 USD</strong></p>
                </div>
                <span className="bg-editorial-text text-editorial-bg font-mono text-xs font-bold px-3 py-1.5 rounded-full">$40.00</span>
              </div>

              <AnimatePresence mode="wait">
                {paymentSuccess ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="p-8 text-center space-y-4 bg-green-50 border border-green-200 rounded-2xl"
                  >
                    <div className="w-16 h-16 bg-green-100 text-green-800 rounded-full flex items-center justify-center mx-auto shadow-sm">
                      <CheckCircle2 className="w-10 h-10" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-lg font-serif font-black text-green-900">¡Garantía Escrow Confirmada!</h4>
                      <p className="text-xs text-green-800 max-w-sm mx-auto leading-normal">
                        El depósito de <strong>$40.00 USD</strong> está en resguardo seguro de NYLA. Hemos enviado una alerta de confirmación oficial a tu WhatsApp Business.
                      </p>
                    </div>

                    <div className="bg-white border border-green-100 p-4 rounded-xl text-left max-w-sm mx-auto text-[10px] space-y-1.5 font-mono text-editorial-text">
                      <div className="flex justify-between"><span>TRANSACCIÓN ID:</span> <span>#NYLA-94827-SEC</span></div>
                      <div className="flex justify-between"><span>MÉTODO DE PAGO:</span> <span className="uppercase">{activePaymentMethod}</span></div>
                      <div className="flex justify-between"><span>CUSTODIO:</span> <span>NYLA ESCROW DEPOSIT CORP</span></div>
                      <div className="flex justify-between border-t border-dashed border-editorial-border pt-1.5 font-bold">
                        <span>TOTAL RETENIDO:</span> <span>$40.00 USD</span>
                      </div>
                    </div>

                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setPaymentSuccess(false);
                          setCardNumber('');
                          setPayphoneState('idle');
                          setTransferFileName(null);
                          setTransferUploaded(false);
                        }}
                        className="px-6 py-2 border border-green-300 text-green-800 hover:bg-green-100 rounded-full text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer bg-transparent"
                      >
                        Simular otro pago
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key={activePaymentMethod}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-6"
                  >
                    
                    {/* CREDIT CARD INTERACTIVE FORM */}
                    {activePaymentMethod === 'card' && (
                      <form onSubmit={handleProcessPayment} className="space-y-4">
                        {/* Interactive Credit Card visual wrapper */}
                        <div className="h-44 w-full max-w-md mx-auto bg-editorial-text rounded-2xl p-5 text-editorial-bg flex flex-col justify-between relative overflow-hidden shadow-sm">
                          <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-transparent"></div>
                          <div className="flex justify-between items-start z-10">
                            <CreditCard className="w-8 h-8" />
                            <span className="text-[9px] font-bold tracking-widest">NYLA PAY SECURE</span>
                          </div>
                          <div className="font-mono text-base tracking-[0.2em] z-10 py-1">
                            {cardNumber || '•••• •••• •••• ••••'}
                          </div>
                          <div className="flex justify-between items-end text-xs font-mono z-10 uppercase">
                            <div>
                              <p className="text-[7px] text-editorial-bg/50 uppercase tracking-wider">Titular</p>
                              <p className="truncate max-w-[180px] font-bold">{cardName || 'MATEO SANTAMARIA'}</p>
                            </div>
                            <div>
                              <p className="text-[7px] text-editorial-bg/50 uppercase tracking-wider">Expira</p>
                              <p className="font-bold">{cardExpiry || 'MM/AA'}</p>
                            </div>
                          </div>
                        </div>

                        {/* Text inputs */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-2">
                          <div className="space-y-1.5">
                            <label className="text-[9px] font-bold text-editorial-muted uppercase tracking-wider block">Número de Tarjeta</label>
                            <input 
                              type="text" 
                              placeholder="4111 2222 3333 4444" 
                              value={cardNumber}
                              onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, '').replace(/(\d{4})/g, '$1 ').trim().slice(0, 19))}
                              className="w-full bg-editorial-bg border border-editorial-border rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-editorial-text font-mono text-editorial-text text-xs"
                              required
                            />
                          </div>
                          
                          <div className="space-y-1.5">
                            <label className="text-[9px] font-bold text-editorial-muted uppercase tracking-wider block">Nombre del Titular</label>
                            <input 
                              type="text" 
                              value={cardName}
                              onChange={(e) => setCardName(e.target.value.toUpperCase())}
                              placeholder="Tu nombre completo"
                              className="w-full bg-editorial-bg border border-editorial-border rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-editorial-text text-editorial-text font-semibold text-xs"
                              required
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[9px] font-bold text-editorial-muted uppercase tracking-wider block">Fecha de Vencimiento</label>
                            <input 
                              type="text" 
                              placeholder="MM/AA" 
                              value={cardExpiry}
                              onChange={(e) => {
                                let val = e.target.value.replace(/\D/g, '');
                                if (val.length > 2) {
                                  val = val.slice(0, 2) + '/' + val.slice(2, 4);
                                }
                                setCardExpiry(val.slice(0, 5));
                              }}
                              className="w-full bg-editorial-bg border border-editorial-border rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-editorial-text font-mono text-editorial-text text-xs"
                              required
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[9px] font-bold text-editorial-muted uppercase tracking-wider block">CVC (Seguridad)</label>
                            <input 
                              type="password" 
                              placeholder="•••" 
                              value={cardCvc}
                              onChange={(e) => setCardCvc(e.target.value.replace(/\D/g, '').slice(0, 3))}
                              className="w-full bg-editorial-bg border border-editorial-border rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-editorial-text font-mono text-editorial-text text-xs"
                              required
                            />
                          </div>
                        </div>

                        {paymentError && <p className="text-red-700 text-xs font-bold">{paymentError}</p>}

                        <button
                          type="submit"
                          disabled={isProcessingPayment}
                          className="w-full bg-editorial-text text-editorial-bg py-3.5 rounded-full text-xs font-bold uppercase tracking-[0.15em] hover:opacity-95 transition-opacity disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2 border-none mt-4"
                        >
                          {isProcessingPayment ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" /> Procesando Depósito...
                            </>
                          ) : (
                            'Depositar $40.00 en Custodia NYLA'
                          )}
                        </button>
                      </form>
                    )}

                    {/* PAYPHONE ECUADOR DETAILED MOBILE SIMULATOR */}
                    {activePaymentMethod === 'payphone' && (
                      <div className="space-y-4">
                        <div className="bg-orange-50 border border-orange-200 text-orange-900 rounded-xl p-4 text-xs flex gap-3">
                          <Smartphone className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
                          <div>
                            <p className="font-bold">Pago directo con PayPhone App</p>
                            <p className="text-orange-800 leading-relaxed mt-0.5">
                              Ingresa tu número de teléfono celular registrado en PayPhone (Ecuador/América Latina). Enviaremos una solicitud de cobro interactiva directamente a tu app móvil.
                            </p>
                          </div>
                        </div>

                        {payphoneState === 'idle' && (
                          <form onSubmit={handlePayPhoneSubmit} className="space-y-3">
                            <div className="space-y-1.5">
                              <label className="text-[9px] font-bold text-editorial-muted uppercase tracking-wider block">Número Celular PayPhone (Ecuador)</label>
                              <div className="flex gap-2">
                                <span className="bg-editorial-light border border-editorial-border rounded-xl p-3 text-xs font-bold text-editorial-muted shrink-0 flex items-center">+593</span>
                                <input 
                                  type="tel" 
                                  placeholder="0991234567" 
                                  value={payphonePhone}
                                  onChange={(e) => setPayphonePhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                                  className="flex-1 bg-editorial-bg border border-editorial-border rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-editorial-text font-semibold text-editorial-text text-xs"
                                  required
                                />
                              </div>
                            </div>
                            <button
                              type="submit"
                              className="w-full bg-[#EA580C] text-white py-3.5 rounded-full text-[10px] font-bold uppercase tracking-wider hover:bg-orange-700 transition-colors cursor-pointer border-none"
                            >
                              Enviar Solicitud a PayPhone celular
                            </button>
                          </form>
                        )}

                        {payphoneState === 'sending' && (
                          <div className="py-6 text-center space-y-3">
                            <Loader2 className="w-8 h-8 text-[#EA580C] animate-spin mx-auto" />
                            <p className="text-xs text-editorial-text font-bold">Conectando con la pasarela segura de PayPhone...</p>
                          </div>
                        )}

                        {payphoneState === 'sent' && (
                          <div className="border border-editorial-border rounded-2xl p-5 space-y-4 bg-editorial-bg/30 max-w-sm mx-auto">
                            <div className="text-center space-y-2">
                              <Smartphone className="w-8 h-8 text-[#EA580C] animate-bounce mx-auto" />
                              <h4 className="text-xs font-bold text-editorial-text uppercase tracking-wider">¡SOLICITUD ENVIADA!</h4>
                              <p className="text-[10px] text-editorial-muted">Simulando notificación push en tu celular (+593) {payphonePhone}</p>
                            </div>
                            
                            {/* Simulated screen of Payphone User app */}
                            <div className="bg-white border border-editorial-border rounded-xl p-3.5 space-y-3 text-xs text-left shadow-sm">
                              <div className="flex justify-between items-center text-[9px] border-b border-editorial-border/60 pb-1.5 mb-1.5 font-bold text-[#EA580C]">
                                <span>PAYPHONE SOLICITUD</span>
                                <span>PAGOS ECUADOR</span>
                              </div>
                              <p className="text-[11px] leading-relaxed">¿Deseas autorizar el pago de <strong>$40.00 USD</strong> solicitado por <strong>NYLA PORTAL ACADÉMICO</strong>?</p>
                              <div className="flex gap-2.5 pt-1.5">
                                <button
                                  type="button"
                                  onClick={() => setPayphoneState('idle')}
                                  className="flex-1 py-1.5 border border-editorial-border text-editorial-muted text-[9px] font-bold uppercase tracking-wider rounded-lg cursor-pointer bg-transparent"
                                >
                                  Rechazar
                                </button>
                                <button
                                  type="button"
                                  onClick={handlePayphoneApprove}
                                  className="flex-1 py-1.5 bg-[#EA580C] text-white text-[9px] font-bold uppercase tracking-wider rounded-lg cursor-pointer border-none"
                                >
                                  Aprobar Pago
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* PAYPAL CHECKOUT SIMULATOR */}
                    {activePaymentMethod === 'paypal' && (
                      <div className="space-y-4 py-4 text-center">
                        <div className="bg-blue-50 border border-blue-200 text-blue-900 rounded-xl p-4 text-xs text-left">
                          <p className="font-bold">Pago Seguro Internacional con PayPal</p>
                          <p className="text-blue-800 leading-relaxed mt-0.5">
                            Accede a tu saldo de PayPal, cuentas bancarias asociadas o tarjetas internacionales de forma rápida.
                          </p>
                        </div>
                        
                        <div className="max-w-sm mx-auto space-y-3">
                          <button
                            type="button"
                            onClick={() => {
                              setIsProcessingPayment(true);
                              setTimeout(() => {
                                setIsProcessingPayment(false);
                                setPaymentSuccess(true);
                                handleSimulateWhatsAppNotification('escrow');
                              }, 1500);
                            }}
                            className="w-full bg-[#FFC439] hover:bg-[#E1A200] text-[#003087] font-bold py-3.5 px-6 rounded-full text-xs flex items-center justify-center gap-2 cursor-pointer border-none"
                          >
                            <span className="font-serif italic font-extrabold text-sm">PayPal</span> 
                            <span className="text-[10px] uppercase tracking-wider">Simular Checkout Express</span>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* GOOGLE PAY / APPLE PAY BUTTON SIMULATOR */}
                    {activePaymentMethod === 'gpay' && (
                      <div className="space-y-4 py-4 text-center">
                        <div className="max-w-sm mx-auto space-y-3">
                          <button
                            type="button"
                            onClick={() => {
                              setIsProcessingPayment(true);
                              setTimeout(() => {
                                setIsProcessingPayment(false);
                                setPaymentSuccess(true);
                                handleSimulateWhatsAppNotification('escrow');
                              }, 1200);
                            }}
                            className="w-full bg-black text-white hover:opacity-90 font-bold py-3.5 px-6 rounded-full text-xs flex items-center justify-center gap-2 cursor-pointer border-none"
                          >
                            <span> Pay / Google Pay</span>
                            <span className="text-[10px] uppercase tracking-wider font-bold">• Simular Un Toque</span>
                          </button>
                          <p className="text-[9px] text-editorial-muted uppercase tracking-wider">Usa las credenciales biométricas guardadas en tu navegador</p>
                        </div>
                      </div>
                    )}

                    {/* BANK TRANSFER WITH DRAG & DROP PROOF FILE UPLOADER */}
                    {activePaymentMethod === 'transfer' && (
                      <div className="space-y-4 text-left">
                        <div className="bg-editorial-bg p-4 rounded-xl border border-editorial-border space-y-2 text-xs">
                          <p className="font-bold text-editorial-text uppercase tracking-wider text-[10px]">Cuentas Bancarias Autorizadas NYLA</p>
                          <div className="grid grid-cols-2 gap-4 text-[11px] leading-normal font-sans">
                            <div>
                              <p className="text-editorial-muted">BANCO PICHINCHA (Ecuador)</p>
                              <p className="font-bold text-editorial-text">Cta Corriente: #2100482710</p>
                              <p className="text-editorial-muted">RUC: 1792847291001</p>
                            </div>
                            <div>
                              <p className="text-editorial-muted">BANCO PRODUBANCO</p>
                              <p className="font-bold text-editorial-text">Cta Ahorros: #1209384721</p>
                              <p className="text-editorial-muted">NYLA ACADEMIC S.A.S.</p>
                            </div>
                          </div>
                        </div>

                        {/* Drag and Drop Container */}
                        <div className="space-y-1.5">
                          <label className="text-[9px] font-bold text-editorial-muted uppercase tracking-wider block">Subir Comprobante de Transferencia (Simulado)</label>
                          
                          <div 
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={handleFileDrop}
                            onClick={() => {
                              // Simulate a click selecting a mock slip file
                              setTransferFileName('Comprobante_Transferencia_40USD.pdf');
                              simulateTransferUpload();
                            }}
                            className="border-2 border-dashed border-editorial-border hover:border-editorial-text rounded-2xl p-6 text-center cursor-pointer transition-colors bg-editorial-bg/30 space-y-2"
                          >
                            <Upload className="w-8 h-8 text-editorial-muted mx-auto animate-pulse" />
                            {transferFileName ? (
                              <div className="space-y-1">
                                <p className="text-xs font-bold text-editorial-text">{transferFileName}</p>
                                <p className="text-[10px] text-editorial-muted">Haz clic para reemplazar el archivo</p>
                              </div>
                            ) : (
                              <div className="space-y-1">
                                <p className="text-xs font-bold text-editorial-text">Arrastra tu comprobante de pago aquí, o haz clic para cargar</p>
                                <p className="text-[10px] text-editorial-muted">Soporta PDF, PNG, JPG de transferencias bancarias de prueba</p>
                              </div>
                            )}
                          </div>
                        </div>

                        {isUploadingTransfer && (
                          <div className="flex items-center gap-2 justify-center text-xs text-editorial-muted font-bold py-2">
                            <Loader2 className="w-4 h-4 animate-spin text-editorial-text" />
                            <span>Analizando y extrayendo metadatos del comprobante de transferencia...</span>
                          </div>
                        )}

                        {transferUploaded && (
                          <div className="bg-green-50 border border-green-200 text-green-900 rounded-xl p-3 text-xs flex gap-2 items-center">
                            <CheckCircle2 className="w-4 h-4 text-green-700 shrink-0" />
                            <span>¡Comprobante cargado con éxito! Se ha enlazado a la garantía de custodia de NYLA.</span>
                          </div>
                        )}
                      </div>
                    )}

                  </motion.div>
                )}
              </AnimatePresence>

            </div>

          </div>
        </section>

        {/* Bento Grid Features */}
        <section id="features" className="px-6 md:px-12 py-24 bg-editorial-bg">
          <div className="max-w-7xl mx-auto">
            
            <div className="text-center mb-20 space-y-4">
              <h2 className="text-4xl md:text-5xl font-serif text-editorial-text tracking-tight">¿Cómo funciona la cooperación?</h2>
              <div className="w-24 h-[1px] bg-editorial-text/20 mx-auto mt-4"></div>
              <p className="text-editorial-muted max-w-2xl mx-auto text-base">
                Un ecosistema de talento ágil, rápido y completamente transparente.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              
              {/* Feature 1 (Large 2-column bento card) */}
              <div className="md:col-span-2 bg-editorial-light p-8 rounded-[32px] border border-editorial-border flex flex-col md:flex-row gap-8 items-center hover:scale-[1.01] transition-transform duration-300">
                <div className="flex-1 space-y-4">
                  <div className="w-12 h-12 rounded-full bg-editorial-text/5 text-editorial-text flex items-center justify-center">
                    <School className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-serif font-bold text-editorial-text">Talento Pre-seleccionado</h3>
                  <p className="text-editorial-muted text-sm leading-relaxed">
                    Solo los estudiantes más brillantes de las mejores universidades acceden a nuestro ecosistema, garantizando calidad técnica, alto compromiso y creatividad en cada entrega.
                  </p>
                </div>
                
                <div className="w-full md:w-2/5 aspect-[4/3] rounded-[24px] overflow-hidden bg-white border border-editorial-border">
                  <img 
                    className="w-full h-full object-cover" 
                    referrerPolicy="no-referrer"
                    alt="University student coding inside a brightly lit academic center"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCCg-sYd74mPtldBVLjpMlInRZpS-FvyONN-uEnSbU5vVhIMzgq1_nliHBmaDbOMJD6R0Vtrp-71v-t-N0l2Fi3itvfMNYHSX8XBlLq41trEqzFB1up1u-kbIYaqYU2O0R1iiffM2KBBBkS1q8nIZwwdlFTFReP6Uj4IxFhJa1GZB6pM4j75ZCuovgwg7vTUP_aJAqltVKtJArj5AayWm1kmDLUGpqFUOP2ekK9iac2W2wn32zwj-SFSIP6O_CM7qWrOKFPY2SIBlZn" 
                  />
                </div>
              </div>

              {/* Feature 2 (1-column bento card) */}
              <div className="bg-editorial-light p-8 rounded-[32px] border border-editorial-border flex flex-col justify-between hover:scale-[1.01] transition-transform duration-300">
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-full bg-editorial-text/5 text-editorial-text flex items-center justify-center">
                    <Rocket className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-serif font-bold text-editorial-text">Agilidad Real</h3>
                  <p className="text-editorial-muted text-sm leading-relaxed">
                    Ideal para startups y empresas de tecnología que necesitan prototipar rápidamente, investigar mercados cambiantes o desarrollar MVP competitivos con una visión fresca.
                  </p>
                </div>
              </div>

              {/* Feature 3 (1-column bento card) */}
              <div className="bg-editorial-light p-8 rounded-[32px] border border-editorial-border flex flex-col justify-between hover:scale-[1.01] transition-transform duration-300">
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-full bg-editorial-text/5 text-editorial-text flex items-center justify-center">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-serif font-bold text-editorial-text">Supervisión de Garantía</h3>
                  <p className="text-editorial-muted text-sm leading-relaxed">
                    Cada proyecto cuenta con el respaldo y custodia de nuestra pasarela segura para asegurar que se paguen los plazos correctos únicamente contra la validación de hitos profesionales.
                  </p>
                </div>
              </div>

              {/* Feature 4 (Large 2-column highlighted card) */}
              <div className="md:col-span-2 bg-gradient-to-br from-[#D9D1C7] to-[#C4B7A6] text-editorial-text p-8 rounded-[32px] border border-editorial-border flex flex-col md:flex-row gap-8 items-center hover:scale-[1.01] transition-transform duration-300">
                <div className="flex-1 space-y-3">
                  <h3 className="text-2xl font-serif font-bold text-editorial-text">Tu red de contactos profesional</h3>
                  <p className="text-editorial-muted text-sm leading-relaxed">
                    Más que un proyecto temporal, es el inicio de una red de contactos invaluable entre líderes innovadores de la industria y la próxima generación de talentos directivos.
                  </p>
                </div>
                
                <div className="flex -space-x-4">
                  <img 
                    className="w-12 h-12 rounded-full border-2 border-editorial-bg bg-white object-cover" 
                    referrerPolicy="no-referrer"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuA3IAbmw7mPDpl0mdfym-FTgFUC-ZZo-wq2i38wBAkO1UWbfLZglso3CXrfrAsKp5iozkNaziyaOE_pTXXuQv0CmuM4eVrO1x1qqAEfOQi6VUKJUq9rbxY9UXFdqRTr1i_JaDGUjO-wi6bYZhl05ME4NWgV85JItvwi7AZy6W44a9J5P8OCxAWqsKozS2rZBirTSbWsZFeRdx1jkZB9UohsIORsH1OtWYS4QoLHpfme8TvpUdxTUWhJjaivDg-yOrI0nOZCFBjdTliO" 
                    alt="Entrepreneur"
                  />
                  <img 
                    className="w-12 h-12 rounded-full border-2 border-editorial-bg bg-white object-cover" 
                    referrerPolicy="no-referrer"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDPM_EOkdz_yQmQF_D9wPJtQzWYtEm7jgBzRKIL886hCRRp01BICSyxOAk9SpvfZEbKIPvW7zkUvaB5LndbPDqMsFRZaY6Wmwh06_meJ8x1vrRVs2HRJdt6BEBy6VMrLmRRB3fLs0c9vekw3kJlbxosJUBdxFa3N02of0kM-EPgeWFpntsFgoXAly-fsBzqACZX90eq7_1IjKl8umoDxLXLmpFN6Ebk5vo7OmPcZOmYG_JwBE4B4LbXfvwiPvTvpVr7fTI-W--KSsPu" 
                    alt="Student"
                  />
                  <div className="w-12 h-12 rounded-full border-2 border-editorial-bg bg-editorial-text flex items-center justify-center text-[10px] font-bold text-editorial-bg">
                    +2k
                  </div>
                </div>
              </div>

            </div>

          </div>
        </section>

        {/* Caso de Éxito Destacado Section */}
        <section id="caso-exito" className="px-6 md:px-12 py-20 bg-white border-t border-editorial-border">
          <div className="max-w-5xl mx-auto space-y-12">
            
            {/* Header */}
            <div className="text-center space-y-4 max-w-2xl mx-auto">
              <span className="inline-block border border-editorial-border px-3.5 py-1 rounded-full text-[9px] font-bold tracking-[0.15em] uppercase text-editorial-text/70 bg-editorial-bg">
                CASOS DE ÉXITO 🇪🇨
              </span>
              <h2 className="text-3xl md:text-5xl font-serif font-black text-editorial-text leading-tight tracking-tight">
                De Proyecto Académico a Marca Real
              </h2>
              <p className="text-editorial-muted text-sm leading-relaxed">
                Mira cómo emprendedores locales de Cuenca impulsan su presencia digital y aumentan sus ventas colaborando con talentos universitarios respaldados por la garantía de custodia Escrow de NYLA.
              </p>
            </div>

            {/* Interactive Success Card */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-editorial-light/40 border border-editorial-border rounded-[32px] p-6 md:p-10 text-left">
              
              {/* Info Column (lg:col-span-7) - Adry Pasteleria */}
              <div className="lg:col-span-7 space-y-6">
                <div className="inline-flex items-center gap-2 bg-[#E1F5FE] border border-sky-200 text-sky-900 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                  <span className="w-2 h-2 rounded-full bg-[#E1306C] animate-pulse"></span>
                  Caso Real en Instagram: @adrypasteleriaypanaderia
                </div>

                <div className="space-y-3">
                  <h3 className="text-2xl md:text-3xl font-serif font-black text-editorial-text leading-tight">
                    La Historia de Adry Pastelería
                  </h3>
                  <p className="text-xs md:text-sm text-editorial-muted leading-relaxed">
                    <strong className="text-editorial-text font-black">Adry Pastelería</strong> es una distinguida marca artesanal de Cuenca, Ecuador, dedicada a la creación de repostería creativa de alta calidad. Creado por <strong className="text-editorial-text font-bold">@adrypasteleriaypanaderia</strong>, se especializa en tortas personalizadas exclusivas (Tarta Vasca, pasteles temáticos para cumpleaños), desayunos sorpresa y las cotizadas "tablitas gourmet" de embutidos y quesos.
                  </p>
                  <p className="text-xs md:text-sm text-editorial-muted leading-relaxed">
                    Con el objetivo de sofisticar su presencia digital, organizar visualmente su catálogo y captar más pedidos locales a través de WhatsApp, realizaron una colaboración de diseño y branding con estudiantes de NYLA. Se diseñó y publicó una serie de <strong>3 publicaciones clave de altísima estética</strong> en Instagram que redefinieron el perfil, mostrando con gran elegancia sus productos estrella y elevando la confianza del cliente.
                  </p>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-3 gap-4 border-y border-editorial-border/60 py-4">
                  <div>
                    <span className="text-[9px] uppercase font-bold text-editorial-muted block">Publicaciones</span>
                    <span className="font-serif font-black text-xl md:text-2xl text-editorial-accent">451</span>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase font-bold text-editorial-muted block">Seguidores</span>
                    <span className="font-serif font-black text-xl md:text-2xl text-editorial-text">2,033</span>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase font-bold text-editorial-muted block">Post Entregados</span>
                    <span className="font-serif font-black text-xl md:text-2xl text-green-700">3 Publicaciones</span>
                  </div>
                </div>

                {/* Direct CTA */}
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <a
                    href="https://www.instagram.com/adrypasteleriaypanaderia/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-gradient-to-r from-[#FCAF45] via-[#E1306C] to-[#C13584] text-white px-6 py-3.5 rounded-xl text-[10px] uppercase tracking-widest font-bold hover:opacity-90 transition-all flex items-center justify-center gap-2 cursor-pointer text-center no-underline border-none"
                  >
                    Ver perfil en Instagram
                    <ExternalLink className="w-4 h-4" />
                  </a>
                  <button
                    onClick={() => setView('dashboard')}
                    className="bg-editorial-text text-editorial-bg hover:opacity-90 px-6 py-3.5 rounded-xl text-[10px] uppercase tracking-widest font-bold transition-all cursor-pointer border-none"
                  >
                    Iniciar mi Caso de Éxito
                  </button>
                </div>
              </div>

              {/* Instagram Phone Mockup Column (lg:col-span-5) */}
              <div className="lg:col-span-5 flex justify-center w-full">
                <div className="relative w-full max-w-[325px] bg-black rounded-[48px] p-4 shadow-2xl border-[6px] border-neutral-800">
                  {/* Camera Notch */}
                  <div className="absolute top-6 left-1/2 -translate-x-1/2 w-24 h-4 bg-black rounded-full z-20"></div>
                  
                  {/* Phone Screen Container */}
                  <div className="relative aspect-[9/18.5] w-full rounded-[36px] overflow-hidden bg-white flex flex-col justify-between text-neutral-900 p-3 font-sans border border-neutral-200">
                    
                    {/* Top Bar Status */}
                    <div className="flex justify-between items-center text-[10px] opacity-90 pt-1 px-2 font-semibold text-neutral-900">
                      <span>18:45</span>
                      <div className="flex items-center gap-1.5">
                        <span>📶</span>
                        <span>🔋</span>
                      </div>
                    </div>

                    {/* Instagram Header Bar */}
                    <div className="flex justify-between items-center px-2 py-1.5 border-b border-neutral-100 bg-white">
                      <button className="text-neutral-800 hover:text-black transition-colors bg-transparent border-none p-0 cursor-pointer">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                      <span className="font-bold text-xs tracking-wide text-neutral-800">adrypasteleriaypanaderia</span>
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-semibold text-neutral-500">•••</span>
                      </div>
                    </div>

                    {/* Instagram User Profile simulation */}
                    <div className="flex-1 flex flex-col justify-start space-y-3.5 pt-3 overflow-y-auto no-scrollbar bg-white">
                      
                      {/* Avatar & Stats row */}
                      <div className="flex items-center gap-4 px-1.5">
                        {/* Avatar */}
                        <div className="relative shrink-0">
                          {/* Gradient ring */}
                          <div className="w-[68px] h-[68px] rounded-full p-[2px] bg-gradient-to-tr from-[#FCAF45] via-[#E1306C] to-[#C13584]">
                            <div className="w-full h-full rounded-full overflow-hidden bg-[#78A3A3] flex items-center justify-center border border-white text-white p-1 text-center font-serif shadow-sm">
                              <div className="flex flex-col items-center leading-none">
                                <span className="text-[10px] font-bold tracking-tight">Adry</span>
                                <span className="text-[6.5px] uppercase tracking-wider font-sans mt-0.5 opacity-90">Pasteleria</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Stats counts inline */}
                        <div className="flex-1 flex justify-around text-center">
                          <div>
                            <div className="font-extrabold text-[12px] text-neutral-900">451</div>
                            <div className="text-[7.5px] text-neutral-500 uppercase tracking-tight font-medium">Publics.</div>
                          </div>
                          <div>
                            <div className="font-extrabold text-[12px] text-neutral-900">2033</div>
                            <div className="text-[7.5px] text-neutral-500 uppercase tracking-tight font-medium">Seguidores</div>
                          </div>
                          <div>
                            <div className="font-extrabold text-[12px] text-neutral-900">3507</div>
                            <div className="text-[7.5px] text-neutral-500 uppercase tracking-tight font-medium">Seguidos</div>
                          </div>
                        </div>
                      </div>

                      {/* Profile Info & Bio */}
                      <div className="text-[9.5px] text-neutral-800 px-2 space-y-0.5 font-sans">
                        <p className="font-extrabold text-[10.5px] text-neutral-900">Adry Pasteleria</p>
                        <p className="text-neutral-500 text-[9px] italic">Creado por @adrypasteleriaypanaderia realizamos</p>
                        <p className="text-neutral-800 font-bold">🎂 TORTAS / TARTA VASCA / DESAYUNOS / TABLITAS</p>
                        <p className="text-neutral-600 flex items-center gap-1">📍 Tienda online, Pedidos con 24 a 48 horas...</p>
                        <p className="text-[#00376B] font-bold flex items-center gap-1 cursor-pointer">
                          🔗 wa.link/go9uzh
                        </p>
                      </div>

                      {/* Buttons (Siguiendo, Mensaje) */}
                      <div className="flex gap-1.5 px-2">
                        <button className="flex-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-900 text-[9.5px] font-extrabold py-1.5 rounded-lg transition-colors border-none cursor-pointer">
                          Siguiendo
                        </button>
                        <button className="flex-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-900 text-[9.5px] font-extrabold py-1.5 rounded-lg transition-colors border-none cursor-pointer">
                          Mensaje
                        </button>
                        <button className="bg-neutral-100 hover:bg-neutral-200 p-1.5 rounded-lg text-neutral-900 transition-colors flex items-center justify-center shrink-0 border-none cursor-pointer">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M18 9v3m0 0v3m0-3h3m-3 0h-3" />
                          </svg>
                        </button>
                      </div>

                      {/* Instagram Grid Header (Tab Icons) */}
                      <div>
                        <div className="flex border-b border-neutral-100">
                          <button className="flex-1 text-center py-2 text-[11px] text-neutral-900 border-b border-neutral-900 flex items-center justify-center bg-transparent cursor-pointer">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                            </svg>
                          </button>
                          <button className="flex-1 text-center py-2 text-[11px] text-neutral-400 flex items-center justify-center bg-transparent cursor-pointer hover:text-neutral-600">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                          </button>
                          <button className="flex-1 text-center py-2 text-[11px] text-neutral-400 flex items-center justify-center bg-transparent cursor-pointer hover:text-neutral-600">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </button>
                        </div>

                        {/* Simulated Instagram 3-Post Grid (as requested: "le hicimos 3 publicaciones en instagram") */}
                        <div className="grid grid-cols-3 gap-0.5 w-full pt-0.5">
                          
                          {/* Post 1: Torta Gimnasta / Musculosa */}
                          <div className="aspect-square relative group bg-[#ECEAE6] overflow-hidden cursor-pointer border border-neutral-100 flex items-center justify-center shadow-sm">
                            <div className="absolute inset-0 bg-[#E8E6E1] flex flex-col items-center justify-center p-1 text-center relative">
                              {/* White oval cake stand */}
                              <div className="absolute bottom-1 w-20 h-3.5 bg-white rounded-full border border-neutral-300 shadow-sm z-0"></div>
                              
                              {/* Black cylindrical cake */}
                              <div className="absolute bottom-3 w-13 h-16 bg-neutral-900 border-x border-neutral-850 rounded-t-sm shadow-md z-10 flex flex-col justify-end overflow-hidden pb-1">
                                {/* Side Stencil Spray & Bodybuilder */}
                                <div className="absolute inset-0 flex items-center justify-center">
                                  {/* White stencil paint glow */}
                                  <div className="absolute w-10 h-10 bg-white/70 rounded-full blur-[2px] opacity-80"></div>
                                  {/* Bodybuilder Silhouette */}
                                  <svg viewBox="0 0 100 100" className="w-9 h-9 text-neutral-950 relative z-10" fill="currentColor">
                                    <path d="M 50,30 C 53,30 55,27.5 55,25 C 55,22.5 53,20 50,20 C 47,20 45,22.5 45,25 C 45,27.5 47,30 50,30 Z M 32,22 C 28,22 26,26 28,29 C 29,31 31,32 33,31 C 34.5,30 35,28 35,26 L 38,33 L 44,36 L 44,48 L 39,62 L 39,80 L 47,80 L 47,62 L 53,62 L 53,80 L 61,80 L 61,62 L 56,48 L 56,36 L 62,33 L 65,26 C 65,28 65.5,30 67,31 C 69,32 71,31 72,29 C 74,26 72,22 68,22 Z" />
                                  </svg>
                                </div>

                                {/* Blueberries / Toppings edge */}
                                <div className="absolute top-0 inset-x-0 h-1 bg-neutral-950 flex justify-around px-0.5 z-20">
                                  <div className="w-1 h-1 rounded-full bg-slate-900"></div>
                                  <div className="w-1.5 h-1.5 rounded-full bg-slate-950 -mt-0.5"></div>
                                  <div className="w-1 h-1 rounded-full bg-slate-900"></div>
                                  <div className="w-1 h-1 rounded-full bg-slate-950"></div>
                                </div>
                              </div>

                              {/* Toppers on Top */}
                              {/* 40 Topper */}
                              <span className="absolute bottom-[72px] left-[32%] font-sans font-black text-[7.5px] text-slate-300 drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)] z-20 scale-105">
                                40
                              </span>
                              {/* Round cutout Happy Birthday topper */}
                              <div className="absolute bottom-[75px] right-[28%] w-5 h-5 rounded-full border border-neutral-950 bg-neutral-950 flex items-center justify-center p-0.5 text-center leading-none z-20 shadow">
                                <span className="text-[2.5px] font-black text-white tracking-tighter uppercase scale-75">H-BDAY</span>
                              </div>
                            </div>
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[9px] font-bold z-30">
                              <span>❤️ 13</span>
                              <span>💬 0</span>
                            </div>
                          </div>

                          {/* Post 2: Caja Regalo / Tablita / Desayuno */}
                          <div className="aspect-square relative group bg-[#ECEAE6] overflow-hidden cursor-pointer border border-neutral-100 flex items-center justify-center shadow-sm">
                            <div className="absolute inset-0 bg-[#E8E6E1] p-1 flex items-center justify-center relative">
                              <div className="w-[105px] h-[105px] bg-white rounded shadow-md p-1 flex flex-col justify-between border border-neutral-300 relative overflow-hidden">
                                {/* Kraft lining background */}
                                <div className="absolute inset-0 bg-[#F3ECE2] opacity-90 z-0"></div>
                                
                                {/* Items inside Box */}
                                <div className="relative w-full h-full z-10 grid grid-cols-12 gap-0.5">
                                  {/* Left column: Bottle of wine */}
                                  <div className="col-span-4 relative flex flex-col items-center justify-start pt-1">
                                    {/* Wine bottle */}
                                    <div className="w-4 h-15 bg-emerald-950 rounded-b-md rounded-t-sm shadow relative flex flex-col items-center justify-start rotate-[2deg]">
                                      {/* Wine foil top */}
                                      <div className="absolute -top-3 w-1.5 h-3 bg-red-800 rounded-t-sm"></div>
                                      {/* Label */}
                                      <div className="w-3 h-7 bg-white rounded-sm mt-3 flex flex-col items-center justify-center p-0.5 border border-amber-800/10 scale-95">
                                        <span className="text-[1.5px] uppercase font-black text-rose-800 tracking-tighter leading-none scale-90">ADRY</span>
                                        <div className="w-1.5 h-1.5 rounded-full bg-rose-400 my-0.5"></div>
                                        <span className="text-[1px] text-neutral-500 scale-50 -mt-0.5">Pastelería</span>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  {/* Right part: Food & Bento Cake */}
                                  <div className="col-span-8 relative h-full">
                                    {/* Green grapes */}
                                    <div className="absolute top-0.5 left-0.5 flex flex-wrap gap-0.5 w-6">
                                      <div className="w-1.5 h-1.5 rounded-full bg-lime-400/90 shadow-sm"></div>
                                      <div className="w-1.2 h-1.2 rounded-full bg-lime-300/90 shadow-sm"></div>
                                      <div className="w-1.5 h-1.5 rounded-full bg-lime-400/90 shadow-sm"></div>
                                      <div className="w-1.5 h-1.5 rounded-full bg-lime-300/90 shadow-sm"></div>
                                      <div className="w-1.2 h-1.2 rounded-full bg-lime-400/90 shadow-sm"></div>
                                    </div>

                                    {/* Strawberries & Roses */}
                                    <div className="absolute top-0.5 right-0.5 flex flex-col gap-0.5 items-end">
                                      {/* Salami Rose 1 */}
                                      <div className="w-4.5 h-4.5 rounded-full bg-rose-800 shadow-inner flex items-center justify-center border border-red-950/20 relative">
                                        <div className="absolute inset-0.5 rounded-full border border-rose-900 bg-rose-700"></div>
                                        <div className="absolute inset-1 rounded-full border border-rose-950 bg-rose-850"></div>
                                      </div>
                                    </div>

                                    {/* Cheese slices & Ham folds */}
                                    <div className="absolute top-5.5 left-1 flex gap-0.5">
                                      <div className="w-3.5 h-1.5 bg-rose-200 rounded-full shadow-sm"></div>
                                      <div className="w-3.5 h-1.5 bg-rose-300/90 rounded-full shadow-sm"></div>
                                      <div className="w-1.2 h-2.5 bg-yellow-300 shadow-sm rotate-12"></div>
                                    </div>

                                    {/* Salami Rose 2 */}
                                    <div className="absolute top-5 right-5.5 w-3.5 h-3.5 rounded-full bg-rose-800 shadow-inner flex items-center justify-center border border-red-950/10">
                                      <div className="absolute inset-0.5 rounded-full border border-rose-900 bg-rose-750"></div>
                                    </div>

                                    {/* Mini Bento Cake at bottom-right */}
                                    <div className="absolute bottom-0.5 right-0.5 w-11 h-11 rounded-full bg-white border border-neutral-300 shadow-sm flex items-center justify-center relative">
                                      {/* Flork representation */}
                                      <div className="relative w-9 h-9 flex items-center justify-center scale-[0.8]">
                                        <svg viewBox="0 0 100 100" className="w-full h-full text-neutral-800" fill="none" stroke="currentColor" strokeWidth="5">
                                          {/* Stairs graph */}
                                          <path d="M10,80 L35,80 L35,50 L65,50 L65,25 L90,25" stroke="black" />
                                          {/* Characters */}
                                          <path d="M18,80 C18,68 28,68 28,80" fill="white" stroke="black" />
                                          <path d="M44,50 C44,38 54,38 54,50" fill="white" stroke="black" />
                                          <path d="M72,25 C72,13 82,13 82,25" fill="white" stroke="black" />
                                        </svg>
                                        <span className="absolute bottom-0 left-0 text-[3px] font-black text-neutral-900 scale-75">38</span>
                                        <span className="absolute bottom-2.5 left-3.5 text-[3px] font-black text-neutral-900 scale-75">39</span>
                                        <span className="absolute top-0.5 right-0.5 text-[3px] font-black text-neutral-900 scale-75">40</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[9px] font-bold z-30">
                              <span>❤️ 28</span>
                              <span>💬 4</span>
                            </div>
                          </div>

                          {/* Post 3: Princess Cake with Silver Tiara Crown */}
                          <div className="aspect-square relative group bg-[#ECEAE6] overflow-hidden cursor-pointer border border-neutral-100 flex items-center justify-center shadow-sm">
                            <div className="absolute inset-0 bg-[#E8E6E1] flex flex-col items-center justify-center p-1 text-center relative">
                              {/* White oval cake stand */}
                              <div className="absolute bottom-1 w-20 h-3.5 bg-white rounded-full border border-neutral-300 shadow-sm z-0"></div>

                              {/* Tall cream cylindrical cake */}
                              <div className="absolute bottom-3 w-13 h-17 bg-[#F6F2EB] border-x border-neutral-300 rounded-t-sm shadow-md z-10 flex flex-col justify-start pt-1.5 px-0.5 relative">
                                {/* Pearls/Beads decoration (studded points on sides) */}
                                <div className="absolute inset-1 pointer-events-none opacity-80">
                                  {/* Base pearls cluster */}
                                  <div className="absolute bottom-0.5 left-0.5 w-1 h-1 rounded-full bg-slate-300 shadow-sm"></div>
                                  <div className="absolute bottom-1 left-2 w-1.2 h-1.2 rounded-full bg-white shadow-sm"></div>
                                  <div className="absolute bottom-0.5 right-1 w-1 h-1 rounded-full bg-slate-300 shadow-sm"></div>
                                  <div className="absolute bottom-2.5 right-0.5 w-1.2 h-1.2 rounded-full bg-white shadow-sm"></div>
                                  {/* Scattered pearls */}
                                  <div className="absolute top-2 left-1 w-0.8 h-0.8 rounded-full bg-slate-300 opacity-90"></div>
                                  <div className="absolute top-4 right-1.5 w-1 h-1 rounded-full bg-white opacity-90"></div>
                                  <div className="absolute top-6 left-2 w-0.8 h-0.8 rounded-full bg-slate-300"></div>
                                </div>

                                {/* Birthday Princess cursive writing */}
                                <div className="absolute top-5.5 left-1/2 -translate-x-1/2 text-center w-full z-20 scale-90">
                                  <span className="font-serif italic font-black text-[3.8px] text-slate-500 tracking-tighter block leading-none drop-shadow-[0_0.5px_0.5px_rgba(255,255,255,0.9)]">Birthday</span>
                                  <span className="font-serif italic font-black text-[4.2px] text-slate-400 tracking-tighter block leading-none -mt-0.5 drop-shadow-[0_0.5px_0.5px_rgba(255,255,255,0.9)]">Princess</span>
                                </div>

                                {/* Candle behind crown */}
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-0.5 h-4.5 bg-slate-300 z-0">
                                  <div className="absolute -top-0.8 left-1/2 -translate-x-1/2 w-0.8 h-1 bg-amber-400 rounded-full animate-pulse"></div>
                                </div>

                                {/* Silver Tiara Crown sitting on top */}
                                <svg viewBox="0 0 100 60" className="w-8 h-5.5 text-slate-300 drop-shadow absolute -top-4.5 left-1/2 -translate-x-1/2 z-20" fill="currentColor">
                                  <path d="M10,50 L90,50 L85,30 L70,42 L50,15 L30,42 L15,30 Z" stroke="silver" strokeWidth="2.5" />
                                  <circle cx="50" cy="15" r="3.5" fill="white" />
                                  <circle cx="30" cy="42" r="2.5" fill="white" />
                                  <circle cx="70" cy="42" r="2.5" fill="white" />
                                  <circle cx="15" cy="30" r="2.5" fill="white" />
                                  <circle cx="85" cy="30" r="2.5" fill="white" />
                                </svg>
                              </div>
                            </div>
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[9px] font-bold z-30">
                              <span>❤️ 42</span>
                              <span>💬 2</span>
                            </div>
                          </div>

                        </div>
                      </div>

                    </div>

                    {/* Interactive Click indicator bottom bar */}
                    <a
                      href="https://www.instagram.com/adrypasteleriaypanaderia/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-gradient-to-r from-[#FCAF45] via-[#E1306C] to-[#C13584] hover:opacity-90 text-white py-2 rounded-xl text-[9px] font-extrabold uppercase tracking-widest text-center no-underline block transition-all mt-2 shadow-sm"
                    >
                      📸 Ver en Instagram
                    </a>

                  </div>
                </div>
              </div>

            </div>

          </div>
        </section>

        {/* YouTube Video Tutorial Section */}
        <section id="tutorial" className="px-6 md:px-12 py-20 bg-editorial-light border-t border-editorial-border">
          <div className="max-w-4xl mx-auto space-y-8">
            
            {/* Header */}
            <div className="text-center space-y-4 max-w-2xl mx-auto">
              <span className="inline-block border border-editorial-border px-3.5 py-1 rounded-full text-[9px] font-bold tracking-[0.15em] uppercase text-editorial-text/70 bg-white">
                CENTRO DE APRENDIZAJE NYLA
              </span>
              <h2 className="text-3xl md:text-4xl font-serif font-black text-editorial-text leading-tight tracking-tight">
                Videotutorial: Cómo funciona el Match y la Garantía Escrow
              </h2>
              <p className="text-editorial-muted text-xs leading-relaxed">
                Aprende en 3 minutos cómo registrarte, realizar el match de habilidades en tiempo real, firmar el contrato digital y asegurar los pagos retenidos en custodia.
              </p>
            </div>

            {/* Video Player Card */}
            <div className="bg-white border border-editorial-border rounded-[32px] p-6 md:p-8 space-y-6 shadow-sm">
              
              {/* Dynamic Video Embed Area */}
              <div className="aspect-video w-full rounded-2xl overflow-hidden bg-black border border-editorial-border relative shadow-inner">
                <iframe
                  className="w-full h-full"
                  src={tutorialEmbedUrl}
                  title="NYLA Video Tutorial"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                ></iframe>
              </div>

              {/* URL Configurator Form */}
              <div className="space-y-4 pt-2">
                <div className="space-y-1.5 text-left">
                  <label className="text-[10px] font-bold text-editorial-muted uppercase tracking-wider block">
                    Configurar enlace de videotutorial (URL de YouTube)
                  </label>
                  <p className="text-[9px] text-editorial-muted -mt-1 mb-2">
                    Ingresa cualquier URL de YouTube (p. ej., <code className="bg-editorial-bg px-1 py-0.5 rounded">https://youtu.be/lMESXRaNerk</code>) y el reproductor de arriba se actualizará de forma dinámica en tiempo real.
                  </p>
                  
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input
                      type="text"
                      value={youtubeLinkInput}
                      onChange={(e) => updateEmbedUrl(e.target.value)}
                      placeholder="Pega un enlace de YouTube aquí..."
                      className="flex-1 bg-editorial-bg border border-editorial-border rounded-xl px-4 py-3 text-xs focus:outline-none focus:ring-1 focus:ring-editorial-text font-semibold text-editorial-text"
                    />
                    <button
                      type="button"
                      onClick={() => updateEmbedUrl(youtubeLinkInput)}
                      className="bg-editorial-text text-editorial-bg px-6 py-3 rounded-xl text-[10px] uppercase tracking-widest font-bold hover:opacity-90 transition-all cursor-pointer border-none"
                    >
                      Actualizar Video
                    </button>
                  </div>
                </div>

                {/* Preconfigured Demo Links */}
                <div className="space-y-2 text-left pt-2 border-t border-editorial-border/60">
                  <span className="text-[9px] uppercase font-bold text-editorial-muted tracking-wider block">Cargar videos de demostración académicos:</span>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { label: '🎬 Introducción a NYLA Escrow', url: 'https://youtu.be/lMESXRaNerk?si=h9uA0x_RW1RRNtwj' },
                      { label: '💻 Desarrollo de MVP en React', url: 'https://www.youtube.com/watch?v=w7ejDZ8IaOg' },
                      { label: '📊 Visualización de Datos con D3', url: 'https://www.youtube.com/watch?v=2LhoCfjm8R4' }
                    ].map((demo) => (
                      <button
                        key={demo.label}
                        type="button"
                        onClick={() => updateEmbedUrl(demo.url)}
                        className={`px-3 py-1.5 rounded-full text-[9px] font-bold border transition-all cursor-pointer ${
                          youtubeLinkInput === demo.url
                            ? 'bg-editorial-accent text-white border-editorial-accent'
                            : 'bg-editorial-bg text-editorial-text border-editorial-border hover:bg-white'
                        }`}
                      >
                        {demo.label}
                      </button>
                    ))}
                  </div>
                </div>

              </div>

            </div>

          </div>
        </section>

        {/* WhatsApp Business Informational CTA section */}
        <section id="whatsapp-section" className="px-6 md:px-12 py-20 bg-editorial-light border-t border-editorial-border text-center">
          <div className="max-w-3xl mx-auto space-y-6">
            <span className="bg-green-100 text-green-800 border border-green-200 text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider inline-flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5" /> CANAL DE WHATSAPP BUSINESS
            </span>
            <h2 className="text-3xl md:text-4xl font-serif text-editorial-text leading-tight font-black">
              Contáctanos directamente por WhatsApp Business
            </h2>
            <p className="text-editorial-muted text-sm leading-relaxed max-w-xl mx-auto">
              ¿Tienes dudas sobre los proyectos, contratos o garantías en custodia (Escrow)? Escríbenos al número oficial de soporte de NYLA: <strong className="text-editorial-text font-black">098 358 7234</strong> y te ayudaremos de inmediato.
            </p>
            <div className="pt-2">
              <a
                href="https://wa.me/593983587234?text=Hola%20NYLA%2C%20quisiera%20saber%20m%C3%A1s%20sobre%20los%20servicios%20y%20garant%C3%ADa%20Escrow."
                target="_blank"
                rel="noopener noreferrer"
                className="bg-green-600 hover:bg-green-700 text-white font-bold px-8 py-3.5 rounded-full text-xs uppercase tracking-wider inline-flex items-center gap-2.5 mx-auto cursor-pointer border-none no-underline shadow-md transition-all hover:scale-105"
              >
                <Smartphone className="w-4 h-4" /> Escríbenos por WhatsApp (098 358 7234)
              </a>
            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer id="about" className="bg-editorial-bg border-t border-editorial-border">
        <div className="w-full py-16 px-6 md:px-12 grid grid-cols-1 md:grid-cols-4 gap-8 max-w-7xl mx-auto">
          <div className="space-y-4">
            <span className="font-serif font-black text-editorial-text text-3xl block tracking-tighter">NYLA.</span>
            <p className="text-editorial-muted text-sm max-w-xs leading-relaxed">
              Empoderando el talento universitario de alto nivel y conectándolo con las oportunidades que definen el futuro de los negocios.
            </p>
          </div>
          <div>
            <h4 className="text-[11px] uppercase tracking-[0.2em] font-bold text-editorial-text/40 border-b border-editorial-border pb-2 mb-4">Plataforma</h4>
            <ul className="space-y-2">
              <li><button onClick={() => setView('dashboard')} className="text-editorial-muted hover:text-editorial-text text-sm transition-colors cursor-pointer bg-transparent border-none p-0 text-left">Proyectos</button></li>
              <li><button onClick={() => setView('dashboard')} className="text-editorial-muted hover:text-editorial-text text-sm transition-colors cursor-pointer bg-transparent border-none p-0 text-left">Para Universidades</button></li>
              <li><button onClick={() => setView('dashboard')} className="text-editorial-muted hover:text-editorial-text text-sm transition-colors cursor-pointer bg-transparent border-none p-0 text-left">Para Startups</button></li>
              <li><button onClick={() => setView('dashboard')} className="text-editorial-muted hover:text-editorial-text text-sm transition-colors cursor-pointer bg-transparent border-none p-0 text-left">Talento NYLA</button></li>
            </ul>
          </div>
          <div>
            <h4 className="text-[11px] uppercase tracking-[0.2em] font-bold text-editorial-text/40 border-b border-editorial-border pb-2 mb-4">Compañía</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-editorial-muted hover:text-editorial-text text-sm transition-colors">Nosotros</a></li>
              <li><a href="#" className="text-editorial-muted hover:text-editorial-text text-sm transition-colors">Contacto</a></li>
              <li><a href="#" className="text-editorial-muted hover:text-editorial-text text-sm transition-colors">Instagram</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-[11px] uppercase tracking-[0.2em] font-bold text-editorial-text/40 border-b border-editorial-border pb-2 mb-4">Legal</h4>
            <ul className="space-y-2 text-left">
              <li><a href="#" className="text-editorial-muted hover:text-editorial-text text-sm transition-colors">Política de Privacidad</a></li>
              <li><a href="#" className="text-editorial-muted hover:text-editorial-text text-sm transition-colors">Términos y Condiciones</a></li>
              <li><a href="#" className="text-editorial-muted hover:text-editorial-text text-sm transition-colors">Cookies</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-8 border-t border-editorial-border text-center md:text-left">
          <p className="text-xs text-editorial-muted/70">© 2026 NYLA. Empowering University Talent. Hecho con precisión académica.</p>
        </div>
      </footer>

      {/* Cookie Banner */}
      <AnimatePresence>
        {showCookies && (
          <motion.div 
            id="cookie-banner"
            initial={{ opacity: 0, y: 50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 50, x: '-50%' }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] md:w-auto max-w-xl bg-editorial-bg/95 backdrop-blur-md border border-editorial-border shadow-md rounded-[24px] p-6 z-[60] flex flex-col md:flex-row items-center gap-6 animate-none"
          >
            <div className="flex-1">
              <p className="text-sm text-editorial-text leading-normal">
                Utilizamos cookies para mejorar tu experiencia y analizar nuestro tráfico. Al continuar navegando, aceptas nuestro uso de cookies.
              </p>
            </div>
            <div className="flex gap-3 shrink-0">
              <button 
                onClick={() => setShowCookies(false)}
                className="px-4 py-2 text-editorial-muted font-bold text-xs hover:text-editorial-text uppercase tracking-[0.15em] transition-colors cursor-pointer bg-transparent border-none"
              >
                Configurar
              </button>
              <button 
                onClick={() => setShowCookies(false)}
                className="px-4 py-2 border border-editorial-border text-editorial-text font-bold text-xs rounded-full hover:bg-editorial-light uppercase tracking-[0.15em] transition-all cursor-pointer bg-transparent"
              >
                Rechazar
              </button>
              <button 
                onClick={() => setShowCookies(false)}
                className="px-6 py-2 bg-editorial-text text-editorial-bg font-bold text-xs rounded-full hover:bg-editorial-text/85 uppercase tracking-[0.15em] transition-all shadow-sm cursor-pointer border-none"
              >
                Aceptar
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* PERSISTENT FLOATING WHATSAPP BUSINESS */}
      <div className="fixed bottom-6 left-6 z-50">
        <a 
          href="https://wa.me/593983587234?text=Hola%20NYLA%2C%20quisiera%20saber%20m%C3%A1s%20sobre%20los%20servicios%20y%20garant%C3%ADa%20Escrow."
          target="_blank"
          rel="noopener noreferrer"
          className="w-14 h-14 bg-green-600 text-white rounded-full flex items-center justify-center shadow-md hover:scale-110 active:scale-95 transition-all cursor-pointer border-none relative hover:bg-green-700 flex"
          title="Escríbenos por WhatsApp"
        >
          <MessageSquare className="w-6 h-6" />
          <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-green-500 border-2 border-white"></span>
          </span>
        </a>

        <AnimatePresence>
          {false && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 50 }}
              className="absolute bottom-18 left-0 w-80 md:w-96 bg-[#ece5dd] rounded-[24px] shadow-lg border border-editorial-border flex flex-col overflow-hidden"
            >
              {/* WhatsApp Business Header */}
              <div className="bg-[#075e54] p-4 text-white flex justify-between items-center">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-white text-[#075e54] font-bold flex items-center justify-center font-serif">
                    NY
                  </div>
                  <div>
                    <div className="flex items-center gap-1">
                      <span className="font-bold text-xs">NYLA Business Soporte</span>
                      <span className="bg-blue-500 text-white rounded-full p-0.5 text-[6px] font-bold block shrink-0">✓</span>
                    </div>
                    <span className="text-[10px] text-white/80 block">Cuenta de Empresa Oficial</span>
                  </div>
                </div>
                <button 
                  onClick={() => setIsWhatsAppOpen(false)}
                  className="text-white/80 hover:text-white bg-transparent border-none cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Simulation triggers inside WhatsApp */}
              <div className="bg-white/95 border-b border-editorial-border/40 p-2.5 flex flex-col gap-1.5">
                <p className="text-[9px] font-bold text-editorial-muted uppercase tracking-wider">Simular alertas automáticas en este chat:</p>
                <div className="grid grid-cols-3 gap-1">
                  <button
                    type="button"
                    onClick={() => handleSimulateWhatsAppNotification('contract')}
                    className="py-1 bg-editorial-bg border border-editorial-border hover:bg-editorial-light text-[8px] font-bold uppercase tracking-wider rounded cursor-pointer"
                  >
                    1. Contrato
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSimulateWhatsAppNotification('escrow')}
                    className="py-1 bg-editorial-bg border border-editorial-border hover:bg-editorial-light text-[8px] font-bold uppercase tracking-wider rounded cursor-pointer"
                  >
                    2. Escrow
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSimulateWhatsAppNotification('payout')}
                    className="py-1 bg-editorial-bg border border-editorial-border hover:bg-editorial-light text-[8px] font-bold uppercase tracking-wider rounded cursor-pointer"
                  >
                    3. Pago ok
                  </button>
                </div>
              </div>

              {/* Message Box */}
              <div className="h-80 p-4 space-y-4 overflow-y-auto flex flex-col bg-repeat" style={{ backgroundImage: 'url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")', backgroundSize: 'contain' }}>
                {whatsAppMessages.map((msg, idx) => (
                  <div 
                    key={idx} 
                    className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`p-2.5 rounded-lg text-xs max-w-[85%] shadow-sm leading-relaxed ${
                      msg.sender === 'user' 
                        ? 'bg-[#dcf8c6] text-editorial-text rounded-tr-none' 
                        : msg.template 
                          ? 'bg-white border-l-4 border-green-600 text-editorial-text rounded-tl-none font-sans'
                          : 'bg-white text-editorial-text rounded-tl-none font-sans'
                    }`}>
                      <p className="whitespace-pre-line">{msg.text}</p>
                      <span className="text-[8px] text-editorial-muted float-right mt-1.5 font-sans block">{msg.time}</span>
                    </div>
                  </div>
                ))}
                
                {whatsAppTyping && (
                  <div className="flex justify-start">
                    <div className="bg-white p-2.5 rounded-lg rounded-tl-none text-xs text-editorial-muted flex gap-1 shadow-sm">
                      <span className="w-1.5 h-1.5 bg-[#075e54] rounded-full animate-bounce"></span>
                      <span className="w-1.5 h-1.5 bg-[#075e54] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                      <span className="w-1.5 h-1.5 bg-[#075e54] rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                    </div>
                  </div>
                )}
              </div>

              {/* Message Input Form */}
              <form onSubmit={handleWhatsAppSend} className="p-2.5 bg-[#f4f0eb] border-t border-editorial-border flex gap-2 items-center">
                <input 
                  type="text"
                  value={whatsAppInput}
                  onChange={(e) => setWhatsAppInput(e.target.value)}
                  placeholder="Escribe un mensaje a NYLA Bot..."
                  className="flex-1 bg-white border-none rounded-full py-2 px-4 text-xs focus:ring-1 focus:ring-[#075e54] text-editorial-text outline-none shadow-inner"
                />
                <button 
                  type="submit"
                  className="bg-[#075e54] text-white p-2 hover:opacity-90 rounded-full transition-all cursor-pointer border-none flex items-center justify-center shrink-0 w-8 h-8"
                >
                  <Send className="w-4 h-4 text-white" />
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

    </div>
  );
}
