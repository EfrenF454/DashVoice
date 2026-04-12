import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { obtenerPresupuesto } from './supabase';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function solicitarPermisosNotificaciones(): Promise<boolean> {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  return finalStatus === 'granted';
}

export async function verificarPresupuesto(gastoMesActual: number): Promise<void> {
  const presupuesto = await obtenerPresupuesto();
  const porcentaje = (gastoMesActual / presupuesto) * 100;

  if (porcentaje >= 100) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Presupuesto excedido',
        body: `Has superado tu presupuesto mensual de $${presupuesto.toLocaleString('es-MX')}`,
        data: { tipo: 'presupuesto_excedido' },
      },
      trigger: null,
    });
  } else if (porcentaje >= 80) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Alerta de presupuesto',
        body: `Has usado el ${Math.round(porcentaje)}% de tu presupuesto mensual`,
        data: { tipo: 'presupuesto_alerta' },
      },
      trigger: null,
    });
  }
}

export async function notificarGastoRegistrado(lugar: string, monto: number): Promise<void> {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Gasto registrado',
      body: `$${monto.toLocaleString('es-MX')} en ${lugar}`,
      data: { tipo: 'gasto_registrado' },
    },
    trigger: null,
  });
}
