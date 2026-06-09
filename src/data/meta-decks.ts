import type { MetaDeck } from '../types';

// All decklists use OGN cards only. Rune counts: 6+6=12. Battlefields: 3.
// Tiers based on Origins competitive meta (OGN-only format).

export const META_DECKS: MetaDeck[] = [
  // ── S ──────────────────────────────────────────────────────────────
  {
    id: 'kaisa-spellslinger',
    name: 'Spellslinger',
    champion: "Kai'Sa",
    tier: 'S',
    legendId: 'ogn-247-298',
    main: [
      { cardId: 'ogn-039-298', count: 3 }, // Kai'Sa, Survivor
      { cardId: 'ogn-112-298', count: 3 }, // Kai'Sa, Evolutionary
      { cardId: 'ogn-103-298', count: 3 }, // Ravenbloom Student
      { cardId: 'ogn-096-298', count: 3 }, // Watchful Sentry
      { cardId: 'ogn-013-298', count: 3 }, // Pouty Poro
      { cardId: 'ogn-009-298', count: 3 }, // Hextech Ray
      { cardId: 'ogn-024-298', count: 3 }, // Void Seeker
      { cardId: 'ogn-093-298', count: 3 }, // Smoke Screen
      { cardId: 'ogn-095-298', count: 3 }, // Stupefy
      { cardId: 'ogn-248-298', count: 3 }, // Icathian Rain
      { cardId: 'ogn-029-298', count: 3 }, // Falling Star
      { cardId: 'ogn-022-298', count: 3 }, // Thermo Beam
      { cardId: 'ogn-122-298', count: 2 }, // Time Warp
      { cardId: 'ogn-102-298', count: 2 }, // Portal Rescue
    ],
    runes: [
      { cardId: 'ogn-007-298', count: 6 }, // Fury Rune
      { cardId: 'ogn-089-298', count: 6 }, // Mind Rune
    ],
    battlefields: [
      { cardId: 'ogn-296-298', count: 1 }, // Void Gate
      { cardId: 'ogn-292-298', count: 1 }, // The Dreaming Tree
      { cardId: 'ogn-291-298', count: 1 }, // The Candlelit Sanctum
    ],
  },

  // ── A ──────────────────────────────────────────────────────────────
  {
    id: 'teemo-hidden',
    name: 'Hidden Control',
    champion: 'Teemo',
    tier: 'A',
    legendId: 'ogn-263-298',
    main: [
      { cardId: 'ogn-197-298', count: 3 }, // Teemo, Scout
      { cardId: 'ogn-121-298', count: 3 }, // Teemo, Strategist
      { cardId: 'ogn-176-298', count: 3 }, // Sneaky Deckhand
      { cardId: 'ogn-185-298', count: 3 }, // Traveling Merchant
      { cardId: 'ogn-177-298', count: 3 }, // Stealthy Pursuer
      { cardId: 'ogn-192-298', count: 3 }, // Mindsplitter
      { cardId: 'ogn-096-298', count: 3 }, // Watchful Sentry
      { cardId: 'ogn-093-298', count: 3 }, // Smoke Screen
      { cardId: 'ogn-095-298', count: 3 }, // Stupefy
      { cardId: 'ogn-101-298', count: 3 }, // Mushroom Pouch
      { cardId: 'ogn-168-298', count: 3 }, // Fight or Flight
      { cardId: 'ogn-169-298', count: 3 }, // Gust
      { cardId: 'ogn-104-298', count: 2 }, // Retreat
      { cardId: 'ogn-264-298', count: 1 }, // Guerilla Warfare
    ],
    runes: [
      { cardId: 'ogn-089-298', count: 6 }, // Mind Rune
      { cardId: 'ogn-166-298', count: 6 }, // Chaos Rune
    ],
    battlefields: [
      { cardId: 'ogn-282-298', count: 1 }, // Monastery of Hirana
      { cardId: 'ogn-288-298', count: 1 }, // Startipped Peak
      { cardId: 'ogn-277-298', count: 1 }, // Back-Alley Bar
    ],
  },
  {
    id: 'mf-pirate',
    name: 'Pirate Aggro',
    champion: 'Miss Fortune',
    tier: 'A',
    legendId: 'ogn-267-298',
    main: [
      { cardId: 'ogn-193-298', count: 3 }, // Miss Fortune, Buccaneer
      { cardId: 'ogn-162-298', count: 2 }, // Miss Fortune, Captain
      { cardId: 'ogn-132-298', count: 3 }, // First Mate
      { cardId: 'ogn-130-298', count: 3 }, // Crackshot Corsair
      { cardId: 'ogn-176-298', count: 3 }, // Sneaky Deckhand
      { cardId: 'ogn-185-298', count: 3 }, // Traveling Merchant
      { cardId: 'ogn-125-298', count: 3 }, // Bilgewater Bully
      { cardId: 'ogn-127-298', count: 3 }, // Cannon Barrage
      { cardId: 'ogn-133-298', count: 3 }, // Flurry of Blades
      { cardId: 'ogn-168-298', count: 3 }, // Fight or Flight
      { cardId: 'ogn-144-298', count: 3 }, // Spoils of War
      { cardId: 'ogn-143-298', count: 3 }, // Pirate's Haven
      { cardId: 'ogn-128-298', count: 2 }, // Challenge
      { cardId: 'ogn-124-298', count: 2 }, // Arena Bar
      { cardId: 'ogn-268-298', count: 1 }, // Bullet Time
    ],
    runes: [
      { cardId: 'ogn-126-298', count: 6 }, // Body Rune
      { cardId: 'ogn-166-298', count: 6 }, // Chaos Rune
    ],
    battlefields: [
      { cardId: 'ogn-285-298', count: 1 }, // Reaver's Row
      { cardId: 'ogn-298-298', count: 1 }, // Zaun Warrens
      { cardId: 'ogn-290-298', count: 1 }, // The Arena's Greatest
    ],
  },

  // ── B ──────────────────────────────────────────────────────────────
  {
    id: 'viktor-token',
    name: 'Token Control',
    champion: 'Viktor',
    tier: 'B',
    legendId: 'ogn-265-298',
    main: [
      { cardId: 'ogn-117-298', count: 3 }, // Viktor, Innovator
      { cardId: 'ogn-246-298', count: 3 }, // Viktor, Leader
      { cardId: 'ogn-103-298', count: 3 }, // Ravenbloom Student
      { cardId: 'ogn-096-298', count: 3 }, // Watchful Sentry
      { cardId: 'ogn-084-298', count: 3 }, // Eager Apprentice
      { cardId: 'ogn-211-298', count: 3 }, // Faithful Manufactor
      { cardId: 'ogn-239-298', count: 3 }, // Machine Evangel
      { cardId: 'ogn-219-298', count: 3 }, // Vanguard Sergeant
      { cardId: 'ogn-093-298', count: 3 }, // Smoke Screen
      { cardId: 'ogn-095-298', count: 3 }, // Stupefy
      { cardId: 'ogn-086-298', count: 2 }, // Jeweled Colossus
      { cardId: 'ogn-114-298', count: 2 }, // Progress Day
      { cardId: 'ogn-266-298', count: 2 }, // Siphon Power
      { cardId: 'ogn-122-298', count: 2 }, // Time Warp
      { cardId: 'ogn-221-298', count: 2 }, // Imperial Decree
    ],
    runes: [
      { cardId: 'ogn-089-298', count: 6 }, // Mind Rune
      { cardId: 'ogn-214-298', count: 6 }, // Order Rune
    ],
    battlefields: [
      { cardId: 'ogn-291-298', count: 1 }, // The Candlelit Sanctum
      { cardId: 'ogn-276-298', count: 1 }, // Aspirant's Climb
      { cardId: 'ogn-288-298', count: 1 }, // Startipped Peak
    ],
  },
  {
    id: 'sett-buff',
    name: 'Buff & Protect',
    champion: 'Sett',
    tier: 'B',
    legendId: 'ogn-269-298',
    main: [
      { cardId: 'ogn-164-298', count: 3 }, // Sett, Brawler
      { cardId: 'ogn-240-298', count: 3 }, // Sett, Kingpin
      { cardId: 'ogn-232-298', count: 2 }, // Fiora, Victorious
      { cardId: 'ogn-219-298', count: 3 }, // Vanguard Sergeant
      { cardId: 'ogn-139-298', count: 3 }, // Cithria of Cloudfield
      { cardId: 'ogn-217-298', count: 3 }, // Trifarian Gloryseeker
      { cardId: 'ogn-125-298', count: 3 }, // Bilgewater Bully
      { cardId: 'ogn-136-298', count: 3 }, // Pit Rookie
      { cardId: 'ogn-145-298', count: 3 }, // Unyielding Spirit
      { cardId: 'ogn-206-298', count: 3 }, // Back to Back
      { cardId: 'ogn-229-298', count: 3 }, // Vengeance
      { cardId: 'ogn-154-298', count: 3 }, // Primal Strength
      { cardId: 'ogn-207-298', count: 3 }, // Call to Glory
      { cardId: 'ogn-270-298', count: 1 }, // Showstopper
    ],
    runes: [
      { cardId: 'ogn-126-298', count: 6 }, // Body Rune
      { cardId: 'ogn-214-298', count: 6 }, // Order Rune
    ],
    battlefields: [
      { cardId: 'ogn-283-298', count: 1 }, // Navori Fighting Pit
      { cardId: 'ogn-293-298', count: 1 }, // The Grand Plaza
      { cardId: 'ogn-284-298', count: 1 }, // Obelisk of Power
    ],
  },
  {
    id: 'darius-legion',
    name: 'Legion Aggro',
    champion: 'Darius',
    tier: 'B',
    legendId: 'ogn-253-298',
    main: [
      { cardId: 'ogn-027-298', count: 3 }, // Darius, Trifarian
      { cardId: 'ogn-012-298', count: 3 }, // Noxus Hopeful
      { cardId: 'ogn-013-298', count: 3 }, // Pouty Poro
      { cardId: 'ogn-219-298', count: 3 }, // Vanguard Sergeant
      { cardId: 'ogn-217-298', count: 3 }, // Trifarian Gloryseeker
      { cardId: 'ogn-015-298', count: 2 }, // Captain Farron
      { cardId: 'ogn-018-298', count: 3 }, // Noxus Saboteur
      { cardId: 'ogn-004-298', count: 3 }, // Cleave
      { cardId: 'ogn-229-298', count: 3 }, // Vengeance
      { cardId: 'ogn-207-298', count: 3 }, // Call to Glory
      { cardId: 'ogn-209-298', count: 3 }, // Cull the Weak
      { cardId: 'ogn-017-298', count: 2 }, // Iron Ballista
      { cardId: 'ogn-221-298', count: 2 }, // Imperial Decree
      { cardId: 'ogn-220-298', count: 2 }, // Facebreaker
      { cardId: 'ogn-254-298', count: 1 }, // Noxian Guillotine
      { cardId: 'ogn-233-298', count: 1 }, // Grand Strategem
    ],
    runes: [
      { cardId: 'ogn-007-298', count: 6 }, // Fury Rune
      { cardId: 'ogn-214-298', count: 6 }, // Order Rune
    ],
    battlefields: [
      { cardId: 'ogn-294-298', count: 1 }, // Trifarian War Camp
      { cardId: 'ogn-283-298', count: 1 }, // Navori Fighting Pit
      { cardId: 'ogn-286-298', count: 1 }, // Reckoner's Arena
    ],
  },

  // ── C ──────────────────────────────────────────────────────────────
  {
    id: 'yasuo-movement',
    name: 'Movement Control',
    champion: 'Yasuo',
    tier: 'C',
    legendId: 'ogn-259-298',
    main: [
      { cardId: 'ogn-076-298', count: 3 }, // Yasuo, Remorseful
      { cardId: 'ogn-205-298', count: 3 }, // Yasuo, Windrider
      { cardId: 'ogn-176-298', count: 3 }, // Sneaky Deckhand
      { cardId: 'ogn-185-298', count: 3 }, // Traveling Merchant
      { cardId: 'ogn-165-298', count: 3 }, // Cemetery Attendant
      { cardId: 'ogn-066-298', count: 2 }, // Ahri, Alluring
      { cardId: 'ogn-064-298', count: 3 }, // Wind Wall
      { cardId: 'ogn-168-298', count: 3 }, // Fight or Flight
      { cardId: 'ogn-173-298', count: 3 }, // Ride the Wind
      { cardId: 'ogn-169-298', count: 3 }, // Gust
      { cardId: 'ogn-204-298', count: 3 }, // Seal of Discord
      { cardId: 'ogn-043-298', count: 3 }, // Charm
      { cardId: 'ogn-045-298', count: 2 }, // Defy
      { cardId: 'ogn-046-298', count: 2 }, // En Garde
      { cardId: 'ogn-260-298', count: 1 }, // Last Breath
    ],
    runes: [
      { cardId: 'ogn-042-298', count: 6 }, // Calm Rune
      { cardId: 'ogn-166-298', count: 6 }, // Chaos Rune
    ],
    battlefields: [
      { cardId: 'ogn-282-298', count: 1 }, // Monastery of Hirana
      { cardId: 'ogn-292-298', count: 1 }, // The Dreaming Tree
      { cardId: 'ogn-297-298', count: 1 }, // Windswept Hillock
    ],
  },
  {
    id: 'jinx-handburn',
    name: 'Hand Burn',
    champion: 'Jinx',
    tier: 'C',
    legendId: 'ogn-251-298',
    main: [
      { cardId: 'ogn-202-298', count: 3 }, // Jinx, Rebel
      { cardId: 'ogn-030-298', count: 3 }, // Jinx, Demolitionist
      { cardId: 'ogn-013-298', count: 3 }, // Pouty Poro
      { cardId: 'ogn-176-298', count: 3 }, // Sneaky Deckhand
      { cardId: 'ogn-185-298', count: 3 }, // Traveling Merchant
      { cardId: 'ogn-182-298', count: 3 }, // Scrapheap
      { cardId: 'ogn-183-298', count: 3 }, // Stacked Deck
      { cardId: 'ogn-168-298', count: 3 }, // Fight or Flight
      { cardId: 'ogn-169-298', count: 3 }, // Gust
      { cardId: 'ogn-173-298', count: 3 }, // Ride the Wind
      { cardId: 'ogn-004-298', count: 3 }, // Cleave
      { cardId: 'ogn-008-298', count: 3 }, // Get Excited!
      { cardId: 'ogn-172-298', count: 2 }, // Rebuke
      { cardId: 'ogn-252-298', count: 1 }, // Super Mega Death Rocket!
      { cardId: 'ogn-005-298', count: 1 }, // Disintegrate
    ],
    runes: [
      { cardId: 'ogn-007-298', count: 6 }, // Fury Rune
      { cardId: 'ogn-166-298', count: 6 }, // Chaos Rune
    ],
    battlefields: [
      { cardId: 'ogn-298-298', count: 1 }, // Zaun Warrens
      { cardId: 'ogn-286-298', count: 1 }, // Reckoner's Arena
      { cardId: 'ogn-292-298', count: 1 }, // The Dreaming Tree
    ],
  },
  {
    id: 'ahri-foxfire',
    name: 'Fox-Fire Control',
    champion: 'Ahri',
    tier: 'C',
    legendId: 'ogn-255-298',
    main: [
      { cardId: 'ogn-119-298', count: 3 }, // Ahri, Inquisitive
      { cardId: 'ogn-066-298', count: 3 }, // Ahri, Alluring
      { cardId: 'ogn-103-298', count: 3 }, // Ravenbloom Student
      { cardId: 'ogn-096-298', count: 3 }, // Watchful Sentry
      { cardId: 'ogn-044-298', count: 3 }, // Clockwork Keeper
      { cardId: 'ogn-065-298', count: 3 }, // Wizened Elder
      { cardId: 'ogn-256-298', count: 3 }, // Fox-Fire
      { cardId: 'ogn-093-298', count: 3 }, // Smoke Screen
      { cardId: 'ogn-095-298', count: 3 }, // Stupefy
      { cardId: 'ogn-043-298', count: 3 }, // Charm
      { cardId: 'ogn-050-298', count: 3 }, // Rune Prison
      { cardId: 'ogn-122-298', count: 2 }, // Time Warp
      { cardId: 'ogn-048-298', count: 2 }, // Meditation
      { cardId: 'ogn-104-298', count: 2 }, // Retreat
      { cardId: 'ogn-080-298', count: 1 }, // Mystic Reversal
    ],
    runes: [
      { cardId: 'ogn-042-298', count: 6 }, // Calm Rune
      { cardId: 'ogn-089-298', count: 6 }, // Mind Rune
    ],
    battlefields: [
      { cardId: 'ogn-282-298', count: 1 }, // Monastery of Hirana
      { cardId: 'ogn-291-298', count: 1 }, // The Candlelit Sanctum
      { cardId: 'ogn-289-298', count: 1 }, // Targon's Peak
    ],
  },
  {
    id: 'leona-stun',
    name: 'Stun & Buff',
    champion: 'Leona',
    tier: 'C',
    legendId: 'ogn-261-298',
    main: [
      { cardId: 'ogn-079-298', count: 3 }, // Leona, Zealot
      { cardId: 'ogn-238-298', count: 3 }, // Leona, Determined
      { cardId: 'ogn-225-298', count: 3 }, // Solari Chief
      { cardId: 'ogn-051-298', count: 3 }, // Solari Shieldbearer
      { cardId: 'ogn-054-298', count: 3 }, // Sunlit Guardian
      { cardId: 'ogn-219-298', count: 3 }, // Vanguard Sergeant
      { cardId: 'ogn-046-298', count: 3 }, // En Garde
      { cardId: 'ogn-262-298', count: 3 }, // Zenith Blade
      { cardId: 'ogn-053-298', count: 3 }, // Stand United
      { cardId: 'ogn-229-298', count: 3 }, // Vengeance
      { cardId: 'ogn-207-298', count: 3 }, // Call to Glory
      { cardId: 'ogn-227-298', count: 2 }, // Symbol of the Solari
      { cardId: 'ogn-058-298', count: 2 }, // Discipline
      { cardId: 'ogn-062-298', count: 2 }, // Reinforce
      { cardId: 'ogn-069-298', count: 1 }, // Last Stand
    ],
    runes: [
      { cardId: 'ogn-042-298', count: 6 }, // Calm Rune
      { cardId: 'ogn-214-298', count: 6 }, // Order Rune
    ],
    battlefields: [
      { cardId: 'ogn-289-298', count: 1 }, // Targon's Peak
      { cardId: 'ogn-280-298', count: 1 }, // Grove of the God-Willow
      { cardId: 'ogn-293-298', count: 1 }, // The Grand Plaza
    ],
  },
  {
    id: 'leesin-tempo',
    name: 'Buff Tempo',
    champion: 'Lee Sin',
    tier: 'C',
    legendId: 'ogn-257-298',
    main: [
      { cardId: 'ogn-078-298', count: 3 }, // Lee Sin, Ascetic
      { cardId: 'ogn-151-298', count: 3 }, // Lee Sin, Centered
      { cardId: 'ogn-141-298', count: 3 }, // Kinkou Monk
      { cardId: 'ogn-054-298', count: 3 }, // Sunlit Guardian
      { cardId: 'ogn-044-298', count: 3 }, // Clockwork Keeper
      { cardId: 'ogn-140-298', count: 3 }, // Herald of Scales
      { cardId: 'ogn-139-298', count: 3 }, // Cithria of Cloudfield
      { cardId: 'ogn-258-298', count: 3 }, // Dragon's Rage
      { cardId: 'ogn-145-298', count: 3 }, // Unyielding Spirit
      { cardId: 'ogn-046-298', count: 3 }, // En Garde
      { cardId: 'ogn-128-298', count: 3 }, // Challenge
      { cardId: 'ogn-047-298', count: 2 }, // Find Your Center
      { cardId: 'ogn-154-298', count: 2 }, // Primal Strength
      { cardId: 'ogn-048-298', count: 2 }, // Meditation
      { cardId: 'ogn-057-298', count: 1 }, // Block
    ],
    runes: [
      { cardId: 'ogn-042-298', count: 6 }, // Calm Rune
      { cardId: 'ogn-126-298', count: 6 }, // Body Rune
    ],
    battlefields: [
      { cardId: 'ogn-282-298', count: 1 }, // Monastery of Hirana
      { cardId: 'ogn-280-298', count: 1 }, // Grove of the God-Willow
      { cardId: 'ogn-279-298', count: 1 }, // Fortified Position
    ],
  },
  {
    id: 'volibear-mighty',
    name: 'Mighty Aggro',
    champion: 'Volibear',
    tier: 'C',
    legendId: 'ogn-249-298',
    main: [
      { cardId: 'ogn-041-298', count: 3 }, // Volibear, Furious
      { cardId: 'ogn-158-298', count: 3 }, // Volibear, Imposing
      { cardId: 'ogn-013-298', count: 3 }, // Pouty Poro
      { cardId: 'ogn-137-298', count: 3 }, // Stormclaw Ursine
      { cardId: 'ogn-026-298', count: 3 }, // Brynhir Thundersong
      { cardId: 'ogn-142-298', count: 3 }, // Mountain Drake
      { cardId: 'ogn-034-298', count: 3 }, // Tryndamere, Barbarian
      { cardId: 'ogn-014-298', count: 3 }, // Sky Splitter
      { cardId: 'ogn-250-298', count: 3 }, // Stormbringer
      { cardId: 'ogn-145-298', count: 3 }, // Unyielding Spirit
      { cardId: 'ogn-154-298', count: 3 }, // Primal Strength
      { cardId: 'ogn-004-298', count: 3 }, // Cleave
      { cardId: 'ogn-022-298', count: 2 }, // Thermo Beam
      { cardId: 'ogn-146-298', count: 1 }, // Wallop
      { cardId: 'ogn-005-298', count: 1 }, // Disintegrate
    ],
    runes: [
      { cardId: 'ogn-007-298', count: 6 }, // Fury Rune
      { cardId: 'ogn-126-298', count: 6 }, // Body Rune
    ],
    battlefields: [
      { cardId: 'ogn-286-298', count: 1 }, // Reckoner's Arena
      { cardId: 'ogn-284-298', count: 1 }, // Obelisk of Power
      { cardId: 'ogn-295-298', count: 1 }, // Vilemaw's Lair
    ],
  },
];

export const TIER_ORDER: Record<MetaDeck['tier'], number> = { S: 0, A: 1, B: 2, C: 3 };
