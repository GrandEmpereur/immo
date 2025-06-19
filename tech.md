Parfait. Je vais maintenant générer un document technique et fonctionnel complet pour une IA de développement, afin de coder un supercalculateur de rentabilité immobilière moderne. Il utilisera Next.js 15 avec TypeScript, Tailwind v4, Zod, Zustand, ShadCN UI, Better Auth et Supabase (si besoin backend). L’outil inclura l’ensemble des logiques fiscales, économiques, et réglementaires à jour 2025, ainsi que tous les calculs de TRI, cash-flow, amortissements, reventes, DPE, etc.

Le document décrira :

* Les composants front-end (UI + logique)
* Les schémas Zod pour validation des données utilisateur
* L’état global avec Zustand
* Les composants graphiques (Recharts via Shadcn/Chartcn)
* Les exports professionnels PDF & Excel (ciblant banquiers)
* L’intégration potentielle à Supabase
* Une roadmap API pour intégrations futures (DPE, DVF, impôts, loyers INSEE, etc.)

Je reviens très bientôt avec ce document prêt à être utilisé pour le développement.


# Spécifications Techniques et Fonctionnelles – Supercalculateur de Rentabilité Immobilière

## Introduction

Ce document présente les spécifications complètes pour développer un **supercalculateur de rentabilité immobilière** destiné à des investisseurs expérimentés. Il décrit les fonctionnalités métier, l’architecture technique, les composants UI, les calculs financiers détaillés et les contraintes réglementaires à respecter. L’outil cible une application front-end **Next.js 15** écrite en **TypeScript**, tirant parti de **Tailwind CSS v4** pour le style, de la librairie **shadcn/UI** pour des composants modernes modulaires, et de **Zod** pour la validation de schémas de données. La gestion d’état est assurée via **Zustand**, avec persistance locale et option de sauvegarde sur le cloud (**Supabase**). Une authentification utilisateur sécurisée pourra être implémentée avec **Better Auth** (en conjonction avec Supabase Auth), afin de proposer la sauvegarde des simulations et un espace personnel. Le document intègre les exigences fonctionnelles validées lors de l’audit précédent, couvrant notamment : saisie des données d’investissement, choix du régime fiscal, calculs de rentabilités (brute, nette, nette-nette), cash-flows, fiscalité (IR/PS), amortissements LMNP, TRI/ROI, simulation de revente, export de rapports PDF/Excel, ainsi qu’une feuille de route pour des intégrations futures (DPE, DVF, API fiscales, etc.). L’objectif est de fournir une spécification claire, détaillée et structurée, exploitable par une équipe de développeurs ou une IA afin de générer l’application complète.

## Architecture du projet

**Structure générale :** Le projet adoptera l’architecture standard Next.js (App Router) avec une organisation modulaire des dossiers. Voici la structure des répertoires et fichiers clés :

* **`app/`** – Contient les pages et routes principales de l’application. Grâce à Next.js 15, on utilisera le dossier `app` avec des segments pour le formulaire de simulation, les résultats et les éventuelles pages d’authentification. Par exemple :

  * `app/layout.tsx` : composant de layout global (incluant le fournisseur Zustand, le thème Tailwind, etc.).
  * `app/page.tsx` : page d’accueil (éventuellement une introduction ou redirection vers la page de simulation).
  * `app/simulation/page.tsx` : page principale de la simulation immobilière (formulaire multi-étapes Typeform-like).
  * `app/simulation/results/page.tsx` : page ou section affichant les résultats détaillés (peut être la suite du formulaire ou une page séparée selon navigation).
  * `app/login/page.tsx` et `app/register/page.tsx` : pages d’authentification si on implémente la gestion de comptes (Better Auth).

* **`components/`** – Regroupe les composants UI réutilisables. On distinguera plusieurs sous-dossiers :

  * `components/form/` : composants liés au formulaire multi-étapes (champs de saisie personnalisés, sélecteurs, étapes du wizard, boutons Suivant/Précédent, etc.).
  * `components/results/` : composants pour l’affichage des résultats (graphiques, tableaux, cartes de synthèse).
  * `components/ui/` : composants génériques ou provenant de **shadcn/UI** (boutons, modales, onglets, tooltips, etc., éventuellement adaptés/stylés). Shadcn UI fournira une base cohérente et accessible pour ces éléments.
  * `components/layout/` : en-tête (header avec éventuellement le menu utilisateur ou le bouton de connexion), pied de page, etc.

* **`lib/`** – Code métier et utilitaires purs, sans dépendance à React. On y placera :

  * `lib/calculs.ts` : implémente les fonctions de calcul financier (ex: calcul de mensualité de prêt, rentabilités, amortissements, TRI, etc.).
  * `lib/format.ts` : fonctions utilitaires de formatage (pourcentage, monnaie, arrondis, etc.).
  * `lib/supabase.ts` : configuration du client Supabase (URL du projet, clé publique) pour interagir avec la base de données et l’authentification.
  * `lib/pdf.ts` (optionnel) : utilitaires pour générer un PDF (via une librairie type **jsPDF** ou **pdfmake**) et `lib/excel.ts` pour générer un export Excel (via **SheetJS**). Ces fichiers contiendront la logique d’export formattant les données calculées en document.

* **`schemas/`** – Définit les schémas de données et validations Zod :

  * `schemas/simulation.ts` : schéma Zod de la simulation (incluant tous les champs d’entrée utilisateur avec leurs contraintes). Ce schéma servira de source de vérité pour valider les données tout au long du formulaire.
  * `schemas/user.ts` (optionnel) : schéma de profil utilisateur si nécessaire (par exemple, préférences, historique).

* **`store/`** – Configuration du store Zustand, découpé en **slices** pour séparer les états logiques :

  * `store/simulation.ts` : gestion de l’état de la simulation en cours (valeurs des champs saisis, état d’avancement de l’assistant, etc.).
  * `store/results.ts` : état des résultats calculés (par ex, objets contenant les indicateurs financiers, tableaux de projection, etc., mis à jour après calcul).
  * `store/user.ts` : état utilisateur (informations du compte connecté, liste des simulations sauvegardées, etc.).

* **Fichiers de configuration** :

  * `tailwind.config.js` : configuration de Tailwind CSS v4 (incluant le preset de shadcn UI pour obtenir les styles par défaut de composants, et les couleurs/design system éventuels).
  * `tsconfig.json` : configuration TypeScript (strict mode activé pour fiabilité).
  * `.eslintrc.json`, `.prettierrc` : linting/formatting pour assurer la qualité du code.
  * `next.config.js` : configuration Next.js (par exemple activer les images distantes si on en affiche, etc.).

**Dépendances principales :** L’application s’appuiera sur un ensemble de technologies modernes : Next.js 15 et React 18+, TypeScript strict, Tailwind CSS v4, shadcn/UI (qui repose sur Radix UI pour l’accessibilité). La validation de données utilise Zod pour garantir l’intégrité des entrées utilisateur. Zustand gère l’état global de manière légère et modulable, avec persistance éventuelle (via `zustand/middleware` pour synchroniser avec `localStorage`). L’authentification, si activée, utilisera Better Auth – une surcouche améliorée de NextAuth optimisée pour Next.js 15 – offrant des améliorations de performance et de DX par rapport à l’Auth de Supabase natif. Better Auth permet une intégration sans douleur avec Next.js et Supabase (stockage des utilisateurs en base), tout en évitant le chargement client lourd du SDK Supabase Auth. Supabase sera utilisé côté backend en mode BaaS : base de données Postgres (pour stocker les simulations enregistrées et les profils utilisateurs), système d’authentification (si besoin, couplé à Better Auth), et stockage de fichiers (pour éventuellement sauvegarder des PDFs générés ou d’autres exports, bien que dans un premier temps les exports se feront côté client). L’application sera déployable sur Vercel ou un environnement équivalent, profitant du rendu côté client pour l’essentiel (les calculs étant effectués sur le front), avec possibilité d’utiliser des **API routes** Next.js pour certaines tâches (ex: génération de PDF serveur si on vise une qualité typographique supérieure, ou appel sécurisé à des APIs externes). Toutefois, dans un premier temps, aucune API custom hébergée n’est strictement nécessaire : toutes les fonctionnalités peuvent être implémentées en front (les calculs et la logique d’export se faisant directement dans le navigateur).

**Gestion de l’état et des données :** Grâce à **Zustand**, nous opterons pour un store global subdivisé en slices pour isoler les préoccupations :

* *Slice Simulation* : contiendra toutes les données saisies par l’utilisateur dans le formulaire (type de bien, prix, paramètres de prêt, loyers, charges, régime fiscal, etc.), ainsi que des métadonnées comme l’étape courante de l’assistant.
* *Slice Résultats* : contiendra les résultats calculés (valeurs de rentabilités, tableaux de cash-flow annuel, indicateurs de performance, etc.). Cette séparation permet de recalculer et mettre à jour ce slice indépendamment dès que la simulation est complète ou qu’une valeur critique change.
* *Slice Utilisateur* : contiendra les informations de l’utilisateur connecté (token de session, profil basique) et éventuellement les simulations sauvegardées ou favorites.

Chaque slice sera créé via `create<SliceState>()` de Zustand, avec possibilité d’utiliser le middleware de persistance. Par exemple, le slice Simulation pourra être configuré avec `persist` pour stocker automatiquement les données en localStorage, garantissant qu’un utilisateur non connecté retrouve sa saisie en cas de rechargement de page. Si l’utilisateur est connecté via Supabase, on pourra synchroniser ces données avec la base : par exemple, proposer un bouton « Sauvegarder la simulation » qui envoie le slice Simulation (ou seulement les inputs nécessaires) vers Supabase (table `simulations`). En lecture, on pourra hydrater le store depuis Supabase (par exemple, charger une simulation sauvegardée dans le store Simulation pour la modifier ou la recalculer).

**Sécurité et performances :** Toutes les validations de données seront effectuées en temps réel via Zod côté client, évitant les incohérences (détails dans la section dédiée). Le calcul des indicateurs financiers est relativement intensif (projection sur 30 ans, TRI itératif, etc.), mais demeure très rapide en JavaScript pour un seul projet – l’utilisateur n’observera pas de latence significative. Il n’est donc pas nécessaire de déporter ces calculs côté serveur. Toutefois, on veillera à bien isoler ces calculs dans des fonctions pures (`lib/calculs.ts`) pour faciliter les tests unitaires et la maintenabilité. L’utilisation de Next.js 15 permettra de tirer parti du streaming et du rendu côté serveur si besoin pour certaines pages, mais ici l’application s’apparente à un SPA calculatoire, pouvant être principalement rendue côté client.

## Arborescence des composants UI

L’interface utilisateur sera composée de multiples composants modulaires, favorisant la réutilisation et la lisibilité. Voici les principaux composants à développer, organisés par fonctionnalité :

