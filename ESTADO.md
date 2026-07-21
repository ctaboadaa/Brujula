# ESTADO — Brújula
Última actualización: 2026-07-21 | 🎉 App publicada y funcionando en https://ctaboadaa.github.io/Brujula/

## Qué es esta app (3 líneas máximo)
Herramienta personal (NO se vende) para que el usuario lleve el control de sus ingresos y gastos, vea el balance de su patrimonio neto (activos - pasivos) y monitoree sus inversiones con precios de mercado actualizados automáticamente. Un solo usuario, uso privado.

## Promesa central
"Brújula te ayuda a ver tu camino real hacia la libertad financiera, mostrándote en un solo lugar cuánto ganas, cuánto gastas, y cuánto vale realmente lo que tienes — sin hojas de cálculo sueltas ni apps bancarias que no se hablan entre sí."

## Referencias (Sesión 1)
- Empower/Personal Capital: "patrimonio neto" consolidado en un solo número claro
- Monarch Money: dashboards visuales de tendencia de patrimonio en el tiempo
- YNAB: disciplina de categorización de gastos

## Dirección de Arte (Sesión 1 — NO cambiar sin justificación)
- Arquetipo: Explorador (con toque Sabio) — rompe a propósito el azul/verde corporativo típico de fintech (Empower/Monarch); mundo del sujeto: cartografía/instrumentos de navegación
- Modo: CLARO, tipo papel de mapa envejecido (decisión deliberada, distinto al fintech oscuro típico)
- Fondo base: #F6F1E4 | Superficie elevada: #EFE6D2 / #E8DCC4
- Texto: #2B2417 (principal) / #6B5D45 (secundario)
- Acento primario: #1F3A5F (azul tinta marino — SOLO en CTA/navegación)
- Acento secundario: #B8863B (dorado latón — hitos/hover sutil)
- Semánticos: Éxito #3E7A54 · Error/gasto #A8432E · Advertencia #C08A2E
- Tipografía: Display "Newsreader" | Cuerpo "Karla" | Cifras/metadatos "IBM Plex Mono"
- Radio de bordes: más rectos (documento/mapa) — control 8px, card 12px
- Personalidad: clara · orientadora · decidida
- Dispositivo ownable: textura de curvas de nivel muy sutil en el fondo (`.bg-topo`) + rosa de los vientos (`CompassRose.tsx`) + cifras en monoespaciada como "lectura de instrumento"
- Motion: números héroe con conteo animado (`useCountUp`, easing cúbico, respeta `prefers-reduced-motion` y pestaña oculta)

## Decisiones técnicas (NO re-discutir sin pedirlo el usuario)
- Framework: Vite + React + TypeScript + Tailwind v4 — herramienta interna sin SEO, sigue el patrón de CajaBella
- Backend: Supabase (proyecto "Brujula", id `ucjuyujfwrapcojropzb`, org "The Owl Group") — Postgres real con RLS (a diferencia de CajaBella que usa Apps Script/Sheets) porque hay más cálculo financiero e historial
- Hosting: GitHub Pages (gratis), despliegue automático vía GitHub Actions (`.github/workflows/deploy.yml`) — publicada y verificada en https://ctaboadaa.github.io/Brujula/
- Repo remoto: https://github.com/ctaboadaa/Brujula (rama `main`, deploy en cada push)
- Single-user: solo el dueño usa la app, pero con RLS por `auth.uid()` en todas las tablas (buena práctica, deja la puerta abierta a futuro)
- Moneda: Soles (PEN) únicamente. Las inversiones cotizan en USD y se convierten a PEN con el tipo de cambio real (ver abajo)
- Idioma UI: español, mono-idioma
- Nombre app: Brújula (confirmado)
- Repo local: `C:\Users\charly\Documents\Projectos\Claude\LibertadFinanciera` (carpeta separada de App1/TuChamba y de CajaBella)
- Dev server local: nombre `brujula-dev` en `App1/.claude/launch.json`, puerto 3002, base `/Brujula/` (coincide con el nombre del repo)
- Las variables `VITE_SUPABASE_URL`/`VITE_SUPABASE_PUBLISHABLE_KEY` están hardcodeadas en `deploy.yml` (no son secretas — la clave "publishable" está diseñada para ser pública; la protección real es RLS en la base de datos)

## Método de autenticación (Sesión 1 — decidido)
- Correo + contraseña vía Supabase Auth (elegido por el usuario, simple para uso personal)
- Verificación de email obligatoria (comportamiento por defecto de Supabase, ya activo)
- Mensajes de error genéricos (anti-enumeración): "Credenciales inválidas" en vez de decir si el correo existe
- ⚠️ Limitación aceptada: al ser una SPA estática (Vite, sin servidor propio), Supabase guarda la sesión en `localStorage`, no en cookies httpOnly — única opción viable sin agregar un backend completo (innecesario para una app interna). Mitigante: cero `dangerouslySetInnerHTML`/`eval` en el código, minimizando el riesgo de robo de token por XSS.
- Probado end-to-end contra el proyecto real dos veces (registro, confirmación manual, login, uso completo); cuentas de prueba borradas al terminar.

## Modelo de datos (aplicado, 0 alertas de seguridad en advisors)
- `categories`, `transactions` (ingresos/gastos), `assets`, `liabilities`, `investments`, `net_worth_snapshots` — todas con RLS `(select auth.uid()) = user_id` + `user_id default auth.uid()`, FKs indexadas
- `price_cache`: caché compartida de precios (symbol+type), solo lectura para el cliente — la escribe únicamente la Edge Function con `service_role`

