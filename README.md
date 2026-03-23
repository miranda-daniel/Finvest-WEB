# Finvest WEB

Frontend de Finvest. Conecta con un backend Node + Prisma + GraphQL (Apollo Server).

## Stack

| Capa | Tecnología | Versión |
|---|---|---|
| UI Framework | React | 19 |
| Build | Vite | 6 |
| Lenguaje | TypeScript | 5.8+ |
| Estilos | Tailwind CSS | v4 |
| Estilos custom | SCSS/Sass | latest |
| Routing | TanStack Router | v1 (file-based) |
| Data fetching | Apollo Client | v3 |
| Estado cliente/auth | Zustand | v5 |
| Validación | Zod | v3 |
| Formularios | React Hook Form | v7 |
| Tipos GraphQL | graphql-codegen | v5 |
| Linting | ESLint | v9 |
| Formateo | Prettier | v3 |

## Comandos

```bash
# Instalar dependencias
npm install

# Levantar en desarrollo
npm run dev

# Build de producción
npm run build

# Preview del build
npm run preview

# Lint
npm run lint

# Formatear código
npm run format

# Generar tipos desde el schema GraphQL
npm run codegen
```

El servidor de desarrollo corre en `http://localhost:5173`.

## Rutas

| Ruta | Acceso | Descripción |
|---|---|---|
| `/` | Público | Home |
| `/login` | Público | Login |
| `/dashboard` | Autenticado | Dashboard (redirige a `/login` si no hay sesión) |

## Code Style

All code comments must be written in **English**.

## GraphQL / Codegen

El schema GraphQL vive en `schema.graphql` en la raíz. Durante el desarrollo inicial contiene un stub mínimo. Una vez que el backend esté disponible:

1. Reemplazar `schema.graphql` con el schema real, o apuntar `codegen.ts` a la URL del backend
2. Ejecutar `npm run codegen` para regenerar los tipos en `src/graphql/generated/`