* **Wizard de Formulaire Multi-étapes** – Inspiré d’une UX type *Typeform*, la saisie des données se fera via un assistant interactif, affichant une question ou un groupe de champs par étape, avec une logique dynamique (certaines étapes ou champs apparaissent en fonction des choix précédents). Les composants clés :

  * `SimulationFormWizard` : composant parent orchestrant les étapes. Il gère la navigation (étape suivante/précédente), l’envoi final et peut afficher une barre de progression.

  * `StepPropertyType` : étape 1 – Choix du type de bien. Un composant de sélection (boutons ou cards) permettant de choisir parmi **Neuf**, **Ancien**, **Saisonnier**. Ce choix influence la suite : par ex, sélectionner *Saisonnier* pré-sélectionnera un régime LMNP (meublé) et pourra activer des champs spécifiques (taux d’occupation).

  * `StepPurchaseDetails` : étape 2 – Saisie des détails d’achat. Inclut des champs : **Prix d’achat** (€), **Frais de notaire** (€ ou % calculé automatiquement selon neuf/ancien), **Surface** (m²). Ces champs utilisent des composants input numériques formatés (par ex, composant personnalisé `CurrencyInput` avec préfixe €). Les valeurs sont validées à la volée (prix > 0, frais de notaire >= 0, surface > 0, etc.).

  * `StepFinancing` : étape 3 – Paramètres de financement. Champs : **Apport** (€ d’apport personnel), **Montant du crédit** (calculé = prix + notaire – apport, ou saisi directement), **Taux d’intérêt** (%, annuel), **Durée du crédit** (années), **Taux assurance emprunteur** (% ou montant mensuel). Un toggle pourrait permettre de choisir « pas de crédit (100% comptant) », ce qui désactiverait les champs taux/durée. La mensualité de crédit pourra être affichée dynamiquement dès que taux et durée sont renseignés, pour feedback utilisateur.

  * `StepRentAndCharges` : étape 4 – Revenus locatifs et charges. Champs : **Loyer mensuel** (€), **Charges récupérables** (€ mensuel, charges payées par le bailleur mais refacturées au locataire), **Charges non récupérables** (€ mensuel, charges à la charge finale du bailleur : ex taxe foncière proratisée, charges de copro non récupérables, assurance, gestion, etc.), **Vacance locative** (en % du temps ou en mois par an, représentant la vacance estimée). L’UI peut présenter la vacance comme un slider de 0 à 100% ou un champ « Nombre de mois non loués par an ». Ces données serviront à calculer le loyer effectif perçu.

  * `StepTaxRegime` : étape 5 – Choix du **Régime fiscal** de location. Ici un ensemble d’options conditionnées par les étapes précédentes :

    * Si le bien est **Loué nu** (non meublé) – options : *Micro-Foncier* (revenus < 15 000 €) ou *Réel foncier*.
    * Si le bien est **Meublé (LMNP/LMP)** – options : *Micro-BIC* (recettes < 77 700 €) ou *Régime Réel Simplifié*. On précisera que LMNP réel permet l’amortissement du bien. Si le statut LMP (professionnel) est atteint (recettes > 23 000 € ET > 50% des revenus du foyer), le calcul de fiscalité diffèrera (imposition BIC pro, cotisations sociales, etc.), mais pour simplifier on peut le déduire du contexte ou le laisser en option explicite *LMP* à cocher.
    * Si un **Dispositif de défiscalisation** est envisagé – options exclusives selon le type de bien : *Pinel* (neuf ou rénové éligible, engagement 6/9/12 ans), *Denormandie* (ancien à rénover en zone éligible), *Malraux* (ancien en secteur patrimonial avec travaux), etc. Ces choix activeront des champs complémentaires pour saisir les informations nécessaires :

      * Pinel : demander la **durée d’engagement** (6, 9 ou 12 ans) qui déterminera le taux de réduction d’impôt (12%, 18% ou 21% du prix d’achat). On s’assurera que le bien est neuf ou réhabilité et respecte les critères (le simulateur pourra supposer que oui, les plafonds de loyer et de ressources étant des contraintes externes).
      * Denormandie : similaire à Pinel en terme de réduction (12, 18, 21%) mais pour de l’ancien avec travaux. On demandera le **montant des travaux éligibles** (au moins 25% du coût total). La réduction porte sur le total (prix + travaux) plafonné à 300 000 €.
      * Malraux : demande le **montant des travaux de rénovation** prévus. La réduction d’impôt Malraux sera calculée comme 30% des travaux (en secteur PSMV) ou 22% selon la zone, plafonné à 400 000 € sur 4 ans. On vérifiera que le bien est ancien en secteur éligible.
      * LMNP/LMP : si l’utilisateur a sélectionné meublé sans dispositif particulier, par défaut le régime réel sera proposé pour optimiser l’amortissement (sauf s’il a préféré micro-BIC). S’il indique LMP (loueur pro), on prendra en compte les particularités fiscales (voir section calculs).

    L’UI pour cette étape pourrait être un ensemble de boutons radio ou de cartes illustrées pour chaque régime, avec des infobulles (tooltips) expliquant les avantages de chacun. La sélection du régime fiscal va déclencher des validations conditionnelles (par ex, si micro-foncier mais loyers estimés > 15k€, on affichera un avertissement ou on interdira le choix micro).

  * `StepDPE` : (optionnel, peut être fusionné avec le résumé ou une étape avancée) – **Diagnostic de Performance Énergétique**. L’utilisateur pourra indiquer le classement énergétique du bien (A à G). Ceci permettra :

    * de signaler les contraintes légales à venir : par ex, un bien classé G ne pourra plus être loué à partir de 2025, F en 2028, E en 2034. L’assistant peut afficher un message d’alerte si un DPE F ou G est saisi, indiquant l’échéance d’interdiction de location.
    * d’anticiper d’éventuels travaux : on pourra proposer à l’utilisateur de simuler une rénovation énergétique (ex : passer de G à D) avec un coût estimé et un impact sur la rentabilité, mais cela peut être une amélioration future. Dans un premier temps, on se borne à stocker la classe DPE et notifier l’investisseur des risques (section conformité plus bas).

  * `StepSummary` : une étape finale récapitulative (avant affichage détaillé des résultats ou couplée avec ceux-ci) qui liste toutes les hypothèses saisies. L’utilisateur peut vérifier l’ensemble des données d’entrée et éventuellement revenir en arrière modifier quelque chose avant de lancer le calcul final. Cette étape sert de **transition** entre la saisie et les résultats. Un bouton « Calculer la rentabilité » va alors déclencher le calcul des indicateurs et afficher la section des **Résultats**.

* **Composants de Résultats** – Une fois le calcul effectué, l’interface affiche une **synthèse visuelle** riche. Les principaux composants de cette section :

  * `ResultsOverview` : composant de **résumé synthétique**, présentant les indicateurs clés sous forme de cartes ou de tuiles. Par exemple : **Rentabilité brute**, **Rentabilité nette**, **Rentabilité nette-nette** (post-fiscalité), **Cash-flow mensuel net** (ou effort d’épargne mensuel), **TRI sur 10/20/30 ans**, **ROI global**, etc. Chacune de ces cartes affichera la valeur calculée et peut-être une indication graphique (flèche, icône) ou un comparatif à un benchmark (ex: brute 5% vs moyenne marché \~5.9%). Des info-bulles expliqueront chaque métrique (notamment le sens de nette-nette, TRI, etc.).

  * `FinanceCharts` : ensemble de graphiques interactifs (réalisés avec **Recharts** ou Chart.js) pour visualiser l’évolution des finances du projet :

    * **Graphique de Cash-flow annuel** : un histogramme barres par année montrant le cash-flow net annuel (loyers encaissés – charges – impôts – remboursement du prêt). Ceci permet de voir si le projet est déficitaire les premières années et à quel moment il devient excédentaire. On pourra mettre en évidence les années où le prêt est remboursé (forte hausse du cash-flow une fois l’emprunt terminé).
    * **Graphique de Trésorerie Cumulative** : une courbe cumulant les flux de trésorerie au fil des ans, éventuellement comparée à l’apport initial. Cette courbe franchit zéro au point mort (quand les loyers nets cumulés ont remboursé l’apport initial). Cela donne une idée visuelle de l’**horizon de récupération** de l’investissement.
    * **Graphique de Valorisation & Dette** : si on intègre une hypothèse d’évolution de la valeur du bien, on peut afficher la courbe de valorisation du bien dans le temps (par ex +2%/an) et la courbe du capital restant dû du prêt. Le croisement de ces courbes indique le moment où la valeur dépasse significativement la dette, etc. C’est utile pour évaluer une revente optimale. (Ce graphique est optionnel, en fonction des hypothèses disponibles).
    * **Graphique de Répartition des charges** : un diagramme en camembert montrant comment se répartissent les revenus vs les diverses charges (emprunt, charges exploitation, impôts). Ceci illustre quelle part du loyer part dans chaque poste.

    Ces graphiques seront construits avec une charte cohérente (couleurs issues de Tailwind config, style shadcn). L’utilisation de **Recharts** permettra d’avoir des composants de graphique réactifs et personnalisables, ou alternativement on stylisera Chart.js via un wrapper React.

  * `ResultsTable` : un **tableau de données dynamique** présentant la projection année par année sur 30 ans. Ce tableau utilisera **TanStack Table** pour bénéficier d’un rendu performant même avec de nombreux calculs, et d’éventuelles fonctionnalités interactives (tri, filtrage, export). Les colonnes typiques : Année, Loyer brut annuel, Charges, Intérêts d’emprunt, Amortissements (si LMNP réel), Résultat avant impôt, Impôts (IR+PS), Cash-flow net annuel, Cumul cash-flow, Capital restant dû, Valeur estimée du bien, Plus-value latente, etc. L’utilisateur pourra ainsi voir très en détail l’évolution de chaque paramètre chaque année. Un scroll horizontal sera sans doute nécessaire étant donné le nombre de colonnes. On veillera à geler la première colonne (Année) pour la lisibilité, ce que TanStack Table supporte. Ce tableau sert également de base à l’**export Excel**, car il contient toutes les données calculées sur la période.

  * `AmortizationTable` : un tableau plus spécifique sur le prêt immobilier, affichant le plan d’amortissement du crédit mois par mois ou année par année (selon granularité souhaitée). Colonnes : période, intérêt payé, principal remboursé, capital restant. On peut combiner ce tableau avec le précédent (par exemple inclure les colonnes d’intérêts et capital dans le ResultsTable), ou le garder séparé pour clarté. S’il est séparé, on utilisera également TanStack Table pour un affichage optimal et triable.

  * `ExportButtons` : une barre d’outils pour exporter les résultats. Y figureront un bouton **Exporter en PDF** et **Exporter en Excel**. En cliquant :

    * PDF : génère un document PDF formaté, incluant les sections mentionnées dans les spécifications (hypothèses de simulation, tableaux d’amortissement, synthèse de rentabilité, graphiques, fiscalité, projection sur 30 ans…). Le design sera professionnel et épuré, adapté à une présentation bancaire (chiffres clés bien mis en avant, graphiques en couleurs sobres). La génération pourra se faire côté client avec une bibliothèque (par ex **jsPDF** permettant d’assembler du texte et des graphiques en PDF). On veillera à la pagination (par ex un résumé page 1, détails page 2-n). Si la qualité n’est pas suffisante en client (notamment pour inclure les graphiques en bonne définition), on pourra implémenter une route API Next.js utilisant par exemple **Puppeteer** pour générer un PDF à partir d’un template HTML haute fidélité.
    * Excel : génère un fichier XLSX contenant les tableaux de données (notamment le tableau de projection annuel et éventuellement une feuille pour le plan d’amortissement). On pourra utiliser **SheetJS (xlsx)** pour créer le classeur en mémoire et le proposer en téléchargement. L’export Excel sera utile aux investisseurs souhaitant faire leurs propres analyses complémentaires.

  * `LoginModal` ou `AuthDialog` (optionnel) : si l’utilisateur non connecté clique sur « Sauvegarder » ou « Mon espace », une fenêtre de connexion apparaîtra (via Better Auth). Ce composant gérera la saisie email/mot de passe ou l’OAuth, et affichera les erreurs d’authentification. Better Auth fournissant des hooks, l’implémentation sera facilitée.

  * `SavedSimulationsList` : si l’utilisateur est connecté, une page ou section listant ses simulations sauvegardées (avec nom du projet, date, principaux indicateurs). L’utilisateur peut cliquer pour recharger une simulation dans le formulaire (en remplissant le store simulation avec ces valeurs). Ce composant fera appel à Supabase (RPC ou requête) pour récupérer la liste depuis la table `simulations` liée à l’utilisateur.

