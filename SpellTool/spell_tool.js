// Spell Tool

const DEFAULT_ABSORPTION	= 20;
const DEFAULT_FLATDEFENSE	= 120;
const DEFAULT_SPELLBUFF		= 150;

const SPELLTYPE_NONE		= -1
const SPELLTYPE_SORCERY		= 0;
const SPELLTYPE_MIRACLE		= 1;
const SPELLTYPE_PYROMANCY	= 2;

const SPELL_TYPES = [
	SPELLTYPE_SORCERY,
	SPELLTYPE_MIRACLE,
	SPELLTYPE_PYROMANCY
];

const DAMAGE_NONE			= -1;
const DAMAGE_PHYSICAL		= 0;
const DAMAGE_MAGIC			= 1;
const DAMAGE_FIRE			= 2;
const DAMAGE_LIGHTNING		= 3;
const DAMAGE_DARK			= 4;

const DAMAGE_TYPES = [
	DAMAGE_PHYSICAL,
	DAMAGE_MAGIC,
	DAMAGE_FIRE,
	DAMAGE_LIGHTNING,
	DAMAGE_DARK
];

const MULTI_MODIFIER_REDTEAR		= 0;
const MULTI_MODIFIER_MORION			= 1;
const MULTI_MODIFIER_SCHOLAR		= 2;
const MUTLI_MODIFIER_YOUNGDRAGON	= 3;
const MULTI_MODIFIER_BELLOWING		= 4;
const MULTI_MODIFIER_MAGICCLUTCH	= 5;
const MULTI_MODIFIER_MORNES			= 6;
const MULTI_MODIFIER_FIRSTBORN		= 7;
const MUTLI_MODIFIER_LITCLUTCH		= 8;
const MUTLI_MODIFIER_SWAMP			= 9;
const MULTI_MODIFIER_WITCH			= 10;
const MULTI_MODIFIER_FIRECLUTCH		= 11;
const MULTI_MODIFIER_DARKCLUTCH		= 12;
const MULTI_MODIFIER_LLOYDSWORD		= 13;
const MULTI_MODIFIER_RIGHTEYE		= 14;
const MULTI_MODIFIER_STEADYCHANT	= 15;
const MULTI_MODIFIER_CRYSTALCHANT	= 16;
const MULTI_MODIFIER_MURKYCHANT		= 17;
const MULTI_MODIIFER_DUSKCROWN		= 18;
const MULTI_MODIFIER_BLINDFOLD		= 19;
const MULTI_MODIFIER_WARBANNER		= 20;
const MULTI_MODIFIER_ROSE			= 21;
const MULTI_MODIFIER_OLDWOLF		= 22;
const MULTI_MODIFIER_DEEPPROT		= 23;
const MULTI_MODIFIER_OATH			= 24;
const MULTI_MODIFIER_POWERWITHIN	= 25;

const SORT_DAMAGEFP			= 0;
const SORT_ARFP				= 1;
const SORT_NETDAMAGE		= 2;
const SORT_ATTACKRATING		= 3;

class spellEntry
{
	constructor(aType, aName, aAR, aDamageType, aFP, aCARFP, aHitCount, aNotes1, aNotes2, aInt = 0, aFai = 0)
	{
		this.type			= aType;
		this.name			= aName;
		this.attackRating	= aAR;
		this.cost			= aFP;
		this.hitCount		= aHitCount;
		this.damageType		= aDamageType;
		this.intelligence	= aInt;
		this.faith			= aFai;
		this.netDamage		= 0;
		this.damageFP		= 0;
		this.arFP			= 0;
		this.netAR			= 0;
	}
}

class multiModifier {
	constructor(aName, aValue, aValuePvP, aSpellType = SPELLTYPE_NONE, aDamageType = DAMAGE_NONE, aIsRing = false, aIsWeaponSkill = false, aIsWeaponPassive = false, aIsHelm = false, aIsBodyBuff = false)
	{
		this.name				= aName;
		this.value				= aValue;
		this.valuePvP			= aValuePvP;
		this.spellType			= aSpellType;
		this.damageType			= aDamageType;
		this.isRing				= aIsRing;
		this.isWeaponSkill		= aIsWeaponSkill;
		this.isWeaponPassive	= aIsWeaponPassive;
		this.isHelm				= aIsHelm;
		this.isBodyBuff			= aIsBodyBuff;
		this.isEnabled			= false;
	}

	isEligible(aSpellType, aDamageType)
	{
		if (this.spellType != SPELLTYPE_NONE && aSpellType != this.spellType)
			return false;

		if (this.damageType != DAMAGE_NONE && aDamageType != this.damageType)
			return false;

		return true;
	}

	getValue(aIsPvP = false)
	{
		if (aIsPvP)
			return this.valuePvP;
		else
			return this.value;
	}
}

class helmSelectionControl {
	onChange()
	{
		this.toolInstance.config.selectedHelm = parseInt(this.controlElement.value);
		this.toolInstance.refresh();
	}

	constructor(aToolInstance)
	{
		this.toolInstance = aToolInstance;
		this.controlElement = document.getElementById('controlHelmSelector');
		this.controlElement.addEventListener('change', this.onChange.bind(this));
		this.updateList();
	}

	updateList()
	{
		var output = "";
		var hasSelection = false;
		var selectedIndex = -1;

		for (var i=0; i < this.toolInstance.config.modifiers.length; i++)
		{
			let modifier = this.toolInstance.config.modifiers[i];
			if (modifier.isHelm)
			{
				let isSelected = toolInstance.config.selectedHelm == i;
				let selectSuffix = "";
				if (isSelected)
				{
					hasSelection = true;
					selectSuffix = " selected";
				}
				
				output += "<option value=\"" + i + "\"" + selectSuffix + ">" + modifier.name + "</option>";
			}
		}

		output = "<option value=\"-1\"" + (!hasSelection ? "" : " selected") + ">(No Helm)</option>" + output;
		this.controlElement.innerHTML = output;
	}
}

