/**
 * Base (set-in-stone) Easter Egg seed data: WAW, BO1, BO2 through Mob of the Dead.
 * When a map is finished (e.g. Buried), move its EEs from in-progress into this file.
 */

import type { SpecificEasterEgg } from './seed-easter-egg-types';

export const SPECIFIC_EASTER_EGGS_BASE: SpecificEasterEgg[] = [
  {
    gameShortName: 'WAW',
    mapSlug: 'nacht-der-untoten',
    name: 'Music Radio',
    slug: 'music-radio',
    type: 'MUSICAL',
    xpReward: 0,
    description:
      'A radio in the Help! room plays music when knifed or shot. In World at War it plays various songs (e.g. Black Cats soundtrack, Red Army theme, Königgrätzer Marsch, or WTF). In Call of Duty: Zombies (Black Ops), knifing it unlocks the "Radio Silence?" achievement.',
    steps: [
      { order: 1, label: 'Go to the "Help!" room — the room that contains the Mystery Box.' },
      { order: 2, label: 'Find the radio on the wall to the right of the Mystery Box.' },
      {
        order: 3,
        label:
          'Knife or shoot the radio to play music. In World at War it can play the Black Cats soundtrack, Red Army theme, Königgrätzer Marsch, or WTF. In Call of Duty: Zombies (Black Ops), knifing it unlocks the "Radio Silence?" achievement.',
      },
    ],
  },
  // ——— Verrückt (WAW) ———
  {
    gameShortName: 'WAW',
    mapSlug: 'verruckt',
    name: 'Dentist Chair',
    slug: 'dentist-chair',
    type: 'SIDE_QUEST',
    xpReward: 0,
    description:
      'A dentist chair in the left spawn room (Juggernog) can be activated. In Call of Duty: Zombies (Black Ops) this awards the "Open Wide..." achievement.',
    steps: [
      {
        order: 1,
        label:
          'In the left spawn room (Juggernog), use the action button (or knife in WaW) on the wheel attached to the dentist chair. A drill sound and screaming will play.',
      },
    ],
  },
  {
    gameShortName: 'WAW',
    mapSlug: 'verruckt',
    name: 'Lullaby for a Dead Man',
    slug: 'lullaby-for-a-dead-man',
    type: 'MUSICAL',
    xpReward: 0,
    description: 'Musical Easter egg by Kevin Sherwood and Elena Siegman. The song is quiet (coded as a sound effect).',
    steps: [
      {
        order: 1,
        label: 'Flush the leftmost toilet in the left upstairs bathroom 3 times to start the song.',
      },
    ],
  },
  // ——— Verrückt (BO1 Rezurrection) ———
  {
    gameShortName: 'BO1',
    mapSlug: 'bo1-verruckt',
    name: 'Dentist Chair',
    slug: 'dentist-chair',
    type: 'SIDE_QUEST',
    xpReward: 0,
    description: 'Activating the dentist chair awards the "Open Wide..." achievement.',
    steps: [
      {
        order: 1,
        label:
          'In the left spawn room (Juggernog), use the action button on the wheel attached to the dentist chair. A drill sound and screaming will play.',
      },
    ],
  },
  {
    gameShortName: 'BO1',
    mapSlug: 'bo1-verruckt',
    name: 'Campaign Music Radio',
    slug: 'campaign-music-radio',
    type: 'MUSICAL',
    xpReward: 0,
    description: 'An interactive radio on the American side plays campaign music when shot.',
    steps: [
      {
        order: 1,
        label:
          'From the balcony on the American side, find the radio on a desk visible through a window. Shoot it to play campaign music.',
      },
    ],
  },
  {
    gameShortName: 'BO1',
    mapSlug: 'bo1-verruckt',
    name: 'Lullaby for a Dead Man',
    slug: 'lullaby-for-a-dead-man',
    type: 'MUSICAL',
    xpReward: 0,
    description: 'Musical Easter egg by Kevin Sherwood and Elena Siegman.',
    steps: [
      { order: 1, label: 'Flush the leftmost toilet in the left upstairs bathroom 3 times to start the song.' },
    ],
  },
  // ——— Verrückt (BO3 Zombie Chronicles) ———
  {
    gameShortName: 'BO3',
    mapSlug: 'bo3-verruckt',
    name: 'Dentist Chair',
    slug: 'dentist-chair',
    type: 'SIDE_QUEST',
    xpReward: 0,
    description: 'The classic dentist chair activation in the left spawn room.',
    steps: [
      {
        order: 1,
        label:
          'In the left spawn room (Juggernog), use the action button on the wheel attached to the dentist chair.',
      },
    ],
  },
  {
    gameShortName: 'BO3',
    mapSlug: 'bo3-verruckt',
    name: 'Campaign Music Radio',
    slug: 'campaign-music-radio',
    type: 'MUSICAL',
    xpReward: 0,
    description: 'An interactive radio plays campaign music when shot.',
    steps: [
      {
        order: 1,
        label: 'From the balcony on the American side, find the radio on a desk visible through a window. Shoot it to play music.',
      },
    ],
  },
  {
    gameShortName: 'BO3',
    mapSlug: 'bo3-verruckt',
    name: 'Doctor Monty Radio',
    slug: 'doctor-monty-radio',
    type: 'SIDE_QUEST',
    xpReward: 0,
    description:
      'A radio in Zombie Chronicles plays a Doctor Monty quote about the asylum: "Electroshock therapy, chemically engineered beverages, hordes of undead Nazis..."',
    steps: [
      { order: 1, label: 'Find and activate the Doctor Monty radio to hear the quote.' },
    ],
  },
  {
    gameShortName: 'BO3',
    mapSlug: 'bo3-verruckt',
    name: 'Lullaby for a Dead Man',
    slug: 'lullaby-for-a-dead-man',
    type: 'MUSICAL',
    xpReward: 0,
    description: 'Musical Easter egg by Kevin Sherwood and Elena Siegman.',
    steps: [
      { order: 1, label: 'Flush the leftmost toilet in the left upstairs bathroom 3 times to start the song.' },
    ],
  },
  // ——— Shi No Numa (WAW) ———
  {
    gameShortName: 'WAW',
    mapSlug: 'shi-no-numa',
    name: 'Radios',
    slug: 'radios',
    type: 'SIDE_QUEST',
    xpReward: 0,
    description: 'Three radios can be turned on with the use button to hear transmissions.',
    steps: [
      { order: 1, label: 'Spawn room: Turn on the three radios (hold use) to hear the automated coordinates and Cornelius Pernell transmission.' },
      { order: 2, label: 'Left of Doctor\'s Quarters entrance: In the room with a radio, turn it on to hear laughing, "Element 115," and "Find Dr. Richtofen."' },
      { order: 3, label: 'Storage Hut: Turn on the radio beside the Mystery Box to hear the Just the Beginning Verrückt trailer audio.' },
    ],
  },
  {
    gameShortName: 'WAW',
    mapSlug: 'shi-no-numa',
    name: 'The One',
    slug: 'the-one',
    type: 'MUSICAL',
    xpReward: 0,
    description: 'Musical Easter egg by Kevin Sherwood. You will hear "9-1-1. I know where you\'re sleeping" before the song plays.',
    steps: [
      {
        order: 1,
        label: 'Interact with the telephone in the Comm Room three times to play The One. You will hear "9-1-1. I know where you\'re sleeping" before the song.',
      },
    ],
  },
  // ——— Shi No Numa (BO1 Rezurrection) ———
  {
    gameShortName: 'BO1',
    mapSlug: 'bo1-shi-no-numa',
    name: 'Radios',
    slug: 'radios',
    type: 'SIDE_QUEST',
    xpReward: 0,
    description: 'Four radio sets; the fourth (Ultimis) explains travel from Der Riese to Kino der Toten.',
    steps: [
      { order: 1, label: 'Spawn room: Turn on the three radios (hold use) for coordinates and Cornelius Pernell transmission.' },
      { order: 2, label: 'Left of Doctor\'s Quarters entrance: Room with a radio; turn it on for laughing, "Element 115," "Find Dr. Richtofen."' },
      { order: 3, label: 'Storage Hut: Radio beside the Mystery Box; turn on for Verrückt trailer.' },
      {
        order: 4,
        label: 'Ultimis message: Activate these three in any order (Doctor\'s Quarters last recommended): Storage Hut (room to the right, on a crate), Comm Room (right half, shelf in corner), Doctor\'s Quarters (outside shelter, crate). Last one plays Ultimis time-travel dialogue.',
      },
    ],
  },
  {
    gameShortName: 'BO1',
    mapSlug: 'bo1-shi-no-numa',
    name: 'The One',
    slug: 'the-one',
    type: 'MUSICAL',
    xpReward: 0,
    description: 'Musical Easter egg by Kevin Sherwood. You will hear "9-1-1. I know where you\'re sleeping" before the song.',
    steps: [
      {
        order: 1,
        label: 'Interact with the telephone in the Comm Room three times to play The One.',
      },
    ],
  },
  // ——— Shi No Numa (BO3 Zombie Chronicles) ———
  {
    gameShortName: 'BO3',
    mapSlug: 'bo3-shi-no-numa',
    name: 'Radios',
    slug: 'radios',
    type: 'SIDE_QUEST',
    xpReward: 0,
    description: 'Five radio sets; the fifth is a Doctor Monty message in spawn.',
    steps: [
      { order: 1, label: 'Spawn room: Turn on the three radios (hold use) for coordinates and Cornelius Pernell transmission.' },
      { order: 2, label: 'Left of Doctor\'s Quarters entrance: Room with a radio; turn it on.' },
      { order: 3, label: 'Storage Hut: Radio beside the Mystery Box; turn on.' },
      {
        order: 4,
        label: 'Ultimis message: Activate in any order — Storage Hut (room to the right, on crate), Comm Room (right half, shelf in corner), Doctor\'s Quarters (outside shelter, crate). Last one plays Ultimis dialogue.',
      },
      { order: 5, label: 'Spawn room: Radio to the left of the window that is left of the Sheiva wall buy; turn on for the Doctor Monty message.' },
    ],
  },
  {
    gameShortName: 'BO3',
    mapSlug: 'bo3-shi-no-numa',
    name: 'The One',
    slug: 'the-one',
    type: 'MUSICAL',
    xpReward: 0,
    description: 'Musical Easter egg by Kevin Sherwood. You will hear "9-1-1. I know where you\'re sleeping" before the song.',
    steps: [
      {
        order: 1,
        label: 'Interact with the telephone in the Comm Room three times to play The One.',
      },
    ],
  },
  {
    gameShortName: 'BO3',
    mapSlug: 'bo3-shi-no-numa',
    name: "Samantha's Sorrow",
    slug: 'samanthas-sorrow',
    type: 'MUSICAL',
    xpReward: 0,
    description: 'Zombie Chronicles exclusive. Song activated via a small Easter egg in the Fishing Hut. By Brian Tuey.',
    steps: [
      {
        order: 1,
        label: 'Shoot four pans in the Fishing Hut with the starting pistol. A small Samantha Maxis doll will spawn on the floor of the far left room at the Hut.',
      },
      {
        order: 2,
        label: 'Interact with the doll; it will disappear and reappear on the podiums of the bridge connecting Fishing Hut to the spawn area.',
      },
      {
        order: 3,
        label: 'Shoot the doll again; it will disappear. Repeat this (doll reappears in different spots) until the doll reappears upright at the Fishing Hut.',
      },
      {
        order: 4,
        label: 'Interact with the doll a final time. A skeletal arm will lift the doll, spawning a Max Ammo and activating Samantha\'s Sorrow.',
      },
    ],
  },
  // ——— Der Riese (WAW) ———
  {
    gameShortName: 'WAW',
    mapSlug: 'der-riese',
    name: 'Fly Trap',
    slug: 'fly-trap',
    type: 'MAIN_QUEST',
    xpReward: 500,
    description: 'Samantha challenges players to find and shoot three hidden items. Requires a Pack-a-Punched weapon to start.',
    steps: [
      {
        order: 1,
        label: 'With a Pack-a-Punched weapon, shoot the panel in the Left Corridor (near the doors to Mainframe and Animal Testing Lab). Eight objects fly out; Samantha says "I want to play a game... Let\'s play hide and seek!"',
      },
      {
        order: 2,
        label: 'Find and shoot the first item: Teddy Bear with Bowie Knife, above the M1A1 Carbine on a high window. Samantha says "Yay, you found one!"',
      },
      {
        order: 3,
        label: 'Find and shoot the second item: Teddy Bear with Juggernog bottle and C-3000 b1atch35, in the cage next to the M1897 Trench Gun. Samantha says "Wow, you found another one!"',
      },
      {
        order: 4,
        label: 'Find and shoot the third item: Monkey Bomb with Stielhandgranate and Molotov, in the furnace near the Thompson. Samantha says "You win... GAME OVER!"',
      },
    ],
  },
  {
    gameShortName: 'WAW',
    mapSlug: 'der-riese',
    name: 'Beauty of Annihilation',
    slug: 'beauty-of-annihilation',
    type: 'MUSICAL',
    xpReward: 0,
    description: 'Musical Easter egg. Activate three green glowing jars (with spines inside) in any order to play the song.',
    steps: [
      {
        order: 1,
        label: 'Press the action button on all three green glowing jars (spines inside). Two are in the Animal Testing Lab, one is in a side room near Teleporter B. Any order. When all three are activated, Beauty of Annihilation plays.',
      },
    ],
  },
  // ——— Der Riese (BO1 Rezurrection) ———
  {
    gameShortName: 'BO1',
    mapSlug: 'bo1-der-riese',
    name: 'Fly Trap',
    slug: 'fly-trap',
    type: 'MAIN_QUEST',
    xpReward: 500,
    description: 'Samantha challenges players to find and shoot three hidden items. Requires a Pack-a-Punched weapon to start.',
    steps: [
      {
        order: 1,
        label: 'With a Pack-a-Punched weapon, shoot the panel in the Left Corridor (near Mainframe and Animal Testing Lab doors). Eight objects fly out; Samantha says "I want to play a game... Let\'s play hide and seek!"',
      },
      { order: 2, label: 'Shoot the Teddy Bear with Bowie Knife above the M1A1 Carbine (high window).' },
      { order: 3, label: 'Shoot the Teddy Bear with Juggernog bottle and C-3000 b1atch35 in the cage next to the M1897 Trench Gun.' },
      { order: 4, label: 'Shoot the Monkey Bomb with Stielhandgranate and Molotov in the furnace near the Thompson.' },
    ],
  },
  {
    gameShortName: 'BO1',
    mapSlug: 'bo1-der-riese',
    name: 'Beauty of Annihilation',
    slug: 'beauty-of-annihilation',
    type: 'MUSICAL',
    xpReward: 0,
    description: 'Activate three green glowing jars (spines inside) in any order to play the song.',
    steps: [
      {
        order: 1,
        label: 'Activate all three green jars (two in Animal Testing Lab, one in side room near Teleporter B). Any order. Beauty of Annihilation plays when all three are done.',
      },
    ],
  },
  // ——— Shadows of Evil (BO3) ———
  {
    gameShortName: 'BO3',
    mapSlug: 'shadows-of-evil',
    name: 'Apocalypse Averted',
    slug: 'apocalypse-averted',
    type: 'MAIN_QUEST',
    xpReward: 7500,
    playerCountRequirement: 'SQUAD',
    videoEmbedUrl: 'https://www.youtube.com/embed/zz9m-MB725o',
    description:
      'The story Easter Egg for Shadows of Evil. Four sinners (Nero, Floyd, Jack, Jessica) complete rituals with the Shadowman\'s aid, ascend the apocalypse to unlock Pack-a-Punch, obtain and upgrade the Apothicon Swords, capture the flag at ritual sites, capture the Shadowman in the Summoning Key, then avert the apocalypse with Beast Mode and the Tram. The first part (Apocalypse Ascendant) awards The Beginning of the End achievement and unlocks Pack-a-Punch. The full completion awards a Dark Ops Calling Card and the Summoning Key icon for the Super Easter Egg. Four players are required for the final step.',
    rewardsDescription:
      'The Beginning of the End (after Ascending the Apocalypse). Apocalypse Averted: Dark Ops Calling Card, Summoning Key icon on map select, 1000 XP + 6000 XP first-time. Reborn Keeper Swords returned; Civil Protector upgraded for the rest of the match.',
    steps: [
      {
        order: 1,
        label:
          '[Achieving an Ancient Arsenal] Complete the four gateway rituals (any order). Each character has a ritual site and a sacrifice item. Use Beast mode to obtain items; place item + Summoning Key on the altar. The Magician (Nero): Lawyer\'s Pen from crate by crane outside Easy Street—Beast electrifies meter to swing crane. The Boxer (Floyd): Championship Belt in crate above Waterfront—Beast grapples and knocks it down. The Detective (Jack): Partner\'s Badge in crate behind grate in canals—Beast shocks volt meter behind Mark of the Beast bricks. The Femme Fatale (Jessica): Producer\'s Toupee in crate on building in Footlight walkways—Beast crosses gap and knocks crate down. Second and fourth rituals spawn a Margwa.',
      },
      {
        order: 2,
        label:
          '[Ascending the Apocalypse] With all four Gateworms, go to the Sacred Place in the Rift (Subway). Place Gateworms in the four pedestals (two by the altar, two across the gap; placing them raises walls to cross). Start the final ritual; the Shadowman reveals his plan and leaves with the Summoning Key; a Margwa spawns. Pack-a-Punch portal unlocks, sky turns blood red, giant Apothicon appears. Awards The Beginning of the End achievement.',
      },
      {
        order: 3,
        label:
          '[Apothicon Swords] On the Tram, note the three symbols in red backlit windows (random each game): leaving Waterfront (right side, building after shack); leaving Footlight (left after Peep Show/Rooster\'s Pipe/Celeste\'s); leaving Canals (left after Devil O Donuts/Hotel). In Beast Mode at the Rift, shock the three matching symbols by the Mystery Box; the wall dissolves. Take an Egg from the statue and place it on each of the four Apothicon statues (Footlight alley under Perk; behind Ruby Rabbit stairs; Waterfront destroyed building past Perk; Rift opposite the sword statue). Charge each Egg with 12 souls (repeat for all four statues, then return Egg to get the Sword). All four players must charge their own Egg at all four statues.',
        buildableReferenceSlug: 'apothicon-servant',
      },
      {
        order: 4,
        label:
          '[Upgrading the Swords] Return to your character\'s ritual site and interact with the Keeper spirit for the Arch-Ovum. Place it on the four red ritual circles (Black Lace Burlesque entrance; between Workbench and Ruby Rabbit; in front of The Anvil; outside Easy Street). Kill the Margwas that spawn (solo: up to 2; co-op: up to 4). One circle per player per round. Return to your ritual table and give the Sword to the Keeper to get the Reborn Keeper Sword.',
      },
      {
        order: 5,
        label:
          '[Capture the Flag] At Nero\'s ritual area, interact with the book on the ground. A flag with purple mist drops. Pick it up (zombies despawn; Insanity Elementals spawn). Carry the flag to purple lightning spots on the ground (avoid dark purple circles). Defend until the chime, then pick up and repeat. Two spots per District recommended. Finally bring the flag to the ritual site (Nero, then Floyd, Jack, Jessica). Each time the Keeper becomes solid and teleports below; a Margwa spawns. Repeat for all four characters. If the flag is destroyed or the carrier goes down, it can be picked up again underground. Use Rocket Shield, Pack-a-Punched weapons, Civil Protector, Li\'l Arnies.',
        buildableReferenceSlug: 'rocket-shield',
      },
      {
        order: 6,
        label:
          '[Capturing the Shadowman] All players interact with the Keepers at the Sacred Place pedestals to ready them; they remove the Shadowman\'s shield. Focus fire on him; he teleports as he takes damage. When he nears the summoning table, interact to trap him in the Summoning Key. If you fail, his shield returns and Keepers turn purple—interact with all four again to retry. Each shield break spawns a Margwa. Reborn Swords are handed to the Keepers during this step. This is the last step possible with fewer than four players (Swords are returned if not four players).',
      },
      {
        order: 7,
        label:
          '[Averting the Apocalypse] The giant Gateworm teleports to the center above ground. Zombies despawn; Margwa heads glow purple. Players get "infected" (magenta aura)—pass through white orb wisps to cleanse. Kill purple Margwas to reactivate random Beast Pedestals (at least 4 Margwas; each Pedestal is one-time use until another Margwa is killed). Three players shock the electrical boxes (cube-shaped, high on wall) at each of the three Tram Stations to power the rails (blue). The fourth player calls the Tram; when it hits the giant Gateworm, the three in Beast Mode shock the three Keepers in the center. The Keepers\' beams hit the Apothicon; cutscene plays. Richtofen takes the Summoning Key and leaves. Swords returned; Civil Protector upgraded. 1000 XP + 6000 XP (first-time Dark Ops).',
      },
    ],
  },
  {
    gameShortName: 'BO3',
    mapSlug: 'shadows-of-evil',
    name: 'Rocket Shield',
    slug: 'rocket-shield',
    type: 'BUILDABLE',
    xpReward: 0,
    videoEmbedUrl: 'https://www.youtube.com/embed/03k_5s-KTNU',
    description:
      'Buildable shield that can block and charge into zombies. Three parts: Eagle Plate, Fuel Canisters, and Screen. Built at a workbench. Can be upgraded to the Goddard Apparatus by ramming 10+ zombies with the shield charge 12 times in a row (bowling-pin sound when correct; streak resets if fewer than 10).',
    steps: [
      {
        order: 1,
        label:
          'Eagle Plate (Canal District): Against the window in the Smoke Lounge; or placed against the wall in the Smoke Lounge opposite the window.',
      },
      {
        order: 2,
        label:
          'Fuel Canisters (Waterfront District): Leaned against the window across from the Perk-a-Cola machine; or on the bridge leading to the Lounge; or to the left of the waterfront train station paid gate inside the lounge, leaning against an overturned coffee table.',
      },
      {
        order: 3,
        label:
          'Screen (Footlight District): Next to the Perk-a-Cola machine; or inside the tunnel to the Tram station, on a bench on the left side.',
      },
    ],
  },
  {
    gameShortName: 'BO3',
    mapSlug: 'shadows-of-evil',
    name: 'Apothicon Servant',
    slug: 'apothicon-servant',
    type: 'BUILDABLE',
    xpReward: 0,
    videoEmbedUrl: 'https://www.youtube.com/embed/y-TNAAYqRtw',
    description:
      'Wonder weapon that fires a portal to absorb zombies. One per game from building; copies can appear in the Mystery Box. Has four character-specific names (e.g. Mar-Astagua). Cannot be Pack-a-Punched normally; upgrade was cut (debug/Ephemeral Enhancement only).',
    steps: [
      {
        order: 1,
        label:
          'Margwa Heart: Dropped from Margwas. If ignored it disappears; the next Margwa killed will drop a new one.',
      },
      {
        order: 2,
        label:
          'Margwa Tentacle: Potentially awarded from the highest tier Harvest Pods.',
      },
      {
        order: 3,
        label:
          'Xenomatter: Potentially dropped from Parasites or Insanity Elementals after round 12.',
      },
    ],
  },
  {
    gameShortName: 'BO3',
    mapSlug: 'shadows-of-evil',
    name: 'Snakeskin Boots',
    slug: 'snakeskin-boots',
    type: 'MUSICAL',
    xpReward: 0,
    description:
      'Hold the use button while aiming at three small wooden radios to play "Snakeskin Boots". Instrumental: interact with any one radio twice, then single interact with the other two.',
    steps: [
      { order: 1, label: 'First radio: In the boxing gym at Waterfront, on a desk on the upper level.' },
      { order: 2, label: 'Second radio: At the entrance of the Ruby Rabbit (Canals District), to the left on a table.' },
      { order: 3, label: 'Third radio: At the train station of the Footlight District, on a bench. Hold use on all three to activate the song.' },
    ],
  },
  {
    gameShortName: 'BO3',
    mapSlug: 'shadows-of-evil',
    name: 'Cold Hard Cash',
    slug: 'cold-hard-cash',
    type: 'MUSICAL',
    xpReward: 0,
    description:
      'Collect three microphone parts and interact with the Show Stage at the Black Lace Burlesque (Footlight District) to play "Cold Hard Cash".',
    steps: [
      {
        order: 1,
        label: 'Wire: Under the stairs that lead from the Ruby Rabbit into the Canals, opposite the power box behind the Beast-only wall.',
      },
      {
        order: 2,
        label: 'Microphone Stand: At Nero Blackstone\'s lair, to the left of the bloody knife-throwing target.',
      },
      {
        order: 3,
        label: 'Microphone: In the Rift (Subway Station), next to a trash can near the portal that leads to Waterfront.',
      },
      {
        order: 4,
        label: 'Take all three parts to the Show Stage at the Black Lace Burlesque (Footlight District) and interact to play the song.',
      },
    ],
  },
  {
    gameShortName: 'BO3',
    mapSlug: 'shadows-of-evil',
    name: 'Goddard Apparatus (Shield Upgrade)',
    slug: 'goddard-apparatus',
    type: 'SIDE_QUEST',
    xpReward: 0,
    description:
      'Upgrade the Rocket Shield to the Goddard Apparatus (more durability, 4 charges instead of 3). Ramp into 10 or more zombies using the shield charge 12 times in a row. A bowling-pin strike sound plays when done correctly. Fewer than 10 zombies resets the streak. Breaking the shield does not reset the streak. In solo, the upgraded shield can be re-obtained where it was first crafted.',
    steps: [
      {
        order: 1,
        label: 'Use the Rocket Shield charge to ram into 10 or more zombies. Repeat 12 times in a row without failing (fewer than 10 = reset). Listen for the bowling-pin sound each time. The shield upgrades to the Goddard Apparatus.',
        buildableReferenceSlug: 'rocket-shield',
      },
    ],
  },
  {
    gameShortName: 'BO3',
    mapSlug: 'shadows-of-evil',
    name: 'Free Mega GobbleGum',
    slug: 'free-mega-gobblegum',
    type: 'SIDE_QUEST',
    xpReward: 0,
    description:
      'Every player can get a free mega GobbleGum. Throw four Widow\'s Wine grenades into the mouths of the four lions in the Canal District (room connected to Double Tap II). Each lion shows a gray sphere; take them with the use button. Place the spheres on a plate in a shop in the first room (hold use). After two rounds, hold use on the plate to eat the GobbleGums.',
    steps: [
      { order: 1, label: 'Throw a Widow\'s Wine grenade into each of the four lions\' mouths in the Canal District (room by Double Tap II).' },
      { order: 2, label: 'Collect the gray sphere from each lion with the use button. Place all spheres on the plate in a shop in the first room (hold use).' },
      { order: 3, label: 'After two rounds, hold the use button on the plate to eat the free mega GobbleGums.' },
    ],
  },
  {
    gameShortName: 'BO3',
    mapSlug: 'shadows-of-evil',
    name: 'Trip Mine Upgrade',
    slug: 'trip-mine-upgrade',
    type: 'SIDE_QUEST',
    xpReward: 0,
    description:
      'Upgrade the Trip Mines by triggering a trip mine near every Food Cart of one type. Devil-O-Donuts: 4 carts—holy sound when damaged; trip mine becomes Cream Cake, spreads cakes on detonation. Holly\'s Cream Cake: 3 carts—evil laugh (Samantha) when damaged; trip mine becomes Donut, spreads donuts on detonation.',
    steps: [
      {
        order: 1,
        label: 'Choose one path: Devil-O-Donuts (4 Food Carts) or Holly\'s Cream Cake (3 Food Carts). Trigger a trip mine near every Food Cart of that type. Devil-O-Donuts path: holy sound per cart; upgraded mine spreads cakes. Holly\'s Cream Cake path: evil laugh per cart; upgraded mine spreads donuts.',
      },
    ],
  },
  {
    gameShortName: 'BO3',
    mapSlug: 'shadows-of-evil',
    name: 'Docks Jumpscare',
    slug: 'docks-jumpscare',
    type: 'SIDE_QUEST',
    xpReward: 0,
    description:
      'After completing the rituals, zoom in with a sniper rifle at the buildings from the docks (where the boxing gym is). A picture of Ultimis Richtofen as a zombie (intro pose from The Giant) appears with a high-pitched scream. The same image appears in The Giant when teleporting.',
    steps: [
      {
        order: 1,
        label: 'Complete the four gateway rituals first. From the docks near the boxing gym, use a sniper rifle to zoom in at the buildings. The Richtofen zombie image and scream will trigger.',
      },
    ],
  },
  {
    gameShortName: 'BO3',
    mapSlug: 'shadows-of-evil',
    name: 'Noir Mode',
    slug: 'noir-mode',
    type: 'SIDE_QUEST',
    xpReward: 0,
    description:
      'Shoot the picture frame behind the boxing ring and interact with it to turn the map into black-and-white Noir mode.',
    steps: [
      {
        order: 1,
        label: 'Shoot the picture frame behind the boxing ring, then interact with it to activate Noir mode (black and white).',
      },
    ],
  },
  {
    gameShortName: 'BO3',
    mapSlug: 'shadows-of-evil',
    name: 'Picture Cipher',
    slug: 'picture-cipher',
    type: 'SIDE_QUEST',
    xpReward: 0,
    categoryTag: 'Cipher',
    description:
      'Shooting one of the pictures with the Crocuta (Pack-a-Punched Kuda) drops it to reveal a cipher. Shooting other pictures with any weapon also drops them and can reveal content.',
    steps: [
      {
        order: 1,
        label: 'Use the Crocuta (Pack-a-Punched Kuda) to shoot one of the pictures; it drops and can reveal a cipher. Other pictures can be shot with any weapon to drop them.',
      },
    ],
  },
  {
    gameShortName: 'BO3',
    mapSlug: 'shadows-of-evil',
    name: 'Sal DeLuca Reference',
    slug: 'sal-deluca-reference',
    type: 'SIDE_QUEST',
    xpReward: 0,
    description:
      'Next to the door between the Junction and spawn, an open window has a black suit with a tag. Throw a grenade so it hits the suit as it explodes (Widow\'s Wine makes this easier). The tag appears on a box in front of the window; it has Sal\'s signature. Hold use on it for 500 points.',
    steps: [
      {
        order: 1,
        label: 'Find the black suit in the window next to the Junction/spawn door. Throw a grenade so it hits the suit at explosion (Widow\'s Wine recommended). Pick up the tag from the box and hold use for 500 points.',
      },
    ],
  },
  {
    gameShortName: 'BO3',
    mapSlug: 'shadows-of-evil',
    name: 'Shadowman Round Skip',
    slug: 'shadowman-round-skip',
    type: 'SIDE_QUEST',
    xpReward: 0,
    description:
      'At the start, all players can shoot the Shadowman (visible on the staircase to Nero\'s ritual room by spawn) to skip to round 5, 10, then 15, gaining 1000, 4000, and 11000 points respectively.',
    steps: [
      {
        order: 1,
        label: 'All players shoot the Shadowman on the staircase to Nero Blackstone\'s ritual room near the starting area. First time: skip to round 5 (+1000). Second: round 10 (+4000). Third: round 15 (+11000).',
      },
    ],
  },
  // ——— The Giant (BO3) ———
  {
    gameShortName: 'BO3',
    mapSlug: 'the-giant',
    name: 'Paradoxical Prologue',
    slug: 'paradoxical-prologue',
    type: 'MAIN_QUEST',
    xpReward: 2500,
    videoEmbedUrl: 'https://www.youtube.com/embed/rKL_Gz-tcMo',
    description:
      'The Giant\'s main Easter Egg: a revised Fly Trap. With a Pack-a-Punched weapon, shoot the hidden panel near the mainframe and animal testing labs to light a beacon so Ludvig Maxis can locate Primis. Maxis speaks in place of Samantha. Find and shoot three hidden objects in new locations; then pick up the Annihilator from the furnace. Awards 1000 XP ("Paradoxical Prologue") and a Gateworm icon on The Giant\'s map selection. Ephemeral Enhancement, Wall Power, or Crate Power GobbleGums can activate the step without linking all teleporters.',
    rewardsDescription: '1000 XP, Gateworm icon on map select, Annihilator special weapon.',
    steps: [
      {
        order: 1,
        label:
          'With a Pack-a-Punched weapon, shoot the panel in the alleyway near the mainframe and animal testing labs (or throw a grenade while holding an upgraded weapon). Eight objects fly out; Ludvig Maxis speaks. Alternatively, use Ephemeral Enhancement, Wall Power, or Crate Power to activate without linking all teleporters.',
      },
      { order: 2, label: 'Shoot the Cymbal Monkey in the incinerator under Teleporter A.' },
      { order: 3, label: 'Shoot the Teddy Bear on top of the tallest balcony—look to the right of the power switch that leads to the balconies.' },
      { order: 4, label: 'Shoot the Teddy Bear in the well full of water beside Teleporter B (on the left as you enter the room).' },
      {
        order: 5,
        label:
          'After all three are found, Maxis says the beacon is lit. Go to the furnace and pick up the Annihilator revolver (any player can use it as a special weapon). Completing awards 1000 XP and the Gateworm icon.',
      },
    ],
  },
  {
    gameShortName: 'BO3',
    mapSlug: 'the-giant',
    name: 'Beauty of Annihilation',
    slug: 'beauty-of-annihilation',
    type: 'MUSICAL',
    xpReward: 0,
    description:
      'A remix of Beauty of Annihilation. Hold the use button on three green, glowing jars (with spines inside). Two jars are in the animal testing lab; the third is near Teleporter B, in a side room.',
    steps: [
      {
        order: 1,
        label: 'Activate all three green jars (two in Animal Testing Lab, one in side room near Teleporter B). Any order. Beauty of Annihilation remix plays when all three are done.',
      },
    ],
  },
  {
    gameShortName: 'BO3',
    mapSlug: 'the-giant',
    name: 'Secret Sixth Perk (Stamin-Up or Deadshot)',
    slug: 'secret-sixth-perk',
    type: 'SIDE_QUEST',
    xpReward: 0,
    description:
      'Reveal a sixth perk machine (Stamin-Up or Deadshot Daiquiri). Requires Monkey Bombs from the Mystery Box and all three teleporters linked to the Mainframe. Throw a Monkey Bomb onto a teleporter platform and teleport with a player. After returning to the mainframe, one of three lights on the panel by the mainframe turns from red to green. Repeat for all three teleporters; the panel becomes active. Interact with the red glowing button on the panel; the Giant Robot\'s head outside fires its eye beam at the welcome sign, melting a snow pile and revealing the perk machine.',
    steps: [
      { order: 1, label: 'Obtain Monkey Bombs from the Mystery Box and link all three teleporters to the Mainframe.' },
      {
        order: 2,
        label: 'Throw a Monkey Bomb onto a teleporter platform and teleport with a player. Return to the mainframe; one of the three lights on the panel by the mainframe turns from red to green. Repeat for the other two teleporters (one Monkey + teleport per teleporter).',
      },
      {
        order: 3,
        label: 'When all three lights are green, the panel is active. Interact with the red glowing button. The Giant Robot\'s head fires its eye beam at the welcome sign, melting the snow pile and revealing either Stamin-Up or Deadshot Daiquiri.',
      },
    ],
  },
  // ——— Der Eisendrache (BO3) ———
  {
    gameShortName: 'BO3',
    mapSlug: 'der-eisendrache',
    name: 'My Brother\'s Keeper',
    slug: 'my-brothers-keeper',
    type: 'MAIN_QUEST',
    xpReward: 6500,
    videoEmbedUrl: 'https://www.youtube.com/embed/v3v_IKfgf4U',
    description:
      'Primis assaults the Group 935 facility to capture Ultimis Dempsey for the Summoning Key and purge Group 935 (Groph at Griffin Station). Requires upgraded Bow(s) (one per player in co-op; all four in non-ranked), Ragnarok DG-4, and Death Ray activated at least once. Completable solo or any player count. Rewards: all perks on the map, My Brother\'s Keeper achievement, 2500 XP ("Frozen Freedom"), Gateworm icon.',
    rewardsDescription: 'All map perks (temporary until downed), My Brother\'s Keeper achievement, 2500 XP, Gateworm icon.',
    steps: [
      {
        order: 1,
        label:
          '[Beacons] Return upgraded Bow to box, get Wrath of the Ancients from Family Crypt. In Undercroft teleporter room, shoot each beacon/rod at the top until its end turns orange. When all are lit, Margwa sound plays; step is timed. Switch back to upgraded Bow.',
        buildableReferenceSlug: 'wrath-of-the-ancients',
      },
      {
        order: 2,
        label:
          '[Wisps] Eight objects can spark; four must be shot with an upgraded Bow (one sparking at a time, random). Locations: phone in Quick Revive office; truck tire near Double Tap II; box above Double Tap on way to Wundersphere; globe beside Samantha\'s room; phone on pillar near power/Bowie Knife (opposite side); clock in Barracks hallway; radio in Church corner from Speed Cola; clock above fireplace in Church. Shooting non-sparking or wrong bow = fail; wait next round. After four, audio cue completes step.',
      },
      {
        order: 3,
        label:
          '[Time Travel] Same round. Teleporter bottom light is purple; all players enter to go to the past. In lab: pick up blue canister (left corner near Groph), pick up small fuses (wooden box right of teleporter), memorize three safe symbols (top to bottom). Return automatically; Panzer may spawn. Add fuse to Death Ray (clock tower side), switch Death Ray to "Protect". At terminal near Clock Tower enter the three symbols to open safe; get two large fuses and key card from safe (no prompt). Wrong code = redo Steps 2 and 3.',
      },
      {
        order: 4,
        label:
          '[Memory Game] Insert large fuses into Tesla coils on Death Ray (where two currents run), set Death Ray back to "Destroy". At terminal (outside Clock Tower or Rocket Platform) interact to start game: memorize four symbols on bottom screens, then interact with screen that matches the symbol shown on top. Repeat until success. Do the same at the other terminal. Fail on second terminal = replay both.',
      },
      {
        order: 5,
        label:
          '[Sabotage] Interact with green button on back of Death Ray. Rocket falls and hits Clock Tower bell; rocket lands in Upper Courtyard. Pick up Vril Generator next to crashed rocket in the snow (no prompt). Groph locks Dempsey\'s cryopod with lightning.',
      },
      {
        order: 6,
        label:
          '[MPD from Moon] Redo Step 2 (wisps) to turn teleporter purple again. Teleport to past; use key card on computer left of Kronorium to open case; take stone tablet. In Family Crypt place Vril Generator in slot below knight; ghostly Keeper spawns, Hellhounds spawn (no points). Keeper stops at four spots (random order): church courtyard by Mystery Box; next to Mule Kick; by knight armors down hall from power; next to Double Tap II (interact wall under lamp to place tablet). At each spot stand in white circle; colored tint = which Bow to use (Storm=blue, Wolf=teal, Fire=orange, Demon=purple). Get kills with that Bow in circle to fill tablet. At Double Tap spot place stone slab in slot left of Keeper first. After all four, Keeper becomes corporeal, goes to Undercroft, teleports MPD from Moon. Place soul canister from Step 3 in empty MPD corner; corrupted Keeper appears. Each player places Ragnarok DG-4 on blue tile to enter boss room.',
        buildableReferenceSlug: 'ragnarok-dg-4',
      },
      {
        order: 7,
        label:
          '[Keeper Boss] Phases 1–5: skull rain (shoot to destroy), Skeletons, damage mounds, electric shock-wave (hide behind blue pillars). When electric ball under Keeper appears, run in and place Ragnarok trap to expose chest weak spot; shoot rend. Phase 2/4: kill Panzersoldats. Phase 3/5: repeat Phase 1 + Hellhounds. Phase 5 co-op: Panzer per shock-wave. Defeat Keeper (final scream/spin).',
        buildableReferenceSlug: 'ragnarok-dg-4',
      },
      {
        order: 8,
        label:
          '[Sky Destruction] At MPD interact with blue circle (Vril shape); pick up Summoning Key. Take Key to Memory Game terminal outside Clock Tower; interact. Key charges; cutscene: rockets destroy Moon (Groph). Ending: Richtofen uses Key on Ultimis Dempsey; Primis Dempsey kills his Ultimis self; soul absorbed into Key.',
      },
    ],
  },
  {
    gameShortName: 'BO3',
    mapSlug: 'der-eisendrache',
    name: 'Ragnarok DG-4',
    slug: 'ragnarok-dg-4',
    type: 'BUILDABLE',
    xpReward: 0,
    videoEmbedUrl: 'https://www.youtube.com/embed/1Y94XgLzrQ0',
    description:
      'Specialist wonder weapon: slam creates electric shock wave; can be placed as lightning trap. Required for My Brother\'s Keeper (boss fight and MPD step) and for the Plunger. Death Ray must be activated at least once to build.',
    steps: [
      { order: 1, label: 'Panzersoldat drop: Kill the first Panzersoldat; it drops the part (like Fire Staff on Origins). If missed, the next Panzer killed drops it again.' },
      {
        order: 2,
        label:
          'Rocket Test console: During a Rocket Test, bottom of left staircase behind the rocket (closest to Wundersphere) has a lever; activate it (red light turns green), which lights the console right of the Teleporter. Survive in the tunnel until all three console lights are green and not blinking (test finished), then interact with the console quickly—the part spawns in the teleporter. The Death Machine switch in the Undercroft also starts a Rocket Test.',
      },
      {
        order: 3,
        label:
          'Bastion midair pickup: In the Bastion (Death Ray on at least once), the piece floats above the area. Use the Wundersphere from Upper Courtyard or Lower Courtyard second floor (past workbench, Gate Trap room ceiling); press Interact midair to grab the piece.',
      },
    ],
  },
  {
    gameShortName: 'BO3',
    mapSlug: 'der-eisendrache',
    name: 'Rocket Shield',
    slug: 'rocket-shield',
    type: 'BUILDABLE',
    xpReward: 0,
    videoEmbedUrl: 'https://www.youtube.com/embed/rt_x9wqj1o4',
    description:
      'Buildable shield. Three parts: Eagle Plate (Upper Courtyard), Screen (Undercroft—requires Anti-Gravity), Fuel Canisters (Lower Courtyard).',
    steps: [
      {
        order: 1,
        label:
          'Eagle Plate (Upper Courtyard): On ground by crates next to window right of first-floor Mission Control entrance; or floor left of corpse at desk, first floor Clock Tower (Radio Room); or left side of stairs to Clock Tower/Landing Pad, leaning on wooden barrels.',
      },
      {
        order: 2,
        label:
          'Screen (Undercroft, Anti-Gravity): Above Pack-a-Punch teleporter platform on wall (double jump + wallrun); or above doorway to Rocket Test Teleporter, below "eye" glyph (double jump); or on metal rings by Pyramid, next to Keeper statue (double jump from workbench, face Pyramid, up and left).',
      },
      {
        order: 3,
        label:
          'Fuel Canisters (Lower Courtyard): On crates immediately right when entering from Double Tap, beside window; or bottom right of small staircase by window, leaning on crates; or from Landing Pad second floor, stairs to Death Ray—base of second set of stairs, left side on stone wall.',
      },
    ],
  },
  {
    gameShortName: 'BO3',
    mapSlug: 'der-eisendrache',
    name: 'Wrath of the Ancients',
    slug: 'wrath-of-the-ancients',
    type: 'BUILDABLE',
    xpReward: 0,
    videoEmbedUrl: 'https://www.youtube.com/embed/4uwLSOEVsh8',
    description:
      'Base bow wonder weapon. Feed three dragon heads 8 zombies each (kill near statue; dragon levitates and consumes one corpse at a time). Dragons: courtyard above tunnel to lab (Double Tap area); Mission Control above fireplace (Speed Cola); Undercroft Pyramid room across from crafting bench. When all three crumble, grab bow from room above Undercroft (knight resting, floating above crate).',
    steps: [
      { order: 1, label: 'Dragon 1: Courtyard near Double Tap, above tunnel to underground lab. Kill 8 zombies near it (one at a time consumed).' },
      { order: 2, label: 'Dragon 2: Mission Control (Speed Cola), back of room above fireplace. Feed 8 zombies.' },
      { order: 3, label: 'Dragon 3: Undercroft Pyramid room, across from crafting bench. Feed 8 zombies.' },
      { order: 4, label: 'Pick up bow: When all three have crumbled, go to room above Undercroft (Family Crypt); Wrath of the Ancients floats above crate—pick it up.' },
    ],
  },
  {
    gameShortName: 'BO3',
    mapSlug: 'der-eisendrache',
    name: 'Storm Bow',
    slug: 'storm-bow',
    type: 'BUILDABLE',
    xpReward: 0,
    videoEmbedUrl: 'https://www.youtube.com/embed/cMRBJ2p_2KE',
    description:
      'Upgraded bow: electricity ball and swirling storm. Shoot weathervane at Bastion (lightning tower); get broken arrow. Light three bonfires outside map with Wrath of the Ancients. During Anti-Gravity, wallrun over all five wind hexagons in Undercroft in one go. Fill three urns with 5 souls each; draw bow near urn to electrify arrow, shoot each bonfire. Place arrow in blue fog by weathervane for reforged arrow. Place on lightning shrine in Undercroft; 20 kills in front of shrine, then place bow in shrine.',
    steps: [
      { order: 1, label: 'Broken arrow: Shoot weathervane on small tower (lightning symbol) at Bastion facing Clock Tower; collect broken arrow.' },
      { order: 2, label: 'Light three bonfires: Castle turret (from Clock Tower exit or Mule Kick room); ridge from KRM-262/Double Tap area; cliffside at Rocket Platform (or from room above Double Tap out window).' },
      { order: 3, label: 'Wallrun hexagons: Stand on all 4 tiles around Pyramid to activate Anti-Gravity; wallrun over all five elongated wind hexagons in one go.' },
      { order: 4, label: 'Fill urns: Room above Double Tap (workbench and L-CAR 9); Rocket Platform tunnel across from teleporter; Clock Tower ground floor under spiral stairs. 5 souls each.' },
      { order: 5, label: 'Electrify bonfires: Draw bow near filled urn to electrify arrow; shoot each bonfire (lightning circles flames). Place arrow in blue fog by weathervane; collect reforged arrow.' },
      { order: 6, label: 'Shrine and upgrade: Place reforged arrow on lightning shrine next to Pyramid. 20 kills in front of shrine (stairs/square around Pyramid); place Wrath of the Ancients in shrine for Storm Bow.' },
    ],
  },
  {
    gameShortName: 'BO3',
    mapSlug: 'der-eisendrache',
    name: 'Wolf Bow',
    slug: 'wolf-bow',
    type: 'BUILDABLE',
    xpReward: 0,
    videoEmbedUrl: 'https://www.youtube.com/embed/gLQolURWJhc',
    description:
      'Upgraded bow: wolves from impact, slow effect. Interact with four paintings in order: Wolf King on throne; Wolf King on horse with helmet; mountain with castle and lightning; Wolf King slouched with Arthur. Painting locations random each game (Trophy Room, Clock Tower before stairs, barrier Samantha/power, Control Room balcony). Then Undercroft wolf glyph crumbles—get broken arrow. Shoot red flag at base on cliff above blast doors (Rocket Platform) for blue canine skull. Place skull in Wolf box by Pyramid; follow wolf to three dig spots, kill ~10 zombies per spot, collect bones. Wallrun to platform by large hole, interact with coffin for reforged arrow. 20 kills on Pyramid stairs/ground, place bow in box.',
    steps: [
      { order: 1, label: 'Paintings: Interact in order—Wolf King throne; Wolf King horse; mountain/castle lightning; Wolf King with Arthur. Locations: Trophy Room, Clock Tower, barrier Samantha/power, Control Room balcony (random each game).' },
      { order: 2, label: 'Broken arrow and skull: Undercroft via Family Crypt; wolf symbol near Pyramid crumbles—collect broken arrow. Shoot red flag at base (Rocket Platform, cliff above blast doors); pick up blue canine skull.' },
      { order: 3, label: 'Follow wolf: Place canine skull in Wolf box by Pyramid. Follow wolf to three dig spots (Upper Courtyard; outside spawn before Gate Trap; Undercroft by Pack-a-Punch). Kill ~10 zombies per spot, collect bones.' },
      { order: 4, label: 'Coffin and upgrade: Wallrun until double wolf symbol above crack; shoot with bow to build platform. Land, interact with coffin for reforged arrow. 20 kills on Pyramid stairs/lower ground, place Wrath of the Ancients in Wolf box.' },
    ],
  },
  {
    gameShortName: 'BO3',
    mapSlug: 'der-eisendrache',
    name: 'Void Bow',
    slug: 'void-bow',
    type: 'BUILDABLE',
    xpReward: 0,
    videoEmbedUrl: 'https://www.youtube.com/embed/XxslPcDQXv4',
    description:
      'Upgraded bow: skulls and portal. Shoot Demon Gate glyph on slanted ceiling in Gate Trap room (Double Tap); get broken arrow. Trophy Room: melee kill zombie on glowing purple tile to reveal urn; interact urn for summoning circle. Return six Keeper skulls to circle (L-CAR 9 path; Upper Courtyard windowsill; Samantha\'s room toy chest; Double Tap shelves; Undercroft teleporter sink; Rocket Platform truck bed). Lead six crawler zombies into circle. Demon states three crests (Griffin, Heart, Door, Stag, Crown, Horn); match to armor pedestals in T-hallway; kill zombies for glyph drops. Shoot three correct glyphs in order on circle floor with bow to reforge arrow. Place in Demon box by Pyramid; souls then interact glyph to complete.',
    steps: [
      { order: 1, label: 'Broken arrow: Gate Trap room (Double Tap)—shoot Demon glyph on slanted ceiling between iron gates; collect broken arrow.' },
      { order: 2, label: 'Urn and skulls: Trophy Room—melee zombie on glowing purple tile; interact urn. Collect six Keeper skulls (L-CAR 9; Upper Courtyard; Samantha\'s room; Double Tap; Undercroft sink; Rocket Platform truck).' },
      { order: 3, label: 'Crawler sacrifices: Lead six crawler zombies into summoning circle (Crawl Space GobbleGum, grenades, or Wrath uncharged from round 18).' },
      { order: 4, label: 'Glyphs: Demon names three crests; check armor pedestals in T-hall (Samantha, power, Church). Kill zombies for glyph drops; shoot three correct glyphs in order on circle with bow to reforge arrow.' },
      { order: 5, label: 'Upgrade at Pyramid: Place reforged arrow in Demon box by Pyramid; fill with souls, then interact glyph for Void Bow.' },
    ],
  },
  {
    gameShortName: 'BO3',
    mapSlug: 'der-eisendrache',
    name: 'Fire Bow',
    slug: 'fire-bow',
    type: 'BUILDABLE',
    xpReward: 0,
    videoEmbedUrl: 'https://www.youtube.com/embed/2uiPy-gJUiE',
    description:
      'Upgraded bow: lava burst and volcanic mounds. Clock Tower spiral staircase top: shoot red symbol with bow for broken arrow pieces. Rocket Platform: after Rocket Test, shoot glowing orange rock on small building (VMP wall buy). Light three rings midair via Wundersphere: by spawn (KRM-262/Double Tap); Bastion between Death Ray and Wundersphere; outside Clock Tower toward Bastion. Stand in each ring and kill zombies (orange orbs). Clock Tower: interact by clockwork for cuneiform—one of three fireplaces (Control Room dragon, Samantha\'s room, Lower Courtyard Supply Room). Chain 4 or fewer shots from lit ring to fireplace (stand in ring/mound, shoot ground toward fireplace); interact lit fireplace. Interact under sun fireball by Death Ray for reforged arrow. Place in volcanic box by Pyramid; 20 kills, interact box.',
    steps: [
      { order: 1, label: 'Broken arrow: Clock Tower spiral stairs top—shoot red symbol with Wrath of the Ancients; collect broken arrow pieces.' },
      { order: 2, label: 'Rocket Platform and rings: After Rocket Test shoot glowing orange rock above VMP building. Light three rings while midair (Wundersphere): spawn; Bastion; outside Clock Tower.' },
      { order: 3, label: 'Fireplace chain: Stand in each lit ring and kill zombies (player in ring). Interact clockwork in Clock Tower for cuneiform—identify fireplace; chain shots from ring/mound to that fireplace (4 or fewer), interact fireplace.' },
      { order: 4, label: 'Reforged arrow and upgrade: Interact under sun fireball by Death Ray for reforged arrow. Place in volcanic box by Pyramid; 20 kills near box, interact box for Fire Bow.' },
    ],
  },
  {
    gameShortName: 'BO3',
    mapSlug: 'der-eisendrache',
    name: 'Dead Again',
    slug: 'dead-again',
    type: 'MUSICAL',
    xpReward: 0,
    description: 'Hold the interact button in front of three Teddy Bears to play "Dead Again".',
    steps: [
      { order: 1, label: 'Teddy 1: Samantha\'s bedroom, sitting on a chair.' },
      { order: 2, label: 'Teddy 2: Cell opposite the cell with Juggernog, on a crate.' },
      { order: 3, label: 'Teddy 3: Right of rocket launch pad (from blast doors), passenger seat of one of the trucks. Hold use on all three.' },
    ],
  },
  {
    gameShortName: 'BO3',
    mapSlug: 'der-eisendrache',
    name: 'Samantha\'s Lullaby (modified)',
    slug: 'samanthas-lullaby',
    type: 'MUSICAL',
    xpReward: 0,
    description: 'Modified version of Samantha\'s Lullaby. Hold use on the music box in Samantha\'s bedroom (table next to the bed).',
    steps: [{ order: 1, label: 'In Samantha\'s bedroom, hold use on the music box on the table next to the bed.' }],
  },
  {
    gameShortName: 'BO3',
    mapSlug: 'der-eisendrache',
    name: 'Dies Irae',
    slug: 'dies-irae',
    type: 'MUSICAL',
    xpReward: 0,
    description: 'Excerpt from Anton Reicha\'s Requiem. Hold use on three gramophones.',
    steps: [
      { order: 1, label: 'Samantha\'s bedroom, on shelf facing opposite the teddy bear.' },
      { order: 2, label: 'Control room, on a chair.' },
      { order: 3, label: 'Pyramid room, facing the staircase to the crypt. Hold use on all three.' },
    ],
  },
  {
    gameShortName: 'BO3',
    mapSlug: 'der-eisendrache',
    name: 'Control Room Disco',
    slug: 'control-room-disco',
    type: 'MUSICAL',
    xpReward: 0,
    description:
      'Shoot the Moon globe to suspend it; then shoot the small rocket when beside it. Disco lights and 80s soundtrack play in the Control Room for about a minute. Repeatable. Only visible/audible to players inside the globe room.',
    steps: [
      { order: 1, label: 'In the Control Room (globe room), shoot the Moon globe to stop its movement.' },
      { order: 2, label: 'Shoot the small rocket when it is beside the globe. Disco lights and music start; lasts ~1 minute. Can be repeated.' },
    ],
  },
  {
    gameShortName: 'BO3',
    mapSlug: 'der-eisendrache',
    name: 'Plunger',
    slug: 'plunger',
    type: 'SIDE_QUEST',
    xpReward: 0,
    videoEmbedUrl: 'https://www.youtube.com/embed/xsAcbMen9KI',
    description:
      'Melee weapon (same damage as knife). Obtain via time travel: place Ragnarok DG-4 as a trap behind the clock, start the clock from the switch inside the clock tower, stop the clock at 9:35. An orb appears above the pyramid in the Undercroft. During anti-gravity, wall run onto the circle to the right of the Pyramid room entrance to teleport to the past; pick up the Plunger next to the desk (opposite the safe, right of the teleporter). Return to present with the Plunger. Upgrade: kill a Panzersoldat to get a flammable Plunger for one minute—one-hit kill on any zombie including Panzers. Can be re-upgraded after the minute ends.',
    steps: [
      { order: 1, label: 'Build and equip the Ragnarok DG-4. Place it as a trap behind the clock in the clock tower.', buildableReferenceSlug: 'ragnarok-dg-4' },
      { order: 2, label: 'Hold the use button on the switch inside the clock tower to start the clock. Stop the clock at 9:35 (player who wants the Plunger does this).' },
      { order: 3, label: 'An orb appears above the pyramid in the Undercroft. Wait for an anti-gravity sequence, then wall run onto the circle to the right of the Pyramid room entrance until you are teleported to the past.' },
      { order: 4, label: 'In the past, pick up the Plunger next to the desk (opposite the safe, to the right of the teleporter). You return to the present with the Plunger as your melee weapon.' },
      { order: 5, label: 'Upgrade: Kill a Panzersoldat with the Plunger to get the flammable Plunger for one minute (one-hit kill on any zombie including Panzers). Re-upgrade by killing another Panzer after the minute ends.' },
    ],
  },
  {
    gameShortName: 'BO3',
    mapSlug: 'der-eisendrache',
    name: 'Skeleton Zombies',
    slug: 'skeleton-zombies',
    type: 'SIDE_QUEST',
    xpReward: 0,
    description:
      'With GobbleGum "In Plain Sight" see three invisible floating skulls. Shoot each with the Wrath of the Ancients (splash works). Skulls appear on chair in Control Room by fireplace. When all three hit, new zombies spawn as skeletons. Interact with skulls on chair to disable.',
    steps: [
      {
        order: 1,
        label: 'Use In Plain Sight. Shoot three invisible skulls with Wrath of the Ancients: ledge near Double Tap; ledge near Mule Kick; Upper Courtyard above door to Control Room. Each appears on chair in Control Room. All three = skeleton zombies. Interact chair to disable.',
        buildableReferenceSlug: 'wrath-of-the-ancients',
      },
    ],
  },
  {
    gameShortName: 'BO3',
    mapSlug: 'der-eisendrache',
    name: 'Newspaper (Plunger)',
    slug: 'newspaper-plunger',
    type: 'SIDE_QUEST',
    xpReward: 0,
    description:
      'On a table in the Control Room, a newspaper initially talks about a parade in London. Kill zombies with the upgraded (flammable) Plunger near the newspaper; the headline changes first to a possible zombie presence (unclear), then to a large outbreak with Parliament setting up a meeting to confront the crisis.',
    steps: [
      {
        order: 1,
        label: 'Use the upgraded (flammable) Plunger to kill zombies near the newspaper on the table in the Control Room. The headline progresses: parade in London → possible zombies (unclear) → large outbreak and Parliament meeting to confront the crisis.',
        buildableReferenceSlug: 'plunger',
      },
    ],
  },
  {
    gameShortName: 'BO3',
    mapSlug: 'der-eisendrache',
    name: 'Free Mega GobbleGum',
    slug: 'free-mega-gobblegum',
    type: 'SIDE_QUEST',
    xpReward: 0,
    description:
      'In teleporter room, interact with plant pot to pick it up. Travel to the past (via Wisps step of main quest or when upgrading the Plunger). Put the plant pot back in its original place. Return to present; interact with the grown plant for a free GobbleGum.',
    steps: [
      { order: 1, label: 'In the teleporter room, interact with the plant pot to pick it up.' },
      { order: 2, label: 'Travel to the past (complete Wisps step and Time Travel, or during Plunger upgrade). Place the plant pot back in its original spot.' },
      { order: 3, label: 'Return to the present; interact with the grown plant to receive a free Mega GobbleGum.' },
    ],
  },
  // ——— Kino der Toten (BO1) ———
  {
    gameShortName: 'BO1',
    mapSlug: 'kino-der-toten',
    name: 'Film Reels',
    slug: 'film-reels',
    type: 'SIDE_QUEST',
    xpReward: 0,
    description: 'Collect film reels from the random teleporter rooms and play them in the Projector room for voice notes from Ludvig Maxis. Up to three reels per match across four possible rooms.',
    steps: [
      {
        order: 1,
        label: 'Reach the Projector room and use the teleporter. You can be sent to one of four rooms; a film reel (Group 935 logo) may appear. Up to three reels spawn per game across these rooms.',
      },
      {
        order: 2,
        label: 'Reel locations: Samantha\'s room (table, bed, or rocking chair); Samantha\'s room destroyed (bed, overturned table, near window); Dentist\'s Office (cart by chair or counters); Conference Room (TV, under projector, or table). Use the action button to pick up a reel.',
      },
      {
        order: 3,
        label: 'With a reel in hand, teleport again and use the action button on the projector to insert the reel and play the Maxis clip.',
      },
    ],
  },
  {
    gameShortName: 'BO1',
    mapSlug: 'kino-der-toten',
    name: '115',
    slug: '115',
    type: 'MUSICAL',
    xpReward: 0,
    description: 'Interact with three hidden rocks to activate the song 115.',
    steps: [
      { order: 1, label: 'Near spawn: rock in a jar in the corner by the bottom window.' },
      { order: 2, label: 'Dressing room: rock on the black table near a window, behind two mannequins.' },
      { order: 3, label: 'Storage room: rock on a shelf next to one of the windows.' },
    ],
  },
  {
    gameShortName: 'BO1',
    mapSlug: 'kino-der-toten',
    name: 'Radios',
    slug: 'radios',
    type: 'SIDE_QUEST',
    xpReward: 0,
    description: 'Two hidden radios. Activate by shooting or throwing an explosive; the second is activated by interacting.',
    steps: [
      { order: 1, label: 'Radio 1: Inside the chandelier in the theater. Shoot or throw an explosive at it.' },
      { order: 2, label: 'Radio 2: Top of the tower visible from the alley through the barrier next to Double Tap Root Beer. Interact with it to activate.' },
    ],
  },
  // ——— Five (BO1) ———
  {
    gameShortName: 'BO1',
    mapSlug: 'five',
    name: "Won't Back Down",
    slug: 'wont-back-down',
    type: 'MUSICAL',
    xpReward: 0,
    description: 'The song "Won\'t Back Down" by Eminem can be played by interacting with three red telephones on this map.',
    steps: [
      { order: 1, label: 'At the start of the game, close to Quick Revive.' },
      { order: 2, label: 'On a desk in the same room as the power switch.' },
      { order: 3, label: 'In the Panic Room, on a table next to a barrier.' },
    ],
  },
  // ——— Ascension (BO1) ———
  {
    gameShortName: 'BO1',
    mapSlug: 'ascension',
    name: 'Casimir Mechanism',
    slug: 'main-quest',
    type: 'MAIN_QUEST',
    xpReward: 4000,
    playerCountRequirement: 'SQUAD',
    videoEmbedUrl: 'https://www.youtube.com/embed/RMKLm02BevE?si=vcsF3IenZXx-5pZk',
    description: 'Repair the Casimir Mechanism to free Anton Gersh. Requires: Gersh Device, Porter\'s X2 Ray Gun, Zeus Cannon, Matryoshka Dolls, and four players.',
    steps: [
      {
        order: 1,
        label: 'Node 1: Get the Gersh Device from the Mystery Box (it can appear in the box rotation). In the area with the MP5K/RK5 and PhD Flopper, look out from the map to the left of the MP5K/RK5—you\'ll see rubble and a power generator with a glowing white light. From the far back of the PhD Flopper room you can hear a high-pitched whistling. Throw the Gersh Device onto the generator (if it bounces it\'s okay; if it lands too far, Samantha giggles and the device is lost). The generator is sucked into the black hole. Gersh will urge you to hurry. Go to the lunar pad closest to Stamin-Up. In the corner of that room is a large terminal with a bright screen and the same whistling. Press and hold the use button to activate it; the screen shows part of the eye of providence. The pod (by the claymores near Stamin-Up) will show one light. A message confirms Node 1.',
      },
      {
        order: 2,
        label: 'Node 2: Must be done during a Space Monkey round with all four players. Space monkey rounds occur every 4–7 rounds after power is on and at least one player has bought a perk. Four small red switches appear near the perk machines (not Quick Revive or Mule Kick): Juggernog—opposite the machine; PhD Flopper—left of the machine; Speed Cola—on the other side of the door frame; Stamin-Up—left of the machine. Locate them by the same whistling sound. All four players must press their switch at the same time (within about a second); one player can count down from three. Success: beeping and message, pod shows two lights. Failure: buzzing.',
      },
      {
        order: 3,
        label: 'Node 3: At the end of a round, leave a couple of slow crawlers so they don\'t interrupt. The rocket must already be launched (Pack-a-Punch room unlocked). Lead the crawlers as far away as possible (e.g. to Stamin-Up). All players gather in front of the clock on the left wall (showing 12:00) in the room just before the Pack-a-Punch machine. This starts a two-minute countdown. All players must stay on the pressure plate for the full two minutes without shooting or throwing grenades. When the two minutes are up, an explosion (like a Nuke) ends the round. Pod shows three lights.',
      },
      {
        order: 4,
        label: 'Node 4: Leave crawlers again. Letters float above the map in random order; collect them in order to spell "LUNA" using the Lunar Landers. Have the lander at spawn. One player stands on the lander; another goes to the lunar pad near Stamin-Up and calls the lander. The player on the lander flies over and collects "L". Call the lander back to spawn—player on board collects "U". Call the lander to the pad near Speed Cola and Sickle—player collects "N". Call to the pad near Stamin-Up again—player collects "A". All four lights on the pod.',
      },
      {
        order: 5,
        label: 'Node 5: Pod is next to the claymores in the Lunar Lander room by Stamin-Up; it now has all four lights. You\'ll hear the howling; a small glowing orb is on the ground. One player throws the Gersh Device to create the black hole. Shoot the black hole with the Porter\'s X2 Ray Gun and two Zeus Cannon shots, and use Matryoshka Dolls. When done, Gersh thanks the players; everyone gets a 90-second Death Machine. Screen goes black and white as Samantha screams, then returns to color. Easter egg complete.',
      },
    ],
  },
  {
    gameShortName: 'BO1',
    mapSlug: 'ascension',
    name: 'Abracadavre',
    slug: 'abracadavre',
    type: 'MUSICAL',
    xpReward: 0,
    description: 'The song Abracadavre can be activated by interacting with three Teddy Bears holding a sickle located around the map.',
    steps: [
      { order: 1, label: 'Centrifuge Room: Go up the stairs, turn right; at the end of that walkway is the first bear.' },
      { order: 2, label: 'Near the Lunar Lander closest to Stamin-Up: there is a gate; under the red star is a teddy bear.' },
      { order: 3, label: 'Near the Lunar Lander past Speed Cola: a teddy bear is sitting on top of a wall.' },
    ],
  },
  {
    gameShortName: 'BO1',
    mapSlug: 'ascension',
    name: 'Matryoshka Dolls',
    slug: 'matryoshka-dolls',
    type: 'SIDE_QUEST',
    xpReward: 0,
    description: 'Matryoshka Dolls of the characters are scattered around the map. Press the action button on each to hear character-specific dialogue.',
    steps: [
      { order: 1, label: 'Dempsey: On top of the flaming barrels directly left of the Claymores.' },
      { order: 2, label: 'Nikolai: On top of the shelf directly to the left of Speed Cola.' },
      { order: 3, label: 'Takeo: On the shelf directly to the left of PhD Flopper.' },
      { order: 4, label: 'Richtofen: In the room directly below the Stakeout, on a large table in a corner.' },
    ],
  },
  {
    gameShortName: 'BO1',
    mapSlug: 'ascension',
    name: 'Red Telephones',
    slug: 'red-telephones',
    type: 'SIDE_QUEST',
    xpReward: 0,
    description: 'Three red telephones are scattered around the map. Every 120–300 seconds one phone rings for 10 seconds; answer with the action button to hear a character from "Five" (Kennedy, Nixon, or Castro).',
    steps: [
      { order: 1, label: 'To the left of the lunar lander in the centrifuge room, between multiple fuse boxes. When answered, President Kennedy can be heard ("Need some beans for the chowder here!") and dry firing.' },
      { order: 2, label: 'To the left of the power switch, through the chain link fence, down the stairs, turn right, to the left of the Mystery Box spawn. When answered, Nixon fires (FN FAL) and howls like a wolf.' },
      { order: 3, label: 'Just to the right of the PhD Flopper machine. When answered, Fidel Castro says "Come to me, the revolution dies without Fidel Castro."' },
    ],
  },
  {
    gameShortName: 'BO1',
    mapSlug: 'ascension',
    name: 'Sparky Easter Egg',
    slug: 'sparky-easter-egg',
    type: 'SIDE_QUEST',
    xpReward: 0,
    description: 'A pair of car batteries under a stairwell in the centrifuge/spawn room have the Cyrillic inscription "ЅРДЯКУ", referencing developer Alejandro Romo ("Sparky").',
    steps: [
      { order: 1, label: 'Underneath the stairwell in the centrifuge/spawn room, find the car batteries with the Cyrillic text on the front.' },
    ],
  },
  {
    gameShortName: 'BO1',
    mapSlug: 'ascension',
    name: 'Rocket Destruction',
    slug: 'rocket-destruction',
    type: 'SIDE_QUEST',
    xpReward: 0,
    description: 'When the rocket is launched, it can be destroyed with a high-damage explosive weapon (e.g. Ray Gun or China Lake). A Double Points power-up spawns below it.',
    steps: [
      { order: 1, label: 'Launch the rocket, then shoot it with the Ray Gun, China Lake, or similar high-damage explosive before it leaves. Destroying it causes a Double Points power-up to spawn below.' },
    ],
  },
  // ——— Ascension (BO3 Zombie Chronicles) ———
  {
    gameShortName: 'BO3',
    mapSlug: 'bo3-ascension',
    name: 'Casimir Mechanism',
    slug: 'main-quest',
    type: 'MAIN_QUEST',
    xpReward: 4000,
    playerCountRequirement: 'SQUAD',
    videoEmbedUrl: 'https://www.youtube.com/embed/RMKLm02BevE?si=vcsF3IenZXx-5pZk',
    description: 'Repair the Casimir Mechanism to free Anton Gersh. Requires: Gersh Device, two Porter\'s Mark II Ray Guns (or one X2), Zeus Cannon, Matryoshka Dolls, and four players. Completing rewards all Perk-a-Colas.',
    steps: [
      {
        order: 1,
        label: 'Node 1: Get the Gersh Device from the Mystery Box (it can appear in the box rotation). In the area with the RK5 and Widow\'s Wine, look out to the left of the RK5—you\'ll see rubble and a power generator with a glowing white light. From the far back of the Widow\'s Wine room you can hear a high-pitched whistling. Throw the Gersh Device onto the generator (if it bounces it\'s okay; if it lands too far, Samantha giggles and the device is lost). The generator is sucked into the black hole. Gersh will urge you to hurry. Go to the lunar pad closest to Stamin-Up. In the corner of that room is a large terminal with a bright screen and the same whistling. Press and hold the use button to activate it; the screen shows part of the eye of providence. The pod (by the claymores near Stamin-Up) will show one light. A message confirms Node 1.',
      },
      {
        order: 2,
        label: 'Node 2: Must be done during a Space Monkey round with all four players. Space monkey rounds occur every 4–7 rounds after power is on and at least one player has bought a perk. Four small red switches appear near the perk machines (not Quick Revive or Mule Kick): Juggernog—opposite the machine; Widow\'s Wine—left of the machine; Speed Cola—on the other side of the door frame; Stamin-Up—left of the machine. Locate them by the same whistling sound. All four players must press their switch at the same time (within about a second). Success: beeping and message, pod shows two lights. Failure: buzzing.',
      },
      {
        order: 3,
        label: 'Node 3: At the end of a round, leave a couple of slow crawlers. The rocket must already be launched. Lead the crawlers as far away as possible (e.g. to Stamin-Up). On BO3, crawlers can respawn as full zombies if you\'re far enough—Idle Eyes GobbleGum is useful. All players gather in front of the clock (12:00) on the left wall in the room just before Pack-a-Punch. Stay on the pressure plate for the full two minutes without shooting or throwing grenades. When time is up, an explosion ends the round. Pod shows three lights.',
      },
      {
        order: 4,
        label: 'Node 4: Leave crawlers again. Collect the floating letters in order to spell "LUNA" using the Lunar Landers. Lander at spawn: one player on board, another calls to the pad near Stamin-Up→ collect "L". Call back to spawn→ collect "U". Call to pad near Speed Cola/Sickle→ collect "N". Call to pad near Stamin-Up→ collect "A". All four lights on the pod.',
      },
      {
        order: 5,
        label: 'Node 5: Pod (next to claymores by Stamin-Up) has all four lights; you\'ll hear the howling and see a small glowing orb. One player throws the Gersh Device. Shoot the black hole with Porter\'s Mark II Ray Gun shots (two guns or one X2) and two Zeus Cannon shots, and use Matryoshka Dolls. Gersh thanks the players; everyone gets a 90-second Death Machine and all Perk-a-Colas. Screen goes black and white as Samantha screams, then returns to color. Easter egg complete.',
      },
    ],
  },
  {
    gameShortName: 'BO3',
    mapSlug: 'bo3-ascension',
    name: 'Abracadavre',
    slug: 'abracadavre',
    type: 'MUSICAL',
    xpReward: 0,
    description: 'The song Abracadavre can be activated by interacting with three Teddy Bears holding a sickle located around the map.',
    steps: [
      { order: 1, label: 'Centrifuge Room: Go up the stairs, turn right; at the end of that walkway is the first bear.' },
      { order: 2, label: 'Near the Lunar Lander closest to Stamin-Up: there is a gate; under the red star is a teddy bear.' },
      { order: 3, label: 'Near the Lunar Lander past Speed Cola: a teddy bear is sitting on top of a wall.' },
    ],
  },
  {
    gameShortName: 'BO3',
    mapSlug: 'bo3-ascension',
    name: 'Matryoshka Dolls',
    slug: 'matryoshka-dolls',
    type: 'SIDE_QUEST',
    xpReward: 0,
    description: 'Matryoshka Dolls of the characters are scattered around the map. Press the action button on each to hear character-specific dialogue.',
    steps: [
      { order: 1, label: 'Dempsey: On top of the flaming barrels directly left of the Claymores.' },
      { order: 2, label: 'Nikolai: On top of the shelf directly to the left of Speed Cola.' },
      { order: 3, label: 'Takeo: On the shelf directly to the left of Widow\'s Wine (PhD Flopper location).' },
      { order: 4, label: 'Richtofen: In the room directly below the Stakeout, on a large table in a corner.' },
    ],
  },
  {
    gameShortName: 'BO3',
    mapSlug: 'bo3-ascension',
    name: 'Red Telephones',
    slug: 'red-telephones',
    type: 'SIDE_QUEST',
    xpReward: 0,
    description: 'Three red telephones; one rings every 120–300 seconds for 10 seconds. In BO3, answering plays Ultimis character quotes (trapped behind the door in Call of the Dead).',
    steps: [
      { order: 1, label: 'To the left of the lunar lander in the centrifuge room, between multiple fuse boxes.' },
      { order: 2, label: 'To the left of the power switch, through the chain link fence, down the stairs, turn right, to the left of the Mystery Box spawn.' },
      { order: 3, label: 'Just to the right of the Widow\'s Wine machine.' },
    ],
  },
  {
    gameShortName: 'BO3',
    mapSlug: 'bo3-ascension',
    name: 'Sparky Easter Egg',
    slug: 'sparky-easter-egg',
    type: 'SIDE_QUEST',
    xpReward: 0,
    description: 'Car batteries under a stairwell in the centrifuge/spawn room have the Cyrillic inscription "ЅРДЯКУ", referencing developer "Sparky" (Alejandro Romo).',
    steps: [
      { order: 1, label: 'Underneath the stairwell in the centrifuge/spawn room, find the car batteries with the Cyrillic text.' },
    ],
  },
  {
    gameShortName: 'BO3',
    mapSlug: 'bo3-ascension',
    name: 'Rocket Destruction',
    slug: 'rocket-destruction',
    type: 'SIDE_QUEST',
    xpReward: 0,
    description: 'When the rocket is launched, destroy it with a high-damage explosive (e.g. Ray Gun). A Double Points power-up spawns below it.',
    steps: [
      { order: 1, label: 'Launch the rocket, then shoot it with the Ray Gun or similar high-damage explosive before it leaves. A Double Points power-up spawns below.' },
    ],
  },
  // ——— Call of the Dead (BO1) ———
  {
    gameShortName: 'BO1',
    mapSlug: 'call-of-the-dead',
    name: 'Not Ready to Die',
    slug: 'not-ready-to-die',
    type: 'MUSICAL',
    xpReward: 0,
    description: 'The song Not Ready to Die can be activated by interacting with three hidden rocks around the map.',
    steps: [
      { order: 1, label: 'Spawn: on a barrel near the boat leading to the lighthouse.' },
      { order: 2, label: 'In the ship, in the Diner.' },
      { order: 3, label: 'In the PhD Flopper room, below a small table.' },
    ],
  },
  {
    gameShortName: 'BO1',
    mapSlug: 'call-of-the-dead',
    name: 'Stand-in',
    slug: 'stand-in',
    type: 'MAIN_QUEST',
    xpReward: 2500,
    playerCountRequirement: 'SOLO',
    videoEmbedUrl: 'https://www.youtube.com/embed/8kI2w4NgUCQ?si=vkGcZuiAZdRaAKQg&start=21',
    description: 'Solo-only main quest. Obtain the Golden Rod and give it to Richtofen in the vault to build the Vril Device. Rewards the Wunderwaffe DG-2 as a Lightning Bolt power-up.',
    steps: [
      {
        order: 1,
        label: 'First Step: Turn on power. Go to the locked door underneath the room with PhD Flopper (other side of map after buying debris—cave, past MP5K, past lighthouse, down stairs under PhD). Knife the door until you hear Nikolai; after Richtofen stops talking, find the fuse (on the table next to PhD Flopper, the table on the opposite wall, or in the corner between the cabinet and the wall). Place the fuse in the fusebox to the right of the door.',
      },
      {
        order: 2,
        label: 'Second Step: Four glowing red orbs (generators) must be destroyed to disable the MTD security system. Use explosives; China Lake, Crossbow, Scavenger, M67 Grenades and under-barrel launcher work well; Ray Gun, M72 LAW and Semtex must land exactly on the generator. [Generator locations]: Across from the locked door where the characters are. Outside the left window in the Stamin-Up building (also visible from lighthouse at Mystery Box). Over the left railing of the ship near Double Tap Root Beer. Between the second ship and spawn, on the right between two ice shelves. After all four are destroyed, knife the door.',
      },
      {
        order: 3,
        label: 'Third Step: In the control room (power switch room), set the steering wheel to 5 o\'clock (brown handle at 5 o\'clock), pull the first lever once and the third lever three times (left to right). A foghorn sounds and a submarine surfaces, shining a green light into the lighthouse.',
      },
      {
        order: 4,
        label: 'Fourth Step: Get the V-R11 from the Mystery Box (it becomes more likely at this step). Shoot a zombie with the V-R11; it will run into the bottom of the lighthouse into the green light instead of water. Kill the zombie before it reaches the top. Take the Golden Rod that appears and insert it into the ear tube next to the door (same spot as vodka in co-op).',
      },
      {
        order: 5,
        label: 'Final Step: Knife the fusebox to fix it (wait for character dialogue to finish). You receive the Wunderwaffe DG-2 as the Lightning Bolt power-up.',
      },
    ],
  },
  {
    gameShortName: 'BO1',
    mapSlug: 'call-of-the-dead',
    name: 'Ensemble Cast',
    slug: 'ensemble-cast',
    type: 'MAIN_QUEST',
    xpReward: 2500,
    playerCountRequirement: 'DUO',
    videoEmbedUrl: 'https://www.youtube.com/embed/8kI2w4NgUCQ?si=vkGcZuiAZdRaAKQg&start=21',
    description: 'Co-op only (cannot be completed solo; 2+ players). Obtain the Golden Rod and give it to Richtofen in the vault. All players earn the achievement; Lightning Bolt power-up appears. George A. Romero then drops Lightning Bolts instead of Death Machines when killed.',
    steps: [
      {
        order: 1,
        label: 'Step 1: Turn on power. Find the locked door in the room underneath PhD Flopper and knife it; Richtofen explains they are trapped. Find the fuse in the room above in one of three spots: on the ground next to a locker, behind batteries next to the 115 meteorite, or on the table beside PhD Flopper. Take the fuse and place it in the box beside the door.',
      },
      {
        order: 2,
        label: 'Step 2: After the first step, light is on in the room. Nikolai activates the MTD security system. Destroy four generators (glowing red orbs) with explosives; Semtex works well (sticks to generators, refill 130 points). When destroyed, the top stops glowing. [Generator locations]: Across from the locked door. Outside the left window in the Stamin-Up building (or visible from lighthouse at Mystery Box). Over the left railing of the ship near Double Tap. Between the second ship and spawn, right side between two ice shelves. Knife the door when all four are deactivated.',
      },
      {
        order: 3,
        label: 'Step 3: Nikolai asks for vodka. Vodka spawns stuck in ice in one of: railing above the staircase to PhD Flopper, railing above the staircase to AK-74u, railing near the M16 on the ship, or the ledge connecting both ships (near MP40). One player stands under the bottle to catch it while another knifes it; if missed, another spawns elsewhere. Place the vodka in the transfer tube (opposite side to the fuse box) and knife the door.',
      },
      {
        order: 4,
        label: 'Step 4: Activate four Morse Code radios in this exact order. Do not use the radios before this step or you will get the wrong sequence. If you have used the first radio before, press the first radio twice at the start to resync, then do 1-2-3-4. [Order]: Under the power room, on top of the cabinet on the right. Next to Stamin-Up, on top of the barrel. Near the back of the second ship (Semtex area), inside the train cart next to the window on the right. Under the steps to the door where the characters are trapped, on top of a cabinet. Success: Morse code plays and a glowing yellow ellipse appears near Mule Kick.',
      },
      {
        order: 5,
        label: 'Step 5: In the power room, set the steering wheel to 5 o\'clock (brown handle at 5 o\'clock), pull the first lever once and the third lever three times (left to right). A foghorn sounds and the submarine surfaces (visible off the left side of the large ship with Juggernog).',
      },
      {
        order: 6,
        label: 'Step 6: Fog must be active on the map. Match the submarine foghorn using the foghorns around the lighthouse (order is always the same; sub does not disappear). Press and hold use near each foghorn. [Order]: At the base of the lighthouse, next to the pool of water. After the slide to Speed Cola, around the right side of the corner in the water. At the base of the lighthouse, left side next to the building. After the slide to Speed Cola, behind the huge rock in the center. Success: the submarine shines a green light at the top of the lighthouse.',
      },
      {
        order: 7,
        label: 'Step 7: Set the security dials in the lighthouse to 2746 (top to bottom). Dials are yellow, orange, blue, purple (top to bottom). When you turn a dial, the ones above and below shift by one. [Steps]: Turn purple to 6. Turn orange until blue is 4. Turn yellow until orange is 7 (bottom three now correct ratio). Turn yellow to 2 and count the turns. Turn purple the same number of times. Turn blue back to 4 (purple and orange should align). Final: yellow 2, orange 7, blue 4, purple 6. Code slips are on the map (e.g. in front of barrier by Juggernog, window behind Stamin-Up, lighthouse by blue dial, life preserver by Double Tap). When correct, the submarine\'s green light reflects into the lighthouse.',
      },
      {
        order: 8,
        label: 'Step 8: Get the V-R11 from the Mystery Box. Shoot a zombie with it near the lighthouse; it will run into the bottom of the lighthouse into the green light and float up. Kill the zombie before it reaches the top (it can take a lot of damage—use Scavenger, Ray Gun or high-damage weapons). When the zombie dies it stops moving; when the body reaches the top, the Golden Rod appears at the bottom. Pick it up and take it to the transfer tube near the door.',
      },
      {
        order: 9,
        label: 'Step 9: Knife the fusebox to fix it after Richtofen\'s dialogue. All players earn the achievement; a Lightning Bolt power-up appears outside the door. George A. Romero will then drop Lightning Bolts instead of Death Machines when killed.',
      },
    ],
  },
  // ——— Shangri-La (BO1) ———
  {
    gameShortName: 'BO1',
    mapSlug: 'shangri-la',
    name: 'Pareidolia',
    slug: 'pareidolia',
    type: 'MUSICAL',
    xpReward: 0,
    description: 'The song Pareidolia (Elena Siegman, Kevin Sherwood) is activated by holding the action button at three meteorites scattered across the map.',
    steps: [
      { order: 1, label: 'Starting room: behind the Quick Revive perk machine, to the left of the window in the rubble, behind the pillar lying on the ground.' },
      { order: 2, label: 'Near the bridge between the starting area and the moving walls, next to the Juggernog/Speed Cola vending machine.' },
      { order: 3, label: 'Mining area: in the room after the AK74u room, within the broken wall across the room from the Semtex wall outline.' },
    ],
  },
  {
    gameShortName: 'BO1',
    mapSlug: 'shangri-la',
    name: 'Time Travel Will Tell',
    slug: 'main-quest',
    type: 'MAIN_QUEST',
    xpReward: 4500,
    playerCountRequirement: 'SQUAD',
    videoEmbedUrl: 'https://www.youtube.com/embed/tctR5oCbxWk?si=wE9ZDjHG9XO5HdW4&start=9',
    description: 'Four players required. Help Brock and Gary escape the time loop; obtain the Focusing Stone. Requires: Napalm Zombie, Spikemores (BO1)/Trip Mines (BO3), explosive, Pack-a-Punched 31-79 JGb215 (Fractalizer). The player who picks up the Focusing Stone gets all eight Perk-a-Colas for the rest of the game; all four get the achievement.',
    steps: [
      {
        order: 1,
        label: 'Step 1: Turn on power. In the starting room, four dials appear by Quick Revive (one on each wall). All four players press the action button at the same time. Time distorts, the moon eclipses the sun, and a giant Element 115 meteor appears above the temple in spawn.',
      },
      {
        order: 2,
        label: 'Step 2: Near the MPL (BO1)/Pharo (BO3), two characters (Brock and Gary) are trapped behind a locked area. Press a button to get them talking. After their dialogue, 12 magical plates appear on the floor on each side (24 total) outside spawn.',
      },
      {
        order: 3,
        label: 'Step 3: Panels appear on the bridge near the rotating statue and MPL area. One player stands on a plate and describes the symbol; another finds the matching plate on the other side; both step on to make the pair disappear. Wrong match resets all panels. Must complete in 4–5 minutes or you return to the present. Success: a Focusing Crystal appears on top of the MPL boulder. (Symbols include female symbol, diamond, star, crescent moon, circle with line, dots in triangle, etc.)',
        imageUrl: '/images/easter-eggs/shangri-la-ee-1.webp',
      },
      {
        order: 4,
        label: 'Step 4: Initiate another eclipse. Three players stand on the pressure plate (grate with water) at the bottom of the water slide; the fourth takes the slide and hits the switch on the side. The fourth player\'s impact activates the plate; the eclipse ends.',
      },
      {
        order: 5,
        label: 'Step 5: At the waterfall, a diamond is on top. Knock it down with an explosive or Ray Gun. Shoot it with the 31-79 JGb215 (Fractalizer) to shrink it, then knife it so it goes into the slide to the geyser. Launch the diamond with the geyser; it lands on a tower. A new diamond spawns when done.',
      },
      {
        order: 6,
        label: 'Step 6: In the tunnel with the pressure plate (crevice), next to the Pack-a-Punch pressure plate there is a gas pipe. Turn the wheel 4 times until the characters mention the gas receding. Gas leaks appear along walls and ceilings from the MPL entrance to the power room; your character coughs when passing through.',
      },
      {
        order: 7,
        label: 'Step 7: You need a calm Napalm Zombie in the past. Lure it through the tunnel from the MPL entrance through the cave and set the gas leaks on fire (at cave entrance, near spout launcher, and just before the power room). Return to the crevice and tube; the lever next to it will be raised. Press the action button to lower it. This must be done during the same eclipse as lighting the gas. Success: dialogue about the floor being covered in lava.',
      },
      {
        order: 8,
        label: 'Step 8: Go to the past. In the tunnel with the MP5k on a board, there are 4 holes in the side. Plug them with Spikemores (BO1)/Trip Mines (BO3)—lure crawlers or the Napalm Zombie and place so the spikes lodge in the holes. Then go to the bottom of the waterfall; on one side of the boulder is a brick wall with a brick sticking out saying "Do not hold X" / "Hold X". Hold the action button to return to the present. A new diamond appears above the mud pit temple.',
      },
      {
        order: 9,
        label: 'Step 9: Go to the past again. 12 panels must be knifed to light up: 5 in spawn, 2 in mudroom, 2 by minecart, 2 in stakeout room, 1 by the left power switch. When all are lit, a snare trap is visible out of bounds by the mine cart gate. Blow it up with an explosive (e.g. Monkey Bomb). Success: characters say it worked; you return to the present.',
      },
      {
        order: 10,
        label: 'Step 10: A radio near the mine cart gate (on a box) gives the code "16, 1, 3, 4". Go to the past and enter the mud pit temple. Set the four dials (top number): from eclipse button area—far right to [|-, near right to 1 dot, far left to 3 dots, near left to 4 dots. Success: a diamond appears above the mud pit temple.',
      },
      {
        order: 11,
        label: 'Step 11: In the present, by the right side of the stairs to Pack-a-Punch, on the ground by the statue, is a radio. Interact with it (Gary says he lost his dynamite); you must interact or the bag won\'t fall. Go to the past: the dynamite hangs on the Focusing Crystal near the Mine Cart gate. Charge the Focusing Crystals by finding the four gongs that make a resonating sound. Wrong gong = crystals glow red and dissipate. Correct = no glow, sound continues. When all four are struck correctly, Treyarch\'s symbol appears above the crystals and they glow yellow. Keep the crystals glowing and the sound going for Step 12.',
      },
      {
        order: 12,
        label: 'Step 12: Still in the past. The player with the Fractalizer shoots the Focusing Crystal above the mud pit temple (behind a palm tree from spawn) or the crystal with the dynamite near the Mine Cart gate. Beams bounce and knock the dynamite off. A player must stand directly below to catch it (if missed, repeat Step 11). Then the Fractalizer shoots the crystal above the mud pit temple again; beams strengthen; 3 orange beams hit the giant 115 meteor and it shrinks and falls into the temple.',
      },
      {
        order: 13,
        label: 'Step 13: Still in the past. The Pack-a-Punch has vanished and the back wall is accessible. The player who caught the dynamite walks to the wall and presses the action button to give it to Brock through a small hole. After the conversation, water washes everyone down; you return to the present. In the present, climb the temple again; the wall is gone and the Focusing Stone floats on the altar. One player holds the action button to take it—that player gets all eight Perk-a-Colas for the rest of the game (and keeps them when down). All four players get the Time Travel Will Tell achievement.',
      },
    ],
  },
  // ——— Shangri-La (BO3 Zombie Chronicles) ———
  {
    gameShortName: 'BO3',
    mapSlug: 'bo3-shangri-la',
    name: 'Pareidolia',
    slug: 'pareidolia',
    type: 'MUSICAL',
    xpReward: 0,
    description: 'The song Pareidolia is activated by holding the action button at three meteorites scattered across the map.',
    steps: [
      { order: 1, label: 'Starting room: behind Quick Revive, left of the window in the rubble, behind the pillar on the ground.' },
      { order: 2, label: 'Near the bridge between starting area and moving walls, next to the Juggernog/Speed Cola machine.' },
      { order: 3, label: 'Mining area: room after the AK74u room, within the broken wall across from the Semtex wall outline.' },
    ],
  },
  {
    gameShortName: 'BO3',
    mapSlug: 'bo3-shangri-la',
    name: 'Time Travel Will Tell',
    slug: 'main-quest',
    type: 'MAIN_QUEST',
    xpReward: 4500,
    playerCountRequirement: 'SQUAD',
    videoEmbedUrl: 'https://www.youtube.com/embed/tctR5oCbxWk?si=wE9ZDjHG9XO5HdW4&start=9',
    description: 'Four players required. Same as BO1: help Brock and Gary, obtain the Focusing Stone. Use Trip Mines instead of Spikemores. Pharo instead of MPL.',
    steps: [
      { order: 1, label: 'Step 1: Power on. All four players press the action button on the four dials by Quick Revive at the same time. Eclipse; giant 115 meteor above temple.' },
      { order: 2, label: 'Step 2: Near the Pharo, press the button to free Brock and Gary dialogue. 24 magical plates appear outside spawn.' },
      { order: 3, label: 'Step 3: Match symbol panels on the bridge (one stands on plate, other finds match; both step on). Complete in 4–5 min. Focusing Crystal appears on boulder.' },
      { order: 4, label: 'Step 4: Three players on pressure plate at bottom of water slide, fourth takes slide and hits switch. Eclipse ends.' },
      { order: 5, label: 'Step 5: Knock diamond off waterfall with explosive or Ray Gun. Shoot with Fractalizer to shrink, knife into slide, launch with geyser to tower.' },
      { order: 6, label: 'Step 6: Turn gas pipe wheel 4 times next to PaP pressure plate. Gas leaks; character coughs when passing through.' },
      { order: 7, label: 'Step 7: Lure calm Napalm Zombie through cave, set gas leaks on fire. Lower lever in crevice (same eclipse).' },
      { order: 8, label: 'Step 8: Past: plug 4 holes in MP5k tunnel with Trip Mines. Bottom of waterfall, hold action on brick wall to return to present.' },
      { order: 9, label: 'Step 9: Past: knife all 12 panels (5 spawn, 2 mudroom, 2 minecart, 2 stakeout, 1 left power). Blow snare trap by mine cart gate with explosive.' },
      { order: 10, label: 'Step 10: Radio gives code 16, 1, 3, 4. Past: set mud pit temple dials—far right [|-, near right 1 dot, far left 3 dots, near left 4 dots.' },
      { order: 11, label: 'Step 11: Present: interact with radio by PaP stairs. Past: charge Focusing Crystals with 4 gongs (resonating sound). Treyarch symbol and yellow glow.' },
      { order: 12, label: 'Step 12: Past: Fractalizer shoots crystal to knock dynamite off; player catches it. Fractalizer shoots crystal again; 3 beams hit meteor, it shrinks and falls.' },
      { order: 13, label: 'Step 13: Past: give dynamite to Brock through hole. Return to present. Climb temple; take Focusing Stone (one player gets all 8 perks; all 4 get achievement).' },
    ],
  },
  // ——— Moon (BO1) ———
  {
    gameShortName: 'BO1',
    mapSlug: 'moon',
    name: 'Coming Home',
    slug: 'coming-home',
    type: 'MUSICAL',
    xpReward: 0,
    description: 'Musical Easter egg. Find and hit the action button on three Teddy Bears with P.E.S. Helmets scattered around the map.',
    steps: [
      { order: 1, label: 'First bear: Outside the Receiving Bay, on a pile of crates right below the building (just next to the Launch Pad).' },
      { order: 2, label: 'Second bear: On the wall opposite the P.E.S. suit in the air lock between Tunnel 6 and the power switch area.' },
      { order: 3, label: 'Third bear: Near Stamin-Up in Tunnel 11, in a hole in the wall (the helmet sticks out).' },
    ],
  },
  {
    gameShortName: 'BO1',
    mapSlug: 'moon',
    name: 'Re-Damned',
    slug: 're-damned',
    type: 'MUSICAL',
    xpReward: 0,
    description: 'Remake of Damned. Activated by holding the action button by a computer in the lab next to the door to the Bio-Dome. Can only be heard in close proximity to the terminal.',
    steps: [
      { order: 1, label: 'In the lab next to the door to the Bio-Dome, hold the action button on the computer. The song plays only near the terminal.' },
    ],
  },
  {
    gameShortName: 'BO1',
    mapSlug: 'moon',
    name: 'Nightmare',
    slug: 'nightmare',
    type: 'MUSICAL',
    xpReward: 0,
    description: 'Nightmare by Avenged Sevenfold. Activated by earning the One Giant Leap achievement.',
    steps: [
      { order: 1, label: 'Get the One Giant Leap achievement to activate the song.' },
    ],
  },
  {
    gameShortName: 'BO1',
    mapSlug: 'moon',
    name: 'Coming Home (8-bit)',
    slug: 'coming-home-8bit',
    type: 'MUSICAL',
    xpReward: 0,
    description: '8-bit version of Coming Home. Re-Damned does not need to be activated first. Press the use button on the computer equipment at the end of Tunnel 11 next to a radio near the power room door. Can only be heard near the terminal.',
    steps: [
      { order: 1, label: 'At the end of Tunnel 11, next to the radio near the power room door, press the use button on the computer equipment. The 8-bit song plays only near the terminal.' },
    ],
  },
  {
    gameShortName: 'BO1',
    mapSlug: 'moon',
    name: 'Pareidolia (8-bit)',
    slug: 'pareidolia-8bit',
    type: 'MUSICAL',
    xpReward: 0,
    description: '8-bit version of Pareidolia. Press the use button near a computer in the labs, in a corner to the left when entering from the power room. Can only be heard near the terminal.',
    steps: [
      { order: 1, label: 'In the labs, in the corner to the left when entering from the power room, press the use button near the computer. The 8-bit song plays only near the terminal.' },
    ],
  },
  {
    gameShortName: 'BO1',
    mapSlug: 'moon',
    name: "Richtofen's Grand Scheme",
    slug: 'main-quest',
    type: 'MAIN_QUEST',
    xpReward: 6000,
    playerCountRequirement: 'SQUAD',
    videoEmbedUrl: 'https://www.youtube.com/embed/2k6L3wBsEyA?si=RKpO6ePgudDhKkaW&start=4',
    description: 'Main quest in two parts: Cryogenic Slumber Party and Big Bang Theory. Requires Wave Gun, Hacker, and (after Part 1) Quantum Entanglement Device and Gersh Device. Full completion in Black Ops requires two or more players online and at least one player who has completed Ensemble Cast (Call of the Dead) and Time Travel Will Tell (Shangri-La). Making a crawler helps for later steps.',
    rewardsDescription: 'Part 1: 90-second Death Machine, Cryogenic Slumber Party achievement. Part 2/3: Richtofen gets all eight perks permanently; other players get them after Part 3. Perks last until game end. (Xbox 360: two gamer pictures — Samantha Maxis and a Teddy Bear with a Bowie Knife.)',
    steps: [
      { order: 1, label: 'Turn on power.' },
      { order: 2, label: '[Opening the slot — Simon Says]: Outside the Receiving Bay (Olympia side) in front of Tunnel 6, four computer terminals (red, green, blue, yellow left to right). When they flash a color, press use on that color\'s computer. The sequence adds one color each time. Complete to open the slot. If you fail, start over.' },
      { order: 3, label: '[Opening the slot — Hacking in the Laboratory]: Second floor of the Laboratory, left of the stairs to the third floor (near the Bowie Knife), four dim switches. Hack one for 500 points. Then find and hack four white panel boxes with bright green lights within 60 seconds (eight panels total across three floors: three top, two second, three third; follow the buzzing). Then rapidly press all four red buttons in order (for example left to right). The center of the Vril Interface on the pyramid indents.' },
      { order: 4, label: '[Moving the Vril Sphere]: Let excavator Pi breach Tunnel 6. Take the Hacker to spawn and hack the excavator terminal. Return to Tunnel 6; the Vril Sphere appears near the M16. Knife or shoot the sphere to move it; it floats toward the satellite dish on the Receiving Area. Open doors for it; if stuck, knife or shoot again.' },
      { order: 5, label: 'At the satellite dish, shoot the sphere with the Wave Gun so it falls and travels toward Tunnel 11. In Tunnel 11 it can get stuck in the ceiling above the barrier near Stamin-Up. Free it with a grenade or splash damage (e.g. Ray Gun). Guide the sphere to the Moon Pyramid Device; it merges with the plate when the slot is open.' },
      { order: 6, label: '[Fill the container]: A cylindrical glass container rises in the front right corner of the pyramid. Kill 25 zombies near the tube so their souls are sucked in (short range). Use the switch on the right wall. The pyramid opens, revealing Samantha Maxis. All players get a 90-second Death Machine and the Cryogenic Slumber Party achievement.' },
      { order: 7, label: '[Plates (can do before Part 2)]: At Area 51, right of the teleporter, a beam structure holds hexagonal plates. Throw a grenade to knock the plates down, then throw a Gersh Device so the plates teleport with you. In spawn near Quick Revive, throw a QED on the plates so they move into the two brackets on the small machine to the right of the computer.' },
      { order: 8, label: '[Curved wire]: Search the labs (any floor)—on the ground, against a wall or crate, or inside a desk where the Hacker may spawn. Rarely: outside near the teleporter entrance, by the crates right of the door outside, or in the starting room by the excavator switch. Pick up the wire.' },
      { order: 9, label: '[Charging the Vril Device]: In spawn, place the Vril Device between the plates and connect the lead wire between the two pieces of equipment. The player as Richtofen repeatedly uses the action button on the computer to the left of the plates until a voiceover plays and the screen goes red, green, red, green. The Vril Device glows. Retrieve it.' },
      { order: 10, label: '[Part 2 — Switching souls]: At the opened pyramid, four tubes appear. Kill 25 zombies by each tube (souls fly in; Samantha screams and shakes the screen). Insert the powered Vril Device into the slot. Samantha and Richtofen switch souls; the Richtofen player gets all eight perks permanently.' },
      { order: 11, label: '[Part 3 — Simon Says]: Play the color game three times. First run shows 3 colors, then 4, then 5. Each completion raises one of the three rockets. Maxis then asks to move the Vril Sphere.' },
      { order: 12, label: '[Retrieving the Vril Sphere]: Throw a QED on the Vril Interface symbol on the front of the pyramid in the power room to launch the sphere to the Simon Says machine. Throw a Gersh Device near the sphere to teleport it.' },
      { order: 13, label: '[Finale]: After all three Simon Says and retrieving the sphere, Maxis starts a countdown. The three rockets launch toward Earth and incinerate it (30–40 seconds). Earth\'s appearance changes when traveling to Area 51.' },
    ],
  },
  // ——— Moon (BO3 Zombie Chronicles) ———
  {
    gameShortName: 'BO3',
    mapSlug: 'bo3-moon',
    name: 'Coming Home',
    slug: 'coming-home',
    type: 'MUSICAL',
    xpReward: 0,
    description: 'Musical Easter egg. Find and hit the action button on three Teddy Bears with P.E.S. Helmets scattered around the map.',
    steps: [
      { order: 1, label: 'First bear: Outside the Receiving Bay, on a pile of crates right below the building (just next to the Launch Pad).' },
      { order: 2, label: 'Second bear: On the wall opposite the P.E.S. suit in the air lock between Tunnel 6 and the power switch area.' },
      { order: 3, label: 'Third bear: Near Stamin-Up in Tunnel 11, in a hole in the wall (the helmet sticks out).' },
    ],
  },
  {
    gameShortName: 'BO3',
    mapSlug: 'bo3-moon',
    name: 'Re-Damned',
    slug: 're-damned',
    type: 'MUSICAL',
    xpReward: 0,
    description: 'Remake of Damned. In Black Ops III, activated via the computer equipment in Tunnel 11 next to the door leading to the power room.',
    steps: [
      { order: 1, label: 'In Tunnel 11, use the computer equipment next to the door leading to the power room to activate Re-Damned.' },
    ],
  },
  {
    gameShortName: 'BO3',
    mapSlug: 'bo3-moon',
    name: 'Nightmare',
    slug: 'nightmare',
    type: 'MUSICAL',
    xpReward: 0,
    description: 'Nightmare by Avenged Sevenfold. Activated by earning the One Giant Leap achievement.',
    steps: [
      { order: 1, label: 'Get the One Giant Leap achievement to activate the song.' },
    ],
  },
  {
    gameShortName: 'BO3',
    mapSlug: 'bo3-moon',
    name: 'Coming Home (8-bit)',
    slug: 'coming-home-8bit',
    type: 'MUSICAL',
    xpReward: 0,
    description: '8-bit version of Coming Home. In Black Ops III, activated via a terminal in the spawning room.',
    steps: [
      { order: 1, label: 'In the spawning room, use the terminal to activate the 8-bit version of Coming Home.' },
    ],
  },
  {
    gameShortName: 'BO3',
    mapSlug: 'bo3-moon',
    name: 'Pareidolia (8-bit)',
    slug: 'pareidolia-8bit',
    type: 'MUSICAL',
    xpReward: 0,
    description: '8-bit version of Pareidolia. In Black Ops III, activated via the terminal next to the Bio-Dome door in the lab.',
    steps: [
      { order: 1, label: 'In the lab, use the terminal next to the Bio-Dome door to activate the 8-bit version of Pareidolia.' },
    ],
  },
  {
    gameShortName: 'BO3',
    mapSlug: 'bo3-moon',
    name: 'Dog in a Space Suit',
    slug: 'dog-space-suit',
    type: 'SIDE_QUEST',
    xpReward: 0,
    description: 'Black Ops III only. A dog in a space suit can be seen skipping in the distance from the outside area. Requires killing a Hellhound at Area 51 and shooting all Mystery Box teddy bears (including the one that replaces the box after it leaves) and a bone on the pipes near the Moon teleporter—all with the Wave Gun. Then interact with a pair of dog bowls in the labs with the Hacker and feed zombie souls to them.',
    steps: [
      { order: 1, label: 'Kill a Hellhound at Area 51.' },
      { order: 2, label: 'Shoot all Mystery Box teddy bears with the Wave Gun (including the one that replaces the box after it leaves).' },
      { order: 3, label: 'Shoot the bone on the pipes near the Moon teleporter with the Wave Gun.' },
      { order: 4, label: 'In the labs, use the Hacker to interact with the pair of dog bowls and feed zombie souls to them. The dog in a space suit will appear skipping in the distance from outside.' },
    ],
  },
  {
    gameShortName: 'BO3',
    mapSlug: 'bo3-moon',
    name: "Richtofen's Grand Scheme",
    slug: 'main-quest',
    type: 'MAIN_QUEST',
    xpReward: 6000,
    playerCountRequirement: 'SOLO',
    videoEmbedUrl: 'https://www.youtube.com/embed/2k6L3wBsEyA?si=RKpO6ePgudDhKkaW&start=4',
    description:
      'Main quest: Cryogenic Slumber Party and Big Bang Theory. Requires Wave Gun, Hacker, and (after Part 1) Quantum Entanglement Device and Gersh Device. In Zombies Chronicles (BO3), the quest can be completed in solo with no prerequisites; when playing solo you always play as Richtofen. Making a crawler helps for later steps.',
    rewardsDescription: 'Part 1: 90-second Death Machine, Cryogenic Slumber Party achievement. Part 2/3: Richtofen gets all eight perks permanently; other players get them after Part 3. Perks last until game end.',
    steps: [
      { order: 1, label: 'Turn on power.' },
      { order: 2, label: '[Opening the slot — Simon Says]: Outside the Receiving Bay (RK5 side) in front of Tunnel 6, four computer terminals (red, green, blue, yellow left to right). When they flash a color, press use on that color\'s computer. The sequence adds one color each time. Complete to open the slot. If you fail, start over.' },
      { order: 3, label: '[Opening the slot — Hacking in the Laboratory]: Second floor of the Laboratory, left of the stairs to the third floor (near the Bowie Knife), four dim switches. Hack one for 500 points. Then find and hack four white panel boxes with bright green lights within 60 seconds (eight panels total across three floors; follow the buzzing). Then rapidly press all four red buttons in order (for example left to right). The center of the Vril Interface on the pyramid indents.' },
      { order: 4, label: '[Moving the Vril Sphere]: Let excavator Pi breach Tunnel 6. Take the Hacker to spawn and hack the excavator terminal. Return to Tunnel 6; the Vril Sphere appears near the Kuda. Knife or shoot the sphere to move it; it floats toward the satellite dish on the Receiving Area. Open doors for it; if stuck, knife or shoot again.' },
      { order: 5, label: 'At the satellite dish, shoot the sphere with the Wave Gun so it falls and travels toward Tunnel 11. In Tunnel 11 it can get stuck in the ceiling above the barrier near Stamin-Up. Free it with a grenade or splash damage. Guide the sphere to the Moon Pyramid Device; it merges with the plate when the slot is open.' },
      { order: 6, label: '[Fill the container]: A cylindrical glass container rises in the front right corner of the pyramid. Kill 25 zombies near the tube so their souls are sucked in (short range). Use the switch on the right wall. The pyramid opens, revealing Samantha Maxis. All players get a 90-second Death Machine and the Cryogenic Slumber Party achievement.' },
      { order: 7, label: '[Plates (can do before Part 2)]: At Area 51, right of the teleporter, a beam structure holds hexagonal plates. Throw a grenade to knock the plates down, then throw a Gersh Device so the plates teleport with you. In spawn near Quick Revive, throw a QED on the plates so they move into the two brackets on the small machine to the right of the computer.' },
      { order: 8, label: '[Curved wire]: Search the labs (any floor)—on the ground, against a wall or crate, or inside a desk where the Hacker may spawn. Rarely: outside near the teleporter entrance, by the crates right of the door outside, or in the starting room by the excavator switch. Pick up the wire.' },
      { order: 9, label: '[Charging the Vril Device]: In spawn, place the Vril Device between the plates and connect the lead wire between the two pieces of equipment. The player as Richtofen repeatedly uses the action button on the computer to the left of the plates until a voiceover plays and the screen goes red, green, red, green. The Vril Device glows. Retrieve it.' },
      { order: 10, label: '[Part 2 — Switching souls]: At the opened pyramid, four tubes appear. Kill 25 zombies by each tube (souls fly in; Samantha screams and shakes the screen). Insert the powered Vril Device into the slot. Samantha and Richtofen switch souls; the Richtofen player gets all eight perks permanently.' },
      { order: 11, label: '[Part 3 — Simon Says]: Play the color game three times. First run shows 3 colors, then 4, then 5. Each completion raises one of the three rockets. Maxis then asks to move the Vril Sphere.' },
      { order: 12, label: '[Retrieving the Vril Sphere]: Throw a QED on the Vril Interface symbol on the front of the pyramid in the power room to launch the sphere to the Simon Says machine. Throw a Gersh Device near the sphere to teleport it.' },
      { order: 13, label: '[Finale]: After all three Simon Says and retrieving the sphere, Maxis starts a countdown. The three rockets launch toward Earth and incinerate it (30–40 seconds). Earth\'s appearance changes when traveling to Area 51.' },
    ],
  },
  // ——— Kino der Toten (BO3 Zombie Chronicles) ———
  {
    gameShortName: 'BO3',
    mapSlug: 'bo3-kino-der-toten',
    name: 'Film Reels',
    slug: 'film-reels',
    type: 'SIDE_QUEST',
    xpReward: 0,
    description: 'Collect film reels from the random teleporter rooms and play them in the Projector room for Maxis voice notes. Up to three reels per match.',
    steps: [
      {
        order: 1,
        label: 'Reach the Projector room and teleport. Film reels (Group 935 logo) can appear in the four random rooms; up to three per game. Pick up with the action button.',
      },
      {
        order: 2,
        label: 'Reel locations: Samantha\'s room (table, bed, rocking chair); Samantha\'s room destroyed (bed, overturned table, window); Dentist\'s Office (cart, counters); Conference Room (TV, under projector, table).',
      },
      { order: 3, label: 'With a reel, teleport and use the action button on the projector to play the clip.' },
    ],
  },
  {
    gameShortName: 'BO3',
    mapSlug: 'bo3-kino-der-toten',
    name: '115',
    slug: '115',
    type: 'MUSICAL',
    xpReward: 0,
    description: 'Interact with three hidden rocks to activate the song 115.',
    steps: [
      { order: 1, label: 'Near spawn: rock in a jar in the corner by the bottom window.' },
      { order: 2, label: 'Dressing room: rock on the black table near a window, behind two mannequins.' },
      { order: 3, label: 'Storage room: rock on a shelf next to a window.' },
    ],
  },
  {
    gameShortName: 'BO3',
    mapSlug: 'bo3-kino-der-toten',
    name: 'Radios',
    slug: 'radios',
    type: 'SIDE_QUEST',
    xpReward: 0,
    description: 'Three hidden radios. Zombie Chronicles adds a third by the Pharo wall buy.',
    steps: [
      { order: 1, label: 'Radio 1: Inside the chandelier in the theater. Shoot or throw an explosive.' },
      { order: 2, label: 'Radio 2: Top of the tower visible from the alley through the barrier next to Double Tap. Interact to activate.' },
      { order: 3, label: 'Radio 3 (BO3 only): Just left of the Pharo wall buy, tucked in a corner. Shoot or interact to activate.' },
    ],
  },
  {
    gameShortName: 'BO3',
    mapSlug: 'bo3-kino-der-toten',
    name: "Samantha's Sorrow",
    slug: 'samanthas-sorrow',
    type: 'MUSICAL',
    xpReward: 0,
    description:
      'Zombie Chronicles exclusive. Stand near the blue door in the Alley and wait for a knocking pattern, then knife the door repeating that pattern three times. Go to the Theater, interact with the Samantha doll on the rubble left of the stage, then find and shoot the doll in each hide-and-seek location until the song plays.',
    steps: [
      {
        order: 1,
        label:
          'Knock pattern: Stand near the blue door in the Alley and wait for a knocking sound. The pattern is random; possible patterns include 1-1-5, 1-2-1, 1-4-3, 2-4-1, 3-2-1, 5-1-2, 5-3-4, 6-2-4, 6-6-6, 9-3-5. Knife the door by repeating the same pattern you heard. You must repeat this process three times (listen, then knife the pattern). A sound effect confirms success.',
      },
      {
        order: 2,
        label:
          'Go to the Theater and interact with the Samantha doll on top of the rubble to the left of the stage. This starts the hide-and-seek: the doll will appear in different locations and you must find and shoot it each time.',
      },
      {
        order: 3,
        label:
          'Find and shoot the doll in each location. Possible hide-and-seek spots: on the back of the giant house prop on the stage (sitting on a wooden board); behind the metal grate on the ceiling next to the stage, near the trap that connects the stage to the dressing room; on the balcony above where the first Samantha doll was; on top of the chandelier in the theater; resting on a chair in the alley of the theater; on the upper balcony at the back of the theater, on top of a light; in the Pack-a-Punch room. When all dolls have been located and shot, the song plays.',
      },
    ],
  },
  // ——— TranZit (BO2) ———
  {
    gameShortName: 'BO2',
    mapSlug: 'tranzit',
    name: 'Carrion',
    slug: 'carrion',
    type: 'MUSICAL',
    xpReward: 0,
    description: 'Musical Easter egg by Clark S. Nova. Find and press the action button on three Teddy Bears in order to play the song.',
    steps: [
      { order: 1, label: 'First bear: Outside the starting room, on a wooden bench near a pool of lava.' },
      { order: 2, label: 'Second bear: In the Farmhouse, on a mattress on the second floor.' },
      { order: 3, label: 'Third bear: In Town, on a cushioned chair in the bar next to the billiards table. Press the bears in this order to activate Carrion.' },
    ],
  },
  {
    gameShortName: 'BO2',
    mapSlug: 'tranzit',
    name: 'Nacht der Untoten in the Cornfield',
    slug: 'nacht-in-cornfield',
    type: 'SIDE_QUEST',
    xpReward: 0,
    description: 'A path through the cornfield near the farm leads to Nacht der Untoten, the first Zombies map from World at War.',
    steps: [
      { order: 1, label: 'From the farm, go into the cornfield. Follow a path through several cuts in the field; it ends at Nacht der Untoten.' },
    ],
  },
  {
    gameShortName: 'BO2',
    mapSlug: 'tranzit',
    name: 'Farm Cottage TV',
    slug: 'farm-cottage-tv',
    type: 'SIDE_QUEST',
    xpReward: 0,
    description: 'An old TV set in the Cottage of the Farm area plays radio messages when activated.',
    steps: [
      { order: 1, label: 'In the Farm area, find the Cottage. Use the action button on the old TV set to play radio messages.' },
    ],
  },
  {
    gameShortName: 'BO2',
    mapSlug: 'tranzit',
    name: 'Sniper Scope Reflection',
    slug: 'sniper-scope-reflection',
    type: 'SIDE_QUEST',
    xpReward: 0,
    description: 'Looking at the reflection in a sniper scope (e.g. DSR 50) shows the area as it was before the events of Moon.',
    steps: [
      { order: 1, label: 'Anywhere on the map, look through a sniper scope (e.g. DSR 50). The reflection in the scope shows the area before the Moon events.' },
    ],
  },
  {
    gameShortName: 'BO2',
    mapSlug: 'tranzit',
    name: 'Town Traffic Light Morse Code',
    slug: 'town-traffic-light-morse',
    type: 'SIDE_QUEST',
    xpReward: 0,
    description: 'The traffic light in Town displays Morse code messages when observed closely.',
    steps: [
      { order: 1, label: 'In Town, watch the traffic light closely. The Morse code reads: "Help me so I can help you," "the future is ours to destroy," "power is knowledge," "go to the light," "stay close to me," "energy can only be transformed."' },
    ],
  },
  {
    gameShortName: 'BO2',
    mapSlug: 'tranzit',
    name: 'NAV Table & Navcards',
    slug: 'nav-table-navcards',
    type: 'SIDE_QUEST',
    xpReward: 0,
    description: 'The NAV table and Navcards connect TranZit, Die Rise, and Buried. Each map has a buildable NAV table and a Navcard. Parts spawn only on Original difficulty. Once the table is built, it is saved to your profile and auto-built in future games if all players have built it before.',
    steps: [
      { order: 1, label: 'TranZit Navcard location: Behind the bus depot, cross the lava to a dumpster. The Navcard is on the ground—very small—near the dumpster in some papers.', imageUrl: '/images/buildables/bo2/tarnzit-navcard.png' },
      { order: 2, label: 'NAV table: Build the NAV table on each map (TranZit, Die Rise, Buried) from four parts: meteorite, table/board, radio, electrical box. Built near each map\'s polarization tower. TranZit\'s table is invisible and built underneath the giant telephone tower in the cornfield.' },
      { order: 3, label: 'Navcard order: TranZit Navcard → insert in Die Rise\'s NAV table. Die Rise Navcard → insert in Buried\'s NAV table. Buried Navcard → insert in TranZit\'s NAV table (under the pylon). You can only hold one Navcard at a time.' },
      { order: 4, label: 'Once all three Navcards are inserted correctly and each map\'s side quest is completed, the icons pulse on the world map. All Navcards must be inserted to access the story endings in Buried (Maxis or Richtofen).' },
    ],
  },
  {
    gameShortName: 'BO2',
    mapSlug: 'tranzit',
    name: 'Tower of Babble (Dr. Maxis)',
    slug: 'tower-of-babble-maxis',
    type: 'MAIN_QUEST',
    xpReward: 4000,
    playerCountRequirement: 'DUO',
    variantTag: 'Dr. Maxis',
    videoEmbedUrl: 'https://www.youtube.com/embed/8vM3gZoOjVo',
    description: 'Power the pylon for Dr. Maxis. Requires power to be turned OFF. Original difficulty only. At least two players. Completing one side locks it until you complete the other or activate Buried endgame.',
    steps: [
      { order: 1, label: '[Step 1]: Reach the Power Lab (get off the bus at Power Station near the lamp post and teleport, or run through the fog). Open the door to the outhouse to find the secret entrance.' },
      { order: 2, label: '[Step 2]: Build the power switch from three parts (board, lever, zombie arm) at the blueprint in the Power Station. Turn on the power.', buildableReferenceSlug: 'power-switch' },
      { order: 3, label: '[Step 3]: At least two players must build a Turbine. Turbine parts are in the Bus Depot.', buildableReferenceSlug: 'turbine' },
      { order: 4, label: '[Step 4]: Dr. Maxis will ask for the power to be turned off. Turn the power off to progress. Turning it back on later does not reset progress.' },
      { order: 5, label: '[Step 5]: At least one player must get EMP Grenades from the Mystery Box.' },
      { order: 6, label: '[Step 6]: From the Farm, go toward the Power Station to the large tower. In the cornfield on the left of the road is a Pylon. Kill the last zombie while lightning is above you (Avogadro may spawn). Place two Turbines under the Pylon. When the Avogadro is under the tower, kill him with an EMP grenade. Both Turbines must have power; if one drains, replace it or redo the step.', buildableReferenceSlug: 'turbine' },
      { order: 7, label: '[Step 7]: Two players take their Turbines to two different street lamp locations (e.g. Bus Depot and Diner—lamps where Denizens do not attack). Place one Turbine at each lamp. The Tower of Babble achievement unlocks.', buildableReferenceSlug: 'turbine' },
    ],
  },
  {
    gameShortName: 'BO2',
    mapSlug: 'tranzit',
    name: 'Tower of Babble (Richtofen)',
    slug: 'tower-of-babble-richtofen',
    type: 'MAIN_QUEST',
    xpReward: 4000,
    playerCountRequirement: 'SOLO',
    variantTag: 'Richtofen',
    videoEmbedUrl: 'https://www.youtube.com/embed/4dgwXRGRe0M',
    description: 'Power the pylon for Richtofen. Power must stay ON. Only Samuel can hear Richtofen; solo players must be Samuel. Original difficulty. The Jet Gun (Thrustodyne Aeronautics Model 23) must be built. NAV table is not required.',
    steps: [
      { order: 1, label: '[Step 1]: Reach the Power Lab and build the power switch. Turn on the power; it must stay on for this path.', buildableReferenceSlug: 'power-switch' },
      { order: 2, label: '[Step 2]: Build the Jet Gun (Thrustodyne Aeronautics Model 23). Four parts: (1) Hunter\'s Cabin between Town and Power Plant—in the fire, on the bed spring, or on the shelf. (2) Building resembling Nacht in the cornfield between Farm and Power Plant—on broken shelves, in debris, or up the stairs. (3) Tunnel between Bus Depot and Diner—by the barrier, between wrecked cars, or in the corner. (4) Room with Tombstone and Electric Trap—cross wooden planks or check the catwalk by the power generator. Build the Jet Gun on the first floor of the bar in Town. Only one player can hold it.' },
      { order: 3, label: '[Step 3]: The player with the Jet Gun goes under the Transmission Tower (opposite side of the road from Nacht, through the cornfield maze). Fire the Jet Gun under the tower until it breaks; Richtofen then speaks to Samuel and the green lamps flicker. Let the Jet Gun recharge before overheating it.' },
      { order: 4, label: '[Step 4]: Kill 25 zombies under the tower with explosives (Ray Gun and Ray Gun Mark II count). Richtofen speaks to Samuel when done. Solo: restart until you spawn as Samuel.' },
      { order: 5, label: '[Step 5]: At least two players need EMP Grenades (recommended all four).' },
      { order: 6, label: '[Step 6]: Throw four EMP Grenades at four different green lamp posts (the ones now emitting electricity). With four players, throw simultaneously. With fewer players, use Denizen teleporters under lamps and quick throws; possible solo with Max Ammo and specific lamp positions (see wiki). Tower of Babble achievement unlocks.' },
    ],
  },
  {
    gameShortName: 'BO2',
    mapSlug: 'tranzit',
    name: 'Turbine',
    slug: 'turbine',
    type: 'BUILDABLE',
    xpReward: 0,
    description: 'Buildable that provides portable power. Used to open certain doors, power Perk machines and streetlights before main power, power the Electric Trap and Turret, open the Pack-a-Punch door at the Power Station, and restart the bus after an EMP or Avogadro. Built at the crafting bench in the Bus Depot. Parts can spawn in multiple locations.',
    steps: [
      { order: 1, label: 'Crafting table: Bus Depot, left of the door opposite Quick Revive.', imageUrl: '/images/buildables/bo2/tranzit-turbine-table.png' },
      { order: 2, label: 'Mannequin: Bus Depot, against the triangular map. Random spawns.', imageUrl: '/images/buildables/bo2/tranzit-turbine-mannequin-1.webp' },
      { order: 3, label: 'Fan: Bus Depot, on a seat opposite the crafting bench.', imageUrl: '/images/buildables/bo2/tranzit-turbine-fan-1.webp' },
      { order: 4, label: 'Tail: Starting room, right of the bookcase on the floor; or behind Mannequin spawn, next to M14.', imageUrl: '/images/buildables/bo2/tranzit-turbine-tail-1.webp' },
    ],
  },
  {
    gameShortName: 'BO2',
    mapSlug: 'tranzit',
    name: 'Power Switch',
    slug: 'power-switch',
    type: 'BUILDABLE',
    xpReward: 0,
    description: 'TranZit requires the power switch to be built from three parts (board, lever, zombie arm); the separate maps do not. Built at the crafting table in the final room of the Power Station.',
    steps: [
      { order: 1, label: 'Crafting table: Final room of the Power Station.', imageUrl: '/images/buildables/bo2/tranzit-power-table.png' },
      { order: 2, label: 'Board: Drop down, turn left · ground near door.', imageUrl: '/images/buildables/bo2/tranzit-power-board-1.png' },
      { order: 3, label: 'Board: Buildable table room, turn around · left of door.', imageUrl: '/images/buildables/bo2/tranzit-power-board-2.png' },
      { order: 4, label: 'Board: Near core, center of reactor, against boxes.', imageUrl: '/images/buildables/bo2/tranzit-power-board-3.png' },
      { order: 5, label: 'Lever: Drop down, main room · ground, far right.', imageUrl: '/images/buildables/bo2/tranzit-power-lever-1.png' },
      { order: 6, label: 'Lever: Buildable table room, as you enter · right, on computers in corner.', imageUrl: '/images/buildables/bo2/tranzit-power-lever-2.png' },
      { order: 7, label: 'Lever: Buildable table room · left of table, on computers.', imageUrl: '/images/buildables/bo2/tranzit-power-lever-3.png' },
      { order: 8, label: 'Zombie Arm: Main room, before stairs · floor right, near railing.', imageUrl: '/images/buildables/bo2/tranzit-power-arm-1.png' },
      { order: 9, label: 'Zombie Arm: From table room to center, left, to the end · on ground.', imageUrl: '/images/buildables/bo2/tranzit-power-arm-2.png' },
      { order: 10, label: 'Zombie Arm: Outside buildable table room door · ground near stairs.', imageUrl: '/images/buildables/bo2/tranzit-power-arm-3.png' },
    ],
  },
  {
    gameShortName: 'BO2',
    mapSlug: 'tranzit',
    name: 'Zombie Shield',
    slug: 'zombie-shield',
    type: 'BUILDABLE',
    xpReward: 0,
    description: 'Buildable shield that blocks damage from the front or back when held or on your back. Has limited durability; can be planted like the Assault Shield in BO2. Built at the crafting bench in the back of the Garage\'s office room at the Diner bus stop. In TranZit it uses the equipment slot, so you must swap it with the Turbine, Sentry Turret, or Electric Trap.',
    steps: [
      { order: 1, label: 'Crafting table: Garage, back of office room at Diner.', imageUrl: '/images/buildables/bo2/tranzit-shield-table.png' },
      { order: 2, label: 'Car Door: Garage bathroom, floor by sink.', imageUrl: '/images/buildables/bo2/tranzit-shield-door-1.png' },
      { order: 3, label: 'Car Door: Garage, table next to crafting room.', imageUrl: '/images/buildables/bo2/tranzit-shield-door-2.png' },
      { order: 4, label: 'Car Door: Garage, car on maintenance platform.', imageUrl: '/images/buildables/bo2/tranzit-shield-door-3.png' },
      { order: 5, label: 'Hand Trolley: Diner, behind counter, left side toward Speed Cola.', imageUrl: '/images/buildables/bo2/tranzit-shield-trolley-1.png' },
      { order: 6, label: 'Hand Trolley: Diner, behind counter, far right.', imageUrl: '/images/buildables/bo2/tranzit-shield-trolley-2.png' },
      { order: 7, label: 'Hand Trolley: Diner, behind booth at far end from Speed Cola.', imageUrl: '/images/buildables/bo2/tranzit-shield-trolley-3.png' },
    ],
  },
  {
    gameShortName: 'BO2',
    mapSlug: 'tranzit',
    name: 'Pack-a-Punch',
    slug: 'pack-a-punch',
    type: 'BUILDABLE',
    xpReward: 0,
    description: 'How to access and build the Pack-a-Punch in Town. You must place Turbines in a specific order to open the bank door (or in solo, run between the Power Plant and Town very quickly). Once inside the room, build the machine from parts; the workbench is at the end of the hallway. If you go back up to the bench area the door closes and you must redo the turbines at the Power Station.',
    steps: [
      { order: 1, label: 'How it works: Pack-a-Punch is in a room under the bank in Town.\n• Open the door by placing Turbines: (1) Power Plant—drop down, turn around; (2) Bank—blow up two doors, place Turbine at green symbol on wall.\n• Solo: run from Power Plant to Town very quickly before Turbine drains.\n• Inside: build from Wood Leg, Battery, Frame at workbench at end of hallway.\n• If you leave, the door closes; redo turbines at Power Station to reopen.' },
      { order: 2, label: 'Crafting table: Pack-a-Punch room, end of hallway past bank secret door.\n• Build machine here once all parts are placed.\n• Going back up closes the door—redo turbines to reopen.', imageUrl: '/images/buildables/bo2/tranzit-packapunch-table.png' },
      { order: 3, label: 'Opening Pack-a-Punch: Power Plant · drop down, turn around · place Turbine 1 here. Solo: run to Town fast.', imageUrl: '/images/buildables/bo2/tranzit-bank-1.png' },
      { order: 4, label: 'Opening Pack-a-Punch: Bank · blow up two doors · place Turbine at green symbol. Then build machine in room.', imageUrl: '/images/buildables/bo2/tranzit-bank-2.png' },
      { order: 5, label: 'Wood Leg: Entering room (down stairs), left side, up on boxes.', imageUrl: '/images/buildables/bo2/tranzit-packapunch-wooden-1.png' },
      { order: 6, label: 'Wood Leg: Right of window barrier after stairs, on dolly.', imageUrl: '/images/buildables/bo2/tranzit-packapunch-wooden-2.png' },
      { order: 7, label: 'Wood Leg: End of corridor before buildable table, on box.', imageUrl: '/images/buildables/bo2/tranzit-packapunch-wooden-3.png' },
      { order: 8, label: 'Battery: Down stairs, immediately left in alcove.', imageUrl: '/images/buildables/bo2/tranzit-packapunch-battery-1.png' },
      { order: 9, label: 'Battery: Near end before table, floor behind boxes.', imageUrl: '/images/buildables/bo2/tranzit-packapunch-battery-2.png' },
      { order: 10, label: 'Battery: Same area, on top of those boxes.', imageUrl: '/images/buildables/bo2/tranzit-packapunch-battery-3.png' },
      { order: 11, label: 'Frame: Bottom of entrance stairs, against wall. One spawn only.', imageUrl: '/images/buildables/bo2/tranzit-packapunch-frame-1.png' },
    ],
  },
  {
    gameShortName: 'BO2',
    mapSlug: 'tranzit',
    name: 'Turret',
    slug: 'turret',
    type: 'BUILDABLE',
    xpReward: 0,
    description: 'Buildable equipment on the Farm. Parts are a lawn mower, an unusable RPD, and an ammo bag; all parts are found at the Farm. Built at the crafting table on the lower floor of the house. The turret requires power from a Turbine to operate and can down players with only a few shots.',
    steps: [
      { order: 1, label: 'Crafting table: Farm house, through front door, to the left.', imageUrl: '/images/buildables/bo2/tranzit-turret-table.png' },
      { order: 2, label: 'Lawn Mower: Back door of house, outside near barrel.', imageUrl: '/images/buildables/bo2/tranzit-turret-mower-1.png' },
      { order: 3, label: 'Lawn Mower: Across from back door, outside in alcove toward garage.', imageUrl: '/images/buildables/bo2/tranzit-turret-mower-2.png' },
      { order: 4, label: 'Lawn Mower: Barn, front entrance, floor near box.', imageUrl: '/images/buildables/bo2/tranzit-turret-mower-3.png' },
      { order: 5, label: 'Ammo Bag: Farm house, first floor, near TV on table.', imageUrl: '/images/buildables/bo2/tranzit-turret-bullets-1.png' },
      { order: 6, label: 'Ammo Bag: Farm house first floor, fridge room, bookshelf.', imageUrl: '/images/buildables/bo2/tranzit-turret-bullets-2.png' },
      { order: 7, label: 'Ammo Bag: Farm house upstairs, bookshelf.', imageUrl: '/images/buildables/bo2/tranzit-turret-bullets-3.png' },
      { order: 8, label: 'Unusable RPD: Barn upstairs, right of Double Tap, on barrels.', imageUrl: '/images/buildables/bo2/tranzit-turret-gun-1.png' },
      { order: 9, label: 'Unusable RPD: Farm house upstairs, on sofa.', imageUrl: '/images/buildables/bo2/tranzit-turret-gun-2.png' },
      { order: 10, label: 'Unusable RPD: Farm house upstairs, balcony, against wall near Mystery Box.', imageUrl: '/images/buildables/bo2/tranzit-turret-gun-3.png' },
    ],
  },
  {
    gameShortName: 'BO2',
    mapSlug: 'tranzit',
    name: 'Electric Trap',
    slug: 'electric-trap',
    type: 'BUILDABLE',
    xpReward: 0,
    description: 'Buildable equipment in the room above the Power Switch. Shocks and instantly kills zombies that come near until Round 55; not effective against the Avogadro. Built at the table next to the stairs; requires a Turbine to power it.',
    steps: [
      { order: 1, label: 'Crafting table: Right after exiting the Power Plant up the stairs, to the left.', imageUrl: '/images/buildables/bo2/tranzit-etrap-table.png' },
      { order: 2, label: 'Battery: Up stairs from Power Plant, corner by crafting table, on ground.', imageUrl: '/images/buildables/bo2/tranzit-etrap-battery-1.png' },
      { order: 3, label: 'Battery: Right after jumping across the scaffolding, on a barrel.', imageUrl: '/images/buildables/bo2/tranzit-etrap-battery-2.png' },
      { order: 4, label: 'Battery: Past that, down the stairs, on barrels near exit to building.', imageUrl: '/images/buildables/bo2/tranzit-etrap-battery-3.png' },
      { order: 5, label: 'Coil: Directly left of crafting table, floor in corner.', imageUrl: '/images/buildables/bo2/tranzit-etrap-base-1.png' },
      { order: 6, label: 'Coil: Near exit where you jump back down to bus, far left corner when facing bus.', imageUrl: '/images/buildables/bo2/tranzit-etrap-base-2.png' },
      { order: 7, label: 'Coil: Drop down below, on stacked boxes.', imageUrl: '/images/buildables/bo2/tranzit-etrap-base-3.png' },
      { order: 8, label: 'TV Screen: At crafting table, run up stairs · top, immediately right in broken window.', imageUrl: '/images/buildables/bo2/tranzit-etrap-monitor-1.png' },
      { order: 9, label: 'TV Screen: Right after jumping scaffolding gap, window sill straight ahead.', imageUrl: '/images/buildables/bo2/tranzit-etrap-monitor-2.png' },
      { order: 10, label: 'TV Screen: Right before dropping back down to bus, on a barrel.', imageUrl: '/images/buildables/bo2/tranzit-etrap-monitor-3.png' },
    ],
  },
  {
    gameShortName: 'BO2',
    mapSlug: 'tranzit',
    name: 'Jet Gun',
    slug: 'jet-gun',
    type: 'BUILDABLE',
    xpReward: 0,
    description: 'The Jet Gun (Thrustodyne Aeronautics Model 23) is built from four parts in four different areas. Built at the bar in Town across from the bank. Required for the Richtofen main quest path.',
    videoEmbedUrl: 'https://www.youtube.com/embed/-tvSxLP3n5c',
    steps: [
      { order: 1, label: 'How it works: The Jet Gun has four parts in four areas: tunnel (Bus Depot–Diner), Power Station, secret Nacht der Untoten, and Hunter\'s Cabin. Built at the bar in Town across from the bank.' },
      { order: 2, label: 'Crafting table: Bar in Town, across from the bank.', imageUrl: '/images/buildables/bo2/tranzit-jetgun-table.png' },
      { order: 3, label: 'Jet Engine: All three spawns are in the tunnel between Bus Depot and Diner while riding the bus. Parts are scattered along the tunnel.' },
      { order: 4, label: 'Jet Engine: In a corner on the side of the tunnel.', imageUrl: '/images/buildables/bo2/tranzit-jetgun-base-1.png' },
      { order: 5, label: 'Jet Engine: Near a window by the lava.', imageUrl: '/images/buildables/bo2/tranzit-jetgun-base-2.png' },
      { order: 6, label: 'Jet Engine: On the ground between two cars, right by the lava.', imageUrl: '/images/buildables/bo2/tranzit-jetgun-base-3.png' },
      { order: 7, label: 'Wires: All three spawns are at the Power Station bus stop. Go to the exit right before dropping back down to the bus, then drop down into the power plant below.' },
      { order: 8, label: 'Wires: On the side in the area below.', imageUrl: '/images/buildables/bo2/tranzit-jetgun-coil-1.png' },
      { order: 9, label: 'Wires: Across a plank, on the ground.', imageUrl: '/images/buildables/bo2/tranzit-jetgun-coil-2.png' },
      { order: 10, label: 'Wires: In a room at the back of the hall, on a barrel.', imageUrl: '/images/buildables/bo2/tranzit-jetgun-coil-3.png' },
      { order: 11, label: 'Handle: Area: Nacht der Untoten (secret building in the cornfield). To reach it: jump off the bus in the fog between Farm and Power Station; a lamp post on the right side of the road marks an opening to the building. The handle always spawns here.' },
      { order: 12, label: 'Handle: On a fallen filing cabinet on the floor.', imageUrl: '/images/buildables/bo2/tranzit-jetgun-handle-1.png' },
      { order: 13, label: 'Handle: Right side of staircase, first few steps on the ground in the shadows.', imageUrl: '/images/buildables/bo2/tranzit-jetgun-handle-2.png' },
      { order: 14, label: 'Handle: On the shelf near the far back right.', imageUrl: '/images/buildables/bo2/tranzit-jetgun-handle-3.png' },
      { order: 15, label: 'Pressure Gauge: Area: Hunter\'s Cabin, in the fog between Power Station and Town. Marked by a green streetlight. From Power Station head toward Town, or from Town walk into the fog opposite the bus route.' },
      { order: 16, label: 'Pressure Gauge: Bottom left of the fireplace in the cabin.', imageUrl: '/images/buildables/bo2/tranzit-jetgun-gauge-1.png' },
      { order: 17, label: 'Pressure Gauge: On the ground on a spring mattress in the cabin.', imageUrl: '/images/buildables/bo2/tranzit-jetgun-gauge-2.png' },
      { order: 18, label: 'Pressure Gauge: On a table across from the fireplace.', imageUrl: '/images/buildables/bo2/tranzit-jetgun-gauge-3.png' },
    ],
  },
  {
    gameShortName: 'BO2',
    mapSlug: 'tranzit',
    name: 'NAV Table',
    slug: 'nav-table',
    type: 'BUILDABLE',
    xpReward: 0,
    description: 'Buildable used for the Tower of Babble and Navcard system. Four parts: meteorite, table (board), radio, electrical box. Parts spawn only on Original difficulty. Built underneath the giant telephone tower in the cornfield (the table is invisible).',
    videoEmbedUrl: 'https://www.youtube.com/embed/FiuN7NveWyg',
    steps: [
      { order: 1, label: 'Crafting table: The table is invisible. It is built underneath the giant telephone tower in the cornfield, against the fence.', imageUrl: '/images/buildables/bo2/tranzit-nav-table.png' },
      { order: 2, label: 'Meteorite: Bus Depot, near the bus in a burning hole against the depot. One spawn only.', imageUrl: '/images/buildables/bo2/tranzit-nav-meteor.png' },
      { order: 3, label: 'Table: Between Bus Depot and Diner, near the lava on the ground.', imageUrl: '/images/buildables/bo2/tranzit-nav-board-1.png' },
      { order: 4, label: 'Table: Drop down inside the power plant, near the end on the ground near metal scaffolding.', imageUrl: '/images/buildables/bo2/tranzit-nav-board-2.png' },
      { order: 5, label: 'Radio: Diner, car garage, on top of a cabinet.', imageUrl: '/images/buildables/bo2/tranzit-nav-radio-1.png' },
      { order: 6, label: 'Radio: Nacht der Untoten, on a filing cabinet on the ground.', imageUrl: '/images/buildables/bo2/tranzit-nav-radio-2.png' },
      { order: 7, label: 'Electrical Box: Farm house, to the left of the fridge on the wall.', imageUrl: '/images/buildables/bo2/tranzit-nav-switch-1.png' },
      { order: 8, label: 'Electrical Box: Town, all the way in the back to the left, leaning against a dumpster (Mystery Box location on Survival Town).', imageUrl: '/images/buildables/bo2/tranzit-nav-switch-2.png' },
    ],
  },
  // ——— Die Rise (BO2) ———
  {
    gameShortName: 'BO2',
    mapSlug: 'die-rise',
    name: 'High Maintenance (Richtofen)',
    slug: 'high-maintenance-richtofen',
    type: 'MAIN_QUEST',
    xpReward: 4000,
    playerCountRequirement: 'SQUAD',
    variantTag: 'Richtofen',
    videoEmbedUrl: 'https://www.youtube.com/embed/uuK5X5QFT6Y',
    description:
      'Activate the second Pylon for Richtofen. Requires four players and Original difficulty. Building the NAV table is required to start the Easter Egg and for the Buried ending. This Easter Egg can be glitchy; be prepared to encounter issues.',
    rewardsDescription:
      'All six available perks (Juggernog, Quick Revive, Speed Cola, Double Tap, Mule Kick, Who\'s Who). Perks can be lost if downed. Does not include PhD Flopper (not in the map).',
    steps: [
      { order: 1, label: '[Step 1]: Turn on power. Build the NAV table (required to start the Easter Egg and for the final Buried ending). Standing on symbols may not work until the NAV table is built.' },
      { order: 2, label: '[Step 2]: All four players must step on the four golden rings on top of four elevators at the same time. [Locations]: (1) Elevator that leads to the Bowie Knife, accessible from the power room. (2) Elevator near the Remington 870 MCS and MP5. (3) Top of the Quick Revive elevator. (4) The other elevator next to Quick Revive—both are adjacent to where you build the Trample Steam. Warning: elevators can crush you if you stand on them near the top floor. Once done, Richtofen and Maxis will speak.' },
      { order: 3, label: '[Step 3]: Match the gold symbols on the floor in sequential order. [Locations]: One by the M14; one above the AK74u; one on the roof to the left of the Semtex Grenades; one past the SVU-AS by the cafeteria. They match the elevator symbols. Step on them in the correct order to light them (wrong order resets). The order changes per game. Once all four are lit, Richtofen and Maxis will speak.' },
      { order: 4, label: '[Step 4]: Get any sniper rifle and look into the two dragons\' mouths on the roof. Shoot the small ball in each mouth. Both balls teleport under the lions\' paws in the starting room, adjacent to the Olympia. This is where you choose a side (Richtofen or Maxis).' },
      { order: 5, label: '[Step 5 — Richtofen]: The player with the Sliquifier must shoot the two balls until they spin. This takes 20 direct shots on each ball; save Sliquifier ammo before this step. Once both balls are spinning, Richtofen will ask for a "blood sacrifice". Maxis is then locked out of the systems.' },
      { order: 6, label: '[Step 6 — Richtofen]: Place a Trample Steam on each of the four golden zombie symbols (with circles), facing the radio tower. [Locations]: One near spawn by the M14; two near the Claymores on the roof with the NAV table, next to the pathway down; one near the Semtex on the same building. Let zombies be killed by the Trample Steams (or activate by players/zombies being flung). Tip: do not clear the couch debris blocking the escalator near the M14 so zombies come from one direction. You must hear all four Richtofen quotes. Richtofen will then tell Samuel to use the Galvaknuckles (any player can use them).', buildableReferenceSlug: 'trample-steam' },
      { order: 7, label: '[Mahjong tiles]: Eight Mahjong tiles (four compass directions, four color-coded order) show the order to melee the radio tower with the Galvaknuckles. Order changes per game. Four tiles = compass (North, South, East, West); four = order (colors: red, blue, green, black). Same color links a direction to its order (e.g. green North + green "3" = hit North third). The tile for 1 is a bird, not bamboo. [Spawn locations]: On the tower corner (North tile); spawn room on the same desk as the Trample Steam compressor; bottom of escalator near M14; broken stairs to SVU-AS; couch with four cushions near initial Mystery Box; last level of elevator shaft above AN-94; Buddha room, top level at the back right; shelf near Sliquifier (soda can and basket); table with sewing machine in power room; lawn chair near Mystery Box on roof; kitchen near MP5.', imageUrl: '/images/easter-eggs/dierise-mojang.webp' },
      { order: 8, label: '[Final step]: Melee the four bars on the radio tower with the Galvaknuckles in the order given by the Mahjong tiles. North faces the Trample Steam room (tile on its corner); West faces the sun; South and East are the opposites. One attempt per round—wrong order and the tower stops glowing until the next round. Success: electricity surge, tower lights blue, dragon flares spark, High Maintenance achievement unlocks.' },
    ],
  },
  {
    gameShortName: 'BO2',
    mapSlug: 'die-rise',
    name: 'High Maintenance (Dr. Maxis)',
    slug: 'high-maintenance-maxis',
    type: 'MAIN_QUEST',
    xpReward: 4000,
    playerCountRequirement: 'SQUAD',
    variantTag: 'Dr. Maxis',
    videoEmbedUrl: 'https://www.youtube.com/embed/sAby0Y6FMyc',
    description:
      'Activate the second Pylon for Dr. Maxis. Requires four players and Original difficulty. Building the NAV table is required. Insert the TranZit Navcard into the NAV table on Die Rise for the full story. This Easter Egg can be glitchy.',
    rewardsDescription:
      'All six available perks (Juggernog, Quick Revive, Speed Cola, Double Tap, Mule Kick, Who\'s Who). Perks can be lost if downed.',
    steps: [
      { order: 1, label: '[Step 1]: Turn on power. Build the NAV table and insert the TranZit Navcard (required for the Buried ending). Standing on symbols may not work until the NAV table is built.' },
      { order: 2, label: '[Step 2]: All four players must step on the four golden rings on top of the four elevators simultaneously. [Locations]: (1) Elevator to Bowie Knife from power room. (2) Elevator near Remington 870 MCS and MP5. (3) Quick Revive elevator. (4) Other elevator next to Quick Revive (both by Trample Steam build area). Watch for elevator crush near the top floor. Richtofen and Maxis will speak when done.' },
      { order: 3, label: '[Step 3]: Light the four gold floor symbols in the correct order by stepping on them. [Locations]: By the M14; above the AK74u; on the roof left of Semtex; past the SVU-AS by the cafeteria. Order changes per game; wrong order resets. When all four are lit, dialogue plays.' },
      { order: 4, label: '[Step 4]: Use any sniper to shoot the two small balls from the dragons\' mouths on the roof. The balls teleport under the lions\' paws in the starting room (adjacent to the Olympia). You choose Maxis or Richtofen here.' },
      { order: 5, label: '[Step 5 — Maxis]: In the Buddha (upside-down) room, kill zombies so their blood spills until Maxis says to stop (about 50–100 zombies). Then get the Ballistic Knife from the Mystery Box and Pack-a-Punch it to obtain the Krauss Refibrillator. Have Russman down himself; in the Buddha room, shoot him with the upgraded Ballistic Knife to revive him and trigger Maxis dialogue.' },
      { order: 6, label: '[Step 6 — Maxis]: Place four Trample Steams on the four gold lion floor symbols. Use them to "fire" the dragon balls as Maxis prompts (all four players must participate). Once complete, proceed to the Mahjong step.', buildableReferenceSlug: 'trample-steam' },
      { order: 7, label: '[Mahjong tiles]: Find the eight Mahjong tiles to learn the Galvaknuckles order for the radio tower. Four tiles are compass directions (N/S/E/W); four are color-coded order (red, blue, green, black). Same color links direction to order (e.g. green North + green 3 = hit North third). Order 1 is a bird tile. [Locations]: Tower corner; spawn desk (Trample Steam compressor); escalator near M14; broken stairs to SVU-AS; couch near Mystery Box; elevator shaft above AN-94; Buddha room top back right; shelf near Sliquifier; power room sewing table; roof lawn chair; kitchen near MP5.', imageUrl: '/images/easter-eggs/dierise-mojang.webp' },
      { order: 8, label: '[Final step]: Melee the four bars on the radio tower with the Galvaknuckles in the Mahjong order. North = toward Trample Steam room; West = toward the sun. One try per round; wrong order stops the tower until next round. Success: tower lights orange (Maxis), High Maintenance achievement unlocks.' },
    ],
  },
  {
    gameShortName: 'BO2',
    mapSlug: 'die-rise',
    name: 'We All Fall Down',
    slug: 'we-all-fall-down',
    type: 'MUSICAL',
    xpReward: 0,
    description:
      'Musical Easter egg by Kevin Sherwood and Clark S. Nova. Activate by finding and interacting with three Teddy Bears in order.',
    steps: [
      { order: 1, label: 'First Teddy Bear: Near the SVU-AS wall buy.' },
      { order: 2, label: 'Second Teddy Bear: Near the edge of the upside-down Buddha room.' },
      { order: 3, label: 'Third Teddy Bear: In the power room, back right corner near the Power Switch. Press the action button on all three in this order to play We All Fall Down.' },
    ],
  },
  {
    gameShortName: 'BO2',
    mapSlug: 'die-rise',
    name: 'PhD Flopper Tease',
    slug: 'phd-flopper-tease',
    type: 'SIDE_QUEST',
    xpReward: 0,
    description:
      'A visual tease: the elevator next to spawn can crash down and pass through several floors. On one floor, a PhD Flopper machine is visible facing the elevator. The perk cannot be obtained; it is only a visual Easter egg.',
    steps: [
      { order: 1, label: 'Use the elevator right next to spawn and let it crash down through the floors. Watch closely: on one of the floors you will see a PhD Flopper machine facing the elevator. It is not obtainable.' },
    ],
  },
  {
    gameShortName: 'BO2',
    mapSlug: 'die-rise',
    name: 'Free Perk',
    slug: 'free-perk',
    type: 'SIDE_QUEST',
    xpReward: 0,
    description:
      'During a Max Ammo round, kill every crawler without missing a single bullet. You are rewarded with both a Max Ammo and a Random Perk power-up.',
    steps: [
      { order: 1, label: 'When a Max Ammo round starts, kill all crawlers without missing a bullet. Success: you receive both a Max Ammo and a Random Perk power-up.' },
    ],
  },
  {
    gameShortName: 'BO2',
    mapSlug: 'die-rise',
    name: 'Trample Steam',
    slug: 'trample-steam',
    type: 'BUILDABLE',
    xpReward: 0,
    description:
      'Buildable that flings players and zombies. Once placed, zombies or players that step on it are flung; zombies die on impact. Required for both High Maintenance paths. You can only carry one part at a time. All parts are in or near the starting room.',
    steps: [
      { order: 1, label: 'Crafting table: In the room below spawn. Reach it by jumping back from near the radio tower on the opposing roof, or with a careful drop down from spawn.', imageUrl: '/images/buildables/bo2/dierise-trample-table.png' },
      { order: 2, label: 'Bellows: Spawn room, stairs on the left above the door.', imageUrl: '/images/buildables/bo2/dierise-trample-billows-1.png' },
      { order: 3, label: 'Bellows: Through the spawn door to the left, in the hallway under a painting.', imageUrl: '/images/buildables/bo2/dierise-trample-billows-2.png' },
      { order: 4, label: 'Flag: To the right of the spawn door in the spawn room, on a chair.', imageUrl: '/images/buildables/bo2/dierise-trample-flag-1.png' },
      { order: 5, label: 'Flag: Out the spawn room door to the right, leaning against the rail near the escalator.', imageUrl: '/images/buildables/bo2/dierise-trample-flag-2.png' },
      { order: 6, label: 'Chicken Wire: To the left of the door in the spawn room, against the wall.', imageUrl: '/images/buildables/bo2/dierise-trample-base-1.png' },
      { order: 7, label: 'Chicken Wire: After leaving spawn through the left door, to the left of the elevator against the wall.', imageUrl: '/images/buildables/bo2/dierise-trample-base-2.png' },
      { order: 8, label: 'Motor: On the table in the middle of the spawn room.', imageUrl: '/images/buildables/bo2/dierise-trample-motor-1.png' },
      { order: 9, label: 'Motor: Leave spawn to the left; at the elevator take a right. At the end of the hallway before the drop down, on the floor to the left.', imageUrl: '/images/buildables/bo2/dierise-trample-motor-2.png' },
    ],
  },
  {
    gameShortName: 'BO2',
    mapSlug: 'die-rise',
    name: 'Sliquifier',
    slug: 'sliquifier',
    type: 'BUILDABLE',
    xpReward: 0,
    description:
      'Buildable wonder weapon that fires purple liquid; creates slippery puddles and can chain-kill zombies on direct contact. Carried as a primary weapon. Required for the Richtofen path of High Maintenance (spin the dragon balls with 20 direct shots each). All parts are in the same building; only one door (to power) is required. Clearing the staircase debris is optional.',
    steps: [
      { order: 1, label: 'Crafting table: In the lab area at the bottom of some stairs.', imageUrl: '/images/buildables/bo2/dierise-sliquifier-table.png' },
      { order: 2, label: 'Handbrake (trigger/grip): To the left of the table in the kitchen, on the counter.', imageUrl: '/images/buildables/bo2/dierise-sliquifier-handle-1.png' },
      { order: 3, label: 'Handbrake (trigger/grip): In the power switch room, on a table near the sewing machine and the elevator shaft.', imageUrl: '/images/buildables/bo2/dierise-sliquifier-handle-2.png' },
      { order: 4, label: 'Gas canister (propellant): Directly to the right of the crafting table, in a cage on the ground.', imageUrl: '/images/buildables/bo2/dierise-sliquifier-extinguisher-1.png' },
      { order: 5, label: 'Gas canister (propellant): In the power switch room, on a table.', imageUrl: '/images/buildables/bo2/dierise-sliquifier-extinguisher-2.png' },
      { order: 6, label: 'Wires and discs (main body): In the showers room, on a table outside the power room.', imageUrl: '/images/buildables/bo2/dierise-sliquifier-mirror-1.png' },
      { order: 7, label: 'Wires and discs (main body): Turn around from the crafting table; on a barrel at the bottom of the stairs.', imageUrl: '/images/buildables/bo2/dierise-sliquifier-mirror-2.png' },
      { order: 8, label: 'Mannequin foot (stock): Turn around and go up the stairs from the crafting table; in the room with the TV, on the floor in the middle. This part never moves.', imageUrl: '/images/buildables/bo2/dierise-sliquifier-boot-1.png' },
    ],
  },
  {
    gameShortName: 'BO2',
    mapSlug: 'die-rise',
    name: 'NAV Table & Navcards',
    slug: 'nav-table-navcards',
    type: 'SIDE_QUEST',
    xpReward: 0,
    description:
      'The NAV table and Navcards connect TranZit, Die Rise, and Buried. Each map has a buildable NAV table and a Navcard. Parts spawn only on Original difficulty. Once the table is built, it is saved to your profile and auto-built in future games if all players have built it before. Insert the TranZit Navcard into the Die Rise table to progress the story.',
    steps: [
      { order: 1, label: 'Die Rise Navcard location: In the same room as the PDW-57, next to two glass display cases near the elevator for Speed Cola / Who\'s Who. Pick it up (if you have the TranZit Navcard, insert that into the reader first; the Die Rise card is then available to take to Buried).', imageUrl: '/images/buildables/bo2/dierise-navcard.png' },
      { order: 2, label: 'NAV table: Build the NAV table on each map (TranZit, Die Rise, Buried) from four parts: meteorite, table/board (plank), radio, electrical box. Built near each map\'s polarization tower. Die Rise\'s table is invisible and built underneath the dragon on the roof.' },
      { order: 3, label: 'Navcard order: TranZit Navcard → insert in Die Rise\'s NAV table. Die Rise Navcard → insert in Buried\'s NAV table. Buried Navcard → insert in TranZit\'s NAV table (under the pylon). You can only hold one Navcard at a time.' },
      { order: 4, label: 'Once all three Navcards are inserted correctly and each map\'s side quest is completed, the icons pulse on the world map with lightning. All Navcards must be inserted to access the story endings in Buried (Maxis or Richtofen).' },
    ],
  },
  {
    gameShortName: 'BO2',
    mapSlug: 'die-rise',
    name: 'NAV Table',
    slug: 'nav-table',
    type: 'BUILDABLE',
    xpReward: 0,
    description:
      'Buildable for the Navcard system (TranZit → Die Rise → Buried). Four parts: meteorite, wooden plank, radio, electrical box. Built underneath the dragon on the roof; the table is invisible—you start building there once you have a part. Required to start the High Maintenance Easter Egg and for the Buried ending. Parts spawn only on Original difficulty.',
    steps: [
      { order: 1, label: 'Crafting table: Underneath the dragon on the roof. The table is invisible; you start building here once you have a part.', imageUrl: '/images/buildables/bo2/dierise-nav-table.png' },
      { order: 2, label: 'Meteorite: Near the Claymore buy on the ground on the roof.', imageUrl: '/images/buildables/bo2/dierise-nav-meteor-1.png' },
      { order: 3, label: 'Wooden plank: On the roof under the dragon, next to where you build the table.', imageUrl: '/images/buildables/bo2/dierise-nav-plank-1.png' },
      { order: 4, label: 'Radio: Behind the stairs in front of the dragon on the roof, on the ground.', imageUrl: '/images/buildables/bo2/dierise-nav-radio-1.png' },
      { order: 5, label: 'Electrical box: On the ground near the Mule Kick elevator on the roof, in the corner. (Alternatively: climb the scaffolding next to the dragon, jump down to the Semtex platform, go to the end and drop down in front of the separated elevator; it is on the ground leaning on a building.)', imageUrl: '/images/buildables/bo2/dierise-nav-switch-1.png' },
    ],
  },

  // ——— Buried (BO2) ———
  // ——— Buried (BO2): Buildables ———

  {
    gameShortName: 'BO2',
    mapSlug: 'buried',
    name: 'Crafting Tables',
    slug: 'crafting-tables',
    type: 'BUILDABLE',
    xpReward: 0,
    description:
      'On Buried, most buildables (Turbine, Trample Steam, Subsurface Resonator, etc.) share the same four crafting tables. The NAV Table has its own build spot near spawn (after the well). Choose any one of the four tables for the other buildables; you do not need to use the same table for every build.',
    steps: [
      {
        order: 1,
        label: 'Table 1: Above the jail.',
        imageUrl: '/images/buildables/bo2/buried-table-1.png',
      },
      {
        order: 2,
        label: 'Table 2: First floor of the saloon.',
        imageUrl: '/images/buildables/bo2/buried-table-2.png',
      },
      {
        order: 3,
        label: 'Table 3: First floor of the courthouse.',
        imageUrl: '/images/buildables/bo2/buried-table-3.png',
      },
      {
        order: 4,
        label: 'Table 4: To the left inside the church.',
        imageUrl: '/images/buildables/bo2/buried-table-4.png',
      },
    ],
  },
  {
    gameShortName: 'BO2',
    mapSlug: 'buried',
    name: 'Turbine',
    slug: 'turbine',
    type: 'BUILDABLE',
    xpReward: 0,
    description:
      'Buildable used to power the Subsurface Resonator (Maxis\' path) and other mechanics. Three parts: Mannequin, Fan, and Tail. Build at any of the four crafting tables on the map.',
    steps: [
      {
        order: 1,
        label:
          'Crafting table: All buildables on Buried share the same four tables. Choose one: above the jail; first floor of the saloon; first floor of the courthouse; or to the left inside the church. See the Crafting Tables guide for locations and images.',
        buildableReferenceSlug: 'crafting-tables',
      },
      {
        order: 2,
        label: 'Mannequin: In the back right corner, in the back room, on the main floor of the General Store.',
        imageUrl: '/images/buildables/bo2/buried-turbine-mannequin.png',
      },
      {
        order: 3,
        label: 'Fan: In the back room of the General Store, on the second floor, to the immediate right, on a desk.',
        imageUrl: '/images/buildables/bo2/buried-turbine-fan.png',
      },
      {
        order: 4,
        label: 'Tail: On the set of shelves (bookshelf) on the far left, on the first floor of the General Store, when entering through the front door.',
        imageUrl: '/images/buildables/bo2/buried-turbine-tail.png',
      },
    ],
  },
  {
    gameShortName: 'BO2',
    mapSlug: 'buried',
    name: 'NAV Table & Navcards',
    slug: 'nav-table-navcards',
    type: 'SIDE_QUEST',
    xpReward: 0,
    description:
      'The NAV table and Navcards connect TranZit, Die Rise, and Buried. Each map has a buildable NAV table and a Navcard. Parts spawn only on Original difficulty. Once the table is built, it is saved to your profile and auto-built in future games if all players have built it before. Insert the Die Rise Navcard into the Buried table to progress; the Buried Navcard is then available to take to TranZit.',
    steps: [
      {
        order: 1,
        label:
          'Buried Navcard: Found on Buried (pick up after inserting the Die Rise Navcard into the Buried NAV table). Take the Buried Navcard to TranZit and insert it into the TranZit NAV table under the pylon. You can only hold one Navcard at a time.',
      },
      {
        order: 2,
        label:
          'NAV table: Build the NAV table on each map (TranZit, Die Rise, Buried) from four parts: meteorite, table/board, radio, electrical box. Built near each map\'s polarization tower. On Buried, parts are in the crevice behind the barn and Gunsmith (except the meteorite—see NAV Table buildable guide).',
      },
      {
        order: 3,
        label:
          'Navcard order: TranZit Navcard → insert in Die Rise\'s NAV table. Die Rise Navcard → insert in Buried\'s NAV table. Buried Navcard → insert in TranZit\'s NAV table (under the pylon). You can only hold one Navcard at a time.',
      },
      {
        order: 4,
        label:
          'Once all three Navcards are inserted correctly and each map\'s side quest is completed, the icons pulse on the world map with lightning. All Navcards must be inserted to access the story endings in Buried (Maxis or Richtofen).',
      },
    ],
  },
  {
    gameShortName: 'BO2',
    mapSlug: 'buried',
    name: 'NAV Table',
    slug: 'nav-table',
    type: 'BUILDABLE',
    xpReward: 0,
    description:
      'Buildable for the Navcard system (TranZit → Die Rise → Buried). Four parts: meteorite, table/board, radio, electrical box. Built near the polarization tower on Buried. Required to access the Mined Games endgame (Richtofen or Maxis ending). Parts spawn only on Original difficulty. Once built, it is saved to your profile.',
    steps: [
      {
        order: 1,
        label:
          'Crafting table: The NAV Table has its own build spot (not the shared four tables). Near spawn, reachable after going through the well in the maze. Build the NAV table there, near the polarization tower.',
        imageUrl: '/images/buildables/bo2/buried-nav-craftingtable.png',
      },
      {
        order: 2,
        label:
          'Radio: Behind the barn, in the alcove on the corner (same area as the other NAV parts).',
        imageUrl: '/images/buildables/bo2/buried-nav-radio.png',
      },
      {
        order: 3,
        label:
          'Table: In the same area behind the barn, in a corner on the floor.',
        imageUrl: '/images/buildables/bo2/buried-nav-table.png',
      },
      {
        order: 4,
        label:
          'Electrical box: On the wall near the other NAV parts behind the barn.',
        imageUrl: '/images/buildables/bo2/buried-nav-electrical.png',
      },
      {
        order: 5,
        label:
          'Meteorite: In the Processing spawn area, reachable only by going through the well near Pack-a-Punch in the maze after having Arthur (Huckleberry) run into the fountain near the church.',
        imageUrl: '/images/buildables/bo2/buried-nav-meteor.png',
      },
    ],
  },
  {
    gameShortName: 'BO2',
    mapSlug: 'buried',
    name: 'Trample Steam',
    slug: 'trample-steam',
    type: 'BUILDABLE',
    xpReward: 0,
    description:
      'Buildable that launches players and zombies when activated. Requires a Turbine to function. Four parts: Flag, Motor, Bellows, and Base. Build at any of the four crafting tables on Buried. Used in Mined Games (Maxis) to power the lantern.',
    steps: [
      {
        order: 1,
        label:
          'Crafting table: All buildables on Buried share the same four tables. Choose one and build the Trample Steam there. See the Crafting Tables guide for table locations and images.',
        buildableReferenceSlug: 'crafting-tables',
      },
      {
        order: 2,
        label: 'Flag: In a barrel below the staircase.',
        imageUrl: '/images/buildables/bo2/buried-trample-flag.png',
      },
      {
        order: 3,
        label:
          'Motor: On the shelves in the middle of the main room in the General Store, on the shelf below the half-fallen shelf.',
        imageUrl: '/images/buildables/bo2/buried-trample-motor.png',
      },
      {
        order: 4,
        label: 'Bellows: On the table in the back room on the second floor of the General Store.',
        imageUrl: '/images/buildables/bo2/buried-trample-bellows.png',
      },
      {
        order: 5,
        label: 'Base: Leaning against the banister upstairs in the General Store.',
        imageUrl: '/images/buildables/bo2/buried-trample-base.png',
      },
    ],
  },
  {
    gameShortName: 'BO2',
    mapSlug: 'buried',
    name: 'Subsurface Resonator',
    slug: 'subsurface-resonator',
    type: 'BUILDABLE',
    xpReward: 0,
    description:
      'Buildable that projects a sonic blast to kill or knock back zombies. Requires a Turbine to function. Used for the Death From Below achievement and on the Maxis side of Mined Games (to destroy the four red orbs). All parts are in the General Store, near the first Mystery Box spawn.',
    steps: [
      {
        order: 1,
        label:
          'Crafting table: All buildables on Buried share the same four tables. Choose one and build the Subsurface Resonator there. See the Crafting Tables guide for table locations and images.',
        buildableReferenceSlug: 'crafting-tables',
      },
      {
        order: 2,
        label:
          'Wheel: Leaning against the wall, to the right of the doorway to the back room, on the main floor of the General Store.',
        imageUrl: '/images/buildables/bo2/buried-resonator-wheel.png',
      },
      {
        order: 3,
        label:
          'Mount: Leaning against the wall opposite the table, down the hallway toward the back door of the General Store.',
        imageUrl: '/images/buildables/bo2/buried-resonator-mount.png',
      },
      {
        order: 4,
        label: 'Speaker: On a counter before the Weapon Locker in the General Store.',
        imageUrl: '/images/buildables/bo2/buried-resonator-speaker.png',
      },
      {
        order: 5,
        label: 'Motor: In a corner at the top of the staircase in the General Store.',
        imageUrl: '/images/buildables/bo2/buried-resonator-motor.png',
      },
    ],
  },
  {
    gameShortName: 'BO2',
    mapSlug: 'buried',
    name: 'Head Chopper',
    slug: 'head-chopper',
    type: 'BUILDABLE',
    xpReward: 0,
    description:
      'Buildable trap that kills zombies with a spinning saw. Four parts: Stand, Crank, Hinge, and Saw. All parts are found in the General Store. Build at any of the four crafting tables. When built, any player can pick it up as long as they do not have another buildable. Used in Mined Games (Maxis) to power the lantern.',
    steps: [
      {
        order: 1,
        label:
          'Crafting table: All buildables on Buried share the same four tables. Choose one and build the Head Chopper there. See the Crafting Tables guide for table locations and images.',
        buildableReferenceSlug: 'crafting-tables',
      },
      {
        order: 2,
        label: 'Stand: In the back room of the General Store, on the ground floor.',
        imageUrl: '/images/buildables/bo2/buried-chopper-stand.png',
      },
      {
        order: 3,
        label: 'Crank: On the shelf in the center of the General Store.',
        imageUrl: '/images/buildables/bo2/buried-chopper-crank.png',
      },
      {
        order: 4,
        label: 'Hinge: On the counter in the middle back of the General Store.',
        imageUrl: '/images/buildables/bo2/buried-chopper-hinge.png',
      },
      {
        order: 5,
        label: 'Saw: In a barrel in the back of the General Store.',
        imageUrl: '/images/buildables/bo2/buried-chopper-saw.png',
      },
    ],
  },

  // ——— Buried: Main Quest ——— Mined Games (Richtofen's Path)

  {
    gameShortName: 'BO2',
    mapSlug: 'buried',
    name: 'Mined Games (Richtofen\'s Path)',
    slug: 'mined-games-richtofen',
    type: 'MAIN_QUEST',
    xpReward: 4500,
    variantTag: 'Richtofen',
    playerCountRequirement: 'SQUAD',
    videoEmbedUrl: 'https://www.youtube.com/embed/bDWvp6yef48',
    description:
      'Richtofen\'s side of the Mined Games Easter egg. Build the Guillotine and power it via the wisp to complete eight steps. Requires Original difficulty. Steps 1–5 can be done solo; Step 6 requires four players. Completing this path locks it until you complete Maxis\' path (and vice versa). Must be in the game from the lobby to save the completion to your profile.',
    rewardsDescription:
      'Mined Games achievement. All perks for the rest of the game. To get Richtofen\'s story ending, complete the Endgame step (all four players must have completed Tower of Babble, High Maintenance, and Mined Games on Richtofen\'s side, with Navcards inserted).',
    steps: [
      {
        order: 1,
        label:
          '[Step 1 — Building the Guillotine]: Build the Guillotine parallel to the side of the saloon. This step commits the game to Richtofen\'s path. Gather all four parts (satellite dish, spool of wire, crystal, antennae) and build at the Guillotine site next to the saloon.',
      },
      {
        order: 2,
        label:
          '[Step 2 — Powering the Red Orbs]: Power up four red orbs using the Paralyzer. Locations: (1) In the alleyway between the saloon and the candy shop. (2) To the left side of the entrance to the church, behind a rock. (3) In the tunnel system above the town. (4) To the right side in the foliage before the entrance to the mansion from the maze.',
      },
      {
        order: 3,
        label:
          '[Step 3 — The Lantern]: Use a grenade to knock a purple lantern out of the air as it floats from the courtroom to the church, or from the courtroom to the jail cell. Pick it up. To power the lantern, "kill" at least 10 Mistresses in the Haunted Mansion. After it has enough souls, place the lantern on the symbol on the roof of the Gunsmith shop.',
      },
      {
        order: 4,
        label:
          '[Step 4 — Deciphering the Code]: Decipher the code that appears above the symbol on the wall using the "tic-tac-toe" cipher. This reveals the names of three tunnel signs. You need to hit those three signs with the Galvaknuckles or the Bowie Knife (in any order) to make the wisp appear. The three signs are randomly chosen from the five available.',
        imageUrl: '/images/easter-eggs/buried-mainegg-1.webp',
      },
      {
        order: 5,
        label:
          '[The Five Tunnel Signs]: In the tunnels you will find five signs. Each is 17 characters long (counting spaces). You only need to decode the first letter of each sign, as all five first letters are different. The three names revealed by the cipher correspond to three of these signs—hit those three with Galvaknuckles or Bowie Knife to spawn the wisp.',
        imageUrl: '/images/easter-eggs/buried-mainegg-2.webp',
      },
      {
        order: 6,
        label:
          'Sign: DRY GULCHER SHAFT — First letter D. One of the five tunnel signs. Hit it (if it was revealed by the cipher) with Galvaknuckles or Bowie Knife to contribute to spawning the wisp.',
      },
      {
        order: 7,
        label:
          'Sign: LUNGER UNDERMINES — First letter L. One of the five tunnel signs. Hit it (if revealed by the cipher) with Galvaknuckles or Bowie Knife.',
        imageUrl: '/images/easter-eggs/buried-mainegg-3.webp',
      },
      {
        order: 8,
        label:
          'Sign: CONSUMPTION CROSS — First letter C. One of the five tunnel signs. Hit it (if revealed by the cipher) with Galvaknuckles or Bowie Knife.',
        imageUrl: '/images/easter-eggs/buried-mainegg-4.webp',
      },
      {
        order: 9,
        label:
          'Sign: GROUND BITER PITS — First letter G. One of the five tunnel signs. Hit it (if revealed by the cipher) with Galvaknuckles or Bowie Knife.',
        imageUrl: '/images/easter-eggs/buried-mainegg-5.webp',
      },
      {
        order: 10,
        label:
          'Sign: BONE ORCHARD VEIN — First letter B. One of the five tunnel signs. Hit it (if revealed by the cipher) with Galvaknuckles or Bowie Knife.',
        imageUrl: '/images/easter-eggs/buried-mainegg-6.webp',
      },
      {
        order: 11,
        label:
          '[Step 5 — Powering the Guillotine via Wisp]: You must have Vulture Aid to see the wisp. Pass through the wisp within 15 seconds or it fades and you must hit the signs again. Only players with Vulture Aid can see and move it. After passing through, it reappears elsewhere (visible through walls with Vulture Aid). Initial locations depend on which sign was hit last: (G or B) in front of sign, then Courthouse near Speed Cola or tunnel between G sign and Quick Revive; (D) in front of sign, then tunnel between L and C signs, right of Guillotine crystal; (L) in front of sign, then tunnel next to C sign; (C) in front of sign, then near Quick Revive, then enclosed area near upper Bank entrance (drop down hole between L sign and Guillotine crystal). Then: second level of barn → second floor of jail (past wall weapon) → second floor of general store → Candy Store (Power Switch floor) or tunnel Bank–Gunsmith then Gunsmith second floor near Mule Kick → in front of the Guillotine. Lure zombies near the Guillotine; kill them so orbs flow in and power the crystal. When fully powered, Richtofen says you need a Time Bomb.',
      },
      {
        order: 12,
        label:
          '[Step 6 — The Switch in the Future]: Four players are required. Place a Time Bomb ON the Guillotine bench and have all four players stand around the Guillotine. Activate the Time Bomb to go to Round ∞ (black and white, near-invulnerable zombies). You have 60 seconds to find the switch on one of the dead bodies (Misty, Marlton, Samuel, Russman). Bodies spawn at: in front of the Guillotine; past the previous body under the "G" in GUNSMITH; in front of the saloon stairs; left of Gunsmith entrance; crevice behind barn and Gunsmith (Navcard table area); alley between bank and barn (body on bank wall); in front of jail; between general store and box; right of candy store (from courthouse, near drop from general store balcony); between rock near gallows and candy store awning; behind rock left of church (red orb); just past church entrance near workbench; between Witch\'s house and debris (phased into rock). Add the switch to the Guillotine after returning (not while in Round ∞). If you fail, you need another Time Bomb (e.g. from box or Max Ammo). Arthur can be fed candy for power-ups; Monkey Bombs work in Round ∞. Ammo and equipment are refunded when you return.',
      },
      {
        order: 13,
        label:
          '[Step 7 — Switches in the Maze]: Enter the maze. Four gates have levers (Red, Green, Blue, Yellow). All four players must activate the levers in the correct order (trial and error). When all four have been pulled, levers in the correct order will spark. If the order is wrong, activate all levers again and have all four players return to the main area, then run through the Mistress\'s house together to reset. Note: Yellow may sometimes be hidden in the hedges near the fountain/teleport.',
      },
      {
        order: 14,
        label:
          '[Step 8 — Make a Wish]: Interact with the fountain in front of the church/mansion to "make a wish." Metal targets spawn via lightning in four areas; every player must shoot ALL targets before they disappear. Locations: beside candy store, in front of courtroom (20); left side of mansion, in windows (23); inside saloon (19); by jail cell (22). Paralyzer works on targets. Tip: Give Arthur candy near a crawler so the round does not end mid-challenge. Richtofen\'s side is complete—all perks for the rest of the game. For the full story ending, complete the Endgame (see Easter Egg Tracker guide).',
      },
    ],
  },

  // ——— Mined Games (Maxis' Path)

  {
    gameShortName: 'BO2',
    mapSlug: 'buried',
    name: 'Mined Games (Maxis\' Path)',
    slug: 'mined-games-maxis',
    type: 'MAIN_QUEST',
    xpReward: 4500,
    variantTag: 'Maxis',
    playerCountRequirement: 'SQUAD',
    videoEmbedUrl: 'https://www.youtube.com/embed/o-1-ayQYJPY',
    description:
      'Maxis\' side of the Mined Games Easter egg. Build the Gallows and power it via the wisp to complete eight steps. Requires Original difficulty. Steps 1–6 can be done solo; the final steps benefit from the full team. Completing this path locks it until you complete Richtofen\'s path (and vice versa). Must be in the game from the lobby to save the completion to your profile.',
    rewardsDescription:
      'Mined Games achievement. All perks for the rest of the game. To get Maxis\' story ending, complete the Endgame step (all four players must have completed Tower of Babble, High Maintenance, and Mined Games on Maxis\' side, with Navcards inserted).',
    steps: [
      {
        order: 1,
        label:
          '[Step 1 — Build the Gallows]: Build the Gallows next to the courthouse entrance. This step commits the game to Maxis\' path. Gather all four parts (battery, spool of wire, antennae, bulbs) and build at the Gallows site next to the courthouse.',
      },
      {
        order: 2,
        label:
          '[Step 2 — Orb Breaker]: Destroy the four red orbs using the Subsurface Resonator (requires the Turbine). Locations: (1) Alleyway between the saloon and the candy shop. (2) To the left of the church entrance, behind a rock. (3) In the tunnel system above the town. (4) To the left in the foliage before the mansion entrance from the maze.',
      },
      {
        order: 3,
        label:
          '[Step 3 — The Lantern]: Use a grenade to knock the purple lantern out of the air as it floats from the courtroom to the church or to the jail cell. It will disappear if you miss or leave it on the ground too long. Pick it up once it is down.',
      },
      {
        order: 4,
        label:
          '[Step 4 — Sugar Rush]: Power the lantern by killing zombies with Arthur (after giving him candy), Trample Steam, Subsurface Resonator, Head Chopper, or Nuke power-up. The player holding the lantern must stand close to the kills. When the lantern has enough souls, place it on the symbol on the roof of the Gunsmith shop.',
      },
      {
        order: 5,
        label:
          '[Step 5 — Deciphering the Code]: Decipher the code above the symbol on the wall using the "tic-tac-toe" cipher. This reveals the names of three tunnel signs. Hit those three signs in order with the Galvaknuckles or Bowie Knife to make the wisp appear. The three signs are randomly chosen from the five available.',
        imageUrl: '/images/easter-eggs/buried-mainegg-1.webp',
      },
      {
        order: 6,
        label:
          '[The Five Tunnel Signs]: The five signs in the tunnels are each 17 characters long (counting spaces). Decode only the first letter of each sign, as all five first letters are different. Hit the three revealed signs in the correct order. See the sign images for reference.',
        imageUrl: '/images/easter-eggs/buried-mainegg-2.webp',
      },
      {
        order: 7,
        label: 'Sign: DRY GULCHER SHAFT (D).',
      },
      {
        order: 8,
        label: 'Sign: LUNGER UNDERMINES (L).',
        imageUrl: '/images/easter-eggs/buried-mainegg-3.webp',
      },
      {
        order: 9,
        label: 'Sign: CONSUMPTION CROSS (C).',
        imageUrl: '/images/easter-eggs/buried-mainegg-4.webp',
      },
      {
        order: 10,
        label: 'Sign: GROUND BITER PITS (G).',
        imageUrl: '/images/easter-eggs/buried-mainegg-5.webp',
      },
      {
        order: 11,
        label: 'Sign: BONE ORCHARD VEIN (B).',
        imageUrl: '/images/easter-eggs/buried-mainegg-6.webp',
      },
      {
        order: 12,
        label:
          '[Step 6 — Energy and Western Time Travel]: Place a Time Bomb before the wisp reaches the Gallows. Open the 1250-point couch between the tunnels and the upper Gunsmith level, and have Arthur destroy the barrier between the General Store and the Candy Shop. The player who hits the signs must follow the wisp with zombies near it so it does not fade. Path depends on last sign hit: (G or B) tunnels → courtroom → past Speed Cola toward jail → porch loop → upper jail → barn; (D, L, or C) tunnels → Quick Revive → drop to jail extended roof → barn. Then: barn ledge → tunnels → Gunsmith upper level → Saloon → left toward candy shop → through barrier → courthouse → Gallows (powers one container). Use zombie "checkpoints" (e.g. in front of jail, in barn, in front of Gunsmith, in front of saloon) or start a round as the wisp approaches the Gallows. Use the Time Bomb to go back in time and repeat to obtain a second wisp.',
      },
      {
        order: 13,
        label:
          '[Step 7 — For Whom the Bells Toll]: Ring the bells around the map with the action button. Three locations, three bells each: (1) Second floor of candy shop (not the Power Switch room)—corner of square table along wall; table with two pots near couch blockade; chair right of door to stairway. (2) Top level of barn—right of hole in wall near Gunsmith, on hay bale; on hay bale right of gap in railing; on hay bale just before drop to jail. (3) Bottom floor of courtroom—left corner as you enter; left of judge\'s podium; table on right closest to podium. In the mansion, past the secret bookcase, a switchboard on a sofa has a lever and a 3×3 light grid. Columns (left to right) = candy store, barn, courtroom bells. When activated, one light turns yellow; the player at the switchboard calls out which light, and the others ring the matching bell. Correct ring turns the light green and lights the next. Ring within the time limit or the switchboard resets. Galvaknuckles recommended in the mansion (one-hit kill on the witch).',
      },
      {
        order: 14,
        label:
          '[Step 8 — Make-A-Wish]: Interact with the fountain in front of the church/mansion to "make a wish." Metal targets spawn in four areas; every player must shoot them all before any disappear. Locations: beside candy store, in front of courtroom (20); left side of mansion, in windows (23); inside saloon (19); by jail cell (22). Paralyzer works on targets. Tip: Give Arthur candy near a crawler. Maxis\' side is complete—all perks for the rest of the game. For the full story ending, complete the Endgame (see Easter Egg Tracker guide).',
      },
    ],
  },

  // ——— Buried: Musical ———

  {
    gameShortName: 'BO2',
    mapSlug: 'buried',
    name: 'Always Running',
    slug: 'always-running',
    type: 'MUSICAL',
    xpReward: 0,
    description:
      'The song "Always Running" by Malukah plays when the player activates three Teddy Bears scattered around the map. A strange sound can be heard when near one of the bears.',
    steps: [
      {
        order: 1,
        label: 'First Teddy Bear: In the entrance to the mines, sitting next to the hay near Quick Revive.',
      },
      {
        order: 2,
        label: 'Second Teddy Bear: In the candy store, inside one of the candy barrels.',
      },
      {
        order: 3,
        label:
          'Third Teddy Bear: In the mansion, in the room on the right that houses the Double Tap Root Beer machine, near one of the corners. Activate all three to play Always Running.',
      },
    ],
  },

  // ——— Buried: Side / Other Easter Eggs ———

  {
    gameShortName: 'BO2',
    mapSlug: 'buried',
    name: 'Dart Board & Ghost Piano',
    slug: 'dart-board-ghost-piano',
    type: 'SIDE_QUEST',
    xpReward: 0,
    description:
      'Hit a bullseye on the dart board in the saloon with a Ballistic Knife; the piano behind the player will then play by itself. If the player leaves the maze through the back of the mansion, a Ghost can be seen playing the piano. Tip the Ghost 10 points to receive a perk. The piano in the saloon can also be played manually by holding the use button.',
    steps: [
      {
        order: 1,
        label:
          'In the saloon, use the Ballistic Knife to hit a bullseye on the dart board. The piano behind you will start to play by itself.',
      },
      {
        order: 2,
        label:
          'Leave the maze through the back of the mansion (instead of the front). A Ghost can be seen playing the piano.',
      },
      {
        order: 3,
        label: 'Tip the Ghost 10 points (hold use) to receive a random perk.',
      },
      {
        order: 4,
        label: 'You can also play the piano manually in the saloon by holding the use button.',
      },
    ],
  },
  {
    gameShortName: 'BO2',
    mapSlug: 'buried',
    name: 'Easter Egg Tracker & Endgame Songs',
    slug: 'easter-egg-tracker',
    type: 'SIDE_QUEST',
    xpReward: 0,
    description:
      'An Easter Egg Tracker machine in the courthouse shows which players have completed the Easter eggs on TranZit, Die Rise, and Buried, and whether they completed Richtofen\'s or Maxis\' side. If the endgame has been activated, holding use near the tracker plays "Samantha\'s Desire" (Maxis) or "Richtofen\'s Delight" (Richtofen). The Endgame requires all four players to have completed Tower of Babble, High Maintenance, and Mined Games for the same side, with all NAV tables built and correct Navcards inserted. Activating the Endgame erases all Easter egg progress and can be done in the same game as finishing Mined Games.',
    steps: [
      {
        order: 1,
        label:
          'Location: At the back of the courthouse on the first floor is a box with a 3×4 light grid—the Easter Egg Tracker. The left column is Tower of Babble, the middle is High Maintenance, the right is Mined Games. Orange = Maxis, blue = Richtofen. Each row is one player.',
      },
      {
        order: 2,
        label:
          'Songs: If the endgame has been activated, hold the use button near the tracker. It plays "Samantha\'s Desire" if Maxis\' endgame was activated, or "Richtofen\'s Delight" if Richtofen\'s was activated.',
      },
      {
        order: 3,
        label:
          'Richtofen\'s Ending: If all four players have completed all three Easter eggs on Richtofen\'s side (and Navcards are inserted), walk up to the tracker, open it, and press the revealed button. Screen shakes; Richtofen defeats Maxis and partially takes over Samuel. All players get permanent Fire Sale and a special Mule Kick (four weapons).',
      },
      {
        order: 4,
        label:
          'Maxis\' Ending: If all four players have completed all three Easter eggs on Maxis\' side (and Navcards are inserted), open the tracker and press the button. Screen shakes; map fades orange; Maxis overthrows Richtofen and sends his soul into a random zombie. That "Richtofen Zombie" has blue eyes; killing it drops a power-up. Fire Sale jingle and announcer laugh change.',
      },
    ],
  },
  {
    gameShortName: 'BO2',
    mapSlug: 'buried',
    name: 'Mansion Ghosts Perk',
    slug: 'mansion-ghosts-perk',
    type: 'SIDE_QUEST',
    xpReward: 0,
    description:
      'After making it through the mansion and defeating all the Ghosts, a Random Perk Bottle is dropped. This works only every five rounds. To check if it is available, look at the mansion front: if the lights in the windows are lit, the perk is available.',
    steps: [
      {
        order: 1,
        label:
          'Run through the Haunted Mansion and defeat all the Ghosts. When they are all killed, a Random Perk Bottle power-up drops.',
      },
      {
        order: 2,
        label:
          'This only occurs every five rounds. Check the front of the mansion: if the lights in the windows are lit, the perk drop is available that round.',
      },
    ],
  },
  {
    gameShortName: 'BO2',
    mapSlug: 'buried',
    name: 'Time Bomb Perk Trick',
    slug: 'time-bomb-perk-trick',
    type: 'SIDE_QUEST',
    xpReward: 0,
    description:
      'With a Time Bomb, players can get two free Random Perk Bottles from the mansion every five rounds (when the mansion lights are lit). After running through the mansion, wait for the final Ghost to appear, plant the Time Bomb, kill the Ghost, take the perk, then use the Time Bomb to go back—the perk is still there. Kill the final Ghost again to receive a second perk.',
    steps: [
      {
        order: 1,
        label:
          'When the mansion lights are lit (perk available every five rounds), run through the mansion and wait for the final Ghost to appear.',
      },
      {
        order: 2,
        label: 'Plant the Time Bomb on the ground, then kill the Ghost. When the Random Perk Bottle appears, use the Time Bomb to travel back.',
      },
      {
        order: 3,
        label:
          'After returning, the perk power-up is still there—grab it. Then kill the final Ghost again to receive a second Random Perk Bottle.',
      },
    ],
  },
  {
    gameShortName: 'BO2',
    mapSlug: 'buried',
    name: 'Chalk Weapon Placement',
    slug: 'chalk-weapon-placement',
    type: 'SIDE_QUEST',
    xpReward: 0,
    description:
      'Chalk on the wall allows custom placement of certain weapons onto predefined spaces. Each chalk placed gives 1000 points (the final chalk gives 2000). Points are doubled if the Double Points power-up is active.',
    steps: [
      {
        order: 1,
        label:
          'Find chalk on the wall and use it to place weapons onto the predefined spaces. Each placement awards 1000 points (2000 for the final chalk). Activate Double Points before placing to double the points.',
      },
    ],
  },
  // ——— Mob of the Dead (BO2) ———
  {
    gameShortName: 'BO2',
    mapSlug: 'mob-of-the-dead',
    name: 'Pop Goes the Weasel',
    slug: 'pop-goes-the-weasel',
    type: 'MAIN_QUEST',
    xpReward: 5000,
    playerCountRequirement: 'DUO',
    videoEmbedUrl: 'https://www.youtube.com/embed/1OwVQVAWU0U',
    description:
      'Break the cycle. Requires at least two players, one of whom must be Albert "Weasel" Arlington. Cannot be completed on Easy difficulty. All steps can be done in solo except the ending (one side must kill the other). The free Blundergat and spoon steps can be done in any order. Canon ending (Blood of the Dead): Weasel kills the others and breaks the cycle.',
    rewardsDescription:
      'Pop Goes the Weasel achievement. Two outcomes: break the cycle (Weasel kills the other mobsters; game ends with orchestral version) or continue the cycle (mobsters kill Weasel; game ends with unique song).',
    steps: [
      {
        order: 1,
        label:
          '[Free Blundergat]: Obtain the Hell\'s Retriever, then collect five blue skulls by throwing a charged Hell\'s Retriever at each (skulls are visible in Afterlife or Spectral Shield vision). When all five are collected, the Demonic Announcer laughs and the free Blundergat appears on the Warden\'s table in his office. Mystery Box Blundergat does not count.',
        buildableReferenceSlug: 'free-blundergat',
      },
      {
        order: 2,
        label:
          '[Spoon]: Complete the cycle at least once (go to Golden Gate Bridge and return via the electric chair). Find the jail cell with the blue and green movie poster "Escape from the Tomb" near the Warden\'s Office. Throw a frag or the Hell\'s Retriever at the poster to remove it; a hole and Afterlife symbol appear. Enter Afterlife, go through the new Afterlife doorway (wall opposite Warden\'s Office, next to the high voltage panel), and zap the spoon on the ground next to the crack with the skull. Demonic Announcer laughs. Go to the Cafeteria, barrier at the back; the spoon is on the table against the left wall inside the barrier. Throw the Hell\'s Retriever at the spoon to get it (Brutus speaks). Each player who wants the Golden Spork must do this step.',
        buildableReferenceSlug: 'hells-retriever',
      },
      {
        order: 3,
        label:
          '[Step 1 — Listening to the logs]: Prerequisites: complete the cycle at least three times, get the free Blundergat, and have the spoon (at least one player). Between the Citadel Tunnels and the docks, in the spiral staircase, the number pad will be rapidly changing (constant clicking). Enter Afterlife and input the mobsters\' prison numbers on the pad: 101, 481, 386, 872 (any order). After each number the pad blinks and shuffles. Tip: have a teammate partially revive you to extend Afterlife time; or enter two numbers, revive, re-enter Afterlife, enter the other two. When done, Brutus speaks, screen goes black and white, and Stanley Ferguson narrates.',
      },
      {
        order: 4,
        label:
          '[Headphones]: After the narration, pairs of headphones (power-up style) appear in sequence. Listen to each fully before the next appears. [Order]: (1) Staircase back up to Citadel Tunnels. (2) Near Double Tap Root Beer. (3) Walkway between Warden\'s Office and cafeteria. (4) Staircase from cafeteria to infirmary. (5) Staircase to the roof. Demonic Announcer laughs after each. They do not despawn.',
      },
      {
        order: 5,
        label:
          '[Step 2 — Ending]: Board the plane in Afterlife (action button next to it). The plane does not need refueling and there is no prompt; just use the action button. All players are put on the plane; it takes off and crashes into the bridge. Everyone lands in Afterlife with their bodies in the electric chairs. Each player revives themselves. Weasel then appears as an enemy: the other mobsters can damage him and he can damage them; zombies do not attack Weasel. Pop Goes the Weasel achievement unlocks here.',
      },
      {
        order: 6,
        label:
          '[Break the cycle]: Weasel must kill all the other mobsters (he has higher damage resistance). When the others are dead (by Weasel or zombies), the game ends—camera pans out from the Golden Gate Bridge with an orchestral version of the ending song. This is the canon ending.',
      },
      {
        order: 7,
        label:
          '[Continue the cycle]: The other mobsters must kill Weasel. When he is dead, the game ends with the regular camera angle and a unique song.',
      },
    ],
  },
  {
    gameShortName: 'BO2',
    mapSlug: 'mob-of-the-dead',
    name: 'Free Blundergat',
    slug: 'free-blundergat',
    type: 'BUILDABLE',
    xpReward: 0,
    description:
      'Obtain a free Blundergat by collecting five hidden blue skulls with the Hell\'s Retriever. The skulls can only be seen in Afterlife or through the Spectral Shield\'s spectral vision; their locations are the same every game. Throw the Hell\'s Retriever at each skull and it will return with the skull on it. Getting the Blundergat from the Mystery Box does not count. When all five are collected, the Demonic Announcer laughs and the Blundergat appears on the Warden\'s Desk in his office.',
    steps: [
      {
        order: 1,
        label:
          'Where to claim it: After collecting all five skulls, the Demonic Announcer laughs and the Blundergat appears on the Warden\'s table in the Warden\'s Office. Pick it up there.',
        imageUrl: '/images/buildables/bo2/mobofthedead-freeblundergate.png',
      },
      {
        order: 2,
        label:
          'What to do: First, follow the Hell\'s Retriever guide to obtain it. Once you have it, you need to collect five hidden blue skulls by throwing a charged Hell\'s Retriever at each one (hold the tactical button to charge it before throwing). The skulls are only visible in Afterlife or through the Spectral Shield\'s spectral vision; their positions are the same every game. When the charged retriever hits a skull, it returns to you with the skull attached. After all five skulls are collected, the Demonic Announcer laughs and the free Blundergat appears on the Warden\'s table—claim it there (step 1). Getting the Blundergat from the Mystery Box does not count for the main quest or this guide.',
        buildableReferenceSlug: 'hells-retriever',
      },
      {
        order: 3,
        label: 'Skull 1: In the cell block just outside the library in the spawn area—in a cell with a toilet.',
        imageUrl: '/images/buildables/bo2/mobofthedead-freeblundergate-skull-1.png',
      },
      {
        order: 4,
        label: 'Skull 2: On the roof, back left when coming to the roof—sitting on an unreachable corner of the roof.',
        imageUrl: '/images/buildables/bo2/mobofthedead-freeblundergate-skull-2.png',
      },
      {
        order: 5,
        label: 'Skull 3: On the docks—across the water on another dock (third pillar from the left near the possible Mystery Box spawn).',
        imageUrl: '/images/buildables/bo2/mobofthedead-freeblundergate-skull-3.png',
      },
      {
        order: 6,
        label: 'Skull 4: Above Juggernog near the docks—look up at the lamppost on the hill. You have to jump when you throw the Hell\'s Retriever (or get it from the gondola as it moves).',
        imageUrl: '/images/buildables/bo2/mobofthedead-freeblundergate-skull-4.png',
      },
      {
        order: 7,
        label:
          'Skull 5: In the Warden\'s Office—outside the window on a telephone pole. Look out the window; do not board it up or the planks can block the throw.',
        imageUrl: '/images/buildables/bo2/mobofthedead-freeblundergate-skull-5.png',
      },
    ],
  },
  {
    gameShortName: 'BO2',
    mapSlug: 'mob-of-the-dead',
    name: 'Hell\'s Retriever',
    slug: 'hells-retriever',
    type: 'BUILDABLE',
    xpReward: 0,
    description:
      'Wonder weapon tactical: a throwing axe that pierces up to six zombies and returns to you. Charge it by holding the tactical button (up to two pulses) for more damage and distance. Effective against Brutus; can one-hit kill when fully charged until round 20. You lose it if you bleed out but can pick it up again from its spawn. Required for the free Blundergat, Golden Spork, and Pop Goes the Weasel spoon step.',
    videoEmbedUrl: 'https://www.youtube.com/embed/8ftupfxRzAs',
    steps: [
      {
        order: 1,
        label:
          'Overview: Feed six zombies to each of the three Cerberus heads around the map. Each head must be fed six zombies; they will recede into the wall and the Cerberus icon on the wall will glow when done.',
      },
      {
        order: 2,
        label:
          'Cerberus head 1: In the Broadway cell block, located near the B23R.',
      },
      {
        order: 3,
        label:
          'Cerberus head 2: In the infirmary, adjacent to the Afterlife power box.',
      },
      {
        order: 4,
        label:
          'Cerberus head 3: Near the workbench on the lower level of the docks.',
      },
      {
        order: 5,
        label:
          'Claim the Retriever: Once all three heads have receded and the Cerberus head icons are glowing, an area opens in the Citadel Tunnels beneath the sign of the three dog heads. Go down there and pick up the Hell\'s Retriever.',
      },
    ],
  },
  {
    gameShortName: 'BO2',
    mapSlug: 'mob-of-the-dead',
    name: 'Hell\'s Redeemer',
    slug: 'hells-redeemer',
    type: 'BUILDABLE',
    xpReward: 0,
    description:
      'Upgraded Hell\'s Retriever: glows blue, can be charged three times (vs two), and with at least one charge is a guaranteed instant kill on zombies and Hellhounds. Still hits a maximum of six zombies per throw. Obtainable only on Original difficulty. Each player must complete the upgrade steps independently. In Mob of the Dead the Hell\'s Redeemer can only be picked up in Afterlife.',
    videoEmbedUrl: 'https://www.youtube.com/embed/Vd0jU1LPaMU',
    steps: [
      {
        order: 1,
        label:
          'Prerequisite: Obtain the Hell\'s Retriever first.',
        buildableReferenceSlug: 'hells-retriever',
      },
      {
        order: 2,
        label:
          'Kill zombies: Kill approximately 10–15 zombies with the Hell\'s Retriever. When done, you will hear the sound of entering Afterlife and some music.',
      },
      {
        order: 3,
        label:
          'Bridge round: Spend at least one full round on round 10 or higher on the Golden Gate Bridge using only the Hell\'s Retriever—kill at least 30 zombies with it that round. When the round ends you should hear the Afterlife sound. Do not shoot any weapons during this round or the step will reset; knifing the air is allowed.',
      },
      {
        order: 4,
        label:
          'Throw into lava: Throw the Hell\'s Retriever into the lava pit underneath the Cerberus head near the B23R. If done correctly, it will not return and you will hear the Afterlife sound again.\n\nEasy access: the lava is under the ramp that leads to the B23R and Cerberus head; throw the retriever into the lava from there.',
      },
      {
        order: 5,
        label:
          'Pick up Redeemer: On any following round, go to the Citadel Tunnels where you originally obtained the Hell\'s Retriever. The retriever should be gone and the aura should be blue instead of red. Enter Afterlife and pick up the Hell\'s Redeemer.',
      },
    ],
  },
  {
    gameShortName: 'BO2',
    mapSlug: 'mob-of-the-dead',
    name: 'Acid Gat Kit',
    slug: 'acid-gat-kit',
    type: 'BUILDABLE',
    xpReward: 0,
    description:
      'Buildable that upgrades the Blundergat into the Acid Gat. Only compatible with the Blundergat. Shoots acid that sticks on surfaces and explodes. Can be Pack-a-Punched into the Vitriolic Withering. On Mob of the Dead, the Acid Gat Kit, Zombie Shield, and Pack-a-Punch (plane) can each be built at any of three crafting tables: docks, cafeteria, or behind Electric Cherry on the way to the roof.',
    steps: [
      {
        order: 1,
        label:
          'Crafting table: On Mob of the Dead, the Acid Gat Kit, Zombie Shield, and Pack-a-Punch (plane) can each be built at any of three tables. Choose one: Docks · Cafeteria · Behind Electric Cherry on the way up to the roof.',
      },
      {
        order: 2,
        label:
          'Crafting table: Docks.',
        imageUrl: '/images/buildables/bo2/mobofthedead-table-1.png',
      },
      {
        order: 3,
        label:
          'Crafting table: Cafeteria.',
        imageUrl: '/images/buildables/bo2/mobofthedead-table-2.png',
      },
      {
        order: 4,
        label:
          'Crafting table: Behind Electric Cherry on the way up to the roof.',
        imageUrl: '/images/buildables/bo2/mobofthedead-table-3.png',
      },
      {
        order: 5,
        label:
          'Motor: Right as you enter the Warden\'s quarters, to the right of the wall buy on the floor.',
        imageUrl: '/images/buildables/bo2/mobofthedead-acid-motor-1.png',
      },
      {
        order: 6,
        label:
          'Motor: To the left of the Mystery Box spawn on the floor in the Warden\'s office.',
        imageUrl: '/images/buildables/bo2/mobofthedead-acid-motor-2.png',
      },
      {
        order: 7,
        label:
          'Motor: To the left of the fireplace, to the left of Speed Cola in the Warden\'s office.',
        imageUrl: '/images/buildables/bo2/mobofthedead-acid-motor-3.png',
      },
      {
        order: 8,
        label:
          'Case: Near the library through C–D gate, sitting on a table near the jail cell.',
        imageUrl: '/images/buildables/bo2/mobofthedead-acid-brief-1.png',
      },
      {
        order: 9,
        label:
          'Case: Under the staircase in the hallway leading to the Warden\'s office (Michigan Ave).',
        imageUrl: '/images/buildables/bo2/modofthedead-acid-brief-2.png',
      },
      {
        order: 10,
        label:
          'Case: Near the top of the stairs from the laundromat, across from the Afterlife switch, on the floor.',
        imageUrl: '/images/buildables/bo2/modofthedead-acid-brief-3.png',
      },
      {
        order: 11,
        label:
          'Acid Bottle: On the way up to the roof, in the left corridor opposite the bloody bathtubs, on a table.',
        imageUrl: '/images/buildables/bo2/modofthedead-acide-vial-1.png',
      },
      {
        order: 12,
        label:
          'Acid Bottle: In the second room with the bloody bathtubs on the way up to the roof.',
        imageUrl: '/images/buildables/bo2/modofthedead-acide-vial-2.png',
      },
      {
        order: 13,
        label:
          'Acid Bottle: In the first room with the bloody bathtubs.',
        imageUrl: '/images/buildables/bo2/modofthedead-acide-vial-3.png',
      },
    ],
  },
  {
    gameShortName: 'BO2',
    mapSlug: 'mob-of-the-dead',
    name: 'Zombie Shield',
    slug: 'zombie-shield',
    type: 'BUILDABLE',
    xpReward: 0,
    description:
      'Buildable shield that blocks damage from the front or back when held or on your back. Has limited durability. On Mob of the Dead, the Zombie Shield, Acid Gat Kit, and Pack-a-Punch (plane) can each be built at any of three crafting tables: docks, cafeteria, or behind Electric Cherry on the way to the roof.',
    steps: [
      {
        order: 1,
        label:
          'Crafting table: On Mob of the Dead, the Zombie Shield, Acid Gat Kit, and Pack-a-Punch (plane) can each be built at any of three tables. Choose one: Docks · Cafeteria · Behind Electric Cherry on the way up to the roof.',
      },
      {
        order: 2,
        label:
          'Crafting table: Docks.',
        imageUrl: '/images/buildables/bo2/mobofthedead-table-1.png',
      },
      {
        order: 3,
        label:
          'Crafting table: Cafeteria.',
        imageUrl: '/images/buildables/bo2/mobofthedead-table-2.png',
      },
      {
        order: 4,
        label:
          'Crafting table: Behind Electric Cherry on the way up to the roof.',
        imageUrl: '/images/buildables/bo2/mobofthedead-table-3.png',
      },
      {
        order: 5,
        label:
          'Bars: Spiral staircase room that goes down to the docks.',
        imageUrl: '/images/buildables/bo2/mobofthedead-shield-bars-1.png',
      },
      {
        order: 6,
        label:
          'Bars: Bottom of the same staircase, past the number input, to the left in the dead end hallway leaning against a corner where the door is.',
        imageUrl: '/images/buildables/bo2/mobofthedead-shield-bars-2.png',
      },
      {
        order: 7,
        label:
          'Bars: Outside the generator room in the corner outside.',
        imageUrl: '/images/buildables/bo2/mobofthedead-shield-bars-3.png',
      },
      {
        order: 8,
        label:
          'Handle: In the generator room on a shelf.',
        imageUrl: '/images/buildables/bo2/mobofthedead-shield-handle-1.png',
      },
      {
        order: 9,
        label:
          'Handle: In the generator room next to a generator on the floor.',
        imageUrl: '/images/buildables/bo2/mobofthedead-shield-handle-2.png',
      },
      {
        order: 10,
        label:
          'Handle: In the generator room on a shelf on the wall.',
        imageUrl: '/images/buildables/bo2/mobofthedead-shield-handle-3.png',
      },
      {
        order: 11,
        label:
          'Handle: In the generator room on a bottom shelf under a skull and candle.',
        imageUrl: '/images/buildables/bo2/mobofthedead-handle-4.png',
      },
      {
        order: 12,
        label:
          'Hand Trolley: On the dock in a corner across from the ocean.',
        imageUrl: '/images/buildables/bo2/mobofthedead-trolley-1.png',
      },
      {
        order: 13,
        label:
          'Hand Trolley: On the dock against a crate near the water.',
        imageUrl: '/images/buildables/bo2/mobofthedead-trolley-2.png',
      },
      {
        order: 14,
        label:
          'Hand Trolley: In a corner near a crate on the dock.',
        imageUrl: '/images/buildables/bo2/mobofthedead-trolley-3.png',
      },
    ],
  },
  {
    gameShortName: 'BO2',
    mapSlug: 'mob-of-the-dead',
    name: 'Pack-a-Punch',
    slug: 'pack-a-punch',
    type: 'BUILDABLE',
    xpReward: 0,
    description:
      'Buildable plane (Icarus) used to reach the Golden Gate Bridge for the main quest and Pack-a-Punch. Built on the roof of Alcatraz from five parts; the Warden\'s Key is required for every part. In solo you can carry all five at once; with two or more players, one part per player at a time. Access the roof via Afterlife: go through the portal in the walkway with many doors, jump up, and shock the voltmeter next to the roof door. Brutus can disable the plane—pay to unlock it again if needed.',
    videoEmbedUrl: 'https://www.youtube.com/embed/q3_D07pZDjQ',
    steps: [
      {
        order: 1,
        label:
          'Crafting table: The plane (Pack-a-Punch build) is built on the roof of the prison only. The build site and ramp are on the roof. Bring all five parts here to construct the plane. You can access the roof by entering Afterlife, going through the portal in the walkway with many doors, jumping up, and shocking the voltmeter next to the roof door.',
        imageUrl: '/images/buildables/bo2/mobofthedead-pap-table.png',
      },
      {
        order: 2,
        label:
          'Uniforms: In the shower rooms below the cafeteria. Open the gate to the laundry machine with the Warden\'s Key, then enter Afterlife and shock the voltmeter opposite the machine. Activate the laundry machine; this triggers more zombies and possibly Brutus, plus thick fog—you cannot leave the basement room until it finishes. When the laundry is ready, pick up the uniforms.',
        imageUrl: '/images/buildables/bo2/mobofthedead-pap-2.png',
      },
      {
        order: 3,
        label:
          'Rigging: In the spiral staircase in the Citadel Tunnels. Open the small gate to the electric number pad with the key, then go into Afterlife at the top of the staircase. As you float down, three numbers appear on the walls—that is your code. Shock the number pad (image below) to match the code; an alarm and 60-second timer start. Open the door next to the pad and get the rigging from the elevator in the lower room before time runs out.',
        imageUrl: '/images/buildables/bo2/mobofthedead-pap-3.png',
      },
      {
        order: 4,
        label:
          'Rigging: The number pad where you enter the code after seeing the three numbers on the wall.',
        imageUrl: '/images/buildables/bo2/mobofthedead-pap-4.png',
      },
      {
        order: 5,
        label:
          'Engine: In the Warden\'s Office, in a room behind an electrified door. To disable the door: overload the three generators in the room at the docks by shocking their associated panels in Afterlife (one panel is in a room only accessible during Afterlife). When all three are overloaded, music plays and the electrified door turns off. Pick up the engine in the Warden\'s Office.',
        imageUrl: '/images/buildables/bo2/mobofthedead-pap-6.png',
      },
      {
        order: 6,
        label:
          'Valves: In the infirmary, next to the Cerberus head. They are in a glass case with a lock. Open the lock with the Warden\'s Key and pick up the valves.',
        imageUrl: '/images/buildables/bo2/mobofthedead-pap-1.png',
      },
      {
        order: 7,
        label:
          'Tank: At the docks, next to the M1927. Solo: open the gate with the key and shock the nearby voltmeter in Afterlife to open the gate to the tank, then grab the part. Two or more players: after opening the first gate, shocking the voltmeter closes that gate but opens the one to the tank; shocking again reverses them. Two players must coordinate—one shocks the panel while the other retrieves the tank.',
        imageUrl: '/images/buildables/bo2/mobofthedead-pap-5.png',
      },
    ],
  },
  {
    gameShortName: 'BO2',
    mapSlug: 'mob-of-the-dead',
    name: 'Secret Ending',
    slug: 'secret-ending',
    type: 'SIDE_QUEST',
    xpReward: 0,
    description:
      'At the start of a match, if no one moves and the players wait for the Afterlife timer to run out, a secret ending triggers: the screen turns black and white, the mobsters bleed out, and Samantha\'s lullaby plays while the view lifts from the spawn room to the sky.',
    steps: [
      {
        order: 1,
        label:
          'At the beginning of the match, do not move. Wait for the Afterlife timer to be fully consumed. The screen turns black and white, the mobsters bleed out, and Samantha\'s lullaby plays as the view rises from the spawn room to the sky.',
      },
    ],
  },
  {
    gameShortName: 'BO2',
    mapSlug: 'mob-of-the-dead',
    name: 'Rusty Cage',
    slug: 'rusty-cage',
    type: 'MUSICAL',
    xpReward: 0,
    description:
      'The song "Rusty Cage" by Johnny Cash can be played by activating three bottles scattered around the map. A strange sound can be heard when near one of the bottles.',
    steps: [
      { order: 1, label: 'First bottle: On a bookshelf in the library (spawn area).' },
      { order: 2, label: 'Second bottle: In the infirmary, near one of the baths filled with blood.' },
      { order: 3, label: 'Third bottle: On the docks, tucked between a crate and a fence. Activate all three to play Rusty Cage.' },
    ],
  },
  {
    gameShortName: 'BO2',
    mapSlug: 'mob-of-the-dead',
    name: 'Where Are We Going',
    slug: 'where-are-we-going',
    type: 'MUSICAL',
    xpReward: 0,
    description:
      'The song "Where Are We Going" by Kevin Sherwood. Unlock the power switch with the Warden\'s key and the numbers puzzle next to the elevator; input 935 to play the song.',
    steps: [
      {
        order: 1,
        label:
          'Find the Warden\'s key, then go to the power switch. Use the numbers puzzle next to the elevator and input 935. The song Where Are We Going will play.',
      },
    ],
  },
  {
    gameShortName: 'BO2',
    mapSlug: 'mob-of-the-dead',
    name: 'Jump Scare',
    slug: 'jump-scare',
    type: 'SIDE_QUEST',
    xpReward: 0,
    description:
      'On the roof where the plane is assembled, use a sniper rifle and scope in on the firework display in the distance (far end of the roof, left of the runway). A distorted face flashes on screen with a high-pitched scream.',
    steps: [
      {
        order: 1,
        label:
          'Have a sniper rifle (e.g. Barrett M82A1 or DSR 50). Go to the roof where the plane is assembled, to the far end of the roof to the left of the runway. Scope in on the firework display in the distance. A distorted face will flash on screen for a split second with a high-pitched scream.',
      },
    ],
  },
  {
    gameShortName: 'BO2',
    mapSlug: 'mob-of-the-dead',
    name: 'Audio Logs',
    slug: 'audio-logs',
    type: 'SIDE_QUEST',
    xpReward: 0,
    description:
      'Type the four characters\' prison numbers into the counter that operates the underground elevator. Stanley Ferguson (older) narrates audio logs that reveal what actually occurred at Alcatraz and the group\'s situation.',
    steps: [
      {
        order: 1,
        label:
          'Find the number counter that operates the underground elevator. Enter the mobsters\' prison numbers (101, 481, 386, 872) to access the audio logs. Stanley Ferguson narrates the events at Alcatraz and the group\'s situation.',
      },
    ],
  },
  {
    gameShortName: 'BO2',
    mapSlug: 'mob-of-the-dead',
    name: 'Golden Spork',
    slug: 'golden-spork',
    type: 'SIDE_QUEST',
    xpReward: 0,
    description:
      'Melee wonder weapon. You first obtain the Silver Spoon, then complete a ritual to exchange it for the Golden Spork. Requires Hell\'s Retriever (or Hell\'s Redeemer), Acid Gat, and a visit to the Golden Gate Bridge at least once. Original difficulty only. The Golden Spork can one-hit kill until round 34.',
    steps: [
      {
        order: 1,
        label:
          'Find the jail cell with the blue and green "Escape from the Tomb" poster near the Warden\'s Office. Throw the Hell\'s Retriever at the poster to remove it; enter Afterlife, go through the new portal, and zap the spoon on the floor to the right of the crack with the skull. Demonic Announcer laughs.',
        buildableReferenceSlug: 'hells-retriever',
      },
      {
        order: 2,
        label:
          'Go to the Cafeteria, barrier at the back. The spoon is on the table against the left wall inside the barrier. Throw the Hell\'s Retriever at it to obtain the Silver Spoon (Brutus speaks). Each player who wants the Golden Spork must do this.',
        buildableReferenceSlug: 'hells-retriever',
      },
      {
        order: 3,
        label:
          'Enter the infirmary and find the lone bathtub filled with blood (opposite a Mystery Box spawn). Hold the action button next to the bathtub; the silver spoon will appear and stir the blood. Each player must do this individually.',
      },
      {
        order: 4,
        label:
          'In the underground showers, kill zombies with the Acid Gat (or Vitriolic Withering). After about 50–70 kills, the Demonic Announcer laughs again.',
      },
      {
        order: 5,
        label:
          'Return to the infirmary and the lone blood-filled bathtub. Hold the action button; a zombified hand will rise from the blood holding the Golden Spork. Press the action button to take it. Each player who wants it must complete this step. If you bleed out and respawn after getting it, re-do steps 3 and 4; the hand will rise again and you can retake the Spork.',
      },
    ],
  },
  {
    gameShortName: 'BO2',
    mapSlug: 'mob-of-the-dead',
    name: 'Brutus 115',
    slug: 'brutus-115',
    type: 'SIDE_QUEST',
    xpReward: 0,
    description:
      'Enter the number 115 into the number counter. Brutus can be heard whispering "Not this time!" or "Maybe next time." The number then changes to 666 before shifting back. No other effects.',
    steps: [
      {
        order: 1,
        label:
          'Find the number counter and enter 115. Brutus will whisper "Not this time!" or "Maybe next time." The number changes to 666, then returns to normal. No other effects occur.',
      },
    ],
  },
  {
    gameShortName: 'BO2',
    mapSlug: 'mob-of-the-dead',
    name: 'Ciphers and Scrap Paper',
    slug: 'ciphers-and-scrap-paper',
    type: 'SIDE_QUEST',
    xpReward: 0,
    categoryTag: 'Cipher',
    description:
      'Five ciphers and one scrap paper are scattered around the map. Ciphers 1–4 use a Hill cipher (41-character alphabet, key MOBOFTHEDEADABCD from the loading screen). Cipher 5 is ADFGX and appears in the loading screen. The scrap paper pieces assemble into a page from Weasel\'s comic "Icarus from Mars" with editor\'s notes.',
    steps: [
      {
        order: 1,
        label:
          'Cipher #1: Hill cipher (41-character alphabet). Key: MOBOFTHEDEADABCD from the 4×4 encoding matrix in the loading screen. Plaintext: "While I realize that the current lack of cooperation from Chicago\'s finest leaves us at something of a disadvantage, I find your latest report extremely troubling. The alliance that exists between our outfit and the north side gangs must be sustained - Lest we face a repeat of February 19th 1929."',
        imageUrl: '/images/easter-eggs/mobofthedead-cipher-1-1.webp',
      },
      {
        order: 2,
        label:
          'Cipher #1 (encoding matrix): The encoding matrix used to decode Cipher #1 is visible in the loading screen of Mob of the Dead.',
        imageUrl: '/images/easter-eggs/mobofthedead-cipher-1-2.webp',
      },
      {
        order: 3,
        label:
          'Cipher #2: Hill cipher, same key. Plaintext: "The answer is simple. No divorce. No matter what ideas Angela may have about making a new life, she needs to understand it\'s not going to happen. I didn\'t pluck her pretty little tush from chorus line obscurity just so she can turn around and screw me as soon as times get tough. No divorce. She can leave this marriage, the day she leaves this Earth."',
        imageUrl: '/images/easter-eggs/mobofthedead-cipher-2.webp',
      },
      {
        order: 4,
        label:
          'Cipher #3: Hill cipher, same key. Plaintext: "I know it\'s been a long time, but I wanted to write you just so you know I\'m doing well. It\'s been a long time coming, but I finally managed to make a success of myself in the city. Works been good to me these last few years, so much so that I decided to take a bit of time off. i\'ll write you again when I get back to work... Maybe I\'ll even send you some pictures."',
        imageUrl: '/images/easter-eggs/mobofthedead-cipher-3.webp',
      },
      {
        order: 5,
        label:
          'Cipher #4: Hill cipher, same key. Plaintext: "Enclosed are some more recent illustrations from my proposed comic strip Icarus from Mars. While I understand that you were less than enthusiastic about my previous submissions, I would urge you to look again with fresh eyes. Laid up in the hospital means I\'ve had more time than even to devote to my craft, and my artwork is improving by leaps and bounds. Eagerly waiting your response, Albert Arlington."',
        imageUrl: '/images/easter-eggs/mobofthedead-cipher-4.webp',
      },
      {
        order: 6,
        label:
          'Cipher #5: ADFGX cipher, present in the loading screen. Translated from German: "URGENT THE GIANT IS IN FRANCE".',
        imageUrl: '/images/easter-eggs/mobofthedead-cipher-5.webp',
      },
      {
        order: 7,
        label:
          'Scrap paper: One scrap paper is scattered around the map in pieces. When assembled, it forms a page from Albert Arlington\'s comic "Icarus from Mars" with notes from his editor.',
        imageUrl: '/images/easter-eggs/mobofthedead-cipher-6.webp',
      },
    ],
  },

  // ——— Origins (BO2) ———
  // ——— Origins (BO2): Buildables ———

  {
    gameShortName: 'BO2',
    mapSlug: 'origins',
    name: 'Zombie Shield',
    slug: 'zombie-shield',
    type: 'BUILDABLE',
    xpReward: 0,
    videoEmbedUrl: 'https://www.youtube.com/embed/Ktg_cAGZy9Y',
    description:
      'Buildable shield that blocks zombie attacks and can be used to melee. Three parts: Face Screen, Handles, and Shield Frame. Built at the workbench in the Workshop (between No Man\'s Land and spawn). Parts spawn in multiple locations.',
    steps: [
      {
        order: 1,
        label:
          'Face Screen: In the Fire tunnel, on a table to the right of the gateway.',
        imageUrl: '/images/buildables/bo2/origins-shield-face-1.png',
      },
      {
        order: 2,
        label:
          'Face Screen: To the right of the fire tunnel, in the trench room.',
        imageUrl: '/images/buildables/bo2/origins-shield-face-2.png',
      },
      {
        order: 3,
        label:
          'Face Screen: In the trench tunnel near Speed Cola, behind the crate heading to the Workshop.',
        imageUrl: '/images/buildables/bo2/origins-shield-face-3.png',
      },
      {
        order: 4,
        label:
          'Handles: To the right of the first area leading to Generator 2 from spawn, in the trench room.',
        imageUrl: '/images/buildables/bo2/origins-shield-handles-1.png',
      },
      {
        order: 5,
        label:
          'Handles: At the end of the trenches past Generator 2 and the Workshop.',
        imageUrl: '/images/buildables/bo2/origins-shield-handles-2.png',
      },
      {
        order: 6,
        label:
          'Handles: Near Generator 2, on top of the Tank Station near some broken piping.',
        imageUrl: '/images/buildables/bo2/origins-shield-handles-3.png',
      },
      {
        order: 7,
        label:
          'Shield Frame: Near Generator 4, to the left of the MP40 nearby.',
        imageUrl: '/images/buildables/bo2/origins-shield-frame-1.png',
      },
      {
        order: 8,
        label:
          'Shield Frame: In the marshlands just outside Generator 4, heading towards the trenches to the church.',
        imageUrl: '/images/buildables/bo2/origins-shield-frame-2.png',
      },
      {
        order: 9,
        label:
          'Shield Frame: In a Giant Robot footprint near the Excavation Site.',
        imageUrl: '/images/buildables/bo2/origins-shield-frame-3.png',
      },
    ],
  },
  {
    gameShortName: 'BO2',
    mapSlug: 'origins',
    name: 'Maxis Drone',
    slug: 'maxis-drone',
    type: 'BUILDABLE',
    xpReward: 0,
    videoEmbedUrl: 'https://www.youtube.com/embed/pHguGg7YFUA',
    description:
      'Buildable drone that can be deployed to attack zombies and is required for the Little Lost Girl Easter egg (Steps 4, 5, and 8). Three parts: Brain, Frame, and Rotor. Built at a workbench on the map.',
    steps: [
      {
        order: 1,
        label:
          'Brain: On a table on the lower floor of the starting room, next to the stairs up to Generator 1.',
      },
      {
        order: 2,
        label:
          'Frame: In the Ice Tunnel, near Generator 6, in front of the portal to the Crazy Place.',
      },
      {
        order: 3,
        label:
          'Frame: Near the crossbone sign on the tank\'s muddy pathway to Generator 4.',
      },
      {
        order: 4,
        label:
          'Frame: Near the crossbone sign on the tank\'s muddy pathway to Generator 5.',
      },
      {
        order: 5,
        label:
          'Rotor: Near the very bottom of the Excavation Site, on top of a box on a scaffolding next to a lever.',
      },
      {
        order: 6,
        label:
          'Rotor: On top of the Excavation Site near the Pack-a-Punch.',
      },
      {
        order: 7,
        label:
          'Rotor: In the Excavation Site around the Secret Entrance.',
      },
    ],
  },
  {
    gameShortName: 'BO2',
    mapSlug: 'origins',
    name: 'Staff of Ice',
    slug: 'staff-of-ice',
    type: 'BUILDABLE',
    xpReward: 0,
    videoEmbedUrl: 'https://www.youtube.com/embed/QwX-Y3qTga0',
    description:
      'One of four elemental staff wonder weapons. Fires ice blasts that slow and freeze zombies. Three staff parts are dug from dig spots when it is snowing (typically rounds 2–4, round 10, or randomly). Requires the blue record, gramophone, record for lower Excavation Site, and the ice elemental gem from the Crazy Place. Built at the blue pedestal on the lowest level of the Excavation Site.',
    steps: [
      {
        order: 1,
        label:
          'Staff parts: Dig from dig spots when it is snowing. One part in the starting area (spawn to Workshop, either side), one in the middle area of the map, one near the church.',
      },
      {
        order: 2,
        label:
          'Blue record: Near Generator 2, inside the tank station on one of the shelves.',
      },
      {
        order: 3,
        label:
          'Gramophone: Always on the floor inside the Excavation Site. Record for lower Excavation Site: outside around the Excavation Site.',
      },
      {
        order: 4,
        label:
          'Elemental gem: Inside the Crazy Place. Enter via the Ice tunnel near the church. Need blue record and gramophone. A pedestal opens with a blue glow; the gem rises. Pick it up only when you entered from the Ice tunnel.',
      },
      {
        order: 5,
        label:
          'Build the Staff of Ice at the blue pedestal on the lowest level of the Excavation Site. Any player can pick it up; if dropped or holder bleeds out, it returns to the pedestal.',
      },
    ],
  },
  {
    gameShortName: 'BO2',
    mapSlug: 'origins',
    name: 'Ice Upgrade',
    slug: 'ulls-arrow',
    type: 'BUILDABLE',
    xpReward: 0,
    videoEmbedUrl: 'https://www.youtube.com/embed/QwX-Y3qTga0',
    description:
      'Upgraded Staff of Ice. More range and wider area of effect; chargeable shot creates a blizzard that pulls in and freezes zombies. Has Sekhmet\'s Vigor (D-Pad left): flip the staff to shoot a fast ball that can revive a downed player. Melee with the spikes is one-hit kill until round 16. Build the Staff of Ice first, then complete the upgrade steps.',
    steps: [
      {
        order: 1,
        label:
          'Crazy Place riddle (Ice section): Above the portal, six floating stone panels show base-4 symbols; on the wall a blue ice panel has dots (base-3). Use the wall pattern to decide which stone panel to shoot with the Staff of Ice. Shoot the correct one to flip it; all six must be flipped. Wrong panel resets all. Twelve patterns exist; six appear per game.',
        imageUrl: '/images/buildables/bo2/origins-ice-cheatsheet-1.webp',
      },
      {
        order: 2,
        label:
          'Gravestones (main realm): Three gravestones with water must be frozen with the Staff of Ice, then destroyed with a bullet weapon. Locations: (1) To the right of the MP40 near Generator 4. (2) Between the Excavation Site and a giant footprint, close to Generator 4. (3) On the small hill when going right from the back exit of the bunker next to Generator 2, next to the downed mech\'s hand.',
      },
      {
        order: 3,
        label:
          'Floating rings: In the lower Excavation Site, use the levers (two on the walkway, two on wooden scaffoldings) to rotate the four rings until all lights are blue. Shoot the blue orb inside with the Staff of Ice; it glows blue and shoots up.',
      },
      {
        order: 4,
        label:
          'Charge the staff: Place the Staff of Ice in the blue pedestal in the Crazy Place. Kill about 20 zombies in the Crazy Place so their souls go into the staff. Samantha will speak; the staff icon gets a red outline. Pick up Ull\'s Arrow from the pedestal. If lost, it returns to the Excavation Site pedestal and does not need to be upgraded again.',
      },
    ],
  },
  {
    gameShortName: 'BO2',
    mapSlug: 'origins',
    name: 'Staff of Lightning',
    slug: 'staff-of-lightning',
    type: 'BUILDABLE',
    xpReward: 0,
    videoEmbedUrl: 'https://www.youtube.com/embed/2gsIxBvYG-U',
    description:
      'One of four elemental staff wonder weapons. Shoots lightning that chains to multiple zombies. Three staff parts are in areas reachable only by jumping off the tank at specific spots. Requires the purple record, gramophone, record for lower Excavation Site, and the lightning elemental gem from the Crazy Place. Built at the purple pedestal on the lowest level of the Excavation Site.',
    steps: [
      {
        order: 1,
        label:
          'Staff parts (tank jumps): (1) Church to tank station: wooden cutoff staircase on the right before the trench to Generator 2 (watch for Thor stepping there). (2) Tank station to church: cutoff wooden scaffolding on the left linked to the Excavation Site, leads to a small hole. (3) Tank station to church: dirt path before church on the right to upper church level. With one player it is hard to get more than one part per tank run.',
      },
      {
        order: 2,
        label:
          'Purple record: Near Generator 4. Spawns in the tunnel near the Crazy Place gateway (on the bandwagon to the left when entering), or on the table next to the Der Wunderfizz machine. Gramophone: on the floor in the Excavation Site. Record for lower levels: outside around the Excavation Site.',
      },
      {
        order: 3,
        label:
          'Elemental gem: In the Crazy Place. Enter via the Lightning tunnel near Generator 5. Need purple record and gramophone. A pedestal opens with a purple glow; the gem rises. Pick it up only when you entered from the Lightning tunnel.',
      },
      {
        order: 4,
        label:
          'Build the Staff of Lightning at the purple pedestal on the lowest level of the Excavation Site. Any player can pick it up; if dropped or holder bleeds out, it returns to the pedestal.',
      },
    ],
  },
  {
    gameShortName: 'BO2',
    mapSlug: 'origins',
    name: 'Lightning Upgrade',
    slug: 'kimats-bite',
    type: 'BUILDABLE',
    xpReward: 0,
    videoEmbedUrl: 'https://www.youtube.com/embed/2gsIxBvYG-U',
    description:
      'Upgraded Staff of Lightning (Kimat\'s Bite). Chains more zombies; charged shot fires a slow electric ball that releases bolts along its path. Effective to about round 25 normally (crawlers after), charged to round 30–40. Has Sekhmet\'s Vigor to revive downed players. Melee with spikes is one-hit until round 16. Build the Staff of Lightning first, then complete the upgrade steps.',
    steps: [
      {
        order: 1,
        label:
          'Crazy Place riddle (Lightning section): Near the portal, purple triangular shapes on the wall form a keyboard. Opposite wall shows three chords (three notes each). Play the chords with the Staff of Lightning. Only the bottom row is used; number the seven keys left to right. Play in order: 136, 357, 246.',
        imageUrl: '/images/buildables/bo2/origins-lightning-cheatsheet-1.webp',
      },
      {
        order: 2,
        label:
          'Electrical panels (main realm): Eight panels around the map (one is auto-complete; seven to do). Turn each knob to the correct position. They spark one at a time in this order: Generator 5 (point down); church basement next to torch 3 (point right); church upstairs next to repairable window (point up); Wind tunnel, right of entrance (point up); spawn room bottom of stairs (point left); tank station near Gen 2, left of back door (point down); behind Excavation Site next to path to church (point up). Audio cue and beam from Excavation Site when done.',
      },
      {
        order: 3,
        label:
          'Floating rings: In the lower Excavation Site, use the levers to rotate the four rings until all lights are purple. Shoot the purple orb inside with the Staff of Lightning; it glows purple and shoots up.',
      },
      {
        order: 4,
        label:
          'Charge the staff: Place the Staff of Lightning in the purple pedestal in the Crazy Place. Kill 25 zombies in the Crazy Place so their souls go into the staff. Samantha will speak; the staff icon gets a red outline. Pick up Kimat\'s Bite from the pedestal. If lost, it returns to the Excavation Site pedestal and does not need to be upgraded again.',
      },
    ],
  },
  {
    gameShortName: 'BO2',
    mapSlug: 'origins',
    name: 'Staff of Fire',
    slug: 'staff-of-fire',
    type: 'BUILDABLE',
    xpReward: 0,
    videoEmbedUrl: 'https://www.youtube.com/embed/bvt6J7hsPuA',
    description:
      'One of four elemental staff wonder weapons. Fires three horizontal molten rock balls that burn and stun zombies. Three staff parts from: Generator 6 reward box (after powering Gen 6), the orange glowing plane (shoot it down—spawns round after opening path to church; part drops by soul box nearest Excavation Site), and the first Panzer Soldat (round 8). Requires red record, gramophone, lower-level record, and fire gem from the Crazy Place. Built at the red pedestal on the lowest level of the Excavation Site.',
    steps: [
      {
        order: 1,
        label:
          'Staff parts: (1) Power Generator 6; the reward box next to it opens with one part. (2) Shoot down the orange glowing plane (appears the round after opening the path to church); the part drops next to the soul box closest to the Excavation Site, on the walkway between two giant footprints. (3) Kill the first Panzer Soldat (round 8); it drops one part.',
      },
      {
        order: 2,
        label:
          'Red record: Near the church. Spawns on boxes between the tank and the staircase up, on the church benches opposite the basin, or on boxes next to Generator 6. Gramophone: on the floor in the Excavation Site. Record for lower levels: outside around the Excavation Site.',
      },
      {
        order: 3,
        label:
          'Elemental gem: In the Crazy Place. Enter via the Fire tunnel near spawn (Generator 1, on the way to Generator 3). Need red record and gramophone. A pedestal opens with a red glow; the gem rises. Pick it up only when you entered from the Fire tunnel.',
      },
      {
        order: 4,
        label:
          'Build the Staff of Fire at the red pedestal on the lowest level of the Excavation Site. Any player can pick it up; if dropped or holder bleeds out, it returns to the pedestal.',
      },
    ],
  },
  {
    gameShortName: 'BO2',
    mapSlug: 'origins',
    name: 'Fire Upgrade',
    slug: 'kagutsuchis-blood',
    type: 'BUILDABLE',
    xpReward: 0,
    videoEmbedUrl: 'https://www.youtube.com/embed/bvt6J7hsPuA',
    description:
      'Upgraded Staff of Fire (Kagutsuchi\'s Blood). Bigger blast radius; point-blank hits vaporize zombies. Charged shot fires three fireballs that incinerate nearby zombies and leave fire on the ground that explodes. Has Sekhmet\'s Vigor (D-Pad left) to revive downed players. Melee with spikes is one-hit until round 16. Build the Staff of Fire first, then complete the upgrade steps.',
    steps: [
      {
        order: 1,
        label:
          'Crazy Place riddle (Fire section): Kill approximately 30 zombies with the Staff of Fire on the metal grates. They explode into black smoke and fill the four cauldrons nearby. This step can be done alongside other staff upgrade charge steps.',
      },
      {
        order: 2,
        label:
          'Church torches (main realm): In the church basement there are seven torches with numbers below (one is a bloodstain representing 4). Upstairs on the far wall, four symbols are lit. Use the ternary numeral system to convert the symbols to numbers, then light the four correct torches with the Staff of Fire. The number 4 is always one of them. Audio cue and beam from Excavation Site when done.',
      },
      {
        order: 3,
        label:
          'Floating rings: In the lower Excavation Site, use the levers to rotate the four rings until all lights are red. Shoot the red orb inside with the Staff of Fire; it glows red and shoots up.',
      },
      {
        order: 4,
        label:
          'Charge the staff: Place the Staff of Fire in the red pedestal in the Crazy Place. Kill about 20 zombies in the Crazy Place so their souls go into the staff. Samantha will speak; the staff icon gets a red outline. Pick up Kagutsuchi\'s Blood from the pedestal. If lost, it returns to the Excavation Site pedestal and does not need to be upgraded again.',
      },
    ],
  },
  {
    gameShortName: 'BO2',
    mapSlug: 'origins',
    name: 'Staff of Wind',
    slug: 'staff-of-wind',
    type: 'BUILDABLE',
    xpReward: 0,
    videoEmbedUrl: 'https://www.youtube.com/embed/RcfCNg9w3vU',
    description:
      'One of four elemental staff wonder weapons. Shoots wind blasts that kill at point blank until round 23 and knock back zombies at range. Three staff parts are inside the three Giant Robots\' heads. Shoot the foot with glowing lights and get stepped on by the robot to be sent to its head; only one foot is lit per robot pass (randomized). Requires yellow record, gramophone, lower-level record, and wind gem from the Crazy Place. Built at the yellow pedestal on the lowest level of the Excavation Site.',
    steps: [
      {
        order: 1,
        label:
          'Staff parts: One part in each of the three Giant Robots\' heads (Freya, Odin, Thor). Shoot the glowing foot under the robot and let it step on you to enter the head. Only one foot is lit per pass; which foot is random each time.',
      },
      {
        order: 2,
        label:
          'Yellow record: Near Generator 5. Spawns on the partially broken wall to the right of Stamin-Up, on boxes near the Lightning tunnel entrance, or on the table at the Lightning tunnel entrance. Gramophone: on the floor in the Excavation Site. Record for lower levels: outside around the Excavation Site.',
      },
      {
        order: 3,
        label:
          'Elemental gem: In the Crazy Place. Enter via the Wind tunnel near Generator 4. Need yellow record and gramophone. A pedestal opens with a yellow glow; the gem rises. Pick it up only when you entered from the Wind tunnel.',
      },
      {
        order: 4,
        label:
          'Build the Staff of Wind at the yellow pedestal on the lowest level of the Excavation Site. Any player can pick it up; if dropped or holder bleeds out, it returns to the pedestal.',
      },
    ],
  },
  {
    gameShortName: 'BO2',
    mapSlug: 'origins',
    name: 'Wind Upgrade',
    slug: 'boreas-fury',
    type: 'BUILDABLE',
    xpReward: 0,
    videoEmbedUrl: 'https://www.youtube.com/embed/RcfCNg9w3vU',
    description:
      'Upgraded Staff of Wind (Boreas\' Fury). More range and wider area of effect; charged shot creates a tornado that pulls in and kills nearby zombies. Has Sekhmet\'s Vigor (D-Pad left) to revive downed players. Melee with spikes is one-hit until round 16. Build the Staff of Wind first, then complete the upgrade steps.',
    steps: [
      {
        order: 1,
        label:
          'Crazy Place riddle (Wind section): Above the portal, four concentric rings have four symbols each. Match each ring\'s symbols to the symbol on the pillar they point to (base-4 numbers: lines in shapes). Shoot rings with the Staff of Wind to rotate them. The correct order never changes; use the reference image. Stand between the rocks to the right of the portal to match. When correct, inner rings rotate up and an audio cue plays.',
        imageUrl: '/images/buildables/bo2/origins-wind-cheatsheet-1.webp',
      },
      {
        order: 2,
        label:
          'Smoking stone balls (main realm): Three stone balls with smoke—at Generator 4, next to the tank\'s returning pathway (reach from church by backtracking, or jump off the tank when it returns from tank station), and near Generator 5. Shoot each with the Staff of Wind to direct the smoke toward the Excavation Site. Audio cue and beam from Excavation Site when all three are aimed correctly.',
      },
      {
        order: 3,
        label:
          'Floating rings: In the lower Excavation Site, use the levers to rotate the four rings until all lights are yellow. Shoot the yellow orb inside with the Staff of Wind; it glows yellow and shoots up.',
      },
      {
        order: 4,
        label:
          'Charge the staff: Place the Staff of Wind in the yellow pedestal in the Crazy Place. Kill about 20 zombies in the Crazy Place so their souls go into the staff. Samantha will speak; the staff icon gets a red outline. Pick up Boreas\' Fury from the pedestal. If lost, it returns to the Excavation Site pedestal and does not need to be upgraded again.',
      },
    ],
  },

  // ——— Origins (BO2): Main Quest ———

  {
    gameShortName: 'BO2',
    mapSlug: 'origins',
    name: 'Little Lost Girl',
    slug: 'little-lost-girl',
    type: 'MAIN_QUEST',
    xpReward: 8500,
    videoEmbedUrl: 'https://www.youtube.com/embed/GKxYyr60Umc',
    description:
      'The main Easter Egg for Origins. Primis (Tank, Nikolai, Takeo, Richtofen) are guided by the voice of a little girl to free Samantha from Agartha. Requires obtaining and upgrading all four elemental staffs, placing them in the pedestals, breaking the seal with G-Strike, deploying the Maxis Drone, and more. Cannot be completed on Easy difficulty.',
    rewardsDescription:
      'Little Lost Girl achievement (75G). Completing Step 7 unlocks the achievement; Step 8 frees Samantha and plays the ending cutscene.',
    steps: [
      {
        order: 1,
        label:
          '[Step 1 — Secure the keys]: Obtain and upgrade all four elemental staffs: Staff of Fire, Staff of Ice, Staff of Lightning, and Staff of Wind. See each staff buildable guide. Note: All six generators must have been on at the same time at least once after building all staffs, or the next step will not start.',
        buildableReferenceSlug: 'staff-of-fire',
      },
      {
        order: 2,
        label:
          '[Step 2 — Ascend from darkness]: Place each upgraded staff in its matching pedestal. One pedestal is in the Excavation Site (lowest level, in front of the original four); one in each Giant Robot head. Ull\'s Arrow (Ice) → Freya (left, Church). Boreas\' Fury (Wind) → Odin (center, Excavation Site). Kimat\'s Bite (Lightning) → Thor (right, Gen 2 & 3). Kagutsuchi\'s Blood (Fire) → fourth pedestal in the Staff Room. Any order. All six generators must be on or pedestals will not despawn.',
      },
      {
        order: 3,
        label:
          '[Step 3 — Rain fire]: One player enters a robot (only one foot lit at a time) and presses the red button. Another player throws a G-Strike onto the seal behind and to the right of Generator 5 (large cracked stone circle out of bounds). If done in time, the robots fire on the seal and break it. Solo: enter Odin, press button when Maxis says "one" during purge, then run and throw G-Strike on the seal quickly.',
        buildableReferenceSlug: 'g-strike',
      },
      {
        order: 4,
        label:
          '[Step 4 — Unleash the horde]: Deploy the Maxis Drone near the broken seal. Maxis enters the pit; ten Panzer Soldats spawn. Kill all ten to proceed. Use high-damage weapons or upgraded staffs.',
        buildableReferenceSlug: 'maxis-drone',
      },
      {
        order: 5,
        label:
          '[Step 5 — Skewer the winged beast]: With Zombie Blood, a yellow plane is visible in the sky. Shoot it down; the zombie pilot drops and circles the Excavation Site clockwise (only visible in Zombie Blood). Kill it to get the upgraded Maxis Drone (stronger, Pack-a-Punch machine gun). Run counter-clockwise to meet it.',
        buildableReferenceSlug: 'maxis-drone',
      },
      {
        order: 6,
        label:
          '[Step 6 — Wield a fist of iron]: All players must get the One Inch Punch from Rituals of the Ancients (if needed) and upgrade it by hitting 20 Crusader Zombies with white glowing arms inside the Excavation Site with the One Inch Punch. A glowing tablet drops; pick it up to obtain the Iron Fist. All players in the game must obtain the Iron Fist.',
        buildableReferenceSlug: 'one-inch-punch',
      },
      {
        order: 7,
        label:
          '[Step 7 — Raise hell]: Place all four staffs on their pedestals in the Crazy Place. Kill 100 Templar Zombies inside the Crazy Place; souls flow to the center. When enough are killed, the screen flashes and the portal opens (ceiling becomes a vortex). This step unlocks the achievement. Rocks in the Crazy Place stop falling, making it a safe holdout.',
      },
      {
        order: 8,
        label:
          '[Step 8 — Freedom]: Deploy the Maxis Drone in the Crazy Place. He rises into the portal. Hold the action button on the blue rock in the center to "access the teleporter" and end the game. The ending cutscene plays. Note: All six generators must have been on at least once (including after Step 5) or the teleporter will not end the game.',
        buildableReferenceSlug: 'maxis-drone',
      },
    ],
  },

  // ——— Origins (BO2): Musical ———

  {
    gameShortName: 'BO2',
    mapSlug: 'origins',
    name: 'Archangel',
    slug: 'archangel',
    type: 'MUSICAL',
    xpReward: 0,
    description:
      'The song "Archangel" (Elena Siegman, Malukah & Clark S. Nova) plays when the player interacts with three green blocks of raw Divinium in order.',
    steps: [
      {
        order: 1,
        label:
          'First Divinium block: In the spawn room, to the right of the Rituals of the Ancients chest on the other side of the bunk bed.',
      },
      {
        order: 2,
        label:
          'Second Divinium block: On the second floor of the work station, opposite the stairway, under a bed.',
      },
      {
        order: 3,
        label:
          'Third Divinium block: On the scaffolding to the left of the Excavation Site entrance (facing spawn), next to a crate. Interact with all three to play Archangel.',
      },
    ],
  },
  {
    gameShortName: 'BO2',
    mapSlug: 'origins',
    name: 'Shepherd of Fire',
    slug: 'shepherd-of-fire',
    type: 'MUSICAL',
    xpReward: 0,
    description:
      'The intro song "Shepherd of Fire" (Avenged Sevenfold) plays when the player interacts with three red radios in order. In Black Ops III, the radios have their fronts removed.',
    steps: [
      {
        order: 1,
        label:
          'First radio: On the scaffolding inside the Excavation Site, above the possible Maxis Drone part location.',
      },
      {
        order: 2,
        label: 'Second radio: Inside the Giant Robot Freya, opposite the audio log.',
      },
      {
        order: 3,
        label:
          'Third radio: On the left edge of the fire area in the Crazy Place. Interact with all three to play Shepherd of Fire.',
      },
    ],
  },
  {
    gameShortName: 'BO2',
    mapSlug: 'origins',
    name: 'Aether',
    slug: 'aether',
    type: 'MUSICAL',
    xpReward: 0,
    description:
      'The song "Aether" can be activated by going prone and pressing the action button in front of the "1" floor panels at Generator 1 (both panels) and the "5" panel at Generator 5. Generator 5 must be powered on. References Element 115 (Divinium).',
    steps: [
      {
        order: 1,
        label:
          'Go prone and press the action button in front of both "1" floor panels at Generator 1.',
      },
      {
        order: 2,
        label:
          'Go prone and press the action button in front of the "5" floor panel at Generator 5 (generator must be on). The song Aether will play.',
      },
    ],
  },
  {
    gameShortName: 'BO2',
    mapSlug: 'origins',
    name: 'Remember Forever',
    slug: 'remember-forever',
    type: 'MUSICAL',
    xpReward: 0,
    description:
      'Song "Remember Forever" (Tori Letzler). Added in the Black Ops III Zombie Chronicles remaster. Four wisps on the lowest ring in the Excavation Site (where staffs are upgraded) are visible only with Zombie Blood. Shoot each wisp with the correct staff (one per staff; order can be guessed). Then go to the Crazy Place center, interact with the Samantha doll, shoot the spawned dolls in the circle, then shoot the rising doll to activate the song.',
    steps: [
      {
        order: 1,
        label:
          'With Zombie Blood, find the four wisps on the lowest ring in the Excavation Site (staff upgrade area). Shoot each wisp with its matching staff (Fire, Ice, Lightning, Wind). Staffs do not need to be upgraded; the shooter does not need Zombie Blood. Wrong staff does not reset progress.',
      },
      {
        order: 2,
        label:
          'Go to the Crazy Place center. A Samantha doll appears; press the action button. More dolls spawn in a circle. Shoot all of them. A Samantha doll rises into the air and drops a Max Ammo; the song Remember Forever plays.',
      },
    ],
  },

  // ——— Origins (BO2): Side / Other ———

  {
    gameShortName: 'BO2',
    mapSlug: 'origins',
    name: 'Church Jumpscare',
    slug: 'church-jumpscare',
    type: 'SIDE_QUEST',
    xpReward: 0,
    description:
      'When zooming in at the burning church with a sniper rifle (standard scope), a skull suddenly appears on screen with a high-pitched scream, similar to the Mob of the Dead jumpscare.',
    steps: [
      {
        order: 1,
        label:
          'Use a sniper rifle and zoom in at the burning church with the standard scope. A skull image and scream will trigger.',
      },
    ],
  },
  {
    gameShortName: 'BO2',
    mapSlug: 'origins',
    name: 'Ciphers and Scrap Paper',
    slug: 'ciphers-and-scrap-paper',
    type: 'SIDE_QUEST',
    xpReward: 0,
    categoryTag: 'Cipher',
    description:
      'Five ciphers and one scrap paper can be found on Origins. The ciphers are Vigenère ciphers (key: "wewerethereatthebeginningandattheend" for 1–4; Cipher 5 uses "Inferno"). They give backstory to events before Origins; the scrap paper shows a drawing of Primis at the end of the Great War. A sniper rifle is needed to read most ciphers.',
    steps: [
      {
        order: 1,
        label:
          'Cipher #1: Bottom floor of the Workshop bunker (between No Man\'s Land and spawn), behind the map on the wall next to the workbench. Shoot the map to reveal a hole with the note. Vigenère key "wewerethereatthebeginningandattheend". Plaintext: Edward\'s work, rift with Group 935, contact with allies.',
        imageUrl: '/images/easter-eggs/origins-cipher-1.webp',
      },
      {
        order: 2,
        label:
          'Cipher #2: Inside the head of the Giant Robot Thor. Sniper needed. Same key as Cipher #1. Plaintext: Ancients\' knowledge, questioning science and the universe, openness to a higher power.',
        imageUrl: '/images/easter-eggs/origins-cipher-2.webp',
      },
      {
        order: 3,
        label:
          'Cipher #3: Near the Church, in an area reachable only with the Tank. Sniper needed. Same key. Plaintext: Edward at Heidelberg, parents\' death, influence of Group 935.',
        imageUrl: '/images/easter-eggs/origins-cipher-3.webp',
      },
      {
        order: 4,
        label:
          'Cipher #4: In the catacombs above the Staffs Room. Sniper needed. Same key. Plaintext: Samantha may be the key; she holds dominion over this realm.',
        imageUrl: '/images/easter-eggs/origins-cipher-4.webp',
      },
      {
        order: 5,
        label:
          'Cipher #5: After upgrading all staffs and placing the Fire Staff in the fifth pedestal in the Staff Room, the panels above turn white, red, or rarely green and blink in Morse. Red = "Inferno"; white = cipher text; green = Giovan Battista Bellaso. Vigenère key "Inferno". Plaintext: Warn Messines; something blue in the earth; men became beasts; Liberate tute de infernis.',
      },
      {
        order: 6,
        label:
          'Scrap paper: One scrap paper is scattered around the map in pieces. When assembled, it forms a drawing of Primis at the end of the Great War.',
        imageUrl: '/images/easter-eggs/origins-cipher-scraps.webp',
      },
    ],
  },

  // ——— Origins (BO3 Zombie Chronicles) ———
  // ——— Origins (BO3 ZC): Buildables ———

  {
    gameShortName: 'BO3',
    mapSlug: 'bo3-origins',
    name: 'Zombie Shield',
    slug: 'zombie-shield',
    type: 'BUILDABLE',
    xpReward: 0,
    videoEmbedUrl: 'https://www.youtube.com/embed/Ktg_cAGZy9Y',
    description:
      'Buildable shield that blocks zombie attacks and can be used to melee. Three parts: Face Screen, Handles, and Shield Frame. Built at the workbench in the Workshop (between No Man\'s Land and spawn). Parts spawn in multiple locations.',
    steps: [
      {
        order: 1,
        label:
          'Face Screen: In the Fire tunnel, on a table to the right of the gateway.',
        imageUrl: '/images/buildables/bo2/origins-shield-face-1.png',
      },
      {
        order: 2,
        label:
          'Face Screen: To the right of the fire tunnel, in the trench room.',
        imageUrl: '/images/buildables/bo2/origins-shield-face-2.png',
      },
      {
        order: 3,
        label:
          'Face Screen: In the trench tunnel near Speed Cola, behind the crate heading to the Workshop.',
        imageUrl: '/images/buildables/bo2/origins-shield-face-3.png',
      },
      {
        order: 4,
        label:
          'Handles: To the right of the first area leading to Generator 2 from spawn, in the trench room.',
        imageUrl: '/images/buildables/bo2/origins-shield-handles-1.png',
      },
      {
        order: 5,
        label:
          'Handles: At the end of the trenches past Generator 2 and the Workshop.',
        imageUrl: '/images/buildables/bo2/origins-shield-handles-2.png',
      },
      {
        order: 6,
        label:
          'Handles: Near Generator 2, on top of the Tank Station near some broken piping.',
        imageUrl: '/images/buildables/bo2/origins-shield-handles-3.png',
      },
      {
        order: 7,
        label:
          'Shield Frame: Near Generator 4, to the left of the MP40 nearby.',
        imageUrl: '/images/buildables/bo2/origins-shield-frame-1.png',
      },
      {
        order: 8,
        label:
          'Shield Frame: In the marshlands just outside Generator 4, heading towards the trenches to the church.',
        imageUrl: '/images/buildables/bo2/origins-shield-frame-2.png',
      },
      {
        order: 9,
        label:
          'Shield Frame: In a Giant Robot footprint near the Excavation Site.',
        imageUrl: '/images/buildables/bo2/origins-shield-frame-3.png',
      },
    ],
  },
  {
    gameShortName: 'BO3',
    mapSlug: 'bo3-origins',
    name: 'Maxis Drone',
    slug: 'maxis-drone',
    type: 'BUILDABLE',
    xpReward: 0,
    videoEmbedUrl: 'https://www.youtube.com/embed/pHguGg7YFUA',
    description:
      'Buildable drone that can be deployed to attack zombies and is required for the Little Lost Girl Easter egg (Steps 4, 5, and 8). Three parts: Brain, Frame, and Rotor. Built at a workbench on the map.',
    steps: [
      {
        order: 1,
        label:
          'Brain: On a table on the lower floor of the starting room, next to the stairs up to Generator 1.',
      },
      {
        order: 2,
        label:
          'Frame: In the Ice Tunnel, near Generator 6, in front of the portal to the Crazy Place.',
      },
      {
        order: 3,
        label:
          'Frame: Near the crossbone sign on the tank\'s muddy pathway to Generator 4.',
      },
      {
        order: 4,
        label:
          'Frame: Near the crossbone sign on the tank\'s muddy pathway to Generator 5.',
      },
      {
        order: 5,
        label:
          'Rotor: Near the very bottom of the Excavation Site, on top of a box on a scaffolding next to a lever.',
      },
      {
        order: 6,
        label:
          'Rotor: On top of the Excavation Site near the Pack-a-Punch.',
      },
      {
        order: 7,
        label:
          'Rotor: In the Excavation Site around the Secret Entrance.',
      },
    ],
  },
  {
    gameShortName: 'BO3',
    mapSlug: 'bo3-origins',
    name: 'Staff of Ice',
    slug: 'staff-of-ice',
    type: 'BUILDABLE',
    xpReward: 0,
    videoEmbedUrl: 'https://www.youtube.com/embed/QwX-Y3qTga0',
    description:
      'One of four elemental staff wonder weapons. Fires ice blasts that slow and freeze zombies. Three staff parts are dug from dig spots when it is snowing (typically rounds 2–4, round 10, or randomly). Requires the blue record, gramophone, record for lower Excavation Site, and the ice elemental gem from the Crazy Place. Built at the blue pedestal on the lowest level of the Excavation Site.',
    steps: [
      {
        order: 1,
        label:
          'Staff parts: Dig from dig spots when it is snowing. One part in the starting area (spawn to Workshop, either side), one in the middle area of the map, one near the church.',
      },
      {
        order: 2,
        label:
          'Blue record: Near Generator 2, inside the tank station on one of the shelves.',
      },
      {
        order: 3,
        label:
          'Gramophone: Always on the floor inside the Excavation Site. Record for lower Excavation Site: outside around the Excavation Site.',
      },
      {
        order: 4,
        label:
          'Elemental gem: Inside the Crazy Place. Enter via the Ice tunnel near the church. Need blue record and gramophone. A pedestal opens with a blue glow; the gem rises. Pick it up only when you entered from the Ice tunnel.',
      },
      {
        order: 5,
        label:
          'Build the Staff of Ice at the blue pedestal on the lowest level of the Excavation Site. Any player can pick it up; if dropped or holder bleeds out, it returns to the pedestal.',
      },
    ],
  },
  {
    gameShortName: 'BO3',
    mapSlug: 'bo3-origins',
    name: 'Ice Upgrade',
    slug: 'ulls-arrow',
    type: 'BUILDABLE',
    xpReward: 0,
    videoEmbedUrl: 'https://www.youtube.com/embed/QwX-Y3qTga0',
    description:
      'Upgraded Staff of Ice. More range and wider area of effect; chargeable shot creates a blizzard that pulls in and freezes zombies. Has Sekhmet\'s Vigor (D-Pad left): flip the staff to shoot a fast ball that can revive a downed player. Melee with the spikes is one-hit kill until round 16. Build the Staff of Ice first, then complete the upgrade steps.',
    steps: [
      {
        order: 1,
        label:
          'Crazy Place riddle (Ice section): Above the portal, six floating stone panels show base-4 symbols; on the wall a blue ice panel has dots (base-3). Use the wall pattern to decide which stone panel to shoot with the Staff of Ice. Shoot the correct one to flip it; all six must be flipped. Wrong panel resets all. Twelve patterns exist; six appear per game.',
        imageUrl: '/images/buildables/bo2/origins-ice-cheatsheet-1.webp',
      },
      {
        order: 2,
        label:
          'Gravestones (main realm): Three gravestones with water must be frozen with the Staff of Ice, then destroyed with a bullet weapon. Locations: (1) To the right of the MP40 near Generator 4. (2) Between the Excavation Site and a giant footprint, close to Generator 4. (3) On the small hill when going right from the back exit of the bunker next to Generator 2, next to the downed mech\'s hand.',
      },
      {
        order: 3,
        label:
          'Floating rings: In the lower Excavation Site, use the levers (two on the walkway, two on wooden scaffoldings) to rotate the four rings until all lights are blue. Shoot the blue orb inside with the Staff of Ice; it glows blue and shoots up.',
      },
      {
        order: 4,
        label:
          'Charge the staff: Place the Staff of Ice in the blue pedestal in the Crazy Place. Kill about 20 zombies in the Crazy Place so their souls go into the staff. Samantha will speak; the staff icon gets a red outline. Pick up Ull\'s Arrow from the pedestal. If lost, it returns to the Excavation Site pedestal and does not need to be upgraded again.',
      },
    ],
  },
  {
    gameShortName: 'BO3',
    mapSlug: 'bo3-origins',
    name: 'Staff of Lightning',
    slug: 'staff-of-lightning',
    type: 'BUILDABLE',
    xpReward: 0,
    videoEmbedUrl: 'https://www.youtube.com/embed/2gsIxBvYG-U',
    description:
      'One of four elemental staff wonder weapons. Shoots lightning that chains to multiple zombies. Three staff parts are in areas reachable only by jumping off the tank at specific spots. Requires the purple record, gramophone, record for lower Excavation Site, and the lightning elemental gem from the Crazy Place. Built at the purple pedestal on the lowest level of the Excavation Site.',
    steps: [
      {
        order: 1,
        label:
          'Staff parts (tank jumps): (1) Church to tank station: wooden cutoff staircase on the right before the trench to Generator 2 (watch for Thor stepping there). (2) Tank station to church: cutoff wooden scaffolding on the left linked to the Excavation Site, leads to a small hole. (3) Tank station to church: dirt path before church on the right to upper church level. With one player it is hard to get more than one part per tank run.',
      },
      {
        order: 2,
        label:
          'Purple record: Near Generator 4. Spawns in the tunnel near the Crazy Place gateway (on the bandwagon to the left when entering), or on the table next to the Der Wunderfizz machine. Gramophone: on the floor in the Excavation Site. Record for lower levels: outside around the Excavation Site.',
      },
      {
        order: 3,
        label:
          'Elemental gem: In the Crazy Place. Enter via the Lightning tunnel near Generator 5. Need purple record and gramophone. A pedestal opens with a purple glow; the gem rises. Pick it up only when you entered from the Lightning tunnel.',
      },
      {
        order: 4,
        label:
          'Build the Staff of Lightning at the purple pedestal on the lowest level of the Excavation Site. Any player can pick it up; if dropped or holder bleeds out, it returns to the pedestal.',
      },
    ],
  },
  {
    gameShortName: 'BO3',
    mapSlug: 'bo3-origins',
    name: 'Lightning Upgrade',
    slug: 'kimats-bite',
    type: 'BUILDABLE',
    xpReward: 0,
    videoEmbedUrl: 'https://www.youtube.com/embed/2gsIxBvYG-U',
    description:
      'Upgraded Staff of Lightning (Kimat\'s Bite). Chains more zombies; charged shot fires a slow electric ball that releases bolts along its path. Effective to about round 25 normally (crawlers after), charged to round 30–40. Has Sekhmet\'s Vigor to revive downed players. Melee with spikes is one-hit until round 16. Build the Staff of Lightning first, then complete the upgrade steps.',
    steps: [
      {
        order: 1,
        label:
          'Crazy Place riddle (Lightning section): Near the portal, purple triangular shapes on the wall form a keyboard. Opposite wall shows three chords (three notes each). Play the chords with the Staff of Lightning. Only the bottom row is used; number the seven keys left to right. Play in order: 136, 357, 246.',
        imageUrl: '/images/buildables/bo2/origins-lightning-cheatsheet-1.webp',
      },
      {
        order: 2,
        label:
          'Electrical panels (main realm): Eight panels around the map (one is auto-complete; seven to do). Turn each knob to the correct position. They spark one at a time in this order: Generator 5 (point down); church basement next to torch 3 (point right); church upstairs next to repairable window (point up); Wind tunnel, right of entrance (point up); spawn room bottom of stairs (point left); tank station near Gen 2, left of back door (point down); behind Excavation Site next to path to church (point up). Audio cue and beam from Excavation Site when done.',
      },
      {
        order: 3,
        label:
          'Floating rings: In the lower Excavation Site, use the levers to rotate the four rings until all lights are purple. Shoot the purple orb inside with the Staff of Lightning; it glows purple and shoots up.',
      },
      {
        order: 4,
        label:
          'Charge the staff: Place the Staff of Lightning in the purple pedestal in the Crazy Place. Kill 25 zombies in the Crazy Place so their souls go into the staff. Samantha will speak; the staff icon gets a red outline. Pick up Kimat\'s Bite from the pedestal. If lost, it returns to the Excavation Site pedestal and does not need to be upgraded again.',
      },
    ],
  },
  {
    gameShortName: 'BO3',
    mapSlug: 'bo3-origins',
    name: 'Staff of Fire',
    slug: 'staff-of-fire',
    type: 'BUILDABLE',
    xpReward: 0,
    videoEmbedUrl: 'https://www.youtube.com/embed/bvt6J7hsPuA',
    description:
      'One of four elemental staff wonder weapons. Fires three horizontal molten rock balls that burn and stun zombies. Three staff parts from: Generator 6 reward box (after powering Gen 6), the orange glowing plane (shoot it down—spawns round after opening path to church; part drops by soul box nearest Excavation Site), and the first Panzer Soldat (round 8). Requires red record, gramophone, lower-level record, and fire gem from the Crazy Place. Built at the red pedestal on the lowest level of the Excavation Site.',
    steps: [
      {
        order: 1,
        label:
          'Staff parts: (1) Power Generator 6; the reward box next to it opens with one part. (2) Shoot down the orange glowing plane (appears the round after opening the path to church); the part drops next to the soul box closest to the Excavation Site, on the walkway between two giant footprints. (3) Kill the first Panzer Soldat (round 8); it drops one part.',
      },
      {
        order: 2,
        label:
          'Red record: Near the church. Spawns on boxes between the tank and the staircase up, on the church benches opposite the basin, or on boxes next to Generator 6. Gramophone: on the floor in the Excavation Site. Record for lower levels: outside around the Excavation Site.',
      },
      {
        order: 3,
        label:
          'Elemental gem: In the Crazy Place. Enter via the Fire tunnel near spawn (Generator 1, on the way to Generator 3). Need red record and gramophone. A pedestal opens with a red glow; the gem rises. Pick it up only when you entered from the Fire tunnel.',
      },
      {
        order: 4,
        label:
          'Build the Staff of Fire at the red pedestal on the lowest level of the Excavation Site. Any player can pick it up; if dropped or holder bleeds out, it returns to the pedestal.',
      },
    ],
  },
  {
    gameShortName: 'BO3',
    mapSlug: 'bo3-origins',
    name: 'Fire Upgrade',
    slug: 'kagutsuchis-blood',
    type: 'BUILDABLE',
    xpReward: 0,
    videoEmbedUrl: 'https://www.youtube.com/embed/bvt6J7hsPuA',
    description:
      'Upgraded Staff of Fire (Kagutsuchi\'s Blood). Bigger blast radius; point-blank hits vaporize zombies. Charged shot fires three fireballs that incinerate nearby zombies and leave fire on the ground that explodes. Has Sekhmet\'s Vigor (D-Pad left) to revive downed players. Melee with spikes is one-hit until round 16. Build the Staff of Fire first, then complete the upgrade steps.',
    steps: [
      {
        order: 1,
        label:
          'Crazy Place riddle (Fire section): Kill approximately 30 zombies with the Staff of Fire on the metal grates. They explode into black smoke and fill the four cauldrons nearby. This step can be done alongside other staff upgrade charge steps.',
      },
      {
        order: 2,
        label:
          'Church torches (main realm): In the church basement there are seven torches with numbers below (one is a bloodstain representing 4). Upstairs on the far wall, four symbols are lit. Use the ternary numeral system to convert the symbols to numbers, then light the four correct torches with the Staff of Fire. The number 4 is always one of them. Audio cue and beam from Excavation Site when done.',
      },
      {
        order: 3,
        label:
          'Floating rings: In the lower Excavation Site, use the levers to rotate the four rings until all lights are red. Shoot the red orb inside with the Staff of Fire; it glows red and shoots up.',
      },
      {
        order: 4,
        label:
          'Charge the staff: Place the Staff of Fire in the red pedestal in the Crazy Place. Kill about 20 zombies in the Crazy Place so their souls go into the staff. Samantha will speak; the staff icon gets a red outline. Pick up Kagutsuchi\'s Blood from the pedestal. If lost, it returns to the Excavation Site pedestal and does not need to be upgraded again.',
      },
    ],
  },
  {
    gameShortName: 'BO3',
    mapSlug: 'bo3-origins',
    name: 'Staff of Wind',
    slug: 'staff-of-wind',
    type: 'BUILDABLE',
    xpReward: 0,
    videoEmbedUrl: 'https://www.youtube.com/embed/RcfCNg9w3vU',
    description:
      'One of four elemental staff wonder weapons. Shoots wind blasts that kill at point blank until round 23 and knock back zombies at range. Three staff parts are inside the three Giant Robots\' heads. Shoot the foot with glowing lights and get stepped on by the robot to be sent to its head; only one foot is lit per robot pass (randomized). Requires yellow record, gramophone, lower-level record, and wind gem from the Crazy Place. Built at the yellow pedestal on the lowest level of the Excavation Site.',
    steps: [
      {
        order: 1,
        label:
          'Staff parts: One part in each of the three Giant Robots\' heads (Freya, Odin, Thor). Shoot the glowing foot under the robot and let it step on you to enter the head. Only one foot is lit per pass; which foot is random each time.',
      },
      {
        order: 2,
        label:
          'Yellow record: Near Generator 5. Spawns on the partially broken wall to the right of Stamin-Up, on boxes near the Lightning tunnel entrance, or on the table at the Lightning tunnel entrance. Gramophone: on the floor in the Excavation Site. Record for lower levels: outside around the Excavation Site.',
      },
      {
        order: 3,
        label:
          'Elemental gem: In the Crazy Place. Enter via the Wind tunnel near Generator 4. Need yellow record and gramophone. A pedestal opens with a yellow glow; the gem rises. Pick it up only when you entered from the Wind tunnel.',
      },
      {
        order: 4,
        label:
          'Build the Staff of Wind at the yellow pedestal on the lowest level of the Excavation Site. Any player can pick it up; if dropped or holder bleeds out, it returns to the pedestal.',
      },
    ],
  },
  {
    gameShortName: 'BO3',
    mapSlug: 'bo3-origins',
    name: 'Wind Upgrade',
    slug: 'boreas-fury',
    type: 'BUILDABLE',
    xpReward: 0,
    videoEmbedUrl: 'https://www.youtube.com/embed/RcfCNg9w3vU',
    description:
      'Upgraded Staff of Wind (Boreas\' Fury). More range and wider area of effect; charged shot creates a tornado that pulls in and kills nearby zombies. Has Sekhmet\'s Vigor (D-Pad left) to revive downed players. Melee with spikes is one-hit until round 16. Build the Staff of Wind first, then complete the upgrade steps.',
    steps: [
      {
        order: 1,
        label:
          'Crazy Place riddle (Wind section): Above the portal, four concentric rings have four symbols each. Match each ring\'s symbols to the symbol on the pillar they point to (base-4 numbers: lines in shapes). Shoot rings with the Staff of Wind to rotate them. The correct order never changes; use the reference image. Stand between the rocks to the right of the portal to match. When correct, inner rings rotate up and an audio cue plays.',
        imageUrl: '/images/buildables/bo2/origins-wind-cheatsheet-1.webp',
      },
      {
        order: 2,
        label:
          'Smoking stone balls (main realm): Three stone balls with smoke—at Generator 4, next to the tank\'s returning pathway (reach from church by backtracking, or jump off the tank when it returns from tank station), and near Generator 5. Shoot each with the Staff of Wind to direct the smoke toward the Excavation Site. Audio cue and beam from Excavation Site when all three are aimed correctly.',
      },
      {
        order: 3,
        label:
          'Floating rings: In the lower Excavation Site, use the levers to rotate the four rings until all lights are yellow. Shoot the yellow orb inside with the Staff of Wind; it glows yellow and shoots up.',
      },
      {
        order: 4,
        label:
          'Charge the staff: Place the Staff of Wind in the yellow pedestal in the Crazy Place. Kill about 20 zombies in the Crazy Place so their souls go into the staff. Samantha will speak; the staff icon gets a red outline. Pick up Boreas\' Fury from the pedestal. If lost, it returns to the Excavation Site pedestal and does not need to be upgraded again.',
      },
    ],
  },

  // ——— Origins (BO3 ZC): Main Quest ———

  {
    gameShortName: 'BO3',
    mapSlug: 'bo3-origins',
    name: 'Little Lost Girl',
    slug: 'little-lost-girl',
    type: 'MAIN_QUEST',
    xpReward: 8500,
    videoEmbedUrl: 'https://www.youtube.com/embed/GKxYyr60Umc',
    description:
      'The main Easter Egg for Origins. Primis (Tank, Nikolai, Takeo, Richtofen) are guided by the voice of a little girl to free Samantha from Agartha. Requires obtaining and upgrading all four elemental staffs, placing them in the pedestals, breaking the seal with G-Strike, deploying the Maxis Drone, and more. Cannot be completed on Easy difficulty.',
    rewardsDescription:
      'Little Lost Girl achievement (75G). Completing Step 7 unlocks the achievement; Step 8 frees Samantha and plays the ending cutscene.',
    steps: [
      {
        order: 1,
        label:
          '[Step 1 — Secure the keys]: Obtain and upgrade all four elemental staffs: Staff of Fire, Staff of Ice, Staff of Lightning, and Staff of Wind. See each staff buildable guide. Note: All six generators must have been on at the same time at least once after building all staffs, or the next step will not start.',
        buildableReferenceSlug: 'staff-of-fire',
      },
      {
        order: 2,
        label:
          '[Step 2 — Ascend from darkness]: Place each upgraded staff in its matching pedestal. One pedestal is in the Excavation Site (lowest level, in front of the original four); one in each Giant Robot head. Ull\'s Arrow (Ice) → Freya (left, Church). Boreas\' Fury (Wind) → Odin (center, Excavation Site). Kimat\'s Bite (Lightning) → Thor (right, Gen 2 & 3). Kagutsuchi\'s Blood (Fire) → fourth pedestal in the Staff Room. Any order. All six generators must be on or pedestals will not despawn.',
      },
      {
        order: 3,
        label:
          '[Step 3 — Rain fire]: One player enters a robot (only one foot lit at a time) and presses the red button. Another player throws a G-Strike onto the seal behind and to the right of Generator 5 (large cracked stone circle out of bounds). If done in time, the robots fire on the seal and break it. Solo: enter Odin, press button when Maxis says "one" during purge, then run and throw G-Strike on the seal quickly.',
        buildableReferenceSlug: 'g-strike',
      },
      {
        order: 4,
        label:
          '[Step 4 — Unleash the horde]: Deploy the Maxis Drone near the broken seal. Maxis enters the pit; ten Panzer Soldats spawn. Kill all ten to proceed. Use high-damage weapons or upgraded staffs.',
        buildableReferenceSlug: 'maxis-drone',
      },
      {
        order: 5,
        label:
          '[Step 5 — Skewer the winged beast]: With Zombie Blood, a yellow plane is visible in the sky. Shoot it down; the zombie pilot drops and circles the Excavation Site clockwise (only visible in Zombie Blood). Kill it to get the upgraded Maxis Drone (stronger, Pack-a-Punch machine gun). Run counter-clockwise to meet it.',
        buildableReferenceSlug: 'maxis-drone',
      },
      {
        order: 6,
        label:
          '[Step 6 — Wield a fist of iron]: All players must get the One Inch Punch from Rituals of the Ancients (if needed) and upgrade it by hitting 20 Crusader Zombies with white glowing arms inside the Excavation Site with the One Inch Punch. A glowing tablet drops; pick it up to obtain the Iron Fist. All players in the game must obtain the Iron Fist.',
        buildableReferenceSlug: 'one-inch-punch',
      },
      {
        order: 7,
        label:
          '[Step 7 — Raise hell]: Place all four staffs on their pedestals in the Crazy Place. Kill 100 Templar Zombies inside the Crazy Place; souls flow to the center. When enough are killed, the screen flashes and the portal opens (ceiling becomes a vortex). This step unlocks the achievement. Rocks in the Crazy Place stop falling, making it a safe holdout.',
      },
      {
        order: 8,
        label:
          '[Step 8 — Freedom]: Deploy the Maxis Drone in the Crazy Place. He rises into the portal. Hold the action button on the blue rock in the center to "access the teleporter" and end the game. The ending cutscene plays. Note: All six generators must have been on at least once (including after Step 5) or the teleporter will not end the game.',
        buildableReferenceSlug: 'maxis-drone',
      },
    ],
  },

  // ——— Origins (BO3 ZC): Musical ———

  {
    gameShortName: 'BO3',
    mapSlug: 'bo3-origins',
    name: 'Archangel',
    slug: 'archangel',
    type: 'MUSICAL',
    xpReward: 0,
    description:
      'The song "Archangel" (Elena Siegman, Malukah & Clark S. Nova) plays when the player interacts with three green blocks of raw Divinium in order.',
    steps: [
      {
        order: 1,
        label:
          'First Divinium block: In the spawn room, to the right of the Rituals of the Ancients chest on the other side of the bunk bed.',
      },
      {
        order: 2,
        label:
          'Second Divinium block: On the second floor of the work station, opposite the stairway, under a bed.',
      },
      {
        order: 3,
        label:
          'Third Divinium block: On the scaffolding to the left of the Excavation Site entrance (facing spawn), next to a crate. Interact with all three to play Archangel.',
      },
    ],
  },
  {
    gameShortName: 'BO3',
    mapSlug: 'bo3-origins',
    name: 'Shepherd of Fire',
    slug: 'shepherd-of-fire',
    type: 'MUSICAL',
    xpReward: 0,
    description:
      'The intro song "Shepherd of Fire" (Avenged Sevenfold) plays when the player interacts with three red radios in order. In Black Ops III, the radios have their fronts removed.',
    steps: [
      {
        order: 1,
        label:
          'First radio: On the scaffolding inside the Excavation Site, above the possible Maxis Drone part location.',
      },
      {
        order: 2,
        label: 'Second radio: Inside the Giant Robot Freya, opposite the audio log.',
      },
      {
        order: 3,
        label:
          'Third radio: On the left edge of the fire area in the Crazy Place. Interact with all three to play Shepherd of Fire.',
      },
    ],
  },
  {
    gameShortName: 'BO3',
    mapSlug: 'bo3-origins',
    name: 'Aether',
    slug: 'aether',
    type: 'MUSICAL',
    xpReward: 0,
    description:
      'The song "Aether" can be activated by going prone and pressing the action button in front of the "1" floor panels at Generator 1 (both panels) and the "5" panel at Generator 5. Generator 5 must be powered on. References Element 115 (Divinium).',
    steps: [
      {
        order: 1,
        label:
          'Go prone and press the action button in front of both "1" floor panels at Generator 1.',
      },
      {
        order: 2,
        label:
          'Go prone and press the action button in front of the "5" floor panel at Generator 5 (generator must be on). The song Aether will play.',
      },
    ],
  },
  {
    gameShortName: 'BO3',
    mapSlug: 'bo3-origins',
    name: 'Remember Forever',
    slug: 'remember-forever',
    type: 'MUSICAL',
    xpReward: 0,
    description:
      'Song "Remember Forever" (Tori Letzler). Added in the Black Ops III Zombie Chronicles remaster. Four wisps on the lowest ring in the Excavation Site (where staffs are upgraded) are visible only with Zombie Blood. Shoot each wisp with the correct staff (one per staff; order can be guessed). Then go to the Crazy Place center, interact with the Samantha doll, shoot the spawned dolls in the circle, then shoot the rising doll to activate the song.',
    steps: [
      {
        order: 1,
        label:
          'With Zombie Blood, find the four wisps on the lowest ring in the Excavation Site (staff upgrade area). Shoot each wisp with its matching staff (Fire, Ice, Lightning, Wind). Staffs do not need to be upgraded; the shooter does not need Zombie Blood. Wrong staff does not reset progress.',
      },
      {
        order: 2,
        label:
          'Go to the Crazy Place center. A Samantha doll appears; press the action button. More dolls spawn in a circle. Shoot all of them. A Samantha doll rises into the air and drops a Max Ammo; the song Remember Forever plays.',
      },
    ],
  },

  // ——— Origins (BO3 ZC): Side / Other ———

  {
    gameShortName: 'BO3',
    mapSlug: 'bo3-origins',
    name: 'Church Jumpscare',
    slug: 'church-jumpscare',
    type: 'SIDE_QUEST',
    xpReward: 0,
    description:
      'When zooming in at the burning church with a sniper rifle (standard scope), a skull suddenly appears on screen with a high-pitched scream, similar to the Mob of the Dead jumpscare.',
    steps: [
      {
        order: 1,
        label:
          'Use a sniper rifle and zoom in at the burning church with the standard scope. A skull image and scream will trigger.',
      },
    ],
  },
  {
    gameShortName: 'BO3',
    mapSlug: 'bo3-origins',
    name: 'Ciphers and Scrap Paper',
    slug: 'ciphers-and-scrap-paper',
    type: 'SIDE_QUEST',
    xpReward: 0,
    categoryTag: 'Cipher',
    description:
      'Five ciphers and one scrap paper can be found on Origins. The ciphers are Vigenère ciphers (key: "wewerethereatthebeginningandattheend" for 1–4; Cipher 5 uses "Inferno"). They give backstory to events before Origins; the scrap paper shows a drawing of Primis at the end of the Great War. A sniper rifle is needed to read most ciphers.',
    steps: [
      {
        order: 1,
        label:
          'Cipher #1: Bottom floor of the Workshop bunker (between No Man\'s Land and spawn), behind the map on the wall next to the workbench. Shoot the map to reveal a hole with the note. Vigenère key "wewerethereatthebeginningandattheend". Plaintext: Edward\'s work, rift with Group 935, contact with allies.',
        imageUrl: '/images/easter-eggs/origins-cipher-1.webp',
      },
      {
        order: 2,
        label:
          'Cipher #2: Inside the head of the Giant Robot Thor. Sniper needed. Same key as Cipher #1. Plaintext: Ancients\' knowledge, questioning science and the universe, openness to a higher power.',
        imageUrl: '/images/easter-eggs/origins-cipher-2.webp',
      },
      {
        order: 3,
        label:
          'Cipher #3: Near the Church, in an area reachable only with the Tank. Sniper needed. Same key. Plaintext: Edward at Heidelberg, parents\' death, influence of Group 935.',
        imageUrl: '/images/easter-eggs/origins-cipher-3.webp',
      },
      {
        order: 4,
        label:
          'Cipher #4: In the catacombs above the Staffs Room. Sniper needed. Same key. Plaintext: Samantha may be the key; she holds dominion over this realm.',
        imageUrl: '/images/easter-eggs/origins-cipher-4.webp',
      },
      {
        order: 5,
        label:
          'Cipher #5: After upgrading all staffs and placing the Fire Staff in the fifth pedestal in the Staff Room, the panels above turn white, red, or rarely green and blink in Morse. Red = "Inferno"; white = cipher text; green = Giovan Battista Bellaso. Vigenère key "Inferno". Plaintext: Warn Messines; something blue in the earth; men became beasts; Liberate tute de infernis.',
      },
      {
        order: 6,
        label:
          'Scrap paper: One scrap paper is scattered around the map in pieces. When assembled, it forms a drawing of Primis at the end of the Great War.',
        imageUrl: '/images/easter-eggs/origins-cipher-scraps.webp',
      },
    ],
  },


  // ========== Zetsubou No Shima, Gorod Krovi, Revelations, BO3 Nacht, BO3 Verrückt (moved from in-progress) ==========

// ——— Zetsubou No Shima (BO3): Main Quest ———

  {
    gameShortName: 'BO3',
    mapSlug: 'zetsubou-no-shima',
    name: 'Seeds of Doubt',
    slug: 'seeds-of-doubt',
    type: 'MAIN_QUEST',
    xpReward: 5500,
    videoEmbedUrl: 'https://www.youtube.com/embed/xOD8HHWMrKU',
    description:
      'Save the original Takeo Masaki. Requires Skull of Nan Sapwe, at least one Anywhere But Here! GobbleGum, KT-4 (upgraded to Masamune for final step), Gas Mask, Zombie Shield, all Trials of the Ancients completed by every player, at least 1 Bucket, and at least 2 Seeds. Completable solo or any player count. Rewards: all map perks, Seeds of Doubt achievement, 5000 XP ("Horticultural Heroism"), Gateworm icon.',
    rewardsDescription: 'All map perks (until downed), Seeds of Doubt achievement, 5000 XP, Gateworm icon. Spawn back in boss arena—ride elevator to return to map.',
    steps: [
      {
        order: 1,
        label:
          '[Blueprint and elevator] With Skull of Nan Sapwe, go to Living Quarters in the Bunker (purple water area). Mesmerize the piece of paper on the wall across from the purple water to reveal the second half. Mesmerize the rusted door to the left of the inoperable elevator (across from anti-aircraft platform door) to reveal the broken generator missing three Cogs.',
        buildableReferenceSlug: 'skull-of-nan-sapwe',
      },
      {
        order: 2,
        label:
          '[Cog 1] Use Anywhere But Here! GobbleGum to teleport to the secret room above Lab A. Pick up the cog from the ground. Exit via the GobbleGum again or the hole in the wall.',
      },
      {
        order: 3,
        label:
          '[Cog 2] Plant a seed, water with blue water, and shoot with KT-4 once per round for three rounds. When fully grown, open the pod—may contain a Flak shell (grow multiple seeds to improve odds). Take the shell to the FlaK 88 at the anti-aircraft platform; hold action at the back to load it. Wait for the cargo plane (cycles ~2–2.5 min). When the plane is lined up with the barrel, hold action on the FlaK 88 to fire and destroy the plane. Cog lands in one of three spots (smoky aura): outside Bunker entrance by large tree; back staircase to Zipline by Lab A; by meteorite behind Lab B near wheelbarrow and green water. If you miss the plane, grow another plant for a new shell.',
        buildableReferenceSlug: 'kt-4',
      },
      {
        order: 4,
        label:
          '[Cog 3] All players complete all three Trials of the Ancients. Stand on the trials platform with the Zombie Shield equipped when lightning strikes (periodic after trials are done) to electrify it. Go to the zipline between Lab A and Docks. Cog is on the small dock under the zipline. Solo: electrify the zipline panel (melee), use zipline, melee when over the dock to drop off. Co-op: one player uses zipline; the player with the electrified shield shocks the panel when the other is over the dock so they fall onto it. Safest: start from Docks going toward Lab A, electrify, get on, melee immediately.',
        buildableReferenceSlug: 'zombie-shield',
      },
      {
        order: 5,
        label:
          '[Elevator and boss] Bring all three Cogs to the generator behind the elevator; hold action to install them. All players need a Gas Mask equipped. At least one player must have the Masamune. Enter the elevator and use it. In the underground area, the player with the Masamune shoots the three vines at the glowing parts to reach the door. Inside, shoot the weakspot spore on one of the Giant Thrasher\'s arms to start the boss fight. Four weakspot spores total (time-gated). Between spores, survive zombies, Spiders, and Thrashers; when a new spore appears, shoot it with the Masamune. After the Giant Thrasher is killed, the ending cutscene plays.',
        buildableReferenceSlug: 'masamune',
      },
    ],
  },

  // ——— Zetsubou No Shima (BO3): Buildables ———

  {
    gameShortName: 'BO3',
    mapSlug: 'zetsubou-no-shima',
    name: 'KT-4',
    slug: 'kt-4',
    type: 'BUILDABLE',
    xpReward: 0,
    videoEmbedUrl: 'https://www.youtube.com/embed/LXF6tgohM7s',
    description:
      'Buildable wonder weapon: green liquid damages zombies and enriches plants. Key for Seeds of Doubt and map mechanics. Three ingredients mixed at the KT-4 bench in the Bunker. Power must be on for the vial zombie to spawn.',
    steps: [
      {
        order: 1,
        label: 'Vial: A glowing yellow-green scientist zombie drops the vial on death (secured on its hip). Spawns after the main Power Switch in the Bunker is on; often first at/under Lab B. Stay near Lab B for a few rounds.',
      },
      {
        order: 2,
        label: 'Venom: In Lab A (power on), lower the cage into the swamp to open it (purple mist arm). Lure a Spider into the cage and raise it back to the lab. The syringe extracts venom from the Spider (killing it). If it was the last Spider of the round, Max Ammo spawns inside the cage—lower the cage again to get it.',
      },
      {
        order: 3,
        label: 'Plant: In the flooded Bunker Laboratory, right of Mule Kick, at the very end of the Divinium tunnel (pockets of air and shootable spores for oxygen). Same tunnel as the Turn Wheel for draining water; the plant is deeper past the "drop off" where walls look like Divinium. Mix all three at the KT-4 bench to build.',
      },
    ],
  },
  {
    gameShortName: 'BO3',
    mapSlug: 'zetsubou-no-shima',
    name: 'Masamune',
    slug: 'masamune',
    type: 'BUILDABLE',
    xpReward: 0,
    videoEmbedUrl: 'https://www.youtube.com/embed/5zlqxnnUCQw',
    description:
      'Upgrade for the KT-4. Requires KT-4 first. Three ingredients processed on the second bench (back wall next to KT-4 bench); only interact if holding the KT-4. No visible pickup icons—character dialogue confirms. Required for Seeds of Doubt final step.',
    steps: [
      {
        order: 1,
        label: 'Liquid Divinium: Electrify the Zombie Shield (all players complete all 3 trials, then stand at trials altar with shield until lightning strikes). In Lab B, melee the cage control panel to open and lower the cage into the swamp. Enter from inside Lab B; panels open below. One skeleton holds the Liquid Divinium vial. Co-op: one player electrifies to open cage, another to lower; after getting vial, press console to raise.',
        buildableReferenceSlug: 'zombie-shield',
      },
      {
        order: 2,
        label: 'Spider fang: Clear the webs with the KT-4 in the cave behind the blue water pool near Lab A. Kill the Giant Spider, then interact with the corpse to remove the fang.',
        buildableReferenceSlug: 'kt-4',
      },
      {
        order: 3,
        label: 'Plant: Mesmerize the torn blueprint in Living Quarters (Bunker, corner with purple water). Then Mesmerize the wall to the right of where the original underwater plant was to reveal a hidden Seed planter. Grow the plant: water three times over three rounds. Use iridescent water from the Sewer Pipe—small Divinium meteorite on the right. Most consistent: take Sewer Pipe from back of Bunker toward behind Lab B, press Use once fully past the second blue section.',
        buildableReferenceSlug: 'skull-of-nan-sapwe',
      },
    ],
  },
  {
    gameShortName: 'BO3',
    mapSlug: 'zetsubou-no-shima',
    name: 'Zombie Shield',
    slug: 'zombie-shield',
    type: 'BUILDABLE',
    xpReward: 0,
    videoEmbedUrl: 'https://www.youtube.com/embed/FQ7SHBEsDig',
    description:
      'Buildable shield. Three parts: Handles (below Lab A), Shield Frame (outside Lab B), Face Screen (Anti-Air Platform). After all players complete all three Trials of the Ancients, stand at the trials site with the shield out until lightning strikes to electrify it. Electric shield: stuns zombies, halves Perk and GobbleGum prices, powers Lab A cage (KT-4 venom / Spider Bait), Lab B cage (Masamune Divinium), and zipline console (Seeds of Doubt Cog 3).',
    steps: [
      {
        order: 1,
        label: 'Handles (below Lab A): On pillar where Kuda is bought; on pillar nearest to staircase start; on pillar closest to the window.',
      },
      {
        order: 2,
        label: 'Shield Frame (outside Lab B): On tree on hill facing the lab (boulder and lamp post); on tree at water\'s edge on path from Lab B to Ritual Altar/spawn; on tree in far right corner in front of Lab B below the one-way drop from passage behind Ritual Altar, near Trip Mines.',
      },
      {
        order: 3,
        label: 'Face Screen (Anti-Air Platform): By window with Seed planter; near window in machine gun nest; up stairs to the right in rubble.',
      },
    ],
  },
  {
    gameShortName: 'BO3',
    mapSlug: 'zetsubou-no-shima',
    name: 'Gas Mask',
    slug: 'gas-mask',
    type: 'BUILDABLE',
    xpReward: 0,
    videoEmbedUrl: 'https://www.youtube.com/embed/JsTuAlJuQ2A',
    description:
      'Buildable equipment. Resists toxic spores (prevents coughing that cancels sprint and weapon use). Does not use Equipment Slot—can be used with Zombie Shield. Required for Seeds of Doubt final step. Extends underwater breathing (Iron Lung achievement). Breaks after ~10 spore clouds; multiple clouds in quick succession only deplete after the HUD icon fully disappears.',
    steps: [
      {
        order: 1,
        label: 'Mask Strap (near Propeller Trap / Lab A): On metal rebar at back entrance of crashed plane; on rebar at front entrance of crashed plane; on rock left of Mystery Box spawn, behind Pharo wall buy.',
      },
      {
        order: 2,
        label: 'Mask Cover (green 115 water behind Lab B): Entering from under Lab B, on wooden crate on rightmost path by large rock; on crate right of wheelbarrow by meteorite; on iron catwalk by Perk spawn, on crate touching railing.',
      },
      {
        order: 3,
        label: 'Breathing Tube (cleansing pedestal / Docks from Bunker): On crate next to center pedestal; on crate by Zipline endpoint before metal plating; on rock left of VMP wall buy.',
      },
    ],
  },
  {
    gameShortName: 'BO3',
    mapSlug: 'zetsubou-no-shima',
    name: 'Skull of Nan Sapwe',
    slug: 'skull-of-nan-sapwe',
    type: 'BUILDABLE',
    xpReward: 0,
    videoEmbedUrl: 'https://www.youtube.com/embed/6pxC9-9LzTo',
    description:
      'Specialist wonder weapon. Cleanse the four bloody skulls from the Trials altar at their matching cleansing pedestals (symbols randomized each game). Defend each skull from glowing zombies; return to altar. New staircase opens; enter and try to pick up the Skull—room locks, Keepers spawn. Kill Keepers to charge it (20 in solo). Required for Seeds of Doubt (Mesmerize reveals blueprint and elevator door; Masamune plant wall; red mist spider; Golden Bucket vines). Vaporize and Mesmerize attacks.',
    steps: [
      {
        order: 1,
        label: 'Cleansing pedestals (one skull at a time, match symbol): In front of spawn by central rock near GobbleGum; by Propeller Trap at bottom switch; in Bunker by Docks left of main Power Switch; in Bunker Operation Room downstairs by KT-4/Masamune tables. Defend the skull on the pedestal; success = 500 points, return skull to altar. Failure = skull destroyed, returns to altar next round.',
      },
      {
        order: 2,
        label: 'After all four cleansed and returned: New staircase in front of altar (where the fallen tree was). Enter, try to pick up the Skull—room locks, Keepers spawn. Kill Keepers to charge (solo: 20). Exit reopens; pick up the Skull of Nan Sapwe.',
      },
    ],
  },
  {
    gameShortName: 'BO3',
    mapSlug: 'zetsubou-no-shima',
    name: 'Spider Bait',
    slug: 'spider-bait',
    type: 'BUILDABLE',
    xpReward: 0,
    videoEmbedUrl: 'https://www.youtube.com/embed/BFQmV9Z_PdA',
    description:
      'Hidden wonder weapon: use puts the player in a cocoon and gives control of a Spider for ~50 seconds. One use per round (or Max Ammo). Replaces Trip Mines. Requires Skull of Nan Sapwe, all players to complete all three Trials (for Electrified Shield), and the Lab A cage already used for KT-4 venom (leave it at ground level).',
    steps: [
      {
        order: 1,
        label: 'Red mist spider: On the second or later Spider round, use the Skull to Mesmerize Spiders and find the one emitting red mist (unique dialogue). Optionally kill other Spiders but keep the red mist one alive. Lead it to drink blue (Lab A), green (behind Lab B), and purple (Living Quarters Bunker) water in any order. Avoid wall spores—they kill it. After all three, it emits red mist constantly.',
        buildableReferenceSlug: 'skull-of-nan-sapwe',
      },
      {
        order: 2,
        label: 'Catch and supercharge: Lure the red mist spider into the Lab A cage (lowered to ground). Raise the cage to the lab. Melee the control panel with an Electrified Zombie Shield, then lower the cage so it goes fully underground. If it was the last Spider of the round, Max Ammo spawns in the cage—lower again to get it.',
        buildableReferenceSlug: 'zombie-shield',
      },
      {
        order: 3,
        label: 'Extract: On the next Spider round, kill all Spiders (they have red mist and are more aggressive). When the round ends, raise the Lab A cage. The spider is replaced by a cocoon. Extract the venom; Spider Bait is available at the extraction machine at Lab A for all players.',
      },
    ],
  },

  // ——— Zetsubou No Shima (BO3): Musical ———

  {
    gameShortName: 'BO3',
    mapSlug: 'zetsubou-no-shima',
    name: 'Dead Flowers',
    slug: 'dead-flowers',
    type: 'MUSICAL',
    xpReward: 0,
    description: 'Official Easter Egg song by Malukah. Hold the use button on three sock monkeys to activate.',
    steps: [
      { order: 1, label: 'Sock monkey 1: On power generator to the left of a perk machine by the blue 115 water.' },
      { order: 2, label: 'Sock monkey 2: Top floor of Lab B, on a table left of a floodlight, in front of zombie diagrams.' },
      { order: 3, label: 'Sock monkey 3: On a table in the bunker, right of the KT-4 workbench and left of the Masamune workbench. Hold use on all three.' },
    ],
  },
  {
    gameShortName: 'BO3',
    mapSlug: 'zetsubou-no-shima',
    name: 'Samantha\'s Lullaby (Magic Mix)',
    slug: 'samanthas-lullaby-magic-mix',
    type: 'MUSICAL',
    xpReward: 0,
    description:
      'Fill melody bulbs on the wall next to the purple water location. Seven bulbs total; one is the play button. Fill the other six with purple water in this order: one, three, five, six, seven, five (amount per bulb). Interact with the last bulb to play the song.',
    steps: [
      {
        order: 1,
        label: 'At the wall by the purple water, fill the melody bulbs with purple water in order: 1st bulb (one), 2nd (three), 3rd (five), 4th (six), 5th (seven), 6th (five). Then interact with the play button bulb to activate Samantha\'s Lullaby (Magic Mix).',
      },
    ],
  },

  // ——— Zetsubou No Shima (BO3): Side / Other ———

  {
    gameShortName: 'BO3',
    mapSlug: 'zetsubou-no-shima',
    name: 'Round 50 Monster',
    slug: 'round-50-monster',
    type: 'SIDE_QUEST',
    xpReward: 0,
    description:
      'On round 50 or above, if any player has the Skull of Nan Sapwe, a large monster can be heard and seen in the distance from Lab B.',
    steps: [
      {
        order: 1,
        label: 'Reach round 50 or higher with at least one player holding the Skull of Nan Sapwe. From Lab B, look/hear toward the distance for the large monster.',
        buildableReferenceSlug: 'skull-of-nan-sapwe',
      },
    ],
  },
  {
    gameShortName: 'BO3',
    mapSlug: 'zetsubou-no-shima',
    name: 'One Too Many',
    slug: 'one-too-many',
    type: 'SIDE_QUEST',
    xpReward: 0,
    description:
      'Eat a plant\'s fruit while having 4 or more perks and no extra perk slots from Empty Perk Bottles. The character throws up and the achievement One Too Many unlocks.',
    steps: [
      {
        order: 1,
        label: 'Have 4+ perks without using Empty Perk Bottles for extra slots. Eat the fruit from a plant. Your character throws up; One Too Many achievement unlocks.',
      },
    ],
  },
  {
    gameShortName: 'BO3',
    mapSlug: 'zetsubou-no-shima',
    name: 'The Missing City Poster',
    slug: 'missing-city-poster',
    type: 'SIDE_QUEST',
    xpReward: 0,
    description: 'In the Living Quarters, behind a rebuildable window on the second floor, a poster for The Missing City from Shadows of Evil can be seen, written in Japanese.',
    steps: [
      {
        order: 1,
        label: 'Living Quarters, second floor: Behind the rebuildable window, find the poster for The Missing City (Shadows of Evil) in Japanese.',
      },
    ],
  },
  {
    gameShortName: 'BO3',
    mapSlug: 'zetsubou-no-shima',
    name: 'Doppelgänger Jumpscare',
    slug: 'doppelganger-jumpscare',
    type: 'SIDE_QUEST',
    xpReward: 0,
    description:
      'Use a scoped sniper rifle to aim at the test subject tubes in the bunker up close. A doppelgänger of one of the four characters appears standing still. Approaching it causes it to turn and scream, temporarily immobilizing the player. Only the player who did the step can see the doppelgänger.',
    steps: [
      {
        order: 1,
        label: 'In the bunker, use a scoped sniper to aim up close at the test subject tubes. A character doppelgänger appears. Approach it—it turns and screams, immobilizing you briefly. Only you see it.',
      },
    ],
  },

  // ——— Gorod Krovi (BO3): Main Quest ———

  {
    gameShortName: 'BO3',
    mapSlug: 'gorod-krovi',
    name: 'Love and War',
    slug: 'love-and-war',
    type: 'MAIN_QUEST',
    xpReward: 8500,
    videoEmbedUrl: 'https://www.youtube.com/embed/EDLnCiwz24w',
    description:
      'Free the original Nikolai Belinski. Requires power, Guard of Fafnir, Dragon Network Controller, Dragon Strike, and Gauntlet of Siegfried. Completable solo or co-op. 115 minutes from game start to complete for all-perks reward; can still finish after. Rewards: unlimited perk slots, all map perks (persist after downed), Love and War achievement, 7500 XP ("Mechanized Mourning"). Dragon no longer breathes fire on the map after completion.',
    rewardsDescription: 'Unlimited perk slots, all map perks (persist after downed), Love and War achievement, 7500 XP. Dragon removed from map.',
    steps: [
      {
        order: 1,
        label:
          '[Generator and Dragon Egg] Hatchery basement: destroy a Valkyrie Drone near the generator under the green/black tarp to power it (or leave Valkyrie alive, let it self-destruct rush you by the generator). Shoot the green Dragon Egg on the rafters by the sewer exit; pick it up. Optional: shoot the red light in the sewer ceiling on the ride back (for Group 935 Trophy later). 5-minute countdown starts for Step 2.',
        buildableReferenceSlug: 'gauntlet-of-siegfried',
      },
      {
        order: 2,
        label:
          '[Valves] Six valves (one whistles—has Master Code Cylinder jammed on the left): Dragon Command above S.O.P.H.I.A.; Infirmary below Stamin-Up between bunk beds; Tank Factory bottom left; Armory top opposite Bridge switch; Department Store 3rd floor; Supply Depot right of Mystery Box under stairs. Set five valves so one is green, five blue (sequence randomized each game). Never change the dial on the valve holding the cylinder. Retrieve Master Code Cylinder and bring to S.O.P.H.I.A. If 5 min expires, generator shuts off—press button by generator to restart (no Valkyrie needed).',
      },
      {
        order: 3,
        label:
          '[S.O.P.H.I.A. code] Shoot the spin wheel letters (left or right of each letter, not center) to spell KRONOS top to bottom. Press interact to submit. Wrong code disables until next round.',
      },
      {
        order: 4,
        label:
          '[Six Silver Trophies] Gersh/Planet: In front of Dragon Command facing away, shoot the right statue\'s raised hand (between forked paths to Armory/Infirmary), claim trophy by rubble. Valkyrie: Guard of Fafnir fireball on upward pipe outside Double Tap room (Tank Factory) or central ramp—trophy falls by Double Tap. Mangler: Use Gigant Laser Beam Trap in Supply Depot, wait ~30 s, pick trophy from opened safe. Group 935: After shooting red light in sewer (Step 1), Hatchery toilet on Pack-a-Punch floor. Nuke: Dragon Strike on puddle outside Supply Depot (corner when dropping from Speed Cola, dead tree branches). Groph Pod: Gauntlet 115 Punch (deploy Whelp first) on safe in Operations Bunker. Place all six under the monitor opposite S.O.PH.I.A.',
        buildableReferenceSlug: 'guard-of-fafnir',
      },
      {
        order: 5,
        label:
          '[S.O.PH.I.A.\'s Six Tasks] Press button under monitor in Dragon Command; task order random except Information Download last. Cannot start on Valkyrie round. Simon Says Boom!: Defuse bombs in the order shown slowly (ignore fast order). Solo 3 min, co-op 2 min; wait ~2–3 s after each defuse in co-op. Safe areas if failed: Belinski Square, Hatchery, Dragon Command entrance, on dragon. Capture Gersh: Shoot yellow orb with PaP weapons until he stops (3 times), then he goes to Dragon Command pad. Escort Mangler: Escort green-eyed Russian Mangler to pad (shoot off arm cannon to make him sprint); no Monkey Bombs/Turned/Undead Man Walking/Idle Eyes/In Plain Sight. Escort Valkyrie: Damaged Valkyrie with green camera in Belinski Square; stay close; can destroy it once it starts up Dragon Command stairs to complete. Protect Groph Pod: Defend pod (green light), use Gauntlet Whelp to retrieve Cargo when open, place in tray under S.O.PH.I.A. Information Download: Key card from drawer, Hatchery middle floor red terminal, all players hit button, 4-wave Mangler lockdown, retrieve key card, return to S.O.PH.I.A.',
        buildableReferenceSlug: 'dragon-strike',
      },
      {
        order: 6,
        label:
          '[Free Nikolai] Interact with S.O.PH.I.A.; she gives a power core. Launch Gauntlet Whelp at Nikolai\'s mech in Belinski Square (e.g. left of derailed train) to deliver core. Return to S.O.PH.I.A.; she detaches and flies away. All players stand on the metal grate; it drops into sewer to circular arena behind Belinski Square. Press button in center; Giant Robot fires beam at debris, freeing Nikolai\'s mech.',
        buildableReferenceSlug: 'gauntlet-of-siegfried',
      },
      {
        order: 7,
        label:
          '[Boss fight] Phase 1: Press button to start. Dragon breathes fire (stay at edges/trenches or block with Guard of Fafnir). When Nikolai 1.0 harpoons the dragon, shoot weak spots (right wing, left belly, neck). Phase 2: Nikolai turns hostile. Destroy four power cores (two front lights, two on top when he deploys R.A.P.S.), then center core. Use cover; Danger Closest negates shock harpoons. After mech destroyed: cutscene, unlimited perk slots, all perks, teleport to Belinski Square.',
        buildableReferenceSlug: 'guard-of-fafnir',
      },
    ],
  },

  // ——— Gorod Krovi (BO3): Buildables ———

  {
    gameShortName: 'BO3',
    mapSlug: 'gorod-krovi',
    name: 'Guard of Fafnir',
    slug: 'guard-of-fafnir',
    type: 'BUILDABLE',
    xpReward: 0,
    videoEmbedUrl: 'https://www.youtube.com/embed/B-hjdFIQEqk',
    description:
      'Buildable shield. Three parts: Dragon Visage (Infirmary), Core (Department Store and Operations Bunker), Maw (Armory). Required for Love and War. Can be upgraded to Tiamat\'s Maw.',
    steps: [
      {
        order: 1,
        label: 'Dragon Visage (Infirmary): Top of Operations Bunker staircase, slightly left between two crates by broken bookshelf; on right bunk bed touching staircase to Stamin-Up; facing Stamin-Up look left, on debris under leftmost of 3 broken windows on green wall.',
      },
      {
        order: 2,
        label: 'Core (Department Store and Operations Bunker): Juggernog room on wooden chair next to lit desk; truck with blue barrels downstairs from Department Store before Operations Bunker (left side, opposite GobbleGum); Operations Bunker shelf right of Electric Trap switch, before Infirmary staircase.',
      },
      {
        order: 3,
        label: 'Maw (Armory): Beside Wunderfizz on lowest level, on wooden floor debris; upstairs past doorway next to GobbleGum, on wall next to metal doorway to Supply Depot; top level, on crate ahead when walking upstairs, far right by Bridge switch wall.',
      },
    ],
  },
  {
    gameShortName: 'BO3',
    mapSlug: 'gorod-krovi',
    name: 'Tiamat\'s Maw (Shield Upgrade)',
    slug: 'tiamats-maw',
    type: 'SIDE_QUEST',
    xpReward: 0,
    videoEmbedUrl: 'https://www.youtube.com/embed/B-hjdFIQEqk',
    description:
      'Upgrade Guard of Fafnir to Tiamat\'s Maw. Survive dragon fire twice with shield held the whole time (be in area before fire). Kill 50 zombies with the shield (melee or fireball). Shoot three purple inscription symbols with shield fireball: Dragon Command left dragon platform look left; Supply Depot opposite Speed Cola ramp look up at broken roof; Tank Factory right dragon platform look right on Giant Robot shoulder. Place shield in dead dragon remains in Belinski Square (near trial tombstones), hold interact—shield returns as Tiamat\'s Maw (red fireballs, 35-hit durability).',
    steps: [
      {
        order: 1,
        label: 'Survive dragon fire: Be in an area the dragon will set on fire, hold Guard of Fafnir in front for the full duration. Do this at least twice (first two can be done in either order with the next step).',
        buildableReferenceSlug: 'guard-of-fafnir',
      },
      {
        order: 2,
        label: 'Kill 50 zombies with the shield (melee or fireball). Progress shared in co-op.',
      },
      {
        order: 3,
        label: 'Shoot three purple symbols with shield fireball: Dragon Command left platform; Supply Depot opposite Speed Cola ramp (ceiling); Tank Factory right platform (Giant Robot shoulder). Picking up a new shield from the workbench refills fireballs.',
      },
      {
        order: 4,
        label: 'Place the shield in the dead dragon remains in Belinski Square near the trial tombstones. Hold interact; after a few seconds the Tiamat\'s Maw is in your inventory. One player upgrading unlocks it for all at the workbench.',
        buildableReferenceSlug: 'guard-of-fafnir',
      },
    ],
  },
  {
    gameShortName: 'BO3',
    mapSlug: 'gorod-krovi',
    name: 'Gauntlet of Siegfried',
    slug: 'gauntlet-of-siegfried',
    type: 'BUILDABLE',
    xpReward: 0,
    videoEmbedUrl: 'https://www.youtube.com/embed/rRKpJXVOwyg',
    description:
      'Specialist wonder weapon: Dragon Whelp on gauntlet (flamethrower, melee, deploy Whelp for fireballs, 115 Punch when Whelp is out). Required for Love and War. Obtain Dragon Egg from Hatchery, heat in nest, complete three trials, incubate in Hatchery basement, then claim from trial gravestone. Hatchery visited at least 3 times.',
    steps: [
      {
        order: 1,
        label: 'Dragon Egg: In Hatchery, shoot the unbroken Dragon Egg above the sewer grate (back to Belinski Square); it falls to the right of the grate. Pick it up.',
      },
      {
        order: 2,
        label: 'Heat the egg: Place the egg in a nest where a dragon breathes fire (e.g. nest in front of Dragon Command, center of staircase). Egg must be in nest before the dragon breathes fire. Wait for the round to end, then a full round to cool; pick it up again.',
      },
      {
        order: 3,
        label: 'Trials (in order): Napalm Zombie kills (dragon fire on horde); penetrative multi-kills (Mounted MG42 at Hatchery or sniper—no GKZ-45 Mk3); melee kills (knife, Bowie, or Guard of Fafnir melee/fireball). Tracked on trial gravestone and scoreboard.',
      },
      {
        order: 4,
        label: 'Hatch: Take the egg to the Hatchery basement incubator. Complete the lockdown (Valkyrie Drones). Egg cools again—S.O.PH.I.A. alerts when ready. Pick up the egg, complete the fourth trial at the gravestone in Belinski Square; Gauntlet of Siegfried rises from the ground.',
      },
    ],
  },
  {
    gameShortName: 'BO3',
    mapSlug: 'gorod-krovi',
    name: 'Dragon Strike',
    slug: 'dragon-strike',
    type: 'BUILDABLE',
    xpReward: 0,
    videoEmbedUrl: 'https://www.youtube.com/embed/1yAdvnjykT0',
    description:
      'Equipment: mark a location for dragons to fire; zombies are lured to the mark. One charge, refills with Max Ammo and round change. Required for Love and War. Obtain via four-wave lockdown at Hatchery (interact crystal on top floor; all players in co-op must interact). Can upgrade to Draconite Controller (more damage, larger radius, 2 charges).',
    steps: [
      {
        order: 1,
        label: 'Hatchery: Go to top floor and interact with the crystal to start a four-wave lockdown (zombies, Manglers, Valkyrie Drones). Round freezes; no points from kills. Survive all four waves. Max Ammo spawns in air near Pack-a-Punch (grab as wave 4 starts). Interact with the crystal again to obtain the Dragon Strike.',
      },
      {
        order: 2,
        label: 'Draconite Controller upgrade: Kill ~40 zombies with Dragon Strike (roar when threshold reached; progress shared in co-op). Mark the red Iron Cross flags outside the map with Dragon Strike—solo: one of four remains at random; co-op: each flag marked once by any player. Locations: Supply Depot left dragon platform look left; Dragon Command left platform look ahead at ground; Tank Factory top of Double Tap stairs look at hanging tank; Belinski Square corner by Quick Revive behind water pipe. Then all players do the Hatchery four-wave lockdown again, using Dragon Strike each wave (regenerates ~15–20 s). Return to crystal to get Draconite Controller.',
      },
    ],
  },
  {
    gameShortName: 'BO3',
    mapSlug: 'gorod-krovi',
    name: 'Dragon Network Controller',
    slug: 'dragon-network-controller',
    type: 'BUILDABLE',
    xpReward: 0,
    description:
      'Buildable that lets you call a Dragon to ride to the Hatchery (Pack-a-Punch). Turn on power and interact with S.O.PH.I.A. in Dragon Command (round 3 or so) so Code Cylinders drop from zombies. Insert a cylinder into its console (Dragon Command, Supply Depot, Tank Factory); a Groph Pod drops (beam of light). Defend the Pod—kill 15 zombies near it (they get shocked). Pod opens; claim the module. Repeat for all three cylinders. Insert the three modules into the Dragon Network Console in the Operations Bunker. You can then summon the Dragon from Dragon Command, Supply Depot, or Tank Factory to ride to the Hatchery.',
    steps: [
      {
        order: 1,
        label: 'Setup: Turn on power. In Dragon Command, interact with S.O.PH.I.A. (button under her console flashes green briefly). Zombies will start dropping Code Cylinders for the three consoles.',
      },
      {
        order: 2,
        label: 'Dragon Command console: Insert a Code Cylinder. Defend the Groph Pod (green beam) from zombies; 15 kills near it. Claim the first module when the Pod opens.',
      },
      {
        order: 3,
        label: 'Supply Depot console: Insert a Code Cylinder. Defend that Groph Pod, 15 kills, claim the second module.',
      },
      {
        order: 4,
        label: 'Tank Factory console: Insert a Code Cylinder. Defend that Groph Pod, 15 kills, claim the third module.',
      },
      {
        order: 5,
        label: 'Operations Bunker: Insert all three modules into the Dragon Network Console (center of room). You can now summon the Dragon from any of the three stations to ride to the Hatchery.',
      },
    ],
  },

  // ——— Gorod Krovi (BO3): Side / Unlocks ———

  {
    gameShortName: 'BO3',
    mapSlug: 'gorod-krovi',
    name: 'Dragon Wings',
    slug: 'dragon-wings',
    type: 'SIDE_QUEST',
    categoryTag: 'Wearable',
    xpReward: 0,
    videoEmbedUrl: 'https://www.youtube.com/embed/3SuZgaePBzM',
    description:
      'Wearable on Department Store 3rd floor mannequin (right wall from Infirmary debris path). Unlocks: 30% explosive and fire resistance; free Dragon summon; near a Dragon platform (post with miniature Dragon Wings), instantly teleport to Hatchery. Requirements (any order): Ride Dragon to Hatchery from each station (Dragon Command, Tank Factory, Supply Depot); obtain Dragon Strike; fully incubate Dragon Egg and have Gauntlet of Siegfried. Progress shared in co-op.',
    steps: [
      {
        order: 1,
        label: 'Ride the Dragon to the Hatchery from Dragon Command, Tank Factory, and Supply Depot at least once each (any order).',
        buildableReferenceSlug: 'dragon-network-controller',
      },
      {
        order: 2,
        label: 'Obtain the Dragon Strike (Hatchery crystal lockdown).',
        buildableReferenceSlug: 'dragon-strike',
      },
      {
        order: 3,
        label: 'Fully incubate the Dragon Egg and obtain the Gauntlet of Siegfried (at least one player must have it).',
        buildableReferenceSlug: 'gauntlet-of-siegfried',
      },
      {
        order: 4,
        label: 'Pick up the Dragon Wings from the mannequin on Department Store 3rd floor (near the black valve). Only one wearable (Dragon Wings, Valkyrie Drone Hat, Mangler Helmet) can be equipped at a time.',
      },
    ],
  },
  {
    gameShortName: 'BO3',
    mapSlug: 'gorod-krovi',
    name: 'Mangler Helmet',
    slug: 'mangler-helmet',
    type: 'SIDE_QUEST',
    categoryTag: 'Wearable',
    xpReward: 0,
    videoEmbedUrl: 'https://www.youtube.com/embed/Jst5tGythvU',
    description:
      'Wearable on Department Store second floor, mannequin to the left of the L-CAR 9 wall buy, across from the barrier. Effects: 30% more damage to Russian Manglers; 50% damage reduction from them. Useful for Love and War (Information Download task and boss fight). Progress shared in co-op; only one of Dragon Wings, Valkyrie Drone Hat, or Mangler Helmet can be equipped at a time.',
    steps: [
      {
        order: 1,
        label: 'Shoot off the helmet on five Russian Mangler Soldiers. Shoot off the Arm Cannon on five Russian Manglers (same Mangler can count for both). Tip: shoot the shoulder of the arm cannon first to disarm and make the Mangler sprint, then shoot the head to kill.',
      },
      {
        order: 2,
        label: 'A good place to make progress is during the Dragon Strike or Draconite Controller lockdown in the Hatchery. When both tasks are done, pick up the Mangler Helmet from the mannequin on Department Store second floor (left of L-CAR 9, across from barrier).',
      },
    ],
  },
  {
    gameShortName: 'BO3',
    mapSlug: 'gorod-krovi',
    name: 'Monkey Bomb Upgrade',
    slug: 'monkey-bomb-upgrade',
    type: 'SIDE_QUEST',
    xpReward: 0,
    description:
      'Upgraded Monkey Bomb. Kill 50 zombies with the Monkey Bomb; a zombie drops a Flask. Each player picks up a specific flower vase and a candle (lit with Guard of Fafnir). Return to the grave challenge board, find your grave, throw a Monkey Bomb at it to create a green flame. Interact with the flame; the upgraded Monkey Bomb rises from the grave.',
    steps: [
      {
        order: 1,
        label: 'Kill 50 zombies with the Monkey Bomb. A zombie will drop a Flask—pick it up.',
        buildableReferenceSlug: 'guard-of-fafnir',
      },
      {
        order: 2,
        label: 'Each player: Pick up your specific flower vase and a candle. Light the candle using the Guard of Fafnir.',
      },
      {
        order: 3,
        label: 'Return to the grave challenge board in Belinski Square. Find your character\'s grave. Throw a Monkey Bomb at the grave to create a green flame.',
      },
      {
        order: 4,
        label: 'Interact with the green flame. The upgraded Monkey Bomb rises from the grave; collect it.',
      },
    ],
  },
  {
    gameShortName: 'BO3',
    mapSlug: 'gorod-krovi',
    name: 'Revelations Music Sheets',
    slug: 'revelations-sheets',
    type: 'SIDE_QUEST',
    xpReward: 0,
    description:
      'Music sheets showing the notes of "Revelations" rest on pianos around the map. The song is not heard in-game on Gorod Krovi; they are collectible visuals only.',
    steps: [
      {
        order: 1,
        label: 'Find the music sheets on pianos around the map. They display the notes for "Revelations"; the track does not play on this map.',
      },
    ],
  },
  {
    gameShortName: 'BO3',
    mapSlug: 'gorod-krovi',
    name: 'Yena Letter',
    slug: 'yena-letter',
    type: 'SIDE_QUEST',
    xpReward: 0,
    description:
      'A letter from Harvey Yena to General Lehmkuhl regarding dragons on the Eastern front, the Hatchery, Die Glocke research, and complaints about S.O.PH.I.A. demanding an encrypted password (the code used in Love and War is tied to Die Glocke). Find and read it in the map.',
    steps: [
      {
        order: 1,
        label: 'Locate and interact with the letter in the map to read Yena\'s message about Stalingrad, the Hatchery, Die Glocke, and S.O.PH.I.A.\'s password.',
      },
    ],
  },
  {
    gameShortName: 'BO3',
    mapSlug: 'gorod-krovi',
    name: 'Time Attack (Melee Weapons)',
    slug: 'time-attack',
    type: 'SIDE_QUEST',
    xpReward: 10000,
    videoEmbedUrl: 'https://www.youtube.com/embed/Y6_kG2u-w3Q',
    description:
      'Four time trials. Completing each unlocks a melee wall-buy in the Operations Bunker. Only the highest tier is needed for the Time Attack achievement. These melees take a weapon slot (not like knife/Bowie). Round 5 under 5 min → Wrench (100). Round 10 under 13 min → Malice (200). Round 15 under 24 min → Slash N\' Burn (300). Round 20 under 32 min → Fury\'s Song (500) and 10,000 XP.',
    steps: [
      {
        order: 1,
        label: 'Time Attack Round 5: Complete 5 rounds in under 5 minutes. Unlocks Wrench (100 points) in Operations Bunker.',
      },
      {
        order: 2,
        label: 'Time Attack Round 10: Complete 10 rounds in under 13 minutes. Unlocks Malice (200 points) in Operations Bunker.',
      },
      {
        order: 3,
        label: 'Time Attack Round 15: Complete 15 rounds in under 24 minutes. Unlocks Slash N\' Burn (300 points) in Operations Bunker.',
      },
      {
        order: 4,
        label: 'Time Attack Round 20: Complete 20 rounds in under 32 minutes. Unlocks Fury\'s Song (500 points) in Operations Bunker and awards 10,000 XP. Completing this tier also unlocks the Time Attack achievement.',
      },
    ],
  },

  // ——— Gorod Krovi (BO3): Musical ———

  {
    gameShortName: 'BO3',
    mapSlug: 'gorod-krovi',
    name: 'Dead Ended',
    slug: 'dead-ended',
    type: 'MUSICAL',
    xpReward: 0,
    description:
      'Official EE song by Clark S. Nova. Hold the use button on three vodka bottles: Department Store couch (after first buyable door); between Department Store and Operations Bunker on the floor by a crashed truck and corpses; Supply Depot shelf next to a crate with a white Iron Cross.',
    steps: [
      {
        order: 1,
        label: 'First bottle: Department Store, on a couch right after the first buyable door.',
      },
      {
        order: 2,
        label: 'Second bottle: Between Department Store and Operations Bunker, on the floor near a crashed truck with corpses and rubble.',
      },
      {
        order: 3,
        label: 'Third bottle: Supply Depot, on a shelf next to a crate with a white Iron Cross. Hold use on all three to activate "Dead Ended."',
      },
    ],
  },
  {
    gameShortName: 'BO3',
    mapSlug: 'gorod-krovi',
    name: 'Ace of Spades (Motörhead)',
    slug: 'ace-of-spades',
    type: 'MUSICAL',
    xpReward: 0,
    description:
      'Re-recorded Ace of Spades by Motörhead. Activate by interacting with three ace of spades playing cards, or during the Love and War boss fight by shooting the three telephone poles emitting electrical current with an explosive.',
    steps: [
      {
        order: 1,
        label: 'First card: Tank Factory, Double Tap 2.0 room—bottom left corner of the blackboard.',
      },
      {
        order: 2,
        label: 'Second card: Dragon Command Center, on Sophia\'s desk.',
      },
      {
        order: 3,
        label: 'Third card: Hatchery, to the right of Pack-a-Punch on a desk, wedged in a book. Interact with all three to play the song. Alternate: during the boss fight, shoot the three electric telephone poles with an explosive.',
      },
    ],
  },
  {
    gameShortName: 'BO3',
    mapSlug: 'gorod-krovi',
    name: 'Samantha\'s Sorrow',
    slug: 'samanthas-sorrow',
    type: 'MUSICAL',
    xpReward: 0,
    description:
      'Song by Brian Tuey. Throw Monkey Bombs into three different areas set on fire by the dragons to spawn a Samantha doll by the tombstone at the challenge boards. Hold use on the doll to start a hide-and-seek mini-game: five dolls spawn in random spots playing Samantha\'s Lullaby (DE version). Shoot each before time runs out (Samantha laughs and resets if you fail). Return to the tombstone, hold use on the final doll (skeleton hand drags it into grave); Max Ammo appears and the song plays.',
    steps: [
      {
        order: 1,
        label: 'Throw Monkey Bombs into three different areas that are on fire from the dragons. A Samantha doll spawns in front of the tombstone by the challenge boards in Belinski Square.',
      },
      {
        order: 2,
        label: 'Hold use on the doll to start the mini-game. Five Samantha dolls hide around the map (random); they play Samantha\'s Lullaby. Shoot each one before time runs out. If you hear Samantha laugh (like Mystery Box move), the game resets—hold use on the grave again to restart.',
      },
      {
        order: 3,
        label: 'When all five are shot, return to the tombstone. Another doll appears; hold use and a skeleton hand drags it into the grave. A Max Ammo drops and "Samantha\'s Sorrow" plays.',
      },
    ],
  },

  // ——— Revelations (BO3): Main Quest ———

  {
    gameShortName: 'BO3',
    mapSlug: 'revelations',
    name: 'For The Good Of All',
    slug: 'for-the-good-of-all',
    type: 'MAIN_QUEST',
    xpReward: 12000,
    videoEmbedUrl: 'https://www.youtube.com/embed/0YH6npBuHVg',
    description:
      'Open the Summoning Key and defeat the Shadowman. Requires Summoning Altar (Keeper Protector), Pack-a-Punched Apothicon Servant (Estoom-oth), and Li\'l Arnies. Completable solo. If all previous BO3 Easter Eggs were completed before this, completing it also finishes A Better Tomorrow.',
    rewardsDescription: '12,000 XP, "Home Sweet Home" Dark Ops Calling Card. Teleport to Samantha\'s room; game ends. A Better Tomorrow completed if all prior EEs done.',
    steps: [
      {
        order: 1,
        label: 'Tombstones: Outside spawn, two floating islands on the left have four graves. Shoot tombstones in order: Edward Richtofen, Tank Dempsey, Takeo Masaki, Nikolai Belinski (second, third, first, fourth tombstone). Thunder and four red lights confirm. Wrong order: restart from Richtofen.',
      },
      {
        order: 2,
        label: 'Audio Reel 1: A triangular stone spawns on one of three jump pads (Shangri-La to House; Mob to Verrückt; Verrückt to Kino)—center at the back. Build Keeper Protector, lead it to that jump pad. Crouch on the triangle when pad is inactive; Keeper starts a 3-minute ritual. Protect it (zombies target only it). Finish before first Margwa (R11–13). Reel drops; place in playback device upstairs Nacht near Juggernog.',
      },
      {
        order: 3,
        label: 'Audio Reel 2: In Giant Apothicon, throw Li\'l Arnies into the nine doorway holes (one Arnie per hole, aim just below center). Every three holes spawn three Margwas (Regular, then Fire, then Void). Kill all nine Margwas; do not leave Apothicon until each group of three is dead or progress resets. Save last zombie when throwing. Reel spawns on middle top bridge; place in Kino playback device on stage (right).',
      },
      {
        order: 4,
        label: 'Audio Reel 3: Shoot rocks with any PaP weapon (not Apothicon Servant) to float bone pieces. Suck each with PaP Apothicon Servant (Estoom-oth). Locations: Verrückt from Nacht portal, right, outside next to Corruption Engine; Nacht stairs near DE portal, broken roof above column; DE wall run (Anti-Gravity) bottom-right of Wall #3; spawn Church above candle left of window; Shangri-La above Stamin-Up; Origins by giant footprint. Take bones to top of Nacht, shoot pile with Estoom-oth to spawn Sophia\'s body; shoot body again. Place new Reel in Origins mound device.',
      },
      {
        order: 5,
        label: 'Materialize S.O.P.H.I.A.: Use Corruption Engine turrets to shoot the left floating blue 115 rock above each of the four engines (8000 points total). Return to Nacht, interact with S.O.PH.I.A.\'s ghost being hit by lasers. Follow her to Kino teleporter; she powers it.',
      },
      {
        order: 6,
        label: 'Kronorium: All players stand in Kino teleporter, go to Samantha\'s room. Pick up Kronorium from bed edge; return. Place Kronorium on podium on Kino stage; four energy balls go to projector room.',
      },
      {
        order: 7,
        label: 'Apothicon Eggs: Four yellow-orange eggs spawn (16 possible locations across Kino, Shangri-La/Spawn, Verrückt, Mob/Origins). Each player holds one at a time. Bring each egg into Giant Apothicon stomach; insert into one of four yellow pustules. Kill 10 zombies near each egg (solo: your kills only) to turn it into a Gateworm. Co-op: only the player who placed the egg can have their kills count.',
      },
      {
        order: 8,
        label: 'Runes of Creation: With Gateworms, find invisible Runes (beeping when close). 12 locations (3 per island). Interact at correct spot—Gateworm becomes Rune; pick up. Only the player who placed that Egg can pick up that Gateworm. Repeat until all four Runes obtained.',
      },
      {
        order: 9,
        label: 'Summoning Key: All players stand on purple rift in Kino projector room. In boss arena, interact with Kronorium on pedestal—memorize the four symbol order. Input that order on the shifting symbols where you spawned (interact as each correct symbol appears). Wrong order or too long teleports you out until next round. Max Ammo spawns. Four terrain waves (2 Margwas each, 8 total): lava (double jump), lightning, fire (Fire Margwas), void (Void Margwas). Kill all; grab Summoning Key in center.',
      },
      {
        order: 10,
        label: 'Gathering objects: Throw Summoning Key at each item (any order). Key bounces back; avoid taking portals with key out (can disappear—melee through portal or use Death Machine to re-equip). Items: Kino chandelier radio; DE clock over Undercroft; Shangri-La Focusing Crystal left of temple; Origins tombstone on mound scaffolding; Mob poster in cell (catwalk, loose wood, look left); Verrückt MG42 on fountain near Corruption Engine; Nacht red barrel (curved stairs from Juggernog, window left of spawn portal). When all collected, key no longer returns.',
      },
      {
        order: 11,
        label: 'Defeat Shadowman: All enter Kino teleporter again. Place Summoning Key on a green pedestal (four corners), kill ~10 zombies near it to charge. Throw Key into S.O.PH.I.A.\'s ghost; she breaks his shield. Focus fire on Shadowman (LMG/AR recommended; avoid Thundergun/Apothicon/Ragnarok for damage). When he goes into Apothicon statue mouth, interact with Kronorium to kill him. Failed attempt: repeat charge and throw. Max Ammo respawns by podium (slide jump from inclines to reach).',
      },
    ],
  },
  {
    gameShortName: 'BO3',
    mapSlug: 'revelations',
    name: 'The Gift',
    slug: 'the-gift',
    type: 'MUSICAL',
    xpReward: 0,
    description:
      'Easter Egg song. Find and interact with three teddy bears: Mob of the Dead entrance from mound (chair left of surgery patient); Kino theater (chair in front of podium); Verrückt (chair at start of hallway to jump pad).',
    steps: [
      { order: 1, label: 'First teddy: Entrance to Mob of the Dead from the mound, on a chair to the left of the mysterious surgery patient.' },
      { order: 2, label: 'Second teddy: Kino der Toten theater, on a chair in front of the podium.' },
      { order: 3, label: 'Third teddy: Verrückt, on a chair at the beginning of the hallway leading to the jump pad. Interact with all three to activate The Gift.' },
    ],
  },

  // ——— Revelations (BO3): Buildables ———

  {
    gameShortName: 'BO3',
    mapSlug: 'revelations',
    name: 'Guard of Fafnir',
    slug: 'guard-of-fafnir-revelations',
    type: 'BUILDABLE',
    xpReward: 0,
    videoEmbedUrl: 'https://www.youtube.com/embed/E1KheWSobD0',
    description:
      'Buildable shield. Three parts: Dragon Visage (Origins), Core (Verrückt), Maw (Der Eisendrache—all three Maw locations require Anti-Gravity). Activate Anti-Gravity by standing on all four square panels around the Pyramid in DE Undercroft for ~4 seconds.',
    steps: [
      {
        order: 1,
        label: 'Dragon Visage (Origins): Entering from House, left of wooden crates left of GobbleGum; or past GobbleGum left path, Group 935 crate by broken truck before Pharo wallbuy; or past Pharo, drop toward Wunderfizz, on chair across from Der Wunderfizz.',
      },
      {
        order: 2,
        label: 'Core (Verrückt): On column as you exit jump pad from Kino; or top of stairs by Speed Cola, straight at hole then left, overturned wheelchair in corner; or Kitchen upstairs, table in center.',
      },
      {
        order: 3,
        label: 'Maw (Der Eisendrache): Anti-Gravity required. High on wall near VMP wallbuy (metal plate wall, look up); or above two Primis statues between VMP and Pyramid, left; or high left on wall with GobbleGum machine, above small black desk. Build at Summoning Altar.',
      },
    ],
  },
  {
    gameShortName: 'BO3',
    mapSlug: 'revelations',
    name: 'Apothicon Servant Upgrade (Estoom-oth)',
    slug: 'apothicon-servant-upgrade-revelations',
    type: 'BUILDABLE',
    xpReward: 0,
    videoEmbedUrl: 'https://www.youtube.com/embed/hm4QtSoPwV8',
    description:
      'Obtain the Apothicon Servant from the Mystery Box (Estulla Astoth). Shoot it at five ethereal blue panels floating in the sky around the map. You must directly hit each panel with the weapon; when hit, the panel vanishes (no audio cue). Use the two central barbs on top of the Apothicon Servant, above the central eye, as a sight—center the panel between them. After all five are hit, the panels travel to the Pack-a-Punch machine and you can upgrade the weapon for the standard cost to get Estoom-oth.',
    steps: [
      {
        order: 1,
        label: 'Panel 1: Shoot the Apothicon Servant at the ethereal blue panel above the Jump Pad at the House (spawn area) leading to Shangri-La. The panel is in the sky; hit it directly and it will vanish.',
      },
      {
        order: 2,
        label: 'Panel 2: Shoot the Apothicon Servant at the panel floating above and behind the doorway connecting Shangri-La and Der Eisendrache. Easiest to hit when standing at the top of the big Shangri-La staircase, before entering the tunnel with the small staircase.',
      },
      {
        order: 3,
        label: 'Panel 3: Shoot the Apothicon Servant at the panel above the Origins/Mob of the Dead island in the direction of the Jump Pad leading to Verrückt. Easiest when standing on top of the central mound (where Pack-a-Punch was in Origins) and looking toward the blue sun; can also be shot from next to the Corruption Engine or the Verrückt Jump Pad.',
      },
      {
        order: 4,
        label: 'Panel 4: From next to the Jump Pad leading to the Mob of the Dead Cafeteria (Verrückt island), look down the hall at the Zetsubou no Shima test tube room, then look up. Shoot the Apothicon Servant at the ethereal blue panel in the sky.',
      },
      {
        order: 5,
        label: 'Panel 5: Shoot the Apothicon Servant at the panel above where the Giant Apothicon stays after being electrified at Nacht der Untoten. Stand at the top of the staircase leading down to the Giant Apothicon and look directly above its head—the panel is next to a giant floating rock. After all five panels are hit, they go to the Pack-a-Punch machine; upgrade the Apothicon Servant there for the standard cost to get Estoom-oth.',
      },
    ],
  },
  {
    gameShortName: 'BO3',
    mapSlug: 'revelations',
    name: 'Li\'l Arnie Upgrade',
    slug: 'lil-arnie-upgrade-revelations',
    type: 'SIDE_QUEST',
    xpReward: 0,
    videoEmbedUrl: 'https://www.youtube.com/embed/XSGuiyqVVTQ',
    description:
      'Collectively get 150 kills with Li\'l Arnies among all players. Then throw a Li\'l Arnie into the church bell tower window. Samantha giggles; all players with the tactical receive upgraded Li\'l Arnies.',
    steps: [
      { order: 1, label: 'Kill 150 zombies with Li\'l Arnies total (progress shared in co-op).' },
      { order: 2, label: 'Throw a Li\'l Arnie into the church bell tower window. Samantha giggles; Li\'l Arnies refill upgraded for everyone who has them.' },
    ],
  },
  {
    gameShortName: 'BO3',
    mapSlug: 'revelations',
    name: 'Pack-a-Punch (Revelations)',
    slug: 'pack-a-punch-revelations',
    type: 'BUILDABLE',
    xpReward: 0,
    videoEmbedUrl: 'https://www.youtube.com/embed/r4xtsq_skww',
    description:
      'Link all teleporters (Spawn, Mob of the Dead, Der Eisendrache, Verrückt), then use one to teleport to Nacht. Upstairs, when the big Apothicon is in view of the machine, press interact on the terminal to zap it with four Death Rays so it freezes. Enter the monster\'s belly; shoot the machine out of the beast\'s heart so it drops. Pack-a-Punch is then usable. Shoot five floating tablets with Apothicon Servant to enable upgrading it to Estoom-oth.',
    steps: [
      {
        order: 1,
        label: 'Link teleporters: Activate and link the teleporters at Spawn, Mob of the Dead, Der Eisendrache, and Verrückt.',
      },
      {
        order: 2,
        label: 'Teleport to Nacht der Untoten. Upstairs, use the computer when the big Apothicon flies in view—four Death Rays zap it and it freezes.',
      },
      {
        order: 3,
        label: 'Enter the Apothicon\'s belly. Shoot the Pack-a-Punch machine out of the beast\'s heart; it drops and becomes usable. All weapons except Apothicon Servant can be upgraded normally.',
      },
      {
        order: 4,
        label: 'To upgrade Apothicon Servant: Shoot the five ethereal blue panels with it (see Apothicon Servant Upgrade Easter egg); then PaP upgrades it to Estoom-oth.',
        buildableReferenceSlug: 'apothicon-servant-upgrade-revelations',
      },
    ],
  },

  // ——— Revelations (BO3): Side ———

  {
    gameShortName: 'BO3',
    mapSlug: 'revelations',
    name: 'Nacht Table & M1927 Wallbuy (Pink Chalk)',
    slug: 'nacht-table-m1927-chalk',
    type: 'SIDE_QUEST',
    xpReward: 0,
    description:
      'Unlocks the table in Nacht downstairs to store a weapon (solo) or give weapons to other players, and makes the M1927 a wallbuy in Der Eisendrache Undercroft. Activate Anti-Gravity in DE first, then pick up pink chalk in the Undercroft hallway between VMP wallbuy and Pyramid (left of possible Guard of Fafnir piece, on narrow carved pillar). Hold use on chalk writings in this order to move them to correct places.',
    steps: [
      {
        order: 1,
        label: 'Activate Anti-Gravity in Der Eisendrache Undercroft. Pick up the piece of pink chalk on the narrow carved pillar in the hallway between VMP and Pyramid, left of the Guard of Fafnir piece location.',
      },
      {
        order: 2,
        label: 'Der Eisendrache: Wall under where the Undercroft Dragon was in the original map.',
      },
      {
        order: 3,
        label: 'Verrückt: Upstairs electric trap room, on the floor in front of the Mystery Box spawn.',
      },
      {
        order: 4,
        label: 'Nacht: Wall on the middle curved staircase that leads to Juggernog.',
      },
      {
        order: 5,
        label: 'Nacht: Straight staircase next to the portal to Mob of the Dead. No writing to erase—face the wall on the stairs and hold use to place the writing.',
      },
      {
        order: 6,
        label: 'Mob of the Dead: Catwalks, lower part of wall next to left entrance to Infirmary.',
      },
      {
        order: 7,
        label: 'Kino der Toten: Wall behind the teleporter, above the mannequin on the left side of the stage.',
      },
      {
        order: 8,
        label: 'Mob of the Dead: Same place by the Infirmary again. Chiming audio cue = complete. M1927 wallbuy in DE Undercroft (under where Dragon was); Nacht table usable.',
      },
    ],
  },
  {
    gameShortName: 'BO3',
    mapSlug: 'revelations',
    name: 'Spark & Path of Sorrows',
    slug: 'spark-path-of-sorrows',
    type: 'SIDE_QUEST',
    xpReward: 0,
    description:
      'Requires at least one player in the lobby to have completed A Better Tomorrow. Collect the "spark" from the broken truck\'s headlight in the starting room. During the main Easter Egg, when you use the teleporter to retrieve the Kronorium, place the spark on the wooden crate with "?" in white chalk in Samantha\'s room. Path of Sorrows becomes a wallbuy on the big staircase in Shangri-La (500 points); all wall and box weapons auto Pack-a-Punch; one-hit melee until round 42. Do not take damage while carrying the spark or it is lost. Pick up the spark only when the teleporter is available.',
    steps: [
      {
        order: 1,
        label: 'With at least one player who completed A Better Tomorrow: Collect the spark from the broken truck\'s headlight in the starting room. Avoid all damage while carrying it.',
      },
      {
        order: 2,
        label: 'During For The Good Of All, when you teleport to Samantha\'s room to get the Kronorium, place the spark on the wooden crate with the "?" drawn in white chalk.',
      },
      {
        order: 3,
        label: 'After returning: Path of Sorrows is on the big staircase in Shangri-La for 500 points. All wall and box weapons are auto Pack-a-Punched; Path of Sorrows is one-hit melee until round 42.',
      },
    ],
  },

  // ——— Revelations (BO3): Wearables (Hats & Helmets) ———

  {
    gameShortName: 'BO3',
    mapSlug: 'revelations',
    name: 'Al\'s Hat',
    slug: 'als-hat-revelations',
    type: 'SIDE_QUEST',
    categoryTag: 'Wearable',
    xpReward: 0,
    videoEmbedUrl: 'https://www.youtube.com/embed/BA87HyIVmvw',
    description:
      'Albert "Weasel" Arlington\'s hat. Purely cosmetic. Found in a cell on the second floor of the cell block in the Mob of the Dead section. Available from the start.',
    steps: [{ order: 1, label: 'Pick up Al\'s Hat from the cell on the second floor of the Mob of the Dead cell block. Equip from mannequins on Kino stage (except Al\'s Hat stays in Mob).' }],
  },
  {
    gameShortName: 'BO3',
    mapSlug: 'revelations',
    name: 'Dire Wolf Head',
    slug: 'dire-wolf-head',
    type: 'SIDE_QUEST',
    categoryTag: 'Wearable',
    xpReward: 0,
    videoEmbedUrl: 'https://www.youtube.com/embed/BA87HyIVmvw',
    description:
      'Sprint duration (Purple Stamin-Up). Howling when getting many kills. Unlock: Activate Anti-Gravity in DE Undercroft. Toss a grenade in the large hole high on the wall near the Kuda (where reforged Wolf arrow was). Wolf skull falls; collect 15 souls by killing zombies near the skull while Anti-Gravity is active. Wolf howl = unlocked. Pick up from Kino stage, back center. Hidden: bypasses Corruption Turret step for Keeper Skull Head.',
    steps: [
      { order: 1, label: 'Activate Anti-Gravity in Der Eisendrache Undercroft.' },
      { order: 2, label: 'Throw a grenade into the large hole high on the wall near the Kuda wallbuy. Wolf skull falls to the floor.' },
      { order: 3, label: 'Kill 15 zombies near the skull while Anti-Gravity is active (no wall run required). Wolf howl signals unlock. Dire Wolf Head appears on Kino stage, back center.' },
    ],
  },
  {
    gameShortName: 'BO3',
    mapSlug: 'revelations',
    name: 'Helmet of Siegfried',
    slug: 'helmet-of-siegfried-revelations',
    type: 'SIDE_QUEST',
    categoryTag: 'Wearable',
    xpReward: 0,
    videoEmbedUrl: 'https://www.youtube.com/embed/BA87HyIVmvw',
    description:
      '+1 zombie hit (Purple Juggernog). Horn sound on many kills. At DE Corruption Engine, shoot the floating clock above the Pyramid: Roman numerals IX, III, V (935). Then fill four urns with six headshots each (any order): DE hallway to circular Primis room; Origins room next to Pharo; Verrückt Kitchen upstairs by blood table; Kino projector room. Horn = unlocked. Kino stage, right side.',
    steps: [
      { order: 1, label: 'At Der Eisendrache Corruption Engine, shoot the floating clock above the Pyramid: numerals IX, III, and V (935). Bell audio cue.' },
      { order: 2, label: 'Fill four urns with six zombie headshots each (electrical static when urn complete): DE hallway to Primis statue room; Origins small room next to Pharo; Verrückt Kitchen upstairs; Kino projector room.' },
      { order: 3, label: 'Horn plays when complete. Helmet of Siegfried on Kino stage, right side.' },
    ],
  },
  {
    gameShortName: 'BO3',
    mapSlug: 'revelations',
    name: 'Margwa Head',
    slug: 'margwa-head-revelations',
    type: 'SIDE_QUEST',
    categoryTag: 'Wearable',
    xpReward: 0,
    videoEmbedUrl: 'https://www.youtube.com/embed/BA87HyIVmvw',
    description:
      '50% Margwa damage reduction; 33% more damage to Margwas; Purple Stamin-Up. Hidden: no damage/stun from Void Margwa skulls or purple marks. Kill one of each Margwa type (Regular, Fire, Void) with one hit per head. Use PaP shotgun or sniper; no Wonder Weapon damage. Double Tap and Guard of Fafnir fireball are allowed. First Margwa R11–13. Chiming cue; Kino stage, left of Keeper Protector Altar.',
    steps: [
      { order: 1, label: 'Kill one Regular Margwa with one hit to each of its three heads (no Wonder Weapon damage).' },
      { order: 2, label: 'Kill one Fire Margwa with one hit to each head.' },
      { order: 3, label: 'Kill one Void Margwa with one hit to each head. Chiming cue; Margwa Head on Kino stage, left of Keeper Protector Summoning Altar.' },
    ],
  },
  {
    gameShortName: 'BO3',
    mapSlug: 'revelations',
    name: 'Fury Head',
    slug: 'fury-head',
    type: 'SIDE_QUEST',
    categoryTag: 'Wearable',
    xpReward: 0,
    videoEmbedUrl: 'https://www.youtube.com/embed/BA87HyIVmvw',
    description:
      '33% Fury melee reduction; 50% more damage to Furies; Purple Juggernog. Kill ~15 Furies with headshots. Corruption Engine Furies do NOT count. Furies spawn from second Parasite Round onward and occasionally on normal rounds (R13–14 in Apothicon, R20 outside). Sniper or shotgun recommended; Wonder Weapons cannot headshot. Chiming cue; Kino stage, left side.',
    steps: [
      { order: 1, label: 'Kill approximately 15 Furies with headshots (not from Corruption Engine spawns). Sniper or shotgun recommended.' },
      { order: 2, label: 'Chiming cue when complete. Fury Head on Kino stage, left side.' },
    ],
  },
  {
    gameShortName: 'BO3',
    mapSlug: 'revelations',
    name: 'Keeper Skull Head',
    slug: 'keeper-skull-head',
    type: 'SIDE_QUEST',
    categoryTag: 'Wearable',
    xpReward: 0,
    videoEmbedUrl: 'https://www.youtube.com/embed/BA87HyIVmvw',
    description:
      'Purple Juggernog; 50% Enslaved Keeper reduction; 33% more damage to Keepers; Keeper Protector lasts 30s longer. Build Summoning Altar and Keeper Protector; have it kill ~30 zombies. Then kill ~7 Enslaved Keepers with the Corruption Turret. (If Dire Wolf Head is unlocked, skip the turret step.) Chiming cue; Kino stage, back center.',
    steps: [
      { order: 1, label: 'Build Summoning Altar and Keeper Protector. Have the Keeper kill around 30 zombies.' },
      { order: 2, label: 'Kill about seven Enslaved Keepers with the Corruption Turret (skip this if Dire Wolf Head is unlocked).' },
      { order: 3, label: 'Chiming cue. Keeper Skull Head on Kino stage, back center.' },
    ],
  },
  {
    gameShortName: 'BO3',
    mapSlug: 'revelations',
    name: 'Helmet of the King',
    slug: 'helmet-of-the-king',
    type: 'SIDE_QUEST',
    categoryTag: 'Wearable',
    xpReward: 0,
    videoEmbedUrl: 'https://www.youtube.com/embed/94GOkgFLK7M',
    description:
      '50% boss (Panzers, Margwas) damage reduction; 33% more damage to bosses; no damage/shellshock from elemental death effects; Purple Stamin-Up. Hidden: immune to Panzer shock mines, Panzer death explosion, Void Margwa skulls, purple marks. Kill two Panzers: one—destroy Power Core (chest) and keep shooting until cue; other—destroy face armor. Or do both on one Panzer. Then kill ~50 zombies with traps (Electro-Shock, Flogger). First Panzer ~R18–20. Kino stage, right side.',
    steps: [
      { order: 1, label: 'Shoot one Panzersoldat in the Power Core (chest) and keep firing until audio cue. Shoot another in the head until face armor destroyed (or do both on one Panzer). SMG/AR/LMG in bursts recommended.' },
      { order: 2, label: 'Kill around 50 zombies with traps (e.g. Electro-Shock in Verrückt, Flogger in Origins). Order of Panzer and trap objectives can be swapped.' },
      { order: 3, label: 'Final chime and Panzer death sound. Helmet of the King on Kino stage, right side.' },
    ],
  },
  {
    gameShortName: 'BO3',
    mapSlug: 'revelations',
    name: 'Apothicon Mask',
    slug: 'apothicon-mask',
    type: 'SIDE_QUEST',
    categoryTag: 'Wearable',
    xpReward: 0,
    videoEmbedUrl: 'https://www.youtube.com/embed/BA87HyIVmvw',
    description:
      'Purple Juggernog; Purple Stamin-Up; 50% more damage to all enemies; 33% damage reduction. Guard of Fafnir blocks ~70 hits with mask. Kill in Giant Apothicon green stomach acid while dense green smoke is present (every few minutes with rumble): 15 Parasites, 5 Enslaved Keepers, 15 Spiders, 10 Furies, 50 Zombies, 3 Margwas (at least 2 types). Li\'l Arnies and Estoom-oth work. Final kill: two chimes + Margwa spawn sound. Kino stage, back center before Dire Wolf/Keeper Skull stairs, left.',
    steps: [
      { order: 1, label: 'Wait for dense green smoke in the Giant Apothicon stomach acid (ground rumbles every few minutes; smoke lasts a few minutes).' },
      { order: 2, label: 'While standing in the acid with smoke present, kill: 15 Parasites, 5 Enslaved Keepers, 15 Spiders, 10 Furies, 50 Zombies, 3 Margwas (at least two different types).' },
      { order: 3, label: 'Two chimes and Margwa sound on final requirement. Apothicon Mask on Kino stage, back center, left side before small stairs.' },
    ],
  },

  // ——— Nacht der Untoten (Zombie Chronicles, BO3) ———

  {
    gameShortName: 'BO3',
    mapSlug: 'bo3-nacht-der-untoten',
    name: 'Undone',
    slug: 'undone-bo3-nacht',
    type: 'MUSICAL',
    xpReward: 0,
    description:
      'Song by Kevin Sherwood. Shoot all 28 explosive barrels located across the map, both upstairs and downstairs. Once every barrel has been shot, the song "Undone" will play.',
    steps: [
      {
        order: 1,
        label: 'Shoot every one of the 28 explosive barrels on the map (upstairs and downstairs). When all are shot, "Undone" plays.',
      },
    ],
  },
  {
    gameShortName: 'BO3',
    mapSlug: 'bo3-nacht-der-untoten',
    name: 'Doctor Monty\'s Radio',
    slug: 'doctor-monty-radio-bo3-nacht',
    type: 'SIDE_QUEST',
    xpReward: 0,
    description:
      'A radio featuring Doctor Monty was added in Zombie Chronicles. He addresses the Ultimis crew and explains how they ended up in Nacht der Untoten and what happened to the unnamed marines from the original map. Find and interact with the radio to listen.',
    steps: [
      {
        order: 1,
        label: 'Locate and interact with Doctor Monty\'s radio on the map to hear his message about Nacht der Untoten and the original marines.',
      },
    ],
  },
  {
    gameShortName: 'BO3',
    mapSlug: 'bo3-nacht-der-untoten',
    name: 'Samantha\'s Lullaby',
    slug: 'samanthas-lullaby-bo3-nacht',
    type: 'MUSICAL',
    xpReward: 0,
    description:
      'Plays Samantha\'s Lullaby and spawns a Max Ammo. Activate the four buttons around the map (thunder sound), then interact with the starter Samantha doll in front of the RK5 wall purchase. Follow the music box music to find and shoot spinning Samantha dolls until the last one triggers completion. Interact with the doll again to see it lifted by a skeleton hand; Max Ammo spawns and the song plays.',
    steps: [
      {
        order: 1,
        label: 'Activate the four buttons in order: (1) Under the shelf at the bottom of the steps in the Mystery Box room. (2) On the ceiling above the spiral stairwell going up from the spawn room. (3) On the wall to the left of the Mule Kick machine. (4) On the wall across from the Argus wall buy upstairs. A thunderous sound confirms.',
      },
      {
        order: 2,
        label: 'Interact with the starter Samantha doll on the ground in front of the RK5 wall purchase. Music box music indicates the search has started.',
      },
      {
        order: 3,
        label: 'Follow the music to find a spinning Samantha doll. Shoot it until it disappears. Repeat for each doll. Possible locations: hole in the roof left of Der Wunderfizz; fence post in the farthest window in the Starting room; on the pond in the left window barrier (Starting room); end of the tank\'s barrel in the window next to Mule Kick; top floor on top of a power line post; on top of a truck in the farthest right Starting room window; next to a power generator on the first floor (looking through a window); hole in the ceiling on the bottom floor. The last doll triggers a thunderous sound.',
      },
      {
        order: 4,
        label: 'Return to the first Samantha doll (now on the ground, propped up and spinning). Interact with it; a skeleton hand lifts it into the ground. A Max Ammo spawns and Samantha\'s Lullaby plays.',
      },
    ],
  },

  // ——— Verrückt (Zombie Chronicles, BO3) ———

  {
    gameShortName: 'BO3',
    mapSlug: 'bo3-verruckt',
    name: 'Samantha\'s Sorrow',
    slug: 'samanthas-sorrow-bo3-verruckt',
    type: 'MUSICAL',
    xpReward: 0,
    description:
      'Exclusive to Zombie Chronicles Verrückt. Song by Brian Tuey. At the same toilets where Lullaby for a Dead Man is activated: flush rightmost toilet 9 times, middle 3 times, leftmost 5 times. A thunderclap spawns a Samantha doll in front of Der Wunderfizz. Interact with the doll to spawn more; shoot the spinning dolls (music box music) until thunderclap. Return and interact with the doll—skeleton hand drags it into the ground; Max Ammo and song.',
    steps: [
      {
        order: 1,
        label: 'At the toilets (same as Lullaby for a Dead Man): Flush the rightmost toilet 9 times, the middle toilet 3 times, and the leftmost toilet 5 times. A thunderclap signals completion and spawns a Samantha doll in front of the Der Wunderfizz machine.',
      },
      {
        order: 2,
        label: 'Interact with the doll. More dolls spawn around the map. They spin and play music box music. Shoot each doll until it disappears. Possible locations: balcony visible from left window behind Speed Cola; inside rightmost toilet in bathroom left of power generator; morgue body tray in medical room near spawn; on mannequin next to box on top of stairs (left); pot in kitchen between power room and Speed Cola room; patient chair near spawn; ceiling in Mule Kick room (through barrier); room above Mule Kick in flaming ceiling hole; center of map on fountain statue. Thunderclap when all are shot.',
      },
      {
        order: 3,
        label: 'Return to the Samantha doll in front of Der Wunderfizz. Interact with it; a skeletal hand grabs it and drags it into the ground. A Max Ammo spawns and Samantha\'s Sorrow plays.',
      },
    ],
  },

  // ——— BO4 & Nuketown Zombies (moved from in-progress) ———

  // ——— Voyage of Despair (BO4): Main Quest ———

  {
    gameShortName: 'BO4',
    mapSlug: 'voyage-of-despair',
    name: 'Abandon Ship',
    slug: 'abandon-ship',
    type: 'MAIN_QUEST',
    xpReward: 5000,
    videoEmbedUrl: 'https://www.youtube.com/embed/ccHTv2uJ9pQ',
    description:
      'Secure and cleanse the Sentinel Artifact. Requires Ballistic Shield, Kraken (and Decayed upgrade for Step 5), Distillation Kit, Pack-a-Punch, and Scepter of Ra. Chaos Story trial.',
    rewardsDescription: 'Abandon Ship achievement/trophy; ending cutscene.',
    steps: [
      {
        order: 1,
        label:
          '[Sentinel Artifact] Go to the Poop Deck and activate the Sentinel Artifact. Red door areas open; portals and Pack-a-Punch pedestals appear at Poop Deck, Turbine Room, Lower Grand Staircase, and Cargo Hold.',
      },
      {
        order: 2,
        label:
          '[Pack-a-Punch] Activate all four PaP pedestals (last one activated is where PaP spawns). Build the Ballistic Shield and collect all three Kraken Distillation Kit parts; build the kit at the Engine Room workbench. Kill a Poison Catalyst with the Kraken to get a Poison Zombie heart (needed later).',
        buildableReferenceSlug: 'ballistic-shield-voyage',
      },
      {
        order: 3,
        label:
          '[Clocks and levers] Find 4 chalk symbols and their 4 corresponding clocks (6 possible pairs: Mail Rooms, Bridge, Upper Grand Staircase, 1st Class Lounge, Galley, 3rd Class Berths). Note each symbol and the hour/minute on its clock. At the Bridge: set the four levers (triangle symbols) to the MINUTES from each clock. At the Poop Deck: set the two levers to HOURS (left = Up Dash Triangle, right = Down Dash Triangle). In the Engine Room: set the two working levers to HOURS (bottom left = Up Triangle, top right = Down Triangle). Ding + chorus when correct.',
      },
      {
        order: 4,
        label:
          '[Outlets and challenges] Find 4 sparking electrical outlets (Poison, Water, Electric, Fire)—State Rooms, Upper Grand Staircase, 1st Class Lounge, Dining Hall, Aft Decks, or 3rd Class Berths. Lure the matching Catalyst to each outlet and kill it nearby (one per round) to create a teleporter symbol. Activate teleporters in order: Poison → Water → Electric → Fire. Complete each challenge (Poison: Poop Deck; Water: Cargo Hold; Electric: Boat Deck; Fire: Boiler Room). Grab the White Sentinel Artifact after each; after Fire, grab the Gold Sentinel.',
      },
      {
        order: 5,
        label:
          '[Decayed Kraken and PaP Sentinel] Have the Kraken upgraded to Decayed (Poison) at the Distillation Kit. Shoot all 9 blue pipes in the Turbine Room with the Decayed Kraken (they change to water leaks; metal noise). Turbine Room fills with water. Ensure PaP is in the Turbine Room; swim to it and Pack-a-Punch the Sentinel Artifact. Retrieve it and optionally drain the water.',
        buildableReferenceSlug: 'distillation-kit',
      },
      {
        order: 6,
        label:
          '[Planet symbols] Activate the 9 element/planet symbols around the map (any order; Engine Room to Cargo Hold suggested). Locations: Boiler Room (Iron/Mars), Engine Room (Tin/Jupiter), Aft Decks (Neptunium/Neptune), Lower Grand Staircase (Silver/Moon), Millionaire Suites (Copper/Venus), State Rooms (Uranium/Uranus), Bridge (Lead/Saturn), Mail Rooms (Mercury/Mercury), Forecastle (Gold/Sun). Celestial voice says each element when activated.',
      },
      {
        order: 7,
        label:
          '[Solar System and planets] Go to the Cargo Hold (drain water via wheel if needed). The medium crate left of the portal bursts as water drains; interact with the Solar System model. Record the random order the planets light up. Enemies spawn during this step (no points). Shoot the planets in the sky (and Neptune in the water) in that order with the PaP Sentinel or weapons. Collect the blue orbs at the symbol locations (~30 s each). When you reach the Sun, the whole team activates it together for the time trial.',
      },
      {
        order: 8,
        label:
          '[Melt ice] Use Krakens and the Scepter of Ra beam to melt ice blocks around the map. Work toward the Poop Deck. A teleporter symbol appears by the flag after the last ice block. Do not teleport yet; prepare for the boss fight.',
      },
      {
        order: 9,
        label:
          '[Boss: Eye of Malice and Despair] All players stand on the teleporter and hold use. Swim to the center of the iceberg and place the Sentinel Artifact. Five phases: (1) Poop Deck—kill enemies, save Max Ammo/Carpenter for end. (2) Engine Room—same. (3) State Rooms—Boss becomes vulnerable; shoot with Hellion Salvo when it fires its freeze beam. (4) Promenade Starboard—use iceberg cover, Hellion on Boss. (5) Poop Deck—Boss has a team-wipe mechanic; when it charges (roar, shaking), interrupt with damage; use Homunculus and Scepter of Ra bubble. Defeat the Sky-Eye to complete.',
      },
    ],
  },

  // ——— Voyage of Despair (BO4): Buildables ———

  {
    gameShortName: 'BO4',
    mapSlug: 'voyage-of-despair',
    name: 'Ballistic Shield',
    slug: 'ballistic-shield-voyage',
    type: 'BUILDABLE',
    xpReward: 0,
    videoEmbedUrl: 'https://www.youtube.com/embed/f8yDvbMDLGI',
    description:
      'Buildable shield used to block attacks and melee. Required for Abandon Ship. Parts are found around the map; build at the shield workbench. Can be upgraded to the Svalinn Guard via a separate Easter egg.',
    steps: [
      {
        order: 1,
        label: 'Collect the three Ballistic Shield parts from around the map (typical locations: Cargo Hold, Galley, and other areas).',
      },
      {
        order: 2,
        label: 'Build the Ballistic Shield at the workbench. Carry it for the main quest and for the Svalinn Guard upgrade.',
      },
    ],
  },
  {
    gameShortName: 'BO4',
    mapSlug: 'voyage-of-despair',
    name: 'Distillation Kit',
    slug: 'distillation-kit',
    type: 'BUILDABLE',
    xpReward: 0,
    videoEmbedUrl: 'https://www.youtube.com/embed/4KxtaeNYTt4',
    description:
      'Crafting station in the Engine Room (right when entering from Provisions). Three parts: Cargo Hold, Galley, and First Class Lounge. After building, kill a Catalyst (Poison, Water, Electric, or Fire) with the Kraken to get an element part. Upgrade the Kraken at the kit for 3000 points (6000 if Pack-a-Punched). Required for Abandon Ship (Decayed/Poison upgrade).',
    steps: [
      {
        order: 1,
        label: 'Collect the three Distillation Kit parts from the Cargo Hold, Galley, and First Class Lounge.',
      },
      {
        order: 2,
        label: 'Build the Distillation Kit at the table in the Engine Room (right after the first set of stairs from Provisions).',
      },
      {
        order: 3,
        label: 'Kill a Catalyst zombie with the Kraken to get an element drop (e.g. Poison heart). Take it to the Distillation Kit and pay 3000 points (6000 if Kraken is PaP) to upgrade the Kraken to that element. Repeat for other elements as needed.',
      },
    ],
  },

  // ——— Voyage of Despair (BO4): Side / Upgrades ———

  {
    gameShortName: 'BO4',
    mapSlug: 'voyage-of-despair',
    name: 'Svalinn Guard (Shield Upgrade)',
    slug: 'svalinn-guard',
    type: 'SIDE_QUEST',
    xpReward: 0,
    videoEmbedUrl: 'https://www.youtube.com/embed/EbGCRHmN6So',
    description:
      'Upgrade the Ballistic Shield to the Svalinn Guard: frost-covered, more durable, higher damage, projectiles get Cryofreeze. Requires Ballistic Shield. Steps: code breaker from Mail Room safe; four skeleton pieces and codes; four small safes; Cargo Hold car; four green vials in pipes; white slots and fireworks into skeleton car; ice chunk upgrades shield.',
    steps: [
      {
        order: 1,
        label: 'Code breaker: In the Mail Room, melee the safe with the Ballistic Shield to knock off the code breaker; pick it up.',
        buildableReferenceSlug: 'ballistic-shield-voyage',
      },
      {
        order: 2,
        label: 'Skeleton pieces and codes: Skull—small room above Mail Room, code on box behind skull (clear bottles). Long bone—Mail Room back right, code on ground under shelf. Hand—table right of stairs in Mail Room, code under table. Foot—Cargo Hold, pile of boxes left of car; code next to foot. Match each code to the 4-digit code on the code breaker when placed on a small safe.',
      },
      {
        order: 3,
        label: 'Four small safes: Place code breaker on each safe, read the 4 digits, then take the matching skeleton piece from the Mail Room and place it in that safe. Melee with shield to remove code breaker. Safes: 3rd Class Berths (first floor hallway); 1st Class Lounge (by blocked exit); Bridge (bedroom by bed); Millionaire Suites (room with large dresser).',
      },
      {
        order: 4,
        label: 'Cargo Hold: Once all four safes are filled, interact with the car next to the large crate. It sinks and then flies above the Titanic.',
      },
      {
        order: 5,
        label: 'Green vials: Shoot four green vials in pipes (out-of-bounds). Entry pipes: Bridge (window left of ship wheel); Bridge (communications desk room); Promenade Starboard Deck (room with red object); 3rd Class Berths (window at bottom of staircase); 1st Class Lounge (by mirror, small window). Each vial drops at an exit pipe: Engine Room (bottom of stairs by "Help" graffiti); Mail Rooms (back by table); Millionaire Suites (left of portal). Pick up each vial.',
      },
      {
        order: 6,
        label: 'White slots and fireworks: Place each vial in a white slot (2 at Forecastle, 2 at Poop Deck). Shoot the slot to launch a firework; shoot the firework into the bottom of the skeleton\'s car. If you miss, fireworks respawn after a few minutes. After a firework hits, the skeleton eventually crashes into ice; a glowing ice chunk floats to the shield workbench and upgrades the shield to the Svalinn Guard.',
      },
    ],
  },
  {
    gameShortName: 'BO4',
    mapSlug: 'voyage-of-despair',
    name: 'Free Kraken',
    slug: 'free-kraken',
    type: 'SIDE_QUEST',
    xpReward: 0,
    videoEmbedUrl: 'https://www.youtube.com/embed/BFzvwPAlqmE',
    description:
      'Obtain a free Kraken by getting the Stoker\'s Key and filling up the chests. The Kraken is a wonder weapon; the key and chests are part of a multi-step process on the map.',
    steps: [
      {
        order: 1,
        label: 'Obtain the Stoker\'s Key (from Stokers or map-specific steps).',
      },
      {
        order: 2,
        label: 'Use the key to fill the required chests around the map. When completed, the free Kraken becomes available.',
      },
    ],
  },

  // ——— IX (BO4): Main Quest ———

  {
    gameShortName: 'BO4',
    mapSlug: 'ix',
    name: 'Venerated Warrior',
    slug: 'venerated-warrior',
    type: 'MAIN_QUEST',
    xpReward: 5000,
    videoEmbedUrl: 'https://www.youtube.com/embed/9B8dywCCi4o',
    description:
      'Summon and defeat the Venerated Warrior. Chaos Story. Unlock Pack-a-Punch first by defeating Champions at each tower (Danu, Ra, Zeus, Odin) and placing the four heads on the Temple pikes. Build the Brazen Bull shield early.',
    rewardsDescription: 'Venerated Warrior achievement/trophy; ending cutscene.',
    steps: [
      {
        order: 1,
        label:
          '[Blood Must Flow] Unlock Pack-a-Punch: From the Arena, open Danu Tower and go to the Danu Altar Room. At the top of the stairs, turn left toward the barrier window; left of the window is a Gong. Activate it to summon a Champion. Defeat the Champion and pick up the floating head. Repeat at Ra, Zeus, and Odin Altar Rooms (find each Gong, summon Champion, defeat, collect head). Place all four heads on the pikes in front of the Pack-a-Punch altar in the Temple. Build the Brazen Bull shield during this time.',
        buildableReferenceSlug: 'brazen-bull',
      },
      {
        order: 2,
        label:
          '[Skull and ingredients] Find a skull with a symbol in the Temple. Activate your special weapon and interact with the skull; it pops out—pick it up. Get the Death of Orion (Serket\'s Kiss) and place the skull in the grinder in the Flooded Crypt. Shoot the grinder three times with a full charged shot. Collect the bone mesh from the dispenser. Bring an Axe Throwing Gladiator to the arena and have it throw an axe at one of the two pyres; a piece of wood drops—place it in the large cauldron on the bottom floor of Odin\'s tower. After two full rounds, pick it up. Get poop: achieve maximum bad affinity (full thumbs down) by throwing three grenades at the crowd or running through fire. Poop appears on the ground; picking it up costs 250 points.',
      },
      {
        order: 3,
        label:
          '[Fertilizer and Danu challenge] Place the bone mesh, poop, and charcoal in a bowl on the bottom floor of Zeus Tower. After two full rounds, retrieve the fertilizer and place it between two trees in the Danu Tower Arboretum. After two full rounds it smokes green. Kill an enemy with a Pack-a-Punched weapon that has the Fire Bomb re-pack effect over the fertilizer; blue cracks appear in the floor. All players stand on the cracked floor for ~15 seconds to be moved to a black-and-white Danu tower. Survive and shoot three red pods on the tree on each floor (bottom then up); Max Ammo after each set. Complete all floors to be teleported out.',
      },
      {
        order: 4,
        label:
          '[Bull symbols and Ra challenge] Bull symbols appear around the map. Set four on fire using the Brazen Bull shield\'s firing effect; each spawns a Gladiator—kill it so the soul is absorbed by the Ra statue. Symbol locations (possible): Flooded Crypt; wall near bridge between Zeus and Odin; Danu Tunnel; Odin–Zeus Temple entrance; The Pit; Temple; Ra Tower Burial Chamber; Arena; Danu Altar Room. When all Champions are slain, the obelisk in the Ra Altar Room shows a symbol—everyone holds interact on it. You are teleported into an alternate Ra tower; watch the obelisk for which symbols flash—those indicate which special zombies to kill, in order. Killing out of order forces a retry. Complete the challenge successfully twice.',
        buildableReferenceSlug: 'brazen-bull',
      },
      {
        order: 5,
        label:
          '[Poles and electricity] All players go to the middle of the Arena and interact with the stone to teleport underground. Shoot four poles until they rise (Collapsed Tunnel, Odin Tunnel, Danu Tunnel, Cursed Room). Return to the Arena; four electrical circles appear in the corners. Use the Kill-O-Watt re-pack effect to stun enemies, then kill them in the circles to transfer electricity to the poles above. When charged enough, orbs appear in the challenge bowls in the center. Every player interacts with one orb. You receive unlimited specialist weapon; kill all Gladiators and survive to complete the step.',
      },
      {
        order: 6,
        label:
          '[Blue symbols and Pit challenge] Nine blue symbols spawn in the underground. Shoot them from the correct angles so each stays blue (The Pit, Danu Tunnel, The Crypts). Have everyone stand behind the metal grate at the back of The Pit for ~20 seconds (gear noise when correct). All players are teleported into a special room and must survive multiple waves of zombies and special enemies. Kill multiple Blightfathers and pick up the key that appears at the top of the grate to finish.',
      },
      {
        order: 7,
        label:
          '[Boss fight] A red portal appears in the Arena (across from spawn). All players interact to enter the boss fight. Phase 1: Kill waves of Tigers and Gladiators. Phase 2: The Fury Elephant (Fury) enters from a huge gate—shoot the side armor off, then shoot Fury in the face until it dies. Phase 3: The black Wrath Elephant (Wrath) spawns from the other gate. Kill Wrath the same way to complete the quest and trigger the cutscene.',
      },
    ],
  },

  // ——— IX (BO4): Buildables ———

  {
    gameShortName: 'BO4',
    mapSlug: 'ix',
    name: 'Brazen Bull',
    slug: 'brazen-bull',
    type: 'BUILDABLE',
    xpReward: 0,
    videoEmbedUrl: 'https://www.youtube.com/embed/XKCnkmQU8-4',
    description:
      'Buildable shield with a katar melee. Block damage from front or back; finite durability. Melee uses the katar (one-hit to round 16). After 9 katar kills the gems glow and the katar ignites; zombies burn. Aim with the shield to fire flaming projectiles from the bull\'s nose. Build at the worktable in The Pit. Can be upgraded to the Iron Bull.',
    steps: [
      {
        order: 1,
        label: 'Part 1 (Bull): Ra Altar Room—to the right of the gong; next to the wall gun on the pillar; or around the corner between two pillars.',
      },
      {
        order: 2,
        label: 'Part 2 (Spear): Zeus Altar Room—around the corner by the statue\'s feet. Zeus Tower Entrance—in the hand of the statue by the ascending stairs. Zeus Tower Bath Room—on the shelf with the portrait above.',
      },
      {
        order: 3,
        label: 'Part 3 (Plate): Odin Altar Room—around the corner next to a barrel of spears. Odin Tower Entrance—shield rack, bottom left. Odin Tower Cauldron—against a wooden pillar. Build at the worktable in The Pit.',
      },
    ],
  },
  {
    gameShortName: 'BO4',
    mapSlug: 'ix',
    name: 'Iron Bull (Shield Upgrade)',
    slug: 'iron-bull',
    type: 'SIDE_QUEST',
    xpReward: 0,
    videoEmbedUrl: 'https://www.youtube.com/embed/yggo8Bcu-ZA',
    description:
      'Upgrade the Brazen Bull to the Iron Bull: silver finish, permanent green flame on katar and projectiles, higher damage and durability. Collect three starry-texture parts (same locations as base parts, unlocked by doing the steps below). If the shield breaks during the melee step you must start that step over; replacing the shield at the table does not reset progress.',
    steps: [
      {
        order: 1,
        label: 'First part: Shoot three metal bull heads with the Brazen Bull at the top of the Zeus tower (one on ceiling above you, one above Mystery Box, one on pillar above Titan wall buy). Then at Pack-a-Punch in the Temple, look up at the dome, shoot the part so it falls, and collect it.',
        buildableReferenceSlug: 'brazen-bull',
      },
      {
        order: 2,
        label: 'Second part: Do the following four times (shield can break and be replaced—progress is kept): Get exactly 8 melee kills with the Brazen Bull, then a 9th melee kill on a Catalyst, Brawler, or Gladiator to light the katar. Each time the 9th kill must be on a different enemy type. Melee until the fire goes out. On the 4th time, leave the katar lit and do not keep killing. Go to the basement via Zeus tower; at the Odin–Zeus Temple Entrance a headless statue holds the second part—collect it.',
      },
      {
        order: 3,
        label: 'Third part: With the katar still on fire from step 2, melee kill a Brawler and a Gladiator (fire must not go out). Go to the Fallen Hero; above one of the entrances is the third part—shoot it down and collect it. Take all three parts to the Brazen Bull workbench in The Pit to acquire the Iron Bull.',
      },
    ],
  },
  {
    gameShortName: 'BO4',
    mapSlug: 'ix',
    name: 'Acid Trap',
    slug: 'acid-trap-ix',
    type: 'BUILDABLE',
    xpReward: 0,
    videoEmbedUrl: 'https://www.youtube.com/embed/ZLLJGhrIIs4',
    description:
      'Buildable trap that releases green acid (instant down for players and zombies). Costs 1000 points to activate. Required for the free Death of Orion method. Built between the Arena and each tower entrance.',
    steps: [
      {
        order: 1,
        label: 'Chain: In the Temple, wrapped around a torch beside a barrel of swords.',
      },
      {
        order: 2,
        label: 'Cog: In the Temple, under a skeleton inside a cage.',
      },
      {
        order: 3,
        label: 'Cauldron: Complete three trials (knife the rope on a banner by a temple entrance to start challenges; rewards spawn in the center bowl). After the third trial the Cauldron spawns on the Challenge Podium. Build the Acid Trap between the Arena and the tower entrances.',
      },
    ],
  },

  // ——— Blood of the Dead (BO4): Main Quest ———

  {
    gameShortName: 'BO4',
    mapSlug: 'blood-of-the-dead',
    name: 'Release the Spirits',
    slug: 'release-the-spirits',
    type: 'MAIN_QUEST',
    xpReward: 8500,
    videoEmbedUrl: 'https://www.youtube.com/embed/ABPZt30LomU',
    description:
      'Free the spirits hiding Pack-a-Punch and pursue the Kronorium and Summoning Key. Prerequisites: restore west block power (roof access), build the Spectral Shield and have a charge. Unlock PaP by Spirit Blasting the voltmeter on the roof; the Spoon is required to access the Warden\'s hidden room.',
    rewardsDescription: 'Achievement/trophy; ending cutscene. PaP rotates between Roof, Power House, and Building 64.',
    steps: [
      {
        order: 1,
        label:
          '[Unlock Pack-a-Punch] Build the Spectral Shield and siphon enough souls for a charge. Ascend to the roof and Spirit Blast the voltmeter (where the Icarus was in Mob of the Dead). Pack-a-Punch becomes available and will rotate between the Roof, Power House, and Building 64.',
        buildableReferenceSlug: 'spectral-shield',
      },
      {
        order: 2,
        label:
          '[Warden\'s ritual room] Obtain the Spoon (see Spoon guide). Go to the Warden\'s House and melee the wall opposite the barrier upstairs to reveal scratches. Open the wall by: progressing to round 17, throwing Monkey Bombs at the wall for the Warden to destroy it, or entering 666 on the keypad to spawn an EMP Brutus and leading him to slam the scratched wall. Enter the ritual room; hold interact on the red stone on the table, then on the draped body to reveal the decaying Warden.',
        buildableReferenceSlug: 'spoon-botd',
      },
      {
        order: 3,
        label:
          '[Kronorium and ghost seagull] In Richtofen\'s Laboratory, hold interact on the map across from the cryostasis chambers to place the red stone. The Kronorium in the right-most corner glows blue; interact with it and a ghost seagull steals it. Find the bird around the map (visible in spectral vision) and Spirit Blast it; it flies off and reappears next round. Repeat until the fourth time: the bird is no longer visible in spectral vision. Listen for bird calls near the keypad at the spiral staircase; sobbing when looking at the bird. Spirit Blast the keypad and enter 872 to spawn Zombie Blood. Pick up Zombie Blood, return to the sobbing spot, and throw the Hell\'s Retriever at the bird to get the Kronorium back.',
        buildableReferenceSlug: 'hells-retriever-botd',
      },
      {
        order: 4,
        label:
          '[Light tower and five challenges] At the Warden\'s body, hold interact to put the Kronorium in his lap; pages flip. Use spectral vision on the book and note the numbers; enter them on the keypad so the light tower shines on one of five locations. Go to the beam and Spirit Blast it to spawn a portal and start a challenge. Complete all five challenges to collect five red orbs (see below).',
      },
      {
        order: 5,
        label:
          '[Challenge 1 — Morse Code] Sally Port: solve the Morse Code riddle (5–10 characters: dots = hold under 1 second, dashes = hold 2+ seconds). Three buoys show dots/dashes in spectral vision: end of Catwalk, Gondola spawn, and Model Industries window facing Golden Gate Bridge. Convert to numbers for the key, then back to Morse; wrong order = Warden laughs, restart. After solving, kill a zombie in the Infirmary to spawn a Ghost. Fill the Ghost with souls; escort it to the Docks beam. It drops a red orb—pick it up.',
      },
      {
        order: 6,
        label:
          '[Challenge 2 — Banjo] Find a Ghost playing a banjo; interact to receive the banjo. A blue circle appears on the floor—stay inside and kill zombies (leaving the circle causes damage over time). When complete, an audio cue plays. Return the banjo to the Ghost; it drops a red orb.',
      },
      {
        order: 7,
        label:
          '[Challenge 3 — D-Block Ghost] Kill a zombie in D-Block to spawn a Ghost. Spirit Blast it to make it visible, then use the Spirit Key beam on it to absorb its essence until it goes invisible again; Spirit Blast again (4 blasts total). When it has red hues, kill it with the chain trap in New Industries before it reaches another Ghost. Pick up the red orb.',
      },
      {
        order: 8,
        label:
          '[Challenge 4 — Simon Says] At Building 64 by the Docks, interact with the sparking generator. Simon Says: one panel lights—interact it; then two light up—interact in order; then three, then four, then five. Ignore flickering panels. After five, three panels stay lit—note their symbols. Pick up the punch card in the room and insert it into the computer at Spawn; six screens flash symbols. Match your three symbols to get three new symbols. At the Power House, use spectral vision to see a Ghost by the levers; note symbols under each lever. Spirit Blast the Ghost when it is at the lever matching your symbol so it pulls the lever. After three levers are pulled, the Ghost drops a red orb.',
      },
      {
        order: 9,
        label:
          '[Challenge 5 — Cafeteria Ghost] Kill a zombie in the Cafeteria to spawn a Ghost. Spirit Blast it visible and escort it to the beam in Michigan Avenue while protecting it from zombies. When it reaches the portal it drops a red orb.',
      },
      {
        order: 10,
        label:
          '[Summoning Key and cutscene] Add all orbs at the Warden\'s body and hold interact. Electric beams connect you to the body and the Summoning Key spawns in his lap. A cutscene plays—the Warden locks you in cells; the bird unlocks them. After the cutscene, head to Richtofen\'s Lab; Brutus and Hellhounds spawn. At the Model Industries entrance Brutus grows but three ghosts and the seagull carry him away. Pick up the orb he dropped.',
      },
      {
        order: 11,
        label:
          '[Point of no return] Place the new orb on the map; the wall withdraws and a new door opens next to the barricade (left corner). Go up the stairs. You are warned the garage door is a point of no return. Ensure you have a fresh Spectral Shield with at least two charges, upgraded weapons, and all perks before entering.',
      },
      {
        order: 12,
        label:
          '[Boss fight — Phase 1 & 2] In the rocky arena with the Dark Mechanism, kill Brutus, zombies, and Hellhounds as they spawn. When a Carpenter and Max Ammo drop together, Brutus spawns with a red aura and three orbs; shoot the orbs to destroy them, then Spirit Blast the top of the Dark Mechanism. A second phase follows with more enemies—repeat: kill Brutus (red aura), destroy orbs, Spirit Blast the Mechanism.',
      },
      {
        order: 13,
        label:
          '[Boss fight — Final] After the last Spirit Blast, Richtofen must activate the Dark Mechanism (interact) and sit in the chair. That player returns to the lab as Great War Richtofen. Re-enter the boss arena and kill the largest Brutus. The outro cutscene plays and all players receive the trophy; the game ends.',
      },
    ],
  },

  // ——— Blood of the Dead (BO4): Buildables & shield ———

  {
    gameShortName: 'BO4',
    mapSlug: 'blood-of-the-dead',
    name: 'Spectral Shield',
    slug: 'spectral-shield',
    type: 'BUILDABLE',
    xpReward: 0,
    videoEmbedUrl: 'https://www.youtube.com/embed/9AxeKpTpSz4',
    description:
      'Buildable shield with the Warden\'s Key: block damage, bash zombies, absorb souls with the key, and use Spirit Blast when charged. Aiming with the shield (without firing) enters spectral vision to see secrets—required for the main quest and several side quests. Free key charge once per round at a sparking power-box (Citadel Tunnels, Showers, Library, Michigan Avenue, Docks Bridge, New Industries, Times Square, Power House, Infirmary, Cell Block 3rd Floor). Build at a bench at the Docks, Cell Block 3rd Floor, or Transverse Tunnel (New Industries–Power House).',
    steps: [
      {
        order: 1,
        label:
          'Essence (spectral energy): On an Afterlife switch in the Library, outside the Warden\'s Office, or by the staircase to the Shower room. Alternatively from a glowing blue power-box: Michigan Avenue, Library, or Times Square.',
      },
      {
        order: 2,
        label:
          'Door (broken metal door): Leaning on a wall in the Citadel Tunnels (by the doorway that once led to the elevator room), or by a repairable barrier in China Alley. Second spawn also in Citadel Tunnels.',
      },
      {
        order: 3,
        label:
          'Warden\'s Key: Dropped when you kill the Warden for the first time. Collect all three parts and build the Spectral Shield at a crafting bench at the Docks, Cell Block 3rd Floor, or in the Transverse Tunnel between New Industries and the Power House.',
      },
    ],
  },
  {
    gameShortName: 'BO4',
    mapSlug: 'blood-of-the-dead',
    name: 'Attuned Spectral Shield',
    slug: 'attuned-spectral-shield',
    type: 'SIDE_QUEST',
    xpReward: 0,
    videoEmbedUrl: 'https://www.youtube.com/embed/bRuNU2JWCNc',
    description:
      'Upgrade the Spectral Shield: +200 damage resistance and +2 Spirit Blast charges (4 total). The lock appears on the front of the shield. Multiple players can throw the Hell\'s Retriever at the lock in the same round to upgrade.',
    steps: [
      {
        order: 1,
        label:
          'Obtain the Spectral Shield and the Hell\'s Retriever. Use the Mystery Box until a Lock appears (instead of a weapon).',
        buildableReferenceSlug: 'spectral-shield',
      },
      {
        order: 2,
        label:
          'Quickly equip the Spectral Shield and absorb energy from the lock using the shield\'s Key attack until the keyhole turns blue. Throw the Hell\'s Retriever at the lock to collect it. Build/acquire the Attuned Spectral Shield at the same bench (or it upgrades in hand).',
        buildableReferenceSlug: 'hells-retriever-botd',
      },
    ],
  },
  {
    gameShortName: 'BO4',
    mapSlug: 'blood-of-the-dead',
    name: 'Unlock Pack-a-Punch',
    slug: 'pack-a-punch-botd',
    type: 'SIDE_QUEST',
    xpReward: 0,
    description:
      'Pack-a-Punch becomes available and will periodically rotate between the Roof, Power House, and Building 64.',
    steps: [
      {
        order: 1,
        label: 'Build the Spectral Shield.',
        buildableReferenceSlug: 'spectral-shield',
      },
      {
        order: 2,
        label: 'Siphon enough souls from zombies to power the shield (at least one Spirit Blast charge).',
      },
      {
        order: 3,
        label: 'Ascend to the roof and Spirit Blast the voltmeter. Pack-a-Punch is now available.',
      },
    ],
  },

  // ——— Blood of the Dead (BO4): Hell's Retriever & Redeemer (buildables) ———

  {
    gameShortName: 'BO4',
    mapSlug: 'blood-of-the-dead',
    name: "Hell's Retriever",
    slug: 'hells-retriever-botd',
    type: 'BUILDABLE',
    xpReward: 0,
    videoEmbedUrl: 'https://www.youtube.com/embed/X2wnwRLj8lA',
    description:
      'Equipment wonder weapon: throwing axe that returns. Required for the free Blundergat, Golden Spork line, and main quest. Cerberus heads on the walls must be fed by killing zombies nearby until they recede.',
    steps: [
      {
        order: 1,
        label:
          'Kill zombies around the Cerberus heads on the walls until they go away. Cerberus locations: New Industries, Cell Block 2nd Floor, Eagle Plaza.',
      },
      {
        order: 2,
        label:
          'Take the fast travel from the Warden\'s House to the Showers (or vice versa). During the ride, the Hell\'s Retriever is on a rock—hold interact as you approach to pick it up.',
      },
    ],
  },
  {
    gameShortName: 'BO4',
    mapSlug: 'blood-of-the-dead',
    name: "Hell's Redeemer",
    slug: 'hells-redeemer-botd',
    type: 'BUILDABLE',
    xpReward: 0,
    videoEmbedUrl: 'https://www.youtube.com/embed/X2wnwRLj8lA',
    description:
      'Upgraded Hell\'s Retriever: glows blue, higher damage, guaranteed one-hit on zombies and Hellhounds when charged. Each player completes the steps independently.',
    steps: [
      {
        order: 1,
        label:
          'Obtain the Hell\'s Retriever and Spectral Shield. Go to the Recreation Yard and stand near the flaming barrel. Kill zombies with the Hell\'s Retriever; in the correct area the tomahawk glows blue when thrown. After enough kills a howl plays and the glow stops.',
        buildableReferenceSlug: 'spectral-shield',
      },
      {
        order: 2,
        label:
          'Find a Spectral Image (blue hellhound mark) using the Spectral Shield\'s vision. Throw the Hell\'s Retriever at it; the image flashes yellow and the Retriever is removed from your inventory. Locations: Recreation Yard—from the catwalk, when you turn left to cross the yard bridge, check the concrete wall to the right past the barbed wire; or from the center bridge, check the rocks on the path to the Prison Entrance. Citadel—through the window with the twisted metal fence and hanging bodies; or to the right through the cracked wall where the three demon dog images appear. Eagle Pass—on the prison wall above the Warden\'s Office; or in the cracked ground out-of-map near the jutting pipe.',
      },
      {
        order: 3,
        label:
          'Progress to a Hellhound-only round. Locate the ghost dog (paw prints; fully visible in spectral vision). When close, Spirit Blast the dog with the Spectral Shield.',
      },
      {
        order: 4,
        label:
          'Take the fast travel from the Warden\'s House to the Showers (or vice versa). The Hell\'s Redeemer is on the rock—hold interact to pick it up.',
      },
    ],
  },

  // ——— Blood of the Dead (BO4): Blundergat variants ———

  {
    gameShortName: 'BO4',
    mapSlug: 'blood-of-the-dead',
    name: 'Free Blundergat',
    slug: 'free-blundergat',
    type: 'SIDE_QUEST',
    xpReward: 0,
    videoEmbedUrl: 'https://www.youtube.com/embed/0NrntLOI6go',
    description:
      'Guarantees a free Blundergat from the Warden\'s Office. The Blundergat can also be obtained from the Mystery Box.',
    steps: [
      {
        order: 1,
        label: 'Obtain the Hell\'s Retriever.',
        buildableReferenceSlug: 'hells-retriever-botd',
      },
      {
        order: 2,
        label:
          'Throw the Hell\'s Retriever at five skulls around the map: Eagle Plaza (pole), C-D Street (cell), West Grounds, Docks, Roof.',
      },
      {
        order: 3,
        label: 'Go to the Warden\'s Office and pick up the Blundergat from the table.',
      },
    ],
  },
  {
    gameShortName: 'BO4',
    mapSlug: 'blood-of-the-dead',
    name: 'Acidgat',
    slug: 'acidgat',
    type: 'BUILDABLE',
    xpReward: 0,
    videoEmbedUrl: 'https://www.youtube.com/embed/cRI17xypCRo',
    description:
      'Upgrade the Blundergat to the Acidgat using the Warden\'s Key and three parts. Build the Acidgat Kit at a workbench and place the Blundergat inside.',
    steps: [
      {
        order: 1,
        label: 'Obtain the Blundergat and the Warden\'s Key (from the first Warden kill; or use Spectral Shield build).',
      },
      {
        order: 2,
        label: 'Case: Transverse Tunnel. Motor: Sally Port (unlock door first). Acid bottle: Infirmary (unlock cage).',
      },
      {
        order: 3,
        label: 'Craft the Acidgat Kit at a building table. Activate the kit and place the Blundergat inside; after a few seconds take the Acidgat from the kit.',
      },
    ],
  },
  {
    gameShortName: 'BO4',
    mapSlug: 'blood-of-the-dead',
    name: 'Magmagat',
    slug: 'magmagat',
    type: 'BUILDABLE',
    xpReward: 0,
    videoEmbedUrl: 'https://www.youtube.com/embed/nXKTiUAdlxw',
    description:
      'Upgrade the Blundergat via the fireplace and blue barrels, then the press in New Industries. After the first completion, any player can place a normal Blundergat in the press to get a Magmagat.',
    steps: [
      {
        order: 1,
        label:
          'Obtain the Blundergat. Go to the Warden\'s House and place the Blundergat in the fireplace. Kill zombies inside the house and collect the Essence they drop. When all three skulls above the fireplace are on fire, activate them to deposit Essence. The fireplace fire turns blue. Take the Tempered Blundergat from the fireplace.',
      },
      {
        order: 2,
        label:
          'Do not fire the Tempered Blundergat. Visit the flaming blue barrels in order: Eagle Plaza (stand near barrel to transfer fire), Michigan Avenue, Cell Block Entrance, Recreation Yard, West Grounds. Quickly go to New Industries and place the Tempered Blundergat in the press. Spirits forge the Magmagat; collect it from the press.',
      },
    ],
  },

  // ——— Blood of the Dead (BO4): Melee buildables (Spoon, Golden Spork) ———

  {
    gameShortName: 'BO4',
    mapSlug: 'blood-of-the-dead',
    name: 'Spoon',
    slug: 'spoon-botd',
    type: 'BUILDABLE',
    xpReward: 0,
    description:
      'Silver spoon melee; required to access the Warden\'s ritual room and for the Golden Spork line.',
    steps: [
      {
        order: 1,
        label:
          'Obtain the Spectral Shield. In the Warden\'s Office, use spectral vision to read the three numbers on the pillars.',
        buildableReferenceSlug: 'spectral-shield',
      },
      {
        order: 2,
        label:
          'In the Citadel Tunnels, Spirit Blast the number pad to activate it and enter the three numbers. The elevator drops.',
      },
      {
        order: 3,
        label:
          'At the Docks, Spirit Blast the voltmeter to activate the crane. When the crane is over the Docks, throw the Hell\'s Retriever at the skeleton in the net to cut off its arm. The Spoon falls onto the crate below the crane—equip it.',
        buildableReferenceSlug: 'hells-retriever-botd',
      },
    ],
  },
  {
    gameShortName: 'BO4',
    mapSlug: 'blood-of-the-dead',
    name: 'Golden Spork',
    slug: 'golden-spork-botd',
    type: 'BUILDABLE',
    xpReward: 0,
    videoEmbedUrl: 'https://www.youtube.com/embed/lZm1rR6VAwE',
    description:
      'Upgrade the Spoon to the Golden Spork using the Infirmary tub and roof blood, then the water tower.',
    steps: [
      {
        order: 1,
        label: 'Go to the bathtub in the Infirmary and place the Spoon in it (interact).',
        buildableReferenceSlug: 'spoon-botd',
      },
      {
        order: 2,
        label:
          'On the Roof, kill zombies with the Acidgat or Magmagat so blood drips into the tub. When the tub is full, activate it to drain.',
      },
      {
        order: 3,
        label:
          'The water tower near the Catwalk leaks blood. Shoot all yellow supports on the water tower to make it collapse. Throw the Hell\'s Retriever at a branch in front of the fallen tower to collect and equip the Golden Spork.',
        buildableReferenceSlug: 'hells-retriever-botd',
      },
    ],
  },
  {
    gameShortName: 'BO4',
    mapSlug: 'blood-of-the-dead',
    name: 'Golden Scalpel',
    slug: 'golden-scalpel-botd',
    type: 'SIDE_QUEST',
    xpReward: 0,
    description:
      'Upgrade the Golden Spork using the blood tub in New Industries, three coloured rocks and traps, then the fast-travel throw and forge.',
    steps: [
      {
        order: 1,
        label:
          'Near the blood tub in New Industries, get melee kills until the tub turns dark red. Interact to place the Golden Spork in the tub.',
        buildableReferenceSlug: 'golden-spork-botd',
      },
      {
        order: 2,
        label:
          'Throw the Hell\'s Redeemer at three coloured rocks: Green—D-Block / MOTD original spawn (outside barricade). Blue—Docks (Spirit Blast the electric box first; rock is inside the net). Red—Eagle Plaza next to the Warden\'s House (corner of roof). Place each at its trap and get 100 kills: Green at Acid Trap (Cafeteria), Blue at Fan Trap (Warden\'s Office), Red at Spin Trap (New Industries). When the stones become shiny gems, interact to pick them up.',
        buildableReferenceSlug: 'hells-redeemer-botd',
      },
      {
        order: 3,
        label:
          'Use the Cafeteria fast travel toward New Industries. As soon as you arrive, turn around and throw the Hell\'s Redeemer into the fast travel grate (right side of the tunnel). A golden nugget appears on the floor; pick it up and take it to the forge to create the Golden Scalpel.',
      },
    ],
  },
  {
    gameShortName: 'BO4',
    mapSlug: 'blood-of-the-dead',
    name: 'Golden Spork Knife',
    slug: 'golden-spork-knife-botd',
    type: 'SIDE_QUEST',
    xpReward: 0,
    videoEmbedUrl: 'https://www.youtube.com/embed/XElvGAMXBHs',
    description:
      'Final melee upgrade: Golden Scalpel becomes the Golden Spork Knife. The skeletal hand in the blood tub and Sal\'s prison number on the Catwalk sign are used.',
    steps: [
      {
        order: 1,
        label: 'Obtain the Golden Scalpel. Interact with the blood tub; the skeletal hand takes the knife.',
        buildableReferenceSlug: 'golden-scalpel-botd',
      },
      {
        order: 2,
        label:
          'A sign on the Catwalk now shows Sal DeLuca\'s prison number. Lure the Warden near the sign and finish him with a melee attack. Sal\'s number falls from the sign.',
      },
      {
        order: 3,
        label: 'Return to the blood tub and interact; the skeletal hand rises with the Golden Spork Knife—pick it up.',
      },
    ],
  },

  // ——— Blood of the Dead (BO4): Music & side Easter eggs ———

  {
    gameShortName: 'BO4',
    mapSlug: 'blood-of-the-dead',
    name: "Where Are We Going (Music Easter Egg)",
    slug: 'where-are-we-going-botd',
    type: 'MUSICAL',
    xpReward: 0,
    description:
      'Activates a longer version of the song from Mob of the Dead. Use the Spectral Shield to Spirit Blast the electric number pad in the Citadel Tunnels and enter 115.',
    steps: [
      {
        order: 1,
        label: 'Spirit Blast the electric number pad in the Citadel Tunnels with the Spectral Shield, then enter the code 115.',
        buildableReferenceSlug: 'spectral-shield',
      },
    ],
  },
  {
    gameShortName: 'BO4',
    mapSlug: 'blood-of-the-dead',
    name: 'Walnut Teleporter',
    slug: 'walnut-teleporter-botd',
    type: 'SIDE_QUEST',
    xpReward: 0,
    description: 'In Richtofen\'s Laboratory, a teleport pad has a walnut. Interact to teleport the walnut to another pad in the same room.',
    steps: [
      {
        order: 1,
        label: 'In Richtofen\'s Laboratory, find the teleport pad with the walnut. Interact to teleport the walnut to the other pad in the room.',
      },
    ],
  },
  {
    gameShortName: 'BO4',
    mapSlug: 'blood-of-the-dead',
    name: 'Spawn the Warden',
    slug: 'spawn-warden-botd',
    type: 'SIDE_QUEST',
    xpReward: 0,
    description: 'Enter 666 on the electric number pad in the Citadel Tunnels to spawn the Warden (Brutus).',
    steps: [
      {
        order: 1,
        label: 'Spirit Blast the electric number pad in the Citadel Tunnels to activate it, then enter 666. The Warden will spawn.',
      },
    ],
  },
  {
    gameShortName: 'BO4',
    mapSlug: 'blood-of-the-dead',
    name: 'Zombie Blood (Code)',
    slug: 'zombie-blood-botd',
    type: 'SIDE_QUEST',
    xpReward: 0,
    description: 'Spawn a Zombie Blood power-up once per round using the number pad in the Citadel Tunnels.',
    steps: [
      {
        order: 1,
        label: 'Spirit Blast the electric number pad in the Citadel Tunnels, then enter 872. A Zombie Blood power-up spawns (once per round).',
      },
    ],
  },
  {
    gameShortName: 'BO4',
    mapSlug: 'blood-of-the-dead',
    name: 'Richtofen Sketch',
    slug: 'richtofen-sketch-botd',
    type: 'SIDE_QUEST',
    xpReward: 0,
    description: 'Reveal a sketch of Ultimis Richtofen beneath the "DEAL WITH IT" sign near the Warden\'s Office.',
    steps: [
      {
        order: 1,
        label: 'Obtain the Golden Spork. Go to Michigan Avenue and melee the "DEAL WITH IT" sign to the left of the Warden\'s Office entrance. A sketch of Ultimis Richtofen appears beneath the sign.',
        buildableReferenceSlug: 'golden-spork-botd',
      },
    ],
  },
  {
    gameShortName: 'BO4',
    mapSlug: 'blood-of-the-dead',
    name: 'Free Monkey Bombs',
    slug: 'free-monkey-bombs-botd',
    type: 'SIDE_QUEST',
    xpReward: 0,
    description: 'Earn free Monkey Bombs by filling the Monkey Bomb statue\'s hat with souls using your Specialist Weapon, then collect from the lab.',
    steps: [
      {
        order: 1,
        label: 'Get your Specialist Weapon to Level 2. Go to the Monkey Bomb statue in C-D Street (outside the map). Kill zombies next to the statue with your Specialist to fill the monkey\'s hat with souls.',
      },
      {
        order: 2,
        label: 'When the hat glows red, shoot the monkey so it levitates and disappears. In Richtofen\'s Laboratory, pick up the Monkey Bombs from the walnut teleporter pad on the table.',
      },
    ],
  },

  // ——— Classified (BO4): Main Quest (round 150) ———

  {
    gameShortName: 'BO4',
    mapSlug: 'classified',
    name: 'Reach Round 150',
    slug: 'round-150',
    type: 'MAIN_QUEST',
    xpReward: 5000,
    description:
      'Classified has no traditional main quest. Survive to round 150 to trigger the secret cutscene.',
    rewardsDescription: 'Secret cutscene; achievement/trophy.',
    steps: [
      {
        order: 1,
        label: 'Reach round 150. A cutscene will play upon doing so.',
      },
    ],
  },

  // ——— Classified (BO4): Buildables ———

  {
    gameShortName: 'BO4',
    mapSlug: 'classified',
    name: 'Riot Shield',
    slug: 'riot-shield-classified',
    type: 'BUILDABLE',
    xpReward: 0,
    videoEmbedUrl: 'https://www.youtube.com/embed/58g_vg0r5r8',
    description:
      'Buildable shield from three parts found on the Offices, War Room, and Laboratories floors. Build at the workbench in Central Filing (starting area) or in Weapon Testing (labs, left after exiting elevator).',
    steps: [
      {
        order: 1,
        label:
          'Part 1 (Offices / spawn area): Leaning against the filing cabinets in the center of the room; on the floor between two windows; or underneath a windowsill.',
      },
      {
        order: 2,
        label:
          'Part 2 (War Room): Leaning against the fence/gate near the staircase; behind the Mystery Box location; or on the computer desk/terminal in the corner.',
      },
      {
        order: 3,
        label:
          'Part 3 (Laboratories): Resting on boxes to the left of the power switch; behind a crate near the teleporter; or against a canister in the corner, past the hallway. Build at Central Filing or Weapon Testing workbench.',
      },
    ],
  },
  {
    gameShortName: 'BO4',
    mapSlug: 'classified',
    name: 'Teleporter Signal Amplifier',
    slug: 'teleporter-signal-amplifier',
    type: 'BUILDABLE',
    xpReward: 0,
    videoEmbedUrl: 'https://www.youtube.com/embed/LepOOa5hjF8',
    description:
      'Required to access Pack-a-Punch at Groom Lake. Three parts (pad, wiring, amplifier); build at either workbench, then place the built amplifier on the teleporter in the center of the War Room. Reactivate DEFCON 5 to link teleporters to Groom Lake where the Pack-a-Punch machine is located.',
    steps: [
      {
        order: 1,
        label:
          'Teleporter Pad (Main Office, top floor): To the left of the "Brew" slot Perk-a-Cola machine; under a desk near the teleporter platform; or on top of an overturned table in the center of the room.',
      },
      {
        order: 2,
        label:
          'Teleporter Wiring (Morgue, laboratory floor): On the corpse half exposed from the left-most cryo-tube; in the side room of the Morgue on a chair beside a Mystery Box spawn; or on a table beside the exit to the North Laboratory section.',
      },
      {
        order: 3,
        label:
          'Teleporter Amplifier: Single spawn in the Panic Room (where the Pack-a-Punch was in "Five"). Access the Panic Room the same way as in Five, with one DEFCON switch located in the Server Room in the War Room. Build at a workbench, then place the amplifier on the teleporter in the center of the War Room. Set DEFCON to 5 to link to Groom Lake.',
      },
    ],
  },
  {
    gameShortName: 'BO4',
    mapSlug: 'classified',
    name: 'Electro-Shock Defenses',
    slug: 'electro-shock-defenses',
    type: 'BUILDABLE',
    xpReward: 0,
    videoEmbedUrl: 'https://www.youtube.com/embed/zVLBBpi8wfo',
    description:
      'Electro-Shock defenses are in the same area as in "Five" and work similarly; the switches are missing and must be found. One switch spawns in the Porcine Research area on the lab floor, the other in the Server Room on the War Room floor—each has three possible spawn locations. Replace both switches and activate power to use the defenses.',
    steps: [
      {
        order: 1,
        label:
          'Find and replace the first switch in the Porcine Research area (lab floor)—three possible spawn locations within the area.',
      },
      {
        order: 2,
        label:
          'Find and replace the second switch in the Server Room (War Room floor)—three possible spawn locations. Activate power to enable the Electro-Shock defenses.',
      },
    ],
  },

  // ——— Classified (BO4): Side quests & music ———

  {
    gameShortName: 'BO4',
    mapSlug: 'classified',
    name: 'Cold War Remedy',
    slug: 'cold-war-remedy',
    type: 'SIDE_QUEST',
    xpReward: 0,
    videoEmbedUrl: 'https://www.youtube.com/embed/_WAHoZwjJ_o',
    description:
      'Locate and retrieve the Project Skadi weapon prototype by inputting four sets of numbers from aerial photographs (Shi No Numa, Der Riese, Kino der Toten, Shangri-La). Rewards a free Winter\'s Howl.',
    rewardsDescription: 'Free Winter\'s Howl; achievement/trophy.',
    steps: [
      {
        order: 1,
        label:
          '[Shi No Numa photo] In the Deserted Hallway, between the Conference Room doorway and the elevator to the War Room, find the portraits with golden nameplates. Using a Pack-a-Punched weapon, shoot once at the nameplates of George Washington, Benjamin Franklin, Alexander Hamilton, and Abraham Lincoln (in that order). The Washington nameplate lifts to reveal a compartment with the Shi No Numa photograph (four numbers).',
      },
      {
        order: 2,
        label:
          '[Der Riese photo] The key is in the key box beside the Panic Room (opposite the Cola Perk-a-Cola machine), on hook five. Use it to open the desk in the middle of the Main Offices; the photograph is inside the drawer.',
      },
      {
        order: 3,
        label:
          '[Kino der Toten photo] Activate the DEFCON switches in this order: War Room upper level (opposite side of elevator), Server Room, War Room upper level (closest to elevator), War Room lower level. Teleport to the Panic Room; on the left side, interact with the monitor that is broadcasting only static to push it back and reveal the photograph.',
      },
      {
        order: 4,
        label:
          '[Shangri-La photo] In the South Laboratories, at the window closest to the door to Weapons Testing and the Koshka wall buy, throw an explosive (Acid Bomb or Fragmentation Grenade) at the lighting fixture nearest the wiring box. The explosion must hit the wiring box; the photograph then teleports to the wall beside the window.',
      },
      {
        order: 5,
        label:
          '[Reactivate Project Skadi] In the War Room, at the machine with the split-flap display and red activation button, input the four number sets by shooting the split-flap numbers and pressing the button. Order: Shi No Numa, Der Riese, Shangri-La, Kino der Toten. If correct, the button sparks and the monitor shows "PROJECT SKADI RETRIEVED".',
      },
      {
        order: 6,
        label:
          '[Retrieve Winter\'s Howl] Go to Groom Lake. In the second cleaned area, find the metal briefcase with "PROJECT SKADI" on it. Interact to open it and pick up the Winter\'s Howl. One player can take it; awards the achievement.',
      },
    ],
  },
  {
    gameShortName: 'BO4',
    mapSlug: 'classified',
    name: 'Shockwave (Music Easter Egg)',
    slug: 'shockwave-classified',
    type: 'MUSICAL',
    xpReward: 0,
    description:
      'Activate the song Shockwave by Kevin Sherwood by interacting with three hidden vodka bottles around the map.',
    steps: [
      {
        order: 1,
        label: 'Central Filing: In the center of the room, on top of a set of filing cabinets.',
      },
      {
        order: 2,
        label: 'War Room: On the bottom floor, under one of the control panels.',
      },
      {
        order: 3,
        label: 'Labs: In the Porcine Research Lab, inside a cabinet in the left-most corner of the room.',
      },
    ],
  },
  {
    gameShortName: 'BO4',
    mapSlug: 'classified',
    name: 'Groom Lake Power-Ups',
    slug: 'groom-lake-power-ups-classified',
    type: 'SIDE_QUEST',
    xpReward: 0,
    description: 'Stay in Groom Lake for 3 full rounds; one of the debris piles is removed and a Max Ammo and Bonfire Sale power-up spawn.',
    steps: [
      {
        order: 1,
        label: 'Stay in Groom Lake for 3 complete rounds. One of the scattered debris items will disappear and a Max Ammo and Bonfire Sale will spawn.',
      },
    ],
  },
  {
    gameShortName: 'BO4',
    mapSlug: 'classified',
    name: 'Richtofen Jumpscare',
    slug: 'richtofen-jumpscare-classified',
    type: 'SIDE_QUEST',
    xpReward: 0,
    description:
      'A jumpscare featuring an image of Primis Richtofen from the PlayStation 3 and Xbox 360 versions of Black Ops III\'s Shadows of Evil ending cutscene.',
    steps: [
      {
        order: 1,
        label: 'In Groom Lake, aim at the light on a building on the left-hand side of the area with a sniper rifle. The jumpscare image will trigger.',
      },
    ],
  },

  // ——— Dead of the Night (BO4): Main Quest ———

  {
    gameShortName: 'BO4',
    mapSlug: 'dead-of-the-night',
    name: 'Trial by Ordeal',
    slug: 'trial-by-ordeal',
    type: 'MAIN_QUEST',
    xpReward: 5500,
    videoEmbedUrl: 'https://www.youtube.com/embed/ra3pJMuDUpg',
    description:
      'Complete three quest lines (Telescope, Knight, Effigy) to collect stone slabs, then defeat the boss werewolf in the Forest. Requires Pack-a-Punch (three crystals in valises + tuning fork challenges), Silver Bullets, Ballistic Shield, and Alistair\'s Annihilator for the Knight and Effigy lines.',
    rewardsDescription: 'Trial by Ordeal achievement/trophy; ending.',
    steps: [
      {
        order: 1,
        label:
          '[Activate Pack-a-Punch] Find the three crystals in valises: Purple (Alistair\'s Bedroom foot of bed, Trophy Room, or Hallway outside his room), Green (Library table by Greek statue, or Study table above Library), Blue (Wine Cellar in front of large barrel or table right of MX9). Gaze into each crystal, then complete its challenge—Nosferatu kill (Cemetery by fast travel or Gardens), Grandfather clock sundial (Grand Hall, Dining Hall, or Billiards), or escort a ghost (Scared Maid portrait Smoking Room or opposite Strife, Hangman\'s Noose in Cellar, Doll in Entrance Hall left of Danu, Lady with scratched hands Music Room, Last Will in Study red box). Each challenge drops a Tuning Fork; use all three on the gate blockage.',
      },
      {
        order: 2,
        label:
          '[Activate quest lines] Return to each of the three crystals and interact. Each shows one of three images: a knight, a circular object, or a pile of twigs (Knight, Telescope, Effigy). Each crystal has its own quest path; order of completion does not matter.',
      },
      {
        order: 3,
        label:
          '[Telescope line] All players shoot the rod above the Mausoleum with Silver Bullets at the same time. North Atrium Bridge: use the three wheels to align the rings over Atlas (middle=green, left=blue, right=red; repeat until beam destroys his head and connects to Greenhouse telescope). Find three Zodiac symbols and count scratch marks in each room (Billiards, Entrance Hall, Trophy Room, Main Hall, Library, Wine Cellar, Dining Room—three scratches per room). Order the three zodiacs from least to most scratches. Greenhouse Laboratory: at the telescope, input the three symbols in that order and knife the panel to confirm. Shield + interact on dome crank to open roof; melee crank with shield to lock. Activate the electric trap, all run through with shields, then all shield-bash the telescope; beam reveals full moon. Stone slab appears; all interact, survive the lockdown, pick up slab.',
        buildableReferenceSlug: 'ballistic-shield-dotn',
      },
      {
        order: 4,
        label:
          '[Knight line] Requires Alistair\'s Annihilator and a Fire Gate Trap (e.g. Library). Activate trap, shoot flames with a charged Annihilator shot so fire turns blue; run through with shield, then melee 12 fireplaces in order: (1) Smoking Room, Library right of trap, Library left of trap, Billiards; (2) Main Hall left, East Gallery, Main Hall right, West Gallery; (3) Trophy Room, Master Bedroom, Music Room, Dining Room. After each set of four, a crystal appears at the last fireplace. Interact with the three knights (Main Hall, Greenhouse Terrace, Graveyard) to spawn crystals; lead each to the Forest and place on the matching round symbol. Kill zombies near knights to move them to Pack-a-Punch; they form a triangle. Kill a werewolf inside the triangle; stone slab appears. All interact, survive, pick up slab.',
        buildableReferenceSlug: 'alistairs-annihilator-dotn',
      },
      {
        order: 5,
        label:
          '[Effigy line] With Alistair\'s Annihilator, shoot the one shootable branch on each of 5 white birch trees (with falling leaves) in the graveyard and collect the branches. One player interacts with the gravestone reading 1912 to enter spirit mode. Shoot the ground in front of the effigy with a charged fireball to light it; spirit player interacts with the flaming effigy to enter afterlife. Escort the female ghost from inside the mansion (often near perk machines/barriers) back to the effigy; she produces a flame column and the stone slab spawns. All interact, survive, pick up slab.',
        buildableReferenceSlug: 'alistairs-annihilator-dotn',
      },
      {
        order: 6,
        label:
          '[Boss fight] Interact with the door in the Forest. Phase 1: A green square appears; rotate the statues so their beams point at it (beams turn green when aligned). Kite the werewolf into the square to trap and damage him. Phase 2: Survive zombies, Catalysts, vampires, werewolves, and Crimson Nosferatu until the boss returns. Phase 3: The green square is invisible; rotate statues until beams turn green to reveal it. Lure the boss into the square repeatedly to defeat him.',
      },
    ],
  },

  // ——— Dead of the Night (BO4): Buildables ———

  {
    gameShortName: 'BO4',
    mapSlug: 'dead-of-the-night',
    name: 'Ballistic Shield',
    slug: 'ballistic-shield-dotn',
    type: 'BUILDABLE',
    xpReward: 0,
    videoEmbedUrl: 'https://www.youtube.com/embed/m6LRjVyZNu4',
    description:
      'Buildable shield; three parts with three spawn locations each. Build at the table in the Smoking Room. Required for Trial by Ordeal (telescope step and Knight fireplace run).',
    steps: [
      {
        order: 1,
        label:
          'Part 1 (Handle): East Balcony/Music Room—leaning on pillar near Sentinel Artifact on Grand Staircase; on chair in Music Room next to Saug wall buy; or on floor of West Balcony near RK7.',
      },
      {
        order: 2,
        label:
          'Part 2 (Counter): Dining Room/East Hallway—on chair in East Hallway; on floor in corner of Dining Room; or leaning against pillar in Dining Room near Master Bedroom entrance.',
      },
      {
        order: 3,
        label:
          'Part 3 (Window): Library/Study—on sofa in Library; on broken bookshelf in Library; or on small table in Study. Build at the Smoking Room workbench.',
      },
    ],
  },
  {
    gameShortName: 'BO4',
    mapSlug: 'dead-of-the-night',
    name: 'Silver Melter',
    slug: 'silver-melter-dotn',
    type: 'BUILDABLE',
    xpReward: 0,
    videoEmbedUrl: 'https://www.youtube.com/embed/UZN4eyOwyFU',
    description:
      'Located in the Wine Cellar. Collect three silver pieces to use the Silver Melter and obtain Melted Silver (needed for the Silver Bullet Dispenser).',
    steps: [
      {
        order: 1,
        label: 'Candle Holder: Entrance Hall (left table near entrance); Billiards Room (on ground by bookshelf and fireplace); or Main Hall (on altar near Mozu wall buy).',
      },
      {
        order: 2,
        label: 'Trophy: Dining Room (coffee table by long sofa, or corner of banquet table); or West Hallway (floor at end of long sofa by small coffee table).',
      },
      {
        order: 3,
        label: 'Plate: Wine Cellar—on edge of table near the noose; on stone pillar below a candle; or in the cupboard inside the cabinet full of wine bottles. Use the Silver Melter in the Wine Cellar to get Melted Silver.',
      },
    ],
  },
  {
    gameShortName: 'BO4',
    mapSlug: 'dead-of-the-night',
    name: 'Silver Bullet Dispenser',
    slug: 'silver-bullet-dispenser-dotn',
    type: 'BUILDABLE',
    xpReward: 0,
    videoEmbedUrl: 'https://www.youtube.com/embed/UZN4eyOwyFU',
    description:
      'Add Silver Bullets to one gun for free (once per match). Requires Melted Silver (from Silver Melter), Charcoal, Sulfur, and Guano. Located in the Library (near Silver Bullet dispenser).',
    steps: [
      {
        order: 1,
        label: 'Melted Silver: Obtain from the Silver Melter in the Wine Cellar after collecting the three silver pieces.',
        buildableReferenceSlug: 'silver-melter-dotn',
      },
      {
        order: 2,
        label: 'Charcoal: Spawns near fireplaces in the Main Hall, Billiards Room, or Master Bedroom.',
      },
      {
        order: 3,
        label: 'Sulfur: Greenhouse Laboratory—on the right or left desk by the main entrance, or the desk at the end of the greenhouse on the left.',
      },
      {
        order: 4,
        label: 'Guano: Cemetery (by fence railing / bottom of Mausoleum staircase); or Mausoleum (floor near tall tree by Cemetery). Activate the dispenser to add Silver Bullets to one gun (one-time per match).',
      },
    ],
  },
  {
    gameShortName: 'BO4',
    mapSlug: 'dead-of-the-night',
    name: "Alistair's Folly (Free)",
    slug: 'alistairs-folly-dotn',
    type: 'BUILDABLE',
    xpReward: 0,
    videoEmbedUrl: 'https://www.youtube.com/embed/VN8zHitQTt4',
    description:
      'Obtain a free Alistair\'s Folly from the wall safe in the Library. Find four colored symbols (red, blue, green, yellow) around the map; each color spawns in a set of locations and the symbol changes each game. Set the safe dials to match the code and interact to open it.',
    steps: [
      {
        order: 1,
        label: 'Red: Staircase between East Gallery and Main Hall; barrel in Wine Cellar barrier; Master Bedroom wall by bed; or wall behind bar in Dining Room.',
      },
      {
        order: 2,
        label: 'Blue: Tombstone right of stairs to Mausoleum; smaller mausoleum right of main; bottom of lion statue left of fast travel; or stone coffin near Cemetery entrance by Stake Knife bench.',
      },
      {
        order: 3,
        label: 'Green: Gate between Greenhouse Lab entrance and Dining Room stairs; circular room near Perk Altar in Gardens; or gates left/right of Perk Altar in Gardens.',
      },
      {
        order: 4,
        label: 'Yellow: Behind vines left of Bowie Knife; wall right of GKS; or side of path left of GKS or right of Bowie Knife. Enter the four symbols on the safe dials in the Library and interact to open it; take the free Alistair\'s Folly.',
      },
    ],
  },
  {
    gameShortName: 'BO4',
    mapSlug: 'dead-of-the-night',
    name: "Alistair's Folly Upgrades",
    slug: 'alistairs-annihilator-dotn',
    type: 'SIDE_QUEST',
    xpReward: 0,
    videoEmbedUrl: 'https://www.youtube.com/embed/8zxkI2aqujg',
    description:
      'Upgrade Alistair\'s Folly to Chaos Theory, then to Alistair\'s Annihilator. Chaos Theory: charged shot (acid pool or whirlwind). Annihilator: adds green portal and fireball. Required for Knight and Effigy quest lines.',
    steps: [
      {
        order: 1,
        label: '[Chaos Theory] In the Library, melee the bookshelf to the right of the Silver Bullet dispenser with the Ballistic Shield to reveal the secret room and the Chaos Theory piece. Kill a Werewolf with a gun using Silver Bullets to get Werewolf Chaos Material. In the Greenhouse Laboratory, insert it into the machine under the telescope to make Prima Materia. Combine with the piece at the crafting bench in the Greenhouse Lab to get the Chaos Theory.',
        buildableReferenceSlug: 'alistairs-folly-dotn',
      },
      {
        order: 2,
        label: '[Alistair\'s Annihilator] With Chaos Theory, kill three Nosferatus with the charged whirlwind to get three bile drops. In the Cemetery, interact with the glowing red coffin lid to spawn a Crimson Nosferatu; kill it for Nosferatu Chaos Material and convert to Prima Materia. In the Forest, shoot a zombie with the charged acid shot so it affects zombies near a blue mushroom pile; the affected zombie digs up the pile. Repeat at different piles until you find the new piece. At the Mausoleum, find the banister of lanterns; one glows orange. Shoot each orange lantern with Chaos Theory as it lights (one by one) until a bat spawns; shoot the bat to get Bat Chaos Material and more Prima Materia. Assemble Alistair\'s Annihilator at the crafting bench in the Greenhouse Laboratory.',
      },
    ],
  },
  {
    gameShortName: 'BO4',
    mapSlug: 'dead-of-the-night',
    name: 'Stake Knife',
    slug: 'stake-knife-dotn',
    type: 'BUILDABLE',
    xpReward: 0,
    videoEmbedUrl: 'https://www.youtube.com/embed/OSk-jTCih-E',
    description:
      'Melee wonder weapon; one-hit kill on Nosferatus and Crimson Nosferatus. Craft from a tree branch at the Mausoleum workbench after completing the symbol and soul steps.',
    steps: [
      {
        order: 1,
        label: 'In the Forest, take the left path toward Pack-a-Punch. Find the tree with a lantern and an elemental symbol. Face it so you see three more symbols on trees behind it (two left, one right). Note the order of the four symbols left to right.',
      },
      {
        order: 2,
        label: 'At the Greenhouse, find the four small stones with elemental symbols (two on garden walls right of the Lab entrance, two near the Ra Perk). Shoot each stone in the order you noted. Wrong order = Stake Knife unavailable for the rest of the game. Correct order = sparkle sound and character remark.',
      },
      {
        order: 3,
        label: 'Return to the Forest. Past the first symbol tree is another with all four symbols. With the Bowie Knife, knife the symbols in your order to leave scratch marks. Shield-bash all four symbols; a large branch falls. Pick up the branch.',
        buildableReferenceSlug: 'ballistic-shield-dotn',
      },
      {
        order: 4,
        label: 'Take the branch to the Mausoleum and place it on the altar outside the Odin Perk. Kill 15 Nosferatus around the branch to fill it with souls (orange smoke when full). Pick it up and craft the Stake Knife at the workbench near the Mausoleum.',
      },
    ],
  },
  {
    gameShortName: 'BO4',
    mapSlug: 'dead-of-the-night',
    name: 'Fire Gate Traps',
    slug: 'fire-gate-traps-dotn',
    type: 'BUILDABLE',
    xpReward: 0,
    videoEmbedUrl: 'https://www.youtube.com/embed/E_-ZXCgPFYc',
    description:
      'Fire Traps shoot fire from the ceiling but need Fire Cores. Three Fire Cores spawn per game; place them in the three Fire Trap locations to use the traps. Required for the Knight quest line (blue flame step).',
    steps: [
      {
        order: 1,
        label: 'Fire Cores spawn at three locations per game: doorway to the Entrance Hall; doorway to the Library; or side entrance in Alistair\'s Lab.',
      },
      {
        order: 2,
        label: 'Place each Fire Core in one of the three Fire Traps (e.g. Library for the Knight line). Activate the trap when needed.',
      },
    ],
  },
  {
    gameShortName: 'BO4',
    mapSlug: 'dead-of-the-night',
    name: "Savage Impaler (Free)",
    slug: 'savage-impaler-dotn',
    type: 'SIDE_QUEST',
    xpReward: 0,
    description:
      'Obtain the Savage Impaler for free by completing a short quest line that ends at the Crypt. After one player obtains it, the weapon is added to the Mystery Box for all other players.',
    steps: [
      {
        order: 1,
        label: 'Complete the quest line that ends at the Crypt to retrieve the free Savage Impaler. Once obtained, the Savage Impaler is also available in the Mystery Box for the rest of the lobby.',
      },
    ],
  },

  // ——— Dead of the Night (BO4): Side Easter eggs ———

  {
    gameShortName: 'BO4',
    mapSlug: 'dead-of-the-night',
    name: 'Pool Table (Billiards Room)',
    slug: 'pool-table-dotn',
    type: 'SIDE_QUEST',
    xpReward: 0,
    description:
      'Shoot the pool balls in order (1 through 9) into the pocket holes for 500 points. Alternatively, shoot all balls into the left side of the table (opposite the fireplace) to make a bookcase move and reveal an SG12, Sword Flay elixir, or a random power-up.',
    steps: [
      {
        order: 1,
        label: 'Billiards Room: Shoot balls 1–9 in order into the pockets for 500 points. Or shoot all balls into the left side of the table (opposite the fireplace) so the bookcase moves and reveals either an SG12, Sword Flay elixir, or a random power-up.',
      },
    ],
  },
  {
    gameShortName: 'BO4',
    mapSlug: 'dead-of-the-night',
    name: 'Wine Cellar Barrels',
    slug: 'wine-cellar-barrels-dotn',
    type: 'SIDE_QUEST',
    xpReward: 0,
    description:
      'Knife the six wine-dripping barrels in order from fastest to slowest drip. Wrong barrel = no retry. Correct order reveals the wine cabinet; move it to get Silver Bullets or 500 points.',
    steps: [
      {
        order: 1,
        label: 'In the Wine Cellar, six barrels drip at different speeds. Knife the nozzle of the fastest first, then second fastest, and so on to the slowest. A wine splash effect confirms correct order. One wrong knife = cannot retry. When the last (slowest) barrel is knifed, a wine cabinet moves back to reveal Silver Bullets or 500 points.',
      },
    ],
  },

  // ——— Ancient Evil (BO4): Main Quest ———

  {
    gameShortName: 'BO4',
    mapSlug: 'ancient-evil',
    name: 'Greek Tragedy',
    slug: 'greek-tragedy',
    type: 'MAIN_QUEST',
    xpReward: 6000,
    videoEmbedUrl: 'https://www.youtube.com/embed/e8yMyhhudlk',
    description:
      'Complete trials, light the Eternal Flame, and use the Redeemed Hands (Gaia, Charon, Ouranos, Hemera), Apollo\'s Will, and Pegasus Strike to open the path to the boss. Defeat Perseus and Pegasus in the Mount Olympus arena.',
    rewardsDescription: 'Greek Tragedy achievement/trophy; ending cutscene.',
    steps: [
      {
        order: 1,
        label:
          '[Setup] Obtain the Sentinel Artifact and activate Pack-a-Punch (see Unlock Pack-a-Punch). Complete trials to light the Eternal Flame in Apollo\'s Temple. Melee the blue Eternal Flame with Apollo\'s Will (spear) to light it, then set three oil spills ablaze with the lit spear: Upper Road, Intersection of Treasuries, Spartan Monument.',
        buildableReferenceSlug: 'apollos-will-ae',
      },
      {
        order: 2,
        label:
          '[Zeus statues] With the Redeemed Hand of Charon, shoot a charged shot at the ground in front of the Zeus Perk statue in the Spartan Monument. Stand in the blood pool and shoot an uncharged shot at each statue with glowing eyes (four total) to destroy them.',
        buildableReferenceSlug: 'hand-of-charon-ae',
      },
      {
        order: 3,
        label:
          '[Cogs] Destroy three walls (Intersection of Treasuries, Spartan Monument, then Intersection again) to reveal rotating cog locations. Throw Apollo\'s Will at each set when the smaller cog is next to the larger so they connect. Then go to the Stoa of the Athenians; when all statues are facing inward, throw the spear at the fourth cog set there.',
        buildableReferenceSlug: 'apollos-will-ae',
      },
      {
        order: 4,
        label:
          '[Danu symbols and golden pole] At the Offering of the Attalids, use the Redeemed Hand of Gaia to shoot the symbol to the left of the Statue of Danu (with branches). Then shoot two more symbols near the top of the statue (both with one shot); repeat for the next three symbols. Kill the spawned Gegenees and pick up the golden pole it drops.',
        buildableReferenceSlug: 'hand-of-gaia-ae',
      },
      {
        order: 5,
        label:
          '[Ra scepter] At the Intersection of Treasuries, find the ankh in the chaos crystal. Let a Gegenees shield-blast the ankh so it drops. Pick up the ankh and place it in the hand of the Statue of Ra. Place the Redeemed Hand of Hemera at the Statue of Ra to fire a beam; defend the statue from skeletons. When complete, collect Ra\'s Scepter from the revealed chamber and place it on the Statue of Ra.',
        buildableReferenceSlug: 'hand-of-hemera-ae',
      },
      {
        order: 6,
        label:
          '[Sundial] Place the golden pole from step 4 in the sundial at the Offering of the Attalids (yellow line appears). Kill an Electric Catalyst on top of the sundial to activate it. A dial with rotating symbols appears; activate when the blue symbol is under the slot with the light line. Repeat for the two inner dials. If you fail, the screen flashes white and the step must be redone.',
      },
      {
        order: 7,
        label:
          '[Sharpshooter] All players go to the Amphitheater building and stand on the glowing circles that match their Hand color. When a player\'s circle glows in the arena, that player must stand on it and kill all zombies of their color (use charge shot or single shot by distance). Complete three rounds of five plays. Five fails in one attempt = advance to next round and retry from the start.',
      },
      {
        order: 8,
        label:
          '[Ballista and portal] At the River of Sorrow, find the door to the right of the Spitfire wall buy and shoot the symbols on the door in the correct order (see guide image). Players as Stanton Shaw and Bruno interact for a cinematic. At the top of the stairs, place the Pegasus Strike on the blue glowing symbol. Use the Redeemed Hand of Ouranos to fire a charged wind blast at the Ballista from where the Pegasus Strike was placed to turn it. Ignite Apollo\'s Will at the fire in Apollo\'s Temple, then run through an active Venom Trap in Python Pass so the spear tip turns green. Melee the Ballista to fire it; a portal to the boss fight opens in the Center of the World.',
        buildableReferenceSlug: 'pegasus-strike-ae',
      },
      {
        order: 9,
        label:
          '[Boss — Phase 1] Enter the portal. In the Mount Olympus arena, shoot Pegasus until it falls; damage it with your Specialist Weapon. Stand in the flaming spears Perseus throws on the ground to recharge your Specialist gauge.',
      },
      {
        order: 10,
        label:
          '[Boss — Phase 2] After enough damage to Pegasus, Mount Olympus: Fountain and Forest become chaos zones. Go to Mount Olympus: Columns. Perseus absorbs Pegasus and attacks. When he strikes lightning he teleports to that spot—shoot him to make him fall, then damage him with weapons. After enough damage he drops a key and the ending cutscene plays.',
      },
    ],
  },

  // ——— Ancient Evil (BO4): Pack-a-Punch & buildables ———

  {
    gameShortName: 'BO4',
    mapSlug: 'ancient-evil',
    name: 'Unlock Pack-a-Punch',
    slug: 'pack-a-punch-ae',
    type: 'SIDE_QUEST',
    xpReward: 0,
    videoEmbedUrl: 'https://www.youtube.com/embed/MjWh-9nTzB8',
    description:
      'Activate the Sentinel Artifact, survive until Pegasus arrives, obtain the Golden Bridle, free the eagles, and survive at the Center of the World until Pack-a-Punch opens.',
    steps: [
      {
        order: 1,
        label: 'Activate the Sentinel Artifact in the Amphitheater; skeletons and zombies spawn. Survive until Pegasus arrives and kills all enemies, finishing the ritual.',
      },
      {
        order: 2,
        label: 'Obtain the Golden Bridle from one of: the pedestal at the Intersection of Treasuries, or the pedestal in the Stoa of the Athenians. A Gegenees spawns upon pickup.',
      },
      {
        order: 3,
        label: 'Ride Pegasus from the Spartan Monument to the River of Sorrow. In Python Pass, find the eagle in the cage; shoot the cage to drop it and spawn a Gegenees. Kill the Gegenees.',
      },
      {
        order: 4,
        label: 'Go to the Cliff Ruins and kill all skeletons around the other cage. Use your Specialist Weapon to shoot or melee the door of each cage to free the eagles.',
      },
      {
        order: 5,
        label: 'Navigate to the Center of the World and survive until the eagles have opened Pack-a-Punch.',
      },
    ],
  },
  {
    gameShortName: 'BO4',
    mapSlug: 'ancient-evil',
    name: 'Dormant Hand',
    slug: 'dormant-hand-ae',
    type: 'BUILDABLE',
    xpReward: 0,
    videoEmbedUrl: 'https://www.youtube.com/embed/dTeQaYC1eWY',
    description:
      'Required for all four Primordial Hands. After activating the Sentinel Artifact, visit the Oracle for a cryptic clue. The Dormant Hand location shows purple particles on the map. Melee the glowing object to pick it up. One location per game.',
    steps: [
      {
        order: 1,
        label:
          'Visit the Oracle after activating the Sentinel Artifact to get a hint. Possible locations (purple glow): Chaos of the Treasuries—giant red crystal (purple part) when coming from Gymnasium Bathhouse; or patch of purple blossoms, dirt patch nearby. Barque of Gold / Shieldbearers Fountain—Stoa of the Athenians (pot by gold boat with shield/arrows, or pot on fountain statue). General\'s Column / Golden Taurus—Spartan Monument (pot at base of column with statue, or pot at base of golden taurus). Fallen Statesman / Beneath the Watchful Gaze of Zeus—left of Zeus statue up stairs (dirt), or in front of Zeus statue (dirt). Where the Arrow Splits the Road—Intersection, huge arrow between Intersection and Spartan Monument, pile of bricks. Where Sorrows Flow Beneath—River of Sorrow, exiting Pegasus ride, down stairs left (bricks). Sorrow Washes Over—left of Odin statue (dirt). Wheel of Water / Workbench—Cliff Ruins (bricks by blue fireplace, or pot on desk right of blue fireplace). Where the Serpent Snared the Eagle—Cliff Ruins, left of yellow eagle cage (dirt). Broken Bridge—Cliff Ruins to Center of the World, right side of bridge (pot). Shrine of Wind and Sky / Top of the Center of the World—Center of the World left of Ouranos altar (bricks), or behind Pack-a-Punch (bricks). Chaos of Venom—between Center of the World and Acid Trap from Python Pass (crystals). Where the Mighty Titan Points / Steps of Flesh and Bone—Python Pass (crystal left of Titan wall buy; or stone pile by Charon altar). Melee the glowing object to obtain the Dormant Hand.',
      },
    ],
  },
  {
    gameShortName: 'BO4',
    mapSlug: 'ancient-evil',
    name: 'Hand of Gaia',
    slug: 'hand-of-gaia-ae',
    type: 'BUILDABLE',
    xpReward: 0,
    videoEmbedUrl: 'https://www.youtube.com/embed/rczZsec28ZY',
    description:
      'Place a Dormant Hand at the Shrine of Gaia (Spartan Monument, green circle near Golden Taurus). Survive the barrier to get the Fallen Hand of Gaia. Upgrade to Redeemed by collecting three seedlings and entering the portal arena. Required for main quest step 4.',
    steps: [
      {
        order: 1,
        label: 'Bring the Dormant Hand to the Shrine of Gaia in the Spartan Monument (large green circle). Place it on the shrine; survive inside the barrier until it disappears. Pick up the Fallen Hand of Gaia.',
        buildableReferenceSlug: 'dormant-hand-ae',
      },
      {
        order: 2,
        label: 'Find three plants with three small red crystals (Temple Terrace, Stoa of the Athenians, Intersection of Treasuries—listen for ringing). Shoot the crystals with the Fallen Hand; a seedling emerges. Pick up each seedling and deliver it to the Shrine of Gaia (no sprint, jump, weapon change, or interact while holding). If you go down, the seedling respawns after a short time. All three delivered opens a portal.',
      },
      {
        order: 3,
        label: 'Enter the portal; you receive the Redeemed Hand of Gaia and unlimited ammo. Survive for the required time to be teleported back with the Redeemed Hand.',
      },
    ],
  },
  {
    gameShortName: 'BO4',
    mapSlug: 'ancient-evil',
    name: 'Hand of Charon',
    slug: 'hand-of-charon-ae',
    type: 'BUILDABLE',
    xpReward: 0,
    videoEmbedUrl: 'https://www.youtube.com/embed/1eytUjHK1Fs',
    description:
      'Place a Dormant Hand at the Shrine of Charon (Python Pass, red circle). Survive to get the Fallen Hand. Upgrade to Redeemed by getting kills in the River of Sorrow, drinking the water, and collecting three Charon\'s Obols. Required for main quest step 2.',
    steps: [
      {
        order: 1,
        label: 'Bring the Dormant Hand to the Shrine of Charon in Python Pass (bright red circle). Place it and survive the barrier. Pick up the Fallen Hand of Charon.',
        buildableReferenceSlug: 'dormant-hand-ae',
      },
      {
        order: 2,
        label: 'In the River of Sorrow, get kills with the Fallen Hand in the water in front of the Odin statue. When prompted, "drink from the River of Sorrow." You get a red screen effect and cannot regenerate health. Find three Charon\'s Obols (highlighted by vision, through walls when close). Extinguish fake obols to help. Correct obols show "Obtain Charon\'s Obol." If you go down, drink again. Bring all three to the Shrine of Charon.',
      },
      {
        order: 3,
        label: 'Teleport to the Shadow\'s Bank; you receive the Redeemed Hand of Charon and unlimited ammo. Kill enough zombies to be teleported back with the Redeemed Hand.',
      },
    ],
  },
  {
    gameShortName: 'BO4',
    mapSlug: 'ancient-evil',
    name: 'Hand of Ouranos',
    slug: 'hand-of-ouranos-ae',
    type: 'BUILDABLE',
    xpReward: 0,
    videoEmbedUrl: 'https://www.youtube.com/embed/_hTs430DUYs',
    description:
      'Place a Dormant Hand at the Shrine of Ouranos (Center of the World, blue circle by Pack-a-Punch). Survive to get the Fallen Hand. Upgrade to Redeemed by launching zombies at three arrows to get feathers and guiding them to the Ouranos altar. Required for main quest Ballista step.',
    steps: [
      {
        order: 1,
        label: 'Bring the Dormant Hand to the Shrine of Ouranos in the Center of the World (blue circle in front of Pack-a-Punch). Place it and survive the barrier. Pick up the Fallen Hand of Ouranos.',
        buildableReferenceSlug: 'dormant-hand-ae',
      },
      {
        order: 2,
        label: 'Find three large arrows: Center of the World; Cliff Ruins near a box location; Python Pass next to the Shrine of Charon. Launch a zombie with the Fallen Hand so the body hits the arrow; a blue feather emerges. Shoot the feather twice with the Fallen Hand so it floats to the Ouranos altar. The arrow breaks when the feather is complete. Repeat for all three.',
      },
      {
        order: 3,
        label: 'When all three feathers reach the altar, a portal opens. Enter to receive the Redeemed Hand of Ouranos and unlimited ammo; survive to be teleported back.',
      },
    ],
  },
  {
    gameShortName: 'BO4',
    mapSlug: 'ancient-evil',
    name: 'Hand of Hemera',
    slug: 'hand-of-hemera-ae',
    type: 'BUILDABLE',
    xpReward: 0,
    videoEmbedUrl: 'https://www.youtube.com/embed/-mCI4aCOhgw',
    description:
      'Place a Dormant Hand at the Shrine of Hemera (Monument of Craterus, orange circle). Survive to get the Fallen Hand. Upgrade to Redeemed by aligning three mirrors, bouncing orbs into bowls, and delivering orbs to the Shrine before they fade. Required for main quest Ra scepter step.',
    steps: [
      {
        order: 1,
        label: 'Bring the Dormant Hand to the Shrine of Hemera in the Monument of Craterus (bright orange circle). Place it and survive the barrier. Pick up the Fallen Hand of Hemera.',
        buildableReferenceSlug: 'dormant-hand-ae',
      },
      {
        order: 2,
        label: 'Find three mirrors: Temple of Apollo (below blue banner—orb lands in bowl near Gymnasium Bathhouse stairs); Upper Road (bridge outside map); Temple Terrace (on pillar). Shoot each mirror to turn it upright, then shoot with the Fallen Hand to bounce an orb into the bowl. Melee with the Fallen Hand to pick up the orb and take it to the Shrine of Hemera before it fades; melee to place in one of the three bowls. If the light fades, shoot the mirror again for a new orb.',
      },
      {
        order: 3,
        label: 'When all three orbs are in the Shrine bowls, a portal opens. Enter to receive the Redeemed Hand of Hemera and unlimited ammo; survive to be teleported back.',
      },
    ],
  },
  {
    gameShortName: 'BO4',
    mapSlug: 'ancient-evil',
    name: 'Exalted Hands',
    slug: 'exalted-hands-ae',
    type: 'SIDE_QUEST',
    xpReward: 0,
    description:
      'Final upgrade for all Primordial Hands. Requires all four Redeemed Hands. Light the Eternal Flame via trials (Epic and Legendary reward), then complete catalyst kills at each shrine, collect souls, and finish the four Primordial God challenges at Pack-a-Punch. After the Challenge of Charon, any Hand can be Pack-a-Punched to Exalted (more ammo and damage).',
    steps: [
      {
        order: 1,
        label: 'Obtain the Redeemed Hand of Gaia, Hemera, Charon, and Ouranos. Complete trials and claim an Epic and a Legendary reward to light the Eternal Flame.',
        buildableReferenceSlug: 'hand-of-gaia-ae',
      },
      {
        order: 2,
        label: 'With Apollo\'s Will, melee the Eternal Flame to light the spear. Outside, left of the Eternal Flame, look up and throw the spear slightly above the bowl on top of the pillar to light it.',
        buildableReferenceSlug: 'apollos-will-ae',
      },
      {
        order: 3,
        label: 'Kill one specific Catalyst at each Shrine in the circle: Fire Catalyst at Shrine of Gaia; Electric at Hemera; Poison at Charon; Water at Ouranos. Then get about 10 zombie kills near each Shrine so souls fill it (souls stop when done).',
      },
      {
        order: 4,
        label: 'Take one Hand to Pack-a-Punch and interact to start the Primordial God\'s Challenges. Complete all four (you return to the map after each): Challenge of Gaia—kill many Catalyst zombies; Ouranos—kill many skeletons; Hemera—kill three Gegenees; Charon—kill three Blightfathers. After Charon, Pack-a-Punch any Hand to Exalted form.',
      },
    ],
  },
  {
    gameShortName: 'BO4',
    mapSlug: 'ancient-evil',
    name: "Apollo's Will",
    slug: 'apollos-will-ae',
    type: 'BUILDABLE',
    xpReward: 0,
    videoEmbedUrl: 'https://www.youtube.com/embed/q3SbaY09Ap8',
    description:
      'Buildable shield (spear and shield). Three parts: Handle, Spear, and Shield. The Shield part drops from the Gegenees that spawns when you pick up the Golden Bridle. Build at the worktable in the back of the Marketplace. Required for main quest (Eternal Flame, cogs, Ballista).',
    steps: [
      {
        order: 1,
        label: 'Handle (Upper Road): On a rock before the bridge; on a rock under the bridge; or on a rock after the bridge.',
      },
      {
        order: 2,
        label: 'Spear: In the Intersection of Treasuries against a statue or stuck in a low wall; or in the Stoa of the Athenians against a pillar.',
      },
      {
        order: 3,
        label: 'Shield: Obtained by killing the Gegenees that spawns after you pick up the Golden Bridle (see Unlock Pack-a-Punch). Build Apollo\'s Will at the worktable in the back of the Marketplace.',
        buildableReferenceSlug: 'pack-a-punch-ae',
      },
    ],
  },
  {
    gameShortName: 'BO4',
    mapSlug: 'ancient-evil',
    name: 'Pegasus Strike',
    slug: 'pegasus-strike-ae',
    type: 'BUILDABLE',
    xpReward: 0,
    videoEmbedUrl: 'https://www.youtube.com/embed/guGLUgZSJX8',
    description:
      'Specialist weapon forged in the Cliff Ruins. Three parts: Anvil, Hammer, Tongs (Blacksmith Tongs). Build at the forge in the Cliff Ruins. Free to pick up once built; then available in the Mystery Box. Required for main quest Ballista step.',
    steps: [
      {
        order: 1,
        label: 'Activate Pegasus and travel to the Cliff Ruins. Anvil: against a column near the Mystery Box spawn; on a rock between the Mystery Box and the Forge; or on a rock across from the birdcage.',
      },
      {
        order: 2,
        label: 'Hammer (Python Pass): in the middle with sight of the Titan wall buy; against an exposed rib next to the Mystery Box spawn; or against a small wall to the left and across from the Mystery Box spawn.',
      },
      {
        order: 3,
        label: 'Tongs (River of Sorrow): to the right of the Symbol Door; in a fire on the way to Python Pass; or in a skeleton\'s skull against a wall. Build at the forge station in the Cliff Ruins; pick up the Pegasus Strike for free.',
      },
    ],
  },

  // ——— Alpha Omega (BO4): Main Quest ———

  {
    gameShortName: 'BO4',
    mapSlug: 'alpha-omega',
    name: 'Electromagnetic Awakening Party',
    slug: 'electromagnetic-awakening-party',
    type: 'MAIN_QUEST',
    xpReward: 5500,
    videoEmbedUrl: 'https://www.youtube.com/embed/-MZy_CiiyLA',
    description:
      'Primis and Ultimis enact Primis Nikolai\'s plan from the Kronorium at the Nevada nuclear test site. Complete Rushmore\'s tasks (Core Values of Broken Arrow), repair Peter McCain\'s A.D.A.M. unit, transfer his soul to the Elemental Orb, then contain the Avogadro (Cornelius Pernell) and retrieve the Elemental Shard. Sergeant A.D.A.M. is required for step 4 (Marlton).',
    rewardsDescription: 'Electromagnetic Awakening Party achievement/trophy; Elemental Shard; ending cutscene.',
    steps: [
      {
        order: 1,
        label:
          '[Contain the gas leak] After power is on, the terminal in the Generator Room (by the generators) glows red. Interact to start a one-minute lockdown; Nova 6 Bombers and zombies spawn. After generators restart, four houses on the surface leak Nova 6—find and repair the ventilation units in or just outside each (interact to fix; Jolting Jacks and zombies spawn). When all four are repaired, Pack-a-Punch opens in the Beds area and Rushmore reactivates at round end.',
      },
      {
        order: 2,
        label:
          '[Emergency broadcast / punch-clocks] Rushmore instructs you to come to his terminal in Operations. Interact; he asks for access codes. Buy Galvaknuckles and find the tube TV that is on (blank screen) in Beds, Lounge, or Diner. Melee a zombie near it with Galvaknuckles; the screen shows a test card and transmits five codes (letter + four digits). Letters = house (A Yellow, B Green, C Prisoner Holding, D Transfusion, E Operations, F APD Interrogation). Input each code into that building\'s punch-clock as a time: interact = +15 min, melee = +1 hour. Order matters; wrong input = restart from first. The building with no code: interact its punch-clock and it spins to a time—that time is the sixth code. Enter it on Rushmore\'s keypad. Traps unlock in all houses; free PaP\'d weapon in Prisoner Holding (ICR-7, Swordfish, Titan, or MOG 12) and free Porter\'s Mark II Ray Gun upstairs in Operations.',
      },
      {
        order: 3,
        label:
          '[Nova 6 crawler] Interact with Rushmore; he wants a Nova 6 crawler (glowing harsh red, one-hit kill) analyzed. Lead it from the bunker to the Transfusion Facility and to the staircase; it scrambles over the bookcase (main room to stairs). Rushmore congratulates—Core Value one.',
      },
      {
        order: 4,
        label:
          '[Marlton and 115 canister] Rushmore says an intruder stole an Element 115 canister. The intruder is in the stairwell between the Diner and Green House backyard (melee the door; Marlton Johnson refuses). With Sergeant A.D.A.M. active nearby, Marlton throws out the canister. Pick it up and place it on the shelf in the Transfusion Facility by the Green House backyard doorway. Core Value two.',
        buildableReferenceSlug: 'sergeant-adam-ao',
      },
      {
        order: 5,
        label:
          '[Server and authorization codes] Rushmore needs a new server. It is by a telepad in the same house as the power switch. Have a Jolting Jack shoot an electric ball at the server casing to open it; pick up the server. Use telepads (place one near the server, one near Control) and run the rest so it does not overheat. Place the server in the open slot by the stairwell. Three paintings leak green smoke: top of stairs in Green House; opposite Pack-a-Punch in Beds; on the wall next to exit stairs in Lounge. Use Brain Rot to control a zombie and have it knock down the paintings to reveal codes. Collect all three and input them at Rushmore within a minute of each other. Core Value three.',
        buildableReferenceSlug: 'telepad-ao',
      },
      {
        order: 6,
        label:
          '[Power boxes] Rushmore\'s task is interrupted by a power shutdown. Six power boxes in the bunker must be set: Lounge ↓ Down, Diner ↑ Up, Beds ↑ Up, Solitary ↓ Down, Generators ↑ Up, Storage ↓ Down. When all lights are green, flip the power switch to restore power. Core Value four.',
      },
      {
        order: 7,
        label:
          '[Repair A.D.A.M. and Elemental Orb] Rushmore says the broken A.D.A.M. in APD Interrogation holds a human spirit (Peter McCain). New A.D.A.M. units spawn; one sparks. Interact to overload it and stay in the marked area until it self-destructs (leaving cancels it). Do this for three units to get a head and two arms. Interact with the broken unit to repair it—Peter McCain appears and grants APD access. Rushmore wants his soul in the Elemental Orb. Find the floating Elemental Orb (often behind zombie spawns); follow it without straying too far until it reaches APD Interrogation and Peter\'s soul transfers. If you stray, the orb resets and you must wait for the next round. Core Value five.',
      },
      {
        order: 8,
        label:
          '[Avogadro and Elemental Shard] Go to APD Control and interact with the console bank. A.D.A.M. units spawn; killing them fills soul canisters. The APD opens and the Avogadro (Cornelius Pernell) is revealed; lockdown and nuclear detonation trigger. Fill the four backup soul canisters (Lounge, Diner, Storage, Beds)—all players must be in the same room when each is activated. The Avogadro attacks that room; when the canister fills you get Max Ammo and Carpenter but the room becomes hazardous. When all four are full, lure the Avogadro back into the APD (shoot to push or coordinate him to the APD doorway); the APD sucks him in. Interact with the main console to transport him to Hanford. Rushmore thanks you; the APD reopens. Take the Elemental Shard and the ending cutscene plays.',
      },
    ],
  },

  // ——— Alpha Omega (BO4): Buildables ———

  {
    gameShortName: 'BO4',
    mapSlug: 'alpha-omega',
    name: 'Riot Shield',
    slug: 'riot-shield-ao',
    type: 'BUILDABLE',
    xpReward: 0,
    videoEmbedUrl: 'https://www.youtube.com/embed/ABqvqHWPiJA',
    description:
      'Three parts: Handle (Operations), Body/Window (Cul-de-Sac), and Component (Bunker Beds). Build at a crafting table on the map.',
    steps: [
      {
        order: 1,
        label: 'Handle (Operations): on the desk in front of the screens; leaning against blue filing cabinets; or upstairs on top of a tipped-over filing cabinet.',
      },
      {
        order: 2,
        label: 'Body/Window (Cul-de-Sac): leaning against the green car near the yellow house/garage; leaning against the back of the yellow bus; or on a pile of crates/debris near the red truck.',
      },
      {
        order: 3,
        label: 'Component (Beds): on a yellow sofa in the Beds area; leaning against a drawer/nightstand near the back; or on a metal shelf near the generators. Build at a crafting table.',
      },
    ],
  },
  {
    gameShortName: 'BO4',
    mapSlug: 'alpha-omega',
    name: 'Telepad',
    slug: 'telepad-ao',
    type: 'BUILDABLE',
    xpReward: 0,
    videoEmbedUrl: 'https://www.youtube.com/embed/zYd7kJq7pt0',
    description:
      'Place on teleporters to fast travel. Required for main quest server step and for the Ray Gun Mark II-Y. Craft in Green House Upstairs or APD Control.',
    steps: [
      {
        order: 1,
        label: 'Part 1 (Transfusion Facility): inside a locker near the front door; on the back leaning against a chair; or outside on top of a stack of drywall.',
      },
      {
        order: 2,
        label: 'Part 2 (Green House): left corner near the front door; near the kitchen oven; or upstairs on the balcony leaning against the wall.',
      },
      {
        order: 3,
        label: 'Part 3 (Generators): behind the generator rails near Storage entrance; behind barrels near the right exit to Beds; or on the right wall near the door to Solitary. Build at Green House Upstairs or APD Control.',
      },
    ],
  },
  {
    gameShortName: 'BO4',
    mapSlug: 'alpha-omega',
    name: 'Ray Gun Assembly Kit',
    slug: 'ray-gun-assembly-kit-ao',
    type: 'BUILDABLE',
    xpReward: 0,
    videoEmbedUrl: 'https://www.youtube.com/embed/8HAYhm7FCzQ',
    description:
      'Craft the kit and unlock the four Ray Gun Mark II frames. Used to build elemental variants (V, X, Y, Z). Crafting table is on the upper floor of Operations.',
    steps: [
      {
        order: 1,
        label: 'Tubing (Yellow House): downstairs on kitchen table; upstairs in the bookshelf; or upstairs on the lamp table in the bedroom.',
      },
      {
        order: 2,
        label: 'Container (APD Control or Solitary): APD Control on cart near Mystery Box or on chair near Solitary exit; or Solitary on the desk with an A.D.A.M.',
      },
      {
        order: 3,
        label: 'Canister (Storage): on a shelf; on a barrel near an A.D.A.M.; or on barrels near the Generators entrance. Build the Assembly Kit at Operations upstairs.',
      },
      {
        order: 4,
        label: 'Frames: Unlock Pack-a-Punch. Find and activate the four TVs that show static and emit sound (Site Entrance, Yellow House Backyard, Diner, APD Control). Kill enemies near each TV to charge it; a number appears. Enter the four numbers into Rushmore in the order they were revealed. A cabinet opens with four Ray Gun Mark II frames—pick one up to use with elemental canisters.',
      },
    ],
  },
  {
    gameShortName: 'BO4',
    mapSlug: 'alpha-omega',
    name: 'Ray Gun Mark II-V (Electric)',
    slug: 'ray-gun-mk2-v-ao',
    type: 'BUILDABLE',
    xpReward: 0,
    videoEmbedUrl: 'https://www.youtube.com/embed/6fXHpdKE6lg?start=69',
    description:
      'Electric beam; stuns four enemies; regenerates ammo when not in use. Requires a Ray Gun Mk II frame and a PaP\'d weapon with Kill-O-Watt.',
    steps: [
      {
        order: 1,
        label: 'Get a Ray Gun Mk II frame. In the Generators room, one of the three circuit boxes has a panel emitting yellow smoke. Shoot the panel with Kill-O-Watt to remove it and collect the canister inside.',
        buildableReferenceSlug: 'ray-gun-assembly-kit-ao',
      },
      {
        order: 2,
        label: 'One of five telephone poles around the map emits yellow sparks. Shoot it with Kill-O-Watt until it glows; repeat for the remaining poles to create a current. A generator near the Yellow House receives power. Place the canister on that generator to activate a soul circle.',
      },
      {
        order: 3,
        label: 'Kill enemies while staying on the soul circle to charge the canister. Use the Assembly Kit to craft the Ray Gun Mark II-V.',
      },
    ],
  },
  {
    gameShortName: 'BO4',
    mapSlug: 'alpha-omega',
    name: 'Ray Gun Mark II-X (Cryofreeze)',
    slug: 'ray-gun-mk2-x-ao',
    type: 'BUILDABLE',
    xpReward: 0,
    videoEmbedUrl: 'https://www.youtube.com/embed/6fXHpdKE6lg?start=17',
    description:
      'Full-auto variant; dual wield when Pack-a-Punched. Requires a frame and a PaP\'d weapon with Cryofreeze.',
    steps: [
      {
        order: 1,
        label: 'Get a frame. One of three filing cabinets emits blue smoke: garage of Operations, near backdoor of APD Interrogation, or Prisoner Holding. Shoot the cabinet with Cryofreeze to open it and collect the canister.',
        buildableReferenceSlug: 'ray-gun-assembly-kit-ao',
      },
      {
        order: 2,
        label: 'Rushmore tasks you to collect samples from three scientists (zombies surrounded by blue mist, usually in the bunker). Freeze them with Cryofreeze and melee to kill; they drop a sample. Collect all three. In APD Control, find the broken 115 container and place the canister in it to activate a soul circle.',
      },
      {
        order: 3,
        label: 'Kill enemies on the soul circle to charge the canister. Craft the Ray Gun Mark II-X at the Assembly Kit.',
      },
    ],
  },
  {
    gameShortName: 'BO4',
    mapSlug: 'alpha-omega',
    name: 'Ray Gun Mark II-Y (Brain Rot)',
    slug: 'ray-gun-mk2-y-ao',
    type: 'BUILDABLE',
    xpReward: 0,
    videoEmbedUrl: 'https://www.youtube.com/embed/6fXHpdKE6lg?start=126',
    description:
      'Explosive rounds and charge shot; effective against groups. Requires a frame, Telepad, and PaP\'d weapon with Brain Rot.',
    steps: [
      {
        order: 1,
        label: 'Get a frame and build the Telepad. A pile of dirt emits green mist in one of three spots: behind Yellow House by back door, Green House backyard near bunker entrance, or Center Street side nearest Yellow House. Spawn a Brain Rot zombie near the active pile to obtain the canister.',
        buildableReferenceSlug: 'telepad-ao',
      },
      {
        order: 2,
        label: 'An orange orb appears and moves to a teleporter pad. Find it and attack the orb to make it move to another pad. Place the first Telepad on that pad. Find the orb again, attack it, place the second Telepad, and follow the orb through the teleporter. The orb goes to the Storage room.',
      },
      {
        order: 3,
        label: 'Place the canister in the orb in Storage to spawn a soul circle. Kill enemies on the circle to charge the canister. Craft the Ray Gun Mark II-Y at the Assembly Kit.',
      },
    ],
  },
  {
    gameShortName: 'BO4',
    mapSlug: 'alpha-omega',
    name: 'Ray Gun Mark II-Z (Fire Bomb)',
    slug: 'ray-gun-mk2-z-ao',
    type: 'BUILDABLE',
    xpReward: 0,
    videoEmbedUrl: 'https://www.youtube.com/embed/6fXHpdKE6lg?start=189',
    description:
      'Laser shotgun; penetrates enemies. PaP\'d: full-auto. Requires a frame and PaP\'d weapon with Fire Bomb.',
    steps: [
      {
        order: 1,
        label: 'Get a frame. One of three cabinets has orange gas: Green House kitchen, Yellow House kitchen, or Diner. Shoot it with Fire Bomb to reveal and collect the canister.',
        buildableReferenceSlug: 'ray-gun-assembly-kit-ao',
      },
      {
        order: 2,
        label: 'One of three houses has purple fire from the chimney: Yellow House, Transfusion House, or Operations. Throw a Frag Grenade, Wraith Fire, or Monkey Bomb into the chimney; purple fire appears in the fireplace inside. Place the canister in the fireplace to activate a soul circle.',
      },
      {
        order: 3,
        label: 'Kill enemies on the soul circle to charge the canister. Craft the Ray Gun Mark II-Z at the Assembly Kit.',
      },
    ],
  },
  {
    gameShortName: 'BO4',
    mapSlug: 'alpha-omega',
    name: 'Sergeant A.D.A.M.',
    slug: 'sergeant-adam-ao',
    type: 'BUILDABLE',
    xpReward: 0,
    videoEmbedUrl: 'https://www.youtube.com/embed/o5bQqTDDPe4',
    description:
      'Civil Protector–style ally; follows the crew for up to three rounds. Required for main quest step 4 (Marlton). Rushmore must be active. Input four codes at Rushmore\'s keypad in sequence, with no more than a minute between each. Reactivation costs 3,000 points.',
    steps: [
      {
        order: 1,
        label: 'Project Toy Soldier code: always 7626. Input at Rushmore.',
      },
      {
        order: 2,
        label: 'Sawyer authorization: behind a display in APD Interrogation, or on a terminal under the stairs in APD Interrogation.',
      },
      {
        order: 3,
        label: 'Peter McCain authorization: under destroyable papers in APD Control beside the exit to the bunker stairwell.',
      },
      {
        order: 4,
        label: 'Pernell authorization: code is in a locked desk upstairs in the Yellow House. Key is in Solitary in the keybox on the opposite side of the M1927 wall buy. Input all four codes in order. A door in Storage opens—interact with Sergeant A.D.A.M. to activate him.',
      },
    ],
  },

  // ——— Alpha Omega (BO4): Music & side Easter eggs ———

  {
    gameShortName: 'BO4',
    mapSlug: 'alpha-omega',
    name: 'I Am The Well (Music Easter Egg)',
    slug: 'i-am-the-well-ao',
    type: 'MUSICAL',
    xpReward: 0,
    description:
      'Song by Clark S. Nova. Enter the code SONG (7664) into the Rushmore panel, or interact with three A.D.A.M. heads in: Green House upstairs (below the side of the bed closest to the wall), Solitary (corner of the small office before APD Control, in front of the open barrier), Lounge (red chair to the left of the billiards table).',
    steps: [
      {
        order: 1,
        label: 'Enter 7664 (SONG) at Rushmore, or find and interact with the three A.D.A.M. heads in Green House upstairs (under bed), Solitary (office before APD Control), and Lounge (red chair left of billiards table).',
      },
    ],
  },
  {
    gameShortName: 'BO4',
    mapSlug: 'alpha-omega',
    name: 'Beds Disco (Frequency)',
    slug: 'beds-disco-ao',
    type: 'SIDE_QUEST',
    xpReward: 0,
    description:
      'Turn the Beds area into a disco rave (like Der Eisendrache). Enter CLUB (2582) or RAVE (7283) into the Rushmore panel. The song Frequency plays in the area.',
    steps: [
      {
        order: 1,
        label: 'Enter 2582 (CLUB) or 7283 (RAVE) at the Rushmore panel. The Beds area becomes a disco and Frequency plays.',
      },
    ],
  },
  {
    gameShortName: 'BO4',
    mapSlug: 'alpha-omega',
    name: 'A.D.A.M. Special Round',
    slug: 'adam-special-round-ao',
    type: 'SIDE_QUEST',
    xpReward: 0,
    description:
      'Destroy all 30 A.D.A.M. unit heads around the map with a weapon or melee. Shooting off every head causes the next round to be only A.D.A.M. units; an Extra Perk power-up drops in front of the Nuketown sign at round end.',
    steps: [
      {
        order: 1,
        label: 'Shoot off the heads of all 30 A.D.A.M. units around the map. The next round is A.D.A.M.-only; when it ends, an Extra Perk drops in front of the Nuketown sign.',
      },
    ],
  },
  {
    gameShortName: 'BO4',
    mapSlug: 'alpha-omega',
    name: 'Weeping Angel A.D.A.M.',
    slug: 'weeping-angel-adam-ao',
    type: 'SIDE_QUEST',
    xpReward: 0,
    description:
      'Knife off all 30 A.D.A.M. heads (do not shoot). An A.D.A.M. spawns behind the Nuketown sign and acts like a zombie but freezes when looked at. It is invincible until reunited with the female A.D.A.M. in the Generators room; then both go to the Green House Backyard shed. A Self-Revive power-up spawns at the front door.',
    steps: [
      {
        order: 1,
        label: 'Knife off all 30 A.D.A.M. heads. An A.D.A.M. appears behind the Nuketown sign (freezes when looked at). Lead it to the female A.D.A.M. in the Generators room so they reunite; they go to the Green House Backyard shed. A Self-Revive spawns at the front door.',
      },
    ],
  },
  {
    gameShortName: 'BO4',
    mapSlug: 'alpha-omega',
    name: 'A.D.A.M. Jumpscare',
    slug: 'adam-jumpscare-ao',
    type: 'SIDE_QUEST',
    xpReward: 0,
    description:
      'Melee off all 30 A.D.A.M. heads using the Galvaknuckles. A.D.A.M. units spawn next to the Pack-a-Punch machine; looking at one triggers an A.D.A.M. face jumpscare.',
    steps: [
      {
        order: 1,
        label: 'Use the Galvaknuckles to melee off all 30 A.D.A.M. heads. A.D.A.M. units appear by Pack-a-Punch; look at one to trigger the jumpscare.',
      },
    ],
  },
  {
    gameShortName: 'BO4',
    mapSlug: 'alpha-omega',
    name: 'Desert Zombie Jumpscare',
    slug: 'desert-zombie-jumpscare-ao',
    type: 'SIDE_QUEST',
    xpReward: 0,
    description:
      'A lone zombie in the desert behind the Green House Backyard mimics the player. Aiming at it with a sniper scope triggers a jumpscare of Cornelius Pernell\'s face.',
    steps: [
      {
        order: 1,
        label: 'In the desert behind the Green House Backyard, find the zombie that mimics your appearance. Aim at it with a sniper scope to trigger the Cornelius Pernell jumpscare.',
      },
    ],
  },

  // ——— Tag der Toten (BO4): Main Quest ———

  {
    gameShortName: 'BO4',
    mapSlug: 'tag-der-toten',
    name: 'Salvation Lies Above',
    slug: 'salvation-lies-above',
    type: 'MAIN_QUEST',
    xpReward: 7000,
    videoEmbedUrl: 'https://www.youtube.com/embed/r0lxoMyWAEM',
    description:
      'Victis assists Nikolai in building the Agarthan Device to banish the Multiverse, Element 115, Agartha, and Dr. Monty into the Dark Aether. Prerequisites: at least two Hermit challenge totems completed, flinger to Golden Pack-a-Punch repaired, Wunderwaffe DG-Scharfschütze, Samantha\'s Music Box, and all dynamite barricades opened.',
    rewardsDescription: 'Salvation Lies Above achievement/trophy; Agarthan Device; ending cinematic; final playable segment as Samantha and Eddie.',
    steps: [
      {
        order: 1,
        label:
          '[Dials] After at least two Hermit trials, go to the top of the Lighthouse. The Hermit gives four colored dials. Place them around the Artifact Storage room on the Tugarin ship (where the Apothicon Blood is). Enter the correct numbers (random each game)—rotate until you hear a ding, or find numbers: Blue dial in Cargo Hold, Orange in Forecastle, Purple in Stern, Yellow in Sun Deck.',
      },
      {
        order: 2,
        label:
          '[Vril Vessel and Seal of Duality] The Apothicon Blood demands three offerings (it gives hints; see guide for hint–location list). After three offerings, it asks for the Seal of Duality. Use the hint to find the location (e.g. Specimen Storage bulletin board, Ice Grotto wooden board, Geological Processing board, Boathouse framed map). Melee and place a Dynamite on it; pick up the Vril Vessel. Back at Artifact Storage, shoot the Blood until a small yellow-orange orb appears and flies away. Find it, throw a Snowball to turn it blue, shoot to return it. Repeat three times total; pick up the Seal of Duality.',
        buildableReferenceSlug: 'dynamite-tdt',
      },
      {
        order: 3,
        label:
          '[Elemental Shard] With the Seal and Samantha\'s Music Box, go to Sunken Path and place the Seal on a campfire; throw a Music Box onto the fire (it turns blue). Listen to the audio. Return to the Hermit for Soapstones. Heat one at the Boathouse trap and freeze one at the Decontamination trap. Without entering water, go to Human Infusion and place the Soapstones in the control panel; take the fuse. Place the fuse in the power panel at Lighthouse Station (next to the metal door). Charge the fuse: shoot the red battery on the electric towers (Facility Entrance, Loading Platform), then kill three Electrified Zombies near the three generators (Lighthouse Station upper platform, Lighthouse Approach near MX9, Boathouse near trap). Open the metal door and collect the Elemental Shard.',
        buildableReferenceSlug: 'samanthas-music-box-tdt',
      },
      {
        order: 4,
        label:
          '[Agarthan Device and escort] Shoot the Blood and small orbs again; repeat the Sunken Path campfire + Music Box step. Give the Seal to the Hermit via his pulley. Survive the lockdown and re-acquire the Seal. Charge the Seal at each Pack-a-Punch (Beach, Lagoon, Sunken Path, Boathouse) as the Lighthouse beam indicates. Redo the small orbs and campfire step once more. Place the Seal in the Golden Pack-a-Punch and charge it. The Seal forms a red shield—stay inside and escort it to Human Infusion (map transforms, water becomes lava). The shield shrinks; survive until it ends. Pick up the Agarthan Device and give it to the Hermit (revealed as Pablo Marinus); he enters the portal. The Device returns to the Forecastle—pick it up to trigger the ending cinematic.',
      },
      {
        order: 5,
        label:
          '[The Way Through] After the cinematic, play as Samantha Maxis and young Edward Richtofen. Walk out of the Dark Aether into the new universe; the screen flashes white—end of the Aether story.',
      },
    ],
  },

  // ——— Tag der Toten (BO4): Pack-a-Punch & buildables ———

  {
    gameShortName: 'BO4',
    mapSlug: 'tag-der-toten',
    name: 'Unlock Pack-a-Punch',
    slug: 'pack-a-punch-tdt',
    type: 'SIDE_QUEST',
    xpReward: 0,
    videoEmbedUrl: 'https://www.youtube.com/embed/0trdmmuQMfQ',
    description:
      'Turn on both power switches (one near the docks at spawn, one on the bridge of the wrecked ship). Knife the blue rock in the cave by the lighthouse and take it to the top of the lighthouse; give it to the Hermit. Pack-a-Punch is then usable.',
    steps: [
      {
        order: 1,
        label: 'Turn on the power switch near the docks (spawn) and the power switch on the bridge of the wrecked ship.',
      },
      {
        order: 2,
        label: 'In the cave by the lighthouse, knife the blue rock and pick it up. Take it to the top of the lighthouse and give it to the Hermit. Pack-a-Punch can now be used.',
      },
    ],
  },
  {
    gameShortName: 'BO4',
    mapSlug: 'tag-der-toten',
    name: 'Golden Pack-a-Punch',
    slug: 'golden-pack-a-punch-tdt',
    type: 'SIDE_QUEST',
    xpReward: 0,
    videoEmbedUrl: 'https://www.youtube.com/embed/0trdmmuQMfQ',
    description:
      'Upgrades a weapon to its highest level via the flinger. Requires the zipline and Facility power.',
    steps: [
      {
        order: 1,
        label: 'Get the zipline handle: pick up, repair, and turn the two cranks at each end of the ship. Return to the lighthouse to receive the zipline handle.',
      },
      {
        order: 2,
        label: 'Use the zipline to reach the Facility at the top of the cliff and turn on the power there.',
      },
      {
        order: 3,
        label: 'On the ship, pick up the broken flinger box and take it to the lighthouse to be repaired. Take it back to the flinger and install it. Golden Pack-a-Punch is now accessible by using the flinger.',
      },
    ],
  },
  {
    gameShortName: 'BO4',
    mapSlug: 'tag-der-toten',
    name: 'Riot Shield',
    slug: 'riot-shield-tdt',
    type: 'BUILDABLE',
    xpReward: 0,
    videoEmbedUrl: 'https://www.youtube.com/embed/4U9e1ypKMlo',
    description:
      'Three parts: Docks, Frozen Crevasse/Lagoon, and Lighthouse. Build at a crafting table.',
    steps: [
      {
        order: 1,
        label: 'Part 1 (Docks): against a gas pump; on a boat; or on an ice pile.',
      },
      {
        order: 2,
        label: 'Part 2 (Frozen Crevasse/Lagoon): on an iceberg; near the Mystery Box; or on a rock in the lagoon.',
      },
      {
        order: 3,
        label: 'Part 3 (Lighthouse): on any of the three floors—often near a barrier, the 2nd-floor decal, or the 3rd-floor railing. Build at the crafting table.',
      },
    ],
  },
  {
    gameShortName: 'BO4',
    mapSlug: 'tag-der-toten',
    name: 'Dynamite Bomb',
    slug: 'dynamite-tdt',
    type: 'BUILDABLE',
    xpReward: 0,
    videoEmbedUrl: 'https://www.youtube.com/embed/cr69p8_cbIo',
    description:
      'Parts drop from Napalm Zombies when they are frozen on death (snowballs, Tundragun, or freezing water—they must freeze before dying). Craft at the Gangway table. Single use; rebuild for each use. Required four times total: three barricades and once for the main quest (Vril Vessel).',
    steps: [
      {
        order: 1,
        label: 'Kill Napalm Zombies while they are frozen (snowballs, Tundragun, or freezing water; they must freeze before death) to get the three parts. Craft the Dynamite at the Gangway crafting table.',
      },
      {
        order: 2,
        label: 'Barricade 1: Docks between Beach and Lighthouse Cove, next to the M1927 wall buy. Barricade 2: Facility balcony (unlocks Flinger for Heat Pack). Barricade 3: Between Sunken Path and Lagoon. Use a fourth Dynamite during the main quest to obtain the Vril Vessel.',
      },
    ],
  },
  {
    gameShortName: 'BO4',
    mapSlug: 'tag-der-toten',
    name: 'Heat Pack',
    slug: 'heat-pack-tdt',
    type: 'BUILDABLE',
    xpReward: 0,
    videoEmbedUrl: 'https://www.youtube.com/embed/XSyyHHgVKpE',
    description:
      'Equipment: move faster in freezing water and freeze slower. Requires zipline and Dynamite (Facility balcony cleared). Parts are under wooden planks; use the Facility Flinger and land on the planks (left = Frozen Crevasse near start, middle = Lagoon, right = Lighthouse Cove). Build in Specimen Storage.',
    steps: [
      {
        order: 1,
        label: 'Unlock the Facility balcony with Dynamite and use the zipline to reach the Facility. Use the Flinger and land on the wooden planks to reveal parts: left side of Flinger → Frozen Crevasse near starting room; middle → Lagoon; right → Lighthouse Cove.',
        buildableReferenceSlug: 'dynamite-tdt',
      },
      {
        order: 2,
        label: 'Collect all three parts and build the Heat Pack at the crafting table in Specimen Storage. All players can obtain it for the rest of the game.',
      },
    ],
  },
  {
    gameShortName: 'BO4',
    mapSlug: 'tag-der-toten',
    name: "Samantha's Music Box",
    slug: 'samanthas-music-box-tdt',
    type: 'BUILDABLE',
    xpReward: 0,
    videoEmbedUrl: 'https://www.youtube.com/embed/Zoa8CngCbDg',
    description:
      'Lethal grenade. Required for Salvation Lies Above. Turn on power at Human Infusion, then collect two punch cards and use them at the Vault.',
    steps: [
      {
        order: 1,
        label: 'Turn on the current at the Human Infusion. Recover one punch card in Decontamination and one in Specimen Storage.',
      },
      {
        order: 2,
        label: 'Insert both punch cards in the machine next to the desk in the Security Lobby. After a moment, retrieve them and insert one at each side of the Vault in the Human Infusion. A lockdown starts and the Vault opens; Samantha\'s Music Box is inside.',
      },
    ],
  },
  {
    gameShortName: 'BO4',
    mapSlug: 'tag-der-toten',
    name: 'Free Wunderwaffe DG-Scharfschütze',
    slug: 'free-wunderwaffe-tdt',
    type: 'BUILDABLE',
    xpReward: 0,
    videoEmbedUrl: 'https://www.youtube.com/embed/x96XajcKGro',
    description:
      'Obtain the Wunderwaffe from the Group 935 chest at the Lighthouse. Requires the Hermit\'s key from charging the Vril Device. Required for Salvation Lies Above.',
    steps: [
      {
        order: 1,
        label: 'Find an ice stalactite with a key inside (Beach, Lighthouse Station, or Lighthouse Cove). Melt it in the pot at the Forecastle to get the key.',
      },
      {
        order: 2,
        label: 'Use the key to open the safe in Specimen Storage at the Group 935 facility. The safe contains the Vril Device. Kill enemies near the device to charge it.',
      },
      {
        order: 3,
        label: 'Take the charged Vril Device to the Hermit on level 4 of the Lighthouse. He gives you the key to the Group 935 chest; open it at the Lighthouse to get the Wunderwaffe DG-Scharfschütze.',
      },
    ],
  },
  {
    gameShortName: 'BO4',
    mapSlug: 'tag-der-toten',
    name: 'Free Thundergun',
    slug: 'free-thundergun-tdt',
    type: 'BUILDABLE',
    xpReward: 0,
    videoEmbedUrl: 'https://www.youtube.com/embed/r8TLG8q2hVk?start=235',
    description:
      'Complete all of the Hermit\'s challenge totems. Go to level 4 of the Lighthouse; the Hermit gives you the key to the Ascension Group chest. Open it at the Lighthouse to retrieve the Thundergun.',
    steps: [
      {
        order: 1,
        label: 'Complete every challenge totem. Reach level 4 of the Lighthouse; the Hermit awards the key to the Ascension Group chest. Open the chest at the Lighthouse to get the free Thundergun.',
      },
    ],
  },
  {
    gameShortName: 'BO4',
    mapSlug: 'tag-der-toten',
    name: 'Free Tundragun',
    slug: 'free-tundragun-tdt',
    type: 'BUILDABLE',
    xpReward: 0,
    videoEmbedUrl: 'https://www.youtube.com/embed/r8TLG8q2hVk?start=38',
    description:
      'Throw snowballs at five targets around the map within the time limit. A chest in the Cargo Hold then opens with the Tundragun.',
    steps: [
      {
        order: 1,
        label: 'Hit all five targets with snowballs in the time limit: above the Group 935 facility door near the Loading Platform; on a wall in the Ice Grotto; near the Flinger at the Sun Deck; on the newel at level 3 of the Lighthouse; on a pillar in the Cargo Hold. The chest near the last target in the Cargo Hold opens; collect the Tundragun.',
      },
    ],
  },
  {
    gameShortName: 'BO4',
    mapSlug: 'tag-der-toten',
    name: 'Golden Snowballs',
    slug: 'golden-snowballs-tdt',
    type: 'BUILDABLE',
    xpReward: 0,
    videoEmbedUrl: 'https://www.youtube.com/embed/8D4itV6MtwY',
    description:
      'Upgrade all snowballs to Golden Snowballs (one-hit kill until round 36). Requires hitting four sock puppets, charging three blue campfires, and delivering the Hermit\'s spleen before the timer runs out.',
    steps: [
      {
        order: 1,
        label: 'Find and throw a snowball at each of the four sock puppets (each has three possible locations): Sunken Path, Sun Deck, Lighthouse, Geological Processing in the Group 935 facility.',
      },
      {
        order: 2,
        label: 'Three blue campfires appear (Beach, Boathouse, Frozen Crevasse). Charge each by killing enemies nearby.',
      },
      {
        order: 3,
        label: 'In the Human Infusion, shoot the container with the Hermit\'s spleen; the spleen falls. Pick it up (timer starts). Stay in water to slow the timer. Bring the spleen to the Hermit at the lighthouse before it spoils. He rewards you with Golden Snowballs for all players; they replace all snowballs on the map.',
      },
    ],
  },

  // ——— Tag der Toten (BO4): Music & side Easter eggs ———

  {
    gameShortName: 'BO4',
    mapSlug: 'tag-der-toten',
    name: 'A Light from the Shore (Music Easter Egg)',
    slug: 'a-light-from-the-shore-tdt',
    type: 'MUSICAL',
    xpReward: 0,
    description:
      'Instrumental by Kevin Sherwood, James McCawley, and Teemu Mäntysaari. Interact with three weapons referencing Call of the Dead: a sickle in the Ice Grotto (Sarah Michelle Gellar), a machete at the end of the Hidden Path near the Beach (Danny Trejo), and a pitchfork on the Loading Platform at the Group 935 facility (Robert Englund).',
    steps: [
      {
        order: 1,
        label: 'Interact with the sickle in the Ice Grotto, the machete at the Hidden Path near the Beach, and the pitchfork on the Loading Platform at the Group 935 facility.',
      },
    ],
  },
  {
    gameShortName: 'BO4',
    mapSlug: 'tag-der-toten',
    name: 'Reflections (Music Easter Egg)',
    slug: 'reflections-tdt',
    type: 'MUSICAL',
    xpReward: 0,
    description:
      'Interact three times with the metal door where the Ultimis crew were stuck in Call of the Dead. The song also plays during the Golden Pack-a-Punch and Salvation Lies Above easter eggs.',
    steps: [
      {
        order: 1,
        label: 'Find the metal door from Call of the Dead (where Ultimis were trapped) and interact with it three times to activate Reflections.',
      },
    ],
  },
  {
    gameShortName: 'BO4',
    mapSlug: 'tag-der-toten',
    name: 'Extra Perk (Figurines)',
    slug: 'extra-perk-figurines-tdt',
    type: 'SIDE_QUEST',
    xpReward: 0,
    description:
      'Collect five wooden figurines (one at each Pack-a-Punch when the machine is active) and place them in a suitcase by the Beach. Electric zombies spawn next round; kill all to get a free perk power-up.',
    steps: [
      {
        order: 1,
        label: 'When each Pack-a-Punch is active, collect the figurine there: Siberian musk deer at Boathouse, bird at Beach, squirrel at Lagoon, Apothicon at Sunken Path, Margwa at Golden Pack-a-Punch on the Island. Place all five in the suitcase by the Beach.',
      },
      {
        order: 2,
        label: 'On the next round, electric zombies spawn. Kill all of them; a free perk power-up appears near the suitcase.',
      },
    ],
  },
  {
    gameShortName: 'BO4',
    mapSlug: 'tag-der-toten',
    name: 'George A. Romero Tribute',
    slug: 'romero-tribute-tdt',
    type: 'SIDE_QUEST',
    xpReward: 0,
    description: 'In the Lighthouse Station, interact with the glasses on the table for 500 points and a character tribute to George A. Romero.',
    steps: [
      {
        order: 1,
        label: 'In the Lighthouse Station, interact with the pair of glasses on the table to receive 500 points and the Romero tribute.',
      },
    ],
  },
  {
    gameShortName: 'BO4',
    mapSlug: 'tag-der-toten',
    name: 'Margwa Jumpscare',
    slug: 'margwa-jumpscare-tdt',
    type: 'SIDE_QUEST',
    xpReward: 0,
    description: 'At the Forecastle, look at the paper that says "Margwa can\'t hurt you, Margwa isn\'t real" to trigger a Margwa jumpscare.',
    steps: [
      {
        order: 1,
        label: 'At the Forecastle, find and look at the paper with "Margwa can\'t hurt you, Margwa isn\'t real" written on it. A Margwa jumpscare triggers.',
      },
    ],
  },
  {
    gameShortName: 'BO4',
    mapSlug: 'tag-der-toten',
    name: 'Hermit Jumpscare',
    slug: 'hermit-jumpscare-tdt',
    type: 'SIDE_QUEST',
    xpReward: 0,
    description: 'Aim at the lighthouse light with a sniper scope; when the light passes through the scope, a Hermit face jumpscare triggers.',
    steps: [
      {
        order: 1,
        label: 'Use a sniper scope and aim at the lighthouse light. When the light passes through the scope, the Hermit jumpscare triggers.',
      },
    ],
  },
  {
    gameShortName: 'BO4',
    mapSlug: 'tag-der-toten',
    name: 'Secret Area (Mars / Shangri-La)',
    slug: 'secret-area-mars-tdt',
    type: 'SIDE_QUEST',
    xpReward: 0,
    description:
      'From the Outer Walkway, crouch and approach the back left corner of the Flinger from the left side, then spin clockwise to be flung to a secret area. Swim through the tunnel (Heat Pack and Ice Pick reward recommended). Mars is in the background; Shangri-La loading music plays. References the fan theory that Shangri-La was on Mars.',
    steps: [
      {
        order: 1,
        label: 'On the Outer Walkway, crouch and approach the back left corner of the Flinger from the left. Start spinning clockwise to be flung to the secret area. Swim through the long tunnel (Heat Pack and Ice Pick help). The area has Mars in the background and Shangri-La loading music.',
        buildableReferenceSlug: 'heat-pack-tdt',
      },
    ],
  },
  {
    gameShortName: 'BO4',
    mapSlug: 'tag-der-toten',
    name: 'Freeze Mode',
    slug: 'freeze-mode-tdt',
    type: 'SIDE_QUEST',
    xpReward: 0,
    description:
      'Freeze completely (use melee to free yourself) in each of the 10 water locations. A button then appears in spawn; pressing it locks all players in spawn. Samantha says "Don\'t freeze!"; players must sprint or slowly freeze. When the round ends, the game jumps to Round 200 onwards.',
    steps: [
      {
        order: 1,
        label: 'Freeze completely in all 10 water locations (any order): Docks, Frozen Crevasse, Lagoon, Ice Grotto, Lighthouse Cove, Cargo Hold, Hidden Path, Beach, Artifact Storage, Sunken Path. Use melee to free yourself each time.',
      },
      {
        order: 2,
        label: 'A button appears in spawn near a chunk of ice. Press it; all players are locked in spawn. Samantha says "Don\'t freeze!"—sprint to avoid freezing. When the round ends, the game jumps to Round 200+.',
      },
    ],
  },

  // ——— Nuketown Zombies (BO2): Easter eggs ———

  {
    gameShortName: 'BO2',
    mapSlug: 'nuketown-zombies',
    name: 'Richtofen TV Transmission',
    slug: 'richtofen-tv-nuketown',
    type: 'SIDE_QUEST',
    xpReward: 0,
    description:
      'Richtofen can be heard transmitting from Moon on a television in one of the houses. The transmission indicates that the events in Nuketown and Moon are happening at the same time.',
    steps: [
      {
        order: 1,
        label: 'Listen for Richtofen\'s audio quotes from the television in one of the houses. The transmission is from Moon.',
      },
    ],
  },
  {
    gameShortName: 'BO2',
    mapSlug: 'nuketown-zombies',
    name: 'Marlton in the Bunker',
    slug: 'marlton-bunker-nuketown',
    type: 'SIDE_QUEST',
    xpReward: 0,
    description:
      'Marlton Johnson (Victis, TranZit/Die Rise/Buried) can be heard hiding inside a bunker. According to the timeline, he survives the Moon rocket by hiding there. His quotes are reused from TranZit.',
    steps: [
      {
        order: 1,
        label: 'Use a knife attack on the fallout shelter door to hear Marlton\'s quotes from inside the bunker.',
      },
    ],
  },
  {
    gameShortName: 'BO2',
    mapSlug: 'nuketown-zombies',
    name: 'TranZit Bus Horn',
    slug: 'tranzit-bus-horn-nuketown',
    type: 'SIDE_QUEST',
    xpReward: 0,
    description:
      'The horn of the TranZit bus can be heard on round 5. According to the timeline, Russman stole the bus from an abandoned Broken Arrow facility.',
    steps: [
      {
        order: 1,
        label: 'On round 5, listen for the TranZit bus horn.',
      },
    ],
  },
  {
    gameShortName: 'BO2',
    mapSlug: 'nuketown-zombies',
    name: "Samantha's Lullaby (Music Easter Egg)",
    slug: 'samanthas-lullaby-nuketown',
    type: 'MUSICAL',
    xpReward: 0,
    description: 'Activate the three teddy bears scattered around the map to play Samantha\'s Lullaby.',
    steps: [
      {
        order: 1,
        label: 'Find and activate all three teddy bears around the map. Samantha\'s Lullaby will play.',
      },
    ],
  },
  {
    gameShortName: 'BO2',
    mapSlug: 'nuketown-zombies',
    name: 'Coming Home 8-bit (Music Easter Egg)',
    slug: 'coming-home-8bit-nuketown',
    type: 'MUSICAL',
    xpReward: 0,
    description: 'Shoot all the heads off of the mannequins on the map to play an 8-bit version of Coming Home.',
    steps: [
      {
        order: 1,
        label: 'Shoot off every mannequin head on the map. An 8-bit version of Coming Home will play.',
      },
    ],
  },
  {
    gameShortName: 'BO2',
    mapSlug: 'nuketown-zombies',
    name: 'Pareidolia & Re-Damned 8-bit (Music Easter Egg)',
    slug: 'pareidolia-redamned-nuketown',
    type: 'MUSICAL',
    xpReward: 0,
    description:
      'Take a power-up from the power-up shed while the population counter reads 15 to play 8-bit versions of Pareidolia and Re-Damned.',
    steps: [
      {
        order: 1,
        label: 'When the population counter reads 15, take a power-up from the power-up shed. An 8-bit version of Pareidolia and Re-Damned will play.',
      },
    ],
  },

  // ——— Merged from in-progress (BOCW, BO6, BO7) ———

  // ——— Die Maschine (BOCW): Main Quest ———

  {
    gameShortName: 'BOCW',
    mapSlug: 'die-maschine',
    name: 'Seal the Deal',
    slug: 'seal-the-deal',
    type: 'MAIN_QUEST',
    xpReward: 5000,
    videoEmbedUrl: 'https://www.youtube.com/embed/zr2_6D8iIew',
    description:
      'Close the rift at Projekt Endstation. Requires the Decompressive Isotopic Estrangement Machine (D.I.E.) and all four ammo variants; Electrobolt and Thermophasic are locked until the Der Wechsler terminal is unlocked via the Aetherscope and Vogel diary steps.',
    rewardsDescription: 'Seal the Deal achievement/trophy (30 G); Evil Unleashed Dark Ops (5,000 XP on first completion); ending cutscene.',
    steps: [
      {
        order: 1,
        label:
          'After the cyclotron is reactivated and Pack-a-Punch is built, a Dark Aether rift opens. Enter it and collect the three Aetherscope parts (spawn locations random each match): Antenna in the Yard; Middle Section in the Crash Site; Bottom Section in the Particle Accelerator. Plaguehounds spawn near each part. Craft the Aetherscope at the table behind Pack-a-Punch in the Particle Accelerator. Weaver gives new orders to shut down the cyclotron.',
        buildableReferenceSlug: 'aetherscope-die-maschine',
      },
      {
        order: 2,
        label:
          'A rift opens in the Medical Bay. The terminal there requires a password. Enter the rift and pick up Ulrich Vogel\'s diary from the table. A spectral reflection of Vogel appears near the sink; interact to materialize him, then interact again to give his diary and hear his entry. The Megaton Overlord (Mayak) can spawn while anyone is in the Dark Aether. When Vogel finishes, he dematerializes and a new anomaly appears (Control Room, then by the Aetherscope table). With Vogel\'s completed diary, the Der Wechsler terminal is unlocked.',
      },
      {
        order: 3,
        label:
          'Power Der Wechsler: the holding tank is online but needs power. Facing Speed Cola, shoot the right leg with Electrobolt and the left with Cryo-Emitter; on the other side, right leg with NOVA-5 and left with Thermophasic. The start-up continues but the Decontamination Agent is missing.',
      },
      {
        order: 4,
        label:
          'A rift opens between Medical Bay and Particle Accelerator. Enter and interact with the anomaly by where the Decontamination Agent should be; a spectral reflection shows Soviet soldiers Dmitriyev and Kalashnik stealing it. All players are pulled out and a Dark Aether Wrench appears. Use the wrench on the broken tank in the Yard three times until a zombie pops the hatch; kill it, throw an explosive at the hatch so the tank fires and knocks over a tree, dropping the Decontamination Agent. Pick it up (you cannot fire or melee while holding it); return it to Der Wechsler to complete the cycle.',
      },
      {
        order: 5,
        label:
          'Lead a Megaton Bomber and a Megaton Blaster under Der Wechsler so both are captured. Start the decontamination process at the terminal. All players must be in the Medical Bay Observation Room; the room locks down, all zombies die, and the split Megatons merge into Orlov. Orlov breaks containment and escapes; Plaguehounds spawn.',
      },
      {
        order: 6,
        label:
          'A final rift opens in the Living Room. In the Dark Aether, find the anomaly by the 1911 wall buy—Orlov with a photo of his wife and child. After his muse, you are forced out and the photograph appears there. Picking it up teleports all players to the cyclotron with a passive Orlov.',
      },
      {
        order: 7,
        label:
          'Orlov allies with Requiem and shuts down three cyclotron systems. Mayak, Megatons, Plaguehounds, Zombies and Heavy Zombies spawn; only Zombies and Heavies interrupt Orlov. After the third system, Orlov tells the team to leave; he finishes the job. Weaver calls Exfil; blue energy pillars close off sections (25 damage per tick, instant down through center). Reach the exfil chopper within the timer; completing exfil awards the achievement and ending cutscene.',
      },
    ],
  },

  // ——— Die Maschine (BOCW): Buildables ———

  {
    gameShortName: 'BOCW',
    mapSlug: 'die-maschine',
    name: 'Aetherscope',
    slug: 'aetherscope-die-maschine',
    type: 'BUILDABLE',
    xpReward: 0,
    videoEmbedUrl: 'https://www.youtube.com/embed/BcC0aSrjNY8',
    description:
      'Portable scanner for studying the Dark Aether; reveals Spectral Reflections. Required for Seal the Deal. Build after power is on, cyclotron reactivated, and Pack-a-Punch built.',
    steps: [
      {
        order: 1,
        label: 'Once Pack-a-Punch is built, a Dark Aether rift appears in Power. Enter and collect three parts (random locations each match): Antenna in the Yard; Middle Section in the Crash Site; Bottom Section in the Particle Accelerator. Plaguehounds spawn near each part.',
      },
      {
        order: 2,
        label: 'Craft the Aetherscope at the unique table on the bottom floor of the Particle Accelerator, behind the Pack-a-Punch machine.',
      },
    ],
  },
  {
    gameShortName: 'BOCW',
    mapSlug: 'die-maschine',
    name: 'D.I.E. Machine (Free)',
    slug: 'die-machine-free',
    type: 'BUILDABLE',
    xpReward: 0,
    videoEmbedUrl: 'https://www.youtube.com/embed/-zDjqzDkRkg',
    description:
      'Obtain the Decompressive Isotopic Estrangement Machine for free via the Keycard and D.I.E. Remote. Also available from the Mystery Box, Legendary Trials, or the Coffin Dance Easter egg.',
    steps: [
      {
        order: 1,
        label: 'Kill a Megaton to get a Keycard. In the Weapon Lab, use the Keycard on the locked cabinet to get the D.I.E. Remote; it emits a signal when near the D.I.E. Machine.',
      },
      {
        order: 2,
        label: 'In the Living Room (derelict bunker), find the locked room with a hole in the wall where the D.I.E. Machine is visible. Interact through the hole to start its alternate fire. Lead zombies near the room to charge it; when the Remote notifies you, interact through the hole again to make it fire, destroying the door. Pick up the D.I.E. Machine.',
      },
    ],
  },
  {
    gameShortName: 'BOCW',
    mapSlug: 'die-maschine',
    name: 'D.I.E. Cryo-Emitter',
    slug: 'die-cryo-emitter',
    type: 'BUILDABLE',
    xpReward: 0,
    videoEmbedUrl: 'https://www.youtube.com/embed/Hp38dhelVls',
    description:
      'Ammo variant: continuous liquid-nitrogen stream that slows and freezes zombies. Capacitor is in a chained box in the Medical Lab opposite the Dark Aether portal. Chains break by freezing them with a collected liquid.',
    steps: [
      {
        order: 1,
        label: 'Have a Megaton or split variant attack the fungus-covered tree between the Pond and Crash Site with a radioactive attack; it mutates and produces a freezing liquid. Get the beaker from a crate on the Penthouse ledge (opposite Der Wunderfizz); shoot the crate with the D.I.E. Shockwave so it falls and breaks. Place the beaker under the fungus to collect the liquid.',
      },
      {
        order: 2,
        label: 'Take the filled beaker to the chained box in the Medical Lab and interact to freeze and shatter the chains. Open the box and take the Cryo-Emitter capacitor.',
      },
    ],
  },
  {
    gameShortName: 'BOCW',
    mapSlug: 'die-maschine',
    name: 'D.I.E. NOVA-5',
    slug: 'die-nova-5',
    type: 'BUILDABLE',
    xpReward: 0,
    videoEmbedUrl: 'https://www.youtube.com/embed/mRWEZQVtwNk',
    description:
      'Ammo variant: grenade-launcher shot that releases a NOVA-5 cloud. Capacitor is in a vined box at the Crash Site, against the wall toward the pond from the plane cockpit. Vines are destroyed with toxic gas.',
    steps: [
      {
        order: 1,
        label: 'Find the empty canister behind rubble on a desk on the 2nd floor of the Bunker ruins. Use the D.I.E. Shockwave vacuum to pull it to you. Place the canister to the right of Deadshot Daiquiri; kill a Plaguehound next to it so the machine sucks up the gas. Collect the filled canister.',
      },
      {
        order: 2,
        label: 'Take the canister to the vined box at the Crash Site and place it on top; shoot the canister to destroy it and the vines. Open the box and take the NOVA-5 capacitor.',
      },
    ],
  },
  {
    gameShortName: 'BOCW',
    mapSlug: 'die-maschine',
    name: 'D.I.E. Electrobolt',
    slug: 'die-electrobolt',
    type: 'BUILDABLE',
    xpReward: 0,
    videoEmbedUrl: 'https://www.youtube.com/embed/RsDIXz05fgE',
    description:
      'Ammo variant: energy beam that shocks enemies. Requires building the Aetherscope, grabbing Vogel\'s diary at the Der Wechsler terminal, and interacting with Vogel in three locations (Seal the Deal steps). An anomaly for Electrobolt spawns below Pack-a-Punch.',
    steps: [
      {
        order: 1,
        label: 'Complete the Aetherscope and Vogel diary steps from Seal the Deal so the Electrobolt anomaly appears below Pack-a-Punch. Enter the anomaly.',
      },
      {
        order: 2,
        label: 'Find three orange crystals (any order): behind Der Wunderfizz at Penthouse; above the obstruction between Crash Site and Tunnel, right wall before facility entrance; at the Pond on the right toward the facility. Use the D.I.E. secondary to suck each crystal\'s energy (weapon must be Shockwave variant). Take the energy to the crate at the far back right below Pack-a-Punch and shoot the crate to power it. When all three bulbs are lit, open the box and take the Electrobolt capacitor.',
      },
    ],
  },
  {
    gameShortName: 'BOCW',
    mapSlug: 'die-maschine',
    name: 'D.I.E. Thermophasic',
    slug: 'die-thermophasic',
    type: 'BUILDABLE',
    xpReward: 0,
    videoEmbedUrl: 'https://www.youtube.com/embed/u7CE-r2j7Cg',
    description:
      'Ammo variant: plasma blast that burns targets. Requires Aetherscope and Vogel diary steps. The Thermophasic anomaly spawns between the Pond and Crash Site. Need a fuse from the Crash Site cockpit and the laser cutter in Dark Aether.',
    steps: [
      {
        order: 1,
        label: 'After Aetherscope and Vogel steps, 10 waves after first entering Dark Aether (or in altered Dark Aether), the Crash Site cockpit rises with a fast travel. Open the fuse box (shoot or melee) and take the undamaged fuse.',
      },
      {
        order: 2,
        label: 'Enter the Thermophasic anomaly. The Laser Cutter spawns opposite Deadshot Daiquiri. Place the fuse to turn it on; it cuts the crate then forces you out. The capacitor crate is on a broken truck in the Pond, on the truck bed. Open it to take the Thermophasic capacitor.',
      },
    ],
  },
  {
    gameShortName: 'BOCW',
    mapSlug: 'die-maschine',
    name: 'Coffin Dance (Free Juggernog & Crate)',
    slug: 'coffin-dance-die-maschine',
    type: 'BUILDABLE',
    xpReward: 0,
    videoEmbedUrl: 'https://www.youtube.com/embed/ePjd7BUDN10',
    description:
      'After Pack-a-Punch is built, shoot five blue orbs in the Particle Accelerator to trigger a Dark Aether dance. On return, a loot crate appears with guaranteed free Juggernog and a high chance for a Ray Gun and other gear.',
    steps: [
      {
        order: 1,
        label: 'Turn on power and build Pack-a-Punch in the Particle Accelerator. Shoot all five blue orbs: under the PaP (broken barrier); on the grate upstairs opposite PaP; behind the chair when looking up the stairs from the machine; on the elevated ring on the wall; under the stairs near the armor station.',
      },
      {
        order: 2,
        label: 'You are pulled into the Dark Aether to watch zombies dancing with a crate. After returning, the crate appears in front of Pack-a-Punch. Open it for free Juggernog and possible Ray Gun or other rewards.',
      },
    ],
  },

  // ——— Die Maschine (BOCW): Music ———

  {
    gameShortName: 'BOCW',
    mapSlug: 'die-maschine',
    name: 'Alone (Music Easter Egg)',
    slug: 'alone-die-maschine',
    type: 'MUSICAL',
    xpReward: 0,
    description:
      'Song by Kevin Sherwood, sung by Clark S. Nova. Activate by interacting with three cassette tapes across the map.',
    steps: [
      {
        order: 1,
        label: 'Living Room: in the broken refrigerator to the right of the sofa.',
      },
      {
        order: 2,
        label: 'Particle Accelerator: in the area beneath Pack-a-Punch, to the far right next to a blood-splattered tower, on top of a machine.',
      },
      {
        order: 3,
        label: 'Medical Bay: on the shelf to the right of the pill cabinets, opposite the computer terminal.',
      },
    ],
  },

  // ——— Die Maschine (BOCW): Misc / Side Easter eggs ———

  {
    gameShortName: 'BOCW',
    mapSlug: 'die-maschine',
    name: 'Round 45 Dark Aether Creature',
    slug: 'round-45-creature-die-maschine',
    type: 'SIDE_QUEST',
    xpReward: 0,
    description:
      'At round 45, a creature can be seen in the Dark Aether walking through the forest, knocking down trees; the screen shakes. If you stay in the Particle Accelerator room in the Dark Aether for 115 seconds or 115 zombie kills, you hear stomping above; when it stops, a free Max Ammo drops in the pond.',
    steps: [
      {
        order: 1,
        label: 'Reach round 45 and enter the Dark Aether to see the creature. For the Max Ammo: stay in the Particle Accelerator area in the Dark Aether for 115 seconds or 115 kills; after the stomping stops, claim the free Max Ammo in the pond.',
      },
    ],
  },
  {
    gameShortName: 'BOCW',
    mapSlug: 'die-maschine',
    name: 'Medical Bay Skeletal Hand (Legendary Upgrade)',
    slug: 'medical-bay-hand-die-maschine',
    type: 'SIDE_QUEST',
    xpReward: 0,
    description:
      'In the Dark Aether, shoot four buttons in the window behind Speed Cola at the Medical Bay. A skeletal hand appears and reaches out. If the hand grabs and kills 15 zombies from the window, you receive a free upgrade that turns your equipped weapon into a Legendary.',
    steps: [
      {
        order: 1,
        label: 'Enter the Dark Aether and go to the Medical Bay. Shoot the four buttons in the window behind Speed Cola. The skeletal hand appears; lure zombies so the hand kills 15. Your equipped weapon is upgraded to Legendary.',
      },
    ],
  },
  {
    gameShortName: 'BOCW',
    mapSlug: 'die-maschine',
    name: 'Five Floating Zombies (Free Scorestreak)',
    slug: 'five-floating-zombies-die-maschine',
    type: 'SIDE_QUEST',
    xpReward: 0,
    description:
      'In the Dark Aether, shoot five floating zombies across the map to spawn a free scorestreak. Standing under the final zombie can trigger a jumpscare. The same jumpscare can sometimes occur when getting the Ray Gun from the Mystery Box.',
    steps: [
      {
        order: 1,
        label: 'Enter the Dark Aether and shoot all five floating zombies. A free scorestreak spawns. Standing under the last zombie may cause a jumpscare.',
      },
    ],
  },
  {
    gameShortName: 'BOCW',
    mapSlug: 'die-maschine',
    name: 'Three Satellites (Dead Wire)',
    slug: 'three-satellites-die-maschine',
    type: 'SIDE_QUEST',
    xpReward: 0,
    description:
      'Shoot three satellites outside the map with a weapon that has Dead Wire, making them point toward Nacht der Untoten. 1,500 Zombie Essence spawn at the Penthouse and the code "345834825" is repeated.',
    steps: [
      {
        order: 1,
        label: 'Use a weapon with Dead Wire to shoot the three satellites so they point toward Nacht der Untoten. Collect 1,500 Essence at the Penthouse; the code 345834825 plays.',
      },
    ],
  },

  // ——— Firebase Z (BOCW): Main Quest ———

  {
    gameShortName: 'BOCW',
    mapSlug: 'firebase-z',
    name: 'Maxis Potential',
    slug: 'maxis-potential',
    type: 'MAIN_QUEST',
    xpReward: 5000,
    videoEmbedUrl: 'https://www.youtube.com/embed/GF7mdkdCO3E',
    description:
      'Rescue Samantha Maxis from the Dark Aether by forcing Doctor William Peck to reveal the steps via his truth serum. Requires all three Aether Reactors to be activated and the RAI K-84 wonder weapon.',
    rewardsDescription: 'Maxis Potential Dark Ops; ending cutscene. Prepare fully before starting the OPC cinematic—you cannot return to Firebase Z (Wunderfizz, ammo, armory, and crafting table remain in OPC).',
    steps: [
      {
        order: 1,
        label:
          'In the Atrium, interact with Sergei Ravenov to begin. After activating the Aether Reactors, interact with William Peck, then return to Ravenov for his ID Badge. Collect three compounds: Compound S16 in a locker at Equipment Storage; Compound 36 at Engineering; Compound P65 at the Colonel\'s Office. At Field Hospital, use the Chemical Mixer to combine them into the truth serum (Hellhounds spawn—kill them), then interact again to transfer to the Gas Dispersal Device and obtain the Agent Delivery System. At OPC, attach it to the Air Conditioner to disperse the serum into Peck\'s room.',
      },
      {
        order: 2,
        label:
          'Interact with Peck again after the sequence. Go to the Data Center and interact with the Memory Transference Station to unlock it; equip an Essence Trap from the four available. Find Mimics disguised as loot (extra fake loot nearby; locations: Peck\'s Bedroom in the village, Motor Pool, Military Command). Damage a Mimic until near death, throw the Essence Trap to capture it, and return the trap to the Memory Transference Station within three minutes. Repeat until a Floppy Disk is dispensed (each return plays a short Omega Group narrative).',
      },
      {
        order: 3,
        label:
          'At Planning Offices, insert the Floppy Disk into the Quantum Main Frame to open the door to OPC. Enter OPC and spawn the dimensional breach. The PA will request stabilization; interact with Peck again. After the sequence, Ravenov gives a code for the locker left of Peck\'s office. Unlock it and take the Aethermeter.',
      },
      {
        order: 4,
        label:
          'At Scorched Defense, get the shovel from the left-side bunker. Dig up three Aether Containers: (1) Open Lot, near the Planning Offices window—multiple containers spawn; the one without black particles is correct (wrong one spawns Mimics, wait a round to retry). (2) Near the end of Jungle Defense—a dome surrounds you; survive until it closes to collect the crystal. (3) Barracks, near Field Hospital—the container moves when approached; use the RAI K-84\'s GP-6K2 to stop it and collect the crystal. Insert all three crystals into the Aether Reactors.',
        buildableReferenceSlug: 'rai-k-84-firebase-z',
      },
      {
        order: 5,
        label:
          'At Planning Offices, interact with the Computer to realign the Satellite Dish. Move the marker over each yellow dot to reveal satellite info in the bottom-right. Find the Requiem satellite (question mark) and interact to confirm alignment. When ready (Pack-a-Punch, perks, equipment), go to OPC to start the cinematic—Samantha escapes the Dark Aether; you return to the village and fight the Orda (Elder God). Defeat the Orda to complete the quest and trigger the ending cutscene.',
      },
    ],
  },

  // ——— Firebase Z (BOCW): Buildables ———

  {
    gameShortName: 'BOCW',
    mapSlug: 'firebase-z',
    name: 'RAI K-84',
    slug: 'rai-k-84-firebase-z',
    type: 'BUILDABLE',
    xpReward: 0,
    videoEmbedUrl: 'https://www.youtube.com/embed/TQJV_81R15k',
    description:
      'Wonder weapon: assemble the blueprint and three parts at the workbench next to Dimitri Kuhlklay\'s computer in the Weapon Lab. Also available from the Mystery Box or as a Legendary Trials reward.',
    steps: [
      {
        order: 1,
        label: 'In the Weapon Lab, take the RAI K-84 blueprint from the wall above the workbench. Ravenov tells you to get a key from Doctor Kuhlklay.',
      },
      {
        order: 2,
        label: 'At Scorched Defense, find Kuhlklay\'s zombified body by a burning vehicle. Rip out his left eye (prompt); zombies ignore you briefly. Stab him when he awakens. Take the eye to the Weapon Lab and place it in the retina scanner by Kuhlklay\'s computer; a drawer opens with the locker key.',
      },
      {
        order: 3,
        label: 'Use the locker key on lockers in the two Barracks past the Helipad. A Mimic spawns; kill it to get the Barrel Assembly (or open more lockers for another Mimic with the part).',
      },
      {
        order: 4,
        label: 'At Kuhlklay\'s computer, interact to see a circular chart with a section stopping at three positions. Memorize them; they match positions on the dart board next to Der Wunderfizz in the village. Shoot those three positions on the dart board, then shoot the center to open a compartment and collect the Aetherium Converter.',
      },
      {
        order: 5,
        label: 'Kill a Mangler by destroying its arm cannon while it is charging an attack to get an Uncharged Power Cell. Place it in the charging slot to the right of the Arsenal machine in the Weapon Lab; wait a couple of rounds to get the Charged Power Cell.',
      },
      {
        order: 6,
        label: 'Assemble the RAI K-84 at the workbench to the left of Kuhlklay\'s computer.',
      },
    ],
  },
  {
    gameShortName: 'BOCW',
    mapSlug: 'firebase-z',
    name: 'Floating Bunny (Free Juggernog & Crate)',
    slug: 'floating-bunny-firebase-z',
    type: 'BUILDABLE',
    xpReward: 0,
    videoEmbedUrl: 'https://www.youtube.com/embed/FYx3n0_Htko?start=29',
    description:
      'After all three Aether Reactors are activated, a stuffed bunny on the second floor of the Atrium (blocked balcony facing the courtyard) levitates when stared at, freezes the player, and warps them to a darkened forest. Shoot the pink glowing bunny three times (it teleports; the third is in a crate). The crate contains guaranteed Juggernog and a large selection of rewards.',
    steps: [
      {
        order: 1,
        label: 'With all three Aether Reactors on, go to the second floor of the Atrium and find the stuffed bunny at the end of the blocked balcony facing the courtyard. Stare at it for a few seconds.',
      },
      {
        order: 2,
        label: 'The bunny levitates and flies at you, freezing you and warping you to a dark forest. Find the pink glowing bunny in the distance and shoot it (it teleports). Shoot it a second time, then a third—the third spawns inside a crate. Open the crate for guaranteed Juggernog and other rewards.',
      },
    ],
  },

  // ——— Firebase Z (BOCW): Music ———

  {
    gameShortName: 'BOCW',
    mapSlug: 'firebase-z',
    name: 'Lost (Music Easter Egg)',
    slug: 'lost-firebase-z',
    type: 'MUSICAL',
    xpReward: 0,
    videoEmbedUrl: 'https://www.youtube.com/embed/FYx3n0_Htko?start=388',
    description:
      'Song by Julie Nathanson (Samantha\'s voice). Activate by collecting three cassette tapes hidden around the map.',
    steps: [
      {
        order: 1,
        label: 'Scientist Quarters: on a wooden shelf by the stairs that lead down to the Arsenal machine.',
      },
      {
        order: 2,
        label: 'Equipment Storage: on a shelf to the left of the locked metal cabinet.',
      },
      {
        order: 3,
        label: 'Motor Pool Office: on the floor between a desk and a green filing cabinet.',
      },
    ],
  },

  // ——— Firebase Z (BOCW): Misc / Side Easter eggs ———

  {
    gameShortName: 'BOCW',
    mapSlug: 'firebase-z',
    name: 'Zombified Head & Safe Combination',
    slug: 'head-safe-combo-firebase-z',
    type: 'SIDE_QUEST',
    xpReward: 0,
    videoEmbedUrl: 'https://www.youtube.com/embed/FYx3n0_Htko?start=95',
    description:
      'A zombified head can spawn at various points on the map. Take it to Field Hospital and place it in an empty testing stand. Power the stand by connecting an Essence Trap (with any zombie trapped) to the stand. The head reanimates, speaks a number combination, then explodes. Use the combination on the safe in Lev Kravchenko\'s office for a Perk-a-Cola, Intel, and a pack of Hellhounds.',
    steps: [
      {
        order: 1,
        label: 'Find a zombified head and take it to Field Hospital. Place it in one of the empty testing stands. Trap a zombie in an Essence Trap and connect the trap to the stand to power it. The head reanimates and states the safe combination before exploding.',
      },
      {
        order: 2,
        label: 'Go to Lev Kravchenko\'s office and enter the combination on the safe. Open it for a Perk-a-Cola, Intel, and Hellhounds.',
      },
    ],
  },
  {
    gameShortName: 'BOCW',
    mapSlug: 'firebase-z',
    name: 'Dance Pad (Free Jump Pads)',
    slug: 'dance-pad-firebase-z',
    type: 'SIDE_QUEST',
    xpReward: 0,
    videoEmbedUrl: 'https://www.youtube.com/embed/FYx3n0_Htko?start=280',
    description:
      'After all Aether Reactors are restored, a glowing green button appears on one of the jump pads. Shooting it turns the pad into a dance pad with five directional prompts. Complete the movements on the pad to be launched; the landing area has one pad with the green button. Complete the process on all six jump pads to reduce jump pad cost to 0 for the rest of the match. Failing requires waiting until the next round to retry.',
    steps: [
      {
        order: 1,
        label: 'With all three Aether Reactors restored, find the jump pad with the glowing green button and shoot it. Five directional prompts appear on the pad\'s screen; perform the movements while staying on the pad to be launched. At the destination, find the pad with the green button and repeat. Complete all six pads to make jump pads free for the rest of the match.',
      },
    ],
  },
  {
    gameShortName: 'BOCW',
    mapSlug: 'firebase-z',
    name: 'Monkey Bomb Upgrade',
    slug: 'monkey-bomb-upgrade-firebase-z',
    type: 'SIDE_QUEST',
    xpReward: 0,
    videoEmbedUrl: 'https://www.youtube.com/embed/FYx3n0_Htko?start=246',
    description:
      'Get 50 kills with the Monkey Bomb in the Data Center, Mission Control, or Military Command. The Monkey Bomb upgrades: red pulse every few seconds, different music, zombies dance around it, increased damage. The upgrade lasts the entire match (or until exfil/death) and persists if you grab or craft a new Monkey Bomb.',
    steps: [
      {
        order: 1,
        label: 'Use the Monkey Bomb in Data Center, Mission Control, or Military Command until you have 50 kills with it. The bomb upgrades and keeps the upgrade for the rest of the match.',
      },
    ],
  },
  {
    gameShortName: 'BOCW',
    mapSlug: 'firebase-z',
    name: 'Pet the Hellhound',
    slug: 'pet-hellhound-firebase-z',
    type: 'SIDE_QUEST',
    xpReward: 0,
    videoEmbedUrl: 'https://www.youtube.com/embed/FYx3n0_Htko?start=222',
    description:
      'A small interaction: the player can pet a Hellhound in a specific location on the map.',
    steps: [
      {
        order: 1,
        label: 'Find the Hellhound in the designated spot and interact to pet it.',
      },
    ],
  },

  // ——— Outbreak (BOCW): Main Quests ———
  // Outbreak is open-world; quests start at warp tier 3+ and span multiple regions.

  {
    gameShortName: 'BOCW',
    mapSlug: 'outbreak',
    name: 'Ravenov Implications',
    slug: 'ravenov-implications',
    type: 'MAIN_QUEST',
    xpReward: 4500,
    videoEmbedUrl: 'https://www.youtube.com/embed/5-_C_GBHT_4',
    description:
      'First Outbreak main quest. Help Samantha Maxis and locate Sergei Ravenov to launch Omega\'s Reality Inversion Warheads away from the West. Requires warp tier 3 minimum. A radio (unmarked) spawns in a region; tune three nearby amplifiers to match it, then collect the Beacon Listening Device and attach it to the extraction beacon.',
    rewardsDescription: 'Ravenov Implications Dark Ops; "Grey" and "Strauss" emblems (with The Pact).',
    steps: [
      {
        order: 1,
        label: 'Reach warp tier 3. Find the quest radio in a region (resembles Unknown Signal but unmarked). Activate it and tune the three nearby amplifiers to the radio\'s frequency (zombies may spawn on certain frequencies). Interact with the radio to get Essence Drops and the Beacon Listening Device. Attach it to the extraction beacon. Use "Call" to contact Maxis; she sends you to meet Ravenov.',
      },
      {
        order: 2,
        label: 'In the next region, find Ravenov\'s dead drop (his mark). Shoot Cymbal Monkey statues in fixed locations—one has an M engraving and drops a Microfilm. Find the slide projector (one fixed location per region; Ruka has none—warp to the next region). Interact with the projector; Maxis notes the missile silos in Ruka. The next warp sends you to Ruka.',
      },
      {
        order: 3,
        label: 'In Ruka, go to the missile silos and enter an elevator shaft (dead bodies nearby are Ravenov\'s "calling card"). Head underground, find the computer to shut off the base alarm, then trigger the cutscene with Ravenov. He tells you to find the three launch keys for the missile silos.',
      },
      {
        order: 4,
        label: 'Get the three keys (any order). Silo A: spectral monkey near a vent—get the modified Essence Trap from the dead end at the bottom, throw it near the monkey, activate to capture it; key remains. Silo B: activate the Aetherium containment unit, shoot crystals in the silo to drop shards, collect 20 and deposit (zombies and Tempests spawn); take the canister to Silo D, use its field upgrade near the giant Dark Aether jellyfish to be pulled in and grab the key. Silo C: path sealed; corpse by the door holds the key but transforms into an HVT Mimic—kill it for the key. Activate the three silos in the order shown by the green lights at each computer (A, B, D randomized); 45 seconds between each or system times out. After the 3rd activation, a 9-minute timer starts—head up and out.',
      },
      {
        order: 5,
        label: 'Outside, fight Legion (massive Tempest with crystal blockades). No crafting, PaP, or armor stations here—prepare beforehand. Legion creates damaging zones and teleports between silo doors; zombies spawn. Shoot Legion\'s glowing chest to stun it; three orbs appear—destroy each to remove a third of its health. Repeat twice more to defeat Legion and complete the quest.',
      },
    ],
  },
  {
    gameShortName: 'BOCW',
    mapSlug: 'outbreak',
    name: 'Entrapment',
    slug: 'entrapment-outbreak',
    type: 'MAIN_QUEST',
    xpReward: 4500,
    description:
      'Second Outbreak main quest. Locate and exfil the defecting Omega scientists ("The Omega Eight"). Requires warp tier 3. A red Phase Wall Tear appears (not in Sanatorium); enter three times (Ravenov contacts, then ejects you to another tear) to receive the Beacon Listening Device. Use "Respond" to contact Ravenov; warp sends you to a unique Sanatorium for the quest.',
    rewardsDescription: 'Entrapment Dark Ops; "Raptor One" and "Weaver" emblems (with The Pact).',
    steps: [
      {
        order: 1,
        label: 'Reach warp tier 3. Find the red Phase Wall Tear in any region except Sanatorium. Enter it three times (each time Ravenov tries to contact you and you are ejected toward another tear). On the third ejection you receive the Beacon Listening Device. Use "Respond" on the beacon; Ravenov says the defectors are at Sanatorium. Warp to the quest version of Sanatorium.',
      },
      {
        order: 2,
        label: 'Ravenov explains the defectors never arrived at the rendezvous. Find the crashed transport chopper in "Carved Hills" (south of the lone shack). Clear the horde; a corpse has a message from Hugo Jager—survivors went to "Monument Hill" using an Omega device. They left components for an improvised version so you can traverse the Phase safely.',
      },
      {
        order: 3,
        label: 'Build the Aetherium Neutralizer: on the Bridge is a modified Requiem Recon Rover; it needs an Aetherium Orb (darker red, no Essence when damaged; damages three times then flees to hover over the Rover) and "bait." At a broken Mystery Box spawn, grab the Aetherium Rabbit plush—it rises and a horde spawns; defeat the horde to get loot and the Rabbit as a temporary Field Upgrade. Place the Rabbit in the Rover\'s cage; the Orb enters the cage and a message from Jager says remaining scientists are at the top of the Monument.',
      },
      {
        order: 4,
        label: 'Activate the Aetherium Neutralizer on the Rover to start it moving toward Monument Hill (like Escort, no rifts). Defend it until it reaches the base of Monument Hill (outside the Phase); it deactivates and self-destructs. Weaver prepares exfil.',
      },
      {
        order: 5,
        label: 'On the roof are the remains of five Omega scientists, burnt Aetherium Neutralizer blueprints, and a final message from Hugo Jager: Kravchenko set the trap; Jager was the mole. He poisoned the pilot (causing the crash) and killed the scientists. A feedback loop on the tape summons a massive horde and an Orda; a 5:20 exfil timer starts (solo; +10 seconds per extra player). Clear the landing site and defeat the Orda to complete the quest.',
      },
    ],
  },
  {
    gameShortName: 'BOCW',
    mapSlug: 'outbreak',
    name: 'The Pact',
    slug: 'the-pact-outbreak',
    type: 'SIDE_QUEST',
    xpReward: 0,
    description:
      'Special reward quest: complete main quests (Die Maschine, Firebase Z, Outbreak Ravenov Implications, Entrapment, Mauer Tin Man Heart, Forsaken Pyrrhic Victory) to light obelisks at the ritual site on Foothills of Zoo. Six obelisks, one per quest. With at least two quests done, interact with the altar for rewards. Sky darkens, eclipse, "Demon" speaks as your operator levitates. More quests = better loadout rarity (2 = Uncommon, 4 = Rare, all 6 = Epic), emblems, and at 6 the "The Pact" Dark Ops Calling Card and "Dark Deeds" Legendary Watch.',
    steps: [
      {
        order: 1,
        label: 'Complete main quests to make their obelisks glow at the Foothills of Zoo (Outbreak). Tiger masks on other Outbreak maps warp you to Zoo after an objective: Ruka (Obstacle Course); Sanatorium (bottom of Pool); Golova (Town Center, statue); Armada (Control Room, central ship); Collateral (Warehouse opposite PaP); Alpine (Lower Chairlift, in the snow).',
      },
      {
        order: 2,
        label: 'With at least two quests completed, interact with the altar at the ritual site. Toggle rarity reward on/off by interacting again. Rewards: loadout weapon rarity by quest count; two emblems per quest (e.g. Sam/Carver for Evil Unleashed, Peck/Ravenov for Maxis Potential); all six = The Pact Calling Card and Dark Deeds Watch.',
      },
    ],
  },

  // ——— Outbreak (BOCW): Misc Easter eggs ———

  {
    gameShortName: 'BOCW',
    mapSlug: 'outbreak',
    name: 'Ronald Raygun',
    slug: 'ronald-raygun-outbreak',
    type: 'SIDE_QUEST',
    xpReward: 0,
    description:
      'A unique zombie named "Ronald Raygun" (leather jacket with pins, pink mohawk) can spawn in a region. Killing him drops a Ray Gun. Added in Season Three.',
    steps: [
      {
        order: 1,
        label: 'Find Ronald Raygun in the region and kill him to receive the Ray Gun drop.',
      },
    ],
  },
  {
    gameShortName: 'BOCW',
    mapSlug: 'outbreak',
    name: 'Damaged Beacon (Warp Skip)',
    slug: 'damaged-beacon-outbreak',
    type: 'SIDE_QUEST',
    xpReward: 0,
    description:
      'When a warp is indicated, attacking the Beacon damages it and sends the Strike Team two warp tiers ahead instead of one. Can be repeated on any Beacon; the Beacon gains more health each time, making it harder in later tiers.',
    steps: [
      {
        order: 1,
        label: 'When the warp prompt is active, attack the extraction Beacon before warping. The team warps two tiers ahead. Repeat on later Beacons if desired (Beacon health increases each warp).',
      },
    ],
  },
  {
    gameShortName: 'BOCW',
    mapSlug: 'outbreak',
    name: 'World Events & Region Objectives',
    slug: 'world-events-objectives-outbreak',
    type: 'SIDE_QUEST',
    xpReward: 0,
    description:
      'Reference: Outbreak regions have optional World Events (marked on map with icons) and primary Objectives. World Events: Fury Crystal (destroy 7 orange crystals in time → Aether Tool); Orda (boss fight → Max Ammo, weapons, perks); Omega Supply Crate (destroy helicopter → 250 High-Grade + 1500 Salvage, scorestreaks); Black Chest (free 3 Dark Aether swarms, open for chalice PaP upgrade; spirit helps if health drops below 50 later); Aethereal Orb (shoot orb 3 times as it relocates → weapons, Essence); Unknown Signal (radio + 3 amplifiers, match frequency → 800 Essence + Music Player song). Others: Dragon Relic (500 Essence, kill in ring); Locked Golden Chest (horde then Full Power). Objectives: Defend (DASA), Holdout (Dark Aether lockdown), Retrieve (Aetherium units to rocket), Escort (Recon Rover), Eliminate (HVT), Secure (ECMs), Transport (Cargo Truck to vortexes).',
    steps: [
      {
        order: 1,
        label: 'World Events appear as unique icons on the map. Complete them for the listed rewards. Primary Objectives (Defend, Holdout, Retrieve, Escort, Eliminate, Secure, Transport) are required or optional region goals.',
      },
    ],
  },

  // ——— Mauer der Toten (BOCW): Main Quest ———

  {
    gameShortName: 'BOCW',
    mapSlug: 'mauer-der-toten',
    name: 'Tin Man Heart',
    slug: 'tin-man-heart',
    type: 'MAIN_QUEST',
    xpReward: 5500,
    videoEmbedUrl: 'https://www.youtube.com/embed/KLHziC8D428',
    description:
      'Follow Kravchenko\'s orders: build an Inversion Warhead to close the Dark Aether portal and stop Valentina. Requires power, Pack-a-Punch, Klaus activated and upgraded at least once, and the CRBR-S with Blazer mod kit.',
    rewardsDescription: 'Tin Man Heart Dark Ops; "Valentina" and "Klaus" emblems (with The Pact). Ending cutscene.',
    steps: [
      {
        order: 1,
        label: 'With CRBR-S Blazer and Klaus active, go to Sewer Access and command Klaus to punch the far wall; a reinforced wall is revealed. Destroy it with the CRBR-S Blazer to open the secret Endstation lab. Enter (round ends, Tormentor wave); complete the wave to remove two orange barriers from devices.',
        buildableReferenceSlug: 'klaus-mauer',
      },
      {
        order: 2,
        label: 'Three empty essence canisters rise in the Secret Lab. Place them at three Essence Harvesters (green-light boxes; spawn locations vary: Sewer Access, West Berlin Street, Alley, Ghost Station, Korber Rooftop, Destroyed Penthouse, East Berlin Streets). Shoot the unlocked cabinet in the lab with the Blazer for the Endstation Lure (respawns; max 2). At a harvester, throw the lure to spawn Tempests; kill 3–6 to charge the canister. Deliver all three charged canisters to the pedestal (Manglers and Tormentors spawn).',
      },
      {
        order: 3,
        label: 'With Klaus upgraded at least once, command him onto the far eastern tracks opposite Mule Kick at Ghost Station (he holds up his hands). In the Switch Control Room, flip the lever to switch train lines; a two-car train passes and Klaus stops it. Board quickly and collect the nuclear warhead and Agent Rico\'s keycard before the train leaves. Miss items = wait a round to flip again.',
      },
      {
        order: 4,
        label: 'Use Rico\'s Keycard on the red Requiem terminal in the Safe House to turn it green. Browse to the Dimensional Disruptor; access is denied. Build the Hacking Helm for Klaus: Antenna (Apartment Rooftop—shoot antenna tower with CRBR-S); Transistor (Electronics Store—destroy one of three cassette players with CRBR-S); Electronic Boards (Ghost Station—shoot green box above ticket window with CRBR-S). Craft the helm on Klaus at the chair; he bypasses security so you can use the Dimensional Disruptor.',
      },
      {
        order: 5,
        label: 'Activate the Dimensional Disruptor; a beam hits Checkpoint Charlie and summons an Apex Megaton, two Apex Mimics and a horde. Kill the Megaton and splinters for two corrupted Uranium chunks (5-minute timer). Take one chunk to a workbench (Military Tent or West Berlin Street) to craft a Uranium Device. Place it on one end of the zipline (Destroyed Penthouse–Korber Rooftop); repeat with the other chunk on the other end. Both devices zip and collide in the center, dropping one uncorrupted Uranium Rock. Bring it to the Secret Lab pedestal. Next round, repeat (beam moves to Apartment Rooftop); install the second rock to start the Valentina boss fight. Fail the timer = uranium detonates, game over.',
      },
      {
        order: 6,
        label: 'Fight Valentina in the Secret Lab (red rift, corrupted Valentina). She has a blue shield, summons zombies and uses crystal flechettes, health-drain ring (destroy zombies to counter), Tormentor swarms, and an insta-kill energy ball (take cover out of her sight). At 20% health loss she moves: Destroyed Penthouse → East Berlin Streets → Checkpoint Charlie → West Berlin Street → back to Secret Lab. Deplete her health, then interact to capture her; cutscene charges the Inversion warhead and Klaus picks it up.',
      },
      {
        order: 7,
        label: 'Protect Klaus as he walks into the portal with the warhead. Zombies emerge from the portal; keep them off Klaus until he reaches the end. He says farewell and detonates the warhead inside the portal. Quest complete; failure to protect Klaus = game over.',
      },
    ],
  },

  // ——— Mauer der Toten (BOCW): Buildables ———

  {
    gameShortName: 'BOCW',
    mapSlug: 'mauer-der-toten',
    name: 'Pack-a-Punch',
    slug: 'pack-a-punch-mauer',
    type: 'BUILDABLE',
    xpReward: 0,
    videoEmbedUrl: 'https://www.youtube.com/embed/VWb7NyeOtGI',
    description:
      'Pack-a-Punch is at Checkpoint Charlie. Defeat a Disciple in the Dark Aether there to unlock the machine.',
    steps: [
      {
        order: 1,
        label: 'Go to Checkpoint Charlie and defeat the Disciple in the Dark Aether to unlock the Pack-a-Punch machine.',
      },
    ],
  },
  {
    gameShortName: 'BOCW',
    mapSlug: 'mauer-der-toten',
    name: 'Klaus',
    slug: 'klaus-mauer',
    type: 'BUILDABLE',
    xpReward: 0,
    videoEmbedUrl: 'https://www.youtube.com/embed/fcF3CezdZg8',
    description:
      'AI companion robot in the Safe House; follows the player and kills zombies. Requires Robotic Hands and Battery. Klaus Remote Control replaces Tactical slot; radios to call Klaus: Military Tent, Korber Rooftop, West Berlin Street. After a round he returns to the chair to recharge; reactivate for 2000 Essence.',
    steps: [
      {
        order: 1,
        label: 'Robotic Hands: use a Brain Rot–infected zombie next to the barricaded door in Hotel Room 305 so it tears the door down. Take the hands from Agent Jack\'s corpse on the bed. Battery: kill a Krasny Soldat (spawns from round 10) to drop it. Install both parts on Klaus in the Safe House; he breaks free and is ready.',
      },
      {
        order: 2,
        label: 'First upgrade: dig a Satellite Dish from debris piles in the Death Strip. Attach it to the empty Upgrade Station in the Garment Factory. Have Klaus kill 50 zombies until the station\'s monitor turns green. Command Klaus to the station; survive the 1-minute defense (zombies and Disciples target the station). Klaus gets a PaP\'d XM4 (tier 1).',
      },
      {
        order: 3,
        label: 'Command Klaus to open the locker in the Switch Control Room (near Mule Kick) to get the blacklight. Use it to find Klaus\' symbol on two of six electrical boxes: 5th Floor Apartments, Hotel Lounge, Ghost Station, Maintenance Tunnel, West Berlin Street, Blasted Suite. Command Klaus to those two boxes to open them and collect the two Cosmetic Disks.',
      },
      {
        order: 4,
        label: 'Command Klaus to the Garment Factory Upgrade Station. Interact to input the first disk—Klaus gets an emo-style outfit and XM4 upgrades (station cooldown). Input the second disk for max PaP XM4 and Klaus\' punk rock makeover.',
      },
    ],
  },
  {
    gameShortName: 'BOCW',
    mapSlug: 'mauer-der-toten',
    name: 'CRBR-S (Free)',
    slug: 'crbr-s-free-mauer',
    type: 'BUILDABLE',
    xpReward: 0,
    videoEmbedUrl: 'https://www.youtube.com/embed/PEIwtaUhGBU',
    description:
      'Free Conversion-Ready Binary Repeater-Standard wonder weapon via the Hotel Room 305 safe. Also in Mystery Box, Trials (legendary), or Mister Peeks Nightclub Golden Chest. Requires Klaus and the blacklight.',
    steps: [
      {
        order: 1,
        label: 'Activate Klaus and get the blacklight (command Klaus to open the locker in the Switch Control Room). Use the blacklight to find three sets of two numbers in invisible ink: Garment Factory; Service Passage; Grocery Store. Each set corresponds to one dial on the safe in Hotel Room 305.',
      },
      {
        order: 2,
        label: 'Go to Hotel Room 305 and enter the three number sets on the safe (left to right). Zombies ignore you while entering. Correct combination opens the safe and gives one CRBR-S.',
      },
    ],
  },
  {
    gameShortName: 'BOCW',
    mapSlug: 'mauer-der-toten',
    name: 'Mister Peeks (Hasenbau Nightclub)',
    slug: 'mister-peeks-mauer',
    type: 'BUILDABLE',
    xpReward: 0,
    videoEmbedUrl: 'https://www.youtube.com/embed/edJrTkiZijI',
    description:
      'Collect six Mister Peeks bunny parts to light the Hasenbau building (East Berlin Streets). Sixth part teleports you to Hasenbau VIP Nightclub; defeat three waves (Mangler, Mimic, Disciple) and choose one of three doors for rewards. Fail = Max Ammo, Carpenter, Bonus Points. Shoot Mister Peeks in a Hasenbau window 15 full rounds later to return (repeat twice, three visits total).',
    steps: [
      {
        order: 1,
        label: 'Collect six bunny parts: Hotel Room 304 (desk); Alley (next to tire stack); Bar (couch near Juggernog); Sewer Access (cardboard box); Department Store (shelf); Grocery Store (shelf in front of counter). Each part lights the Hasenbau building.',
      },
      {
        order: 2,
        label: 'After the sixth part, you are teleported to the Nightclub. Mister Peeks is DJ; zombies dance then attack in three waves (Mangler, Mimic, Disciple). Defeat all three before time runs out, then interact with one of three doors for your reward. To return: 15 full rounds later, shoot the Mister Peeks bunny in one of the Hasenbau building windows (up to two more visits).',
      },
    ],
  },

  // ——— Mauer der Toten (BOCW): Music ———

  {
    gameShortName: 'BOCW',
    mapSlug: 'mauer-der-toten',
    name: 'Amoeba (Music Easter Egg)',
    slug: 'amoeba-mauer',
    type: 'MUSICAL',
    xpReward: 0,
    description:
      'Song by Adolescents. Activate by collecting three cassette tapes.',
    steps: [
      {
        order: 1,
        label: 'Garment Factory: on top of a mannequin.',
      },
      {
        order: 2,
        label: 'East Berlin Streets: on a shelf in the electronics store.',
      },
      {
        order: 3,
        label: 'Blasted Suite: next to a vase on a cabinet.',
      },
    ],
  },

  // ——— Mauer der Toten (BOCW): Misc / Side ———

  {
    gameShortName: 'BOCW',
    mapSlug: 'mauer-der-toten',
    name: 'CRBR-S Mod Kits (Blazer, Diffuser, Swarm)',
    slug: 'crbr-s-mod-kits-mauer',
    type: 'SIDE_QUEST',
    xpReward: 0,
    videoEmbedUrl: 'https://www.youtube.com/embed/4_ylaI9g8wo',
    description:
      'Mod kits drop occasionally from zombies. Blazer: assault rifle beam. Diffuser: shotgun flechette. Swarm: handheld cannon with lock-on. Equip by picking up; same kit replenishes ammo. PaP upgrades: CRBR-TRN Duality (base); Blazer → Enlightenment; Diffuser → Quintessence; Swarm → Seeker.',
    steps: [
      {
        order: 1,
        label: 'Kill zombies to obtain mod kits. Pick up to equip or replace current kit; picking up the same kit refills ammo. Depleting a kit\'s ammo detaches it and reverts to base CRBR-S.',
      },
    ],
  },
  {
    gameShortName: 'BOCW',
    mapSlug: 'mauer-der-toten',
    name: 'Apartment Rooftop Moving Targets',
    slug: 'moving-targets-mauer',
    type: 'SIDE_QUEST',
    xpReward: 0,
    description:
      'After power is on, a file appears on the Apartment Rooftop when looking over the Königshaus and Korber signs. Interact to spawn moving targets; shoot all before time runs out for an Aether Tool.',
    steps: [
      {
        order: 1,
        label: 'Turn on power. On the Apartment Rooftop, look toward the Königshaus and Korber signs and interact with the file. Shoot all moving targets in time: behind Königshaus sign; second floor of Königshaus; behind Korber sign; middle three windows, top floor of "Der Dozent"; behind Der Dozent sign. Reward: Aether Tool.',
      },
    ],
  },

  // ——— Forsaken (BOCW): Main Quest ———

  {
    gameShortName: 'BOCW',
    mapSlug: 'forsaken',
    name: 'Pyrrhic Victory',
    slug: 'pyrrhic-victory',
    type: 'MAIN_QUEST',
    xpReward: 6000,
    videoEmbedUrl: 'https://www.youtube.com/embed/RtYND6JaLe0',
    description:
      'Operation First Domino: stop Omega from rescuing Zykov and capture The Forsaken. Requires the Chrysalax (Savager for crystals). After lockdown is lifted, the facility is plunged into Dark Aether; an Aetherium Neutralizer is needed to reach Town Square.',
    rewardsDescription: 'Pyrrhic Victory Dark Ops; "Sergei" and "Maxis" emblems (with The Pact).',
    steps: [
      {
        order: 1,
        label: 'Lift the lockdown. In the Observation Tower, between the Bunker Teleport and the Centre console room, press the additional button. Cutscene: Omega rescues Zykov; Zykov reveals he is The Forsaken. Samantha phases in and fights him as the facility becomes Dark Aether–infused.',
      },
      {
        order: 2,
        label: 'Build the field-crafted Aetherium Neutralizer (parts in any order). Housing Unit: Bunker Board Room—Abomination (spawns when someone enters Board Room after Forsaken) must charge the corner where the buoy floats to dislodge it. Monitoring Device: TV Shop backroom—reboot Grand Prix arcade (zombie with Tesla Storm or Dead Wire arcs to cabinet) for 2,000 Essence; use cabinet to spawn orange-pulse ARC-XD; drive it behind TV Shop counter to knock vent down, then detonate in backroom to free the monitor. Fuel Tank: Fuel Processing—activate any of the four tanks, survive lockdown until tanks fill; machine fails and drops the central tank. Catalyzed Shards: destroy the three orbs protecting the giant crystals (Staging Area, Main Street Storage Zone 5 Rooftops, Bunker Amplifier)—more purple-haze enemies spawn; destroy crystals with Chrysalax Savager, throw each shard at an Abomination\'s maw to catalyze; store with Fuel Tank (shards self-destruct).',
        buildableReferenceSlug: 'aetherium-neutralizer-forsaken',
      },
      {
        order: 3,
        label: 'Craft the Aetherium Neutralizer on the Main Street workbench (facing the collapsed walkway and Phase Wall). Complete the boot sequence; Director orders: if The Forsaken cannot be killed, capture him in Omega\'s Containment Chamber. Interacting with the Neutralizer after boot starts the point of no return.',
      },
      {
        order: 4,
        label: 'Travel through the Phase; refill the Neutralizer with Catalyzed Crystal Shards from crystals inside the Phase (one shard at a time; fuel level shown on tanks, monitor, and audio). At Town Square\'s Containment Door the Neutralizer goes offline; Der Wunderfizz, PaP, Ammo Cache, Arsenal and Crafting Table spawn. Interact with the Containment Door to confront The Forsaken.',
      },
      {
        order: 5,
        label: 'Boss fight: Samantha creates zones to collect essence from slain zombies and charges Aetherium Gun Turrets to damage The Forsaken\'s weak points. Phase 1: shoulders (destroy orbs first); destroy left arm = tracking energy orbs, right arm = Frost Blast–like zones. Phase 2: both arms destroyed → vision of "future" then return; eye laser attack; crystal weak point; destroy it to open Dark Aether vortex; Krasny Soldats spawn. Phase 3: head weak point; five giant Aether Crystals descend, constant damage; Samantha enters vortex and forces The Forsaken into Containment, sealing herself in the Dark Aether. Quest complete.',
      },
    ],
  },

  // ——— Forsaken (BOCW): Buildables ———

  {
    gameShortName: 'BOCW',
    mapSlug: 'forsaken',
    name: 'Chrysalax',
    slug: 'chrysalax-forsaken',
    type: 'BUILDABLE',
    xpReward: 0,
    videoEmbedUrl: 'https://www.youtube.com/embed/HQ9nImCSYmA',
    description:
      'Wonder weapon: Savager (axe + spinning blade) and Storm (rapid-fire). Required for Pyrrhic Victory crystal steps. Parts available only after starting Step 1 of Pyrrhic Victory. Also in Mystery Box or Trials (legendary).',
    steps: [
      {
        order: 1,
        label: 'Polymorphic Crystal Core: second wave after Dark Aether, the core lands in Jim\'s Donuts (Main Street). Approach to shield it; defeat waves of Plaguehounds, then Tempests, then Mimics to unshield and collect.',
      },
      {
        order: 2,
        label: 'Energetic Geode: an Abomination\'s Energy Beam must hit a Dark Aether Crystal to create the geode.',
      },
      {
        order: 3,
        label: 'Tempered Crystal Heart: kill a Tormentor with fire damage (Flamethrower scorestreak or Ring of Fire Field Upgrade) to drop it.',
      },
      {
        order: 4,
        label: 'Take all three parts to the Bunker Particle Accelerator (pool behind the Krig 6 wall buy). Place them in the pool. Kill zombies in range with melee or tomahawk to charge the Chrysalax; when fully charged it is forged.',
      },
    ],
  },
  {
    gameShortName: 'BOCW',
    mapSlug: 'forsaken',
    name: 'Aetherium Neutralizer',
    slug: 'aetherium-neutralizer-forsaken',
    type: 'BUILDABLE',
    xpReward: 0,
    videoEmbedUrl: 'https://www.youtube.com/embed/O9iqiYzqkcA',
    description:
      'Field-crafted device to safely travel through the Phase to Town Square. Required for Pyrrhic Victory. Four components: Housing Unit (buoy), Monitoring Device (spare monitor), Fuel Tank, Catalyzed Crystal Shards (three). Build on Main Street workbench.',
    steps: [
      {
        order: 1,
        label: 'Housing Unit: Bunker Board Room—have an Abomination charge the corner where the buoy floats to dislodge it. Monitoring Device: reboot Grand Prix cabinet in TV Shop (electric zombie arcs to it) for 2,000 Essence; spawn orange ARC-XD, drive behind TV Shop counter, detonate in backroom to free the monitor. Fuel Tank: Fuel Processing—activate a tank, complete lockdown, collect dropped central tank. Catalyzed Shards: destroy orbs then crystals (Staging Area, Main Street Storage Zone 5 Rooftops, Bunker Amplifier) with Chrysalax Savager; throw shards at Abomination maws to catalyze.',
      },
      {
        order: 2,
        label: 'Build the Aetherium Neutralizer on the Main Street workbench facing the collapsed walkway and Phase Wall.',
      },
    ],
  },

  // ——— Forsaken (BOCW): Music ———

  {
    gameShortName: 'BOCW',
    mapSlug: 'forsaken',
    name: "Samantha's Ballad (Music Easter Egg)",
    slug: 'samanthas-ballad-forsaken',
    type: 'MUSICAL',
    xpReward: 0,
    videoEmbedUrl: 'https://www.youtube.com/embed/NZg_hCM9bPU?start=35',
    description:
      'Song by Brian Tuey. Requires Tier 5 PhD Slider. Three scorch-mark patches in Anytown; slide off rooftops and impact near them for a chance to drop the Aether Bunny plush. Place the plush in the back of the Bubby animatronic to start a 3-minute defense (Outbreak health rules); Bubby tosses Cheeseburgers. Success = Large Loot Chest with cassette and loot.',
    steps: [
      {
        order: 1,
        label: 'Equip PhD Slider (Tier 5 recommended). In Anytown, find the three scorch-mark asphalt patches. Slide off rooftops and land near them to get a chance at the Aether Bunny plush.',
      },
      {
        order: 2,
        label: 'Take the Aether Bunny to Burger Town and interact with the back of the Bubby animatronic; the backing panel opens. Place the plush inside to start a 3-minute defense of Bubby (zombies, Krasny Soldats, Tormentors). Complete it to spawn a Large Loot Chest in front of Bubby with the Samantha\'s Ballad cassette and other loot.',
      },
    ],
  },

  // ——— Forsaken (BOCW): Misc / Side ———

  {
    gameShortName: 'BOCW',
    mapSlug: 'forsaken',
    name: 'Ronald Raygun (Free Ray Gun)',
    slug: 'ronald-raygun-forsaken',
    type: 'SIDE_QUEST',
    xpReward: 0,
    videoEmbedUrl: 'https://www.youtube.com/embed/NZg_hCM9bPU?start=390',
    description:
      'Use Aether Shroud (Tier 3 for teleport) to pass through the locked wooden door on the left side of the counter at Beach Pizza (Main Street). Inside is Ronald Raygun; deliver four pizza boxes to marked locations and return for rewards (high chance for Ray Gun).',
    steps: [
      {
        order: 1,
        label: 'Equip Aether Shroud (Tier 3 recommended for teleport). At Beach Pizza on Main Street, use it to pass through the locked door left of the counter.',
      },
      {
        order: 2,
        label: 'Pick up pizza boxes and deliver to the four locations: Video Store (ground floor); Cinema (near entrance); Bar (ground floor, opposite Burger Town); Burger Town (front table). Return to Ronald after each delivery. Rewards can include high-tier salvage, points, or the Ray Gun (often by the third delivery).',
      },
    ],
  },
  {
    gameShortName: 'BOCW',
    mapSlug: 'forsaken',
    name: 'Free Legendary Pistol Upgrade',
    slug: 'free-legendary-pistol-forsaken',
    type: 'SIDE_QUEST',
    xpReward: 0,
    videoEmbedUrl: 'https://www.youtube.com/embed/NZg_hCM9bPU?start=226',
    description:
      'Target-shooting challenge in Any Town USA. Hold the weapon you want upgraded (best with Rare/Epic pistol). Enemies ignore the player during the challenge; failure = audio cue, can retry.',
    steps: [
      {
        order: 1,
        label: 'Go to Any Town USA and find the blueprint in the flower bed. Interact to start the shooting challenge. Hit all spawning targets quickly. Success upgrades your held weapon to Legendary.',
      },
    ],
  },
  {
    gameShortName: 'BOCW',
    mapSlug: 'forsaken',
    name: 'Free Legendary SMG Upgrade',
    slug: 'free-legendary-smg-forsaken',
    type: 'SIDE_QUEST',
    xpReward: 0,
    videoEmbedUrl: 'https://www.youtube.com/embed/NZg_hCM9bPU?start=266',
    description:
      'Target-shooting challenge on Main Street. Hold the SMG you want upgraded. Use on a Rare or Epic SMG to maximize the jump to Legendary.',
    steps: [
      {
        order: 1,
        label: 'On Main Street, find the SMG blueprint (typically on or near the cement blocks). Interact to start the challenge; shoot all spawning targets in the designated area. Success upgrades your held weapon to Legendary.',
      },
    ],
  },
  {
    gameShortName: 'BOCW',
    mapSlug: 'forsaken',
    name: 'Free Legendary Sniper Upgrade',
    slug: 'free-legendary-sniper-forsaken',
    type: 'SIDE_QUEST',
    xpReward: 0,
    videoEmbedUrl: 'https://www.youtube.com/embed/NZg_hCM9bPU?start=320',
    description:
      'Target-shooting challenge on the Video Store rooftop. Requires a sniper rifle; targets appear on surrounding buildings. Speed and accuracy required.',
    steps: [
      {
        order: 1,
        label: 'Go to the Video Store rooftop (near Jack\'s Vault) in Any Town USA. Find the blueprint on top of the air conditioning unit. Interact to start the challenge; shoot all distant targets on the rooftops within the time limit. Success upgrades your held weapon to Legendary. Failure = loud beeping, retry possible.',
      },
    ],
  },
  {
    gameShortName: 'BOCW',
    mapSlug: 'forsaken',
    name: 'Free Perk (VHS / Simon Says)',
    slug: 'free-perk-vhs-forsaken',
    type: 'SIDE_QUEST',
    xpReward: 0,
    videoEmbedUrl: 'https://www.youtube.com/embed/NZg_hCM9bPU?start=210',
    description:
      'A VHS tape and Simon Says–style game elsewhere on the map can reward a free Perkaholic (all perks) when completed correctly.',
    steps: [
      {
        order: 1,
        label: 'Find the VHS tape and Simon Says game in their map locations. Complete the sequence correctly to receive a free Perkaholic.',
      },
    ],
  },
  {
    gameShortName: 'BOCW',
    mapSlug: 'forsaken',
    name: 'Free Arcade Token',
    slug: 'free-arcade-token-forsaken',
    type: 'SIDE_QUEST',
    xpReward: 0,
    videoEmbedUrl: 'https://www.youtube.com/embed/NZg_hCM9bPU?start=477',
    description:
      'Melee the token change machine inside the Arcade in Anytown West to receive a free arcade token (otherwise 10,000 Essence). Use tokens on arcade machines for Nacht der Untoten, Der Eisendrache, Grand Prix/ARC-XD race, and Enduro.',
    steps: [
      {
        order: 1,
        label: 'Enter the Arcade in Anytown West and melee the token change machine to get one free arcade token.',
      },
    ],
  },
  {
    gameShortName: 'BOCW',
    mapSlug: 'forsaken',
    name: 'Nacht der Untoten Arcade',
    slug: 'nacht-arcade-forsaken',
    type: 'SIDE_QUEST',
    xpReward: 0,
    videoEmbedUrl: 'https://www.youtube.com/embed/NZg_hCM9bPU?start=619',
    description:
      'After lockdown is lifted, use an arcade token on the World at War machine (PPSH-style gun on it) in the Arcade. Survive ~2–2.5 minutes in the first room of original Nacht with only an M1911. Reward: high-grade salvage, full power-up, points. Death in the minigame returns you to Forsaken, not game over.',
    steps: [
      {
        order: 1,
        label: 'Obtain an arcade token (drop from zombies, 10,000 Essence, or melee the change machine). In the Arcade, find the World at War machine and use the token. Survive the lockdown; a DMR may appear in a chest around 20 kills. Complete for rewards.',
      },
    ],
  },
  {
    gameShortName: 'BOCW',
    mapSlug: 'forsaken',
    name: 'Der Eisendrache Arcade',
    slug: 'der-eisendrache-arcade-forsaken',
    type: 'SIDE_QUEST',
    xpReward: 0,
    videoEmbedUrl: 'https://www.youtube.com/embed/NZg_hCM9bPU?start=692',
    description:
      'In the Arcade (Anytown West), use an arcade token on the Der Eisendrache machine. Kill zombies that turn pink/purple as they approach the Outbreak dragon pod. Reward: gold crate with salvage, equipment, and potential Wonder Weapon.',
    steps: [
      {
        order: 1,
        label: 'With an arcade token and lockdown lifted, go to the Arcade and insert the token into the Der Eisendrache machine. Kill the marked zombies near the dragon pod to complete the objective and receive the gold crate.',
      },
    ],
  },
  {
    gameShortName: 'BOCW',
    mapSlug: 'forsaken',
    name: 'ARC-XD / Enduro Race',
    slug: 'arcxd-race-forsaken',
    type: 'SIDE_QUEST',
    xpReward: 0,
    videoEmbedUrl: 'https://www.youtube.com/embed/NZg_hCM9bPU?start=504',
    description:
      'Bar second floor (opposite Burger Town/Video Store): arcade machine under a blue tarp. Use PhD Slider to kill a zombie near the machine so its soul powers it (machine glows purple/green). Insert an arcade token to start a 3-lap ARC-XD race; follow arrows. Faster completion = better loot (e.g. legendary). All players must insert a token for co-op. Doors along the path must be open.',
    steps: [
      {
        order: 1,
        label: 'Get PhD Slider and an arcade token. Go to the second floor of the bar (zipline near Burger Town), find the covered machine under the tarp. Kill a zombie next to it with a PhD Slider slide/dive to power the machine.',
      },
      {
        order: 2,
        label: 'Insert the token to start the race. Drive the ARC-XD for three laps following the purple arrows. Finish quickly for better rewards (high-grade salvage, essence, items). Typically one use per game.',
      },
    ],
  },

  // ——— Terminus (BO6): Main Quest ———

  {
    gameShortName: 'BO6',
    mapSlug: 'terminus',
    name: 'No Mo\' Modi',
    slug: 'no-mo-modi',
    type: 'MAIN_QUEST',
    xpReward: 5000,
    videoEmbedUrl: 'https://www.youtube.com/embed/tI9dwinLua0',
    description:
      'Free Maya\'s brother Nathan and find Richtofen. Prerequisites: all AMP units activated to Bio Lab, Pack-a-Punch elevator raised, and the DRI-11 Beamsmasher.',
    rewardsDescription: 'No Mo\' Modi achievement (30 G). Post-quest: teleport to Holding Cells with perks, Bonus Points, Aether Tools, crystals, Legendary weapons, Salvage, random Wonder Weapon.',
    steps: [
      {
        order: 1,
        label: 'Find the Tentacle Trap with the missing Hard Drive (one that looks pre-activated, or look into its maw, or find a Project Janus keycard below it). Activate local power via the nearby AMP Unit. Shoot the activated trap with the DRI-11 Beamsmasher to drop the Hard Drive; take it to the Security Station and hand it into the receptacle.',
        buildableReferenceSlug: 'dri-11-beamsmasher-terminus',
      },
      {
        order: 2,
        label: 'Nathan is in the central containment pod in the Bio Lab; the window is opened. Code Words spawn on terminals—three items give the code: (1) Interrogation Room caged clock—hour hand = first digit; (2) Mess Hall corkboard playing card—number = second digit (Ace = 1); (3) Engineering "Safety First" sign, Days Since Last Incident = third digit. Input the code at the chamber; all players interact with the seals to unseal.',
      },
      {
        order: 3,
        label: 'Unsealing triggers Bio Lab lockdown and clears zombies. Nathan is an Amalgam (more sentient); drain his health for a cutscene—Maya puts him down, Revati Modi appears. Pick up the keycard that dropped into the water. Goals: escape and (for Peck) retrieve warheads; interact with the Project Janus AI.',
      },
      {
        order: 4,
        label: 'Communications computer: comms are physically cut; Node Connectors needed. Spare connectors are in the Shipwreck (missing hull section, up ladder)—keycard access. Enter room, take a Node Connector (room locks, defense wave; completion = Max Ammo). Holder can only walk. Two of three locations need repair (Sea Cave east wall near Speed Cola; under Sea Tower by Docks; Crab Island west side opposite Crafting Table). Interact to repair both; return to Security Station.',
      },
      {
        order: 5,
        label: 'S.A.M. (Synaptic Algorithm Module) helps build a hacking device to bring Modi\'s sub back. Peck gives the Hacking Device; hack three satellite buoys (east of Crab Island, SE of Sea Tower; between Crab Island and Shipwreck; east of Temple Island). Near each, Parasites spawn; hacking one starts a 2-minute timer. Hack all three in time or retry. Success reveals Modi\'s Apocalypse Protocol—warheads will detonate.',
      },
      {
        order: 6,
        label: '5-minute timer to disarm nuclear devices in the Bio Lab (long interaction, can be done over multiple interactions). Bombs: beside Ammo Cache near north-east staircase to Armory; beside north-west staircase under Crafting Table; above Melee Macchiato machine. More disarmed = stronger enemies; under 1 minute with none = Amalgams. Final disarm brings Modi\'s sub to the bay; door beside Melee Macchiato opens; keypad leads to final encounter.',
      },
      {
        order: 7,
        label: 'Boss: Owen Guthrie (Patient 13). Phase 1: tentacles on arena edges (toxic projectiles; kill tentacles for damage, critical on bulbous mid-points); shoulder slam and sweep. At ~1/3 health he flees, tentacles rain toxic clouds, Manglers join; kill enough for Max Ammo, Owen resurfaces. Phase 2: critical = glowing maw; Manglers stay. At ~2/3 health, retreat again, Amalgams join; Max Ammo. Phase 3: tentacles block most of jetty; toxic fumes on blocked sections. Attacks: electrical orb (dodge behind crates or into water); tentacle tongue suck (instant down); slam. Deplete health for ending cutscene.',
      },
    ],
  },

  // ——— Terminus (BO6): Buildables ———

  {
    gameShortName: 'BO6',
    mapSlug: 'terminus',
    name: 'DRI-11 Beamsmasher (Free)',
    slug: 'dri-11-beamsmasher-terminus',
    type: 'BUILDABLE',
    xpReward: 0,
    videoEmbedUrl: 'https://www.youtube.com/embed/wNrHOq7sSqw',
    description:
      'Wonder weapon; required for No Mo\' Modi Step 1. Free after power is fully restored. Also in Mystery Box or Meteor Easter egg. Dead Wire opens Tonovsky\'s Research Office; Resonator and three island spheres yield Amp Munition, then craft at Research Office workbench.',
    steps: [
      {
        order: 1,
        label: 'With Dead Wire, shoot Electrical Boxes in sequence: on the Inclined Lift as it rises from Bio Lab to Storage/Communications; then Living Quarters beside AMP unit; Rec Yard by Lab entrance. Tonovsky\'s Research Office opens. Kill Anya Tonovsky for her fob.',
      },
      {
        order: 2,
        label: 'Sea Tower: briefcase opposite Elemental Pop door = Multiphasic Resonator (Vermin spawn). Equation in Research Office left corner; X at Docks before Armory stairs, Y in Storage Area right from Interrogation, Z in Communications outside Control Center near Inclined Lift. Input coordinates into Lab calibrator (or pay Peck 5,000 at Security Station for the code). Calibrator points to Temple Island, Castle Rock, or Crab Island.',
      },
      {
        order: 3,
        label: 'Take the Resonator to that island; a plasma sphere forms. Interact to place Resonator; zombies spawn. Sphere shoots a beam; kill to drop electricity ball. Feed the sphere twice (hold ball, interact with sphere; ball limits off-hand actions). Sphere moves clockwise to next island; repeat for all three islands. After the third, collect Amp Munition and craft the DRI-11 Beamsmasher at the Research Office workbench.',
      },
    ],
  },

  // ——— Terminus (BO6): Music ———

  {
    gameShortName: 'BO6',
    mapSlug: 'terminus',
    name: 'Can You Hear Me? (Come in) (Music Easter Egg)',
    slug: 'can-you-hear-me-terminus',
    type: 'MUSICAL',
    xpReward: 0,
    description:
      'Interact with three Mister Peeks–themed headphones to activate the song.',
    steps: [
      {
        order: 1,
        label: 'Before the Juggernog room from the left: on top of the large wooden spool next to a lamp.',
      },
      {
        order: 2,
        label: 'Mining Tunnels: on top of a red barrel across from the PhD Flopper machine.',
      },
      {
        order: 3,
        label: 'Bio Lab: upper floor office, on top of the white cabinets.',
      },
    ],
  },

  // ——— Terminus (BO6): Side / Misc ———

  {
    gameShortName: 'BO6',
    mapSlug: 'terminus',
    name: 'Treasure Hunter',
    slug: 'treasure-hunter-terminus',
    type: 'SIDE_QUEST',
    xpReward: 0,
    videoEmbedUrl: 'https://www.youtube.com/embed/0dQ8A4Tpo0U',
    description:
      'With ghost pirate Thomas Gregg, retrieve the Cursed Talisman. Requires Melee Macchiato and three Molotovs. Talisman grants permanent double points while equipped but costs a percentage of essence when hit by a zombie. Unlocks Treasure Hunter achievement.',
    steps: [
      {
        order: 1,
        label: 'From Bio Lab cavern (Speed Cola), hug the eastern wall until you see a hole covered with rocks. Punch through (Melee Macchiato); skeleton and map with X. Take a Tactical Raft to the X, get the watch underwater, return to skeleton.',
      },
      {
        order: 2,
        label: 'Interact with skeleton (Captain Thomas Gregg). Burn three crew skeletons with Molotovs: Shipwreck, Castle Rock, Temple Island. Each spawns a Mangler; kill for Cursed Coin. Return all three coins to Gregg for two random Legendary weapons.',
      },
      {
        order: 3,
        label: 'Go to Crab Island (southernmost). Survive three full rounds. A chest spawns in the middle; interact for the Cursed Talisman (equipped; can return to chest later).',
      },
    ],
  },
  {
    gameShortName: 'BO6',
    mapSlug: 'terminus',
    name: 'Culinary Delight',
    slug: 'culinary-delight-terminus',
    type: 'SIDE_QUEST',
    xpReward: 0,
    videoEmbedUrl: 'https://www.youtube.com/embed/Cr-Hyifogto',
    description:
      'Cook a fish in the Mess Hall with scattered ingredients. Unlocks Culinary Delight achievement.',
    steps: [
      {
        order: 1,
        label: 'Bio Lab: kill a fish on the water surface (Frag Grenade or explosive), pick it up.',
      },
      {
        order: 2,
        label: 'Collect: Pack of Batteries (Engineering, tables by Crafting Table); Salt (Living Quarters upper floor, above white fridge); Can of Beans (Mess Hall, between fruit crates); Oil (Mess Hall, corner by stoves); Brain (Bio Lab, table near Crafting Table).',
      },
      {
        order: 3,
        label: 'Mess Hall: interact with frying pan on stove—add oil, then fish, then batteries, salt, brain, beans. Flip the round; pan turns volatile and achievement unlocks.',
      },
    ],
  },
  {
    gameShortName: 'BO6',
    mapSlug: 'terminus',
    name: 'Free Random Perk #1',
    slug: 'free-perk-1-terminus',
    type: 'SIDE_QUEST',
    xpReward: 0,
    categoryTag: 'Free Powerup',
    videoEmbedUrl: 'https://www.youtube.com/embed/WpINur8LRH0',
    description:
      'Bio Lab jail area (next to glass vats): kill all zombies in the cells, flip round; kill all Vermin in the cells, flip round; kill all Manglers in the cells for a Random Perk power-up.',
    steps: [
      {
        order: 1,
        label: 'In the Bio Lab jail area beside the glass vats, clear each wave (zombies → Vermin → Manglers) and flip the round after each. After the Manglers are killed, the Random Perk spawns.',
      },
    ],
  },
  {
    gameShortName: 'BO6',
    mapSlug: 'terminus',
    name: 'Free Random Perk #2',
    slug: 'free-perk-2-terminus',
    type: 'SIDE_QUEST',
    xpReward: 0,
    categoryTag: 'Free Powerup',
    videoEmbedUrl: 'https://www.youtube.com/embed/WpINur8LRH0?start=134',
    description:
      'Use a Tactical Raft to find small islands with green spores. Shoot all spores on the first island, flip round; second island, shoot all, flip round; third island, shoot all, flip round. Then go to Sea Caves (Speed Cola); shoot all spores inside the cave for a Random Perk.',
    steps: [
      {
        order: 1,
        label: 'Raft to a small island with green spores; shoot all, round flip. Repeat for a second and third island. After the third round flip, go to Sea Caves (Speed Cola area) and shoot all spores in the cave. Random Perk spawns.',
      },
    ],
  },
  {
    gameShortName: 'BO6',
    mapSlug: 'terminus',
    name: 'Mega Stuffy Pet',
    slug: 'mega-stuffy-pet-terminus',
    type: 'SIDE_QUEST',
    xpReward: 0,
    videoEmbedUrl: 'https://www.youtube.com/embed/WpINur8LRH0?start=185',
    description:
      'Find six stuffed toys; bring them to the blue elephant on the bunk bed next to Juggernog in Living Quarters. They merge into the Mega Stuffy Pet, a companion that kills zombies and revives the player on solo. Elephant drops Tactical Equipment (Concussions, Kazimirs, etc.).',
    steps: [
      {
        order: 1,
        label: 'Collect six stuffed animals: Unicorn (green locker left of Stamin-Up); Monkey (outside bridge grating between Sea Tower and Engineering); Elephant (Mining Tunnels, left of Gobblegum machine, behind pallet); Bear (Bio Lab, under trolley by Crafting Table); Duck (Shipwreck, right of Mystery Box in red container); Giraffe (Crab Island, right of Crafting Table).',
      },
      {
        order: 2,
        label: 'Take them to Living Quarters and interact with the blue elephant on the bunk bed next to Juggernog. Stuffed animals levitate and merge into the Mega Stuffy Pet.',
      },
    ],
  },
  {
    gameShortName: 'BO6',
    mapSlug: 'terminus',
    name: 'Meteor Easter Egg',
    slug: 'meteor-terminus',
    type: 'SIDE_QUEST',
    xpReward: 0,
    videoEmbedUrl: 'https://www.youtube.com/embed/WpINur8LRH0?start=266',
    description:
      'Dead Wire on weapon. Shoot two satellite towers until lights turn red; flip round and activate Void Cannon trap to summon a meteor. Loot at Castle Rock beach (scorestreaks, ammo mods, salvage, armor, rare Ray Gun).',
    steps: [
      {
        order: 1,
        label: 'With Dead Wire, shoot the satellite tower above the prison (left of Quick Revive building) until the blinking light turns red. Shoot the second tower outside Engineering (outside Living Quarters) until red.',
      },
      {
        order: 2,
        label: 'Flip the round, activate the Void Cannon trap; an orange flash and meteor crash. Take a raft to Castle Rock; a small fire on the beach has items to pick up (scorestreaks, ammo mods, salvage, armor plates, rare Ray Gun).',
      },
    ],
  },
  {
    gameShortName: 'BO6',
    mapSlug: 'terminus',
    name: 'Whack-a-Mole',
    slug: 'whack-a-mole-terminus',
    type: 'SIDE_QUEST',
    xpReward: 0,
    videoEmbedUrl: 'https://www.youtube.com/embed/WpINur8LRH0?start=410',
    description:
      'Crab Island with a Molotov. Throw it at the leftmost tree above the small zombie-spawn window on the middle of the island. Crabs fall; you get a Baseball Bat and 30 seconds to whack as many crabs as possible. Success = Perk-a-Cola can.',
    steps: [
      {
        order: 1,
        label: 'Go to Crab Island with a Molotov. Throw it at the leftmost tree above the small window (middle of island). Whack the crabs with the Baseball Bat within the 30-second timer for a Perk-a-Cola reward.',
      },
    ],
  },
  {
    gameShortName: 'BO6',
    mapSlug: 'terminus',
    name: 'Slam Dunk',
    slug: 'slam-dunk-terminus',
    type: 'SIDE_QUEST',
    xpReward: 0,
    videoEmbedUrl: 'https://www.youtube.com/embed/RNPMtqdN8h0',
    description:
      'With a Pack-a-Punched weapon, shoot the basketball stuck on the Living Quarters roof (Engineering side, wooden box outside Living Quarters; roof zone where it meets upper level). Ball falls through Court Yard hoop, fireworks = 20×100 Essence (2,000). Double Points active when picking up doubles the value.',
    steps: [
      {
        order: 1,
        label: 'In Engineering, climb the wooden box outside Living Quarters. Look up at the roof; shoot the stuck basketball until you get a hitmarker. It falls through the hoop in the Court Yard and releases 20 bottles of 100 Essence (2,000 total).',
      },
    ],
  },
  {
    gameShortName: 'BO6',
    mapSlug: 'terminus',
    name: 'Oxygen Tank',
    slug: 'oxygen-tank-terminus',
    type: 'SIDE_QUEST',
    xpReward: 0,
    videoEmbedUrl: 'https://www.youtube.com/embed/WpINur8LRH0?start=498',
    description:
      'Dive under the Pack-a-Punch area (after it is powered) to the bottom; find the slightly clear rock and throw a grenade at it. An oxygen tank appears; pick it up to spend twice as long underwater.',
    steps: [
      {
        order: 1,
        label: 'With a grenade, dive below the powered Pack-a-Punch area to the bottom. Throw a grenade at the slightly clear rock; the oxygen tank appears underneath. Pick it up for extended underwater time.',
      },
    ],
  },
  {
    gameShortName: 'BO6',
    mapSlug: 'terminus',
    name: 'Maglev Elevator Jumpscare',
    slug: 'jumpscare-terminus',
    type: 'SIDE_QUEST',
    xpReward: 0,
    videoEmbedUrl: 'https://www.youtube.com/embed/WpINur8LRH0?start=692',
    description:
      'From Spawn, enter the Maglev elevator at the back. Activate it and jump repeatedly; the elevator stops, lights go out, glowing eyes appear outside, classic zombie laugh plays. Power returns; Amalgam faces and blood on walls; "HELP" in blood as elevator descends to Bio Lab.',
    steps: [
      {
        order: 1,
        label: 'Go to the Maglev elevator in the back of the Spawn room. Enter, activate it, and keep jumping. The elevator stops, lights cut, eyes and laugh; then blood and "HELP" as it goes down.',
      },
    ],
  },
  {
    gameShortName: 'BO6',
    mapSlug: 'terminus',
    name: 'Boat Race',
    slug: 'boat-race-terminus',
    type: 'SIDE_QUEST',
    xpReward: 0,
    videoEmbedUrl: 'https://www.youtube.com/embed/WpINur8LRH0?start=350',
    description:
      'Find the flashing red toy boat underwater (e.g. near Castle Rock or SE beach of Crab Island). Race: collect essence, avoid tentacles, jump through hoops. Rewards scale by performance (bronze to gold)—perks, weapons, salvage. Mr. Peak dances and drops a trophy. Replayable after five rounds.',
    steps: [
      {
        order: 1,
        label: 'Dive underwater near Castle Rock Island or the southeast beach of Crab Island to find the flashing red toy jet boat. Interact to start the race.',
      },
      {
        order: 2,
        label: 'Navigate through hoops, jump ramps, collect essence, avoid tentacles and zombies. Finish for tiered rewards; Mr. Peak dances and drops a trophy. Can be repeated after five rounds.',
      },
    ],
  },
  {
    gameShortName: 'BO6',
    mapSlug: 'terminus',
    name: 'Free Perkaholic',
    slug: 'free-perkaholic-terminus',
    type: 'SIDE_QUEST',
    xpReward: 0,
    categoryTag: 'Free Powerup',
    description:
      'Kill 50 fish using explosive ammo or explosive equipment. Fish locations: Crab Island; in and around the Shipwreck; beneath Sea Tower and around the Docks; water under the Bio Lab. Bubbles or splashes reveal their position.',
    steps: [
      {
        order: 1,
        label: 'Kill 50 fish with explosives (weapon with explosive ammo or equipment). Look for bubbles on the surface or water splashes. Main areas: Crab Island, Shipwreck, under Sea Tower/Docks, under Bio Lab.',
      },
    ],
  },
  // ——— Liberty Falls (BO6): Main Quest ———

  {
    gameShortName: 'BO6',
    mapSlug: 'liberty-falls',
    name: 'Bye-Bye, Dark Aether',
    slug: 'bye-bye-dark-aether',
    type: 'MAIN_QUEST',
    xpReward: 5000,
    videoEmbedUrl: 'https://www.youtube.com/embed/iNSPFb5AIz8',
    description:
      'Team Alpha: rescue survivors, determine if Project Janus caused the outbreak, and end it. Find Dr. Moline (dead, Olly\'s Comics), Dr. Pelletier (dead, van by Speed Cola on Washington Ave), and Dr. Panos (alive, church). Interact with the Simultaneous Dimensional Gateway beside the Ammo Cache in the church to start. Thrustodyne M23 required from Step 2 onward.',
    rewardsDescription: 'Bye-Bye, Dark Aether achievement (30 G). Post-quest: teleport to Pump & Gas roof with perks, Bonus Points, Aether Tools, crystals, Legendary weapons, Salvage, random Wonder Weapon.',
    steps: [
      {
        order: 1,
        label: 'Panos is trapped in a Dark Aether pocket; he needs parts for a Limited Transdimensional Gateway Device. The Thrustodyne M23 is required. If you already have it, proceed to Step 2.',
        buildableReferenceSlug: 'thrustodyne-m23-liberty-falls',
      },
      {
        order: 2,
        label: 'Use Thrustodyne primary fire to collect three LTG parts: Panos—device in the null-gravity field beside him in the church; Moline—part in the roof hole above his corpse in Olly\'s Comics; Pelletier—part in the open window of Buzz Cuts barber shop across from her body. Craft the LTG at the bench on "The Alamo."',
      },
      {
        order: 3,
        label: 'Place the LTG under an Aether Storm (Cemetery or Riverside). Defend the portal for 1 minute (purple-eyed zombies charge it; 10 points each). HVT (Mangler or Abomination) comes through. Get an Aether Canister from the SDG in the church (holder walks only). Damage the HVT to ~20% health; lure it onto a Dark Aether Field Generator pad with the canister on it and kill it there to fill the canister. Return to church (~1:30 before energy dissipates). Failed capture = summon another HVT next wave.',
      },
      {
        order: 4,
        label: 'Get the Strauss Counter from the canister machine (Tactical slot). Three projectors (Hilltop Stairway grass behind Liberty Lanes; Groundskeeper\'s Yard backyard; Yummy Freeze rooftop from The Alamo): turn each on and match the Strauss Counter color (red/yellow/green). When all three align on Pump & Pay, take the second canister.',
      },
      {
        order: 5,
        label: 'Move the LTG to the other Aether Storm and fill the second canister the same way. Return both canisters to the SDG. Interacting with the machine is the point of no return.',
      },
      {
        order: 6,
        label: 'Interact with the SDG; church doors close, orb above device. Defense: kills charge the orb. Armored, Heavy, Vermin, Manglers spawn. Mangler swarm → Max Armor. HVT Mangler → Max Ammo. More waves then HVT Abomination. After the Abomination dies, Panos betrays the team: SDG downs everyone (no self-revive); Panos takes their place and leaves. "Bye-Bye, Dark Aether."',
      },
    ],
  },

  // ——— Liberty Falls (BO6): Buildables ———

  {
    gameShortName: 'BO6',
    mapSlug: 'liberty-falls',
    name: 'Thrustodyne M23',
    slug: 'thrustodyne-m23-liberty-falls',
    type: 'BUILDABLE',
    xpReward: 0,
    videoEmbedUrl: 'https://www.youtube.com/embed/6giOql4srfQ',
    description:
      'Wonder weapon (Jet Gun); required for Bye-Bye, Dark Aether. Incomplete bench in Motor Lodge Room 202 (door bursts, zombies). Three parts: Water Pressure Gauge, Handbrake, Electrical Wires. Also in Mystery Box.',
    steps: [
      {
        order: 1,
        label: 'Water Pressure Gauge: get the water valve from the tap in front of Lily\'s Flowerpot Florist on Washington Ave. Place it on the pipes at Fuller\'s Liberty Lanes (behind paneling on the Lanes). Defense starts; interact to increase pressure (zombies give 10% points). When pressure is enough the gauge shoots off and zombies combust.',
      },
      {
        order: 2,
        label: 'Handbrake: in the Graveyard during a standard (or Vermin) wave, kill the "Groundskeeper" for the Toolshed Key. Open the Toolshed in the back corner of the Groundskeeper\'s Yard for the Handbrake.',
      },
      {
        order: 3,
        label: 'Electrical Wires: Radio House in Riverside has a chained door. Open it with a Mangler cannon blast (kite a Mangler, Mutant Injection, or Mangler Cannon). Interact with the electronics piles inside (Salvage, Vermin jumpscare, or the wiring bundle).',
      },
      {
        order: 4,
        label: 'Craft the Thrustodyne M23 at the bench in Motor Lodge Room 202.',
      },
    ],
  },

  // ——— Liberty Falls (BO6): Music ———

  {
    gameShortName: 'BO6',
    mapSlug: 'liberty-falls',
    name: 'Destroy Something Beautiful (Music Easter Egg)',
    slug: 'destroy-something-beautiful-liberty-falls',
    type: 'MUSICAL',
    xpReward: 0,
    videoEmbedUrl: 'https://www.youtube.com/embed/zerbyzpOakM?start=732',
    description:
      'Interact with three Mister Peeks–themed headphones to activate the song.',
    steps: [
      {
        order: 1,
        label: 'Between Fuller\'s Liberty Lanes and the Motor Lodge: on the ground beside the fence and platform railing.',
      },
      {
        order: 2,
        label: 'Inside the Dark Aether church: on the end of a wooden bench.',
      },
      {
        order: 3,
        label: 'Washington Avenue: beneath a wooden bench seat along the wrought iron fence.',
      },
    ],
  },
  {
    gameShortName: 'BO6',
    mapSlug: 'liberty-falls',
    name: 'Echo (Music Easter Egg)',
    slug: 'echo-liberty-falls',
    type: 'MUSICAL',
    xpReward: 0,
    description:
      'Activated after completing the Mr. Peeks Bowling Easter egg three times.',
    steps: [
      {
        order: 1,
        label: 'Complete the Mr. Peeks Bowling Easter egg (shoot five bowling shoes, bowl at Liberty Lanes, get trophy) three times. The third time unlocks Echo.',
      },
    ],
  },

  // ——— Liberty Falls (BO6): Side / Misc ———

  {
    gameShortName: 'BO6',
    mapSlug: 'liberty-falls',
    name: 'Mr. Peeks Bowling',
    slug: 'mr-peeks-bowling-liberty-falls',
    type: 'SIDE_QUEST',
    xpReward: 0,
    videoEmbedUrl: 'https://www.youtube.com/embed/zerbyzpOakM?start=210',
    description:
      'Shoot five bowling shoes to teleport to Fuller\'s Liberty Lanes; zombies party, Mister Peeks spawns a bowling ball. Two minutes to bowl (hold fire to charge for faster throw). Trophy spawns with rewards by score. Repeat: five rounds after, shoot the five shoes in the exposed toilet in the bowling alley (next to billiards) for a second run; again for a third.',
    steps: [
      {
        order: 1,
        label: 'Shoot all five shoes: Pump & Pay checkout counter; Frank\'s Hardware shelf (across from Olly\'s Comics); under chair in open window left of AK-74 wall buy on Hill Street; hanging from tree right of Armor Upgrade in Cemetery; on casket in Benson Funeral Services (West Main, across from Liberty Lanes).',
      },
      {
        order: 2,
        label: 'You are teleported to Liberty Lanes. Use the bowling ball (charge with hold fire). After 2 minutes, Mister Peeks spawns a trophy; open it for rewards. To repeat: 5 rounds later, shoot the five shoes in the toilet in the bowling alley (next to billiards table)—up to two more times.',
      },
    ],
  },
  {
    gameShortName: 'BO6',
    mapSlug: 'liberty-falls',
    name: 'Aetherella',
    slug: 'aetherella-liberty-falls',
    type: 'SIDE_QUEST',
    xpReward: 0,
    videoEmbedUrl: 'https://www.youtube.com/embed/Ea2OpjRPlpM',
    description:
      'Collect all 8 Aetherella figurines with Thrustodyne primary fire. All 8 = temporarily become Aetherella (invulnerable, auto-aim laser beam). Trap also purchasable for 1500 Essence.',
    steps: [
      {
        order: 1,
        label: 'Eight figures: four inside Olly\'s Comics; one on neon Motel sign behind "Office" on East Main; one on AC unit opposite Dark Aether Field Generator on Hill Street; one on Yummy Freeze rooftop (drop from The Alamo) behind the right AC vent; one on church ledge opposite Melee Macchiato; one under the "L" on the Liberty Lanes sign (West Main, near decommissioned bus). Pick each up with Thrustodyne primary fire.',
      },
    ],
  },
  {
    gameShortName: 'BO6',
    mapSlug: 'liberty-falls',
    name: 'Bank Vault',
    slug: 'bank-vault-liberty-falls',
    type: 'SIDE_QUEST',
    xpReward: 0,
    videoEmbedUrl: 'https://www.youtube.com/embed/zerbyzpOakM?start=762',
    description:
      'Liberty Falls Savings & Loans vault opens with codes from three post-it notes. Use Loot Keys inside the vault.',
    steps: [
      {
        order: 1,
        label: 'Find three post-its: bank counter nearest the vault; under Olly\'s Comics counter (near Aetherella statue); Fuller\'s Liberty Lanes snacks counter under the bucket with ice and champagne bottles.',
      },
      {
        order: 2,
        label: 'Enter the vault code and use Loot Keys inside the vault.',
      },
    ],
  },
  {
    gameShortName: 'BO6',
    mapSlug: 'liberty-falls',
    name: 'Free Deadshot Daiquiri',
    slug: 'free-deadshot-liberty-falls',
    type: 'SIDE_QUEST',
    xpReward: 0,
    categoryTag: 'Free Powerup',
    videoEmbedUrl: 'https://www.youtube.com/embed/zerbyzpOakM?start=160',
    description:
      'North end of Cemetery, walking trail: five soda cans on the fence. Shoot all five with five consecutive shots (no miss) for free Deadshot Daiquiri. Missing despawns the cans; they reappear after a few rounds.',
    steps: [
      {
        order: 1,
        label: 'At the north end of the Cemetery, find the fence on the walking trail with five soda cans. Shoot all five in a row without missing for free Deadshot.',
      },
    ],
  },
  {
    gameShortName: 'BO6',
    mapSlug: 'liberty-falls',
    name: 'Exploding Zombie Head',
    slug: 'exploding-head-liberty-falls',
    type: 'SIDE_QUEST',
    xpReward: 0,
    videoEmbedUrl: 'https://www.youtube.com/embed/zerbyzpOakM?start=124',
    description:
      'Zombie head on the church steeple tip above Melee Macchiato. Destroy with explosive or Molotov; zombies rain down and drop Essence, Salvage, Scorestreaks. Aether Tool spawns (rarity by round: 1–9 Uncommon, 10–29 Rare, 30–49 Epic, 50+ Legendary).',
    steps: [
      {
        order: 1,
        label: 'Destroy the zombie head on the steeple (above Melee Macchiato) with an explosive or Molotov. Collect the Aether Tool after the raining zombies stop.',
      },
    ],
  },
  {
    gameShortName: 'BO6',
    mapSlug: 'liberty-falls',
    name: 'Pool Balls (Free Essence)',
    slug: 'pool-balls-liberty-falls',
    type: 'SIDE_QUEST',
    xpReward: 0,
    videoEmbedUrl: 'https://www.youtube.com/embed/zerbyzpOakM?start=75',
    description:
      'Hit the billiard balls on the table in Fuller\'s Liberty Lanes so they scatter into the pockets; a 100 Essence canister ejects.',
    steps: [
      {
        order: 1,
        label: 'In Fuller\'s Liberty Lanes, hit the billiard balls on the table so they all go into the pockets to get the 100 Essence canister.',
      },
    ],
  },
  {
    gameShortName: 'BO6',
    mapSlug: 'liberty-falls',
    name: 'Vending Machine',
    slug: 'vending-machine-liberty-falls',
    type: 'SIDE_QUEST',
    xpReward: 0,
    videoEmbedUrl: 'https://www.youtube.com/embed/zerbyzpOakM?start=19',
    description:
      'Motor Lodge: vending machine next to the energy barrier to Motor Lodge Alley. Punch it while crouched each round for a random reward (snacks to Essence, free Perk, or Ray Gun). Melee Macchiato on it destroys it—Essence and Salvage spew out, then it is unusable for the match.',
    steps: [
      {
        order: 1,
        label: 'Crouch and punch the vending machine in the Motor Lodge (by the Alley barrier) each round for a random drop. Or use Melee Macchiato to break it once for a burst of Essence and Salvage.',
      },
    ],
  },
  {
    gameShortName: 'BO6',
    mapSlug: 'liberty-falls',
    name: 'Mr. Peeks Car Trunk',
    slug: 'mr-peeks-car-liberty-falls',
    type: 'SIDE_QUEST',
    xpReward: 0,
    videoEmbedUrl: 'https://www.youtube.com/embed/zerbyzpOakM?start=650',
    description:
      'One of three cars has Mister Peeks in the backseat. Destroy that car with a Mangler Cannon to eject an item from the trunk. Five rounds later Peeks moves to another car (three runs total).',
    steps: [
      {
        order: 1,
        label: 'Three car locations: Groundskeeper\'s Yard in front of Crafting Table; Hill Street to the right of the GobbleGum machine; Backstreet Parking next to Olly\'s Comics. Find the car with Mister Peeks inside and destroy it with a Mangler Cannon for the trunk item. Repeat 5 rounds later for the next car.',
      },
    ],
  },
  {
    gameShortName: 'BO6',
    mapSlug: 'liberty-falls',
    name: 'Zombie Dance Party',
    slug: 'dance-party-liberty-falls',
    type: 'SIDE_QUEST',
    xpReward: 0,
    videoEmbedUrl: 'https://www.youtube.com/embed/zerbyzpOakM?start=338',
    description:
      'Riverside: two telescopes, 50 Essence each. Use them to find a lone zombie dancing on a cliff. Align both telescopes on the dancing zombie to trigger a 1-minute dance party on the bus—zombies dance and ignore the player.',
    steps: [
      {
        order: 1,
        label: 'At Riverside, pay 50 Essence for each telescope and look for the dancing zombie on the cliff. Align both telescopes on it to start the dance party on the bus.',
      },
    ],
  },
  {
    gameShortName: 'BO6',
    mapSlug: 'liberty-falls',
    name: 'Grave Digging',
    slug: 'grave-digging-liberty-falls',
    type: 'SIDE_QUEST',
    xpReward: 0,
    description:
      'Inaccessible ledge west of Washington Ave Rooftops: destroy the barrel (Scorestreaks only) so a shovel drops into the playable area. Use the shovel to dig graves in the Cemetery for rewards; digging all graves rewards Essence.',
    steps: [
      {
        order: 1,
        label: 'Destroy the barrel on the ledge (Scorestreaks only) to drop the shovel. Pick up the shovel and dig all the graves in the Cemetery for Essence and other rewards.',
      },
    ],
  },
  {
    gameShortName: 'BO6',
    mapSlug: 'liberty-falls',
    name: 'Blood Pool',
    slug: 'blood-pool-liberty-falls',
    type: 'SIDE_QUEST',
    xpReward: 0,
    description:
      'West Main Street, left of the GobbleGum machine: swimming pool full of blood. Throw three Semtex into the pool; a red orb flies out with Salvage and equipment. Repeat every five rounds (up to two more times); the third repeat gives a Fire Sale.',
    steps: [
      {
        order: 1,
        label: 'Throw three Semtex into the blood pool (West Main, left of GobbleGum). Collect the red orb for Salvage and equipment. Can be repeated every 5 rounds; third time yields Fire Sale.',
      },
    ],
  },
  {
    gameShortName: 'BO6',
    mapSlug: 'liberty-falls',
    name: 'Church Napalm Trap',
    slug: 'church-candles-liberty-falls',
    type: 'SIDE_QUEST',
    xpReward: 0,
    videoEmbedUrl: 'https://www.youtube.com/embed/zerbyzpOakM?start=698',
    description:
      'Shoot the two candle stands on either side of the Pack-a-Punch in the church with Napalm Burst. Purple fire pools and a central fire trap spawn; damages zombies (and players). Best used during the boss fight.',
    steps: [
      {
        order: 1,
        label: 'In the Dark Aether church, shoot both candle stands beside the PaP machine with a weapon that has Napalm Burst. Purple fire and a center trap appear.',
      },
    ],
  },
  // ——— Citadelle des Morts (BO6): Main Quest ———

  {
    gameShortName: 'BO6',
    mapSlug: 'citadelle-des-morts',
    name: 'Citadelle des Morts Main Quest',
    slug: 'citadelle-main-quest',
    type: 'MAIN_QUEST',
    xpReward: 5500,
    videoEmbedUrl: 'https://www.youtube.com/embed/hd4klqVCaUg',
    description:
      'Locate Gabriel Krafft and the Sentinel Artifact. Prerequisites: Pack-a-Punch unlocked, all four Bastard Swords and all four Incantations (required for final step).',
    rewardsDescription: 'Post-quest: teleport to Town Square with perks, Bonus Points, Aether Tools, crystals, Legendary weapons, Salvage, random Wonder Weapon.',
    steps: [
      {
        order: 1,
        label: 'Dungeon: interact with the door in the small hallway behind Quick Revive to speak with Krafft (zombies do not spawn). Grab the 4 Torn Pages from the Sitting Rooms (Page I near Entrance Hall door; II around bunk beds; III around TV/Stamin-Up; IV corridor to Alchemical Lab/Oubliette). Note which page shows which eye/Point of Power—Page IV always matches the Sitting Rooms trap.',
      },
      {
        order: 2,
        label: 'Alchemical Symbols: In the Undercroft, melee the off-colored square with Melee Macchiato to reveal the symbol grid. Tavern: six dark green flasks I–VI show a blue symbol each. Shoot those six symbols in the Undercroft in that order (symbols shuffle; no penalty for misses). An orb opens the wall; place the 4 Torn Pages in the book.',
      },
      {
        order: 3,
        label: 'Points of Power: Use the pages in numerical order. At each indicated trap, activate it and get ~10 kills; a quote plays and the trap shuts down, symbol turns grey. The fourth trap is always in the Sitting Rooms. When all four are done, an orb holder with four symbols spawns on the wall between Sitting Rooms and Oubliette.',
      },
      {
        order: 4,
        label: 'Honoring the Dead: Obtain all 4 elemental swords (Caliburn, Durendal, Balmung, Solais) and all 4 Incantations. Read the code around the orb holder (symbols I–II–III–IV clockwise show which knight first, second, third, fourth). In the Dining Hall, cast the matching Incantation in front of each knight statue while holding the matching sword, then start the sword inspect animation while facing the knight. Each knight salutes and glows. Do all four in the order displayed on the orb holder.',
      },
      {
        order: 5,
        label: 'Elemental Challenges: A white Mystic Orb appears. Bring it to each holder and complete the challenge. Fire (Courtyard holder): burn kills with Caliburn, Molotovs, Fire Incantation, Napalm Burst. Void (Undercroft Dark ritual): Balmung charged, Void Incantation, Shadow Rift. Electricity (Town Square gate): Durendal charged, Electric Incantation, Dead Wire / Shock Charges / Tesla Storm. Light (Dining Hall above gate): run through green orbs. Each success adds a colored orb to the Mystic Orb.',
      },
      {
        order: 6,
        label: 'The Owl: Place the Mystic Orb in the wall between Sitting Rooms and Oubliette. Secret Study opens. Interact with the Ancient Mystic Recording; Guy de Saint-Michel appears. Take the Guardian Key to the statue in the Town Square and deposit it at the eye symbol at the statue\'s feet to start the boss fight.',
      },
      {
        order: 7,
        label: 'The Guardian: Boss arena. Shoot the Guardian in the back to break the seal. Focus glowing weak points (shoulders, wrists, chest, knees). He goes immune—survive zombies. He reawakens with lava geysers; lava floods the room. Final phase: only chest is weak. Defeat him for the ending cutscene.',
      },
    ],
  },

  // ——— Citadelle des Morts (BO6): Buildables ———

  {
    gameShortName: 'BO6',
    mapSlug: 'citadelle-des-morts',
    name: 'Pack-a-Punch',
    slug: 'pack-a-punch-citadelle',
    type: 'BUILDABLE',
    xpReward: 0,
    videoEmbedUrl: 'https://www.youtube.com/embed/CbkYTci0VBw',
    description:
      'Lower castle: blue crate with three locks. Shoot off the locks; a Doppelghast spawns. Kill it for the red crystal and place the crystal in the portal inside the crate to spawn the Pack-a-Punch machine.',
    steps: [
      {
        order: 1,
        label: 'In the lower part of the castle, find the blue crate. Shoot off the three locks; open the crate and kill the Doppelghast. Place the dropped red crystal in the portal inside the crate to spawn Pack-a-Punch.',
      },
    ],
  },
  {
    gameShortName: 'BO6',
    mapSlug: 'citadelle-des-morts',
    name: 'Bastard Swords',
    slug: 'bastard-swords-citadelle',
    type: 'BUILDABLE',
    xpReward: 0,
    description:
      'Four melee wonder weapons. After PaP and round 10, Great helm zombies spawn (near headshot immunity); kill one for a Stamp. Use the Stamp on a knight statue in the Dining Hall: front left = Stag, front right = Dragon, back left = Raven, back right = Lion. Each statue gives its sword.',
    steps: [
      {
        order: 1,
        label: 'Activate Pack-a-Punch and reach round 10. Kill a Great helm zombie for a Stamp. Take it to the Dining Hall and interact with the desired knight statue (Stag, Dragon, Raven, or Lion) to receive that Bastard Sword.',
      },
    ],
  },
  {
    gameShortName: 'BO6',
    mapSlug: 'citadelle-des-morts',
    name: 'Caliburn (Dragon Sword Upgrade)',
    slug: 'caliburn-citadelle',
    type: 'BUILDABLE',
    xpReward: 0,
    videoEmbedUrl: 'https://www.youtube.com/embed/Ej3ZvU9ezv0?start=31',
    description:
      'Fire elemental upgrade for the Dragon Bastard Sword. Entrance Hall: interact with the Dragon head statue to insert the sword; three dragon braziers light (Village Ramparts; Nature Path by portcullis; Town Square near Rampage Inducer). Interact with each: dragon fire engulfs you (15 dmg/tick, fists insta-kill, health regen on kill). Bring the fire back to the statue three times to complete. Caliburn also unlocks the Caliburn music track when used on the three braziers.',
    steps: [
      {
        order: 1,
        label: 'Take the Dragon Bastard Sword to the Dragon head statue in the Entrance Hall (top of staircase) and insert it. Visit each of the three braziers, get engulfed, kill with fists, return fire to the statue. Repeat for all three; the statue breathes fire on Caliburn and you receive the upgraded sword.',
      },
    ],
  },
  {
    gameShortName: 'BO6',
    mapSlug: 'citadelle-des-morts',
    name: 'Durendal (Stag Sword Upgrade)',
    slug: 'durendal-citadelle',
    type: 'BUILDABLE',
    xpReward: 0,
    videoEmbedUrl: 'https://www.youtube.com/embed/Ej3ZvU9ezv0?start=170',
    description:
      'Electric upgrade for the Stag Bastard Sword. Collect three lightning rods: by Deadshot in Nature Path; fuse box near Speed Cola (charge with Dead Wire or Shock Charge); kill an Armored Zombie in the Dungeon (rod in chest). Place all three in the metallic vase on the Hillside Ramparts. Storm starts; strike the vase with the sword three times when charged (do not hold too long or lightning hits you). Insert the sword into the vase to get Durendal.',
    steps: [
      {
        order: 1,
        label: 'Get the three lightning rods and place them in the vase on the Hillside Ramparts. When the vase is charged by lightning, strike it with the Stag sword three times (timing matters), then insert the sword to receive Durendal.',
      },
    ],
  },
  {
    gameShortName: 'BO6',
    mapSlug: 'citadelle-des-morts',
    name: 'Balmung (Raven Sword Upgrade)',
    slug: 'balmung-citadelle',
    type: 'BUILDABLE',
    xpReward: 0,
    videoEmbedUrl: 'https://www.youtube.com/embed/Ej3ZvU9ezv0?start=248',
    description:
      'Shadow upgrade for the Raven Bastard Sword. Alchemy Lab: one of five antiquities spawns (two-headed raven skull, fish fossil, scorpion fossil, lion jaw, ram horn). Take it and the Raven sword to the device in the Tavern Cellar. Place antiquity and sword; align outer alchemical and inner zodiac circles to match the antiquity (puzzle solver: https://hub.tcno.co/games/bo6/raven/). Kite three dark orbs into the portal; portal moves. Repeat twice more (three times total). Portal returns and produces Balmung.',
    steps: [
      {
        order: 1,
        label: 'Get the antiquity from the Alchemy Lab and the Raven Bastard Sword. In the Tavern Cellar device, insert both. Match the circles (bone type + symbol; see hub.tcno.co/games/bo6/raven for solutions). Kite three orbs into the portal; repeat for the two following portal positions. Interact to receive Balmung.',
      },
    ],
  },
  {
    gameShortName: 'BO6',
    mapSlug: 'citadelle-des-morts',
    name: 'Solais (Lion Sword Upgrade)',
    slug: 'solais-citadelle',
    type: 'BUILDABLE',
    xpReward: 0,
    videoEmbedUrl: 'https://www.youtube.com/embed/Ej3ZvU9ezv0?start=105',
    description:
      'Light upgrade for the Lion Bastard Sword. Four Parasites with aura spawn; kill one with the Lion sword melee to infuse the blade. Village Ascent: door with lion knocker (between Mystery Box and Speed Cola). Strike the door with the infused blade four times (wrong kills = four more Parasites next round). Enter the Sanctuary; interact with the pedestal. Shoot the four floating symbols in order (top to bottom on pedestal): Gold ☉, Salammoniac 🜹, Phosphorous 🜍, Salt 🜔. One-minute timer; wrong shot resets. Complete for Solais.',
    steps: [
      {
        order: 1,
        label: 'Kill an aura Parasite with the Lion Bastard Sword melee. Strike the lion-knocker door in Village Ascent four times. In the Sanctuary, shoot the four symbols in the correct order (shown on pedestal) within 1:00. Pick up Solais.',
      },
    ],
  },
  {
    gameShortName: 'BO6',
    mapSlug: 'citadelle-des-morts',
    name: 'Incantations (Fire, Electric, Dark, Light)',
    slug: 'incantations-citadelle',
    type: 'BUILDABLE',
    xpReward: 0,
    description:
      'Four tactical incantations for the main quest. Fire: light three bonfires (above Speed Cola; Hillside tower Elemental Pop; barbican opposite cannon) with fire lethal or Caliburn, kill Doppelghast for Ra\'s Ankh, Courtyard dragon sigil. Electric: shoot horseshoe on Hilltop barn, use Rampart Cannon to get struck by lightning, find electrified horseshoe, Town Square stag sigil; open chest with Durendal. Dark: shoot raven in Cave Slide (Oubliette–Town Square), get Raven\'s Foot, Undercroft raven sigil; open with Balmung. Light: shoot Vulture Aid crystal haze, focus beam to Dining Room then Alchemy Lab bust for Paladin\'s Broach, Dining Hall lion sigil; open with Solais.',
    steps: [
      { order: 1, label: 'Fire: Light the three bonfires (Caliburn or fire lethal), kill the Doppelghast for Ra\'s Ankh. Courtyard dragon sigil—kill zombies to charge; hit chest with Caliburn.', buildableReferenceSlug: 'caliburn-citadelle' },
      { order: 2, label: 'Electric: Shoot horseshoe off Hilltop barn door. Use Rampart Cannon; get struck by lightning; find electrified horseshoe. Town Square stag sigil—charge, open chest with Durendal.', buildableReferenceSlug: 'durendal-citadelle' },
      { order: 3, label: 'Dark: Shoot the raven in the Cave Slide (end of cave). Collect Raven\'s Foot. Undercroft raven sigil—charge, open chest with Balmung.', buildableReferenceSlug: 'balmung-citadelle' },
      { order: 4, label: 'Light: Shoot the red crystal above Vulture Aid, focus beam to Dining Room then Alchemy Lab bust for Paladin\'s Broach. Dining Hall lion sigil—charge, open chest with Solais.', buildableReferenceSlug: 'solais-citadelle' },
    ],
  },

  // ——— Citadelle des Morts (BO6): Music ———

  {
    gameShortName: 'BO6',
    mapSlug: 'citadelle-des-morts',
    name: 'Slave',
    slug: 'music-slave-citadelle',
    type: 'MUSICAL',
    xpReward: 0,
    videoEmbedUrl: 'https://www.youtube.com/embed/O34bCZtHqIY?start=876',
    description:
      'Activate by interacting with three Mister Peeks-themed headphones: Tavern round table between workbench and armor wall buy; Courtyard—after Speed Cola take a right and right; Undercroft Stairway directly right of the red sofa.',
    steps: [
      { order: 1, label: 'Interact with all three headphones in Tavern, Courtyard (right after Speed Cola, right then right), and Undercroft (right of red sofa).' },
    ],
  },
  {
    gameShortName: 'BO6',
    mapSlug: 'citadelle-des-morts',
    name: 'Caliburn (Music Track)',
    slug: 'music-caliburn-citadelle',
    type: 'MUSICAL',
    xpReward: 0,
    videoEmbedUrl: 'https://www.youtube.com/embed/O34bCZtHqIY?start=913',
    description:
      'Use the upgraded Caliburn sword to melee the three unlit dragon braziers: Village Ramparts; Nature Path next to portcullis to Town Square; Town Square near the Rampage Inducer.',
    steps: [
      { order: 1, label: 'With Caliburn equipped, melee each of the three unlit dragon braziers to activate the track.', buildableReferenceSlug: 'caliburn-citadelle' },
    ],
  },

  // ——— Citadelle des Morts (BO6): Side Quests ———

  {
    gameShortName: 'BO6',
    mapSlug: 'citadelle-des-morts',
    name: "Maya's Revenge",
    slug: 'maya-revenge-citadelle',
    type: 'SIDE_QUEST',
    xpReward: 0,
    videoEmbedUrl: 'https://www.youtube.com/embed/O34bCZtHqIY?start=708',
    description:
      'Standard Mode only. Play as Maya Aguinaldo. Round 13+. In the Dining Hall near the Vulture Aid perk machine, interact with the radio. Enter a separate area, kill zombies, trigger cutscene with Francois "Franco" Moreau. Return to Dining Hall with a Legendary GS45 and other random loot.',
    steps: [
      { order: 1, label: 'As Maya, on round 13 or higher, interact with the radio near Vulture Aid in the Dining Hall. Complete the area and cutscene to receive Legendary GS45 and loot.' },
    ],
  },
  {
    gameShortName: 'BO6',
    mapSlug: 'citadelle-des-morts',
    name: 'Free PhD Flopper (Bartender)',
    slug: 'free-phd-bartender-citadelle',
    type: 'SIDE_QUEST',
    xpReward: 0,
    categoryTag: 'Free Powerup',
    videoEmbedUrl: 'https://www.youtube.com/embed/O34bCZtHqIY?start=106',
    description:
      'Collect three bottles: Undercroft under fold-up table left of red couch; Sitting Rooms bottom shelf of rack right of couch facing TV; Dining Room under fold-up table right of red couch. Place them on the drink tray on the bar in the Tavern. Serve the correct drink to each zombie (100 Essence per correct). After enough correct drinks: 7000 Essence and PhD Flopper for free.',
    steps: [
      { order: 1, label: 'Place the three bottles on the bar drink tray. Hand out the correctly colored drink to each zombie; complete to earn 7000 Essence and free PhD Flopper.' },
    ],
  },
  {
    gameShortName: 'BO6',
    mapSlug: 'citadelle-des-morts',
    name: 'Rat King',
    slug: 'rat-king-citadelle',
    type: 'SIDE_QUEST',
    xpReward: 0,
    videoEmbedUrl: 'https://www.youtube.com/embed/O34bCZtHqIY?start=271',
    description:
      'Town Square: break the glass display with cheeses and take the wheel at the bottom. Interact with 10 mice in: Town Square (flower pot right of Nature Path door); Nature Path (hole under circular structure by Deadshot); Village Ascent (under pizza truck); SE wooden stairs by Lion Cannon (broken step); Dining Hall (opposite Ammo Crate under pallet); Sitting Rooms (bench between bunks); Alchemical Lab (behind stone tablet under table); Undercroft (hole middle of western wall); Dungeon (jail cell left of KSV). Place cheese on the empty plate in the PaP room (Oubliette) NE corner. Rewards: points, Ammo Mods, perks, weapons, Monkey Bombs; royal crown to equip until exfil or fail.',
    steps: [
      { order: 1, label: 'Get the cheese wheel from Town Square. Interact with all 10 mice. Place the cheese on the empty plate in the Pack-a-Punch room NE corner for rewards and the crown.' },
    ],
  },
  {
    gameShortName: 'BO6',
    mapSlug: 'citadelle-des-morts',
    name: 'Floating Mr. Peeks',
    slug: 'floating-mr-peeks-citadelle',
    type: 'SIDE_QUEST',
    xpReward: 0,
    videoEmbedUrl: 'https://www.youtube.com/embed/O34bCZtHqIY?start=13',
    description:
      'Sniper scope recommended. (1) Elemental Pop room: SE window—floating Mr. Peeks above the tree; shoot it. (2) Barn by Deadshot: hole in wall above Mystery Box—dancing Peeks in castle; shoot. (3) Dining Hall upper floor SE corner: look up at tower with red roof, small window—dancing Peeks; shoot. (4) Dungeon: left of Ammo Crate, cell with Peeks doll on bed; shoot. All players receive a random perk.',
    steps: [
      { order: 1, label: 'Shoot Mr. Peeks at all four locations (Elemental Pop window, barn hole, Dining Hall tower window, Dungeon cell). Everyone gets a random perk.' },
    ],
  },
  {
    gameShortName: 'BO6',
    mapSlug: 'citadelle-des-morts',
    name: 'Lockdown',
    slug: 'lockdown-citadelle',
    type: 'SIDE_QUEST',
    xpReward: 0,
    videoEmbedUrl: 'https://www.youtube.com/embed/O34bCZtHqIY?start=210',
    description:
      'Requires main quest progress: all Bastard Swords upgraded, all Incantations, Symbols step done. When Undercroft symbol wall symbols have disappeared, use each Incantation on the wall—one row lights per use until all four rows are lit. Undercroft enters lockdown (purple flames bar exits). Survive three phases of zombie attacks. Rewards: Random Perk, four Ammo Mods; co-op can yield Aetherium Crystals, Aether Tools, Ray Guns.',
    steps: [
      { order: 1, label: 'After symbols vanish from the Undercroft wall, use the four Incantations on the wall to light all rows. Survive the three lockdown phases for Random Perk and Ammo Mods.' },
    ],
  },
  {
    gameShortName: 'BO6',
    mapSlug: 'citadelle-des-morts',
    name: 'Chess Protector',
    slug: 'chess-protector-citadelle',
    type: 'SIDE_QUEST',
    xpReward: 0,
    videoEmbedUrl: 'https://www.youtube.com/embed/O34bCZtHqIY?start=363',
    description:
      'Collect four chess pieces: table by Dragon statue (Bastard Sword); Tavern basement lower shelves opposite Crafting Table; Elemental Pop room table right of main entrance door; Dungeon table next to Point of Power trap. In the Sitting Rooms, interact with the chess board. Stand in the purple circle and defend; souls fill the board. A blue knight hologram appears and follows you, damaging zombies for a few minutes.',
    steps: [
      { order: 1, label: 'Grab all four chess pieces. Interact with the Sitting Rooms chess board and defend inside the purple circle until the knight hologram spawns.' },
    ],
  },
  {
    gameShortName: 'BO6',
    mapSlug: 'citadelle-des-morts',
    name: 'Fast Travel (Lion Cannon)',
    slug: 'fast-travel-citadelle',
    type: 'SIDE_QUEST',
    xpReward: 0,
    videoEmbedUrl: 'https://www.youtube.com/embed/O34bCZtHqIY?start=424',
    description:
      'Crank and fire the Lion Cannon to open the castle door; the crank shoots out toward Town Square. In Town Square, under the rubble blocking the citadelle, find the crank in an empty fruit box. Dining Hall NE corner (under Vulture Aid): pick up the blow torch. Return to the Lion Cannon, reinsert the crank, rotate fully. The cannon can now shoot you to the Dining Hall as well.',
    steps: [
      { order: 1, label: 'Fire the Lion Cannon to open the door; collect the crank from Town Square rubble (fruit box). Get the blow torch from Dining Hall under Vulture Aid. Reinsert crank at the cannon and rotate fully for Dining Hall fast travel.' },
    ],
  },
  {
    gameShortName: 'BO6',
    mapSlug: 'citadelle-des-morts',
    name: 'Bell Tower',
    slug: 'bell-tower-citadelle',
    type: 'SIDE_QUEST',
    xpReward: 0,
    videoEmbedUrl: 'https://www.youtube.com/embed/O34bCZtHqIY?start=483',
    description:
      'Complete the Fast Travel Easter egg. Shoot out of the Lion Cannon 99 times. On the 100th shot, aim at Town Square; trajectory hits the bell tower instead of the tavern roof. Two Monkey Bombs fall; the bell rings for 30 seconds and attracts nearby zombies, then returns to normal.',
    steps: [
      { order: 1, label: 'After Fast Travel is done, use the Lion Cannon 99 times. 100th shot toward Town Square hits the bell tower for Monkey Bombs and 30-second bell.' },
    ],
  },
  {
    gameShortName: 'BO6',
    mapSlug: 'citadelle-des-morts',
    name: 'Wishing Well',
    slug: 'wishing-well-citadelle',
    type: 'SIDE_QUEST',
    xpReward: 0,
    videoEmbedUrl: 'https://www.youtube.com/embed/O34bCZtHqIY?start=578',
    description:
      'Requires Vulture Aid. On a Max Ammo round, go to the well in the center of Village Ascent. When a vermin climbs out, throw a cooked frag into the well. Essence capsules spawn (up to 1000). Throw Essence back in (max 10,000). Next Max Ammo round, throw another grenade to retrieve. For maximum gain: deposit 10,000, next Max Ammo use Double Points and Profit Sharing before throwing the grenade.',
    steps: [
      { order: 1, label: 'With Vulture Aid, during Max Ammo go to Village Ascent well. Vermin out → cooked frag in. Collect Essence; deposit up to 10k. Next Max Ammo, grenade again to retrieve (optionally with Double Points + Profit Sharing).' },
    ],
  },
  {
    gameShortName: 'BO6',
    mapSlug: 'citadelle-des-morts',
    name: 'Fireplace Protector',
    slug: 'fireplace-protector-citadelle',
    type: 'SIDE_QUEST',
    xpReward: 0,
    videoEmbedUrl: 'https://www.youtube.com/embed/O34bCZtHqIY?start=655',
    description:
      'Use a full set of Molotovs or a fully charged Caliburn on four fireplaces within a short time: Dining Hall north wall; Sitting Rooms left of Stamin-Up; Alchemical Room SW under table; Tavern right of Arsenal. The last fireplace interacted shoots fire orbs at zombies. Can be activated again after a few rounds.',
    steps: [
      { order: 1, label: 'Hit all four fireplaces with Molotovs or charged Caliburn in quick succession. The last one gains the fire-orb effect.' },
    ],
  },
  {
    gameShortName: 'BO6',
    mapSlug: 'citadelle-des-morts',
    name: 'Free 10,000 Points',
    slug: 'free-10k-points-citadelle',
    type: 'SIDE_QUEST',
    xpReward: 0,
    categoryTag: 'Free Powerup',
    videoEmbedUrl: 'https://www.youtube.com/embed/O34bCZtHqIY?start=623',
    description:
      'Method to obtain 10,000 points from a hidden or bonus source on the map.',
    steps: [
      { order: 1, label: 'Follow the guide to obtain the free 10,000 points.' },
    ],
  },
  {
    gameShortName: 'BO6',
    mapSlug: 'citadelle-des-morts',
    name: 'Pool Table Free Points',
    slug: 'pool-table-points-citadelle',
    type: 'SIDE_QUEST',
    xpReward: 0,
    videoEmbedUrl: 'https://www.youtube.com/embed/O34bCZtHqIY?start=948',
    description:
      'Pool table in the Tavern area can be used to earn free points.',
    steps: [
      { order: 1, label: 'Use the pool table in the Tavern to earn free points.' },
    ],
  },

  // ——— The Tomb (BO6): Main Quest ———

  {
    gameShortName: 'BO6',
    mapSlug: 'the-tomb',
    name: 'Trials of the Damned',
    slug: 'the-tomb-main-quest',
    type: 'MAIN_QUEST',
    xpReward: 5500,
    videoEmbedUrl: 'https://www.youtube.com/embed/vmFcfRyWr4A',
    description:
      'Ex-Requiem heads and Maya complete the Trials of the Damned to obtain the Sentinel Artifact from the Dark Aether Nexus. Prerequisites: Pack-a-Punch unlocked, enter Dark Aether Nexus, build the Staff of Ice and upgrade it to Ull\'s Arrow.',
    rewardsDescription: 'Teleport to Dig Site with perks, Bonus Points, Aether Tools, crystals, Legendary weapons, Salvage, random Wonder Weapon.',
    steps: [
      {
        order: 1,
        label: 'In the Dark Aether Nexus, interact with the four pedestal statues around the Staff altar (Vermin—front right from Subterranean; Parasite—front left; Doppelghast—behind left near S.A.M.; Amalgam—behind right). Each statue starts a challenge.',
      },
      {
        order: 2,
        label: 'Vermin Challenge: Shoot the Vermin statue with Sekhmet\'s Vigor (Ull\'s Arrow alt fire), then interact. Dig Site: interact Vermin statue for lockdown. Kill all Vermin, interact statue for Dark Aether Energy, return to Nexus Vermin statue (avoid 2+ hits or energy is lost). Cannot use the portal nearest the challenge area.',
      },
      {
        order: 3,
        label: 'Parasite Challenge: Shoot Parasite statue with Sekhmet\'s Vigor, interact. Shrine of the Hierophants: interact Parasite statue. Kill Parasites, collect orbs, bank at statue until full. Interact, return to Nexus Parasite statue with energy.',
      },
      {
        order: 4,
        label: 'Doppelghast Challenge: Shoot Doppelghast statue with Sekhmet\'s Vigor, interact. Ossuary: interact Doppelghast statue. Survive lockdown (spike circles + Doppelghasts). Interact, return to Nexus Doppelghast statue with energy.',
      },
      {
        order: 5,
        label: 'Amalgam Challenge: Shoot Amalgam statue with Sekhmet\'s Vigor, interact. Deep Excavation: interact Amalgam statue. Kill HVT Amalgam (kill tethered zombies to drop shield). Interact, return to Nexus Amalgam statue with energy.',
      },
      {
        order: 6,
        label: 'Sentinel Artifact Boss: Bridge unlocks in Nexus. Interact the Sentinel Artifact to start. Phase 1: avoid sweeping laser, damage when beam turns purple. Phases 2–4: multiple copies, faster spins. Phases 5–8: HVT with Artifact on back (Heavy, Doppelghast, Shock Mimic, Amalgam); phases 6–8 can have a fake white Artifact. Phase 9: bell signals wipe—shoot Artifact at back of arena continuously to win. Tip: bullet weapons recommended; Artifact immune to Ray Gun and Staff. Gold Armor and Aether Shroud recommended.',
      },
    ],
  },

  // ——— The Tomb (BO6): Buildables ———

  {
    gameShortName: 'BO6',
    mapSlug: 'the-tomb',
    name: 'Pack-a-Punch',
    slug: 'pack-a-punch-the-tomb',
    type: 'BUILDABLE',
    xpReward: 0,
    videoEmbedUrl: 'https://www.youtube.com/embed/pFIPlZfogBo',
    description:
      'Pack-a-Punch is initially in the Dark Aether Nexus and can move to the Dig Site. Once the Dark Aether Nexus is visited and portals are enabled, it can move back and forth between the two.',
    steps: [
      { order: 1, label: 'Find Pack-a-Punch in the Dark Aether Nexus (or Dig Site when it has moved). Unlock Dark Aether Nexus and portals to allow it to relocate.' },
    ],
  },
  {
    gameShortName: 'BO6',
    mapSlug: 'the-tomb',
    name: 'Staff of Ice & Ull\'s Arrow',
    slug: 'staff-of-ice-the-tomb',
    type: 'BUILDABLE',
    xpReward: 0,
    videoEmbedUrl: 'https://www.youtube.com/embed/lsMEJ4MNHbc',
    description:
      'Staff of Ice is required for the Main Quest. Kill a Shock Mimic (first at round 8) for the Monocle. Shoot Aetheric Lanterns to guide them to Tombs or Neolithic Catacombs to reveal Roman-numeral symbols. Tombs: lantern in front of left bull mural—shoot 8 symbols in order for Taurus; 5-wave lockdown, Staff part + Max Ammo. Neolithic Catacombs: lantern in front of archer wall—shoot 10 symbols for Orion; 5-wave lockdown, Head Piece + Max Ammo. Dark Aether Nexus: interact altar; protect the staff during lockdown, then pick up Staff of Ice. Ull\'s Arrow: Freeze 3 purple Aetheric Lanterns in 10 seconds with Staff of Ice. Shoot the 3 floating rocks in Nexus with the Staff to lower them. One portal closes; go to opposite side and shoot the same symbols to reopen. Check floor in front of portals for the correct symbol (wrong = death; Stamin-Up Free Faller / Quick Revive Dying Wish can prevent). Enter portal, interact orb; all players must follow orb to the altar. Interact glowing altar to upgrade Staff to Ull\'s Arrow.',
    steps: [
      { order: 1, label: 'Get Monocle from Shock Mimic. Guide Aetheric Lanterns to Tombs and Neolithic Catacombs; complete Taurus (8 symbols) and Orion (10 symbols) lockdowns for parts.' },
      { order: 2, label: 'Interact the altar in the Dark Aether Nexus; protect the staff during the final lockdown. Pick up Staff of Ice.' },
      { order: 3, label: 'Freeze 3 purple Aetheric Lanterns in 10 seconds. Shoot the 3 symbol rocks in Nexus to lower them. Reopen the closed portal by shooting the same symbols on the opposite side; verify floor symbol, then enter and follow the orb with all players to the altar to upgrade to Ull\'s Arrow.' },
    ],
  },

  // ——— The Tomb (BO6): Music ———

  {
    gameShortName: 'BO6',
    mapSlug: 'the-tomb',
    name: 'Dig',
    slug: 'music-dig-the-tomb',
    type: 'MUSICAL',
    xpReward: 0,
    description:
      'Interact with three Mister Peeks headphones: Ossuary—ledge along wall by the right-most stairs to the green portal; Shrine of the Hierophants—under ledge left of Stamin-Up; Dark Aether Nexus—SE edge next to a blue and orange glowing spore.',
    steps: [
      { order: 1, label: 'Interact with all three headphones in Ossuary, Shrine of the Hierophants, and Dark Aether Nexus.' },
    ],
  },
  {
    gameShortName: 'BO6',
    mapSlug: 'the-tomb',
    name: 'Aether (Remix)',
    slug: 'music-aether-remix-the-tomb',
    type: 'MUSICAL',
    xpReward: 0,
    videoEmbedUrl: 'https://www.youtube.com/embed/_00pt1__3Zk?start=806',
    description:
      'Shoot the symbols I, I, and V on both Staff of Ice murals (Taurus and Orion) rapidly to activate the Aether remix.',
    steps: [
      { order: 1, label: 'Rapidly shoot I, I, and V on the bull mural (Tombs) and the archer mural (Neolithic Catacombs).', buildableReferenceSlug: 'staff-of-ice-the-tomb' },
    ],
  },

  // ——— The Tomb (BO6): Side Quests ———

  {
    gameShortName: 'BO6',
    mapSlug: 'the-tomb',
    name: 'Golden Armor',
    slug: 'golden-armor-the-tomb',
    type: 'SIDE_QUEST',
    xpReward: 0,
    videoEmbedUrl: 'https://www.youtube.com/embed/_00pt1__3Zk?start=279',
    description:
      'Complete a side Easter Egg to obtain self-regenerative Armor (Golden Armor). Recommended for the Sentinel Artifact boss fight.',
    steps: [
      { order: 1, label: 'Complete the Golden Armor side quest steps to earn self-regenerating armor.' },
    ],
  },
  {
    gameShortName: 'BO6',
    mapSlug: 'the-tomb',
    name: 'Skeleton Army',
    slug: 'skeleton-army-the-tomb',
    type: 'SIDE_QUEST',
    xpReward: 0,
    videoEmbedUrl: 'https://www.youtube.com/embed/_00pt1__3Zk?start=577',
    description:
      'Equip Brain Rot Ammo Mod on a bullet weapon. Shoot four skulls with an X on the forehead in this order, in quick succession: (1) Ossuary—bottom right of northern-most wall in room with sacrificial table; (2) Ossuary—floor between spike traps near sacrificial table; (3) Ossuary—by green portal, floor above circular stone; (4) Amongst the pile of skulls at bottom of Doppelghast statue. Four Brain-Rotted zombies rise and explode, leaving intel (Potts and Pains Pt 4).',
    steps: [
      { order: 1, label: 'With Brain Rot equipped, shoot the four X-marked skulls in the correct order quickly. Collect the intel after the zombies explode.' },
    ],
  },
  {
    gameShortName: 'BO6',
    mapSlug: 'the-tomb',
    name: 'Jumpscare Easter Egg',
    slug: 'jumpscare-the-tomb',
    type: 'SIDE_QUEST',
    xpReward: 0,
    videoEmbedUrl: 'https://www.youtube.com/embed/_00pt1__3Zk?start=617',
    description:
      'Stone statue of a woman (back turned) appears in one of three spots: behind and left of Mystery Box in Neolithic Catacombs; outside window of Deadshot room; on stone pillar above Quick Revive. Shoot her—she turns, eyes turn red, disappears. Voices and whispers play; later a demonic face jumpscare. Melee another player after shooting the statue to pass the jumpscare and earn "Friendship Ended" Dark Ops Calling Card.',
    steps: [
      { order: 1, label: 'Find and shoot the woman statue at one of the three locations. Survive the later jumpscare; optionally melee a teammate to pass it and earn the calling card.' },
    ],
  },
  {
    gameShortName: 'BO6',
    mapSlug: 'the-tomb',
    name: 'Free Essence & Full Power',
    slug: 'free-essence-full-power-the-tomb',
    type: 'SIDE_QUEST',
    xpReward: 0,
    categoryTag: 'Free Powerup',
    videoEmbedUrl: 'https://www.youtube.com/embed/_00pt1__3Zk?start=10',
    description:
      'Equip Dead Wire Ammo Mod. In the Dig Site, shoot two blue generators: one below the Tier 2 Armor wall buy; one left of the bottom stairs to the Gobblegum machine. A Full Power spawns atop the fallen pillar and two x500 Essence canisters spawn.',
    steps: [
      { order: 1, label: 'With Dead Wire, shoot both blue generators in the Dig Site. Collect Full Power and Essence from the pillar.' },
    ],
  },
  {
    gameShortName: 'BO6',
    mapSlug: 'the-tomb',
    name: 'Free Ray Gun',
    slug: 'free-ray-gun-the-tomb',
    type: 'SIDE_QUEST',
    xpReward: 0,
    categoryTag: 'Free Powerup',
    videoEmbedUrl: 'https://www.youtube.com/embed/_00pt1__3Zk?start=160',
    description:
      'With a shovel, interact with dig sites around the map for Salvage, armor, weapons, perks, etc. With Death Perception equipped, green "Ancient Gems" can appear. Collect all three and deposit at the left-most statue when facing the bull drawing in the Tombs. Elite Doppelghast and regular Doppelghasts spawn; defeat them, then interact the statue for 1000 Essence and a free Ray Gun.',
    steps: [
      { order: 1, label: 'Use shovel at dig sites with Death Perception to find three Ancient Gems. Deposit at left statue (facing bull) in Tombs; kill Elite and Doppelghasts; interact statue for 1000 Essence and Ray Gun.' },
    ],
  },
  {
    gameShortName: 'BO6',
    mapSlug: 'the-tomb',
    name: 'Free Raw Aetherium & Cryo Freeze',
    slug: 'free-aetherium-cryo-the-tomb',
    type: 'SIDE_QUEST',
    xpReward: 0,
    categoryTag: 'Free Powerup',
    description:
      'In the Dark Aether Nexus, a floating rock sparks blue when the player enters. Shoot it; five rocks move and must all be shot. Reward: Raw Aetherium Crystal and Cryo Freeze Ammo Mod.',
    steps: [
      { order: 1, label: 'In Dark Aether Nexus, shoot the blue-sparking floating rock, then shoot all five moving rocks for Raw Aetherium Crystal and Cryo Freeze.' },
    ],
  },
  {
    gameShortName: 'BO6',
    mapSlug: 'the-tomb',
    name: 'Free Aether Tool (Cryo Waterfalls)',
    slug: 'free-aether-tool-the-tomb',
    type: 'SIDE_QUEST',
    xpReward: 0,
    categoryTag: 'Free Powerup',
    videoEmbedUrl: 'https://www.youtube.com/embed/_00pt1__3Zk?start=58',
    description:
      'In the Dark Aether Nexus near the green door, two waterfalls can be shot with a weapon equipped with Cryo Freeze. An Aether Tool drops; rarity by round: 1–11 Rare, 12–21 Epic, 22+ Legendary.',
    steps: [
      { order: 1, label: 'Shoot both waterfalls near the green door in Dark Aether Nexus with Cryo Freeze. Collect the Aether Tool (rarity depends on round).' },
    ],
  },
  {
    gameShortName: 'BO6',
    mapSlug: 'the-tomb',
    name: 'Free Random Perk',
    slug: 'free-random-perk-the-tomb',
    type: 'SIDE_QUEST',
    xpReward: 0,
    categoryTag: 'Free Powerup',
    videoEmbedUrl: 'https://www.youtube.com/embed/_00pt1__3Zk?start=122',
    description:
      'In the Speed Cola room of the Ossuary, six unlit stone braziers (two beside each entrance). Ignite them with Napalm Burst Ammo Mod or Molotovs; a Random Perk spawns in the middle of the room.',
    steps: [
      { order: 1, label: 'Light all six braziers in the Ossuary Speed Cola room with Napalm Burst or Molotovs. Collect the Random Perk in the center.' },
    ],
  },
  {
    gameShortName: 'BO6',
    mapSlug: 'the-tomb',
    name: 'Free Self Revive & Light Mend',
    slug: 'free-self-revive-light-mend-the-tomb',
    type: 'SIDE_QUEST',
    xpReward: 0,
    categoryTag: 'Free Powerup',
    videoEmbedUrl: 'https://www.youtube.com/embed/_00pt1__3Zk?start=429',
    description:
      'Earn a free self-revive and Light Mend Ammo Mod from a map Easter Egg.',
    steps: [
      { order: 1, label: 'Complete the steps shown in the guide to obtain the free self-revive and Light Mend Ammo Mod.' },
    ],
  },
  {
    gameShortName: 'BO6',
    mapSlug: 'the-tomb',
    name: 'Free 1000 Points',
    slug: 'free-1000-points-the-tomb',
    type: 'SIDE_QUEST',
    xpReward: 0,
    categoryTag: 'Free Powerup',
    videoEmbedUrl: 'https://www.youtube.com/embed/_00pt1__3Zk?start=542',
    description:
      'Obtain 1000 free points from a hidden source on the map.',
    steps: [
      { order: 1, label: 'Follow the guide to obtain 1000 free points.' },
    ],
  },
  // ——— Shattered Veil (BO6): Main Quest ———

  {
    gameShortName: 'BO6',
    mapSlug: 'shattered-veil',
    name: 'Shattered Veil Main Quest',
    slug: 'shattered-veil-main-quest',
    type: 'MAIN_QUEST',
    xpReward: 5500,
    videoEmbedUrl: 'https://www.youtube.com/embed/3yfg7wYZR5Q',
    description:
      'Hunt Edward Richtofen in his mansion with S.A.M. Prerequisites: Pack-a-Punch unlocked and Ray Gun Mark II constructed (box pull alone is not enough). Three rituals require the three Ray Gun Mark II upgrades (W, P, R).',
    rewardsDescription: 'Teleport to Garden Pond with perks, Bonus Points, Aether Tools, crystals, Legendary weapons, Salvage, random Wonder Weapon.',
    steps: [
      {
        order: 1,
        label: 'Metal Hip Flask: Get Ray Gun Mark II-W and keep it. Sconce from Banquet Hall cardboard box. Grand Foyer—place Sconce next to Juggernog, interact lamps, complete Simon Says → Distillery. Computer + kills with Mark II-W open portal to Liminal Distillery. Get Bell in Study (cabinets/shelves/TVs). Overlook bar—bring Brain Rotted zombie, ring Bell → Metal Hip Flask. Place on pedestal in Liminal Distillery, kill Mangler HVT with Mark II-W.',
        buildableReferenceSlug: 'ray-gun-mark-ii-w-shattered-veil',
      },
      {
        order: 2,
        label: 'Antler Carving: Get Ray Gun Mark II-P and keep it. Banquet Hall computer + kills with Mark II-P → portal to Liminal Banquet Hall. Get Ritual Elixir inside. Interact 3 goblets (Bottlery table by wine; Garden Pond stone bench; Overlook bench) to spawn and kill Elder Disciples. Three number sets appear on Banquet Hall walls. West Hallways safe—enter numbers left to right, get Antler Carving. Place on pedestal in Liminal Banquet Hall, kill Elder Disciple HVT with Mark II-P.',
        buildableReferenceSlug: 'ray-gun-mark-ii-p-shattered-veil',
      },
      {
        order: 3,
        label: 'Nuclear Plant Inspection Report: Get Ray Gun Mark II-R and keep it. Library computer + kills with Mark II-R → portal to Liminal Library. Using Aether Shroud, collect ledger, audio log, ID tag (ID in one of 3 fireplaces: East Foyer, Banquet Hall, Study; audio & ledger on desks: East Foyer, Overlook, Study). Library: 3 books light up—interact in spine order (single circle, circle with vertical line, three small circles). Shelf opens; get Report. Place on pedestal in Liminal Library, kill Amalgam HVT with Mark II-R.',
        buildableReferenceSlug: 'ray-gun-mark-ii-r-shattered-veil',
      },
      {
        order: 4,
        label: 'Boss: Return to Mainframe Chamber. Place the Sentinel Artifact in front of S.A.M. to start the Z-Rex boss fight cutscene and battle.',
      },
    ],
  },

  // ——— Shattered Veil (BO6): Buildables ———

  {
    gameShortName: 'BO6',
    mapSlug: 'shattered-veil',
    name: 'Pack-a-Punch',
    slug: 'pack-a-punch-shattered-veil',
    type: 'BUILDABLE',
    xpReward: 0,
    videoEmbedUrl: 'https://www.youtube.com/embed/dlI_9pyjiWY',
    description:
      'Fuse from zombies in corner on top floor of Library. Circuit Board from shooting Richtofen\'s computer in Director\'s Quarters. Repair the Elevator (Banquet Hall) with both parts; ride to Security Overlook to unlock Pack-a-Punch in the Mainframe Chamber area.',
    steps: [
      { order: 1, label: 'Get Fuse (Library top floor, zombie corner) and Circuit Board (Director\'s Quarters, shoot computer). Repair Elevator and travel to Security Overlook; clear the path to Pack-a-Punch.' },
    ],
  },
  {
    gameShortName: 'BO6',
    mapSlug: 'shattered-veil',
    name: 'Ray Gun Mark II (Free)',
    slug: 'ray-gun-mark-ii-shattered-veil',
    type: 'BUILDABLE',
    xpReward: 0,
    videoEmbedUrl: 'https://www.youtube.com/embed/1zd7QPVKOjg?start=12',
    description:
      'Round 10+: Lab Technician (purple eyes) in Mainframe Chamber or Security Overlook drops Floppy Disk. East Foyer: place disk in fax machine, wait for document. Read document—word is MOTH, CRAB, YETI or WORM. Nursery: chalkboard has letter groups; convert each letter of the word to a number (count letters in that letter\'s group). Service Tunnel: enter code on keypad, kill Doppelghast for Severed Arm. Armory (Supply Depot): place arm on right side of case to open and get Ray Gun Mark II.',
    steps: [
      { order: 1, label: 'Get Floppy Disk from Lab Technician (round 10+). East Foyer fax → read word. Nursery chalkboard: word to 4-digit code. Service Tunnel keypad → kill Doppelghast → Severed Arm. Armory: place arm, take Ray Gun Mark II.' },
    ],
  },
  {
    gameShortName: 'BO6',
    mapSlug: 'shattered-veil',
    name: 'Ray Gun Mark II-W',
    slug: 'ray-gun-mark-ii-w-shattered-veil',
    type: 'BUILDABLE',
    xpReward: 0,
    videoEmbedUrl: 'https://www.youtube.com/embed/1zd7QPVKOjg?start=160',
    description:
      'Requires Empty Canister (blue crystal with Mark II, Kazimir at Rear Patio window, or Mainframe container A/B + valves in Service Tunnel + explosive). Shem\'s Henge: place Empty Canister in device by Speed Cola. Abomination spawns—have it shoot electric beams at three smaller rocks to glow blue, then charge to make them float. Lockdown: kill all Vermin. Empty Canister becomes Explosive Canister. Supply Depot workbench → craft Ray Gun Mark II-W.',
    steps: [
      { order: 1, label: 'Get Empty Canister. Place in Shem\'s Henge device. Use Abomination to power three rocks (beams then charge). Survive lockdown. Craft Mark II-W at Supply Depot workbench.', buildableReferenceSlug: 'ray-gun-mark-ii-shattered-veil' },
    ],
  },
  {
    gameShortName: 'BO6',
    mapSlug: 'shattered-veil',
    name: 'Ray Gun Mark II-P',
    slug: 'ray-gun-mark-ii-p-shattered-veil',
    type: 'BUILDABLE',
    xpReward: 0,
    videoEmbedUrl: 'https://www.youtube.com/embed/1zd7QPVKOjg?start=394',
    description:
      'Two Refractors: Conservatory fountain; South West Balcony fountain. Essence Bomb from Project Janus breakable box → use on rubble next to Tier III Armor in Service Tunnel → Serpent Mound. Place Empty Canister in device; blue crystal shoots beam. Place Refractors to guide beam to Doppelghast statue; hit crystal to spawn Doppelghast. Repeat twice (third is HVT). Get Light Canister. Director\'s Quarters workbench → craft Ray Gun Mark II-P.',
    steps: [
      { order: 1, label: 'Get Refractors and Essence Bomb; open Serpent Mound. Use device with Empty Canister and Refractors to kill three Doppelghasts. Get Light Canister and craft Mark II-P in Director\'s Quarters.', buildableReferenceSlug: 'ray-gun-mark-ii-shattered-veil' },
    ],
  },
  {
    gameShortName: 'BO6',
    mapSlug: 'shattered-veil',
    name: 'Ray Gun Mark II-R',
    slug: 'ray-gun-mark-ii-r-shattered-veil',
    type: 'BUILDABLE',
    xpReward: 0,
    videoEmbedUrl: 'https://www.youtube.com/embed/1zd7QPVKOjg?start=271',
    description:
      'Empty Canister + 4 Aether Seeds (destroy plant growth with explosive or fire—spawns: South West Balcony, Rear Patio, Motor Court, Conservatory fountain, Garden Pond bridge). Place Empty Canister in Conservatory device. Place one Aether Seed in a planter, defend until it grows; repeat for all four. Get Toxic Canister. Garden Pond workbench → craft Ray Gun Mark II-R.',
    steps: [
      { order: 1, label: 'Get Empty Canister and 4 Aether Seeds. Conservatory device: plant and defend four seeds. Get Toxic Canister and craft Mark II-R at Garden Pond workbench.', buildableReferenceSlug: 'ray-gun-mark-ii-shattered-veil' },
    ],
  },
  {
    gameShortName: 'BO6',
    mapSlug: 'shattered-veil',
    name: 'Wunderwaffe DG-2 (Free)',
    slug: 'wunderwaffe-dg2-shattered-veil',
    type: 'BUILDABLE',
    xpReward: 0,
    videoEmbedUrl: 'https://www.youtube.com/embed/SzMHsM40SxA?start=545',
    description:
      'Not required for Main Quest; cannot be obtained until at least one Ritual is completed. Complete the Jumpscare Easter Egg (Thermal Scope, round 13+, find ghost lady at 5 possible windows four times, then Nursery antique mirror). After the jumpscare, open the antique mirror for rewards; the mirror also starts the Wunderwaffe DG-2 quest.',
    steps: [
      { order: 1, label: 'Complete Jumpscare egg (ghost lady 4 times, Nursery mirror). Open antique mirror to access Wunderwaffe DG-2 steps.' },
    ],
  },

  // ——— Shattered Veil (BO6): Music ———

  {
    gameShortName: 'BO6',
    mapSlug: 'shattered-veil',
    name: 'Falling To Pieces',
    slug: 'music-falling-to-pieces-shattered-veil',
    type: 'MUSICAL',
    xpReward: 0,
    videoEmbedUrl: 'https://www.youtube.com/embed/SzMHsM40SxA?start=831',
    description:
      'Interact with three Mister Peeks headphones: Conservatory—under staircase in room with covered statue, on wooden crate; Banquet Hall—right corner behind elevator to Mainframe Chamber, on shelf; Service Tunnel—next to charred body right of Tier 3 Armor, on cardboard box.',
    steps: [
      { order: 1, label: 'Interact with all three headphones in Conservatory, Banquet Hall, and Service Tunnel.' },
    ],
  },

  // ——— Shattered Veil (BO6): Side Quests ———

  {
    gameShortName: 'BO6',
    mapSlug: 'shattered-veil',
    name: 'Friendly Doppelghast (Donut)',
    slug: 'friendly-doppelghast-donut-shattered-veil',
    type: 'SIDE_QUEST',
    xpReward: 0,
    videoEmbedUrl: 'https://www.youtube.com/embed/SzMHsM40SxA?start=195',
    description:
      'Find 6 Mr. Peeks plushie parts: Bottlery wine rack; Garden Pond between tree and end of bridge; Conservatory wall in front of Quick Revive; between Lower Terrace and Shem\'s Henge entrance; Library behind a frame; Rear Patio in bucket next to Ammo Box. Motor Court: find parts on sand bags, repair Mr. Peeks. Plushie runs into dog house; friendly Vermin "Donut" spawns. As Donut kills enemies it evolves into friendly Parasite, then friendly Doppelghast. Companion until it de-spawns or is killed.',
    steps: [
      { order: 1, label: 'Collect all 6 plushie parts. Motor Court: repair Mr. Peeks on sand bags. Donut spawns and evolves as it gets kills.' },
    ],
  },
  {
    gameShortName: 'BO6',
    mapSlug: 'shattered-veil',
    name: 'S.A.M. Laser Trap',
    slug: 'sam-laser-trap-shattered-veil',
    type: 'SIDE_QUEST',
    xpReward: 0,
    videoEmbedUrl: 'https://www.youtube.com/embed/SzMHsM40SxA?start=97',
    description:
      'Interact with 4 computers in order; only 1 per round. Order: Security Overlook → Study → Overlook → West Hallways. Last computer screen turns RED; interact computer case on ground for Floppy Disk. Place Floppy in computer case in Security Overlook. Wait a round—screen shows "Cleaning"; interact → "System Rebooting". Wait another round—"S.A.M. Infected"; interact. Mainframe Chamber: activate S.A.M. each round for 2000 Essence to shoot enemies with lasers.',
    steps: [
      { order: 1, label: 'Activate one computer per round in order (Security Overlook, Study, Overlook, West Hallways). Get Floppy, place in Security Overlook, wait rounds, then use S.A.M. in Mainframe for 2000 Essence per round.' },
    ],
  },
  {
    gameShortName: 'BO6',
    mapSlug: 'shattered-veil',
    name: 'Jumpscare Easter Egg',
    slug: 'jumpscare-shattered-veil',
    type: 'SIDE_QUEST',
    xpReward: 0,
    videoEmbedUrl: 'https://www.youtube.com/embed/SzMHsM40SxA?start=278',
    description:
      'Weapon with Thermal Scope. Round 13+: Ghost lady with red eyes appears at one of 5 windows (Motor Court behind boy statue; Motor Court above mansion main entrance balcony; Rear Patio above right entry to Elevator room; West Balcony southern-most window; South West Balcony next to blue crystal). Look at her through Thermal until she disappears. Find her four times. Nursery: interact antique mirror next to bed (starts Wunderwaffe DG-2 quest). Jumpscare plays; mirror opens. Inside: up to 4 rewards (x900 Salvage/x500 Essence; Epic/Legendary Aether Tool or Scorestreak; Random Perk guaranteed; "Deed of Sale" Intel first time only).',
    steps: [
      { order: 1, label: 'With Thermal Scope, find and look at ghost lady at 5 possible windows until she disappears; repeat 4 times total. Nursery: interact antique mirror for jumpscare and rewards; unlocks Wunderwaffe DG-2 quest.' },
    ],
  },
  {
    gameShortName: 'BO6',
    mapSlug: 'shattered-veil',
    name: 'Sleepwalking',
    slug: 'sleepwalking-shattered-veil',
    type: 'SIDE_QUEST',
    xpReward: 0,
    videoEmbedUrl: 'https://www.youtube.com/embed/SzMHsM40SxA?start=13',
    description:
      'Round 11+: Study—interact grandfather clock in corner. Director\'s Quarters: go prone on bed and end the round. Screen goes black; when it returns, follow white footprints (crouch walk to avoid waking sleeping zombies). Footprints lead to a chest. For better rewards, find a zombie with colored "Zs" above head, grab its keys, then open chest. Rewards: x900 Salvage/x500 Essence; Epic/Legendary Aether Tool or Scorestreak; Random Perk guaranteed; "A Monstrous Proposal" Intel first time only.',
    steps: [
      { order: 1, label: 'Round 11+, interact Study grandfather clock. Prone on Director\'s Quarters bed, end round. Follow white footprints (crouch); optionally get keys from Z-zombie for better chest rewards.' },
    ],
  },
  {
    gameShortName: 'BO6',
    mapSlug: 'shattered-veil',
    name: 'Hardcore Z-Rex Boss Fight',
    slug: 'hardcore-zrex-shattered-veil',
    type: 'SIDE_QUEST',
    xpReward: 0,
    videoEmbedUrl: 'https://www.youtube.com/embed/SzMHsM40SxA?start=642',
    description:
      'After reaching Round 101, if a player activates the Z-Rex\'s 2nd Phase, the arena is immersed in green fog (Max Ammo Round style) and the Z-Rex looks and acts as aggressive as Final Phase.',
    steps: [
      { order: 1, label: 'Reach round 101 and trigger Z-Rex 2nd Phase for the hardcore variant.' },
    ],
  },
  {
    gameShortName: 'BO6',
    mapSlug: 'shattered-veil',
    name: 'Marine SP Free Rarity & Pack-a-Punch',
    slug: 'marine-sp-upgrade-shattered-veil',
    type: 'SIDE_QUEST',
    xpReward: 0,
    videoEmbedUrl: 'https://www.youtube.com/embed/SzMHsM40SxA?start=705',
    description:
      'Marine SP from Loadout, Wall Buy or Mystery Box. Death Perception equipped. Banquet Hall: beneath three deer heads is a wallmount—place Marine SP. Middle deer moves; shoot left deer to make middle show a Field Upgrade icon. Change your Field Upgrade to match. Kill zombies with that Field Upgrade until a Mangler spawns. Kill Mangler, pick up Marine SP (better rarity). Repeat each round until Legendary; then one more cycle for Tier I Pack-a-Punch. Solo: can reach PaP Tier III by leaving and rejoining after each cycle.',
    steps: [
      { order: 1, label: 'Place Marine SP on Banquet Hall wallmount. Match Field Upgrade to deer icon, kill zombies, kill Mangler, repeat until Legendary then PaP. Solo: rejoin to reach Tier III PaP.' },
    ],
  },
  {
    gameShortName: 'BO6',
    mapSlug: 'shattered-veil',
    name: 'Fog Rolling In',
    slug: 'fog-rolling-in-shattered-veil',
    type: 'SIDE_QUEST',
    xpReward: 0,
    description:
      'Wunderwaffe DG-2 equipped. Supply Depot (outside Armory): left side under machines behind metal grate—pick up baby vermin. Bottom of left stairs to Pack-a-Punch: wall behind zombie spawn window has sign with Orange, Pink, Green chemicals and black droplets (e.g. Green 2, Orange 1, Pink 3 → order Orange, Green, Pink). Mainframe Chamber: desk by Crafting Table with tray and bottles—place baby vermin. Shoot chemicals in that order (blue cap = Orange, white bottle = Green, pill bottle = Pink). Baby oozes yellow; pick up. West Hallways/Overlook: one of three microwaves—place baby, wait until red, collect. Mainframe Chamber: right side of PaP stairs, blood puddle—place baby. Shoot inactive fan with Wunderwaffe to suck baby in (red smoke). Motor Court: Chopper Gunner, shoot every chimney with red smoke (fireworks). Exit Chopper; fog engulfs map for ~1 min, Aether crystals spawn. Reference to "fog rolling in" Origins meme.',
    steps: [
      { order: 1, label: 'Get baby vermin, read chemical order on wall. Mainframe tray: shoot chemicals in order. Microwave baby until red. Blood puddle + fan with Wunderwaffe. Chopper Gunner: shoot red-smoke chimneys for fog and crystals.' },
    ],
  },
  {
    gameShortName: 'BO6',
    mapSlug: 'shattered-veil',
    name: 'Free Random Perk (Bell)',
    slug: 'free-random-perk-bell-shattered-veil',
    type: 'SIDE_QUEST',
    xpReward: 0,
    categoryTag: 'Free Powerup',
    videoEmbedUrl: 'https://www.youtube.com/embed/SzMHsM40SxA?start=406',
    description:
      'Obtain the Metal Hip Flask (main quest item or side method). Ring the bell on the bar in Overlook 115 times to spawn a Random Perk.',
    steps: [
      { order: 1, label: 'With Metal Hip Flask obtained, ring the Overlook bar bell 115 times for a Random Perk.' },
    ],
  },
  {
    gameShortName: 'BO6',
    mapSlug: 'shattered-veil',
    name: 'Free Legendary PaP Shotgun',
    slug: 'free-legendary-pap-shotgun-shattered-veil',
    type: 'SIDE_QUEST',
    xpReward: 0,
    categoryTag: 'Free Powerup',
    videoEmbedUrl: 'https://www.youtube.com/embed/SzMHsM40SxA?start=705',
    description:
      'Earn a free Legendary Pack-a-Punched shotgun from a map Easter Egg.',
    steps: [
      { order: 1, label: 'Complete the steps in the guide to obtain the free Legendary PaP shotgun.' },
    ],
  },
  {
    gameShortName: 'BO6',
    mapSlug: 'shattered-veil',
    name: 'Free Lethal Equipment',
    slug: 'free-lethal-shattered-veil',
    type: 'SIDE_QUEST',
    xpReward: 0,
    categoryTag: 'Free Powerup',
    videoEmbedUrl: 'https://www.youtube.com/embed/SzMHsM40SxA?start=859',
    description:
      'Obtain free lethal equipment from a hidden source on the map.',
    steps: [
      { order: 1, label: 'Follow the guide to obtain free lethal equipment.' },
    ],
  },

  // ——— Reckoning (BO6): Main Quest ———

  {
    gameShortName: 'BO6',
    mapSlug: 'reckoning',
    name: 'Reckoning Main Quest',
    slug: 'reckoning-main-quest',
    type: 'MAIN_QUEST',
    xpReward: 6500,
    videoEmbedUrl: 'https://www.youtube.com/embed/tnbfeAFu7OY',
    description:
      'Unleash the Sentinel Artifact in Janus Towers; choose to restore Richtofen\'s family or create a new body for S.A.M. Prerequisites: Pack-a-Punch and Gorgofex (upgrades optional). Many steps can be done in parallel.',
    rewardsDescription: 'Teleport to T1 Project Janus Reception with perks, Bonus Points, Aether Tools, crystals, Legendary weapons, Salvage, random Wonder Weapon.',
    steps: [
      {
        order: 1,
        label: 'DNA vial: Kill Geneticist Zombie in T1 Mutant Research Lab (spawns after PaP) for keycard. Use keycard on fridge in T1 Mutant Research Test Area; retrieve DNA vial.',
      },
      {
        order: 2,
        label: 'Open T2 Teleportation Lab: Get Syringe from Genome Sequencer (Mutant Research Lab). T2 Sublevel 10—jump into Particle Accelerator beam to knock zombie down, get Blood Sample. Return Syringe to Sequencer. Fowler-Mangler breaks out; kill for Fowler-Mutant Injection (Toxic Zombies + Elder Disciple spawn). T2 Dark Entity Containment: use injection then interact scanner to reveal teleporter.',
      },
      {
        order: 3,
        label: 'Reboot Particle Accelerator: Find 4 S.A.M. Files folders (6 possible: BND Badge, Notso\'s Collar, Katana, Wristwatch, Combat Goggles, Scarf in Executive Suite, Director\'s Office, T2 Teleportation Lab). Order by archived date; use File Numbers for 4-digit code. Enter code in T2 Teleportation Lab PC ("Granted Access").',
      },
      {
        order: 4,
        label: 'Free Bio Aetheric Portal: T2 Sublevel 10—interact red button near "[Boost] READY" screens. Beam overcharges. Kill 5 Quantum Vermins with Gorgofex in room; interact device to fuel Gorgofex. Do not use Gorgofex. T2 Teleportation Lab: charge Gorgofex, shoot teleporter to destroy crystals. Do not enter portal yet (instant death).',
        buildableReferenceSlug: 'gorgofex-reckoning',
      },
      {
        order: 5,
        label: 'Cleanse Fungal Head: Quantum Computing Core—shoot zombie in window with charged Gorgofex for Fungal Head. Get yellow mop bucket (Reception, Executive Suite, or Android Assembly); move under fire sprinkler, activate with equipment under smoke detector. Place head in bucket, kill zombies until eyes glow purple (or carry head). Return to T2 Teleportation Lab (shadow damages); place head in Bio-Aetheric Portal.',
      },
      {
        order: 6,
        label: 'Build Franken Klaus: Shoot Kommando Klaus for left and right arms (1 per special round, or both next round). Get left/right Klaus legs in T2 Android Assembly (shelf, broken mirror, scrap pile, behind door). Place parts on hanging Klaus; Uber Klaus electricity attack to activate. Franken-Klaus hacks S.A.M. Trial in Dark Entity Containment then T2 Teleportation Lab. Quantum Computing Core: Melee Macchiato on purple brain container; bring brain to machine by Franken-Klaus (timed, no weapons). Janus containers unlock.',
      },
      {
        order: 7,
        label: 'Activate Bio Aetheric Portal: Janus containers (Reception, Mutant Research Test Area, Android Assembly, Dark Entity Containment, Teleporter Lab) each have Vacuum-Seal Device. Pick one; items levitate with purple mist—throw device to collect. Repeat for 4 items total. T2 Teleportation Lab: place devices on terminal, interact, survive lockdown. Turn 6 red levers green (one at a time). Portal linked to Tower 3.',
      },
      {
        order: 8,
        label: 'Tower 3: Interact Sentinel Artifact in Lift; choose Richtofen or S.A.M. T3 Vault 1: 3 LTG soul boxes, kill zombies near them. T3 Vault 2: destroy all aether crystals (specific sound). Lift rises to top → Boss fight (S.A.M. or Uber Richtofen). Hardcore at round 101: red fog, stronger enemies; S.A.M. in final phase + Amalgams; Richtofen spawns Maintenance Klaus.',
      },
    ],
  },

  // ——— Reckoning (BO6): Buildables ———

  {
    gameShortName: 'BO6',
    mapSlug: 'reckoning',
    name: 'Pack-a-Punch',
    slug: 'pack-a-punch-reckoning',
    type: 'BUILDABLE',
    xpReward: 0,
    videoEmbedUrl: 'https://www.youtube.com/embed/K0LuwOJXMIE',
    description:
      'T1 Executive Office: interact snow globe. T2 Sublevel 10: restart Particle Accelerator. Shoot 12–15 Aetherium crystals (count depends on players) around the room to spawn Pack-a-Punch. It periodically teleports in the area.',
    steps: [
      { order: 1, label: 'Snow globe in Executive Office; Sublevel 10 restart accelerator and destroy crystals to spawn PaP.' },
    ],
  },
  {
    gameShortName: 'BO6',
    mapSlug: 'reckoning',
    name: 'Gorgofex',
    slug: 'gorgofex-reckoning',
    type: 'BUILDABLE',
    xpReward: 0,
    videoEmbedUrl: 'https://www.youtube.com/embed/MwpRdLIFSvo',
    description:
      'Requires PaP. Two monitors show words (Mutant Research Lab between Mangler tub and Deadshot; Mutant Research Test Area by Richtofen clone tub). First letter of each = element; periodic table in Test Area gives atomic number → 3-digit code (pad with 0s). Keypad opens T1 Bioweapons Lab. Cyst in glass hood: bring 3 Vermins then 3 Zombies near, lower health for Cyst to absorb; interact to pick up. T1 Quantum Computing Core: stand under 3 yellow Aetheric Flora (cyst drains, flora shoots acid). T2 Dark Entity Containment: "Initiate Power Surge", interact 3 computers quickly. Uber Klaus spawns—destroy shoulder pads, lure to electrified panel in front of Forsaken chamber. Forsaken fuses with Klaus; kill Forsaken, interact orb; Cyst + orb = Gorgofex.',
    steps: [
      { order: 1, label: 'Get code from monitors and periodic table; open Bioweapons Lab. Feed Cyst (3 Vermins, 3 Zombies). Power Cyst at 3 Flora. Power Surge, Uber Klaus to panel, kill Forsaken, combine Cyst with orb.', buildableReferenceSlug: 'pack-a-punch-reckoning' },
    ],
  },
  {
    gameShortName: 'BO6',
    mapSlug: 'reckoning',
    name: 'Gorgofex C',
    slug: 'gorgofex-c-reckoning',
    type: 'BUILDABLE',
    xpReward: 0,
    videoEmbedUrl: 'https://www.youtube.com/embed/B27Y1ARMV2A?start=625',
    description:
      'T1 Project Janus Reception: interact red button. Klaus shutdown; T1 Aetheric Elevator to Quantum Computing Core shuts off. Reach Quantum Computing Core by other route; look down elevator shaft, see 3 red buttons. Jump down and interact all 3 (player returns to Core). Kill all blue-effect zombies with Gorgofex. Panos materializes; interact for Gorgofex C. Can be Pack-a-Punched to Corpsloder. Other variant (N) then in Mystery Box.',
    steps: [
      { order: 1, label: 'Reception red button → elevator off. Quantum Core via other path; jump shaft, hit 3 buttons. Kill blue zombies with Gorgofex; interact Panos for Gorgofex C.', buildableReferenceSlug: 'gorgofex-reckoning' },
    ],
  },
  {
    gameShortName: 'BO6',
    mapSlug: 'reckoning',
    name: 'Gorgofex N',
    slug: 'gorgofex-n-reckoning',
    type: 'BUILDABLE',
    xpReward: 0,
    videoEmbedUrl: 'https://www.youtube.com/embed/B27Y1ARMV2A?start=376',
    description:
      'Strauss Counter on terminal in T1 Quantum Computing Core. Get Life Drain Essence (counter 9+), shoot vial with charged Gorgofex. Find Clean Hood (T1 Bioweapons Lab), PC Fan (Dark Entity Containment left of Arsenal), Tubing (outside Quantum Computing Lab). T1 Executive Office: assemble Essence Extractor where Blanchard is. Place Life Drain vial; lockdown. Blanchard opens door, absorb essence; get Blanchard\'s Life Essence. Quickly to T1 Bioweapons Lab, interact Gorgofex by cyst → Gorgofex N. Can be Pack-a-Punched to Necrodystonia. Other variant (C) then in Mystery Box.',
    steps: [
      { order: 1, label: 'Strauss Counter Life Drain (9+), charged Gorgofex on vial. Get Clean Hood, PC Fan, Tubing. Assemble extractor, Life Drain vial, get Blanchard essence. Bioweapons Lab interact Gorgofex for Gorgofex N.', buildableReferenceSlug: 'gorgofex-reckoning' },
    ],
  },

  // ——— Reckoning (BO6): Music ———

  {
    gameShortName: 'BO6',
    mapSlug: 'reckoning',
    name: 'Remember Us',
    slug: 'music-remember-us-reckoning',
    type: 'MUSICAL',
    xpReward: 0,
    videoEmbedUrl: 'https://www.youtube.com/embed/wXLYA3OdCCw?start=331',
    description:
      'Interact with three Mister Peeks headphones: T1 Mutant Research Lab—floor next to corpse near cryo chamber with Elder Disciple; T2 Dark Entity Containment—corpse on chair in lower section; T1 Director\'s Office—cabinet shelf behind desk.',
    steps: [
      { order: 1, label: 'Interact with all three headphones in Mutant Research Lab, Dark Entity Containment, and Director\'s Office.' },
    ],
  },
  {
    gameShortName: 'BO6',
    mapSlug: 'reckoning',
    name: 'Samantha\'s Peace',
    slug: 'music-samanthas-peace-reckoning',
    type: 'MUSICAL',
    xpReward: 0,
    description:
      'After PaP is unlocked, run through the metal detectors in T1 Project Janus Reception in this order (from spawn): Left – Right – Middle – Left – Right – Middle – Left – Right – Middle – Left – Right – Middle.',
    steps: [
      { order: 1, label: 'Run through detectors in order: L-R-M repeated four times.', buildableReferenceSlug: 'pack-a-punch-reckoning' },
    ],
  },
  {
    gameShortName: 'BO6',
    mapSlug: 'reckoning',
    name: 'Samantha\'s Soul (Remix) & Free Self-Revive',
    slug: 'music-samanthas-soul-reckoning',
    type: 'MUSICAL',
    xpReward: 0,
    videoEmbedUrl: 'https://www.youtube.com/embed/wXLYA3OdCCw?start=305',
    description:
      'Director\'s Office: shoot the three pool balls on the wall in order 1 – 1 – 5. Samantha\'s Soul (Leo Sartwell Remix) plays and a free Self-Revive spawns on the pool table.',
    steps: [
      { order: 1, label: 'Shoot pool balls 1, 1, 5 in order on the Director\'s Office wall for the remix and Self-Revive.' },
    ],
  },

  // ——— Reckoning (BO6): Side Quests ———

  {
    gameShortName: 'BO6',
    mapSlug: 'reckoning',
    name: 'Hardcore Boss Fights',
    slug: 'hardcore-boss-reckoning',
    type: 'SIDE_QUEST',
    xpReward: 0,
    videoEmbedUrl: 'https://www.youtube.com/embed/wXLYA3OdCCw?start=696',
    description:
      'Round 101+: Starting Uber Richtofen or S.A.M. boss triggers hardcore mode. Arena in red fog (Max Ammo style), bosses have higher health and damage. S.A.M.: immediately in final phase, Amalgams spawn. Richtofen: Maintenance Klaus (high-health Kommando Klaus) spawns frequently.',
    steps: [
      { order: 1, label: 'Reach round 101 and start either boss fight for the hardcore variant.' },
    ],
  },
  {
    gameShortName: 'BO6',
    mapSlug: 'reckoning',
    name: 'Free Random Perk (Mr. Peeks Parachute)',
    slug: 'free-random-perk-peeks-reckoning',
    type: 'SIDE_QUEST',
    xpReward: 0,
    categoryTag: 'Free Powerup',
    videoEmbedUrl: 'https://www.youtube.com/embed/wXLYA3OdCCw?start=10',
    description:
      'Executive Suite: from above center structure (above Mutant Research Lab), shoot the Mr. Peeks doll. It floats up to railing opposite Crafting Table. Interact; it floats down leaving blue hoops. Parachute through all hoops on all floors; land at Reception bottom—Random Perk spawns.',
    steps: [
      { order: 1, label: 'Shoot Mr. Peeks from Executive Suite, interact, glide through all blue hoops with parachute, land at Reception for Random Perk.' },
    ],
  },
  {
    gameShortName: 'BO6',
    mapSlug: 'reckoning',
    name: 'Free Random Perk (Sublevel 10 Counter)',
    slug: 'free-random-perk-counter-reckoning',
    type: 'SIDE_QUEST',
    xpReward: 0,
    categoryTag: 'Free Powerup',
    videoEmbedUrl: 'https://www.youtube.com/embed/wXLYA3OdCCw?start=64',
    description:
      'Sublevel 10: numerical counter above control board (red button). Last four digits = points from Main Quest step (kill Aetheric Vermin). Score above 2000 for a free Random Perk in the control room. Unlockable only after progressing Main Quest.',
    steps: [
      { order: 1, label: 'During the main quest Aetheric Vermin step, score above 2000 points; Random Perk spawns in Sublevel 10 control room.' },
    ],
  },
  {
    gameShortName: 'BO6',
    mapSlug: 'reckoning',
    name: 'Aether Blade',
    slug: 'aether-blade-reckoning',
    type: 'SIDE_QUEST',
    xpReward: 0,
    videoEmbedUrl: 'https://www.youtube.com/embed/wXLYA3OdCCw?start=574',
    description:
      'Director\'s Office: 3 empty painting spots left of Arsenal. Paintings at: Project Janus Reception left-most door right of Red Portal; Android Assembly behind yellow wet floor sign right of top Anti-Grav Launcher; Sublevel 10 corner by broken elevator opposite GobbleGum (one at a time, place each in Office). Get ARC-XD. Dark Entity Containment: lower area under Forsaken cage, send ARC-XD through fence opening to back of cage, blow up Dark Aether crystal. Destroy all spawned crystals until Safe Key. Director\'s Office: behind desk, Mister Peeks Field Upgrade on painting right of Red Portal—safe revealed. Interact safe; lockdown (HVT Elder Disciple). Survive until screen flashes white. Safe contains Aether Blade, "Misdirection Pt1", "Brainiac" Intel.',
    steps: [
      { order: 1, label: 'Place 3 paintings in Director\'s Office. ARC-XD in Forsaken cage, destroy crystals for Safe Key. Mister Peeks on painting, survive safe lockdown; collect Aether Blade and intel.' },
    ],
  },
  {
    gameShortName: 'BO6',
    mapSlug: 'reckoning',
    name: 'Golden Trash Can',
    slug: 'golden-trash-can-reckoning',
    type: 'SIDE_QUEST',
    xpReward: 0,
    videoEmbedUrl: 'https://www.youtube.com/embed/wXLYA3OdCCw?start=149',
    description:
      'Seven trash cans in Janus Towers; four spit random loot (Salvage to Perk). Locations: Reception—left of Rampage Inducer by washroom door; opposite Quick Revive on corridor wall; Executive Suite—right corner before break room; behind Juggernog; left of Security Room door; left of Ammo Box; corner before Director\'s Office; Director\'s Office—opposite side dark corner. After finding the four that gave loot, return to spawn; golden-aura trash can appears. Interact for 1500 Points, 200 Salvage, Random Scorestreak, Self-Revive, Random Lethal, Random Tactical, "I\'m a Real Girl" Intel.',
    steps: [
      { order: 1, label: 'Interact trash cans to find the four that give loot. Return to spawn and interact the golden trash can for rewards.' },
    ],
  },
  {
    gameShortName: 'BO6',
    mapSlug: 'reckoning',
    name: 'Chicken Bucket Helmet',
    slug: 'chicken-bucket-helmet-reckoning',
    type: 'SIDE_QUEST',
    xpReward: 0,
    videoEmbedUrl: 'https://www.youtube.com/embed/wXLYA3OdCCw?start=923',
    description:
      'Executive Suite: Freedom Fried Chicken bucket on bar shelf. Throw lethal at bucket to knock it onto bar. Interact 6 chicken wings: bar counter by bucket; tray left of bucket; floor behind trash can; chair left of bar; under yellow chair at round table; floor left of lounge door. Pick up bucket and equip as cosmetic helmet until exfil or fail.',
    steps: [
      { order: 1, label: 'Knock chicken bucket off shelf with lethal; interact all 6 wings; equip bucket as helmet.' },
    ],
  },
  {
    gameShortName: 'BO6',
    mapSlug: 'reckoning',
    name: 'Target Practice',
    slug: 'target-practice-reckoning',
    type: 'SIDE_QUEST',
    xpReward: 0,
    videoEmbedUrl: 'https://www.youtube.com/embed/wXLYA3OdCCw?start=225',
    description:
      'Requires PaP. Project Janus Reception: stand on Project Janus logo (front of small staircase). Shoot Janus logo on TV dead-center; screen turns red, timer on TV. Shoot all red-outline Janus logos before time runs out. 1st completion: random Ammo Mod on reception table. Repeat for 2nd: random Aether Tool; 3rd: random Raw Aetherium Crystal. Round affects rarity.',
    steps: [
      { order: 1, label: 'Stand on logo, shoot TV logo, then all red-outline logos in time. Repeat up to 3 times for Ammo Mod, Aether Tool, Raw Crystal.', buildableReferenceSlug: 'pack-a-punch-reckoning' },
    ],
  },
  {
    gameShortName: 'BO6',
    mapSlug: 'reckoning',
    name: 'Aetherella',
    slug: 'aetherella-reckoning',
    type: 'SIDE_QUEST',
    xpReward: 0,
    videoEmbedUrl: 'https://www.youtube.com/embed/wXLYA3OdCCw?start=436',
    description:
      'Requires PaP and Gorgofex. Project Janus Reception: through broken washroom door (left of Rampage Inducer), emote spray first stall door left—Aetherella figure on floor. Shoot with charged Gorgofex; Aetherella rises and follows. Sublevel 10: jump into active laser beam (Aetherella floats). Jump into beam again and touch Aetherella; she shoots lasers at zombies for several rounds. Re-activate by jumping into Sublevel laser and touching doll again.',
    steps: [
      { order: 1, label: 'Spray first stall, charged Gorgofex on Aetherella. Sublevel 10 laser twice (second time contact doll). Re-activate by repeating laser contact.', buildableReferenceSlug: 'gorgofex-reckoning' },
    ],
  },
  {
    gameShortName: 'BO6',
    mapSlug: 'reckoning',
    name: 'Jumpscare',
    slug: 'jumpscare-reckoning',
    type: 'SIDE_QUEST',
    xpReward: 0,
    videoEmbedUrl: 'https://www.youtube.com/embed/wXLYA3OdCCw?start=883',
    description:
      'A jumpscare can be triggered somewhere on the map; see guide for location and trigger.',
    steps: [
      { order: 1, label: 'Follow the guide to trigger the jumpscare.' },
    ],
  },
  {
    gameShortName: 'BO6',
    mapSlug: 'reckoning',
    name: 'Vending Machine Easter Egg',
    slug: 'vending-machine-reckoning',
    type: 'SIDE_QUEST',
    xpReward: 0,
    videoEmbedUrl: 'https://www.youtube.com/embed/wXLYA3OdCCw?start=991',
    description:
      'Interact with or use a vending machine in a specific way to obtain rewards.',
    steps: [
      { order: 1, label: 'Follow the guide for the vending machine Easter Egg.' },
    ],
  },
  {
    gameShortName: 'BO6',
    mapSlug: 'reckoning',
    name: 'C.A.S.T.E.R. Turret Upgrade',
    slug: 'caster-turret-upgrade-reckoning',
    type: 'SIDE_QUEST',
    xpReward: 0,
    videoEmbedUrl: 'https://www.youtube.com/embed/wXLYA3OdCCw?start=1443',
    description:
      'Upgrade the C.A.S.T.E.R. Turret trap through a map Easter Egg.',
    steps: [
      { order: 1, label: 'Complete the steps in the guide to upgrade the C.A.S.T.E.R. Turret.' },
    ],
  },
  {
    gameShortName: 'BO6',
    mapSlug: 'reckoning',
    name: 'Free 3000 Points',
    slug: 'free-3000-points-reckoning',
    type: 'SIDE_QUEST',
    xpReward: 0,
    categoryTag: 'Free Powerup',
    videoEmbedUrl: 'https://www.youtube.com/embed/wXLYA3OdCCw?start=510',
    description:
      'Obtain 3000 free points from a hidden source on the map.',
    steps: [
      { order: 1, label: 'Follow the guide to obtain 3000 free points.' },
    ],
  },
  // ——— Ashes of the Damned (BO7): Main Quest ———

  {
    gameShortName: 'BO7',
    mapSlug: 'ashes-of-the-damned',
    name: 'Dust To Dust',
    slug: 'dust-to-dust-ashes',
    type: 'MAIN_QUEST',
    xpReward: 5000,
    videoEmbedUrl: 'https://www.youtube.com/embed/mH8qirnPvN4',
    description:
      'Save souls and confront the primordial guardian Veytharion. Requires Ol\' Tessie (fully upgraded), Necrofluid Gauntlet, and Klaus. Many steps can be completed simultaneously.',
    rewardsDescription: 'Teleport to Blackwater Lake with perks, Bonus Points, Aether Tools, crystals, Legendary weapons, Salvage, random Wonder Weapon.',
    steps: [
      { order: 1, label: 'Activate Klaus (Round 8+, Janus Towers Plaza wreckage opposite Warden 308; Stabilizer Chip → Sheriff\'s Office Ashwood; stun grenades on Klaus).', buildableReferenceSlug: 'klaus-ashes' },
      { order: 2, label: 'Acquire Necrofluid Gauntlet (Klaus to Zarya Support Systems panel, Aether Barrel → 3 Power Pumps, Vandorn Farm cellar cube, jump pad symbols, red eye, collect green orbs).', buildableReferenceSlug: 'necrofluid-gauntlet-ashes' },
      { order: 3, label: 'Ol\' Tessie first three upgrades: T.E.D.D.\'s Head (Janus Towers Plaza building, melee metal plate); PaP (Ashwood power, garage, drive Tessie in); Abomination Heads (Exit 115 cook key, freezer carcass).', buildableReferenceSlug: 'ol-tessie-ashes' },
      { order: 4, label: 'Concoct the Serum: Collect ingredients (Hoard Hunk Chunks, Widow\'s Lantern, Powder of the Forgotten, Ravager Eyes, Human Bones, Mysterious Limb). Zarya Yuri\'s Lab: powder reveals pigpen ciphers; interact ingredients in order; add blood, lockdown, kill with Gauntlet for souls.' },
      { order: 5, label: 'Open Seal of Sorrow: Pull three keys from Fog with Gauntlet (Bruin—melee only; Nightbird—no regen; Terrapin—slow). Bring each to Seal in Ruby Alley for DG-2 Turret Barrel.' },
      { order: 6, label: 'Gauntlet Challenges: Freeze Ashwood clock with DG-2; shoot with purple Gauntlet for charges. Complete Vandorn Farm (clock time, Pa\'s head, 4 ritual items, defend); Zarya (2 radar dishes, pigpen word + numbers); Exit 115 (lightning, Klaus + purple Gauntlet on clock, revive 3 corpses, match colors); Blackwater (soul, projector, 4 film reels, Klaus + Hellion Horn).' },
      { order: 7, label: 'Ol\' Tessie Rally: Interact Klaus at Blackwater; collect 3 orbs at each of 4 Fog areas in order (Monolith Forest, Collapsed Tower, Grounded Ship, Lost Cabins). Teleport to Veytharion\'s Sepulcher.' },
      { order: 8, label: 'Veytharion Boss: Ram Tessie to reveal weak spots. Avoid missiles; immune phase—DG-2 shot deflects, drive Tessie through beam to charge and ram him. Phase 2–3: more barrages, laser (hide or ram during charge). Green barnacles heal Tessie. Defeat for ending.' },
    ],
  },

  // ——— Ashes of the Damned (BO7): Buildables ———

  {
    gameShortName: 'BO7',
    mapSlug: 'ashes-of-the-damned',
    name: 'Pack-a-Punch & Ol\' Tessie',
    slug: 'ol-tessie-ashes',
    type: 'BUILDABLE',
    xpReward: 0,
    videoEmbedUrl: 'https://www.youtube.com/embed/OkOnwkWtiSk',
    description:
      'Ol\' Tessie: Wonder Vehicle for traversal; required for main quest. T.E.D.D.\'s Head in Janus Towers Plaza (building across from towers, melee metal plate)—enables driving. Restore Ashwood power via Power Pump; drive Tessie into garage; install PaP on workbench (also grants jet boost). Abomination Heads: Exit 115 diner—kill Cook zombie for freezer key; freezer in right hallway; collect carcass → Ashwood workbench. DG-2 Turret from main quest Seal of Sorrow.',
    steps: [
      { order: 1, label: 'T.E.D.D.\'s Head in Janus Towers Plaza. Ashwood power → garage → Tessie in → install PaP. Exit 115 cook key → freezer → Abomination carcass. DG-2 from Seal of Sorrow keys.' },
    ],
  },
  {
    gameShortName: 'BO7',
    mapSlug: 'ashes-of-the-damned',
    name: 'Klaus',
    slug: 'klaus-ashes',
    type: 'BUILDABLE',
    xpReward: 0,
    description:
      'Round 8+: Janus Towers Plaza, wreckage opposite Warden 308 Wall Buy—Uber Klaus spawns. Kill for Stabilizer Chip. Sheriff\'s Office at Ashwood: place chip on cell panel ("Update requires restart"). Inside cell, throw several Stun Grenades at Klaus rapidly; he comes online, grants Klaus Remote Control.',
    steps: [
      { order: 1, label: 'Kill Uber Klaus at Janus Towers Plaza wreckage for Stabilizer Chip. Sheriff\'s Office: place chip, stun Klaus in cell for Remote Control.' },
    ],
  },
  {
    gameShortName: 'BO7',
    mapSlug: 'ashes-of-the-damned',
    name: 'Necrofluid Gauntlet',
    slug: 'necrofluid-gauntlet-ashes',
    type: 'BUILDABLE',
    xpReward: 0,
    videoEmbedUrl: 'https://www.youtube.com/embed/6aYqeCIVUHU',
    description:
      'Requires Klaus. Zarya Cosmodrome Support Systems: send Klaus to panel by purchasable door; interact panel, stay in scanner until complete → Aether Barrel. Charge barrel at Power Pumps (Ashwood, Blackwater Lake, Vandorn Farm) in any order; timer resets per charge. No Jump Pads while carrying barrel. Fully charged barrel → Vandorn Farm cellar cube to absorb energy. Jump Pad (Janus Towers Plaza ↔ Vandorn Farm): see alchemical symbols on Barn, Shed, Farmhouse roofs; input on cube sides; interact red eye on fourth side → Gauntlet. Lockdown: shoot green orbs, reload to collect; Gauntlet then usable.',
    steps: [
      { order: 1, label: 'Klaus at Zarya panel → Aether Barrel. Charge at 3 Power Pumps. Cellar cube, then jump pad for symbols; input on cube, red eye; collect green orbs.', buildableReferenceSlug: 'klaus-ashes' },
    ],
  },
  {
    gameShortName: 'BO7',
    mapSlug: 'ashes-of-the-damned',
    name: 'Good Soldiers (Dempsey)',
    slug: 'good-soldiers-ashes',
    type: 'SIDE_QUEST',
    xpReward: 0,
    videoEmbedUrl: 'https://www.youtube.com/embed/T2NwtMJj2A8?start=359',
    description:
      'Play as Tank Dempsey. Crashed Rocket: find corpses between two rocket halves. In rocket head, interact Dog Tags → cinematic. Explore area, kill zombies; return to map. Unlocks achievement; spawns legendary weapon and loot.',
    steps: [
      { order: 1, label: 'As Dempsey, Crashed Rocket → Dog Tags in rocket head. Complete cinematic area for legendary weapon and loot.' },
    ],
  },
  {
    gameShortName: 'BO7',
    mapSlug: 'ashes-of-the-damned',
    name: 'Turn to Ashes',
    slug: 'music-turn-to-ashes-ashes',
    type: 'MUSICAL',
    xpReward: 0,
    videoEmbedUrl: 'https://www.youtube.com/embed/T2NwtMJj2A8?start=1116',
    description:
      'Three Mister Peeks headphones: Server Room (spawn), on servers closest to Quick Revive; Ashwood Double Tap area, directly above VS Recon wall buy; Exit 115, inside jeep northwest of gas station.',
    steps: [
      { order: 1, label: 'Interact with all three headphones in Server Room, Ashwood, and Exit 115.' },
    ],
  },
  {
    gameShortName: 'BO7',
    mapSlug: 'ashes-of-the-damned',
    name: 'Claw Talisman',
    slug: 'claw-talisman-ashes',
    type: 'SIDE_QUEST',
    xpReward: 0,
    videoEmbedUrl: 'https://www.youtube.com/embed/7BrKkcpyt_I',
    description:
      'Permanent Double Points from melee kills. Requires Death Perception. Gate Ashwood → Zarya Cosmodrome: golden Zursa footprint—stand on it, march in direction pointed. Five more footprints appear (6 total); follow until screen fades, Zursa attack animation. Forest: only you and HVT Zursa; weapons stripped (melee only; Necrofluid Gauntlet does not count). Kill Zursa with melee only for Claw Talisman. Using other weapons gives strongbox (Scorestreak, Legendary/Ray Gun, Essence, Salvage) but no talisman.',
    steps: [
      { order: 1, label: 'Death Perception. Follow 6 Zursa footprints from gate. In forest, kill HVT Zursa with melee only for Claw Talisman.' },
    ],
  },

  // ——— Ashes of the Damned (BO7): Cursed Relics ———
  // One egg per category (Grim, Sinister, Wicked). Category video at top; steps = unlock then each relic in order. Relics are Cursed-mode-only; progress is not saved across sessions.

  {
    gameShortName: 'BO7',
    mapSlug: 'ashes-of-the-damned',
    name: 'Cursed Relics — Grim',
    slug: 'cursed-relics-grim-ashes',
    type: 'SIDE_QUEST',
    xpReward: 0,
    categoryTag: 'Relic',
    videoEmbedUrl: 'https://www.youtube.com/embed/afuxs-YqdAY?start=75',
    description:
      'Grim Relics (Ashes of the Damned): Unlock in Cursed mode. Trials do not become available until at least Round 20. Each Grim relic fills one-third of a Cursed tier bar. Tier I unlocks Golden Armor (after Tier III Armor) for 45,000 Essence.',
    steps: [
      { order: 1, label: 'Reach Round 20+ in Cursed on Ashes of the Damned. Complete the steps for the desired Grim relic to spawn its portal; complete the Relic Trial to unlock it for future Cursed runs.' },
      { order: 2, label: 'The Lawyer\'s Pen — Effect: Shock Mimics appear on all maps as props. Light 3 red candles (Napalm Burst or Molotov): Fog cabin between Ashwood and Blackwater by couch; Ashwood Juggernog room shelf above couch; Vandorn Farmhouse top floor nightstand left of bed. Relic Portal at side of Barn. Trial: Survive 4 waves of Shock Mimics (2 HVT). Reward: 1000 XP, Respin Cycle GobbleGum.' },
      { order: 3, label: 'Dragon Wings — Effect: Power-ups no longer spawn from dying enemies (GobbleGums and side-quest power-ups unaffected). Jump Pad Vandorn Farm → Janus Towers Plaza: shoot 3 purple portals during flight (Power Pylon left; Tower 1 middle; Tower 3 ruins right). Relic Portal at side of Farmhouse. Trial: Survive 4 waves (Zombies and Doppelghasts; 2nd and 4th HVT). Picking up power-ups damages you and they do not activate. Reward: 1000 XP, Free Fire GobbleGum.' },
      { order: 4, label: 'The Teddy Bear — Effect: Zombies spawn faster (Rampage Inducer rate). Cursed from start. Find 10 Mister Peeks stuffed animals (visible only in Aether Shroud); shoot with Necrofluid Gauntlet. Locations: Janus Plaza archway to Monolith Forest; shipwreck underside; Vandorn grain silo ladder; Blackwater Cabin toilet behind barrier; Ashwood church broken side; Rabbit Alley staircase; Zarya first utility tower; Cosmodrome Support Systems barrier on machine; Lost Cabins cabin storage; Exit 115 bridge freeway sign (Round 20+). Relic Portal at Garage. Trial: Survive 4 waves at Farm; each weapon shot costs 100 Essence. Reward: 1000 XP, Who\'s Keeping Score? GobbleGum.' },
    ],
  },
  {
    gameShortName: 'BO7',
    mapSlug: 'ashes-of-the-damned',
    name: 'Cursed Relics — Sinister',
    slug: 'cursed-relics-sinister-ashes',
    type: 'SIDE_QUEST',
    xpReward: 0,
    categoryTag: 'Relic',
    videoEmbedUrl: 'https://www.youtube.com/embed/afuxs-YqdAY?start=430',
    description:
      'Sinister Relics (Ashes of the Damned): Unlock in Tier I or higher Cursed. Trials do not appear until Round 40. Each Sinister relic fills two-thirds of a tier bar.',
    steps: [
      { order: 1, label: 'Reach Round 40+ in Tier I Cursed on Ashes. Complete the steps for the desired Sinister relic; complete its Relic Trial.' },
      { order: 2, label: 'Vril Sphere — Effect: Limit of 4 perks from machines (Random Perk, Mystery Perk, GobbleGums can exceed; new purchase replaces oldest except Quick Revive). Lead a Doppelghast to Jump Pad and kill it with the pad. Mister Peeks laugh. Portal at Zarya Cosmodrome. Trial: Survive 5 waves at Cosmodrome (2 HVT); no purchases allowed. Reward: 1000 XP, On The House GobbleGum.' },
      { order: 3, label: 'Samantha\'s Drawing — Effect: Equipped weapons swap to random others each round transition (PaP and Rarity kept). Feed Chompy one of every weapon rarity (Common, Uncommon, Rare, Epic, Legendary). On or after Round 40, feed Chompy Ray Gun or Ray Gun Mark II. Portal near Yuri\'s Lab, Zarya. Trial: Survive 5 waves; Ammo Caches and Max Ammos disabled. Reward: 1000 XP, Respin Cycle GobbleGum.' },
      { order: 4, label: 'Focusing Stone — Effect: Self-Revive kits removed (Solo: Quick Revive augments or GobbleGums; Co-op can still revive). Interact Bar in Blackwater Cabin → 3 wine bottles. Melee kill a Zursa (final blow melee); pick up dropped bottle. Place with other bottles. Complete a T.E.D.D. task for legendary reward; 5th bottle drops. Place it; bottles flash an order—shoot them in that order. Portal at Zarya. Trial: Forfeit all Essence for trial (earn more inside); Essence returned on completion.' },
    ],
  },
  {
    gameShortName: 'BO7',
    mapSlug: 'ashes-of-the-damned',
    name: 'Cursed Relics — Wicked',
    slug: 'cursed-relics-wicked-ashes',
    type: 'SIDE_QUEST',
    xpReward: 0,
    categoryTag: 'Relic',
    videoEmbedUrl: 'https://www.youtube.com/embed/afuxs-YqdAY?start=1001',
    description:
      'Wicked Relics (Ashes of the Damned): Unlock in Tier II or higher Cursed. Require Round 60 (or phone steps). Each Wicked relic fills an entire tier bar. Tier III enables Pack-a-Punch Level IV (100,000 Essence).',
    steps: [
      { order: 1, label: 'Reach Round 60+ (or complete phone steps) in Tier II Cursed. Complete steps for desired Wicked relic and its Trial.' },
      { order: 2, label: 'The Bus — Effect: All enemies slowly regenerate health when not killed. Complete a round without firing a weapon or using melee. (Saw Blade Trap on Ravager round works.) If Necrofluid Gauntlet was used on a Shock Mimic, relic is unobtainable that run (needles count as fired). Solo: save/load can clear needles. Portal at boathouse Blackwater Lake. Trial: Only zombies can kill zombies; player damage negated. Reward: 1000 XP, Wonderbar! GobbleGum.' },
      { order: 3, label: 'Dragon — Effect: All Ammo Caches disabled. Complete the Ashes of the Damned main quest (Dust To Dust). Relic Trial portal at Blackwater Lake cabin. Trial: Zombies can only be killed by explosives (including Necrofluid Gauntlet detonation).' },
      { order: 4, label: 'Blood Vials — Effect: All Augments disabled (Perks, Field Upgrades, Ammo Mods). Round 20+ Tier II Cursed. Round 20: ringing red phone spawns in one location—interact before it disappears. Locations: Server Room Janus; Zarya Control Room; Blackwater Toolshed; Farmhouse first floor table; Hargrove\'s Mercantile Ashwood; Market Square Ashwood; Exit 115 Service Station; Diner behind counter; Lost Cabins. Every 10 rounds phone respawns; interact 5 times total. Portal at Zarya. Trial: Player damage halved.' },
    ],
  },

  // ——— Ashes of the Damned (BO7): Miscellaneous Side Quests ———

  {
    gameShortName: 'BO7',
    mapSlug: 'ashes-of-the-damned',
    name: 'Ghost Twins',
    slug: 'ghost-twins-ashes',
    type: 'SIDE_QUEST',
    xpReward: 0,
    videoEmbedUrl: 'https://www.youtube.com/embed/T2NwtMJj2A8?start=292',
    description:
      'Vandorn Farm: activate power. First floor: keep interacting with static TV until image of two girls appears (then static). Repeat until image with one girl. Basement: next to Vault of Flesh, one girl plays tic-tac-toe—approach, she disappears. Back to TV: interact until both girls, then until both gone. Leave house, right side of Mystery Box shed: girls dancing in circles—approach, they disappear and drop loot (guaranteed Wisp Tea + random). "The Two Sisters" plays. Every other round you can approach them again for more loot. Visible only to the player who did the egg.',
    steps: [
      { order: 1, label: 'Vandorn power → TV (two girls, one girl) → basement girl → TV (both, then gone) → shed dancing girls for Wisp Tea and loot.' },
    ],
  },
  {
    gameShortName: 'BO7',
    mapSlug: 'ashes-of-the-damned',
    name: 'ARC-XD Race',
    slug: 'arc-xd-race-ashes',
    type: 'SIDE_QUEST',
    xpReward: 0,
    videoEmbedUrl: 'https://www.youtube.com/embed/T2NwtMJj2A8?start=560',
    description:
      'Leaving Blackwater Lake toward Ashwood: first hut on left. Upstairs, suitcase on small table; ARC-XD controller next to it. Pick up → "Across XD" Calling Card and 3000 XP. All players then control ARC-XD and race at Zarya Cosmodrome (barriers). Finish position determines trophy and rewards from dancing Mr. Peeks.',
    steps: [
      { order: 1, label: 'Blackwater→Ashwood first hut, upstairs: pick up ARC-XD controller. Complete race at Zarya for trophies and rewards.' },
    ],
  },
  {
    gameShortName: 'BO7',
    mapSlug: 'ashes-of-the-damned',
    name: 'Jump Pad Travelling',
    slug: 'jump-pad-travelling-ashes',
    type: 'SIDE_QUEST',
    xpReward: 0,
    description:
      'Activate all Power Pumps and break every wooden gate. Use every jump pad, visiting every location (e.g. Zarya → Exit 115 → Ashwood → Blackwater → Janus Plaza → Vandorn Farm); order irrelevant. At Janus Towers Plaza, wait a few rounds until a skylight above spawn blinks. Blink count = location (1 Janus, 2 Vandorn, 3 or 7 Ashwood, 4 Blackwater, 5 Exit 115, 6 Zarya). Follow that path via jump pads only; then find a purple orb in the sky on a jump pad path. Use the pad that leads into the orb → teleport to Ashwood with scattered loot (Salvage, Equipment, Essence, Perks, at high rounds Crystals and Ray Gun Mark II).',
    steps: [
      { order: 1, label: 'All pumps and gates. Visit every location by jump pad. Janus skylight blinks = path order. Follow path, then jump into purple orb for Ashwood loot.' },
    ],
  },
  {
    gameShortName: 'BO7',
    mapSlug: 'ashes-of-the-damned',
    name: 'T.E.D.D. Snaps Back',
    slug: 'tedd-snaps-back-ashes',
    type: 'SIDE_QUEST',
    xpReward: 0,
    description:
      'With T.E.D.D.\'s head in Ol\' Tessie, sit in any seat except driver\'s. Shoot T.E.D.D.; his eyes turn red and he comments. Shoot enough and you get electrocuted or kicked out of the truck (TranZit Bus reference).',
    steps: [
      { order: 1, label: 'Non-driver seat in Tessie; shoot T.E.D.D. repeatedly for reaction and possible kick-out.' },
    ],
  },
  {
    gameShortName: 'BO7',
    mapSlug: 'ashes-of-the-damned',
    name: 'Vending Machine',
    slug: 'vending-machine-ashes',
    type: 'SIDE_QUEST',
    xpReward: 0,
    videoEmbedUrl: 'https://www.youtube.com/embed/T2NwtMJj2A8?start=532',
    description:
      'Punch the vending machine while crouched, once per round. Random reward: snacks, Essence, free Perk, or Ray Gun. Two machines: Janus Towers spawn area and Exit 115 near garage.',
    steps: [
      { order: 1, label: 'Crouch and punch a vending machine once per round for random reward.' },
    ],
  },
  {
    gameShortName: 'BO7',
    mapSlug: 'ashes-of-the-damned',
    name: 'Combat Axe Throwing Challenge',
    slug: 'combat-axe-challenge-ashes',
    type: 'SIDE_QUEST',
    xpReward: 0,
    videoEmbedUrl: 'https://www.youtube.com/embed/T2NwtMJj2A8?start=702',
    description:
      'Blackwater Lake toolshed: Dean Roth trophy. Interact as a crew character → trophy flares, Combat Axe appears outside. Pick up, hit floating target (right of Exfil Booth) with axe repeatedly; target behavior changes each hit. Final hit → Mr. Peeks drops loot (Salvage, Essence, Scorestreaks, Crystals). Completable once; higher round = better rewards.',
    steps: [
      { order: 1, label: 'Toolshed trophy → Combat Axe → hit floating target until Mr. Peeks and loot.' },
    ],
  },
  {
    gameShortName: 'BO7',
    mapSlug: 'ashes-of-the-damned',
    name: 'Mixologist (Free Perks)',
    slug: 'mixologist-ashes',
    type: 'SIDE_QUEST',
    xpReward: 0,
    description:
      'Collect ingredients and combine at Reba\'s Diner (Exit 115) soda machine for free Perks. Each drink grants "Soda Sommelier" calling card; all four = "Mixologist" achievement. Quick Revive: Fish (Blackwater); Toilet Cleaner (Server Room Janus); Stim Shot (Zarya Control Room). Stamin-Up: Box of potatoes (Vandorn Cellar); Bag of beans (Hargrove\'s Ashwood); Jerrycan (Exit 115 dumpster). Speed Cola: Plant (Blackwater under truck); Cut tomatoes (Hargrove\'s); Sugar (Reba\'s counter). Juggernog: Weed (Janus Plaza); Jar of milk (Vandorn Barn/Cellar entrance); Eggs (Reba\'s shelf).',
    steps: [
      { order: 1, label: 'Gather three ingredients per perk; interact cup at Reba\'s soda machine for that perk. Repeat for Quick Revive, Stamin-Up, Speed Cola, Juggernog.' },
    ],
  },
  {
    gameShortName: 'BO7',
    mapSlug: 'ashes-of-the-damned',
    name: 'Free Ray Gun Mark II',
    slug: 'free-ray-gun-mark-ii-ashes',
    type: 'SIDE_QUEST',
    xpReward: 0,
    categoryTag: 'Free Powerup',
    videoEmbedUrl: 'https://www.youtube.com/embed/T2NwtMJj2A8?start=11',
    description:
      'Obtain a free Ray Gun Mark II from a map Easter Egg (see guide).',
    steps: [
      { order: 1, label: 'Follow the guide to obtain the free Ray Gun Mark II.' },
    ],
  },
  {
    gameShortName: 'BO7',
    mapSlug: 'ashes-of-the-damned',
    name: 'Free PaP, Perks & Aether Tools (1 & 2)',
    slug: 'free-pap-perks-tools-ashes',
    type: 'SIDE_QUEST',
    xpReward: 0,
    categoryTag: 'Free Powerup',
    videoEmbedUrl: 'https://www.youtube.com/embed/T2NwtMJj2A8?start=233',
    description:
      'Easter Egg that grants free Pack-a-Punch use, Perks, and Aether Tools (see guide for steps).',
    steps: [
      { order: 1, label: 'Complete the steps in the guide for free PaP, Perks, and Aether Tools.' },
    ],
  },
  {
    gameShortName: 'BO7',
    mapSlug: 'ashes-of-the-damned',
    name: 'Secret Bear Boss / Free Ray Gun',
    slug: 'secret-bear-boss-ashes',
    type: 'SIDE_QUEST',
    xpReward: 0,
    videoEmbedUrl: 'https://www.youtube.com/embed/T2NwtMJj2A8?start=412',
    description:
      'Trigger and complete the Secret Bear boss fight for a free Ray Gun (see guide).',
    steps: [
      { order: 1, label: 'Follow the guide to trigger and complete the Secret Bear boss for free Ray Gun.' },
    ],
  },
  {
    gameShortName: 'BO7',
    mapSlug: 'ashes-of-the-damned',
    name: 'Chompy Bin',
    slug: 'chompy-bin-ashes',
    type: 'SIDE_QUEST',
    xpReward: 0,
    videoEmbedUrl: 'https://www.youtube.com/embed/T2NwtMJj2A8?start=678',
    description:
      'Feed Chompy to receive rewards; also used for Samantha\'s Drawing relic (feed each rarity + Ray Gun).',
    steps: [
      { order: 1, label: 'Find and feed Chompy as per guide for rewards.' },
    ],
  },
  {
    gameShortName: 'BO7',
    mapSlug: 'ashes-of-the-damned',
    name: 'Spawn Lightning at Diner Manually',
    slug: 'spawn-lightning-diner-ashes',
    type: 'SIDE_QUEST',
    xpReward: 0,
    videoEmbedUrl: 'https://www.youtube.com/embed/T2NwtMJj2A8?start=816',
    description:
      'At Exit 115, find a lamp post with blue sparks underneath (diner opposite trucker, or either area entrance). Shoot sparking lamp post with DG-2 Turret; repeat for all three to trigger colored lightning strikes manually.',
    steps: [
      { order: 1, label: 'Shoot all three sparking lamp posts with DG-2 Turret to trigger lightning at Exit 115.', buildableReferenceSlug: 'ol-tessie-ashes' },
    ],
  },
  {
    gameShortName: 'BO7',
    mapSlug: 'ashes-of-the-damned',
    name: 'Mister Peeks Eggs (Cursed)',
    slug: 'mister-peeks-eggs-ashes',
    type: 'SIDE_QUEST',
    xpReward: 0,
    videoEmbedUrl: 'https://www.youtube.com/embed/T2NwtMJj2A8?start=1218',
    description:
      'In Tier I+ Cursed, Mister Peeks can spawn at round start in set locations. Music and laugh help locate him. Shoot him while dancing within 30 seconds; he drops an Egg (Bronze/Silver/Gold by tier) with Mystery Perks, Crystals, Aether Tools, weapons. Locations: Janus Toll Gate booth; Vandorn Farmhouse front left; Blackwater Cabin above door; Ashwood Rabbit Alley porch roof; Ashwood Judgment Square jail porch; Zarya under Radar behind Jump Pad; Exit 115 in front of Reba\'s Diner sign.',
    steps: [
      { order: 1, label: 'Tier I+ Cursed. Find Mister Peeks (music/laugh), shoot while dancing for Egg reward.' },
    ],
  },
  // ——— Astra Malorum (BO7): Main Quest ———

  {
    gameShortName: 'BO7',
    mapSlug: 'astra-malorum',
    name: 'Astra Malorum Main Quest',
    slug: 'astra-malorum-main-quest',
    type: 'MAIN_QUEST',
    xpReward: 6500,
    videoEmbedUrl: 'https://www.youtube.com/embed/JfGDEtxk07o',
    description:
      'Navigate Thurston Observatory and confront the Shadowsmith Caltheris. Requires the Little Green Menace-1 (LGM-1). Many steps can be completed simultaneously.',
    rewardsDescription: 'Teleport to Thurston Observatory with perks, Bonus Points, Aether Tools, crystals, Legendary weapons, Salvage, random Wonder Weapon.',
    steps: [
      { order: 1, label: 'Build LGM-1: Damaged Drone (destroy O.S.C.A.R. drone); Aberrant Wiring (shoot blinking lamp post); Car Battery (PaP gun on Ol\' Tessie gearshift Crash Site); 3 Absolute Zero Shards (Cryofreeze on Aether Crystals). Trap O.S.C.A.R. with Rocket Thrusters (Museum), Electro-Volt Projector (Luminarium—Drone, Wiring, Battery in Stellar Dissector), Telescope (Observatory valves + Sun laser on organ). Final kill drops LGM-1.', buildableReferenceSlug: 'lgm-1-astra-malorum' },
      { order: 2, label: 'Eavesdrop on O.S.C.A.R.: Round 10+. Follow O.S.C.A.R. 15–30m behind until he names three planets. Convert to numbers by distance from Sun (Mercury=1, Venus=2, etc.); form 3-digit code. Observatory Dome terminal → lift opens left of PaP.' },
      { order: 3, label: 'Retrieve Brain: Lift key from corpse. Museum: Rock Saw behind glass. Machina Astralis: interact cryopod, remove Thurston\'s brain. Luminarium: Perfusion Machine—replace monkey brain, defend. Bring Perfusion Machine to teleporter machine in Machina Astralis; install and turn on.' },
      { order: 4, label: 'Activate Teleporter: 4a—Monitor flashes "Thurston\'s Reading List". Archive of Orbis: three busts, match book titles on shelves to list; interact each bust that many times (15s to complete all three). Ceiling tile opens; Neptune model to Machina display. 4b—Three notes (Luminarium, Machina, Archive) with direction + planet; shoot display planets to align. 4c—Telescope (valves first): find Mars coordinates (4-digit). Enter at Machina. 4d—Reboot portal; defend until reboot; teleport to Mars.' },
      { order: 5, label: 'Mars: Brain jar center → Aegis Terminal top of stairs; create portal. Play terminal sound once per round; Ascendant Eye flies near giant head. Shoot 4 pylons order: Back Right, Back Left, Front Right, Front Left; then pylon above temple entrance. Jump into Eye when low, interact to catch. Place Eye in device right side of arena.' },
      { order: 6, label: 'Harmonize Pillars: LGM-1 shoot antennas on 5 pillars (note + symbol). Observatory organ shows 5 symbols in order (one missing). Mars: interact pillars in that order. Aegis Terminal → start Caltheris fight.' },
      { order: 7, label: 'Caltheris Boss: Phase 1 (Skull)—fill Defense Towers with souls, fire laser 3x. Phase 2 (Golem)—damage, crit spot. Phase 3 (Ascendant)—armor, break for crits; ground slam avoid by jumping. Phase 4 (Needle)—aggressive; Veytharion\'s Blessing at stairs if Dust to Dust completed. LGM-1 very effective.', buildableReferenceSlug: 'lgm-1-astra-malorum' },
    ],
  },

  // ——— Astra Malorum (BO7): Buildables ———

  {
    gameShortName: 'BO7',
    mapSlug: 'astra-malorum',
    name: 'Little Green Menace-1 (LGM-1)',
    slug: 'lgm-1-astra-malorum',
    type: 'BUILDABLE',
    xpReward: 0,
    videoEmbedUrl: 'https://www.youtube.com/embed/7a9xNqh6Pq4',
    description:
      'Required for main quest. Damaged Drone: destroy O.S.C.A.R.\'s flying drone. Aberrant Wiring: shoot blinking lamp post. Car Battery: PaP weapon on Ol\' Tessie gearshift (Crash Site). 3 Absolute Zero Shards: Cryofreeze on three Aether Crystals. Trap O.S.C.A.R. three times (one per round): Museum Rocket Thrusters (place shard, lead O.S.C.A.R. into thrusters); Luminarium Electro-Volt Projector (Drone, Wiring, Battery in Stellar Dissector, activate trap); Observatory Dome (shoot fuming valves to move telescope, organ Star Chart—focus on Sun, O.S.C.A.R. in beam). Third kill drops LGM-1.',
    steps: [
      { order: 1, label: 'Collect Drone, Wiring, Battery, 3 Shards. Kill O.S.C.A.R. with Museum thrusters, Luminarium trap, Observatory Sun laser. Pick up LGM-1.' },
    ],
  },
  {
    gameShortName: 'BO7',
    mapSlug: 'astra-malorum',
    name: 'Ol\' Tessie DG-2 Turret',
    slug: 'ol-tessie-dg2-astra-malorum',
    type: 'BUILDABLE',
    xpReward: 0,
    videoEmbedUrl: 'https://www.youtube.com/embed/Di3Y3xND288?start=129',
    description:
      'Wisp Tea area: facing cliff, right side—large asteroid. Throw explosive; chunk breaks off. Wall jump onto chunk\'s left side; drift into space, DG-2 Turret floating. Interact, bring to Ol\' Tessie to install. Same drift path triggers Pareidolia remix and can collect Turret on first ride.',
    steps: [
      { order: 1, label: 'Explosive on asteroid near Wisp Tea; wall jump onto chunk; drift to DG-2 Turret; interact and install on Tessie.' },
    ],
  },
  {
    gameShortName: 'BO7',
    mapSlug: 'astra-malorum',
    name: 'Echoes of the Damned (Nikolai)',
    slug: 'echoes-of-the-damned-astra-malorum',
    type: 'SIDE_QUEST',
    xpReward: 0,
    videoEmbedUrl: 'https://www.youtube.com/embed/Di3Y3xND288?start=12',
    description:
      'Play as Nikolai Belinski. Abyssal Rim lower side: Molotov on visible footprints; trail lights up. Continue with Molotovs where trail ends until cave. Outside cave: child\'s toy on rock—interact; cutscene. Cave: keep moving, interact altar; kill Ravagers in loop until cutscene. Return to map with Legendary Echo 12, Molotovs; Echoes Dark Ops Calling Card.',
    steps: [
      { order: 1, label: 'As Nikolai, Molotov footprint trail to cave. Interact toy; complete cave altar and Ravager loop for Echo 12 and calling card.' },
    ],
  },

  // ——— Astra Malorum (BO7): Music ———

  {
    gameShortName: 'BO7',
    mapSlug: 'astra-malorum',
    name: 'Magic (Avenged Sevenfold)',
    slug: 'music-magic-astra-malorum',
    type: 'MUSICAL',
    xpReward: 0,
    videoEmbedUrl: 'https://www.youtube.com/embed/Di3Y3xND288?start=708',
    description:
      'Three Mister Peeks headphones: Luminarium—bottom shelf left of exit door; Machina Astralis—display case; Observatory Dome—table.',
    steps: [
      { order: 1, label: 'Interact with all three headphones in Luminarium, Machina Astralis, and Observatory Dome.' },
    ],
  },
  {
    gameShortName: 'BO7',
    mapSlug: 'astra-malorum',
    name: 'Game Over (Alpha Omega)',
    slug: 'music-game-over-astra-malorum',
    type: 'MUSICAL',
    xpReward: 0,
    description:
      'Find three records and bring to the Gramophone in the Luminarium. Records: Machina Astralis wooden box middle floor; Luminarium bookshelf top; Museum wooden sill above zombie spawner.',
    steps: [
      { order: 1, label: 'Collect three records and place on Luminarium Gramophone.' },
    ],
  },
  {
    gameShortName: 'BO7',
    mapSlug: 'astra-malorum',
    name: 'Pareidolia (Remix)',
    slug: 'music-pareidolia-remix-astra-malorum',
    type: 'MUSICAL',
    xpReward: 0,
    description:
      'Wall jump off left side of floating rock next to Wisp Tea; drift into space—song plays during drift and after landing. Repeatable. First time through can also collect DG-2 Turret. Remix also plays briefly on first Mars arrival.',
    steps: [
      { order: 1, label: 'Wall jump left of Wisp Tea rock to drift; song plays. First run can grab DG-2 Turret.', buildableReferenceSlug: 'ol-tessie-dg2-astra-malorum' },
    ],
  },
  {
    gameShortName: 'BO7',
    mapSlug: 'astra-malorum',
    name: 'Pareidolia (Original)',
    slug: 'music-pareidolia-original-astra-malorum',
    type: 'MUSICAL',
    xpReward: 0,
    videoEmbedUrl: 'https://www.youtube.com/embed/Di3Y3xND288?start=760',
    description:
      'On Mars, aim at the giant statue head for a few seconds to activate the original Pareidolia (Shangri-La Easter egg song).',
    steps: [
      { order: 1, label: 'On Mars, aim at giant statue head for a few seconds.' },
    ],
  },

  // ——— Astra Malorum (BO7): Cursed Relics ———
  // One egg per category (Grim, Sinister, Wicked). Category video at top; steps = unlock then each relic in order. Relics are Cursed-mode-only.

  {
    gameShortName: 'BO7',
    mapSlug: 'astra-malorum',
    name: 'Cursed Relics — Grim',
    slug: 'cursed-relics-grim-astra-malorum',
    type: 'SIDE_QUEST',
    xpReward: 0,
    categoryTag: 'Relic',
    videoEmbedUrl: 'https://www.youtube.com/embed/ViYEIi08Ucw?start=19',
    description:
      'Grim Relics (Astra Malorum): Unlock in Cursed mode. Trials at Round 20+. Each fills one-third of a tier.',
    steps: [
      { order: 1, label: 'Reach Round 20+ in Cursed on Astra Malorum. Complete steps for desired Grim relic; complete its Relic Trial.' },
      { order: 2, label: 'The Gong — Effect: Start with fully charged Field Upgrade; cannot charge it except with Full Power. Tesla Storm + Dead Wire (Lightning Strike recommended). Round 20+: Lightning Rod zombie spawns. Lead to 3 doorways with bulb (Observatory Dome by PaP; Archive of Orbis by Stamin-Up; Luminarium by Juggernog). At each: shoot zombie to trigger Dead Wire, then Tesla Storm and walk into zombie—electricity transfers to bulb. Portal outside Observatory Dome to Stargazers Courtyard. Trial: 4 waves; only Electric damage (Dead Wire counts). Reward: 1000 XP, Dead Drop GobbleGum.' },
      { order: 3, label: 'The Seed — Effect: Mystery Box disabled (Wall Buys only; Fire Sale and Immolation Liquidation still spawn box). Round 20 Cursed. Common Jäger 45 spawns in one of 6 locations (Observatory Dome wall or under PaP; Machina Astralis front/back entrance; hallway behind Stellar Dissector; Luminarium room with Mr. Peeks headphones). Ravagers can eat it—save/quit to respawn. Kill exactly round-number of zombies with pistol (e.g. round 20 = 20 kills). Can PaP and raise rarity; Insta-Kill OK. Portal at back of PaP room left of Ammo Cache. Trial: 4 waves with Tier 1 PaP pistol only. Reward: 1000 XP, Exit Strategy GobbleGum.' },
    ],
  },
  {
    gameShortName: 'BO7',
    mapSlug: 'astra-malorum',
    name: 'Cursed Relics — Sinister',
    slug: 'cursed-relics-sinister-astra-malorum',
    type: 'SIDE_QUEST',
    xpReward: 0,
    categoryTag: 'Relic',
    videoEmbedUrl: 'https://www.youtube.com/embed/ViYEIi08Ucw?start=472',
    description:
      'Sinister Relics (Astra Malorum): Round 40+ Tier I Cursed. Each fills two-thirds of a tier.',
    steps: [
      { order: 1, label: 'Reach Round 40+ Tier I Cursed on Astra Malorum. Complete steps for desired Sinister relic and Trial.' },
      { order: 2, label: 'Spider Fang — Effect: Perk machine costs never decrease after going down. Melee kill O.S.C.A.R. while Wisp (Wisp Tea) is targeting him—Mister Peeks laugh. No Mask of Benevolence; Wisp must be attacking. Portal in Library across from Stamin-Up. Trial: 5 waves, no perks. Mimics, O.S.C.A.R., Uber Klaus Cores; wave 2 HVT Uber Klaus, wave 5 HVT O.S.C.A.R. Reward: 1000 XP, Wall To Wall Clearance GobbleGum.' },
      { order: 3, label: 'Matryoshka Doll — Effect: Salvage from zombies halved. Round 40 Tier I Cursed. Progress main quest until Mars portal. Get C4. Mars: circular platform, 3 meat pieces on edges. C4 on each; get explosive kills. Yellow portal at Machina Astralis by Thurston\'s Cryopod. Trial: 5 waves; enemies only killed while using Field Upgrade (Frenzied Guard, Aether Shroud + LGM-1 effective). Reward: 1000 XP, Phoenix Up GobbleGum.' },
    ],
  },
  {
    gameShortName: 'BO7',
    mapSlug: 'astra-malorum',
    name: 'Cursed Relics — Wicked',
    slug: 'cursed-relics-wicked-astra-malorum',
    type: 'SIDE_QUEST',
    xpReward: 0,
    categoryTag: 'Relic',
    videoEmbedUrl: 'https://www.youtube.com/embed/ViYEIi08Ucw?start=1009',
    description:
      'Wicked Relics (Astra Malorum): Round 60+ Tier II Cursed. Each fills a full tier.',
    steps: [
      { order: 1, label: 'Reach Round 60+ Tier II Cursed on Astra Malorum. Complete steps for desired Wicked relic and Trial.' },
      { order: 2, label: 'Golden Spork — Effect: All incoming enemy damage doubled. Mars portal unlocked. Mangler Cannon + Monkey Bombs or Decoys. Mars: shoot Mangler Cannon into portal to earth, then go through portal. Machina Astralis: 10–15s to group zombies in red ritual circle (between teleporter and Archive). Stand in circle, drop grenade; 5–10s later Mangler shot exits teleporter—must kill many zombies in circle. Red portal at Crash Site between Quick Revive and GobbleGum. Trial: 6 waves; hip-fire only (LGM-1 effective).' },
      { order: 3, label: 'Civil Protector Head — Effect: Lose one perk per 100 kills. Crash Site: Energy Mine in front of Ol\' Tessie. Headlights flash 3x then sequence (headlights = north chandeliers Museum, brakelights = south). PhD Flopper dive to prone under each chandelier in Museum Infinitum in that order to blow out candles (wrong order = relight next round). Portal behind Mystery Box at Crash Site. Trial: 6 waves; all zombies sprint at max speed. Reward: 1000 XP, Reign Drops GobbleGum.' },
    ],
  },

  // ——— Astra Malorum (BO7): Miscellaneous Side Quests ———

  {
    gameShortName: 'BO7',
    mapSlug: 'astra-malorum',
    name: 'Mister Peeks Eggs (Cursed)',
    slug: 'mister-peeks-eggs-astra-malorum',
    type: 'SIDE_QUEST',
    xpReward: 0,
    description:
      'In Tier I+ Cursed, Mister Peeks can spawn at round start. Music and laugh help locate. Shoot while dancing within 30s for Egg (Bronze/Silver/Gold by tier): Mystery Perks, Crystals, Aether Tools, weapons. Locations: Crash Site—Ol\' Tessie front seat; Crash Site—Museum Infinitum left roof (path to Luminarium, gate by GobbleGum); Crash Site—Museum right roof (high, right of front door); Museum—right when walking to Machina; Machina Astralis—Sun of Orrery; Veilwalk—far left to Observatory; Abyssal Rim—jump off map, low on rock between Wisp Tea and Ammo Cache; Observatory Dome—catwalk above PaP.',
    steps: [
      { order: 1, label: 'Tier I+ Cursed. Find Mister Peeks (music/laugh), shoot while dancing for Egg.' },
    ],
  },
  {
    gameShortName: 'BO7',
    mapSlug: 'astra-malorum',
    name: 'Ghost Twins',
    slug: 'ghost-twins-astra-malorum',
    type: 'SIDE_QUEST',
    xpReward: 0,
    videoEmbedUrl: 'https://www.youtube.com/embed/Di3Y3xND288?start=207',
    description:
      'Twins from Ashes of the Damned return. Museum Infinitum: during Max Ammo round, interact left-most empty cabinet. Next 4 rounds: noise from one cabinet per round—interact where sound is. Ghost twins spawn somewhere in Thurston Planetarium; find and interact for Salvage, Ammo Mods, Lethal/Tactical. Every round after they spawn in a new spot; interact each time for same rewards.',
    steps: [
      { order: 1, label: 'Max Ammo round: interact left-most empty cabinet in Museum. Follow cabinet sounds 4 rounds; find and interact twins for loot each round.' },
    ],
  },
  {
    gameShortName: 'BO7',
    mapSlug: 'astra-malorum',
    name: 'Gramophone Trials (3 Free Mystery Perks)',
    slug: 'gramophone-trials-astra-malorum',
    type: 'SIDE_QUEST',
    xpReward: 0,
    videoEmbedUrl: 'https://www.youtube.com/embed/Di3Y3xND288?start=288',
    description:
      'Three gramophones: get vinyl, place on gramophone, kill 5 zombies by required method while music plays. #1 Museum Infinitum opposite Speed Cola; record left of Crafting Table on pillar; kill 5 with melee only. #2 Luminarium room with Energy Rock case, corner between sofas; record left of grandfather clock on shelf; kill 5 with Field Upgrades only. #3 Archive of Orbis table right of Stamin-Up; record in Machina Astralis above Armor wall buy, left of clock in wooden box; kill 5 with Equipment only. Each trial: Mystery Perk + Essence + Salvage.',
    steps: [
      { order: 1, label: 'Complete all three gramophone trials (melee, Field Upgrade, Equipment) for 3 Mystery Perks and loot.' },
    ],
  },
  {
    gameShortName: 'BO7',
    mapSlug: 'astra-malorum',
    name: 'Skull Memory Game',
    slug: 'skull-memory-game-astra-malorum',
    type: 'SIDE_QUEST',
    xpReward: 0,
    videoEmbedUrl: 'https://www.youtube.com/embed/Di3Y3xND288?start=384',
    description:
      'Requires PaP weapon. Shoot and pick up 5 skulls: left of first door buy in crevice; Stargazer\'s Courtyard between Mystery Box and Ammo Crate left of bench; Museum Infinitum glass display behind Speed Cola; Veilwalk near Archive door, wall opposite red brick; Machina Astralis glass case opposite Arsenal. Upper floor Machina: wooden table with blank frame and candles—interact to place each skull (eyes light purple). Skulls levitate in sequence; memorize order and shoot them 1–7 in that order. Correct = skulls fuse, Random Perk spawns.',
    steps: [
      { order: 1, label: 'PaP weapon: shoot and collect 5 skulls. Place on table; memorize levitate order; shoot skulls in that order for Random Perk.' },
    ],
  },
  {
    gameShortName: 'BO7',
    mapSlug: 'astra-malorum',
    name: 'Bongo (Friendly Ravager)',
    slug: 'bongo-friendly-ravager-astra-malorum',
    type: 'SIDE_QUEST',
    xpReward: 0,
    videoEmbedUrl: 'https://www.youtube.com/embed/Di3Y3xND288?start=483',
    description:
      'After defeating O.S.C.A.R., Shiny Trinket drops (tactical slot). Tac-Map: white dot out of playable area (e.g. spawn rooms). Go there, find idle green-eyed Ravager; throw Shiny Trinket on it—eats and runs. Repeat for two more rounds (same steps). Third time Ravager "Bongo" enters map and attacks enemies for several rounds.',
    steps: [
      { order: 1, label: 'Kill O.S.C.A.R. for Shiny Trinket. Three rounds: find white dot, green-eyed Ravager, throw Trinket. Bongo joins as friendly.' },
    ],
  },
  {
    gameShortName: 'BO7',
    mapSlug: 'astra-malorum',
    name: 'Wisp Lantern Easter Egg',
    slug: 'wisp-lantern-astra-malorum',
    type: 'SIDE_QUEST',
    xpReward: 0,
    videoEmbedUrl: 'https://www.youtube.com/embed/Di3Y3xND288?start=567',
    description:
      'Easter egg involving the Wisp and a lantern; see guide for steps and rewards.',
    steps: [
      { order: 1, label: 'Follow the guide for the Wisp Lantern Easter Egg.' },
    ],
  },
  {
    gameShortName: 'BO7',
    mapSlug: 'astra-malorum',
    name: 'Skull Jumpscare',
    slug: 'skull-jumpscare-astra-malorum',
    type: 'SIDE_QUEST',
    xpReward: 0,
    videoEmbedUrl: 'https://www.youtube.com/embed/Di3Y3xND288?start=673',
    description:
      'Progress main quest until Telescope is active (after 5 steam engines). Binoculars by organ: find small skull in space. Put Telescope crosshairs on skull; after a few seconds a jumpscare triggers. Can be used to prank other players.',
    steps: [
      { order: 1, label: 'Telescope active. Binoculars—find skull in space. Align Telescope on skull for jumpscare.' },
    ],
  },
  {
    gameShortName: 'BO7',
    mapSlug: 'astra-malorum',
    name: 'Slow Down Time (Grandfather Clocks)',
    slug: 'slow-down-time-astra-malorum',
    type: 'SIDE_QUEST',
    xpReward: 0,
    videoEmbedUrl: 'https://www.youtube.com/embed/Di3Y3xND288?start=884',
    description:
      'Five grandfather clocks: Museum behind Speed Cola; Luminarium back-left by Gramophone #1; Machina Astralis—corner above Armor wall buy and left of Perfusion Machine; Archive of Orbis left of Stamin-Up. Melee all 5 in quick succession → zombies and O.S.C.A.R. slow motion for 60 seconds. Useful for holding areas during main quest.',
    steps: [
      { order: 1, label: 'Melee all 5 grandfather clocks quickly for 60s slow-mo.' },
    ],
  },
  {
    gameShortName: 'BO7',
    mapSlug: 'astra-malorum',
    name: 'Free Power-Up Statues',
    slug: 'free-powerup-statues-astra-malorum',
    type: 'SIDE_QUEST',
    xpReward: 0,
    categoryTag: 'Free Powerup',
    videoEmbedUrl: 'https://www.youtube.com/embed/Di3Y3xND288?start=790',
    description:
      'Seven power-up statues: shoot for corresponding power-up. Bonus Points—Crash Site near lamp post; Insta-Kill—Scholar\'s Way pillar right toward Machina; Double Points—Machina top floor under cabinet by stairs; Nuke—Machina balcony right from Veilwalk; Full Power—telescope platform from Stargazer\'s Courtyard; Max Armor—Stargazer\'s Courtyard rock left from Observatory; Max Ammo—Luminarium wall left of trap room from Crash Site. After these 7: Fire Sale (Museum zombie spawn window left from Stargazer\'s Courtyard); Random Perk (Abyssal Rim, next to ball on right stair pillar looking at Luminarium).',
    steps: [
      { order: 1, label: 'Shoot each statue for its power-up. Fire Sale and Random Perk appear after the first 7 are activated.' },
    ],
  },
  {
    gameShortName: 'BO7',
    mapSlug: 'astra-malorum',
    name: 'Round 100 Easter Egg',
    slug: 'round-100-astra-malorum',
    type: 'SIDE_QUEST',
    xpReward: 0,
    videoEmbedUrl: 'https://www.youtube.com/embed/Di3Y3xND288?start=942',
    description:
      'Special Easter Egg or reward at round 100; see guide for details.',
    steps: [
      { order: 1, label: 'Reach round 100 and complete the round 100 Easter Egg steps.' },
    ],
  },
  // ——— Infinite Warfare: Zombies in Spaceland ———
  {
    gameShortName: 'IW',
    mapSlug: 'zombies-in-spaceland',
    name: 'Sooooul Key',
    slug: 'sooooul-key',
    type: 'MAIN_QUEST',
    xpReward: 2500,
    videoEmbedUrl: 'https://www.youtube.com/embed/yOvdkLUxXLQ',
    description:
      'The Main Quest for Zombies in Spaceland. Recover the piece of the Soul Key by building the Seti-Com, defending it at three locations, then freeing the UFO and defeating the aliens. Achievable in solo or co-op. Log your completion time here—this is also the run used for the Easter Egg Speedrun challenge.',
    rewardsDescription: 'Soul Key piece, achievement, 1000 XP per alien kill (nuke). Double Pack-a-Punch and Pack-a-Punch the four Weapons of Rock after placing Alien Fuses.',
    steps: [
      {
        order: 1,
        label:
          '[Step 1: Building the Seti-Com] Activate all teleporters and the UFO discs in the Pack-a-Punch room. Collect the three Seti-Com parts (each can spawn in three locations). Boom Box: lower bridge from spawn to main teleporter (by Proto-Popcorn); Coffee Room underground (counter left of Racin\' Stripes); Moonlight Cafe (right of Kepler power switch). Umbrella: bench right of bottom of slides (bridge to Polar Peak); counter right of stairs from Gift Shop to Polar Peak power; right of Star Mission trap switch near Tuff \'Nuff (Journey into Space). Calculator: bench in front of main teleporter to PaP; yellow picnic table by Chromosphere trap (balcony); Astrocade second floor on trash bin between arcade machines. Bring all three to David Hasselhoff for the complete Seti-Com.',
      },
      {
        order: 2,
        label:
          '[Step 2: Defend the Seti-Com] Take the Seti-Com to three different locations (seven possible; three are chosen at random each game). Locations: in front of Racin\' Stripes (underground); in front of main entrance to Polar Peak; center of Polar Peak gift shop; between purple and orange fountains (Fountain Area); right of fountain (Chromosphere toward Alligator head); path to left area of Journey into Space; left of Bumper Cars exit (curved path to Magic Wheel). At each spot a countdown appears (1 min, then 1:30, then 2 min). Defend from zombies; if the device is destroyed, get another from Hasselhoff. Only one defend per round. After all three, return the Seti-Com to Hasselhoff and wait about two rounds.',
      },
      {
        order: 3,
        label:
          '[Step 3: The UFO] Return to Hasselhoff for the Speaker. Place the Speaker on the four golden circles around the main teleporter. In co-op, each player interacts with one speaker at the same time. When the UFO breaks free, interact with the speakers in the color order the UFO flashes (only when they glow white). Do this successfully three times (wrong order or too late spawns a Brute). After three successes, kill the clowns, then shoot the aliens (up to four, one per player) until they crouch—melee from behind for an Alien Fuse. Two fuses per alien; then finish the alien. Place both fuses in the Pack-a-Punch to double PaP and PaP the Weapons of Rock.',
      },
      {
        order: 4,
        label:
          'With at least one Pack-a-Punched Weapon of Rock, shoot the five blue glowing lights around the main Spaceland sign. Shoot the last one when the UFO is directly above the teleporter. The beam destroys the UFO and drops the Soul Key piece. Pick it up to complete the Easter Egg and earn the achievement.',
      },
    ],
  },
  // ——— WW2 Zombies ———
  // The Final Reich — Main Quests
  {
    gameShortName: 'WW2',
    mapSlug: 'the-final-reich',
    name: 'Fireworks',
    slug: 'fireworks',
    type: 'MAIN_QUEST',
    xpReward: 1500,
    description:
      'One of the Main Quests for The Final Reich. Tasks Raven Squad to retrieve the artefact hidden within Mittelburg. Complete Steps 1–7 to reach the hilt, then shoot it with the Tesla Gun to trigger the Panzermörder boss fight.',
    videoEmbedUrl: 'https://www.youtube.com/embed/nA4VXZx3250',
    steps: [
      { order: 1, label: 'Activate three gas valves (behind Geistschild, left of Command Room door, further along from Riverside door). Activate pilot light for Well Trap to clear barricades. Activate generator near Tunnel exit to power doors.' },
      { order: 2, label: 'Activate two power switches within a short timeframe: Morgue (behind STG44) and Laboratory (right of Geistschild). Salt Mine door becomes purchasable.' },
      { order: 3, label: 'Emperor\'s Chamber: Interact with hilt to charge Geistkraft Transfer Device (10 kills). Open device canopy. Forge sends device to Laboratory (5 kills per stop, Wüstling may awaken). Pick up Tesla Gun Barrel. Device returns, then treks to Morgue (same process). Pick up Tesla Gun Core. Brenner spawns—defeat to get head. Forge base Tesla Gun at Weapon Assembly Station.' },
      { order: 4, label: 'Right Hand of God: Activate rerouting panel in Command Room. Match four power switches to panel colours (1 right of panel, 2 outside Morgue/Sewer, 3 tunnel to Riverside, 4 beside Tower door).' },
      { order: 5, label: 'Activate lightning rod defense (central rod), then secondary rods. Lightning strikes—activate Right Hand of God.' },
      { order: 6, label: 'Left Hand of God: Heinz zeppelin arrives. Damage weak points to drop geistkraft battery. Charge with zombies for Überschnalle. Place on Left Hand of God. Complete wave, repeat (battery in Riverside). Third time Heinz magnetizes battery—damage again. Final battery near Pub. Place Überschnalle.' },
      { order: 7, label: 'Voice of God: Change four pipes (Bloodraven, Moonraven, Deathraven, Stormraven). Find paintings (Morgue, Sewer, Courtyard, Pub)—use Brenner Head for sigil + Roman numeral. Input at Voice of God before activating.' },
      { order: 8, label: 'Activate Voice of God. Shoot Hilt with coordinated Tesla Gun shots. Grab hilt, flee to surface. Panzermörder fight: drop batteries from zeppelin, charge, place on Panzermörder (three Überschnalles). Cutscene plays.' },
    ],
  },
  {
    gameShortName: 'WW2',
    mapSlug: 'the-final-reich',
    name: 'Dark Reunion',
    slug: 'dark-reunion',
    type: 'MAIN_QUEST',
    xpReward: 3500,
    description:
      'Hardcore version of Fireworks. Requires completing Fireworks up until shooting the hilt. All four Tesla Gun variants must be constructed. Saves Klaus Fischer—Rabenhertz gem revives him upon completion.',
    videoEmbedUrl: 'https://www.youtube.com/embed/nA4VXZx3250',
    steps: [
      { order: 1, label: 'Finding the Keepsakes: Locate three keepsakes (red, orange, green) around the village. Shoot to drop and pick up. Place all three in the toy shop window adjacent to bunker doors.' },
      { order: 2, label: 'Finding the Record: Keepsakes show arrow (clock direction). Find codices in zombie spawns with number and coloured bow. Match each keepsake to correct direction. Record pops from drawer under toy shop.' },
      { order: 3, label: 'Weather Vane: At waterfront, golden weather vane appears. Use it—points to tiny spark. Shoot spark; mill reveals coil. After lightning rod defense, shoot coil with Tesla Gun to power windmill (Pub power).' },
      { order: 4, label: 'Tesla Coil & Red Talon: Turn Morgue and Lab power switches back on, plus switch in front of salt mine. Shoot Tesla coil with Tesla Gun—lights cut, two panels open (Lab and Morgue). Shine Brenner head on safes for fingerprints; change numbers until blue glow. Each safe has half of medallion. Place pieces at Barbarossa statue in crypt—receive Red Talon.' },
      { order: 5, label: 'Second Voice of God: Place record in Pub gramophone. Get ~30–50 kills with Red Talon near gramophone. Light blinks numbers for second Voice of God. Input at Voice of God (clockwise from first number on left). Activate.' },
      { order: 6, label: 'Rabenhertz Gem & Panzermörder Fight: Shoot chandelier with all four Tesla variants. Receive Rabenhertz gem. Retrieve hilt, proceed to boss. Panzermörder fight unchanged but zeppelin opens one light at a time; faster battery placement. Klaus revives from gem—infinite ammo and Geistschild for nearby players.' },
    ],
  },
  // The Final Reich — Buildables
  {
    gameShortName: 'WW2',
    mapSlug: 'the-final-reich',
    name: 'Tesla Gun',
    slug: 'tesla-gun',
    type: 'BUILDABLE',
    xpReward: 0,
    description:
      'Wonder weapon constructed from barrel and core. Barrel: charge Geistkraft Transfer Device in Emperor\'s Chamber, escort to Laboratory (5 kills per stop). Core: device to Morgue, same process. Brenner spawns—defeat for head. Forge at Weapon Assembly Station.',
    videoEmbedUrl: 'https://www.youtube.com/embed/PAev_AI4l2U',
    steps: [
      { order: 1, label: 'Charge Geistkraft Transfer Device in Emperor\'s Chamber (10 kills). Activate forge—device moves to Laboratory. Kill zombies in red ring (5 per stop). Barrel spawns at Laboratory machine.' },
      { order: 2, label: 'Device moves to Morgue. Repeat escort (5 kills per stop). Core spawns. Brenner spawns in Command Room—defeat. Add barrel and core to Weapon Assembly Station, forge Tesla Gun.' },
    ],
  },
  {
    gameShortName: 'WW2',
    mapSlug: 'the-final-reich',
    name: 'Tesla Gun — Midnight',
    slug: 'tesla-gun-midnight',
    type: 'BUILDABLE',
    xpReward: 0,
    description:
      'Moonraven variant. Brenner Head at Courtyard statue—shatter to reveal battery. Shoot with Tesla Gun, place in Überschnalle charger. Get 5+ zombies, activate S-Mine Trap when battery pulses green. Place charged Überschnalle in left slot at Laboratory milling machine. Defend until process complete. Place base Tesla on Midnight\'s table.',
    videoEmbedUrl: 'https://www.youtube.com/embed/YOuLguE5Jpw?start=107',
    steps: [
      { order: 1, label: 'Brenner Head to Courtyard statue—shine to shatter. Shoot battery with Tesla Gun, place in Überschnalle charger. S-Mine Trap with 5+ zombies nearby when battery pulses green.' },
      { order: 2, label: 'Place charged Überschnalle in left slot at Laboratory milling machine (after Lightning Rods). Defend from zombies. Place base Tesla on Midnight\'s table at Weapon Assembly Station.' },
    ],
  },
  {
    gameShortName: 'WW2',
    mapSlug: 'the-final-reich',
    name: 'Tesla Gun — Reaper',
    slug: 'tesla-gun-reaper',
    type: 'BUILDABLE',
    xpReward: 0,
    description:
      'Lure Wüstling to closed locker in Sewers—break open for battery. Place in device by locker. Lure two Bombers near battery (lights green). Kill with Saw Trap twice to charge. Place in Morgue machine side slot. Defend. Place base Tesla on Reaper\'s table.',
    videoEmbedUrl: 'https://www.youtube.com/embed/YOuLguE5Jpw?start=682',
    steps: [
      { order: 1, label: 'Wüstling breaks locker in Sewers—battery inside. Place in device by locker. Two Bombers near battery, kill with Saw Trap (repeat twice).' },
      { order: 2, label: 'Place battery in Morgue machine side slot. Defend. Place base Tesla on Reaper\'s table at Weapon Assembly Station.' },
    ],
  },
  {
    gameShortName: 'WW2',
    mapSlug: 'the-final-reich',
    name: 'Tesla Gun — Hurricane',
    slug: 'tesla-gun-hurricane',
    type: 'BUILDABLE',
    xpReward: 0,
    description:
      'Bomber with bomb to closed locker on Laboratory staircase near Disposal Tube. Detonate to break locker—battery inside. Place in Laboratory Trap device. Lure two Wüstlings into trap, activate when battery lights green. Repeat to charge. Place in Laboratory machine side slot. Defend. Place base Tesla on Hurricane\'s table.',
    videoEmbedUrl: 'https://www.youtube.com/embed/YOuLguE5Jpw?start=305',
    steps: [
      { order: 1, label: 'Bomber detonates at locker on Laboratory stairs. Battery in device in Laboratory Trap. Two Wüstlings in trap, activate (repeat twice).' },
      { order: 2, label: 'Place battery in Laboratory machine side slot. Defend. Place base Tesla on Hurricane\'s table at Weapon Assembly Station.' },
    ],
  },
  {
    gameShortName: 'WW2',
    mapSlug: 'the-final-reich',
    name: 'Tesla Gun — Bloodthirst',
    slug: 'tesla-gun-bloodthirst',
    type: 'BUILDABLE',
    xpReward: 0,
    description:
      'Shoot flickering streetlight in Riverside with Tesla Gun. Chain to next flickering light until final light in Morgue lowest floor—battery appears. Place in device. Charge by killing Pests with Morgue Trap (battery glows green when ready). Activate trap twice. Place in Morgue machine side slot. Defend. Place base Tesla on Bloodthirst\'s table.',
    videoEmbedUrl: 'https://www.youtube.com/embed/YOuLguE5Jpw?start=475',
    steps: [
      { order: 1, label: 'Chain flickering streetlights from Riverside to Morgue lowest floor. Battery in device. Morgue Trap kills Pests when battery glows green (repeat twice).' },
      { order: 2, label: 'Place battery in Morgue machine side slot. Defend. Place base Tesla on Bloodthirst\'s table at Weapon Assembly Station.' },
    ],
  },
  {
    gameShortName: 'WW2',
    mapSlug: 'the-final-reich',
    name: 'Red Talon',
    slug: 'red-talon',
    type: 'BUILDABLE',
    xpReward: 0,
    description:
      'Requires Brenner Head, Tesla Gun, and Left Hand of God step (Richter\'s blimp in map). Reactivate Morgue and Lab power switches. New switch appears right of Salt Mine door—turn to reveal machinery. Zap with Tesla Gun (power cuts). Brenner Head on both safes (Lab and Morgue)—reveal purple fingerprints, open for key pieces. Place pieces below Barbarossa statue in Emperor\'s Chamber—receive Red Talon.',
    videoEmbedUrl: 'https://www.youtube.com/embed/ahteH5mvUnk',
    steps: [
      { order: 1, label: 'With Brenner Head, Tesla Gun, and Left Hand of God active: turn Morgue and Lab power switches. Turn new switch right of Salt Mine door. Zap machinery with Tesla Gun.' },
      { order: 2, label: 'Shine Brenner Head on safes in Lab and Morgue entryways. Match five numbers to purple fingerprints. Collect key pieces from both. Place below Barbarossa statue in Emperor\'s Chamber.' },
    ],
  },
  {
    gameShortName: 'WW2',
    mapSlug: 'the-darkest-shore',
    name: 'Making History',
    slug: 'making-history',
    type: 'MAIN_QUEST',
    xpReward: 3000,
    description:
      'The Main Quest for The Darkest Shore. Requires Ripsaw built and upgraded at least once. Corpse Gate in U-Boat Pen needs a head—use upgraded Ripsaw to cut head from body hanging outside Bunker 3. Two paths: Pommel of Barbarossa and allied airstrike. Both must be completed for final boss fight.',
    videoEmbedUrl: 'https://www.youtube.com/embed/QUfl3uQ9rQw',
    steps: [
      { order: 1, label: 'Build and upgrade Ripsaw (at least once). Use upgraded Ripsaw to launch sawblade—cut head from body hanging outside Bunker 3. Install head on Corpse Gate in U-Boat Pen. Kill zombies to charge, revive body.' },
      { order: 2, label: 'Pen locks down, flames appear. Fight zombies, turn off 3 valves when flame outside is leaking. Gate opens after second demise. Brenner awaits inside—defeat to disable lockdown.' },
      { order: 3, label: 'Path A—Pommel of Barbarossa: Complete ritual path to obtain Pommel.' },
      { order: 4, label: 'Path B—Allied airstrike: Call in and clear path for airstrike.' },
      { order: 5, label: 'Both paths complete. Final boss fight—escape Heligoland.' },
    ],
  },
  {
    gameShortName: 'WW2',
    mapSlug: 'the-darkest-shore',
    name: 'Ripsaw',
    slug: 'ripsaw',
    type: 'BUILDABLE',
    xpReward: 0,
    description:
      'Buildable wonder weapon. Sawblade: corpse left of fuse panel for Ubersprengen. Handle: Artillery Bunker—table right of BAR, bunk in power room, or table right of Faustblitz. Assemble at table in hallway between U-Boat Pens and Bluffs for 2,500 Jolts. Upgrade: bayonet charge zombie for glowing spine, place on table, kill ~20 zombies nearby. Pick up for 500 more (3,000 total). Further upgrade via Ubersprengen with fuse from artillery coordinate.',
    videoEmbedUrl: 'https://www.youtube.com/embed/8NP8OysW9gs',
    steps: [
      { order: 1, label: 'Sawblade: corpse left of fuse panel (Ubersprengen). Handle: Artillery Bunker (table near BAR, bunk, or Faustblitz table).' },
      { order: 2, label: 'Assemble at table between U-Boat Pens and Bluffs. Purchase for 2,500 Jolts.' },
      { order: 3, label: 'Upgrade: Bayonet charge zombie for glowing spine. Place on table. Kill ~20 zombies. Pick up for 500 Jolts.' },
      { order: 4, label: 'Ubersprengen upgrade: Six Enigma devices for coordinate. Fire artillery at coordinate after shell loaded. Fuse drops. Upgrade at Ubersprengen for 5,000 Jolts (R.I.P. Saw).' },
    ],
  },
  // The Shadowed Throne — Main Quest & Buildable
  {
    gameShortName: 'WW2',
    mapSlug: 'the-shadowed-throne',
    name: 'Stadtjäger Down',
    slug: 'stadtjager-down',
    type: 'MAIN_QUEST',
    xpReward: 3000,
    description:
      'The Main Quest for The Shadowed Throne. Defeat the Stadtjäger on Straub\'s Zeppelin. Contact Red Army via Main Street radio (code on radio + Church map red pin = frequency). Launch flare from locked box to summon Zeppelin. Four tethers in Broken Apartments, Museum ceiling, Plaza center, Barbarossa\'s Refuge. Overload with Wunderbuss to lower drop pod.',
    videoEmbedUrl: 'https://www.youtube.com/embed/aaX-agpI5yU',
    steps: [
      { order: 1, label: 'Radio: Code (two letters, one number) on top of Main Street radio. Church map—red pin gives location. Chart left of map gives frequency. Contact Red Army.' },
      { order: 2, label: 'Flares: Locked box opposite radio barricade. Damage to open, melee to launch. Zeppelin arrives, fires four tethers (Broken Apartments, Museum ceiling, Plaza, Barbarossa\'s Refuge). Final tether locked behind Blade of Barbarossa steps.' },
      { order: 3, label: 'Overload all four tethers with Wunderbuss. Drop pod lowers to Main Street. All players in pod with full Wunderbuss ammo—shoot chain to raise to Zeppelin.' },
      { order: 4, label: 'Zeppelin: Move power source via terminals into Straub\'s Laboratory. Zombies reanimate, kill Straub. Return to drop pod—Stadtjäger drops.' },
      { order: 5, label: 'Stadtjäger fight: Phase 1—damage during charge wind-up (chassis glows orange). Phase 2 (≤60% HP)—immune during wind-up, vulnerable when firing Geistbolts. Phase 3 (≤30% HP)—vulnerable during energy storm. Wunderbuss for final phase. Exit pod for ending.' },
    ],
  },
  {
    gameShortName: 'WW2',
    mapSlug: 'the-shadowed-throne',
    name: 'Wunderbuss',
    slug: 'wunderbuss',
    type: 'BUILDABLE',
    xpReward: 0,
    description:
      'Geistkraft weapon. Battery: one of three locations—right of Faustblitz (Museum 2nd floor), left of Geistschild (Museum 1st floor), right of M1928 (Cabaret). Geistbolt: contact Red Army, shoot flare crate lock, melee to launch. Zeppelin creates Gekochts—melee one for Geistbolt. Build in Apartments caged workshop. Insert battery to open gates, place Geistbolt in unfinished Wunderbuss, take battery (locks room), insert into Wunderbuss. Fire beam at control panel to exit.',
    videoEmbedUrl: 'https://www.youtube.com/embed/jouoLbsetq8',
    steps: [
      { order: 1, label: 'Battery: Museum (right of Faustblitz or left of Geistschild) or Cabaret (right of M1928).' },
      { order: 2, label: 'Contact Red Army, shoot flare crate lock, launch flare. Melee Gekocht for Geistbolt.' },
      { order: 3, label: 'Apartments workshop: Insert battery to open. Place Geistbolt in Wunderbuss. Take battery (gates close). Insert battery into Wunderbuss. Fire beam at panel to exit.' },
    ],
  },
  // Altar of Blood — Main Quest & Buildables
  {
    gameShortName: 'WW2',
    mapSlug: 'altar-of-blood',
    name: 'Sword of Barbarossa',
    slug: 'sword-of-barbarossa',
    type: 'MAIN_QUEST',
    xpReward: 2750,
    description:
      'Requires reforging the Sword of Barbarossa in The Tortured Path first. Deposit 1,750 Jolts on each of the four Sacrifice Stones (noise and red Geistkraft burst when correct). Place 1,750 Jolts in bowls around the Forge altar. Forge pulses white. Being downed in the blood pool revives with full Geistschild and Sword of Barbarossa (solo: consumes Lebenblitz if purchased).',
    videoEmbedUrl: 'https://www.youtube.com/embed/hETXFHh93uM',
    steps: [
      { order: 1, label: 'Deposit 1,750 Jolts on each of the four Sacrifice Stones. Correct amount: noise + red Geistkraft burst.' },
      { order: 2, label: 'Place 1,750 Jolts in bowls around the Forge altar (central room). Same effect signifies correct amount.' },
      { order: 3, label: 'Forge produces white pulse. Get downed in blood pool around Forge—instant revive with full Geistschild and Sword of Barbarossa.' },
    ],
  },
  {
    gameShortName: 'WW2',
    mapSlug: 'altar-of-blood',
    name: 'Upgraded Ubersprengen',
    slug: 'upgraded-ubersprengen',
    type: 'BUILDABLE',
    xpReward: 0,
    description:
      'Code: seven runes from Elder Futhark (ᛒ, ᛃ, ᛚ, ᛗ, ᚾ, ᚢ, ᛉ). Info from Bodega Cervantes and U.S.S. Mount Olympus. Shoot runic wall opposite Kugelblitz machine to input. Hidden rock section left of Laufenblitz opens—battery inside. Pick up to auto-place on Ubersprengen. Upgrades Ripsaw, Tesla Gun, Ice Pick, Trench Knife, Baseball Bat.',
    steps: [
      { order: 1, label: 'Assemble rune code from Bodega Cervantes and U.S.S. Mount Olympus info. Code: ᛒ ᛃ ᛚ ᛗ ᚾ ᚢ ᛉ.' },
      { order: 2, label: 'Shoot runic wall opposite Kugelblitz machine. Rock section left of Laufenblitz opens. Pick up battery.' },
    ],
  },
  {
    gameShortName: 'WW2',
    mapSlug: 'altar-of-blood',
    name: 'Kontrollgranates',
    slug: 'kontrollgranates',
    type: 'BUILDABLE',
    xpReward: 0,
    description:
      'Five Jack-in-the-Box symbols. Throw Jack-in-the-Box at each—destroys when it explodes. Locations: behind/above Lebenblitz; above M1 Garand behind pottery; between barrels behind Schnellblitz; above doorway Kugelblitz to Schildblitz; ceiling near scaffolding above M1903. All destroyed: earthquake, flares and Kontrollgranates fall on staircase to Blood Forge. Tactical equipment—red gas, zombies become allied.',
    steps: [
      { order: 1, label: 'Behind/above Lebenblitz.' },
      { order: 2, label: 'Above M1 Garand, behind pottery, left of opening.' },
      { order: 3, label: 'Between barrels behind Schnellblitz.' },
      { order: 4, label: 'Above doorway Kugelblitz to Schildblitz.' },
      { order: 5, label: 'Ceiling near scaffolding above M1903. All five: flares and Kontrollgranates on Blood Forge stairs.' },
    ],
  },
  // The Frozen Dawn — Main Quest & Buildables
  {
    gameShortName: 'WW2',
    mapSlug: 'the-frozen-dawn',
    name: 'Kingfall',
    slug: 'kingfall',
    type: 'MAIN_QUEST',
    xpReward: 2750,
    description:
      'The Main Quest for The Frozen Dawn. Defeat the God-King. Complete four trials (Bloodraven, Deathraven, Moonraven, Stormraven) to obtain upgraded Raven weapons. Place them on four pedestals in Ice Caves. Thulian Transport to boss fight in God King\'s Citadel.',
    videoEmbedUrl: 'https://www.youtube.com/embed/DQtMLo-0OfI',
    steps: [
      { order: 1, label: 'Trial of Bloodraven: Fill three blood pools (5 kills each)—Ice Caves near Thulian Archives, Morgue left of M1928, Overlook (get Bloodraven stone from Morgue bones first). Blood Altar: kill Wüstling for Thulian Shield. Crash Site debris: Bomber destroys—get radio and speaker. Place on stones. Shield kill empowered Corpse Eater on aurora pools for patterns. Radio cycles patterns at Blood Altar, kill zombie for each. Down in pool—Bloodraven trial. Reflect light with shield twice for Roar of Sang\'ket.' },
      { order: 2, label: 'Trial of Deathraven: Phylactery stone—survive ~1 min for Thulian Scythe. Crash Site wire + Corpse Eater spine (scythe kill). Place on Phylactery device. Kill zombies until blade ablaze. Wait two rounds. Thulian Transport—Deathraven trial. Kill 2 empowered Corpse Eaters + 3 Wüstlings for Fang of An\'heist.' },
      { order: 3, label: 'Trial of Moonraven: Two books (Overlook rocks; Passage, Blood Altar, or Morgue ledge). Place on Thulian Archives pedestal—cypher. Three gears (Ice Caves, Phylactery, Blood Altar, Overlook, Passage, Cypher room). Place in Gearworks. Kill zombies at Orrery. Set orbs per mirrored cypher. Broken Flail appears. Moonraven stones (3 zombies each, right to left). Find constellations with Flail (Orrery, Overlook pool, Phylactery window, Blood Altar left/right, Crash Site). Throw Orb at yellow Orrery—trial. Avoid fire wall twice for Talon of Lu\'roth.' },
      { order: 4, label: 'Trial of Stormraven: Crash Site Überschnalle battery—Overlook cauldron. Kill zombies to charge. Thulian Hammer spawns. Four T-shaped stones (Ice Caves, Thulian Archives, Morgue, Blood Altar). Place in slots. Code below stones—kill zombie at runes in order. Four pillars arise. Match lightning runes on incomplete pillars (shoot to rotate). Hammer teleports—go prone, interact from below. Follow to Overlook, pillars zap it. Crash Site purple rune—melee with hammer. Chain: Ice Caves, Morgue, Phylactery (melee zombie on pedestal), hallway rune. Contraption puzzle—fill purple runes (3 puzzles, skull resets). Hammer walk lightning bridge to Stormraven trial. Throw Fist at bubble zombies for Fist of Tal\'rek.' },
      { order: 5, label: 'Key to the Forgotten Tomb: Place Roar of Sang\'ket, Fang of An\'heist, Talon of Lu\'roth, Fist of Tal\'rek on four pedestals (Ice Caves, overlooking Thule). Roar on floor pedestal nearest Crash Site.' },
      { order: 6, label: 'Thulian Transport near Morgue opens. Enter to fight God-King in God King\'s Citadel.' },
    ],
  },
  {
    gameShortName: 'WW2',
    mapSlug: 'the-frozen-dawn',
    name: 'Roar of Sang\'ket (Thulian Shield)',
    slug: 'roar-of-sangket',
    type: 'BUILDABLE',
    xpReward: 0,
    description:
      'Thulian Shield + upgrade. Fill three blood pools (5 kills each). Bloodraven stone from Morgue bones for Overlook pool. Blood Altar Wüstling drops shield. Crash Site: Bomber on debris for radio and speaker. Shield kill empowered Corpse Eater on aurora pools for patterns. Blood Altar: cycle patterns, kill zombie each. Down in pool—trial. Reflect light twice.',
    videoEmbedUrl: 'https://www.youtube.com/embed/THHxwlLGOkk',
    steps: [
      { order: 1, label: 'Fill three blood pools. Bloodraven stone (Morgue bones) for Overlook. Kill Wüstling in Blood Altar for shield.' },
      { order: 2, label: 'Crash Site: Bomber on debris. Radio and speaker on stones. Aurora pools: shield kill Corpse Eater for patterns. Trial: reflect light twice.' },
    ],
  },
  {
    gameShortName: 'WW2',
    mapSlug: 'the-frozen-dawn',
    name: 'Fang of An\'heist (Thulian Scythe)',
    slug: 'fang-of-anheist',
    type: 'BUILDABLE',
    xpReward: 0,
    description:
      'Thulian Scythe + upgrade. Phylactery Deathraven stone—survive for scythe. Crash Site wire + Corpse Eater spine (scythe kill + interact). Place on Phylactery device. Kill zombies until blade ablaze. Two rounds to cool. Thulian Transport—trial. Kill 2 empowered Corpse Eaters + 3 Wüstlings.',
    videoEmbedUrl: 'https://www.youtube.com/embed/rW1eKYxYssE',
    steps: [
      { order: 1, label: 'Phylactery stone—survive for Thulian Scythe. Wire (Crash Site) + spine. Blade ablaze, wait two rounds.' },
      { order: 2, label: 'Thulian Transport—trial. Kill 2 empowered Corpse Eaters and 3 Wüstlings.' },
    ],
  },
  {
    gameShortName: 'WW2',
    mapSlug: 'the-frozen-dawn',
    name: 'Talon of Lu\'roth (Broken Flail)',
    slug: 'talon-of-luroth',
    type: 'BUILDABLE',
    xpReward: 0,
    description:
      'Broken Flail + Talon of Lu\'roth. Two books (Overlook; Passage/Blood Altar/Morgue). Thulian Archives pedestal—cypher. Three gears (random locations). Gearworks Orrery—kill zombies, set orbs per cypher. Moonraven stones: 3 zombies each. Constellations with Flail (6 locations). Throw Orb at yellow Orrery—trial. Avoid fire wall twice.',
    videoEmbedUrl: 'https://www.youtube.com/embed/j4kdFj-CLTw',
    steps: [
      { order: 1, label: 'Two books, cypher. Three gears, Orrery. Broken Flail. Moonraven stones, constellations.' },
      { order: 2, label: 'Throw Orb at yellow Orrery. Trial: avoid fire wall twice.' },
    ],
  },
  {
    gameShortName: 'WW2',
    mapSlug: 'the-frozen-dawn',
    name: 'Fist of Tal\'rek (Thulian Hammer)',
    slug: 'fist-of-talrek',
    type: 'BUILDABLE',
    xpReward: 0,
    description:
      'Thulian Hammer + upgrade. Crash Site battery—Overlook cauldron. Four T-shaped stones. Code from stones, runes. Four pillars—match lightning. Hammer teleports—prone interact. Follow to Overlook. Purple rune chain: Crash Site, Ice Caves, Morgue, Phylactery, hallway. Contraption puzzle (3). Lightning bridge to trial. Throw Fist at bubble zombies.',
    videoEmbedUrl: 'https://www.youtube.com/embed/2fv6Fa8QybA',
    steps: [
      { order: 1, label: 'Battery in cauldron. Four stones, code, pillars. Prone interact hammer, follow to Overlook.' },
      { order: 2, label: 'Rune chain, contraption puzzle. Lightning bridge. Trial: throw Fist at bubble zombies.' },
    ],
  },
  {
    gameShortName: 'WW2',
    mapSlug: 'the-frozen-dawn',
    name: 'Raven Claw',
    slug: 'raven-claw',
    type: 'SIDE_QUEST',
    xpReward: 0,
    description:
      'Hide-and-seek Easter egg. Once per game. Interact with golden raven statue (high ground behind blood pool missing Bloodraven stone). Raven spawns—find and shoot with pistol only (other weapons fail). Corpse Eater spawns after shot. Kill it. Repeat four times. Raven Claw on stone slab in Blood Altar. Upgrades via Ubersprengen to Raven Eye.',
    videoEmbedUrl: 'https://www.youtube.com/embed/4fG-Z4fAV9I',
    steps: [
      { order: 1, label: 'Interact golden raven statue (behind Overlook blood pool).' },
      { order: 2, label: 'Find and shoot raven with pistol. Kill Corpse Eater. Repeat four times for Raven Claw.' },
    ],
  },
];
