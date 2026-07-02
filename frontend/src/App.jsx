import { useEffect, useRef, useState } from "react";
import { activities, avatars, foods, resortRecommendations, rewards } from "./data";

const mainInterests = {
  "Sports Hero": "Sports",
  "Wellness Explorer": "Wellness",
  "Nature Ranger": "Nature",
  "Cycling Champion": "Cycling",
  "Water Adventurer": "Water activities",
};

const privacyNotice =
  "This game collects only anonymous preference data to help us improve food planning, reduce waste and recommend resort activities. We do not collect names, room numbers, photos or any personal data.";

const translations = {
  en: {
    localeName: "English",
    title: "Smart Guest Quest",
    subtitle: "Build your perfect resort day",
    privacyNotice,
    privacyInfo: "Privacy info",
    startQuest: "Start Quest",
    chooseHero: "Choose Your Hero",
    whoToday: "Who are you today?",
    mapTitle: "Explore the Resort Map",
    mapSubtitle: "Tap the Food Hall and nearby zones to build your perfect resort day.",
    currentPlan: "Perfect Resort Day",
    selectedFoods: "Food preferences",
    selectedActivities: "Activity preferences",
    selectedRelaxation: "Relaxation / reward",
    selectedStations: "Visited zones",
    chooseFromZone: "Choose from this zone",
    foodHallIntro: "Choose one or more food preferences from the buffet categories.",
    zoneOptions: "Activities/options",
    moreInfo: "More info",
    addChoice: "Add",
    selected: "Selected",
    back: "Back",
    finishQuest: "Finish Quest",
    finishHint: "Choose at least one food preference to finish the quest.",
    endingTitle: "Personalized Ending",
    questComplete: "Quest complete",
    perfectDay: "Your perfect resort day is:",
    recommended: "Recommended for you:",
    saving: "Saving your anonymous quest...",
    saved:
      "Your quest has been saved. Thank you for helping us reduce food waste and improve the guest experience.",
    saveError:
      "Your quest was completed, but we could not save the data at this moment.",
    reset: "Reset Quest",
    close: "Close",
    anonymousData: "Anonymous game data",
    calories: "Calories",
    protein: "Protein",
    carbohydrates: "Carbohydrates",
    fat: "Fat",
    allergens: "Allergens",
    empty: "Not selected yet",
    receptionHint: "Start at reception, then visit the Food Hall and the zones you like.",
  },
  hr: {
    localeName: "Hrvatski",
    title: "Smart Guest Quest",
    subtitle: "Slozi svoj savrseni dan u resortu",
    privacyNotice:
      "Ova igra prikuplja samo anonimne podatke o preferencijama kako bismo bolje planirali hranu, smanjili otpad i preporucili aktivnosti u resortu. Ne prikupljamo imena, brojeve soba, fotografije niti osobne podatke.",
    privacyInfo: "Info o privatnosti",
    startQuest: "Zapocni igru",
    chooseHero: "Odaberi svog heroja",
    whoToday: "Tko si danas?",
    mapTitle: "Istrazite resort mapu",
    mapSubtitle: "Dodirni Food Hall i okolne zone kako bi slozio savrseni dan.",
    currentPlan: "Savrseni dan u resortu",
    selectedFoods: "Preferencije hrane",
    selectedActivities: "Preferencije aktivnosti",
    selectedRelaxation: "Opustanje / nagrada",
    selectedStations: "Posjecene zone",
    chooseFromZone: "Odaberi iz zone",
    foodHallIntro: "Odaberi jednu ili vise preferencija hrane iz kategorija buffeta.",
    zoneOptions: "Aktivnosti/opcije",
    moreInfo: "Vise info",
    addChoice: "Dodaj",
    selected: "Odabrano",
    back: "Nazad",
    finishQuest: "Zavrsi igru",
    finishHint: "Odaberi barem jednu hranu za zavrsetak igre.",
    endingTitle: "Personalizirani zavrsetak",
    questComplete: "Igra je zavrsena",
    perfectDay: "Tvoj savrseni dan u resortu je:",
    recommended: "Preporuceno za tebe:",
    saving: "Spremamo tvoj anonimni odgovor...",
    saved:
      "Tvoj odgovor je spremljen. Hvala sto nam pomazes smanjiti bacanje hrane i poboljsati iskustvo gostiju.",
    saveError:
      "Igra je zavrsena, ali trenutno ne mozemo spremiti podatke.",
    reset: "Pokreni ponovo",
    close: "Zatvori",
    anonymousData: "Anonimni podaci igre",
    calories: "Kalorije",
    protein: "Proteini",
    carbohydrates: "Ugljikohidrati",
    fat: "Masti",
    allergens: "Alergeni",
    empty: "Jos nije odabrano",
    receptionHint: "Kreni od recepcije, zatim posjeti Food Hall i zone koje zelis.",
  },
};

