# 🎓 CampusVisitor

> Système de gestion des visiteurs pour le campus de l’École Normale Supérieure de Marrakech

---

## 📌 Description

CampusVisitor est une application permettant de gérer les visiteurs au sein d’un campus universitaire de manière sécurisée et organisée.

Le système remplace les méthodes traditionnelles par une solution numérique offrant :
- ✔ Sécurité des accès
- ✔ Traçabilité des visites
- ✔ Gestion centralisée

---

## 🏗️ Structure du projet
CAMPUS_VISITOR/
├── campus-visitor-api # Backend (Node.js / Express)
├── campus-visitor-frontend # Frontend (React.js)
├── CampusVisitor-android # Mobile (Android)
├── figures # Images et captures
└── README.md

## Architecture De Project 
<img width="848" height="742" alt="architecture" src="https://github.com/user-attachments/assets/72f1ea01-8346-45d9-b8cf-9d91a40b17a0" />
## Architecture du DataBase
<img width="428" height="693" alt="database" src="https://github.com/user-attachments/assets/921abdd7-a2ba-4bf4-961a-a2ec34445c2c" />

---
📸 Demo Web 


📸 Demo mobile


📸 Captures
## Web 
## Login
<img width="960" height="484" alt="login" src="https://github.com/user-attachments/assets/f86888cd-d290-499a-82ce-5f5fe8d23fc0" />
## Dashboard
<img width="960" height="484" alt="dash" src="https://github.com/user-attachments/assets/d158f431-5dd2-48f1-8b47-5e043475dd44" />
## Visits
<img width="953" height="482" alt="visits" src="https://github.com/user-attachments/assets/8839cd47-0bf6-44a5-964b-021133bcfa00" />
## Visitors 
<img width="960" height="481" alt="visitors" src="https://github.com/user-attachments/assets/8a20e192-877f-431a-ac0a-424821e86f9a" />
## Hosts 
<img width="960" height="482" alt="hosts" src="https://github.com/user-attachments/assets/678721fe-8268-4181-9d51-e8a4a942f8e8" />



## ⚙️ Technologies utilisées

### 🔹 Backend
- Node.js
- Express.js
- PostgreSQL
- JWT (authentification)
- bcrypt

### 🔹 Frontend
- React.js
- Axios

### 🔹 Mobile
- Android (Java)
- Volley

---

## 👥 Rôles

### 👨‍💼 Administrateur
- Gérer visiteurs et hôtes
- Valider / refuser les visites
- Consulter le dashboard et les logs

### 🛡️ Agent
- Effectuer le check-in
- Consulter les visites

### 🧑‍🏫 Hôte
- Valider / refuser les demandes
- Effectuer le check-out

### 👤 Visiteur
- Demander une visite
- Suivre l’état de la demande

---

## 🚀 Fonctionnalités

- ✔ Authentification sécurisée (JWT)
- ✔ Gestion des visites
- ✔ Validation / refus
- ✔ Check-in / Check-out
- ✔ Tableau de bord
- ✔ Journal des événements
- ✔ API REST
- ✔ Application mobile Android

---

## 🔗 API Endpoints

| Méthode | Endpoint | Description |
|--------|---------|------------|
| POST | /api/auth/login | Authentification |
| GET | /api/visits | Liste des visites |
| POST | /api/visits | Créer une visite |
| PATCH | /api/visits/:id/status | Valider / Refuser |
| POST | /api/visits/:id/check-in | Check-in |
| POST | /api/visits/:id/check-out | Check-out |
| GET | /api/logs | Logs |
| GET | /api/dashboard | Dashboard |

---

## 🛠️ Installation

### 1. Cloner le projet

bash
git clone https://github.com/nouhaylasabiq21-commits/CAMPUS_VISITOR.git
cd CAMPUS_VISITOR

2. Backend
cd campus-visitor-api
npm install
npm start
