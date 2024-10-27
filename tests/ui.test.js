/**
 * @jest-environment jsdom
 */

import { resetGame, setGameOver, getGameOver, setNameEnter, getNameEnter } from '../baseGame/game';
import '../baseGame/ui'; // This will initialize the event listeners

describe('UI Screens', () => {
    beforeEach(() => {
        document.body.innerHTML = `
            <div id="screenContainer">
                <div id="diedScreen">Game Over!<br>Press Restart Button or 'R' to restart!</div>
                <div id="diedWellScreen">You Died Gloriously!<br>Honor us with your initials!</div>
            </div>
            <div id="controls">
                <button id="startButton">Start</button>
                <button id="jumpButton">Jump</button>
                <button id="crouchButton">Crouch</button>
                <button id="pauseButton">Pause</button>
                <button id="restartButton">Restart</button>
            </div>
        `;
    });

    test('diedScreen should be hidden initially', () => {
        const diedScreen = document.getElementById('diedScreen');
        expect(diedScreen.style.display).toBe('none');
    });

    test('diedWellScreen should be hidden initially', () => {
        const diedWellScreen = document.getElementById('diedWellScreen');
        expect(diedWellScreen.style.display).toBe('none');
    });

    test('diedScreen should be displayed when game is over', () => {
        setGameOver(true);
        const diedScreen = document.getElementById('diedScreen');
        expect(diedScreen.style.display).toBe('flex');
    });

    test('diedWellScreen should be displayed when player achieves a high score', () => {
        setNameEnter(true);
        const diedWellScreen = document.getElementById('diedWellScreen');
        expect(diedWellScreen.style.display).toBe('flex');
    });

    test('diedScreen should be hidden after game reset', () => {
        setGameOver(true);
        resetGame();
        const diedScreen = document.getElementById('diedScreen');
        expect(diedScreen.style.display).toBe('none');
    });

    test('diedWellScreen should be hidden after game reset', () => {
        setNameEnter(true);
        resetGame();
        const diedWellScreen = document.getElementById('diedWellScreen');
        expect(diedWellScreen.style.display).toBe('none');
    });
});