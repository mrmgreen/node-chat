'use strict';

let net = require('net');
let chatServer = net.createServer();
let clientList = [];

chatServer.on('connection', (client) => {
	client.name = client.remoteAddress + ':' + client.remotePort;
	client.write('Hi ' + client.name + '!\n');

	clientList.push(client);

	client.on('data', (data) => {
		broadcast(data, client);
	});

	client.on('end', () => {
		clientList.splice(clientList.indexOf(client), 1);
	});

	client.on('error', (e) => {
		console.log(e);
	});

});

function broadcast(message, client) {
	let cleanup = [];
	for (let i = 0; i < clientList.length; i+=1) {
		if (client !== clientList[i]) {

			if(clientList[i].writable) {
				clientList[i].write(client.name + " says " + message);
			} else {
				clientList.push(clientList[i]);
				clientList[i].destroy();
			}
		}
	}
	//remove dead nodes out of write loop to avoid trashing loop index
	for (let i = 0; i < cleanup.length; i += 1) {
		clientList.splice(clientList.indexOf(cleanup[i]), 1);
	}
}

chatServer.listen(9000);

console.log('listening on 9000');