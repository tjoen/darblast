installHandler([
	'/tiles/',
	'/stages/:stageId/tiles/'
], 'get', function (request, response) {
	this.tiles.globalReadLock(function (release) {
		this.readdir('tiles', function (entries) {
			release();
			response.json(entries);
		});
	});
});

installHandler([
	'/tiles/',
	'/stages/:stageId/tiles/'
], 'post', function (request, response) {
	this.writeLock('info', function (release) {
		this.getJSON('info', function (project) {
			var id = project.tileCounter++;
			this.putJSON('info', project, function () {
				release();
				this.tiles.globalWriteLock(function (release) {
					var tile = {
						solid: false,
						layout: {
							ref: {
								i: parseInt(request.body.layout.ref.i, 10),
								j: parseInt(request.body.layout.ref.j, 10)
							},
							span: {
								i: parseInt(request.body.layout.span.i, 10),
								j: parseInt(request.body.layout.span.j, 10)
							}
						},
						used: false,
						offset: {
							x: 0,
							y: 0
						},
						frames: [],
						properties: {}
					};
					tile['static'] = true;
					this.putJSON('tiles/' + id, tile, function () {
						release();
						response.json(id);
						this.broadcast('tiles', 'create', {
							id: id
						});
					});
				});
			});
		});
	});
});

installHandler([
	'/tiles/:tileId',
	'/stages/:stageId/tiles/:tileId'
], 'get', function (request, response) {
	this.tiles.individualReadLock(request.params.tileId, function (release) {
		this.getJSON('tiles/' + request.params.tileId, function (tile) {
			release();
			response.json(tile);
		});
	});
});

installHandler([
	'/tiles/:tileId',
	'/stages/:stageId/tiles/:tileId'
], 'delete', function (request, response) {
	this.tiles.individualWriteLock(request.params.tileId, function (releaseTile) {
		this.getJSON('tiles/' + request.params.tileId, function (tile) {
			if (tile.used) {
				releaseTile();
				response.json(404, 'The specified tile is in use');
			} else {
				this.tiles.globalWriteLock(function (releaseTiles) {
					this.unlink('tiles/' + request.params.tileId, function () {
						releaseTiles();
						releaseTile();
						this.broadcast('tiles', 'delete', {
							id: request.params.tileId
						});
					});
				});
			}
		});
	});
});

installHandler([
	'/tiles/:tileId/frames/',
	'/stages/:stageId/tiles/:tileId/frames/'
], 'get', function (request, response) {
	this.tiles.individualReadLock(request.params.tileId, function (release) {
		this.getJSON('tiles/' + request.params.tileId, function (tile) {
			release();
			var ids = Object.keys(tile.frames);
			ids.sort();
			response.json(ids);
		});
	});
});

installHandler([
	'/tiles/:tileId/frames/',
	'/stages/:stageId/tiles/:tileId/frames/'
], 'post', function (request, response) {
	this.tiles.individualWriteLock(request.params.tileId, function (releaseTile) {
		this.images.individualWriteLock(request.body.imageId, function (releaseImage) {
			this.getJSON('images/' + request.body.imageId + '/info', function (image) {
				image.refCount++;
				this.putJSON('images/' + request.body.imageId + '/info', image, function () {
					releaseImage();
					this.getJSON('tiles/' + request.params.tileId, function (tile) {
						var id = tile.frameCounter++;
						tile.frames[id] = {
							id: request.body.imageId
						};
						if ('duration' in request.body) {
							tile.frames[id].duration = parseInt(request.body.duration, 10);
						}
						this.putJSON('tiles/' + request.params.tileId, tile, function () {
							releaseTile();
							response.json(id);
							var data = {
								id: request.params.tileId,
								frameId: id
							};
							if ('duration' in request.body) {
								data.duration = request.body.duration;
							}
							this.broadcast('tiles/frames', 'create', data);
						});
					});
				});
			});
		});
	});
});

installHandler([
	'/tiles/:tileId/frames/:frameId',
	'/stages/:stageId/tiles/:tileId/frames/:frameId'
], 'get', function (request, response) {
	this.tiles.individualReadLock(request.params.tileId, function (release) {
		this.getJSON('tiles/' + request.params.tileId, function (tile) {
			release();
			response.json(tile.frames[request.params.frameId]);
		});
	});
});