class bodyBuffSelectionControl {
	onChange()
	{
		this.toolInstance.config.modifiers[this.index].isEnabled = this.controlElement.checked;
		this.toolInstance.refresh();
	}

	constructor(aToolInstance, aIndex)
	{
		this.toolInstance = aToolInstance;
		this.index = aIndex; // Modifier Index
		this.controlElement = document.getElementById('controlBodyBuffToggle' + this.index);
		this.controlElement.addEventListener('change', this.onChange.bind(this));
	}
}

class ringSelectionControl {
	onChange()
	{
		this.toolInstance.config.selectedRings[this.index] = parseInt(this.controlElement.value);
		this.toolInstance.refresh();
	}
	constructor(aToolInstance, aIndex)
	{
		this.toolInstance = aToolInstance;
		this.index = aIndex;
		this.controlElement = document.getElementById('controlRingSelector' + this.index);
		this.controlElement.addEventListener('change', this.onChange.bind(this));
	}

	updateList()
	{
		var output = "";
		var hasSelection = false;
		var selectedIndex = -1;

		for (var i=0; i < this.toolInstance.config.modifiers.length; i++)
		{
			let modifier = this.toolInstance.config.modifiers[i];
			if (modifier.isRing)
			{
				let isSelected = toolInstance.config.selectedRings[this.index] == i;
				if (isSelected)
					hasSelection = true;

				let modSelectIndex = toolInstance.config.selectedRings.indexOf(i);

				if (isSelected || modSelectIndex < 0)
				{
					let selectSuffix = "";
					if (isSelected)
						selectSuffix = " selected";

					output += "<option value=\"" + i + "\"" + selectSuffix + ">" + modifier.name + "</option>";
				}
			}
		}

		output = "<option value=\"-1\"" + (!hasSelection ? "" : " selected") + ">(No Ring)</option>" + output;

		this.controlElement.innerHTML = output;
	}
}

class spellTypeToggle {
	onChange()
	{
		this.toolInstance.config.showSpellTypes[this.type] = this.controlElement.checked;
		this.toolInstance.refresh();
	}

	constructor(aSpellType, aToolInstance)
	{
		this.type = aSpellType;
		this.toolInstance = aToolInstance;
		this.controlElement = document.getElementById('controlShowSpellType' + this.type);
		this.controlElement.addEventListener("change", this.onChange.bind(this));
	}
}

class damageTypeToggle {
	onChange()
	{
		this.toolInstance.config.showDamageTypes[this.type] = this.controlElement.checked;
		this.toolInstance.refresh();
	}

	constructor(aDamageType, aToolInstance)
	{
		this.type = aDamageType;
		this.toolInstance = aToolInstance;
		this.controlElement = document.getElementById('controlShowDamageType' + this.type);

		this.controlElement.addEventListener("change", this.onChange.bind(this));
	}
}

class spellBuffControl {
	onChange()
	{
		if (this.isGlobal)
		{
			for (var i=0; i < this.toolInstance.config.spellBuff.length; i++)
				this.toolInstance.config.spellBuff[i] = this.controlElement.value;
		} else {
			this.toolInstance.config.spellBuff[this.spellType] = this.controlElement.value;
		}

		if (this.toolInstance.config.autoRefresh)
			this.toolInstance.refresh();
	}

	update()
	{
		if (!this.isGlobal)
			this.controlElement.value = this.toolInstance.config.spellBuff[this.spellType];
	}

	constructor(aSpellType, aToolInstance, aIsGlobal)
	{
		var suffix = aSpellType;
		if (aIsGlobal)
			suffix = "Global";

		this.controlElement = document.getElementById('controlSpellBuff' + suffix);
		this.isGlobal = aIsGlobal;
		this.spellType = aSpellType;
		this.toolInstance = aToolInstance;


		if (!this.isGlobal)
			this.controlElement.value = this.toolInstance.config.spellBuff[this.spellType];
		else
			this.controlElement.value = DEFAULT_SPELLBUFF;

		this.controlElement.addEventListener("change", this.onChange.bind(this));
	}
}

class absorptionControl {
	onChange()
	{
		if (this.isGlobal)
		{
			for (var i = 0; i < this.toolInstance.config.absorption.length; i++)
			{
				this.toolInstance.config.absorption[i] = this.controlElement.value;
			}
		} else {
			this.toolInstance.config.absorption[this.damageType] = this.controlElement.value;
		}

		if (this.toolInstance.config.autoRefresh)
			this.toolInstance.refresh();
	}

	update()
	{
		if (!this.isGlobal)
			this.controlElement.value = this.toolInstance.config.absorption[this.damageType];
	}

	constructor(aDamageType, aToolInstance, aIsGlobal = false)
	{
		var suffix = aDamageType;
		if (aIsGlobal)
			suffix = "Global";

		this.controlElement = document.getElementById('controlAbsorption' + suffix);
		this.damageType = aDamageType;
		this.toolInstance = aToolInstance;
		this.isGlobal = aIsGlobal;

		if (!this.isGlobal)
			this.controlElement.value = this.toolInstance.config.absorption[this.damageType];
		else
			this.controlElement.value = DEFAULT_ABSORPTION;

		this.controlElement.addEventListener("change", this.onChange.bind(this));
	}
}

class flatDefenseControl {
	onChange()
	{
		if (this.isGlobal)
		{
			for (var i=0; i < this.toolInstance.config.flatDefense.length; i++)
				this.toolInstance.config.flatDefense[i] = this.controlElement.value;
		} else {
			this.toolInstance.config.flatDefense[this.damageType] = this.controlElement.value;
		}

		if (this.toolInstance.config.autoRefresh)
			this.toolInstance.refresh();
	}

