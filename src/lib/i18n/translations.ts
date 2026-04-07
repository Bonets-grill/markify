export type Lang = 'en' | 'es' | 'fr' | 'de' | 'it'

export const SUPPORTED_LANGS: Lang[] = ['en', 'es', 'fr', 'de', 'it']

export const LANG_NAMES: Record<Lang, string> = {
  en: 'English',
  es: 'Español',
  fr: 'Français',
  de: 'Deutsch',
  it: 'Italiano',
}

interface Translations {
  // Common
  appName: string
  tagline: string
  loading: string
  save: string
  cancel: string
  delete: string
  create: string
  edit: string
  back: string
  next: string
  submit: string
  confirm: string
  close: string
  search: string
  filter: string
  noResults: string
  error: string
  success: string
  warning: string
  copied: string
  copyToClipboard: string

  // Auth
  login: string
  register: string
  logout: string
  email: string
  password: string
  confirmPassword: string
  fullName: string
  companyName: string
  forgotPassword: string
  resetPassword: string
  verifyEmail: string
  verifyEmailDesc: string
  alreadyHaveAccount: string
  dontHaveAccount: string
  loginSuccess: string
  registerSuccess: string
  invalidCredentials: string
  passwordMismatch: string

  // Navigation
  dashboard: string
  content: string
  certificates: string
  detection: string
  apiKeys: string
  webhooks: string
  usage: string
  docs: string
  settings: string
  billing: string

  // Dashboard
  welcomeBack: string
  quickStart: string
  quickStartDesc: string
  totalItems: string
  itemsThisMonth: string
  apiCalls: string
  detections: string
  step1Title: string
  step1Desc: string
  step2Title: string
  step2Desc: string
  step3Title: string
  step3Desc: string

  // API Keys
  apiKeysTitle: string
  apiKeysDesc: string
  createApiKey: string
  apiKeyName: string
  apiKeyPermissions: string
  apiKeyCreated: string
  apiKeyCreatedDesc: string
  revokeKey: string
  revokeKeyConfirm: string
  keyPrefix: string
  lastUsed: string
  expiresAt: string
  never: string
  active: string
  revoked: string
  permWatermark: string
  permDetect: string
  permVerify: string
  permCertificates: string

  // Settings
  settingsTitle: string
  tenantSettings: string
  companyInfo: string
  companySlug: string
  companyDomain: string
  theme: string
  darkMode: string
  lightMode: string
  systemMode: string
  language: string

  // Landing
  heroTitle: string
  heroSubtitle: string
  heroDeadline: string
  ctaGetStarted: string
  ctaTryFree: string
  ctaViewDocs: string
  featureWatermark: string
  featureWatermarkDesc: string
  featureDetect: string
  featureDetectDesc: string
  featureCertify: string
  featureCertifyDesc: string
  featureApi: string
  featureApiDesc: string
  pricingTitle: string
  pricingFree: string
  pricingStarter: string
  pricingPro: string
  pricingEnterprise: string
  pricingMonth: string
  pricingItemsMonth: string
  pricingApiKeys: string
  pricingUnlimited: string

  // Plans
  free: string
  starter: string
  pro: string
  enterprise: string
  currentPlan: string
  upgradePlan: string
}

