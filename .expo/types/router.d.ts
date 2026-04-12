/* eslint-disable */
import * as Router from 'expo-router';

export * from 'expo-router';

declare module 'expo-router' {
  export namespace ExpoRouter {
    export interface __routes<T extends string = string> extends Record<string, unknown> {
      StaticRoutes: `/` | `/(tabs)` | `/(tabs)/` | `/(tabs)/configuracion` | `/(tabs)/gastos` | `/(tabs)/importar` | `/(tabs)/voz` | `/_sitemap` | `/configuracion` | `/gastos` | `/importar` | `/login` | `/voz`;
      DynamicRoutes: never;
      DynamicRouteTemplate: never;
    }
  }
}
