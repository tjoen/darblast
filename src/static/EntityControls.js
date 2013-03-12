function EntityControls() {
	var controls = new LowerControls('Entities', 2);

	controls.onAddElement(Canvace.entities.create);

	controls.onLoadSheet(function () {
		// TODO
	});

	controls.onActivateElement(function (id) {
		var entity = Canvace.entities.get(id);
		var dialog = Ext.create('Ext.window.Window', {
			title: 'Entity configuration',
			modal: true,
			resizable: false,
			layout: 'fit',
			items: [{
				xtype: 'tabpanel',
				items: [{
					title: 'Frames'
				}, {
					title: 'Positioning'
				}, {
					xtype: 'form',
					title: 'Physics',
					layout: 'vbox',
					items: {
						xtype: 'checkbox',
						fieldLabel: 'Enable physics',
						checked: entity.hasPhysics(),
						listeners: {
							change: function (field, checked) {
								entity.setPhysics(checked);
							}
						}
					}
				}, {
					title: 'Properties',
					layout: 'fit',
					items: {
						xtype: 'grid',
						columns: 2,
						store: []
					}
				}]
			}],
			buttons: [{
				text: 'OK',
				handler: function () {
					dialog.close();
				}
			}]
		}).show();
	});

	controls.onDeleteElement(function (ids) {
		Ext.MessageBox.show({
			title: 'Confirm entity deletion',
			msg: 'Do you actually want to delete the ' + ids.length + ' selected entities?',
			buttons: Ext.MessageBox.YESNO,
			icon: Ext.MessageBox.WARNING,
			fn: function (button) {
				if (button === 'yes') {
					ids.forEach(function (id) {
						Canvace.entities.get(id)._delete();
					});
				}
			}
		});
	});

	function addEntity(entity) {
		var id = entity.getId();
		controls.addElement(id, entity.getLabels(), entity.getFirstFrameId());
		entity.onDelete(function () {
			controls.removeElement(id);
		});
	}

	Canvace.entities.forEach(addEntity);
	Canvace.entities.onCreate(addEntity);

	this.hasSelection = controls.hasSelection;
	this.getSelectedId = controls.getSelectedId;
	this.getSelectedIds = controls.getSelectedIds;
}