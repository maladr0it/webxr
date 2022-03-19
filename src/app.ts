/// <reference lib="dom" />

import { createProgram, createShader } from "./shader.ts";
import { frameLog, log, log_clear, log_write } from "./log.ts";
import { vec3_create, vec3_lenSquared, vec3_mul, vec3_normalize } from "./vec3.ts";
import { mat4_identity, mat4_mul, mat4_projection, mat4_rotX, mat4_rotY, mat4_rotZ, mat4_translate } from "./mat4.ts";
import { camera_create, camera_getViewMat, camera_move, camera_turn } from "./camera.ts";
import { loadImage } from "./utils.ts";

enum InputButton {
  quit,
  up,
  down,
  left,
  right,
}

const MOUSE_SENSITIVITY = 0.1;

const MIN_STEP_TIME = 1 / 240 * 1000;
const MAX_STEP_TIME = 1 / 30 * 1000;

const keyboardMap = {
  "Escape": InputButton.quit,
  "w": InputButton.up,
  "s": InputButton.down,
  "a": InputButton.left,
  "d": InputButton.right,
};

const isInputKey = (key: string): key is keyof typeof keyboardMap => {
  return key in keyboardMap;
};

const run = async () => {
  const VIEWPORT_WIDTH = 1024;
  const VIEWPORT_HEIGHT = 512;

  const ASPECT_RATIO = VIEWPORT_WIDTH / VIEWPORT_HEIGHT;
  const FOV_RADS = Math.PI / 2;
  const Z_NEAR = 0.1;
  const Z_FAR = 100;

  const CAMERA_SPEED = 5;

  // deno-fmt-ignore
  const CUBE_VERTS = new Float32Array([
    // pos                tex           normal
    // front
    -1.0, -1.0,  1.0,     0.0, 0.0,      0.0,  0.0,  1.0,
     1.0, -1.0,  1.0,     1.0, 0.0,      0.0,  0.0,  1.0,
     1.0,  1.0,  1.0,     1.0, 1.0,      0.0,  0.0,  1.0,
    -1.0, -1.0,  1.0,     0.0, 0.0,      0.0,  0.0,  1.0,
     1.0,  1.0,  1.0,     1.0, 1.0,      0.0,  0.0,  1.0,
    -1.0,  1.0,  1.0,     0.0, 1.0,      0.0,  0.0,  1.0,
    // right
     1.0, -1.0,  1.0,     0.0, 0.0,      1.0,  0.0,  0.0,
     1.0, -1.0, -1.0,     1.0, 0.0,      1.0,  0.0,  0.0,
     1.0,  1.0, -1.0,     1.0, 1.0,      1.0,  0.0,  0.0,
     1.0, -1.0,  1.0,     0.0, 0.0,      1.0,  0.0,  0.0,
     1.0,  1.0, -1.0,     1.0, 1.0,      1.0,  0.0,  0.0,
     1.0,  1.0,  1.0,     0.0, 1.0,      1.0,  0.0,  0.0,
     // back
     1.0, -1.0, -1.0,     0.0, 0.0,      0.0,  0.0, -1.0,
    -1.0, -1.0, -1.0,     1.0, 0.0,      0.0,  0.0, -1.0,
    -1.0,  1.0, -1.0,     1.0, 1.0,      0.0,  0.0, -1.0,
     1.0, -1.0, -1.0,     0.0, 0.0,      0.0,  0.0, -1.0,
    -1.0,  1.0, -1.0,     1.0, 1.0,      0.0,  0.0, -1.0,
     1.0,  1.0, -1.0,     0.0, 1.0,      0.0,  0.0, -1.0,
     // left
    -1.0, -1.0, -1.0,     0.0, 0.0,     -1.0,  0.0,  0.0,
    -1.0, -1.0,  1.0,     1.0, 0.0,     -1.0,  0.0,  0.0,
    -1.0,  1.0,  1.0,     1.0, 1.0,     -1.0,  0.0,  0.0,
    -1.0, -1.0, -1.0,     0.0, 0.0,     -1.0,  0.0,  0.0,
    -1.0,  1.0,  1.0,     1.0, 1.0,     -1.0,  0.0,  0.0,
    -1.0,  1.0, -1.0,     0.0, 1.0,     -1.0,  0.0,  0.0,
     // top
    -1.0,  1.0,  1.0,     0.0, 0.0,      0.0,  1.0,  0.0,
     1.0,  1.0,  1.0,     1.0, 0.0,      0.0,  1.0,  0.0,
     1.0,  1.0, -1.0,     1.0, 1.0,      0.0,  1.0,  0.0,
    -1.0,  1.0,  1.0,     0.0, 0.0,      0.0,  1.0,  0.0,
     1.0,  1.0, -1.0,     1.0, 1.0,      0.0,  1.0,  0.0,
    -1.0,  1.0, -1.0,     0.0, 1.0,      0.0,  1.0,  0.0,
     // bot
    -1.0, -1.0, -1.0,     0.0, 0.0,      0.0, -1.0,  0.0,
     1.0, -1.0, -1.0,     1.0, 0.0,      0.0, -1.0,  0.0,
     1.0, -1.0,  1.0,     1.0, 1.0,      0.0, -1.0,  0.0,
    -1.0, -1.0, -1.0,     0.0, 0.0,      0.0, -1.0,  0.0,
     1.0, -1.0,  1.0,     1.0, 1.0,      0.0, -1.0,  0.0,
    -1.0, -1.0,  1.0,     0.0, 1.0,      0.0, -1.0,  0.0,
  ]);

  const logEl = document.getElementById("log") as HTMLElement;
  const frameLogEl = document.getElementById("frame-log") as HTMLElement;

  const canvasEl = document.getElementById("canvas") as HTMLCanvasElement;
  const gl = canvasEl.getContext("webgl2");
  if (!gl) {
    throw new Error("WebGL2 not supported.");
  }

  canvasEl.height = VIEWPORT_HEIGHT;
  canvasEl.width = VIEWPORT_WIDTH;

  gl.enable(gl.CULL_FACE);
  gl.enable(gl.DEPTH_TEST);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

  //
  // Create program
  //
  const vsSource = await fetch("shaders/vert.vs").then((resp) => resp.text());
  const vs = createShader(gl, gl.VERTEX_SHADER, vsSource);
  if (!vs) {
    throw new Error("Vertex shader could not be created.");
  }
  const fsSource = await fetch("shaders/frag.fs").then((resp) => resp.text());
  const fs = createShader(gl, gl.FRAGMENT_SHADER, fsSource);
  if (!fs) {
    throw new Error("Fragment shader could not be created.");
  }
  const program = createProgram(gl, vs, fs);
  if (!program) {
    throw new Error("Program could not be created.");
  }

  // Create vertex buffer/VBO
  //
  const vertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, CUBE_VERTS, gl.STATIC_DRAW);

  //
  // Create vertex array/VAO
  //
  const vertexArray = gl.createVertexArray();
  gl.bindVertexArray(vertexArray); // gets bound ato a global

  const positionAttribLocation = gl.getAttribLocation(program, "vertPos");
  gl.vertexAttribPointer(positionAttribLocation, 3, gl.FLOAT, false, 8 * 4, 0);
  gl.enableVertexAttribArray(positionAttribLocation);

  const texCoordAttribLocation = gl.getAttribLocation(program, "vertTexCoord");
  gl.vertexAttribPointer(texCoordAttribLocation, 2, gl.FLOAT, false, 8 * 4, 3 * 4);
  gl.enableVertexAttribArray(texCoordAttribLocation);

  const normalAttribLocation = gl.getAttribLocation(program, "vertNormal");
  gl.vertexAttribPointer(normalAttribLocation, 3, gl.FLOAT, false, 8 * 4, 5 * 4);
  gl.enableVertexAttribArray(normalAttribLocation);

  //
  // Create textures
  //
  const texture1 = gl.createTexture();
  gl.activeTexture(gl.TEXTURE0 + 0);
  gl.bindTexture(gl.TEXTURE_2D, texture1);
  // set as 1x1 blue while the image loads
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 255, 255]));

  loadImage("images/container.png").then((textureImage) => {
    gl.activeTexture(gl.TEXTURE0 + 0);
    gl.bindTexture(gl.TEXTURE_2D, texture1);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, textureImage);
    gl.generateMipmap(gl.TEXTURE_2D);
  });

  const texture2 = gl.createTexture();
  gl.activeTexture(gl.TEXTURE0 + 1);
  gl.bindTexture(gl.TEXTURE_2D, texture2);
  // set as 1x1 red while the image loads
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([255, 0, 0, 255]));

  loadImage("images/f-texture.png").then((textureImage) => {
    gl.activeTexture(gl.TEXTURE0 + 1);
    gl.bindTexture(gl.TEXTURE_2D, texture2);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, textureImage);
    gl.generateMipmap(gl.TEXTURE_2D);
  });

  //
  // Update loop
  //
  const buttonState = {
    [InputButton.quit]: false,
    [InputButton.up]: false,
    [InputButton.down]: false,
    [InputButton.left]: false,
    [InputButton.right]: false,
  };

  const pointerState = {
    dx: 0,
    dy: 0,
  };

  let running = true;
  const camera = camera_create();
  camera_turn(camera, Math.PI / 2, 0);

  let cubePos = vec3_create(6, 0, -5);
  let cubeRotX = 0;
  let cubeRotY = 0;
  let cubeRotZ = 0;

  const update = (dt: number) => {
    if (buttonState[InputButton.quit]) {
      running = false;
    }

    const moveVec = vec3_create(0, 0, 0);
    if (buttonState[InputButton.up]) {
      moveVec[2] -= 1;
    }
    if (buttonState[InputButton.down]) {
      moveVec[2] += 1;
    }
    if (buttonState[InputButton.left]) {
      moveVec[0] -= 1;
    }
    if (buttonState[InputButton.right]) {
      moveVec[0] += 1;
    }
    if (vec3_lenSquared(moveVec)) {
      camera_move(camera, vec3_mul(vec3_normalize(moveVec), CAMERA_SPEED * dt));
    }

    const dYaw = -(MOUSE_SENSITIVITY * pointerState.dx * dt); // +ve X mouse direction (right) rotates -ve about Y axis
    pointerState.dx = 0;
    const dPitch = -(MOUSE_SENSITIVITY * pointerState.dy * dt); // +ve Y mouse direction (down) rotates -ve about X axis
    pointerState.dy = 0;
    camera_turn(camera, dYaw, dPitch);
  };

  //
  // Render loop
  //
  const render = () => {
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.useProgram(program);

    const projMat = mat4_projection(FOV_RADS, ASPECT_RATIO, Z_NEAR, Z_FAR);
    gl.uniformMatrix4fv(gl.getUniformLocation(program, "projMat"), true, projMat);

    const viewMat = camera_getViewMat(camera);
    gl.uniformMatrix4fv(gl.getUniformLocation(program, "viewMat"), true, viewMat);

    gl.uniform1i(gl.getUniformLocation(program, "texture1"), 0);
    gl.uniform1i(gl.getUniformLocation(program, "texture2"), 1);

    let modelMat = mat4_identity();
    modelMat = mat4_mul(modelMat, mat4_translate(cubePos));
    modelMat = mat4_mul(modelMat, mat4_rotX(cubeRotX));
    modelMat = mat4_mul(modelMat, mat4_rotY(cubeRotY));
    modelMat = mat4_mul(modelMat, mat4_rotZ(cubeRotZ));
    gl.uniformMatrix4fv(gl.getUniformLocation(program, "modelMat"), true, modelMat);

    gl.bindVertexArray(vertexArray);
    gl.drawArrays(gl.TRIANGLES, 0, CUBE_VERTS.length / 8);
  };

  //
  // Main loop
  //
  let frameTimeAccumulator = 0;
  let prevTime = performance.now();

  const loop = (time: number) => {
    if (!running) {
      return;
    }

    const frameTime = time - prevTime;
    log_write(frameLog, "frame time:", frameTime);
    prevTime = time;
    frameTimeAccumulator += frameTime;

    if (frameTimeAccumulator > MIN_STEP_TIME) {
      const dt = Math.min(frameTimeAccumulator, MAX_STEP_TIME);
      frameTimeAccumulator -= dt;
      update(dt / 1000);
    }

    render();

    // Logging
    frameLogEl.innerText = frameLog.content;
    logEl.appendChild(document.createTextNode(log.content));
    log_clear(frameLog);
    log_clear(log);

    requestAnimationFrame(loop);
  };

  //
  // Set up listeners
  //
  canvasEl.addEventListener("keydown", (event) => {
    if (isInputKey(event.key)) {
      const button = keyboardMap[event.key];
      buttonState[button] = true;
    }
  });

  canvasEl.addEventListener("keyup", (event) => {
    if (isInputKey(event.key)) {
      const button = keyboardMap[event.key];
      buttonState[button] = false;
    }
  });

  canvasEl.addEventListener("mousemove", (event) => {
    pointerState.dx += event.movementX;
    pointerState.dy += event.movementY;
  });

  canvasEl.addEventListener("click", canvasEl.requestPointerLock);

  requestAnimationFrame(loop);
};

run();
