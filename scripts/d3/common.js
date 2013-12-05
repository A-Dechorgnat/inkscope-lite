
function color4ascPercent(percent) {
    return (colorbrewer.RdYlGn[11])[parseInt(percent*10)];
}

function color4descPercent(percent) {
    return (colorbrewer.RdYlGn[11])[10 - parseInt(percent*10)];
}
