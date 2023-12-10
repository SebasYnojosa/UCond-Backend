# RUTAS

## Autenticación

### Registro de usuario

-   `POST /api/auth/sign-up`
-   Devuelve: `{token: *token de autenticación*}`

### Inicio de sesión

-   `POST /api/auth/sign-in`
-   Devuelve: `{token: *token de autenticación*}`

## Condominios

### Registar condominio

-   `POST /api/condominios/`
-   Devuelve: `{condominio: *nuevo condominio*}`

### Guardar comprobante

-   `POST /api/condominios/:id/comprobante`
-   Devuelve: `{condominio}`

### Eliminar condominio por su id

-   `DELETE /api/condominio/:id`
-   Devuelve: `nada`

### Actualizar condominio por su id

-   `PUT /api/condominio/:id`
-   Devuelve: `nada`

### Buscar condominio por su id

-   `GET /api/condominio/:id`
-   Devuelve: `{condominio}`

### Buscar los gastos asociados a un condominio por id

-   `GET /api/condominio/:id/gastos`
-   devuelve: `{pagados, por_pagar}`

### Registra un gasto en el condominio

-   `POST /api/condominio/:id/gastos`
-   devuelve: `{gasto}`

### Historial de pagos de los usuarios de un condominio

-   `GET /api/condominio/:id/pagos`
-   devuelve: `{pagados: {id, nombre_usuario, cedula_usuario, monto, metodo_pago, fecha_pago, concepto}[]}`

### Reportes asociados a un condominio por id

-   `GET /api/condominio/:id/reportes`
-   devuelve: `{reportes}`

### Ajustes condominio por id

### Anuncios del administrador de un condominio por su id

## Gastos

### Crear gasto

-   devuelve: `{gasto: *nuevo gasto*}`

### Precio dolar

-   Implementado en gastos

## Usuarios

### Busca un usuario por su ID

-   `GET /api/usuarios/:id`
-   devuelve: `{user: *usuario sin contraseña*}`

### Elimina un usuario por su ID

-   `DELETE /api/usuarios/:id`
-   devuelve: `{deletedUser}`

### Modifica un usuario por su ID

-   `PUT /api/usuarios/:id`
-   devuelve: `{user: *usuario actualizado*}`

### Buscar condominios de un usuario por el ID del usuario

-   `GET /api/usuarios/:userId/condominios`
-   devuelve: `{condominios}`

### Busca las deudas de un usuario por su ID

-   `GET /api/usuarios/:userId/deudas?idCondominio=<idCondominio>`
-   devuelve: `{deudas}`

### Alicuota y dimension de las viviendas de un usuario de un condominio
-   `GET /api/condominio/:condominioId/:userId/alicuotas`
-   devuelve: `{alicuotasYdimension}`

### Historial de pagos de un usuario por su ID

-   `GET /api/usuarios/:userId/pagos?idCondominio=<idCondominio>`
-   devuelve: `{pagos: {id, id_deuda, fecha_pago, monto_pagado, metodo_pago, concepto }[]}`