	update()
	{
		if (!this.isGlobal)
			this.controlElement.value = this.toolInstance.config.flatDefense[this.damageType];
	}

	constructor(aDamageType, aToolInstance, aIsGlobal = false)
	{
		var suffix = aDamageType;
		if (aIsGlobal)
			suffix = "Global";

		this.controlElement = document.getElementById('controlFlatDefense' + suffix);
		this.damageType = aDamageType;
		this.toolInstance = aToolInstance;
		this.isGlobal = aIsGlobal;


		if (!this.isGlobal)
			this.controlElement.value = this.toolInstance.config.flatDefense[this.damageType];
		else
			this.controlElement.value = DEFAULT_FLATDEFENSE;

		this.controlElement.addEventListener("change", this.onChange.bind(this));
	}
}

const HIT_RANGE_ALL	= 0;
const HIT_RANGE_FAR = 1;
const HIT_RANGE_CLOSE = 2;

class spellTool {
	constructor()
	{
		this.config = {
			showSpellTypes		: [],
			showDamageTypes		: [],
			spellBuff			: [],
			flatDefense			: [],
			absorption			: [],
			intMax				: 99,
			faiMax				: 99,
			globalSpellBuff		: false,
			globalDefense		: false,
			isPvP				: true,
			duskCrown			: false,
			modifiers			: [],
			spellType			: SPELLTYPE_NONE,
			damageType			: DAMAGE_NONE,
			autoRefresh			: false,			// Can be disabled while updating fields to avoid refresh behavior on initialization / global controls
			sortBy				: SORT_DAMAGEFP,
			selectedRings		: [-1,-1,-1,-1],
			selectedHelm		: -1,
			hitRange			: HIT_RANGE_ALL,
			weaponBuffHitCount	: 5
		};

		this.spells				= [];
		this.controls			= [];
		this.sortList			= [];

		this.sortList[SORT_DAMAGEFP] = function(a, b)
		{
			return a.damageFP - b.damageFP;
		}

		this.sortList[SORT_ARFP] = function(a, b)
		{
			return a.arFP - b.arFP;
		}

		this.sortList[SORT_NETDAMAGE] = function(a, b)
		{
			return a.netDamage - b.netDamage;
		}

		this.sortList[SORT_ATTACKRATING] = function(a, b)
		{
			return a.totalAR - b.totalAR;
		}

		//								Type						Spell									First hit AR		Damage Type				FP		C-AR/FP			hits	Notes	More Notes, int, faith
		this.spells.push(new spellEntry(SPELLTYPE_SORCERY,			"White Dragon Breath",					265.8227848,		DAMAGE_MAGIC,			25,		10.63291139,	1,		"", "", 50, 0));
		this.spells.push(new spellEntry(SPELLTYPE_SORCERY,			"Soul Stream",							120.2531646,		DAMAGE_MAGIC,			55,		8.745684695,	4,		"", "Per Tick", 45, 0));
		this.spells.push(new spellEntry(SPELLTYPE_SORCERY,			"Soul Spear",							250.6329114,		DAMAGE_MAGIC,			32,		7.832278481,	1,		"", "", 32, 0));
		this.spells.push(new spellEntry(SPELLTYPE_SORCERY,			"Soul Greatsword",						200.4219409,		DAMAGE_MAGIC,			23,		8.713997432,	1,		"", "", 22, 0));
		this.spells.push(new spellEntry(SPELLTYPE_SORCERY,			"Soul Arrow",							127.0042194,		DAMAGE_MAGIC,			7,		18.14345992,	1,		"", "", 10, 0));
		this.spells.push(new spellEntry(SPELLTYPE_SORCERY,			"Old Moonlight (projectile)",			150,				DAMAGE_MAGIC,			1,		-1,				-1,		"",	"", 25, 0));
		this.spells.push(new spellEntry(SPELLTYPE_SORCERY,			"Old Moonlight (Charged, projectile)",	235.2941176,		DAMAGE_MAGIC,			1,		-1,				-1,		"",	"", 25, 0));
		this.spells.push(new spellEntry(SPELLTYPE_SORCERY,			"Old Moonlight (Charged)",				124.789916,			DAMAGE_MAGIC,			23,		15.65582755,	1,		"", "124.789 Melee + 235.294 Projectile", 25, 0));
		this.spells.push(new spellEntry(SPELLTYPE_SORCERY,			"Old Moonlight",						124.789916,			DAMAGE_MAGIC,			23,		11.94738765,	1,		"", "124.789 Melee + 150.00 Projectile", 25, 0));
		this.spells.push(new spellEntry(SPELLTYPE_SORCERY,			"Magic Weapon",							71.72995781,		DAMAGE_MAGIC,			25,		14.34599156,	5,		"", "Per Hit", 10, 0));
		this.spells.push(new spellEntry(SPELLTYPE_SORCERY,			"Homing Soulmass",						48.94514768,		DAMAGE_MAGIC,			20,		12.23628692,	5,		"", "Per Projectile", 20, 0));
		this.spells.push(new spellEntry(SPELLTYPE_SORCERY,			"Homing Crystal Soulmass",				64.97890295,		DAMAGE_MAGIC,			43,		7.55568639,		5,		"", "Per Projectile", 30, 0));
		this.spells.push(new spellEntry(SPELLTYPE_SORCERY,			"Heavy Soul Arrow",						215.1898734,		DAMAGE_MAGIC,			11,		19.56271577,	1,		"", "", 15, 0));
		this.spells.push(new spellEntry(SPELLTYPE_SORCERY,			"Great Soul Dregs",						254.2105263,		DAMAGE_DARK,			30,		8.473684211,	1,		"", "", 40, 0));
		this.spells.push(new spellEntry(SPELLTYPE_SORCERY,			"Great Soul Arrow",						149.7890295,		DAMAGE_MAGIC,			10,		14.97890295,	1,		"", "", 15, 0));
		this.spells.push(new spellEntry(SPELLTYPE_SORCERY,			"Great Magic Weapon",					85.65400844,		DAMAGE_MAGIC,			35,		12.23628692,	5,		"Per Hit", 15, 0));
		this.spells.push(new spellEntry(SPELLTYPE_SORCERY,			"Great Heavy Soul Arrow",				242.1940928,		DAMAGE_MAGIC,			14,		17.29957806,	1,		"", "", 18, 0));
		this.spells.push(new spellEntry(SPELLTYPE_SORCERY,			"Great Farron Dart",					59.07172996,		DAMAGE_MAGIC,			4,		14.76793249,	1,		"", "", 23, 0));
		this.spells.push(new spellEntry(SPELLTYPE_SORCERY,			"Great Deep Soul",						129.518,			DAMAGE_DARK,			9,		14.39088889,	1,		"", "", 20, 0));
		this.spells.push(new spellEntry(SPELLTYPE_SORCERY,			"Farron Hail",							48.94514768,		DAMAGE_MAGIC,			16,		12.23628692,	4,		"", "Per Wave?", 28, 0));
		this.spells.push(new spellEntry(SPELLTYPE_SORCERY,			"Farron Flashsword",					105.0632911,		DAMAGE_MAGIC,			4,		26.26582278,	1,		"", "", 23, 0));
		this.spells.push(new spellEntry(SPELLTYPE_SORCERY,			"Farron Dart",							51.89873418,		DAMAGE_MAGIC,			3,		17.29957806,	1,		"", "", 8, 0));
		this.spells.push(new spellEntry(SPELLTYPE_SORCERY,			"Deep Soul",							99.156,				DAMAGE_DARK,			6,		16.526,			1,		"", "", 12));
		this.spells.push(new spellEntry(SPELLTYPE_SORCERY,			"Dark Edge",							203.375,			DAMAGE_DARK,			26,		7.822115385,	1,		"", "", 30, 0));
		this.spells.push(new spellEntry(SPELLTYPE_SORCERY,			"Crystal Soul Spear",					305.907173,			DAMAGE_MAGIC,			46,		6.650155935,	1,		"", "", 48, 0));
		this.spells.push(new spellEntry(SPELLTYPE_SORCERY,			"Crystal Magic Weapon",					95.78059072,		DAMAGE_MAGIC,			45,		10.64228786,	5,		"", "Per Hit", 30, 0));
		this.spells.push(new spellEntry(SPELLTYPE_SORCERY,			"Crystal Hail",							62.02531646,		DAMAGE_MAGIC,			19,		9.793471019,	3,		"", "Per Projectile", 18, 0));
		this.spells.push(new spellEntry(SPELLTYPE_SORCERY,			"Affinity",								59.493,				DAMAGE_DARK,			40,		7.436625,		5,		"", "Per Projectile", 32, 0));
		this.spells.push(new spellEntry(SPELLTYPE_PYROMANCY,		"Seathing Chaos (ground explosion)",	392.3529412,		DAMAGE_FIRE,			28,		14.01260504,	1,		"", "", 18, 18));
		this.spells.push(new spellEntry(SPELLTYPE_PYROMANCY,		"Seathing Chaos (direct hit)",			201.1764706,		DAMAGE_FIRE,			28,		7.18487395,		1,		"", "", 18, 18));
		this.spells.push(new spellEntry(SPELLTYPE_PYROMANCY,		"Sacred Flame (grab)",					46.082,				DAMAGE_FIRE,			25,		20.23932,		1,		"", "46.082 (grab) + 11.52x9 (burn) + 356.221 (boom)", 8, 8));
		this.spells.push(new spellEntry(SPELLTYPE_PYROMANCY,		"Sacred Flame (burst)",					356.221,			DAMAGE_FIRE,			1,		-1,				-1,		"", "", 8, 8));
		this.spells.push(new spellEntry(SPELLTYPE_PYROMANCY,		"Sacred Flame (burn)",					11.52,				DAMAGE_FIRE,			9,		-1,				-1,		"Per Tick", 8, 8));
		this.spells.push(new spellEntry(SPELLTYPE_PYROMANCY,		"Profaned Flame",						258.525,			DAMAGE_FIRE,			30,		8.6175,			1,		"", "", 25, 0));
		this.spells.push(new spellEntry(SPELLTYPE_PYROMANCY,		"Great Combustion",						194.009,			DAMAGE_FIRE,			17,		11.41229412,	1,		"", "", 10, 10));
		this.spells.push(new spellEntry(SPELLTYPE_PYROMANCY,		"Great Chaos Fire Orb (lava)",			148.387,			DAMAGE_FIRE,			1,		-1,				-1,		"", "Lava tick", 0, 0));
		this.spells.push(new spellEntry(SPELLTYPE_PYROMANCY,		"Great Chaos Fire Orb",					291.705,			DAMAGE_FIRE,			32,		13.752875,		1,		"", "291.705 (projectile) + 148.387 (lava)", 0, 0));
		this.spells.push(new spellEntry(SPELLTYPE_PYROMANCY,		"Floating Chaos",						85.29411765,		DAMAGE_FIRE,			20,		12.79411765,	3,		"", "", 16, 16));
		this.spells.push(new spellEntry(SPELLTYPE_PYROMANCY,		"Flame Fan",							154.7058824,		DAMAGE_FIRE,			7,		22.10084034,	1,		"", "", 15, 15));
		this.spells.push(new spellEntry(SPELLTYPE_PYROMANCY,		"Firestorm",							173.913,			DAMAGE_FIRE,			38,		4.576657895,	1,		"", "", 18, 0));
		this.spells.push(new spellEntry(SPELLTYPE_PYROMANCY,		"Fireball",								150.23,				DAMAGE_FIRE,			10,		15.023,			1,		"", "", 6, 6));
		this.spells.push(new spellEntry(SPELLTYPE_PYROMANCY,		"Fire Whip",							64.734,				DAMAGE_FIRE,			34,		17.13547059,	9,		"", "Per Tick", 13, 8));
		this.spells.push(new spellEntry(SPELLTYPE_PYROMANCY,		"Fire Surge",							66.359,				DAMAGE_FIRE,			4,		16.58975,		1,		"Per Tick", "Lists 2fp, but drains FP really quick per tick", 6, 0));
		this.spells.push(new spellEntry(SPELLTYPE_PYROMANCY,		"Fire Orb",								199.078,			DAMAGE_FIRE,			14,		14.21985714,	1,		"", "", 8, 8));
		this.spells.push(new spellEntry(SPELLTYPE_PYROMANCY,		"Combustion (weapon skill)",			164.516,			DAMAGE_FIRE,			12,		13.70966667,	1,		"", "", 0, 0));
		this.spells.push(new spellEntry(SPELLTYPE_PYROMANCY,		"Chaos Storm (lava)",					89.4,				DAMAGE_FIRE,			58,		1.54137931,		1,		"", "", 0, 0));
		this.spells.push(new spellEntry(SPELLTYPE_PYROMANCY,		"Chaos Storm",							194.009,			DAMAGE_FIRE,			58,		3.344982759,	1,		"", "", 0, 0));
		this.spells.push(new spellEntry(SPELLTYPE_PYROMANCY,		"Chaos Bed Vestiges (graze)",			192.216,			DAMAGE_FIRE,			35,		5.491885714,	1,		"", "Indirect Hit", 20, 10));
		this.spells.push(new spellEntry(SPELLTYPE_PYROMANCY,		"Chaos Bed Vestiges",					337.327,			DAMAGE_FIRE,			35,		9.637914286,	1,		"", "", 20, 10));
		this.spells.push(new spellEntry(SPELLTYPE_PYROMANCY,		"Carthus Flame Arc",					91.705,				DAMAGE_FIRE,			30,		15.28416667,	5,		"", "Per Hit", 10, 10));
		this.spells.push(new spellEntry(SPELLTYPE_PYROMANCY,		"Bursting Fireball",					70.506,				DAMAGE_FIRE,			14,		20.14457143,	4,		"", "", 18, 12));
		this.spells.push(new spellEntry(SPELLTYPE_PYROMANCY,		"Boulder Heave",						231.336,			DAMAGE_PHYSICAL,		17,		13.608,			1,		"", "Generic Phys - not strike/slash/thrust", 8, 12));
		this.spells.push(new spellEntry(SPELLTYPE_PYROMANCY,		"Black Serpent",						163.133,			DAMAGE_DARK,			19,		8.585947368,	1,		"", "", 15, 15));
		this.spells.push(new spellEntry(SPELLTYPE_PYROMANCY,		"Black Flame (far)",					237.327,			DAMAGE_DARK,			25,		9.49308,		1,		"", "", 15, 15));
		this.spells.push(new spellEntry(SPELLTYPE_PYROMANCY,		"Black Flame (close)",					217.971,			DAMAGE_DARK,			25,		8.71884,		1,		"", "", 15, 15));
		this.spells.push(new spellEntry(SPELLTYPE_PYROMANCY,		"Black Fire Orb",						237.327,			DAMAGE_DARK,			22,		10.78759091,	1,		"", "", 20, 20));
		this.spells.push(new spellEntry(SPELLTYPE_MIRACLE,	 		"Wrath of the Gods",					365.789,			DAMAGE_PHYSICAL,		40,		9.144725,		1,		"", "Generic Phys - not strike/slash/thrust", 0, 30));
		this.spells.push(new spellEntry(SPELLTYPE_MIRACLE,	 		"Way of White Corona",					82.18623482,		DAMAGE_PHYSICAL,		15,		5.479082321,	1,		"", "~Same AR on the return hit. (generic phys)",  0, 18));
		this.spells.push(new spellEntry(SPELLTYPE_MIRACLE,	 		"Sunlight Spear (melee)",				189.954,			DAMAGE_LIGHTNING,		-1,		-1,				1,		"", "Melee portion", 0, 40));
		this.spells.push(new spellEntry(SPELLTYPE_MIRACLE,	 		"Sunlight Spear",						259.817,			DAMAGE_LIGHTNING,		48,		9.370229167,	1,		"", "Projectile	259.817 (projectile) + 189.954 (melee)", 0, 40));
		this.spells.push(new spellEntry(SPELLTYPE_MIRACLE,	 		"Lightning Storm",						129.68,				DAMAGE_LIGHTNING,		45,		8.645333333,	3,		"", "Aoe Portion", 0, 45));
		this.spells.push(new spellEntry(SPELLTYPE_MIRACLE,	 		"Lightning Stake (hit 3)",				60.73,				DAMAGE_LIGHTNING,		-1,		-1,				1,		"", "", 0, 35));
		this.spells.push(new spellEntry(SPELLTYPE_MIRACLE,	 		"Lightning Stake (hit 2)",				144.292,			DAMAGE_LIGHTNING,		-1,		-1,				1,		"", "", 0, 35));
		this.spells.push(new spellEntry(SPELLTYPE_MIRACLE,	 		"Lightning Stake",						196.803,			DAMAGE_LIGHTNING,		34,		11.81838235,	1,		"", "196.803 + 144.292 + 60.73", 0, 35));
		this.spells.push(new spellEntry(SPELLTYPE_MIRACLE,	 		"Lightning Spear (melee)",				115.068,			DAMAGE_LIGHTNING,		34,		-1,				-1,		"", "Melee portion", 0, 20));
		this.spells.push(new spellEntry(SPELLTYPE_MIRACLE,	 		"Lightning Spear",						144.292,			DAMAGE_LIGHTNING,		23,		11.27652174,	1,		"", "Projectile	144.292 (projectile) + 115.086 (melee)", 0, 20));
		this.spells.push(new spellEntry(SPELLTYPE_MIRACLE,	 		"Lightning Blade",						94.52,				DAMAGE_LIGHTNING,		50,		9.452,			5,		"", "Per Hit", 0, 30));
		this.spells.push(new spellEntry(SPELLTYPE_MIRACLE,	 		"Lightning Arrow",						181.7813765,		DAMAGE_LIGHTNING,		19,		9.567440869,	1,		"", "", 0, 35));
		this.spells.push(new spellEntry(SPELLTYPE_MIRACLE,	 		"Lifehunt Scythe",						188.127,			DAMAGE_DARK,			20,		9.40635,		1,		"", "", 0, 22));
		this.spells.push(new spellEntry(SPELLTYPE_MIRACLE,	 		"Great Lightning Spear (melee)",		145.394,			DAMAGE_LIGHTNING,		-1,		-1,				1,		"", "Melee portion", 0, 30));
		this.spells.push(new spellEntry(SPELLTYPE_MIRACLE,	 		"Great Lightning Spear",				185.526,			DAMAGE_LIGHTNING,		32,		10.34125,		1,		"", "Projectile	185.526 (projectile) + 145.394 (melee)", 0, 30));
		this.spells.push(new spellEntry(SPELLTYPE_MIRACLE,	 		"Gnaw",									89.497,				DAMAGE_DARK,			15,		5.966466667,	1,		"", "", 0, 18));
		this.spells.push(new spellEntry(SPELLTYPE_MIRACLE,	 		"Emit Force",							136.842,			DAMAGE_PHYSICAL,		20,		6.8421,			1,		"Generic Phys - not strike/slash/thrust", 0, 18));
		this.spells.push(new spellEntry(SPELLTYPE_MIRACLE,	 		"Dohrys' Gnawing",						119.634,			DAMAGE_DARK,			20,		5.9817,			1,		"", "", 0, 25));
		this.spells.push(new spellEntry(SPELLTYPE_MIRACLE,	 		"Divine Pillars of Light",				183.561,			DAMAGE_PHYSICAL,		72,		2.549458333,	1,		"Per Tick", "Generic Phys - not strike/slash/thrust", 0, 30));
		this.spells.push(new spellEntry(SPELLTYPE_MIRACLE,	 		"Dead Again",							321.461,			DAMAGE_DARK,			45,		7.143577778,	1,		"", "", 15, 23));
		this.spells.push(new spellEntry(SPELLTYPE_MIRACLE,	 		"Darkmoon Blade",						94.331,				DAMAGE_MAGIC,			50,		9.4331,			5,		"", "Per Hit", 0, 30));
		this.spells.push(new spellEntry(SPELLTYPE_MIRACLE,	 		"Dark Blade",							84.018,				DAMAGE_DARK,			35,		12.00257143,	5,		"", "Per Hit", 0, 25));

		// Modifier ID										Name													Value		Value in PvP		spellType				damageType			isRing,		isWSkill	isWPassive	isHelm		isBodyBuff
		this.config.modifiers[MULTI_MODIFIER_REDTEAR]		 = new multiModifier("Red Tearstone Ring",				1.2,		1.2,				SPELLTYPE_NONE,			DAMAGE_NONE,		true,		false,		false,		false,		false);
		this.config.modifiers[MULTI_MODIFIER_MORION]		 = new multiModifier("Morion Blade",					1.2,		1.2,				SPELLTYPE_NONE,			DAMAGE_NONE,		false,		false,		false,		false,		false);
		this.config.modifiers[MULTI_MODIFIER_SCHOLAR]		 = new multiModifier("Scholar Candlestick",				1.125,		1.125,				SPELLTYPE_SORCERY,		DAMAGE_NONE,		false,		false,		false,		false,		false);
		this.config.modifiers[MUTLI_MODIFIER_YOUNGDRAGON]	 = new multiModifier("Young Dragon Ring",				1.12,		1.12,				SPELLTYPE_SORCERY,		DAMAGE_NONE,		true,		false,		false,		false,		false);
		this.config.modifiers[MULTI_MODIFIER_BELLOWING]		 = new multiModifier("Bellowing Dragoncrest Ring",		1.2,		1.2,				SPELLTYPE_SORCERY,		DAMAGE_NONE,		true,		false,		false,		false,		false);
		this.config.modifiers[MULTI_MODIFIER_MAGICCLUTCH]	 = new multiModifier("Magic Clutch Ring",				1.15,		1.075,				SPELLTYPE_NONE,			DAMAGE_MAGIC,		true,		false,		false,		false,		false);
		this.config.modifiers[MULTI_MODIFIER_MORNES]		 = new multiModifier("Morne's Ring",					1.12,		1.12,				SPELLTYPE_MIRACLE,		DAMAGE_NONE,		true,		false,		false,		false,		false);
		this.config.modifiers[MULTI_MODIFIER_FIRSTBORN]		 = new multiModifier("Ring of the Sun's First Born",	1.2,		1,2,				SPELLTYPE_MIRACLE,		DAMAGE_NONE,		true,		false,		false,		false,		false);
		this.config.modifiers[MUTLI_MODIFIER_LITCLUTCH]		 = new multiModifier("Lightning Clutch",				1.15,		1.075,				SPELLTYPE_MIRACLE,		DAMAGE_LIGHTNING,	true,		false,		false,		false,		false);
		this.config.modifiers[MUTLI_MODIFIER_SWAMP]			 = new multiModifier("Great Swamp Ring",				1.12,		1.12,				SPELLTYPE_PYROMANCY,	DAMAGE_NONE,		true,		false,		false,		false,		false);
		this.config.modifiers[MULTI_MODIFIER_WITCH]			 = new multiModifier("Witch's Ring",					1.25,		1.25,				SPELLTYPE_PYROMANCY,	DAMAGE_NONE,		true,		false,		false,		false,		false);
		this.config.modifiers[MULTI_MODIFIER_FIRECLUTCH]	 = new multiModifier("Fire Clutch Ring",				1.15,		1.075,				SPELLTYPE_NONE,			DAMAGE_FIRE,		true,		false,		false,		false,		false);
		this.config.modifiers[MULTI_MODIFIER_DARKCLUTCH]	 = new multiModifier("Dark Clutch Ring",				1.15,		1.075,				SPELLTYPE_NONE,			DAMAGE_DARK,		true,		false,		false,		false,		false);
		this.config.modifiers[MULTI_MODIFIER_LLOYDSWORD]	 = new multiModifier("Lloyd's Sword Ring",				1.1,		1.1,				SPELLTYPE_NONE,			DAMAGE_NONE,		true,		false,		false,		false,		false);
		this.config.modifiers[MULTI_MODIFIER_RIGHTEYE]		 = new multiModifier("Pontiff's Right Eye",				1.15,		1.06,				SPELLTYPE_NONE,			DAMAGE_NONE,		true,		false,		false,		false,		false);
		this.config.modifiers[MULTI_MODIFIER_STEADYCHANT]	 = new multiModifier("Steady Chant",					1.125,		1.125,				SPELLTYPE_SORCERY,		DAMAGE_NONE,		false,		false,		false,		false,		false);
		this.config.modifiers[MULTI_MODIFIER_CRYSTALCHANT]	 = new multiModifier("Crystal Chant",					1.4,		1.4,				SPELLTYPE_SORCERY,		DAMAGE_NONE,		false,		false,		false,		false,		false);
		this.config.modifiers[MULTI_MODIFIER_MURKYCHANT]	 = new multiModifier("Chant from the Depths",			1.125,		1.125,				SPELLTYPE_SORCERY,		DAMAGE_NONE,		false,		false,		false,		false,		false);
		this.config.modifiers[MULTI_MODIIFER_DUSKCROWN]		 = new multiModifier("Crown of Dusk",					1.1,		1.1,				SPELLTYPE_NONE,			DAMAGE_NONE,		false,		false,		false,		true,		false);
		this.config.modifiers[MULTI_MODIFIER_BLINDFOLD]		 = new multiModifier("Blindfold Mask",					1.1,		1.1,				SPELLTYPE_NONE,			DAMAGE_DARK,		false,		false,		false,		true,		false);
		this.config.modifiers[MULTI_MODIFIER_WARBANNER]		 = new multiModifier("Lothric War Banner",				1.15,		1.15,				SPELLTYPE_NONE,			DAMAGE_NONE,		false,		false,		false,		false,		false);
		this.config.modifiers[MULTI_MODIFIER_ROSE]			 = new multiModifier("Awakening",						1.25,		1.25,				SPELLTYPE_MIRACLE,		DAMAGE_NONE,		false,		false,		false,		false,		true);
		this.config.modifiers[MULTI_MODIFIER_OLDWOLF]		 = new multiModifier("Old Wolf Curved Sword",			1.15,		1.06,				SPELLTYPE_NONE,			DAMAGE_NONE,		false,		false,		false,		false,		true);
		this.config.modifiers[MULTI_MODIFIER_DEEPPROT]		 = new multiModifier("Deep Protection",					1.05,		1.05,				SPELLTYPE_NONE,			DAMAGE_NONE,		false,		false,		false,		false,		true);
		this.config.modifiers[MULTI_MODIFIER_OATH]			 = new multiModifier("Sacred Oath",						1.1,		1.1,				SPELLTYPE_NONE,			DAMAGE_NONE,		false,		false,		false,		false,		true);
		this.config.modifiers[MULTI_MODIFIER_POWERWITHIN]	 = new multiModifier("Power Within",					1.2,		1.2,				SPELLTYPE_NONE,			DAMAGE_NONE,		false,		false,		false,		false,		true);

		var i=0;

		for (i=0; i < SPELL_TYPES.length; i++)
		{
			this.config.spellBuff[SPELL_TYPES[i]] = DEFAULT_SPELLBUFF;
		}

		for (i=0; i < DAMAGE_TYPES.length; i++)
		{
			this.config.flatDefense[DAMAGE_TYPES[i]] = DEFAULT_FLATDEFENSE;
			this.config.absorption[DAMAGE_TYPES[i]] = DEFAULT_ABSORPTION;
			this.config.showDamageTypes[DAMAGE_TYPES[i]] = true;
			this.config.showSpellTypes[SPELL_TYPES[i]] = true;
		}

		this.ringSelectors = [];
	}


