# Birthday Games · Rubén

Regalo de cumpleaños de Sheila y Miguel. Web estática en español, pensada para móvil y compatible con GitHub Pages. No necesita instalación, compilación, API, CDN ni servicios externos.

## Abrir

Publica la raíz del repositorio mediante la configuración de GitHub Pages existente. El archivo de entrada es `index.html`; todas las rutas son relativas, por lo que también funciona bajo `/ruben-birthday-gift/`.

Para una vista previa local:

```sh
python3 -m http.server 4173
```

Abre `http://localhost:4173`. También puedes abrir `index.html` directamente; la copia al portapapeles dependerá de los permisos del navegador y tiene selección manual como alternativa.

## Recorrido

1. Felicitación, carta personal y presentación del reto, con fotografía, parallax y apariciones al hacer scroll.
2. Seis burpees a toques, cuatro volteos de rueda manteniendo pulsado (ratón, táctil o Espacio/Intro), diez remadas alternando «Tira» / «Vuelve» hasta 100 metros, y ocho tirones a clics para subir por la cuerda y tocar la campana.
3. Celebración, regalo de spa japonés con masajes y cuidados faciales, cupón descargable y código copiable.
4. Mural de las 15 fotos y despedida. «Otra ronda» reinicia la partida.

El regalo requiere completar las cuatro pruebas. Las partidas antiguas conservan las tres primeras pruebas y continúan en la nueva subida por cuerda.

Las repeticiones completadas se guardan en `localStorage` con la clave `ruben-birthday-games-v1`. Si el almacenamiento está bloqueado, se puede jugar normalmente durante la sesión. Se respetan las preferencias de movimiento reducido. Los controles tienen soporte de teclado y anuncios accesibles del progreso.

## Archivos

- `index.html`: contenido y personaje SVG. La cara utiliza un encuadre de la fotografía original mediante SVG.
- `styles.css`: diseño responsive, animaciones y estilos de cada escena.
- `app.js`: minijuegos, progreso, revelado del regalo y mural.
- `assets/photos/`: las 15 fotografías originales proporcionadas.
- `assets/cupon-regalo.png`: cupón original, sin alterar el QR.
- `assets/fonts/`: Anton y su licencia SIL Open Font License, procedentes de Google Fonts.

El bloqueo del regalo forma parte del juego: una página estática no protege archivos ni códigos frente a quien inspeccione el repositorio o conozca su URL. Al publicar el repositorio o la web, las fotos y el cupón estarán accesibles. `noindex` solicita a los buscadores que no indexen la página, pero no proporciona control de acceso.