## Módulo de inversiones con precios automáticos (Sesión 1 — construido)
- Edge Function `get-prices` (Supabase Functions, `verify_jwt=false` a nivel de plataforma pero **valida el JWT manualmente en el código** — necesario para que el preflight CORS/OPTIONS no sea rechazado con 401)
- Fuentes de precio SIN necesidad de cuenta/clave (decisión del usuario): **Yahoo Finance** (chart API) para acciones/ETF/fondos y tipo de cambio USD/PEN, **Binance** (ticker price) para cripto
- Caché de 4 horas en `price_cache` para no golpear las APIs externas en cada carga
- Probado end-to-end con datos reales: AAPL a US$326.59, convertido correctamente a soles con el tipo de cambio real
- Nota técnica: se intentó primero con Stooq (acciones) y Frankfurter (tipo de cambio) pero ambos fallaron desde el entorno (Stooq bloquea/cambió su endpoint CSV, Frankfurter con dominio incorrecto) — se resolvió migrando a Yahoo Finance + Binance, ambos verificados funcionando

## Sesiones completadas ✅
- Sesión 1 — Completa de punta a punta: Supabase + esquema con RLS · auth funcionando · identidad visual (Explorador/cartografía) · las 4 pantallas (Resumen, Movimientos, Patrimonio, Inversiones) construidas y probadas contra el backend real · precios automáticos de inversiones funcionando · animaciones baseline (stagger, conteo animado, barras, tap feedback, bottom sheets) · `npm audit` 0 vulnerabilidades · 0 alertas de seguridad en Supabase advisors · publicada en GitHub Pages con deploy automático — 2026-07-21
  - 🐛 Corregido durante pruebas: al crear una categoría nueva al vuelo en el formulario de movimientos, la transacción no quedaba vinculada a ella (`useCategories.addCategory` no devolvía el id creado) — corregido y verificado.
  - 🐛 Corregido en el deploy: la Edge Function `get-prices` rechazaba el preflight CORS (OPTIONS) con 401 porque `verify_jwt` estaba en `true` a nivel de plataforma — se cambió a `false` y se agregó verificación manual del JWT dentro del código (misma seguridad, sin romper CORS).
  - 🐛 Corregido tras el primer registro real del usuario: (1) el link de confirmación de correo apuntaba a `localhost:3000` en vez de a la app publicada — el usuario ajustó "Site URL"/"Redirect URLs" en el dashboard de Supabase (Authentication → URL Configuration) a `https://ctaboadaa.github.io/Brujula/`; (2) recargar una ruta interna (ej. `/transacciones`) daba 404 en GitHub Pages — se agregó `cp dist/index.html dist/404.html` en `deploy.yml` (GitHub Pages no conoce las rutas de React Router; servir el mismo `index.html` como 404 hace que la app cargue y React Router resuelva la ruta correcta).
  - 🎨 A pedido del usuario: se agregó un búho pequeño y sutil (`Owl.tsx`, mismo estilo de línea que la brújula) en la esquina de la tarjeta de login.
- Gráfico de tendencia de patrimonio neto — a pedido del usuario, 2026-07-21: card "Tendencia de tu patrimonio" en Resumen (`NetWorthTrend.tsx`, Recharts), tabs 7 días/6 meses, insight de cambio (monto y %), tabla accesible oculta (`sr-only`) con los mismos datos, estado "todavía no hay historial" si hay <2 fotos. `useNetWorthHistory` registra una foto diaria en `net_worth_snapshots` (upsert por fecha) cada vez que se abre Resumen. Probado con datos históricos de prueba insertados por SQL (usuario y datos de prueba borrados al terminar).

## Próximas sesiones 📋
- A futuro, si el usuario lo pide: filtros/paginación en Movimientos si la lista crece mucho, celebración visual al alcanzar hitos reales de patrimonio
- Advisor de seguridad (no bloqueante): Supabase sugiere activar "Leaked Password Protection" (revisa contraseñas contra HaveIBeenPwned) — toggle en el dashboard, pendiente de que el usuario decida si lo activa

## Problemas conocidos ⚠️
- Ninguno bloqueante. El chunk de JS de producción pesa ~640KB (185KB gzip) — aceptable para una app interna de un solo usuario; si se quiere optimizar después, dividir rutas con `React.lazy`.

## Pendientes del usuario (acciones que el usuario debe hacer)
- [x] Repo de GitHub creado y conectado (`ctaboadaa/Brujula`) ✅
- [x] GitHub Pages publicado con deploy automático en cada push ✅
- [x] Cuenta real creada y confirmada (`ctaboadaa@gmail.com`) ✅
- [x] "Site URL"/"Redirect URLs" corregidas en el dashboard de Supabase a `https://ctaboadaa.github.io/Brujula/` ✅

## Notas para la próxima sesión
- El usuario no es técnico — explicar todo en simple, traducir jerga la primera vez.
- Este proyecto vive en `C:\Users\charly\Documents\Projectos\Claude\LibertadFinanciera`, separado de TuChamba (`App1`) y CajaBella. Dev server: `brujula-dev` en `App1/.claude/launch.json`, puerto 3002.
- NO aplica monetización/Hotmart/paywall/landing — es de uso personal, no se vende.
- Project ID de Supabase: `ucjuyujfwrapcojropzb` (organización "The Owl Group", misma que TuChamba). Edge Function desplegada: `get-prices`.
