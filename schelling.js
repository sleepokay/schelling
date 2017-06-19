$(document).ready(function() {
	var state = "stop";

	var rows = 10;
	var cols = 10;
	var empty_ratio = 0.3;
	var similarity_threshold = 4;	// number of neighbors that are ideally the same race in 8 adjacent cells
	var races = 2;

	var simulation;
	var houses;
	var empties;

	newSimulation();
	window.setInterval(function() {
		draw();
	}, 100);

function newSimulation() {
	simulation = init(rows, cols, empty_ratio, similarity_threshold, races);
	houses = simulation[0];
	empties = simulation[1];
}

function init(rows, cols, empty_ratio, similarity_threshold, races = 2) {
	let houses = new Array(rows);
	let empties = new Array();

	for (let i = 0; i < rows; i++) {
		houses[i] = new Array(cols);

		for (let j = 0; j < cols; j++) {

			let r = Math.random();
			if (r < empty_ratio) {
			  	houses[i][j] = 0;
			  	empties.push([i, j]);
			  }
			else {
				let lowerbound = empty_ratio;
				for (let group = 1; group < races+1; group++) {
					if (lowerbound <= r && r < lowerbound + ((1-empty_ratio)/races)) {
						houses[i][j] = group;
						break;
					}
					else
						lowerbound += ((1-empty_ratio)/races);
				}
			}
		}
	}

	// we use a list of empty houses to make updating more efficient
	return [houses, empties];
}

function printHouses() {
	for (let r = 0; r < houses.length; r++) {
		let s = "";
		for (let c = 0; c < houses[0].length; c++) {
			s += houses[r][c];
		}
		console.log(s);
	}
}

function draw() {
	var canvas = document.getElementById('space');
    var ctx = canvas.getContext('2d');

	let colors = ["#CCC", "#F00", "#00F"];

    for (let r = 0; r < houses.length; r++) {
    	for (let c = 0; c < houses[0].length; c++) {

			ctx.fillStyle=colors[houses[r][c]];	
			ctx.fillRect(canvas.width/cols*c, canvas.height/rows*r, canvas.width/cols, canvas.height/rows);
    	}
    }

    if (state == "run")
    	step();
}

function step() {
	// iterate through cells
	let unhappy = new Array();
	for (let r = 0; r < houses.length; r++) {
    	for (let c = 0; c < houses[0].length; c++) {

    		// don't care about empty cells
			if (houses[r][c] == 0)
				continue;

    		// check neighbors of each cell
    		let same = 0;
    		for (let nr = -1; nr <= 1; nr++) {
    			for (let nc = -1; nc <= 1; nc++) {
    				// if neighbor is in bounds and is similar
    				if (r+nr >= 0 && r+nr < houses.length && c+nc >= 0 && c+nc < houses[0].length
    					&& houses[r][c] == houses[r+nr][c+nc])
    					same++;
    			}
    		}

    		// if not enough neighbors are of the same race, add to queue of people who want to move
    		if (same < similarity_threshold)
    			unhappy.push([r, c]);
    	}
    }

    // iterate through queue of unhappy tenants and assign them a new home
    // then move them simultaneously to avoid adding their vacancies back in this iteration's empty houses 
    let move = new Array();
    while (unhappy.length > 0) {
    	let from = unhappy.pop(Math.floor(Math.random() * unhappy.length));
		let to = empties.pop(Math.floor(Math.random() * empties.length));
		move.push([from, to]);
    }

   	while (move.length > 0) {
   		let m = move.pop();
   		let from = m[0];
   		let to = m[1];
		houses[to[0]][to[1]] = houses[from[0]][from[1]]; // move tenant
		houses[from[0]][from[1]] = 0;	// set old house empty
		empties.push([from[0], from[1]]); // push onto list of empty houses
	}
}

$('button#new').click( function() {
	newSimulation();
});

$('button#step').click( function() {
	step();
});

$('button#run').click( function() {

	state = "run";
});

$('button#stop').click( function() {
	state = "stop";
});

});

