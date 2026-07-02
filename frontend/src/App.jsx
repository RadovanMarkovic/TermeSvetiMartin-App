import { useEffect, useRef, useState } from "react";
import {
  activities,
  avatars,
  foods,
  mealOptions,
  resortRecommendations,
  rewardDisplayNames,
  rewards,
} from "./data";

const planIcons = {
  morning: "\uD83C\uDF7D\uFE0F",
  afternoon: "\u2600\uFE0F",
  evening: "\u2728",
};

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
    eyebrow: "Terme Sveti Martin",
    title: "Smart Guest Quest",
    subtitle: "Build your perfect resort day",
    privacyNotice,
    privacyInfo: "Privacy info",
    startQuest: "Start Quest",
    chooseHero: "Choose Your Hero",
    whoToday: "Who are you today?",
    miniAdventure: "Mini Adventure",
    choosePath: "choose your path",
    activityPreference: "A) Activity preference",
    mealsForToday: "B) Meals for today",
    mealHint: "Choose one or more items for each meal.",
    rewardPreference: "C) Reward preference",
    back: "Back",
    next: "Next",
    buildDay: "Build Your Perfect Day",
    resortPlan: "Your resort plan",
    activity: "Activity",
    reward: "Reward",
    endingTitle: "Personalized Ending",
    questComplete: "Quest complete",
    perfectDay: "Your perfect resort day is:",
    recommended: "Recommended for you:",
    thankYou: "Thank You",
    thankYouText:
      "Thank you for helping us create a smarter and more sustainable guest experience.",
    saving: "Saving your anonymous quest...",
    saved:
      "Your quest has been saved. Thank you for helping us reduce food waste and improve the guest experience.",
    saveError:
      "Your quest was completed, but we could not save the data at this moment.",
    reset: "Reset Quest",
    moreInfo: "More info",
    close: "Close",
    anonymousData: "Anonymous game data",
    calories: "Calories",
    protein: "Protein",
    carbohydrates: "Carbohydrates",
    fat: "Fat",
    allergens: "Allergens",
  },
  hr: {
    localeName: "Hrvatski",
    eyebrow: "Terme Sveti Martin",
    title: "Smart Guest Quest",
    subtitle: "Složite svoj savršeni dan u resortu",
    privacyNotice:
      "Ova igra prikuplja samo anonimne podatke o preferencijama kako bismo bolje planirali hranu, smanjili otpad i preporučili aktivnosti u resortu. Ne prikupljamo imena, brojeve soba, fotografije niti osobne podatke.",
    privacyInfo: "Info o privatnosti",
    startQuest: "Započni igru",
    chooseHero: "Odaberi svog heroja",
    whoToday: "Tko ste danas?",
    miniAdventure: "Mini avantura",
    choosePath: "odaberite svoj put",
    activityPreference: "A) Preferencija aktivnosti",
    mealsForToday: "B) Obroci za danas",
    mealHint: "Odaberite jednu ili više stavki za svaki obrok.",
    rewardPreference: "C) Preferencija nagrade",
    back: "Nazad",
    next: "Dalje",
    buildDay: "Složite savršeni dan",
    resortPlan: "Tvoj plan dana",
    activity: "Aktivnost",
    reward: "Nagrada",
    endingTitle: "Personalizirani završetak",
    questComplete: "Igra je završena",
    perfectDay: "Tvoj savršeni dan u resortu je:",
    recommended: "Preporučeno za tebe:",
    thankYou: "Hvala",
    thankYouText:
      "Hvala što nam pomažeš stvoriti pametnije i održivije iskustvo za goste.",
    saving: "Spremamo tvoj anonimni odgovor...",
    saved:
      "Tvoj odgovor je spremljen. Hvala što nam pomažeš smanjiti bacanje hrane i poboljšati iskustvo gostiju.",
    saveError:
      "Igra je završena, ali trenutačno ne možemo spremiti podatke.",
    reset: "Pokreni ponovo",
    moreInfo: "Više info",
    close: "Zatvori",
    anonymousData: "Anonimni podaci igre",
    calories: "Kalorije",
    protein: "Proteini",
    carbohydrates: "Ugljikohidrati",
    fat: "Masti",
    allergens: "Alergeni",
  },
};