**Design et ergonomie :** L’ensemble de l’UI sera responsive (via Tailwind, on utilisera les utilities pour adapter la grille du formulaire sur mobile vs desktop). L’expérience sera interactive et fluide : par exemple, le passage d’une étape de formulaire à la suivante pourra être animé (transition glissée type carousel ou fondu, rappelant Typeform où chaque question apparaît successivement). Les boutons seront clairement libellés (« Suivant », « Précédent »). Un indicateur d’étape (par exemple des étapes numérotées ou une barre de progression) sera affiché en haut du formulaire pour situer l’utilisateur. Chaque champ important aura une aide contextuelle (icône “?” affichant une **Tooltip** utilisant Radix UI) pour définir les termes (expliquant ce qu’on entend par charges récupérables vs non récupérables, ce qu’est le **TRI**, la **rentabilité nette-nette**, etc.). Ces explications guidées sont importantes pour un investisseur même expérimenté, car elles rappellent comment chaque chiffre est calculé.

Visuellement, on adoptera une charte moderne et sobre, cohérente avec du produit financier. Shadcn UI aidera à cela en fournissant des composants bien dessinés et facilement personnalisables via CSS variables et classes Tailwind. On utilisera une palette de couleurs professionalisante (par ex bleus/gris pour la confiance, et quelques touches de vert/rouge pour indiquer les valeurs positives/négatives dans les cash-flows). La typographie sera soignée pour les rapports, avec des polices lisibles et alignements uniformes (par ex, les montants alignés à droite avec le même nombre de décimales).

## Détail des calculs financiers et formules

Le cœur du supercalculateur repose sur des calculs financiers précis. Tous les résultats affichés sont dérivés des données d’entrée selon des formules transparentes décrites ci-dessous. Les calculs couvriront la rentabilité locative (brute, nette, nette-nette), les flux de trésorerie, l’amortissement comptable (LMNP), le rendement global (TRI, ROI), ainsi que les impacts fiscaux et la plus-value à la revente.

**1. Calcul du loyer net annuel et du cash-flow mensuel :**

* *Loyer brut annuel* = **Loyer mensuel** × 12. C’est le revenu locatif théorique si le bien était loué en continu.
* *Loyer effectif annuel* = loyer brut annuel ajusté de la vacance. Si on définit une **vacance locative** en % *v* (par ex 8% = \~1 mois non loué), alors loyer effectif = loyer brut × (1 – *v*). Par exemple, un loyer de 800 €/mois avec 1 mois de vacance donne 800×11 = 8 800 € annuels réellement perçus.
* *Charges récupérables* : ce sont les charges que le locataire rembourse (ex: charges de copropriété récupérables). Dans le modèle, on peut considérer qu’elles n’affectent pas le rendement du bailleur (le propriétaire avance ces charges mais les récupère, donc neutre). Pour plus de précision, on peut déduire les charges récupérables du loyer brut dans le calcul de rentabilité, *uniquement* si on a inclus ces charges dans le loyer déclaré. Néanmoins, en pratique, on considérera que le loyer fourni est hors charges récupérables, et on ne les intègre donc pas aux revenus ni aux dépenses nettes du bailleur.
* *Charges non récupérables annuelles* = somme de toutes les charges à la charge du propriétaire (taxe foncière, assurances, frais de gestion, charges de copro hors récupérables, entretien courant…). Ce montant sera saisi par l’utilisateur soit en total annuel, soit déduit de valeurs mensuelles fournies.
* *Cash-flow mensuel net* = Loyer mensuel net (loyer mensuel – charges non récupérables mensuelles – mensualité de prêt – impôt mensuel sur les loyers). Ce résultat représente ce qu’il reste (positif) ou ce qu’il manque (négatif, appelé effort d’épargne) chaque mois une fois tout payé. L’impôt mensuel peut être calculé en prenant l’impôt annuel sur le revenu locatif (détaillé plus bas) divisé par 12. Le cash-flow annuel net = cash-flow mensuel × 12 (ou loyer net annuel – dépenses annuelles totales). Un cash-flow positif indique que le bien s’autofinance et génère un surplus, un cash-flow négatif indique que l’investisseur devra compléter chaque mois de sa poche (c’est **l’effort d’épargne**). Ce dernier sera mis en avant dans le rapport, car c’est un indicateur de viabilité important pour les banques.

**2. Rentabilité brute, nette et nette-nette :**
Ce sont des ratios de rendement de l’investissement locatif, calculés en pourcentage du capital investi. On utilisera les formules standard :

* **Rentabilité brute** = (Loyer brut annuel) / **Coût total d’acquisition** × 100. Le coût d’acquisition inclut le prix d’achat + frais de notaire (on peut aussi inclure les frais d’agence éventuels dans le prix si pertinents). Optionnellement, on peut inclure les frais de garantie et de dossier de prêt, mais c’est marginal. *Exemple:* Loyer 9 600 €/an, prix 200 000 + notaire 15 000 = 215 000 € de coût, rentabilité brute ≈ 4,46%. (Si un crédit est utilisé, on n’en tient pas compte dans la brute, celle-ci se place hors financement).
* **Rentabilité nette** = (Loyer net annuel **avant impôts**) / **Coût total d’acquisition** × 100. Le loyer net avant impôts = loyer effectif annuel – charges non récupérables annuelles – éventuellement **intérêts d’emprunt annuels** si on choisit de les inclure dans les charges. Il y a deux écoles : certains calculent la rentabilité nette sans intégrer le financement (uniquement charges d’exploitation), d’autres intègrent les intérêts du prêt pour refléter la réalité de l’investisseur. Nous calculerons la **rentabilité nette** **hors financement** ET éventuellement une variante **nette de financement** :

  * Rentabilité nette (hors financement) = (loyer annuel – charges annuelles d’exploitation) / coût total ×100.
  * Rentabilité nette après financement = (loyer annuel – charges exploitation – intérêts d’emprunt de l’année 1) / coût total ×100.
    Dans le rapport, on privilégiera la définition hors financement pour comparer la qualité intrinsèque du bien, et on présentera séparément le cash-flow qui lui intègre le financement. *Exemple (hors financement)* : Loyer 9 600 €, charges 2 050 €, donc loyer net 7 550 €, coût total 216 000 € (prix+frais+intérêts année 1), rentabilité nette ≈ 3,5%.
* **Rentabilité nette-nette** = (Loyer net **après impôts**) / **Coût total d’acquisition** × 100. C’est le rendement locatif réel après toutes charges *et* fiscalité, souvent le plus pertinent pour l’investisseur. Pour le calculer, on déduit de plus l’impôt sur le revenu locatif et les prélèvements sociaux payés annuellement (voir calcul fiscal plus bas) du loyer net annuel. *Formule:* rentabilité nette-nette = \[(loyer annuel – charges – intérêts – **impôts sur revenus locatifs**)/ coût total] ×100. Ce taux peut être significativement plus faible que la brute, et peut même devenir négatif dans des cas d’imposition forte (si le bien génère un déficit après impôts). Le simulateur calculera précisément l’impôt en fonction du régime fiscal choisi pour obtenir ce chiffre.

En résumé: la rentabilité brute ne prend en compte que les loyers, la nette inclut les charges, et la nette-nette inclut en plus la fiscalité, ce qui en fait l’indicateur le plus complet de la performance locative réelle. Ces taux seront présentés en pourcentage avec une décimale ou deux, accompagnés de la mention du montant de loyer net annuel correspondant pour transparence.

**3. Calcul de l’emprunt immobilier :**
Pour simuler le financement, on calcule la mensualité constante du prêt à l’aide de la formule d’annuité classique :

$\text{mensualité} = \text{montant emprunté} \times \frac{i}{1 - (1+i)^{-n}}$

où *i* = taux d’intérêt mensuel (taux annuel / 12) et *n* = nombre total de mensualités (durée en années × 12). On inclut l’assurance emprunteur si fournie (soit en l’ajoutant au taux i, par ex 1,5% intérêt + 0,2% assurance = 1,7% total, ou en calculant séparément une mensualité assurance = capital initial × taux assurance / 12, si c’est un % du capital initial assuré). Le plan d’**amortissement** du prêt est généré en calculant, pour chaque échéance mensuelle :

* Intérêt payé = capital restant × i (mensuel),
* Principal remboursé = mensualité – intérêt,
* Nouveau capital restant = précédent – principal remboursé.

On accumulera ces résultats pour chaque mois, ou au moins par année pour une vue annuelle. Le **capital restant dû** après chaque année sera utilisé dans la simulation de revente (pour calculer le capital à rembourser lors de la vente). Le coût total des intérêts sur la durée sera aussi calculé (somme des intérêts de chaque échéance).