const mapZones = [
  {
    id: "reception",
    name: "Reception / Start Point",
    nameHr: "Recepcija / pocetak",
    icon: "R",
    x: 50,
    y: 88,
    width: 34,
    height: 12,
    type: "start",
    choices: [],
  },
  {
    id: "food-hall",
    name: "Food Hall / Main Buffet",
    nameHr: "Food Hall / glavni buffet",
    icon: "FH",
    x: 50,
    y: 50,
    width: 36,
    height: 28,
    type: "foodHall",
    choices: [],
  },
  {
    id: "sports",
    name: "Sports & Activities Zone",
    nameHr: "Zona sporta i aktivnosti",
    icon: "S",
    x: 16,
    y: 50,
    width: 24,
    height: 40,
    type: "activity",
    choices: ["Fitness", "Cycling", "Sports Challenge", "Family Activity"],
  },
  {
    id: "wellness",
    name: "Wellness & Relaxation Zone",
    nameHr: "Wellness i zona opustanja",
    icon: "W",
    x: 84,
    y: 50,
    width: 24,
    height: 40,
    type: "wellness",
    choices: ["Wellness Program", "Spa Relaxation", "Wellness Break", "Healthy Lifestyle Workshop"],
  },
  {
    id: "nature",
    name: "Nature & Outdoor Zone",
    nameHr: "Zona prirode i vanjskih aktivnosti",
    icon: "N",
    x: 50,
    y: 15,
    width: 46,
    height: 18,
    type: "activity",
    choices: ["Nature Walk", "Biodynamic Garden", "Sustainability Activity", "Outdoor Experience"],
  },
  {
    id: "pool",
    name: "Pool / Water Zone",
    nameHr: "Zona bazena / vode",
    icon: "P",
    x: 70,
    y: 78,
    width: 28,
    height: 16,
    type: "activity",
    choices: ["Swimming", "Water Adventure", "Pool Time"],
  },
  {
    id: "family",
    name: "Family Corner",
    nameHr: "Obiteljski kutak",
    icon: "F",
    x: 30,
    y: 78,
    width: 26,
    height: 16,
    type: "activity",
    choices: ["Family Activity", "Family Time", "Outdoor Experience"],
  },
];

const foodHallCategories = [
  {
    id: "breakfast",
    name: "Breakfast",
    nameHr: "Dorucak",
    choices: ["Pancakes", "Eggs", "Yogurt", "Cereal", "Fruit", "Homemade Pastry", "Smoothie"],
  },
  {
    id: "lunch",
    name: "Lunch",
    nameHr: "Rucak",
    choices: ["Pasta", "Chicken", "Fish", "Vegetables", "Soup", "Local Dish", "Seasonal Ingredients", "Salad"],
  },
  {
    id: "dinner",
    name: "Dinner",
    nameHr: "Vecera",
    choices: ["Local Dish", "Fish", "Vegetables", "Soup", "Pasta", "Healthy Snack", "Healthy Dessert", "Fruit Dessert"],
  },
];

const extraFoodDetails = [
  makeFood("smoothie", "Smoothie", "Smoothie", "Healthy drink", "Zdravi napitak", 160, "4 g", "31 g", "2 g", "May contain milk", "Moze sadrzavati mlijeko", ["healthy", "vegetarian", "kids-friendly"], ["zdravo", "vegetarijanski", "za djecu"], "A refreshing drink with fruit energy, vitamins, and light hydration support.", "Osvjezavajuci napitak s energijom iz voca, vitaminima i laganom hidratacijom.", "https://images.unsplash.com/photo-1502741224143-90386d7f8c82?auto=format&fit=crop&w=900&q=80"),
  makeFood("healthy-snack", "Healthy Snack", "Zdravi snack", "Light snack", "Lagani snack", 140, "5 g", "18 g", "6 g", "May contain nuts", "Moze sadrzavati orasaste plodove", ["healthy", "kids-friendly"], ["zdravo", "za djecu"], "A smaller balanced option for guests who want energy without a heavy meal.", "Manja uravnotezena opcija za goste koji zele energiju bez teskog obroka.", "https://images.unsplash.com/photo-1490818387583-1baba5e638af?auto=format&fit=crop&w=900&q=80"),
  makeFood("homemade-pastry", "Homemade Pastry", "Domace pecivo", "Local bakery", "Lokalna pekara", 260, "6 g", "36 g", "11 g", "Gluten, milk, eggs", "Gluten, mlijeko, jaja", ["local", "vegetarian"], ["lokalno", "vegetarijanski"], "A local bakery-style choice that is best balanced with fruit or yogurt.", "Lokalni pekarski izbor koji je najbolje uravnoteziti vocem ili jogurtom.", "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=900&q=80"),
  makeFood("seasonal-ingredients", "Seasonal Ingredients", "Sezonske namirnice", "Seasonal food", "Sezonska hrana", 120, "3 g", "20 g", "3 g", "Ask staff for daily allergens", "Pitajte osoblje za dnevne alergene", ["local", "healthy", "sustainable"], ["lokalno", "zdravo", "odrzivo"], "Seasonal produce supports local planning, freshness, and lower food waste.", "Sezonske namirnice podrzavaju lokalno planiranje, svjezinu i manje otpada.", "https://images.unsplash.com/photo-1466637574441-749b8f19452f?auto=format&fit=crop&w=900&q=80"),
  makeFood("healthy-dessert", "Healthy Dessert", "Zdravi desert", "Light dessert", "Lagani desert", 150, "4 g", "24 g", "5 g", "May contain milk or nuts", "Moze sadrzavati mlijeko ili orasaste plodove", ["healthy", "vegetarian", "kids-friendly"], ["zdravo", "vegetarijanski", "za djecu"], "A lighter sweet option aligned with Healthness choices.", "Laksi slatki izbor uskladjen s Healthness konceptom.", "https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=900&q=80"),
  makeFood("cake", "Cake", "Kolac", "Dessert", "Desert", 330, "5 g", "48 g", "14 g", "Gluten, eggs, milk", "Gluten, jaja, mlijeko", ["kids-friendly", "vegetarian"], ["za djecu", "vegetarijanski"], "A richer dessert choice for guests who want a celebratory treat.", "Bogatiji desert za goste koji zele slatku poslasticu.", "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=900&q=80"),
  makeFood("fruit-dessert", "Fruit Dessert", "Vocni desert", "Fruit dessert", "Vocni desert", 130, "2 g", "29 g", "2 g", "May contain milk", "Moze sadrzavati mlijeko", ["healthy", "vegetarian", "kids-friendly"], ["zdravo", "vegetarijanski", "za djecu"], "A fruit-based dessert with lighter energy and natural sweetness.", "Vocni desert s laksom energijom i prirodnom slatkocom.", "https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?auto=format&fit=crop&w=900&q=80"),
  makeFood("chicken", "Chicken", "Piletina", "Protein meal", "Proteinski obrok", 240, "27 g", "2 g", "12 g", "Ask staff for daily allergens", "Pitajte osoblje za dnevne alergene", ["protein", "kids-friendly"], ["proteini", "za djecu"], "A familiar protein option that supports active guests and balanced lunch planning.", "Poznata proteinska opcija za aktivne goste i uravnotezen rucak.", "https://images.unsplash.com/photo-1532550907401-a500c9a57435?auto=format&fit=crop&w=900&q=80"),
  makeFood("fish", "Fish", "Riba", "Protein meal", "Proteinski obrok", 220, "25 g", "1 g", "11 g", "Fish", "Riba", ["healthy", "protein"], ["zdravo", "proteini"], "A lighter protein choice often suitable for lunch or dinner with vegetables.", "Laksi proteinski izbor pogodan za rucak ili veceru uz povrce.", "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=900&q=80"),
  makeFood("soup", "Soup", "Juha", "Warm meal", "Topli obrok", 110, "5 g", "16 g", "3 g", "Ask staff for daily allergens", "Pitajte osoblje za dnevne alergene", ["light", "kids-friendly"], ["lagano", "za djecu"], "A warm and light meal item that helps estimate demand for buffet starters.", "Topla i lagana stavka koja pomaze procijeniti potraznju za predjelima.", "https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=900&q=80"),
  makeFood("salad", "Salad", "Salata", "Fresh meal", "Svjezi obrok", 95, "3 g", "12 g", "4 g", "None common", "Nema cestih alergena", ["healthy", "vegetarian"], ["zdravo", "vegetarijanski"], "A fresh option for guests looking for lighter lunch choices.", "Svjeza opcija za goste koji zele laksi rucak.", "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=900&q=80"),
];

