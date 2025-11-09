-- Seed data for development/testing
-- Insérer des données de test

-- Note: Les profils utilisateurs seront créés automatiquement via le trigger handle_new_user()
-- lors de l'inscription via Supabase Auth

-- Exemples d'annonces (requièrent des user_id existants)
-- À remplacer par de vrais UUID après avoir créé des comptes

/*
INSERT INTO listings (
    user_id,
    title,
    description,
    type,
    property_type,
    city,
    neighborhood,
    address,
    price,
    rooms,
    bathrooms,
    surface_area,
    latitude,
    longitude
) VALUES
(
    'user-uuid-1',
    'Magnifique appartement 3 pièces à Adidogomé',
    'Bel appartement situé au cœur de Adidogomé, proche du centre-ville. Dispose de 3 chambres, 2 salles de bain, un salon moderne et une cuisine équipée. Sécurisé avec gardien.',
    'location',
    'appartement',
    'Lomé',
    'Adidogomé',
    'Rue de la Paix, Porte 15',
    150000,
    3,
    2,
    80,
    6.1667,
    1.2167
),
(
    'user-uuid-1',
    'Maison familiale 4 pièces à Nyékonakpoè',
    'Spacieuse maison de 4 chambres avec cour privée et jardin. Idéal pour une famille. Proche des écoles et commerces.',
    'location',
    'maison',
    'Lomé',
    'Nyékonakpoè',
    'Avenue du Général de Gaulle',
    300000,
    4,
    3,
    150,
    6.1500,
    1.2000
),
(
    'user-uuid-2',
    'Terrain constructible à vendre - Tokoin',
    'Terrain constructible de 500m² situé dans une zone résidentielle en développement. Toutes les commodités à proximité.',
    'vente',
    'terrain',
    'Lomé',
    'Tokoin',
    'Route de l''Aéroport',
    20000000,
    0,
    0,
    500,
    6.1667,
    1.2167
);
*/






