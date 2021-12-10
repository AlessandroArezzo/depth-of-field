#include <packing>

uniform sampler2D tDiffuse;
uniform sampler2D tOriginal;

uniform float blurSize;
uniform float heightTex;
uniform float widthTex;
uniform bool applyEffect;

varying vec2 vUv;

float getWeight(float dist, float maxDist){
    return 1.0 - dist/maxDist;
}

void main() {
    vec3 sourceColor = texture2D(tOriginal, vUv).rgb; // not blurred color of the current pixel

    float minCoC = 0.1;

    const float max_iterations = 100.; // variables used in the cicle
    float blur = blurSize + 1.;
    float CoC = texture2D(tDiffuse, vUv).b; // CoC of the current color (read from the blue component)

    // If applyEffect is enabled the depth of field effect is apply.
    // Otherwise the pixel is assigned its original color.
    if(applyEffect){
        // if CoC > minCoC pixel blurred. Otherwise pixel not blurred because it is in the focus plane
        if (CoC > minCoC){
            vec3 colorBlurred = vec3(0.0);
            float weightColorSum = 0.0;
            // cicle on neighboors of the current pixel
            for (float i=0.; i<max_iterations; i++){
                if (i > blur*2.) break;
                for (float j=0.; j<max_iterations; j++){
                    if (j > blur*2.) break;
                    vec2 dir = vec2(i-blurSize, j-blurSize) * vec2(widthTex, heightTex);
                    float dist = length(dir);
                    if (dist > blurSize){
                        continue;
                    }
                    float curCoC = texture2D(tDiffuse, dir + vUv).b;
                    if (curCoC > minCoC) {
                        float currentWeight = getWeight(dist, blurSize);
                        weightColorSum += currentWeight;
                        colorBlurred +=  currentWeight * texture2D(tOriginal, dir + vUv).rgb;
                    }
                }
            }
            colorBlurred /= weightColorSum;
            gl_FragColor.rgb = mix(sourceColor, colorBlurred, CoC);
            gl_FragColor.a = 1.0;

        }
        else {
            gl_FragColor.rgb = sourceColor;
        }
    }
    else{
        gl_FragColor.rgb = sourceColor;
    }
}