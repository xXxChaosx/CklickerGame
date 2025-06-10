import React, { useEffect, useRef, useState } from 'react';
import { useClicker } from './hooks/useClicker';
import { useSaveGame } from './hooks/useSaveGame';
import { saveGame } from './db/indexedDB';
import ClickButton from './components/ClickButton';
import UpgradePanel from './components/UpgradePanel';
import BonusPanel from './components/BonusPanel';
import PrestigePanel from './components/PrestigePanel';
import GameStats from './components/GameStats';
import SkinPanel from './components/SkinPanel';
import AdminPanel from './components/AdminPanel';
import AntibonusPopup from './components/AntibonusPopup';
import './styles/App.module.scss';

const AUTO_SAVE_INTERVAL = 60;

const antiBonusOptions = [
  'freeze',
  'negativeClick',
  'loseCredits'
];

const App = () => {
  const {
    loading,
    credits,
    duiktCoins,
    clickValue,
    setClickValue,
    autoClickerValue,
    passiveIncomeValue,
    multiplier,
    comboChance,
    doubleCaseChance,
    skins,
    currentSkin,
    antibonus,
    isClickFrozen,
    earnCredits,
    openCase,
    buyUpgrade,
    switchSkin,
    applyPrestige,
    triggerAntibonus,
    antibonusTimeLeft,
  } = useClicker();

  const [saveTimer, setSaveTimer] = useState(AUTO_SAVE_INTERVAL);
  const [showAdmin, setShowAdmin] = useState(false);

  const timerRef = useRef();
  const antiBonusRef = useRef();

  const saveState = {
    credits,
    duiktCoins,
    clickValue,
    passiveIncomeValue,
    multiplier,
    comboChance,
    doubleCaseChance,
    skins,
    currentSkin
  };

  useEffect(() => {
    if (!loading) {
      timerRef.current = setInterval(() => {
        setSaveTimer((t) => {
          if (t <= 1) {
            saveGame(saveState);
            return AUTO_SAVE_INTERVAL;
          }
          return t - 1;
        });
      }, 1000);
    }

    return () => clearInterval(timerRef.current);
  }, [loading]);

  const handleSaveNow = async () => {
    await saveGame(saveState);
    setSaveTimer(AUTO_SAVE_INTERVAL);
  };

  useSaveGame(saveState, loading);

  const handleAddClickValue = () => {
    buyUpgrade('clickValue', 0, 10000000);
  };

  // Додаємо клас теми до body
  useEffect(() => {
    document.body.classList.remove('theme-light', 'theme-dark', 'theme-lightbrown');
    document.body.classList.add(`theme-${currentSkin}`);
  }, [currentSkin]);

  if (loading) {
    return (
      <div className={`app-container theme-light`}>
        <h1 className="game-title">Duikt Clicker Game</h1>
        <div style={{ fontSize: 24, marginTop: 40 }}>Завантаження...</div>
      </div>
    );
  }

  return (
    <div className={`app-container theme-${currentSkin}`}>
      <AntibonusPopup antibonus={antibonus} antibonusTimeLeft={antibonusTimeLeft} />
      {/* Кнопка для відкриття адмін-панелі */}
      {!showAdmin && (
        <button
          style={{
            position: 'fixed',
            top: 18,
            right: 28,
            zIndex: 1100,
            background: '#e91e63',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            padding: '4px 16px', // зменшено padding по висоті
            width: 60,           // ширина в 3 рази менша (було ~180px)
            fontWeight: 'bold',
            cursor: 'pointer',
            fontSize: '0.9rem',  // трохи менший шрифт
            boxShadow: '0 2px 8px #e91e6344'
          }}
          onClick={() => setShowAdmin(true)}
        >
          Adm
        </button>
      )}
      {/* Адмін-панель */}
      {showAdmin && (
        <AdminPanel
          addClickValue={handleAddClickValue}
          showAdmin={showAdmin}
          setShowAdmin={setShowAdmin}
        />
      )}
      <h1 className="game-title">Duikt Clicker Game</h1>

      <GameStats
        credits={credits}
        duiktCoins={duiktCoins}
        clickValue={clickValue}
        autoClickerValue={autoClickerValue}
        passiveIncomeValue={passiveIncomeValue}
        multiplier={multiplier}
        comboChance={comboChance}
        doubleCaseChance={doubleCaseChance}
      />
      <div className="main-sections">
        <div className="centered-stack">
          <ClickButton onClick={earnCredits} value={clickValue} credits={credits} />
          <UpgradePanel
            credits={credits}
            buyUpgrade={buyUpgrade}
            comboChance={comboChance}
            doubleCaseChance={doubleCaseChance}
            antibonus={antibonus}
          />
        </div>
        <BonusPanel
          credits={credits}
          duiktCoins={duiktCoins}
          openCase={openCase}
          buyUpgrade={buyUpgrade}
          comboChance={comboChance}
          doubleCaseChance={doubleCaseChance}
        />
        <PrestigePanel
          credits={credits}
          duiktCoins={duiktCoins}
          applyPrestige={applyPrestige}
        />
        <SkinPanel credits={credits} currentSkin={currentSkin} skins={skins} switchSkin={switchSkin} />
      </div>
    </div>
  );
};

export default App;
