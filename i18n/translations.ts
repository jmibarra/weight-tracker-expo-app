export const translations = {
  en: {
    home: {
      title: 'Dashboard',
      trend: 'Weight Trend',
      currentWeight: 'Current Weight',
      target: 'Target',
      toGo: 'To Go',
      bmi: 'BMI',
      addEntry: 'Add New Entry',
      noData: 'No data yet. Add your first entry!',
      ranges: {
        all: 'All',
        year: '1Y',
        month: '1M',
        week: '1W'
      },
      startWeight: 'Start Weight',
      progress: 'Total Change',
      maxWeight: 'Max Weight',
      minWeight: 'Min Weight',
      noChartData: 'No records for this period.',
      tabTitle: 'Home'
    },
    history: {
      title: 'History',
      empty: 'No history available.',
      tabTitle: 'History'
    },
    profile: {
      title: 'Profile',
      subtitle: 'Update your personal details for BMI calculation.',
      height: 'Height (cm)',
      sex: 'Sex (M/F)',
      save: 'Save Profile',
      success: 'Profile updated successfully',
      error: 'Failed to save profile',
      validationHeight: 'Please enter your height',
      targetWeight: 'Target Weight (kg)',
      tabTitle: 'Profile'
    },
    settings: {
      title: 'Options',
      dataManagement: 'Data Management',
      importCsv: 'Import CSV',
      importCsvDesc: 'Import your history from a file.',
      csvFormatTitle: 'Expected Format:',
      about: 'About',
      desc: 'Weight Tracker v1.0\nDeveloped with Expo & SQLite.',
      importSuccess: 'Import Successful',
      importError: 'Failed to import CSV',
      recordsImported: 'records imported.',
      tabTitle: 'Options',
      language: 'Language',
      selectLanguage: 'Select Language',
      appearance: 'Appearance'
    },
    addEntry: {
      title: 'New Entry',
      editTitle: 'Edit Entry',
      weight: 'Weight (kg) *',
      waist: 'Waist (cm)',
      hip: 'Hip (cm)',
      legs: 'Legs (cm)',
      date: 'Date',
      save: 'Save Entry',
      update: 'Update Entry',
      delete: 'Delete Entry',
      cancel: 'Cancel',
      validationWeight: 'Weight is required',
      error: 'Failed to save entry',
      confirmDelete: 'Are you sure you want to delete this entry?',
    },
    common: {
        error: 'Error',
        success: 'Success'
    }
  },
  es: {
    home: {
      title: 'Panel Principal',
      trend: 'Tendencia de Peso',
      currentWeight: 'Peso Actual',
      target: 'Objetivo',
      toGo: 'Faltan',
      bmi: 'IMC',
      addEntry: 'Agregar Entrada',
      noData: 'Aún no hay datos. ¡Agrega tu primer registro!',
      ranges: {
        all: 'Todos',
        year: '1A',
        month: '1M',
        week: '1S'
      },
      startWeight: 'Peso Inicial',
      progress: 'Cambio Total',
      maxWeight: 'Peso Máximo',
      minWeight: 'Peso Mínimo',
      noChartData: 'No hay registros para este periodo.',
      tabTitle: 'Inicio'
    },
    history: {
      title: 'Historial',
      empty: 'No hay historial disponible.',
      tabTitle: 'Historial'
    },
    profile: {
      title: 'Perfil',
      subtitle: 'Actualiza tus datos para calcular el IMC.',
      height: 'Altura (cm)',
      sex: 'Sexo (M/F)',
      save: 'Guardar Perfil',
      success: 'Perfil actualizado correctamente',
      error: 'Error al guardar el perfil',
      validationHeight: 'Por favor ingresa tu altura',
      targetWeight: 'Peso Objetivo (kg)',
      tabTitle: 'Perfil'
    },
    settings: {
      title: 'Opciones',
      dataManagement: 'Gestión de Datos',
      importCsv: 'Importar CSV',
      importCsvDesc: 'Importa tu historial desde un archivo.',
      csvFormatTitle: 'Formato Esperado:',
      about: 'Acerca de',
      desc: 'Weight Tracker v1.0\nDesarrollado con Expo y SQLite.',
      importSuccess: 'Importación Exitosa',
      importError: 'Error al importar CSV',
      recordsImported: 'registros importados.',
      tabTitle: 'Opciones',
      language: 'Idioma',
      selectLanguage: 'Seleccionar Idioma',
      appearance: 'Apariencia'
    },
    addEntry: {
      title: 'Nueva Entrada',
      editTitle: 'Editar Entrada',
      weight: 'Peso (kg) *',
      waist: 'Cintura (cm)',
      hip: 'Cadera (cm)',
      legs: 'Piernas (cm)',
      date: 'Fecha',
      save: 'Guardar',
      update: 'Actualizar',
      delete: 'Eliminar',
      cancel: 'Cancelar',
      validationWeight: 'El peso es obligatorio',
      error: 'Error al guardar la entrada',
      confirmDelete: '¿Estás seguro de que quieres eliminar esta entrada?',
    },
    common: {
        error: 'Error',
        success: 'Éxito'
    }
  }
};

export type Locale = 'en' | 'es';
export type TranslationKeys = typeof translations.en;
