# 🍄 El Bosque de Mis Hongos

Un sitio web personal donde puedes:

- **Cada hongo es un post propio**: tiene su propia página con galería de
  fotos, toda su información, y su propia sección de comentarios — la gente
  comenta sobre ese hongo en particular, no en un cajón general.
- **Galería de varias fotos por hongo**, con miniaturas para que el visitante
  navegue entre ellas y una que elijas como portada.
- **Tabla de información libre**: agrega cualquier dato que quieras sobre un
  hongo (tamaño, color, olor, lo que sea), como una mini hoja de cálculo.
- **Secciones desplegables**: agrega bloques de texto extra con su propio
  título (ej. "Cómo cocinarlo", "Curiosidades") que el visitante puede abrir
  y cerrar.
- **Filtros por categoría**: comestibles, no comestibles, tóxicos o sin
  clasificar, con chips clicables debajo del buscador.
- **Buscador por nombre**: en la portada, cualquier visitante puede escribir
  el nombre de un hongo y encontrarlo al instante (sin importar tildes o
  mayúsculas).
- **Fondo personalizable**: tanto en la portada como en "Sobre el bosque",
  puedes elegir un color o subir una imagen de fondo.
- **Diseñar libremente** la página "Sobre el bosque": arrastra títulos,
  textos, imágenes, formas (círculo, cuadrado, triángulo, mancha, estrella,
  corazón, hexágono, rombo, anillo, arco) y stickers temáticos (hongo, hoja,
  sol, gota, estrella, luna, nube, árbol, bellota, mariposa, caracol, flor,
  abeja, rana, lupa, libro, taza, corazón decorativo) a cualquier posición.
- **Recibir comentarios de visitantes**, que pasan automáticamente por un filtro
  que bloquea insultos, odio, spam y comentarios negativos sobre el sitio o
  los hongos, dejando pasar solo lo positivo y lo neutro. Por defecto usa un
  filtro de palabras local y gratuito; opcionalmente puede usar la IA de
  Claude para mayor precisión (ver más abajo).
- **Sistema de cuentas con dos niveles**: una administradora principal
  (superadministradora) y administradoras normales, con un panel de seguridad
  que bloquea automáticamente intentos de acceso sospechosos.
- **Orden y descubrimiento**: ordena el feed por más recientes, nombre o más
  comentados, y un botón "🎲 Sorpréndeme" que lleva a un hongo al azar.
- **Compartir posts**: cada hongo tiene un botón para compartir por WhatsApp
  o copiar el enlace directo.
- **Modo oscuro**: un botón en la esquina superior para alternar el tema,
  que se recuerda entre visitas.
- **Estadísticas** (`/edit/stats`): cuántas visitas y comentarios tiene cada
  hongo, y un ranking de los más populares.
- **Seguridad reforzada**: límite de velocidad en comentarios y subida de
  imágenes (anti-spam), verificación real del contenido de las imágenes
  subidas (no solo su extensión), un captcha matemático simple en los
  comentarios, respaldo y restauración de todos los datos desde el panel de
  seguridad, y aviso por correo opcional cuando se bloquea una conexión
  sospechosa.

---

## Cómo está organizado el sitio

- **`/`** — el feed principal: una grilla de tarjetas, una por cada hongo,
  con buscador arriba. Es lo primero que ve cualquier visitante.
- **`/hongo/[id]`** — la página de un hongo en particular (su "post"), con
  toda su información y, debajo, sus propios comentarios.
- **`/sobre-el-bosque`** — una página decorativa de lienzo libre, donde puedes
  contar la historia detrás de la colección, con total libertad visual.

---

## Cómo funcionan las cuentas y la seguridad

Este sitio usa **usuario + contraseña** (no una contraseña única para todos).
Hay dos tipos de cuenta:

- **Superadministradora** (debería ser solo una persona — tú): puede crear
  cuentas nuevas, cambiar contraseñas de cualquiera, eliminar cuentas (excepto
  la suya propia, que nunca se puede eliminar) y ver el panel de seguridad.
