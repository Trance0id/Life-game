class Population {
  constructor(m, n) {
    this.columns = m;
    this.rows = n;
    this.totalCells = this.columns * this.rows;
    this.currentStepNo = 0;
    this.currentPopulation = new Set();
  }

  setRandomCurrentPopulation() {
    this.currentPopulation = new Set();
    for (let cell = 0; cell < this.totalCells; cell++) {
      if (!!Math.round(Math.random())) {
        this.currentPopulation.add(cell);
      }
    }
    this.currentStepNo = 0;
    return this.currentPopulation;
  }

  addToCurrentPopulation(cell) {
    this.currentPopulation.add(cell);
  }

  stepForward() {
    const nextPopulation = new Set();
    const allNeighbours = new Set();
    this.currentPopulation.forEach(cell => {
      const aliveNeighboursAmount = this.countAliveNeighbours(cell);
      if (aliveNeighboursAmount === 2 || aliveNeighboursAmount === 3) {
        nextPopulation.add(cell);
      }
      allNeighbours.union(this.getNeighbours(cell));
    });
    allNeighbours.forEach(neighbour => {
      if (this.countAliveNeighbours(neighbour) === 3) {
        nextPopulation.add(neighbour);
      }
    });
    this.currentPopulation = nextPopulation;
    this.currentStepNo++;
    return nextPopulation;
  }

  countAliveNeighbours(cell) {
    this.getNeighbours(cell).reduce((count, nB) => (count + this.checkAlive(nB) ? 1 : 0));
  }

  getNeighbours(cell) {
    const higherCell = cell - this.columns;
    const lowerCell = cell + this.columns;
    // От порядка соседей зависит правильность работы функции correctNeighbours
    // 2 3 4
    // 0 * 1
    // 5 6 7
    const fakeNeighbours = [cell - 1, cell + 1, higherCell - 1, higherCell, higherCell + 1, lowerCell - 1, lowerCell, lowerCell + 1];
    return this.correctNeighbours(fakeNeighbours, cell);
  }

  correctNeighbours(neighbours, cell) {
    const cellColumn = cell % this.columns;
    // Мутируем neighbours чтобы сэкономить память
    if (cellColumn === 0) {
      neighbours[2] += this.columns;
      neighbours[0] += this.columns;
      neighbours[5] += this.columns;
    }
    if ((cellColumn = this.columns - 1)) {
      neighbours[4] -= this.columns;
      neighbours[1] -= this.columns;
      neighbours[7] -= this.columns;
    }
    if (cell < this.columns) {
      neighbours[2] += this.totalCells;
      neighbours[3] += this.totalCells;
      neighbours[4] += this.totalCells;
    }
    if (cell >= this.totalCells - this.columns) {
      neighbours[5] -= this.totalCells;
      neighbours[6] -= this.totalCells;
      neighbours[7] -= this.totalCells;
    }
    return neighbours;
  }

  checkAlive(cell) {
    return this.currentPopulation.has(cell);
  }
}

class FieldDrawer {
  constructor(fieldContainerSelector) {
    this.container = document.querySelector(fieldContainerSelector);
  }

  drawField([m, n], population = new Set()) {
    this.container.innerHTML = '';
    console.log(this.container.style);
    this.container.style.gridTemplateColumns = `repeat(${m}, 1fr)`;
    for (let y = 0; y < n; y++) {
      for (let x = 0; x < m; x++) {
        const cell = document.createElement('div');
        cell.classList.add('field__cell');
        cell.dataset.value = m * y + x;
        // if (population.has(m * y + x)) {
        //   cell.classList.add('field__cell_alive');
        // }
        this.container.append(cell);
      }
    }
    if (population.size > 0) {
      this.markAlive(population);
    }
  }

  markAlive(population) {
    this.container.children.forEach(cell => {
      if (population.has(parseInt(cell.dataset.value))) {
        cell.classList.add('field__cell_alive');
      }
    });
  }
}

let gameStarted = false;
let fieldSize = 3;
const fieldSizeSelector = document.querySelector('.dimension');
fieldSizeSelector.value = fieldSize;
const drawer = new FieldDrawer('.field');
drawer.drawField([fieldSize, fieldSize]);

fieldSizeSelector.addEventListener('change', e => {
  fieldSize = parseInt(e.target.value);
  drawer.drawField([fieldSize, fieldSize]);
});

const randomFirst = document.querySelector('#random');
randomFirst.addEventListener('change', e => {
  console.log('true');
  
});

const customFirst = document.querySelector('#custom');



let population = null;
// population = new Population();
// population.setCurrentPopulation(...Population.getRandomPopulation());

const startButton = document.querySelector('.start-button');
startButton.addEventListener('click', () => {
  if (!gameStarted) { // Start game
    e.target.textContent = 'Next Step';
    // gameStarted = true;
    if (!population) {
      population = new Population(fieldSize, fieldSize);
      drawer.drawField(population.setRandomCurrentPopulation());
    }

  } else { // Pause game
    e.target.textContent = 'Start game';

  }
});