installHandler([
	'/tiles/:tileId/frames/:frameId',
	'/stages/:stageId/tiles/:tileId/frames/:frameId'
], 'put', function (request, response) {
	this.tiles.individualWriteLock(request.params.tileId, function (release) {
		this.getJSON('tiles/' + request.params.tileId, function (tile) {
			if (request.params.frameId in tile.frames) {
				var duration;
				if (request.body.duration !== false) {
					duration = tile.frames[request.params.frameId].duration = parseInt(request.body.duration, 10);
				} else {
					delete tile.frames[request.params.frameId].duration;
				}
				this.putJSON('tiles/' + request.params.tileId, tile, function () {
					release();
					response.json(true);
					if (request.body.duration !== false) {
						this.broadcast('tiles/frames', 'update', {
							id: request.params.tileId,
							frameId: request.params.frameId,
							duration: duration
						});
					} else {
						this.broadcast('tiles/frames', 'update', {
							id: request.params.tileId,
							frameId: request.params.frameId
						});
					}
				});
			} else {
				release();
				response.json(404, 'Invalid frame ID: ' + request.params.frameId);
			}
		});
	});
});

installHandler([
	'/tiles/:tileId/frames/:frameId',
	'/stages/:stageId/tiles/:tileId/frames/:frameId'
], 'delete', function (request, response) {
	this.tiles.individualWriteLock(request.params.tileId, function (releaseTile) {
		this.getJSON('tiles/' + request.params.tileId, function (tile) {
			if (request.params.frameId in tile.frames) {
				var imageId = tile.frames[request.params.frameId].id;
				this.images.individualWriteLock(imageId, function (releaseImage) {
					this.getJSON('images/' + imageId + '/info', function (image) {
						image.refCount--;
						this.putJSON('images/' + imageId + '/info', image, function () {
							releaseImage();
							delete tile.frames[request.params.frameId].id;
							this.putJSON('tiles/' + request.params.tileId, tile, function () {
								releaseTile();
								response.json(true);
								this.broadcast('tiles/frames', 'delete', {
									id: request.params.tileId,
									frameId: request.params.frameId
								});
							});
						});
					});
				});
			} else {
				releaseTile();
				response.json(404, 'Invalid frame ID: ' + request.params.frameId);
			}
		});
	});
});

installHandler([
	'/tiles/:tileId/properties/',
	'/stages/:stageId/tiles/:tileId/properties/'
], 'get', function (request, response) {
	this.tiles.individualReadLock(request.params.tileId, function (release) {
		this.getJSON('tiles/' + request.params.tileId, function (tile) {
			release();
			response.json(tile.properties);
		});
	});
});

installHandler([
	'/tiles/:tileId/properties/:name',
	'/stages/:stageId/tiles/:tileId/properties/:name'
], 'get', function (request, response) {
	this.individualReadLock(request.params.tileId, function (release) {
		this.getJSON('tiles/' + request.params.tileId, function (tile) {
			release();
			response.json(tile.properties[request.params.name]);
		});
	});
});

installHandler([
	'/tiles/:tileId/properties/:name',
	'/stages/:stageId/tiles/:tileId/properties/:name'
], 'put', function (request, response) {
	this.tiles.individualWriteLock(request.params.tileId, function (release) {
		this.getJSON('tiles/' + request.params.tileId, function (tile) {
			tile.properties[request.params.name] = request.body.value;
			this.putJSON('tiles/' + request.params.tileId, tile, function () {
				this.broadcast('tiles/properties', 'put', {
					id: request.params.tileId,
					name: request.params.name,
					value: request.body.value
				});
				release();
				response.json(true);
			});
		});
	});
});

installHandler([
	'/tiles/:tileId/properties/:name',
	'/stages/:stageId/tiles/:tileId/properties/:name'
], 'delete', function (request, response) {
	this.individualWriteLock(request.params.tileId, function (release) {
		this.getJSON('tiles/' + request.params.tileId, function (tile) {
			var found = request.params.name in tile.properties;
			if (found) {
				delete tile.properties[request.params.name];
				this.putJSON('tiles/' + request.params.tileId, tile, function () {
					this.broadcast('tiles/properties', 'delete', {
						id: request.params.tileId,
						name: request.params.name
					});
					release();
					response.json(true);
				});
			} else {
				release();
				response.json(false);
			}
		});
	});
});
