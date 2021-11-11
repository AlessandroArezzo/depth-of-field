#include <packing>

uniform sampler2D tDiffuse; // current color that represents CoC
uniform sampler2D tOriginal; // original color of the current pixel (not blurred)

uniform float bokehBlurSize;
uniform float heightTex;
uniform float widthTex;

varying vec2 vUv;

float getWeight(float dist, float maxDist){
    return 1.0 - dist/maxDist;
}
void main() {
    vec3 sourceColor = texture2D(tOriginal, vUv).rgb; // not blurred color of the current pixel

    float minCoC = 0.1;

    const float max_iterations = 100.;
    float blurSize = bokehBlurSize + 1.;
    float CoC = max(texture2D(tDiffuse, vUv).g, texture2D(tDiffuse, vUv).b); // CoC of the current color
    if (CoC > minCoC){ // if CoC <= minCoC -> pixel not blurred
        float bokehBlurWeightTotal = 0.0;
        vec3 blurColor = vec3(0.0);
        for (float i=0.; i<max_iterations; i++){
            if (i > blurSize*2.) break;
            for (float j=0.; j<max_iterations; j++){
                if (j > blurSize*2.) break;
                vec2 dir = vec2(i-bokehBlurSize, j-bokehBlurSize) * vec2(widthTex, heightTex);
                float dist = length(dir);
                if (dist > bokehBlurSize ){
                    continue;
                }
                vec2 curUv = dir + vUv;
                float curCoC = max(texture2D(tDiffuse, curUv).g, texture2D(tDiffuse, curUv).b);
                if(curCoC/2. >= dist) {
                    float weight = getWeight(dist, bokehBlurSize);
                    bokehBlurWeightTotal += weight;
                    blurColor +=  weight * texture2D(tOriginal, curUv).rgb;
                }
            }
        }
        blurColor /= bokehBlurWeightTotal;

        gl_FragColor.rgb = mix(sourceColor, blurColor, CoC);
        gl_FragColor.a = 1.0;

    }
    else{
        gl_FragColor.rgb = sourceColor;
    }

}