function App() {
  if (window.location.pathname === "/dashboard") {
    return <Dashboard />;
  }

  const [step, setStep] = useState(1);
  const [hero, setHero] = useState(null);
  const [activity, setActivity] = useState("");
  const [meals, setMeals] = useState({
    breakfast: [],
    lunch: [],
    dinner: [],
  });
  const [reward, setReward] = useState("");
  const [activeFoodDetails, setActiveFoodDetails] = useState(null);
  const [saveStatus, setSaveStatus] = useState("idle");
  const [savedSessionId, setSavedSessionId] = useState("");
  const [showPrivacyInfo, setShowPrivacyInfo] = useState(false);
  const [language, setLanguage] = useState("en");
  const saveStartedRef = useRef(false);
  const copy = translations[language];

  const allMealsSelected = mealOptions.every(
    (meal) => meals[meal.id].length > 0
  );
  const canContinueAdventure = activity && allMealsSelected && reward;
  const selectedFoods = mealOptions
    .flatMap((meal) =>
      meals[meal.id].map((foodName) => {
        const foodItem = foods.find((item) => item.name === foodName);

        return {
          mealType: meal.label,
          name: foodItem?.name || foodName,
          category: foodItem?.category || "",
        };
      })
    );
  const foodPreference = selectedFoods
    .map((item) => `${item.mealType}: ${item.name}`)
    .join("; ");
  const morningPlan = meals.breakfast.length
    ? `Breakfast: ${formatMealSelection(meals.breakfast)}`
    : "";
  const afternoonPlan = activity;
  const lunchPlan = meals.lunch.length
    ? `Lunch: ${formatMealSelection(meals.lunch)}`
    : "";
  const dinnerPlan = meals.dinner.length
    ? `Dinner: ${formatMealSelection(meals.dinner)}`
    : "";
  const eveningPlan = reward ? rewardDisplayNames[reward] : "";
  const resortRecommendations = getResortRecommendations(
    hero?.name,
    activity,
    language
  );

  useEffect(() => {
    if (step !== 6 || saveStatus !== "idle" || saveStartedRef.current) {
      return;
    }

    async function saveSession() {
      saveStartedRef.current = true;
      setSaveStatus("saving");

      try {
        const response = await fetch("http://localhost:3000/api/sessions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            avatar: hero?.name,
            mainInterest: mainInterests[hero?.name] || "",
            activityPreference: activity,
            foodPreference,
            rewardPreference: reward,
            morningPlan,
            afternoonPlan: `${lunchPlan}; Activity: ${afternoonPlan}`,
            eveningPlan: `${dinnerPlan}; Reward: ${eveningPlan}`,
            selectedFoods,
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
    activity,
    afternoonPlan,
    dinnerPlan,
    eveningPlan,
    foodPreference,
    lunchPlan,
    hero,
    morningPlan,
    reward,
    saveStatus,
    selectedFoods,
    step,
  ]);

  function updateMeal(mealId, foodName) {
    setMeals((currentMeals) => ({
      ...currentMeals,
      [mealId]: currentMeals[mealId].includes(foodName)
        ? currentMeals[mealId].filter((item) => item !== foodName)
        : [...currentMeals[mealId], foodName],
    }));
  }

  function restartQuest() {
    setStep(1);
    setHero(null);
    setActivity("");
    setMeals({
      breakfast: [],
      lunch: [],
      dinner: [],
    });
    setReward("");
    setActiveFoodDetails(null);
    setSaveStatus("idle");
    setSavedSessionId("");
    setShowPrivacyInfo(false);
    saveStartedRef.current = false;
  }

  return (
    <main className="app-shell">
      <div className="kiosk-panel">
        {step > 1 && step < 6 ? (
          <div className="progress">
            <span>Step {step} of 6</span>
            <div className="progress-track">
              <div
                className="progress-fill"
                style={{ width: `${(step / 6) * 100}%` }}
              />
            </div>
          </div>
        ) : null}

        {step === 1 ? (
          <section className="screen welcome-screen">
            <p className="eyebrow">Terme Sveti Martin</p>
            <h1>{copy.title}</h1>
            <p className="subtitle">{copy.subtitle}</p>
            <LanguageSwitch language={language} onChange={setLanguage} />
            <p className="privacy-notice">{copy.privacyNotice}</p>
            <button
              type="button"
              className="privacy-button"
              onClick={() => setShowPrivacyInfo(true)}
            >
              {copy.privacyInfo}
            </button>
            <button
              type="button"
              className="primary-button large-button"
              onClick={() => setStep(2)}
            >
              {copy.startQuest}
            </button>
          </section>
        ) : null}

        {step === 2 ? (
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
                  className={`option-card ${
                    hero?.name === item.name ? "selected" : ""
                  }`}
                  onClick={() => setHero(item)}
                >
                  <span className="option-icon">{item.emoji}</span>
                  <strong>{localText(item, "name", language)}</strong>
                  <small>{localText(item, "description", language)}</small>
                </button>
              ))}
            </div>

            <div className="actions">
              <button type="button" className="secondary-button" onClick={() => setStep(1)}>
                {copy.back}
              </button>
              <button
                type="button"
                className="primary-button"
                disabled={!hero}
                onClick={() => setStep(3)}
              >
                {copy.next}
              </button>
            </div>
          </section>
        ) : null}

        {step === 3 ? (
          <section className="screen">
            <div className="screen-heading">
              <p className="eyebrow">{copy.miniAdventure}</p>
              <h1>
                {hero ? localText(hero, "name", language) : ""},{" "}
                {copy.choosePath}
              </h1>
            </div>

            <ChoiceGroup
              title={copy.activityPreference}
              options={activities}
              value={activity}
              onChange={setActivity}
              getOptionLabel={(item) => localText(item, "name", language)}
              getOptionValue={(item) => item.name}
            />
            <MealChoiceGroup
              title={copy.mealsForToday}
              meals={meals}
              onChange={updateMeal}
              onInfo={setActiveFoodDetails}
              language={language}
              copy={copy}
            />
            <ChoiceGroup
              title={copy.rewardPreference}
              options={rewards}
              value={reward}
              onChange={setReward}
              getOptionLabel={(item) => localText(item, "name", language)}
              getOptionValue={(item) => item.name}
            />

            <div className="actions">
              <button type="button" className="secondary-button" onClick={() => setStep(2)}>
                {copy.back}
              </button>
              <button
                type="button"
                className="primary-button"
                disabled={!canContinueAdventure}
                onClick={() => setStep(4)}
              >
                {copy.next}
              </button>
            </div>
          </section>
        ) : null}

        {step === 4 ? (
          <section className="screen">
            <div className="screen-heading">
              <p className="eyebrow">{copy.buildDay}</p>
              <h1>{copy.resortPlan}</h1>
            </div>

            <div className="day-plan">
              <PlanItem
                label={localMealLabel("breakfast", language)}
                icon={planIcons.morning}
                value={formatMealSelection(meals.breakfast, language)}
              />
              <PlanItem
                label={localMealLabel("lunch", language)}
                icon={planIcons.morning}
                value={formatMealSelection(meals.lunch, language)}
              />
              <PlanItem
                label={localMealLabel("dinner", language)}
                icon={planIcons.evening}
                value={formatMealSelection(meals.dinner, language)}
              />
              <PlanItem
                label={copy.activity}
                icon={planIcons.afternoon}
                value={localNameByName(activities, activity, language)}
              />
              <PlanItem
                label={copy.reward}
                icon={planIcons.evening}
                value={localNameByName(rewards, reward, language)}
              />
            </div>

            <div className="hero-summary">
              <span>{hero?.emoji}</span>
              <div>
                <strong>{hero ? localText(hero, "name", language) : ""}</strong>
                <p>{hero ? localText(hero, "description", language) : ""}</p>
              </div>
            </div>

            <div className="actions">
              <button type="button" className="secondary-button" onClick={() => setStep(3)}>
                {copy.back}
              </button>
              <button type="button" className="primary-button" onClick={() => setStep(5)}>
                {copy.next}
              </button>
            </div>
          </section>
        ) : null}

        {step === 5 ? (
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
                  {formatMealSelection(meals.breakfast, language)} {"\u2192"}{" "}
                  {localNameByName(activities, activity, language)} {"\u2192"}{" "}
                  {localNameByName(rewards, reward, language)}
                </strong>
              </div>
            </div>

            <div className="recommendation ending-recommendations">
              <h2>{copy.recommended}</h2>
              <ul>
                {resortRecommendations.map((recommendation) => (
                  <li key={recommendation}>{recommendation}</li>
                ))}
              </ul>
            </div>

            <div className="actions">
              <button type="button" className="secondary-button" onClick={() => setStep(4)}>
                {copy.back}
              </button>
              <button type="button" className="primary-button" onClick={() => setStep(6)}>
                {copy.next}
              </button>
            </div>
          </section>
        ) : null}

        {step === 6 ? (
          <section className="screen thank-you-screen">
            <p className="eyebrow">{copy.thankYou}</p>
            <h1>{copy.thankYouText}</h1>
            <p className="privacy-notice save-privacy-notice">
              {copy.privacyNotice}
            </p>
            <button
              type="button"
              className="privacy-button"
              onClick={() => setShowPrivacyInfo(true)}
            >
              {copy.privacyInfo}
            </button>
            <SaveMessage
              status={saveStatus}
              sessionId={savedSessionId}
              copy={copy}
            />
            <button
              type="button"
              className="primary-button large-button"
              disabled={saveStatus === "saving"}
              onClick={restartQuest}
            >
              {copy.reset}
            </button>
          </section>
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
          <PrivacyModal
            onClose={() => setShowPrivacyInfo(false)}
            copy={copy}
          />
        ) : null}
      </div>
    </main>
  );
}