export const T: Record<Lang, Translations> = {
  en: {
    appName: 'Markify',
    tagline: 'Watermark. Label. Comply.',
    loading: 'Loading...',
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    create: 'Create',
    edit: 'Edit',
    back: 'Back',
    next: 'Next',
    submit: 'Submit',
    confirm: 'Confirm',
    close: 'Close',
    search: 'Search',
    filter: 'Filter',
    noResults: 'No results found',
    error: 'Error',
    success: 'Success',
    warning: 'Warning',
    copied: 'Copied!',
    copyToClipboard: 'Copy to clipboard',

    login: 'Sign In',
    register: 'Sign Up',
    logout: 'Sign Out',
    email: 'Email',
    password: 'Password',
    confirmPassword: 'Confirm Password',
    fullName: 'Full Name',
    companyName: 'Company Name',
    forgotPassword: 'Forgot password?',
    resetPassword: 'Reset Password',
    verifyEmail: 'Verify Your Email',
    verifyEmailDesc: 'We sent a verification link to your email. Please check your inbox.',
    alreadyHaveAccount: 'Already have an account?',
    dontHaveAccount: "Don't have an account?",
    loginSuccess: 'Welcome back!',
    registerSuccess: 'Account created! Check your email to verify.',
    invalidCredentials: 'Invalid email or password',
    passwordMismatch: 'Passwords do not match',

    dashboard: 'Dashboard',
    content: 'Content',
    certificates: 'Certificates',
    detection: 'Detection',
    apiKeys: 'API Keys',
    webhooks: 'Webhooks',
    usage: 'Usage',
    docs: 'Documentation',
    settings: 'Settings',
    billing: 'Billing',

    welcomeBack: 'Welcome back',
    quickStart: 'Quick Start Guide',
    quickStartDesc: 'Get started with Markify in 3 simple steps',
    totalItems: 'Total Items',
    itemsThisMonth: 'Items This Month',
    apiCalls: 'API Calls',
    detections: 'Detections',
    step1Title: '1. Create an API Key',
    step1Desc: 'Generate an API key to authenticate your requests.',
    step2Title: '2. Watermark Content',
    step2Desc: 'Send your AI-generated content to our API for watermarking.',
    step3Title: '3. Verify & Certify',
    step3Desc: 'Verify watermarks and generate compliance certificates.',

    apiKeysTitle: 'API Keys',
    apiKeysDesc: 'Manage your API keys for authenticating requests.',
    createApiKey: 'Create API Key',
    apiKeyName: 'Key Name',
    apiKeyPermissions: 'Permissions',
    apiKeyCreated: 'API Key Created',
    apiKeyCreatedDesc: 'Copy your API key now. You won\'t be able to see it again.',
    revokeKey: 'Revoke',
    revokeKeyConfirm: 'Are you sure you want to revoke this API key? This action cannot be undone.',
    keyPrefix: 'Key',
    lastUsed: 'Last Used',
    expiresAt: 'Expires',
    never: 'Never',
    active: 'Active',
    revoked: 'Revoked',
    permWatermark: 'Watermark',
    permDetect: 'Detect',
    permVerify: 'Verify',
    permCertificates: 'Certificates',

    settingsTitle: 'Settings',
    tenantSettings: 'Organization Settings',
    companyInfo: 'Company Information',
    companySlug: 'Slug',
    companyDomain: 'Custom Domain',
    theme: 'Theme',
    darkMode: 'Dark',
    lightMode: 'Light',
    systemMode: 'System',
    language: 'Language',

    heroTitle: 'AI Content Transparency, Automated',
    heroSubtitle: 'Watermark, label, and certify AI-generated content. Comply with the EU AI Act before it\'s too late.',
    heroDeadline: 'EU AI Act deadline: August 2, 2026',
    ctaGetStarted: 'Get Started Free',
    ctaTryFree: 'Try Detection Free',
    ctaViewDocs: 'View API Docs',
    featureWatermark: 'Invisible Watermarking',
    featureWatermarkDesc: 'Embed imperceptible watermarks in images, text, and audio that survive compression, cropping, and re-encoding.',
    featureDetect: 'AI Detection',
    featureDetectDesc: 'Detect AI-generated content with high accuracy. Works with GPT, Claude, Midjourney, ElevenLabs, and more.',
    featureCertify: 'Compliance Certificates',
    featureCertifyDesc: 'Generate digitally signed certificates proving AI content origin. C2PA compatible.',
    featureApi: 'Developer-First API',
    featureApiDesc: 'RESTful API with SDKs for JavaScript, Python, Go, and PHP. Process millions of items with usage-based pricing.',
    pricingTitle: 'Simple, Transparent Pricing',
    pricingFree: 'Free',
    pricingStarter: 'Starter',
    pricingPro: 'Pro',
    pricingEnterprise: 'Enterprise',
    pricingMonth: '/month',
    pricingItemsMonth: 'items/month',
    pricingApiKeys: 'API keys',
    pricingUnlimited: 'Unlimited',

    free: 'Free',
    starter: 'Starter',
    pro: 'Pro',
    enterprise: 'Enterprise',
    currentPlan: 'Current Plan',
    upgradePlan: 'Upgrade',
  },

  es: {
    appName: 'Markify',
    tagline: 'Marca. Etiqueta. Cumple.',
    loading: 'Cargando...',
    save: 'Guardar',
    cancel: 'Cancelar',
    delete: 'Eliminar',
    create: 'Crear',
    edit: 'Editar',
    back: 'Volver',
    next: 'Siguiente',
    submit: 'Enviar',
    confirm: 'Confirmar',
    close: 'Cerrar',
    search: 'Buscar',
    filter: 'Filtrar',
    noResults: 'Sin resultados',
    error: 'Error',
    success: 'Éxito',
    warning: 'Advertencia',
    copied: '¡Copiado!',
    copyToClipboard: 'Copiar al portapapeles',

    login: 'Iniciar Sesión',
    register: 'Registrarse',
    logout: 'Cerrar Sesión',
    email: 'Correo electrónico',
    password: 'Contraseña',
    confirmPassword: 'Confirmar Contraseña',
    fullName: 'Nombre Completo',
    companyName: 'Nombre de Empresa',
    forgotPassword: '¿Olvidaste tu contraseña?',
    resetPassword: 'Restablecer Contraseña',
    verifyEmail: 'Verifica tu Email',
    verifyEmailDesc: 'Enviamos un enlace de verificación a tu correo. Revisa tu bandeja de entrada.',
    alreadyHaveAccount: '¿Ya tienes cuenta?',
    dontHaveAccount: '¿No tienes cuenta?',
    loginSuccess: '¡Bienvenido de nuevo!',
    registerSuccess: '¡Cuenta creada! Revisa tu correo para verificar.',
    invalidCredentials: 'Email o contraseña inválidos',
    passwordMismatch: 'Las contraseñas no coinciden',

    dashboard: 'Panel',
    content: 'Contenido',
    certificates: 'Certificados',
    detection: 'Detección',
    apiKeys: 'Claves API',
    webhooks: 'Webhooks',
    usage: 'Uso',
    docs: 'Documentación',
    settings: 'Ajustes',
    billing: 'Facturación',

    welcomeBack: 'Bienvenido de nuevo',
    quickStart: 'Guía de Inicio Rápido',
    quickStartDesc: 'Empieza con Markify en 3 simples pasos',
    totalItems: 'Total de Ítems',
    itemsThisMonth: 'Ítems Este Mes',
    apiCalls: 'Llamadas API',
    detections: 'Detecciones',
    step1Title: '1. Crea una Clave API',
    step1Desc: 'Genera una clave API para autenticar tus solicitudes.',
    step2Title: '2. Marca el Contenido',
    step2Desc: 'Envía tu contenido generado por IA a nuestra API para marcarlo.',
    step3Title: '3. Verifica y Certifica',
    step3Desc: 'Verifica marcas de agua y genera certificados de cumplimiento.',

    apiKeysTitle: 'Claves API',
    apiKeysDesc: 'Gestiona tus claves API para autenticar solicitudes.',
    createApiKey: 'Crear Clave API',
    apiKeyName: 'Nombre de la Clave',
    apiKeyPermissions: 'Permisos',
    apiKeyCreated: 'Clave API Creada',
    apiKeyCreatedDesc: 'Copia tu clave API ahora. No podrás verla de nuevo.',
    revokeKey: 'Revocar',
    revokeKeyConfirm: '¿Estás seguro de que quieres revocar esta clave API? Esta acción no se puede deshacer.',
    keyPrefix: 'Clave',
    lastUsed: 'Último Uso',
    expiresAt: 'Expira',
    never: 'Nunca',
    active: 'Activa',
    revoked: 'Revocada',
    permWatermark: 'Marca de Agua',
    permDetect: 'Detectar',
    permVerify: 'Verificar',
    permCertificates: 'Certificados',

    settingsTitle: 'Ajustes',
    tenantSettings: 'Ajustes de Organización',
    companyInfo: 'Información de Empresa',
    companySlug: 'Slug',
    companyDomain: 'Dominio Personalizado',
    theme: 'Tema',
    darkMode: 'Oscuro',
    lightMode: 'Claro',
    systemMode: 'Sistema',
    language: 'Idioma',

    heroTitle: 'Transparencia de Contenido IA, Automatizada',
    heroSubtitle: 'Marca, etiqueta y certifica contenido generado por IA. Cumple con el EU AI Act antes de que sea tarde.',
    heroDeadline: 'Fecha límite EU AI Act: 2 de agosto de 2026',
    ctaGetStarted: 'Empezar Gratis',
    ctaTryFree: 'Probar Detección Gratis',
    ctaViewDocs: 'Ver Documentación API',
    featureWatermark: 'Marca de Agua Invisible',
    featureWatermarkDesc: 'Inserta marcas imperceptibles en imágenes, texto y audio que sobreviven compresión, recorte y re-codificación.',
    featureDetect: 'Detección de IA',
    featureDetectDesc: 'Detecta contenido generado por IA con alta precisión. Compatible con GPT, Claude, Midjourney, ElevenLabs y más.',
    featureCertify: 'Certificados de Cumplimiento',
    featureCertifyDesc: 'Genera certificados firmados digitalmente que prueban el origen del contenido IA. Compatible con C2PA.',
    featureApi: 'API para Desarrolladores',
    featureApiDesc: 'API RESTful con SDKs para JavaScript, Python, Go y PHP. Procesa millones de ítems con precios por uso.',
    pricingTitle: 'Precios Simples y Transparentes',
    pricingFree: 'Gratis',
    pricingStarter: 'Starter',
    pricingPro: 'Pro',
    pricingEnterprise: 'Enterprise',
    pricingMonth: '/mes',
    pricingItemsMonth: 'ítems/mes',
    pricingApiKeys: 'claves API',
    pricingUnlimited: 'Ilimitado',

    free: 'Gratis',
    starter: 'Starter',
    pro: 'Pro',
    enterprise: 'Enterprise',
    currentPlan: 'Plan Actual',
    upgradePlan: 'Mejorar Plan',
  },

  fr: {
    appName: 'Markify',
    tagline: 'Marquer. Étiqueter. Conformer.',
    loading: 'Chargement...',
    save: 'Enregistrer',
    cancel: 'Annuler',
    delete: 'Supprimer',
    create: 'Créer',
    edit: 'Modifier',
    back: 'Retour',
    next: 'Suivant',
    submit: 'Soumettre',
    confirm: 'Confirmer',
    close: 'Fermer',
    search: 'Rechercher',
    filter: 'Filtrer',
    noResults: 'Aucun résultat',
    error: 'Erreur',
    success: 'Succès',
    warning: 'Avertissement',
    copied: 'Copié !',
    copyToClipboard: 'Copier dans le presse-papiers',

    login: 'Se Connecter',
    register: "S'inscrire",
    logout: 'Se Déconnecter',
    email: 'E-mail',
    password: 'Mot de passe',
    confirmPassword: 'Confirmer le mot de passe',
    fullName: 'Nom Complet',
    companyName: "Nom de l'Entreprise",
    forgotPassword: 'Mot de passe oublié ?',
    resetPassword: 'Réinitialiser le mot de passe',
    verifyEmail: 'Vérifiez votre e-mail',
    verifyEmailDesc: 'Nous avons envoyé un lien de vérification à votre e-mail. Veuillez vérifier votre boîte de réception.',
    alreadyHaveAccount: 'Vous avez déjà un compte ?',
    dontHaveAccount: "Vous n'avez pas de compte ?",
    loginSuccess: 'Bienvenue !',
    registerSuccess: 'Compte créé ! Vérifiez votre e-mail.',
    invalidCredentials: 'E-mail ou mot de passe invalide',
    passwordMismatch: 'Les mots de passe ne correspondent pas',

    dashboard: 'Tableau de Bord',
    content: 'Contenu',
    certificates: 'Certificats',
    detection: 'Détection',
    apiKeys: 'Clés API',
    webhooks: 'Webhooks',
    usage: 'Utilisation',
    docs: 'Documentation',
    settings: 'Paramètres',
    billing: 'Facturation',

    welcomeBack: 'Bienvenue',
    quickStart: 'Guide de Démarrage Rapide',
    quickStartDesc: 'Démarrez avec Markify en 3 étapes simples',
    totalItems: 'Total des Éléments',
    itemsThisMonth: 'Éléments ce Mois',
    apiCalls: 'Appels API',
    detections: 'Détections',
    step1Title: '1. Créez une Clé API',
    step1Desc: 'Générez une clé API pour authentifier vos requêtes.',
    step2Title: '2. Marquez le Contenu',
    step2Desc: "Envoyez votre contenu généré par l'IA à notre API pour le marquer.",
    step3Title: '3. Vérifiez et Certifiez',
    step3Desc: 'Vérifiez les filigranes et générez des certificats de conformité.',

    apiKeysTitle: 'Clés API',
    apiKeysDesc: "Gérez vos clés API pour l'authentification des requêtes.",
    createApiKey: 'Créer une Clé API',
    apiKeyName: 'Nom de la Clé',
    apiKeyPermissions: 'Permissions',
    apiKeyCreated: 'Clé API Créée',
    apiKeyCreatedDesc: 'Copiez votre clé API maintenant. Vous ne pourrez plus la voir.',
    revokeKey: 'Révoquer',
    revokeKeyConfirm: 'Êtes-vous sûr de vouloir révoquer cette clé API ? Cette action est irréversible.',
    keyPrefix: 'Clé',
    lastUsed: 'Dernière Utilisation',
    expiresAt: 'Expire',
    never: 'Jamais',
    active: 'Active',
    revoked: 'Révoquée',
    permWatermark: 'Filigrane',
    permDetect: 'Détecter',
    permVerify: 'Vérifier',
    permCertificates: 'Certificats',

    settingsTitle: 'Paramètres',
    tenantSettings: "Paramètres de l'Organisation",
    companyInfo: "Informations de l'Entreprise",
    companySlug: 'Slug',
    companyDomain: 'Domaine Personnalisé',
    theme: 'Thème',
    darkMode: 'Sombre',
    lightMode: 'Clair',
    systemMode: 'Système',
    language: 'Langue',

    heroTitle: "Transparence du Contenu IA, Automatisée",
    heroSubtitle: "Marquez, étiquetez et certifiez le contenu généré par l'IA. Conformez-vous à l'EU AI Act avant qu'il ne soit trop tard.",
    heroDeadline: "Date limite EU AI Act : 2 août 2026",
    ctaGetStarted: 'Commencer Gratuitement',
    ctaTryFree: 'Essayer la Détection Gratuite',
    ctaViewDocs: "Voir la Documentation API",
    featureWatermark: 'Filigrane Invisible',
    featureWatermarkDesc: "Intégrez des filigranes imperceptibles dans les images, textes et audio qui résistent à la compression, au recadrage et au réencodage.",
    featureDetect: "Détection d'IA",
    featureDetectDesc: "Détectez le contenu généré par l'IA avec une haute précision. Compatible avec GPT, Claude, Midjourney, ElevenLabs et plus.",
    featureCertify: 'Certificats de Conformité',
    featureCertifyDesc: "Générez des certificats signés numériquement prouvant l'origine du contenu IA. Compatible C2PA.",
    featureApi: 'API pour Développeurs',
    featureApiDesc: "API RESTful avec SDKs pour JavaScript, Python, Go et PHP. Traitez des millions d'éléments avec une tarification à l'usage.",
    pricingTitle: 'Tarification Simple et Transparente',
    pricingFree: 'Gratuit',
    pricingStarter: 'Starter',
    pricingPro: 'Pro',
    pricingEnterprise: 'Enterprise',
    pricingMonth: '/mois',
    pricingItemsMonth: 'éléments/mois',
    pricingApiKeys: 'clés API',
    pricingUnlimited: 'Illimité',

    free: 'Gratuit',
    starter: 'Starter',
    pro: 'Pro',
    enterprise: 'Enterprise',
    currentPlan: 'Plan Actuel',
    upgradePlan: 'Passer au Supérieur',
  },

  de: {
    appName: 'Markify',
    tagline: 'Markieren. Kennzeichnen. Konform.',
    loading: 'Laden...',
    save: 'Speichern',
    cancel: 'Abbrechen',
    delete: 'Löschen',
    create: 'Erstellen',
    edit: 'Bearbeiten',
    back: 'Zurück',
    next: 'Weiter',
    submit: 'Absenden',
    confirm: 'Bestätigen',
    close: 'Schließen',
    search: 'Suchen',
    filter: 'Filtern',
    noResults: 'Keine Ergebnisse gefunden',
    error: 'Fehler',
    success: 'Erfolg',
    warning: 'Warnung',
    copied: 'Kopiert!',
    copyToClipboard: 'In die Zwischenablage kopieren',

    login: 'Anmelden',
    register: 'Registrieren',
    logout: 'Abmelden',
    email: 'E-Mail',
    password: 'Passwort',
    confirmPassword: 'Passwort bestätigen',
    fullName: 'Vollständiger Name',
    companyName: 'Firmenname',
    forgotPassword: 'Passwort vergessen?',
    resetPassword: 'Passwort zurücksetzen',
    verifyEmail: 'E-Mail verifizieren',
    verifyEmailDesc: 'Wir haben einen Bestätigungslink an Ihre E-Mail gesendet. Bitte überprüfen Sie Ihren Posteingang.',
    alreadyHaveAccount: 'Haben Sie bereits ein Konto?',
    dontHaveAccount: 'Noch kein Konto?',
    loginSuccess: 'Willkommen zurück!',
    registerSuccess: 'Konto erstellt! Überprüfen Sie Ihre E-Mail zur Verifizierung.',
    invalidCredentials: 'Ungültige E-Mail oder Passwort',
    passwordMismatch: 'Passwörter stimmen nicht überein',

    dashboard: 'Dashboard',
    content: 'Inhalt',
    certificates: 'Zertifikate',
    detection: 'Erkennung',
    apiKeys: 'API-Schlüssel',
    webhooks: 'Webhooks',
    usage: 'Nutzung',
    docs: 'Dokumentation',
    settings: 'Einstellungen',
    billing: 'Abrechnung',

    welcomeBack: 'Willkommen zurück',
    quickStart: 'Schnellstart-Anleitung',
    quickStartDesc: 'Starten Sie mit Markify in 3 einfachen Schritten',
    totalItems: 'Gesamtelemente',
    itemsThisMonth: 'Elemente diesen Monat',
    apiCalls: 'API-Aufrufe',
    detections: 'Erkennungen',
    step1Title: '1. API-Schlüssel erstellen',
    step1Desc: 'Generieren Sie einen API-Schlüssel zur Authentifizierung Ihrer Anfragen.',
    step2Title: '2. Inhalt markieren',
    step2Desc: 'Senden Sie Ihren KI-generierten Inhalt an unsere API zur Markierung.',
    step3Title: '3. Verifizieren und Zertifizieren',
    step3Desc: 'Verifizieren Sie Wasserzeichen und generieren Sie Compliance-Zertifikate.',

    apiKeysTitle: 'API-Schlüssel',
    apiKeysDesc: 'Verwalten Sie Ihre API-Schlüssel für die Authentifizierung von Anfragen.',
    createApiKey: 'API-Schlüssel erstellen',
    apiKeyName: 'Schlüsselname',
    apiKeyPermissions: 'Berechtigungen',
    apiKeyCreated: 'API-Schlüssel erstellt',
    apiKeyCreatedDesc: 'Kopieren Sie Ihren API-Schlüssel jetzt. Sie können ihn nicht erneut anzeigen.',
    revokeKey: 'Widerrufen',
    revokeKeyConfirm: 'Sind Sie sicher, dass Sie diesen API-Schlüssel widerrufen möchten? Diese Aktion kann nicht rückgängig gemacht werden.',
    keyPrefix: 'Schlüssel',
    lastUsed: 'Zuletzt verwendet',
    expiresAt: 'Läuft ab',
    never: 'Nie',
    active: 'Aktiv',
    revoked: 'Widerrufen',
    permWatermark: 'Wasserzeichen',
    permDetect: 'Erkennen',
    permVerify: 'Verifizieren',
    permCertificates: 'Zertifikate',

    settingsTitle: 'Einstellungen',
    tenantSettings: 'Organisationseinstellungen',
    companyInfo: 'Firmeninformationen',
    companySlug: 'Slug',
    companyDomain: 'Benutzerdefinierte Domain',
    theme: 'Design',
    darkMode: 'Dunkel',
    lightMode: 'Hell',
    systemMode: 'System',
    language: 'Sprache',

    heroTitle: 'KI-Inhaltstransparenz, Automatisiert',
    heroSubtitle: 'Markieren, kennzeichnen und zertifizieren Sie KI-generierte Inhalte. Erfüllen Sie den EU AI Act, bevor es zu spät ist.',
    heroDeadline: 'EU AI Act Frist: 2. August 2026',
    ctaGetStarted: 'Kostenlos starten',
    ctaTryFree: 'Erkennung kostenlos testen',
    ctaViewDocs: 'API-Dokumentation ansehen',
    featureWatermark: 'Unsichtbares Wasserzeichen',
    featureWatermarkDesc: 'Betten Sie unmerkliche Wasserzeichen in Bilder, Text und Audio ein, die Komprimierung, Zuschnitt und Neukodierung überstehen.',
    featureDetect: 'KI-Erkennung',
    featureDetectDesc: 'Erkennen Sie KI-generierte Inhalte mit hoher Genauigkeit. Kompatibel mit GPT, Claude, Midjourney, ElevenLabs und mehr.',
    featureCertify: 'Compliance-Zertifikate',
    featureCertifyDesc: 'Generieren Sie digital signierte Zertifikate, die den Ursprung von KI-Inhalten belegen. C2PA-kompatibel.',
    featureApi: 'Entwickler-API',
    featureApiDesc: 'RESTful API mit SDKs für JavaScript, Python, Go und PHP. Verarbeiten Sie Millionen von Elementen mit nutzungsbasierter Preisgestaltung.',
    pricingTitle: 'Einfache, Transparente Preise',
    pricingFree: 'Kostenlos',
    pricingStarter: 'Starter',
    pricingPro: 'Pro',
    pricingEnterprise: 'Enterprise',
    pricingMonth: '/Monat',
    pricingItemsMonth: 'Elemente/Monat',
    pricingApiKeys: 'API-Schlüssel',
    pricingUnlimited: 'Unbegrenzt',

    free: 'Kostenlos',
    starter: 'Starter',
    pro: 'Pro',
    enterprise: 'Enterprise',
    currentPlan: 'Aktueller Plan',
    upgradePlan: 'Upgrade',
  },

  it: {
    appName: 'Markify',
    tagline: 'Filigrana. Etichetta. Conformità.',
    loading: 'Caricamento...',
    save: 'Salva',
    cancel: 'Annulla',
    delete: 'Elimina',
    create: 'Crea',
    edit: 'Modifica',
    back: 'Indietro',
    next: 'Avanti',
    submit: 'Invia',
    confirm: 'Conferma',
    close: 'Chiudi',
    search: 'Cerca',
    filter: 'Filtra',
    noResults: 'Nessun risultato trovato',
    error: 'Errore',
    success: 'Successo',
    warning: 'Avviso',
    copied: 'Copiato!',
    copyToClipboard: 'Copia negli appunti',

    login: 'Accedi',
    register: 'Registrati',
    logout: 'Esci',
    email: 'E-mail',
    password: 'Password',
    confirmPassword: 'Conferma Password',
    fullName: 'Nome Completo',
    companyName: "Nome dell'Azienda",
    forgotPassword: 'Password dimenticata?',
    resetPassword: 'Reimposta Password',
    verifyEmail: 'Verifica la tua E-mail',
    verifyEmailDesc: 'Abbiamo inviato un link di verifica alla tua e-mail. Controlla la tua casella di posta.',
    alreadyHaveAccount: 'Hai già un account?',
    dontHaveAccount: 'Non hai un account?',
    loginSuccess: 'Bentornato!',
    registerSuccess: 'Account creato! Controlla la tua e-mail per la verifica.',
    invalidCredentials: 'E-mail o password non validi',
    passwordMismatch: 'Le password non corrispondono',

    dashboard: 'Dashboard',
    content: 'Contenuto',
    certificates: 'Certificati',
    detection: 'Rilevamento',
    apiKeys: 'Chiavi API',
    webhooks: 'Webhooks',
    usage: 'Utilizzo',
    docs: 'Documentazione',
    settings: 'Impostazioni',
    billing: 'Fatturazione',

    welcomeBack: 'Bentornato',
    quickStart: 'Guida Rapida',
    quickStartDesc: 'Inizia con Markify in 3 semplici passaggi',
    totalItems: 'Totale Elementi',
    itemsThisMonth: 'Elementi Questo Mese',
    apiCalls: 'Chiamate API',
    detections: 'Rilevamenti',
    step1Title: '1. Crea una Chiave API',
    step1Desc: 'Genera una chiave API per autenticare le tue richieste.',
    step2Title: '2. Marca il Contenuto',
    step2Desc: "Invia il tuo contenuto generato dall'IA alla nostra API per la marcatura.",
    step3Title: '3. Verifica e Certifica',
    step3Desc: 'Verifica le filigrane e genera certificati di conformità.',

    apiKeysTitle: 'Chiavi API',
    apiKeysDesc: "Gestisci le tue chiavi API per l'autenticazione delle richieste.",
    createApiKey: 'Crea Chiave API',
    apiKeyName: 'Nome della Chiave',
    apiKeyPermissions: 'Permessi',
    apiKeyCreated: 'Chiave API Creata',
    apiKeyCreatedDesc: 'Copia la tua chiave API ora. Non potrai vederla di nuovo.',
    revokeKey: 'Revoca',
    revokeKeyConfirm: 'Sei sicuro di voler revocare questa chiave API? Questa azione non può essere annullata.',
    keyPrefix: 'Chiave',
    lastUsed: 'Ultimo Utilizzo',
    expiresAt: 'Scade',
    never: 'Mai',
    active: 'Attiva',
    revoked: 'Revocata',
    permWatermark: 'Filigrana',
    permDetect: 'Rilevare',
    permVerify: 'Verificare',
    permCertificates: 'Certificati',

    settingsTitle: 'Impostazioni',
    tenantSettings: "Impostazioni dell'Organizzazione",
    companyInfo: "Informazioni sull'Azienda",
    companySlug: 'Slug',
    companyDomain: 'Dominio Personalizzato',
    theme: 'Tema',
    darkMode: 'Scuro',
    lightMode: 'Chiaro',
    systemMode: 'Sistema',
    language: 'Lingua',

    heroTitle: "Trasparenza dei Contenuti IA, Automatizzata",
    heroSubtitle: "Marca, etichetta e certifica i contenuti generati dall'IA. Conformati all'EU AI Act prima che sia troppo tardi.",
    heroDeadline: "Scadenza EU AI Act: 2 agosto 2026",
    ctaGetStarted: 'Inizia Gratis',
    ctaTryFree: 'Prova il Rilevamento Gratis',
    ctaViewDocs: 'Vedi Documentazione API',
    featureWatermark: 'Filigrana Invisibile',
    featureWatermarkDesc: "Incorpora filigrane impercettibili in immagini, testo e audio che resistono a compressione, ritaglio e ricodifica.",
    featureDetect: "Rilevamento IA",
    featureDetectDesc: "Rileva contenuti generati dall'IA con alta precisione. Compatibile con GPT, Claude, Midjourney, ElevenLabs e altri.",
    featureCertify: 'Certificati di Conformità',
    featureCertifyDesc: "Genera certificati firmati digitalmente che provano l'origine del contenuto IA. Compatibile C2PA.",
    featureApi: 'API per Sviluppatori',
    featureApiDesc: "API RESTful con SDK per JavaScript, Python, Go e PHP. Elabora milioni di elementi con prezzi basati sull'utilizzo.",
    pricingTitle: 'Prezzi Semplici e Trasparenti',
    pricingFree: 'Gratuito',
    pricingStarter: 'Starter',
    pricingPro: 'Pro',
    pricingEnterprise: 'Enterprise',
    pricingMonth: '/mese',
    pricingItemsMonth: 'elementi/mese',
    pricingApiKeys: 'chiavi API',
    pricingUnlimited: 'Illimitato',

    free: 'Gratuito',
    starter: 'Starter',
    pro: 'Pro',
    enterprise: 'Enterprise',
    currentPlan: 'Piano Attuale',
    upgradePlan: 'Aggiorna',
  },
}

export function getLang(langCode?: string): Lang {
  if (!langCode) return 'en'
  const code = langCode.split('-')[0].toLowerCase()
  if (SUPPORTED_LANGS.includes(code as Lang)) return code as Lang
  return 'en'
}
