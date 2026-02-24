TripTogether – commandes serveur / déploiement
Connexion SSH au VPS
bash
ssh ubuntu@<VPS_HOST>
# ou avec clé spécifique
ssh -i ~/.ssh/id_ed25519_triptogether ubuntu@<VPS_HOST>
Répertoire du projet
bash
cd /var/www/triptogether
ls
Git sur le serveur
bash
# Voir l’état
git status

# Récupérer la dernière version de main en écrasant les changements locaux
git fetch origin
git reset --hard origin/main

=================================================
Script de déploiement manuel
bash
/home/ubuntu/deploy-triptogether.sh
Contenu actuel du script :

bash
#!/bin/bash
set -e

# Charger nvm / Node
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

echo "=== [TripTogether] Déploiement lancé ==="

cd /var/www/triptogether

echo "-> reset sur origin/main (écrase les changements locaux éventuels)"
git fetch origin
git reset --hard origin/main

echo "-> npm install (monorepo racine, sans tout supprimer)"
npm install

echo "-> build frontend"
cd client
npm install
npm run build
cd ..

echo "-> install backend deps"
cd server
npm install
cd ..

echo "-> redémarrage PM2"
pm2 restart triptogether-api || pm2 start npm --name triptogether-api -- start
pm2 save

echo "=== [TripTogether] Déploiement terminé ==="
Gestion de Node / nvm
bash
# Charger nvm (utile dans une nouvelle session SSH)
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Vérifier la version de Node
node -v

# Lister les versions installées
nvm ls
Commandes npm utiles (sur le serveur)
À la racine du projet :

bash
cd /var/www/triptogether

# Réinstaller toutes les dépendances du monorepo
npm install

# Build du frontend uniquement
cd client
npm install
npm run build
cd ..
PM2 – gestion de l’API
bash
# Voir les process
pm2 list

# Logs de l’API
pm2 logs triptogether-api

# Redémarrer l’API
pm2 restart triptogether-api

# Démarrer l’API si pas encore déclarée
cd /var/www/triptogether/server
pm2 start npm --name triptogether-api -- start

# Sauvegarder la config PM2 (pour redémarrage auto)
pm2 save

========================================
GitHub Actions – déploiement CI/CD
Workflow : .github/workflows/deploy.yml

Déclencheur : on: push sur la branche main.

Étapes principales :

actions/checkout@v4

webfactory/ssh-agent@v0.9.0 avec SSH_PRIVATE_KEY

SSH vers le VPS et exécution de /home/ubuntu/deploy-triptogether.sh.

Requêtes SQL utiles
Catégories de dépenses :

sql
INSERT INTO expense_category (id, name) VALUES
  (1, 'Transport'),
  (2, 'Activités'),
  (3, 'Nourriture'),
  (4, 'Autre'),
  (5, 'Logement')
ON DUPLICATE KEY UPDATE
  name = VALUES(name);