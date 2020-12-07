// PROVIDED CODE BELOW (LINES 1 - 80) DO NOT REMOVE
// The store will hold all information needed globally
var store = {
	track_id: undefined,
	player_id: undefined,
	race_id: undefined,
}

// We need our javascript to wait until the DOM is loaded
document.addEventListener("DOMContentLoaded", function() {
	onPageLoad()
	setupClickHandlers()
})

async function onPageLoad() {
	try {
		getTracks()
			.then(tracks => {
				const html = renderTrackCards(tracks)
				renderAt('#tracks', html)
			})

		getRacers()
			.then((racers) => {
				const html = renderRacerCars(racers)
				renderAt('#racers', html)
			})
	} catch(error) {
		console.log("Problem getting tracks and racers ::", error.message)
		console.error(error)
	}
}

function setupClickHandlers() {
	document.addEventListener('click', function (event) {
		// event.stopPropagation();
		let parent = event.target.parentElement
		const { target } = event;
		if(parent.matches('.list-group-item.track')){
			handleSelectTrack(parent);
		}
		
		if(parent.matches('.list-group-item.pod')){
			handleSelectPodRacer(parent);
		}
		
		// Race track form field
		if (target.matches('.list-group-item.track')) {
			handleSelectTrack(target);
		}
		// Podracer form field
		if (target.matches('.list-group-item.pod')) {
			event.stopPropagation();
			handleSelectPodRacer(target)
		}
		// Submit create race form
		if (target.matches('#submit-create-race')) {
			event.preventDefault();
			// start race
			handleCreateRace();
		}
		// Handle acceleration click
		if (target.matches('#gas-peddle')) {
			handleAccelerate(target)
		}
	}, false)
}

async function delay(ms) {
	try {
		return await new Promise(resolve => setTimeout(resolve, ms));
	} catch(error) {
		console.log("an error shouldn't be possible here")
		console.log(error)
	}
}
// ^ PROVIDED CODE ^ DO NOT REMOVE

// This async function controls the flow of the race, add the logic and error handling
async function handleCreateRace() {
	// render starting UI
	try {
	// TODO - Get player_id and track_id from the store
	const {
		track_id,
		player_id
	  } = store;
			if (!player_id) {
				alert('You can´t compete without a driver!');
			} else if (!track_id) {
				alert('Don´t forget to choose a car!')
			} else {
			// const race = TODO - invoke the API call to create the race, then save the result
			const race = await createRace(player_id, track_id);
			renderAt('#race', renderRaceStartView(race.Track, race.Cars))
			// TODO - update the store with the race id
			store.race_id = (race.ID - 1); 
			// The race has been created, now start the countdown
			// TODO - call the async function runCountdown
			await runCountdown();
			console.log(store.race_id);
			// TODO - call the async function startRace
			await startRace(store.race_id);
			// TODO - call the async function runRace
			await runRace(store.race_id);
			}
	} catch (error) {
		console.log('Error with handleCreateRace() ::', error);
	}

}

async function runRace(raceID) {
	try {
		return new Promise(resolve => {
			// TODO - use Javascript's built in setInterval method to get race info every 500ms
			const timeInterval = setInterval(() => {
				getRace(raceID)
				.then((res) => {
				//TODO - if the race info status property is "in-progress", update the leaderboard by calling:
					if (res.status === "in-progress") {
						renderAt('#leaderBoard', raceProgress(res.positions))
						//render raceInProgress

						//TODO - if the race info status property is "finished", run the following:
					} else if (res.status === "finished") {
						clearInterval(timeInterval) // to stop the interval from repeating
						renderAt('#race', resultsView(res.positions)) // to render the results view
						//render resultsView
						resolve(res) // resolve the promise
					}
				})
				.catch(error => console.log('Error with timeInterval() ::', error))
			}, 500)
		})
	} catch (error) {
		return console.log("Error with runRace() ::", error)
	}
}