Ce calcul d’emprunt permet d’alimenter plusieurs indicateurs : la part des intérêts est déductible fiscalement (selon régime), les intérêts influencent la rentabilité nette si on les inclut, et surtout la mensualité influence le cash-flow mensuel. Notons qu’on suppose un prêt amortissable classique à taux fixe. Si l’utilisateur souhaite simuler un prêt in-fine ou un taux variable, ce n’est pas prévu dans cette version (on restera sur le cas standard).

**4. Fiscalité des revenus locatifs (IR, PS) :**
Le simulateur prendra en compte l’imposition des loyers selon le régime choisi, calculant l’impôt sur le revenu (IR) et les prélèvements sociaux (PS, 17.2%) chaque année. Voici le détail par régime :

* *Location nue – Micro-Foncier* : Applicable si loyers bruts ≤ 15 000 € par an et aucune option pour le réel. Un **abattement forfaitaire de 30%** s’applique sur les loyers bruts. Le revenu foncier imposable = 70% des loyers. Aucune déduction de charges n’est possible (les charges réelles sont ignorées dans le calcul fiscal). L’impôt IR = revenu imposable × tranche marginale d’imposition du propriétaire, et les **prélèvements sociaux** = 17,2% du revenu imposable. *Exemple:* loyers 10 000 € ⇒ imposable 7 000 €, si TMI 30% alors IR = 2 100 €, PS = 1 204 € (17,2%), total \~3 304 € d’impôts.
  Le simulateur demandera la tranche d’imposition marginale (TMI) de l’utilisateur pour calculer l’IR (ou on partira sur une TMI par défaut de 30% si non précisé, puisque investisseurs expérimentés sont souvent dans ces tranches).

* *Location nue – Réel* : Le revenu foncier imposable = loyers encaissés – **charges déductibles**. Les charges déductibles comprennent entre autres : intérêts d’emprunt, taxe foncière, primes d’assurance, travaux d’entretien/amélioration, frais de gestion, charges de copropriété, etc.. On déduira donc du loyer effectif annuel toutes les charges non récupérables que l’utilisateur a saisies (on suppose que ces charges correspondent aux dépenses déductibles). Si le résultat est positif, il est imposé à l’IR (TMI) + 17,2% PS. Si le résultat est négatif, on a un **déficit foncier** :

  * La part de déficit due aux intérêts d’emprunt est reportable uniquement sur les revenus fonciers des 10 années suivantes.
  * La part de déficit hors intérêts (charges pures) est déductible du revenu global du foyer dans la limite de 10 700 € par an (le surplus est reportable 6 ans sur revenu global, puis 10 ans sur revenus fonciers).
    Pour simplifier, notre outil pourra indiquer qu’en cas de déficit foncier, l’économie d’impôt potentielle est la tranche marginale × déficit (limité à 10 700 € sur revenu global). On ne modélisera pas explicitement les reports sur 10 ans, cela complexifierait la projection – toutefois on peut conserver le déficit et l’imputer sur les années suivantes dans la simulation foncière. Par exemple, si l’année 1 dégage -5 000 € de déficit (hors intérêts), ce déficit réduira d’autant le revenu global (baisse d’IR), et on part à 0 l’année suivante (car utilisé). S’il y a un déficit lié aux intérêts, on le portera en memo pour l’appliquer aux revenus fonciers futurs jusqu’à épuisement sur max 10 ans.
    Le simulateur affichera pour chaque année le montant d’impôt sur revenu foncier et PS. S’il y a déficit imputé sur revenu global, on pourrait afficher une **économie d’IR** associée dans la ligne du tableau (mais cela sort du calcul strict du projet locatif, c’est un effet collatéral sur le foyer fiscal). On notera dans la fiche de résultats si un déficit foncier est constaté, avec les règles de déduction (ce point pourra aussi figurer dans la **checklist conformité** pour rappel).

* *Location meublée (LMNP/LMP) – Micro-BIC* : Si recettes locatives ≤ 77 700 € HT (plafond 2025 pour les meublés classés ou non, suite à la réforme, voir plus bas) et régime micro choisi. Un **abattement forfaitaire de 50%** s’applique sur les loyers (ou 71% si meublé de tourisme classé, jusqu’à 188 700 € de recettes en 2024, **attention réforme 2025** abordée plus bas). Donc revenu imposable BIC = 50% des loyers (ou 29% si 71% abattement). Ensuite, ce revenu imposable est soumis à l’IR (TMI) et aux prélèvements sociaux 17,2%. Il n’y a pas de déduction individuelle de charges dans ce régime, l’abattement est censé les représenter. Si l’utilisateur a beaucoup de charges (emprunt, etc.), le régime micro-BIC peut être moins favorable que le réel, ce pourquoi généralement au-delà de 50% de charges le régime réel est préféré. Le simulateur pourra comparer le résultat net des deux régimes pour information si besoin.

  *⚠ Réforme 2025 meublés de tourisme:* La loi de finances et la loi « Le Meur » fin 2024 ont modifié drastiquement le micro-BIC pour les locations saisonnières non classées. À partir des revenus 2025 :

  * Les **meublés de tourisme non classés** (Airbnb non labellisés) voient le plafond micro-BIC abaissé à **15 000 €** et l’abattement réduit à **30%** (aligné sur le micro-foncier).
  * Les meublés de tourisme classés (et chambres d’hôtes) passent au plafond 77 700 € avec abattement 50% (alors qu’avant ils avaient 71% jusqu’à 188k€).
    Ceci pour contrer les abus des locations saisonnières. Notre simulateur intègrera ces nouvelles limites : si un bien saisonnier génère >15k€ de recettes sans être classé, on affichera qu’au-delà de 15k€ le micro-BIC n’est plus possible (et qu’il faudrait passer au réel). Cet aspect sera mentionné en alerte dans l’UI et dans la checklist réglementaire.

* *Location meublée (LMNP) – Réel (régime réel simplifié BIC)* : C’est souvent le régime optimal pour louer en meublé, car il permet d’amortir le bien et déduire réellement les charges. Le **résultat BIC** est calculé comme : **recettes – charges – amortissements**. Les recettes = loyers + éventuellement autres (revenus annexes, refacturations). Les **charges déductibles** incluent ici : intérêts d’emprunt, frais de gestion, assurances, taxes, charges d’entretien, et également **dotations aux amortissements**.

  *Amortissements LMNP :* Contrairement à la location nue, on peut comptablement amortir le bien immobilier, le mobilier et les travaux, ce qui constitue un avantage fiscal majeur du LMNP. L’amortissement se calcule composant par composant selon le plan comptable, mais on utilisera une méthode simplifiée :

  * On estime que la valeur amortissable du bien (hors terrain) = \~85% du prix d’achat (le terrain \~15% non amortissable). Cette part bâtiment peut être amortie linéairement sur, disons, 25 ans (entre 20 et 30 ans couramment). Par défaut on peut choisir 25 ans → **amortissement bâtiment = 85% du prix / 25** par an (soit 3,4% du prix par an). Certains praticiens prennent 20 ans (5%/an), d’autres 30 ans (\~3.3%). Notre choix de 25 ans vise à étaler l’avantage sur la durée moyenne de détention.
  * Le mobilier (si le bien est meublé initialement) peut être amorti sur 5 à 10 ans. Si l’utilisateur a fourni un montant de mobilier ou de budget ameublement, on le répartira par ex sur 7 ans (≈14%/an). Sinon on peut estimer un mobilier par défaut (ex: 5% du prix) pour simuler.
  * Les travaux d’amélioration (s’il y en a, ex dans un ancien meublé rénové) s’amortissent généralement entre 5 et 25 ans selon nature. On pourra amortir les travaux (non déduits ailleurs) sur une durée moyenne de 10 ans par ex, pour en tenir compte.

  L’ensemble de ces amortissements annuels vient diminuer le résultat imposable BIC sans sortir de trésorerie (charge calculée). **Limite fiscale importante :** on ne peut pas créer ou accroître un déficit BIC avec les amortissements au-delà des autres revenus locatifs. En clair, on peut amortir jusqu’à annuler le profit imposable, mais pas au point de déclarer un déficit (les amortissements non utilisés sont reportés sans limite de durée). Par conséquent, notre calcul fera :

  1. Calculer le résultat avant amortissement = loyers – charges (hors amortissement).
  2. Si ce résultat est positif, on appliquera l’amortissement : si amortissement annuel > résultat avant amortissement, on limite l’amortisation déduit cette année à exactement amener le résultat à 0 (le surplus d’amortissement est reporté aux années suivantes). Si amortissement < résultat, on déduit tout et on obtient un résultat positif réduit.
  3. Si le résultat avant amortissement est déjà négatif (possible si énormes intérêts ou charges la première année), on ne peut pas utiliser l’amortissement du tout cette année (on le reporte entièrement, car on ne crée pas de déficit supplémentaire avec).
     Ainsi, typiquement pour les premières années LMNP, le résultat imposable sera nul car amortissement + intérêts > loyers, donc **impôt = 0**. Les amortissements excédentaires sont mémorisés. Au bout de X années (souvent 10-15 ans), le résultat avant amortissement augmente (loyer peut-être indexé, intérêts diminuent, etc.) et finit par absorber tout l’amortissement, à ce moment un bénéfice taxable apparaît et l’investisseur commence à payer de l’impôt. Notre simulation multi-annuelle reflètera cela : on suivra d’une année sur l’autre le stock d’amortissements reportés non déduits et on les appliquera dès qu’il y a du bénéfice imposable. **L’impôt** LMNP = résultat BIC net (après amort.) × TMI, et **prélèvements sociaux** = 17,2% du résultat si positif (les années où le résultat est nul ou déficitaire, 0€ d’IR et PS sur l’activité LMNP).

  Pour les **Loueurs Meublés Professionnels (LMP)** : le calcul du résultat est le même, mais fiscalement :

  * Si le foyer est LMP (recettes > 23k€ ET > 50% revenus), le bénéfice est imposé à l’IR dans la catégorie BIC pro, et est soumis aux cotisations sociales (environ 35-40%) au lieu des 17,2% de prélèvements sociaux. Notre outil peut simplifier en considérant que si LMP, on applique tout de même 17,2% pour ne pas trop complexifier, mais la checklist signalera qu’en LMP réel, il faut s’affilier à l’URSSAF (SSI) et que les cotisations remplacent la CSG.
  * Un avantage LMP : les déficits BIC professionnels sont imputables sur le revenu global sans plafonds (alors que LMNP non). Donc si le résultat LMP est négatif (charges + amortissements > loyers), cela peut réduire les autres revenus du foyer, économisant de l’IR. Ce niveau de détail dépasse peut-être le cadre du simulateur (il faudrait connaître les autres revenus), donc on peut simplement noter l’existence de cet avantage sans le chiffrer.
  * La plus-value de cession suit le régime des plus-values professionnelles si LMP, avec possibilité d’exonération totale après 5 ans si recettes < 90k€ (art. 151 septies CGI). Cela sera mentionné dans la partie revente pour information, mais notre calcul standard utilisera le régime des plus-values immobilières des particuliers (plus prudente par défaut).

