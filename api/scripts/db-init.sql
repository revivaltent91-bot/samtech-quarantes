-- Exécuter en tant que superutilisateur :  sudo -u postgres psql -f scripts/db-init.sql
CREATE ROLE quarantes LOGIN PASSWORD 'quarantes';
CREATE DATABASE quarantes OWNER quarantes;
CREATE DATABASE quarantes_test OWNER quarantes;