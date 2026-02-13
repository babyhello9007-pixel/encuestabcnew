# BCApi - API Externa para Batalla Cultural

BCApi permite que terceros envíen respuestas a las preguntas de la encuesta Nanoencuesta desde sus propias webs sin necesidad de usar la interfaz de esta plataforma.

## Características

- **Integración Transparente**: Las respuestas se integran exactamente igual que las respuestas internas
- **Conteo Global**: Las respuestas cuentan en las estadísticas y resultados globales
- **Seguridad**: Validación de API key, rate limiting y validación de origen
- **Estadísticas**: Seguimiento de uso por API key

## Autenticación

Cada integración externa recibe una **API Key única** que debe incluirse en cada request.

### Formato de API Key

```
bcapi_key_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

- Longitud: 32+ caracteres
- Prefijo: `bcapi_key_`
- Único por website/proyecto

## Endpoints

### 1. Enviar Respuesta

**Endpoint**: `POST /api/trpc/bcapi.submitResponse`

**Descripción**: Registra una respuesta a una pregunta de la encuesta

**Request**:

```json
{
  "apiKey": "bcapi_key_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  "questionId": "voto_generales",
  "responseValue": "PP",
  "userIp": "192.168.1.1",
  "metadata": {
    "source": "external_website",
    "campaign": "2025_election"
  }
}
```

**Parámetros**:

| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| `apiKey` | string | Sí | Tu API key única |
| `questionId` | string | Sí | ID de la pregunta (ej: `voto_generales`, `edad`, `provincia`) |
| `responseValue` | string\|number\|boolean | Sí | Valor de la respuesta |
| `userIp` | string | No | IP del usuario (se obtiene del servidor si no se proporciona) |
| `metadata` | object | No | Datos adicionales (source, campaign, etc.) |

**Response**:

```json
{
  "success": true,
  "message": "Respuesta registrada exitosamente",
  "id": "bcapi_response_1707856800000"
}
```

**Códigos de Error**:

| Código | Descripción |
|--------|-------------|
| `400` | Parámetros inválidos |
| `401` | API key inválida o revocada |
| `429` | Rate limit excedido |
| `500` | Error interno del servidor |

### 2. Validar API Key

**Endpoint**: `GET /api/trpc/bcapi.validateKey`

**Descripción**: Verifica que una API key sea válida

**Request**:

```json
{
  "apiKey": "bcapi_key_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
}
```

**Response**:

```json
{
  "valid": true,
  "website": "example.com",
  "rateLimit": 1000,
  "requestsToday": 150
}
```

### 3. Obtener Estadísticas

**Endpoint**: `GET /api/trpc/bcapi.getStats`

**Descripción**: Obtiene estadísticas de uso de una API key

**Request**:

```json
{
  "apiKey": "bcapi_key_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
}
```

**Response**:

```json
{
  "apiKey": "bcapi_key_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  "website": "example.com",
  "totalRequests": 1500,
  "requestsToday": 150,
  "requestsThisMonth": 5000,
  "rateLimit": 1000,
  "rateResetAt": "2026-02-14T22:24:00.000Z",
  "responsesIntegrated": 1500,
  "lastRequest": "2026-02-13T22:19:00.000Z"
}
```

## Preguntas Disponibles

### Preguntas Principales

| questionId | Tipo | Valores Aceptados |
|-----------|------|------------------|
| `edad` | select | "18-25", "26-35", "36-45", "46-55", "56-65", "65+" |
| `provincia` | select | Nombre de provincia española |
| `comunidad_autonoma` | select | Nombre de CCAA |
| `nacionalidad` | select | "Española", "Extranjera" |
| `voto_generales` | select | Código de partido (PP, PSOE, VOX, etc.) |
| `voto_autonomicas` | select | Código de partido |
| `voto_municipales` | select | Código de partido |
| `voto_europeas` | select | Código de partido |
| `nota_ejecutivo` | number | 0-10 |
| `asociacion_juvenil` | select | Código de asociación |
| `monarquia_republica` | select | "Monarquía Parlamentaria", "República", "Otro" |
| `division_territorial` | select | "Sistema actual de Autonomías", "Sistema Federal", etc. |
| `sistema_pensiones` | select | "Público", "Privado", "Mixto", "Otro" |

### Líderes Políticos

| questionId | Tipo | Valores Aceptados |
|-----------|------|------------------|
| `valoracion_feijoo` | number | 0-10 |
| `valoracion_sanchez` | number | 0-10 |
| `valoracion_abascal` | number | 0-10 |
| `valoracion_alvise` | number | 0-10 |
| `valoracion_yolanda` | number | 0-10 |
| `valoracion_irene` | number | 0-10 |
| `valoracion_ayuso` | number | 0-10 |
| `valoracion_buxade` | number | 0-10 |

## Ejemplos de Uso

### JavaScript/Node.js

```javascript
async function submitResponse(apiKey, questionId, responseValue) {
  const response = await fetch('/api/trpc/bcapi.submitResponse', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      apiKey,
      questionId,
      responseValue,
      metadata: {
        source: 'my_website',
        campaign: 'election_2025'
      }
    })
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.statusText}`);
  }

  return response.json();
}

// Uso
try {
  const result = await submitResponse(
    'bcapi_key_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
    'voto_generales',
    'PP'
  );
  console.log('Respuesta registrada:', result.id);
} catch (error) {
  console.error('Error:', error);
}
```

