"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import Share from "@/components/share";

const GRID_SIZE = 4;
const TARGET = 2048;

function createEmptyGrid(): number[][] {
  return Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(0));
}

function getEmptyCells(grid: number[][]): [number, number][] {
  const empty: [number, number][] = [];
  grid.forEach((row, r) =>
    row.forEach((cell, c) => {
      if (cell === 0) empty.push([r, c]);
    })
  );
  return empty;
}

function addRandomTile(grid: number[][]): number[][] {
  const empty = getEmptyCells(grid);
  if (empty.length === 0) return grid;
  const [r, c] = empty[Math.floor(Math.random() * empty.length)];
  const value = Math.random() < 0.9 ? 2 : 4;
  const newGrid = grid.map(row => [...row]);
  newGrid[r][c] = value;
  return newGrid;
}

function transpose(grid: number[][]): number[][] {
  return grid[0].map((_, i) => grid.map(row => row[i]));
}

function reverseRows(grid: number[][]): number[][] {
  return grid.map(row => [...row].reverse());
}

function slideAndMerge(row: number[]): { newRow: number[]; gained: number } {
  const nonZero = row.filter(v => v !== 0);
  const merged: number[] = [];
  let gained = 0;
  for (let i = 0; i < nonZero.length; i++) {
    if (i + 1 < nonZero.length && nonZero[i] === nonZero[i + 1]) {
      const mergedVal = nonZero[i] * 2;
      merged.push(mergedVal);
      gained += mergedVal;
      i++; // skip next
    } else {
      merged.push(nonZero[i]);
    }
  }
  while (merged.length < GRID_SIZE) merged.push(0);
  return { newRow: merged, gained };
}

function move(grid: number[][], dir: "up" | "down" | "left" | "right"): { newGrid: number[][]; gained: number } {
  let rotated = grid;
  if (dir === "up") rotated = transpose(grid);
  if (dir === "down") rotated = reverseRows(transpose(grid));
  if (dir === "right") rotated = reverseRows(grid);

  const movedRows: number[][] = [];
  let totalGained = 0;
  rotated.forEach(row => {
    const { newRow, gained } = slideAndMerge(row);
    movedRows.push(newRow);
    totalGained += gained;
  });

  let finalGrid = movedRows;
  if (dir === "up") finalGrid = transpose(movedRows);
  if (dir === "down") finalGrid = transpose(reverseRows(movedRows));
  if (dir === "right") finalGrid = reverseRows(movedRows);

  return { newGrid: finalGrid, gained: totalGained };
}

export default function Game() {
  const [grid, setGrid] = useState<number[][]>(createEmptyGrid());
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);

  useEffect(() => {
    let g = addRandomTile(createEmptyGrid());
    g = addRandomTile(g);
    setGrid(g);
  }, []);

  useEffect(() => {
    const newScore = grid.flat().reduce((a, b) => a + b, 0);
    setScore(newScore);
    if (grid.flat().some(v => v >= TARGET)) setWon(true);
    if (!canMove(grid)) setGameOver(true);
  }, [grid]);

  function canMove(g: number[][]): boolean {
    if (g.flat().some(v => v === 0)) return true;
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        const val = g[r][c];
        if (c + 1 < GRID_SIZE && val === g[r][c + 1]) return true;
        if (r + 1 < GRID_SIZE && val === g[r + 1][c]) return true;
      }
    }
    return false;
  }

  function handleMove(dir: "up" | "down" | "left" | "right") {
    if (gameOver) return;
    const { newGrid, gained } = move(grid, dir);
    if (newGrid.flat().join(",") !== grid.flat().join(",")) {
      const after = addRandomTile(newGrid);
      setGrid(after);
    }
  }

  const tileClass = (value: number) => {
    const base = "flex items-center justify-center rounded-md text-white font-bold";
    const size = "w-12 h-12";
    const bg = value
      ? {
          2: "bg-orange-400",
          4: "bg-orange-500",
          8: "bg-orange-600",
          16: "bg-orange-700",
          32: "bg-orange-800",
          64: "bg-orange-900",
          128: "bg-yellow-400",
          256: "bg-yellow-500",
          512: "bg-yellow-600",
          1024: "bg-yellow-700",
          2048: "bg-yellow-800",
        }[value] ?? "bg-gray-400"
      : "bg-gray-200";
    return `${base} ${size} ${bg}`;
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <h1 className="text-2xl font-bold">2048 Mini App</h1>
      <div className="grid grid-cols-4 gap-1">
        {grid.flat().map((v, idx) => (
          <div key={idx} className={tileClass(v)}>
            {v !== 0 && <span>{v}</span>}
          </div>
        ))}
      </div>
      <div className="flex flex-col items-center gap-2">
        <Button onClick={() => handleMove("up")}>↑</Button>
        <div className="flex gap-2">
          <Button onClick={() => handleMove("left")}>←</Button>
          <Button onClick={() => handleMove("right")}>→</Button>
        </div>
        <Button onClick={() => handleMove("down")}>↓</Button>
      </div>
      <div className="text-xl">Score: {score}</div>
      {gameOver && (
        <div className="flex flex-col items-center gap-2">
          <div className="text-lg font-semibold">
            {won ? "You won!" : "Game Over"}
          </div>
          <Share
            text={`I just finished 2048 Mini App with a score of ${score}!`}
          />
        </div>
      )}
    </div>
  );
}
