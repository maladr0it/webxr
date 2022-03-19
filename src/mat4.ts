import { frameLog, log_write } from "./log.ts";
import { Vec3, vec3_cross, vec3_normalize, vec3_sub } from "./vec3.ts";

export type Mat4 = Float32Array & { _tag: Mat4 };

const mat4_allocate = () => {
  return new Float32Array(16) as Mat4;
};

export const mat4_identity = () => {
  const result = mat4_allocate();

  result[0] = 1;
  result[1] = 0;
  result[2] = 0;
  result[3] = 0;

  result[4] = 0;
  result[5] = 1;
  result[6] = 0;
  result[7] = 0;

  result[8] = 0;
  result[9] = 0;
  result[10] = 1;
  result[11] = 0;

  result[12] = 0;
  result[13] = 0;
  result[14] = 0;
  result[15] = 1;

  return result;
};

export const mat4_projection = (
  fov: number,
  aspectRatio: number,
  zNear: number,
  zFar: number,
) => {
  const result = mat4_allocate();

  log_write(frameLog, -(zFar + zNear) / (zFar - zNear), (-2 * zFar * zNear) / (zFar - zNear));

  result[0] = 1 / (Math.tan(fov / 2));
  result[1] = 0;
  result[2] = 0;
  result[3] = 0;

  result[4] = 0;
  result[5] = aspectRatio / Math.tan(fov / 2);
  result[6] = 0;
  result[7] = 0;

  result[8] = 0;
  result[9] = 0;
  result[10] = -(zFar + zNear) / (zFar - zNear);
  result[11] = (-2 * zFar * zNear) / (zFar - zNear);

  result[12] = 0;
  result[13] = 0;
  result[14] = -1;
  result[15] = 0;

  log_write(frameLog, result);

  return result;
};

export const mat4_translate = (t: Vec3) => {
  const result = mat4_allocate();

  result[0] = 1;
  result[1] = 0;
  result[2] = 0;
  result[3] = t[0];

  result[4] = 0;
  result[5] = 1;
  result[6] = 0;
  result[7] = t[1];

  result[8] = 0;
  result[9] = 0;
  result[10] = 1;
  result[11] = t[2];

  result[12] = 0;
  result[13] = 0;
  result[14] = 0;
  result[15] = 1;

  return result;
};

export const mat4_rotX = (theta: number) => {
  const result = mat4_allocate();

  result[0] = 1;
  result[1] = 0;
  result[2] = 0;
  result[3] = 0;

  result[4] = 0;
  result[5] = Math.cos(theta);
  result[6] = -Math.sin(theta);
  result[7] = 0;

  result[8] = 0;
  result[9] = Math.sin(theta);
  result[10] = Math.cos(theta);
  result[11] = 0;

  result[12] = 0;
  result[13] = 0;
  result[14] = 0;
  result[15] = 1;

  return result;
};

export const mat4_rotY = (theta: number) => {
  const result = mat4_allocate();

  result[0] = Math.cos(theta);
  result[1] = 0;
  result[2] = Math.sin(theta);
  result[3] = 0;

  result[4] = 0;
  result[5] = 1;
  result[6] = 0;
  result[7] = 0;

  result[8] = -Math.sin(theta);
  result[9] = 0;
  result[10] = Math.cos(theta);
  result[11] = 0;

  result[12] = 0;
  result[13] = 0;
  result[14] = 0;
  result[15] = 1;

  return result;
};

export const mat4_rotZ = (theta: number) => {
  const result = mat4_allocate();

  result[0] = Math.cos(theta);
  result[1] = -Math.sin(theta);
  result[2] = 0;
  result[3] = 0;

  result[4] = Math.sin(theta);
  result[5] = Math.cos(theta);
  result[6] = 0;
  result[7] = 0;

  result[8] = 0;
  result[9] = 0;
  result[10] = 1;
  result[11] = 0;

  result[12] = 0;
  result[13] = 0;
  result[14] = 0;
  result[15] = 1;

  return result;
};

export const mat4_lookAt = (pos: Vec3, target: Vec3, worldUp: Vec3) => {
  const zAxis = vec3_normalize(vec3_sub(pos, target)); // camera's Z axis (points backward)
  const xAxis = vec3_normalize(vec3_cross(worldUp, zAxis));
  const yAxis = vec3_cross(zAxis, xAxis);

  const result = mat4_allocate();

  result[0] = xAxis[0];
  result[1] = xAxis[1];
  result[2] = xAxis[2];
  result[3] = xAxis[0] * -pos[0] + xAxis[1] * -pos[1] + xAxis[2] * -pos[2];

  result[4] = yAxis[0];
  result[5] = yAxis[1];
  result[6] = yAxis[2];
  result[7] = yAxis[0] * -pos[0] + yAxis[1] * -pos[1] + yAxis[2] * -pos[2];

  result[8] = zAxis[0];
  result[9] = zAxis[1];
  result[10] = zAxis[2];
  result[11] = zAxis[0] * -pos[0] + zAxis[1] * -pos[1] + zAxis[2] * -pos[2];

  result[12] = 0;
  result[13] = 0;
  result[14] = 0;
  result[15] = 1;

  return result;
};

export const mat4_mul = (a: Mat4, b: Mat4) => {
  const result = mat4_allocate();

  for (let i = 0; i < 4; ++i) {
    for (let j = 0; j < 4; ++j) {
      // deno-fmt-ignore
      result[4 * i + j] = (
        a[4 * i + 0] * b[4 * 0 + j] +
        a[4 * i + 1] * b[4 * 1 + j] + 
        a[4 * i + 2] * b[4 * 2 + j] +
        a[4 * i + 3] * b[4 * 3 + j]
      );
    }
  }
  return result;
};
