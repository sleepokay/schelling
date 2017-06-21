$(document).ready(function() {
	var rows = 100;
	var cols = 100;
	var empty_ratio = 0.2;
	var similarity_threshold = 4;	// number of neighbors that are ideally the same race in 8 adjacent cells
	var races = 4;

	var simulation;
	var houses;
	var empties;

	var animate;

	$('input#empty_ratio').val(empty_ratio);
	$('input#similarity_threshold').val(similarity_threshold);
	$('input#races').val(races);
	newSimulation();
	draw();

function newSimulation() {
	simulation = init(rows, cols, empty_ratio, similarity_threshold, races);
	houses = simulation[0];
	empties = simulation[1];
}

function init(rows, cols) {
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

	let colors = ["#CCC", "#1D42E4", "#F52300", "#FFF206", "#05D235", "#C52FD1", "#FFA10C"];

    for (let r = 0; r < houses.length; r++) {
    	for (let c = 0; c < houses[0].length; c++) {

			ctx.fillStyle=colors[houses[r][c]];	
			ctx.fillRect(canvas.width/cols*c, canvas.height/rows*r, canvas.width/cols, canvas.height/rows);
    	}
    }
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

    // if no changes need occur, stop updating
	// if (unhappy.length == 0) {
	// 		$('button#run').html("run");
	// 		 clearInterval(animate);
	// }

    // iterate through queue of unhappy tenants and assign them a new home
    // then move them simultaneously to avoid adding their vacancies back in this iteration's empty houses 
    let move = new Array();

    while (unhappy.length > 0 && empties.length > 0) {
    	let from = unhappy.splice(Math.floor(Math.random() * unhappy.length), 1)[0];
		let to = empties.splice(Math.floor(Math.random() * empties.length), 1)[0];
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
	empty_ratio = parseFloat($('#empty_ratio').val());
	similarity_threshold = parseFloat($('#similarity_threshold').val());
	races = parseFloat($('#races').val());
	newSimulation();
	draw();
});

$('button#step').click( function() {
	clearInterval(animate);
	step();
	draw();
});

$('button#run').click( function() {
	if ($(this).html() == "run") {
		$(this).html("stop");
		animate = setInterval(function() {
			step();
			draw();
		}, 100);
	} 
	else {
		$(this).html("run");
		clearInterval(animate);
	}

});

$('button#stop').click( function() {
	clearInterval(animate);
});

});

