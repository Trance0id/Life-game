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
    performance.mark('start-calculating');
    const nextPopulation = new Set();
    const allNeighbours = new Set();
    this.currentPopulation.forEach(cell => {
      const aliveNeighboursAmount = this.countAliveNeighbours(cell);
      if (aliveNeighboursAmount === 2 || aliveNeighboursAmount === 3) {
        nextPopulation.add(cell);
      }
      this.getNeighbours(cell).forEach(nB => allNeighbours.add(nB));
    });
    allNeighbours.forEach(neighbour => {
      if (this.countAliveNeighbours(neighbour) === 3) {
        nextPopulation.add(neighbour);
      }
    });
    this.currentPopulation = nextPopulation;
    this.currentStepNo++;
    // performance.mark('finish-calculating');
    performance.measure('measure-calculating', 'start-calculating');
    return nextPopulation;
  }

  countAliveNeighbours(cell) {
    return this.getNeighbours(cell).reduce((count, nB) => count + (this.checkAlive(nB) ? 1 : 0), 0);
  }

  getNeighbours(cell) {
    const higherCell = cell - this.columns;
    const lowerCell = cell + this.columns;
    // От порядка соседей зависит правильность работы функции correctNeighbours
    // 2 3 4
    // 0 * 1
    // 5 6 7
    const fakeNeighbours = [
      cell - 1,
      cell + 1,
      higherCell - 1,
      higherCell,
      higherCell + 1,
      lowerCell - 1,
      lowerCell,
      lowerCell + 1,
    ];
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
    if (cellColumn === this.columns - 1) {
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
  constructor(fieldContainer) {
    this.container = fieldContainer;
  }

  drawField([m, n], population = new Set()) {
    // performance.mark('start-drawing');
    this.container.innerHTML = '';
    this.container.style.gridTemplateColumns = `repeat(${m}, 1fr)`;
    for (let y = 0; y < n; y++) {
      for (let x = 0; x < m; x++) {
        const cell = document.createElement('div');
        cell.classList.add('field__cell');
        cell.dataset.value = m * y + x;
        this.container.append(cell);
      }
    }
    if (population.size > 0) {
      this.markAlive(population);
    }
    // performance.mark('finish-drawing');
    // performance.measure('measure-drawing', 'start-drawing', 'finish-drawing');
    this.cells = this.container.querySelectorAll('.field__cell');
  }

  markAlive(population) {
    this.cells.forEach(cell => {
      if (population.has(parseInt(cell.dataset.value))) {
        cell.classList.add('field__cell_alive');
        // cell.style.backgroundColor = 'gray';
      } else {
        cell.classList.remove('field__cell_alive');
      }
    });
  }
}

let population = null;
let gameCycle = 0;
let populationSet = false;
let fieldSize = 3;
let genTime = 1;

const controlsFieldset = document.querySelector('.controls');
const fieldSizeSelector = document.querySelector('#field-size');
fieldSizeSelector.value = fieldSize;
const randomFirstSelector = document.querySelector('#random');
const customFirstSelector = document.querySelector('#custom');
const genNoInput = document.querySelector('#generation-no');
const genTimeInput = document.querySelector('#generation-time');
const clTimeInput = document.querySelector('#calc-time');
const startButton = document.querySelector('.start-button');
const resetButton = document.querySelector('.reset-button');
const gameFieldContainer = document.querySelector('.field');

const drawer = new FieldDrawer(gameFieldContainer);
drawer.drawField([fieldSize, fieldSize]);

fieldSizeSelector.addEventListener('change', e => {
  fieldSize = parseInt(e.target.value);
  drawer.drawField([fieldSize, fieldSize]);
});

const addCellToPopulation = e => {
  const cellId = parseInt(e.target.dataset.value);
  if (!isNaN(cellId)) {
    if (population.currentPopulation.has(cellId)) {
      population.currentPopulation.delete(cellId);
      e.target.classList.remove('field__cell_alive');
      if (population.currentPopulation.size < 1) {
        startButton.disabled = true;
      }
    } else {
      population.addToCurrentPopulation(cellId);
      e.target.classList.add('field__cell_alive');
      populationSet = true;
      startButton.textContent = 'Start game';
      startButton.disabled = false;
    }
  }
};

startButton.addEventListener('click', e => {
  if (!populationSet) {
    if (!population) {
      population = new Population(fieldSize, fieldSize);
    }
    if (randomFirstSelector.checked) {
      drawer.markAlive(population.setRandomCurrentPopulation());
      populationSet = true;
      controlsFieldset.disabled = true;
      e.target.textContent = 'Start Game';
    } else if (customFirstSelector.checked) {
      gameFieldContainer.addEventListener('click', addCellToPopulation);
      startButton.textContent = 'Mark cells';
      controlsFieldset.disabled = true;
      e.target.disabled = true;
    }
  } else {
    genTime = parseFloat(genTimeInput.value);
    gameFieldContainer.removeEventListener('click', addCellToPopulation);
    const observer = new PerformanceObserver(perfObserve);
    observer.observe({ entryTypes: ['measure'] });
    const gameLoop = () => {
      drawer.markAlive(population.stepForward());
      genNoInput.value = population.currentStepNo;
      gameCycle = setTimeout(() => {
        requestAnimationFrame(gameLoop);
      }, genTime * 1000);
    };
    gameLoop();
    e.target.disabled = true;
    resetButton.disabled = false;
  }
});

resetButton.addEventListener('click', () => {
  clearTimeout(gameCycle);
  clTimeInput.value = '';
  population = null;
  populationSet = false;
  controlsFieldset.disabled = false;
  startButton.textContent = 'Apply setup';
  genNoInput.value = 0;
  startButton.disabled = false;
  drawer.drawField([fieldSize, fieldSize]);
});

function perfObserve(list) {
  list.getEntries().forEach(entry => {
    if (entry.name === 'measure-calculating') {
      clTimeInput.value = entry.duration;
    }
  });
}
