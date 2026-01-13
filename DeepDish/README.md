# 🍕 DeepDish

**DeepDish** (anteriormente SACC) es un asistente culinario impulsado por Inteligencia Artificial diseñado para resolver el dilema diario: *¿Qué vamos a comer hoy?*.

A diferencia de los generadores de recetas genéricos, DeepDish considera los **gustos específicos (qué les gusta y qué no)** de cada miembro de la familia, los ingredientes disponibles en tu **despensa** y tus restricciones actuales (tiempo, salud, tipo de cocina).

Utilizando **DeepSeek Reasoner (R1)**, genera recetas que buscan el "Consenso Total" — minimizando las quejas y maximizando la satisfacción de todos los comensales.

## 🚀 Características

- **👥 Gestión de Perfiles:** Crea perfiles para miembros de la familia con sus gustos, disgustos y alergias específicos.
- **🧠 Motor de Consenso IA:** Genera recetas que satisfacen a múltiples personas seleccionadas simultáneamente.
- **🥑 Prioridad a la Despensa:** Prioriza el uso de ingredientes que ya tienes en casa para reducir el desperdicio.
- **🔍 Filtrado Avanzado:**
  - **Nivel Saludable (1-5):** Filtra por rangos de salud (desde comida reconfortante hasta fitness).
  - **Tiempo/Dificultad:** Rápida (30m), Normal (60m) o Elaborada.
  - **Tipo de Cocina:** Mexicana, Italiana, Japonesa, etc.
  - **Momento del Día:** Desayuno, Comida o Cena.
- **💾 Historial de Recetas:** Guarda tus creaciones favoritas generadas por la IA.
- **📊 Dashboard:** Vista rápida de la actividad reciente y acceso directo al generador.
- **🐳 Dockerizado:** Configurado para un entorno de desarrollo moderno con Hot Reload.

## 🛠️ Stack Tecnológico

- **Frontend:** React (Vite), Tailwind CSS, Zustand (Gestión de estado), Heroicons.
- **Backend:** Node.js, Express.js.
- **Base de Datos:** PostgreSQL (vía Prisma ORM).
- **IA:** DeepSeek API (Modelo Reasoner).
- **Infraestructura:** Docker & Docker Compose.

## 📦 Prerrequisitos

- Docker y Docker Compose instalados.
- Una [API Key de DeepSeek](https://platform.deepseek.com/).

## ⚡ Inicio Rápido

1.  **Clonar el repositorio:**
    ```bash
    git clone https://github.com/tu-usuario/DeepDish.git
    cd DeepDish
    ```

2.  **Configuración del entorno:**
    Crea un archivo `.env` en la raíz del proyecto con el siguiente contenido:

    ```env
    # Configuración de App
    APP_PORT=3000
    NODE_ENV=development

    # Base de Datos
    DB_USER=postgres
    DB_PASS=tu_password_seguro
    DB_NAME=sacc_db

    # Servicio de IA
    DEEPSEEK_API_KEY=sk-tu-api-key-aqui
    DEEPSEEK_MODEL=deepseek-reasoner
    ```

3.  **Lanzar con Docker:**
    ```bash
    docker compose up -d --build
    ```
    *Nota: La primera vez tardará unos minutos en construir las imágenes e instalar las dependencias.*

4.  **Acceder a la Aplicación:**
    Abre tu navegador en: `http://localhost:3000`

## 🏗️ Flujo de Desarrollo

El proyecto está configurado para **Hot Reloading**:
- **Frontend:** Los cambios en `./frontend/src` se reflejan instantáneamente.
- **Backend:** Los cambios en `./backend/src` reinician el servidor automáticamente (vía Nodemon).
- **Base de Datos:** Los datos se persisten en la carpeta local `./postgres_data`.
- **Migraciones:** La base de datos se sincroniza automáticamente al iniciar el contenedor mediante `prisma db push`.

## 🗄️ Gestión de Base de Datos

Si necesitas sincronizar la base de datos manualmente:
```bash
docker compose exec backend npx prisma db push
```

## 📝 Licencia

Este proyecto es de código abierto.
