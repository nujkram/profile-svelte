/**
 * The figure's "life": a looping script of small activities, written as a generator so each
 * activity reads top to bottom. The script only sets targets (pose, mode, flags) and yields a
 * condition to wait for; Figure.svelte moves the rig toward those targets every frame.
 */

export type Pose = {
	hipY: number;
	lean: number;
	headX: number;
	headZ: number;
	lShX: number;
	lShZ: number;
	lElX: number;
	rShX: number;
	rShZ: number;
	rElX: number;
	rElZ: number;
	hipX: number;
	knee: number;
};

/** Looping motion layered on top of the pose. */
export type Mode = 'wave' | 'type' | 'walk' | 'talk' | 'read' | null;

export type Cond =
	| { kind: 'wait'; time: number; skippable: boolean }
	| { kind: 'walk'; x: number; z: number; keepFacing: boolean }
	| { kind: 'turn'; angle: number };

export type FigureState = {
	pose: Pose;
	mode: Mode;
	/** While seated the chair moves and swivels with the figure. */
	seated: boolean;
};

// Negative shoulder/hip X swings a limb forward; positive Z lifts the right arm outward.
export const SIT: Pose = {
	hipY: 0.74,
	lean: 0,
	headX: -0.16,
	headZ: 0,
	lShX: -0.35,
	lShZ: -0.05,
	lElX: -0.9,
	rShX: -0.35,
	rShZ: 0.05,
	rElX: -0.9,
	rElZ: 0,
	hipX: -Math.PI / 2,
	knee: Math.PI / 2
};
const STAND: Pose = {
	...SIT,
	hipY: 1.02,
	headX: -0.06,
	lShX: 0,
	lElX: -0.1,
	rShX: 0,
	rElX: -0.1,
	hipX: 0,
	knee: 0
};
const WAVE: Pose = { ...SIT, rShX: 0, rShZ: 2.45, rElX: 0, rElZ: 0.3 };
const TYPE: Pose = {
	...SIT,
	lean: 0.2,
	headX: 0.02,
	lShX: -0.75,
	lElX: -0.85,
	rShX: -0.75,
	rElX: -0.85
};
const REACH: Pose = { ...STAND, lean: 0.14, rShX: -1.25, rElX: -0.25 };
const CALL: Pose = { ...STAND, rShX: -0.9, rShZ: 0.3, rElX: -2.3, headZ: -0.14 };
const LOOK_UP: Pose = { ...STAND, headX: -0.32 };
const BROWSE: Pose = { ...STAND, headX: 0.1, rShX: -1.45, rElX: -0.2 };
const THINK: Pose = {
	...STAND,
	headX: -0.24,
	rShX: -0.8,
	rShZ: -0.3,
	rElX: -2.15,
	lShX: 0.1,
	lShZ: -0.3,
	lElX: -1.2
};

/** World x/z of the chair, and the heading that faces the default camera. */
export const SEAT: [number, number] = [-0.9, -1.95];
export const FACE_CAMERA = Math.PI / 4;

// One step forward out of the chair
const STAND_POINT: [number, number] = [
	SEAT[0] + Math.sin(FACE_CAMERA) * 0.5,
	SEAT[1] + Math.cos(FACE_CAMERA) * 0.5
];
const FACE_DESK = Math.PI;
const FACE_LEFT_WALL = -Math.PI / 2;

const wait = (time: number, skippable = false): Cond => ({ kind: 'wait', time, skippable });
const walk = (x: number, z: number, keepFacing = false): Cond => ({
	kind: 'walk',
	x,
	z,
	keepFacing
});
const turn = (angle: number): Cond => ({ kind: 'turn', angle });
const between = (min: number, max: number) => min + Math.random() * (max - min);

export function* routine(
	state: FigureState,
	options: {
		hasNotes: boolean;
		/** True while the About panel is open: stay at the desk and keep waving. */
		wanted: () => boolean;
		setPhoneLifted: (lifted: boolean) => void;
	}
): Generator<Cond> {
	function* goTo(x: number, z: number, facing: number) {
		state.seated = false;
		state.pose = STAND;
		yield walk(...STAND_POINT, true);
		state.mode = 'walk';
		yield walk(x, z);
		state.mode = null;
		yield turn(facing);
	}

	function* goBack() {
		state.pose = STAND;
		state.mode = 'walk';
		yield walk(...STAND_POINT);
		state.mode = null;
		yield turn(FACE_CAMERA);
		yield walk(...SEAT, true);
		state.seated = true;
		state.pose = SIT;
		yield wait(0.5);
	}

	const activities: Record<string, () => Generator<Cond>> = {
		*wave() {
			state.pose = WAVE;
			state.mode = 'wave';
			yield wait(2.6);
			state.mode = null;
			state.pose = SIT;
		},
		// Swivel to the desk, roll in and type for a while
		*computer() {
			yield turn(FACE_DESK);
			yield walk(SEAT[0], -2.35, true);
			state.pose = TYPE;
			state.mode = 'type';
			yield wait(between(4, 6.5), true);
			state.mode = null;
			state.pose = SIT;
			yield walk(...SEAT, true);
			yield turn(FACE_CAMERA);
		},
		*phone() {
			yield* goTo(-2.88, -0.16, FACE_LEFT_WALL);
			state.pose = REACH;
			yield wait(0.55);
			options.setPhoneLifted(true);
			state.pose = CALL;
			state.mode = 'talk';
			yield wait(between(3.5, 5), true);
			state.mode = null;
			state.pose = REACH;
			yield wait(0.55);
			options.setPhoneLifted(false);
			yield* goBack();
		},
		*bookshelf() {
			yield* goTo(2.85, -2.8, FACE_DESK);
			state.pose = LOOK_UP;
			yield wait(1.3, true);
			state.pose = BROWSE;
			yield wait(1.8, true);
			yield* goBack();
		},
		// Hand on chin, reading the testimonials
		*notes() {
			yield* goTo(-3.0, 2.2, FACE_LEFT_WALL);
			state.pose = THINK;
			state.mode = 'read';
			yield wait(between(3.5, 5), true);
			state.mode = null;
			yield* goBack();
		}
	};

	const errands = Object.keys(activities).filter((name) => name !== 'notes' || options.hasNotes);

	// Greet first, then pick something different each time
	yield wait(0.8);
	yield* activities.wave();
	let last = 'wave';

	while (true) {
		yield wait(between(1.5, 3.5));
		if (options.wanted()) {
			yield* activities.wave();
			continue;
		}
		const choices = errands.filter((name) => name !== last);
		last = choices[Math.floor(Math.random() * choices.length)];
		yield* activities[last]();
	}
}