- **Administradora** (por ejemplo, tu hermana): puede editar el sitio
  completo, agregar hongos y revisar comentarios, pero no puede gestionar
  cuentas ni ver el panel de seguridad.

**Nadie puede crear su propia cuenta.** Solo la superadministradora crea
cuentas nuevas, desde `/edit/security`.

### Bloqueo automático por seguridad

Si alguien intenta iniciar sesión y falla **3 veces en 15 minutos desde la
misma conexión** (sin importar qué nombre de usuario haya probado), el sistema:

1. Bloquea esa conexión (IP) por completo — ni siquiera deja probar más
   contraseñas desde ahí.
2. Bloquea también cualquier cuenta real que haya recibido esos intentos
   fallidos, para que tampoco se pueda usar desde otra conexión hasta que
   se revise.

**Excepción importante:** la cuenta de la superadministradora *nunca* queda
bloqueada a nivel de cuenta (para que tú nunca quedes sin acceso a tu propio
sitio), aunque la conexión desde la que probaron sí se bloquea igual.

### Cómo desbloquear a alguien

Solo tú (superadministradora) puedes hacerlo, desde `/edit/security`:

1. Ahí verás la lista de cuentas bloqueadas y de conexiones (IP) bloqueadas.
2. Pulsa **"Desbloquear"** en la cuenta y, si corresponde, también en la
   conexión bloqueada.
3. Si quieres, puedes además poner una contraseña nueva a esa cuenta ahí mismo,
   para que la persona pueda volver a entrar con la nueva clave.

Si tu hermana se equivoca varias veces y queda bloqueada, lo normal es que
te avise (por WhatsApp, llamada, etc.), tú entras a `/edit/security`, la
desbloqueas y, si quieres, le pones una contraseña nueva.

⚠️ **Importante:** si tú misma fallas tu contraseña varias veces desde la
misma conexión que estás usando, esa conexión se bloqueará igual (aunque tu
cuenta no). Si esto pasa, espera 15 minutos y vuelve a intentar, usa otra red
(por ejemplo los datos móviles en vez del wifi), o pide a alguien con acceso
a `/edit/security` desde otra conexión que desbloquee la tuya.

---

## Otras protecciones de seguridad

Además del sistema de cuentas, el sitio incluye:

- **Límite de velocidad (rate limiting)**: los visitantes no pueden enviar
  más de 6 comentarios por minuto desde la misma conexión, ni subir más de
  30 imágenes por minuto. Esto frena intentos de saturar el sitio con spam
  automatizado.
- **Verificación real de imágenes**: cuando alguien sube una "imagen", el
  sitio revisa el contenido real del archivo (no solo el nombre o la
  extensión), para que no se pueda disfrazar un archivo malicioso como si
  fuera una foto.
- **Captcha matemático**: antes de publicar un comentario, el visitante debe
  resolver una suma simple (ej. "¿Cuánto es 3 + 5?"). Esto frena a la mayoría
  de los bots automatizados sin ser molesto para una persona real. Cada
  pregunta solo se puede usar una vez.
- **Respaldo y restauración** (`/edit/security`): puedes descargar en
  cualquier momento un archivo con todos tus hongos, comentarios y diseño.
  Guárdalo en tu computadora o en algún almacenamiento en la nube
  periódicamente. Si algo le pasa al sitio, puedes subir ese mismo archivo
  para restaurar todo tal como estaba. El archivo nunca incluye contraseñas.
- **Aviso por correo** (opcional): si configuras `RESEND_API_KEY` y
  `ALERT_EMAIL_TO` (ver `.env.example`), recibirás un correo automático cada
  vez que el sitio bloquee una conexión sospechosa, en vez de tener que
  revisar `/edit/security` manualmente. Si no las configuras, el sitio
  funciona igual, solo que sin esos avisos.

