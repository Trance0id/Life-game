'use strict';
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
    performance.measure('measure-calculating', 'start-calculating');
    return nextPopulation;
  }

  countAliveNeighbours(cell) {
    return this.getNeighbours(cell).reduce((count, nB) => count + (this.checkAlive(nB) ? 1 : 0), 0);
  }

  getNeighbours(cell) {
    const higherCell = cell - this.columns;
    const lowerCell = cell + this.columns;
    // Порядок соседей
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