const foodIcons = {
  Pancakes: "🥞",
  Eggs: "🍳",
  Yogurt: "🥣",
  Cereal: "🌾",
  Fruit: "🍎",
  Smoothie: "🥤",
  Pasta: "🍝",
  Chicken: "🍗",
  Fish: "🐟",
  Vegetables: "🥦",
  Soup: "🍲",
  "Local Dish": "🍽️",
  "Homemade Pastry": "🥐",
  "Seasonal Ingredients": "🥬",
  Salad: "🥗",
  "Healthy Snack": "🥜",
  "Healthy Dessert": "🍮",
  Cake: "🍰",
  "Fruit Dessert": "🍓",
};

const foodCatalog = [...foods, ...extraFoodDetails].map((food) => ({
  ...food,
  icon: foodIcons[food.name] || "🍽️",
}));

const choiceTranslations = {
  "Healthy Snack": "Zdravi snack",
  "Homemade Pastry": "Domace pecivo",
  "Seasonal Ingredients": "Sezonske namirnice",
  "Spa Relaxation": "Spa opustanje",
  "Healthy Lifestyle Workshop": "Radionica zdravog zivota",
  "Biodynamic Garden": "Biodinamicki vrt",
  "Sustainability Activity": "Aktivnost odrzivosti",
  "Outdoor Experience": "Vanjski dozivljaj",
  "Water Adventure": "Vodena avantura",
  "Pool Time": "Vrijeme na bazenu",
  "Family Time": "Obiteljsko vrijeme",
  Cake: "Kolac",
  "Fruit Dessert": "Vocni desert",
  "Relaxed Resort Time": "Opusteno vrijeme u resortu",
};

const activityFallbacks = [
  { name: "Sports Challenge", nameHr: "Sportski izazov" },
  { name: "Spa Relaxation", nameHr: "Spa opustanje" },
  { name: "Wellness Break", nameHr: "Wellness pauza" },
  { name: "Healthy Lifestyle Workshop", nameHr: "Radionica zdravog zivota" },
  { name: "Biodynamic Garden", nameHr: "Biodinamicki vrt" },
  { name: "Sustainability Activity", nameHr: "Aktivnost odrzivosti" },
  { name: "Outdoor Experience", nameHr: "Vanjski dozivljaj" },
  { name: "Water Adventure", nameHr: "Vodena avantura" },
  { name: "Pool Time", nameHr: "Vrijeme na bazenu" },
  { name: "Family Time", nameHr: "Obiteljsko vrijeme" },
  { name: "Relaxed Resort Time", nameHr: "Opusteno vrijeme u resortu" },
];

function App() {
  if (window.location.pathname === "/dashboard") {
    return <Dashboard />;
  }

  return <GuestGame />;
}

