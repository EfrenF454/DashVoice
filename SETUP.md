# App Gastos — Guía de configuración

## Requisitos previos

- Node.js 18+
- Expo CLI: `npm install -g expo-cli`
- Cuenta en [Supabase](https://supabase.com) (gratis)
- Cuenta en [OpenAI](https://platform.openai.com) (de pago, ~$0.006/minuto de audio)
- Expo Go en tu celular, o Android Studio / Xcode para emuladores

---

## 1. Instalar dependencias

```bash
cd app_gastos
npm install
```

---

## 2. Configurar Supabase

1. Crea un proyecto nuevo en [supabase.com](https://supabase.com)
2. Ve a **SQL Editor** y ejecuta el contenido de `supabase/schema.sql`
3. En **Project Settings → API**, copia:
   - Project URL
   - `anon` public key

---

## 3. Configurar variables de entorno

```bash
cp .env.example .env
```

Edita `.env` con tus credenciales:

```env
EXPO_PUBLIC_OPENAI_API_KEY=sk-proj-...
EXPO_PUBLIC_SUPABASE_URL=https://xxxxxxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 4. Agregar assets requeridos

Coloca los siguientes archivos en `assets/images/`:
- `icon.png` (1024×1024 px)
- `splash.png` (1242×2436 px)
- `adaptive-icon.png` (1024×1024 px, fondo transparente)
- `favicon.png` (48×48 px)

Para pruebas rápidas puedes usar imágenes placeholder de cualquier color.

---

## 5. Ejecutar la app

```bash
# Modo de desarrollo (escanea el QR con Expo Go)
npx expo start

# Android
npx expo run:android

# iOS
npx expo run:ios
```

---

## Arquitectura

```
app_gastos/
├── app/                    # Expo Router (pantallas)
│   └── (tabs)/
│       ├── index.tsx       # Dashboard con gráficas
│       ├── voz.tsx         # Registro por voz
│       ├── gastos.tsx      # Tabla de gastos + filtros
│       └── configuracion.tsx
├── components/
│   ├── charts/             # Gráficas SVG personalizadas
│   ├── VoiceRecorder.tsx
│   ├── ExpenseTable.tsx
│   ├── ExpenseConfirmModal.tsx
│   └── FilterModal.tsx
├── services/
│   ├── openai.ts           # Whisper + GPT-4o
│   ├── supabase.ts         # CRUD de gastos
│   └── notificaciones.ts
├── store/
│   └── expenseStore.ts     # Estado global (Zustand)
├── hooks/
│   └── useVoiceRecording.ts
└── supabase/
    └── schema.sql          # Tabla + RLS + índices
```

## Flujo de voz

```
Micrófono → expo-av → .m4a → OpenAI Whisper → Texto
                                                  ↓
                                           GPT-4o mini
                                                  ↓
                                       JSON estructurado
                                    {tarjeta, lugar, concepto, monto, fecha}
                                                  ↓
                                      Modal de confirmación
                                                  ↓
                                           Supabase DB
```

## Costos estimados de API

| Servicio | Costo |
|---|---|
| Whisper (transcripción) | ~$0.006 USD/min |
| GPT-4o mini (parsing) | ~$0.0002 USD/llamada |
| Supabase | Gratis hasta 500MB |

Para 30 gastos/mes ≈ **$0.20 USD/mes** en APIs.
