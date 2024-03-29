import React, { Component } from 'react';
import Particles from 'react-particles-js';
import FaceRecognition from './components/facerecognition/FaceRecognition';
import Navigation from './components/navigation/Navigation';
import ImageLinkForm from './components/imagelinkform/ImageLinkForm';
import Signin from './components/signin/Signin';
import Register from './components/register/Register';
import Logo from './components/logo/Logo';
import Rank from './components/rank/Rank';
import './App.css';



// Background pattern
const particlesOptions =  {
    particles: {
        number: {
            value: 40,
            density: {
            	enable: true,
            	value_area: 800
            }
        }
    }
}

const initialState = {
			input: '',
			imageUrl: '',
			box: {},
			route: 'signin',
			isSignedIn: false,
			user: {
				id: '',
				name: '',
				email: '',
				entries: 0,
				joined: ''
			}
}

class App extends Component {
	constructor() {
		super();
		this.state = initialState;
	}

loadUser = (data) => {
	this.setState({user: {
			id: data.id,
			name: data.name,
			email: data.email,
			entries: data.entries,
			joined: data.joined
		}});
}


// Calculate the location of the face in an image, using Clarifai API
calculateFaceLocation = (data) => {
	const face = data.outputs[0].data.regions[0].region_info.bounding_box;
	const image = document.getElementById('inputimage');
	const width = Number(image.width);
	const height = Number(image.height);
	return {
		leftCol: face.left_col * width,
		topRow: face.top_row * height,
		rightCol: width - (face.right_col * width),
		bottomRow: height - (face.bottom_row * height)
	}
}

displayFaceBox = (box) => {
	this.setState({box});
}

onInputChange = (event) => {
   this.setState({input: event.target.value});
  }


// Use the face detection API upon submit
 onButtonSubmit = () => {
    this.setState({imageUrl: this.state.input});
      fetch("https://face-api-e5c6.onrender.com/imageurl", {
        method: "post",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          input: this.state.input,
        }),
      })
        .then((response) => response.json())
        .then((response) => {
          if (response) {
            fetch("https://face-api-e5c6.onrender.com/image", {
              method: "put",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                id: this.state.user.id,
              }),
            })
              .then((response) => response.json())
              .then((count) => {
                this.setState(
                  Object.assign(this.state.user, { entries: count })
                );
              })
              .catch(console.log);
          }
          this.displayFaceBox(this.calculateFaceLocation(response));
        })
        .catch((err) => console.log(err));
  }

// Manage user sign-in and sign-out
 onRouteChange = (route) => {
 	 if (route === 'signout') {
   	this.setState(initialState)
   } else if (route === 'home') {
   	this.setState({isSignedIn: true})
   }
   this.setState({route: route})
 }


render() {
    const { isSignedIn, imageUrl, route, box } = this.state;
    return (
      <div className="App">
         <Particles className='particles'
          params={particlesOptions}
        />
        <Navigation isSignedIn={isSignedIn} onRouteChange={this.onRouteChange} />
        { route === 'home'
          ? <div>
              <Logo />
              <Rank
                name={this.state.user.name}
                entries={this.state.user.entries}
              />
              <ImageLinkForm
                onInputChange={this.onInputChange}
                onButtonSubmit={this.onButtonSubmit}
              />
              <FaceRecognition box={box} imageUrl={imageUrl} />
            </div>
          : (
             route === 'signin'
             ? <Signin loadUser={this.loadUser} onRouteChange={this.onRouteChange}/>
             : <Register loadUser={this.loadUser} onRouteChange={this.onRouteChange}/>
            )
        }
      </div>
    );
  }
}

export default App;
