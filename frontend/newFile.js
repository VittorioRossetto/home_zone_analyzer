// Add content to the menu
menuControl.onAdd = function (map) {
    var menuContainer = L.DomUtil.create('div', 'menu-container');
    menuContainer.innerHTML = '<h3>Menu</h3><ul><li><input type="checkbox" id="option1">Option 1</li><li><input type="checkbox" id="option2">Option 2</li><li><input type="checkbox" id="option3">Option 3</li></ul>';
    return menuContainer;
};
