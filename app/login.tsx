import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  Image,
  ImageBackground,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri } from 'expo-auth-session';
import { supabase } from '@/services/supabase';
import { themeClaro as C } from '@/constants/themes';

WebBrowser.maybeCompleteAuthSession();

const redirectUri = makeRedirectUri({ path: 'auth/callback' });

type Modo = 'inicio' | 'login' | 'registro';

export default function LoginScreen() {
  const [modo, setModo] = useState<Modo>('inicio');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [cargando, setCargando] = useState(false);
  const [googleCargando, setGoogleCargando] = useState(false);

  // ── Google OAuth ─────────────────────────────────────────────────────────
  const iniciarConGoogle = async () => {
    try {
      setGoogleCargando(true);
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUri,
          skipBrowserRedirect: true,
          queryParams: { access_type: 'offline', prompt: 'consent' },
        },
      });
      if (error) throw error;
      if (!data.url) throw new Error('No se pudo obtener la URL de autenticación.');

      const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUri);
      if (result.type === 'cancel') return;

      if (result.type === 'success') {
        const { url } = result;
        const codeMatch = url.match(/[?&]code=([^&#]+)/);
        if (codeMatch?.[1]) {
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(codeMatch[1]);
          if (exchangeError) throw exchangeError;
          return;
        }
        const hashMatch = url.match(/#(.*)/);
        if (hashMatch) {
          const hashParams = new URLSearchParams(hashMatch[1]);
          const accessToken = hashParams.get('access_token');
          const refreshToken = hashParams.get('refresh_token');
          if (accessToken && refreshToken) {
            const { error: setError } = await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
            if (setError) throw setError;
            return;
          }
        }
        throw new Error('No se pudo extraer la sesión de la respuesta de Google.');
      }
    } catch (e) {
      Alert.alert('Error con Google', (e as Error).message);
    } finally {
      setGoogleCargando(false);
    }
  };

  // ── Email + contraseña ────────────────────────────────────────────────────
  const iniciarSesion = async () => {
    if (!email || !password) { Alert.alert('Campos incompletos', 'Ingresa tu email y contraseña.'); return; }
    setCargando(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
    } catch (e) {
      Alert.alert('Error al iniciar sesión', (e as Error).message);
    } finally {
      setCargando(false);
    }
  };

  const crearCuenta = async () => {
    if (!email || !password) { Alert.alert('Campos incompletos', 'Ingresa tu email y contraseña.'); return; }
    if (password.length < 6) { Alert.alert('Contraseña muy corta', 'Debe tener al menos 6 caracteres.'); return; }
    setCargando(true);
    try {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;
      Alert.alert('✅ Cuenta creada', 'Revisa tu correo para confirmar tu cuenta y luego inicia sesión.',
        [{ text: 'OK', onPress: () => setModo('login') }]);
    } catch (e) {
      Alert.alert('Error al crear cuenta', (e as Error).message);
    } finally {
      setCargando(false);
    }
  };

  // ── UI ────────────────────────────────────────────────────────────────────
  return (
    <ImageBackground
      source={require('@/assets/images/splash.png')}
      style={styles.bg}
      resizeMode="cover"
    >
      {/* Overlay semitransparente claro para legibilidad */}
      <View style={styles.overlay} />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <StatusBar style="dark" />
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Logo */}
          <View style={styles.logoArea}>
            <Image
              source={require('@/assets/images/icon.png')}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.appNombre}>DashVoice</Text>
            <Text style={styles.appSlogan}>Controla tus finanzas con inteligencia</Text>
          </View>

          {/* Pantalla principal */}
          {modo === 'inicio' && (
            <View style={styles.card}>
              <Text style={styles.cardTitulo}>Bienvenido</Text>

              <TouchableOpacity style={styles.btnGoogle} onPress={iniciarConGoogle} disabled={googleCargando}>
                {googleCargando ? <ActivityIndicator color={C.text} /> : (
                  <><Text style={styles.googleLogo}>G</Text><Text style={styles.btnGoogleTexto}>Continuar con Google</Text></>
                )}
              </TouchableOpacity>

              <View style={styles.separador}>
                <View style={styles.separadorLinea} />
                <Text style={styles.separadorTexto}>o</Text>
                <View style={styles.separadorLinea} />
              </View>

              <TouchableOpacity style={styles.btnSecundario} onPress={() => setModo('login')}>
                <Text style={styles.btnSecundarioTexto}>Iniciar sesión con email</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => setModo('registro')}>
                <Text style={styles.linkTexto}>¿No tienes cuenta? Crear cuenta</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Login con email */}
          {modo === 'login' && (
            <View style={styles.card}>
              <Text style={styles.cardTitulo}>Iniciar sesión</Text>
              <Campo label="Email" valor={email} onCambiar={setEmail} teclado="email-address" placeholder="tu@email.com" autoCapitalize="none" />
              <Campo label="Contraseña" valor={password} onCambiar={setPassword} placeholder="••••••••" segura />

              <TouchableOpacity style={[styles.btnPrimario, cargando && { opacity: 0.6 }]} onPress={iniciarSesion} disabled={cargando}>
                {cargando ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnPrimarioTexto}>Iniciar sesión</Text>}
              </TouchableOpacity>

              <View style={styles.separador}>
                <View style={styles.separadorLinea} />
                <Text style={styles.separadorTexto}>o</Text>
                <View style={styles.separadorLinea} />
              </View>

              <TouchableOpacity style={styles.btnGoogle} onPress={iniciarConGoogle} disabled={googleCargando}>
                {googleCargando ? <ActivityIndicator color={C.text} /> : (
                  <><Text style={styles.googleLogo}>G</Text><Text style={styles.btnGoogleTexto}>Continuar con Google</Text></>
                )}
              </TouchableOpacity>

              <TouchableOpacity onPress={() => setModo('inicio')}>
                <Text style={styles.linkTexto}>← Volver</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Registro */}
          {modo === 'registro' && (
            <View style={styles.card}>
              <Text style={styles.cardTitulo}>Crear cuenta</Text>
              <Campo label="Email" valor={email} onCambiar={setEmail} teclado="email-address" placeholder="tu@email.com" autoCapitalize="none" />
              <Campo label="Contraseña" valor={password} onCambiar={setPassword} placeholder="Mínimo 6 caracteres" segura />

              <TouchableOpacity style={[styles.btnPrimario, cargando && { opacity: 0.6 }]} onPress={crearCuenta} disabled={cargando}>
                {cargando ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnPrimarioTexto}>Crear cuenta</Text>}
              </TouchableOpacity>

              <View style={styles.separador}>
                <View style={styles.separadorLinea} />
                <Text style={styles.separadorTexto}>o</Text>
                <View style={styles.separadorLinea} />
              </View>

              <TouchableOpacity style={styles.btnGoogle} onPress={iniciarConGoogle} disabled={googleCargando}>
                {googleCargando ? <ActivityIndicator color={C.text} /> : (
                  <><Text style={styles.googleLogo}>G</Text><Text style={styles.btnGoogleTexto}>Continuar con Google</Text></>
                )}
              </TouchableOpacity>

              <TouchableOpacity onPress={() => setModo('inicio')}>
                <Text style={styles.linkTexto}>← Volver</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

function Campo({
  label, valor, onCambiar, teclado = 'default', placeholder, segura, autoCapitalize,
}: {
  label: string; valor: string; onCambiar: (v: string) => void;
  teclado?: any; placeholder?: string; segura?: boolean;
  autoCapitalize?: 'none' | 'sentences';
}) {
  return (
    <View style={styles.campo}>
      <Text style={styles.campoLabel}>{label}</Text>
      <TextInput
        style={styles.campoInput}
        value={valor}
        onChangeText={(t) => onCambiar(t.normalize('NFD').replace(/[\u0300-\u036f]/g, ''))}
        keyboardType={teclado}
        placeholder={placeholder}
        placeholderTextColor={C.textMuted}
        secureTextEntry={segura}
        autoCapitalize={autoCapitalize ?? 'sentences'}
        selectionColor={C.primary}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(242,242,247,0.82)',
  },
  flex: { flex: 1 },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
    gap: 28,
  },
  logoArea: {
    alignItems: 'center',
    gap: 10,
  },
  logo: {
    width: 96,
    height: 96,
    borderRadius: 22,
  },
  appNombre: {
    color: C.text,
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  appSlogan: {
    color: C.textMuted,
    fontSize: 14,
    textAlign: 'center',
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 20,
    padding: 24,
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 6,
  },
  cardTitulo: {
    color: C.text,
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 4,
  },
  btnGoogle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: C.border,
  },
  googleLogo: {
    fontSize: 18,
    fontWeight: '700',
    color: '#4285F4',
  },
  btnGoogleTexto: {
    color: C.text,
    fontSize: 15,
    fontWeight: '600',
  },
  separador: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  separadorLinea: {
    flex: 1,
    height: 1,
    backgroundColor: C.border,
  },
  separadorTexto: {
    color: C.textMuted,
    fontSize: 13,
  },
  btnPrimario: {
    backgroundColor: C.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  btnPrimarioTexto: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  btnSecundario: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: C.border,
  },
  btnSecundarioTexto: {
    color: C.text,
    fontSize: 15,
    fontWeight: '600',
  },
  linkTexto: {
    color: C.primary,
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: 4,
  },
  campo: { gap: 6 },
  campoLabel: {
    color: C.textSecondary,
    fontSize: 12,
    fontWeight: '500',
  },
  campoInput: {
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: C.text,
    fontSize: 15,
    borderWidth: 1,
    borderColor: C.border,
  },
});
