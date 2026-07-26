import express from "express";
import path from "path";
import dns from "dns";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";
import authRouter from "./src/server/routes/auth";
import profileRouter from "./src/server/routes/profile";
import statsRouter from "./src/server/routes/stats";
import projectsRouter from "./src/server/routes/projects";
import paymentsRouter from "./src/server/routes/payments";
import messagesRouter from "./src/server/routes/messages";
import studentsRouter from "./src/server/routes/students";
import adminRouter from "./src/server/routes/admin";

// Load environment variables
dotenv.config();

// Some cloud hosts (e.g. Render) advertise broken/unreachable IPv6 routes. Node's default
// DNS resolution can pick that IPv6 address first for outbound HTTPS calls (like the Stripe
// SDK), causing "connection error, request was retried" failures that don't happen locally.
// Preferring IPv4 first avoids that.
dns.setDefaultResultOrder("ipv4first");

// Safety net: an unhandled promise rejection in an async Express 4 route handler
// (e.g. an unexpected error from Prisma or the Stripe SDK) would otherwise crash the
// whole process and take down every in-flight request. Log it and keep serving instead.
process.on("unhandledRejection", (reason) => {
  console.error("Unhandled promise rejection:", reason);
});

const app = express();
const PORT = 3000;

// Raised from the 100kb default so profile photo/logo/deliverable uploads (sent as base64 data URLs) fit.
app.use(express.json({ limit: "15mb" }));
app.use(cookieParser());

app.use("/api/auth", authRouter);
app.use("/api/profile", profileRouter);
app.use("/api/stats", statsRouter);
app.use("/api/projects", projectsRouter);
app.use("/api/payments", paymentsRouter);
app.use("/api/messages", messagesRouter);
app.use("/api/students", studentsRouter);
app.use("/api/admin", adminRouter);