async function runCountdown() {
	try {
		// wait for the DOM to load
		await delay(1000)
		let timer = 3

		return new Promise(resolve => {
			// TODO - use Javascript's built in setInterval method to count down once per second
			let countdown = setInterval(() => {
				// run this DOM manipulation to decrement the countdown for the user
				document.getElementById('big-numbers').innerHTML = --timer;
				if (timer === 0) {
					clearInterval(countdown);
					return resolve(countdown);
				}
			}, 1000);
		})
	} catch(error) {
		console.log('Error with runCountdown() ::', error);
	}
}

function handleSelectPodRacer(target) {
	console.log("selected a pod", target.id)

	// remove class selected from all racer options
	const selected = document.querySelector('#racers .selected')
	if(selected) {
		selected.classList.remove('selected')
	}

	// add class selected to current target
	target.classList.add('selected')

	// TODO - save the selected racer to the store
	store.player_id = parseInt(target.id);
}

function handleSelectTrack(target) {
	console.log("selected a track", target.id)

	// remove class selected from all track options
	const selected = document.querySelector('#tracks .selected')
	if(selected) {
		selected.classList.remove('selected')
	}

	// add class selected to current target
	target.classList.add('selected')

	// TODO - save the selected track id to the store
	store.track_id = parseInt(target.id);
}

async function handleAccelerate() {
	try {
		console.log("accelerate button clicked");
		// TODO - Invoke the API call to accelerate
		accelerate(store.race_id);
	} catch (error) {
		console.log('Error in handleAccelerate() ::', error);
	}
}

// HTML VIEWS ------------------------------------------------

const customRacerName = {
    "Racer 1": "The Slag Brothers",
    "Racer 2": "Gruesome Twosome",
    "Racer 3": "Professor Pat Pending",
    "Racer 4": "Red Max",
    "Racer 5": "Penelope Pitstop",
}
const customTrackName = {
    "Track 1": "Boulder Mobile",
    "Track 2": "Creepy Coupe",
    "Track 3": "Convert-A-Car",
    "Track 4": "Crimson Haybailer",
	"Track 5": "Compact Pussycat",
	"Track 6": "Mean Machine"
}
// Provided code - do not remove

function renderRacerCars(racers) {
	if (!racers.length) {
		return `
			<h4>Loading Racers...</4>
		`
	}

	const results = racers.map(renderRacerCard).join('')

	return `
			${results}

	`
}

function renderRacerCard(racer) {
	const { id, driver_name, top_speed, acceleration, handling } = racer
	return `
		<li class="list-group-item pod" id="${id}">
			<h3>${customRacerName[driver_name]}</h3>
			<p>Top Speed: ${top_speed}</p>
			<p>Acceleration: ${acceleration}</p>
			<p>Handling: ${handling}</p>
		</li>
	`
}

function renderTrackCards(tracks) {
	if (!tracks.length) {
		return `
			<h4>Loading Tracks...</4>
		`
	}

	const results = tracks.map(renderTrackCard).join('')

	return `
			${results}
	`
}

function renderTrackCard(track) {
	const { id, name } = track

	return `
		<li id="${id}" class="list-group-item track">
			<h3 id="button-track-${id}">${customTrackName[name]}
				<img class="button_image" src="../assets/images/car${id}.gif"/>
			</h3>
		</li>
	`
}

function renderCountdown(count) {
	return `
		<h2 class="text-center font-weight-bold">Race Starts In...</h2>
		<p class="text-center border border-warning rounded-pill" id="big-numbers">${count}</p>
		`
	}

function renderRaceStartView(track, racers) {
	return `
		<header>
			<h1>Race: ${customTrackName[track.name]}</h1>
		</header>
		<main id="two-columns">
			<section id="leaderBoard">
				${renderCountdown(3)}
			</section>

			<section id="accelerate">
				<h2 class="text-center font-weight-bold">Directions</h2>
				<p class="text-center font-weight-bold">Click the button as fast as you can to go faster!</p>
				<button type="button" class="btn btn-success btn-lg btn-block" id="gas-peddle" id="gas-peddle">Click Me To Win!</button>
			</section>
		</main>
		<footer></footer>
	`
}

function resultsView(positions) {
	positions.sort((a, b) => (a.final_position > b.final_position) ? 1 : -1)

	return `
		<header>
			<h1>Race Results</h1>
		</header>
		<main>
			${raceProgress(positions)}
			<a href="/race">Start a new race</a>
		</main>
	`
}

