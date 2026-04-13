import axios from 'axios';
import * as FileSystem from 'expo-file-system';
import { format } from 'date-fns';
import type { ParsedExpenseResponse } from '@/types';

const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY ?? '';
const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

// ── Helper de errores ─────────────────────────────────────────────────────────

function manejarErrorGemini(e: unknown): never {
  if (axios.isAxiosError(e)) {
    const status = e.response?.status;
    const mensaje = e.response?.data?.error?.message as string | undefined;
    if (status === 400) throw new Error('API key de Gemini inválida. Revisa tu archivo .env.');
    if (status === 429) throw new Error('Límite de Gemini alcanzado. Espera unos segundos e intenta de nuevo.');
    if (mensaje) throw new Error(`Gemini: ${mensaje}`);
  }
  throw e;
}

// ── Combinado en UNA sola llamada: Audio → Transcripción + Datos ──────────────
// Evita el rate limit que ocurría al hacer dos llamadas consecutivas.

export async function procesarAudioGasto(audioUri: string): Promise<{
  transcripcion: string;
  datos: ParsedExpenseResponse;
}> {
  const base64 = await FileSystem.readAsStringAsync(audioUri, {
    encoding: FileSystem.EncodingType.Base64,
  });

  const hoy = format(new Date(), 'yyyy-MM-dd');

  const prompt = `Escucha este audio de un gasto personal en español y devuelve un JSON con dos cosas:
1. La transcripción exacta de lo que se dijo.
2. Los datos del gasto extraídos del audio.

Reglas de extracción:
- tarjeta: nombre de la tarjeta mencionada (si no se menciona, usa "Efectivo")
- lugar: nombre del establecimiento (infiere del contexto si no se menciona)
- concepto: UNA de estas categorías exactas: Gasolina, Comida, Restaurante, Supermercado, Ropa, Entretenimiento, Salud, Farmacia, Transporte, Servicios, Educación, Hogar, Tecnología, Viajes, Deporte, Belleza, Mascotas, Regalos, Suscripciones, Otro
- monto: número sin símbolos de moneda
- fecha: formato YYYY-MM-DD (si no se menciona, usa ${hoy})

Devuelve ÚNICAMENTE este JSON válido:
{
  "transcripcion": "texto exacto del audio",
  "tarjeta": "nombre de la tarjeta",
  "lugar": "nombre del establecimiento",
  "concepto": "categoría",
  "monto": 0,
  "fecha": "YYYY-MM-DD"
}`;

  try {
    const response = await axios.post(
      `${GEMINI_URL}?key=${GEMINI_API_KEY}`,
      {
        contents: [{
          parts: [
            { text: prompt },
            { inlineData: { mimeType: 'audio/mp4', data: base64 } },
          ],
        }],
        generationConfig: {
          temperature: 0.1,
          responseMimeType: 'application/json',
        },
      },
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: 60000,
      }
    );

    const content = response.data.candidates[0].content.parts[0].text as string;
    const parsed = JSON.parse(content);

    return {
      transcripcion: parsed.transcripcion ?? '',
      datos: {
        tarjeta: parsed.tarjeta,
        lugar: parsed.lugar,
        concepto: parsed.concepto,
        monto: Number(parsed.monto),
        fecha: parsed.fecha,
      },
    };
  } catch (e) {
    manejarErrorGemini(e);
  }
}

// ── PDF: extrae todos los gastos de un estado de cuenta ──────────────────────