---

## Cómo usarlo (una vez publicado)

- **`tu-sitio.com/`** — el feed público con buscador.
- **`tu-sitio.com/hongo/algun-id`** — la página de un hongo (se accede
  haciendo clic en su tarjeta desde el feed, no hace falta escribir la URL).
- **`tu-sitio.com/sobre-el-bosque`** — la página decorativa de lienzo libre.
- **`tu-sitio.com/edit`** — el editor de lienzo libre para "Sobre el bosque"
  (te pedirá usuario y contraseña). Desde aquí, el botón "🎨 Apariencia"
  abre el panel para cambiar el fondo de la portada y de "Sobre el bosque"
  (color o imagen).
- **`tu-sitio.com/edit/mushrooms`** — donde agregas y administras tus hongos
  (cada uno se vuelve su propio post automáticamente).
- **`tu-sitio.com/edit/comments`** — donde revisas todos los comentarios de
  todos los hongos, incluso los que la IA bloqueó.
- **`tu-sitio.com/edit/stats`** — cuántas visitas y comentarios tiene cada
  hongo, y cuáles son los más populares.
- **`tu-sitio.com/edit/security`** — (solo visible para la superadministradora)
  donde creas cuentas, cambias contraseñas y desbloqueas accesos.

La primera vez que alguien entre a `/edit`, el sitio pedirá crear la cuenta
de superadministradora (usuario y contraseña). Esa será la cuenta principal,
la única que nunca se puede eliminar ni bloquear. Después de eso, cualquier
otra cuenta (como la de tu hermana) la crea la superadministradora desde
`/edit/security`.

### Cómo editar el sitio

1. Entra a `/edit` con tu contraseña.
2. Usa la barra de botones de abajo para agregar **Título**, **Texto**,
   **Imagen**, **Tarjeta de hongo** o **Forma**.
3. Haz clic en cualquier bloque para seleccionarlo, luego:
   - Arrástralo con el mouse a donde quieras.
   - Usa las esquinas para cambiar su tamaño.
   - Usa el panel de la derecha para cambiar color, tipografía, bordes
     redondeados, rotación y orden de capas.
4. Pulsa **Guardar** cuando termines. Los cambios no se publican solos:
   debes guardar para que los visitantes los vean.

---

## Cómo publicarlo en internet (gratis)

Este proyecto está hecho con **Next.js**, listo para desplegarse gratis en
**Vercel** (la empresa que crea Next.js). Pasos:

### 1. Sube el código a GitHub

