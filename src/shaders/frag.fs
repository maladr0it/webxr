#version 300 es
 
// fragment shaders don't have a default precision so we need
// to pick one. highp is a good default. It means "high precision"
precision highp float;

uniform sampler2D texture1;
uniform sampler2D texture2;

in vec3 fragPos;
in vec2 fragTexCoord;
in vec3 fragNormal;

out vec4 outColor;

void main() {
  outColor = texture(texture1, fragTexCoord);
}