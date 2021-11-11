#include <packing>
// depth of the
uniform sampler2D tDepth;

// camera parameters
uniform float cameraNear;
uniform float cameraFar;

uniform float focalDepth;
uniform float focalLength;
uniform float aperture;

varying vec2 vUv;

float readDepth( sampler2D depthSampler, vec2 coord ) {
    float fragCoordZ = texture2D( depthSampler, coord ).x;
    float viewZ = perspectiveDepthToViewZ( fragCoordZ, cameraNear, cameraFar );
    return viewZToOrthographicDepth( viewZ, cameraNear, cameraFar );
}

void main() {
    float depth = readDepth( tDepth, vUv );
    float focalDepth = focalDepth * 1000.0;
    float distance = - cameraFar * cameraNear / (depth * (cameraFar - cameraNear) - cameraFar)
    * 1000.0; // distance of the object respect to the camera

    // compute Circle of Confusion (CoC) for the current pixel
    float CoC = aperture * (focalLength * (distance - focalDepth))
    / (distance * (focalDepth - focalLength));
    CoC = clamp(CoC, -1.0, 1.0);

    /* assign CoC of the foreground pixel to green component and CoC of the background
    pixel to blue component */
    if(CoC >= 0.0){
        gl_FragColor.b = CoC;
    }
    else{
        gl_FragColor.g = abs(CoC);
    }
}