* *Régimes Pinel/Denormandie/Malraux et impact fiscal :*
  Si l’utilisateur a choisi Pinel ou assimilé, le simulateur calculera l’**économie d’impôt annuelle** liée à la réduction Pinel. Par exemple, engagement 9 ans => réduction totale = 18% du prix (plafonné 300k), répartie linéairement sur 9 ans, donc 2% du prix par an pendant 9 ans. (Pour 12 ans : 2%/an les 9 premières années puis 1%/an les 3 dernières). On affichera le montant de réduction d’impôt par an et on l’intégrera dans le calcul du **cash-flow après impôt** (c’est un gain, donc on pourrait considérer cela comme venant compenser l’impôt ou créer un flux positif). Concrètement, l’impôt sur le revenu foncier sera calculé normalement comme location nue (Pinel impose location nue régime réel obligatoirement), puis on appliquera la réduction Pinel en diminuant l’IR à payer (sans pouvoir le rendre négatif : si la réduction dépasse l’IR dû sur le revenu global, le surplus est perdu car Pinel n’est pas remboursable). Le simulateur peut supposer que l’investisseur paie suffisamment d’impôt pour absorber la réduction (investisseurs expérimentés, c’est probable). On affichera dans la section fiscalité : « Réduction d’impôt Pinel : X € par an pendant Y ans », ce qui améliore le rendement net-net. Pareil pour Denormandie (mêmes taux que Pinel) et Malraux :

  * Malraux : la réduction est calculée sur les travaux et imputée sur l’IR global du foyer (pas uniquement foncier). On indiquera « Réduction Malraux estimée = 30% des travaux = … € étalés sur la période de travaux (généralement 2 à 4 ans) ». Comme c’est plus complexe (dépend de l’avancement des travaux), on pourra répartir sur 4 ans par ex.
  * Denormandie : identique à Pinel dans son mécanisme (réduction sur 6,9,12 ans).

  Ces dispositifs n’affectent pas le calcul des revenus imposables annuels (ils agissent en aval, via crédits d’impôt). On veillera à ne pas les confondre avec les régimes d’imposition. Pinel/Denormandie imposent le régime réel foncier, donc le calcul de revenu imposable sera fait sous « Location nue – Réel », puis on appliquera la réduction. Idem Malraux, c’est du foncier réel obligatoirement.

**5. Simulation de la revente et TRI/ROI :**
Le simulateur intègre une projection de revente du bien, afin d’estimer le gain en capital et les indicateurs de performance globaux sur la durée de détention. Les hypothèses nécessaires :

* **Année de revente** : l’utilisateur peut choisir un horizon de sortie (par ex 10 ans, 15 ans, 20 ans…). On simulera par défaut sur 30 ans maximal, mais il est utile de permettre la visualisation d’indicateurs à des horizons intermédiaires. Par défaut, on pourra calculer le TRI sur 30 ans (fin du prêt généralement) et afficher aussi le TRI à 10 ans et 20 ans pour info.
* **Valorisation du bien** : par défaut on peut supposer une inflation immobilière annuelle (par ex 2%). Mieux, on peut demander à l’utilisateur son **hypothèse d’évolution du prix** (taux annuel constant, ou une valeur de revente prévue). On utilisera cette croissance pour estimer la **Valeur du bien à la revente** l’année N : Valeur\_rev = Prix\_initial × (1 + taux)^N. Si l’utilisateur n’est pas à l’aise, on peut mettre 0% (valeur constante) par prudence, ou suggérer 2%.
* **Frais de vente** : on peut inclure 5-6% de frais d’agence à la revente en moins, mais pour simplifier, on peut calculer la plus-value brute sans frais de cession, ou laisser l’utilisateur indiquer un % de frais de cession à déduire (optionnel).

Étant donné cela, on calcule :

* **Plus-value brute** = Prix de vente – (Prix d’achat + frais d’achat éventuellement). Pour le calcul fiscal, la loi des plus-values immobilières des particuliers s’applique (hors LMP pro) :

  * **Abattement pour durée de détention (impôt sur le revenu)** : Aucune exonération avant 5 ans révolus. Puis à partir de la 6ᵉ année de détention, abattement de 6% par an sur la plus-value **imposable** (pas sur la totalité du prix !) de la 6ᵉ à la 21ᵉ année, puis 4% la 22ᵉ année. Cela aboutit à une exonération totale d’IR sur la plus-value au bout de 22 ans de détention.
  * **Abattement pour durée (prélèvements sociaux)** : plus lent, 1,65% par an de la 6ᵉ à la 21ᵉ, 1,6% la 22ᵉ, puis 9% par an de la 23ᵉ à la 30ᵉ. Exonération totale de PS au bout de 30 ans.
  * **Imposition** : le logiciel calculera la plus-value imposable après abattement en fonction de l’année de revente. Puis appliquera 19% d’IR et 17,2% de PS sur les parts imposables restantes. *Exemple:* revente après 15 ans : abattement IR = 6%×(15-5)=60%, abattement PS = 1,65%×(15-5)=16.5%. Donc 40% de la PV taxé à 19% et 83,5% à 17,2%.
    On affichera : « Plus-value imposable estimée : X € », « Impôt sur plus-value : Y € ». Si la revente est ≥ 22 ans => plus d’IR (juste PS éventuels jusqu’à 30 ans), ≥30 ans => plus aucune imposition (on pourra l’indiquer).
    *NB:* Si régime LMP pro et l’activité est exercée depuis >5 ans, le propriétaire peut bénéficier d’une exonération pro de la plus-value sous conditions (recettes < 90k€). On peut mentionner cela en note, mais on ne l’implémente pas sauf à détecter LMP et le signaler.

* **Récapitulatif financier global :** Lorsque la revente est simulée, on peut calculer le **profit total net** de l’opération = (Produit de la vente net d’impôts + loyers cumulés encaissés net d’impôts sur la période) – (apport initial + efforts d’épargne cumulés). En gros, tout ce que l’investisseur a récupéré moins tout ce qu’il a investi. Ce profit total permet de calculer deux métriques :

  * **ROI (Return on Investment) global** : = (Profit total net / Somme des apports nets investis) × 100. Ici l’« investissement » inclut l’apport initial + tous les flux négatifs ajoutés (efforts mensuels) – en pratique, c’est équivalent à (Valeur finale nette / valeur initiale nette – 1). Si on considère seulement l’apport initial comme investissement (sans reinjecter les efforts au dénominateur), on peut faire (Profit net / Apport initial). Il faut être clair sur la définition. On choisira l’approche *apport initial* pour parler au banquier : par ex *« ROI = 150% sur 20 ans »* signifierait l’investisseur a multiplié par 2,5 son apport. On pourra indiquer les deux.
  * **TRI (Taux de Rendement Interne)** : c’est le taux annualisé qui égalise la valeur actuelle nette des flux à zéro. On prendra tous les flux de trésorerie année par année :

    * Année 0 : **– Apport initial** (y compris frais notaire, etc. et éventuellement on inclut les frais de dossier, etc. s’ils ne sont pas financés).
    * Années 1 à N : **+ Cash-flow net annuel** (qui peut être négatif les premières années : injections, puis positif si autofinancement). On inclut aussi la réduction Pinel/Malraux le cas échéant comme flux positif annuel d’impôt économisé.
    * Année de revente N : **+ Prix de vente net** (c’est-à-dire prix de vente – capital restant dû du prêt – impôts sur la plus-value – frais de vente). Ce flux final intègre le remboursement du prêt et la récupération de l’équité.

    On calcule le TRI sur ces flux. Techniquement, le calcul du TRI se fait par itération numérique (ex: méthode Newton). On pourra utiliser soit une fonction utilitaire (il existe des implémentations JS d’IRR) ou coder la notre. Ce TRI sera affiché en pourcentage annuel. On en donnera plusieurs : TRI sur 10 ans, 20 ans, 30 ans, car il peut varier (souvent, TRI 20 ans < TRI 10 ans si la plus-value était forte sur 10 ans, etc.). L’utilisateur comprendra ainsi l’impact de la durée de détention. Le TRI est l’indicateur roi pour juger de l’efficacité de l’investissement en globalité, car il tient compte de la chronologie des flux.

    *Exemple de TRI simplifié :* Apport 50k, puis projet autofinancé (cash-flows \~0), revente 100k net après 15 ans → Le TRI est celui qui annule (–50k, +0 each year 1-14, +100k year 15) ≈ 4.7% annuel. On comparera ce TRI à d’autres placements (ex TRI > taux crédit c’est bien, > inflation etc.).

Tous ces calculs seront implémentés dans le module `lib/calculs.ts` sous forme de fonctions pures. Le schéma général sera : à la fin de la saisie, une fonction `simulateInvestment(input: SimulationInput): SimulationResult` sera appelée. Elle va :

1. Valider/transformer les inputs (via Zod, voir section suivante).
2. Calculer d’abord les données de base annuelles (loyer net, tableau amortissement prêt, etc.).
3. Appliquer les formules fiscales par an selon régime, conserver les reports de déficit/amortissement d’une année sur l’autre.
4. Remplir le tableau de projection année par année jusqu’à 30 ans (ou l’horizon max pertinent, possiblement 30 ans puisque au-delà, plus de prêt, plus d’amortissement nouveau, et plus de PV imposable).
5. Calculer les indicateurs synthétiques (yields, TRI, etc.) à partir de ces flux.

Le *slice* Zustand des résultats sera mis à jour avec l’objet SimulationResult contenant :

* les indicateurs scalaires (brute, nette, nette-nette, TRI X ans, ROI, etc.),
* les séries annuelles (tableau d’objets par an avec toutes les colonnes mentionnées),
* éventuellement des séries mensuelles si besoin de plus de granularité (pour le graphique de trésorerie, on peut interpoler mensuellement ou simplement travailler annuellement).

Ce découpage calculé sera ensuite utilisé par les composants React (graphs, tables, etc.).

Enfin, la cohérence de chaque calcul sera testée sur des scénarios types (cas simple cash sans crédit, cas avec crédit, cas LMNP etc.) pour s’assurer que les formules donnent des résultats réalistes.

## Schémas de données – Types TypeScript et Validation Zod

La robustesse de l’outil repose sur la validation rigoureuse de chaque entrée utilisateur. Nous définissons ci-dessous les principaux types de données en TypeScript, ainsi que leur schéma de validation Zod associé, incluant les contraintes métier (bornes numériques, cohérences logiques) et la logique conditionnelle dépendant des choix (régime fiscal, etc.).

**Type pour la simulation d’investissement (`SimulationInput`):**

