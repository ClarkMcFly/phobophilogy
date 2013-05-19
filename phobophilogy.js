function Phobophile(latlng, phobophility) {
	marker = L.marker(latlng, {'title': phobophility});
	formatted_phobophility = "<b>Phobophility:</b> <tt>" + phobophility + "</tt>";
	phobo_len = phobophility.length;

	/*
	 * TODO throw an exception if phobophility is invalid
	 * TODO calculate reactTo in parallel for correctness
	 */
	return {
		marker: marker,
		phobophility: phobophility,
		popup: marker.bindPopup(formatted_phobophility),
		prefix: phobophility.slice(0, phobo_len - 1),
		affinity: phobophility.slice(phobo_len - 1, phobo_len) == '+' ? 1 : -1,
		move: function(delta_vector) {
			latlong = this.marker.getLatLng();
			latlong.lat += delta_vector[0];
			latlong.lng += delta_vector[1];
			this.marker.setLatLng(latlong);
		},
		suffix: function(n) {
			phobo_len = this.phobophility.length;
			return this.phobophility.slice(phobo_len - n, phobo_len);
		},
		affectedBy: function(other) {
			return (this.prefix == other.suffix(this.prefix.length));
		},
		reactTo: function(other) {
			if (this.affectedBy(other)) {
				mLatLng = this.marker.getLatLng();
				oLatLng = other.marker.getLatLng();

				dLat  = oLatLng.lat - mLatLng.lat;
				dLong = oLatLng.lng - mLatLng.lng;

				// TODO ? distance = mLatLng.distanceTo(oLatLng);

				distance = Math.sqrt(dLat*dLat + dLong*dLong);

				if (distance == 0) {
					return;
				}

				distance *= 30;

				this.move(
						[this.affinity * dLat / distance,
						this.affinity * dLong / distance]
					 );
			}
		}
	};
}

var map = L.map('map').setView([51.509, -0.09], 6);

var players = [
	Phobophile([51, 0], "++"),
	Phobophile([52, 0], "+-"),
	Phobophile([51, 1], "-+"),
	Phobophile([52, 1], "--"),
	];

for (var i = 0; i < players.length; ++i) {
	players[i].marker.addTo(map);
}

function everyoneReact() {
	for (var i = 0; i < players.length; ++i) {
		for (var j = 0; j < players.length; ++j) {
			if (j != i) {
				players[i].reactTo(players[j]);
			}
		}
	}
}

setInterval(everyoneReact, 100);
