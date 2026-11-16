# Panel local de administración

El panel permite editar el contenido del portfolio desde cualquier ordenador que tenga una copia del repositorio.

## Abrir el panel

1. Instala Node.js y Git.
2. Descarga o clona el repositorio.
3. Abre una terminal dentro de la carpeta del proyecto.
4. Ejecuta `npm install` la primera vez.
5. Ejecuta `npm run admin`.

El navegador abrirá `http://127.0.0.1:4173`. La vista previa del portfolio estará disponible en `http://127.0.0.1:4321`.

## Guardar y publicar

- **Guardar** escribe los cambios en `src/data/site-content.json` y crea una copia local de seguridad.
- **Vista previa** abre la sección seleccionada en el servidor local.
- **Publicar** comprueba la web, crea un commit con los cambios de contenido y lo envía a la rama `main` de GitHub.

Para publicar, Git debe tener acceso al repositorio desde ese ordenador. El panel solo escucha en `127.0.0.1`, por lo que no queda expuesto en la red ni se publica con la web.
