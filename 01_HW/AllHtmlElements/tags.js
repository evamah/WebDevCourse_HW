const displays = ["/01_HW/AllHtmlElements/SKINS/modren.css", "/01_HW/AllHtmlElements/SKINS/dark.css", "/01_HW/AllHtmlElements/SKINS/basic.css"];
let curr = 0;


function display() {
    curr = (curr + 1) % displays.length;

    document.getElementById("theme").href = displays[curr];
}