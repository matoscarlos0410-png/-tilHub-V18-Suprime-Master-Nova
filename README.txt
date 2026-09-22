==========================================================
                 ÚTILHUB V18 — NOVA FLOW
==========================================================

ÚtilHub es una aplicación web de herramientas útiles para
el día a día.

V18 incluye NOVA FLOW con 20 modos de animación,
herramientas de cálculo, conversiones, productividad,
comidas, compras, seguridad y otras utilidades.

==========================================================
ARCHIVOS DEL PROYECTO
==========================================================

1. index.html
2. style.css
3. script.js
4. manifest.webmanifest
5. sw.js
6. README.txt

Todos los archivos deben estar en la misma carpeta.

==========================================================
CARACTERÍSTICAS
==========================================================

- NOVA FLOW con 20 animaciones seleccionables.
- Animaciones adaptadas a celular, tablet y computadora.
- Modo oscuro y claro.
- Control de movimiento.
- Control de rendimiento.
- Modo concentración.
- Buscador de herramientas.
- Favoritos.
- Herramientas recientes.
- Calculadora.
- Porcentajes.
- Descuentos.
- Regla de tres.
- Conversión de longitud.
- Conversión de peso.
- Conversión de volumen.
- Conversión de temperatura.
- Conversión de tiempo.
- Conversor de monedas.
- Diferencia entre fechas.
- Calculadora de edad.
- Temporizador.
- Cronómetro.
- Reloj.
- Modo concentración.
- Herramienta de texto.
- Diccionario.
- Notas.
- Tareas.
- Lista de compras.
- Búsqueda de comidas.
- Búsqueda de productos.
- Generador de contraseñas.
- Generador aleatorio.
- Generador de códigos QR.
- Guardado local de preferencias y datos.
- Diseño responsive.
- Soporte PWA.
- Soporte offline para los archivos principales.

==========================================================
NOVA FLOW — 20 MODOS
==========================================================

1. Cosmic
2. Aurora
3. Pulse
4. Matrix
5. Nebula
6. Waves
7. Starfield
8. Vortex
9. Firefly
10. Rain
11. Grid
12. Spiral
13. Orbit
14. Plasma
15. DNA
16. Snow
17. Lightning
18. Galaxy
19. Comet
20. Quantum

El usuario puede seleccionar el modo que prefiera.

==========================================================
INSTALAR EN GITHUB
==========================================================

PASO 1
Crear o abrir un repositorio en GitHub.

PASO 2
Subir estos seis archivos:

index.html
style.css
script.js
manifest.webmanifest
sw.js
README.txt

PASO 3
Comprobar que index.html está en la carpeta principal
del repositorio.

==========================================================
ACTIVAR GITHUB PAGES
==========================================================

1. Entrar al repositorio.
2. Abrir Settings.
3. Entrar en Pages.
4. En "Build and deployment" seleccionar:

   Source:
   Deploy from a branch

5. Seleccionar:

   Branch: main
   Folder: / (root)

6. Guardar.

GitHub generará una dirección para la página.

==========================================================
INSTALAR COMO APLICACIÓN
==========================================================

ÚtilHub V18 utiliza:

manifest.webmanifest
sw.js

Para que la instalación PWA funcione correctamente,
la página debe abrirse mediante HTTPS o localhost.

En GitHub Pages se utiliza HTTPS automáticamente.

En navegadores compatibles puede aparecer la opción:

"Instalar ÚtilHub"

o un icono de instalación en la barra del navegador.

==========================================================
FUNCIONAMIENTO SIN INTERNET
==========================================================

El Service Worker guarda los archivos principales:

index.html
style.css
script.js
manifest.webmanifest

Después de una primera carga correcta, ÚtilHub puede
seguir mostrando la aplicación aunque temporalmente no
haya conexión.

Las funciones que dependen de servicios externos pueden
necesitar Internet.

Por ejemplo:

- Diccionario online.
- Conversión de monedas actualizada.
- Generación de algunos códigos QR.
- Búsquedas externas de comidas.
- Búsquedas externas de productos.

==========================================================
COMIDAS Y COMPRAS
==========================================================

ÚtilHub NO realiza compras automáticamente.

La herramienta solamente ayuda a encontrar opciones
mediante búsquedas externas.

El usuario decide qué comprar y realiza el pedido
directamente en el sitio correspondiente.

==========================================================
DATOS DEL USUARIO
==========================================================

Las preferencias y determinados datos de ÚtilHub se
guardan principalmente en el almacenamiento local del
navegador.

Si se borran los datos del navegador, algunos datos
guardados localmente pueden desaparecer.

==========================================================
ACTUALIZAR ÚTILHUB
==========================================================

Cuando se publique una nueva versión:

1. Reemplazar los archivos antiguos.
2. Actualizar el número de versión del Service Worker.
3. Subir los cambios a GitHub.
4. Recargar la página.

Para V18 se utiliza:

utilhub-v18-nova-flow-v1

==========================================================
ESTRUCTURA FINAL
==========================================================

ÚtilHub-V18/
│
├── index.html
├── style.css
├── script.js
├── manifest.webmanifest
├── sw.js
└── README.txt

==========================================================
ÚTILHUB V18 — NOVA FLOW
==========================================================

Una colección de herramientas útiles en un solo lugar.

==========================================================
FIN
==========================================================