function GuestGame() {
  const [language, setLanguage] = useState("en");
  const [screen, setScreen] = useState("welcome");
  const [hero, setHero] = useState(null);
  const [avatarPosition, setAvatarPosition] = useState(getZonePosition("reception"));
  const [activeZone, setActiveZone] = useState(null);
  const [activeFoodDetails, setActiveFoodDetails] = useState(null);
  const [showPrivacyInfo, setShowPrivacyInfo] = useState(false);
  const [plan, setPlan] = useState(createEmptyPlan());
  const [saveStatus, setSaveStatus] = useState("idle");
  const [savedSessionId, setSavedSessionId] = useState("");
  const zoneTimerRef = useRef(null);
  const saveStartedRef = useRef(false);
  const copy = translations[language];
  const selectedActivity = plan.activities[0] || plan.wellness[0] || "";
  const selectedReward = plan.wellness[0] || "Relaxed Resort Time";
  const canFinish = plan.foods.length > 0;
  const generatedPerfectDay = `${formatFoodChoices(plan.foods)} -> ${selectedActivity || selectedReward} -> ${selectedReward}`;
  const recommendations = getResortRecommendations(
    hero?.name,
    [...plan.foods.map((item) => item.name), ...plan.activities, ...plan.wellness, ...plan.activityZones],
    language
  );

  useEffect(() => {
    if (screen !== "ending" || saveStatus !== "idle" || saveStartedRef.current) {
      return;
    }

    async function saveSession() {
      saveStartedRef.current = true;
      setSaveStatus("saving");

      try {
        const response = await fetch("http://localhost:3000/api/sessions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            avatar: hero?.name,
            mainInterest: mainInterests[hero?.name] || "",
            activityPreference: selectedActivity || selectedReward,
            foodPreference: formatFoodChoices(plan.foods),
            rewardPreference: selectedReward,
            morningPlan: `Food Hall: ${formatFoodChoices(plan.foods)}`,
            afternoonPlan: `Activity: ${formatChoiceList(plan.activities, "en") || selectedActivity}`,
            eveningPlan: `Relaxation: ${formatChoiceList(plan.wellness, "en") || selectedReward}`,
            selectedStations: plan.visitedZones,
            selectedFoodCategories: [...new Set(plan.foods.map((item) => item.category))],
            selectedActivityZones: plan.activityZones,
            selectedActivityItems: plan.activities,
            selectedWellnessItems: plan.wellness,
            generatedPerfectDay,
            selectedFoods: plan.foods.map((item) => ({
              mealType: item.category,
              name: item.name,
              category: item.category,
            })),
            language: copy.localeName,
          }),
        });

        if (!response.ok) {
          throw new Error("Session save failed");
        }

        const data = await response.json();
        setSavedSessionId(data.session_id || "");
        setSaveStatus("success");
      } catch (error) {
        setSaveStatus("error");
      }
    }

    saveSession();
  }, [
    copy.localeName,
    generatedPerfectDay,
    hero,
    plan,
    saveStatus,
    screen,
    selectedActivity,
    selectedReward,
  ]);

  useEffect(() => {
    return () => {
      if (zoneTimerRef.current) {
        clearTimeout(zoneTimerRef.current);
      }
    };
  }, []);

  function openZone(zone) {
    setAvatarPosition({ x: zone.x, y: zone.y });
    setActiveZone(null);

    if (zoneTimerRef.current) {
      clearTimeout(zoneTimerRef.current);
    }

    zoneTimerRef.current = setTimeout(() => {
      setActiveZone(zone);
      addVisitedZone(zone);
    }, 420);
  }

  function addVisitedZone(zone) {
    setPlan((currentPlan) => {
      const visitedZones = currentPlan.visitedZones.includes(zone.name)
        ? currentPlan.visitedZones
        : [...currentPlan.visitedZones, zone.name];
      const activityZones =
        zone.type === "activity" || zone.type === "wellness"
          ? addUnique(currentPlan.activityZones, zone.name)
          : currentPlan.activityZones;

      return { ...currentPlan, visitedZones, activityZones };
    });
  }

  function toggleFoodChoice(category, choice) {
    const foodName = normalizeFoodName(choice);

    setPlan((currentPlan) => {
      const exists = currentPlan.foods.some(
        (food) => food.name === foodName && food.category === category.name
      );
      const foodsForPlan = exists
        ? currentPlan.foods.filter(
            (food) => !(food.name === foodName && food.category === category.name)
          )
        : [...currentPlan.foods, { name: foodName, category: category.name }];

      return {
        ...currentPlan,
        foods: foodsForPlan,
        visitedZones: addUnique(currentPlan.visitedZones, "Food Hall / Main Buffet"),
      };
    });
  }

  function toggleZoneChoice(zone, choice) {
    setPlan((currentPlan) => {
      const fieldName = zone.type === "wellness" ? "wellness" : "activities";

      return {
        ...currentPlan,
        [fieldName]: toggleValue(currentPlan[fieldName], choice),
        visitedZones: addUnique(currentPlan.visitedZones, zone.name),
        activityZones: addUnique(currentPlan.activityZones, zone.name),
      };
    });
  }

  function restartQuest() {
    setScreen("welcome");
    setHero(null);
    setAvatarPosition(getZonePosition("reception"));
    setActiveZone(null);
    setActiveFoodDetails(null);
    setShowPrivacyInfo(false);
    setPlan(createEmptyPlan());
    setSaveStatus("idle");
    setSavedSessionId("");
    saveStartedRef.current = false;
  }

  return (
    <main className="app-shell">
      <div className="kiosk-panel">
        {screen === "welcome" ? (
          <section className="screen welcome-screen">
            <p className="eyebrow">Terme Sveti Martin</p>
            <h1>{copy.title}</h1>
            <p className="subtitle">{copy.subtitle}</p>
            <LanguageSwitch language={language} onChange={setLanguage} />
            <p className="privacy-notice">{copy.privacyNotice}</p>
            <button type="button" className="privacy-button" onClick={() => setShowPrivacyInfo(true)}>
              {copy.privacyInfo}
            </button>
            <button type="button" className="primary-button large-button" onClick={() => setScreen("avatar")}>
              {copy.startQuest}
            </button>
          </section>
        ) : null}

        {screen === "avatar" ? (
          <AvatarSelection
            copy={copy}
            hero={hero}
            language={language}
            onBack={() => setScreen("welcome")}
            onHeroChange={setHero}
            onNext={() => setScreen("map")}
          />
        ) : null}

        {screen === "map" ? (
          <section className="screen map-screen">
            <div className="screen-heading map-heading">
              <div>
                <p className="eyebrow">{copy.mapTitle}</p>
                <h1>{copy.mapSubtitle}</h1>
              </div>
              <LanguageSwitch language={language} onChange={setLanguage} />
            </div>

            <div className="game-layout">
              <ResortMap
                avatar={hero}
                avatarPosition={avatarPosition}
                language={language}
                onZoneClick={openZone}
              />
              <PerfectDayPanel
                copy={copy}
                hero={hero}
                plan={plan}
                language={language}
                canFinish={canFinish}
                recommendations={recommendations}
                onFinish={() => setScreen("ending")}
              />
            </div>

            <div className="actions">
              <button type="button" className="secondary-button" onClick={() => setScreen("avatar")}>
                {copy.back}
              </button>
            </div>
          </section>
        ) : null}

        {screen === "ending" ? (
          <EndingScreen
            copy={copy}
            hero={hero}
            language={language}
            plan={plan}
            recommendations={recommendations}
            saveStatus={saveStatus}
            savedSessionId={savedSessionId}
            selectedActivity={selectedActivity}
            selectedReward={selectedReward}
            onBack={() => setScreen("map")}
            onReset={restartQuest}
          />
        ) : null}

        {activeZone?.type === "foodHall" ? (
          <FoodHallModal
            copy={copy}
            language={language}
            plan={plan}
            onToggleFood={toggleFoodChoice}
            onFoodInfo={setActiveFoodDetails}
            onClose={() => setActiveZone(null)}
          />
        ) : null}

        {activeZone && activeZone.type !== "foodHall" ? (
          <ZoneModal
            zone={activeZone}
            copy={copy}
            language={language}
            selectedChoices={activeZone.type === "wellness" ? plan.wellness : plan.activities}
            onToggleChoice={toggleZoneChoice}
            onClose={() => setActiveZone(null)}
          />
        ) : null}

        {activeFoodDetails ? (
          <FoodDetailsModal
            food={activeFoodDetails}
            language={language}
            copy={copy}
            onClose={() => setActiveFoodDetails(null)}
          />
        ) : null}

        {showPrivacyInfo ? (
          <PrivacyModal onClose={() => setShowPrivacyInfo(false)} copy={copy} />
        ) : null}
      </div>
    </main>
  );
}

