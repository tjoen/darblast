function TileControls() {
	var controls = new LowerControls('Tiles', 1, false, 'tile', 'tiles');

	controls.onAddElement(function () {
		var dialog = Ext.create('Ext.window.Window', {
			title: 'Create new tile',
			modal: true,
			resizable: false,
			layout: 'fit',
			items: {
				xtype: 'form',
				layout: 'vbox',
				items: [{
					xtype: 'numberfield',
					id: 'i-span-field',
					fieldLabel: 'I span',
					minValue: 1,
					value: 1
				}, {
					xtype: 'numberfield',
					id: 'j-span-field',
					fieldLabel: 'J span',
					minValue: 1,
					value: 1
				}, {
					xtype: 'box'
				}]
			},
			buttons: [{
				text: 'OK',
				handler: function () {
					Canvace.tiles.create(
						Ext.getCmp('i-span-field').getValue(),
						Ext.getCmp('j-span-field').getValue(),
						0,
						0
						);
					dialog.close();
				}
			}, {
				text: 'Cancel',
				handler: function () {
					dialog.close();
				}
			}]
		}).show();
	});

	controls.onActivateElement(function (id) {
		var tile = Canvace.tiles.get(id);
		var dialog = Ext.create('Ext.window.Window', {
			title: 'Tile configuration',
			modal: true,
			resizable: false,
			layout: 'fit',
			items: {
				xtype: 'tabpanel',
				layout: 'fit',
				items: [{
					title: 'General',
					layout: 'vbox',
					items: [{
						xtype: 'checkbox',
						fieldLabel: 'Solid',
						checked: tile.isSolid(),
						listeners: {
							change: function (field, checked) {
								tile.setSolid(checked);
							}
						}
					}, {
						xtype: 'checkbox',
						fieldLabel: 'Static',
						checked: tile.isStatic(),
						listeners: {
							change: function (field, checked) {
								tile.setStatic(checked);
							}
						}
					}]
				}, {
					title: 'Frames'
				}, {
					title: 'Positioning',
					layout: 'table',
					items: [{
						xtype: 'box',
						resizable: true,
						width: 200,
						height: 200
					}, {
						xtype: 'numberfield',
						fieldLabel: 'X offset',
						listeners: {
							blur: function (field) {
								tile.setOffsetX(field.getValue());
							}
						}
					}, {
						xtype: 'numberfield',
						fieldLabel: 'Y offset',
						listeners: {
							blur: function (field) {
								tile.setOffsetY(field.getValue());
							}
						}
					}]
				}, {
					title: 'Properties'
				}]
			},
			buttons: [{
				text: 'OK',
				handler: function () {
					dialog.close();
				}
			}]
		}).show();
	});

	controls.onDeleteElement(function (ids) {
		ids.forEach(function (id) {
			Canvace.tiles.get(id)._delete();
		});
	});

	function addTile(tile) {
		var id = tile.getId();
		controls.addElement(id, tile.getLabels(), tile.getFirstFrameId());
		tile.onDelete(function () {
			controls.removeElement(id);
		});
	}

	Canvace.tiles.forEach(addTile);
	Canvace.tiles.onCreate(addTile);

	this.hasSelection = controls.hasSelection;
	this.getSelectedId = controls.getSelectedId;
	this.getSelectedIds = controls.getSelectedIds;
}
