# Depth-of-field
This project contains the implementation on a 3D scene of the depth of field effect typical of a real camera.

## Implementation
This project was implemented using the Three.js library and the webpack package.

## Demo

It is possible to interact with the project demo at the link https://alessandroarezzo.github.io/depth-of-field/

Once open, wait for all the objects in the scene to load, which can take a few seconds.

## Scene

The depth of field effect allows you to focus only on objects placed at a certain distance from the camera and to blur 
the rest of the scene.<br>
In photography as well as in cinema this can be done in order to generate different sensations in the viewer.

In this project an imaginary scene is rendered in which two astronauts escape from dragons in order to reach a portal 
that will save them.<br>
Through a graphic interface placed in the margin it is possible to set the object of which you want the point of view 
and the target of the camera. 
By acting on the camera controls it is possible to obtain the desired depth field effect.

For example, it is possible to act on the parameters of the camera to return a depth of field effect that generates 
a feeling of greater drama in the viewer when astronauts are filmed in the foreground with dragons in the background.

![Screen astronauts and monster without DoF](images/screens/astronauts_dragons.png)
![Screen astronauts and monster with DoF](images/screens/astronauts_dragons_DoF.png)

Other examples of comparison between the scene without depth field and with the effect:

![Screen dragons and planet without DoF](images/screens/dragons_planet.png)
![Screen dragons and planet with DoF](images/screens/dragons_planet_DoF.png)
<br>
<br>
<br>
<br>
![Screen rocket and scene without DoF](images/screens/square_astronauts.png)
![Screen rocket and scene with DoF](images/screens/square_astronauts_DoF.png)
<br>
<br>
<br>
<br>
![Screen rocket and scene without DoF](images/screens/rocket_scene.png)
![Screen rocket and scene with DoF](images/screens/rocket_scene_DoF.png)

## Installation

To install the project dependencies:

1. Clone this repository with the command
```sh
git clone https://github.com/AlessandroArezzo/depth-of-field.git
```
2. Run ```npm install``` in the root folder of the repository


## Usage

Just run ```npm start```  to start the webserver and go to http://localhost:8080.

