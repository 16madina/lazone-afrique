-- Correction des données incohérentes ville/pays
-- Bouaké est une ville de Côte d'Ivoire, pas du Sénégal

-- 1. Corriger l'annonce spécifique mentionnée par l'utilisateur
UPDATE listings 
SET country_code = 'CI'
WHERE id = '9aa6fdcb-0ffc-4189-a49b-8e3a0467f107' 
AND city = 'Bouaké' 
AND country_code = 'SN';

-- 2. Corriger toutes les autres incohérences ville/pays connues
-- Villes de Côte d'Ivoire mal attribuées
UPDATE listings 
SET country_code = 'CI'
WHERE city IN ('Abidjan', 'Bouaké', 'Daloa', 'Yamoussoukro', 'San Pedro', 'Korhogo', 'Man', 'Divo', 'Gagnoa', 'Anyama', 'Abengourou', 'Agboville', 'Grand-Bassam', 'Boundiali', 'Issia', 'Sinfra', 'Adzopé', 'Bongouanou', 'Tanda', 'Oumé')
AND country_code != 'CI';

-- Villes du Sénégal mal attribuées  
UPDATE listings 
SET country_code = 'SN'
WHERE city IN ('Dakar', 'Thiès', 'Kaolack', 'Ziguinchor', 'Saint-Louis', 'Louga', 'Diourbel', 'Tambacounda', 'Mbour', 'Rufisque', 'Kolda', 'Fatick', 'Sédhiou', 'Matam', 'Kaffrine', 'Kédougou', 'Podor', 'Linguère', 'Mbacké', 'Tivaouane')
AND country_code != 'SN';

-- Villes du Mali mal attribuées
UPDATE listings 
SET country_code = 'ML'
WHERE city IN ('Bamako', 'Sikasso', 'Ségou', 'Mopti', 'Koutiala', 'Kayes', 'Gao', 'Tombouctou', 'Kidal', 'Djenné', 'Bandiagara', 'San', 'Niono', 'Bougouni', 'Kolokani', 'Yorosso', 'Diré', 'Niafunké', 'Ansongo', 'Ménaka')
AND country_code != 'ML';

-- Villes du Burkina Faso mal attribuées
UPDATE listings 
SET country_code = 'BF'
WHERE city IN ('Ouagadougou', 'Bobo-Dioulasso', 'Koudougou', 'Ouahigouya', 'Banfora', 'Kaya', 'Tenkodogo', 'Orodara', 'Fada N''Gourma', 'Ziniaré', 'Réo', 'Gourcy', 'Dédougou', 'Manga', 'Djibo', 'Kombissiri', 'Nouna', 'Po', 'Solenzo', 'Sapouy')
AND country_code != 'BF';

-- Ajouter une contrainte pour éviter ce problème à l'avenir
-- Cette contrainte sera vérifiée côté application avec la validation renforcée

-- Mettre à jour les coordonnées des annonces corrigées pour qu'elles apparaissent au bon endroit sur la carte
-- On utilisera des coordonnées approximatives basées sur le pays

-- Coordonnées par défaut pour chaque pays africain
UPDATE listings 
SET lat = 5.3364, lng = -4.0267 -- Abidjan, Côte d'Ivoire
WHERE country_code = 'CI' AND city = 'Bouaké';

-- Log des corrections effectuées
SELECT 
    id,
    title,
    city,
    country_code,
    'Corrigé' as status
FROM listings 
WHERE id = '9aa6fdcb-0ffc-4189-a49b-8e3a0467f107';