# Brújula

Herramienta personal para llevar el control de ingresos y gastos, ver el balance de patrimonio neto (activos - pasivos) y monitorear inversiones con precios de mercado actualizados automáticamente.

Uso privado — no se vende.

## Stack

- Vite + React + TypeScript + Tailwind v4
- Supabase (base de datos, autenticación, y una Edge Function para precios de mercado)
- Publicada en GitHub Pages

## Desarrollo local

```bash
npm install
npm run dev
```

Necesitas un archivo `.env` con:

```
VITE_SUPABASE_URL=...
VITE_SUPABASE_PUBLISHABLE_KEY=...
```
