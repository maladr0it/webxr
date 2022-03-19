import { frameLog, log_write } from "./log.ts";

export type Vec3 = Float32Array & { _tag: Vec3 };

export const vec3_allocate = () => {
  return new Float32Array(3) as Vec3;
};

export const vec3_create = (x: number, y: number, z: number) => {
  const result = vec3_allocate();

  result[0] = x;
  result[1] = y;
  result[2] = z;
  return result;
};

export const vec3_add = (a: Vec3, b: Vec3) => {
  const result = vec3_allocate();

  for (let i = 0; i < 3; ++i) {
    result[i] = a[i] + b[i];
  }
  return result;
};

export const vec3_sub = (a: Vec3, b: Vec3) => {
  const result = vec3_allocate();

  for (let i = 0; i < 3; ++i) {
    result[i] = a[i] - b[i];
  }
  return result;
};

export const vec3_mul = (a: Vec3, b: number) => {
  const result = vec3_allocate();

  for (let i = 0; i < 3; ++i) {
    result[i] = a[i] * b;
  }
  return result;
};

export const vec3_div = (a: Vec3, b: number) => {
  const result = vec3_allocate();

  for (let i = 0; i < 3; ++i) {
    result[i] = a[i] / b;
  }
  return result;
};

export const vec3_cross = (a: Vec3, b: Vec3) => {
  const result = vec3_allocate();

  result[0] = a[1] * b[2] - a[2] * b[1];
  result[1] = a[2] * b[0] - a[0] * b[2];
  result[2] = a[0] * b[1] - a[1] * b[0];
  return result;
};

export const vec3_dot = (a: Vec3, b: Vec3) => {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
};

export const vec3_len = (a: Vec3) => {
  return Math.sqrt(a[0] * a[0] + a[1] * a[1] + a[2] * a[2]);
};

export const vec3_lenSquared = (a: Vec3) => {
  return a[0] * a[0] + a[1] * a[1] + a[2] * a[2];
};

export const vec3_normalize = (a: Vec3) => {
  return vec3_div(a, vec3_len(a));
};
