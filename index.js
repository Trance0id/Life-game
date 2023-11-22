class Population {
  constructor(n) {
    this.currentGenNo = 1;
    this.currentPopulation = {};
    this.nextPopulation = {};
  }
  checkAlive() {
    for(const cell in this.currentPopulation) {

    }
  }

}

class FieldDrawer {
  constructor(fieldContainerSelector) {
    this.container = document.querySelector(fieldContainerSelector);
  }

  drawField(n, m = n, aliveCells = {}) {
    this.container.innerHTML = '';

    for (let i = 0; i < n; i++) {
      const line = document.createElement('ul');
      line.classList.add('field__line');
      for (let j = 0; j < m; j++) {
        const cell = document.createElement('li');
        cell.classList.add('field__cell');
        if (aliveCells[`${j}:${i}`]) {
          cell.classList.add('field__cell_alive');
        }
        line.append(cell);
      }
      this.container.append(line);
    }
  }
}

const drawer = new FieldDrawer('.field');
const randomFirst = document.querySelector('#random');
randomFirst.addEventListener('change', e => {
  console.log('true');
});
const customFirst = document.querySelector('#custom');

const fieldSizeSelector = document.querySelector('.dimension');
fieldSizeSelector.addEventListener('change', e => {
  drawer.drawField(parseInt(e.target.value));
});
