let myText = function (message, x, y, s, c) {
  let tx = 0,
    ty = 0;

  let drawChar = function (char, x, y) {
    push();
    translate(x, y);
    scale(s / 50);

    switch (char) {
      case "a":
        {
          noStroke();
          fill(c);
          quad(0, 0, 30, -50, 40, -50, 10, 0);
          quad(30, -50, 40, -50, 50, 0, 40, 0);
          quad(15, -25, 45, -25, 47, -15, 12, -15);

          tx += (60 * s) / 50;
        }
        break;
      case "b":
        {
          noStroke();
          fill(c);
          quad(0, 0, 10, -50, 20, -50, 10, 0);

          stroke(c);
          noFill();
          strokeWeight(10);
          bezier(15, -45, 40, -45, 35, -25, 11, -25);
          bezier(11, -25, 39, -25, 35, -5, 10, -5);
          strokeWeight(1);
          noStroke();

          tx += (40 * s) / 50;
        }
        break;
      case "c":
        {
          strokeCap(SQUARE);
          strokeWeight(10);
          stroke(c);
          noFill();

          bezier(35, -8, -15, 10, 5, -60, 35, -40);

          strokeCap(ROUND);
          strokeWeight(1);

          tx += (40 * s) / 50;
        }
        break;
      case "d":
        {
          noStroke();
          fill(c);
          quad(0, 0, 10, -50, 20, -50, 10, 0);

          strokeWeight(10);
          stroke(c);
          noFill();

          bezier(15, -45, 50, -45, 50, -5, 8, -5);

          strokeWeight(1);

          tx += (50 * s) / 50;
        }
        break;
      case "e":
        {
          noStroke();
          fill(c);
          quad(0, 0, 10, -50, 20, -50, 10, 0);
          quad(10, -50, 40, -50, 38, -40, 8, -40);
          quad(6, -30, 30, -30, 28, -20, 4, -20);
          quad(2, -10, 32, -10, 30, 0, 0, 0);

          tx += (40 * s) / 50;
        }
        break;
      case "f":
        {
          noStroke();
          fill(c);
          quad(0, 0, 10, -50, 20, -50, 10, 0);
          quad(10, -50, 40, -50, 38, -40, 8, -40);
          quad(6, -30, 30, -30, 28, -20, 4, -20);

          tx += (40 * s) / 50;
        }
        break;
      case "g":
        {
          strokeCap(SQUARE);
          strokeWeight(10);
          stroke(c);
          noFill();

          bezier(40, -20, 10, 30, -20, -50, 40, -45);

          strokeCap(ROUND);
          strokeWeight(1);

          noStroke();
          fill(c);
          quad(46, -28, 44, -18, 20, -18, 22, -28);

          tx += (50 * s) / 50;
        }
        break;
      case "h":
        {
          noStroke();
          fill(c);
          quad(0, 0, 10, -50, 20, -50, 10, 0);
          quad(30, 0, 40, -50, 50, -50, 40, 0);
          quad(6, -30, 46, -30, 44, -20, 4, -20);

          tx += (50 * s) / 50;
        }
        break;
      case "i":
        {
          noStroke();
          fill(c);
          quad(10, -50, 40, -50, 38, -40, 8, -40);
          quad(20, -50, 30, -50, 20, 0, 10, 0);
          quad(0, 0, 2, -10, 32, -10, 30, 0);

          tx += (40 * s) / 50;
        }
        break;
      case "j":
        {
          noStroke();
          fill(c);
          quad(10, -50, 40, -50, 38, -40, 8, -40);

          strokeCap(SQUARE);
          strokeWeight(10);
          stroke(c);
          noFill();

          bezier(25, -50, 25, -25, 15, 15, 2, -15);

          strokeCap(ROUND);
          strokeWeight(1);

          tx += (40 * s) / 50;
        }
        break;
      case "k":
        {
          noStroke();
          fill(c);
          quad(0, 0, 10, -50, 20, -50, 10, 0);
          quad(5, -25, 37, -50, 50, -50, 15, -22);
          quad(5, -25, 27, 0, 40, 0, 15, -28);

          tx += (50 * s) / 50;
        }
        break;
      case "l":
        {
          noStroke();
          fill(c);
          quad(0, 0, 10, -50, 20, -50, 10, 0);
          quad(0, 0, 2, -10, 32, -10, 30, 0);

          tx += (40 * s) / 50;
        }
        break;
      case "m":
        {
          noStroke();
          fill(c);
          quad(0, 0, 10, -50, 20, -50, 10, 0);
          quad(10, -50, 20, 0, 30, 0, 20, -50);
          quad(20, 0, 30, 0, 60, -50, 50, -50);
          quad(40, 0, 50, -50, 60, -50, 50, 0);

          tx += (60 * s) / 50;
        }
        break;
      case "n":
        {
          noStroke();
          fill(c);
          quad(0, 0, 10, -50, 20, -50, 10, 0);
          quad(10, -50, 20, 0, 30, 0, 20, -50);
          quad(20, 0, 30, -50, 40, -50, 30, 0);

          tx += (40 * s) / 50;
        }
        break;
      case "o":
        {
          strokeWeight(10);
          stroke(c);
          noFill();

          bezier(30, -45, 10, -50, 0, 0, 20, -5);
          bezier(25, -45, 55, -50, 40, 0, 15, -5);

          strokeWeight(1);

          tx += (50 * s) / 50;
        }
        break;
      case "p":
        {
          noStroke();
          fill(c);
          quad(0, 0, 10, -50, 20, -50, 10, 0);

          stroke(c);
          noFill();
          strokeWeight(10);

          bezier(15, -45, 40, -45, 35, -25, 11, -20);

          strokeWeight(1);

          tx += (40 * s) / 50;
        }
        break;
      case "q":
        {
          noStroke();
          fill(c);
          quad(20, -20, 30, -20, 40, 0, 30, 0);

          strokeWeight(10);
          stroke(c);
          noFill();

          bezier(30, -45, 10, -50, 0, 0, 20, -5);
          bezier(25, -45, 55, -50, 40, 0, 15, -5);

          strokeWeight(1);

          tx += (50 * s) / 50;
        }
        break;
      case "r":
        {
          noStroke();
          fill(c);
          quad(0, 0, 10, -50, 20, -50, 10, 0);

          stroke(c);
          noFill();
          strokeWeight(10);

          bezier(15, -45, 40, -45, 35, -25, 11, -20);

          strokeWeight(1);

          noStroke();
          fill(c);
          quad(5, -25, 16, -25, 35, 0, 24, 0);

          tx += (40 * s) / 50;
        }
        break;
      case "s":
        {
          strokeCap(SQUARE);
          strokeWeight(10);
          stroke(c);
          noFill();

          bezier(40, -40, 20, -55, 0, -35, 20, -25);
          bezier(20, -25, 40, -15, 20, 10, 0, -10);
          point(20, -25);

          strokeCap(ROUND);
          strokeWeight(1);

          tx += (40 * s) / 50;
        }
        break;
      case "t":
        {
          noStroke();
          fill(c);
          quad(10, -50, 40, -50, 38, -40, 8, -40);
          quad(20, -50, 30, -50, 20, 0, 10, 0);

          tx += (40 * s) / 50;
        }
        break;
      case "u":
        {
          noStroke();
          fill(c);
          quad(10, -50, 5, -25, 15, -25, 20, -50);
          quad(40, -50, 35, -25, 45, -25, 50, -50);

          strokeWeight(10);
          stroke(c);
          noFill();

          bezier(10, -25, 5, 4, 35, 4, 40, -25);

          strokeWeight(1);

          tx += (50 * s) / 50;
        }
        break;
      case "v":
        {
          noStroke();
          fill(c);
          rect(10, -50, 10, 50);
          quad(10, 0, 40, -50, 50, -50, 20, 0);

          tx += (50 * s) / 50;
        }
        break;
      case "w":
        {
          noStroke();
          fill(c);
          rect(10, -50, 10, 50);
          quad(10, 0, 30, -50, 40, -50, 20, 0);
          rect(30, -50, 10, 50);
          quad(30, 0, 50, -50, 60, -50, 40, 0);

          tx += (50 * s) / 50;
        }
        break;
      case "x":
        {
          noStroke();
          fill(c);
          quad(0, 0, 40, -50, 50, -50, 10, 0);
          quad(10, -50, 20, -50, 40, 0, 30, 0);

          tx += (50 * s) / 50;
        }
        break;
      case "y":
        {
          noStroke();
          fill(c);
          quad(10, -50, 20, -50, 25, -25, 15, -25);
          quad(25, -25, 15, -25, 30, -50, 40, -50);
          quad(15, -25, 25, -25, 20, 0, 10, 0);

          tx += (40 * s) / 50;
        }
        break;
      case "z":
        {
          noStroke();
          fill(c);
          quad(0, 0, 2, -10, 42, -10, 40, 0);
          quad(10, -50, 50, -50, 48, -40, 8, -40);
          quad(2, -10, 15, -10, 48, -40, 35, -40);

          tx += (50 * s) / 50;
        }
        break;

      case " ":
        {
          tx += (35 * s) / 50;
        }
        break;
      case "\n":
        {
          tx = 0;
          ty += (100 * s) / 50;
        }
        break;

      case "1":
        {
          noStroke();
          fill(c);
          quad(0, 0, 2, -10, 32, -10, 30, 0);
          quad(12, -10, 22, -10, 30, -50, 20, -50);
          triangle(20, -50, 7, -35, 18, -35);

          tx += (40 * s) / 50;
        }
        break;
      case "2":
        {
          noStroke();
          fill(c);
          quad(0, 0, 30, 0, 32, -10, 2, -10);

          strokeCap(SQUARE);
          strokeWeight(10);
          stroke(c);
          noFill();

          bezier(4, -5, 40, -25, 40, -60, 13, -40);

          strokeCap(ROUND);
          strokeWeight(1);

          tx += (40 * s) / 50;
        }
        break;
      case "3":
        {
          noStroke();
          fill(c);
          quad(10, -50, 40, -50, 38, -40, 8, -40);
          quad(4, -20, 6, -30, 40, -50, 38, -40);
          quad(6, -30, 16, -30, 14, -20, 4, -20);

          strokeCap(SQUARE);
          strokeWeight(10);
          stroke(c);
          noFill();

          bezier(7, -25, 40, -30, 35, 0, 0, -5);

          strokeCap(ROUND);
          strokeWeight(1);

          tx += (40 * s) / 50;
        }
        break;
      case "4":
        {
          noStroke();
          fill(c);
          quad(20, 0, 30, 0, 40, -50, 30, -50);
          quad(30, -50, 4, -22, 2, -10, 28, -38);
          quad(4, -20, 2, -10, 42, -10, 44, -20);

          tx += (50 * s) / 50;
        }
        break;
      case "5":
        {
          noStroke();
          fill(c);
          quad(10, -50, 40, -50, 38, -40, 8, -40);
          quad(8, -40, 18, -40, 14, -20, 4, -20);

          strokeCap(SQUARE);
          strokeWeight(10);
          stroke(c);
          noFill();

          bezier(7, -25, 40, -30, 35, 0, 0, -5);

          strokeCap(ROUND);
          strokeWeight(1);

          tx += (40 * s) / 50;
        }
        break;
      case "6":
        {
          strokeCap(SQUARE);
          strokeWeight(10);
          stroke(c);
          noFill();

          bezier(35, -45, 10, -50, 0, 0, 20, -5);
          bezier(15, -5, 40, 0, 30, -40, 10, -20);

          strokeCap(ROUND);
          strokeWeight(1);

          tx += (40 * s) / 50;
        }
        break;
      case "7":
        {
          noStroke();
          fill(c);
          quad(10, -50, 40, -50, 38, -40, 8, -40);
          quad(28, -40, 38, -40, 10, 0, 0, 0);

          tx += (40 * s) / 50;
        }
        break;
      case "8":
        {
          strokeWeight(10);
          stroke(c);
          noFill();

          ellipse(18, -15, 23, 23);
          ellipse(21, -37, 17, 17);

          strokeWeight(1);

          tx += (40 * s) / 50;
        }
        break;
      case "9":
        {
          noStroke();
          fill(c);
          quad(23, -22, 33, -22, 15, 0, 5, 0);

          strokeWeight(10);
          stroke(c);
          noFill();

          ellipse(18, -32, 25, 25);

          strokeWeight(1);

          tx += (40 * s) / 50;
        }
        break;
      case "0":
        {
          noStroke();
          fill(c);
          quad(19, -20, 29, -20, 31, -30, 21, -30);

          strokeWeight(10);
          stroke(c);
          noFill();

          bezier(30, -45, 10, -50, 0, 0, 20, -5);
          bezier(25, -45, 55, -50, 40, 0, 15, -5);

          strokeWeight(1);

          tx += (50 * s) / 50;
        }
        break;

      case ":":
        {
          noStroke();
          fill(c);
          quad(0, 0, 2, -10, 12, -10, 10, 0);
          quad(5, -25, 7, -35, 17, -35, 15, -25);

          tx += (20 * s) / 50;
        }
        break;
      case "+":
        {
          noStroke();
          fill(c);
          quad(4, -20, 6, -30, 36, -30, 34, -20);
          quad(12, -10, 22, -10, 28, -40, 18, -40);

          tx += (40 * s) / 50;
        }
        break;
      case "-":
        {
          noStroke();
          fill(c);
          quad(4, -20, 6, -30, 36, -30, 34, -20);

          tx += (40 * s) / 50;
        }
        break;
      case "*":
        {
          noStroke();
          fill(c);
          quad(2, -10, 12, -10, 38, -40, 28, -40);
          quad(22, -10, 32, -10, 18, -40, 8, -40);

          tx += (40 * s) / 50;
        }
        break;
      case "/":
        {
          noStroke();
          fill(c);

          quad(0, 0, 30, -50, 40, -50, 10, 0);

          tx += (50 * s) / 50;
        }
        break;
      case ".":
        {
          noStroke();
          fill(c);
          quad(0, 0, 2, -10, 12, -10, 10, 0);

          tx += (20 * s) / 50;
        }
        break;
      case ",":
        {
          noStroke();
          fill(c);
          quad(0, 0, 2, -10, 12, -10, 10, 0);
          triangle(2, 10, 4, 0, 10, 0);

          tx += (20 * s) / 50;
        }
        break;
      case '"':
        {
          noStroke();
          fill(c);
          quad(8, -40, 18, -40, 16, -30, 6, -30);
          triangle(16, -50, 14, -40, 8, -40);

          quad(23, -40, 33, -40, 31, -30, 21, -30);
          triangle(31, -50, 29, -40, 23, -40);

          tx += (30 * s) / 50;
        }
        break;
      case "'":
        {
          noStroke();
          fill(c);
          quad(10, -50, 20, -50, 18, -40, 8, -40);
          triangle(10, -30, 12, -40, 18, -40);

          tx += (15 * s) / 50;
        }
        break;
      case "!":
        {
          noStroke();
          fill(c);
          quad(0, 0, 2, -10, 12, -10, 10, 0);
          quad(6, -20, 12, -20, 20, -50, 10, -50);

          tx += (20 * s) / 50;
        }
        break;
      case "?":
        {
          noStroke();
          fill(c);
          quad(10, 0, 12, -10, 22, -10, 20, 0);

          strokeCap(SQUARE);
          strokeWeight(10);
          stroke(c);
          noFill();

          bezier(18, -15, 18, -35, 50, -50, 10, -45);

          strokeCap(ROUND);
          strokeWeight(1);

          tx += (40 * s) / 50;
        }
        break;
      case "$":
        {
          strokeCap(SQUARE);
          strokeWeight(10);
          stroke(c);
          noFill();

          bezier(40, -40, 20, -55, 0, -35, 20, -25);
          bezier(20, -25, 40, -15, 20, 10, 0, -10);
          point(20, -25);

          strokeCap(ROUND);
          strokeWeight(1);

          noStroke();
          fill(c);
          quad(10, 0, 20, -50, 30, -50, 20, 0);

          tx += (40 * s) / 50;
        }
        break;
      case "%":
        {
          noStroke();
          fill(c);

          quad(0, 0, 40, -50, 50, -50, 10, 0);

          strokeWeight(8);
          stroke(c);
          noFill();

          ellipse(15, -40, 12, 12);
          ellipse(35, -10, 12, 12);

          strokeWeight(1);

          tx += (50 * s) / 50;
        }
        break;
    }

    pop();
  };

  fill(c);
  for (let i = 0; i < message.length; i++) {
    let char = message[i];

    drawChar(char, x + tx, y + ty, s);
  }

  return tx - (10 * s) / 50;
};
