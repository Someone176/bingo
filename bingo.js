(() => {
    const TABLE_SIZE = 7;
    const NUMBER_MIN = 1;
    const NUMBER_MAX = 100;
    const MAX_WRONG_CLICKS = 3;
  
    let bingoNumbers = [];
    let drawnNumber = null;
    let markedCells = new Set();
    let wrongClicks = 0;
    let gameEnded = false;
  
    const tableElement = document.getElementById('bingo-table');
    const drawnNumberElement = document.getElementById('drawn-number');
    const drawButton = document.getElementById('draw-button');
    const messageElement = document.getElementById('message');
  
    function generateUniqueNumbers(count, min, max) {
      const numberSet = new Set();
      while (numberSet.size < count) {
        const randNum = Math.floor(Math.random() * (max - min + 1)) + min;
        numberSet.add(randNum);
      }
      return Array.from(numberSet);
    }
  
    function generateBingoGrid() {
      const totalNumbers = TABLE_SIZE * TABLE_SIZE;
      const uniqueNumbers = generateUniqueNumbers(totalNumbers, NUMBER_MIN, NUMBER_MAX);
      bingoNumbers = [];
      let index = 0;
      for (let r = 0; r < TABLE_SIZE; r++) {
        let row = [];
        for (let c = 0; c < TABLE_SIZE; c++) {
          row.push(uniqueNumbers[index++]);
        }
        bingoNumbers.push(row);
      }
    }
  
    function renderTable() {
      tableElement.innerHTML = '';
      for (let r = 0; r < TABLE_SIZE; r++) {
        const rowElem = document.createElement('tr');
        for (let c = 0; c < TABLE_SIZE; c++) {
          const cell = document.createElement('td');
          cell.textContent = bingoNumbers[r][c];
          cell.dataset.row = r;
          cell.dataset.col = c;
          cell.setAttribute('tabindex', '0');
          cell.setAttribute('role', 'button');
          cell.setAttribute('aria-pressed', 'false');
          cell.title = 'Click to mark this number';
          cell.addEventListener('click', onCellClick);
          cell.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              cell.click();
            }
          });
          rowElem.appendChild(cell);
        }
        tableElement.appendChild(rowElem);
      }
    }
  
    function onCellClick(e) {
      if (gameEnded) {
        showMessage('Game is over. Please refresh to play again.', true);
        return;
      }
      if (drawnNumber === null) {
        showMessage('Draw a number first by clicking the Draw button.', true);
        return;
      }
      const cell = e.currentTarget;
      const r = parseInt(cell.dataset.row, 10);
      const c = parseInt(cell.dataset.col, 10);
      const cellNumber = bingoNumbers[r][c];
  
      if (markedCells.has(`${r}-${c}`)) {
        showMessage('This number is already marked.', true);
        return;
      }
  
      if (cellNumber === drawnNumber) {
        markCell(cell, r, c);
        showMessage('');
        checkWin(r, c);
      } else {
        wrongClicks++;
        showMessage(`Number ${cellNumber} was not drawn! Mistakes: ${wrongClicks} / ${MAX_WRONG_CLICKS}`, true);
        if (wrongClicks >= MAX_WRONG_CLICKS) {
          gameEnded = true;
          showMessage('You have made 3 incorrect attempts. You lost! Refresh to try again.', true);
          disableAllCells();
          drawButton.disabled = true;
        }
      }
    }
  
    function markCell(cell, row, col) {
      cell.classList.add('marked');
      cell.setAttribute('aria-pressed', 'true');
      markedCells.add(`${row}-${col}`);
    }
  
    function checkWin(markedRow, markedCol) {
      let rowComplete = true;
      for (let col = 0; col < TABLE_SIZE; col++) {
        if (!markedCells.has(`${markedRow}-${col}`)) {
          rowComplete = false;
          break;
        }
      }
  
      let colComplete = true;
      for (let row = 0; row < TABLE_SIZE; row++) {
        if (!markedCells.has(`${row}-${markedCol}`)) {
          colComplete = false;
          break;
        }
      }
  
      if (rowComplete || colComplete) {
        gameEnded = true;
        showMessage('Congratulations! You completed a ' + (rowComplete ? 'row' : 'column') + ' and won the game!', false);
        disableAllCells();
        drawButton.disabled = true;
      }
    }
  
    function showMessage(text, isError) {
      messageElement.textContent = text;
      if (isError) {
        messageElement.style.color = '#ffbaba';
      } else {
        messageElement.style.color = '#aaffaa';
      }
    }
  
    function disableAllCells() {
      const cells = tableElement.querySelectorAll('td');
      cells.forEach(cell => {
        cell.style.pointerEvents = 'none';
        cell.setAttribute('aria-disabled', 'true');
        cell.setAttribute('tabindex', '-1');
      });
    }
  
    function onDrawClick() {
      if (gameEnded) {
        showMessage('Game is over. Refresh to play again.', true);
        return;
      }
      drawnNumber = drawRandomNumber();
      drawnNumberElement.textContent = drawnNumber;
      showMessage('Number drawn. Click it on the board!', false);
    }
  
    function drawRandomNumber() {
      const flatNumbers = bingoNumbers.flat();
      return flatNumbers[Math.floor(Math.random() * flatNumbers.length)];
    }
  
    function initGame() {
      generateBingoGrid();
      renderTable();
      markedCells.clear();
      wrongClicks = 0;
      gameEnded = false;
      drawnNumber = null;
      drawnNumberElement.textContent = '---';
      showMessage('');
      drawButton.disabled = false;
    }
  
    drawButton.addEventListener('click', onDrawClick);
  
    initGame();
  })();
  