function AvatarSelection({ copy, hero, language, onBack, onHeroChange, onNext }) {
  return (
    <section className="screen">
      <div className="screen-heading">
        <p className="eyebrow">{copy.chooseHero}</p>
        <h1>{copy.whoToday}</h1>
      </div>

      <div className="option-grid hero-grid">
        {avatars.map((item) => (
          <button
            type="button"
            key={item.name}
            className={`option-card ${hero?.name === item.name ? "selected" : ""}`}
            onClick={() => onHeroChange(item)}
          >
            <span className="option-icon">{item.emoji}</span>
            <strong>{localText(item, "name", language)}</strong>
            <small>{localText(item, "description", language)}</small>
          </button>
        ))}
      </div>

      <div className="actions">
        <button type="button" className="secondary-button" onClick={onBack}>
          {copy.back}
        </button>
        <button type="button" className="primary-button" disabled={!hero} onClick={onNext}>
          {copy.startQuest}
        </button>
      </div>
    </section>
  );
}

function ResortMap({ avatar, avatarPosition, language, onZoneClick }) {
  return (
    <section className="map-shell">
      <div className="hotel-map" aria-label="2D resort floor plan">
        <div className="hotel-outline" />
        <div className="corridor corridor-main" />
        <div className="corridor corridor-cross" />
        <div className="corridor corridor-north" />
        <div className="courtyard-label">Resort floor plan</div>

        {mapZones.map((zone) => (
          <MapZone
            key={zone.id}
            zone={zone}
            language={language}
            onClick={() => onZoneClick(zone)}
          />
        ))}

        <MovingAvatar avatar={avatar} position={avatarPosition} />
      </div>
    </section>
  );
}

function MapZone({ zone, language, onClick }) {
  return (
    <button
      type="button"
      className={`map-zone zone-${zone.type} zone-${zone.id}`}
      style={{
        left: `${zone.x}%`,
        top: `${zone.y}%`,
        width: `${zone.width}%`,
        height: `${zone.height}%`,
      }}
      onClick={onClick}
    >
      <span>{zone.icon}</span>
      <strong>{localText(zone, "name", language)}</strong>
    </button>
  );
}

function MovingAvatar({ avatar, position }) {
  return (
    <div className="moving-avatar" style={{ left: `${position.x}%`, top: `${position.y}%` }} aria-label="Selected avatar">
      <span>{avatar?.emoji || ":)"}</span>
    </div>
  );
}

function PerfectDayPanel({ copy, hero, plan, language, canFinish, recommendations, onFinish }) {
  return (
    <aside className="perfect-day-panel">
      <div className="panel-hero">
        <span>{hero?.emoji}</span>
        <div>
          <p className="eyebrow">{copy.currentPlan}</p>
          <strong>{hero ? localText(hero, "name", language) : ""}</strong>
        </div>
      </div>

      <PlanLine label={copy.selectedFoods} value={formatFoodChoices(plan.foods, language)} emptyText={copy.empty} />
      <PlanLine label={copy.selectedActivities} value={formatChoiceList(plan.activities, language)} emptyText={copy.empty} />
      <PlanLine label={copy.selectedRelaxation} value={formatChoiceList(plan.wellness, language)} emptyText={copy.empty} />

      <div className="station-list">
        <strong>{copy.selectedStations}</strong>
        <div>
          {plan.visitedZones.map((zone) => (
            <span key={zone}>{localZoneName(zone, language)}</span>
          ))}
        </div>
      </div>

      <div className="panel-recommendations">
        <strong>{copy.recommended}</strong>
        {recommendations.slice(0, 2).map((recommendation) => (
          <span key={recommendation}>{recommendation}</span>
        ))}
      </div>

      <button type="button" className="primary-button" disabled={!canFinish} onClick={onFinish}>
        {copy.finishQuest}
      </button>
      {!canFinish ? <p className="panel-hint">{copy.finishHint}</p> : null}
    </aside>
  );
}

function PlanLine({ label, value, emptyText }) {
  return (
    <article className="plan-line">
      <span>{label}</span>
      <strong>{value || emptyText}</strong>
    </article>
  );
}