function raceProgress(positions) {

	//const racers = positions.map(p => p.driver_name);
	//let userPlayer = positions.find(e => e.id === parseInt(store.player_id))

	const raceTracks = positions.map(r => {
		console.log(r.id);
	//there are 201 segments in the race and I have kept track length as 25vh
	const completion = r.segment/201; 
	const completePercentage = completion * 100;
	return `
	<div class="col-sm d-flex justify-content-around">
	<div class="racetrack">
	  <div class="race-car">
	  	<img class="progressImage" src="../assets/images/car${r.id}.gif"/>
	  </div>
	  <div class="racer-name">
		<div>${customRacerName[r.driver_name]}</div>
		<div class="progress">
  			<div class="progress-bar progress-bar-striped progress-bar-animated" role="progressbar" aria-valuenow="${completion*25}vh" aria-valuemin="0" aria-valuemax="100">${Math.round(completePercentage)}%</div>
		</div>
	  </div>
	</div>
	</div>
	`
	}).join('');

	positions = positions.sort((a, b) => (a.segment > b.segment) ? -1 : 1)
	let count = 1
	
	const results = positions.map(p => {
		return `
			<tr>
				<td>
					<h3>${count++} - ${customRacerName[p.driver_name]}</h3>
				</td>
			</tr>
		`
	});


	return `
	<main>
	  <section id="leaderBoard" class="leaderboard">
		<div class="progress-section">
		  ${results}
		</div>
		<div class="progress-racetracks">
			<div class="container">
				<div class="row">
					${raceTracks}
				</div>
			</div>
		</div>
		</div>
	  </section>
	</main>
  `
}


function renderAt(element, html) {
	const node = document.querySelector(element)

	node.innerHTML = html
}

// ^ Provided code ^ do not remove


// API CALLS ------------------------------------------------

const SERVER = 'http://localhost:8000'

function defaultFetchOpts() {
	return {
		mode: 'cors',
		headers: {
			'Content-Type': 'application/json',
			'Access-Control-Allow-Origin' : SERVER,
		},
	}
}

// TODO - Make a fetch call (with error handling!) to each of the following API endpoints 

async function getTracks() {
	// GET request to `${SERVER}/api/tracks`
	try {
		const response = await fetch(`${SERVER}/api/tracks`);
		const response_1 = await response.json();
		return response_1;
	} catch (error) {
		return console.log('Problem with getTracks request ::', error)
	}
}

async function getRacers() {
	// GET request to `${SERVER}/api/cars`
	try {
		const response = await fetch(`${SERVER}/api/cars`, {
			method: 'GET',
			...defaultFetchOpts(),
		})
		return await response.json()
	} catch (error) {
		return console.log('Problem with getRacers request ::', error)
	}
}

async function createRace(player_id, track_id) {
	player_id = parseInt(player_id)
	track_id = parseInt(track_id)
	const body = { player_id, track_id }
	
	try {
		const res = await fetch(`${SERVER}/api/races`, {
			method: 'POST',
			...defaultFetchOpts(),
			dataType: 'jsonp',
			body: JSON.stringify(body)
		})
		return await res.json()
	} catch (error) {
		return console.log("Problem with createRace request::", error)
	}
}

function getRace(id) {
	// GET request to `${SERVER}/api/races/${id}`
	return fetch(`${SERVER}/api/races/${id}`)
	.then(response => response.json())
	.catch(error => console.log(error))
}

function startRace(id) {
	return fetch(`${SERVER}/api/races/${id}/start`, {
		method: 'POST',
		...defaultFetchOpts(),
	  })
	  .catch(error => console.log("Problem with startRace request::", error))
  }

function accelerate(id) {
	// POST request to `${SERVER}/api/races/${id}/accelerate`
	// options parameter provided as defaultFetchOpts
	// no body or datatype needed for this request
	return fetch(`${SERVER}/api/races/${id}/accelerate`,{
		method: 'POST',
		...defaultFetchOpts()
	})
	.catch(error => console.log(error))
}