// Helper for lazy loading Google GenAI
let aiClient: GoogleGenAI | null = null;
function getAIClient() {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
      console.warn("WARNING: GEMINI_API_KEY is not configured or uses the placeholder value.");
      return null;
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// API: Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// API: NYLA AI Guide chat assistant
app.post("/api/chat", async (req, res) => {
  try {
    const { messages } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Se requiere un array de mensajes." });
    }

    const client = getAIClient();
    
    // System instructions to shape NYLA AI Guide behavior
    const systemInstruction = `
Eres NYLA AI Guide, el asistente virtual de soporte y orientación de la plataforma NYLA ("Navega las metas de tu vida"), que conecta emprendedores con estudiantes universitarios mediante un sistema de match para proyectos freelance reales (no pasantías).
Mantén siempre un tono profesional, cercano y estructurado en español.

Debes poder responder con precisión estas preguntas frecuentes:
- Cómo registrarse: hay dos tipos de cuenta (Estudiante y Emprendedor). Se crean desde "Registrarse", eligiendo el rol, completando correo y contraseña, y los datos básicos del perfil (para estudiantes: nombre, universidad, carrera; para emprendedores: nombre del emprendimiento y categoría). Luego se puede completar el resto del perfil desde "Mi Perfil".
- Cómo funciona la plataforma: el emprendedor publica una oportunidad describiendo lo que necesita; el sistema de match analiza carrera, habilidades, experiencia y disponibilidad para sugerir los estudiantes más compatibles; el emprendedor contrata, se firma un contrato digital y el pago queda retenido en garantía (Escrow) hasta aprobar la entrega.
- Métodos de pago: los pagos se gestionan dentro de la plataforma mediante la pasarela de NYLA (tarjeta de crédito/débito y otros métodos habilitados). El dinero del emprendedor queda retenido en Escrow y se libera al estudiante solo cuando se aprueba el trabajo entregado.
- Tarifas: NYLA ofrece 3 planes mensuales de gestión de redes sociales. Cada plan define cuántas horas al mes dedica el estudiante y qué contenido incluye. NYLA cobra siempre una comisión fija de $10.57 USD (no un porcentaje); el resto del PVP mensual es el pago fijo del estudiante ($5.00 USD/hora). Los planes son: Básico (10h/mes, 2 videos + 2 publicaciones, PVP $60.57, estudiante recibe $50.00), Intermedio (20h/mes, 4 videos + 2 historias + 2 publicaciones, PVP $110.57, estudiante recibe $100.00) y Avanzado (30h/mes, 6 videos + 2 historias + 4 publicaciones + calendario del mes, PVP $160.57, estudiante recibe $150.00).
- Uso del sistema: desde el Dashboard se ven proyectos recomendados, postulaciones y contratos activos; desde "Proyectos" se exploran y aplican oportunidades; desde "Mensajes" se chatea con la contraparte; desde "Mi Perfil" se edita la información propia.
- Soporte básico: si el usuario tiene un problema que no puedes resolver, indícale que puede escribir por el botón de WhatsApp Business visible en la plataforma.

Si te piden redactar un contrato o acuerdo, genera un desglose formal con secciones claras como: Partes, Servicio, Monto, Plazo y Entregables, usando la tarifa fija de $5.00/hora para el estudiante y la comisión fija de $10.57 de NYLA cuando corresponda.
`;

    if (!client) {
      // Elegant fallback response when API key is not configured so the app is still testable and informative
      const lastUserMsg = messages[messages.length - 1]?.content || "";
      console.log("No API key configured. Generating a smart local simulated response for:", lastUserMsg);

      let reply = "";
      const lower = lastUserMsg.toLowerCase();
      if (lower.includes("registr")) {
        reply = "Para registrarte, ve a **Registrarse** en la portada, elige si eres **Estudiante** o **Emprendedor**, y completa tu correo, contraseña y los datos básicos de tu perfil. Luego podrás ampliar tu perfil desde \"Mi Perfil\".";
      } else if (lower.includes("tarifa") || lower.includes("cuánto cobra") || lower.includes("precio") || lower.includes("comisión") || lower.includes("comision")) {
        reply = "NYLA ofrece 3 planes mensuales: **Básico** (10h/mes, 2 videos + 2 publicaciones, $60.57), **Intermedio** (20h/mes, 4 videos + 2 historias + 2 publicaciones, $110.57) y **Avanzado** (30h/mes, 6 videos + 2 historias + 4 publicaciones + calendario del mes, $160.57). En todos los planes, la comisión fija de NYLA es **$10.57 USD** y el resto es el pago del estudiante, a $5.00 USD/hora.";
      } else if (lower.includes("pago") || lower.includes("escrow") || lower.includes("garant")) {
        reply = "Los pagos se hacen dentro de la plataforma: el emprendedor deposita el monto del contrato y NYLA lo retiene en garantía (**Escrow**). El dinero se libera al estudiante automáticamente una vez que el emprendedor aprueba la entrega.";
      } else if (lower.includes("funciona") || lower.includes("match")) {
        reply = "El emprendedor publica lo que necesita, nuestro sistema de match compara carrera, habilidades, experiencia y disponibilidad de los estudiantes, y sugiere a los más compatibles. El emprendedor contrata, se firma un contrato digital y el pago queda en garantía hasta la entrega.";
      } else if (lower.includes("soporte") || lower.includes("ayuda") || lower.includes("whatsapp")) {
        reply = "Puedes escribirnos directamente por el botón de **WhatsApp Business** visible en la plataforma y te ayudaremos de inmediato.";
      } else if (lower.includes("contrato") || lower.includes("desarrollador") || lower.includes("genera")) {
        reply = `### Contrato de Colaboración Digital #294\n\n**Partes:** NYLA Corp & Estudiante  \n**Servicio:** Desarrollo Frontend React  \n**Monto:** $30.57 USD (paquete Intermedio: 4 horas × $5.00/hora + comisión fija NYLA $10.57)  \n**Plazo:** 28 Días Naturales  \n\nHe generado esta propuesta estándar. En un entorno real con la API Key de Gemini activa, puedo redactar contratos totalmente personalizados con cláusulas legales específicas. ¿Te gustaría ajustar el presupuesto o el plazo de entrega?`;
      } else if (lower.includes("hola") || lower.includes("saludos")) {
        reply = "¡Hola! Soy **NYLA AI Guide**. Puedo ayudarte con el registro, cómo funciona el match, métodos de pago, tarifas, uso del sistema o redactar un contrato de ejemplo. *(Nota: la clave de Gemini no está activa, así que respondo en modo simulado local, pero todas las pantallas y flujos son funcionales.)* ¿En qué te ayudo?";
      } else {
        reply = `He recibido tu mensaje: "${lastUserMsg}". Puedo ayudarte con el registro, cómo funciona la plataforma, métodos de pago, tarifas o soporte básico. ¿Sobre cuál te gustaría saber más?`;
      }
      return res.json({ text: reply });
    }

    // Format chat history for the modern SDK: we map our generic messages to Gemini content format.
    // The contents can be a flat string, or list of content objects.
    // For general chat history, we can translate { role: "user" | "assistant", content: string }
    // to { role: "user" | "model", parts: [{ text: string }] }
    const formattedContents = messages.map(msg => {
      // Map 'assistant' or 'model' to 'model', and 'user' to 'user'
      const role = msg.role === "assistant" || msg.role === "model" ? "model" : "user";
      return {
        role: role,
        parts: [{ text: msg.content }]
      };
    });

    const response = await client.models.generateContent({
      model: "gemini-3.6-flash",
      contents: formattedContents,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
      }
    });

    res.json({ text: response.text });
  } catch (error: any) {
    console.error("Error calling Gemini API:", error);
    res.status(500).json({ 
      error: "Error interno del servidor al procesar la solicitud de IA.",
      details: error.message 
    });
  }
});

// Setup Vite or Static assets serving
async function bootstrap() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

bootstrap();
