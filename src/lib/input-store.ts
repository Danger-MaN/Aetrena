// Shared input state for the 3D world. Keyboard + virtual joystick + look pad.
// Refs (not React state) so the render loop reads without re-renders.

export type Vec2 = { x: number; y: number };
export type Look = { dx: number; dy: number };

export const inputState = {
  keys: new Set<string>(),
  move: { x: 0, y: 0 } as Vec2,
  look: { dx: 0, dy: 0 } as Look,
  run: false,
  interactRequested: 0,
};

export function consumeLook(): Look {
  const out: Look = { dx: inputState.look.dx, dy: inputState.look.dy };
  inputState.look.dx = 0;
  inputState.look.dy = 0;
  return out;
}

export function resetInput() {
  inputState.keys.clear();
  inputState.move.x = 0;
  inputState.move.y = 0;
  inputState.look.dx = 0;
  inputState.look.dy = 0;
  inputState.run = false;
}
