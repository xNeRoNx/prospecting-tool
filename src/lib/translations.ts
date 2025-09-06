export const translations = {
  en: {
    // Navigation
    crafting: "Crafting",
    museum: "Museum", 
    equipment: "Equipment Simulation",
    collectibles: "Custom Collectibles",
    
    // Common UI
    add: "Add",
    remove: "Remove",
    delete: "Delete",
    edit: "Edit",
    save: "Save",
    cancel: "Cancel",
    close: "Close",
    export: "Export",
    import: "Import",
    reset: "Reset",
    clear: "Clear",
    total: "Total",
    summary: "Summary",
    owned: "Owned",
    needed: "Needed",
    completed: "Completed",
    quantity: "Quantity",
    weight: "Weight",
    note: "Note",
    
    // Language
    language: "Language",
    english: "English",
    polish: "Polish",
    
    // Header
    supportCreator: "Support Creator",
    exportData: "Export Data", 
    importData: "Import Data",
    
    // Crafting
    craftingList: "Crafting List",
    addItem: "Add Item",
    materials: "Materials",
    stats: "Stats",
    cost: "Cost",
    recipe: "Recipe",
    showMinimal: "Show minimal materials",
    showTotal: "Show total materials",
    minimalNeeded: "Minimal needed",
    markAsCrafted: "Mark as crafted",
    addToEquipment: "Add to equipment",
    materialsSummary: "Materials Summary",
    canCraft: "Can craft",
    totalCost: "Total Cost",
    
    // Museum
    displayCase: "Display Case",
    modifier: "Modifier",
    museumStats: "Museum Stats",
    totalBonus: "Total Bonus",
    rarity: "Rarity",
    effect: "Effect",
    
    // Equipment
    rings: "Rings",
    necklace: "Necklace", 
    charm: "Charm",
    shovel: "Shovel",
    pan: "Pan",
    enchant: "Enchant",
    baseStats: "Base Stats",
    withMuseum: "With Museum Bonuses",
    customStats: "Custom Stats",
    
    // Stats
    luck: "Luck",
    digStrength: "Dig Strength",
    digSpeed: "Dig Speed", 
    shakeStrength: "Shake Strength",
    shakeSpeed: "Shake Speed",
    capacity: "Capacity",
    sellBoost: "Sell Boost",
    sizeBoost: "Size Boost",
    modifierBoost: "Modifier Boost",
    toughness: "Toughness",
    
    // Collectibles
    selectOre: "Select Ore",
    addOre: "Add Ore",
    oreList: "Ore List",
    
    // Messages
    noItems: "No items added yet",
    noMaterials: "No materials needed",
    importSuccess: "Data imported successfully",
    importError: "Error importing data",
    exportSuccess: "Data exported successfully",
    invalidFile: "Invalid file format",
    
    // Tooltips
    craftingTooltip: "Plan your crafting queue and track materials",
    museumTooltip: "Optimize your museum display for maximum bonuses",
    equipmentTooltip: "Simulate equipment builds and calculate stats",
    collectiblesTooltip: "Track your ore collection progress"
  },
  
  pl: {
    // Navigation  
    crafting: "Tworzenie",
    museum: "Muzeum",
    equipment: "Symulacja Ekwipunku", 
    collectibles: "Niestandardowe Kolekcje",
    
    // Common UI
    add: "Dodaj",
    remove: "Usuń",
    delete: "Skasuj", 
    edit: "Edytuj",
    save: "Zapisz",
    cancel: "Anuluj",
    close: "Zamknij",
    export: "Eksportuj",
    import: "Importuj", 
    reset: "Resetuj",
    clear: "Wyczyść",
    total: "Razem",
    summary: "Podsumowanie",
    owned: "Posiadane",
    needed: "Potrzebne", 
    completed: "Ukończone",
    quantity: "Ilość",
    weight: "Waga",
    note: "Notatka",
    
    // Language
    language: "Język",
    english: "Angielski", 
    polish: "Polski",
    
    // Header
    supportCreator: "Wspomóż Twórcę",
    exportData: "Eksportuj Dane",
    importData: "Importuj Dane",
    
    // Crafting
    craftingList: "Lista Tworzenia",
    addItem: "Dodaj Przedmiot",
    materials: "Materiały", 
    stats: "Statystyki",
    cost: "Koszt",
    recipe: "Przepis",
    showMinimal: "Pokaż minimalne materiały",
    showTotal: "Pokaż wszystkie materiały",
    minimalNeeded: "Minimalna potrzeba",
    markAsCrafted: "Oznacz jako stworzone",
    addToEquipment: "Dodaj do ekwipunku",
    materialsSummary: "Podsumowanie Materiałów",
    canCraft: "Można stworzyć",
    totalCost: "Łączny Koszt",
    
    // Museum  
    displayCase: "Gablota",
    modifier: "Modyfikator",
    museumStats: "Statystyki Muzeum",
    totalBonus: "Łączny Bonus",
    rarity: "Rzadkość",
    effect: "Efekt",
    
    // Equipment
    rings: "Pierścienie",
    necklace: "Naszyjnik",
    charm: "Talizman", 
    shovel: "Łopata",
    pan: "Patelnia",
    enchant: "Zaklęcie",
    baseStats: "Podstawowe Statystyki", 
    withMuseum: "Z Bonusami z Muzeum",
    customStats: "Niestandardowe Statystyki",
    
    // Stats
    luck: "Luck",
    digStrength: "Dig Strength", 
    digSpeed: "Dig Speed",
    shakeStrength: "Shake Strength",
    shakeSpeed: "Shake Speed",
    capacity: "Capacity",
    sellBoost: "Sell Boost",
    sizeBoost: "Size Boost",
    modifierBoost: "Modifier Boost",
    toughness: "Toughness",
    
    // Collectibles
    selectOre: "Wybierz Rudę",
    addOre: "Dodaj Rudę", 
    oreList: "Lista Rud",
    
    // Messages
    noItems: "Nie dodano jeszcze przedmiotów",
    noMaterials: "Nie potrzeba materiałów",
    importSuccess: "Dane zaimportowane pomyślnie",
    importError: "Błąd importowania danych",
    exportSuccess: "Dane wyeksportowane pomyślnie", 
    invalidFile: "Nieprawidłowy format pliku",
    
    // Tooltips
    craftingTooltip: "Zaplanuj kolejkę tworzenia i śledź materiały",
    museumTooltip: "Zoptymalizuj wystawę w muzeum dla maksymalnych bonusów",
    equipmentTooltip: "Symuluj zestawy ekwipunku i obliczaj statystyki",
    collectiblesTooltip: "Śledź postęp kolekcji rud"
  }
} as const;

export type Language = keyof typeof translations;
export type TranslationKey = keyof typeof translations.en;