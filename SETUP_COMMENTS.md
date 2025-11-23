# Configuración de la Tabla de Comentarios

## Descripción

Este documento explica cómo configurar la tabla `comentarios_resultados` en Supabase para que funcione la sección de comentarios en la página de resultados.

## Pasos para Configurar

### 1. Acceder a Supabase

1. Ve a [supabase.com](https://supabase.com)
2. Inicia sesión con tu cuenta
3. Selecciona tu proyecto
4. Ve a la sección **SQL Editor**

### 2. Ejecutar el Script SQL

1. Haz clic en **New Query**
2. Copia y pega el contenido del archivo `create_comments_table.sql`
3. Haz clic en **Run** (o presiona Ctrl+Enter)

El script creará:
- **Tabla `comentarios_resultados`** con los campos necesarios
- **Índices** para mejorar el rendimiento de las búsquedas
- **Políticas RLS** para permitir lectura y escritura pública

### 3. Verificar la Tabla

1. Ve a la sección **Table Editor**
2. Deberías ver la tabla `comentarios_resultados` en la lista
3. Verifica que tiene los siguientes campos:
   - `id` (UUID, clave primaria)
   - `nombre` (VARCHAR, opcional)
   - `texto` (TEXT, requerido)
   - `tab` (VARCHAR, 'general' o 'youth')
   - `likes` (INTEGER, por defecto 0)
   - `created_at` (TIMESTAMP)
   - `updated_at` (TIMESTAMP)

## Estructura de la Tabla

```sql
CREATE TABLE comentarios_resultados (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre VARCHAR(255),
  texto TEXT NOT NULL,
  tab VARCHAR(50) NOT NULL CHECK (tab IN ('general', 'youth')),
  likes INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## Funcionalidades

### Agregar Comentario

Los usuarios pueden agregar comentarios desde la sección "Comentarios de Usuarios" en la página de resultados.

```typescript
const { data, error } = await supabase
  .from("comentarios_resultados")
  .insert([
    {
      nombre: "Juan",
      texto: "Excelente encuesta",
      tab: "general",
    },
  ])
  .select();
```

### Ver Comentarios

Los comentarios se cargan automáticamente al abrir la página de resultados.

```typescript
const { data, error } = await supabase
  .from("comentarios_resultados")
  .select("*")
  .eq("tab", "general")
  .order("created_at", { ascending: false })
  .limit(20);
```

### Dar Like a un Comentario

Los usuarios pueden dar like a los comentarios.

```typescript
await supabase
  .from("comentarios_resultados")
  .update({ likes: currentLikes + 1 })
  .eq("id", commentId);
```

## Notas de Seguridad

- Las políticas RLS permiten lectura y escritura pública
- No se requiere autenticación para comentar
- Se recomienda implementar validación adicional en el servidor si se desea moderar comentarios
- Los comentarios son públicos y anónimos (el nombre es opcional)

## Troubleshooting

### Los comentarios no se guardan

1. Verifica que la tabla `comentarios_resultados` existe en Supabase
2. Comprueba que las políticas RLS están habilitadas
3. Revisa la consola del navegador para ver errores

### Los comentarios no se cargan

1. Verifica que la tabla tiene datos
2. Comprueba que el campo `tab` tiene el valor correcto ('general' o 'youth')
3. Revisa los logs de Supabase para errores de conexión

## Próximos Pasos

- Implementar moderación de comentarios
- Agregar validación de contenido
- Implementar límite de comentarios por usuario
- Agregar notificaciones cuando alguien responde a un comentario

