export const PITCH_DIMENSIONS = {
  width: 10.6,
  length: 18.4,
}

export const HERO_STEPS = [
  {
    cue: 'Start',
    title: 'Goalkeeper to RCB',
    detail: '#1 waits, invites the press, then rolls into #4 to start the chain.',
    progress: 0,
  },
  {
    cue: 'Pass 1',
    title: '#4 breaks the first line',
    detail: 'The right center-back threads the pass into #6 near the center circle.',
    progress: 0.14,
  },
  {
    cue: 'Pass 2',
    title: '#6 finds the right lane',
    detail: '#7 opens on the touchline and stretches the press to the wing.',
    progress: 0.3,
  },
  {
    cue: 'Pass 3',
    title: '#10 drops into the pocket',
    detail: 'The forward steps off the front line to receive between the midfielders.',
    progress: 0.47,
  },
  {
    cue: 'Pass 4',
    title: '#11 attacks the blind side',
    detail: 'The left runner goes diagonally behind the block and receives on the move.',
    progress: 0.62,
  },
  {
    cue: 'Pass 5',
    title: '#11 bends the cross',
    detail: 'A final touch carries the move to the byline before the ball is whipped in.',
    progress: 0.8,
  },
  {
    cue: 'Finish',
    title: '#9 arrives at the bottom goal',
    detail: 'The striker pins the center-backs and meets the final ball in the box.',
    progress: 0.93,
  },
]

export const ATTACKING_SETUP = [
  { number: 1, role: 'GK', x: 0, y: 7.45 },
  { number: 3, role: 'LB', x: -3.2, y: 5.55 },
  { number: 5, role: 'LCB', x: -1.05, y: 5.8 },
  { number: 4, role: 'RCB', x: 1.1, y: 5.8 },
  { number: 2, role: 'RB', x: 3.2, y: 5.55 },
  { number: 11, role: 'LW', x: -2.45, y: 1.95 },
  { number: 6, role: 'CM', x: 0, y: 0.95 },
  { number: 7, role: 'RM/RW', x: 2.55, y: 1.85 },
  { number: 10, role: 'CAM/ST', x: -1.05, y: -1.1 },
  { number: 9, role: 'ST', x: 0.2, y: -2.65 },
  { number: 8, role: 'RW', x: 3.15, y: -1.15 },
]

export const DEFENDING_SETUP = [
  { number: 1, x: 0, y: -7.45, line: 0, shiftStrength: 0.2 },
  { number: 2, x: -3.15, y: -5.75, line: 1, shiftStrength: 0.38 },
  { number: 3, x: -1.05, y: -5.95, line: 1, shiftStrength: 0.38 },
  { number: 4, x: 1.05, y: -5.95, line: 1, shiftStrength: 0.38 },
  { number: 5, x: 3.15, y: -5.75, line: 1, shiftStrength: 0.38 },
  { number: 6, x: -3.35, y: -3.25, line: 2, shiftStrength: 0.5 },
  { number: 7, x: -1.15, y: -3.45, line: 2, shiftStrength: 0.5 },
  { number: 8, x: 1.15, y: -3.45, line: 2, shiftStrength: 0.5 },
  { number: 9, x: 3.35, y: -3.25, line: 2, shiftStrength: 0.5 },
  { number: 10, x: -1.1, y: -1.2, line: 3, shiftStrength: 0.64 },
  { number: 11, x: 1.1, y: -1.2, line: 3, shiftStrength: 0.64 },
]

export const ATTACK_MOVES = {
  7: { x: 3.7, y: 0.45 },
  10: { x: 0.3, y: -0.45 },
  11: {
    diagonal: { x: -3.4, y: -3.9 },
    cross: { x: -4.1, y: -6.1 },
  },
  9: { x: 0.15, y: -7.1 },
}

export const BALL_ROUTE = {
  crossTarget: { x: -0.35, y: -5.95 },
  finish: { x: 0.15, y: -7.1 },
}

export function pickRandomTeams(teams) {
  const attackIndex = Math.floor(Math.random() * teams.length)
  let defenseIndex = attackIndex

  while (defenseIndex === attackIndex) {
    defenseIndex = Math.floor(Math.random() * teams.length)
  }

  return {
    attack: teams[attackIndex],
    defense: teams[defenseIndex],
  }
}

export function createPositionMap(players) {
  return Object.fromEntries(players.map((player) => [player.number, { x: player.x, y: player.y }]))
}

export function getActiveBeat(progress) {
  let activeBeat = 0

  HERO_STEPS.forEach((step, index) => {
    if (progress >= step.progress) {
      activeBeat = index
    }
  })

  return activeBeat
}
