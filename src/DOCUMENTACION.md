# 💸 Pa' Donde Se Fue La Plata
## Documentación Técnica Completa
**Versión:** 1.0.0  
**Fecha:** Febrero 2026  
**Autor:** Vakano (vakanobtc)  
**Dominio:** https://padondesefuelaplata.com  
**Repositorio:** https://github.com/vakanobtc/finflow-pro

---

## 📋 Tabla de Contenidos
1. [Descripción del Proyecto](#descripción)
2. [Stack Tecnológico](#stack)
3. [Arquitectura](#arquitectura)
4. [Estructura de Archivos](#estructura)
5. [Base de Datos (Supabase)](#base-de-datos)
6. [Autenticación](#autenticación)
7. [Componentes Principales](#componentes)
8. [Estado de la Aplicación](#estado)
9. [Deploy y CI/CD](#deploy)
10. [Variables de Entorno](#variables)
11. [Cómo hacer cambios](#cambios)
12. [Roadmap](#roadmap)

---

## 📖 Descripción del Proyecto {#descripción}

**Pa' Donde Se Fue La Plata** es una aplicación web de gestión financiera personal diseñada específicamente para personas con **neurodivergencia** (TDAH, déficit de atención). 

### Filosofía de diseño
- **Ultra-simple:** Registrar un gasto en menos de 3 segundos
- **Visual:** Colores, emojis y feedback inmediato
- **Sin fricción:** Calculadora directa, sin menús complejos
- **Estilo iOS:** Diseño oscuro tipo iPhone, familiar e intuitivo

### Funcionalidades
- ✅ Registro de entradas y salidas con calculadora
- ✅ 6 categorías configurables con emojis y colores
- ✅ Presupuesto mensual con alertas visuales
- ✅ Historial por mes con archivado automático
- ✅ Gráficos tipo cripto (sparkline + barras comparativas)
- ✅ Cálculo de diezmos, ofrendas y primicias bíblicas
- ✅ Export a CSV/Excel compatible con software contable
- ✅ Soporte multi-moneda (COP, USD, EUR, VES, BTC)
- ✅ 6 temas visuales + fondos personalizados por URL
- ✅ Login con email y contraseña (Supabase Auth)
- ✅ Datos sincronizados en la nube por usuario

---

## 🛠 Stack Tecnológico {#stack}

| Capa | Tecnología | Versión | Uso |
|------|-----------|---------|-----|
| **Frontend** | React | 19.x | UI principal |
| **Estilos** | CSS-in-JS (inline styles) | — | Estilos dentro del componente |
| **Backend / DB** | Supabase | Cloud | Base de datos PostgreSQL + Auth |
| **Hosting** | Vercel | Cloud | Deploy automático desde GitHub |
| **Control de versiones** | Git + GitHub | — | Repositorio y CI/CD |
| **Runtime** | Node.js | 22.x | Entorno de desarrollo |
| **Package manager** | npm | — | Gestión de dependencias |

### Dependencias principales
```json
{
  "react": "^19.2.4",
  "react-dom": "^19.2.4",
  "react-scripts": "5.0.1",
  "@supabase/supabase-js": "latest"
}
```

---

## 🏗 Arquitectura {#arquitectura}

```
Usuario
   ↓
padondesefuelaplata.com (Vercel)
   ↓
React App (SPA - Single Page Application)
   ↓
Supabase Client (@supabase/supabase-js)
   ↓
Supabase Cloud (PostgreSQL + Auth)
```

### Flujo de datos
1. Usuario abre la app → Supabase verifica sesión
2. Si no hay sesión → muestra `LoginScreen`
3. Login exitoso → carga datos del usuario desde Supabase
4. Usuario registra movimiento → se guarda en tabla `transactions`
5. Al cerrar mes → se archiva en `monthly_archives`
6. Configuración (moneda, tema, categorías) → se guarda en `user_config`

---

## 📁 Estructura de Archivos {#estructura}

```
finflow-pro/
├── public/
│   ├── index.html          # HTML base
│   └── favicon.ico         # Ícono de la app
├── src/
│   ├── App.js              # ⭐ Componente principal (toda la app)
│   ├── supabase.js         # Configuración cliente Supabase
│   └── index.js            # Punto de entrada React
├── package.json            # Dependencias y configuración ESLint
├── .gitignore              # Archivos ignorados por Git
└── README.md               # Este archivo
```

> ⚠️ **Nota:** Toda la lógica, componentes y estilos están en `src/App.js` por simplicidad. Para escalar, se recomienda separar en componentes individuales.

---

## 🗄 Base de Datos (Supabase) {#base-de-datos}

**Proyecto:** padonde-plata  
**URL:** https://acgnhhgnuqmpctrxttmr.supabase.co  
**Región:** South America (São Paulo)

### Tabla: `transactions`
Almacena cada movimiento financiero del usuario.

```sql
create table transactions (
  id              uuid default gen_random_uuid() primary key,
  user_id         uuid references auth.users not null,  -- FK al usuario
  type            text not null,          -- 'in' (entrada) o 'out' (salida)
  amount          numeric not null,       -- Monto del movimiento
  category_id     text,                   -- ID de la categoría (ej: 'food')
  category_label  text,                   -- Nombre legible (ej: 'Comida')
  category_emoji  text,                   -- Emoji de la categoría (ej: '🍔')
  category_color  text,                   -- Color hex (ej: '#FF6B35')
  note            text,                   -- Nota libre del usuario
  month_key       text not null,          -- Mes en formato 'YYYY-MM' (ej: '2026-02')
  timestamp       bigint not null,        -- Unix timestamp en milisegundos
  created_at      timestamptz default now()
);
```

### Tabla: `user_config`
Configuración personalizada por usuario. Un registro por usuario.

```sql
create table user_config (
  id            uuid default gen_random_uuid() primary key,
  user_id       uuid references auth.users not null unique,
  currency_code text default 'COP',      -- Código de moneda activa
  budget        numeric default 5000000, -- Presupuesto mensual
  categories    jsonb,                   -- Array de categorías personalizadas
  giving        jsonb,                   -- Configuración de diezmos/ofrendas
  theme_id      text default 'dark',     -- ID del tema visual
  updated_at    timestamptz default now()
);
```

### Tabla: `monthly_archives`
Historial de meses cerrados con sus transacciones.

```sql
create table monthly_archives (
  id           uuid default gen_random_uuid() primary key,
  user_id      uuid references auth.users not null,
  month_key    text not null,            -- Mes archivado (ej: '2026-01')
  total_in     numeric default 0,        -- Total entradas del mes
  total_out    numeric default 0,        -- Total salidas del mes
  balance      numeric default 0,        -- Balance final del mes
  budget       numeric default 0,        -- Presupuesto que tenía ese mes
  transactions jsonb,                    -- Snapshot de todas las transacciones
  created_at   timestamptz default now(),
  unique(user_id, month_key)             -- Un archivo por mes por usuario
);
```

### Row Level Security (RLS)
Cada usuario **solo puede ver y modificar sus propios datos**:

```sql
-- Cada política aplica para SELECT, INSERT, UPDATE, DELETE
create policy "users own transactions" on transactions
  for all using (auth.uid() = user_id);

create policy "users own config" on user_config
  for all using (auth.uid() = user_id);

create policy "users own archives" on monthly_archives
  for all using (auth.uid() = user_id);
```

---

## 🔐 Autenticación {#autenticación}

Se usa **Supabase Auth** con email y contraseña.

### Configuración en Supabase
- **Site URL:** `https://padondesefuelaplata.com`
- **Redirect URLs:** `https://padondesefuelaplata.com`

### Flujo de autenticación
```javascript
// Registro
const { error } = await supabase.auth.signUp({ email, password });

// Login
const { data, error } = await supabase.auth.signInWithPassword({ email, password });

// Logout
await supabase.auth.signOut();

// Verificar sesión activa al cargar
const { data } = await supabase.auth.getSession();

// Escuchar cambios de sesión en tiempo real
supabase.auth.onAuthStateChange((_event, session) => { ... });
```

---

## 🧩 Componentes Principales {#componentes}

Todo vive en `src/App.js`. Los componentes son:

### `LoginScreen`
Pantalla de inicio de sesión y registro.
- **Props:** `onLogin(user)` — callback cuando el login es exitoso
- **Estado local:** `email`, `password`, `isNew`, `loading`, `msg`

### `BarChart`
Gráfico de barras comparativo de entradas vs salidas por mes.
- **Props:** `months` (array de meses), `currency`
- Renderiza SVG puro, sin librerías externas

### `Sparkline`
Gráfico de línea tipo cripto para mostrar tendencias.
- **Props:** `data` (array de valores), `color`, `width`, `height`
- Renderiza SVG puro con gradiente de relleno

### `App` (componente principal)
Contiene toda la lógica y las 5 vistas:
- **`main`** — Calculadora de registro
- **`history`** — Historial de movimientos por mes
- **`chart`** — Gráficos y análisis
- **`giving`** — Diezmos, ofrendas y primicias
- **`settings`** — Configuración general

---

## 📊 Estado de la Aplicación {#estado}

### Estados principales en `App`

```javascript
// Autenticación
const [user, setUser]               // Usuario de Supabase (null si no logueado)
const [loadingUser, setLoadingUser] // true mientras verifica sesión

// Navegación
const [view, setView]               // Vista activa: 'main'|'history'|'chart'|'giving'|'settings'
const [navOpen, setNavOpen]         // Menú desplegable abierto/cerrado

// Calculadora
const [display, setDisplay]         // Número en pantalla (string)
const [mode, setMode]               // 'in' | 'out' | null
const [selCat, setSelCat]           // ID de categoría seleccionada
const [note, setNote]               // Nota del movimiento

// Datos financieros
const [transactions, setTransactions]   // Transacciones del mes actual
const [monthlyData, setMonthlyData]     // Meses archivados { 'YYYY-MM': {...} }
const [activeMk, setActiveMk]           // Mes activo en formato 'YYYY-MM'

// Configuración
const [currency, setCurrency]       // Moneda activa (objeto CURRENCIES)
const [budget, setBudget]           // Presupuesto mensual (número)
const [cats, setCats]               // Categorías (array)
const [theme, setTheme]             // Tema visual (objeto THEMES)
const [giving, setGiving]           // Configuración diezmos (array)
const [customBg, setCustomBg]       // URL de imagen de fondo personalizada
```

### Valores computados (useMemo)
```javascript
const totalIn    // Suma de todas las entradas del mes
const totalOut   // Suma de todas las salidas del mes
const balance    // totalIn - totalOut
const budgetPct  // Porcentaje del presupuesto usado (0-100)
const allMonths  // Todos los meses (archivados + actual) para gráficos
const chartData  // Balance acumulado día a día (para sparkline)
const outByDay   // Gastos por día (para sparkline de gastos)
```

---

## 🚀 Deploy y CI/CD {#deploy}

### Flujo de deploy automático
```
Cambio en código local
    ↓
git add . && git commit -m "descripción"
    ↓
git push (→ GitHub)
    ↓
Vercel detecta el push automáticamente
    ↓
Vercel ejecuta: npm run build
    ↓
Deploy en padondesefuelaplata.com (1-2 minutos)
```

### Comandos útiles
```bash
# Desarrollo local
npm start                    # Inicia en localhost:3000

# Build de producción (lo hace Vercel automáticamente)
npm run build

# Subir cambios
git add .
git commit -m "descripción del cambio"
git push

# Clonar en nueva computadora
git clone https://github.com/vakanobtc/finflow-pro.git
cd finflow-pro
npm install
npm start
```

### Configuración de Vercel
- **Framework:** Create React App
- **Build Command:** `npm run build`
- **Output Directory:** `build`
- **Node.js Version:** 22.x

---

## 🔑 Variables de Entorno {#variables}

Actualmente las keys están directamente en `src/supabase.js`. Para mayor seguridad en el futuro, migrar a variables de entorno:

```javascript
// src/supabase.js (configuración actual)
const supabaseUrl = 'https://acgnhhgnuqmpctrxttmr.supabase.co'
const supabaseKey = 'eyJ...' // anon/public key — es segura en frontend
```

> ⚠️ **NUNCA** poner la `service_role key` en el código del frontend. Solo la `anon key` es segura.

Para migrar a `.env` en el futuro:
```bash
# .env (agregar al .gitignore)
REACT_APP_SUPABASE_URL=https://acgnhhgnuqmpctrxttmr.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJ...
```

```javascript
// src/supabase.js (versión con env vars)
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY
```

---

## ✏️ Cómo hacer cambios {#cambios}

### Agregar una nueva categoría por defecto
En `App.js`, busca `DEFAULT_CATS` y agrega:
```javascript
{ id:"gym", label:"Gimnasio", emoji:"🏋️", color:"#06B6D4" }
```

### Agregar una nueva moneda
Busca `CURRENCIES` y agrega:
```javascript
{ code:"MXN", symbol:"$", name:"Peso Mexicano", locale:"es-MX" }
```

### Agregar un nuevo tema visual
Busca `THEMES` y agrega:
```javascript
{ id:"rose", name:"Rose Gold", bg:"#1a0a0f", card:"#2d1520", accent:"#F43F5E" }
```

### Agregar una nueva vista
1. Agrega la opción en el array del Nav:
```javascript
["nueva","🆕","Nueva Vista"]
```
2. Agrega el bloque de renderizado:
```javascript
{view==="nueva" && (
  <div>...contenido...</div>
)}
```

### Cambiar el nombre de la app
Busca `Pa' Donde Se Fue La Plata` en el código y reemplaza por el nuevo nombre.

### Agregar una nueva tabla en Supabase
1. Ve a Supabase → SQL Editor
2. Crea la tabla con su política RLS
3. Usa `supabase.from('nueva_tabla').select/insert/update/delete`

---

## 🗺 Roadmap {#roadmap}

### v1.1 — Próximas mejoras
- [ ] Mover keys de Supabase a variables de entorno `.env`
- [ ] Notificaciones push cuando se acerca al límite del presupuesto
- [ ] Foto adjunta a cada movimiento
- [ ] Modo oscuro/claro automático según el sistema

### v1.2 — App móvil
- [ ] Convertir a app nativa con **Capacitor.js**
- [ ] Publicar en **Google Play Store** ($25 único)
- [ ] Publicar en **Apple App Store** ($99/año)

### v2.0 — Features avanzados
- [ ] Login con Google y Apple (OAuth)
- [ ] Múltiples cuentas/billeteras por usuario
- [ ] Metas de ahorro con progreso visual
- [ ] Reportes PDF descargables
- [ ] Modo compartido (parejas/familia)
- [ ] Integración con bancos colombianos (PSE)

### Registro de marca
- [ ] Registrar "Pa' Donde Se Fue La Plata" en la **SIC Colombia**
  - URL: https://www.sic.gov.co
  - Costo: ~$800.000 - $1.200.000 COP
  - Tiempo: ~6 meses

---

## 👨‍💻 Para el desarrollador

### Clonar y correr el proyecto
```bash
git clone https://github.com/vakanobtc/finflow-pro.git
cd finflow-pro
npm install
npm start
# App disponible en http://localhost:3000
```

### Tecnologías que debes conocer
- **React Hooks:** useState, useEffect, useMemo, useCallback
- **Supabase JS Client:** auth, from().select/insert/upsert
- **CSS-in-JS:** Todos los estilos son objetos JavaScript inline
- **SVG:** Los gráficos son SVG puro sin librerías

### Decisiones de diseño importantes
1. **Todo en un archivo:** `App.js` tiene todo por simplicidad. No es lo ideal para escalar pero facilita el mantenimiento inicial.
2. **Sin librerías de UI:** Todos los componentes son custom para control total del diseño.
3. **Sin librerías de gráficos:** Recharts/Chart.js fueron descartados. Los gráficos son SVG puro para menor tamaño de bundle.
4. **ESLint:** Se desactivó `react-hooks/exhaustive-deps` en `package.json` para el `useEffect` de verificación de mes.

---

*Documentación generada con asistencia de Claude (Anthropic) — Febrero 2026*