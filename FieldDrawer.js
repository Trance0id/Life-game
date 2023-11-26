'use strict';
class FieldDrawer {
    constructor(fieldContainer) {
      this.container = fieldContainer;
      this.cells = [];
    }
  
    drawField([m, n], population = new Set()) {
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
