/////////////////////////////// вихідні дані
var treeData = {
  name: "Parent",
  children: [
    {
      name: "Level 2: A",
      children: [{ name: "Son of A" }, { name: "Daughter of A" }],
    },
    {
      name: "Level 2: B",
      children: [{ name: "Son of b" }, { name: "Daughter of b" }],
    },
  ],
};

/////////////////////////////// розміри
var margin = { top: 40, right: 90, bottom: 50, left: 90 },
  width = 660 - margin.left - margin.right,
  height = 500 - margin.top - margin.bottom;

///////////////////////////////створення пустого дерева на основі розмірів. Це функція
var treemap = d3.tree().size([width, height]);

///////////////////////////////встановлення ієрархії в вихідних даних
var nodes = d3.hierarchy(treeData);
///////////////////////////запихання вже ієрархічних даних в підготовлене дерево. Це обєкт з батьком і дітьми
nodes = treemap(nodes);

// append the svg obgect to the body of the page
// appends a 'group' element to 'svg'
// moves the 'group' element to the top left margin
////////////////////////////////////запихаю svg в body
let svg = d3
  .select("body")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom);

///////////////////////////// в svg запихаю групу елементів g
let g = svg
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
  .attr("class", "drawarea");

// adds the links between the nodes
let link = g
  .selectAll(".link")
  ///////////////////////////////////////// передача даних методу selectAll
  .data(nodes.descendants().slice(1))
  .enter()
  .append("path")
  .attr("class", "link")
  .attr("d", function (d) {
    ///////////////////////////// d атрибут опису шляху ліній, кривих
    return (
      "M" +
      d.x +
      "," +
      d.y +
      "C" +
      d.x +
      "," +
      (d.y + d.parent.y) / 2 +
      " " +
      d.parent.x +
      "," +
      (d.y + d.parent.y) / 2 +
      " " +
      d.parent.x +
      "," +
      d.parent.y
    );
  });

// adds each node as a group
//////////////////////////////////в
var node = g
  .selectAll(".node")
  .data(nodes.descendants())
  .enter()
  .append("g")
  .attr("class", function (d) {
    return "node" + (d.children ? " node--internal" : " node--leaf");
  })
  .attr("transform", function (d) {
    return "translate(" + d.x + "," + d.y + ")";
  });

// adds the circle to the node
node
  .append("rect")
  .attr("width", 20)
  .attr("height", 20)
  .attr("x", -10)
  .attr("y", -10)
  .style("fill", "yellow");

// adds the text to the node
node
  .append("text")
  .attr("dy", ".35em")
  .attr("y", (d) => (d.children ? -20 : 20))
  .style("text-anchor", "middle")
  .text(function (d) {
    return d.data.name;
  });

svg.call(
  d3
    .zoom()
    .extent([
      [0, 0],
      [50, 50],
    ])
    .translateExtent([
      [0, 0],
      [660, 500],
    ])
    .scaleExtent([0.2, 32])
    .on("zoom", zoomed)
);

function zoomed(event) {
  g.attr("transform", event.transform);
}
//////////////////////////////////////////////////////// приклад з div, який на практиці не робиться
async function fetchDataAndDrawChart() {
  try {
    const data = await d3.csv("./data.csv");
    data.sort((a, b) => b.population - a.population);
    const divs = d3
      .select(".charset")
      .selectAll("div")
      .data(data)
      .enter()
      .append("div");

    divs.text(function (data) {
      return data.country;
    });

    divs
      .append("div")
      .data(data)
      .attr("class", "row")
      .style("width", function (data) {
        return data.population + "px";
      });
  } catch (error) {
    console.error("Помилка при завантаженні або обробці даних:", error);
  }
}
fetchDataAndDrawChart();

