//global vars
let selection = figma.currentPage.selection;
let nodesWithGrids = [];
let gridCount = 0;
let wrapperFills = [];
let wrapperFill = {
    type: 'SOLID',
    visible: false,
    opacity: 1,
    blendMode: 'NORMAL',
    color: { r: 1, g: 1, b: 1 }
};
wrapperFills.push(wrapperFill);
//check if there is a selection
if (selection.length >= 1) {
    //find out if the selection contains frames or components with layout grids
    filterNodesWithGrids(selection);
    //if there items with grids, loop through them and create grids
    if (nodesWithGrids.length >= 1) {
        nodesWithGrids.forEach(node => {
            //is there an existing visualiztion already? if so find it and delete it
            node.children.forEach(child => {
                if (child.name === 'Grid Visualization' && child.type === 'FRAME') {
                    child.remove();
                }
            });
            //get array of grids
            let grids = node.layoutGrids;
            //create a container to house the grid visualizations
            let gridVisualization = figma.createFrame();
            gridVisualization.name = 'Grid Visualization';
            gridVisualization.x = 0;
            gridVisualization.y = 0;
            gridVisualization.resize(node.width, node.height);
            gridVisualization.expanded = false;
            gridVisualization.fills = wrapperFills;
            gridVisualization.locked = true;
            //add grid to top of selected frame
            node.appendChild(gridVisualization);
            grids.forEach(grid => {
                visualizeGrid(node, grid, gridVisualization);
                gridCount++;
            });
        });
        if (gridCount === 1) {
            figma.closePlugin('1 grid successfully visualized');
        }
        else {
            figma.closePlugin(gridCount + ' grids successfully visualized.');
        }
    }
    else {
        figma.closePlugin('Please select a frame or component with a layout grid');
    }
}
else {
    figma.closePlugin('Please select a frame or component with a layout grid');
}
// CORE FUNCTIONS
//render a visualization of the layout grid
function visualizeGrid(parent, grid, container) {
    let color = grid.color;
    let fills = [];
    let fill = {
        type: 'SOLID',
        visible: true,
        opacity: color.a,
        blendMode: 'NORMAL',
        color: { r: color.r, g: color.g, b: color.b }
    };
    fills.push(fill);
    if (grid.pattern === 'COLUMNS') {
        //universal attributes
        let count = grid.count;
        let alignment = grid.alignment;
        //only generate a grid visualiztin if there is 1 column or more
        if (count > 0) {
            //setup the grid frame
            let gridFrame = figma.createFrame();
            gridFrame.name = count + ' column grid';
            gridFrame.resize(parent.width, parent.height);
            gridFrame.fills = wrapperFills;
            gridFrame.expanded = false;
            gridFrame.locked = true;
            if (alignment === 'STRETCH') {
                //create stretch grid visualization
                let gutterSize = grid.gutterSize;
                let offset = grid.offset;
                let colWidth = getColWidth(parent.width, count, gutterSize, offset);
                //default styling where columns are shaded
                if (gutterSize !== 0) {
                    //create a rect for every col
                    for (let i = 0; i < count; i++) {
                        let x = offset + (i * gutterSize) + (i * colWidth);
                        let col = figma.createRectangle();
                        col.resize(colWidth, (parent.height + 2));
                        col.fills = fills;
                        gridFrame.appendChild(col);
                        col.x = x;
                        col.y = -1;
                    }
                }
                else {
                    //only style divisions if there is no gutter
                    for (let i = 0; i < (count + 1); i++) {
                        if (count >= 1) {
                            let x = offset + (i * colWidth);
                            let col = figma.createRectangle();
                            col.resize(1, parent.height);
                            col.fills = fills;
                            gridFrame.appendChild(col);
                            col.x = x;
                            col.y = 0;
                            if (count === 1 && i === count) {
                                let x = parent.width - offset;
                                let col = figma.createRectangle();
                                col.resize(1, parent.height);
                                col.fills = fills;
                                gridFrame.appendChild(col);
                                col.x = x;
                                col.y = 0;
                            }
                        }
                    }
                }
                //add the container into the overall continer to hosue all grids
                container.appendChild(gridFrame);
                gridFrame.x = 0;
                gridFrame.y = 0;
            }
            else if (alignment === 'MIN') {
                //create left aligned grid visualization
                let colWidth = grid.sectionSize;
                let offset = grid.offset;
                let gutterSize = grid.gutterSize;
                if (gutterSize !== 0) {
                    //create a rect for every col
                    for (let i = 0; i < count; i++) {
                        let x = offset + (i * gutterSize) + (i * colWidth);
                        let col = figma.createRectangle();
                        col.resize(colWidth, (parent.height + 2));
                        col.fills = fills;
                        gridFrame.appendChild(col);
                        col.x = x;
                        col.y = -1;
                    }
                }
                else {
                    for (let i = 0; i < (count + 1); i++) {
                        //create a rect for every col
                        let x = offset + (i * gutterSize) + (i * colWidth);
                        let col = figma.createRectangle();
                        col.resize(1, parent.height);
                        col.fills = fills;
                        gridFrame.appendChild(col);
                        col.x = x;
                        col.y = 0;
                        if (count === 1 && i === count) {
                            let x = offset + (i * gutterSize) + (i * colWidth);
                            let col = figma.createRectangle();
                            col.resize(1, parent.height);
                            col.fills = fills;
                            gridFrame.appendChild(col);
                            col.x = x;
                            col.y = 0;
                        }
                    }
                }
                //add the container into the overall continer to hosue all grids
                container.appendChild(gridFrame);
                gridFrame.x = 0;
                gridFrame.y = 0;
            }
            else if (alignment === 'MAX') {
                //create right aligned grid visualization
                let colWidth = grid.sectionSize;
                let offset = grid.offset;
                let gutterSize = grid.gutterSize;
                if (gutterSize !== 0) {
                    //create a rect for every col
                    for (let i = 0; i < count; i++) {
                        let x = (parent.width - offset - colWidth) - (i * gutterSize) - (i * colWidth);
                        let col = figma.createRectangle();
                        col.resize(colWidth, (parent.height + 2));
                        col.fills = fills;
                        gridFrame.appendChild(col);
                        col.x = x;
                        col.y = -1;
                    }
                }
                else {
                    for (let i = 0; i < count; i++) {
                        //create a rect for every col
                        let x = (parent.width - offset - colWidth) - (i * gutterSize) - (i * colWidth);
                        let col = figma.createRectangle();
                        col.resize(1, parent.height);
                        col.fills = fills;
                        gridFrame.appendChild(col);
                        col.x = x;
                        col.y = 0;
                        if (i === 0) {
                            let x = (parent.width - offset);
                            let col = figma.createRectangle();
                            col.resize(1, parent.height);
                            col.fills = fills;
                            gridFrame.appendChild(col);
                            col.x = x;
                            col.y = 0;
                        }
                    }
                }
                //add the container into the overall continer to hosue all grids
                container.appendChild(gridFrame);
                gridFrame.x = 0;
                gridFrame.y = 0;
            }
            else if (alignment === 'CENTER') {
                //create center aligned grid visualization
                let colWidth = grid.sectionSize;
                let gutterSize = grid.gutterSize;
                let start = getColStart(parent.width, count, colWidth, gutterSize);
                if (gutterSize !== 0) {
                    //create a rect for every col
                    for (let i = 0; i < count; i++) {
                        let x = start + (i * gutterSize) + (i * colWidth);
                        let col = figma.createRectangle();
                        col.resize(colWidth, parent.height);
                        col.fills = fills;
                        gridFrame.appendChild(col);
                        col.x = x;
                        col.y = 0;
                    }
                }
                else {
                    for (let i = 0; i < (count + 1); i++) {
                        //create a rect for every col
                        let x = start + (i * gutterSize) + (i * colWidth);
                        let col = figma.createRectangle();
                        col.resize(1, parent.height);
                        col.fills = fills;
                        gridFrame.appendChild(col);
                        col.x = x;
                        col.y = 0;
                        if (count === 1 && i === count) {
                            let x = start + (i * gutterSize) + (i * colWidth);
                            let col = figma.createRectangle();
                            col.resize(1, parent.height);
                            col.fills = fills;
                            gridFrame.appendChild(col);
                            col.x = x;
                            col.y = 0;
                        }
                    }
                }
                //add the container into the overall continer to hosue all grids
                container.appendChild(gridFrame);
                gridFrame.x = 0;
                gridFrame.y = 0;
            }
        }
    }
    else if (grid.pattern === 'ROWS') {
        //universal attributes
        let count = grid.count;
        let alignment = grid.alignment;
        if (count > 0) {
            //setup the grid frame
            let gridFrame = figma.createFrame();
            gridFrame.name = count + ' row grid';
            gridFrame.resize(parent.width, parent.height);
            gridFrame.fills = wrapperFills;
            gridFrame.expanded = false;
            gridFrame.locked = true;
            if (alignment === 'STRETCH') {
                //create stretch grid visualization
                let gutterSize = grid.gutterSize;
                let offset = grid.offset;
                let colHeight = getColHeight(parent.height, count, gutterSize, offset);
                //default styling where columns are shaded
                if (gutterSize !== 0) {
                    //create a rect for every col
                    for (let i = 0; i < count; i++) {
                        let y = offset + (i * gutterSize) + (i * colHeight);
                        let row = figma.createRectangle();
                        row.resize((parent.width + 2), colHeight);
                        row.fills = fills;
                        gridFrame.appendChild(row);
                        row.x = -1;
                        row.y = y;
                    }
                }
                else {
                    //only style divisions if there is no gutter
                    for (let i = 0; i < (count + 1); i++) {
                        if (count >= 1) {
                            let y = offset + (i * colHeight);
                            let row = figma.createRectangle();
                            row.resize(parent.width, 1);
                            row.fills = fills;
                            gridFrame.appendChild(row);
                            row.x = 0;
                            row.y = y;
                            if (count === 1 && i === count) {
                                let y = parent.height - offset;
                                let row = figma.createRectangle();
                                row.resize(parent.width, 1);
                                row.fills = fills;
                                gridFrame.appendChild(row);
                                row.x = 0;
                                row.y = y;
                            }
                        }
                    }
                }
                //add the container into the overall continer to hosue all grids
                container.appendChild(gridFrame);
                gridFrame.x = 0;
                gridFrame.y = 0;
            }
            else if (alignment === 'MIN') {
                //create left aligned grid visualization
                let rowHeight = grid.sectionSize;
                let offset = grid.offset;
                let gutterSize = grid.gutterSize;
                if (gutterSize !== 0) {
                    //create a rect for every col
                    for (let i = 0; i < count; i++) {
                        let y = offset + (i * gutterSize) + (i * rowHeight);
                        let row = figma.createRectangle();
                        row.resize((parent.width + 2), rowHeight);
                        row.fills = fills;
                        gridFrame.appendChild(row);
                        row.x = -1;
                        row.y = y;
                    }
                }
                else {
                    for (let i = 0; i < (count + 1); i++) {
                        //create a rect for every col
                        let y = offset + (i * gutterSize) + (i * rowHeight);
                        let row = figma.createRectangle();
                        row.resize(parent.width, 1);
                        row.fills = fills;
                        gridFrame.appendChild(row);
                        row.x = 0;
                        row.y = y;
                        if (count === 1 && i === count) {
                            let y = offset + (i * gutterSize) + (i * rowHeight);
                            let row = figma.createRectangle();
                            row.resize(parent.width, 1);
                            row.fills = fills;
                            gridFrame.appendChild(row);
                            row.x = 0;
                            row.y = y;
                        }
                    }
                }
                //add the container into the overall continer to hosue all grids
                container.appendChild(gridFrame);
                gridFrame.x = 0;
                gridFrame.y = 0;
            }
            else if (alignment === 'MAX') {
                //create right aligned grid visualization
                let rowHeight = grid.sectionSize;
                let offset = grid.offset;
                let gutterSize = grid.gutterSize;
                if (gutterSize !== 0) {
                    //create a rect for every col
                    for (let i = 0; i < count; i++) {
                        let y = (parent.height - offset - rowHeight) - (i * gutterSize) - (i * rowHeight);
                        let row = figma.createRectangle();
                        row.resize((parent.width + 2), rowHeight);
                        row.fills = fills;
                        gridFrame.appendChild(row);
                        row.x = -1;
                        row.y = y;
                    }
                }
                else {
                    for (let i = 0; i < count; i++) {
                        //create a rect for every col
                        let y = (parent.height - offset - rowHeight) - (i * gutterSize) - (i * rowHeight);
                        let row = figma.createRectangle();
                        row.resize(parent.width, 1);
                        row.fills = fills;
                        gridFrame.appendChild(row);
                        row.x = 0;
                        row.y = y;
                        if (i === 0) {
                            let y = (parent.height - offset);
                            let row = figma.createRectangle();
                            row.resize(parent.width, 1);
                            row.fills = fills;
                            gridFrame.appendChild(row);
                            row.x = 0;
                            row.y = y;
                        }
                    }
                }
                //add the container into the overall continer to hosue all grids
                container.appendChild(gridFrame);
                gridFrame.x = 0;
                gridFrame.y = 0;
            }
            else if (alignment === 'CENTER') {
                //create center aligned grid visualization
                let rowHeight = grid.sectionSize;
                let gutterSize = grid.gutterSize;
                let start = getRowStart(parent.height, count, rowHeight, gutterSize);
                if (gutterSize !== 0) {
                    //create a rect for every col
                    for (let i = 0; i < count; i++) {
                        let y = start + (i * gutterSize) + (i * rowHeight);
                        let row = figma.createRectangle();
                        row.resize((parent.width + 1), rowHeight);
                        row.fills = fills;
                        gridFrame.appendChild(row);
                        row.x = -1;
                        row.y = y;
                    }
                }
                else {
                    for (let i = 0; i < (count + 1); i++) {
                        //create a rect for every col
                        let y = start + (i * gutterSize) + (i * rowHeight);
                        let row = figma.createRectangle();
                        row.resize(parent.width, 1);
                        row.fills = fills;
                        gridFrame.appendChild(row);
                        row.x = 0;
                        row.y = y;
                        if (count === 1 && i === count) {
                            let y = start + (i * gutterSize) + (i * rowHeight);
                            let row = figma.createRectangle();
                            row.resize(parent.width, 1);
                            row.fills = fills;
                            gridFrame.appendChild(row);
                            row.x = 0;
                            row.y = y;
                        }
                    }
                }
                //add the container into the overall continer to hosue all grids
                container.appendChild(gridFrame);
                gridFrame.x = 0;
                gridFrame.y = 0;
            }
        }
    }
    else if (grid.pattern === 'GRID') {
        //grid vars
        let size = grid.sectionSize;
        let numOfHorizLines = Math.floor(parent.height / size) + 1;
        let numOfVertLines = Math.floor(parent.width / size) + 1;
        console.log(numOfHorizLines, numOfVertLines);
        //setup the grid frame
        let gridFrame = figma.createFrame();
        gridFrame.resize(parent.width, parent.height);
        gridFrame.fills = wrapperFills;
        gridFrame.expanded = false;
        gridFrame.locked = true;
        gridFrame.name = size + 'px uniform grid';
        //create the horizontal lines
        for (let i = 0; i < numOfHorizLines; i++) {
            let y = i * size;
            let line = figma.createRectangle();
            line.resize(parent.width, 1);
            gridFrame.appendChild(line);
            line.x = 0;
            line.y = y;
        }
        //create the horizontal lines
        for (let i = 0; i < numOfVertLines; i++) {
            let x = i * size;
            let line = figma.createRectangle();
            line.resize(1, parent.height);
            gridFrame.appendChild(line);
            line.x = x;
            line.y = 0;
        }
        //add the container into the overall continer to hosue all grids
        container.appendChild(gridFrame);
        gridFrame.x = 0;
        gridFrame.y = 0;
        //grid styling
        let flattenedGrid = figma.flatten(gridFrame.children, gridFrame);
        flattenedGrid.name = 'grid';
        let lineColor = grid.color;
        let lineFills = [];
        let lineFill = {
            type: 'SOLID',
            visible: true,
            opacity: 1,
            blendMode: 'NORMAL',
            color: { r: color.r, g: color.g, b: color.b }
        };
        lineFills.push(lineFill);
        flattenedGrid.opacity = lineColor.a;
        flattenedGrid.fills = lineFills;
    }
}
// HELPERS
//filter the selection down to
function filterNodesWithGrids(nodes) {
    nodes.forEach(node => {
        if (node.type === 'COMPONENT' || node.type === 'FRAME') {
            if (node.layoutGrids.length >= 1) {
                nodesWithGrids.push(node);
            }
        }
        if (node.type === 'COMPONENT' || node.type === 'FRAME' || node.type === 'GROUP') {
            if (node.children.length != 0) {
                filterNodesWithGrids(node.children);
            }
        }
    });
}
//return the column width for stretch cols
function getColWidth(parentWidth, count, gutterSize, offset) {
    let width;
    if (count === 1) {
        width = parentWidth - offset;
    }
    else {
        let gaps = (count - 1) * gutterSize;
        width = (parentWidth - gaps - (offset * 2)) / count;
    }
    return width;
}
//return the row height for stretch rows
function getColHeight(parentHeight, count, gutterSize, offset) {
    let height;
    if (count === 1) {
        height = parentHeight - offset;
    }
    else {
        let gaps = (count - 1) * gutterSize;
        height = (parentHeight - gaps - (offset * 2)) / count;
    }
    return height;
}
//return col start position for centered columns
function getColStart(parentWidth, count, width, gutterSize) {
    let xPos;
    if (count === 1) {
        xPos = (parentWidth - width) / 2;
    }
    else {
        let gridWidth = (width * count) + ((count - 1) * gutterSize);
        xPos = (parentWidth - gridWidth) / 2;
    }
    return xPos;
}
//return row start position for centered columns
function getRowStart(parentHeight, count, height, gutterSize) {
    let yPos;
    if (count === 1) {
        yPos = (parentHeight - height) / 2;
    }
    else {
        let gridHeight = (height * count) + ((count - 1) * gutterSize);
        yPos = (parentHeight - gridHeight) / 2;
    }
    return yPos;
}
