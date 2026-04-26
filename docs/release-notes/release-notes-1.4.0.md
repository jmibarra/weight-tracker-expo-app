# Release Notes - Versión 1.4.0

Esta actualización se centra fundamentalmente en mejorar la arquitectura interna, optimizar el rendimiento y agregar nuevas funcionalidades clave para la experiencia de usuario (UX), completando 21 puntos del plan de mejora estructural.

A continuación, detallamos las 21 mejoras realizadas en esta versión:

## 🚀 Nuevas Funcionalidades y Mejoras de UX (User Experience)

### 1. Paginación en el Gráfico Principal (#21)
Para evitar cierres inesperados y mejorar la fidelidad de los datos, el gráfico de la pantalla principal ahora cuenta con **paginación**. Cuando hay un gran volumen de datos (más de 50 registros), ya no se realiza un muestreo destructivo que omite puntos de datos. En su lugar, el usuario puede navegar hacia el pasado o futuro mediante botones intuitivos (`<` y `>`).

### 2. Filtros Avanzados en el Historial (#16)
La pestaña de Historial dejó de ser una lista plana interminable. Ahora incorpora **carruseles de filtros interactivos** en la parte superior que detectan automáticamente los años y meses con actividad, permitiendo a los usuarios aislar y revisar datos de períodos específicos con facilidad.

### 3. Prevención de Entradas Duplicadas (#14)
Se añadió una regla de validación inteligente al guardar un nuevo registro. Si el usuario intenta agregar un peso en un día donde ya existe una entrada, la aplicación mostrará una alerta preguntando si desea sobrescribir el dato anterior o cancelar la operación, previniendo inconsistencias en los datos diarios.

### 4. Protección contra Cambios no Guardados (#15)
Para evitar la pérdida accidental de información, si un usuario ingresa datos en el formulario del Modal y presiona el botón "Atrás" sin guardar, la aplicación lo interceptará con un diálogo de confirmación para asegurarse de que realmente desea descartar los cambios.

### 5. Traducciones Completas e Internacionalización (#5, #6, #9)
Se resolvieron múltiples inconsistencias de idioma. Textos que estaban fuertemente codificados en inglés o español ("Seleccionar peso", "No data to export", "Light/Dark/System", "regs." en los logros) ahora están conectados dinámicamente al sistema de internacionalización (i18n), respetando la configuración del dispositivo.

### 6. Quick Action Localizado (#20)
El atajo de presión prolongada (Quick Action) en el ícono de la aplicación ahora respeta el idioma del dispositivo (Ej: "Añadir Peso" vs "Add Weight") en lugar de estar fijado en español.

## ⚙️ Mejoras de Arquitectura y Refactorización

### 7. Refactorización de la Pantalla Principal (#10)
Se extrajeron los componentes pesados del archivo `index.tsx` (que rondaba las 850 líneas) hacia componentes más pequeños y mantenibles en la carpeta `components/home/` (como `SummaryCard` y `StreaksSection`). 

### 8. Hook Centralizado `useRepositories` (#11)
Se eliminó la instanciación repetida y directa de los repositorios de SQLite en cada componente. Ahora todos los componentes consumen las bases de datos a través de un único hook `useRepositories()`, optimizando las conexiones a memoria.

### 9. Extracción de Estilos Inline (#12)
Se extrajeron decenas de objetos literales `style={{...}}` que estaban en la declaración JSX de los componentes principales (`index.tsx`, `profile.tsx`, `settings.tsx`, `history.tsx`, `modal.tsx`). Se trasladaron a sus respectivos archivos estáticos separados (`.styles.ts`), lo cual previene asignaciones de memoria excesivas por cada renderizado de React.

### 10. Constantes Centralizadas para Configuración (#13)
Se erradicaron los "Magic Strings" de las claves de Settings (ej. `"targetWeight"` o `"theme"`). Ahora se utiliza un diccionario centralizado `SETTINGS_KEYS` (`constants/SettingsKeys.ts`) previniendo errores de escritura.

## ⚡ Mejoras de Rendimiento (Performance)

### 11. Índices en Base de Datos (#8)
Se agregó un índice SQL (`idx_measurements_date`) a la columna `date` de la tabla `measurements`. Dado que todas las consultas y gráficos ordenan los datos cronológicamente, este cambio acelera significativamente el tiempo de carga en usuarios con muchos años de uso.

### 12. Cálculo de Rachas Delegado a SQL (#23)
La lógica pesada de iteración en JavaScript que calculaba la "Racha Actual" y "Mejor Racha" fue reemplazada por una consulta SQL robusta utilizando _Common Table Expressions (CTE)_ y funciones de ventana (_Window Functions_). Esto reduce el trabajo en el hilo principal de JavaScript a casi cero.

### 13. Memoización de Datos del Gráfico (#2)
Se agregó `useMemo` a la función `getFilteredData()` en la pantalla principal. Esto evita el recálculo y recreación del arreglo de datos en cada render del componente cuando los filtros o configuraciones no han cambiado.

### 14. Memoización de la Línea de Tendencia (#3)
Se aplicó la misma estrategia de optimización (`useMemo`) al cálculo matemático de las Medias Móviles (`trendLineData`), previniendo ciclos de CPU innecesarios.

### 15. Extracción de Cálculos Duplicados (#1)
Se consolidó la fórmula matemática del progreso de la barra hacia el objetivo, eliminando un bloque duplicado que realizaba la misma matemática costosa dos veces en el renderizado inicial.

### 16. Optimización de Listas y Renderizado de Logros (#4, #22)
Se optimizó el `keyExtractor` del historial para que no use generadores aleatorios como `Math.random()`, lo que causaba re-renders completos no deseados en listas. Además, la cuadrícula de Logros (Achievements) en el perfil está mejor estructurada para un renderizado ágil y virtualizado.

## 🛠️ Limpieza de Código (Code Smells & Boilerplate)

### 17. Limpieza de Componentes Huérfanos (#26, #27)
Se eliminaron componentes innecesarios y residuales del boilerplate predeterminado de Expo (ej. `hello-wave.tsx`, `parallax-scroll-view.tsx`, `external-link.tsx`) reduciendo el peso final del bundle de la aplicación.

### 18. Eliminación de Botón Debug en Producción (#7)
Se removió un botón expuesto en la pantalla de Configuración ("Reparar Fechas") que había sido utilizado en versiones previas como herramienta de migración para desarrolladores, el cual ya no era requerido en producción dado que las migraciones son ahora automáticas en la inicialización de SQLite.

---

### Estado del Plan Maestro: 21 / 27 (77% Completado)
_Versión 1.4.0 despliega todos estos cambios en preparación para las siguientes expansiones estructurales pendientes como el soporte de libras y notificaciones push._