	getSpellBuff(aSpellType)
	{
		return this.config.spellBuff[aSpellType];
	}

	getESB(aSpellType, aDamageType)
	{
		var spellBuff = this.getSpellBuff(aSpellType);
		
		// Calculate multipliers
		var modifier;

		for (var i=0; i < this.config.modifiers.length; i++)
		{
			modifier = this.config.modifiers[i];

			if (modifier.isEnabled && modifier.isEligible(aSpellType, aDamageType))
			{
				spellBuff *= modifier.getValue(this.config.isPvP);
			}
		}

		return spellBuff;
	}

	getFlatDef(damageType)
	{
		return this.config.flatDefense[damageType];
	}

	getAbsorption(damageType)
	{
		return this.config.absorption[damageType];
	}

	updateRingModifiers()
	{
		for (var i=0; i < this.config.modifiers.length; i++)
		{
			let modifier = this.config.modifiers[i];
			if (modifier.isRing && !modifier.isBodyBuff)
			{
				let modSelectIndex = toolInstance.config.selectedRings.indexOf(i);
				modifier.isEnabled = (modSelectIndex >= 0);
			}
		}
	}

	updateHelmModifiers()
	{
		for (var i=0; i < this.config.modifiers.length; i++)
		{
			let modifier = this.config.modifiers[i];
			if (modifier.isHelm)
			{
				modifier.isEnabled = this.config.selectedHelm == i;
			}
		}
	}

