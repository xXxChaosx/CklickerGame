import React, { useState, useRef } from 'react';
import styles from '../styles/BonusPanel.module.scss';
import { motion } from 'framer-motion';
import { playSound } from '../utils/playSound';
import wheelSound from '../sounds/wheel.mp3';
import caseSound from '../sounds/case.mp3';

const casesData = [
	{
		id: 'emerald',
		name: 'Смарагдовий кейс',
		cost: 120,
		rewards: [
			{ value: 80, chance: 0.3 },
			{ value: 150, chance: 0.3 },
			{ value: 300, chance: 0.3 },
			{ value: 600, chance: 0.1 }
		],
		description: 'Яскравий шанс на великий виграш!',
		color: '#2ecc40'
	},
	{
		id: 'ruby',
		name: 'Рубіновий кейс',
		cost: 350,
		rewards: [
			{ value: 200, chance: 0.2 },
			{ value: 400, chance: 0.3 },
			{ value: 700, chance: 0.3 },
			{ value: 1200, chance: 0.2 }
		],
		description: 'Гаряча пропозиція для ризикових!',
		color: '#e74c3c'
	},
	{
		id: 'sapphire',
		name: 'Сапфіровий кейс',
		cost: 700,
		rewards: [
			{ value: 400, chance: 0.2 },
			{ value: 800, chance: 0.3 },
			{ value: 1500, chance: 0.3 },
			{ value: 2500, chance: 0.2 }
		],
		description: 'Синя удача для справжніх гравців!',
		color: '#2980b9'
	},
	{
		id: 'diamond',
		name: 'Діамантовий кейс',
		cost: 2000,
		rewards: [
			{ value: 1000, chance: 0.2 },
			{ value: 2000, chance: 0.3 },
			{ value: 4000, chance: 0.3 },
			{ value: 8000, chance: 0.2 }
		],
		description: 'Тільки для справжніх VIP!',
		color: '#00fff7'
	}
];

const wheelRewards = [
	{ label: '+20% шанс на подвійний кейс', type: 'doubleCaseChance', value: 0.2, color: '#00b894' },
	{ label: '+2500 кредитів', type: 'credits', value: 2500, color: '#fdcb6e' },
	{ label: '+1000 кредитів', type: 'credits', value: 1000, color: '#0984e3' },
	{ label: '+3 до кліків', type: 'clickValue', value: 3, color: '#e17055' },
	{ label: '+10% шанс на комбо', type: 'comboChance', value: 0.1, color: '#6c5ce7' },
	{ label: '+20 пасивний дохід', type: 'passiveIncome', value: 20, color: '#00cec9' },
	{ label: 'Нічого', type: 'none', value: 0, color: '#636e72' }
];

function getRandomReward(rewards) {
	const rand = Math.random();
	let sum = 0;
	for (let i = 0; i < rewards.length; i++) {
		sum += rewards[i].chance;
		if (rand <= sum) return rewards[i].value;
	}
	return rewards[0].value;
}