```ts
// TypeScript interface (derive from Zod schema)
interface SimulationInput {
  propertyType: "neuf" | "ancien" | "saisonnier";
  price: number;               // prix d'achat du bien en €
  notaryFees: number;          // frais de notaire en €
  surface: number;             // surface en m²
  downPayment: number;         // apport personnel en €
  loanAmount: number;          // montant du prêt en €
  interestRate: number;        // taux du prêt en % (ex: 3.5)
  loanDuration: number;        // durée du prêt en années (ex: 20)
  insuranceRate: number;       // taux assurance emprunteur en % (annuel)
  rentMonthly: number;         // loyer mensuel € hors charges récup.
  chargesRecoverableMonthly: number;    // charges récupérables mensuelles €
  chargesNonRecoverableMonthly: number; // charges non récupérables mensuelles €
  vacancyRate: number;         // vacance en % du temps (0-100)
  regime: string;              // choix du régime fiscal (e.g. "micro-foncier", "réel-foncier", "micro-BIC", "réel-BIC", "Pinel", "LMNP-réel", etc.)
  subOptions?: {               // options supplémentaires selon régime
    pinelDuration?: number;      // si Pinel, engagement (6,9,12)
    worksAmount?: number;        // si Denormandie/Malraux, montant des travaux
    lmnpIsLMP?: boolean;         // indique statut LMP si pertinent
    // ... (on peut ajouter: meubléTourismeClasse?: boolean par ex)
  };
  taxpayerTMI: number;         // TMI (Tranche Marginale d'Imposition) du foyer en % (ex: 30)
  dpeClass?: string;           // Classe DPE ("A".."G")
  resaleYear: number;          // année de revente (0 si aucune revente simulée, 30 par défaut)
  appreciationRate: number;    // taux d'appréciation annuel du bien en % (peut être 0)
}
```

Le schéma Zod correspondant, avec les contraintes :

```ts
import { z } from 'zod';

const simulationSchema = z.object({
  propertyType: z.enum(["neuf", "ancien", "saisonnier"]),
  price: z.number().min(1, "Le prix d'achat doit être > 0"),
  notaryFees: z.number().min(0, "Les frais de notaire doivent être ≥ 0"),
  surface: z.number().min(1, "La surface doit être > 0"),
  downPayment: z.number().min(0, "L'apport doit être ≥ 0"),
  interestRate: z.number().min(0, "Taux d'intérêt ≥ 0").max(20, "Taux d'intérêt trop élevé"),
  loanDuration: z.number().int().min(1).max(30, "Durée max 30 ans"),
  insuranceRate: z.number().min(0).max(10),
  rentMonthly: z.number().min(0, "Loyer mensuel ≥ 0"),
  chargesRecoverableMonthly: z.number().min(0),
  chargesNonRecoverableMonthly: z.number().min(0),
  vacancyRate: z.number().min(0).max(100, "Vacance en % (0-100)"),
  regime: z.string(),  // on validera via refinements plus bas
  subOptions: z.object({
    pinelDuration: z.number().optional(),
    worksAmount: z.number().min(0).optional(),
    lmnpIsLMP: z.boolean().optional(),
    meubléTourismeClasse: z.boolean().optional()
  }).optional(),
  taxpayerTMI: z.number().min(0).max(60), // TMI en %, max 60% par ex
  dpeClass: z.enum(["A","B","C","D","E","F","G"]).optional(),
  resaleYear: z.number().int().min(0).max(30),
  appreciationRate: z.number().min(-10).max(15) // on borne l'appréciation entre -10% et +15%/an
})
// Ajout de règles conditionnelles
.refine(data => {
  // cohérence financement
  return data.downPayment <= data.price + data.notaryFees;
}, { message: "Apport ne peut excéder le coût total", path: ["downPayment"] })
.refine(data => {
  if(data.loanDuration === 0) return true;
  return data.interestRate > 0 || data.loanDuration === 0;
}, { message: "Taux d'intérêt doit être >0 si un prêt est renseigné", path: ["interestRate"] })
.refine(data => {
  // micro-foncier vs revenu
  if(data.regime === "micro-foncier") {
    const annualRent = data.rentMonthly * 12;
    return annualRent <= 15000;
  }
  return true;
}, { message: "Loyers excèdent 15k€, micro-foncier indisponible", path: ["regime"] })
.refine(data => {
  // micro-BIC vs plafond
  if(data.regime === "micro-BIC") {
    const annualRent = data.rentMonthly * 12;
    if(data.subOptions?.meubléTourismeClasse) {
      // meublé classé
      return annualRent <= 77700;
    } else if(data.propertyType === "saisonnier") {
      // meublé non classé
      return annualRent <= 15000;
    } else {
      // meublé normal
      return annualRent <= 77700;
    }
  }
  return true;
}, { message: "Recettes excèdent le plafond du régime micro-BIC", path: ["regime"] })
.refine(data => {
  // Pinel seulement si neuf
  if(data.regime === "Pinel") {
    return data.propertyType === "neuf";
  }
  return true;
}, { message: "Le dispositif Pinel ne s'applique qu'aux biens neufs", path: ["regime"] })
.refine(data => {
  // Denormandie sur ancien
  if(data.regime === "Denormandie") {
    return data.propertyType === "ancien";
  }
  return true;
}, { message: "Le dispositif Denormandie ne s'applique qu'aux biens anciens avec travaux", path: ["regime"] })
.refine(data => {
  // Malraux sur ancien
  if(data.regime === "Malraux") {
    return data.propertyType === "ancien";
  }
  return true;
}, { message: "Le dispositif Malraux ne s'applique qu'aux biens anciens en secteur éligible", path: ["regime"] });
```

Dans ce schéma Zod :

* On utilise `refine` pour plusieurs règles transversales : par ex, empêcher le choix du micro-foncier si les loyers dépassent 15k€, empêcher micro-BIC au-delà des plafonds (y compris la nouvelle règle 2025 sur les meublés de tourisme non classés à 15k€), cohérence type de bien vs dispositif (Pinel↔neuf, Denormandie/Malraux↔ancien).
* On pourrait affiner le schéma `regime` en un `z.enum([...])` listant toutes les possibilités (e.g. `"micro-foncier" | "réel-foncier" | "micro-BIC" | "réel-BIC" | "LMNP-réel" | "Pinel" | "Denormandie" | "Malraux" | ...`), mais on aura peut-être un mapping plus complexe (par ex LMNP-réel et LMP-réel peuvent être deux flags sur le même régime réel BIC). Une alternative est de stocker `regime` = "BIC-réel" et `subOptions.lmnpIsLMP` = true pour LMP. L’essentiel est que le calculateur sache quelles règles appliquer.
* Chaque champ numérique a une contrainte `.min` (pas de négatifs pour la plupart, sauf appreciationRate qui peut être négative pour simuler une baisse de valeur, bornée à -10%/an pour éviter des inputs absurdes).
* On impose `loanDuration ≤ 30 ans` (limite courante des prêts).
* On impose `interestRate > 0` sauf si `loanDuration = 0` (cas de pas de prêt). Alternativement, on pourrait décider qu’un prêt est présent si loanAmount > 0, etc. On peut enrichir la validation pour calculer loanAmount = price+notary-downPayment et vérifier qu’il correspond aux inputs. Mais on peut simplement calculer loanAmount on the fly. On s’assure au moins que apport ≤ prix+frais (sinon le prêt calculé serait négatif).

Les types de données pour les résultats (`SimulationResult`) peuvent inclure :

```ts
interface YearlyProjection {
  year: number;
  rentGross: number;
  rentEffective: number;
  expenses: number;
  interestPaid: number;
  principalPaid: number;
  taxableIncome: number;
  incomeTax: number;
  socialTax: number;
  cashflow: number;
  cumulatedCashflow: number;
  loanRemaining: number;
  propertyValue: number;
  potentialCapitalGain: number;
}
interface SimulationResult {
  assumptions: SimulationInput;    // recopie des hypothèses
  yearlyProjections: YearlyProjection[];
  paybackYear?: number;            // année du point mort financier
  irr: { year10: number, year20: number, year30: number };
  roi: number;
  yieldGross: number;
  yieldNet: number;
  yieldNetNet: number;
  avgCashflowMonthly: number;
  totalTaxPaid: number;
  totalInvestment: number;         // somme des apports + efforts
  totalProfit: number;             // profit net final
}
```

Chaque propriété sera remplie par la fonction de simulation. Ce format facilite l’export (on peut convertir YearlyProjection en feuille Excel par simple mapping de colonnes).

## Expérience Utilisateur (UI/UX) et Navigation

Du point de vue de l’utilisateur final (investisseur), l’application se déroule en trois phases : la saisie guidée des données, l’affichage des résultats, et éventuellement la sauvegarde/export ou l’exploration de scénarios alternatifs. Nous décrivons ici le parcours utilisateur et l’UX attendue.

**Accueil / Onboarding :** L’application peut s’ouvrir directement sur le formulaire de simulation (étape 1, choix du type de bien), étant donné qu’elle s’adresse à des initiés qui veulent tester un projet rapidement. Néanmoins, un petit texte introductif ou une page d’accueil très succincte peut présenter l’outil et ses fonctionnalités (« Simulez la rentabilité de votre investissement locatif en intégrant fiscalité, amortissement et revente »). Un bouton « Commencer la simulation » lancerait le wizard. Si l’utilisateur est déjà inscrit, un bouton *Mon Compte* permet d’accéder à ses simulations sauvegardées.

**Saisie du formulaire (wizard) :** À chaque étape, les champs sont présentés clairement, parfois avec des valeurs par défaut intelligentes pour accélérer la saisie :

* Ex: lorsque *Neuf* est choisi, on pourrait pré-remplir les frais de notaire à \~2,5% du prix (valeur modifiable). Si *Ancien*, pré-remplir à \~7,5%.
* Lorsque l’utilisateur entre le prix et surface, on peut afficher en dynamique une info « Prix/m² = X €/m² » pour qu’il juge si c’est cohérent (utile pour l’investisseur).
* Sur l’étape financement, en ajustant l’apport, on recalcule le prêt automatiquement (prêt = prix + notaire – apport). Si l’utilisateur modifie le montant du prêt manuellement, on recalcule l’apport = prix+frais – prêt, pour garder cohérence – ou on verrouille l’un des deux. L’UX évitera qu’il faille entrer deux sur trois parmi prix/apport/prêt (redondant). Typiquement on demande apport, et on déduit le prêt.
* Les validations Zod se traduisent en messages d’erreur en dessous des champs en temps réel. Par ex, si l’utilisateur tape un taux de 35%, on peut dire « Taux d’intérêt anormalement élevé », ou s’il choisit micro-foncier mais entre 20k€ de loyers, afficher « Dépasse le plafond micro-foncier ». Ces feedbacks immédiats aident à corriger l’entrée.