	updateSelectedRings()
	{
		for (var i=0; i <= 3; i++)
		{
			this.ringSelectors[i].updateList();
		}
	}

	isValidDisplaySpell(aSpellEntry)
	{
		if (this.config.showDamageTypes[aSpellEntry.damageType] && this.config.showSpellTypes[aSpellEntry.type])
		{
			return true;
		}

		return false;
	}

	refresh()
	{
		var output = "";
		var spell;
		var damage;
		var netDamage;
		var totalAR;
		var i=0;

		this.updateSelectedRings();
		this.updateRingModifiers();
		this.updateHelmModifiers();
		this.config.isPvP = this.pvpCheckbox.checked;

		for (i=0; i < this.spells.length; i++)
		{
			spell = this.spells[i];
			spell.netDamage = 0;
			spell.damageFP = 0;
			spell.arFP = 0;
			spell.netAR = 0;
			if (spell.cost >= 1 && spell.hitCount >= 1 && this.isValidDisplaySpell(spell))
			{
				damage = this.getSpellNetDamage(spell);
				netDamage = (damage * spell.hitCount);
				spell.netDamage = netDamage;
				spell.damageFP = netDamage / spell.cost;
				
				spell.totalAR = (spell.netAR * spell.hitCount);
				spell.arFP = spell.totalAR / spell.cost;
			}
		}

		// sort here

		this.spells.sort(this.sortList[this.config.sortBy]);
		this.spells.reverse();

		for (i=0; i < this.spells.length; i++)
		{
			spell = this.spells[i];

			if (spell.damageFP > 0)
			{
				output += "<tr>";
				output += "<td>" + spell.name + "</td>";
				output += "<td>" + spell.damageFP.toFixed(1) + "</td>";
				output += "<td>" + spell.arFP.toFixed(1) + "</td>";
				output += "<td>" + spell.netDamage.toFixed(1) + "</td>";
				output += "<td>" + spell.totalAR.toFixed(1) + "</td>";
				output += "</tr>";
			}
		}

		this.config.autoRefresh = false;

		for (i=0; i < this.controls.length; i++)
			if (this.controls[i].update != null)
				this.controls[i].update();

		this.config.autoRefresh = true;

		this.contentElement.innerHTML = "<table><thead><tr><th>Name</th><th>Damage:FP</th><th>AR:FP</th><th>Net Damage</th><th>Net AR</th></thead>" + output + "</table>";

	}

