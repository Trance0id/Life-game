'use strict';
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
    resetButton.disabled = false;
    controlsFieldset.disabled = true;
    genNoInput.value = 0;
    clTimeInput.value = '';
  } else {
    genTime = parseFloat(genTimeInput.value);
    gameFieldContainer.removeEventListener('click', addCellToPopulation);
    gameFieldContainer.style.cursor = '';
    const observer = new PerformanceObserver(perfObserve);
    observer.observe({ entryTypes: ['measure'] });
    e.target.disabled = true;
    resetButton.disabled = false;
    const gameLoop = () => {
      performance.mark('before-calc-and-draw');
      drawer.markAlive(population.stepForward());
      performance.measure('calc-and-draw', 'before-calc-and-draw');
      genNoInput.value = population.currentStepNo;
      if (population.getCurrentPopulationSize() < 1) {
        alert('Game over!');
        resetButton.dispatchEvent(new CustomEvent('click'));
      } else {
        gameCycle = setTimeout(() => {
          requestAnimationFrame(gameLoop);
        }, genTime * 100);
      }
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
});

resetButton.addEventListener('click', () => {
  easterCheckbox.checked = false;
  easterLabel.style.display = 'none';
  clearTimeout(gameCycle);
  population = null;
  populationSet = false;
  controlsFieldset.disabled = false;
  startButton.textContent = 'Apply setup';
  startButton.disabled = false;
  gameFieldContainer.removeEventListener('click', addCellToPopulation);
  gameFieldContainer.style.cursor = '';
  drawer.markAlive(new Set());
  resetButton.disabled = true;
});

function perfObserve(list) {
  list.getEntries().forEach(entry => {
    if (entry.name === 'calc-and-draw') {
      clTimeInput.value = entry.duration;
    }
    if (entry.name === 'measure-calculating') {
      // Choose something...
      // console.log(entry.duration);
    }
  });
}
