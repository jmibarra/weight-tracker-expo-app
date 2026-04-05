# Weight Tracker App - Release Notes v1.4.0

## 🚀 Nuevas Funcionalidades Principales

* **📊 Nueva Pestaña de Métricas**: Se ha agregado una nueva sección completamente dedicada a métricas a largo plazo para mantener el dashboard principal enfocado.
  * **Comparador de Períodos**: Una tarjeta para revisar "Mes a Mes" o "Año a Año" cuál fue el comportamiento de tu peso y medidas en porcentaje y valores absolutos.
  * **Tendencia Semanal Inteligente**: Una nueva gráfica de barras agrupa automáticamente tus registros en iteraciones semanales. Las barras interactúan a nivel color con el usuario: Rojo indica una subida semanal y Verde representa una bajada respecto a la semana pasada.

* **⚡ Quick Actions (Atajos Nativos)**: Ahora no hace falta buscar la función de registro. Pulsando un segundo el ícono principal desde el inicio de tu teléfono, encontrarás un atajo para saltar de inmediato al modal "Añadir Peso", ahorrándote clics cada día.

## 🛠 Mejoras bajo el capó
* Actualización menor en las dependencias nativas para manejar atajos (`expo-quick-actions`).
* Ajuste de íconos no soportados nativamente en iOS resolviendo un conflicto en las librerías visuales (`react-native-gifted-charts` bugfixes en propiedades descontinuadas) para mayor estabilidad de tipeo con TypeScript.

## 📖 Documentación
* Actualizado el **Manual de Usuario** para contemplar las métricas avanzadas y el flujo de trabajo de los atajos.
* Actualizado el archivo **README** del proyecto con la nueva funcionalidad expuesta al público.
