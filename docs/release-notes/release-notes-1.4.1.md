# Release Notes v1.4.1

Esta actualización trae mejoras significativas en la visualización del historial, correcciones en el flujo de guardado y una experiencia completamente internacionalizada.

## 🚀 Nuevas Funcionalidades

- **Vista de Calendario en el Historial:** ¡Nueva forma de visualizar tu progreso! Ahora puedes alternar entre la clásica vista de "Lista" y el nuevo "Calendario", donde podrás ver tus registros mensuales en una grilla interactiva, resaltando fácilmente en cada día los cambios de peso.
- **Días de la Semana en el Historial:** En la vista de lista, la fecha de cada registro ahora incluye también el día de la semana (ej. "Lun, 28/04") para tener mejor contexto de tus mediciones.

## ✨ Mejoras de Interfaz (UI/UX)

- **Filtros más modernos:** Se reemplazaron los antiguos botones de selección de Año y Mes (carruseles) por selectores nativos desplegables (Dropdowns) para una navegación mucho más limpia y rápida.
- **Refinamiento visual del Calendario:** Ajustes dinámicos de tamaño, eliminación de bordes duros y alineaciones corregidas para evitar que los números grandes se solapen, optimizando la lectura en dispositivos móviles.

## 🐛 Corrección de Errores

- **Falso positivo al guardar/borrar:** Se corrigió un molesto error donde la aplicación lanzaba una alerta de "Datos no guardados" al intentar cerrar la pantalla inmediatamente después de haber guardado o borrado exitosamente un peso.

## 🌐 Internacionalización (i18n)

- **Revisión total de traducciones:** Se realizó un barrido completo por todo el proyecto para traducir textos que habían quedado fijos en el código.
  - Los botones del modal de peso ("Cancelar", "Hecho") ahora se traducen correctamente.
  - El estado vacío ("No data") en los gráficos de barras semanales ahora utiliza el diccionario.
  - Las etiquetas de los comparadores de períodos ("1M", "1Y") ahora se adaptan al idioma seleccionado.