### Python

```python
import requests
import json

def submit_response(api_key, question_id, response_value):
    url = '/api/trpc/bcapi.submitResponse'
    
    payload = {
        'apiKey': api_key,
        'questionId': question_id,
        'responseValue': response_value,
        'metadata': {
            'source': 'my_website',
            'campaign': 'election_2025'
        }
    }
    
    response = requests.post(url, json=payload)
    response.raise_for_status()
    return response.json()

# Uso
try:
    result = submit_response(
        'bcapi_key_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
        'voto_generales',
        'PP'
    )
    print(f"Respuesta registrada: {result['id']}")
except requests.exceptions.RequestException as error:
    print(f"Error: {error}")
```

### cURL

```bash
curl -X POST /api/trpc/bcapi.submitResponse \
  -H "Content-Type: application/json" \
  -d '{
    "apiKey": "bcapi_key_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    "questionId": "voto_generales",
    "responseValue": "PP",
    "metadata": {
      "source": "my_website",
      "campaign": "election_2025"
    }
  }'
```

## Rate Limiting

- **Límite por defecto**: 1000 requests/día
- **Ventana de reset**: Medianoche UTC
- **Respuesta cuando se excede**: HTTP 429 (Too Many Requests)

## Seguridad

### Validación de API Key

- Las API keys son únicas y no reutilizables
- Se pueden revocar en cualquier momento
- Se registra cada uso para auditoría

### Validación de Origen

- Se valida el origen del request (CORS)
- Se registra la IP del usuario
- Se pueden configurar dominios permitidos

### Datos Sensibles

- Las respuestas no incluyen información personal
- Se almacenan de forma anónima
- Se pueden eliminar bajo solicitud

## Casos de Uso

1. **Integración en Redes Sociales**: Embeber encuesta en publicaciones
2. **Campañas Políticas**: Recopilar datos de simpatizantes
3. **Medios de Comunicación**: Incluir encuesta en artículos
4. **Aplicaciones Móviles**: Sincronizar datos con app externa
5. **Webhooks**: Procesar respuestas en tiempo real

## Soporte

Para solicitar una API key o reportar problemas:

- Email: api@batallacu ltural.es
- Documentación: https://docs.batallacu ltural.es/bcapi
- Status: https://status.batallacu ltural.es

## Changelog

### v1.0.0 (2026-02-13)

- Lanzamiento inicial de BCApi
- Endpoints: submitResponse, validateKey, getStats
- Rate limiting: 1000 requests/día
- Soporte para todas las preguntas de Nanoencuesta