function FoodHallModal({ copy, language, plan, onToggleFood, onFoodInfo, onClose }) {
  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <section className="modal food-hall-modal" role="dialog" aria-modal="true" aria-labelledby="food-hall-title" onClick={(event) => event.stopPropagation()}>
        <div className="modal-header">
          <div>
            <p className="eyebrow">Food Hall / Main Buffet</p>
            <h1 id="food-hall-title">{language === "hr" ? "Odaberi hranu" : "Choose Food"}</h1>
          </div>
          <button type="button" className="modal-close" aria-label="Close food hall" onClick={onClose}>
            X
          </button>
        </div>

        <p className="modal-description">{copy.foodHallIntro}</p>

        <div className="food-category-grid">
          {foodHallCategories.map((category) => (
            <article className="food-category-section" key={category.id}>
              <h2>{localText(category, "name", language)}</h2>
              <div className="food-category-options">
                {category.choices.map((choice) => {
                  const food = findFood(choice);
                  const normalizedName = normalizeFoodName(choice);
                  const selected = plan.foods.some(
                    (item) => item.name === normalizedName && item.category === category.name
                  );

                  return (
                    <div className={`food-map-choice ${selected ? "selected" : ""}`} key={`${category.id}-${choice}`}>
                      <button type="button" className="choice-button" onClick={() => onToggleFood(category, choice)}>
                        <span className="food-choice-icon">{food?.icon || foodIcons[normalizedName] || "🍽️"}</span>
                        {selected ? copy.selected : copy.addChoice}: {localChoiceName(choice, language)}
                      </button>
                      {food ? (
                        <button type="button" className="info-button" onClick={() => onFoodInfo(food)}>
                          {copy.moreInfo}
                        </button>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </article>
          ))}
        </div>

        <button type="button" className="primary-button" onClick={onClose}>
          {copy.close}
        </button>
      </section>
    </div>
  );
}

function ZoneModal({ zone, copy, language, selectedChoices, onToggleChoice, onClose }) {
  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <section className="modal station-modal" role="dialog" aria-modal="true" aria-labelledby="zone-modal-title" onClick={(event) => event.stopPropagation()}>
        <div className="modal-header">
          <div>
            <p className="eyebrow">{copy.chooseFromZone}</p>
            <h1 id="zone-modal-title">{localText(zone, "name", language)}</h1>
          </div>
          <button type="button" className="modal-close" aria-label="Close zone choices" onClick={onClose}>
            X
          </button>
        </div>

        {zone.type === "start" ? (
          <p className="modal-description">{copy.receptionHint}</p>
        ) : (
          <>
            <div className="zone-options-heading">{copy.zoneOptions}</div>
            <div className="station-choice-list">
              {zone.choices.map((choice) => (
                <article className={`station-choice-card ${selectedChoices.includes(choice) ? "selected" : ""}`} key={choice}>
                  <button type="button" className="choice-button" onClick={() => onToggleChoice(zone, choice)}>
                    {selectedChoices.includes(choice) ? copy.selected : copy.addChoice}: {localChoiceName(choice, language)}
                  </button>
                </article>
              ))}
            </div>
          </>
        )}

        <button type="button" className="secondary-button" onClick={onClose}>
          {copy.close}
        </button>
      </section>
    </div>
  );
}

function EndingScreen({
  copy,
  hero,
  language,
  plan,
  recommendations,
  saveStatus,
  savedSessionId,
  selectedActivity,
  selectedReward,
  onBack,
  onReset,
}) {
  return (
    <section className="screen ending-screen">
      <div className="screen-heading">
        <p className="eyebrow">{copy.endingTitle}</p>
        <h1>{copy.questComplete}</h1>
      </div>

      <div className="ending-card">
        <span className="ending-icon">{hero?.emoji}</span>
        <div>
          <p>{copy.perfectDay}</p>
          <strong>
            {formatFoodChoices(plan.foods, language)} {"->"} {localChoiceName(selectedActivity || selectedReward, language)} {"->"} {localChoiceName(selectedReward, language)}
          </strong>
        </div>
      </div>

      <div className="recommendation ending-recommendations">
        <h2>{copy.recommended}</h2>
        <ul>
          {recommendations.map((recommendation) => (
            <li key={recommendation}>{recommendation}</li>
          ))}
        </ul>
      </div>

      <p className="privacy-notice save-privacy-notice">{copy.privacyNotice}</p>
      <SaveMessage status={saveStatus} sessionId={savedSessionId} copy={copy} />

      <div className="actions">
        <button type="button" className="secondary-button" disabled={saveStatus === "saving"} onClick={onBack}>
          {copy.back}
        </button>
        <button type="button" className="primary-button" disabled={saveStatus === "saving"} onClick={onReset}>
          {copy.reset}
        </button>
      </div>
    </section>
  );
}

function LanguageSwitch({ language, onChange }) {
  return (
    <div className="language-switch" aria-label="Language">
      <button type="button" className={language === "en" ? "selected" : ""} onClick={() => onChange("en")}>
        English
      </button>
      <button type="button" className={language === "hr" ? "selected" : ""} onClick={() => onChange("hr")}>
        Hrvatski
      </button>
    </div>
  );
}

function PrivacyModal({ onClose, copy }) {
  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <section className="modal privacy-modal" role="dialog" aria-modal="true" aria-labelledby="privacy-modal-title" onClick={(event) => event.stopPropagation()}>
        <div className="modal-header">
          <div>
            <p className="eyebrow">{copy.privacyInfo}</p>
            <h1 id="privacy-modal-title">{copy.anonymousData}</h1>
          </div>
          <button type="button" className="modal-close" aria-label="Close privacy info" onClick={onClose}>
            X
          </button>
        </div>

        <p className="modal-description">{copy.privacyNotice}</p>
        <button type="button" className="primary-button" onClick={onClose}>
          {copy.close}
        </button>
      </section>
    </div>
  );
}

function Dashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [dashboardStatus, setDashboardStatus] = useState("loading");

  useEffect(() => {
    async function loadDashboard() {
      try {
        const response = await fetch("http://localhost:3000/api/dashboard");
        if (!response.ok) throw new Error("Dashboard request failed");
        const data = await response.json();
        setDashboardData(data);
        setDashboardStatus("success");
      } catch (error) {
        setDashboardStatus("error");
      }
    }

    loadDashboard();
  }, []);

  return (
    <main className="dashboard-shell">
      <header className="dashboard-header">
        <div>
          <p className="eyebrow">Internal Dashboard</p>
          <h1>Smart Guest Quest Insights</h1>
        </div>
        <a className="dashboard-link" href="/">
          Open game
        </a>
      </header>

      {dashboardStatus === "loading" ? <p className="dashboard-state">Loading dashboard data...</p> : null}
      {dashboardStatus === "error" ? (
        <p className="dashboard-state error-message">
          Dashboard data could not be loaded. Make sure the backend is running on http://localhost:3000.
        </p>
      ) : null}

      {dashboardStatus === "success" ? (
        <section className="dashboard-grid">
          <article className="metric-card">
            <span>Total completed sessions</span>
            <strong>{dashboardData.totalSessions}</strong>
          </article>
          <DashboardList title="Avatar / Guest Segment Breakdown" items={dashboardData.avatarBreakdown} showPercentage />
          <DashboardList title="Most Selected Breakfast Items" items={dashboardData.breakfastPreferences || []} />
          <DashboardList title="Most Selected Lunch Items" items={dashboardData.lunchPreferences || []} />
          <DashboardList title="Most Selected Dinner Items" items={dashboardData.dinnerPreferences || []} />
          <DashboardList title="Most Selected Food Categories" items={dashboardData.foodCategories || []} />
          <DashboardList title="Most Selected Food Items" items={dashboardData.foodPreferences} />
          <DashboardList title="Most Selected Activity Zones" items={dashboardData.activityZones || []} />
          <DashboardList title="Most Selected Activities" items={dashboardData.activityItems || dashboardData.activityPreferences} />
          <DashboardList title="Most Selected Wellness / Reward Options" items={dashboardData.wellnessPreferences || dashboardData.rewardPreferences} />

          <article className="dashboard-card recommendations-card">
            <h2>Operational Recommendations</h2>
            <ul>
              {dashboardData.recommendations.map((recommendation) => (
                <li key={recommendation}>{recommendation}</li>
              ))}
            </ul>
          </article>

          <article className="dashboard-card responses-card">
            <h2>Anonymous Guest Responses</h2>
            <DashboardResponses responses={dashboardData.responses || []} />
          </article>
        </section>
      ) : null}
    </main>
  );
}

function DashboardList({ title, items, showPercentage = false }) {
  return (
    <article className="dashboard-card">
      <h2>{title}</h2>
      {items.length > 0 ? (
        <div className="chart-list">
          {items.map((item) => (
            <div className="chart-row" key={item.name}>
              <div className="chart-row-label">
                <span>{item.name}</span>
                <strong>{showPercentage ? `${item.percentage}%` : item.count}</strong>
              </div>
              <div className="chart-track">
                <div className="chart-fill" style={{ width: `${Math.max(item.percentage, 4)}%` }} />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="empty-dashboard">No completed sessions yet.</p>
      )}
    </article>
  );
}

function DashboardResponses({ responses }) {
  if (responses.length === 0) {
    return <p className="empty-dashboard">No anonymous responses yet.</p>;
  }

  return (
    <div className="responses-table-wrap">
      <table className="responses-table">
        <thead>
          <tr>
            <th>Created</th>
            <th>Avatar</th>
            <th>Food</th>
            <th>Activities</th>
            <th>Wellness</th>
            <th>Zones</th>
            <th>Perfect day</th>
          </tr>
        </thead>
        <tbody>
          {responses.map((response) => (
            <tr key={response.sessionId}>
              <td>{formatDateTime(response.createdAt)}</td>
              <td>{response.avatar}</td>
              <td>
                <div className="meal-answer-list">
                  {response.foods.length > 0
                    ? response.foods.map((food) => (
                        <span key={`${response.sessionId}-${food.mealType}-${food.name}`}>
                          {food.mealType || "Food"}: {food.name}
                        </span>
                      ))
                    : response.foodPreference}
                </div>
              </td>
              <td>{(response.selectedActivityItems || []).join(", ") || response.activityPreference}</td>
              <td>{(response.selectedWellnessItems || []).join(", ") || response.rewardPreference}</td>
              <td>
                <div className="meal-answer-list">
                  {(response.selectedStations || []).map((zone) => (
                    <span key={`${response.sessionId}-${zone}`}>{zone}</span>
                  ))}
                </div>
              </td>
              <td>{response.generatedPerfectDay || ""}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function FoodDetailsModal({ food, language, copy, onClose }) {
  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <section className="modal" role="dialog" aria-modal="true" aria-labelledby="food-modal-title" onClick={(event) => event.stopPropagation()}>
        <div className="modal-header">
          <div>
            <p className="eyebrow">{localText(food, "category", language)}</p>
            <h1 id="food-modal-title">
              <span className="food-title-icon">{food.icon || "🍽️"}</span>
              {localText(food, "name", language)}
            </h1>
          </div>
          <button type="button" className="modal-close" aria-label="Close food details" onClick={onClose}>
            X
          </button>
        </div>
        {food.imageUrl ? (
          <img className="food-image" src={food.imageUrl} alt={localText(food, "name", language)} />
        ) : (
          <div className="food-image food-emoji-image" aria-hidden="true">
            {food.icon || "🍽️"}
          </div>
        )}
        <p className="modal-description">{localText(food, "description", language)}</p>
        <div className="nutrition-grid">
          <NutritionItem label={copy.calories} value={`${food.calories} kcal`} />
          <NutritionItem label={copy.protein} value={food.protein} />
          <NutritionItem label={copy.carbohydrates} value={food.carbohydrates} />
          <NutritionItem label={copy.fat} value={food.fat} />
        </div>
        <div className="allergen-box">
          <strong>{copy.allergens}</strong>
          <p>{localText(food, "allergens", language)}</p>
        </div>
        <div className="tag-list" aria-label="Food tags">
          {(language === "hr" ? food.tagsHr || food.tags : food.tags).map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>
        <button type="button" className="primary-button" onClick={onClose}>
          {copy.close}
        </button>
      </section>
    </div>
  );
}

function NutritionItem({ label, value }) {
  return (
    <article className="nutrition-item">
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}

function SaveMessage({ status, sessionId, copy }) {
  if (status === "saving") return <p className="save-message">{copy.saving}</p>;
  if (status === "success") {
    return (
      <div className="save-message success-message">
        <p>{copy.saved}</p>
        {sessionId ? <small>Anonymous session: {sessionId}</small> : null}
      </div>
    );
  }
  if (status === "error") return <p className="save-message error-message">{copy.saveError}</p>;
  return null;
}

function getResortRecommendations(heroName, choices, language) {
  const relatedChoices = [heroName, ...choices].filter(Boolean);
  const matchedServices = resortRecommendations
    .filter((recommendation) =>
      recommendation.relatedChoices.some((choice) => relatedChoices.includes(choice))
    )
    .map((recommendation) => localText(recommendation, "title", language));

  const directRecommendations = [];

  if (relatedChoices.some((choice) => ["Wellness Program", "Spa Relaxation", "Wellness Break"].includes(choice))) {
    directRecommendations.push(language === "hr" ? "Spa, wellness programi i zone opustanja" : "Spa, wellness programs and relaxation areas");
  }
  if (relatedChoices.some((choice) => ["Fitness", "Cycling", "Sports Challenge"].includes(choice))) {
    directRecommendations.push(language === "hr" ? "Fitness, biciklisticke rute i aktivni turizam" : "Fitness, cycling routes and active tourism");
  }
  if (relatedChoices.some((choice) => ["Nature Walk", "Biodynamic Garden", "Sustainability Activity", "Outdoor Experience"].includes(choice))) {
    directRecommendations.push(language === "hr" ? "Setnje u prirodi, biodinamicki vrt i odrzive aktivnosti" : "Nature walks, biodynamic garden and sustainability activities");
  }
  if (relatedChoices.some((choice) => ["Swimming", "Water Adventure", "Pool Time"].includes(choice))) {
    directRecommendations.push(language === "hr" ? "Bazeni, plivanje i vodene aktivnosti" : "Pools, swimming and water activities");
  }
  if (relatedChoices.some((choice) => ["Local Dish", "Seasonal Ingredients", "Homemade Pastry"].includes(choice))) {
    directRecommendations.push(language === "hr" ? "Lokalno gastro iskustvo i Healthness kuhinja" : "Local food experience and Healthness cuisine");
  }

  const defaultServices =
    language === "hr"
      ? ["Savjet za aktivnosti na recepciji", "Zdrave opcije dorucka prema tvom planu", "Programi za ravnotezu aktivnosti i opustanja"]
      : ["Personalized resort activity advice at reception", "Healthy breakfast options aligned with your day plan", "Relaxation and activity programs for a balanced guest experience"];

  const allRecommendations = [
    ...directRecommendations,
    ...matchedServices,
  ];

  return [...new Set(allRecommendations.length > 0 ? allRecommendations : defaultServices)].slice(0, 3);
}

function makeFood(id, name, nameHr, category, categoryHr, calories, protein, carbohydrates, fat, allergens, allergensHr, tags, tagsHr, description, descriptionHr, imageUrl) {
  return { id, name, nameHr, category, categoryHr, calories, protein, carbohydrates, fat, allergens, allergensHr, tags, tagsHr, description, descriptionHr, imageUrl };
}

function createEmptyPlan() {
  return {
    foods: [],
    activities: [],
    wellness: [],
    visitedZones: ["Reception / Start Point"],
    activityZones: [],
  };
}

function findFood(choice) {
  const normalizedChoice = normalizeFoodName(choice);
  return foodCatalog.find((food) => food.name === normalizedChoice);
}

function normalizeFoodName(choice) {
  if (choice === "Fresh Fruit") return "Fruit";
  return choice;
}

function addUnique(items, value) {
  return items.includes(value) ? items : [...items, value];
}

function toggleValue(items, value) {
  return items.includes(value)
    ? items.filter((item) => item !== value)
    : [...items, value];
}

function localChoiceName(choice, language) {
  if (!choice) return "";
  const normalizedChoice = normalizeFoodName(choice);
  const food = foodCatalog.find((item) => item.name === normalizedChoice);
  const activity = [...activities, ...activityFallbacks].find((item) => item.name === choice);
  const reward = rewards.find((item) => item.name === choice);

  if (food) return localText(food, "name", language);
  if (activity) return localText(activity, "name", language);
  if (reward) return localText(reward, "name", language);
  if (language === "hr" && choiceTranslations[choice]) return choiceTranslations[choice];
  return choice;
}

function localZoneName(zoneName, language) {
  const zone = mapZones.find((item) => item.name === zoneName);
  return zone ? localText(zone, "name", language) : zoneName;
}

function formatChoiceList(choices, language) {
  return choices.map((choice) => localChoiceName(choice, language)).join(", ");
}

function formatFoodChoices(foodItems, language = "en") {
  return foodItems.map((item) => localChoiceName(item.name, language)).join(", ");
}

function localText(item, field, language) {
  if (language === "hr") return item[`${field}Hr`] || item[field];
  return item[field];
}

function getZonePosition(zoneId) {
  const zone = mapZones.find((item) => item.id === zoneId);
  return { x: zone?.x || 50, y: zone?.y || 88 };
}

function formatDateTime(value) {
  if (!value) return "";
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value.replace(" ", "T")));
}

export default App;