export async function procesarPDFGastos(base64: string): Promise<{
  gastos: Array<{ fecha: string; lugar: string; concepto: string; tarjeta: string; monto: number }>;
  totalEncontrados: number;
}> {
  const hoy = format(new Date(), 'yyyy-MM-dd');

  const prompt = `Analiza este estado de cuenta bancario en PDF y extrae TODOS los movimientos de cargo/gasto.
Ignora pagos, abonos, depósitos y devoluciones — solo incluye cargos o compras.

Para cada gasto devuelve:
- fecha: formato YYYY-MM-DD (si no hay año usa el año actual)
- lugar: nombre del comercio o establecimiento (tal como aparece, limpio y legible)
- concepto: UNA de estas categorías: Gasolina, Comida, Restaurante, Supermercado, Ropa, Entretenimiento, Salud, Farmacia, Transporte, Servicios, Educación, Hogar, Tecnología, Viajes, Deporte, Belleza, Mascotas, Regalos, Suscripciones, Otro
- tarjeta: nombre del banco o tarjeta si aparece en el documento, si no usa "Efectivo"
- monto: número positivo sin símbolos de moneda

Devuelve ÚNICAMENTE este JSON válido (sin texto adicional):
{
  "gastos": [
    { "fecha": "YYYY-MM-DD", "lugar": "nombre", "concepto": "categoria", "tarjeta": "banco", "monto": 0 }
  ]
}

Fecha de referencia si necesitas inferir el año: ${hoy}`;

  try {
    const response = await axios.post(
      `${GEMINI_URL}?key=${GEMINI_API_KEY}`,
      {
        contents: [{
          parts: [
            { text: prompt },
            { inlineData: { mimeType: 'application/pdf', data: base64 } },
          ],
        }],
        generationConfig: {
          temperature: 0.1,
          responseMimeType: 'application/json',
        },
      },
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: 120000,
      }
    );

    const content = response.data.candidates[0].content.parts[0].text as string;
    const parsed = JSON.parse(content);
    const gastos = Array.isArray(parsed.gastos) ? parsed.gastos : [];

    return {
      gastos: gastos.map((g: Record<string, unknown>) => ({
        fecha: String(g.fecha ?? hoy),
        lugar: String(g.lugar ?? 'Sin lugar').toUpperCase(),
        concepto: String(g.concepto ?? 'Otro').toUpperCase(),
        tarjeta: String(g.tarjeta ?? 'Efectivo').toUpperCase(),
        monto: Number(g.monto ?? 0),
      })).filter((g: { monto: number }) => g.monto > 0),
      totalEncontrados: gastos.length,
    };
  } catch (e) {
    manejarErrorGemini(e);
  }
}

// ── Funciones individuales (mantenidas por compatibilidad) ────────────────────

export async function transcribirAudio(audioUri: string): Promise<string> {
  const { transcripcion } = await procesarAudioGasto(audioUri);
  return transcripcion;
}

export async function parsearGasto(transcripcion: string): Promise<ParsedExpenseResponse> {
  const hoy = format(new Date(), 'yyyy-MM-dd');

  const prompt = `Eres un asistente experto en finanzas personales. Analiza el siguiente texto y extrae la información del gasto.

Texto: "${transcripcion}"

Reglas:
- Si no se menciona tarjeta, usa "Efectivo"
- Si no se menciona lugar, infiere uno del contexto
- Normaliza el concepto a una categoría: Gasolina, Comida, Restaurante, Supermercado, Ropa, Entretenimiento, Salud, Farmacia, Transporte, Servicios, Educación, Hogar, Tecnología, Viajes, Deporte, Belleza, Mascotas, Regalos, Suscripciones u Otro
- Si no se menciona fecha, usa ${hoy}
- El monto debe ser un número (sin símbolos de moneda)

Devuelve ÚNICAMENTE un objeto JSON válido con este formato exacto:
{
  "tarjeta": "nombre de la tarjeta",
  "lugar": "nombre del establecimiento",
  "concepto": "categoría del gasto",
  "monto": 0,
  "fecha": "YYYY-MM-DD"
}`;

  try {
    const response = await axios.post(
      `${GEMINI_URL}?key=${GEMINI_API_KEY}`,
      {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.1,
          responseMimeType: 'application/json',
        },
      },
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: 30000,
      }
    );

    const content = response.data.candidates[0].content.parts[0].text as string;
    return JSON.parse(content) as ParsedExpenseResponse;
  } catch (e) {
    manejarErrorGemini(e);
  }
}