	sortUpdate()
	{
		this.config.sortBy = this.sortElement.value;
		this.refresh();
	}

	initialize()
	{
		this.contentElement	= document.getElementById('outputDiv');

		var i=0;
		for (i=0; i < SPELL_TYPES.length; i++)
		{
			this.controls.push(new spellBuffControl(SPELL_TYPES[i], this, false));
			this.controls.push(new spellTypeToggle(SPELL_TYPES[i], this));
		}

		this.controls.push(new spellBuffControl(SPELLTYPE_NONE, this, true));

		for (i=0; i < DAMAGE_TYPES.length; i++)
		{
			this.controls.push(new absorptionControl(DAMAGE_TYPES[i], this, false));
			this.controls.push(new flatDefenseControl(DAMAGE_TYPES[i], this, false));
			this.controls.push(new damageTypeToggle(DAMAGE_TYPES[i], this))
		}

		this.controls.push(new absorptionControl(DAMAGE_NONE, this, true));
		this.controls.push(new flatDefenseControl(DAMAGE_NONE, this, true));

		this.config.autoRefresh = true;

		var bodyBuffList = [21, 22, 23, 24, 25];

		for (i=0; i < bodyBuffList.length; i++)
		{
			this.controls.push(new bodyBuffSelectionControl(this, bodyBuffList[i]));	
		}

		// Sort controls
		this.sortElement = document.getElementById('controlSort');
		this.sortElement.addEventListener("change", this.sortUpdate.bind(this));

		for (i = 0; i <= 3; i++)
			this.ringSelectors.push(new ringSelectionControl(this, i));


		this.helmSelector = new helmSelectionControl(this);
		this.pvpCheckbox = document.getElementById('controlIsPvp');
		this.pvpCheckbox.addEventListener("change", this.refresh.bind(this));

		this.refresh();
	}