1. Crea una cuenta gratis en [github.com](https://github.com) si no tienes.
2. Crea un repositorio nuevo (puede ser privado).
3. Sube esta carpeta completa a ese repositorio. La forma más fácil sin usar
   la terminal es con [GitHub Desktop](https://desktop.github.com/).

### 2. Crea tu base de datos gratis en Turso

Este sitio guarda todo (hongos, comentarios, cuentas) en una base de datos
real para que nada se pierda. Usamos **Turso** (turso.tech) porque tiene un
plan gratuito muy generoso y no pide tarjeta de crédito.

1. Ve a [turso.tech](https://turso.tech) y crea una cuenta gratis (puedes
   entrar con tu cuenta de GitHub o Google).
2. Una vez dentro, busca el botón para crear una base de datos nueva
   ("Create Database" o similar). Ponle el nombre que quieras, por ejemplo
   `bosque-de-hongos`. Elige la región más cercana a Chile si te la ofrece
   (por ejemplo alguna en Sudamérica o EE.UU.).
3. Cuando la base de datos esté lista, busca la opción para ver los
   detalles de conexión ("Connect" o el ícono de la base de datos creada).
   Ahí vas a encontrar dos datos que necesitas copiar:
   - La **URL de la base de datos** (empieza con `libsql://...`).
   - Un **token de autenticación** (un texto largo; normalmente hay un botón
     "Create Token" o "Generate Token" si no se generó solo).
4. Guarda esos dos valores en un lugar seguro por ahora — los vas a pegar
   como variables de entorno en Vercel en el paso 4.

Si la interfaz de Turso cambia con el tiempo, busca en su web cualquier
sección llamada "Database URL" y "Auth Token": son exactamente esos dos
valores los que necesitas, sin importar cómo estén organizados los menús.

### 3. (Opcional) Activa moderación con IA real

Por defecto, el sitio modera los comentarios con un **filtro de palabras
prohibidas local** — gratis, sin necesidad de cuenta ni conexión a ninguna
API. Detecta insultos, groserías y odio comunes en español, incluso
disfrazados con espacios o números (ej. "p u t o" o "id10ta"). También
bloquea comentarios negativos sobre el sitio o los hongos aunque no sean
insultos (ej. "está feo", "no me gusta"), para proteger el ánimo de quien
recibe los comentarios. No entiende contexto como lo haría una IA, así que
puede dejar pasar insultos creativos que no estén en su lista, o muy
raramente bloquear algo inofensivo que mencione una de esas palabras.

Si más adelante quieres una moderación más inteligente (que entienda
contexto, sarcasmo, insultos disfrazados de formas nuevas, etc.), puedes
activar moderación con la IA de Claude:

1. Ve a [console.anthropic.com](https://console.anthropic.com) y crea una cuenta.
2. Ve a **Settings → API Keys** y crea una nueva clave.
3. Esto tiene un costo de uso (no es gratis), aunque muy bajo para moderar
   comentarios — céntimos de dólar por miles de comentarios. Revisa los
   precios actuales en [anthropic.com/pricing](https://www.anthropic.com/pricing).
4. Guarda esa clave, la necesitarás en el paso siguiente. **Nunca la compartas
   ni la pongas directamente en el código.**

Si prefieres no pagar nada, puedes saltarte este paso por completo: el sitio
seguirá funcionando con el filtro de palabras gratuito.

### 4. Despliega en Vercel

1. Ve a [vercel.com](https://vercel.com) y crea una cuenta gratis (puedes
   entrar directo con tu cuenta de GitHub).
2. Haz clic en **"Add New" → "Project"** y elige el repositorio que subiste.
3. Antes de darle a "Deploy", ve a la sección **"Environment Variables"** y
   agrega:
   - `TURSO_DATABASE_URL` → la URL que copiaste de Turso en el paso 2.
     **Obligatoria**, sin esto el sitio no podrá guardar nada en producción.
   - `TURSO_AUTH_TOKEN` → el token que copiaste de Turso en el paso 2.
     También obligatorio.
   - `SESSION_SECRET` → cualquier texto largo y aleatorio (por ejemplo, escribe
     30 letras y números al azar). Obligatorio.
   - `ANTHROPIC_API_KEY` → opcional, solo si activaste el paso 3.
   - `RESEND_API_KEY`, `ALERT_EMAIL_TO`, `ALERT_EMAIL_FROM` → opcionales, solo
     si quieres recibir avisos por correo (ver "Otras protecciones de
     seguridad" más arriba).
4. Haz clic en **Deploy**. En unos minutos tendrás tu sitio en una URL como
   `tu-proyecto.vercel.app`.
5. Si quieres un dominio propio (como `hongosdemihermana.com`), puedes
   comprarlo en cualquier registrador (Namecheap, Google Domains, etc.) y
   conectarlo desde el panel de Vercel, en **Settings → Domains**.

### Sobre la base de datos y las imágenes

Gracias a Turso, todos tus hongos, comentarios, cuentas y diseño quedan
guardados de forma permanente — no se pierden aunque actualices el código o
Vercel reinicie el servidor. El plan gratuito de Turso (500 bases de datos,
9 GB de almacenamiento, mil millones de lecturas al mes) es muchísimo más de
lo que un sitio personal/familiar va a necesitar nunca.

Las imágenes que subas se guardan codificadas dentro de la propia base de
datos (no como archivos sueltos), así que tampoco dependen del sistema de
archivos de Vercel. Si en algún momento el sitio crece mucho con fotos muy
pesadas, conviene migrar las imágenes a un servicio dedicado como Vercel Blob
o Cloudinary — pero para uso personal/familiar esto no hace falta.

---

## Cómo correrlo en tu computadora (antes de publicarlo)

Si quieres ver el sitio en tu propia computadora antes de publicarlo:

1. Instala [Node.js](https://nodejs.org) (versión 18 o más reciente).
2. Abre una terminal dentro de esta carpeta.
3. Ejecuta:
   ```
   npm install
   ```
4. Copia el archivo `.env.example` y renómbralo a `.env.local`. Para
   desarrollo local **no necesitas configurar Turso** — si dejas
   `TURSO_DATABASE_URL` vacío, el sitio crea automáticamente un archivo
   `data/local.db` en tu computadora y lo usa como base de datos, sin que
   tengas que hacer nada más. Si quieres probar el filtro de comentarios con
   IA, pon ahí tu clave de Anthropic.
5. Ejecuta:
   ```
   npm run dev
   ```
6. Abre tu navegador en `http://localhost:3000`.

---

## Si la superadministradora olvida su contraseña

Como ninguna otra cuenta puede recuperar el acceso de la superadministradora
(por diseño, para que nadie pueda hacerse pasar por ella), si esto pasa hay
que editar el dato directamente en la base de datos de Turso:

1. Entra a tu cuenta de Turso y abre la base de datos de este sitio.
2. Busca la opción para ejecutar comandos SQL ("Shell", "Query" o similar).
3. Ejecuta una consulta para ver los usuarios guardados:
   ```sql
   SELECT data FROM kv_collections WHERE name = 'users';
   ```
4. Vas a ver un texto JSON con la lista de cuentas. Identifica la que tiene
   `"role":"superadmin"`, y dentro de ese mismo texto cambia su
   `"passwordHash"` a `null` y su `"blocked"` a `false`.
5. Guarda ese JSON modificado con una consulta como:
   ```sql
   UPDATE kv_collections SET data = '<pega aquí el JSON modificado>' WHERE name = 'users';
   ```
6. Entra de nuevo a `/edit` con ese mismo nombre de usuario — el sitio te
   dejará poner una contraseña nueva para esa cuenta.

Si esto te resulta complicado, puedes pedirle ayuda a Claude pegando el
contenido que te muestre el `SELECT` del paso 3.

(Si en cambio quien olvida su contraseña es una administradora normal como
tu hermana, no hace falta tocar la base de datos: la superadministradora
simplemente le cambia la contraseña desde `/edit/security`.)

---

## Estructura del proyecto (por si quieres seguir personalizándolo)

```
src/
  app/
    page.tsx                → el feed público (portada)
    hongo/[id]/page.tsx       → la página de un hongo (post)
    sobre-el-bosque/page.tsx → el lienzo libre decorativo
    edit/page.tsx            → el editor de "Sobre el bosque"
    edit/mushrooms/page.tsx  → gestión de hongos
    edit/comments/page.tsx   → revisión de comentarios
    edit/security/page.tsx   → cuentas, bloqueos y respaldos
    edit/stats/page.tsx      → visitas y comentarios por hongo
    api/                     → toda la lógica del servidor
  components/                → piezas visuales reutilizables
  lib/
    store.ts                 → qué se guarda (hongos, comentarios, etc.)
    db.ts                     → la conexión a la base de datos (Turso)
    moderation.ts             → la lógica de moderación (IA o filtro local)
    bannedWords.ts            → la lista del filtro de palabras
    auth.ts                   → cuentas, sesiones y bloqueos
    rateLimit.ts              → límite de velocidad anti-spam
    captcha.ts                → el captcha matemático
    notifications.ts          → avisos por correo (opcional)
```