async function newDraw() {
  try {
    const data = await d3.csv("./data.csv");
    data.sort((a, b) => b.population - a.population);

    let margin = { top: 40, right: 90, bottom: 50, left: 90 },
      width = 660 - margin.left - margin.right,
      height = 500 - margin.top - margin.bottom;

    let svg = d3
      .select(".charset1")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    let x = d3.scaleLinear().domain([0, 900]).range([0, width]);
    svg
      .append("g")
      .attr("class", "axis-x")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x));

    let y = d3
      .scaleBand()
      .range([0, height])
      .domain(
        data.map(function (d) {
          return d.country;
        })
      )
      .padding(0.1);
    svg.append("g").attr("class", "axis-y").call(d3.axisLeft(y));

    // //////////////////////////UPDATE
    function update(column, color) {
      data.sort(function (a, b) {
        return b[column] - a[column];
      });

      y.domain(
        data.map(function (d) {
          return d.country;
        })
      );

      d3.select(".axis-y").transition().duration(1000).call(d3.axisLeft(y));
      // d3.select(".axis-x").transition().duration(1000).call(d3.axisBottom(x));
      let bars = svg.selectAll("rect").data(data);
      bars
        .merge(bars.enter().append("rect"))
        .transition()
        .duration(1000)
        .attr("x", x(0))
        .attr("y", function (d) {
          return y(d.country);
        })
        .attr("width", function (d) {
          return x(d[column]);
        })
        .attr("height", y.bandwidth())
        .attr("fill", color);
    }
    update("population", "red");

    // //////////////////////////////////////////кнопки
    d3.select("#btn1").on("click", function () {
      update("population", "red");
    });
    d3.select("#btn2").on("click", function () {
      update("woman", "blue");
    });
    console.log("hello");
  } catch {}
}
newDraw();
////////////////////////////////////////////////MY TREE
async function myTree() {
  var margin = { top: 40, right: 90, bottom: 50, left: 90 },
    width = 660 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;
  try {
    const data = await d3.csv("/data1.csv");
    console.log("Data: ", data);
    const root = d3
      .stratify()
      .id((d) => d.name)
      .parentId((d) => d.parent)(data);
    console.log("Root: ", root);
    let treemap = d3.tree().size([width, height]);
    // const root1 = d3.hierarchy(data);
    // console.log(root1);
    nodes = treemap(root);
    console.log(nodes);

    let svg = d3
      .select(".charset2")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom);

    let g = svg
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
      .attr("class", "drawarea");

    g.selectAll(".link")
      .data(nodes.links())
      .enter()
      .append("path")
      .attr("class", "link")
      .attr(
        "d",
        d3
          .linkHorizontal()
          .x((d) => d.y)
          .y((d) => d.x)
      );

    let node = g
      .selectAll(".node")
      .data(nodes.descendants())
      .enter()
      .append("g")
      .attr("class", "node")
      .attr("transform", (d) => "translate(" + d.y + "," + d.x + ")");

    console.log(node);

    node
      .append("circle")
      .attr("r", 5)
      .style("fill", "#fff")
      .style("stroke", "steelblue")
      .style("stroke-width", "3px");

    node
      .append("text")
      .attr("dy", "0.31em")
      .attr("x", (d) => (d.children ? -6 : 6))
      .style("text-anchor", (d) => (d.children ? "end" : "start"))
      .text((d) => d.data.name);

    const button = document.getElementById("leaves");
    button.addEventListener("click", function () {
      showLeaves();
    });

    function showLeaves() {
      let leaves = [];
      leaves.push(nodes.leaves()); ///////////////////////////////// array of leaves
      const filtered = nodes.find((node) => node.id === "Olla");
      const nodeLinks = nodes.links();
      console.log(nodeLinks);
      const filtered2 = nodes.find((node) => node.id === "Alla");
      const newPath = filtered.path(filtered2);
      console.log(newPath);
      const lineFunction = d3
        .line()
        .x((d) => d.y)
        .y((d) => d.x);
      // .curve(d3.curveBasis); // Опціонально: можна змінити тип кривої

      // Додаємо лінію до SVG
      g.append("path")
        .datum(newPath) // Передаємо масив точок шляху
        .attr("d", lineFunction)
        .attr("stroke", "red")
        .attr("fill", "none");
    }
  } catch (error) {
    console.error("Помилка при завантаженні або обробці даних:", error);
  }
}

myTree();