Chaque étape peut comporter un bouton *Suivant* (ou *Calculer* sur la dernière). Un bouton *Précédent* permet de revenir modifier les étapes précédentes. Grâce à Zustand, revenir en arrière conservera les valeurs déjà saisies. On pourra aussi permettre une navigation non linéaire : par exemple afficher un sommaire des étapes (si écran large, une sidebar avec les sections, ou en mobile un menu déroulant d’étapes) – mais pour la première version, l’approche séquentielle est suffisante et plus pédagogique.

**Dynamisme conditionnel :** Certaines étapes ou champs n’apparaissent que selon le contexte :

* Si régime *Pinel* sélectionné, un champ déroulant « Durée engagement » apparaît.
* Si *Malraux* ou *Denormandie*, un champ « Montant travaux » apparaît.
* Si *Saisonnier* et micro-BIC, une case « Meublé de tourisme classé » apparaît pour appliquer le bon abattement.
* Si le bien est saisonnier non classé et que loyers > 15k, on peut afficher dès l’étape loyer/regime un warning style *« Attention : au-delà de 15 000 € de revenus, le régime micro-BIC n’est plus disponible pour les locations saisonnières non classées à partir de 2025 »*.
* Si l’utilisateur choisit LMP (via une case « Statut Loueur Pro » si on l’a), on pourrait demander son niveau de revenus globaux pour savoir s’il paiera des cotisations sociales – c’est peut-être trop détaillé, on peut juste signaler qu’en LMP il y a des cotisations en plus.

**Affichage des résultats :** Une fois les données saisies et validées, l’utilisateur clique sur *Calculer*. On peut alors soit :

* Garder la même page et remplacer le formulaire par les résultats (ou replier le formulaire en haut).
* Ou naviguer vers une autre page `/simulation/results` affichant les résultats.

Une préférence UX serait d’afficher les résultats directement en dessous du formulaire, sur la même page en scrollant. Ainsi l’utilisateur peut facilement scroller de haut en bas pour revoir une donnée d’entrée et son résultat en face. On peut verrouiller les étapes du formulaire en mode lecture une fois calculé, ou permettre de les rouvrir (par exemple un bouton *Modifier* à côté de chaque section d’entrée, qui déplierait le champ et recalculerait instantanément). Une autre approche : avoir un bouton *Recommencer une simulation* qui réinitialise tout.

Dans un esprit d’exploration, on peut permettre d’ajuster certains paramètres directement depuis la page de résultats, avec mise à jour instantanée (par exemple un slider « Taux d’occupation », ou « TMI » si on veut voir impact fiscal). Toutefois, ces ajustements renvoient en fait à modifier l’entrée de simulation et recalculer. Dans la V1, on exigera de repasser par le formulaire pour changer les hypothèses. L’utilisateur pourra utiliser la fonction *dupliquer simulation* s’il est connecté, pour comparer deux scénarios en parallèle (pas simultanément à l’écran, mais en sauvegardant plusieurs versions).

**Sauvegarde et compte :** Si l’utilisateur est connecté (après login via Better Auth), à l’affichage des résultats on proposera un bouton *Sauvegarder cette simulation*. Cela enregistre dans Supabase la SimulationInput et éventuellement une version condensée des résultats (les KPIs principaux) pour affichage dans la liste des simulations. L’utilisateur peut donner un nom au projet (ex: « Duplex Bordeaux ») lors de la sauvegarde via une petite popup. Plus tard, dans *Mes Simulations*, on affiche le nom, la rentab brute, nette, TRI 10 ans, etc. comme aperçu.

L’authentification Better Auth s’intègre en fournisseur global (via un *Middleware* Next.js ou des route handlers). Concrètement, à l’appui sur *Se connecter*, on peut rediriger vers une page de login ou ouvrir un modal. Better Auth interagit avec Supabase pour vérifier les identifiants. Une fois connecté, le state user (Zustand userSlice) est rempli avec l’ID utilisateur et son token JWT peut-être. On utilise cet ID pour taguer les simulations sauvegardées (champ user\_id).

**Exemple de parcours utilisateur complet :**
Alice, investisseuse chevronnée, arrive sur l’outil pour évaluer un appartement ancien qu’elle envisage d’acheter pour louer en meublé. Elle sélectionne **Bien ancien**, indique **Prix 250 000 €**, le champ *Frais de notaire* se pré-remplit à *18 000 €* (7.2%). Elle précise **Surface 55 m²** (l’interface lui affiche un indicateur « ≈ 4 545 €/m² »). Elle passe à l’étape Financement : elle met **Apport 50 000 €** (le formulaire calcule *Montant du prêt = 218 000 €*), Taux *3%*, Durée *20 ans*, Assurance *0.20%*. Étape Loyer : elle entre **Loyer 950 €**, **Charges non récup. 50 €** par mois (taxe foncière + entretien estimés). Vacance 1 mois -> elle sélectionne *8%* (slider). Étape Régime fiscal : elle choisit **LMNP au réel** (meublé régime réel). Le formulaire demande sa Tranche IR, elle indique *30%*. (Le DPE du bien est F, elle le sélectionne ; une alerte s’affiche : « Classe F : interdiction de louer en 2028 sans travaux », qu’elle garde à l’esprit). Elle clique *Calculer*.

Les résultats s’affichent : rentabilité brute \~4.56%, nette \~3.8%, nette-nette \~3.8% (car aucune imposition grâce à amortissement, pour l’instant). Cash-flow mensuel indiqué à *-120 €/mois* (effort d’épargne). Un graphique montre qu’avec l’augmentation future des loyers et la fin du prêt en année 20, le cash-flow devient positif à partir de l’année 20 (après prêt remboursé). Le TRI à 10 ans est 5.5%, à 20 ans 8.2%, à 30 ans 9.5% (ces chiffres fictifs tiennent compte d’une plus-value à la revente : le graphique valorisation vs dette montre qu’au bout de 20 ans la valeur projetée \~350k€ et dette 0, générant la plus-value). Alice voit que sur 20 ans son ROI serait \~+200%. Elle décide de sauvegarder la simulation sous le nom « Projet Bordeaux Meublé » dans son compte. Ensuite, elle modifie une hypothèse : et si elle louait en nu (régime réel foncier) ? Elle revient en arrière à l’étape régime, choisit Location nue réel. On recalcule : rentabilité nette-nette chute (car impôt foncier chaque année \~2k€), mais son cash-flow devient encore plus négatif (effort \~-200€/mois) car les impôts la pénalisent. Le TRI 20 ans baisse, etc. Elle constate l’avantage du meublé. Elle revient à LMNP, re-sauvegarde éventuellement ce scénario final.

Ainsi, l’UX permet d’itérer rapidement et de **comparer des scénarios**. On n’implémente pas la comparaison côte à côte, mais via la sauvegarde il est possible de recharger deux simulations dans deux onglets par exemple. À l’impression PDF, toutes les sections seront bien formatées sur pages séparées pour lecture aisée par un banquier ou conseiller (le PDF comportera une page de garde avec le titre du projet et date, puis les hypothèses, puis les tableaux et graphiques sur 1-2 pages, etc., dans un style proche d’une présentation professionnelle).

## Checklist de conformité réglementaire et limitations

Dans le développement de cet outil, il est crucial de respecter certaines règles légales en vigueur en 2025 et d’informer l’utilisateur des contraintes liées à son projet. Voici une checklist des points de conformité à intégrer, soit dans la logique de l’application (blocage/alerte), soit dans le contenu du rapport pour sensibilisation :

* **Performances énergétiques (DPE) et interdictions de location :**

  * *Loi Climat et Résilience* – Interdiction progressive de louer les passoires thermiques : **Classe G** interdites à la location depuis 2025, **classe F** interdites dès 2028, **classe E** dès 2034. Le simulateur doit :

    * Permettre à l’utilisateur de renseigner la classe DPE du bien (ou une estimation).
    * S’il s’agit d’un F ou G, afficher une alerte bien visible dans le formulaire et dans le rapport final : *« Ce bien est classé F/G – à partir de 2025/2028, il ne pourra plus être loué sans rénovation énergétique (performance < seuil de décence énergétique). »*.
    * Pour un classe E, mentionner l’échéance 2034 où il sera interdit de louer sans travaux.
    * Si l’horizon de projection dépasse ces dates (par ex simulation sur 30 ans avec un DPE F), on peut simuler qu’à partir de 2028 le loyer tombe à 0 (bien non louable) ce qui impacterait dramatiquement la rentabilité. Cependant, ce serait un scénario extrême. Mieux vaut notifier l’utilisateur de prévoir des travaux avant cette date. On peut envisager un champ « Amélioration DPE prévue en (année) avec coût X » dans des versions futures.
    * Cette contrainte DPE sera mentionnée dans le rapport exporté comme élément à adresser : *« ⚠ DPE F : travaux de rénovation énerg. requis avant 2028 pour continuer à louer (isolation, etc.) »*.

* **Plafonds des régimes fiscaux (micro) :**

  * Micro-foncier : confirmer le respect du seuil 15 000 € de loyers. L’outil le fait via validation, et il mentionnera dans le rapport la règle : *« Micro-foncier applicable (loyers ≤15k€) avec abattement 30%. Si vos loyers dépassent ce seuil, le régime réel s’appliquera d’office. »*.
  * Micro-BIC : respecter seuil 77 700 € (ou 15 000 € selon meublé tourisme non classé). L’outil alerte sur dépassement. Dans la checklist, on notera : *« Micro-BIC (50% abattement) possible jusqu’à 77 700 € de recettes annuelles (15 000 € si location touristique non classée depuis 2025). Au-delà, régime réel BIC obligatoire. »*
  * Pinel : rappeler les plafonds d’investissement (300k€, 2 logements par an) et les contraintes de loyer/ressources locataire. On peut ajouter dans le rapport : *« Dispositif Pinel : réduction d’impôt sur X ans. **Attention** : conditions d’éligibilité – plafond de prix 300 000 €, respect des plafonds de loyer zonés et engagement de location non meublée en résidence principale du locataire sur la durée choisie. »*
  * Malraux : mentionner *« plafond travaux 400 000 € sur 4 ans, secteur éligible (PSMV ou quartier NPNRU) et engagement de location 9 ans minimum »*.
  * Denormandie : *« logement ancien dans ville éligible, travaux ≥25% du coût total, mêmes réductions que Pinel »*.

* **Déficits fonciers et BIC reportables :** S’assurer de ne pas oublier d’appliquer les règles de report. Dans le rapport ou l’aide, expliquer : *« Déficit foncier imputé sur revenu global jusqu’à 10 700 €/an, surplus reporté 10 ans sur foncier. En LMNP, déficit BIC reporté indéfiniment sur revenus meublés futurs (non imputable revenu global sauf LMP) »*. Cela justifie pourquoi souvent l’impôt est nul les premières années dans nos résultats LMNP – on peut le souligner pédagogiquement.

