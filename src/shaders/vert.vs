#version 300 es

uniform mat4 projMat;
uniform mat4 viewMat;
uniform mat4 modelMat;

in vec3 vertPos;
in vec2 vertTexCoord;
in vec3 vertNormal;

out vec3 fragPos;
out vec2 fragTexCoord;
out vec3 fragNormal;
 
void main() {
  fragPos = vec3(modelMat * vec4(vertPos, 1.0));
  fragTexCoord = vertTexCoord;
  fragNormal = vertNormal;

  // gl_Position =  projMat * modelMat * vec4(vertPos, 1.0);

  gl_Position = projMat * viewMat * modelMat * vec4(vertPos, 1.0);
}
