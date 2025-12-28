export const translations = {
  en: {
    home: {
      title: 'Dashboard',
      trend: 'Weight Trend',
      currentWeight: 'Current Weight',
      bmi: 'BMI',
      addEntry: 'Add New Entry',
      noData: 'No data yet. Add your first entry!',
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
      tabTitle: 'Profile'
    },
    settings: {
      title: 'Options',
      dataManagement: 'Data Management',
      importCsv: 'Import CSV',
      importCsvDesc: 'Import your history from a CSV file.\nFormat: date (YYYY-MM-DD), weight, waist, hip, legs',
      about: 'About',
      desc: 'Weight Tracker v1.0\nDeveloped with Expo & SQLite.',
      importSuccess: 'Import Successful',
      importError: 'Failed to import CSV',
      recordsImported: 'records imported.',
      tabTitle: 'Options',
      language: 'Language',
      selectLanguage: 'Select Language'
    },
    addEntry: {
      title: 'New Entry',
      weight: 'Weight (kg) *',
      waist: 'Waist (cm)',
      hip: 'Hip (cm)',
      legs: 'Legs (cm)',
      date: 'Date',
      save: 'Save Entry',
      cancel: 'Cancel',
      validationWeight: 'Weight is required',
      error: 'Failed to save entry'
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
      bmi: 'IMC',
      addEntry: 'Agregar Entrada',
      noData: 'Sin datos. ¡Agrega tu primera entrada!',
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
      tabTitle: 'Perfil'
    },
    settings: {
      title: 'Opciones',
      dataManagement: 'Gestión de Datos',
      importCsv: 'Importar CSV',
      importCsvDesc: 'Importa tu historial desde un archivo CSV.\nFormato: fecha (YYYY-MM-DD), peso, cintura, cadera, piernas',
      about: 'Acerca de',
      desc: 'Weight Tracker v1.0\nDesarrollado con Expo y SQLite.',
      importSuccess: 'Importación Exitosa',
      importError: 'Error al importar CSV',
      recordsImported: 'registros importados.',
      tabTitle: 'Opciones',
      language: 'Idioma',
      selectLanguage: 'Seleccionar Idioma'
    },
    addEntry: {
      title: 'Nueva Entrada',
      weight: 'Peso (kg) *',
      waist: 'Cintura (cm)',
      hip: 'Cadera (cm)',
      legs: 'Piernas (cm)',
      date: 'Fecha',
      save: 'Guardar',
      cancel: 'Cancelar',
      validationWeight: 'El peso es obligatorio',
      error: 'Error al guardar la entrada'
    },
    common: {
        error: 'Error',
        success: 'Éxito'
    }
  }
};

export type Locale = 'en' | 'es';
export type TranslationKeys = typeof translations.en;
