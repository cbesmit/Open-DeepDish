# 7. Requerimientos No Funcionales y UI/UX

Esta sección define los atributos de calidad del sistema y las guías de diseño para asegurar que la aplicación no solo funcione, sino que sea agradable de usar en un contexto doméstico.

## 7.1 Rendimiento y Latencia

### 7.1.1 Manejo de Latencia de IA (Critical)

La generación de recetas vía DeepSeek Reasoner es un proceso computacionalmente costoso que puede tardar entre **10 a 60 segundos**.

- **Requerimiento:** El sistema no debe bloquearse ni parecer "congelado" durante este tiempo.
    
- **Solución UI:** Implementar un estado de "Loading" rico e informativo. En lugar de un spinner simple, mostrar mensajes rotativos: _"Analizando ingredientes...", "Consultando gustos de Ana...", "Balanceando nivel de picante..."_.
    
- **Timeout Backend:** Configurar el timeout del servidor Node.js en al menos 120 segundos para evitar cortes prematuros de la conexión con la API.
    

### 7.1.2 Optimización de Consultas

- El historial de recetas crecerá con el tiempo. Las búsquedas de texto (`%LIKE%`) deben responder en menos de **200ms**.
    
- **Estrategia:** Uso estricto de índices `GIN` para columnas JSONB y `Trigram` para columnas de texto (definidos en la sección de Base de Datos).
    

## 7.2 Disponibilidad y Robustez

### 7.2.1 Recuperación ante Fallos (Docker)

- **Restart Policy:** Todos los contenedores (`frontend`, `backend`, `db`) deben tener la política `restart: always` o `unless-stopped` en el `docker-compose.yml`. Si el servidor (PC/Raspberry Pi) se reinicia por un corte de luz, la app debe levantar automáticamente sin intervención manual.
    

### 7.2.2 Manejo de Errores de API Externa

- Si DeepSeek falla o retorna un JSON corrupto, el sistema debe tener un mecanismo de **Reintento Automático (Retry)** en el Backend (máximo 1 intento) antes de notificar al usuario.
    
- Si el error persiste, mostrar un mensaje amigable: _"El Chef IA no está disponible en este momento. Intenta usar los filtros para buscar una receta guardada."_
    

## 7.3 Seguridad (Contexto Local)

### 7.3.1 Datos Sensibles

- Aunque la app corre en una red local, las API Keys y contraseñas de BD **nunca** deben exponerse en el código cliente (React). Todo debe manejarse vía variables de entorno en el contenedor del Backend.
    
- El acceso a la base de datos PostgreSQL debe estar restringido exclusivamente a la red interna de Docker (`sacc-network`).
    

### 7.3.2 Sanitización

- Prevenir inyección SQL usando ORM (Prisma/Sequelize) con consultas parametrizadas.
    
- Validar y sanitizar todo el HTML/Markdown que pueda venir en la descripción de la receta para evitar ataques XSS, aunque el origen (la IA) sea confiable.
    

## 7.4 Guías de Diseño UI/UX (Frontend)

### 7.4.1 Enfoque "Mobile First"

La aplicación se utilizará principalmente en la cocina, posiblemente con manos ocupadas o mojadas.

- **Botones Grandes:** Targets táctiles de mínimo 44x44px (estándar de accesibilidad) con padding generoso (Tailwind `p-4`).
    
- **Tipografía Legible:** Fuentes sans-serif (Inter, Roboto) con alto contraste y tamaños base de 16px para lectura fácil a distancia media (mientras se cocina).
    
- **Layout Responsivo:**
    
    - _Escritorio:_ Panel lateral de configuración y grid de resultados.
        
    - _Móvil:_ Flujo vertical paso a paso (Configurar -> Generar -> Ver lista).
        

### 7.4.2 Paleta de Colores y Tema

- **Estilo:** Limpio, moderno y apetecible.
    
- **Colores Sugeridos:**
    
    - _Primario:_ Naranja/Terracota (asociado a comida/calidez).
        
    - _Secundario:_ Verde (para indicadores de "Saludable" o ingredientes "En casa").
        
    - _Neutros:_ Grises suaves para fondos y separadores.
        
    - _Alertas:_ Rojo suave para ingredientes "A comprar" o "No me gusta".
        

### 7.4.3 Interacciones Clave

#### A. Pantalla de Configuración (Generador)

- Uso de **Chips/Tags seleccionables** para las personas en lugar de selectores nativos aburridos.
    
- Sliders visuales para los niveles (Saludable 1-5) con iconos (ej. 1=Hamburguesa, 5=Ensalada).
    

#### B. Visualización de Receta (Modo Cocina)

- Opción de **"Modo Lectura"** o **"Checklist"**: Permitir al usuario tachar los ingredientes o pasos conforme avanza en la preparación.
    
- Diferenciación visual clara entre lo que _tienes_ y lo que debes _comprar_ (ej. Icono de ✅ vs 🛒).
    

#### C. Feedback (Gustar/No Gustar)

- No usar modales intrusivos. Usar tarjetas o secciones expandibles al final de la receta.
    
- Iconografía clara: 👍, 👎, 😐. Al seleccionar, guardar automáticamente (Auto-save) para reducir clics.
    

## 7.5 Estructura de Navegación (Sitemap Simplificado)

1. **Home / Dashboard:** Acceso rápido a "Generar Nueva" y "Últimas Guardadas".
    
2. **Generador:** El wizard de configuración.
    
3. **Mis Recetas (Buscador):** Listado con filtros avanzados.
    
4. **Detalle de Receta:** Vista completa.
    
5. **Configuración:**
    
    - Gestión de Personas.
        
    - Gestión de Alacena/Ingredientes Locales.