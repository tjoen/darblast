function EntityControls() {
	var controls = new LowerControls('Entities', 2, false, 'entity', 'entities');

	controls.onAddElement(Canvace.entities.create);

	controls.onLoadSheet(function () {
		// TODO
	});

	controls.onActivateElement(function (id) {
		var entity = Canvace.entities.get(id);
		var dialog = new Ext.window.Window({
			title: 'Entity configuration',
			modal: true,
			resizable: true,
			layout: 'fit',
			items: [{
				xtype: 'tabpanel',
				layout: 'fit',
				items: [{
					title: 'Frames'
				}, {
					title: 'Positioning'
				}, {
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
					id: 'entity-properties-tab',
					title: 'Properties',
					layout: 'fit'
				}]
			}],
			buttons: [{
				text: 'OK',
				handler: function () {
					dialog.close();
				}
			}]
		});
		new PropertyControls(Ext.getCmp('entity-properties-tab')).bind(entity, 'Entity ' + id);
		dialog.show();
	});

	controls.onDeleteElement(function (ids) {
		ids.forEach(function (id) {
			Canvace.entities.get(id)._delete();
		});
	});

	function addEntity(entity) {
		var id = entity.getId();
		controls.addElement(id, entity);
		entity.onDelete(function () {
			controls.removeElement(id);
		});
	}

	Canvace.entities.forEach(addEntity);
	Canvace.entities.onCreate(addEntity);

	this.hasSelection = controls.hasSelection;
	this.getSelectedId = controls.getSelectedId;
	this.getSelectedIds = controls.getSelectedIds;
	this.onSelectionChange = controls.onSelectionChange;
}