	findARPostFlatDef(attackAR, defense)
	{
		if (defense > (attackAR * 8))
		{
			return attackAR * 0.1;
		} else if (defense > attackAR) {
			return (19.2/49 * Math.pow((attackAR / defense - 0.125), 2) + 0.1) * attackAR;
		} else if (defense > (attackAR * 0.4))
		{
			return (-0.4/3 * Math.pow((attackAR / defense - 2.5), 2) + 0.7) * attackAR;
		} else if (defense > (attackAR * 0.125) )
		{
			return (-0.8/121 * Math.pow((attackAR / defense - 8), 2) + 0.9) * attackAR;
		} else 
		{
			return attackAR * 0.9;
		}
	}

	getNetDamage(attackAR, flatDef, absorption)
	{
		var afterFlatDef	= this.findARPostFlatDef(attackAR, flatDef);
		var afterABS		= afterFlatDef * (100 - absorption) / 100;
		return afterABS;
	}

	getSpellNetDamage(spell)
	{
		var effectiveSB = this.getESB(spell.type, spell.damageType);
		var netAttackRating = spell.attackRating * effectiveSB / 100;
		spell.netAR = netAttackRating;
		// var netAttackRating = spell.attackRating * this.effectiveSB / 100;
		return this.getNetDamage(netAttackRating, this.getFlatDef(spell.damageType), this.getAbsorption(spell.damageType));
	}
}

var toolInstance = new spellTool();