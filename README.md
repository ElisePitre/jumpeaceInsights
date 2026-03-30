# Project Repo Template & GitHub Classroom Instructions

**Purpose:** This repository is the starter *template* for student project repositories. In GitHub Classroom we will use this template so each group gets a well-organized repo with instructions, a design doc, a src folder, etc.

---

## What to edit after your repo is created
1. Update **Team information** at the top of this file: team name, team members and GitHub usernames.
2. Put lab work in `labs/`
3. Document your meetings in `docs/meeting_notes.md`
4. Fill out `design.md` with your requirements and design as you work on the project.
5. Put code in `src/`, tests in `tests/`, and update `requirements.txt` if needed.

---

## Team information
- Team name: JumPeace_g3
- Team members: Elise Pitre (ElisePitre)
                Jian Min Lim (JianMin-Lim)
                Puneeet Chaudhary (puneetchaudharyy)
                Matthew Breen (mztttt)
                Eli Webster (EliWebster)
                Amina Hassan (ahassana09)
                Cole Burgi (CBurgi)
                Umang Deval (umangdeval)
- Trello Board: https://trello.com/w/cis3750group32/

## Project management setup
- With your assigned group, set-up a Team Project website on Trello(trello.com) to manage your project.
- Add a link to your Trello board here.
- Share your board with the 3750 email (cis3750@socs.uoguelph.ca).

# 1. Environment Setup

### 1.1 Create Virtual Environment
1. run `python3 -m venv venv`
2. Start venv
    a. If in linux, run `source venv/bin/activate`
    b, If in Windows, run `venv\Scripts\activate.bat`

## 1.1.1 Terminal 1: Back end
1. cd into `project-setup-jumpeace_g3/src`

### 1.1.2 Install python dependencies
1. run `pip install -r requirements.txt`

### 1.1.3 Start backend
1. run `python3 run.py`

## 1.2 Terminal 2: Front end
1. cd into `project-setup-jumpeace_g3/src/templates/static`

### 1.2.1 Install node modules
1. run `npm install`

### 1.2.2 Start frontend
1. run `npm run watch`

## 1.3 Web browser: Access Website
1. Go to `localhost:5000`

# 2. Firebase Setup (First Time on a New Computer)

If a teammate is running this project on their computer for the first time, they should do this once from the project root.

## 2.1 Login to Firebase CLI
1. run `firebase login`
2. run `firebase use jumppeace-7c331`

## 2.2 Generate Data Connect SDK
1. run `firebase dataconnect:sdk:generate`

## 2.3 Deploy Data Connect (only when schema/query files changed)
1. run `firebase deploy --only dataconnect`

## 2.4 Notes
1. `firebase login` is required per machine for Firebase CLI commands.
2. `firebase deploy --only dataconnect` is not needed every run; only after Data Connect schema/connector updates.
3. App users may still need to sign in inside the app for user-protected queries.