* **Cotisations sociales LMP :** Si statut LMP atteint, mentionner : *« Statut LMP : affilié au régime social des indépendants – cotisations \~35-40% du bénéfice au lieu des prélèvements sociaux 17.2%. Le calcul présenté n’intègre pas ces cotisations, il conviendra de les estimer à part »*. Donc éviter de fausser le calcul principal, mais alerter.

* **Autres réglementations 2025 :**

  * Gel des loyers des passoires : depuis 2022, impossibilité d’augmenter le loyer d’un logement classé F ou G. Dans la projection, si on prévoyait une indexation du loyer, on devrait la bloquer. Simplicité : on peut supposer loyer constant ou revalorisé inflation (le user peut entrer manuel). Si on a DPE F/G, on indique *« Pas de hausse de loyer possible (loi Climat) tant que classé F/G »*.
  * Plafond de déduction des intérêts pour déficit foncier (règle déjà gérée dans calcul).
  * Mentionner la taxe sur les logements vacants ou l’encadrement des loyers si pertinent localement – c’est très localisé, on pourrait ignorer dans cette version, mais l’investisseur expérimenté le saura.

* **Validité des données :** Ajouter un disclaimer que les calculs fiscaux sont basés sur la législation 2025 et hypothèses saisies, et que les lois ou taux peuvent évoluer (ex: tranches d’IR chaque année, taux de prélèvements). Recommander de mettre à jour la simulation ou vérifier les données chaque année. Par exemple, précisez : *« TMI 30% supposé constant, PS 17.2% constant (peut évoluer), taux immobilier du marché peuvent changer – adapter les hypothèses en conséquence. »*

* **Utilisation professionnelle :** Si le document est à destination d’une banque, assurer la clarté et l’honnêteté des chiffres : inclure une **note méthodologique** en annexe du PDF détaillant comment chaque indicateur est calculé, pour prouver le sérieux (par ex cette note peut reprendre en condensé les formules).

En résumé, cette checklist garantit que l’outil non seulement calcule correctement, mais informe l’utilisateur des contraintes importantes autour de son investissement (fiscalité et lois). **Tout dépassement de seuil ou condition doit être soit bloqué, soit signalé**. Mieux vaut empêcher une simulation incohérente (par ex micro-foncier avec 20k loyers) que de laisser faire sans prévenir. Les alertes contextuelles dans l’app et les notes explicatives dans le rapport final assureront que l’investisseur utilise les résultats en connaissance de cause et en conformité avec la loi.

## Intégrations futures (Roadmap API)

Pour aller encore plus loin dans la précision et l’automatisation, le projet prévoit des intégrations avec plusieurs API externes. Celles-ci permettront d’enrichir automatiquement les données d’entrée ou de mettre à jour les calculs en temps réel avec les dernières informations disponibles :

* **API DPE & ADEME (Agence de la transition écologique)** : Grâce à une API officielle ou base de données, il serait possible de récupérer la **classe énergétique** d’un logement à partir de son adresse ou de son numéro de diagnostic, et même d’estimer sa consommation en kWh/m². À défaut, une API ADEME pourrait fournir des données moyennes ou des conseils d’amélioration. *Intérêt :* éviter à l’utilisateur de saisir manuellement le DPE, et afficher automatiquement les obligations légales correspondantes (par ex, l’API pourrait retourner « Classe F, interdiction 2028 »). Cette intégration va de pair avec une éventuelle API de travaux de rénovation énergétique (ex: suggérer un coût de travaux pour passer de F à D).

* **API DVF (Demande de Valeurs Foncières)** : C’est la base des ventes immobilières enregistrées par l’administration fiscale (disponible en open data). En intégrant une API (ou un outil type Etalab DVF), le simulateur pourrait **estimer la valeur du bien** et la cohérence du prix saisi. Par exemple, l’utilisateur renseigne l’adresse du bien ; l’API DVF renvoie les ventes comparables (surface, prix, date). On peut alors indiquer : *« Prix saisi 250k€ soit 5k€/m², médiane du quartier 4,5k€/m², vous payez un peu cher »*. Cela aide l’investisseur sur la partie négociation. De plus, on peut utiliser DVF couplé à une API de tendance du marché pour projeter l’évolution du prix (pour la revente, plutôt que demander un taux d’appréciation arbitraire, on pourrait dire *« Historique 10 ans dans la ville : +3%/an, on projette pareil »*).

* **API INSEE ou Observatoires des loyers** : Permettrait de récupérer les **loyers de référence** selon la localisation et le type de bien. Par exemple l’API de l’OLAP (observatoire) ou INSEE fournit le loyer moyen/médian par m² dans la ville/quartier. Le simulateur pourrait alors pré-remplir le loyer *ou* alerter si le loyer entré est trop optimiste/pessimiste par rapport au marché local. Cela recoupe l’encadrement des loyers : si l’adresse est à Paris par ex, on pourrait via l’API obtenir le loyer max autorisé pour telle surface. C’est complexe, mais c’est une amélioration possible pour sécuriser l’hypothèse de loyer.

* **API Bercy (Finances publiques)** : L’idée est de se brancher aux données officielles pour toujours avoir la **fiscalité à jour**. Par ex, une API ou un flux open data avec les barèmes d’impôt sur le revenu, les taux de prélèvements sociaux, les taux de réductions Pinel en fonction de l’année (Pinel évolue : en 2023-24 il baisse si Pinel+ non respecté). En automatisant cela, on éviterait de coder en dur des chiffres susceptibles de changer. Si pas d’API publique, on peut au moins prévoir une structure pour mettre à jour facilement ces paramètres chaque année.
  De plus, Bercy ou la DGFiP pourraient fournir une API de **calcul d’impôt** complète (comme le simulateur d’impôt officiel) – mais c’est peu probable ouvertement.

* **API des taux d’intérêt en temps réel** : Par exemple, une API de **Crédit Logement** ou de courtiers (CAFPI, Pretto, etc.) pour obtenir le taux moyen du moment pour un prêt de telle durée. Certains brokers publient des baromètres mensuels. L’intégration permettrait de suggérer par défaut un taux réaliste selon durée (ex: 20 ans = 3,2% actuellement). L’API pourrait aussi donner les taux d’assurance moyens. Ainsi l’utilisateur n’a qu’à choisir la durée, et on remplit taux et assurance moyens du marché (modifiable s’il a une offre différente). On peut imaginer une actualisation mensuelle de ces valeurs.

* **API de génération des amortissements (Compta LMNP)** : Il existe des logiciels spécialisés (comme Jedeclaremonmeuble ou d’autres) qui calculent précisément les amortissements par composant. Soit via API, soit via librairie, ce serait envisageable de donner un **tableau d’amortissement détaillé** (terrain, gros œuvre 75 ans, toiture 25 ans, etc.) pour plus de précision fiscale. Cependant, peu d’API publiques ici – on peut en développer une interne ou rendre nos règles plus fines. Alternativement, on peut permettre à l’utilisateur avancé de saisir manuellement une ventilation (ex: Terrain X €, Bâtiment Y € sur 30 ans, Mobilier Z € sur 7 ans). En tous cas, c’est une amélioration pour coller exactement aux normes comptables.

* **Autres** : On peut penser à une API de suivi du marché locatif (évolution des loyers, taux d’occupation Airbnb, etc.), ou une API d’estimation de la taxe foncière (il y a des données open data sur les taux communaux). Par exemple, on pourrait estimer la taxe foncière d’un bien via la valeur locative cadastrale moyenne de la commune. Ce niveau de détail serait innovant. De même, une API qui vérifie si l’adresse est en zone Pinel, ou zone tendue (pour meublés tourisme restrictions), etc., pourrait automatiquement adapter les dispositifs proposés.

Chacune de ces intégrations fait partie de la feuille de route future. Elles ne sont pas nécessaires à une V1 fonctionnelle, mais constituent des **améliorations stratégiques**. L’objectif final est de réduire les saisies manuelles et d’augmenter la fiabilité des simulations. Par exemple, couplé à DVF et INSEE, le simulateur pourrait presque *pré-remplir* la fiche d’un projet à partir d’une adresse et quelques caractéristiques, puis l’utilisateur ajuste.

Évidemment, l’utilisation de ces API devra respecter les conditions d’utilisation et la sécurité (appels côté serveur via des API routes Next.js pour cacher les clés, mise en cache locale pour ne pas dépasser les quotas, etc.).

## Conclusion

Ce document a détaillé la conception d’un outil complet de simulation de rentabilité immobilière, intégrant à la fois les aspects financiers poussés et les considérations techniques de développement. En synthèse, le projet consistera à implémenter :

* Une architecture Next.js bien structurée, en TypeScript, exploitant Tailwind CSS et shadcn/UI pour une interface moderne et réactive.
* Un formulaire multi-étapes intelligent, validé par Zod, couvrant toutes les données d’investissement (du prix d’achat aux loyers en passant par le régime fiscal).
* Des calculs financiers exhaustifs modélisant cash-flows, rentabilités (brute, nette, nette-nette), amortissements comptables LMNP, fiscalité annuelle, et performance globale avec TRI et ROI, le tout vérifiable via formules.
* Une gestion d’état centralisée (Zustand) permettant la persistance locale et la connexion à Supabase pour sauvegarder/recharger des simulations pour les utilisateurs authentifiés.
* Des exports soignés (PDF, Excel) pour partager les résultats de manière professionnelle, par exemple à des partenaires financiers.
* Le respect des règles légales et fiscales en vigueur en 2025, avec alertes utilisateurs en cas de dépassement de seuils ou de conditions, et une ouverture sur les évolutions futures (DPE, changements de lois sur les meublés, etc.).

En fournissant ces spécifications claires et détaillées, le document permet à une équipe de développement (ou une IA codeuse) de démarrer le projet en disposant d’une vision complète tant fonctionnelle que technique. Chaque exigence de l’audit initial a été traitée : les fonctionnalités principales sont couvertes, les composants UI identifiés, les formules établies et justifiées par des références (lorsque nécessaire), et les bonnes pratiques de développement sont intégrées (typage strict, séparation des responsabilités, utilisation de librairies modernes).

Le résultat attendu est un **simulateur de rentabilité** fiable, ergonomique et évolutif, qui deviendra pour l’investisseur immobilier un véritable “supercalculateur” d’aide à la décision, prenant en compte des paramètres souvent négligés (fiscalité, amortissement, revente) et conforme aux réalités du marché et de la loi. Avec une base aussi solide, les futures intégrations d’API et les ajustements pour de nouvelles lois ou dispositifs pourront se faire de manière fluide, maintenant l’outil à la pointe pour les années à venir.
