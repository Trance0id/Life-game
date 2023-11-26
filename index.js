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

  setCutomCurrentPopulation(cellsList) {
    this.currentPopulation = new Set();
    cellsList.forEach(cell => {
      this.currentPopulation.add(cell);
    });
    this.currentStepNo = 0;
    return this.currentPopulation;
  }

  addToCurrentPopulation(cell) {
    this.currentPopulation.add(cell);
  }

  deleteFromCurrentPopulation(cell) {
    this.currentPopulation.delete(cell);
  }

  getCurrentPopulationSize(cell) {
    return this.currentPopulation.size;
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
    this.cells = Array.from(this.container.querySelectorAll('.field__cell'));
  }

  markAlive(population) {
    this.cells.forEach((cell, i) => {
      if (population.has(i)) {
        cell.classList.add('field__cell_alive');
      } else {
        cell.classList.remove('field__cell_alive');
      }
    });
  }

  getIdFromCellElement(element) {
    return this.cells.indexOf(element);
  }
}

const twoGosperGliderGunsSetup = new Set([
  187, 149, 100, 62, 252, 290, 250, 98, 135, 173, 211, 210, 172, 134, 245, 244, 206, 282, 167, 319,
  127, 126, 355, 354, 163, 200, 238, 276, 315, 191, 229, 186, 148, 242, 228, 190, 721, 759, 797,
  682, 643, 642, 834, 871, 870, 678, 830, 755, 753, 715, 791, 752, 787, 825, 863, 824, 786, 862,
  747, 899, 707, 935, 768, 730, 769, 731, 745, 897, 848, 810, 811, 849,
]);

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
const easterCheckbox = document.querySelector('.easter-check');
const easterLabel = easterCheckbox.closest('label');
easterLabel.style.display = 'none';

const drawer = new FieldDrawer(gameFieldContainer);
drawer.drawField([fieldSize, fieldSize]);

fieldSizeSelector.addEventListener('change', e => {
  fieldSize = parseInt(e.target.value);
  drawer.drawField([fieldSize, fieldSize]);
});

const addCellToPopulation = e => {
  if (e.target.className.includes('field__cell')) {
    const cellId = drawer.getIdFromCellElement(e.target);
    if (population.currentPopulation.has(cellId)) {
      population.deleteFromCurrentPopulation(cellId);
      e.target.classList.remove('field__cell_alive');
      if (population.getCurrentPopulationSize() < 1) {
        populationSet = false;
        startButton.disabled = true;
      }
    } else {
      population.addToCurrentPopulation(cellId);
      e.target.classList.add('field__cell_alive');
      populationSet = true;
      startButton.textContent = 'Start game';
      startButton.disabled = false;
      console.log(population.currentPopulation);
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
      e.target.textContent = 'Start Game';
    } else if (customFirstSelector.checked) {
      gameFieldContainer.addEventListener('click', addCellToPopulation);
      gameFieldContainer.style.cursor = 'pointer';
      e.target.textContent = 'Mark cells';
      e.target.disabled = true;
      if (fieldSize === 38) {
        easterLabel.style.display = 'block';
      } else {
        easterLabel.style.display = 'none';
      }
    }
    controlsFieldset.disabled = true;
  } else {
    genTime = parseFloat(genTimeInput.value);
    gameFieldContainer.removeEventListener('click', addCellToPopulation);
    gameFieldContainer.style.cursor = '';
    const observer = new PerformanceObserver(perfObserve);
    observer.observe({ entryTypes: ['measure'] });
    e.target.disabled = true;
    resetButton.disabled = false;
    const gameLoop = () => {
      drawer.markAlive(population.stepForward());
      genNoInput.value = population.currentStepNo;
      gameCycle = setTimeout(() => {
        requestAnimationFrame(gameLoop);
      }, genTime * 1000);
    };
    gameLoop();
    easterCheckbox.checked = false;
    easterLabel.style.display = 'none';
  }
});

easterCheckbox.addEventListener('change', e => {
  if (e.target.checked) {
    drawer.markAlive(population.setCutomCurrentPopulation(twoGosperGliderGunsSetup));
    populationSet = true;
    startButton.textContent = 'Start game';
    startButton.disabled = false;
  } else {
    drawer.markAlive(population.setCutomCurrentPopulation([]));
    startButton.textContent = 'Mark cells';
    startButton.disabled = true;
  }
  population;
});

resetButton.addEventListener('click', () => {
  easterCheckbox.checked = false;
  easterLabel.style.display = 'none';
  clearTimeout(gameCycle);
  population = null;
  populationSet = false;
  clTimeInput.value = '';
  genNoInput.value = 0;
  controlsFieldset.disabled = false;
  startButton.textContent = 'Apply setup';
  startButton.disabled = false;
  gameFieldContainer.removeEventListener('click', addCellToPopulation);
  drawer.markAlive(new Set());
});

function perfObserve(list) {
  list.getEntries().forEach(entry => {
    if (entry.name === 'measure-calculating') {
      clTimeInput.value = entry.duration;
    }
  });
}
