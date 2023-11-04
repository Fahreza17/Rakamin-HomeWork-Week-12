import React, { createContext, useContext, useReducer, useEffect } from 'react';
import './App.css';

const initialState = {
  squares: Array(9).fill(null),
  nextValue: 'X',
  winner: null,
};

const GameContext = createContext();

const gameReducer = (state, action) => {
  switch (action.type) {
    case 'SELECT_SQUARE':
      if (state.squares[action.square] || state.winner) {
        return state;
      }
      const newSquares = state.squares.slice();
      newSquares[action.square] = state.nextValue;
      const newWinner = calculateWinner(newSquares);
      return {
        ...state,
        squares: newSquares,
        nextValue: state.nextValue === 'X' ? 'O' : 'X',
        winner: newWinner,
      };
    case 'DRAW':
      return { ...state, winner: "Cat's game" };
    case 'RESTART':
      return initialState;
    default:
      return state;
  }
};


function useGame() {
  return useContext(GameContext);
}


function Board() {
  const { state, dispatch } = useGame();

  function selectSquare(square) {
    dispatch({ type: 'SELECT_SQUARE', square });
  }

  function restart() {
    dispatch({ type: 'RESTART' });
  }

  function renderSquare(i) {
    return (
      <button
        className="square bg-blue-200 hover:bg-blue-400 text-3xl font-bold p-2 rounded h-16"
        onClick={() => selectSquare(i)}
      >
        {state.squares[i]}
      </button>
    );
  }

  return (
    <div className="text-center mt-4">
      <div className="text-2xl font-bold mb-2">
        STATUS: {state.winner ? `Winner: ${state.winner}` : `Next player: ${state.nextValue}`}
      </div>
      <div className="grid grid-cols-3 gap-1">
        {renderSquare(0)}
        {renderSquare(1)}
        {renderSquare(2)}
        {renderSquare(3)}
        {renderSquare(4)}
        {renderSquare(5)}
        {renderSquare(6)}
        {renderSquare(7)}
        {renderSquare(8)}
      </div>
      <button
        className="mt-4 bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
        onClick={restart}
      >
        Restart
      </button>
    </div>
  );
}

function findBestMove(squares, maximizingPlayer) {
  const availableSquares = squares
    .map((value, index) => (value ? null : index))
    .filter((square) => square !== null);

  if (calculateWinner(squares)) {
    return { score: maximizingPlayer ? -1 : 1 };
  } else if (availableSquares.length === 0) {
    return { score: 0 };
  }

  const moves = [];
  for (let i = 0; i < availableSquares.length; i++) {
    const move = {};
    move.index = availableSquares[i];
    squares[availableSquares[i]] = maximizingPlayer ? 'O' : 'X';

    const result = findBestMove(squares, !maximizingPlayer);
    move.score = result.score;

    squares[availableSquares[i]] = null;
    moves.push(move);
  }

  let bestMove;
  if (maximizingPlayer) {
    let bestScore = -Infinity;
    for (let i = 0; i < moves.length; i++) {
      if (moves[i].score > bestScore) {
        bestScore = moves[i].score;
        bestMove = i;
      }
    }
  } else {
    let bestScore = Infinity;
    for (let i = 0; i < moves.length; i++) {
      if (moves[i].score < bestScore) {
        bestScore = moves[i].score;
        bestMove = i;
      }
    }
  }

  return moves[bestMove];
}


function Game() {
  const { state, dispatch } = useGame();

  useEffect(() => {
    if (state.nextValue === 'O' && !state.winner) {
      const emptySquares = state.squares.map((value, index) => (value ? null : index));
      const availableSquares = emptySquares.filter((square) => square !== null);

      if (availableSquares.length > 0) {
        const bestMove = findBestMove(state.squares.slice(), true);
        setTimeout(() => {
          dispatch({ type: 'SELECT_SQUARE', square: bestMove.index });
        }, 500);
      }
    }
  }, [state.nextValue, state.squares, state.winner, dispatch]);

  
  useEffect(() => {
    if (!state.winner && state.squares.every(Boolean)) {
      
      dispatch({ type: 'DRAW' });
    }
  }, [state.squares, state.winner, dispatch]);

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white rounded shadow p-4">
        <Board />
      </div>
    </div>
  );
}

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a];
    }
  }
  return null;
}


function App() {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  return (
    <GameContext.Provider value={{ state, dispatch }}>
      <div className="bg-gray-100 min-h-screen flex items-center justify-center">
        <Game />
      </div>
    </GameContext.Provider>
  );
}

export default App;
