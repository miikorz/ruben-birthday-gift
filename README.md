# Birthday Games · Rubén

Regalo de cumpleaños de Sheila y Miguel. Web estática en español, pensada para móvil y compatible con GitHub Pages. No necesita instalación, compilación, API, CDN ni servicios externos.

## Abrir

Publica la raíz del repositorio mediante la configuración de GitHub Pages existente. El archivo de entrada es `index.html`; todas las rutas son relativas, por lo que también funciona bajo `/ruben-birthday-gift/`.

Para una vista previa local:

```sh
python3 -m http.server 4173
```

Abre `http://localhost:4173`. También puedes abrir `index.html` directamente.

## Recorrido

1. Felicitación, carta personal y presentación del reto, con fotografía, parallax y apariciones al hacer scroll.
2. Seis burpees a toques, cuatro volteos de rueda manteniendo pulsado (ratón, táctil o Espacio/Intro), diez remadas alternando «Tira» / «Vuelve» hasta 100 metros, y ocho tirones a clics para subir por la cuerda y tocar la campana.
3. Celebración, regalo de spa japonés con masajes y cuidados faciales, mensaje de entrega del cupón por Sheila y Miguel.
4. Mural de las 15 fotos y despedida. «Otra ronda» reinicia la partida.

El regalo requiere completar las cuatro pruebas. Las partidas antiguas conservan las tres primeras pruebas y continúan en la nueva subida por cuerda.

Las repeticiones completadas se guardan en `localStorage` con la clave `ruben-birthday-games-v1`. Si el almacenamiento está bloqueado, se puede jugar normalmente durante la sesión. Se respetan las preferencias de movimiento reducido. Los controles tienen soporte de teclado y anuncios accesibles del progreso.

## Archivos

- `index.html`: contenido y personaje SVG. La cara utiliza un encuadre de la fotografía original mediante SVG.
- `styles.css`: diseño responsive, animaciones y estilos de cada escena.
- `app.js`: minijuegos, progreso, revelado del regalo y mural.
- `assets/photos/`: las 15 fotografías originales proporcionadas.
- `assets/fonts/`: Anton y su licencia SIL Open Font License, procedentes de Google Fonts.

La web pública muestra el regalo y un mensaje de entrega personal. El cupón se entrega directamente a Rubén por Sheila y Miguel; el sitio no incluye QR, códigos de canje ni documentos del vale. Las fotos están accesibles al publicar la web. `noindex` solicita a los buscadores que no indexen la página, pero no proporciona control de acceso.

Los cupones que se hubieran publicado en commits anteriores siguen en el historial de Git. Retirarlos de la versión actual no invalida esos documentos ni su código de canje.
