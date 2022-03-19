// camera with a position and facing

import { Vec3, vec3_add, vec3_allocate, vec3_create, vec3_cross, vec3_mul, vec3_normalize } from "./vec3.ts";
import { mat4_lookAt } from "./mat4.ts";
import { clamp, mod } from "./utils.ts";

type Camera = {
  pos: Vec3;
  yaw: number;
  pitch: number;
};

const WORLD_UP = vec3_create(0, 1, 0);
// TODO: test what happens if these are unclamped
const MIN_PITCH = -Math.PI / 2 + 0.01;
const MAX_PITCH = Math.PI / 2 - 0.01;

export const camera_create = () => {
  return { pos: vec3_create(0, 0, 0), yaw: 0, pitch: 0 };
};

export const camera_getFront = (camera: Camera) => {
  const vec = vec3_allocate();

  vec[0] = Math.cos(camera.yaw) * Math.cos(camera.pitch);
  vec[1] = Math.sin(camera.pitch);
  vec[2] = -Math.sin(camera.yaw) * Math.cos(camera.pitch);

  return vec3_normalize(vec);
};

export const camera_getViewMat = (camera: Camera) => {
  return mat4_lookAt(camera.pos, vec3_add(camera.pos, camera_getFront(camera)), WORLD_UP);
};

export const camera_move = (camera: Camera, dir: Vec3) => {
  const zAxis = vec3_mul(camera_getFront(camera), -1); // z axis points backward
  const xAxis = vec3_normalize(vec3_cross(WORLD_UP, zAxis));
  const yAxis = vec3_cross(zAxis, xAxis);

  // TODO: rethink naming here
  const dx = vec3_mul(xAxis, dir[0]);
  const dy = vec3_mul(yAxis, dir[1]);
  const dz = vec3_mul(zAxis, dir[2]);

  camera.pos = vec3_add(camera.pos, vec3_add(dx, vec3_add(dy, dz)));
};

export const camera_turn = (camera: Camera, dYaw: number, dPitch: number) => {
  camera.yaw = mod(camera.yaw + dYaw + Math.PI, 2 * Math.PI) - Math.PI; // mod between -PI and +PI
  camera.pitch = clamp(camera.pitch + dPitch, MIN_PITCH, MAX_PITCH);
};