function LanguageSwitch({ language, onChange }) {
  return (
    <div className="language-switch" aria-label="Language">
      <button
        type="button"
        className={language === "en" ? "selected" : ""}
        onClick={() => onChange("en")}
      >
        English
      </button>
      <button
        type="button"
        className={language === "hr" ? "selected" : ""}
        onClick={() => onChange("hr")}
      >
        Hrvatski
      </button>
    </div>
  );
}

function PrivacyModal({ onClose, copy }) {
  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <section
        className="modal privacy-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="privacy-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="modal-header">
          <div>
            <p className="eyebrow">{copy.privacyInfo}</p>
            <h1 id="privacy-modal-title">{copy.anonymousData}</h1>
          </div>
          <button
            type="button"
            className="modal-close"
            aria-label="Close privacy info"
            onClick={onClose}
          >
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

        if (!response.ok) {
          throw new Error("Dashboard request failed");
        }

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

      {dashboardStatus === "loading" ? (
        <p className="dashboard-state">Loading dashboard data...</p>
      ) : null}

      {dashboardStatus === "error" ? (
        <p className="dashboard-state error-message">
          Dashboard data could not be loaded. Make sure the backend is running
          on http://localhost:3000.
        </p>
      ) : null}

      {dashboardStatus === "success" ? (
        <section className="dashboard-grid">
          <article className="metric-card">
            <span>Total completed sessions</span>
            <strong>{dashboardData.totalSessions}</strong>
          </article>

          <DashboardList
            title="Avatar / Guest Segment Breakdown"
            items={dashboardData.avatarBreakdown}
            showPercentage
          />
          <DashboardList
            title="Most Selected Food Preferences"
            items={dashboardData.foodPreferences}
          />
          <DashboardList
            title="Most Selected Activity Preferences"
            items={dashboardData.activityPreferences}
          />
          <DashboardList
            title="Most Selected Reward Preferences"
            items={dashboardData.rewardPreferences}
          />

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

function getResortRecommendations(heroName, activity, language) {
  const matchedServices = resortRecommendations
    .filter(
      (recommendation) =>
        recommendation.relatedChoices.includes(heroName) ||
        recommendation.relatedChoices.includes(activity)
    )
    .map((recommendation) => localText(recommendation, "title", language));

  const defaultServices = [
    "Personalized resort activity advice at reception",
    "Healthy breakfast options aligned with your day plan",
    "Relaxation and activity programs for a balanced guest experience",
  ];

  return [...new Set(matchedServices.length > 0 ? matchedServices : defaultServices)].slice(
    0,
    3
  );
}

function formatMealSelection(foodNames, language = "en") {
  return foodNames
    .map((foodName) => localNameByName(foods, foodName, language))
    .join(", ");
}

function localMealLabel(mealId, language) {
  const meal = mealOptions.find((item) => item.id === mealId);
  return meal ? localText(meal, "label", language) : mealId;
}

function localNameByName(items, name, language) {
  const item = items.find((currentItem) => currentItem.name === name);
  return item ? localText(item, "name", language) : name;
}

function localText(item, field, language) {
  if (language === "hr") {
    return item[`${field}Hr`] || item[field];
  }

  return item[field];
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
                <strong>
                  {showPercentage ? `${item.percentage}%` : item.count}
                </strong>
              </div>
              <div className="chart-track">
                <div
                  className="chart-fill"
                  style={{ width: `${Math.max(item.percentage, 4)}%` }}
                />
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
            <th>Activity</th>
            <th>Reward</th>
            <th>Meals</th>
          </tr>
        </thead>
        <tbody>
          {responses.map((response) => (
            <tr key={response.sessionId}>
              <td>{formatDateTime(response.createdAt)}</td>
              <td>{response.avatar}</td>
              <td>{response.activityPreference}</td>
              <td>{response.rewardPreference}</td>
              <td>
                <div className="meal-answer-list">
                  {response.foods.length > 0
                    ? response.foods.map((food) => (
                        <span key={`${response.sessionId}-${food.mealType}-${food.name}`}>
                          {food.mealType || "Meal"}: {food.name}
                        </span>
                      ))
                    : response.foodPreference}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function formatDateTime(value) {
  if (!value) {
    return "";
  }

  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value.replace(" ", "T")));
}

function SaveMessage({ status, sessionId, copy }) {
  if (status === "saving") {
    return <p className="save-message">{copy.saving}</p>;
  }

  if (status === "success") {
    return (
      <div className="save-message success-message">
        <p>
          {copy.saved}
        </p>
        {sessionId ? <small>Anonymous session: {sessionId}</small> : null}
      </div>
    );
  }

  if (status === "error") {
    return (
      <p className="save-message error-message">
        {copy.saveError}
      </p>
    );
  }

  return null;
}

function ChoiceGroup({
  title,
  options,
  value,
  onChange,
  getOptionLabel = (item) => item,
  getOptionValue = (item) => item,
  onInfo,
}) {
  return (
    <section className="choice-group">
      <h2>{title}</h2>
      <div className={`choice-grid ${onInfo ? "food-choice-grid" : ""}`}>
        {options.map((option) => {
          const label = getOptionLabel(option);
          const optionValue = getOptionValue(option);

          return (
            <div
              key={label}
              className={`choice-card ${value === optionValue ? "selected" : ""}`}
            >
              <button
                type="button"
                className={`choice-button ${
                  value === optionValue ? "selected" : ""
                }`}
                onClick={() => onChange(optionValue)}
              >
                {label}
              </button>
              {onInfo ? (
                <button
                  type="button"
                  className="info-button"
                  onClick={() => onInfo(option)}
                >
                  More info
                </button>
              ) : null}
            </div>
          );
        })}
      </div>
    </section>
  );
}

function MealChoiceGroup({ title, meals, onChange, onInfo, language, copy }) {
  return (
    <section className="choice-group">
      <h2>{title}</h2>
      <p className="choice-hint">{copy.mealHint}</p>
      <div className="meal-sections">
        {mealOptions.map((meal) => {
          const mealFoods = meal.foodNames
            .map((foodName) => foods.find((item) => item.name === foodName))
            .filter(Boolean);

          return (
            <article className="meal-section" key={meal.id}>
              <h3>{localText(meal, "label", language)}</h3>
              <div className="choice-grid food-choice-grid">
                {mealFoods.map((foodItem) => (
                  <div
                    key={`${meal.id}-${foodItem.name}`}
                    className={`choice-card ${
                      meals[meal.id].includes(foodItem.name) ? "selected" : ""
                    }`}
                  >
                    <button
                      type="button"
                      className={`choice-button ${
                        meals[meal.id].includes(foodItem.name) ? "selected" : ""
                      }`}
                      onClick={() => onChange(meal.id, foodItem.name)}
                    >
                      {localText(foodItem, "name", language)}
                    </button>
                    <button
                      type="button"
                      className="info-button"
                      onClick={() => onInfo(foodItem)}
                    >
                      {copy.moreInfo}
                    </button>
                  </div>
                ))}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function FoodDetailsModal({ food, language, copy, onClose }) {
  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <section
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="food-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="modal-header">
          <div>
            <p className="eyebrow">{localText(food, "category", language)}</p>
            <h1 id="food-modal-title">{localText(food, "name", language)}</h1>
          </div>
          <button
            type="button"
            className="modal-close"
            aria-label="Close food details"
            onClick={onClose}
          >
            X
          </button>
        </div>

        <img
          className="food-image"
          src={food.imageUrl}
          alt={localText(food, "name", language)}
        />

        <p className="modal-description">
          {localText(food, "description", language)}
        </p>

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

function PlanItem({ label, icon, value }) {
  return (
    <article className="plan-item">
      <span>{icon}</span>
      <p>{label}</p>
      <strong>{value}</strong>
    </article>
  );
}

export default App;