const BonusPanel = ({
	credits,
	duiktCoins,
	openCase,
	buyUpgrade,
	activateBooster,
	comboChance,
	doubleCaseChance
}) => {
	const [message, setMessage] = useState('');
	const [isOpeningCase, setIsOpeningCase] = useState(false);
	const [wheelSpinning, setWheelSpinning] = useState(false);
	const [wheelRotation, setWheelRotation] = useState(0);
	const [wheelResult, setWheelResult] = useState(null);

	const caseAudioRef = useRef(null);
	const wheelAudioRef = useRef(null);

	const handleOpenCase = (caseId) => {
		const selected = casesData.find((c) => c.id === caseId);
		if (!selected) return;
		const currency = selected.currency || 'credits';
		const enoughFunds = currency === 'duikt' ? duiktCoins >= selected.cost : credits >= selected.cost;
		if (!enoughFunds || isOpeningCase) {
			setMessage(isOpeningCase ? 'Зачекайте, кейс вже відкривається...' : `Недостатньо ${currency === 'duikt' ? 'Duikt Coin' : 'кредитів'} для ${selected.name}`);
			return;
		}

		setIsOpeningCase(true);
		setMessage(`Відкриваємо ${selected.name}...`);
		const reward = getRandomReward(selected.rewards);
		const isDouble = Math.random() < Math.min(doubleCaseChance, 1);
		const finalReward = currency === 'credits' && isDouble ? reward * 2 : reward;

		openCase(selected.cost, finalReward, currency);

		setTimeout(() => {
			caseAudioRef.current?.play();
			setTimeout(() => {
				caseAudioRef.current?.pause();
				caseAudioRef.current.currentTime = 0;
				setIsOpeningCase(false);
				setMessage(`Ви виграли ${finalReward} ${currency === 'duikt' ? 'Duikt Coin' : 'кредитів'}!`);
			}, 1500);
		}, 1000);
	};

	const handleSpinWheel = () => {
		if (wheelSpinning || credits < 500) {
			setMessage(wheelSpinning ? 'Колесо вже крутиться...' : 'Недостатньо кредитів для колеса фортуни. Потрібно 500.');
			return;
		}

		setWheelSpinning(true);
		setMessage('Крутимо колесо удачі...');
		openCase(500, 0);

		const segment = Math.floor(Math.random() * wheelRewards.length);
		const targetRotation = -(360 * 5 + segment * (360 / wheelRewards.length));
		const duration = 3500 + Math.random() * 1500;
		const start = Date.now();
		wheelAudioRef.current?.play();

		const animate = () => {
			const elapsed = Date.now() - start;
			let current = (elapsed / duration) * targetRotation;

			if (elapsed >= duration) {
				setWheelSpinning(false);
				setWheelRotation(targetRotation);
				wheelAudioRef.current?.pause();
				wheelAudioRef.current.currentTime = 0;

				const reward = wheelRewards[segment];
				setWheelResult(reward);

				if ((reward.type === 'comboChance' && comboChance >= 1) ||
						(reward.type === 'doubleCaseChance' && doubleCaseChance >= 1)) {
					setMessage('Цей бонус вже на максимумі!');
				} else {
					switch (reward.type) {
						case 'credits': openCase(0, reward.value); break;
						case 'clickValue':
						case 'comboChance':
						case 'passiveIncome':
						case 'doubleCaseChance':
							buyUpgrade(reward.type, 0, reward.value);
							break;
					}
					setMessage(`Ви виграли: ${reward.label}!`);
				}

				setTimeout(() => setWheelResult(null), 3000);
			} else {
				setWheelRotation(current);
				requestAnimationFrame(animate);
			}
		};

		requestAnimationFrame(animate);
	};

	return (
		<motion.div className={styles.bonusContainer} initial={{ opacity: 0.8, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
			<audio ref={caseAudioRef} src={caseSound} />
			<audio ref={wheelAudioRef} src={wheelSound} />

			<h2>Кейси</h2>
			<div className={styles.casesGrid}>
				{casesData.map((c) => (
					<button
						key={c.id}
						className={styles.caseButton}
						style={{ backgroundColor: c.color }}
						onClick={() => handleOpenCase(c.id)}
						disabled={isOpeningCase}
					>
						<div className={styles.caseButtonIcon}>
							{c.id === 'emerald' && '💚'}
							{c.id === 'ruby' && '❤️'}
							{c.id === 'sapphire' && '💙'}
							{c.id === 'amethyst' && '💜'}
							{c.id === 'diamond' && '💎'}
						</div>
						<div style={{ fontSize: 18, fontWeight: 700 }}>{c.name}</div>
						<div style={{ fontSize: 15, margin: '4px 0' }}>
							Ціна: {c.currency === 'duikt' ? `${c.cost} Duikt` : `${c.cost} кредитів`}
						</div>
						<div style={{ fontSize: 13 }}>{c.description}</div>
					</button>
				))}
			</div>

			<h2>Колесо удачі</h2>
			<div className={styles.wheelContainer}>
				<div className={styles.wheelPointer}></div>
				<div className={styles.wheel} style={{ transform: `rotate(${wheelRotation}deg)`, transition: wheelSpinning ? 'transform 3s cubic-bezier(0.17, 0.67, 0.83, 0.67)' : 'none' }}>
					{wheelRewards.map((r, i) => (
						<div
							key={i}
							className={styles.wheelSegment}
							style={{
								transform: `rotate(${(360 / wheelRewards.length) * i}deg)`,
								backgroundColor: r.color,
							}}
						></div>
					))}
				</div>
			</div>

			<button className={styles.spinButton} onClick={handleSpinWheel} disabled={wheelSpinning || credits < 500}>
				Крутити колесо (500 кредитів)
			</button>

			{message && <div className={styles.message}>{message}</div>}
		</motion.div>
	);
};

export default BonusPanel;
